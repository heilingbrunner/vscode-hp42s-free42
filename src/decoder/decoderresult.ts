import { unstring } from "../typedefs";
import { CodeError } from "../common/codeerror";
import { RpnProgram } from "./rpnprogram";

export class DecoderResult{
  programs: RpnProgram[];
  languageId: string = '';

  constructor(programs: RpnProgram[]) {
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

  getRpn(): string {
    let rpn = '';
    this.programs.forEach(rawprogram => {
      rpn += rawprogram.getRpn().replace(/ /g, '');
    });
    return rpn.trim();
  }
}