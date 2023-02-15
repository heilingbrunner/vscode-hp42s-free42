import * as vscode from 'vscode';

import { Encoder42 } from './encoder42';
import { EncoderResult } from './encoderesult';
//import { RpnParser } from './rpnparser';
import * as RpnParser from './RpnParser.js'
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
    //const parser = new RpnParser();
    // parser.document = editor.document;
    // parser.config = new Configuration(true);

    // Read code and return raw programs with raw lines
    // Example:
    // RawProgram {rawLines: Array(3), size: 0, startDocLine: 0}
    // RTNERR 1 -> RawLine { docCode: '02 RTNERR 1', raw: 'F2 A0 er', params: { err: '1', errno: 1 }, ignored: false, … }
    // parser.parse();

    // parser.programs.forEach((program) => {
    //   program.rawLines.forEach((rawLine) => {
    //     Encoder42.toRaw(rawLine, languageId);
    //   });
    // });

    // // return result
    // result.programs = parser.programs;
    
    const code = editor.document.getText();
    const tree = RpnParser.parse(code);
    
    const result = new EncoderResult();
    return result;
  }

  dispose() {}
}
