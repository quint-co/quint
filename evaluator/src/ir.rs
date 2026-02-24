//! Internal Representation (IR) of Quint, to be deserialized from the Quint compiler
//! input.

use fxhash::FxBuildHasher;
use hipstr::HipStr;
use indexmap::IndexMap;
use serde::{Deserialize, Deserializer, Serialize};
use thiserror::Error;

pub type QuintId = u64;

// NOTE: be aware of a bug in HipStr where a LocalHipStr is allowed to cross
// thread boundaries by implementing Send, however, it causes a double free on
// large heap-allocated strings.
pub type QuintName = HipStr<'static>;

#[derive(Debug, Clone, Error, PartialEq, Serialize)]
#[error("[{code}] {message}")]
pub struct QuintError {
    pub code: String,
    pub message: String,
    pub trace: Vec<QuintId>,
}

impl QuintError {
    pub fn new(code: &str, message: &str) -> Self {
        QuintError {
            code: code.to_string(),
            message: message.to_string(),
            trace: Vec::new(),
        }
    }

    pub fn with_reference(self, reference: QuintId) -> Self {
        debug_assert!(
            self.trace.is_empty(),
            "with_reference called on an error that already has a stack trace"
        );
        QuintError {
            code: self.code,
            message: self.message,
            trace: vec![reference],
        }
    }

    pub fn push_trace(mut self, id: QuintId) -> Self {
        self.trace.push(id);
        self
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintOutput {
    pub modules: Vec<QuintModule>,
    pub table: LookupTable,
    pub main: QuintName,
}

/// LookupTable with custom deserialization to handle string keys from JSONbig
#[derive(Default, Serialize, Debug, Clone)]
pub struct LookupTable(IndexMap<QuintId, LookupDefinition, FxBuildHasher>);

impl std::ops::Deref for LookupTable {
    type Target = IndexMap<QuintId, LookupDefinition, FxBuildHasher>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::ops::DerefMut for LookupTable {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

/// Custom deserializer for LookupTable to handle maps with integer keys.
/// This is necessary to workaround a serve bug involving tagged enums.
/// See: https://github.com/serde-rs/json/issues/1254
impl<'de> Deserialize<'de> for LookupTable {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        use serde::de::{MapAccess, Visitor};
        use std::fmt;

        struct LookupTableVisitor;

        impl<'de> Visitor<'de> for LookupTableVisitor {
            type Value = LookupTable;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a map with string keys representing u64 IDs")
            }

            fn visit_map<M>(self, mut map: M) -> Result<LookupTable, M::Error>
            where
                M: MapAccess<'de>,
            {
                let mut table = IndexMap::with_hasher(FxBuildHasher::default());

                while let Some(key_str) = map.next_key::<String>()? {
                    let id: u64 = key_str.parse().map_err(serde::de::Error::custom)?;
                    let value: LookupDefinition = map.next_value()?;
                    table.insert(id, value);
                }

                Ok(LookupTable(table))
            }
        }

        deserializer.deserialize_map(LookupTableVisitor)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum LookupDefinition {
    Definition(QuintDeclaration),
    Param(QuintLambdaParameter),
}

impl LookupDefinition {
    pub fn id(&self) -> QuintId {
        match self {
            LookupDefinition::Definition(def) => def.id(),
            LookupDefinition::Param(param) => param.id,
        }
    }

    pub fn name(&self) -> &QuintName {
        match self {
            LookupDefinition::Definition(def) => def.name(),
            LookupDefinition::Param(param) => &param.name,
        }
    }

    pub fn imported_from(&self) -> Option<&ImportedFrom> {
        match self {
            LookupDefinition::Definition(def) => def.imported_from(),
            LookupDefinition::Param(_) => None,
        }
    }

    pub fn namespaces(&self) -> Option<&Vec<QuintName>> {
        match self {
            LookupDefinition::Definition(def) => def.namespaces(),
            LookupDefinition::Param(_) => None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintModule {
    pub name: QuintName,
    pub declarations: Vec<QuintDeclaration>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OpDef {
    pub id: QuintId,
    pub name: QuintName,
    pub qualifier: OpQualifier,
    pub expr: QuintEx,
    #[serde(rename = "importedFrom")]
    pub imported_from: Option<ImportedFrom>,
    pub namespaces: Option<Vec<QuintName>>,
    pub depth: Option<u64>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind")]
pub enum ImportedFrom {
    #[serde(rename = "import")]
    Import { id: QuintId },
    #[serde(rename = "instance")]
    Instance {
        id: QuintId,
        overrides: Vec<(QuintLambdaParameter, QuintEx)>,
    },
    #[serde(rename = "export")]
    Export { id: QuintId },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuintVar {
    pub id: QuintId,
    pub name: QuintName,
    #[serde(rename = "importedFrom")]
    pub imported_from: Option<ImportedFrom>,
    pub namespaces: Option<Vec<QuintName>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuintAssume {
    pub id: QuintId,
    pub name: QuintName,
    pub assumption: QuintEx,
    #[serde(rename = "importedFrom")]
    pub imported_from: Option<ImportedFrom>,
    pub namespaces: Option<Vec<QuintName>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuintTypeDef {
    pub id: QuintId,
    // We don't care about the type definition
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind")]
pub struct QuintConst {
    pub id: QuintId,
    pub name: QuintName,
    #[serde(rename = "importedFrom")]
    pub imported_from: Option<ImportedFrom>,
    pub namespaces: Option<Vec<QuintName>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind")]
pub enum QuintDeclaration {
    // Constants should have been dropped in flattening
    // Type defs are not relevant for evaluation
    // We only care about def, var and assume
    #[serde(rename = "def")]
    QuintOpDef(OpDef),

    #[serde(rename = "var")]
    QuintVar(QuintVar),

    #[serde(rename = "assume")]
    QuintAssume(QuintAssume),

    #[serde(rename = "typedef")]
    QuintTypeDef(QuintTypeDef),

    #[serde(rename = "const")]
    QuintConst(QuintConst),

    #[serde(rename = "import")]
    QuintImport {}, // Ignore
    #[serde(rename = "instance")]
    QuintInstance {}, // Ignore
    #[serde(rename = "export")]
    QuintExport {}, // Ignore
}

impl QuintDeclaration {
    pub fn id(&self) -> QuintId {
        match self {
            Self::QuintOpDef(def) => def.id,
            Self::QuintVar(QuintVar { id, .. }) => *id,
            Self::QuintAssume(QuintAssume { id, .. }) => *id,
            Self::QuintTypeDef(QuintTypeDef { id }) => *id,
            Self::QuintConst(QuintConst { id, .. }) => *id,
            _ => panic!("This import-like declaration doesn't have an id"),
        }
    }

    pub fn name(&self) -> &QuintName {
        match self {
            Self::QuintOpDef(def) => &def.name,
            Self::QuintVar(QuintVar { name, .. }) => name,
            Self::QuintAssume(QuintAssume { name, .. }) => name,
            Self::QuintTypeDef(QuintTypeDef { .. }) => {
                panic!("There shouldn't be any typedefs here")
            }
            Self::QuintConst(QuintConst { name, .. }) => name,
            _ => panic!("This import-like declaration doesn't have a name"),
        }
    }

    pub fn imported_from(&self) -> Option<&ImportedFrom> {
        match self {
            Self::QuintOpDef(OpDef { imported_from, .. })
            | Self::QuintVar(QuintVar { imported_from, .. })
            | Self::QuintAssume(QuintAssume { imported_from, .. })
            | Self::QuintConst(QuintConst { imported_from, .. }) => imported_from.as_ref(),
            _ => None,
        }
    }

    pub fn namespaces(&self) -> Option<&Vec<QuintName>> {
        match self {
            Self::QuintOpDef(OpDef { namespaces, .. })
            | Self::QuintVar(QuintVar { namespaces, .. })
            | Self::QuintAssume(QuintAssume { namespaces, .. })
            | Self::QuintConst(QuintConst { namespaces, .. }) => namespaces.as_ref(),
            _ => None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
pub enum OpQualifier {
    #[serde(rename = "puredef")]
    PureDef,
    #[serde(rename = "pureval")]
    PureVal,
    #[serde(rename = "def")]
    Def,
    #[serde(rename = "val")]
    Val,
    #[serde(rename = "nondet")]
    Nondet,
    #[serde(rename = "action")]
    Action,
    #[serde(rename = "run")]
    Run,
    #[serde(rename = "temporal")]
    Temporal,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind")]
pub enum QuintEx {
    #[serde(rename = "name")]
    QuintName { id: QuintId, name: QuintName },

    #[serde(rename = "bool")]
    QuintBool { id: QuintId, value: bool },

    #[serde(rename = "int")]
    QuintInt { id: QuintId, value: i64 }, // Should we use BigInts?

    #[serde(rename = "str")]
    QuintStr { id: QuintId, value: QuintName },

    #[serde(rename = "app")]
    QuintApp {
        id: QuintId,
        opcode: QuintName,
        args: Vec<QuintEx>,
    },

    #[serde(rename = "lambda")]
    QuintLambda {
        id: QuintId,
        params: Vec<QuintLambdaParameter>,
        expr: Box<QuintEx>,
    },

    #[serde(rename = "let")]
    QuintLet {
        id: QuintId,
        opdef: Box<OpDef>,
        expr: Box<QuintEx>,
    },
}

impl QuintEx {
    pub fn id(&self) -> QuintId {
        match self {
            Self::QuintName { id, .. }
            | Self::QuintBool { id, .. }
            | Self::QuintInt { id, .. }
            | Self::QuintStr { id, .. }
            | Self::QuintApp { id, .. }
            | Self::QuintLambda { id, .. }
            | Self::QuintLet { id, .. } => *id,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuintLambdaParameter {
    pub id: QuintId,
    pub name: QuintName,
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Test that demonstrates why the custom deserializer is needed.
    ///
    /// **The Problem:**
    /// TypeScript uses JSONbig.stringify() to serialize Map<bigint, LookupDefinition>,
    /// which produces JSON with STRING keys (per JSON spec): `{"4": {...}, "6": {...}}`.
    ///
    /// Without the custom deserializer, serde_json fails with:
    /// "invalid type: string \"4\", expected u64"
    ///
    /// This does work with simpler datatypes, but the specific setting inside
    /// an enum (like `ReplCommand`) and makes it break.
    ///
    /// See: https://github.com/serde-rs/json/issues/1254
    ///
    /// This test reproduces the exact failure that occurs when TypeScript sends
    /// UpdateTable commands to the Rust REPL evaluator.
    #[test]
    fn test_lookup_table_deserialization_with_string_keys() {
        // This is the EXACT JSON format sent from TypeScript ReplEvaluatorWrapper
        let json = r#"{"cmd":"UpdateTable","table":{"4":{"kind":"var","name":"n","typeAnnotation":{"id":1,"kind":"int"},"id":2,"depth":0},"6":{"id":6,"kind":"def","name":"init","qualifier":"action","expr":{"id":5,"kind":"app","opcode":"assign","args":[{"id":4,"kind":"name","name":"n"},{"id":3,"kind":"int","value":1}]},"depth":0}}}"#;

        #[derive(serde::Deserialize, Debug)]
        #[serde(tag = "cmd")]
        enum TestCommand {
            UpdateTable { table: LookupTable },
        }

        // Try to deserialize
        let result: Result<TestCommand, _> = serde_json::from_str(json);

        match result {
            Ok(cmd) => {
                let TestCommand::UpdateTable { table } = cmd;

                assert!(table.get(&4).is_some(), "Should find entry with key 4");
                assert!(table.get(&6).is_some(), "Should find entry with key 6");
            }
            Err(e) => {
                panic!("Deserialization failed: {e}");
            }
        }
    }
}
