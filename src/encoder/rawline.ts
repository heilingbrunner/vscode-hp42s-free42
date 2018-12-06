import { CodeError } from '../common/codeerror';
import { Params } from '../common/params';

/** Class for a raw line */
export class RawLine {
  codeLineNo = 0;
  docLineIndex = -1;
  code = '';

  params = new Params();
  ignored = false;
  raw?: string;
  error?: CodeError;

  _normCode = '';
  set normCode(nC: string) {
    this._normCode = nC;
    this.tokens = this._normCode.split(' ');
  }
  get normCode(): string {
    return this._normCode;
  }

  // get/set
  _tokens: string[] = [];
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
  _token = '';
  get token(): string {
    return this._token;
  }

  // get only
  _tokenLength: number = 0;
  get tokenLength(): number {
    return this._tokenLength;
  }

  constructor() {}

  hasError(): boolean {
    return !(this.error === undefined);
  }

  toString(): string {
    return (
      (this.docLineIndex > -1 ? ', ' + this.docLineIndex : '') +
      (this.codeLineNo ? ', ' + this.codeLineNo : '') +
      this.raw +
      (this.error ? ', ' + this.error : '')
    );
  }
}
