import * as vscode from 'vscode';
import { Tool } from './tool';
import RawHexContentProvider from './provider/rawhexcontentprovider';

export function activate(context: vscode.ExtensionContext) {

  let tool = new Tool();

  // 👍 formatter implemented using API
  // see https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices
  let disposableFormattingEditProvider = vscode.languages.registerDocumentFormattingEditProvider(
    [
      { scheme: 'file', language: 'hp42s' },
      { scheme: 'file', language: 'free42' }
    ],
    tool // implements provideDocumentFormattingEdits()
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

  let disposableCommandShow = vscode.commands.registerCommand(
    'extension.ShowRaw',
    (fileUri: vscode.Uri | undefined) => {
      tool.showRaw(fileUri);
    }
  );

  let contentProvider = new RawHexContentProvider();
  vscode.workspace.registerTextDocumentContentProvider('rawhex', contentProvider);

  context.subscriptions.push(tool);
  context.subscriptions.push(disposableCommandEncode);
  context.subscriptions.push(disposableCommandDecode);
  context.subscriptions.push(disposableCommandShow);
  context.subscriptions.push(disposableFormattingEditProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
