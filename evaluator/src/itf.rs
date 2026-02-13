//! Conversion of Traces with [`Value`]s to ITF (Informal Trace Format).
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
            let diagnostics: Vec<_> = state
                .diagnostics
                .into_iter()
                .map(|diag| {
                    serde_json::json!({
                        "label": diag.label,
                        "value": diag.value.to_itf()
                    })
                })
                .collect();

            let mut other = BTreeMap::new();
            other.insert(
                "diagnostics".to_string(),
                serde_json::to_string(&diagnostics).expect("failed to serialize diagnostics"),
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
