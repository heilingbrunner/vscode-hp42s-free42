import * as vscode from 'vscode';

import { IConverter, IFormatter, IFileSystem } from './contracts';
import { Bytes } from './bytes';
import { Factory } from './factory';
import { Result } from './result';

export class Tool {
  // The team players ...
  private converter: IConverter;
  private formatter: IFormatter;
  private fileSystem: IFileSystem;

  constructor() {
    this.converter = Factory.getConverter();
    this.formatter = Factory.getFormatter();
    this.fileSystem = Factory.getFileSystem();
  }

  encode(editor: vscode.TextEditor) {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose
    if (editor) {
      let config = vscode.workspace.getConfiguration('HP42S/free42');
      let document = editor.document;
      let languageId = document.languageId.toLowerCase();

      if (document && languageId.match(/(hp42s|free42)/)) {

        let result = this.converter.encode(languageId, editor);
        if(result){
          if (result.progErrors === undefined) {
            if (result.output !== undefined) {
              let raw = result.output.join(' ').trim();
              let hex = result.output.join('\r\n').replace(/ /g,'');

              let size = 0;
              
              let encoderIgnoreLastEndCommandForBytePrgm = config.get('encoderIgnoreLastEndCommandForBytePrgm');
              if(encoderIgnoreLastEndCommandForBytePrgm && raw.endsWith('C0 00 0D')){
                // ignore last END, substract 3 bytes
                size = Bytes.toBytes(raw).length - 3;
              } else {
                size = Bytes.toBytes(raw).length;
              }

              // Save *.raw output ...
              this.fileSystem.writeBytes(document.fileName + '.raw', raw);

              // Save *.hex output ...
              let encoderGenerateHexFile = config.get('encoderGenerateHexFile');
              if(encoderGenerateHexFile){
                this.fileSystem.writeText(document.fileName + '.hex', hex);
              }
  
              // Show Info ...
              vscode.window.showInformationMessage('hp42s/free42: { ' + size + '-Byte Prgm }');
  
              // Insert/Replace { xxx-Byte Prgm } ...
              let useLineNumbers = config.get('formatterUseLineNumbers');
              this.insertBytePrgmLine(document, editor, (useLineNumbers? '00 ': '') + '{ ' + size + '-Byte Prgm }');
            } else {
              vscode.window.showInformationMessage('hp42s/free42: No code found.');
            }
            
            // Delete log file
            this.fileSystem.deleteFile(document.fileName + '.log');
          } else {
            if (result && result.progErrors.length > 0) {
              let firstProgError = result.progErrors[0];
              let firstProgErrorText = firstProgError!== undefined ? firstProgError.toString():'';

              // Show Error ...
              vscode.window.showErrorMessage(
                'hp42s/free42: Encoding failed. \r\n' + firstProgErrorText
              );
  
              // Insert/Replace { Error } ...
              this.insertProgErrorLine(document, editor, firstProgErrorText);
            }
  
            // Create log file
            this.writeProgErrorsToLog(document.fileName + '.log', result);
          }
        }
        
      } else {
        vscode.window.showWarningMessage(
          'hp42s/free42: Document is not a *.hp42s/*.free42 file type.'
        );
      }
    }
  }

  /** Create log file */
  private writeProgErrorsToLog(filename: string, result: Result) {
    let allProgErrors = '';
    if(result.progErrors){
      result.progErrors.forEach((progError) => {
        allProgErrors += progError ? progError.toString() + '\r\n' : '';
      });
      this.fileSystem.writeText(filename, allProgErrors);
    }
  }

  /** Insert/Replace { xxx-Byte Prgm } */
  private insertBytePrgmLine(document: vscode.TextDocument, editor: vscode.TextEditor, msg: string) {
    let firstLine = document.lineAt(0);
    if (/\{ .+ \}/.test(firstLine.text)) {
      editor
        .edit(e => e.replace(new vscode.Range(firstLine.range.start, firstLine.range.end), msg))
        .then(() => console.log(msg + ' replaced'));
    }
    else {
      editor
        .edit(e => e.insert(firstLine.range.start, msg + '\r\n'))
        .then(() => console.log(msg + ' inserted'));
    }
  }

  /** Insert/Replace { Prog-Error ... } ... */
  private insertProgErrorLine(document: vscode.TextDocument, editor: vscode.TextEditor, firstProgErrorText: string) {
    let firstLine = document.lineAt(0);
    if (/\{ .+ \}/.test(firstLine.text)) {
      editor
        .edit(e => e.replace(new vscode.Range(firstLine.range.start, firstLine.range.end), '{ ' + firstProgErrorText + ' }'))
        .then(() => console.log(firstProgErrorText + ' replaced'));
    }
    else {
      editor
        .edit(e => e.insert(firstLine.range.start, '{ ' + firstProgErrorText + ' }' + '\r\n'))
        .then(() => console.log(firstProgErrorText + ' inserted'));
    }
  }

  //decode(editor: vscode.TextEditor) {
  //  if (editor) {
  //    let document = editor.document;
  //    if (document && document.languageId.match(/raw/)) {
  //      let input = document.getText();
  //      let result = this.converter.decode(input);
  //      let languageId = result[0];
  //      let output = result[1];
  //      let errors = result[2];
  //
  //      if (errors === undefined && output !== undefined) {
  //        let filename = document.fileName + '.' + languageId;
  //        //this.fileSystem.writeText(filename, output);
  //      } else {
  //        vscode.window.showErrorMessage(
  //          'hp42s/free42: Decoding failed. \r\n' + errors
  //        );
  //      }
  //    } else {
  //      vscode.window.showErrorMessage(
  //        'hp42s/free42: Decoding failed. \r\nWrong file type.'
  //      );
  //    }
  //  }
  //}

  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    if (document.languageId.match(/(hp42s|free42)/i)) {
      return this.formatter.provideDocumentFormattingEdits(document);
    }
  }

  test() {}

  dispose() {
    this.converter.dispose();
    this.formatter.dispose();
    this.fileSystem.dispose();
  }
}
