use crate::value::Value;

impl<'a> Value<'a> {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Value<'a> {
        if self.is_set() {
            Value::Set(
                self.as_set()
                    .into_owned()
                    .into_iter()
                    .map(|v| v.normalize())
                    .collect(),
            )
        } else {
            self
        }
    }
}
