import * as vscode from 'vscode';

import { Configuration } from '../helper/configuration';
import { RawError } from './rawerror';
import { Raw2Rpn } from './raw2rpn';
import { RawResult } from './rawresult';

export class Decoder {
  constructor() {
    Raw2Rpn.initializeForDecode();
  }

  /** Decode raw input to readable code string */
  decode(
    config: Configuration,
    languageId: string,
    editor: vscode.TextEditor
  ): RawResult {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose
    
    let errors: RawError[] = [];
    let output: string[] = [];

    // TODO: ...

    return new RawResult(output, errors.length > 0 ? errors : undefined);
  }

  dispose() {}
}
