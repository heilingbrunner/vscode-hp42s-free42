import * as vscode from 'vscode';

import { CodeError } from "../common/codeerror";
import { RpnLine } from "./rpnline";


export class RpnProgram {
  rpnLines: RpnLine[] = [];

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
    this.rpnLines.forEach(rpnLine => {
      // when error ...
      if (rpnLine.error) {
        // push error ...
        errors.push(rpnLine.error);
      }
    });

    return errors;
  }

  getRpn(eol: string): string {
    let rpnAll = '';

    this.rpnLines.forEach(rpnLine => {
      rpnAll += '' + rpnLine.rpn + eol;
    });
    return rpnAll.trim();
  }

  addLine(rpnLine: RpnLine) {
    this.rpnLines.push(rpnLine);
  }
}