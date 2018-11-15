export class CodeError {
  codeLineNo: number = 0;
  code: string;
  message: string = '';

  constructor(codeLineNo: number, code: string, message: string) {
    this.codeLineNo = codeLineNo;
    this.code = code;
    this.message = message;
  }

  toString(): string {
    return (
      'Error [' +
      (this.codeLineNo < 10 ? '0' + this.codeLineNo : this.codeLineNo) +
      "]: Code: '" +
      this.code +
      "'; Message: \'" +
      this.message +
      '\''
    );
  }
}
