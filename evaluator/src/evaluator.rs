//! The interpreter for the Quint language.
//!
//! Includes the compilation types and stateful datastructures used for
//! memoization, caching, state variable storage, etc.

use crate::itf::{DebugMessage, State};
use crate::nondet;
use crate::progress::no_report;
use crate::rand::Rand;
use crate::simulator::{ParsedQuint, SimulationConfig};
use crate::storage::{Storage, VariableRegister};
use crate::verbosity::Verbosity;
use crate::{builtins::*, ir::*, value::*};
use fxhash::{FxHashMap, FxHashSet};
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
    // next state. We need it in the environment for taking and restoring snapshots.
    pub var_storage: Rc<RefCell<Storage>>,

    // The random number generator, used for nondeterministic choices. This is stateful.
    pub rand: Rand,

    // The trace collector, used to track state transitions during evaluation.
    // This is collected whenever `then` advances the state by calling `shift()`.
    pub trace: Vec<State>,

    // Diagnostic messages for the current step. These are moved into the Step
    // when `shift()` is called.
    pub diagnostics: Vec<DebugMessage>,

    // Verbosity level controlling debug output collection.
    pub verbosity: Verbosity,
}

impl Env {
    pub fn new(var_storage: Rc<RefCell<Storage>>, verbosity: Verbosity) -> Self {
        Self {
            var_storage,
            rand: Rand::new(),
            trace: Vec::new(),
            diagnostics: Vec::new(),
            verbosity,
        }
    }

    /// Create a new environment with a specific random state.
    pub fn with_rand_state(
        var_storage: Rc<RefCell<Storage>>,
        state: u64,
        verbosity: Verbosity,
    ) -> Self {
        Self {
            var_storage,
            rand: Rand::with_state(state),
            trace: Vec::new(),
            diagnostics: Vec::new(),
            verbosity,
        }
    }

    /// Shift the state, moving `next_vars` to `vars`, and record the new state in the trace.
    pub fn shift(&mut self) {
        self.var_storage.borrow_mut().shift_vars();
        // After shifting, the current state is in `vars`, so we record it
        let value = self.var_storage.borrow().as_record();
        let diagnostics = std::mem::take(&mut self.diagnostics);
        self.trace.push(State { value, diagnostics });
        // Clear metadata after recording so it doesn't carry over to the next state
        self.var_storage.borrow_mut().clear_metadata();
    }
}

/// A stateful interpreter, with memoization, caching, state variable storage
/// and tracking of modules.
pub struct Interpreter {
    // The storage for state variables, holding their values on the current and
    // next state.
    pub var_storage: Rc<RefCell<Storage>>,

    // The lookup table, read-only, used to resolve names
    table: LookupTable,

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

    // Initial nondet picks to be registered in the storage. This ensures that
    // at step 0, all nondet variable names are present in the map (with None values).
    initial_nondet_picks: FxHashSet<QuintName>,
}

impl Interpreter {
    pub fn new(table: LookupTable) -> Self {
        Self {
            table,
            param_registry: FxHashMap::default(),
            const_registry: FxHashMap::default(),
            scoped_cached_values: FxHashMap::default(),
            var_storage: Rc::new(RefCell::new(Storage::default())),
            memo: Rc::new(RefCell::new(FxHashMap::default())),
            memo_by_instance: FxHashMap::default(),
            namespaces: Vec::new(),
            initial_nondet_picks: FxHashSet::default(),
        }
    }

    /// Update the lookup table.
    /// Assumes the new table is an extension of the old one,
    /// and therefore all caches are still valid
    pub fn update_table(&mut self, table: LookupTable) {
        self.table = table;
    }

    /// Shift the state, moving `next_vars` to `vars`.
    pub fn shift(&mut self) {
        self.var_storage.borrow_mut().shift_vars();
    }

    /// Initialize the storage's nondet picks map with names discovered during compilation.
    /// This ensures all nondet variables appear in the initial state with None values.
    pub fn create_nondet_picks(&self) {
        self.var_storage
            .borrow_mut()
            .initialize_nondet_picks(&self.initial_nondet_picks);
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
                        "Uninitialized const {name}. Use: import <moduleName>({name}=<value>).*",
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

    pub fn compile_def(&mut self, def: &LookupDefinition) -> CompiledExpr {
        self.compile_under_context(def, |interpreter| interpreter.compile_def_core(def))
    }

    fn compile_def_core(&mut self, def: &LookupDefinition) -> CompiledExpr {
        if let Some(cached) = self.memo.borrow().get(&def.id()) {
            return cached.clone();
        }

        let compiled_def = match def {
            LookupDefinition::Definition(QuintDeclaration::QuintOpDef(op)) => {
                let base_expr = if matches!(op.expr, QuintEx::QuintLambda { .. })
                    || op.depth.is_none_or(|x| x == 0)
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
                };

                // Wrap action definitions to track which action is executed (for MBT)
                if matches!(op.qualifier, OpQualifier::Action) {
                    let action_name = op.name.clone();
                    CompiledExpr::new(move |env| {
                        env.var_storage
                            .borrow_mut()
                            .track_action(action_name.clone());
                        base_expr.execute(env)
                    })
                } else {
                    base_expr
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
                        format!("Variable {name} not set").as_str(),
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
            cache @ (Cache::ForState | Cache::Forever) => {
                // Even for stateless expressions cached forever, we still want to
                // have it inside the closure for it to be only called in the
                // right setting (i.e. with constants properly set)

                let cached_value = Rc::new(RefCell::new(None));
                if cache == Cache::ForState {
                    // This definition may use variables, so we need to clear the cache when they change
                    self.var_storage
                        .borrow_mut()
                        .caches_to_clear
                        .push(cached_value.clone());
                }
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

        Value::lambda(registers, body)
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
                CompiledExpr::new(move |_| Ok(Value::int(value)))
            }

            QuintEx::QuintBool { id: _, value } => {
                let value = *value;
                CompiledExpr::new(move |_| Ok(Value::bool(value)))
            }

            QuintEx::QuintStr { id: _, value } => {
                let value = value.clone();
                CompiledExpr::new(move |_| Ok(Value::str(value.clone())))
            }

            QuintEx::QuintName { id, name } => {
                if let Some(def) = self.table.get(id).cloned() {
                    self.compile_def(&def)
                } else {
                    builtin_value(name.as_str())
                }
            }

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
                    let var_def = self.table.get(&args[0].id()).unwrap().clone();
                    self.compile_under_context(&var_def, |interpreter| {
                        interpreter.create_var(var_def.id(), var_def.name());
                        let register = interpreter.get_next_var(var_def.id());
                        let expr = interpreter.compile(&args[1]);

                        CompiledExpr::new(move |env| {
                            let value = expr.execute(env)?;
                            register.borrow_mut().value = Some(value.clone());
                            Ok(Value::bool(true))
                        })
                    })
                } else if opcode == "q::test" || opcode == "q::testOnce" {
                    self.compile_simulation(opcode, args)
                } else if LAZY_OPS.contains(&opcode.as_str()) {
                    // Lazy operator, compile the arguments and give their
                    // closures to the operator so it decides when to eval
                    let opcode = opcode.clone();

                    // Capture args for reference improvement in 'then' operator
                    let args_for_ref = args.clone();
                    CompiledExpr::new(move |env| {
                        let op = compile_lazy_op(&opcode);
                        op.execute(env, &compiled_args).map_err(|err| {
                            // Improve reference of `then`-related errors
                            if opcode == "then" && err.code == "QNT513" && err.reference.is_none() {
                                // Check if first arg is a nested 'then' call
                                if let QuintEx::QuintApp {
                                    opcode: inner_opcode,
                                    args: inner_args,
                                    ..
                                } = &args_for_ref[0]
                                {
                                    if inner_opcode == "then" && inner_args.len() >= 2 {
                                        return err.with_reference(inner_args[1].id());
                                    }
                                }
                                // Otherwise, point to the first argument
                                return err.with_reference(args_for_ref[0].id());
                            }
                            err
                        })
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
                // Check if this is a nondet expression with oneOf
                if opdef.qualifier == OpQualifier::Nondet {
                    // Check if this is specifically a oneOf application
                    if let QuintEx::QuintApp { opcode, args, .. } = &opdef.expr {
                        if opcode == "oneOf" && args.len() == 1 {
                            let set_expr = self.compile(&args[0]);
                            let cached_value = {
                                let cached = self
                                    .scoped_cached_values
                                    .entry(opdef.id)
                                    .or_insert_with(|| Rc::new(RefCell::new(None)));
                                Rc::clone(cached)
                            };
                            let body_expr = self.compile(expr);
                            let nondet_name = opdef.name.clone();

                            // Register the nondet pick name so it appears in the initial state
                            self.initial_nondet_picks.insert(nondet_name.clone());

                            return nondet::eval_nondet_one_of(
                                set_expr,
                                body_expr,
                                cached_value,
                                nondet_name,
                            );
                        }
                    }
                    // Fall through to regular nondet handling for other cases
                }

                // Regular let expression handling (including non-oneOf nondet expressions)
                {
                    let cached_value = {
                        let cached = self
                            .scoped_cached_values
                            .entry(opdef.id)
                            .or_insert_with(|| Rc::new(RefCell::new(None)));
                        Rc::clone(cached)
                    };
                    let compiled_expr = self.compile(expr);
                    CompiledExpr::new(move |env| {
                        let saved = cached_value.replace(None);
                        let result = compiled_expr.execute(env);
                        cached_value.replace(saved);
                        result
                    })
                }
            }
        }
    }

    pub fn compile_op(&mut self, id: &QuintId, op: &str) -> CompiledExprWithArgs {
        match self.table.get(id).cloned() {
            Some(def) => {
                // A user-defined operator
                let op = self.compile_def(&def);
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

    /// Compile a `q::test` or `q::testOnce` call into a simulation expression.
    fn compile_simulation(&mut self, opcode: &str, args: &[QuintEx]) -> CompiledExpr {
        let is_test_once = opcode == "q::testOnce";

        let (nruns_expr, nsteps_expr, ntraces_expr, init_ex, step_ex, inv_ex) = if is_test_once {
            // q::testOnce(nsteps, ntraces, init, step, inv)
            (
                None,
                &args[0],
                &args[1],
                args[2].clone(),
                args[3].clone(),
                args[4].clone(),
            )
        } else {
            // q::test(nruns, nsteps, ntraces, init, step, inv)
            (
                Some(&args[0]),
                &args[1],
                &args[2],
                args[3].clone(),
                args[4].clone(),
                args[5].clone(),
            )
        };

        let compiled_nruns = nruns_expr.map(|a| self.compile(a));
        let compiled_nsteps = self.compile(nsteps_expr);
        let compiled_ntraces = self.compile(ntraces_expr);

        let parsed = ParsedQuint {
            init: init_ex,
            step: step_ex,
            invariants: vec![inv_ex],
            witnesses: vec![],
            table: self.table.clone(),
        };

        CompiledExpr::new(move |env| {
            let nsteps = compiled_nsteps.execute(env)?.as_int() as usize;
            let ntraces = compiled_ntraces.execute(env)?.as_int() as usize;
            let nruns = match &compiled_nruns {
                Some(c) => c.execute(env)?.as_int() as usize,
                None => 1,
            };

            let seed = Some(env.rand.get_state());
            match parsed.simulate(
                SimulationConfig {
                    steps: nsteps,
                    samples: nruns,
                    n_traces: ntraces,
                    seed,
                    store_metadata: false,
                    verbosity: env.verbosity,
                },
                no_report(),
            ) {
                Ok(result) => {
                    env.trace = result
                        .best_traces
                        .into_iter()
                        .next()
                        .map(|t| t.states)
                        .unwrap_or_default();

                    // Extract diagnostics from the simulation trace states
                    for state in &env.trace {
                        env.diagnostics.extend(state.diagnostics.iter().cloned());
                    }

                    if result.result {
                        Ok(Value::str("ok".into()))
                    } else {
                        Ok(Value::str("violation".into()))
                    }
                }
                Err(sim_error) => {
                    // Extract diagnostics from the error trace states
                    for state in &sim_error.trace.states {
                        env.diagnostics.extend(state.diagnostics.iter().cloned());
                    }
                    env.trace = sim_error.trace.states;
                    Err(sim_error.error)
                }
            }
        })
    }

    /// Utility to compile and evaluate an expression
    pub fn eval(&mut self, env: &mut Env, expr: QuintEx) -> EvalResult {
        self.compile(&expr).execute(env)
    }
}

fn builtin_value(name: &str) -> CompiledExpr {
    match name {
        "true" => CompiledExpr::new(move |_| Ok(Value::bool(true))),
        "false" => CompiledExpr::new(move |_| Ok(Value::bool(false))),
        "Bool" => CompiledExpr::new(move |_| {
            Ok(Value::set(ImmutableSet::from(vec![
                Value::bool(true),
                Value::bool(false),
            ])))
        }),
        "Int" => CompiledExpr::new(move |_| Ok(Value::infinite_int())),
        "Nat" => CompiledExpr::new(move |_| Ok(Value::infinite_nat())),
        "q::lastTrace" => CompiledExpr::new(|env| {
            Ok(Value::list(
                env.trace.iter().map(|s| s.value.clone()).collect(),
            ))
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

/// Evaluate expressions in the context of a given state.
///
/// # Arguments
/// * `state` - The state as an ITF value (a record mapping variable names to values)
/// * `table` - The lookup table for name resolution
/// * `exprs` - The expressions to evaluate in that state
///
/// # Returns
/// A vector of evaluation results, one per expression
pub fn evaluate_at_state(
    state: itf::Value,
    table: &LookupTable,
    exprs: &[QuintEx],
) -> Vec<EvalResult> {
    let state_value = Value::from_itf(state);

    // Create the interpreter for evaluating the invariant expressions
    let mut interpreter = Interpreter::new(table.clone());
    let mut env = Env::new(interpreter.var_storage.clone(), Verbosity::default());

    // Compile the expressions
    let compiled_exprs: Vec<CompiledExpr> =
        exprs.iter().map(|expr| interpreter.compile(expr)).collect();

    let record_map = state_value.as_record_map();
    {
        let storage = interpreter.var_storage.borrow();
        for (_key, register) in storage.vars.iter() {
            let var_name = register.borrow().name.clone();

            if let Some(value) = record_map.get(&var_name) {
                register.borrow_mut().value = Some(value.clone());
            }
        }
    }

    // Evaluate each compiled expression in the context of the loaded state
    compiled_exprs
        .iter()
        .map(|compiled| compiled.execute(&mut env))
        .collect()
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
    let mut interpreter = Interpreter::new(table.clone());
    let mut env = Env::new(interpreter.var_storage.clone(), Verbosity::default());

    interpreter.eval(&mut env, expr.clone())
}
