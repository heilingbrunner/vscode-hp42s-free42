import * as vscode from 'vscode';

import { Configuration } from '../helper/configuration';
import { RpnError } from './rpnerror';
import { Rpn2Raw } from './rpn2raw';
import { RpnResult } from './rpnresult';
import { RpnParser } from './rpnparser';
import { RawLine } from './rawline';

export class Encoder {
  constructor() {
    Rpn2Raw.initializeForEncode();
  }

  /** Encode RPN to raw */
  encode(
    config: Configuration,
    languageId: string,
    editor: vscode.TextEditor
  ): RpnResult {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose

    let errors: RpnError[] = [];
    let output: string[] = [];

    let parser = new RpnParser(true);
    let rawLine: RawLine;

    let document = editor.document;
    let lineCount = document.lineCount;

    for (let index = 0; index < lineCount; index++) {
      let line = document.lineAt(index);

      if(!line.isEmptyOrWhitespace){
        if (debug > 1) {
          console.log('[' + index + ']: ' + line);
        }
  
        parser.read(line.text);
  
        // no parser error ...
        if (parser.rpnError === undefined) {
          if (debug > 1) {
            console.log('-> ' + parser.out);
          }
  
          // handle parsed code line ...
          if (!parser.ignored) {
            // now convert to raw ...
            rawLine = Rpn2Raw.toRaw(languageId, parser);

            // when no toRaw error ...
            if (rawLine.rpnError === undefined) {
              if (rawLine.raw !== undefined) {
                if (debug > 0) {
                  console.log('-> ' + rawLine.raw);
                }
                // add raw line ...
                output.push(rawLine.raw);
              }
            } else {
              // Free42.toRaw() failed, collect errors ...
              errors.push(rawLine.rpnError);
            }
          } else {
            // add empty line ...
            output.push('');
          }
        } else {
          // parser.read() failed, collect parser error ...
          errors.push(parser.rpnError);
        }
      }
    }
    
    return new RpnResult(
      output,
      errors.length > 0 ? errors : undefined
    );
  }
  
  dispose() {}
}
