import * as vscode from 'vscode';
import { Tool } from './tool';

export function activate(context: vscode.ExtensionContext) {

  let tool = new Tool();

  // 👍 formatter implemented using API
  // see https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices
  let disposableFormattingEditProvider = vscode.languages.registerDocumentFormattingEditProvider(
    [
      { scheme: 'file', language: 'hp42s' },
      { scheme: 'file', language: 'free42' }
    ],
    tool
  );

  let disposableCommandEncode = vscode.commands.registerCommand(
    'extension.Encode',
    () => {
      let editor = vscode.window.activeTextEditor;
      if (editor) {
        tool.encode(editor);
      }
    }
  );

  let disposableCommandDecode = vscode.commands.registerCommand(
    'extension.Decode',
    () => {
      let editor = vscode.window.activeTextEditor;
      if (editor) {
        tool.decode(editor);
      }
    }
  );

  context.subscriptions.push(tool);
  context.subscriptions.push(disposableCommandEncode);
  context.subscriptions.push(disposableCommandDecode);
  context.subscriptions.push(disposableFormattingEditProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
