use crate::evaluator::{CompiledExpr, Env, EvalResult};
use crate::ir::ImmutableMap;
use imbl::shared_ptr::RcK;
use imbl::{GenericHashSet, GenericVector};
use itertools::Itertools;
use std::borrow::Cow;
use std::cell::RefCell;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::rc::Rc;

pub type ImmutableSet<T> = GenericHashSet<T, fxhash::FxBuildHasher, RcK>;
pub type ImmutableVec<T> = GenericVector<T, RcK>;

#[derive(Clone, Debug)]
pub enum Value {
    Int(i64),
    Bool(bool),
    Str(String),
    Set(ImmutableSet<Value>),
    Tuple(ImmutableVec<Value>),
    Record(ImmutableMap<String, Value>),
    Map(ImmutableMap<Value, Value>),
    List(ImmutableVec<Value>),
    Lambda(Vec<Rc<RefCell<EvalResult>>>, CompiledExpr),
    Variant(String, Rc<Value>),
    // "Intermediate" values using during evaluation to avoid expensive computations
    Interval(i64, i64),
    CrossProduct(Vec<Value>),
    PowerSet(Rc<Value>),
    MapSet(Rc<Value>, Rc<Value>),
}

impl Hash for Value {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let discr = core::mem::discriminant(self);
        discr.hash(state);

        match self {
            Value::Int(n) => n.hash(state),
            Value::Bool(b) => b.hash(state),
            Value::Str(s) => s.hash(state),
            Value::Set(set) => {
                for elem in set {
                    elem.hash(state);
                }
            }
            Value::Tuple(elems) => {
                for elem in elems {
                    elem.hash(state);
                }
            }
            Value::Record(fields) => {
                for (name, value) in fields {
                    name.hash(state);
                    value.hash(state);
                }
            }
            Value::Map(map) => {
                for (key, value) in map {
                    key.hash(state);
                    value.hash(state);
                }
            }
            Value::List(elems) => {
                for elem in elems {
                    elem.hash(state);
                }
            }
            Value::Lambda(_, _) => {
                panic!("Cannot hash lambda");
            }
            Value::Variant(label, value) => {
                label.hash(state);
                value.hash(state);
            }
            Value::Interval(start, end) => {
                start.hash(state);
                end.hash(state);
            }
            Value::CrossProduct(sets) => {
                for value in sets {
                    value.hash(state);
                }
            }
            Value::PowerSet(value) => {
                value.hash(state);
            }
            Value::MapSet(a, b) => {
                a.hash(state);
                b.hash(state);
            }
        }
    }
}

impl PartialEq for Value {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Value::Int(a), Value::Int(b)) => a == b,
            (Value::Bool(a), Value::Bool(b)) => a == b,
            (Value::Str(a), Value::Str(b)) => a == b,
            (Value::Set(a), Value::Set(b)) => *a == *b,
            (Value::Tuple(a), Value::Tuple(b)) => *a == *b,
            (Value::Record(a), Value::Record(b)) => *a == *b,
            (Value::Map(a), Value::Map(b)) => *a == *b,
            (Value::List(a), Value::List(b)) => *a == *b,
            (Value::Lambda(_, _), Value::Lambda(_, _)) => panic!("Cannot compare lambdas"),
            (Value::Variant(a_label, a_value), Value::Variant(b_label, b_value)) => {
                a_label == b_label && a_value == b_value
            }
            (Value::Interval(a_start, a_end), Value::Interval(b_start, b_end)) => {
                a_start == b_start && a_end == b_end
            }
            (Value::CrossProduct(a), Value::CrossProduct(b)) => *a == *b,
            (Value::PowerSet(a), Value::PowerSet(b)) => *a == *b,
            (Value::MapSet(a1, b1), Value::MapSet(a2, b2)) => a1 == a2 && b1 == b2,
            (a, b) if a.is_set() && b.is_set() => a.as_set() == b.as_set(),
            _ => false,
        }
    }
}

impl Eq for Value {}

impl Value {
    pub fn cardinality(&self) -> usize {
        match self {
            Value::Set(set) => set.len(),
            Value::Tuple(elems) => elems.len(),
            Value::Record(fields) => fields.len(),
            Value::Map(map) => map.len(),
            Value::List(elems) => elems.len(),
            Value::Interval(start, end) => (end - start + 1).try_into().unwrap(),
            Value::CrossProduct(sets) => sets.iter().fold(1, |acc, set| acc * set.cardinality()),
            Value::PowerSet(value) => 2_usize.pow(value.cardinality().try_into().unwrap()),
            Value::MapSet(domain, range) => range
                .cardinality()
                .pow(domain.cardinality().try_into().unwrap()),
            _ => panic!("Cardinality not implemented for {:?}", self),
        }
    }

    pub fn contains(&self, elem: &Value) -> bool {
        match (self, elem) {
            (Value::Set(elems), _) => elems.contains(elem),
            (Value::Interval(start, end), Value::Int(n)) => start <= n && n <= end,
            (Value::CrossProduct(sets), Value::Tuple(elems)) => {
                sets.len() == elems.len()
                    && sets.iter().zip(elems).all(|(set, elem)| set.contains(elem))
            }
            (Value::PowerSet(base), Value::Set(elems)) => {
                let base_elems = base.as_set();
                elems.len() <= base_elems.len()
                    && elems.iter().all(|elem| base_elems.contains(elem))
            }
            (Value::MapSet(domain, range), Value::Map(map)) => {
                let map_domain = Value::Set(map.keys().cloned().collect::<ImmutableSet<_>>());
                // Check if domains are equal and all map values are in the range set
                map_domain == **domain && map.values().all(|v| range.contains(v))
            }
            _ => panic!("contains not implemented for {:?}", self),
        }
    }

    pub fn subseteq(&self, superset: &Value) -> bool {
        match (self, superset) {
            (Value::Set(subset), Value::Set(superset)) => subset.is_subset(superset),
            (
                Value::Interval(subset_start, subset_end),
                Value::Interval(superset_start, superset_end),
            ) => subset_start >= superset_start && subset_end <= superset_end,
            (Value::CrossProduct(subsets), Value::CrossProduct(supersets)) => {
                subsets.len() == supersets.len()
                    && subsets
                        .iter()
                        .zip(supersets)
                        .all(|(subset, superset)| subset.subseteq(superset))
            }
            (Value::PowerSet(subset), Value::PowerSet(superset)) => subset.subseteq(superset),
            (
                Value::MapSet(subset_domain, subset_range),
                Value::MapSet(superset_domain, superset_range),
            ) => subset_domain == superset_domain && subset_range.subseteq(superset_range),
            (subset, superset) => subset.as_set().is_subset(superset.as_set().as_ref()),
        }
    }

    pub fn as_int(&self) -> i64 {
        match self {
            Value::Int(n) => *n,
            _ => panic!("Expected integer"),
        }
    }

    pub fn as_bool(&self) -> bool {
        match self {
            Value::Bool(b) => *b,
            _ => panic!("Expected boolean"),
        }
    }

    pub fn as_str(&self) -> String {
        match self {
            Value::Str(s) => s.to_string(),
            _ => panic!("Expected string"),
        }
    }

    pub fn is_set(&self) -> bool {
        matches!(
            self,
            Value::Set(_)
                | Value::Interval(_, _)
                | Value::CrossProduct(_)
                | Value::PowerSet(_)
                | Value::MapSet(_, _)
        )
    }

    pub fn as_set(&self) -> Cow<'_, ImmutableSet<Value>> {
        match self {
            Value::Set(set) => Cow::Borrowed(set),
            Value::Interval(start, end) => Cow::Owned((*start..=*end).map(Value::Int).collect()),
            Value::CrossProduct(sets) => {
                let size = self.cardinality();
                if size == 0 {
                    // an empty set produces the empty product
                    return Cow::Owned(ImmutableSet::default());
                }

                #[allow(clippy::unnecessary_to_owned)] // False positive
                let product_sets = sets
                    .iter()
                    .map(|set| set.as_set().into_owned().into_iter().collect::<Vec<_>>())
                    .multi_cartesian_product()
                    .map(|product| Value::Tuple(ImmutableVec::from(product)))
                    .collect::<ImmutableSet<_>>();

                Cow::Owned(product_sets)
            }

            Value::PowerSet(value) => {
                let base = value.as_set();
                let size = 1 << base.len(); // 2^n subsets for a set of size n
                Cow::Owned(
                    (0..size)
                        .map(|i| powerset_at_index(base.as_ref(), i))
                        .collect(),
                )
            }

            Value::MapSet(domain, range) => {
                if domain.cardinality() == 0 {
                    // To reflect the behaviour of TLC, an empty domain needs to give Set(Map())
                    return Cow::Owned(
                        std::iter::once(Value::Map(ImmutableMap::default())).collect(),
                    );
                }

                if range.cardinality() == 0 {
                    // To reflect the behaviour of TLC, an empty range needs to give Set()
                    return Cow::Owned(ImmutableSet::default());
                }
                let domain_vec = domain.as_set().iter().cloned().collect::<Vec<_>>();
                let range_vec = range.as_set().iter().cloned().collect::<Vec<_>>();

                let nindices = domain_vec.len();
                let nvalues = range_vec.len();

                let nmaps = nvalues.pow(nindices.try_into().unwrap());

                let mut result_set = ImmutableSet::new();

                for i in 0..nmaps {
                    let mut pairs = Vec::with_capacity(nindices);
                    let mut index = i;
                    for key in domain_vec.iter() {
                        pairs.push((key.clone(), range_vec[index % nvalues].clone()));
                        index /= nvalues;
                    }
                    result_set.insert(Value::Map(ImmutableMap::from_iter(pairs)));
                }

                Cow::Owned(result_set)
            }
            _ => panic!("Expected set"),
        }
    }

    pub fn as_map(&self) -> &ImmutableMap<Value, Value> {
        match self {
            Value::Map(map) => map,
            _ => panic!("Expected map"),
        }
    }

    pub fn as_list(&self) -> &ImmutableVec<Value> {
        match self {
            Value::Tuple(elems) => elems,
            Value::List(elems) => elems,
            _ => panic!("Expected list, got {:?}", self),
        }
    }

    pub fn as_record_map(&self) -> &ImmutableMap<String, Value> {
        match self {
            Value::Record(fields) => fields,
            _ => panic!("Expected record"),
        }
    }

    pub fn as_closure(&self) -> impl Fn(&mut Env, Vec<Value>) -> EvalResult + '_ {
        match self {
            Value::Lambda(registers, body) => move |env: &mut Env, args: Vec<Value>| {
                // TODO: Check number of arguments

                args.into_iter().enumerate().for_each(|(i, arg)| {
                    *registers[i].borrow_mut() = Ok(arg);
                });

                body.execute(env)
                // TODO: restore previous values
            },
            _ => panic!("Expected lambda"),
        }
    }

    pub fn as_variant(&self) -> (&str, &Value) {
        match self {
            Value::Variant(label, value) => (label, value),
            _ => panic!("Expected variant"),
        }
    }

    pub fn as_tuple2(&self) -> (Value, Value) {
        let mut elems = self.as_list().iter();
        (elems.next().unwrap().clone(), elems.next().unwrap().clone())
    }
}

pub fn powerset_at_index(base: &ImmutableSet<Value>, i: usize) -> Value {
    let mut elems = ImmutableSet::default();
    for (j, elem) in base.iter().enumerate() {
        // membership condition, numerical over the indexes i and j
        if (i & (1 << j)) != 0 {
            elems.insert(elem.clone());
        }
    }
    Value::Set(elems)
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Value::Int(n) => write!(f, "{}", n),
            Value::Bool(b) => write!(f, "{}", b),
            Value::Str(s) => write!(f, "{:?}", s),
            Value::Set(_)
            | Value::Interval(_, _)
            | Value::CrossProduct(_)
            | Value::PowerSet(_)
            | Value::MapSet(_, _) => {
                write!(f, "Set(")?;
                for (i, set) in self.as_set().iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{:#}", set)?;
                }
                write!(f, ")")
            }
            Value::Tuple(elems) => {
                write!(f, "(")?;
                for (i, elem) in elems.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{:#}", elem)?;
                }
                write!(f, ")")
            }
            Value::Record(fields) => {
                write!(f, "{{ ")?;
                for (i, (name, value)) in fields.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{}: {:#}", name, value)?;
                }
                write!(f, " }}")
            }
            Value::Map(map) => {
                write!(f, "Map(")?;
                for (i, (key, value)) in map.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "Tup({:#}, {:#})", key, value)?;
                }
                write!(f, ")")
            }
            Value::List(elems) => {
                write!(f, "List(")?;
                for (i, elem) in elems.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{:#}", elem)?;
                }
                write!(f, ")")
            }
            Value::Lambda(_, _) => write!(f, "<lambda>"),
            Value::Variant(label, value) => {
                if let Value::Tuple(elems) = &**value {
                    if elems.is_empty() {
                        return write!(f, "{}", label);
                    }
                }
                write!(f, "{}({:#})", label, value)
            }
        }
    }
}
