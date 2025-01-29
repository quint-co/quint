use crate::evaluator::{CompiledExpr, Env, EvalResult};
use crate::ir::QuintError;
use fxhash::FxHashSet;
use std::cell::RefCell;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::rc::Rc;

#[derive(Clone)]
pub enum Value<'a> {
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

impl PartialEq for Value<'_> {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Value::Int(a), Value::Int(b)) => a == b,
            (Value::Bool(a), Value::Bool(b)) => a == b,
            (Value::Set(a), Value::Set(b)) => *a == *b,
            (Value::Lambda(_, _), Value::Lambda(_, _)) => panic!("Cannot compare lambdas"),
            _ => false,
        }
    }
}

impl Eq for Value<'_> {}

impl<'a> Value<'a> {
    pub fn as_int(&self) -> i64 {
        match self {
            Value::Int(n) => *n,
            _ => panic!("Expected integer"),
        }
    }

    pub fn as_bool(&self) -> bool {
        match self {
            Value::Bool(b) => *b,
            _ => panic!("Expected boolean"),
        }
    }

    pub fn as_set(&self) -> FxHashSet<Value<'a>> {
        match self {
            Value::Set(set) => set.clone(),
            _ => panic!("Expected set"),
        }
    }

    pub fn as_closure<'b>(
        &'b self,
    ) -> Result<impl Fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a> + 'b, QuintError> {
        match self {
            Value::Lambda(registers, body) => Ok(move |env: &mut Env, args: Vec<Value<'a>>| {
                // TODO: Check number of arguments

                args.iter().enumerate().for_each(|(i, arg)| {
                    *registers[i].borrow_mut() = Ok(arg.clone());
                });

                body.execute(env)
                // TODO: restore previous values
            }),
            _ => panic!("Expected lambda"),
        }
    }
}

impl fmt::Display for Value<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
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
