import * as vscode from 'vscode';

import { RPN } from './rpn';
import { EncoderResult } from './encoderesult';
import { RpnParser } from './rpnparser';
import { RawLine } from './rawline';
import { RawProgram } from './rawprogram';

export class Encoder {
  constructor() {
    RPN.initializeForEncode();
  }

  /** Encode RPN to raw */
  encode(
    languageId: string,
    editor: vscode.TextEditor
  ): EncoderResult {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose

    let programs: RawProgram[] = [];

    let parser = new RpnParser(true);
    let rawLine: RawLine;

    let document = editor.document;
    let lineCount = document.lineCount;
    let program: RawProgram | undefined;

    for (let docLineNo = 0; docLineNo < lineCount; docLineNo++) {
      let line = document.lineAt(docLineNo);

      if (debug > 1) {
        console.log('[' + docLineNo + ']: ' + line);
      }

      //LBL-line detected -> Prgm Start
      let match = line.text.match(/LBL "(.*)"/);
      if (match) {
        program = new RawProgram(match[1]);
        if (program) {
          // push lst program
          programs.push(program);
        }
      }

      if (program) {
        // Parse line
        parser.read(line.text);

        // no parser error ...
        if (parser.rpnError === undefined) {
          if (debug > 1) {
            console.log('-> ' + parser.out);
          }

          // handle parsed code line ...
          if (!parser.ignored) {
            // now convert to raw ...
            rawLine = RPN.toRaw(languageId, parser);
            // add raw line ...
            program.addLine(rawLine);

            // when no toRaw error ...
            if (debug > 0) {
              console.log('-> ' + rawLine.raw !== undefined ? rawLine.raw: 'XX');
            }
          } else {
            // add empty line ...
            program.addLine(new RawLine('', undefined));
          }
        } else {
          // parse error
          program.addLine(new RawLine('XX', parser.rpnError));
        }
      }
    }

    return new EncoderResult(programs);
  }

  dispose() {}
}
