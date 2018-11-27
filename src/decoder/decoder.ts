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
  decode(editor: vscode.TextEditor): DecoderResult {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose

    let programs: RpnProgram[] = [];

    let document = editor.document;

    let bytes = this.readFile(document);

    return new DecoderResult(programs);
  }

  readFile(document: vscode.TextDocument): string[] {
    let docLineCount = document.lineCount;
    let languageId = document.languageId;
    let bytes: string[] = [];
    let content: string = '';

    for (let docLineIndex = 0; docLineIndex < docLineCount; docLineIndex++) {
      let line = document.lineAt(docLineIndex);
      let linetext = line.text;

      //   Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 	                   <----- not this
      // 00000000: C0 00 F8 00 54 4F 4F 2D 4C 4F 4E 99 16 C0 00 F4    @.x.TOO-LON..@.t <----- this
      if (/(\d+: )([0-9a-fA-F]{2} )+/.test(linetext)) {
        let match = linetext.match(/([0-9a-fA-F]{2} )+/);
        if (match) {
          content += match[0];
        }
      }
      // All together
      bytes = content.trim().split(' ');
    }

    return bytes;
  }

  dispose() {}
}
