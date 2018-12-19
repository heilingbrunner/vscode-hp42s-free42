import { CodeError } from '../common/codeerror';
import { Params } from '../common/params';

/** Class for a raw line */
export class RawLine {
  codeLineNo = 0;
  docLine = -1;

  /** original code from the document */
  docCode = '';

  params = new Params();

  ignored = false;
  raw?: string;
  error?: CodeError;

  private _workCode = '';

  /** working code */
  set workCode(code: string) {
    this._workCode = code;
    this.tokens = this._workCode.split(' ');
  }
  get workCode(): string {
    return this._workCode;
  }

  // get/set
  private _tokens: string[] = [];
  set tokens(t: string[]) {
    this._tokens = t;
    this._tokenLength = this._tokens.length;
    if (this._tokenLength > 0) {
      this._token = this._tokens[0];
    }
  }
  get tokens(): string[] {
    return this._tokens;
  }

  // get only
  private _token = '';
  get token(): string {
    return this._token;
  }

  // get only
  private _tokenLength: number = 0;
  get tokenLength(): number {
    return this._tokenLength;
  }

  constructor() {}

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return (
      (this.docLine > -1 ? ', ' + this.docLine : '') +
      (this.codeLineNo ? ', ' + this.codeLineNo : '') +
      this.raw +
      (this.error ? ', ' + this.error : '')
    );
  }
}
