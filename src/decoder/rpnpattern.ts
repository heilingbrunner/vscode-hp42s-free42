export class RpnPattern {
  regex: RegExp;
  len: number = 0;
  rpn: string = '';
  params?: string;

  constructor(){
    this.regex = new RegExp(/ /);
  }
}
