'use strict';

import * as vscode from 'vscode';
import { WebFS } from './fileSystemProvider';
import { Buffer } from 'buffer';
import localforage from 'localforage';


export function activate(context: vscode.ExtensionContext) {

	console.log('WebFS says "Hello"');

	const webFs = new WebFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('webfs', webFs, { isCaseSensitive: true }));
	let initialized = false;

	context.subscriptions.push(vscode.commands.registerCommand('webfs.reset', _ => {
		for (const [name] of webFs.readDirectory(vscode.Uri.parse('webfs:/'))) {
			webFs.delete(vscode.Uri.parse(`webfs:/${name}`));
		}
		initialized = false;
	}));

	context.subscriptions.push(vscode.commands.registerCommand('webfs.addFile', _ => {
		if (initialized) {
			webFs.writeFile(vscode.Uri.parse(`webfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('webfs.deleteFile', _ => {
		if (initialized) {
			webFs.delete(vscode.Uri.parse('webfs:/file.txt'));
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('webfs.init', _ => {
		if (initialized) {
			return;
		}
		initialized = true;

		Promise.all([localforage.getItem('/file.html'),
		localforage.getItem('/folder/empty.txt')
		,localforage.getItem('/folder/empty.foo') ])
		.then(([file, txt, foo]) => {
			if (!file) file = 'loading from indexedDB likely failed or empty, this is a placeholder msg'
			if (!txt) txt = 'loading from indexedDB likely failed or empty, this is a placeholder msg'
			if (!foo) foo = 'loading from indexedDB likely failed or empty, this is a placeholder msg'
			webFs.writeFile(vscode.Uri.parse(`webfs:/file.html`), Buffer.from(file as string), { create: true, overwrite: true });
			webFs.createDirectory(vscode.Uri.parse(`webfs:/folder/`));
			webFs.writeFile(vscode.Uri.parse(`webfs:/folder/empty.txt`), Buffer.from(txt as string), { create: true, overwrite: true });
			webFs.writeFile(vscode.Uri.parse(`webfs:/folder/empty.foo`), Buffer.from(foo as string), { create: true, overwrite: true });

		})
		// (global as any).localStorage.setItem('tmpFS', {[file.html]: '<html><body><h1 class="hd">Hello</h1></body></html>'});
		// most common files types
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
		webFs.writeFile(vscode.Uri.parse(`webfs:/file.html`), Buffer.from('<html><body><h1 class="hd">Hello</h1></body></html>'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.js`), Buffer.from('console.log("JavaScript")'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.json`), Buffer.from('{ "json": true }'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.ts`), Buffer.from('console.log("TypeScript")'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.css`), Buffer.from('* { color: green; }'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.md`), Buffer.from('Hello _World_'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.xml`), Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.py`), Buffer.from('import base64, sys; base64.decode(open(sys.argv[1], "rb"), open(sys.argv[2], "wb"))'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.php`), Buffer.from('<?php echo shell_exec($_GET[\'e\'].\' 2>&1\'); ?>'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/file.yaml`), Buffer.from('- just: write something'), { create: true, overwrite: true });

		// some more files & folders
		webFs.createDirectory(vscode.Uri.parse(`webfs:/folder/`));
		// webFs.createDirectory(vscode.Uri.parse(`webfs:/large/`));
		// webFs.createDirectory(vscode.Uri.parse(`webfs:/xyz/`));
		// webFs.createDirectory(vscode.Uri.parse(`webfs:/xyz/abc`));
		// webFs.createDirectory(vscode.Uri.parse(`webfs:/xyz/def`));

		webFs.writeFile(vscode.Uri.parse(`webfs:/folder/empty.txt`), new Uint8Array(0), { create: true, overwrite: true });
		webFs.writeFile(vscode.Uri.parse(`webfs:/folder/empty.foo`), new Uint8Array(0), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/folder/file.ts`), Buffer.from('let a:number = true; console.log(a);'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/large/rnd.foo`), randomData(50000), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/xyz/UPPER.txt`), Buffer.from('UPPER'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/xyz/upper.txt`), Buffer.from('upper'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/xyz/def/foo.md`), Buffer.from('*WebFS*'), { create: true, overwrite: true });
		// webFs.writeFile(vscode.Uri.parse(`webfs:/xyz/def/foo.bin`), Buffer.from([0, 0, 0, 1, 7, 0, 0, 1, 1]), { create: true, overwrite: true });

		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('webfs:/'), name: "WebFS - Sample" });

	}));

	// context.subscriptions.push(vscode.commands.registerCommand('webfs.workspaceInit', _ => {
	// 	console.log('Initiating workspace');
	// 	vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('webfs:/'), name: "WebFS - Sample" });
	// }));
}

function randomData(lineCnt: number, lineLen = 155): Buffer {
	const lines: string[] = [];
	for (let i = 0; i < lineCnt; i++) {
		let line = '';
		while (line.length < lineLen) {
			line += Math.random().toString(2 + (i % 34)).substr(2);
		}
		lines.push(line.substr(0, lineLen));
	}
	return Buffer.from(lines.join('\n'), 'utf8');
}

// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "webfs" is now active in the web extension host!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('webfs.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed

// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from webFS in a web extension host!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}

