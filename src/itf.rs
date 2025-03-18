use crate::value::Value;
use chrono::{self};
use itf;
use std::collections::BTreeMap;

pub struct Trace {
    pub states: Vec<Value>,
    pub violation: bool,
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

        let vars = if let Some(Value::Record(map)) = self.states.first() {
            map.keys().cloned().collect::<Vec<String>>()
        } else {
            panic!("Expected a record, got {}", self.states[0]);
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
        match self {
            Self::Int(i) => itf::Value::Number(*i),
            Self::Bool(b) => itf::Value::Bool(*b),
            Self::Str(s) => itf::Value::String(s.clone()),
            Self::Set(_)
            | Self::Interval(_, _)
            | Self::CrossProduct(_)
            | Self::PowerSet(_)
            | Self::MapSet(_, _) => {
                itf::Value::Set(self.as_set().iter().map(|v| v.to_itf()).collect())
            }
            Self::Tuple(elems) => itf::Value::Tuple(elems.iter().map(|v| v.to_itf()).collect()),
            Self::Record(fields) => itf::Value::Record(
                fields
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_itf()))
                    .collect(),
            ),
            Self::Map(map) => {
                itf::Value::Map(map.iter().map(|(k, v)| (k.to_itf(), v.to_itf())).collect())
            }
            Self::List(elems) => itf::Value::List(elems.iter().map(|v| v.to_itf()).collect()),
            Self::Variant(label, value) => itf::Value::Record(
                vec![
                    ("tag".to_string(), itf::Value::String(label.clone())),
                    ("value".to_string(), value.to_itf()),
                ]
                .into_iter()
                .collect(),
            ),
            Self::Lambda(_, _) => panic!("Cannot convert Lambda to ITF"),
        }
    }
}
