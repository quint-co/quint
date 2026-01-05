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
import { none } from '@sweet-monads/maybe'
import chalk from 'chalk'
import { format } from './prettierimp'

import { FlatModule, QuintModule, isDef } from './ir/quintIr'
import { createFinders, formatError } from './errorReporter'
import { TraceRecorder, newTraceRecorder } from './runtime/trace'
import { SourceMap, parse, parseExpressionOrDeclaration } from './parsing/quintParserFrontend'
import { prettyQuintEx, printExecutionFrameRec, terminalWidth } from './graphics'
import { verbosity } from './verbosity'
import { Rng, newRng } from './rng'
import { version } from './version'
import { fileSourceResolver } from './parsing/sourceResolver'
import { cwd } from 'process'
import { IdGenerator, newIdGenerator } from './idGenerator'
import { moduleToString } from './ir/IRprinting'
import { mkErrorMessage } from './cliHelpers'
import { QuintError } from './quintError'
import { ErrorMessage } from './ErrorMessage'
import { Evaluator } from './runtime/impl/evaluator'
import { walkDeclaration, walkExpression } from './ir/IRVisitor'
import { AnalysisOutput, analyzeInc, analyzeModules } from './quintAnalyzer'
import { NameResolver } from './names/resolver'

// tunable settings
export const settings = {
  prompt: '>>> ',
  continuePrompt: '... ',
}

type writer = (_text: string) => void

/**
 * A data structure that holds the state of the compilation process.
 */
export interface CompilationState {
  // The ID generator used during compilation.
  idGen: IdGenerator
  // File content loaded for each source, used to report errors
  sourceCode: Map<string, string>
  // A list of modules in context
  modules: QuintModule[]
  // The name of the main module.
  mainName?: string
  // The source map for the compiled code.
  sourceMap: SourceMap
  // The output of the Quint analyzer.
  analysisOutput: AnalysisOutput
}

/* An empty initial compilation state */
export function newCompilationState(): CompilationState {
  return {
    idGen: newIdGenerator(),
    sourceCode: new Map(),
    modules: [],
    sourceMap: new Map(),
    analysisOutput: {
      types: new Map(),
      effects: new Map(),
      modes: new Map(),
    },
  }
}

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
  // The evaluator to be used
  evaluator: Evaluator
  // The name resolver to be used
  nameResolver: NameResolver
  // Counter for generating unique source names for each REPL input
  inputCounter: number

  constructor(verbosityLevel: number, rng: Rng) {
    const recorder = newTraceRecorder(verbosityLevel, rng)
    this.moduleHist = ''
    this.exprHist = []
    this.lastLoadedFileAndModule = [undefined, undefined]
    this.compilationState = newCompilationState()
    this.evaluator = new Evaluator(new Map(), recorder, rng)
    this.nameResolver = new NameResolver()
    this.inputCounter = 0
  }

  clone() {
    const copy = new ReplState(this.verbosity, newRng(this.rng.getState()))
    copy.moduleHist = this.moduleHist
    copy.exprHist = this.exprHist
    copy.lastLoadedFileAndModule = this.lastLoadedFileAndModule
    copy.compilationState = this.compilationState
    copy.inputCounter = this.inputCounter
    return copy
  }

  addReplModule() {
    const replModule: FlatModule = { name: '__repl__', declarations: [], id: 0n }
    this.compilationState.modules.push(replModule)
    this.compilationState.mainName = '__repl__'
    this.moduleHist += moduleToString(replModule)
  }

  clear() {
    const rng = newRng(this.rng.getState())
    const recorder = newTraceRecorder(this.verbosity, rng)

    this.moduleHist = ''
    this.exprHist = []
    this.compilationState = newCompilationState()
    this.evaluator = new Evaluator(new Map(), recorder, rng)
    this.nameResolver = new NameResolver()
    this.inputCounter = 0
  }

  get recorder(): TraceRecorder {
    // ReplState always passes TraceRecorder in the evaluation state
    return this.evaluator.recorder
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
  replInput?: string[]
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
      return
    }

    state.lastLoadedFileAndModule[0] = filename

    const moduleNameToLoad = moduleName ?? getMainModuleAnnotation(newState.moduleHist)
    if (!moduleNameToLoad) {
      // No module to load, introduce the __repl__ module
      newState.addReplModule()
    }

    if (tryEvalModule(out, newState, moduleNameToLoad ?? '__repl__')) {
      state.lastLoadedFileAndModule[1] = moduleNameToLoad
    } else {
      out(chalk.yellow('Pick the right module name and import it (the file has been loaded)\n'))
      return
    }

    if (newState.exprHist) {
      const exprHist = newState.exprHist
      newState.exprHist = []
      if (exprHist.length > 0) {
        replayExprHistory(newState, filename, exprHist)
      }
    }

    state.moduleHist = newState.moduleHist
    state.exprHist = newState.exprHist
    state.compilationState = newState.compilationState
    state.evaluator = newState.evaluator
    state.nameResolver = newState.nameResolver
  }

  function replayExprHistory(state: ReplState, filename: string, exprHist: string[]) {
    if (verbosity.hasReplBanners(options.verbosity)) {
      out(chalk.gray(`Evaluating expression history in ${filename}\n`))
    }
    exprHist.forEach(expr => {
      if (verbosity.hasReplPrompt(options.verbosity)) {
        out(settings.prompt)
        out(expr.replaceAll('\n', `\n${settings.continuePrompt}`))
        out('\n')
      }
      tryEvalAndClearRecorder(out, state, expr)
    })
  }

  function consumeLine(line: string) {
    const r = (s: string): string => {
      return chalk.red(s)
    }
    const g = (s: string): string => {
      return chalk.gray(s)
    }
    // The continue prompt is handled by `nextLine` as the input may be acopy
    // and paste from the reply itself.
    if (!line.startsWith('.') || line.startsWith(settings.continuePrompt)) {
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
  }

  // the read-eval-print loop
  rl.on('line', line => {
    consumeLine(line)
    rl.prompt()
  }).on('close', () => {
    out('\n')
    exit()
  })

  // Everything is registered. Optionally, load a module.
  if (options.preloadFilename) {
    load(options.preloadFilename, options.importModule)
  }

  // Evaluate the repl's command input before starting the interactive loop
  if (options.replInput && options.replInput.length > 0) {
    out(prompt(settings.prompt))
    options.replInput.forEach(input =>
      input.split('\n').forEach(part => {
        const line = `${part}\n` // put \n back in
        out(prompt(line))
        consumeLine(line)
        out(prompt(rl.getPrompt()))
      })
    )
  }

  rl.prompt()
  return rl
}

function saveToFile(out: writer, state: ReplState, filename: string) {
  // 1. Write the previously loaded modules.
  // 2. Write the definitions in the loaded module (or in __repl__ if no module was loaded).
  // 3. Wrap expressions into special comments.
  try {
    const mainModuleAnnotation = state.moduleHist.startsWith('// @mainModule')
      ? ''
      : `// @mainModule ${state.lastLoadedFileAndModule[1] ?? '__repl__'}\n`

    const text = mainModuleAnnotation + `${state.moduleHist}` + state.exprHist.map(s => `/*! ${s} !*/\n`).join('\n')

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

function tryEvalModule(out: writer, state: ReplState, mainName: string): boolean {
  const modulesText = state.moduleHist
  const mainPath = fileSourceResolver(state.compilationState.sourceCode).lookupPath(cwd(), 'repl.ts')
  state.compilationState.sourceCode.set(mainPath.toSourceName(), modulesText)

  // FIXME(#1052): We should build a proper sourceCode map from the files we previously loaded
  const sourceCode: Map<string, string> = new Map()
  const idGen = newIdGenerator()
  const { modules, table, resolver, sourceMap, errors } = parse(
    idGen,
    mainPath.toSourceName(),
    mainPath,
    modulesText,
    sourceCode
  )
  // On errors, we'll produce the computational context up to this point
  const [analysisErrors, analysisOutput] = analyzeModules(table, modules)

  state.compilationState = { idGen, sourceCode, modules, sourceMap, analysisOutput }

  if (errors.length > 0 || analysisErrors.length > 0) {
    printErrorMessages(out, state, 'syntax error', errors)
    printErrorMessages(out, state, 'static analysis error', analysisErrors)
    return false
  }

  resolver.switchToModule(mainName)
  state.nameResolver = resolver

  state.evaluator.updateTable(table)

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
  const columns = terminalWidth()

  if (state.compilationState.modules.length === 0) {
    state.addReplModule()
    tryEvalModule(out, state, '__repl__')
  }

  // Generate a unique source name for this input to avoid line number conflicts in the source map
  const inputSource = `<input-${state.inputCounter}>`
  state.compilationState.sourceCode.set(inputSource, newInput)
  state.inputCounter++

  const parseResult = parseExpressionOrDeclaration(
    newInput,
    inputSource,
    state.compilationState.idGen,
    state.compilationState.sourceMap
  )
  if (parseResult.kind === 'error') {
    printErrorMessages(out, state, 'syntax error', parseResult.errors)
    out('\n') // be nice to external programs
    return false
  }
  if (parseResult.kind === 'none') {
    // a comment or whitespaces
    return true
  }
  // evaluate the input, depending on its type
  if (parseResult.kind === 'expr') {
    walkExpression(state.nameResolver, parseResult.expr)
    if (state.nameResolver.errors.length > 0) {
      printErrorMessages(out, state, 'static analysis error', state.nameResolver.errors)
      state.nameResolver.errors = []
      return false
    }
    state.evaluator.updateTable(state.nameResolver.table)

    const [analysisErrors, _analysisOutput] = analyzeInc(
      state.compilationState.analysisOutput,
      state.nameResolver.table,
      [
        {
          kind: 'def',
          qualifier: 'action',
          name: 'q::input',
          expr: parseResult.expr,
          id: state.compilationState.idGen.nextId(),
        },
      ]
    )

    if (analysisErrors.length > 0) {
      printErrorMessages(out, state, 'static analysis error', analysisErrors)
      return false
    }

    state.exprHist.push(newInput.trim())
    const evalResult = state.evaluator.evaluate(parseResult.expr)

    evalResult.map(ex => {
      out(format(columns, 0, prettyQuintEx(ex)))
      out('\n')

      if (ex.kind === 'bool' && ex.value) {
        // A Boolean expression may be an action or a run.
        // Save the state, if there were any updates to variables.
        const [shifted, missing] = state.evaluator.shiftAndCheck()
        if (shifted && verbosity.hasDiffs(state.verbosity)) {
          console.log(state.evaluator.trace.renderDiff(terminalWidth(), { collapseThreshold: 2 }))
        }
        if (missing.length > 0) {
          out(chalk.yellow('[warning] some variables are undefined: ' + missing.join(', ') + '\n'))
        }
      }
      return ex
    })

    if (verbosity.hasUserOpTracking(state.verbosity)) {
      const trace = state.recorder.currentFrame
      if (trace.subframes.length > 0) {
        out('\n')
        trace.subframes.forEach((f, i) => {
          out(`[Frame ${i}]\n`)
          printExecutionFrameRec({ width: columns, out }, f, [])
          out('\n')
        })
      }
    }

    if (evalResult.isLeft()) {
      printErrorMessages(out, state, 'runtime error', [evalResult.value])
      return false
    }

    return true
  }
  if (parseResult.kind === 'declaration') {
    parseResult.decls.forEach(decl => {
      walkDeclaration(state.nameResolver.collector, decl)
      walkDeclaration(state.nameResolver, decl)
    })
    if (state.nameResolver.errors.length > 0) {
      printErrorMessages(out, state, 'static analysis error', state.nameResolver.errors)
      out('\n')

      parseResult.decls.forEach(decl => {
        if (isDef(decl)) {
          state.nameResolver.collector.deleteDefinition(decl.name)
        }
      })

      state.nameResolver.errors = []
      return false
    }

    const [analysisErrors, analysisOutput] = analyzeInc(
      state.compilationState.analysisOutput,
      state.nameResolver.table,
      parseResult.decls
    )

    if (analysisErrors.length > 0) {
      printErrorMessages(out, state, 'static analysis error', analysisErrors)
      parseResult.decls.forEach(decl => {
        if (isDef(decl)) {
          state.nameResolver.collector.deleteDefinition(decl.name)
          state.compilationState.analysisOutput.effects.delete(decl.id)
          state.compilationState.analysisOutput.modes.delete(decl.id)
        }
      })

      return false
    }

    state.compilationState.analysisOutput = analysisOutput
    state.moduleHist = state.moduleHist.slice(0, state.moduleHist.length - 1) + newInput + '\n}' // update the history

    out('\n')
  }

  return true
}

// print error messages with proper colors
function printErrorMessages(
  out: writer,
  state: ReplState,
  kind: string,
  errors: QuintError[],
  color: (_text: string) => string = chalk.red
) {
  const modulesText = state.moduleHist
  const messages = errors.map(mkErrorMessage(state.compilationState.sourceMap))
  // display the error messages and highlight the error places
  // FIXME(#1052): moudulesText can come from multiple files, but `compileFromCode` ignores that.
  // We use a fallback here to '<modules>'
  const sourceCode = new Map([
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

function getMainModuleAnnotation(moduleHist: string): string | undefined {
  const moduleName = moduleHist.match(/^\/\/ @mainModule\s+(\w+)\n/)
  return moduleName?.at(1)
}
