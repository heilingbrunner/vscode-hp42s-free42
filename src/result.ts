import { unstring, unProgError } from "./contracts";

export class Result{
  output: unstring[];
  progErrors: unProgError[]|undefined;

  constructor(output: unstring[], progErrors: unProgError[]|undefined){
    this.output = output;
    this.progErrors = progErrors;
  }
}