/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import * as path from 'path';
import { workspace, ExtensionContext, HoverProvider, ProviderResult, languages, MarkdownString, Hover, Position, TextDocument, CancellationToken } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient;

class TntHoverProvider implements HoverProvider {
    public provideHover (document: TextDocument, position: Position, token: CancellationToken): Hover {
        // const hoverText = new MarkdownString
        // hoverText.appendMarkdown("#aa")
        // const hover = new Hover(hoverText)
        return new Hover("aaaa")
    }
}

export function activate (context: ExtensionContext) {
    // context.subscriptions.push(languages.registerHoverProvider('tnt', new TntHoverProvider()))
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode
    // so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'tnt' }],
        synchronize: {
            // watch for changes in TNT files
            fileEvents: workspace.createFileSystemWatcher('**/*.tnt')
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'tntLspClient',
        'LSP for TNT',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

export function deactivate (): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
