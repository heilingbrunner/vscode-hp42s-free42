import { RawLine } from '../encoder/rawline';
import { DecoderFOCAL } from './decoderfocal';
import { unstring } from '../typedefs';
import { RpnLine } from './rpnline';

export class RawParser {
  parse(raw: string[]): RawLine[] {
    let rawlines: RawLine[] = [];
    let index = 0;
    let length = 0;
    let params: string[];

    let codeline = 0;
    let strlen = 0;
    let reg = 0;
    let ton = 0;
    let stk = 0;
    let csk = 0;

    while (index + length < raw.length) {
      let b0 = raw[index];
      let n0 = b0[0];

      // new temp maps
      let codeInfo: RpnLine[] | undefined;

      // test first nibble
      if (DecoderFOCAL.opCode.has(n0)) {
        codeInfo = DecoderFOCAL.opCode.get(n0);

        if (codeInfo) {
          length = 0;
          strlen = 0;
          // walk through all patterns
          for (let i = 0; i < codeInfo.length; i++) {
            const c = codeInfo[i];
            let hex = '';

            //get n-bytes from raw
            for (let j = 0; j < c.len; j++) {
              hex += raw[index + j] + ' ';
            }

            hex = hex.trim();

            //match ?
            let match = hex.match(c.regex);
            if (match) {
              
              length = c.len;

              //read parameters
              if (c.params) {
                params = c.params.split(',');
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

              length = c.len + strlen;
              hex += ' ';
              for (let j = c.len; j < length; j++) {
                hex += raw[index + j] + ' ';
              }

              hex = hex.trim();

              codeline++;
              console.log(codeline + ': ' + hex + ': ' + c.rpn + ', ' + c.len + ', ' + length);

              let rl = new RawLine(hex, undefined);
              rawlines.push(rl);

              break;
            }
          }

          // no match !
          if (length === 0) {
            // abort !
            return rawlines;
          }
        }
      }

      //rawlines.push(new RawLine{ raw=})
      index = index + length;
    }

    return rawlines;
  }
}
