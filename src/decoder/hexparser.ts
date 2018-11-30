import { RawLine } from '../common/rawline';
import { DecoderFOCAL } from './decoderfocal';
import { unstring } from '../typedefs';

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
      let nibbleMap: Map<string, string> = new Map<string, string>();
      let byteMap: Map<string, string> = new Map<string, string>();
      let bytesMap: Map<string, string> = new Map<string, string>();

      // test first nibble
      DecoderFOCAL.opCode.forEach((value, key) => {
        if (key.startsWith(n0)) {
          console.log('nibbleMap: ' + key + ': ' + value);
          nibbleMap.set(key, value);
        }
      });

      if (nibbleMap.size > 0) {
        // test first byte
        nibbleMap.forEach((value, key) => {
          if (key.startsWith(b0)) {
            console.log('byteMap: ' + key + ': ' + value);
            byteMap.set(key, value);
          }
        });

        if(byteMap.size > 0){
          let minlength = 64;
          byteMap.forEach((value, key) => {
            // get min length
            let keylength = key.split(' ').length;
            minlength = (keylength<minlength) ? keylength : minlength;
          });

          // full match for fixed hex ?
          let nbytes = bytes.slice(index, index + minlength).join(' ').trim();
          if(byteMap.has(nbytes)){
            hex = nbytes;
            rpn = byteMap.get(nbytes);

            length = minlength;

            console.log(hex + ': ' + rpn);
          }

          // parameter included ...match b0 + n2 ?
          if(rpn !== undefined){
            let b1 = bytes[index+1];
            let n2 = b1[0];

            if(byteMap.has(b1 + ' ' + n2)){
              hex = nbytes;
              rpn = byteMap.get(b1 + ' ' + n2);
  
              length = minlength;
  
              console.log(hex + ': ' + rpn);
            }
            

            length = 1;
          }
        }
      }

      //rawlines.push(new RawLine{ raw=})
      index = index + length;
    }

    return rawlines;
  }
}
