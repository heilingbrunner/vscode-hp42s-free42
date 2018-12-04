import { unstring } from "../typedefs";
import { CodeError } from "../common/codeerror";

export class RpnLine {
  codeLineNo: number = 0;
  raw: unstring;
  rpn: unstring;
  error?: CodeError;

  constructor(codeLineNo: number, raw: unstring, error?: CodeError) {
    this.codeLineNo = codeLineNo;
    this.raw = raw;
    this.error = error;
  }

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return (
      this.codeLineNo + ": " +
      this.raw +
      (this.error? ', ' + this.error : '')
    );
  }
}
