import * as vscode from 'vscode';

import { CodeError } from '../common/codeerror';
import { RAW } from './raw';
import { DecoderResult } from './decoderresult';

export class Decoder {
  constructor() {
    RAW.initializeForDecode();
  }

  /** Decode raw input to readable code string */
  decode(
    languageId: string,
    editor: vscode.TextEditor
  ): DecoderResult {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose
    
    let errors: CodeError[] = [];
    let output: string[] = [];

    // TODO: ...

    return new DecoderResult(output, errors.length > 0 ? errors : undefined);
  }

  dispose() {}
}
