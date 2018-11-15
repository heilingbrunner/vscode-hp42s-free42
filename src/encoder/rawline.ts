import { unstring } from '../typedefs';
import { CodeError } from '../common/codeerror';

export class RawLine {
  program: string = '';
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
    	return this.program + ' ' + this.raw + ' ' + this.error;
  }
}
