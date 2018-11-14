import { unstring } from '../typedefs';
import { RpnError } from './rpnerror';

export class RawLine {
  raw: unstring;
  rpnError: RpnError | undefined;

  constructor(raw: unstring, rpnError: RpnError | undefined) {
    this.raw = raw;
    this.rpnError = rpnError;
  }
}
