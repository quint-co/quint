use crate::{ir::FxHashMap, value::Value};
use std::{cell::RefCell, rc::Rc};

#[derive(Clone)]
pub struct VariableRegister<'a> {
    pub name: String,
    pub value: Option<Value<'a>>,
}

#[derive(Clone)]
pub struct Snapshot<'a> {
    pub next_vars: FxHashMap<String, VariableRegister<'a>>,
    // nondet_picks
    // action_taken
}

#[derive(Default, Clone)]
pub struct Storage<'a> {
    pub vars: FxHashMap<String, Rc<RefCell<VariableRegister<'a>>>>,
    pub next_vars: FxHashMap<String, Rc<RefCell<VariableRegister<'a>>>>,
    pub caches_to_clear: Vec<Rc<RefCell<Option<Value<'a>>>>>,
}

impl<'a> Storage<'a> {
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

    pub fn as_record(&self) -> Value<'a> {
        let map = self.vars.values().filter_map(|register| {
            let reg = register.borrow().clone();
            reg.value.map(|v| (reg.name.clone(), v))
        });

        // TODO: add nondet picks and action taken
        Value::Record(FxHashMap::from_iter(map))
    }

    pub fn take_snapshot(&self) -> Snapshot<'a> {
        Snapshot {
            next_vars: self
                .next_vars
                .iter()
                .map(|(k, v)| (k.clone(), v.borrow().clone()))
                .collect(),
        }
    }

    pub fn restore(&mut self, snapshot: Snapshot<'a>) {
        self.next_vars.iter().for_each(|(k, v)| {
            if let Some(next) = snapshot.next_vars.get(k.as_str()) {
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
