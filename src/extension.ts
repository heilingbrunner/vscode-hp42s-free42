import * as vscode from 'vscode';
import { Tool } from './tool';
import RawContentProvider from './provider/rawcontentprovider';
import { RpnFormatProvider } from './provider/rpnformatprovider';

export function activate(context: vscode.ExtensionContext) {
  const tool = new Tool();

  // 👍 formatter implemented using API
  // see https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices

  const formatProvider = new RpnFormatProvider(); // implements provideDocumentFormattingEdits() method
  const disposableFormatProvider = vscode.languages.registerDocumentFormattingEditProvider(
    [{ scheme: 'file', language: 'hp42s' }, { scheme: 'file', language: 'free42' }],
    formatProvider
  );

  const contentProvider = new RawContentProvider(); // implements provideTextDocumentContent() method
  const disposableContentProvider = vscode.workspace.registerTextDocumentContentProvider('raw42', contentProvider);

  const disposableCommandEncode = vscode.commands.registerCommand('extension.Encode', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      tool.encode(editor);
    }
  });

  const disposableCommandDecode = vscode.commands.registerCommand('extension.Decode', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      tool.decode(editor);
    } else {
      
    }
  });

  const disposableCommandShow = vscode.commands.registerCommand(
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
