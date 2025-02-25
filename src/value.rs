use crate::evaluator::{CompiledExpr, Env, EvalResult};
use crate::ir::FxHashMap;
use indexmap::IndexSet;
use std::cell::RefCell;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::rc::Rc;

pub type FxHashSet<T> = IndexSet<T, fxhash::FxBuildHasher>;

#[derive(Clone, Debug)]
pub enum Value<'a> {
    Int(i64),
    Bool(bool),
    Str(String),
    Set(FxHashSet<Value<'a>>),
    Tuple(Vec<Value<'a>>),
    Record(FxHashMap<String, Value<'a>>),
    Map(FxHashMap<Value<'a>, Value<'a>>),
    List(Vec<Value<'a>>),
    Lambda(Vec<Rc<RefCell<EvalResult<'a>>>>, CompiledExpr<'a>),
    Variant(String, Rc<Value<'a>>),
    // "Intermediate" values using during evaluation to avoid expensive computations
    Interval(i64, i64),
    CrossProduct(Vec<Value<'a>>),
    PowerSet(Rc<Value<'a>>),
    MapSet(Rc<Value<'a>>, Rc<Value<'a>>),
}

impl Hash for Value<'_> {
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

impl PartialEq for Value<'_> {
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

impl Eq for Value<'_> {}

impl<'a> Value<'a> {
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

    pub fn contains(&self, elem: &Value<'a>) -> bool {
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
                let map_domain = Value::Set(map.keys().cloned().collect::<FxHashSet<_>>());
                // Check if domains are equal and all map values are in the range set
                map_domain == **domain && map.values().all(|v| range.contains(v))
            }
            _ => panic!("contains not implemented for {:?}", self),
        }
    }

    pub fn subseteq(&self, superset: &Value<'a>) -> bool {
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
            (subset, superset) => subset.as_set().is_subset(&superset.as_set()),
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

    pub fn as_set(&self) -> FxHashSet<Value<'a>> {
        match self {
            Value::Set(set) => set.clone(),
            Value::Interval(start, end) => (*start..=*end).map(Value::Int).collect(),
            Value::CrossProduct(sets) => {
                let size = self.cardinality();
                if size == 0 {
                    // an empty set produces the empty product
                    return FxHashSet::default();
                }

                let vecs: Vec<Vec<Value<'a>>> = sets
                    .iter()
                    .map(|set| set.as_set().iter().cloned().collect())
                    .collect();

                let mut indices = vec![0; vecs.len()];
                let mut result_set = FxHashSet::with_capacity_and_hasher(size, Default::default());
                let mut done = false;

                while !done {
                    let product: Vec<Value<'a>> = indices
                        .iter()
                        .enumerate()
                        .map(|(i, &index)| vecs[i][index].clone())
                        .collect();
                    result_set.insert(Value::Tuple(product));

                    done = true;
                    // Update indices in an order such as this
                    // Consider the product of two sets [a, b, c] x [0, 1]
                    // indices | product
                    // [0, 0] (a, 0)
                    // [1, 0] (b, 0)
                    // [2, 0] (c, 0)
                    // [0, 1] (a, 1)
                    // [1, 1] (b, 1)
                    // [2, 1] (c, 1)
                    for i in (0..indices.len()).rev() {
                        indices[i] += 1;
                        if indices[i] < vecs[i].len() {
                            done = false;
                            break;
                        } else {
                            indices[i] = 0;
                        }
                    }
                }

                result_set
            }

            Value::PowerSet(value) => {
                let base = value.as_set();
                let size = 1 << base.len(); // 2^n subsets for a set of size n
                (0..size).map(|i| powerset_at_index(&base, i)).collect()
            }

            Value::MapSet(domain, range) => {
                if domain.cardinality() == 0 {
                    // To reflect the behaviour of TLC, an empty domain needs to give Set(Map())
                    return std::iter::once(Value::Map(FxHashMap::default())).collect();
                }

                if range.cardinality() == 0 {
                    // To reflect the behaviour of TLC, an empty range needs to give Set()
                    return FxHashSet::default();
                }
                let domain_vec = domain.as_set().iter().cloned().collect::<Vec<_>>();
                let range_vec = range.as_set().iter().cloned().collect::<Vec<_>>();

                let nindices = domain_vec.len();
                let nvalues = range_vec.len();

                let nmaps = nvalues.pow(nindices.try_into().unwrap());

                let mut result_set = FxHashSet::with_capacity_and_hasher(nmaps, Default::default());

                for i in 0..nmaps {
                    let mut pairs = Vec::with_capacity(nindices);
                    let mut index = i;
                    for key in domain_vec.iter() {
                        pairs.push((key.clone(), range_vec[index % nvalues].clone()));
                        index /= nvalues;
                    }
                    result_set.insert(Value::Map(FxHashMap::from_iter(pairs)));
                }

                result_set
            }
            _ => panic!("Expected set"),
        }
    }

    pub fn as_map(&self) -> &FxHashMap<Value<'a>, Value<'a>> {
        match self {
            Value::Map(map) => map,
            _ => panic!("Expected map"),
        }
    }

    pub fn as_list(&self) -> &Vec<Value<'a>> {
        match self {
            Value::Tuple(elems) => elems,
            Value::List(elems) => elems,
            _ => panic!("Expected list, got {:?}", self),
        }
    }

    pub fn as_record_map(&self) -> FxHashMap<String, Value<'a>> {
        match self {
            Value::Record(fields) => fields.clone(),
            _ => panic!("Expected record"),
        }
    }

    pub fn as_closure<'b>(&'b self) -> impl Fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a> + 'b {
        match self {
            Value::Lambda(registers, body) => move |env: &mut Env, args: Vec<Value<'a>>| {
                // TODO: Check number of arguments

                args.iter().enumerate().for_each(|(i, arg)| {
                    *registers[i].borrow_mut() = Ok(arg.clone());
                });

                body.execute(env)
                // TODO: restore previous values
            },
            _ => panic!("Expected lambda"),
        }
    }

    pub fn as_variant(&self) -> (&str, &Value<'a>) {
        match self {
            Value::Variant(label, value) => (label, value),
            _ => panic!("Expected variant"),
        }
    }

    pub fn as_tuple2(&self) -> (Value<'a>, Value<'a>) {
        match &self.as_list()[..] {
            [a, b] => (a.clone(), b.clone()),
            _ => panic!("Expected tuple of 2 elements"),
        }
    }
}

pub fn powerset_at_index<'a>(
    base: &IndexSet<Value<'a>, std::hash::BuildHasherDefault<fxhash::FxHasher>>,
    i: usize,
) -> Value<'a> {
    let mut elems = FxHashSet::default();
    for (j, elem) in base.iter().enumerate() {
        // membership condition, numerical over the indexes i and j
        if (i & (1 << j)) != 0 {
            elems.insert(elem.clone());
        }
    }
    Value::Set(elems)
}

impl fmt::Display for Value<'_> {
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
