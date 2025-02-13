use crate::value::Value;

pub trait Picker<'a> {
    fn pick<T: Iterator<Item = usize>>(&'a self, indexes: T) -> Value<'a>;
    fn bounds(&self) -> Vec<usize>;
}

impl<'a> Picker<'a> for Value<'a> {
    fn pick<T: Iterator<Item = usize>>(&'a self, mut indexes: T) -> Value<'a> {
        let index = indexes
            .next()
            .expect("Internal error: too few positions. Report a bug");
        match self {
            Value::Set(set) => set.iter().collect::<Vec<_>>()[index].clone(),
            Value::Interval(start, end) => {
                let idx: i64 = index.try_into().unwrap();
                assert!(idx <= *end - *start);
                Value::Int(*start + idx)
            }
            _ => panic!("Not a set"),
        }
    }

    fn bounds(&self) -> Vec<usize> {
        todo!()
    }
}
