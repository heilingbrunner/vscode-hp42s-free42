import * as vscode from 'vscode';

import { Configuration } from './common/configuration';
import { writeBytes, writeText, deleteFile, getPhysicalPath, existsSync } from './common/filesystem';
import { EncoderResult } from './encoder/encoderesult';
import { Encoder } from './encoder/encoder';
import { Decoder } from './decoder/decoder';

export class Tool {
  // The team players ...
  private encoder: Encoder;
  private decoder: Decoder;

  constructor() {
    this.encoder = new Encoder();
    this.decoder = new Decoder();
  }

  encode(editor: vscode.TextEditor) {
    if (editor) {
      const config = new Configuration(true);
      const document = editor.document;

      if (document) {
        const languageId = document.languageId.toLowerCase();
        const eol = ['', '\n', '\r\n'][document.eol];

        if (languageId.match(/(hp42s|free42)/)) {
          // start encoding ...
          let result = this.encoder.encode(languageId, editor);
          if (result) {
            // no encoding errors ...
            if (result.succeeded()) {
              // save result and show messages
              if (result.programs !== undefined) {
                // Save *.hex42 output ...
                if (config.generateHexFile) {
                  const useWhitespaceBetweenHex = config.useWhitespaceBetweenHex;
                  const hex = result.getHex(eol, useWhitespaceBetweenHex);

                  writeText(document.fileName + '.hex42', hex);
                }

                // Save *.raw output ...
                const raw = result.getRaw();
                const size = result.getSize();
                
                writeBytes(document.fileName + '.raw', raw);

                // Show Info ...
                vscode.window.showInformationMessage('hp42s/free42: { ' + size + '-Byte Prgm }');
              } else {
                // nothing happend ...
                vscode.window.showInformationMessage('hp42s/free42: No code found.');
              }

              // Delete log file
              deleteFile(document.fileName + '.log');
            } else {
              // handle ecoding errors ...
              const firstError = result.getFirstError();
              const firstErrorText = firstError !== undefined ? firstError.toString() : '';

              // Show error ...
              vscode.window.showErrorMessage('hp42s/free42: Encoding failed.' + eol + firstErrorText);

              // Create log file
              this.writeErrorsToLog(document.fileName + '.log', result, eol);
            }

            // Update all {...} line
            this.updateHeadLines(editor, result, config.useLineNumbers);
          }
        } else {
          // wrong file
          vscode.window.showWarningMessage('hp42s/free42: Document is not a *.hp42s/*.free42 file type.');
        }
      }
    }
  }

  decode(editor: vscode.TextEditor) {
    if (editor) {
      const config = new Configuration(true);
      const document = editor.document;

      if (document) {
        const eol = ['', '\n', '\r\n'][document.eol];
        const languageId = document.languageId.toLowerCase();
        const scheme = document.uri.scheme.toLowerCase();

        if (languageId.match(/raw42/) && scheme.match(/raw42/)) {
          // start decoding ...
          const result = this.decoder.decode(editor);
          if (result) {
            // no decoding errors ...
            if (result.succeeded) {
              // save result and show messages
              if (result.programs !== undefined) {
                // Save *.hex42 output
                if (config.generateHexFile) {
                  const useWhitespaceBetweenHex = config.useWhitespaceBetweenHex;
                  const hex = result.getHex(eol, useWhitespaceBetweenHex);
                  const hexFileName = document.fileName.replace('raw42', 'hex42');
                  writeText(hexFileName, hex);
                }

                // Save *.hp42s/*.free42
                const rpn = result.getRpn(eol);
                const size = result.getSize();
                const rpnFileName = document.fileName.replace('raw42', result.languageId);
                writeText(rpnFileName, rpn);

                // Show Info ...
                vscode.window.showInformationMessage('hp42s/free42: { ' + size + '-Byte Prgm }');
              } else {
                // nothing happend ...
                vscode.window.showInformationMessage('hp42s/free42: No raw format found.');
              }
            } else {
              const firstError = result.getFirstError();
              const firstErrorText = firstError !== undefined ? firstError.toString() : '';

              // Show error ...
              vscode.window.showErrorMessage('hp42s/free42: Decoding failed.' + eol + firstErrorText);
            }
          }
        } else {
          vscode.window.showErrorMessage('hp42s/free42: Decoding failed.' + eol + 'Wrong file type.');
        }
      }
    }
  }

  showRaw(fileUri: vscode.Uri | undefined) {
    if (typeof fileUri === 'undefined' || !(fileUri instanceof vscode.Uri)) {
      if (vscode.window.activeTextEditor === undefined) {
        vscode.commands.executeCommand('hexdump.hexdumpPath');
        return;
      }
      fileUri = vscode.window.activeTextEditor.document.uri;
    }

    if (fileUri.scheme === 'hexdump') {
      //toggle with actual file
      const filePath = getPhysicalPath(fileUri);
      for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document.uri.fsPath === filePath) {
          vscode.window.showTextDocument(editor.document, editor.viewColumn);
          return;
        }
      }

      vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
    } else {
      this.vscodeOpenRaw42(fileUri.fsPath);
    }
  }

  /** Create log file */
  private writeErrorsToLog(filename: string, result: EncoderResult, eol: string) {
    let allErrors = '';
    if (result.programs) {
      result.programs.forEach(program => {
        let errors = program.getErrors();
        if (errors) {
          errors.forEach(error => {
            allErrors += error ? error.toString() + eol : '';
          });
        }
      });

      writeText(filename, allErrors);
    }
  }

  /** {} Head lines */
  private updateHeadLines(editor: vscode.TextEditor, result: EncoderResult, useLineNumbers: {} | undefined) {
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

          if (headLine) {
            if (/\{.*\}/.test(headLine.text)) {
              e.replace(new vscode.Range(headLine.range.start, headLine.range.end), line);
            }
          }
        });
      })
      .then(success => {
        console.log('{}-Update: ' + success);
      });
  }

  private vscodeOpenRaw42(filePath: string) {
    if (typeof filePath === 'undefined') {
      return;
    }
    if (!existsSync(filePath)) {
      return;
    }

    const fileUri = vscode.Uri.file(filePath.concat('.raw42'));
    // add 'raw42' extension to assign an editorLangId
    const hexUri = fileUri.with({ scheme: 'raw42' });

    vscode.commands.executeCommand('vscode.open', hexUri);
  }

  dispose() {
    this.encoder.dispose();
    this.decoder.dispose();
  }
}
