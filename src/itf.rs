use std::collections::BTreeMap;

use itf;

use crate::value::Value;

pub struct Trace(pub Vec<Value>);

impl Trace {
    pub fn to_itf(self) -> itf::Trace<itf::Value> {
        let states = self
            .0
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

        itf::Trace {
            // TODO Fill remaining fields
            meta: itf::trace::Meta {
                format: None,
                format_description: Some(
                    "https://apalache-mc.org/docs/adr/015adr-trace.html".to_string(),
                ),
                source: None,
                description: Some("Created by the Quint Rust simulator.".to_string()),
                var_types: BTreeMap::default(),
                timestamp: None,
                other: BTreeMap::default(),
            },
            params: vec![],
            vars: vec![],
            loop_index: None,
            states,
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
                // itf::Value::Set(s.iter().map(|v| v.to_itf()).collect())
                todo!() // I think we need to update ITF to implement FromIterator on Set
            }
            Self::Tuple(elems) => {
                // itf::Value::Tuple((elems.iter().map(|v| v.to_itf()).collect())),
                todo!() // Same, need FromIterator
            }
            Self::Record(fields) => itf::Value::Record(itf::value::Map::new(
                // FIXME: This is not working, being serialized as "#map". Seems like a problem in itf-rs
                fields
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_itf()))
                    .collect(),
            )),
            Self::Map(map) => itf::Value::Map(itf::value::Map::new(
                map.iter().map(|(k, v)| (k.to_itf(), v.to_itf())).collect(),
            )),
            Self::List(elems) => itf::Value::List(elems.iter().map(|v| v.to_itf()).collect()),
            Self::Variant(label, value) => itf::Value::Record(itf::value::Map::new(
                vec![
                    ("tag".to_string(), itf::Value::String(label.clone())),
                    ("value".to_string(), value.to_itf()),
                ]
                .into_iter()
                .collect(),
            )),
            Self::Lambda(_, _) => panic!("Cannot convert Lambda to ITF"),
        }
    }
}
