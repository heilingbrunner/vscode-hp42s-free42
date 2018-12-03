import { RawLine } from '../common/rawline';
import { DecoderFOCAL } from './decoderfocal';
import { unstring } from '../typedefs';
import { CodeInfo } from '../common/codeinfo';

export class HexParser {
  parse(raw: string[]): RawLine[] {
    let rawlines: RawLine[] = [];
    let index = 0;
    let length = 0;

    while (index + length < raw.length) {
      length = 0;
      let b0 = raw[index];
      let n0 = b0[0];

      // new temp maps
      let codeInfo: CodeInfo[] | undefined;

      // test first nibble
      if (DecoderFOCAL.opCode.has(n0)) {
        codeInfo = DecoderFOCAL.opCode.get(n0);

        if (codeInfo) {
          length = 0;
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
              console.log(hex + ': ' + c.len + ', ' + c.rpn);
              let rl = new RawLine(hex, undefined);
              rawlines.push(rl);
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
