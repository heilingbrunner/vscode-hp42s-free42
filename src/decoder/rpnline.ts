import { unstring } from "../typedefs";
import { CodeError } from "../common/codeerror";
import { Params } from "../common/params";

export class RpnLine {
  codeLineNo: number = 0;
  raw: unstring;
  rpn: unstring;
  error?: CodeError;
  params?: Params;

  

  constructor() {
    
  }

  //constructor(codeLineNo: number, raw: unstring, rpn: string, error?: CodeError) {
  //  this.codeLineNo = codeLineNo;
  //  this.raw = raw;
  //  this.rpn = rpn;
  //  this.error = error;
  //}

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return (
      this.codeLineNo + ": " +
      this.raw + ', ' +
      this.rpn +
      (this.error? ', ' + this.error : '')
    );
  }
}
