import { RawLine } from '../common/rawline';

export class HexParser {
  parse(bytes: string[]): RawLine[] {
    let rawlines: RawLine[] = [];
    let index = 0;
    let length = 0;

    while (index + length < bytes.length) {
      let b0 = bytes[index];
      //first nibble
      switch (b0[0]) {
        case '0':
          break;
        case '2':
          break;
        case '3':
          break;
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          length = 1;
          break;
        case '9':
          switch (b0[1]) {
          }
          break;
        case 'A':
          //A0-A7
          switch (true) {
            case /A[0-7]/.test(b0):
              length = 2;
              break;
          }
          break;
        case 'B':
          break;
        case 'C':
          break;
        case 'D':
          break;
        case 'E':
          break;
        case 'F':
          break;
        default:
          length = 1;
          break;
      }

      let hex = bytes.slice(index, index + length);
      //rawlines.push(new RawLine{ raw=})
      index = index + length;
    }

    return rawlines;
  }
}
