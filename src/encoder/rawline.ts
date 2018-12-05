import { CodeError } from "../common/codeerror";
import { Params } from "../common/params";

/** Class for a raw line */
export class RawLine {
  program = '';
  codeLineNo = 0;
  docLineIndex = -1;
  code = '';
  normCode = '';
  params = new Params();
  ignored = false;
  raw?: string;
  error?: CodeError;

  token = '';
  tokens: string[] = [];
  tokenLength: number = 0;

  constructor() {
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
