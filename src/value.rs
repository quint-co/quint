use std::hash::{Hash, Hasher};

use color_eyre::eyre::bail;
use color_eyre::Result;
use fxhash::FxHashSet;

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Value {
    Undefined,
    Int(i64),
    Bool(bool),
    Set(FxHashSet<Value>),
}

impl Hash for Value {
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
        }
    }
}

impl Value {
    pub fn as_int(&self) -> Result<i64> {
        match self {
            Value::Int(n) => Ok(*n),
            _ => bail!("Expected integer"),
        }
    }

    pub fn as_bool(&self) -> Result<bool> {
        match self {
            Value::Bool(b) => Ok(*b),
            _ => bail!("Expected boolean"),
        }
    }

    pub fn as_set(&self) -> Result<&FxHashSet<Value>> {
        match self {
            Value::Set(set) => Ok(set),
            _ => bail!("Expected set"),
        }
    }

    pub fn to_set(self) -> Result<FxHashSet<Value>> {
        match self {
            Value::Set(set) => Ok(set),
            _ => bail!("Expected set"),
        }
    }
}
