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
          if (result.succeeded()) {
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
            let firstErrorText =
              firstError !== undefined ? firstError.toString() : '';

            // Show error ...
            vscode.window.showErrorMessage(
              'hp42s/free42: Encoding failed. \r\n' + firstErrorText
            );

            // Create log file
            this.writeErrorsToLog(document.fileName + '.log', result);
          }

          // Update all {...} line
          this.updateHeadLines(editor, result, config.useLineNumbers);
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
        let result = this.decoder.decode(editor);
        if (result) {
          // no decoding errors ...
          if (result.succeeded) {
            // save result and show messages
            if (result.programs !== undefined) {
              // Save result
              let rpn = result.getRpn();
              let filename = '' + result.languageId;
              //this.fileSystem.writeText(filename, rpn);
            } else {
              // nothing happend ...
              vscode.window.showInformationMessage(
                'hp42s/free42: No raw format found.'
              );
            }
          } else {
            let firstError = result.getFirstError();
            let firstErrorText =
            firstError !== undefined ? firstError.toString() : '';

            // Show error ...
            vscode.window.showErrorMessage(
              'hp42s/free42: Decoding failed. \r\n' + firstErrorText
            );
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
          errors.forEach(error => {
            allErrors += error ? error.toString() + '\r\n' : '';
          });
        }
      });

      this.fileSystem.writeText(filename, allErrors);
    }
  }

  private updateHeadLines(
    editor: vscode.TextEditor,
    result: EncoderResult,
    useLineNumbers: configBit
  ) {
    editor
      .edit(e => {
        // Walk through reverse (!!) all programs and insert/update head line.
        // Reverse iteration for easier insert of new header lines.
        result.programs.reverse().forEach(program => {
          const startdocLineIndex = program.startdocLineIndex;
          const size = program.getSize();
          const firstError = program.getFirstError();
          const firstErrorText = firstError ? firstError.toString() : '';
          
          const headLine = editor.document.lineAt(startdocLineIndex);
          let line = '';

          if (program.succeeded()) {
            line = (useLineNumbers ? '00 ' : '') + '{ ' + size + '-Byte Prgm }';
          } else {
            line = (useLineNumbers ? '00 ' : '') + '{ ' + firstErrorText + ' }';
          }

          if(headLine){
            if (/\{.*\}/.test(headLine.text)) {
              e.replace(
                new vscode.Range(headLine.range.start, headLine.range.end),
                line
              );
            }
          }
        });
      })
      .then(success => {
        console.log('{}-Update: ' + success);
      });
  }

  dispose() {
    this.encoder.dispose();
    this.decoder.dispose();
    this.formatter.dispose();
    this.fileSystem.dispose();
  }
}
