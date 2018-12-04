import { unstring } from "../typedefs";
import { CodeError } from "../common/codeerror";

/** Class for a raw line */
export class RawLine {
  program: string = "";
  codeLineNo: number = 0;
  docLineIndex: number = -1;
  raw: unstring;
  error?: CodeError;

  constructor(raw: unstring, error?: CodeError) {
    this.raw = raw;
    this.error = error;
  }

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return (
      this.program +
      (this.docLineIndex > -1 ? ", " + this.docLineIndex : "") +
      (this.codeLineNo ? ", " + this.codeLineNo : "") +
      this.raw +
      (this.error ? ", " + this.error : "")
    );
  }
}
