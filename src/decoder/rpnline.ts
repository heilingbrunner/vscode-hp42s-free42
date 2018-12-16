import { CodeError } from '../common/codeerror';
import { Params } from '../common/params';

export class RpnLine {
  codeLineNo: number = 0;

  /** original raw bytes from the document */
  docRaw: string = '';

  /** working code */
  workCode?: string;
  error?: CodeError;
  params = new Params();

  constructor() {}

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return this.codeLineNo + ': ' + this.docRaw + ', ' + this.workCode + (this.error ? ', ' + this.error : '');
  }
}
