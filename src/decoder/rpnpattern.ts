export class RpnPattern {
  regex: RegExp;
  len: number = 0;
  rpn: string = '';
  params?: string; // like names of regex named groups

  constructor(){
    this.regex = new RegExp(/ /);
  }
}
