use crate::value::Value;

impl<'a> Value<'a> {
    pub fn normalize(self) -> Value<'a> {
        if self.is_set() {
            return Value::Set(
                self.as_set()
                    .into_owned()
                    .into_iter()
                    .map(|v| v.normalize())
                    .collect(),
            );
        }
        return self;
    }
}
