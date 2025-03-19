use crate::ir::QuintName;
use crate::{ir::ImmutableMap, value::Value};
use std::{cell::RefCell, rc::Rc};

#[derive(Clone)]
pub struct VariableRegister {
    pub name: QuintName,
    pub value: Option<Value>,
}

#[derive(Clone)]
pub struct Snapshot {
    pub next_vars: ImmutableMap<QuintName, VariableRegister>,
    // nondet_picks
    // action_taken
}

#[derive(Default, Clone)]
pub struct Storage {
    pub vars: ImmutableMap<QuintName, Rc<RefCell<VariableRegister>>>,
    pub next_vars: ImmutableMap<QuintName, Rc<RefCell<VariableRegister>>>,
    pub caches_to_clear: Vec<Rc<RefCell<Option<Value>>>>,
}

impl Storage {
    pub fn shift_vars(&mut self) {
        for (key, register_for_current) in self.vars.iter() {
            if let Some(register_for_next) = self.next_vars.get(key) {
                let mut current = register_for_current.borrow_mut();
                let mut next = register_for_next.borrow_mut();
                current.value = next.value.take();
            }
        }
        self.clear_caches();
    }

    pub fn as_record(&self) -> Value {
        let map = self.vars.values().filter_map(|register| {
            let reg = register.borrow().clone();
            reg.value.map(|v| (reg.name, v))
        });

        // TODO: add nondet picks and action taken
        Value::Record(ImmutableMap::from_iter(map))
    }

    pub fn take_snapshot(&self) -> Snapshot {
        Snapshot {
            next_vars: self
                .next_vars
                .iter()
                .map(|(k, v)| (k.clone(), v.borrow().clone()))
                .collect(),
        }
    }

    pub fn restore(&mut self, snapshot: Snapshot) {
        self.next_vars.iter().for_each(|(k, v)| {
            if let Some(next) = snapshot.next_vars.get(k) {
                v.borrow_mut().value = next.value.clone();
            }
        });
    }

    pub fn clear_caches(&mut self) {
        for cache in self.caches_to_clear.iter() {
            *cache.borrow_mut() = None;
        }
    }
}
