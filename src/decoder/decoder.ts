import * as vscode from 'vscode';

import { CodeError } from '../common/codeerror';
import { DecoderFOCAL } from './decoderfocal';
import { DecoderResult } from './decoderresult';
import { RpnProgram } from './rpnprogram';

export class Decoder {
  constructor() {
    DecoderFOCAL.initializeForDecode();
  }

  /** Decode raw input to readable code string */
  decode(
    editor: vscode.TextEditor
  ): DecoderResult {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose
    
    let programs: RpnProgram[] = [];

    let document = editor.document;
    let bytes = this.readFile(document);

    return new DecoderResult(programs);
  }

  readFile(document: vscode.TextDocument): number[] {
    let docLineCount = document.lineCount;
    let languageId = document.languageId;
    let bytes: number[] = [];
    let content: string = '';

    for (let docLineIndex = 0; docLineIndex < docLineCount; docLineIndex++) {
      let line = document.lineAt(docLineIndex);
      let linetext = line.text;
      switch (languageId) {
        case "hexdump":

          content.concat(linetext);
          break;
        case "plaintext":
          break;
        case "raw":
          break;
        default:
          break;
      }
    }

    return bytes;
  }

  dispose() {}
}




