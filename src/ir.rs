use fxhash::FxBuildHasher;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

pub type FxHashMap<K, V> = IndexMap<K, V, FxBuildHasher>;

pub type QuintId = u64;

#[derive(Debug, Clone)]
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

    pub fn with_reference(code: &str, message: &str, reference: QuintId) -> Self {
        QuintError {
            code: code.to_string(),
            message: message.to_string(),
            reference: Some(reference),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintOutput {
    pub modules: Vec<QuintModule>,
    pub table: LookupTable,
}

pub type LookupTable = FxHashMap<QuintId, LookupDefinition>;

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum LookupDefinition {
    Definition(QuintDef),
    Param(QuintLambdaParameter),
}

impl LookupDefinition {
    pub fn id(&self) -> QuintId {
        match self {
            LookupDefinition::Definition(def) => def.id(),
            LookupDefinition::Param(param) => param.id,
        }
    }

    pub fn name(&self) -> &str {
        match self {
            LookupDefinition::Definition(def) => def.name(),
            LookupDefinition::Param(param) => param.name.as_str(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintModule {
    pub name: String,
    // We can use QuintDef instead of QuintDeclaration as flattening removes all
    // non-defs (imports, instances and exports)
    pub declarations: Vec<QuintDef>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OpDef {
    pub id: QuintId,
    pub name: String,
    pub qualifier: OpQualifier,
    pub expr: QuintEx,
    pub depth: Option<u64>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "kind")]
pub enum QuintDef {
    // Constants should have been dropped in flattening
    // Type defs are not relevant for evaluation
    // We only care about def, var and assume
    #[serde(rename = "def")]
    QuintOpDef(OpDef),

    #[serde(rename = "var")]
    QuintVar { id: QuintId, name: String },

    #[serde(rename = "assume")]
    QuintAssume {
        id: QuintId,
        name: String,
        assumption: QuintEx,
    },

    #[serde(rename = "typedef")]
    QuintTypeDef {
        id: QuintId,
        // We don't care about the type definition
    },

    #[serde(rename = "const")]
    QuintConst {
        id: QuintId,
        name: String,
        // We don't care about the constant definition
    },
}

impl QuintDef {
    pub fn id(&self) -> QuintId {
        match self {
            Self::QuintOpDef(def) => def.id,
            Self::QuintVar { id, name: _ } => *id,
            Self::QuintAssume {
                id,
                name: _,
                assumption: _,
            } => *id,
            Self::QuintTypeDef { id } => *id,
            Self::QuintConst { id, name: _ } => *id,
        }
    }

    pub fn name(&self) -> &str {
        match self {
            Self::QuintOpDef(def) => def.name.as_str(),
            Self::QuintVar { id: _, name } => name.as_str(),
            Self::QuintAssume {
                id: _,
                name,
                assumption: _,
            } => name.as_str(),
            Self::QuintTypeDef { id: _ } => panic!("There shouldn't be any typedefs here"),
            Self::QuintConst { id: _, name } => name.as_str(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
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

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "kind")]
pub enum QuintEx {
    #[serde(rename = "name")]
    QuintName { id: QuintId, name: String },

    #[serde(rename = "bool")]
    QuintBool { id: QuintId, value: bool },

    #[serde(rename = "int")]
    QuintInt { id: QuintId, value: i64 }, // Should we use BigInts?

    #[serde(rename = "str")]
    QuintStr { id: QuintId, value: String },

    #[serde(rename = "app")]
    QuintApp {
        id: QuintId,
        opcode: String,
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
            Self::QuintName { id, name: _ } => *id,
            Self::QuintBool { id, value: _ } => *id,
            Self::QuintInt { id, value: _ } => *id,
            Self::QuintStr { id, value: _ } => *id,
            Self::QuintApp {
                id,
                opcode: _,
                args: _,
            } => *id,
            Self::QuintLambda {
                id,
                params: _,
                expr: _,
            } => *id,
            Self::QuintLet {
                id,
                opdef: _,
                expr: _,
            } => *id,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuintLambdaParameter {
    pub id: QuintId,
    pub name: String,
}
