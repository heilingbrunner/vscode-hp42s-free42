export class CodeError {
  docLineIndex: number = -1; //index 0,... but document line numer starts at 1 !!
  codeLineNo: number = -1;
  code: string;
  message: string = '';

  constructor(docLineIndex: number, codeLineNo: number, code: string, message: string) {
    this.docLineIndex = docLineIndex;
    this.codeLineNo = codeLineNo;
    this.code = code;
    this.message = message;
  }

  toString(): string {
    return (
      'Error [' +
      (this.docLineIndex > -1 ? (this.docLineIndex + 1) +  ', ' : '') +
      (this.codeLineNo > -1 ? (this.codeLineNo < 10 ? '0' + this.codeLineNo : this.codeLineNo): '') +
      "]: Code: '" +
      this.code +
      "'; Message: \'" +
      this.message +
      '\''
    );
  }
}
