import { Bytes } from '../helper/bytes';
import { RawLine } from './rawline';
import { CodeError } from '../common/codeerror';

export class RawProgram {
  private lines: RawLine[] = [];
  private size: number = 0;
  startdocLineIndex: number = -1;
  name: string = '';

  constructor(name: string) {
    this.name = name;
  }

  getRaw(): string {
    let rawAll = '';
    this.lines.forEach(rawLine => {
      rawAll += rawLine.raw + ' ';
    });
    return rawAll.trim();
  }

  getHex(): string {
    let hexAll = '';
    this.lines.forEach(rawLine => {
      hexAll += rawLine.raw + '\r\n';
    });
    return hexAll; //no trin() !
  }

  succeeded(): boolean{
    return !(this.getFirstError() !== undefined);
  }

  getFirstError(): CodeError | undefined{
    let errors =this.getErrors();
    if(errors){
      return errors[0];
    }
    return undefined;
  }

  getErrors(): CodeError[] | undefined {
    let rpnErrors: CodeError[] | undefined;
    this.lines.forEach(rawLine => {
      // when error ...
      if (rawLine.error) {
        // check array ...
        if (!rpnErrors) {
          //create array
          rpnErrors = [];
        }
        // push error ...
        rpnErrors.push(rawLine.error);
      }
    });

    return rpnErrors;
  }

  getSize() {
    // calculate raw program size ...
    // when END = 'C0 00 0D' at the end, ...
    let rawAll = this.getRaw();
    if (rawAll.endsWith('C0 00 0D')) {
      // ignore last END, substract 3 bytes
      this.size = Bytes.toBytes(rawAll).length - 3;
    } else {
      this.size = Bytes.toBytes(rawAll).length;
    }

    return this.size;
  }

  addLine(rawLine: RawLine) {
    rawLine.program = this.name;
    this.lines.push(rawLine);
  }
}
