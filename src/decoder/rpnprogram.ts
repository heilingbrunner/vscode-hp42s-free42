
import { CodeError } from "../common/codeerror";
import { RpnLine } from "./rpnline";


export class RpnProgram {
  rpnLines: RpnLine[] = [];
  size: number = 0;

  succeeded(): boolean {
    return !(this.getFirstError() !== undefined);
  }

  getFirstError(): CodeError | undefined {
    const errors = this.getErrors();
    if (errors) {
      return errors[0];
    }
    return undefined;
  }

  getErrors(): CodeError[] | undefined {
    const errors: CodeError[] = [];
    this.rpnLines.forEach(rpnLine => {
      // when error ...
      if (rpnLine.error) {
        // push error ...
        errors.push(rpnLine.error);
      }
    });

    return errors;
  }

  getHex(eol: string): string {
    let rawAll = '';

    this.rpnLines.forEach(rpnLine => {
      rawAll += '' + rpnLine.raw + eol;
    });
    return rawAll.trim();
  }

  getRpn(eol: string, useLineNumbers?: Boolean): string {
    let rpnAll = '';

    this.rpnLines.forEach(rpnLine => {
      rpnAll += (useLineNumbers ? (rpnLine.codeLineNo < 10 ? '0' + rpnLine.codeLineNo : rpnLine.codeLineNo) + ' ' : '') + rpnLine.normCode + eol;
    });
    return rpnAll.trim();
  }

  getSize() {
    return this.size;
  }

  addLine(rpnLine: RpnLine) {
    this.rpnLines.push(rpnLine);
  }
}