use std::hash::{Hash, Hasher};

use fxhash::FxHashSet;

use crate::evaluator::{CompiledExpr, EvalResult};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone)]
pub enum Value<'a> {
    Undefined,
    Int(i64),
    Bool(bool),
    Set(FxHashSet<Value<'a>>),
    Lambda(Vec<Rc<RefCell<EvalResult<'a>>>>, CompiledExpr<'a>),
}

impl Hash for Value<'_> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let discr = core::mem::discriminant(self);
        discr.hash(state);

        match self {
            Value::Undefined => (),
            Value::Int(n) => n.hash(state),
            Value::Bool(b) => b.hash(state),
            Value::Set(set) => {
                for elem in set {
                    elem.hash(state);
                }
            }
            Value::Lambda(_, _) => {
                panic!("Cannot hash lambda");
            }
        }
    }
}

impl Value<'_> {
    pub fn as_int(&self) -> Result<i64, &str> {
        match self {
            Value::Int(n) => Ok(*n),
            _ => Err("Expected integer"),
        }
    }

    // pub fn as_bool(&self) -> Result<bool> {
    //     match self {
    //         Value::Bool(b) => Ok(*b),
    //         _ => bail!("Expected boolean"),
    //     }
    // }

    // pub fn as_set(&self) -> Result<&FxHashSet<Value>> {
    //     match self {
    //         Value::Set(set) => Ok(set),
    //         _ => bail!("Expected set"),
    //     }
    // }

    // pub fn to_set(self) -> Result<FxHashSet<Value>> {
    //     match self {
    //         Value::Set(set) => Ok(set),
    //         _ => bail!("Expected set"),
    //     }
    // }
}
