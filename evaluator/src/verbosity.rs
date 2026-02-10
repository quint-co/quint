use serde_repr::Deserialize_repr;

#[derive(Clone, Copy, Default, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Debug)]
#[repr(u8)]
pub enum Verbosity {
    Quiet = 0,
    Results = 1,
    #[default]
    Normal = 2,
    Diagnostics = 3,
    Debug = 4,
    Maximum = 5,
}

impl Verbosity {
    pub fn has_diagnostics(&self) -> bool {
        *self >= Verbosity::Diagnostics
    }
}
