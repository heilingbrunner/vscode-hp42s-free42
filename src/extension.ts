import * as vscode from 'vscode';
import { Tool } from './tool';

export function activate(context: vscode.ExtensionContext) {
  console.log(
    "Congratulations, your extension 'hp42s/free42-extension' is now active!"
  );

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
        //vscode.window.showInformationMessage('hp42s/free42: Encoding ...');
        tool.encode(editor);
        //vscode.window.showInformationMessage('hp42s/free42: Encoding done.');
      }
    }
  );

  //let disposableCommandDecode = vscode.commands.registerCommand(
  //  'extension.Decode',
  //  () => {
  //    let editor = vscode.window.activeTextEditor;
  //    if (editor) {
  //      //vscode.window.showInformationMessage('hp42s/free42: Decoding ...');
  //      tool.decode(editor);
  //      vscode.window.showInformationMessage('hp42s/free42: Decoding done.');
  //    }
  //  }
  //);

  context.subscriptions.push(tool);
  context.subscriptions.push(disposableCommandEncode);
  //context.subscriptions.push(disposableCommandDecode);
  context.subscriptions.push(disposableFormattingEditProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
