import * as vscode from 'vscode';

import { Bytes } from './helper/bytes';
import { Configuration } from './helper/configuration';
import { FileSystem } from './helper/filesystem';
import { RpnResult } from './encoder/rpnresult';
import { Encoder } from './encoder/encoder';
import { RpnFormatter } from './encoder/rpnformatter';
import { Decoder } from './decoder/decoder';

export class Tool {
  // The team players ...
  private encoder: Encoder;
  private decoder: Decoder;
  private formatter: RpnFormatter;
  private fileSystem: FileSystem;

  constructor() {
    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.formatter = new RpnFormatter();
    this.fileSystem = new FileSystem();
  }

  encode(editor: vscode.TextEditor) {
    if (editor) {
      let config = new Configuration();

      let document = editor.document;
      let languageId = document.languageId.toLowerCase();

      if (document && languageId.match(/(hp42s|free42)/)) {
        // start encoding ...
        let result = this.encoder.encode(config, languageId, editor);
        if (result) {
          // no encoding errors ...
          if (result.rpnErrors === undefined) {
            // save result and show messages
            if (result.raw !== undefined) {
              let raw = result.raw.join(' ').trim();
              let hex = result.raw.join('\r\n').replace(/ /g, '');

              let size = 0;

              // calculate raw program size ...
              // when END = 'C0 00 0D' at the end, ...
              if (
                config.ignoreLastEndCommandForBytePrgm &&
                raw.endsWith('C0 00 0D')
              ) {
                // ignore last END, substract 3 bytes
                size = Bytes.toBytes(raw).length - 3;
              } else {
                // get real byte size ...
                size = Bytes.toBytes(raw).length;
              }

              // Save *.raw output ...
              this.fileSystem.writeBytes(document.fileName + '.raw', raw);

              // Save *.hex output ...
              if (config.generateHexFile) {
                this.fileSystem.writeText(document.fileName + '.hex', hex);
              }

              // Show Info ...
              vscode.window.showInformationMessage(
                'hp42s/free42: { ' + size + '-Byte Prgm }'
              );

              // Insert/Replace { xxx-Byte Prgm } ...
              this.insertBytePrgmLine(
                document,
                editor,
                (config.useLineNumbers ? '00 ' : '') +
                  '{ ' +
                  size +
                  '-Byte Prgm }'
              );
            } else {
              // nothing happend ...
              vscode.window.showInformationMessage(
                'hp42s/free42: No code found.'
              );
            }

            // Delete log file
            this.fileSystem.deleteFile(document.fileName + '.log');
          } else {
            // handle ecoding errors ...
            if (result && result.rpnErrors.length > 0) {
              // get first error ...
              let firstRpnError = result.rpnErrors[0];
              let firstRpnErrorText =
                firstRpnError !== undefined ? firstRpnError.toString() : '';

              // Show error ...
              vscode.window.showErrorMessage(
                'hp42s/free42: Encoding failed. \r\n' + firstRpnErrorText
              );

              // Insert/Replace first line { Error } ...
              this.insertProgErrorLine(
                document,
                editor,
                (config.useLineNumbers ? '00 ' : '') +
                  '{ ' +
                  firstRpnErrorText +
                  ' }'
              );
            }

            // Create log file
            this.writeProgErrorsToLog(document.fileName + '.log', result);
          }
        }
      } else {
        // wrong file
        vscode.window.showWarningMessage(
          'hp42s/free42: Document is not a *.hp42s/*.free42 file type.'
        );
      }
    }
  }

  decode(editor: vscode.TextEditor) {
    if (editor) {
      let config = new Configuration();

      let document = editor.document;
      let languageId = document.languageId.toLowerCase();

      if (document && languageId.match(/raw/)) {
        // start decoding ...
        let result = this.decoder.decode(config, languageId, editor);
        if (result) {
          // no decoding errors ...
          if (result.rawErrors === undefined) {
            // save result and show messages
            if (result.rpn !== undefined) {
              let rpn = result.rpn.join(' ').trim();
              let hex = result.rpn.join('\r\n').replace(/ /g, '');
              //this.fileSystem.writeText(filename, output);
            } else {
              // nothing happend ...
              vscode.window.showInformationMessage(
                'hp42s/free42: No raw found.'
              );
            }
            
          } else {
            if (result.rawErrors && result.rawErrors.length > 0) {
              // get first error ...
              let firstRawError = result.rawErrors[0];
              let firstRawErrorText =
                firstRawError !== undefined ? firstRawError.toString() : '';

              
            }
          }
        }
      } else {
        vscode.window.showErrorMessage(
          'hp42s/free42: Decoding failed. \r\nWrong file type.'
        );
      }
    }
  }

  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    if (document.languageId.match(/(hp42s|free42)/i)) {
      return this.formatter.provideDocumentFormattingEdits(document);
    }
  }

  /** Create log file */
  private writeProgErrorsToLog(filename: string, result: RpnResult) {
    let allProgErrors = '';
    if (result.rpnErrors) {
      result.rpnErrors.forEach(progError => {
        allProgErrors += progError ? progError.toString() + '\r\n' : '';
      });
      this.fileSystem.writeText(filename, allProgErrors);
    }
  }

  /** Insert/Replace { xxx-Byte Prgm } */
  private insertBytePrgmLine(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    msg: string
  ) {
    let firstLine = document.lineAt(0);
    if (/\{ .+ \}/.test(firstLine.text)) {
      editor
        .edit(e =>
          e.replace(
            new vscode.Range(firstLine.range.start, firstLine.range.end),
            msg
          )
        )
        .then(() => console.log(msg + ' replaced'));
    } else {
      editor
        .edit(e => e.insert(firstLine.range.start, msg + '\r\n'))
        .then(() => console.log(msg + ' inserted'));
    }
  }

  /** Insert/Replace { Prog-Error ... } ... */
  private insertProgErrorLine(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    firstProgErrorText: string
  ) {
    let firstLine = document.lineAt(0);
    if (/\{ .+ \}/.test(firstLine.text)) {
      editor
        .edit(e =>
          e.replace(
            new vscode.Range(firstLine.range.start, firstLine.range.end),
            firstProgErrorText
          )
        )
        .then(() => console.log(firstProgErrorText + ' replaced'));
    } else {
      editor
        .edit(e => e.insert(firstLine.range.start, firstProgErrorText + '\r\n'))
        .then(() => console.log(firstProgErrorText + ' inserted'));
    }
  }

  dispose() {
    this.encoder.dispose();
    this.formatter.dispose();
    this.fileSystem.dispose();
  }
}
