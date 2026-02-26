//! Conversion between [`Value`]s and ITF (Informal Trace Format).
//!
//! Read more about it [here](https://apalache-mc.org/docs/adr/015adr-trace.html).
//!
//! This format can be parsed by Quint's typescript tool and by the ITF trace
//! viewer extension on VSCode.

use crate::trace_quality::TraceQuality;
use crate::value::{Str, Value, ValueInner};
use chrono;
use itf;
use std::collections::BTreeMap;

#[derive(Debug)]
pub struct Trace {
    pub states: Vec<State>,
    pub violation: bool,
    pub seed: u64,
}

#[derive(Debug)]
pub struct State {
    pub value: Value,
    pub diagnostics: Vec<DebugMessage>,
}

#[derive(Debug)]
pub struct DebugMessage {
    pub label: Str,
    pub value: Value,
}

impl serde::Serialize for DebugMessage {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeStruct;
        let mut s = s.serialize_struct("DebugMessage", 2)?;
        s.serialize_field("label", self.label.as_str())?;
        s.serialize_field("value", &self.value.to_itf())?;
        s.end()
    }
}

impl TraceQuality for Trace {
    fn is_violation(&self) -> bool {
        self.violation
    }

    fn has_diagnostics(&self) -> bool {
        self.states.iter().any(|s| !s.diagnostics.is_empty())
    }

    fn trace_length(&self) -> usize {
        self.states.len()
    }
}

impl Trace {
    pub fn to_itf(self, source: String) -> itf::Trace<itf::Value> {
        self.to_itf_with_pending_diagnostics(source, vec![])
    }

    pub fn to_itf_with_pending_diagnostics(
        self,
        source: String,
        pending_diagnostics: Vec<DebugMessage>,
    ) -> itf::Trace<itf::Value> {
        let mut vars = Vec::new();
        if let Some(state) = self.states.first() {
            // Find the variable names by taking the fields from the first
            // state (which should be a record).
            let ValueInner::Record(rec) = &*state.value else {
                panic!("Expected a record, got {}", state.value);
            };
            vars.extend(rec.keys().map(|key| key.to_string()));
        }

        let mut states = Vec::new();
        for (state, i) in self.states.into_iter().zip(0u64..) {
            let mut other = BTreeMap::new();
            other.insert(
                "diagnostics".to_string(),
                serde_json::to_string(&state.diagnostics).expect("failed to serialize diagnostics"),
            );

            states.push(itf::State {
                meta: itf::state::Meta {
                    index: Some(i),
                    other,
                },
                value: state.value.to_itf(),
            });
        }

        let mut other = BTreeMap::new();
        other.insert(
            "status".to_string(),
            if self.violation {
                "violation".to_string()
            } else {
                "ok".to_string()
            },
        );
        if !pending_diagnostics.is_empty() {
            other.insert(
                "pendingDiagnostics".to_string(),
                serde_json::to_string(&pending_diagnostics)
                    .expect("failed to serialize pending diagnostics"),
            );
        }

        itf::Trace {
            meta: itf::trace::Meta {
                format: Some("ITF".to_string()),
                format_description: Some(
                    "https://apalache-mc.org/docs/adr/015adr-trace.html".to_string(),
                ),
                source: Some(source),
                description: Some(format!(
                    "Created by Quint (Rust version) on {}",
                    chrono::offset::Local::now().to_rfc2822()
                )),
                var_types: BTreeMap::default(),
                timestamp: Some(chrono::offset::Local::now().timestamp_millis() as u64),
                other,
            },
            vars,
            states,
            params: vec![],
            loop_index: None,
        }
    }
}

impl Value {
    /// Convert an ITF value directly to a Quint [`Value`].
    pub fn from_itf(itf_value: itf::Value) -> Self {
        match itf_value {
            itf::Value::Bool(b) => Value::bool(b),
            itf::Value::Number(n) => Value::int(n),
            itf::Value::String(s) => Value::str(Str::from(s)),
            itf::Value::BigInt(b) => {
                use num_bigint::BigInt as NumBigInt;
                let n: NumBigInt = b.into_inner();
                let n: i64 = n.try_into().expect("BigInt value does not fit in i64");
                Value::int(n)
            }
            itf::Value::List(elems) => {
                Value::list(elems.into_iter().map(Value::from_itf).collect())
            }
            itf::Value::Tuple(tup) => Value::tuple(tup.into_iter().map(Value::from_itf).collect()),
            itf::Value::Set(set) => Value::set(set.into_iter().map(Value::from_itf).collect()),
            itf::Value::Map(map) => Value::map(
                map.into_iter()
                    .map(|(k, v)| (Value::from_itf(k), Value::from_itf(v)))
                    .collect(),
            ),
            itf::Value::Record(rec) => {
                // Variants are encoded as records with "tag" and "value" fields.
                // Detect that pattern and convert back to a Variant.
                if rec.len() == 2 {
                    if let (Some(itf::Value::String(tag)), Some(value)) =
                        (rec.get("tag"), rec.get("value"))
                    {
                        return Value::variant(
                            Str::from(tag.clone()),
                            Value::from_itf(value.clone()),
                        );
                    }
                }
                // Apalache encodes empty tuples as { tag: "UNIT" }
                if rec.len() == 1 {
                    if let Some(itf::Value::String(tag)) = rec.get("tag") {
                        if tag == "UNIT" {
                            return Value::tuple(Default::default());
                        }
                    }
                }
                Value::record(
                    rec.into_iter()
                        .map(|(k, v)| (Str::from(k), Value::from_itf(v)))
                        .collect(),
                )
            }
            itf::Value::Unserializable(_) => {
                panic!("Cannot convert unserializable ITF value to Value")
            }
        }
    }

    pub fn to_itf(&self) -> itf::Value {
        match self.0.as_ref() {
            ValueInner::Int(i) => itf::Value::Number(*i),
            ValueInner::Bool(b) => itf::Value::Bool(*b),
            ValueInner::Str(s) => itf::Value::String(s.to_string()),
            ValueInner::InfiniteInt => itf::Value::Unserializable(
                serde_json::from_value(serde_json::json!({"#unserializable": "Int"})).unwrap(),
            ),
            ValueInner::InfiniteNat => itf::Value::Unserializable(
                serde_json::from_value(serde_json::json!({"#unserializable": "Nat"})).unwrap(),
            ),
            ValueInner::Set(_)
            | ValueInner::Interval(_, _)
            | ValueInner::CrossProduct(_)
            | ValueInner::PowerSet(_)
            | ValueInner::MapSet(_, _) => {
                let set = self
                    .as_set()
                    .expect("can't convert value to set for ITF conversion");
                itf::Value::Set(set.iter().map(|v| v.to_itf()).collect())
            }
            ValueInner::Tuple(elems) => {
                itf::Value::Tuple(elems.iter().map(|v| v.to_itf()).collect())
            }
            ValueInner::Record(fields) => itf::Value::Record(
                fields
                    .iter()
                    .map(|(k, v)| (k.to_string(), v.to_itf()))
                    .collect(),
            ),
            ValueInner::Map(map) => {
                itf::Value::Map(map.iter().map(|(k, v)| (k.to_itf(), v.to_itf())).collect())
            }
            ValueInner::List(elems) => itf::Value::List(elems.iter().map(|v| v.to_itf()).collect()),
            ValueInner::Variant(label, value) => itf::Value::Record(
                vec![
                    ("tag".to_string(), itf::Value::String(label.to_string())),
                    ("value".to_string(), value.to_itf()),
                ]
                .into_iter()
                .collect(),
            ),
            ValueInner::Lambda(_, _) => panic!("Cannot convert Lambda to ITF"),
        }
    }
}
