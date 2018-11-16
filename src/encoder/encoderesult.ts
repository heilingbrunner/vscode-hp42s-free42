import { CodeError } from '../common/codeerror';
import { RawProgram } from './rawprogram';

export class EncoderResult {
  programs: RawProgram[];

  constructor(programs: RawProgram[]) {
    this.programs = programs;
  }

  succeeded(): boolean {
    let succeeded = true;
    this.programs.forEach(program => {
      succeeded = succeeded && program.succeeded();
    });

    return succeeded;
  }

  getFirstError(): CodeError | undefined {
    let error: CodeError | undefined;
    for (let index = 0; index < this.programs.length; index++) {
      const program = this.programs[index];
      error = program.getFirstError();
      if(error){
        return error;
      }
    }
    
    return undefined;
  }

  getHex(): string {
    let hex = '';
    this.programs.forEach(rawprogram => {
      hex += rawprogram.getHex().replace(/ /g, '');
    });
    return hex.trim();
  }

  getRaw(): string {
    let raw = '';
    this.programs.forEach(rawprogram => {
      raw += rawprogram.getRaw() + ' ';
    });
    return raw.trim();
  }

  getSize(): number {
    let size = 0;
    this.programs.forEach(rawprogram => {
      size += rawprogram.getSize();
    });
    return size;
  }
}
