/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems.
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

import * as path from 'path'
import { ExtensionContext, Terminal, commands, window, workspace } from 'vscode'

import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node'

let client: LanguageClient
let testTerminal: Terminal | undefined

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('server', 'out', 'src', 'server.js'))
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode
  // so VS Code can attach to the server for debugging
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: 'quint' }],
    synchronize: {
      // watch for changes in Quint files
      fileEvents: workspace.createFileSystemWatcher('**/*.qnt'),
    },
  }

  // Create the language client and start the client.
  client = new LanguageClient('quintLspClient', 'Quint Language Server', serverOptions, clientOptions)

  context.subscriptions.push(
    commands.registerCommand('quint.runTest', async (filePath: string, testName: string) => {
      const input = await window.showInputBox({
        prompt: 'Max samples (leave empty for default)',
        placeHolder: '10000',
        validateInput: v => {
          if (v === '') return null
          if (!/^\d+$/.test(v) || Number(v) < 1) return 'Enter a positive integer'
          return null
        },
      })
      if (input === undefined) return
      if (testTerminal?.exitStatus !== undefined) {
        testTerminal = undefined
      }
      if (!testTerminal) {
        testTerminal = window.createTerminal('Quint Test')
      }
      testTerminal.show()
      const maxSamples = input ? ` --max-samples=${input}` : ''
      testTerminal.sendText(`quint test '${filePath}' --match '^${testName}$'${maxSamples}`)
    })
  )

  context.subscriptions.push(
    window.onDidCloseTerminal(t => {
      if (t === testTerminal) {
        testTerminal = undefined
      }
    })
  )

  // Start the client. This will also launch the server
  client.start()
}

export function deactivate(): Promise<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
