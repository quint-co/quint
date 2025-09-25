//! Internal Representation (IR) of Quint, to be deserialized from the Quint compiler
//! input.

use fxhash::FxBuildHasher;
use hipstr::HipStr;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
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
    pub reference: Option<QuintId>,
}

impl QuintError {
    pub fn new(code: &str, message: &str) -> Self {
        QuintError {
            code: code.to_string(),
            message: message.to_string(),
            reference: None,
        }
    }

    pub fn with_reference(self, reference: QuintId) -> Self {
        QuintError {
            code: self.code,
            message: self.message,
            reference: Some(reference),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintOutput {
    pub modules: Vec<QuintModule>,
    pub table: LookupTable,
    pub main: QuintName,
}

pub type LookupTable = IndexMap<QuintId, LookupDefinition, FxBuildHasher>;

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
