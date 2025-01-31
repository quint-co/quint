use crate::evaluator::{CompiledExpr, Env, EvalResult};
use crate::ir::{FxHashMap, QuintError};
use indexmap::IndexSet;
use std::cell::RefCell;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::rc::Rc;

pub type FxHashSet<T> = IndexSet<T, fxhash::FxBuildHasher>;

#[derive(Clone, Debug)]
pub enum Value<'a> {
    Int(i64),
    Bool(bool),
    Str(String),
    Set(FxHashSet<Value<'a>>),
    Tuple(Vec<Value<'a>>),
    Record(FxHashMap<String, Value<'a>>),
    Lambda(Vec<Rc<RefCell<EvalResult<'a>>>>, CompiledExpr<'a>),
}

impl Hash for Value<'_> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let discr = core::mem::discriminant(self);
        discr.hash(state);

        match self {
            Value::Int(n) => n.hash(state),
            Value::Bool(b) => b.hash(state),
            Value::Str(s) => s.hash(state),
            Value::Set(set) => {
                for elem in set {
                    elem.hash(state);
                }
            }
            Value::Tuple(elems) => {
                for elem in elems {
                    elem.hash(state);
                }
            }
            Value::Record(fields) => {
                for (name, value) in fields {
                    name.hash(state);
                    value.hash(state);
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
            (Value::Str(a), Value::Str(b)) => a == b,
            (Value::Set(a), Value::Set(b)) => *a == *b,
            (Value::Tuple(a), Value::Tuple(b)) => *a == *b,
            (Value::Record(a), Value::Record(b)) => *a == *b,
            (Value::Lambda(_, _), Value::Lambda(_, _)) => panic!("Cannot compare lambdas"),
            _ => false,
        }
    }
}

impl Eq for Value<'_> {}

impl<'a> Value<'a> {
    pub fn cardinality(&self) -> i64 {
        match self {
            Value::Int(_) => 0,
            Value::Bool(_) => 0,
            Value::Str(_) => 0,
            Value::Set(set) => set.len().try_into().unwrap(),
            Value::Tuple(elems) => elems.len().try_into().unwrap(),
            Value::Record(fields) => fields.len().try_into().unwrap(),
            Value::Lambda(_, _) => 0,
        }
    }

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

    pub fn as_str(&self) -> String {
        match self {
            Value::Str(s) => s.to_string(),
            _ => panic!("Expected string"),
        }
    }

    pub fn as_set(&self) -> FxHashSet<Value<'a>> {
        match self {
            Value::Set(set) => set.clone(),
            _ => panic!("Expected set"),
        }
    }

    pub fn as_list(&self) -> Vec<Value<'a>> {
        match self {
            Value::Tuple(elems) => elems.clone(),
            // TODO: Value::List
            _ => panic!("Expected list"),
        }
    }

    pub fn as_record_map(&self) -> FxHashMap<String, Value<'a>> {
        match self {
            Value::Record(fields) => fields.clone(),
            _ => panic!("Expected record"),
        }
    }

    pub fn as_closure<'b>(&'b self) -> impl Fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a> + 'b {
        match self {
            Value::Lambda(registers, body) => move |env: &mut Env, args: Vec<Value<'a>>| {
                // TODO: Check number of arguments

                args.iter().enumerate().for_each(|(i, arg)| {
                    *registers[i].borrow_mut() = Ok(arg.clone());
                });

                body.execute(env)
                // TODO: restore previous values
            },
            _ => panic!("Expected lambda"),
        }
    }
}

impl fmt::Display for Value<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Value::Int(n) => write!(f, "{}", n),
            Value::Bool(b) => write!(f, "{}", b),
            Value::Str(s) => write!(f, "{:?}", s),
            Value::Set(set) => {
                write!(f, "Set(")?;
                for (i, elem) in set.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{:#}", elem)?;
                }
                write!(f, ")")
            }
            Value::Tuple(elems) => {
                write!(f, "(")?;
                for (i, elem) in elems.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{:#}", elem)?;
                }
                write!(f, ")")
            }
            Value::Record(fields) => {
                write!(f, "{{")?;
                for (i, (name, value)) in fields.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{}: {:#}", name, value)?;
                }
                write!(f, "}}")
            }
            Value::Lambda(_, _) => write!(f, "<lambda>"),
        }
    }
}
