import * as vscode from 'vscode';

import { Encoder42 } from './encoder42';
import { EncoderResult } from './encoderesult';
import { RpnParser } from './rpnparser';
import { Configuration } from '../common/configuration';

export class Encoder {
  constructor() {
    Encoder42.initialize();
  }

  /** Encode RPN to raw */
  encode(
    languageId: string,
    editor: vscode.TextEditor
  ): EncoderResult {
    const parser = new RpnParser();
    parser.document = editor.document;
    parser.config = new Configuration(true);
    
    parser.parse();

    parser.programs.forEach(program => {
      program.rawLines.forEach(rawLine => {
        Encoder42.toRaw(rawLine, languageId);
      });
    });
    
    // return result
    const result = new EncoderResult();
    result.programs = parser.programs;

    return result;
  }

  dispose() {}
}
