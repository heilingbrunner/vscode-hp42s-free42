import * as vscode from 'vscode';
import { getFileSize, getBuffer } from '../helper/filesystem';

export default class RawHexContentProvider
  implements vscode.TextDocumentContentProvider {
  private static s_instance: RawHexContentProvider | null = null;
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

  constructor() {
    if (RawHexContentProvider.s_instance) {
      RawHexContentProvider.s_instance.dispose();
    }
    RawHexContentProvider.s_instance = this;
  }

  static get instance() {
    return RawHexContentProvider.s_instance;
  }

  public dispose() {
    this._onDidChange.dispose();
    if (RawHexContentProvider.s_instance) {
      RawHexContentProvider.s_instance.dispose();
      RawHexContentProvider.s_instance = null;
    }
  }

  public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
    const sizeWarning = 5242880;
    const sizeDisplay = 5242880;

    return new Promise(async resolve => {
      let tail =
        '(Reached the maximum size to display. You can change "rawhex.sizeDisplay" in your settings.)';

      let proceed =
        getFileSize(uri) < sizeWarning
          ? 'Open'
          : await vscode.window.showWarningMessage(
              'File might be too big, are you sure you want to continue?',
              'Open'
            );
      if (proceed === 'Open') {
        let hexString = '';
        let buf = getBuffer(uri);
        if (buf) {
          let length = buf.length > sizeDisplay ? sizeDisplay : buf.length;
          for (let index = 0; index < length; index++) {
            const byte = buf[index];
            //hexString += element.toString(16).toUpperCase() + ' ';
            hexString +=
              ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase() + ' ';
          }

          if (buf.length > sizeDisplay) {
            hexString += tail;
          }
        }

        return resolve(hexString.trim());
      } else {
        return resolve('(rawhex cancelled.)');
      }
    });
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }

  public update(uri: vscode.Uri) {
    this._onDidChange.fire(uri);
  }
}
