import { RawLine } from "../common/rawline";
import { DecoderFOCAL } from "./decoderfocal";
import { unstring } from "../typedefs";
import { CodeInfo } from "../common/codeinfo";

export class HexParser {
  parse(bytes: string[]): RawLine[] {
    let rawlines: RawLine[] = [];
    let index = 0;
    let length = 0;

    while (index + length < bytes.length) {
      length = 0;
      let b0 = bytes[index];
      let n0 = b0[0];
      let hex: unstring = undefined;
      let rpn: unstring = undefined;

      // new temp maps
      let nibbleMap: Map<string, CodeInfo> = new Map<string, CodeInfo>();
      let byteMap: Map<string, CodeInfo> = new Map<string, CodeInfo>();

      // test first nibble
      DecoderFOCAL.opCode.forEach((value, key) => {
        if (key.startsWith(n0)) {
          console.log("nibbleMap: " + key + ": " + value);
          nibbleMap.set(key, value);
        }
      });

      if (nibbleMap.size > 0) {
        // test first byte
        nibbleMap.forEach((value, key) => {
          if (key.startsWith(b0)) {
            console.log("byteMap: " + key + ": " + value);
            byteMap.set(key, value);
          }
        });

        if (byteMap.size > 0) {
          byteMap.forEach((value, key) => {
            let hex = "";

            for (let i = 0; i < value.len; i++) {
              hex += bytes[index + i]+ ' ';
            }

            hex = hex.trim();
            
            let match = hex.match(key);
            if (match) {
              console.log("match: " + match + "; " + key);
              length = value.len;
            }
          });

          length = length === 0 ? 1 : length;
        }
      }

      //rawlines.push(new RawLine{ raw=})
      index = index + length;
    }

    return rawlines;
  }
}
