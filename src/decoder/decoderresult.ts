import { unstring } from "../typedefs";
import { CodeError } from "../common/codeerror";

export class DecoderResult{
  rpn: unstring[];
  errors: CodeError[]|undefined;

  constructor(rpn: unstring[], errors: CodeError[]|undefined){
    this.rpn = rpn;
    this.errors = errors;
  }
}