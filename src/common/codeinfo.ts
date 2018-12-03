export class CodeInfo {
  regex: RegExp;
  len: number = 0;
  rpn: string = '';

  constructor(){
    this.regex = new RegExp(/ /);
  }
}
