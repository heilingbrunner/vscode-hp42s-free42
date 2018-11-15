import { unstring } from '../typedefs';
import { CodeError } from '../common/codeerror';

export class RawLine {
  program: string = '';
  prgmLineNo: number = 0;
  docLineNo: number = 0;
  raw: unstring;
  error: CodeError | undefined;

  constructor(raw: unstring, rpnError: CodeError | undefined) {
    this.raw = raw;
    this.error = rpnError;
  }

  hasError(): boolean{
    return !(this.error === undefined);
  }

  toString(): string {
    	return this.program + ', ' + (this.docLineNo > 0 ? this.docLineNo + ', ': '') + (this.prgmLineNo ? this.prgmLineNo  + ', ' : '') + this.raw + ' ' + this.error + '';
  }
}
