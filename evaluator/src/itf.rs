//! Conversion of Traces with [`Value`]s to ITF (Informal Trace Format).
//!
//! Read more about it [here](https://apalache-mc.org/docs/adr/015adr-trace.html).
//!
//! This format can be parsed by Quint's typescript tool and by the ITF trace
//! viewer extension on VSCode.

use crate::value::{Value, ValueInner};
use chrono::{self};
use itf;
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Trace {
    pub states: Vec<Value>,
    pub violation: bool,
    pub seed: u64,
}

impl Trace {
    pub fn to_itf(self, source: String) -> itf::Trace<itf::Value> {
        let states = self
            .states
            .iter()
            .enumerate()
            .map(|(i, v)| itf::State {
                meta: itf::state::Meta {
                    index: Some(i as u64),
                    other: BTreeMap::default(),
                },
                value: v.to_itf(),
            })
            .collect::<Vec<itf::State<itf::Value>>>();

        // Find the variable names by taking the fields from the first state
        // (which should be a record)
        let vars = if let Some(first_state) = self.states.first() {
            if let ValueInner::Record(map) = first_state.0.as_ref() {
                map.keys().map(|v| v.to_string()).collect::<Vec<_>>()
            } else {
                panic!("Expected a record, got {}", self.states[0]);
            }
        } else {
            panic!("No states found");
        };

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
            ValueInner::Set(_)
            | ValueInner::Interval(_, _)
            | ValueInner::CrossProduct(_)
            | ValueInner::PowerSet(_)
            | ValueInner::MapSet(_, _) => {
                let set = self
                    .as_set()
                    .expect("failure in ITF conversion: set could not be enumerated");
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
