export class RawPattern {
  regex: RegExp;
  raw: string = '';
  params?: string; // like names of regex named groups

  constructor() {
    this.regex = new RegExp(/ /);
  }
}
