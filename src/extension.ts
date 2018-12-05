import * as vscode from 'vscode';
import { Tool } from './tool';
import RawContentProvider from './provider/rawcontentprovider';
import { RpnFormatProvider } from './provider/rpnformatprovider';

export function activate(context: vscode.ExtensionContext) {
  let tool = new Tool();

  // 👍 formatter implemented using API
  // see https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices

  let formatProvider = new RpnFormatProvider(); // implements provideDocumentFormattingEdits() method
  let disposableFormatProvider = vscode.languages.registerDocumentFormattingEditProvider(
    [{ scheme: 'file', language: 'hp42s' }, { scheme: 'file', language: 'free42' }],
    formatProvider
  );

  let contentProvider = new RawContentProvider(); // implements provideTextDocumentContent() method
  let disposableContentProvider = vscode.workspace.registerTextDocumentContentProvider('rawhex', contentProvider);

  let disposableCommandEncode = vscode.commands.registerCommand('extension.Encode', () => {
    let editor = vscode.window.activeTextEditor;
    if (editor) {
      tool.encode(editor);
    }
  });

  let disposableCommandDecode = vscode.commands.registerCommand('extension.Decode', () => {
    let editor = vscode.window.activeTextEditor;
    if (editor) {
      tool.decode(editor);
    }
  });

  let disposableCommandShow = vscode.commands.registerCommand(
    'extension.ShowRaw',
    (fileUri: vscode.Uri | undefined) => {
      tool.showRaw(fileUri);
    }
  );

  //Disposables
  context.subscriptions.push(tool);
  context.subscriptions.push(disposableCommandEncode);
  context.subscriptions.push(disposableCommandDecode);
  context.subscriptions.push(disposableCommandShow);
  context.subscriptions.push(disposableFormatProvider);
  context.subscriptions.push(disposableContentProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
