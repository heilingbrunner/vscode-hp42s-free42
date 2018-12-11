export class RawPattern {
    regex: RegExp;
    len: number = 0;
    raw: string = '';
    params?: string; // like names of regex named groups
  
    constructor(){
      this.regex = new RegExp(/ /);
    }
  }
  