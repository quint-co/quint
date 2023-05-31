/*
 * REPL for quint.
 *
 * Igor Konnov, 2022-2023.
 *
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import * as readline from 'readline'
import { Readable, Writable } from 'stream'
import { readFileSync, writeFileSync } from 'fs'
import { cwd } from 'process'
import lineColumn from 'line-column'
import { Maybe, just, none } from '@sweet-monads/maybe'
import { left, right } from '@sweet-monads/either'
import chalk from 'chalk'
import { format } from './prettierimp'

import { QuintEx } from './quintIr'
import { CompilationContext, CompilationState, compile, compileExpr, contextNameLookup, errorContextFromMessage, lastTraceName } from './runtime/compile'
import { formatError } from './errorReporter'
import { ComputableKind, EvalResult, Register, kindName } from './runtime/runtime'
import { TraceRecorder, newTraceRecorder, noExecutionListener } from './runtime/trace'
import { ErrorMessage, parse, parseExpressionOrUnit } from './quintParserFrontend'
import { newIdGenerator } from './idGenerator'
import { prettyQuintEx, printExecutionFrameRec, terminalWidth } from './graphics'
import { verbosity } from './verbosity'
import { newRng } from './rng'
import { version } from './version'
import { fileSourceResolver } from './sourceResolver'
import { analyzeModules } from './quintAnalyzer'
import { flattenModules } from './flattening'

// tunable settings
export const settings = {
  prompt: '>>> ',
  continuePrompt: '... ',
}

type writer = (_text: string) => void

// the internal state of the REPL
interface ReplState {
  // the history of module definitions loaded from external sources
  moduleHist: string
  // definitions history
  defsHist: string
  // expressions history (for saving and loading)
  exprHist: string[]
  // state variables
  vars: Map<string, EvalResult>
  // variables internal to the simulator and REPL
  shadowVars: Map<string, EvalResult>
  // filename and module name that were loaded with .load filename module
  lastLoadedFileAndModule: [string?, string?]
  // an optional seed to use when making non-deterministic choices
  seed?: bigint
  // verbosity level
  verbosityLevel: number
  compilationState: CompilationState
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

function newCompilationState(): CompilationState {
  return {
    idGen: newIdGenerator(),
    modules: [],
    sourceMap: new Map(),
  }
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
  const state: ReplState = {
    moduleHist: '',
    defsHist: '',
    exprHist: [],
    vars: new Map<string, EvalResult>(),
    shadowVars: new Map<string, EvalResult>(),
    lastLoadedFileAndModule: [undefined, undefined],
    verbosityLevel: options.verbosity,
    compilationState: newCompilationState(),
  }
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
        line.trim() === '' || tryEval(out, state, line + '\n')
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
        tryEval(out, state, multilineText)
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

  function clearHistory() {
    state.moduleHist = ''
    state.defsHist = ''
    state.exprHist = []
  }

  // load the code from a filename and optionally import a module
  function load(filename: string, moduleName: string | undefined) {
    clearHistory()
    if (loadFromFile(out, state, filename)) {
      state.lastLoadedFileAndModule[0] = filename
      if (moduleName !== undefined) {
        if (tryEval(out, state, `import ${moduleName}.*`)) {
          state.lastLoadedFileAndModule[1] = moduleName
        } else {
          out(chalk.yellow('Pick the right module name and import it (the file has been loaded)\n'))
        }
      }
    }
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
            clearHistory()
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
                state.verbosityLevel = Number(m[1])
                if (verbosity.hasReplPrompt(state.verbosityLevel)) {
                  out(g(`.verbosity=${state.verbosityLevel}\n`))
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
                  if (verbosity.hasReplPrompt(state.verbosityLevel)) {
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

// private definitions
const replBegin = 'module __repl__ {'
const replEnd = '} //-- __repl__'

function saveToFile(out: writer, state: ReplState, filename: string) {
  // 1. Write the previously loaded modules.
  // 2. Write the definitions in the special module called __repl__.
  // 3. Wrap expressions into special comments.
  try {
    const text =
      `${state.moduleHist}
${replBegin}
${state.defsHist}
${replEnd}\n` + state.exprHist.map(s => `/*! ${s} !*/\n`).join('\n')
    writeFileSync(filename, text)
    out(`Session saved to: ${filename}\n`)
  } catch (error) {
    out(chalk.red(error))
    out('\n')
  }
}

function loadFromFile(out: writer, state: ReplState, filename: string): boolean {
  try {
    const data = readFileSync(filename, 'utf8')
    const newState = { ...state }
    const modulesAndRepl = data.split(replBegin)
    // whether an error occurred at some step
    let isError = false
    newState.moduleHist = modulesAndRepl[0]
    if (modulesAndRepl.length > 1) {
      // found a REPL session
      const defsAndExprs = modulesAndRepl[1].split(replEnd)

      // save the definition history
      newState.defsHist = defsAndExprs[0]
      if (defsAndExprs.length > 1) {
        // unwrap the expressions from the specially crafted comments
        const exprs = (defsAndExprs[1] ?? '').matchAll(/\/\*! (.*?) !\*\//gms) ?? []
        // and replay them one by one
        // TODO: every call to tryEval makes a full cycle
        // from the parser to the compiler. Make this incremental!
        // https://github.com/informalsystems/quint/issues/618
        for (const groups of exprs) {
          if (!tryEval(out, newState, groups[1])) {
            isError = true
            break
          }
        }
      }
    }

    if (!isError && newState.exprHist.length === 0) {
      // FIXME: This will not work with incremental compilation.
      // nothing was replayed, evaluate 'true', to trigger compilation
      isError = !tryEval(out, newState, '')
      if (!isError) {
        // remove 'true' from the expression history
        newState.exprHist.pop()
      }
    }
    if (!isError) {
      state.moduleHist = newState.moduleHist
      state.defsHist = newState.defsHist
      state.exprHist = newState.exprHist
    }
    return !isError
  } catch (error) {
    out(chalk.red(error))
    out('\n')
    return false
  }
}

function evalAndSaveRegisters(
  kind: ComputableKind,
  names: string[],
  context: CompilationContext,
  targetMap: Map<string, EvalResult>
) {
  targetMap.clear()
  for (const v of names) {
    const computable = context.values.get(kindName(kind, v))
    if (computable) {
      computable.eval().map(result => {
        targetMap.set(v, result)
      })
    }
  }
}

function saveVars(state: ReplState, context: CompilationContext): Maybe<string[]> {
  function isNextSet(name: string) {
    const register = context.values.get(kindName('nextvar', name)) as Register
    if (register) {
      return register.registerValue.isJust()
    } else {
      return false
    }
  }
  const isAction = [...context.vars].some(name => isNextSet(name))
  if (isAction) {
    evalAndSaveRegisters('nextvar', context.vars, context, state.vars)

    // return the names of the variables that have not been updated
    return just([...context.vars].filter(name => !isNextSet(name)))
  } else {
    return none()
  }
}

function saveShadowVars(state: ReplState, context: CompilationContext): void {
  evalAndSaveRegisters('shadow', context.shadowVars, context, state.shadowVars)
}

function loadRegisters(kind: ComputableKind, vars: Map<string, EvalResult>, context: CompilationContext): void {
  vars.forEach((value, name) => {
    const register = context.values.get(kindName(kind, name)) as Register
    if (register) {
      register.registerValue = just(value)
    }
  })
}

function loadVars(state: ReplState, context: CompilationContext): void {
  loadRegisters('var', state.vars, context)
}

function loadShadowVars(state: ReplState, context: CompilationContext): void {
  loadRegisters('shadow', state.shadowVars, context)
}

// Declarations that are overloaded by the simulator.
// In the future, we will declare them in a separate module.
const simulatorBuiltins = `val ${lastTraceName} = [];
def q::test(q::nruns, q::nsteps, q::init, q::next, q::inv) = false;
def q::testOnce(q::nsteps, q::init, q::next, q::inv) = false;
`

// try to evaluate the expression in a string and print it, if successful
function tryEval(out: writer, state: ReplState, newInput: string): boolean {
  const start = new Date().getTime();
  console.log(newInput)
  // output errors to the console in red
  function printErrors(moduleText: string, context: CompilationContext) {
    printErrorMessages(out, 'syntax error', moduleText, context.syntaxErrors)
    printErrorMessages(out, 'static analysis error', moduleText, context.analysisErrors, chalk.yellow)
    printErrorMessages(out, 'compile error', moduleText, context.compileErrors)
    out('\n') // be nice to external programs
  }

  const parseResult = parseExpressionOrUnit(newInput, '<input>', state.compilationState.idGen, state.compilationState.sourceMap)
  if (parseResult.kind === 'error') {
    printErrorMessages(out, 'syntax error', newInput, parseResult.messages)
    out('\n') // be nice to external programs
    return false
  }
  if (parseResult.kind === 'none') {
    // a comment or whitespaces
    return true
  }
  // create a random number generator
  const rng = newRng(state.seed)
  // evaluate the input, depending on its type
  if (parseResult.kind === 'expr') {
    const recorder = newTraceRecorder(state.verbosityLevel, rng)
    const context = compileExpr(state.compilationState, rng, recorder, parseResult.expr)

    // Next line is just for backward compatibility, as I don't want to fix all
    // output formatting in this prototype. `moduleText` is only used for printing.
    const moduleText = ''

    if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0 || context.analysisErrors.length > 0) {
      printErrors(moduleText, context)
      if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0) {
        return false
      } // else: provisionally, continue on type & effects errors
    }

    state.exprHist.push(newInput.trim())
    state.seed = rng.getState()

    let elapsed = new Date().getTime() - start;
    console.log('Time taken for expr compilation: ' + elapsed + 'ms')

    return evalExpr(state, context, recorder, out)
  }
  if (parseResult.kind === 'toplevel') {
    // Compose the input to the parser.
    // TODO: REPL should work incrementally:
    // https://github.com/informalsystems/quint/issues/618
    // embed expression text into a module at the top level
    const moduleText = `${state.moduleHist}
module __repl__ { ${simulatorBuiltins}
${state.defsHist}
${newInput}
}`
    // compile the module and add it to history if everything worked
    const mainPath = fileSourceResolver().lookupPath(cwd(), 'repl.ts')

    // For toplevel definitions, we start from scratch. This should be made
    // incremental as well.
    state.compilationState = newCompilationState()
    const context = parse(state.compilationState.idGen, '<input>', mainPath, moduleText)
      // On errors, we'll produce the computational context up to this point
      .mapLeft(errorContextFromMessage)
      .map(
        parseData => {
          const { modules, table, sourceMap } = parseData
          const [analysisErrors, analysisOutput] = analyzeModules(table, modules)
          if (analysisErrors.length > 0) {
            console.log('Analysis errors')
          }
          const { flattenedModules, flattenedTable, flattenedAnalysis } = flattenModules(
            modules, table, state.compilationState.idGen, sourceMap, analysisOutput
          )
          const context = compile(flattenedModules, sourceMap, flattenedTable, flattenedAnalysis, '__repl__', noExecutionListener, rng.next)

          return context
        }).value

    if (context.values.size === 0 || context.compileErrors.length > 0 || context.syntaxErrors.length > 0) {
      printErrors(moduleText, context)
      return false
    } else {
      out('\n') // be nice to external programs
      state.defsHist = state.defsHist + '\n' + newInput // update the history

      // Save output to state
      state.compilationState.modules = context.flattenedModules!
      state.compilationState.sourceMap = context.sourceMap
      state.compilationState.analysisOutput = context.analysisOutput
    }

    if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0 || context.analysisErrors.length > 0) {
      printErrors(moduleText, context)
      if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0) {
        return false
      } // else: provisionally, continue on type & effects errors
    }
  }


  return true
}

// print error messages with proper colors
function printErrorMessages(
  out: writer,
  kind: string,
  text: string,
  messages: ErrorMessage[],
  color: (_text: string) => string = chalk.red
) {
  // display the error messages and highlight the error places
  const finder = lineColumn(text)
  messages.forEach(e => {
    const msg = formatError(text, finder, e, none())
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

function evalExpr(state: ReplState, context: CompilationContext, recorder: TraceRecorder, out: writer): boolean {
  loadVars(state, context)
  loadShadowVars(state, context)
  const computable = contextNameLookup(context, 'q::input', 'callable')
  const columns = terminalWidth()
  const result = computable
    .mapRight(comp => {
      return comp
        .eval()
        .map(value => {
          const ex = value.toQuintEx(state.compilationState.idGen)
          out(format(columns, 0, prettyQuintEx(ex)))
          out('\n')

          if (verbosity.hasUserOpTracking(state.verbosityLevel)) {
            const trace = recorder.getBestTrace()
            if (trace.subframes.length > 0) {
              out('\n')
              trace.subframes.forEach((f, i) => {
                out(`[Frame ${i}]\n`)
                printExecutionFrameRec({ width: columns, out }, f, [])
                out('\n')
              })
            }
          }

          if (ex.kind === 'bool' && ex.value) {
            // A Boolean expression may be an action or a run.
            // Save the state, if there were any updates to variables.
            saveVars(state, context).map(missing => {
              if (missing.length > 0) {
                out(chalk.yellow('[warning] some variables are undefined: ' + missing.join(', ') + '\n'))
              }
            })
          }
          // save shadow vars in any case, e.g., the example trace
          saveShadowVars(state, context)

          return right<string, QuintEx>(ex)
        })
        .or(just(left<string, QuintEx>('<undefined value>')))
        .unwrap()
    })
    .join()
    .mapLeft(msg => {
      // when #618 is implemented, we should remove this
      printErrorMessages(out, 'runtime error', '', context.getRuntimeErrors())
      // print the error message produced by the lookup
      out(chalk.red(msg))
      out('\n') // be nice to external programs
    })

  return result.isRight()
}
