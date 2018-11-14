import { unstring } from "../typedefs";
import { RawError } from "./rawerror";

export class RawResult{
  rpn: unstring[];
  rawErrors: RawError[]|undefined;

  constructor(rpn: unstring[], rawErrors: RawError[]|undefined){
    this.rpn = rpn;
    this.rawErrors = rawErrors;
  }
}