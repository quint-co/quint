use std::hash::{Hash, Hasher};

use fxhash::FxHashSet;

use crate::evaluator::{CompiledExpr, Env, EvalResult};
use std::cell::RefCell;
use std::fmt;
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

impl<'a> Value<'a> {
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
    //
    pub fn as_closure<'b>(
        &'b self,
    ) -> Result<impl Fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a> + 'b, String> {
        match self {
            Value::Lambda(registers, body) => Ok(move |env: &mut Env, args: Vec<Value<'a>>| {
                args.iter().enumerate().for_each(|(i, arg)| {
                    *registers[i].borrow_mut() = Ok(arg.clone());
                });

                body.execute(env)
                // TODO: restore previous values
            }),
            _ => Err("Expected lambda".to_string()),
        }
    }
}

impl fmt::Display for Value<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Value::Undefined => write!(f, "undefined"),
            Value::Int(n) => write!(f, "{}", n),
            Value::Bool(b) => write!(f, "{}", b),
            Value::Set(set) => {
                write!(f, "{{")?;
                for (i, elem) in set.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{:#}", elem)?;
                }
                write!(f, "}}")
            }
            Value::Lambda(_, _) => write!(f, "<lambda>"),
        }
    }
}
