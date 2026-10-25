//! This module defines the [`Value`] enum, which represents the various types
//! of values that can be created during evaluation of Quint expressions. All
//! values can be converted to Quint expressions.
//!
//! Quint's evaluation is lazy in some intermediate steps, and will avoid
//! enumerating as much as it can. For example, sometimes sets are created just
//! to pick elements from them, so instead of enumerating the set, the evaluator
//! just generates one element corresponding to that pick.
//!
//! All Quint's values are immutable by nature, so the `imbl` crate's data
//! structures are used to represent those values and properly optimize
//! operations for immutability. This has significant performance impact.
//!
//! We use `fxhash::FxBuildHasher` for the hash maps and sets, as it guarantees
//! that iterators over identical sets/maps will always return the same order,
//! which is important for the `Hash` implementation (as identical sets/maps
//! should have the same hash).

use crate::evaluator::{CompiledExpr, Env, EvalResult};
use crate::ir::{QuintError, QuintName};
use imbl::shared_ptr::RcK;
use imbl::{GenericHashMap, GenericHashSet, GenericVector};
use itertools::Itertools;
use num_bigint::BigUint;
use std::borrow::Cow;
use std::cell::RefCell;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::marker::PhantomData;
use std::rc::Rc;

/// Quint values that hold sets are immutable, use `GenericHashSet` immutable
/// structure to hold them
pub type ImmutableSet<T> = GenericHashSet<T, fxhash::FxBuildHasher, RcK>;
/// Quint values that hold vectors are immutable, use `GenericVector` immutable
/// structure to hold them
pub type ImmutableVec<T> = GenericVector<T, RcK>;
/// Quint values that hold maps are immutable, use `GenericHashMap` immutable
/// structure to hold them
pub type ImmutableMap<K, V> = GenericHashMap<K, V, fxhash::FxBuildHasher, RcK>;

/// Quint strings are immutable, use hipstr's HipStr type, which provides
/// inlined (stack allocated) strings of length up to 23 bytes, and cheap clones
/// for longer strings.
pub type Str = hipstr::HipStr<'static>;

const TAG_BITS: u32 = 3;
const TAG_MASK: usize = (1 << TAG_BITS) - 1;

/// Low-bit tag of a [`Value`] word. The discriminant is the in-word tag and
/// `Value::tag` transmutes it back, so 0..=4 must stay the only discriminants.
/// Every other match on `Tag` is exhaustive.
#[repr(usize)]
#[derive(Clone, Copy, PartialEq)]
enum Tag {
    Heap = 0b000,
    Int = 0b001,
    Bool = 0b010,
    InfInt = 0b011,
    InfNat = 0b100,
}

/// A Quint value produced by evaluation of a Quint expression.
///
/// One 64-bit word. The low `TAG_BITS` of its address are the `Tag`; for
/// `Tag::Heap` the word is `Rc::into_raw` of a `HeapValue` owned by this
/// `Value` (its low bits are zero because `HeapValue` is at least 8-aligned,
/// asserted below). For the other tags the word is a provenance-free address
/// whose payload sits above the tag bits and nothing is allocated, so `Int`
/// (when it fits in i61), `Bool` and the infinite sets clone and drop without
/// touching memory.
///
/// The representation is private: callers pattern-match on [`Value::view`]
/// or use the `as_*` accessors.
///
/// `PhantomData<Rc<..>>` keeps `Value: !Send + !Sync`.
pub struct Value(*const HeapValue, PhantomData<Rc<HeapValue>>);

// We've seen considerable performance improvements from reducing the size of the
// `Value` representation. This compile time assertion serves as feedback to
// developers that, if changing the size of the `Value` structure, need to make
// sure that benchmarks don't regress.
const _: () = assert!(std::mem::size_of::<Value>() == 8);

/// Heap-resident payloads, behind the `Rc` a `Tag::Heap` word points to.
/// Can be seen as a normal form of the expression, except for the intermediate
/// values that enable lazy evaluation of some potentially expensive expressions.
///
/// `Int` only for n outside the i61 range [-2^60, 2^60), which the tagged word
/// cannot hold; ints inside it are always inline, so the two forms never
/// coexist for the same integer.
enum HeapValue {
    Int(i64),
    Str(Str),
    Set(ImmutableSet<Value>),
    Tuple(ImmutableVec<Value>),
    Record(ImmutableMap<QuintName, Value>),
    Map(ImmutableMap<Value, Value>),
    List(ImmutableVec<Value>),
    Lambda(Vec<Rc<RefCell<EvalResult>>>, CompiledExpr),
    Variant(QuintName, Value),
    // "Intermediate" values used during evaluation to avoid expensive computations
    Interval(i64, i64),
    CrossProduct(Vec<Value>),
    PowerSet(Value),
    MapSet(Value, Value),
}

// The tagging scheme needs the low TAG_BITS of every `Rc<HeapValue>` pointer free.
const _: () = assert!(std::mem::align_of::<HeapValue>() >= 1 << TAG_BITS);

/// Borrowed view of a [`Value`]; the enum callers pattern-match on.
///
/// Variant order is load-bearing: `Hash for Value` hashes this enum's
/// discriminant, and FxHash set/map iteration order (hence seeded picks and
/// trace snapshots) depends on those hashes.
#[derive(Debug)]
pub enum ValueRef<'a> {
    Int(i64),
    Bool(bool),
    Str(&'a Str),
    Set(&'a ImmutableSet<Value>),
    Tuple(&'a ImmutableVec<Value>),
    Record(&'a ImmutableMap<QuintName, Value>),
    Map(&'a ImmutableMap<Value, Value>),
    List(&'a ImmutableVec<Value>),
    Lambda(&'a [Rc<RefCell<EvalResult>>], &'a CompiledExpr),
    Variant(&'a QuintName, &'a Value),
    // "Intermediate" values used during evaluation to avoid expensive computations
    Interval(i64, i64),
    CrossProduct(&'a [Value]),
    PowerSet(&'a Value),
    MapSet(&'a Value, &'a Value),
    // Infinite sets
    InfiniteInt, // represents the set of all integers
    InfiniteNat, // represents the set of all natural numbers (>= 0)
}

impl Value {
    #[inline]
    fn tag(&self) -> Tag {
        let t = self.0.addr() & TAG_MASK;
        debug_assert!(t <= Tag::InfNat as usize, "corrupt Value tag");
        // SAFETY: `Tag` is `repr(usize)` with discriminants 0..=4. `heap` and
        // `immediate` are the only writers of a word: the former stores an
        // 8-aligned pointer (low bits 0 == Heap), the latter ORs in a `Tag`.
        unsafe { std::mem::transmute::<usize, Tag>(t) }
    }

    #[inline]
    fn heap(v: HeapValue) -> Self {
        Value(Rc::into_raw(Rc::new(v)), PhantomData)
    }

    /// A non-heap word: `payload` above the tag bits, no provenance.
    #[inline]
    fn immediate(tag: Tag, payload: usize) -> Self {
        Value(
            std::ptr::without_provenance((payload << TAG_BITS) | tag as usize),
            PhantomData,
        )
    }

    /// Payload of a non-heap word; sign-extends so `Tag::Int` reads back an i61.
    #[inline]
    fn payload(&self) -> i64 {
        (self.0.addr() as i64) >> TAG_BITS
    }

    /// # Safety
    /// The caller checked `self.tag() == Tag::Heap`.
    #[inline]
    unsafe fn heap_ref(&self) -> &HeapValue {
        &*self.0
    }

    /// The borrowed view of this value, for pattern matching.
    #[inline]
    pub fn view(&self) -> ValueRef<'_> {
        match self.tag() {
            Tag::Int => ValueRef::Int(self.payload()),
            Tag::Bool => ValueRef::Bool(self.payload() != 0),
            Tag::InfInt => ValueRef::InfiniteInt,
            Tag::InfNat => ValueRef::InfiniteNat,
            // SAFETY: tag just decoded as Heap.
            Tag::Heap => match unsafe { self.heap_ref() } {
                HeapValue::Int(n) => ValueRef::Int(*n),
                HeapValue::Str(s) => ValueRef::Str(s),
                HeapValue::Set(set) => ValueRef::Set(set),
                HeapValue::Tuple(elems) => ValueRef::Tuple(elems),
                HeapValue::Record(fields) => ValueRef::Record(fields),
                HeapValue::Map(map) => ValueRef::Map(map),
                HeapValue::List(elems) => ValueRef::List(elems),
                HeapValue::Lambda(registers, body) => ValueRef::Lambda(registers, body),
                HeapValue::Variant(label, value) => ValueRef::Variant(label, value),
                HeapValue::Interval(start, end) => ValueRef::Interval(*start, *end),
                HeapValue::CrossProduct(sets) => ValueRef::CrossProduct(sets),
                HeapValue::PowerSet(value) => ValueRef::PowerSet(value),
                HeapValue::MapSet(domain, range) => ValueRef::MapSet(domain, range),
            },
        }
    }
}

impl Clone for Value {
    #[inline]
    fn clone(&self) -> Self {
        if self.tag() == Tag::Heap {
            // SAFETY: heap-tagged words are live `Rc::into_raw` pointers owned
            // by `self`; the new Value takes ownership of the added count.
            unsafe { Rc::increment_strong_count(self.0) };
        }
        Value(self.0, PhantomData)
    }
}

impl Drop for Value {
    #[inline]
    fn drop(&mut self) {
        if self.tag() == Tag::Heap {
            // SAFETY: as in Clone; this Value's strong count is released
            // exactly once, here.
            unsafe { drop(Rc::from_raw(self.0)) };
        }
    }
}

impl fmt::Debug for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.view().fmt(f)
    }
}

impl Hash for Value {
    fn hash<H: Hasher>(&self, state: &mut H) {
        // First, hash the discriminant, as we want hashes of Set(1, 2, 3) and
        // List(1, 2, 3) to be different.
        let view = self.view();
        core::mem::discriminant(&view).hash(state);

        match view {
            ValueRef::Int(n) => n.hash(state),
            ValueRef::Bool(b) => b.hash(state),
            ValueRef::Str(s) => s.hash(state),
            ValueRef::Set(set) => {
                for elem in set {
                    elem.hash(state);
                }
            }
            ValueRef::Tuple(elems) => {
                for elem in elems {
                    elem.hash(state);
                }
            }
            ValueRef::Record(fields) => {
                for (name, value) in fields {
                    name.hash(state);
                    value.hash(state);
                }
            }
            ValueRef::Map(map) => {
                for (key, value) in map {
                    key.hash(state);
                    value.hash(state);
                }
            }
            ValueRef::List(elems) => {
                for elem in elems {
                    elem.hash(state);
                }
            }
            ValueRef::Lambda(_, _) => {
                panic!("Cannot hash lambda");
            }
            ValueRef::Variant(label, value) => {
                label.hash(state);
                value.hash(state);
            }
            ValueRef::Interval(start, end) => {
                start.hash(state);
                end.hash(state);
            }
            ValueRef::CrossProduct(sets) => {
                for value in sets {
                    value.hash(state);
                }
            }
            ValueRef::PowerSet(value) => {
                value.hash(state);
            }
            ValueRef::MapSet(a, b) => {
                a.hash(state);
                b.hash(state);
            }
            ValueRef::InfiniteInt | ValueRef::InfiniteNat => {
                // The discriminant is already hashed, which is sufficient
                // for distinguishing between Int and Nat
            }
        }
    }
}

impl PartialEq for Value {
    fn eq(&self, other: &Self) -> bool {
        use ValueRef::*;
        match (self.view(), other.view()) {
            (Int(a), Int(b)) => a == b,
            (Bool(a), Bool(b)) => a == b,
            (Str(a), Str(b)) => a == b,
            (Set(a), Set(b)) => *a == *b,
            (Tuple(a), Tuple(b)) => *a == *b,
            (Record(a), Record(b)) => *a == *b,
            (Map(a), Map(b)) => *a == *b,
            (List(a), List(b)) => *a == *b,
            (Lambda(_, _), Lambda(_, _)) => panic!("Cannot compare lambdas"),
            (Variant(a_label, a_value), Variant(b_label, b_value)) => {
                a_label == b_label && a_value == b_value
            }
            (Interval(a_start, a_end), Interval(b_start, b_end)) => {
                a_start == b_start && a_end == b_end
            }
            (CrossProduct(a), CrossProduct(b)) => *a == *b,
            (PowerSet(a), PowerSet(b)) => *a == *b,
            (MapSet(a1, b1), MapSet(a2, b2)) => a1 == a2 && b1 == b2,
            (InfiniteInt, InfiniteInt) => true,
            (InfiniteNat, InfiniteNat) => true,
            // Infinite sets are not equal to any other set (including each other)
            (InfiniteInt, _) | (InfiniteNat, _) => false,
            (_, InfiniteInt) | (_, InfiniteNat) => false,
            // To compare two sets represented in different ways, we need to enumerate them both
            _ => {
                self.is_set()
                    && other.is_set()
                    && self
                        .as_set()
                        .expect("can't enumerate left set for equality check")
                        == other
                            .as_set()
                            .expect("can't enumerate right set for equality check")
            }
        }
    }
}

impl Eq for Value {}

impl Value {
    // Constructor functions for Value
    pub fn int(n: i64) -> Self {
        // fits in i61 iff shifting the top TAG_BITS out and back is lossless
        if (n << TAG_BITS) >> TAG_BITS == n {
            Value::immediate(Tag::Int, n as usize)
        } else {
            Value::heap(HeapValue::Int(n))
        }
    }

    pub fn bool(b: bool) -> Self {
        Value::immediate(Tag::Bool, b as usize)
    }

    pub fn str(s: Str) -> Self {
        Value::heap(HeapValue::Str(s))
    }

    pub fn set(s: ImmutableSet<Value>) -> Self {
        Value::heap(HeapValue::Set(s))
    }

    pub fn tuple(t: ImmutableVec<Value>) -> Self {
        Value::heap(HeapValue::Tuple(t))
    }

    pub fn record(r: ImmutableMap<QuintName, Value>) -> Self {
        Value::heap(HeapValue::Record(r))
    }

    pub fn map(m: ImmutableMap<Value, Value>) -> Self {
        Value::heap(HeapValue::Map(m))
    }

    pub fn list(l: ImmutableVec<Value>) -> Self {
        Value::heap(HeapValue::List(l))
    }

    pub fn lambda(registers: Vec<Rc<RefCell<EvalResult>>>, body: CompiledExpr) -> Self {
        Value::heap(HeapValue::Lambda(registers, body))
    }

    pub fn variant(name: QuintName, value: Value) -> Self {
        Value::heap(HeapValue::Variant(name, value))
    }

    pub fn interval(start: i64, end: i64) -> Self {
        Value::heap(HeapValue::Interval(start, end))
    }

    pub fn cross_product(values: Vec<Value>) -> Self {
        Value::heap(HeapValue::CrossProduct(values))
    }

    pub fn power_set(value: Value) -> Self {
        Value::heap(HeapValue::PowerSet(value))
    }

    pub fn map_set(a: Value, b: Value) -> Self {
        Value::heap(HeapValue::MapSet(a, b))
    }

    pub fn infinite_int() -> Self {
        Value::immediate(Tag::InfInt, 0)
    }

    pub fn infinite_nat() -> Self {
        Value::immediate(Tag::InfNat, 0)
    }

    /// Calculate the cardinality of the value without having to enumerate it
    /// (i.e. without calling `as_set`).
    pub fn cardinality(&self) -> Result<u64, crate::ir::QuintError> {
        match self.view() {
            ValueRef::Set(set) => Ok(set.len() as u64),
            ValueRef::Tuple(elems) => Ok(elems.len() as u64),
            ValueRef::Record(fields) => Ok(fields.len() as u64),
            ValueRef::Map(map) => Ok(map.len() as u64),
            ValueRef::List(elems) => Ok(elems.len() as u64),
            ValueRef::Interval(start, end) => {
                // Check for overflow when computing interval size
                end.checked_sub(start)
                    .and_then(|diff| diff.checked_add(1))
                    .and_then(|size| u64::try_from(size).ok())
                    .ok_or_else(|| {
                        QuintError::new(
                            "QNT601",
                            "Integer overflow in cardinality computation: interval exceeds the maximum supported size",
                        )
                    })
            }
            ValueRef::CrossProduct(sets) => sets.iter().try_fold(1_u64, |acc, set| {
                let set_card = set.cardinality()?;
                acc.checked_mul(set_card).ok_or_else(|| {
                    QuintError::new(
                        "QNT601",
                        "Integer overflow in cardinality computation: cross product exceeds the maximum supported size",
                    )
                })
            }),
            ValueRef::PowerSet(value) => {
                // 2^(cardinality of value)
                let base_size = value.cardinality()?;
                let exp = base_size.try_into().map_err(|_| {
                    QuintError::new(
                        "QNT601",
                        &format!(
                            "Integer overflow in cardinality computation: base set size {base_size} exceeds the maximum supported exponent size"
                        ),
                    )
                })?;
                2_u64.checked_pow(exp).ok_or_else(|| {
                    QuintError::new(
                        "QNT601",
                        &format!(
                            "Integer overflow in cardinality computation: powerset size 2^{base_size} exceeds the maximum supported size"
                        ),
                    )
                })
            }
            ValueRef::MapSet(domain, range) => {
                // (cardinality of range)^(cardinality of domain)
                let range_size = range.cardinality()?;
                let domain_size = domain.cardinality()?;
                let exp = domain_size.try_into().map_err(|_| {
                    QuintError::new(
                        "QNT601",
                        &format!(
                            "Integer overflow in cardinality computation: domain set size {domain_size} exceeds the maximum supported exponent size"
                        ),
                    )
                })?;
                range_size.checked_pow(exp).ok_or_else(|| {
                    QuintError::new(
                        "QNT601",
                        &format!(
                            "Integer overflow in cardinality computation: map set size {range_size}^{domain_size} exceeds the maximum supported size"
                        ),
                    )
                })
            }
            ValueRef::InfiniteInt => {
                Err(QuintError::new(
                    "QNT501",
                    "Infinite set Int is non-enumerable",
                ))
            }
            ValueRef::InfiniteNat => {
                Err(QuintError::new(
                    "QNT501",
                    "Infinite set Nat is non-enumerable",
                ))
            }
            _ => panic!("Cardinality not implemented for {self:?}"),
        }
    }

    /// Check for membership of a value in a set, without having to enumerate
    /// the set.
    pub fn contains(&self, elem: &Value) -> Result<bool, QuintError> {
        Ok(match (self.view(), elem.view()) {
            (ValueRef::Set(elems), _) => elems.contains(elem),
            (ValueRef::Interval(start, end), ValueRef::Int(n)) => start <= n && n <= end,
            (ValueRef::CrossProduct(sets), ValueRef::Tuple(elems)) => {
                if sets.len() != elems.len() {
                    false
                } else {
                    sets.iter()
                        .zip(elems)
                        .try_fold(true, |acc, (set, elem)| Ok(acc && set.contains(elem)?))?
                }
            }
            (ValueRef::PowerSet(base), ValueRef::Set(elems)) => {
                let base_elems = base.as_set()?;
                if elems.len() > base_elems.len() {
                    false
                } else {
                    elems
                        .iter()
                        .try_fold(true, |acc, elem| Ok(acc && base_elems.contains(elem)))?
                }
            }
            (ValueRef::MapSet(domain, range), ValueRef::Map(map)) => {
                let map_domain = Value::set(map.keys().cloned().collect::<ImmutableSet<_>>());
                // Check if domains are equal and all map values are in the range set
                if map_domain != *domain {
                    false
                } else {
                    map.values()
                        .try_fold(true, |acc, v| Ok(acc && range.contains(v)?))?
                }
            }
            (ValueRef::InfiniteInt, ValueRef::Int(_)) => true,
            (ValueRef::InfiniteInt, _) => false,
            (ValueRef::InfiniteNat, ValueRef::Int(n)) => n >= 0,
            (ValueRef::InfiniteNat, _) => false,
            _ => panic!("contains not implemented for {self:?}"),
        })
    }

    /// Check if this is a large powerset (base set >= 64 elements)
    /// Large powersets require special handling to avoid overflow
    pub fn is_large_powerset(&self) -> bool {
        if let ValueRef::PowerSet(base_set) = self.view() {
            if let Ok(card) = base_set.cardinality() {
                return card >= u64::BITS as u64;
            }
        }
        false
    }

    /// Check if a set is a subset of another set, avoiding enumeration when possible
    pub fn subseteq(&self, superset: &Value) -> Result<bool, QuintError> {
        Ok(match (self.view(), superset.view()) {
            (ValueRef::Set(subset), ValueRef::Set(superset)) => subset.is_subset(superset),
            (
                ValueRef::Interval(subset_start, subset_end),
                ValueRef::Interval(superset_start, superset_end),
            ) => subset_start >= superset_start && subset_end <= superset_end,
            (ValueRef::CrossProduct(subsets), ValueRef::CrossProduct(supersets)) => {
                if subsets.len() != supersets.len() {
                    false
                } else {
                    subsets
                        .iter()
                        .zip(supersets)
                        .try_fold(true, |acc, (subset, superset)| {
                            Ok(acc && subset.subseteq(superset)?)
                        })?
                }
            }
            (ValueRef::PowerSet(subset), ValueRef::PowerSet(superset)) => {
                subset.subseteq(superset)?
            }
            (
                ValueRef::MapSet(subset_domain, subset_range),
                ValueRef::MapSet(superset_domain, superset_range),
            ) => subset_domain == superset_domain && subset_range.subseteq(superset_range)?,
            // Infinite set relationships
            (ValueRef::InfiniteNat, ValueRef::InfiniteNat) => true,
            (ValueRef::InfiniteNat, ValueRef::InfiniteInt) => true,
            (ValueRef::InfiniteInt, ValueRef::InfiniteInt) => true,
            (ValueRef::InfiniteInt, ValueRef::InfiniteNat) => false,
            // Use the `contains` definition for infinite sets
            (_, ValueRef::InfiniteNat | ValueRef::InfiniteInt) if self.is_set() => {
                let self_set = self.as_set()?;
                self_set
                    .iter()
                    .try_fold(true, |acc, v| Ok(acc && superset.contains(v)?))?
            }
            // Infinite sets can't be subsets of finite sets
            (ValueRef::InfiniteInt, _) | (ValueRef::InfiniteNat, _) => false,
            // Fall back to the native implementation (`is_subset`) if no optimization is possible
            (_, _) => {
                let self_set = self.as_set()?;
                let superset_set = superset.as_set()?;
                self_set.is_subset(superset_set.as_ref())
            }
        })
    }

    /// Convert an integer value to `i64`. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    pub fn as_int(&self) -> i64 {
        // Hot path: no `ValueRef` construction for the inline case.
        if self.tag() == Tag::Int {
            return self.payload();
        }
        match self.view() {
            ValueRef::Int(n) => n,
            _ => panic!("Expected integer"),
        }
    }

    /// Convert a boolean value to `bool`. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    pub fn as_bool(&self) -> bool {
        if self.tag() == Tag::Bool {
            return self.payload() != 0;
        }
        match self.view() {
            ValueRef::Bool(b) => b,
            _ => panic!("Expected boolean"),
        }
    }

    /// Convert a boolean value to `bool`, returning `None` for non-boolean values.
    pub fn as_bool_opt(&self) -> Option<bool> {
        match self.0.as_ref() {
            ValueInner::Bool(b) => Some(*b),
            _ => None,
        }
    }

    /// Convert a string value to `Str`. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    pub fn as_str(&self) -> Str {
        match self.view() {
            ValueRef::Str(s) => s.clone(),
            _ => panic!("Expected string"),
        }
    }

    /// Checks whether a value is a set. This includes the intermediate values
    /// that are also sets, just not enumerated yet.
    pub fn is_set(&self) -> bool {
        matches!(
            self.view(),
            ValueRef::Set(_)
                | ValueRef::Interval(_, _)
                | ValueRef::CrossProduct(_)
                | ValueRef::PowerSet(_)
                | ValueRef::MapSet(_, _)
                | ValueRef::InfiniteInt
                | ValueRef::InfiniteNat
        )
    }

    /// Enumerate the value as a set. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    ///
    /// Sometimes, we need to create a value from scratch, and other times, we
    /// operate over the borroweed value (&self). So this returns a
    /// clone-on-write (Cow) pointer, avoiding unnecessary clones that would be
    /// required if we always wanted to return Owned data.
    pub fn as_set(&self) -> Result<Cow<'_, ImmutableSet<Value>>, QuintError> {
        Ok(match self.view() {
            ValueRef::Set(set) => Cow::Borrowed(set),
            ValueRef::Interval(start, end) => Cow::Owned((start..=end).map(Value::int).collect()),
            ValueRef::CrossProduct(sets) => {
                let size = self.cardinality()?;
                if size == 0 {
                    // an empty set produces the empty product
                    return Ok(Cow::Owned(ImmutableSet::default()));
                }

                #[allow(clippy::unnecessary_to_owned)] // False positive
                let product_sets = sets
                    .iter()
                    .map(|set| {
                        set.as_set()
                            .map(|s| s.into_owned().into_iter().collect::<Vec<_>>())
                    })
                    .collect::<Result<Vec<_>, _>>()?
                    .into_iter()
                    .multi_cartesian_product()
                    .map(|product| Value::tuple(ImmutableVec::from(product)))
                    .collect::<ImmutableSet<_>>();

                Cow::Owned(product_sets)
            }

            ValueRef::PowerSet(value) => {
                let base = value.as_set()?;
                let size: u64 = self.cardinality()?;
                Cow::Owned(
                    (0..size)
                        .map(|i| powerset_at_index(base.as_ref(), i))
                        .collect(),
                )
            }

            ValueRef::MapSet(domain, range) => {
                if domain.cardinality()? == 0 {
                    // To reflect the behaviour of TLC, an empty domain needs to give Set(Map())
                    return Ok(Cow::Owned(
                        std::iter::once(Value::map(ImmutableMap::default())).collect(),
                    ));
                }

                if range.cardinality()? == 0 {
                    // To reflect the behaviour of TLC, an empty range needs to give Set()
                    return Ok(Cow::Owned(ImmutableSet::default()));
                }
                let domain_vec = domain.as_set()?.iter().cloned().collect::<Vec<_>>();
                let range_vec = range.as_set()?.iter().cloned().collect::<Vec<_>>();

                let nindices = domain_vec.len();
                let nvalues = range_vec.len();

                let nmaps = nvalues
                    .checked_pow(nindices.try_into().unwrap())
                    .ok_or_else(|| {
                        QuintError::new(
                            "QNT601",
                            "Integer overflow in set enumeration: map set exceeds the maximum supported size",
                        )
                    })?;

                let mut result_set = ImmutableSet::new();

                for i in 0..nmaps {
                    let mut pairs = Vec::with_capacity(nindices);
                    let mut index = i;
                    for key in domain_vec.iter() {
                        pairs.push((key.clone(), range_vec[index % nvalues].clone()));
                        index /= nvalues;
                    }
                    result_set.insert(Value::map(ImmutableMap::from_iter(pairs)));
                }

                Cow::Owned(result_set)
            }
            ValueRef::InfiniteInt => Err(QuintError::new(
                "QNT501",
                "Infinite set Int is non-enumerable",
            ))?,
            ValueRef::InfiniteNat => Err(QuintError::new(
                "QNT501",
                "Infinite set Nat is non-enumerable",
            ))?,
            _ => panic!("Expected set"),
        })
    }

    /// Convert a map value to a map. Panics if the wrong type is given, which
    /// should never happen as input expressions are type-checked.
    pub fn as_map(&self) -> &ImmutableMap<Value, Value> {
        match self.view() {
            ValueRef::Map(map) => map,
            _ => panic!("Expected map"),
        }
    }

    /// Convert a list or a tuple value to a vector. Panics if the wrong type is
    /// given, which should never happen as input expressions are type-checked.
    pub fn as_list(&self) -> &ImmutableVec<Value> {
        match self.view() {
            ValueRef::Tuple(elems) => elems,
            ValueRef::List(elems) => elems,
            _ => panic!("Expected list, got {self:?}"),
        }
    }

    /// Convert a record value to a map. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    pub fn as_record_map(&self) -> &ImmutableMap<QuintName, Value> {
        match self.view() {
            ValueRef::Record(fields) => fields,
            _ => panic!("Expected record"),
        }
    }

    /// Convert a lambda value to a closure. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    pub fn as_closure(&self) -> impl Fn(&mut Env, Vec<Value>) -> EvalResult + '_ {
        match self.view() {
            ValueRef::Lambda(registers, body) => move |env: &mut Env, args: Vec<Value>| {
                args.into_iter().enumerate().for_each(|(i, arg)| {
                    *registers[i].borrow_mut() = Ok(arg);
                });

                body.execute(env)
                // FIXME: restore previous values (#1560)
            },
            _ => panic!("Expected lambda"),
        }
    }

    /// Convert a variant value to a tuple like (label, value). Panics if the
    /// wrong type is given, which should never happen as input expressions are
    /// type-checked.
    pub fn as_variant(&self) -> (&QuintName, &Value) {
        match self.view() {
            ValueRef::Variant(label, value) => (label, value),
            _ => panic!("Expected variant"),
        }
    }

    /// Convert a tuple value to a 2-element tuple. Panics if the wrong type is given,
    /// which should never happen as input expressions are type-checked.
    ///
    /// Useful as some builtins expect tuples of 2 elements, so we have type
    /// guarantees that this conversion will work and can avoid having to handle
    /// other scenarios.
    pub fn as_tuple2(&self) -> (Value, Value) {
        let mut elems = self.as_list().iter();
        (elems.next().unwrap().clone(), elems.next().unwrap().clone())
    }
}

/// Get the corresponding element of a powerset of a set at a given index
/// following a stable algorithm and avoiding enumeration. Calling this with the
/// same index for the same set should yield the same result.
///
/// Powersets are not ordered, but the iterator over the set will always produce
/// the same order (for identical sets), so this works. It doesn't matter which
/// order this uses, as long as it is stable.
///
/// In practice, the index comes from a stateful random number generator, and we
/// want the same seed to produce the same results.
pub fn powerset_at_index(base: &ImmutableSet<Value>, i: u64) -> Value {
    let mut elems = ImmutableSet::default();
    for (j, elem) in base.iter().enumerate() {
        // Check if the j-th bit is set in the index
        if (i & (1u64 << j)) != 0 {
            elems.insert(elem.clone());
        }
    }
    Value::set(elems)
}

/// Pick a specific subset from a large powerset using BigUint index.
/// This is used for powersets with base set cardinality >= 64 elements where usize would overflow.
///
/// Uses BigUint to support sets of arbitrary size (not limited to 63 elements
/// due to bit shift overflow with usize).
pub fn powerset_at_index_large(base: &ImmutableSet<Value>, i: &BigUint) -> Value {
    let mut elems = ImmutableSet::default();
    for (j, elem) in base.iter().enumerate() {
        // Check if the j-th bit is set in the BigUint index
        if i.bit(j as u64) {
            elems.insert(elem.clone());
        }
    }
    Value::set(elems)
}

/// Display implementation, used for debugging only. Users should not need to see a [`Value`].
impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> std::fmt::Result {
        match self.view() {
            ValueRef::Int(n) => write!(f, "{n}"),
            ValueRef::Bool(b) => write!(f, "{b}"),
            ValueRef::Str(s) => write!(f, "{s:?}"),
            ValueRef::Set(_)
            | ValueRef::Interval(_, _)
            | ValueRef::CrossProduct(_)
            | ValueRef::PowerSet(_)
            | ValueRef::MapSet(_, _) => {
                write!(f, "Set(")?;
                let set = self.as_set().expect("can't enumerate set for display");
                for (i, elem) in set.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{elem:#}")?;
                }
                write!(f, ")")
            }
            ValueRef::InfiniteInt => write!(f, "Int"),
            ValueRef::InfiniteNat => write!(f, "Nat"),
            ValueRef::Tuple(elems) => {
                write!(f, "(")?;
                for (i, elem) in elems.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{elem:#}")?;
                }
                write!(f, ")")
            }
            ValueRef::Record(fields) => {
                write!(f, "{{ ")?;
                for (i, (name, value)) in fields.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{name}: {value:#}")?;
                }
                write!(f, " }}")
            }
            ValueRef::Map(map) => {
                write!(f, "Map(")?;
                for (i, (key, value)) in map.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "Tup({key:#}, {value:#})")?;
                }
                write!(f, ")")
            }
            ValueRef::List(elems) => {
                write!(f, "List(")?;
                for (i, elem) in elems.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{elem:#}")?;
                }
                write!(f, ")")
            }
            ValueRef::Lambda(_, _) => write!(f, "<lambda>"),
            ValueRef::Variant(label, value) => {
                if let ValueRef::Tuple(elems) = value.view() {
                    if elems.is_empty() {
                        return write!(f, "{label}");
                    }
                }
                write!(f, "{label}({value:#})")
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn iset(ints: &[i64]) -> Value {
        Value::set(ints.iter().map(|&i| Value::int(i)).collect())
    }

    fn fxhash(v: &Value) -> u64 {
        let mut h = fxhash::FxHasher::default();
        v.hash(&mut h);
        h.finish()
    }

    const I61_MAX: i64 = (1 << 60) - 1;

    #[test]
    fn int_roundtrip_across_inline_heap_boundary() {
        for n in [
            0,
            1,
            -1,
            I61_MAX,
            -I61_MAX,
            1 << 60,
            -(1 << 60),
            i64::MIN,
            i64::MAX,
        ] {
            assert_eq!(Value::int(n).as_int(), n, "roundtrip of {n}");
            assert!(matches!(Value::int(n).view(), ValueRef::Int(m) if m == n));
        }
    }

    #[test]
    fn heap_and_inline_ints_hash_and_compare_as_ints() {
        let heap = Value::int(1 << 60);
        let inline = Value::int(I61_MAX);
        assert_ne!(heap, inline);
        assert_ne!(fxhash(&heap), fxhash(&inline));

        let a = Value::int(i64::MAX);
        let b = Value::int(i64::MAX);
        assert_eq!(a, b);
        assert_eq!(fxhash(&a), fxhash(&b));
    }

    #[test]
    fn tags_distinguish_zero_payloads() {
        assert_ne!(Value::bool(true), Value::bool(false));
        assert_ne!(Value::infinite_int(), Value::infinite_nat());
        assert_ne!(Value::int(0), Value::bool(false));
        assert_ne!(fxhash(&Value::int(0)), fxhash(&Value::bool(false)));
        assert!(Value::bool(true).as_bool());
        assert!(!Value::bool(false).as_bool());
    }

    /// Clones and drops of a heap value must balance the refcount; miri
    /// reports a leak or use-after-free if they do not.
    #[test]
    fn set_clone_drop_balances_refcount() {
        let ints: Vec<i64> = (0..1000).collect();
        let set = iset(&ints);
        let clones: Vec<Value> = (0..10).map(|_| set.clone()).collect();
        drop(clones);
        let again = set.clone();
        drop(set);
        assert_eq!(again.cardinality().unwrap(), 1000);
        assert!(again.contains(&Value::int(999)).unwrap());
        assert!(!again.contains(&Value::int(1000)).unwrap());
    }
}
