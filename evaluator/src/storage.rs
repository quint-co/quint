//! Storage for state variables with extra functionality that depends on the
//! state machines' state.

use crate::ir::QuintName;
use crate::value::{ImmutableMap, ImmutableVec, Value};
use std::{cell::RefCell, collections::HashMap, rc::Rc};

/// MBT metadata field names for ITF traces
const MBT_NONDET_PICKS: &str = "mbt::nondetPicks";
const MBT_ACTION_TAKEN: &str = "mbt::actionTaken";

/// Variable registers are like the regular registers (ref cells) except that
/// they include a name. The name is used for displaying the variable name in
/// the trace.
#[derive(Clone)]
pub struct VariableRegister {
    pub name: QuintName,
    pub value: Option<Value>,
}

/// While `vars` values are immutable during evaluation and are only updated in `shift_vars()`, the remaining
/// stored values can be changed, and sometimes we need to revert those changes. For example, in:
/// ```quint
/// all {
///  x' = x + 1,
///  false,
/// }
/// ```
/// The second expression makes it so the `all` is false, and we need to revert back to the state before
/// we evaluated `x' = x + 1`.
///
/// That's where snapshots are used
#[derive(Clone)]
pub struct Snapshot {
    pub next_vars: ImmutableMap<QuintName, VariableRegister>,
    pub nondet_picks: HashMap<QuintName, Option<Value>>,
    pub action_taken: Option<QuintName>,
}

#[derive(Clone)]
pub struct Storage {
    // Registers for the values in the current state, to be read during evaluation
    pub vars: ImmutableMap<QuintName, Rc<RefCell<VariableRegister>>>,
    // Registers for values in the next state, to be written to during evaluation
    pub next_vars: ImmutableMap<QuintName, Rc<RefCell<VariableRegister>>>,
    // A list of caches to clear after every step, used to cache values during a single state only.
    pub caches_to_clear: Vec<Rc<RefCell<Option<Value>>>>,
    // Nondeterministic picks and their values for the current step
    pub nondet_picks: HashMap<QuintName, Option<Value>>,
    // The action taken in the current step
    pub action_taken: Option<QuintName>,
    // Whether to store metadata for mbt
    pub store_metadata: bool,
}

impl Default for Storage {
    fn default() -> Self {
        Self::new(false)
    }
}

impl Storage {
    /// Create a new Storage instance
    pub fn new(store_metadata: bool) -> Self {
        Storage {
            vars: ImmutableMap::new(),
            next_vars: ImmutableMap::new(),
            caches_to_clear: Vec::new(),
            nondet_picks: HashMap::new(),
            action_taken: None,
            store_metadata,
        }
    }

    /// Configure whether to store metadata for model-based testing
    pub fn set_store_metadata(&mut self, store_metadata: bool) {
        self.store_metadata = store_metadata;
    }

    /// Move the values in `next_vars` registries to `vars` registries, and
    /// clear the caches
    pub fn shift_vars(&mut self) {
        for (key, register_for_current) in self.vars.iter() {
            if let Some(register_for_next) = self.next_vars.get(key) {
                let mut current = register_for_current.borrow_mut();
                let mut next = register_for_next.borrow_mut();
                current.value = next.value.take();
            }
        }
        self.clear_caches();

        // Clear metadata for the next step
        if self.store_metadata {
            self.action_taken = None;
            for value in self.nondet_picks.values_mut() {
                *value = None;
            }
        }
    }

    /// Build a record with the current state variables' values, to be used in traces.
    pub fn as_record(&self) -> Value {
        let mut map: ImmutableMap<QuintName, Value> = self
            .vars
            .values()
            .filter_map(|register| {
                let reg = register.borrow();
                reg.value.as_ref().map(|v| (reg.name.clone(), v.clone()))
            })
            .collect();

        // Add metadata if enabled
        if self.store_metadata {
            let nondet_picks_map: ImmutableMap<QuintName, Value> = self
                .nondet_picks
                .iter()
                .map(|(name, value)| {
                    let variant = match value {
                        Some(v) => Value::variant("Some".into(), v.clone()),
                        None => Value::variant("None".into(), Value::tuple(ImmutableVec::new())),
                    };
                    (name.clone(), variant)
                })
                .collect();
            map.insert(MBT_NONDET_PICKS.into(), Value::record(nondet_picks_map));

            let action_name = self
                .action_taken
                .as_ref()
                .map(|s| s.as_ref())
                .unwrap_or("");
            map.insert(MBT_ACTION_TAKEN.into(), Value::str(action_name.into()));
        }

        Value::record(map)
    }

    pub fn take_snapshot(&self) -> Snapshot {
        Snapshot {
            next_vars: self
                .next_vars
                .iter()
                .map(|(k, v)| (k.clone(), v.borrow().clone()))
                .collect(),
            nondet_picks: self.nondet_picks.clone(),
            action_taken: self.action_taken.clone(),
        }
    }

    pub fn restore(&mut self, snapshot: &Snapshot) {
        self.next_vars.iter().for_each(|(k, v)| {
            if let Some(next) = snapshot.next_vars.get(k) {
                v.borrow_mut().value = next.value.clone();
            }
        });
        self.nondet_picks = snapshot.nondet_picks.clone();
        self.action_taken = snapshot.action_taken.clone();
    }

    fn clear_caches(&mut self) {
        for cache in self.caches_to_clear.iter() {
            *cache.borrow_mut() = None;
        }
    }
}
