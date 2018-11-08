export class ProgError {
  lineNr: number = 0;
  code: string;
  message: string = '';

  constructor(lineNr: number, code: string, message: string) {
    this.lineNr = lineNr;
    this.code = code;
    this.message = message;
  }

  toString() {
    return (
      'Error [' +
      (this.lineNr < 10 ? '0' + this.lineNr : this.lineNr) +
      ']: Code: ' +
      this.code +
      '; Message: ' +
      this.message +
      ''
    );
  }
}
