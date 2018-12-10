import * as vscode from 'vscode';

import { EncoderFOCAL } from './encoderfocal';
import { EncoderResult } from './encoderesult';
import { RpnParser } from './rpnparser';
import { Configuration } from '../common/configuration';

export class Encoder {
  constructor() {
    EncoderFOCAL.initialize();
  }

  /** Encode RPN to raw */
  encode(
    languageId: string,
    editor: vscode.TextEditor
  ): EncoderResult {
    const debug = 1; // debug level 0=nothing, 1=minimal, 2=verbose

    const parser = new RpnParser();
    parser.document = editor.document;
    parser.config = new Configuration(true);
    
    parser.parse();

    parser.programs.forEach(program => {
      program.rawLines.forEach(rawLine => {
        EncoderFOCAL.toRaw(rawLine, languageId);
      });
    });
    
    // return result
    const result = new EncoderResult();
    result.programs = parser.programs;

    return result;
  }

  dispose() {}
}
