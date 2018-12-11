import { RpnLine } from "./rpnline";
import { DecoderFOCAL } from "./decoderfocal";
import { RpnPattern } from "./rpnpattern";
import { RpnProgram } from "./rpnprogram";
import { CodeError } from "../common/codeerror";

export class RawParser {
  programs: RpnProgram[] = [];
  languageId = "hp42s";

  private raw: string[];
  private codeLineNo: number = 0;
  private number: string = "";
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
      const end = this.raw[size - 3] + " " + this.raw[size - 2] + " " + this.raw[size - 1];
      if (end === "C0 00 0D") {
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
      this.number = "";
    }

    //put it together
    if (/(1[0-9A-C]|00)/.test(b0)) {
      this.number += b0 + " ";

      //end of number ?
      if (/00/.test(b0)) {
        this.readingNumber = false;

        // create new line
        const rpnLine = new RpnLine();
        rpnLine.raw = this.number.trim();
        rpnLine.normCode = "`num`";
        rpnLine.params.num = this.number.trim();

        // collect rawLines
        this.pushRpnLine(rpnLine);
      }
    } else {
      this.readingNumber = false;

      // create new line
      const rpnLine = new RpnLine();
      rpnLine.raw = this.number;
      rpnLine.error = new CodeError(-1, index, b0 + " ...", "Unknown byte sequence for number");
      rpnLine.params.num = this.number.trim();

      // collect rawLines
      this.pushRpnLine(rpnLine);
    }

    return 1;
  }

  public parseCommand(index: number): number {
    // new temp maps
    const b0 = this.raw[index];
    const rawlength = this.raw.length;
    const n0 = b0[0];

    // create new line
    const rpnLine = new RpnLine();

    let hex = '';
    let length = 0;

    // test first nibble
    if (DecoderFOCAL.rawMap.has(n0)) {
      //get patterns from first nibble
      let patterns = DecoderFOCAL.rawMap.get(n0);

      if (patterns) {
        //params
        let matched = false;

        // walk through all patterns
        for (let i = 0; i < patterns.length; i++) {
          // get
          const pattern = patterns[i];

          //get first n-bytes from raw
          for (let j = 0; j < pattern.len; j++) {
            hex += this.raw[index + j] + ' ';
          }

          hex = hex.trim();

          //hp42s/free42 ?
          this.checkLanguageId(pattern, hex);

          //match ?
          let match = hex.match(pattern.regex);
          if (match) {
            length = pattern.len;
            // offset
            const offset = index + pattern.len;

            // read parameters
            this.checkParamsInMatch(pattern, rpnLine, match, offset);

            // check if strings are too long ?
            if (rpnLine.params.strl && offset + rpnLine.params.strl >= rawlength) {
              break;
            }
            if (rpnLine.params.lbll && offset + rpnLine.params.lbll >= rawlength) {
              break;
            }
            if (rpnLine.params.naml && offset + rpnLine.params.naml >= rawlength) {
              break;
            }

            // check if str/lbl/nam found and adjust length ...
            length += this.readStringParams(rpnLine, offset);

            // increase length for csk from 'ASSIGN `nam` TO csk'
            if (rpnLine.params.cskno) {
              length += 1;
            }

            // get all raw bytes of this code line
            hex += " ";
            for (let j = pattern.len; j < length; j++) {
              hex += this.raw[index + j] + " ";
            }
            hex = hex.trim();

            // fill RpnLine
            rpnLine.raw = hex;
            rpnLine.normCode = pattern.rpn;

            // collect rawLines
            this.pushRpnLine(rpnLine);

            // someting matched successfully
            matched = true;

            break;
          }
        }

        // no match, then error ...
        if (!matched) {
          rpnLine.raw = b0;
          rpnLine.error = new CodeError(-1, index, b0 + " ...", "Unknown byte sequence");
          this.pushRpnLine(rpnLine);
        }
      }
    } else {
      // unknown nibble
      rpnLine.raw = hex;
      rpnLine.error = new CodeError(-1, index, b0 + " ...", "Unknown byte sequence");
      this.pushRpnLine(rpnLine);
    }

    return length;
  }

  /** Check all given matches to named params */
  private checkParamsInMatch(pattern: RpnPattern, rpnLine: RpnLine, match: RegExpMatchArray, index: number) {
    if (pattern.params) {
      const params = pattern.params.split(",");
      // assign params like regex named groups
      for (let p = 0; p < params.length; p++) {
        const param = params[p];
        let k = p + 1;
        switch (true) {
          case /strl-2/.test(param):
            rpnLine.params.strl = parseInt(match[k], 16) - 2;
            break;
          case /strl-1/.test(param):
            rpnLine.params.strl = parseInt(match[k], 16) - 1;
            break;
          case /strl/.test(param):
            rpnLine.params.strl = parseInt(match[k], 16);
            break;
          case /lblno-1/.test(param):
            rpnLine.params.lblno = parseInt(match[k], 16) - 1;
            break;
          case /lblno/.test(param):
            rpnLine.params.lblno = parseInt(match[k], 16);
            break;
          case /lbll-2/.test(param):
            rpnLine.params.lbll = parseInt(match[k], 16) - 2;
            break;
          case /lbll-1/.test(param):
            rpnLine.params.lbll = parseInt(match[k], 16) - 1;
            break;
          case /lbll/.test(param):
            rpnLine.params.lbll = parseInt(match[k], 16);
            break;
          case /naml-2/.test(param):
            rpnLine.params.naml = parseInt(match[k], 16) - 2;
            break;
          case /naml-1/.test(param):
            rpnLine.params.naml = parseInt(match[k], 16) - 1;
            break;
          case /naml/.test(param):
            rpnLine.params.naml = parseInt(match[k], 16);
            break;
          case /reg-128/.test(param):
            rpnLine.params.reg = match[k];
            rpnLine.params.regno = parseInt(match[k], 16) - 128;
            break;
          case /reg/.test(param):
            rpnLine.params.reg = match[k];
            rpnLine.params.regno = parseInt(match[k], 16);
            break;
          case /stk/.test(param):
            rpnLine.params.stkno = match[k];
            let stk = parseInt(match[k], 16);
            if (DecoderFOCAL.stackMap.has(stk)) {
              rpnLine.params.stk = DecoderFOCAL.stackMap.get(stk);
            }
            break;
          case /dig/.test(param):
            rpnLine.params.dig = match[k];
            rpnLine.params.digno = parseInt(match[k], 16);
            break;
          case /csk\+1/.test(param):
            rpnLine.params.csk = rpnLine.params.naml ? this.raw[index + rpnLine.params.naml] : undefined;
            rpnLine.params.cskno = rpnLine.params.naml ? parseInt(this.raw[index + rpnLine.params.naml]) + 1 : undefined;
            break;
          case /flg/.test(param):
            rpnLine.params.flg = match[k];
            rpnLine.params.flgno = parseInt(match[k], 16);
            break;
          case /key/.test(param):
            rpnLine.params.key = match[k];
            rpnLine.params.keyno = parseInt(match[k], 16);
            break;
          case /size/.test(param):
            rpnLine.params.siz = match[k];
            rpnLine.params.sizno = parseInt(match[k], 16);
          case /ton/.test(param):
            rpnLine.params.ton = match[k];
            rpnLine.params.tonno = parseInt(match[k], 16);
            break;
          default:
            break;
        }
      }
    }
  }

  /** Check if str/lbl/nam found and adjust length */
  private readStringParams(rpnLine: RpnLine, offset: number) {
    if (rpnLine.params.strl) {
      rpnLine.params.str = "";
      // where the string starts ...
      for (let j = 0; j < rpnLine.params.strl; j++) {
        rpnLine.params.str += this.raw[offset + j] + " ";
      }
      rpnLine.params.str = rpnLine.params.str.trim();
      return rpnLine.params.strl;
    }
    if (rpnLine.params.lbll) {
      rpnLine.params.lbl = "";
      // where the string starts ...
      for (let j = 0; j < rpnLine.params.lbll; j++) {
        rpnLine.params.lbl += this.raw[offset + j] + " ";
      }
      rpnLine.params.lbl = rpnLine.params.lbl.trim();
      return rpnLine.params.lbll;
    }
    if (rpnLine.params.naml) {
      rpnLine.params.nam = "";
      // where the string starts ...
      for (let j = 0; j < rpnLine.params.naml; j++) {
        rpnLine.params.nam += this.raw[offset + j] + " ";
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
        "A7 CF" +
        " " + // ACCEL
        "A7 D0" +
        " " + // LOCAT'
        "A7 D1" +
        " " + // HEADING'
        "A6 81" +
        " " + // ADATE
        "A6 84" +
        " " + // ATIME
        "A6 85" +
        " " + // ATIME24
        "A6 86" +
        " " + // CLK12
        "A6 87" +
        " " + // CLK24
        "A6 8C" +
        " " + // DATE
        "A6 8D" +
        " " + // DATE+
        "A6 8E" +
        " " + // DDAYS
        "A6 8F" +
        " " + // DMY
        "A6 90" +
        " " + // DOW
        "A6 91" +
        " " + // MDY
        "A6 9C" +
        " "; // TIME
      let isFree42 = free42All.match(hex);
      if (isFree42) {
        this.languageId = "free42";
      }
    }
  }

  private pushRpnLine(rpnLine: RpnLine) {
    this.codeLineNo++;
    rpnLine.codeLineNo = this.codeLineNo;

    //this.printRpn(rpnLine);
    this.programs[0].addLine(rpnLine);
  }
}
