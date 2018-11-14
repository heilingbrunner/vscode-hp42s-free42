import { unstring } from "../typedefs";
import { RpnError } from "./rpnerror";

export class RpnResult{
  raw: unstring[];
  rpnErrors: RpnError[]|undefined;

  constructor(raw: unstring[], rpnErrors: RpnError[]|undefined){
    this.raw = raw;
    this.rpnErrors = rpnErrors;
  }
}