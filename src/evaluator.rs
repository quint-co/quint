//! The interpreter for the Quint language.
//!
//! Includes the compilation types and stateful datastructures used for
//! memoization, caching, state variable storage, etc.

use crate::rand::Rand;
use crate::storage::{Storage, VariableRegister};
use crate::{builtins::*, ir::*, value::*};
use fxhash::FxHashMap;
use std::cell::RefCell;
use std::fmt;
use std::rc::Rc;

/// The result of evaluating a Quint expression: either a [`Value`] or an error.
pub type EvalResult = Result<Value, QuintError>;

/// A compiled expression that can be executed in a given environment.
#[derive(Clone)]
pub struct CompiledExpr(Rc<dyn Fn(&mut Env) -> EvalResult>);

/// A compiled expression that takes arguments and can be executed in a given environment.
#[derive(Clone)]
#[allow(clippy::type_complexity)]
pub struct CompiledExprWithArgs(Rc<dyn Fn(&mut Env, Vec<Value>) -> EvalResult>);

/// A compiled expression that takes lazy (non-evaluated) arguments and can be
/// executed in a given environment.
#[derive(Clone)]
pub struct CompiledExprWithLazyArgs(
    #[allow(clippy::type_complexity)] Rc<dyn Fn(&mut Env, &Vec<CompiledExpr>) -> EvalResult>,
);

impl CompiledExpr {
    pub fn new(closure: impl Fn(&mut Env) -> EvalResult + 'static) -> Self {
        CompiledExpr(Rc::new(closure))
    }

    pub fn execute(&self, env: &mut Env) -> EvalResult {
        self.0(env)
    }
}

impl fmt::Debug for CompiledExpr {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "<CompiledExpr>")
    }
}

impl CompiledExprWithArgs {
    pub fn new(closure: impl Fn(&mut Env, Vec<Value>) -> EvalResult + 'static) -> Self {
        CompiledExprWithArgs(Rc::new(closure))
    }

    pub fn from_fn(function: fn(&mut Env, Vec<Value>) -> EvalResult) -> Self {
        CompiledExprWithArgs(Rc::new(function))
    }

    pub fn execute(&self, env: &mut Env, args: Vec<Value>) -> EvalResult {
        self.0(env, args)
    }
}

impl CompiledExprWithLazyArgs {
    pub fn new(closure: impl Fn(&mut Env, &Vec<CompiledExpr>) -> EvalResult + 'static) -> Self {
        CompiledExprWithLazyArgs(Rc::new(closure))
    }

    pub fn from_fn(function: fn(&mut Env, &Vec<CompiledExpr>) -> EvalResult) -> Self {
        CompiledExprWithLazyArgs(Rc::new(function))
    }

    pub fn execute(&self, env: &mut Env, args: &Vec<CompiledExpr>) -> EvalResult {
        self.0(env, args)
    }
}

pub struct Env {
    // The storage for state variables, holding their values on the current and
    // next state. We need it in the enviroment for taking and restoring snapshots.
    pub var_storage: Rc<RefCell<Storage>>,

    // The random number generator, used for nondeterministic choices. This is stateful.
    pub rand: Rand,
    // TODO: trace recorder (for --verbosity) and trace collector (for proper
    // trace tracking in runs)
}

impl Env {
    pub fn new(var_storage: Rc<RefCell<Storage>>) -> Self {
        Self {
            var_storage,
            rand: Rand::new(),
        }
    }

    /// Create a new environment with a specific random state.
    pub fn with_rand_state(var_storage: Rc<RefCell<Storage>>, state: u64) -> Self {
        Self {
            var_storage,
            rand: Rand::with_state(state),
        }
    }

    /// Shift the state, moving `next_vars` to `vars`.
    pub fn shift(&mut self) {
        self.var_storage.borrow_mut().shift_vars();
    }
}

/// A stateful interpreter, with memoization, caching, state variable storage
/// and tracking of modules.
pub struct Interpreter<'a> {
    // The storage for state variables, holding their values on the current and
    // next state.
    pub var_storage: Rc<RefCell<Storage>>,

    // The lookup table, read-only, used to resolve names
    table: &'a LookupTable,

    // Registries hold values for specific names, and are used on references of
    // those names. This way, we can re-use the memory space and avoid lookups
    // in runtime. The lookup is done in compile time, and during runtime, we
    // just read the value stored in that memory space.
    param_registry: FxHashMap<QuintId, Rc<RefCell<EvalResult>>>,
    const_registry: FxHashMap<QuintId, Rc<RefCell<EvalResult>>>,

    // Cached values that need to be cleared after certain scopes, to be used in
    // let-ins. We re-use the memory space and avoid lookups in runtime, but the
    // value needs to be cleared when we exit the scope.
    scoped_cached_values: FxHashMap<QuintId, Rc<RefCell<Option<EvalResult>>>>,

    // Memoization for the compilation, preventing the same expression to be
    // compiled more than once (in the same module). This whole map changes as
    // we enter and exit definitions that come from instances during evaluation.
    memo: Rc<RefCell<FxHashMap<QuintId, CompiledExpr>>>,

    // The same expression can be imported as many different instances. On which
    // instance, its value can be different, so we keep separate memos for each
    // instance.
    memo_by_instance: FxHashMap<QuintId, Rc<RefCell<FxHashMap<QuintId, CompiledExpr>>>>,

    // Different instances can also have variables that have the same `id` but
    // different values, as they evolve independently (see the
    // language-features/instances.qnt example). We differentiate those
    // variables by their namespace, which is unique in relation to the
    // import/instantiation history. Here, we track that history to know which
    // variable from the storage to use during evaluation.
    namespaces: Vec<QuintName>,
    // TODO: Other params from Typescript implementation, for future reference:
    // initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
}

impl<'a> Interpreter<'a> {
    pub fn new(table: &'a LookupTable) -> Self {
        Self {
            table,
            param_registry: FxHashMap::default(),
            const_registry: FxHashMap::default(),
            scoped_cached_values: FxHashMap::default(),
            var_storage: Rc::new(RefCell::new(Storage::default())),
            memo: Rc::new(RefCell::new(FxHashMap::default())),
            memo_by_instance: FxHashMap::default(),
            namespaces: Vec::new(),
        }
    }

    /// Shift the state, moving `next_vars` to `vars`.
    pub fn shift(&mut self) {
        self.var_storage.borrow_mut().shift_vars();
    }

    fn get_or_create_param(&mut self, param: &QuintLambdaParameter) -> Rc<RefCell<EvalResult>> {
        self.param_registry
            .entry(param.id)
            .or_insert_with(|| {
                Rc::new(RefCell::new(Err(QuintError::new(
                    "QNT500",
                    format!("Param {} not set", param.name).as_str(),
                ))))
            })
            .clone()
    }

    fn create_var(&mut self, id: QuintId, name: &QuintName) {
        let key = var_with_namespaces(id, &self.namespaces);

        if self.var_storage.borrow().vars.contains_key(&key) {
            return;
        }

        let var_name = name_with_namespaces(name, &self.namespaces);
        let register_for_current = Rc::new(RefCell::new(VariableRegister {
            name: var_name.clone(),
            value: None,
        }));

        let register_for_next = Rc::new(RefCell::new(VariableRegister {
            name: var_name,
            value: None,
        }));

        self.var_storage
            .borrow_mut()
            .vars
            .insert(key.clone(), register_for_current);
        self.var_storage
            .borrow_mut()
            .next_vars
            .insert(key, register_for_next);
    }

    fn get_or_create_var(
        &mut self,
        id: QuintId,
        name: &QuintName,
    ) -> Rc<RefCell<VariableRegister>> {
        let key = var_with_namespaces(id, &self.namespaces);

        if !self.var_storage.borrow().vars.contains_key(&key) {
            self.create_var(id, name);
        }

        Rc::clone(&self.var_storage.borrow().vars[&key])
    }

    fn get_or_create_const(&mut self, id: QuintId, name: &str) -> Rc<RefCell<EvalResult>> {
        self.const_registry
            .entry(id)
            .or_insert_with(|| {
                Rc::new(RefCell::new(Err(QuintError::new(
                    "QNT500",
                    format!(
                        "Uninitialized const {name}. Use: import <moduleName>(${name}=<value>).*",
                    )
                    .as_str(),
                ))))
            })
            .clone()
    }

    fn get_next_var(&self, id: QuintId) -> Rc<RefCell<VariableRegister>> {
        let key = var_with_namespaces(id, &self.namespaces);

        self.var_storage
            .borrow()
            .next_vars
            .get(&key)
            .unwrap()
            .clone()
    }

    pub fn compile_under_context(
        &mut self,
        def: &LookupDefinition,
        mut compilation: impl FnMut(&mut Interpreter) -> CompiledExpr,
    ) -> CompiledExpr {
        if let Some(ImportedFrom::Instance { id, overrides }) = def.imported_from() {
            // This originates from an instance, so we need to handle overrides

            // Save how the builder was before so we can restore it after
            let memo_before = self.memo.clone();
            let namespace_before = self.namespaces.clone();

            // We need separate memos for each instance.
            // For example, if N is a constant, the expression N + 1 can have different values for different instances.
            // We re-use the same memo for the same instance. So, let's check if there is an existing memo,
            // or create and save a new one
            self.memo = Rc::clone(
                self.memo_by_instance
                    .entry(*id)
                    .or_insert_with(|| Rc::new(RefCell::new(FxHashMap::default()))),
            );

            // We also need to update the namespaces to include the instance's namespaces.
            // So, if variable x is updated, we update the instance's x, i.e. my_instance::my_module::x
            self.namespaces = def.namespaces().cloned().unwrap_or_default();

            // Pre-compute as much as possible for the overrides: find the registers and find the expressions to evaluate
            // so we don't need to look that up in runtime
            let overrides = overrides
                .iter()
                .cloned()
                .map(|(param, expr)| {
                    let id = self.table.get(&param.id).unwrap().id();
                    let register = self.get_or_create_const(id, &param.name);

                    // Build the expr as a pure val def so it gets properly cached
                    let pure_val_def =
                        LookupDefinition::Definition(QuintDeclaration::QuintOpDef(OpDef {
                            id,
                            name: param.name.clone(),
                            qualifier: OpQualifier::PureVal,
                            expr,
                            imported_from: None,
                            namespaces: None,
                            depth: None,
                        }));

                    let compiled_pure_val = self.compile_def(&pure_val_def);
                    (register, compiled_pure_val)
                })
                .collect::<Vec<_>>();

            // Here, we have the right context to build the function. That is, all constants are pointing to the right registers,
            // and all namespaces are set for unambiguous variable access and update.
            let result = compilation(self);

            // Restore the builder to its previous state
            self.namespaces = namespace_before;
            self.memo = memo_before;

            // And then, in runtime, we only need to evaluate the override expressions, update the respective registers
            // and then call the function that was built
            return CompiledExpr::new(move |env| {
                // Evaluate the overrides and store the results in the const registers
                for (register, expr) in overrides.iter() {
                    let value = expr.execute(env);
                    *register.borrow_mut() = value;
                }
                result.execute(env)
            });
        }

        // Nothing to worry about if there are no instances involved
        compilation(self)
    }

    fn compile_def(&mut self, def: &LookupDefinition) -> CompiledExpr {
        self.compile_under_context(def, |interpreter| interpreter.compile_def_core(def))
    }

    fn compile_def_core(&mut self, def: &LookupDefinition) -> CompiledExpr {
        if let Some(cached) = self.memo.borrow().get(&def.id()) {
            return cached.clone();
        }

        let compiled_def = match def {
            LookupDefinition::Definition(QuintDeclaration::QuintOpDef(op)) => {
                if matches!(op.expr, QuintEx::QuintLambda { .. }) || op.depth.is_none_or(|x| x == 0)
                {
                    // We need to avoid scoped caching in lambdas or top-level expressions
                    // We still have memoization. This caching is special for scoped defs (let-ins)
                    self.compile(&op.expr)
                } else {
                    let cached_value = {
                        let cached = self.scoped_cached_values.get(&op.id).unwrap();
                        Rc::clone(cached)
                    };

                    let compiled_expr = self.compile(&op.expr);
                    CompiledExpr::new(move |env| {
                        let mut cached = cached_value.borrow_mut();
                        if let Some(value) = cached.as_ref() {
                            // If the value is already cached, return it
                            value.clone()
                        } else {
                            let result = compiled_expr.execute(env);
                            *cached = Some(result.clone());
                            result
                        }
                    })
                }
            }
            LookupDefinition::Definition(QuintDeclaration::QuintVar(QuintVar {
                id, name, ..
            })) => {
                let register = self.get_or_create_var(*id, name);
                let name = name.clone();

                CompiledExpr::new(move |_| {
                    register.borrow().clone().value.ok_or(QuintError::new(
                        "QNT502",
                        format!("Variable {} not set", name).as_str(),
                    ))
                })
            }
            LookupDefinition::Definition(QuintDeclaration::QuintConst(QuintConst {
                id,
                name,
                ..
            })) => {
                let register = self.get_or_create_const(*id, name);
                CompiledExpr::new(move |_| register.borrow().clone())
            }
            LookupDefinition::Param(p) => {
                let register = self.get_or_create_param(p);
                CompiledExpr::new(move |_| register.borrow().clone())
            }
            d => unimplemented!("{:#?}", d),
        };

        // For top-level value definitions, we can cache the resulting value,
        // as long as we are careful with state changes.
        match can_cache(def) {
            Cache::None => {
                self.memo
                    .borrow_mut()
                    .insert(def.id(), compiled_def.clone());
                compiled_def
            }
            Cache::ForState => {
                let cached_value = Rc::new(RefCell::new(None));
                // This definition may use variables, so we need to clear the cache when they change
                self.var_storage
                    .borrow_mut()
                    .caches_to_clear
                    .push(cached_value.clone());
                // Wrap the evaluation function with caching
                let wrapped_expr = CompiledExpr::new(move |env| {
                    let mut cached = cached_value.borrow_mut();
                    if let Some(value) = cached.as_ref() {
                        // If the value is already cached, return it
                        Ok(value.clone())
                    } else {
                        let result = compiled_def.execute(env)?;
                        *cached = Some(result.clone());
                        Ok(result)
                    }
                });
                self.memo
                    .borrow_mut()
                    .insert(def.id(), wrapped_expr.clone());
                wrapped_expr
            }
            Cache::Forever => {
                // A stateless expression, we don't even need the updated env
                let value = compiled_def.execute(&mut Env::new(self.var_storage.clone()));
                CompiledExpr::new(move |_| value.clone())
            }
        }
    }

    fn mk_lambda(&mut self, params: Vec<QuintLambdaParameter>, body: CompiledExpr) -> Value {
        let registers = params
            .into_iter()
            .map(|param| {
                let register = self.get_or_create_param(&param);
                Rc::clone(&register)
            })
            .collect::<Vec<_>>();

        Value::Lambda(registers, body)
    }

    pub fn compile(&mut self, expr: &QuintEx) -> CompiledExpr {
        if let Some(cached) = self.memo.borrow().get(&expr.id()) {
            return cached.clone();
        }

        let id = expr.id();

        let compiled_expr = self.compile_expr_core(expr);
        let wrapped_expr = CompiledExpr::new(move |env| {
            compiled_expr.execute(env).map_err(|err| {
                // This is where we add the reference to the error, if it is not already there.
                // This way, we don't need to worry about references anywhere else :)
                if err.reference.is_none() {
                    return err.with_reference(id);
                }
                err
            })
        });
        self.memo.borrow_mut().insert(id, wrapped_expr.clone());
        wrapped_expr
    }

    pub fn compile_expr_core(&mut self, expr: &QuintEx) -> CompiledExpr {
        match expr {
            QuintEx::QuintInt { id: _, value } => {
                let value = *value;
                CompiledExpr::new(move |_| Ok(Value::Int(value)))
            }

            QuintEx::QuintBool { id: _, value } => {
                let value = *value;
                CompiledExpr::new(move |_| Ok(Value::Bool(value)))
            }

            QuintEx::QuintStr { id: _, value } => {
                let value = value.clone();
                CompiledExpr::new(move |_| Ok(Value::Str(value.clone())))
            }

            QuintEx::QuintName { id, name } => self
                .table
                .get(id)
                .map(|def| self.compile_def(def))
                .unwrap_or_else(|| builtin_value(name.as_str())),

            QuintEx::QuintLambda {
                id: _,
                params,
                expr,
            } => {
                let body = self.compile(expr);
                let lambda = self.mk_lambda(params.to_vec(), body);
                CompiledExpr::new(move |_| Ok(lambda.clone()))
            }

            QuintEx::QuintApp { id, opcode, args } => {
                let compiled_args = args.iter().map(|arg| self.compile(arg)).collect::<Vec<_>>();

                if opcode == "assign" {
                    // Assign is too special, so we handle it separately.
                    // We need to build things under the context of the variable being assigned,
                    // as it may come from an instance, and that changed everything
                    let var_def = self.table.get(&args[0].id()).unwrap();
                    self.compile_under_context(var_def, |interpreter| {
                        interpreter.create_var(var_def.id(), var_def.name());
                        let register = interpreter.get_next_var(var_def.id());
                        let expr = interpreter.compile(&args[1]);

                        CompiledExpr::new(move |env| {
                            let value = expr.execute(env)?;
                            register.borrow_mut().value = Some(value.clone());
                            Ok(Value::Bool(true))
                        })
                    })
                } else if LAZY_OPS.contains(&opcode.as_str()) {
                    // Lazy operator, compile the arguments and give their
                    // closures to the operator so it decides when to eval
                    let opcode = opcode.clone();
                    CompiledExpr::new(move |env| {
                        let op = compile_lazy_op(&opcode);
                        op.execute(env, &compiled_args)
                    })
                } else {
                    // Otherwise, this is either a normal (eager) builtin, or an user-defined operator.
                    // For both, we first evaluate the arguments and then apply the operator.
                    let compiled_op = self.compile_op(id, opcode);
                    CompiledExpr::new(move |env| {
                        let evaluated_args = compiled_args
                            .iter()
                            .map(|arg| arg.execute(env))
                            .collect::<Result<Vec<_>, _>>()?;
                        compiled_op.execute(env, evaluated_args)
                    })
                }
            }

            QuintEx::QuintLet { id: _, opdef, expr } => {
                // First, we create a cached value (a register with optional value) for the definition in this let expression
                let cached_value = {
                    let cached = self
                        .scoped_cached_values
                        .entry(opdef.id)
                        .or_insert_with(|| Rc::new(RefCell::new(None)));
                    Rc::clone(cached)
                };
                // Then, we build the expression for the let body. It will use the lookup table and, every time it needs the value
                // for the definition under the let, it will use the cached value (or eval a new value and store it).
                let compiled_expr = self.compile(expr);
                CompiledExpr::new(move |env| {
                    let result = compiled_expr.execute(env);
                    // After evaluating the whole let expression, we clear the cached value, as it is no longer in scope.
                    // The next time the whole let expression is evaluated, the definition will be re-evaluated.
                    cached_value.replace(None);
                    result
                })
            }
        }
    }

    pub fn compile_op(&mut self, id: &QuintId, op: &str) -> CompiledExprWithArgs {
        match self.table.get(id) {
            Some(def) => {
                // A user-defined operator
                let op = self.compile_def(def);
                CompiledExprWithArgs::new(move |env, args| {
                    let lambda = op.execute(env)?;
                    let closure = lambda.as_closure();
                    closure(env, args)
                })
            }
            // A built-in. We already checked that this is not lazy before.
            None => compile_eager_op(op),
        }
    }

    /// Utility to compile and evaluate an expression
    pub fn eval(&mut self, env: &mut Env, expr: QuintEx) -> EvalResult {
        self.compile(&expr).execute(env)
    }
}

fn builtin_value(name: &str) -> CompiledExpr {
    match name {
        "true" => CompiledExpr::new(move |_| Ok(Value::Bool(true))),
        "false" => CompiledExpr::new(move |_| Ok(Value::Bool(false))),
        "Bool" => CompiledExpr::new(move |_| {
            Ok(Value::Set(ImmutableSet::from(vec![
                Value::Bool(true),
                Value::Bool(false),
            ])))
        }),
        _ => unimplemented!("Unknown builtin name: {}", name),
    }
}

fn name_with_namespaces(name: &QuintName, namespaces: &[QuintName]) -> QuintName {
    let reverted_namespaces = namespaces.iter().rev().chain(std::iter::once(name));
    QuintName::join(reverted_namespaces, "::")
}

fn var_with_namespaces(id: QuintId, namespaces: &[QuintName]) -> QuintName {
    use itertools::Itertools;

    let key = std::iter::once(id.to_string())
        .chain(namespaces.iter().map(|n| n.to_string()))
        .join("#");

    QuintName::from(key)
}

#[derive(Debug, PartialEq)]
enum Cache {
    // Don't cache
    None,
    // Cache and clear after a `shift()`
    ForState,
    // Cache forever (never clear)
    Forever,
}

/// Find out how we can cache a definition based on its qualifier.
///
/// We know for sure that the qualifier is not less permissive than it needs to
/// be since the input is effect-checked. However, it can me more permissive
/// than it needs, i.e. when the users annotates everything as "action" for
/// example, we won't be caching anything. This is OK as we intend to have
/// automatic suggestions of less permissive qualifiers on a linter soon. We
/// could used the inferred qualifier here instead, but there's currently no
/// good interfaces for that.
fn can_cache(def: &LookupDefinition) -> Cache {
    if let LookupDefinition::Definition(QuintDeclaration::QuintOpDef(d)) = def {
        if d.qualifier == OpQualifier::Val && d.depth.is_none_or(|x| x == 0) {
            return Cache::ForState;
        }
        if d.qualifier == OpQualifier::PureVal && d.depth.is_none_or(|x| x == 0) {
            return Cache::Forever;
        }
    }

    Cache::None
}

/// Utility to compile and evaluate an expression in a new interpreter
pub fn run(table: &LookupTable, expr: &QuintEx) -> Result<Value, QuintError> {
    let mut interpreter = Interpreter::new(table);
    let mut env = Env::new(interpreter.var_storage.clone());

    interpreter.eval(&mut env, expr.clone())
}
