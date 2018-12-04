export class RpnLine {
  regex: RegExp;
  len: number = 0;
  rpn: string = '';
  params?: string;

  constructor(){
    this.regex = new RegExp(/ /);
  }
}
