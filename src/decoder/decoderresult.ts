
import { CodeError } from "../common/codeerror";
import { RpnProgram } from "./rpnprogram";

export class DecoderResult{
  programs: RpnProgram[] = [];
  languageId: string = '';

  constructor() {}

  get succeeded(): boolean {
    let succeeded = true;
    this.programs.forEach(program => {
      succeeded = succeeded && program.succeeded;
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

  getHex(eol: string, useWhitespaceBetweenHex?: boolean, useLineNumbers?: boolean): string {
    let hexAll = '';

    this.programs.forEach(rpnprogram => {
      hexAll += rpnprogram.getHex(eol, useLineNumbers);
    });

    if(!useWhitespaceBetweenHex){
      hexAll = hexAll.replace(/ /g, '');
    }

    return hexAll.trim();
  }

  getRpn(eol: string, useLineNumbers?: boolean): string {
    let rpn = '';

    this.programs.forEach(rpnprogram => {
      rpn += rpnprogram.getRpn(eol, useLineNumbers);
    });
    return rpn.trim();
  }

  getSize(): number {
    let size = 0;
    this.programs.forEach(rpnprogram => {
      size += rpnprogram.getSize();
    });

    return size;
  }
}