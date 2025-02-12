use std::{cell::RefCell, collections::HashMap, rc::Rc};

use crate::value::Value;

#[derive(Clone)]
pub struct VariableRegister<'a> {
    pub name: String,
    pub value: Option<Value<'a>>,
}

#[derive(Default, Clone)]
pub struct Storage<'a> {
    pub vars: HashMap<String, Rc<RefCell<VariableRegister<'a>>>>,
    pub next_vars: HashMap<String, Rc<RefCell<VariableRegister<'a>>>>,
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

// pub fn initial_register_value(name: &str) -> Result<Value, QuintError> {
//     Rc::new(RefCell::new(Err(QuintError::new(
//         "QNT502",
//         format!("Variable {} not  bset", name).as_str(),
//     ))))
// }
