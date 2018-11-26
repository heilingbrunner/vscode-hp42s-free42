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

    // TODO: ...

    return new DecoderResult(programs);
  }

  dispose() {}
}
