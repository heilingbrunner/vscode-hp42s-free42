import { RpnLine } from './rpnline';
import { Decoder42 } from './decoder42';
import { RpnPattern } from './rpnpattern';
import { RpnProgram } from './rpnprogram';
import { CodeError } from '../common/codeerror';

export class RawParser {
  debug = 1; // debug level 0=nothing, 1=minimal, 2=verbose
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

      if (/1[0-9A-C]/.test(b0) || this.readingNumber) {
        //this.readingNumber || /1[0-9A-C]/.test(b0) || (/00/.test(b0) && this.readingNumber)
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
    if (size >= 3) {
      const end = this.raw[size - 3] + ' ' + this.raw[size - 2] + ' ' + this.raw[size - 1];
      if (end === 'C0 00 0D') {
        size -= 3;
      }
    }

    this.programs[0].size = size;
  }

  public parseNumber(index: number): number {
    let b0 = this.raw[index];

    // number detected
    if (!this.readingNumber) {
      this.readingNumber = true;
      this.number = '';
    }

    //put it together
    if (/(1[0-9A-C]|00)/.test(b0)) {
      this.number += b0 + ' ';

      //end of number ?
      if (/00/.test(b0)) {
        this.readingNumber = false;

        // create new line
        const rpnLine = new RpnLine();
        rpnLine.docRaw = this.number.trim();
        rpnLine.rawLength = this.number.length / 3; //'00 '
        rpnLine.workCode = '`num`';
        rpnLine.params.num = this.number.trim();

        // collect rawLines
        this.pushLine(rpnLine);
      }
    } else {
      this.readingNumber = false;

      // create new line
      const rpnLine = new RpnLine();
      rpnLine.docRaw = this.number;
      rpnLine.rawLength = this.number.length / 3; //'00 '
      rpnLine.error = new CodeError(-1, index, b0 + ' ...', 'Unknown byte sequence for number');
      rpnLine.params.num = this.number.trim();

      // collect rawLines
      this.pushLine(rpnLine);
    }

    return 1;
  }

  public parseCommand(index: number): number {
    // new temp maps
    const b0 = this.raw[index];

    const n0 = b0[0];

    // create new line
    const rpnLine = new RpnLine();

    let hex = '';

    // test first nibble
    if (Decoder42.rawMap.has(n0)) {
      //get patterns from first nibble
      let patterns = Decoder42.rawMap.get(n0);

      if (patterns) {
        //params
        let matched = false;

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
          this.checkLanguageId(pattern, hex);

          //match ?
          let match = hex.match(pattern.regex);
          if (match) {
            rpnLine.rawLength = pattern.len;
            // offset
            const next = index + pattern.len;

            // read parameters
            this.checkParamsInMatch(rpnLine, next, pattern, match);

            // check if strings are too long ?
            if (this.checkParseLength(rpnLine, next)) {
              break;
            }

            // check if str/lbl/nam found and adjust length ...
            rpnLine.rawLength += this.readStringParams(rpnLine, next);

            // increase length for
            // 'ASSIGN `nam` TO key'
            // 'KEY `key` GTO (|IND) `nam`'
            // 'KEY `key` XEQ (|IND) `nam`'

            // get all raw bytes of this code line
            hex += ' ';
            for (let j = pattern.len; j < rpnLine.rawLength; j++) {
              hex += this.raw[index + j] + ' ';
            }
            hex = hex.trim();

            // fill RpnLine
            rpnLine.docRaw = hex;
            rpnLine.workCode = pattern.rpn;

            // collect rawLines
            this.pushLine(rpnLine);

            // someting matched successfully
            matched = true;

            break;
          }
        }

        // no match, then error ...
        if (!matched) {
          rpnLine.docRaw = b0;
          rpnLine.error = new CodeError(-1, index, b0 + ' ...', 'Unknown byte sequence');
          this.pushLine(rpnLine);
        }
      }
    } else {
      // unknown nibble
      rpnLine.docRaw = hex;
      rpnLine.error = new CodeError(-1, index, b0 + ' ...', 'Unknown byte sequence');
      this.pushLine(rpnLine);
    }

    return rpnLine.rawLength;
  }

  /** Check all given matches to named params */
  private checkParamsInMatch(rpnLine: RpnLine, next: number, pattern: RpnPattern, match: RegExpMatchArray) {
    if (pattern.params) {
      const params = pattern.params.split(',');
      // assign params like regex named groups
      for (let p = 0; p < params.length; p++) {
        const param = params[p];
        let k = p + 1;
        switch (true) {
          case param === 'strl-2':
            rpnLine.params.strl = parseInt(match[k], 16) - 2;
            break;
          case param === 'strl-1':
            rpnLine.params.strl = parseInt(match[k], 16) - 1;
            break;
          case param === 'strl':
            rpnLine.params.strl = parseInt(match[k], 16);
            break;
          case param === 'lblno-1':
            rpnLine.params.lblno = parseInt(match[k], 16) - 1;
            break;
          case param === 'lblno':
            rpnLine.params.lblno = parseInt(match[k], 16);
            break;
          case param === 'lbll-2':
            rpnLine.params.lbll = parseInt(match[k], 16) - 2;
            break;
          case param === 'lbll-1':
            rpnLine.params.lbll = parseInt(match[k], 16) - 1;
            break;
          case param === 'lbll':
            rpnLine.params.lbll = parseInt(match[k], 16);
            break;
          case param === 'naml-2':
            rpnLine.params.naml = parseInt(match[k], 16) - 2;
            break;
          case param === 'naml-1':
            rpnLine.params.naml = parseInt(match[k], 16) - 1;
            break;
          case param === 'naml':
            rpnLine.params.naml = parseInt(match[k], 16);
            break;
          case param === 'reg-128':
            rpnLine.params.reg = match[k];
            rpnLine.params.regno = parseInt(match[k], 16) - 128;
            break;
          case param === 'reg':
            rpnLine.params.reg = match[k];
            rpnLine.params.regno = parseInt(match[k], 16);
            break;
          case param === 'stk':
            rpnLine.params.stkno = parseInt(match[k], 16);
            if (Decoder42.stackMap.has(rpnLine.params.stkno)) {
              rpnLine.params.stk = Decoder42.stackMap.get(rpnLine.params.stkno);
            }
            break;
          case param === 'dig':
            rpnLine.params.dig = match[k];
            rpnLine.params.digno = parseInt(match[k], 16);
            break;
          case param === 'flg':
            rpnLine.params.flg = match[k];
            rpnLine.params.flgno = parseInt(match[k], 16);
            break;
          case param === 'key++':
            // fetch key-byte after name
            rpnLine.params.key = rpnLine.params.naml ? this.raw[next + rpnLine.params.naml] : undefined;
            rpnLine.params.keyno = rpnLine.params.naml ? parseInt(this.raw[next + rpnLine.params.naml], 16) : undefined;
            // include key byte
            rpnLine.rawLength++;
            break;
          case param === 'key':
            rpnLine.params.key = match[k];
            rpnLine.params.keyno = parseInt(match[k], 16);
            break;
          case param === 'size':
            rpnLine.params.siz = match[k];
            rpnLine.params.sizno = parseInt(match[k].replace(' ', ''), 16);
          case param === 'ton':
            rpnLine.params.ton = match[k];
            rpnLine.params.tonno = parseInt(match[k], 16);
            break;
          default:
            break;
        }
      }
    }
  }

  private checkParseLength(rpnLine: RpnLine, next: number): boolean {
    const rawlength = this.raw.length;
    if (rpnLine.params.strl && next + rpnLine.params.strl >= rawlength) {
      return true;
    }
    if (rpnLine.params.lbll && next + rpnLine.params.lbll >= rawlength) {
      return true;
    }
    if (rpnLine.params.naml && next + rpnLine.params.naml >= rawlength) {
      return true;
    }

    return false;
  }
  /** Check if str/lbl/nam found and adjust length */
  private readStringParams(rpnLine: RpnLine, next: number) {
    if (rpnLine.params.strl) {
      rpnLine.params.str = '';
      // where the string starts ...
      for (let j = 0; j < rpnLine.params.strl; j++) {
        rpnLine.params.str += this.raw[next + j] + ' ';
      }
      rpnLine.params.str = rpnLine.params.str.trim();
      return rpnLine.params.strl;
    }
    if (rpnLine.params.lbll) {
      rpnLine.params.lbl = '';
      // where the string starts ...
      for (let j = 0; j < rpnLine.params.lbll; j++) {
        rpnLine.params.lbl += this.raw[next + j] + ' ';
      }
      rpnLine.params.lbl = rpnLine.params.lbl.trim();
      return rpnLine.params.lbll;
    }
    if (rpnLine.params.naml) {
      rpnLine.params.nam = '';
      // where the string starts ...
      for (let j = 0; j < rpnLine.params.naml; j++) {
        rpnLine.params.nam += this.raw[next + j] + ' ';
      }
      rpnLine.params.nam = rpnLine.params.nam.trim();
      return rpnLine.params.naml;
    }

    return 0;
  }

  private checkLanguageId(pattern: RpnPattern, hex: string) {
    if (pattern.len === 2) {
      // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
      let free42All =
        'A7 CF' +
        ' ' + // ACCEL
        'A7 D0' +
        ' ' + // LOCAT'
        'A7 D1' +
        ' ' + // HEADING'
        'A6 81' +
        ' ' + // ADATE
        'A6 84' +
        ' ' + // ATIME
        'A6 85' +
        ' ' + // ATIME24
        'A6 86' +
        ' ' + // CLK12
        'A6 87' +
        ' ' + // CLK24
        'A6 8C' +
        ' ' + // DATE
        'A6 8D' +
        ' ' + // DATE+
        'A6 8E' +
        ' ' + // DDAYS
        'A6 8F' +
        ' ' + // DMY
        'A6 90' +
        ' ' + // DOW
        'A6 91' +
        ' ' + // MDY
        'A6 9C' +
        ' '; // TIME
      let isFree42 = free42All.match(hex);
      if (isFree42) {
        this.languageId = 'free42';
      }
    }
  }

  private pushLine(rpnLine: RpnLine) {
    this.codeLineNo++;
    rpnLine.codeLineNo = this.codeLineNo;

    if (this.debug > 0) {
      console.log(rpnLine.docRaw + ' -> ' + rpnLine.workCode);
    }

    this.programs[0].addLine(rpnLine);
  }
}
