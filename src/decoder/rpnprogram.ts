import { CodeError } from "../common/codeerror";

export class RpnProgram {

  succeeded(): boolean {
    let succeeded = true;

    return succeeded;
  }

  getFirstError(): CodeError | undefined {
    let error: CodeError | undefined;
    
    return undefined;
  }

  getRpn(): string {
    let rpnAll = '';
    
    return rpnAll;
  }
}