import { RpnLine } from './rpnline';
import { DecoderFOCAL } from './decoderfocal';
import { RpnPattern } from './rpnpattern';
import { CodeError } from '../common/codeerror';
import { RpnProgram } from './rpnprogram';
import { Params } from '../common/params';
import { EncoderFOCAL } from '../encoder/encoderfocal';

export class RawParser {
  programs: RpnProgram[] = [];
  languageId = 'hp42s';

  private raw: string[];
  private codeLineNo: number = 0;
  private number: string = '';
  private readingNumber = false;

  constructor(raw: string[]) {
    this.raw = raw;
    // only one program used
    let program = new RpnProgram();
    this.programs.push(program);
  }

  parse() {
    //index walking through byte array
    let index = 0;

    while (index < this.raw.length) {
      let length = 0;
      let b0 = this.raw[index];
      let n0 = b0[0];

      if (/1[0-9A-C]/.test(b0) || (/00/.test(b0) && this.readingNumber)) {
        length = this.parseNumber(index);
      } else {
        length = this.parseCommand(index);
      }

      // no match !
      if (length === 0) {
        // abort !
        break;
      }

      index = index + length;
    }
    
    let size = this.raw.length;
    if (size >= 3){
      const end = this.raw[size-3] + ' ' + this.raw[size-2] + ' ' + this.raw[size-1];
      if(end === 'C0 00 0D'){
        size -= 3;
      }
    }
    
    this.programs[0].size = size;
  }

  private parseNumber(index: number): number {
    let b0 = this.raw[index];
    let n0 = b0[0];

    // number detected
    if (!this.readingNumber) {
      this.readingNumber = true;
      this.number = '';
    }

    //put it together
    this.number += b0 + ' ';

    //end of number ?
    if (/00/.test(b0)) {
      this.readingNumber = false;

      const rpnLine = new RpnLine();
      rpnLine.raw = this.number;
      rpnLine.normCode = '`num`';
      rpnLine.params.num = this.number;

      // collect rawLines
      this.pushRpnLine(rpnLine);
    }

    return 1;
  }

  private parseCommand(index: number): number {
    // new temp maps
    let b0 = this.raw[index];
    let n0 = b0[0];
    let hex = '';
    let length = 0;
    let patterns: RpnPattern[] | undefined;

    // test first nibble
    if (DecoderFOCAL.rawMap.has(n0)) {
      //get patterns from first nibble
      patterns = DecoderFOCAL.rawMap.get(n0);

      if (patterns) {
        //params
        let cpparams: string[];
        length = 0;

        // walk through all patterns
        for (let i = 0; i < patterns.length; i++) {
          // get
          const pattern = patterns[i];

          //get first n-bytes from raw
          hex = '';
          for (let j = 0; j < pattern.len; j++) {
            hex += this.raw[index + j] + ' ';
          }
          hex = hex.trim();

          //hp42s/free42 ?
          if (pattern.len === 2) {
            // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
            let free42All = 'A7 CF' + ' ' + // ACCEL
              'A7 D0' + ' ' + // LOCAT'
              'A7 D1' + ' ' + // HEADING'
              'A6 81' + ' ' + // ADATE
              'A6 84' + ' ' + // ATIME
              'A6 85' + ' ' + // ATIME24
              'A6 86' + ' ' + // CLK12
              'A6 87' + ' ' + // CLK24
              'A6 8C' + ' ' + // DATE
              'A6 8D' + ' ' + // DATE+
              'A6 8E' + ' ' + // DDAYS
              'A6 8F' + ' ' + // DMY
              'A6 90' + ' ' + // DOW
              'A6 91' + ' ' + // MDY
              'A6 9C' + ' '; // TIME
            let isFree42 = free42All.match(hex);
            if (isFree42) {
              this.languageId = 'free42';
            }
          }

          //match ?
          let match = hex.match(pattern.regex);
          if (match) {
            length = pattern.len;
            let rpnLine = new RpnLine();

            //read parameters
            if (pattern.params) {
              cpparams = pattern.params.split(',');

              for (let p = 0; p < cpparams.length; p++) {
                const param = cpparams[p];
                switch (true) {
                  case /strl-2/.test(param):
                  rpnLine.params.strl = parseInt(match[p + 1], 16) - 2;
                    break;
                  case /strl-1/.test(param):
                  rpnLine.params.strl = parseInt(match[p + 1], 16) - 1;
                    break;
                  case /strl/.test(param):
                  rpnLine.params.strl = parseInt(match[p + 1], 16);
                    break;
                  case /stk/.test(param):
                  rpnLine.params.stkno = match[p + 1];
                    let stk = parseInt(match[p + 1]);
                    if (DecoderFOCAL.stackMap.has(stk)) {
                      rpnLine.params.stk = DecoderFOCAL.stackMap.get(stk);
                    }
                    break;
                  case /csk/.test(param):
                  rpnLine.params.csk = match[p];
                  rpnLine.params.cskno = parseInt(match[p]);
                    break;
                  case /lblno-1/.test(param):
                  rpnLine.params.lblno = parseInt(match[p + 1], 16) - 1;
                    break;
                  case /lblno/.test(param):
                  rpnLine.params.lblno = parseInt(match[p + 1], 16);
                    break;
                  default:
                    break;
                }
              }
            }

            // get all raw bytes of this code
            length = pattern.len + (rpnLine.params.strl ? rpnLine.params.strl: 0);
            hex += ' ';
            for (let j = pattern.len; j < length; j++) {
              hex += this.raw[index + j] + ' ';
            }
            hex = hex.trim();

            // fill RpnLine
            rpnLine.raw = hex;
            rpnLine.normCode = pattern.rpn;

            // collect rawLines
            this.pushRpnLine(rpnLine);

            break;
          }
        }
      }
    }

    return length;
  }

  private pushRpnLine(rpnLine: RpnLine) {
    this.codeLineNo++;
    rpnLine.codeLineNo = this.codeLineNo;

    //this.printRpn(rpnLine);
    this.programs[0].addLine(rpnLine);
  }

  private printRpn(rpnline: RpnLine) {
    const text = rpnline.toString();
    console.log(text);
  }
}
