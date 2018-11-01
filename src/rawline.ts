import { unstring, unProgError } from './contracts';

export class RawLine {
  raw: unstring;
  progError: unProgError;

  constructor(raw: unstring, progError: unProgError) {
    this.raw = raw;
    this.progError = progError;
  }
}
