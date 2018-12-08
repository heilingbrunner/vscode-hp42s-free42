import { CodeError } from '../common/codeerror';
import { Params } from '../common/params';

export class RpnLine {
  codeLineNo: number = 0;
  raw: string = '';
  normCode?: string;
  error?: CodeError;
  params = new Params();

  constructor() {}

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return this.codeLineNo + ': ' + this.raw + ', ' + this.normCode + (this.error ? ', ' + this.error : '');
  }
}
