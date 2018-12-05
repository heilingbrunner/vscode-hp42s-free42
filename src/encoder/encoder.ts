import * as vscode from 'vscode';

import { EncoderFOCAL } from './encoderfocal';
import { EncoderResult } from './encoderesult';
import { RpnParser } from './rpnparser';
import { RawLine } from './rawline';
import { RawProgram } from './rawprogram';

export class Encoder {
  constructor() {
    EncoderFOCAL.initializeForEncode();
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
    let docLineCount = document.lineCount;
    let program: RawProgram | undefined;

    for (let docLineIndex = 0; docLineIndex < docLineCount; docLineIndex++) {
      let line = document.lineAt(docLineIndex);

      if (debug > 1) {
        console.log('[' + docLineIndex + ']: ' + line);
      }

      //{ ... }-line detected -> Prgm Start
      let match = line.text.match(/\{.*\}/);
      if (match) {
        program = new RawProgram(docLineIndex);
        programs.push(program);
      }

      if (program) {
        // Parse line
        parser.read(docLineIndex, line.text);

        // no parser error ...
        if (parser.error === undefined) {
          if (debug > 1) {
            console.log('-> ' + parser.out);
          }

          // handle parsed code line ...
          if (!parser.ignored) {
            // now convert to raw ...
            rawLine = EncoderFOCAL.toRaw(docLineIndex, languageId, parser);

            
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
          program.addLine(new RawLine('??', parser.error));
        }
      }
    }

    return new EncoderResult(programs);
  }

  dispose() {}
}
