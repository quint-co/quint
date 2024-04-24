/*
 * REPL for quint.
 *
 * Igor Konnov, Gabriela Moreira, 2022-2023.
 *
 * Copyright 2022-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import * as readline from 'readline'
import { Readable, Writable } from 'stream'
import { readFileSync, writeFileSync } from 'fs'
import { Maybe, just, none } from '@sweet-monads/maybe'
import { Either, left, right } from '@sweet-monads/either'
import chalk from 'chalk'
import { format } from './prettierimp'

import { FlatModule, QuintDef, QuintEx } from './ir/quintIr'
import {
  CompilationContext,
  CompilationState,
  compileDecls,
  compileExpr,
  compileFromCode,
  contextNameLookup,
  inputDefName,
  newCompilationState,
} from './runtime/compile'
import { createFinders, formatError } from './errorReporter'
import { Register } from './runtime/runtime'
import { TraceRecorder, newTraceRecorder } from './runtime/trace'
import { parseDefOrThrow, parseExpressionOrDeclaration } from './parsing/quintParserFrontend'
import { prettyQuintEx, printExecutionFrameRec, terminalWidth } from './graphics'
import { verbosity } from './verbosity'
import { Rng, newRng } from './rng'
import { version } from './version'
import { fileSourceResolver } from './parsing/sourceResolver'
import { cwd } from 'process'
import { newIdGenerator } from './idGenerator'
import { moduleToString } from './ir/IRprinting'
import { EvaluationState, newEvaluationState } from './runtime/impl/compilerImpl'
import { mkErrorMessage } from './cliCommands'
import { QuintError } from './quintError'
import { ErrorMessage } from './ErrorMessage'

// tunable settings
export const settings = {
  prompt: '>>> ',
  continuePrompt: '... ',
}

type writer = (_text: string) => void

/**
 * The internal state of the REPL.
 */
class ReplState {
  // the history of module definitions loaded from external sources
  moduleHist: string
  // expressions history (for saving and loading)
  exprHist: string[]
  // filename and module name that were loaded with .load filename module
  lastLoadedFileAndModule: [string?, string?]
  // The state of pre-compilation phases
  compilationState: CompilationState
  // The state of the compiler visitor
  evaluationState: EvaluationState

  constructor(verbosityLevel: number, rng: Rng) {
    this.moduleHist = ''
    this.exprHist = []
    this.lastLoadedFileAndModule = [undefined, undefined]
    this.compilationState = newCompilationState()
    this.evaluationState = newEvaluationState(newTraceRecorder(verbosityLevel, rng))
  }

  clone() {
    const copy = new ReplState(this.verbosity, newRng(this.rng.getState()))
    copy.moduleHist = this.moduleHist
    copy.exprHist = this.exprHist
    copy.lastLoadedFileAndModule = this.lastLoadedFileAndModule
    copy.compilationState = this.compilationState
    return copy
  }

  addReplModule() {
    const replModule: FlatModule = { name: '__repl__', declarations: simulatorBuiltins(this.compilationState), id: 0n }
    this.compilationState.modules.push(replModule)
    this.compilationState.originalModules.push(replModule)
    this.compilationState.mainName = '__repl__'
    this.moduleHist += moduleToString(replModule)
  }

  clear() {
    this.moduleHist = ''
    this.exprHist = []
    this.compilationState = newCompilationState()
    this.evaluationState = newEvaluationState(newTraceRecorder(this.verbosity, this.rng))
  }

  get recorder(): TraceRecorder {
    // ReplState always passes TraceRecorder in the evaluation state
    return this.evaluationState.listener as TraceRecorder
  }

  get rng(): Rng {
    return this.recorder.rng
  }

  get verbosity(): number {
    return this.recorder.verbosityLevel
  }

  set verbosity(level: number) {
    this.recorder.verbosityLevel = level
  }

  get seed(): bigint {
    return this.rng.getState()
  }

  set seed(newSeed: bigint) {
    this.rng.setState(newSeed)
  }
}

// The default exit terminates the process.
// Since it is inconvenient for testing, do not use it in tests :)
function defaultExit() {
  process.exit(0)
}

// Additional options that can be passed to REPL
export interface ReplOptions {
  preloadFilename?: string
  importModule?: string
  verbosity: number
}

// the entry point to the REPL
export function quintRepl(
  input: Readable,
  output: Writable,
  options: ReplOptions = {
    verbosity: verbosity.defaultLevel,
  },
  exit: () => void = defaultExit
) {
  // output a line of text, no line feed is introduced
  const out = (text: string) => output.write(text)
  const prompt = (text: string) => {
    return verbosity.hasReplPrompt(options.verbosity) ? text : ''
  }
  if (verbosity.hasReplBanners(options.verbosity)) {
    out(chalk.gray(`Quint REPL ${version}\n`))
    out(chalk.gray('Type ".exit" to exit, or ".help" for more information\n'))
  }
  // create a readline interface
  const rl = readline.createInterface({
    input,
    output,
    prompt: prompt(settings.prompt),
  })

  // the state
  const state: ReplState = new ReplState(options.verbosity, newRng())

  // we let the user type a multiline string, which is collected here:
  let multilineText = ''
  // when recyclingOwnOutput is true, REPL is receiving its older output
  let recyclingOwnOutput = false
  // when the number of open braces or parentheses is positive,
  // we enter the multiline mode
  let nOpenBraces = 0
  let nOpenParen = 0
  let nOpenComments = 0

  // Ctrl-C handler
  rl.on('SIGINT', () => {
    // if the user is stuck and presses Ctrl-C, reset the multiline mode
    multilineText = ''
    nOpenBraces = 0
    nOpenParen = 0
    nOpenComments = 0
    rl.setPrompt(prompt(settings.prompt))
    out(chalk.yellow(' <cancelled>\n'))
    // clear the line and show the prompt
    rl.write(null, { ctrl: true, name: 'u' })
    rl.prompt()
  })

  // next line handler
  function nextLine(line: string) {
    const [nob, nop, noc] = countBraces(line)
    nOpenBraces += nob
    nOpenParen += nop
    nOpenComments += noc

    if (multilineText === '') {
      // if the line starts with a non-empty prompt,
      // we assume it is multiline code that was copied from a REPL prompt
      recyclingOwnOutput = settings.prompt !== '' && line.trim().indexOf(settings.prompt) === 0
      if (nOpenBraces > 0 || nOpenParen > 0 || nOpenComments > 0 || recyclingOwnOutput) {
        // Enter a multiline mode.
        // If the text is copy-pasted from the REPL output,
        // trim the REPL decorations.
        multilineText = trimReplDecorations(line)
        rl.setPrompt(prompt(settings.continuePrompt))
      } else {
        if (line.trim() !== '') {
          tryEvalAndClearRecorder(out, state, line + '\n')
        }
      }
    } else {
      const trimmedLine = line.trim()
      const continueOwnOutput = settings.continuePrompt !== '' && trimmedLine.indexOf(settings.continuePrompt) === 0
      if (
        (trimmedLine.length === 0 && nOpenBraces <= 0 && nOpenParen <= 0 && nOpenComments <= 0) ||
        (recyclingOwnOutput && !continueOwnOutput)
      ) {
        // End the multiline mode.
        // If recycle own output, then the current line is, most likely,
        // older input. Ignore it.
        tryEvalAndClearRecorder(out, state, multilineText)
        multilineText = ''
        recyclingOwnOutput = false
        rl.setPrompt(prompt(settings.prompt))
      } else {
        // Continue the multiline mode.
        // It may happen that the text is copy-pasted from the REPL output.
        // In this case, we have to trim the leading '... '.
        multilineText += '\n' + trimReplDecorations(trimmedLine)
      }
    }
  }

  // load the code from a filename and optionally import a module
  function load(filename: string, moduleName: string | undefined) {
    state.clear()

    const newState = loadFromFile(out, state, filename)
    if (!newState) {
      return state
    }

    state.lastLoadedFileAndModule[0] = filename

    const moduleNameToLoad = moduleName ?? getMainModuleAnnotation(newState.moduleHist) ?? '__repl__'
    if (moduleNameToLoad === '__repl__') {
      // No module to load, introduce the __repl__ module
      newState.addReplModule()
    }

    if (tryEvalModule(out, newState, moduleNameToLoad)) {
      state.lastLoadedFileAndModule[1] = moduleNameToLoad
    } else {
      out(chalk.yellow('Pick the right module name and import it (the file has been loaded)\n'))
      return newState
    }

    if (newState.exprHist) {
      newState.exprHist.forEach(expr => {
        tryEvalAndClearRecorder(out, newState, expr)
      })
    }

    state.moduleHist = newState.moduleHist
    state.exprHist = newState.exprHist
    state.compilationState = newState.compilationState
    state.evaluationState = newState.evaluationState
  }

  // the read-eval-print loop
  rl.on('line', line => {
    const r = (s: string): string => {
      return chalk.red(s)
    }
    const g = (s: string): string => {
      return chalk.gray(s)
    }
    if (!line.startsWith('.')) {
      // an input to evaluate
      nextLine(line)
    } else {
      // a special command to REPL, extract the command name
      const m = line.match(/^\s*\.(\w+)/)
      if (m === null) {
        out(r(`Unexpected command: ${line}\n`))
        out(g(`Type .help to see the list of commands\n`))
      } else {
        switch (m[1]) {
          case 'help':
            out(`${r('.clear')}\tClear the history\n`)
            out(`${r('.exit')}\tExit the REPL\n`)
            out(`${r('.help')}\tPrint this help message\n`)
            out(`${r('.load')} <filename> ${g('[<module>]')}\tClear the history,\n`)
            out('     \tload the code from a file into the REPL session\n')
            out('     \tand optionally import all definitions from <module>\n')
            out(`${r('.reload')}\tClear the history, load and (optionally) import the last loaded file.\n`)
            out('     \t^ a productivity hack\n')
            out(`${r('.save')} <filename>\tSave the accumulated definitions to a file\n`)
            out(`${r('.verbosity')}=[0-5]\tSet the output level (0 = quiet, 5 = very detailed).\n`)
            out(`${r('.seed')}[=<number>]\tSet or get the random seed.\n`)
            out('\nType an expression and press Enter to evaluate it.\n')
            out('When the REPL switches to multiline mode "...", finish it with an empty line.\n')
            out('\nPress Ctrl+C to abort current expression, Ctrl+D to exit the REPL\n')
            break

          case 'exit':
            exit()
            break

          case 'clear':
            out('\n') // be nice to external programs
            state.clear()
            break

          case 'load':
            {
              const args = line.trim().split(/\s+/)
              const [filename, moduleName] = [args[1], args[2]]
              if (!filename) {
                out(r('.load requires a filename\n'))
              } else {
                load(filename, moduleName)
              }
              rl.prompt()
            }
            break

          case 'reload':
            if (state.lastLoadedFileAndModule[0] !== undefined) {
              load(state.lastLoadedFileAndModule[0], state.lastLoadedFileAndModule[1])
            } else {
              out(r('Nothing to reload. Use: .load filename [moduleName].\n'))
            }
            break

          case 'save':
            {
              const args = line.trim().split(/\s+/)
              if (!args[1]) {
                out(r('.save requires a filename\n'))
              } else {
                saveToFile(out, state, args[1])
              }
              rl.prompt()
            }
            break

          case 'verbosity':
            {
              // similar to yargs, accept: .verbosity n, .verbosity=n, .verbosity = n
              const m = line.match(/^\.verbosity\s*=?\s*([0-5])$/)
              if (m === null) {
                out(r('.verbosity requires a level from 0 to 5\n'))
              } else {
                state.verbosity = Number(m[1])
                if (verbosity.hasReplPrompt(state.verbosity)) {
                  out(g(`.verbosity=${state.verbosity}\n`))
                }
                rl.setPrompt(prompt(settings.prompt))
              }
            }
            break

          case 'seed':
            {
              // accept: .seed n, .seed=n, .seed = n
              const m = line.match(/^\.seed\s*=?\s*((0x[0-9a-f]+|[0-9]*))$/)
              if (m === null) {
                out(r('.seed requires an integer, or no argument\n'))
              } else {
                if (m[1].trim() === '') {
                  out(g(`.seed=${state.seed}\n`))
                } else {
                  state.seed = BigInt(m[1])
                  if (verbosity.hasReplPrompt(state.verbosity)) {
                    out(g(`.seed=${state.seed}\n`))
                  }
                }
              }
            }
            break

          default:
            out(r(`Unexpected command: ${line}\n`))
            out(g(`Type .help to see the list of commands\n`))
            break
        }
      }
    }
    rl.prompt()
  }).on('close', () => {
    out('\n')
    exit()
  })

  // Everything is registered. Optionally, load a module.
  if (options.preloadFilename) {
    load(options.preloadFilename, options.importModule)
  }

  rl.prompt()

  return rl
}

function saveToFile(out: writer, state: ReplState, filename: string) {
  // 1. Write the previously loaded modules.
  // 2. Write the definitions in the special module called __repl__.
  // 3. Wrap expressions into special comments.
  try {
    const text =
      `// @mainModule ${state.lastLoadedFileAndModule[1]}\n` +
      `${state.moduleHist}` +
      state.exprHist.map(s => `/*! ${s} !*/\n`).join('\n')

    writeFileSync(filename, text)
    out(`Session saved to: ${filename}\n`)
  } catch (error) {
    out(chalk.red(error))
    out('\n')
  }
}

function loadFromFile(out: writer, state: ReplState, filename: string): ReplState | undefined {
  try {
    const modules = readFileSync(filename, 'utf8')
    const newState: ReplState = state.clone()
    newState.moduleHist = modules + newState.moduleHist

    // unwrap the expressions from the specially crafted comments
    const exprs = Array.from((modules ?? '').matchAll(/\/\*! (.*?) !\*\//gms) ?? []).map(groups => groups[1])
    // and replay them one by one

    newState.exprHist = exprs

    return newState
  } catch (error) {
    out(chalk.red(error))
    out('\n')
    return
  }
}

/**
 * Moves the nextvars register values into the vars, and clears the nextvars.
 * Returns an array of variable names that were not updated.
 * @param vars An array of Register objects representing the current state of the variables.
 * @param nextvars An array of Register objects representing the next state of the variables.
 * @returns An array of variable names that were not updated, or none if all variables were updated.
 */
function saveVars(vars: Register[], nextvars: Register[]): Maybe<string[]> {
  let isAction = false

  const nonUpdated = vars.reduce((acc, varRegister) => {
    const nextVarRegister = nextvars.find(v => v.name === varRegister.name)
    if (nextVarRegister && nextVarRegister.registerValue.isJust()) {
      varRegister.registerValue = nextVarRegister.registerValue
      nextVarRegister.registerValue = none()
      isAction = true
    } else {
      // No nextvar for this variable, so it was not updated
      acc.push(varRegister.name)
    }

    return acc
  }, [] as string[])

  if (isAction) {
    // return the names of the variables that have not been updated
    return just(nonUpdated)
  } else {
    return none()
  }
}

// Declarations that are overloaded by the simulator.
// In the future, we will declare them in a separate module.
function simulatorBuiltins(st: CompilationState): QuintDef[] {
  return [
    parseDefOrThrow(`def q::test = (q::nruns, q::nsteps, q::init, q::next, q::inv) => false`, st.idGen, st.sourceMap),
    parseDefOrThrow(`def q::testOnce = (q::nsteps, q::init, q::next, q::inv) => false`, st.idGen, st.sourceMap),
  ]
}

function tryEvalModule(out: writer, state: ReplState, mainName: string): boolean {
  const modulesText = state.moduleHist
  const mainPath = fileSourceResolver(state.compilationState.sourceCode).lookupPath(cwd(), 'repl.ts')
  state.compilationState.sourceCode.set(mainPath.toSourceName(), modulesText)

  const context = compileFromCode(
    newIdGenerator(),
    modulesText,
    mainName,
    mainPath,
    state.evaluationState.listener,
    state.rng.next,
    false
  )
  if (
    context.evaluationState?.context.size === 0 ||
    context.compileErrors.length > 0 ||
    context.syntaxErrors.length > 0
  ) {
    const tempState = state.clone()
    // The compilation state has updated source code maps, to be used in error reporting
    tempState.compilationState = context.compilationState
    printErrors(out, tempState, context)
    return false
  }

  if (context.analysisErrors.length > 0) {
    printErrors(out, state, context)
    // provisionally, continue on type & effects errors
  }

  // Save compilation state
  state.compilationState = context.compilationState
  state.evaluationState = context.evaluationState

  return true
}

// Try to evaluate the expression in a string and print it, if successful.
// After that, clear the recorded stack.
function tryEvalAndClearRecorder(out: writer, state: ReplState, newInput: string): boolean {
  const result = tryEval(out, state, newInput)
  state.recorder.clear()
  return result
}

// try to evaluate the expression in a string and print it, if successful
function tryEval(out: writer, state: ReplState, newInput: string): boolean {
  if (state.compilationState.modules.length === 0) {
    state.addReplModule()
    tryEvalModule(out, state, '__repl__')
  }

  const parseResult = parseExpressionOrDeclaration(
    newInput,
    '<input>',
    state.compilationState.idGen,
    state.compilationState.sourceMap
  )
  if (parseResult.kind === 'error') {
    printErrorMessages(out, state, 'syntax error', newInput, parseResult.errors)
    out('\n') // be nice to external programs
    return false
  }
  if (parseResult.kind === 'none') {
    // a comment or whitespaces
    return true
  }
  // evaluate the input, depending on its type
  if (parseResult.kind === 'expr') {
    const context = compileExpr(state.compilationState, state.evaluationState, state.rng, false, parseResult.expr)

    if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0 || context.analysisErrors.length > 0) {
      printErrors(out, state, context, newInput)
      if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0) {
        return false
      } // else: provisionally, continue on type & effects errors
    }

    state.exprHist.push(newInput.trim())
    // Save the evaluation state only, as state vars changes should persist
    state.evaluationState = context.evaluationState

    return evalExpr(state, out)
      .mapLeft(msg => {
        // when #618 is implemented, we should remove this
        printErrorMessages(out, state, 'runtime error', newInput, context.getRuntimeErrors())
        // print the error message produced by the lookup
        out(chalk.red(msg))
        out('\n') // be nice to external programs
      })
      .isRight()
  }
  if (parseResult.kind === 'declaration') {
    // compile the module and add it to history if everything worked
    const context = compileDecls(state.compilationState, state.evaluationState, state.rng, false, parseResult.decls)

    if (
      context.evaluationState.context.size === 0 ||
      context.compileErrors.length > 0 ||
      context.syntaxErrors.length > 0
    ) {
      printErrors(out, state, context, newInput)
      return false
    }

    if (context.analysisErrors.length > 0) {
      printErrors(out, state, context, newInput)
      // provisionally, continue on type & effects errors
    }

    out('\n') // be nice to external programs
    state.moduleHist = state.moduleHist.slice(0, state.moduleHist.length - 1) + newInput + '\n}' // update the history

    // Save compilation state
    state.compilationState = context.compilationState
    state.evaluationState = context.evaluationState
  }

  return true
}

// output errors to the console in red
function printErrors(out: writer, state: ReplState, context: CompilationContext, newInput: string = '') {
  printErrorMessages(out, state, 'syntax error', newInput, context.syntaxErrors)
  printErrorMessages(out, state, 'static analysis error', newInput, context.analysisErrors, chalk.yellow)
  printErrorMessages(out, state, 'compile error', newInput, context.compileErrors)
  out('\n') // be nice to external programs
}

// print error messages with proper colors
function printErrorMessages(
  out: writer,
  state: ReplState,
  kind: string,
  inputText: string,
  errors: QuintError[],
  color: (_text: string) => string = chalk.red
) {
  const modulesText = state.moduleHist + inputText
  const messages = errors.map(mkErrorMessage(state.compilationState.sourceMap))
  // display the error messages and highlight the error places
  // FIXME(#1052): moudulesText can come from multiple files, but `compileFromCode` ignores that.
  // We use a fallback here to '<modules>'
  const sourceCode = new Map([
    ['<input>', inputText],
    ['<modules>', modulesText],
    ...state.compilationState.sourceCode.entries(),
  ])
  const finders = createFinders(sourceCode)

  messages.forEach(e => {
    const error: ErrorMessage = {
      ...e,
      locs: e.locs.map(loc => ({ ...loc, source: finders.has(loc.source) ? loc.source : '<modules>' })),
    }
    const msg = formatError(sourceCode, finders, error, none())
    out(color(`${kind}: ${msg}\n`))
  })
}

// if a line start with '>>> ' or '... ', trim these markers
function trimReplDecorations(line: string) {
  // we are not using settings.prompt and settings.continuePrompt,
  // as ... are interpreted as three characters.
  const match = /^\s*(>>> |\.\.\. )(.*)/.exec(line)
  if (match && match[2] !== undefined) {
    return match[2]
  } else {
    return line
  }
}

// count the difference between the number of:
//  - '{' and '}'
//  - '(' and ')'
//  - '/*' and '*/'
function countBraces(str: string): [number, number, number] {
  let nOpenBraces = 0
  let nOpenParen = 0
  let nOpenComments = 0
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '{':
        nOpenBraces++
        break

      case '}':
        nOpenBraces--
        break

      case '(':
        nOpenParen++
        break

      case ')':
        nOpenParen--
        break

      case '/':
        if (i + 1 < str.length && str[i + 1] === '*') {
          nOpenComments++
          i++
        }
        break

      case '*':
        if (i + 1 < str.length && str[i + 1] === '/') {
          nOpenComments--
          i++
        }
        break

      default:
    }
  }

  return [nOpenBraces, nOpenParen, nOpenComments]
}

function evalExpr(state: ReplState, out: writer): Either<string, QuintEx> {
  const computable = contextNameLookup(state.evaluationState.context, inputDefName, 'callable')
  const columns = terminalWidth()
  const result = computable
    .mapRight(comp => {
      return comp
        .eval()
        .map(value => {
          const ex = value.toQuintEx(state.compilationState.idGen)
          out(format(columns, 0, prettyQuintEx(ex)))
          out('\n')

          if (ex.kind === 'bool' && ex.value) {
            // A Boolean expression may be an action or a run.
            // Save the state, if there were any updates to variables.
            saveVars(state.evaluationState.vars, state.evaluationState.nextVars).map(missing => {
              if (missing.length > 0) {
                out(chalk.yellow('[warning] some variables are undefined: ' + missing.join(', ') + '\n'))
              }
            })
          }
          return right<string, QuintEx>(ex)
        })
        .or(just(left<string, QuintEx>('<undefined value>')))
        .unwrap()
    })
    .join()

  if (verbosity.hasUserOpTracking(state.verbosity)) {
    const trace = state.recorder.getBestTrace()
    if (trace.subframes.length > 0) {
      out('\n')
      trace.subframes.forEach((f, i) => {
        out(`[Frame ${i}]\n`)
        printExecutionFrameRec({ width: columns, out }, f, [])
        out('\n')
      })
    }
  }

  return result
}

function getMainModuleAnnotation(moduleHist: string): string | undefined {
  const moduleName = moduleHist.match(/^\/\/ @mainModule\s+(\w+)\n/)
  return moduleName?.at(1)
}
