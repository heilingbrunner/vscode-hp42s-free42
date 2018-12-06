import { CodeError } from '../common/codeerror';
import { Params } from '../common/params';

export class RpnLine {
  codeLineNo: number = 0;
  raw: string = '';
  rpn?: string;
  error?: CodeError;
  params = new Params();

  constructor() {}

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return this.codeLineNo + ': ' + this.raw + ', ' + this.rpn + (this.error ? ', ' + this.error : '');
  }
}
