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

		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('webfs:/'), name: "WebFS - Sample" });

	}));

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
