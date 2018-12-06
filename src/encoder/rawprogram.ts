import * as vscode from 'vscode';

import { toBytes } from '../helper/bytes';
import { RawLine } from './rawline';
import { CodeError } from '../common/codeerror';

/** Class for a program, which contains several raw lines */
export class RawProgram {
  rawLines: RawLine[] = [];
  private size: number = 0;
  startdocLineIndex: number = -1;

  constructor(startdocLineIndex: number) {
    this.startdocLineIndex = startdocLineIndex;
  }

  getRaw(): string {
    let rawAll = '';
    this.rawLines.forEach(rawLine => {
      rawAll += rawLine.raw + ' ';
    });
    return rawAll.trim();
  }

  getHex(eol: string): string {
    let hexAll = '';
    this.rawLines.forEach(rawLine => {
      hexAll += '' + rawLine.raw + eol;
    });
    return hexAll; //no trim() !
  }

  succeeded(): boolean {
    return !(this.getFirstError() !== undefined);
  }

  getFirstError(): CodeError | undefined {
    let errors = this.getErrors();
    if (errors) {
      return errors[0];
    }
    return undefined;
  }

  getErrors(): CodeError[] | undefined {
    let errors: CodeError[] = [];
    this.rawLines.forEach(rawLine => {
      // when error ...
      if (rawLine.error) {
        // push error ...
        errors.push(rawLine.error);
      }
    });

    return errors;
  }

  getSize() {
    // calculate raw program size ...
    // when END = 'C0 00 0D' at the end, ...
    let rawAll = this.getRaw();
    if (rawAll.endsWith('C0 00 0D')) {
      // ignore last END, substract 3 bytes
      this.size = toBytes(rawAll).length - 3;
    } else {
      this.size = toBytes(rawAll).length;
    }

    return this.size;
  }

  addLine(rawLine: RawLine) {
    this.rawLines.push(rawLine);
  }
}
