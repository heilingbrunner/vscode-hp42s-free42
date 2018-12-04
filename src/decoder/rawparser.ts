import { RpnLine } from "./rpnline";
import { DecoderFOCAL } from "./decoderfocal";
import { unstring } from "../typedefs";
import { RpnPattern } from "./rpnpattern";
import { CodeError } from "../common/codeerror";

export class RawParser {
  private rpnLines: RpnLine[] = [];
  private raw: string[];
  private codeLineNo: number = 0;
  private number: string = '';
  private numberLength: number = 0;
  private readingNumber = false;

  constructor(raw: string[]) {
    this.raw = raw;
  }

  parse() {
    let codeLineNo = 0;
    let index = 0;
    let length = 0;

    while (index < this.raw.length) {
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
  }

  private parseNumber(index: number): number {
    let b0 = this.raw[index];
    let n0 = b0[0];

    // number detected
    if (!this.readingNumber) {
      this.readingNumber = true;
      this.number = '';
      this.numberLength = 0;
    }

    //put it together
    this.number += b0 + ' ';
    this.numberLength += 1;

    //end of number ?
    if (/00/.test(b0)) {
      this.readingNumber = false;

      // collect rawLines
      this.pushRpnLine(this.number, undefined);
    }

    return 1;
  }

  private parseCommand(index: number): number {
    // new temp maps
    let b0 = this.raw[index];
    let n0 = b0[0];
    let hex = '';
    let pattern: RpnPattern[] | undefined;

    //params
    let params: string[];
    let length = 0;
    let strlen = 0;
    let reg = 0;
    let ton = 0;
    let stk = 0;
    let csk = 0;

    // test first nibble
    if (DecoderFOCAL.opCode.has(n0)) {
      //get patterns from first nibble
      pattern = DecoderFOCAL.opCode.get(n0);

      if (pattern) {
        length = 0;
        strlen = 0;
        // walk through all patterns
        for (let i = 0; i < pattern.length; i++) {
          // get
          const cp = pattern[i];

          //get n-bytes from raw
          hex = '';
          for (let j = 0; j < cp.len; j++) {
            hex += this.raw[index + j] + " ";
          }

          hex = hex.trim();

          //match ?
          let match = hex.match(cp.regex);
          if (match) {
            length = cp.len;

            //read parameters
            if (cp.params) {
              params = cp.params.split(",");
              for (let p = 0; p < params.length; p++) {
                const param = params[p];
                switch (true) {
                  case /strlen-2/.test(param):
                    strlen = parseInt(match[p + 1], 16) - 2;
                    break;
                  case /strlen-1/.test(param):
                    strlen = parseInt(match[p + 1], 16) - 1;
                    break;
                  case /strlen/.test(param):
                    strlen = parseInt(match[p + 1], 16);
                    break;
                  case /stk/.test(param):
                    stk = parseInt(match[p + 1]);
                    break;
                  case /csk/.test(param):
                    csk = parseInt(match[p]);
                    break;
                  case /lblnumber-1/.test(param):
                    strlen = parseInt(match[p + 1], 16) - 1;
                    break;
                  case /lblnumber/.test(param):
                    strlen = parseInt(match[p + 1], 16);
                    break;
                  default:
                    break;
                }
              }
            }

            length = cp.len + strlen;
            hex += " ";
            for (let j = cp.len; j < length; j++) {
              hex += this.raw[index + j] + " ";
            }

            hex = hex.trim();

            // collect rawLines
            this.pushRpnLine(hex, undefined);

            break;
          }
        }
      }
    }

    return length;
  }

  private pushRpnLine(hex: string, error?: CodeError) {
    this.codeLineNo++;
    let rpnLine = new RpnLine(this.codeLineNo, hex, error);

    this.printRpn(rpnLine);
    this.rpnLines.push(rpnLine);
  }

  private printRpn(rpnline: RpnLine) {
    const text = rpnline.toString();
    console.log(text);
  }
}
