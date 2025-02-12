use std::{cell::RefCell, collections::HashMap, rc::Rc};

use crate::value::Value;

#[derive(Clone)]
pub struct VariableRegister<'a> {
    pub name: String,
    pub value: Option<Value<'a>>,
}

#[derive(Clone)]
pub struct Snapshot<'a> {
    pub next_vars: HashMap<String, VariableRegister<'a>>,
    // nondet_picks
    // action_taken
}

#[derive(Default, Clone)]
pub struct Storage<'a> {
    pub vars: HashMap<String, Rc<RefCell<VariableRegister<'a>>>>,
    pub next_vars: HashMap<String, Rc<RefCell<VariableRegister<'a>>>>,
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
    }

    pub fn take_snapshot(self) -> Snapshot<'a> {
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
}
