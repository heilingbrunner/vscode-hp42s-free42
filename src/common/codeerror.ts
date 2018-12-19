export class CodeError {
  docLine: number = -1; //index 0,... but document line numer starts at 1 !!
  codeLineNo: number = -1;
  code: string;
  message: string = '';

  constructor(docLine: number, codeLineNo: number, code: string, message: string) {
    this.docLine = docLine;
    this.codeLineNo = codeLineNo;
    this.code = code;
    this.message = message;
  }

  toString(useHex?: boolean): string {
    const docLine = (this.docLine > -1 ? (this.docLine + 1) + ', ' : '');
    const codeLine = (this.codeLineNo > -1 ? (useHex ? 'addr: ' + this.codeLineNo.toString(16).toUpperCase() : (this.codeLineNo < 10 ? '0' + this.codeLineNo : this.codeLineNo)) : '');
    return (
      'Error [' +
      docLine +
      codeLine +
      "]! Code: '" +
      this.code +
      "'; Message: " +
      this.message
    );
  }
}
