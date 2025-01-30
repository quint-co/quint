use fxhash::FxBuildHasher;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

type FxHashMap<K, V> = IndexMap<K, V, FxBuildHasher>;

type QuintId = u64;

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintOutput {
    modules: Vec<QuintModule>,
    table: LookupTable,
}

type LookupTable = FxHashMap<QuintId, LookupDefinition>;

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
enum LookupDefinition {
    Definition(QuintDef),
    Param(QuintLambdaParameter),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintModule {
    name: String,
    // We can use QuintDef instead of QuintDeclaration as flattening removes all
    // non-defs (imports, instances and exports)
    declarations: Vec<QuintDef>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OpDef {
    id: QuintId,
    name: String,
    qualifier: OpQualifier,
    expr: QuintEx,
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
        // We don't care about the constant definition
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
        opdef: Box<OpDef>,
        expr: Box<QuintEx>,
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuintLambdaParameter {
    id: QuintId,
    name: String,
}
