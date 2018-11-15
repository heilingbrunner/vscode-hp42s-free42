import * as vscode from 'vscode';

import { Configuration } from './helper/configuration';
import { FileSystem } from './helper/filesystem';
import { EncoderResult } from './encoder/encoderesult';
import { Encoder } from './encoder/encoder';
import { RpnFormatter } from './encoder/rpnformatter';
import { Decoder } from './decoder/decoder';
import { configBit } from './typedefs';

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
      let config = new Configuration(true);

      let document = editor.document;
      let languageId = document.languageId.toLowerCase();

      if (document && languageId.match(/(hp42s|free42)/)) {
        // start encoding ...
        let result = this.encoder.encode(languageId, editor);
        if (result) {
          // no encoding errors ...
          if (!result.hasErrors()) {
            // save result and show messages
            if (result.programs !== undefined) {
              let raw = result.getRaw();
              let hex = result.getHex();
              let size = result.getSize();

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
            let firstError = result.getFirstError();
            let firstErrorText = firstError !== undefined ? firstError.toString() : '';

            // Show error ...
            vscode.window.showErrorMessage(
              'hp42s/free42: Encoding failed. \r\n' + firstErrorText
            );

            // Create log file
            this.writeErrorsToLog(document.fileName + '.log', result);
          }

          result.programs.forEach(program => {
            if(!program.hasErrors()){
              // Insert/Replace { xxx-Byte Prgm } ...
              this.insertBytePrgm( editor, config.useLineNumbers, program.startLineNo, program.getSize());
            } else {
              // Insert/Replace first line { Error } ...
              this.insertError(editor, config.useLineNumbers, program.startLineNo, program.getFirstError()+ '');
            }
            
          });
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
      let document = editor.document;
      let languageId = document.languageId.toLowerCase();

      if (document && languageId.match(/raw/)) {
        // start decoding ...
        let result = this.decoder.decode(languageId, editor);
        if (result) {
          // no decoding errors ...
          if (result.errors === undefined) {
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
            if (result.errors && result.errors.length > 0) {
              // get first error ...
              let firstRawError = result.errors[0];
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
  private writeErrorsToLog(filename: string, result: EncoderResult) {
    let allErrors = '';
    if (result.programs) {
      result.programs.forEach(program => {
        let errors = program.getErrors();
        if (errors) {
          errors.forEach(rpnError => {
            allErrors += rpnError ? rpnError.toString() + '\r\n' : '';
          });
        }
      });

      this.fileSystem.writeText(filename, allErrors);
    }
  }

  /** Insert/Replace { xxx-Byte Prgm } */
  private insertBytePrgm(
    editor: vscode.TextEditor,
    useLineNumbers: configBit,
    startLineNo: number,
    size: number
  ) {
    let braceLine = editor.document.lineAt(startLineNo - 1);
    let line = (useLineNumbers ? '00 ' : '') + '{ ' + size + '-Byte Prgm }';

    if (/\{ .* \}/.test(braceLine.text)) {
      editor
        .edit(e => e.replace(new vscode.Range(braceLine.range.start, braceLine.range.end), line))
        .then(() => console.log(line + ' replaced'));
    } else {
      editor
        .edit(e => e.insert(braceLine.range.start, line + '\r\n'))
        .then(() => console.log(line + ' inserted'));
    }
  }

  /** Insert/Replace { Prog-Error ... } ... */
  private insertError(
    editor: vscode.TextEditor,
    useLineNumbers: configBit,
    startLineNo: number,
    errorText: string
  ) {
    let braceLine = editor.document.lineAt(startLineNo - 1);
    let line = (useLineNumbers ? '00 ' : '') + '{ ' + errorText  +  ' }';

    if (/\{ .* \}/.test(braceLine.text)) {
      editor
        .edit(e => e.replace( new vscode.Range(braceLine.range.start, braceLine.range.end), line))
        .then(() => console.log(line + ' replaced'));
    } else {
      editor
        .edit(e => e.insert(braceLine.range.start, line + '\r\n'))
        .then(() => console.log(line + ' inserted'));
    }
  }

  dispose() {
    this.encoder.dispose();
    this.decoder.dispose();
    this.formatter.dispose();
    this.fileSystem.dispose();
  }
}
