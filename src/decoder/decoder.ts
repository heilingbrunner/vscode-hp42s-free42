import * as vscode from 'vscode';

import { Decoder42 } from './decoder42';
import { DecoderResult } from './decoderresult';
//import { RawParser } from './rawparser';
import * as RawParser from './RawParser.js';

export class Decoder {
  constructor() {
    Decoder42.initialize();
  }

  /** Decode raw input to readable code string */
  decode(editor: vscode.TextEditor): DecoderResult {
    // const document = editor.document;
    // const raw = this.readDocumentBytes(document);

    //const parser = new RawParser(raw);

    // Read code and return rpn programs with rpn lines
    // Example:
    // RpnProgram {rpnLines: Array(3), size: 0, startDocLine: 0}
    // F2 A0 01 -> RpnLine {codeLineNo: 2, docRaw: 'F2 A0 01', rawLength: 3, params: Params, workCode: 'RTNERR `er`'}
    // parser.parse();

    // parser.programs.forEach((program) => {
    //   program.rpnLines.forEach((rpnLine) => {
    //     Decoder42.toRpn(rpnLine);
    //   });
    // });

    // // return result
    // result.programs = parser.programs;
    // result.languageId = parser.languageId;

    const bytes = this.readDocumentBytes(editor.document);
    const code = bytes.join(' ');
    const tree = RawParser.parse(code);
    
    const result = new DecoderResult();
    return result;
  }

  readDocumentBytes(document: vscode.TextDocument): string[] {
    const docLineCount = document.lineCount;
    let bytes: string[];
    let content: string = '';

    for (let docLine = 0; docLine < docLineCount; docLine++) {
      let line = document.lineAt(docLine);
      let linetext = line.text;

      //   Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 	                   <----- not this
      // 00000000: C0 00 F8 00 54 4F 4F 2D 4C 4F 4E 99 16 C0 00 F4    @.x.TOO-LON..@.t <----- this

      if (/(\d+:)( [0-9a-fA-F]{2})+/.test(linetext)) {
        linetext = linetext.replace(/^\d{8}: /, '');
        let match = linetext.match(/([0-9a-fA-F]{2} )+/);
        if (match) {
          content += match[0];
        }
      }
    }
    // All together
    bytes = content.trim().split(' ');

    return bytes;
  }

  dispose() {}
}
