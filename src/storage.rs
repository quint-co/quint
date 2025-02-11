use std::{cell::RefCell, collections::HashMap};

use crate::value::Value;

pub struct VariableValue<'a> {
    pub name: String,
    pub value: Option<Value<'a>>,
}

#[derive(Default)]
pub struct Storage<'a> {
    pub vars: HashMap<String, RefCell<VariableValue<'a>>>,
    pub next_vars: HashMap<String, RefCell<VariableValue<'a>>>,
}

impl Storage<'_> {
    pub fn shift_vars(&mut self) {
        for (key, register_for_current) in self.vars.iter() {
            if let Some(register_for_next) = self.next_vars.get(key) {
                let mut current = register_for_current.borrow_mut();
                let mut next = register_for_next.borrow_mut();
                current.value = next.value.take();
            }
        }
    }
}
