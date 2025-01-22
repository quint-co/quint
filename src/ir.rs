use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub type QuintId = u64;

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintOutput {
    pub modules: Vec<QuintModule>,
    pub table: LookupTable,
}

pub type LookupTable = HashMap<QuintId, LookupDefinition>;

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum LookupDefinition {
    Definition(QuintDef),
    Param(QuintLambdaParameter),
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
        expr: QuintEx,
    },
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
        opdef: Vec<OpDef>,
        body: Box<QuintEx>,
    },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuintLambdaParameter {
    pub id: QuintId,
    pub name: String,
}
