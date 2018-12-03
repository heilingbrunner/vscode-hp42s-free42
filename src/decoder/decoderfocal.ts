import { unstring } from '../typedefs';
import { CodeError } from '../common/codeerror';
import { CodeInfo } from '../common/codeinfo';

export class DecoderFOCAL {
  //#region Members

  static opCode: Map<string, CodeInfo[]> = new Map<string, CodeInfo[]>();

  static initializedForDecode: boolean = false;

  //#endregion

  //#region public

  static initializeForDecode() {
    if (!DecoderFOCAL.initializedForDecode) {
      // transform arr_opCode -> opCode
      DecoderFOCAL.arr_opCode.forEach((e: { key: string; value: CodeInfo[] }) => {
        DecoderFOCAL.opCode.set(e.key, e.value);
      });

      DecoderFOCAL.initializedForDecode = true;
    }
  }

  /** Raw to code
   * Input:
   * raw: raw hex code
   * Output:
   * languageId: free42/hp42s
   * code: The code
   * error: error
   */
  static toRpn(hex: string): [string, unstring, CodeError] {
    let error: CodeError = new CodeError(0, '', 'Not implemented yet!');
    let languageId: string = 'free42';

    return [languageId, undefined, error];
  }

  //#endregion

  //#region Hex Operations

  /** Changing strings into corresponding opcodes (also adjusting the
   * instruction length in "Fn" byte).
   */
  static extractStringfromRaw(raw: unstring): unstring {
    let str: unstring;

    //if (raw !== undefined) {
    //  if (str !== undefined) {
    //    let len_str = str.length;
    //    let pos_Fn = raw.indexOf("Fn");
    //
    //    len_str = str.length;
    //
    //    // str too long ? len > 14: max concat string length; 15: opcodes with Fn; 7: else
    //    if (len_str > (raw.match("Fn 7F") ? 14 : raw.match("Fn") ? 15 : 7)) {
    //      //TODO: error !!
    //    }
    //
    //    // loop each character in str and append hex to opcode
    //    str.split("").forEach(character => {
    //      raw += " " + DecoderFOCAL.convertByteAsHex(character.charCodeAt(0));
    //    });
    //
    //    // ASSIGN opcode search, replace aa
    //    raw = raw.replace(/ aa(.*)/, "$1 nn");
    //
    //    const length_hex_after_Fn = (raw.length - (pos_Fn + 2)) / 3;
    //
    //    //console.log(
    //    //  HP42SEncoder.convertNumberToHexString(240 + length_hex_after_Fn)
    //    //);
    //
    //    // concat three parts ...
    //    raw =
    //      raw.substr(0, pos_Fn) + // 1. part
    //      DecoderFOCAL.convertByteAsHex(240 + length_hex_after_Fn) + // 2. part
    //      raw.substr(pos_Fn + 2); // 3. part
    //  } else {
    //    raw = undefined;
    //  }
    //}

    return str;
  }

  /** Insert a number into raw */
  static extractNumberfromRaw(raw: unstring): unstring {
    let num: unstring;

    //if (raw !== undefined && num !== undefined) {
    //  let int = parseInt(num);
    //  let match: RegExpMatchArray | null = null;
    //
    //  switch (true) {
    //    case /kk/.test(raw):
    //      raw = raw.replace(/kk/, DecoderFOCAL.convertByteAsHex(int));
    //      break;
    //
    //    case /rr/.test(raw):
    //      raw = raw.replace(/rr/, DecoderFOCAL.convertByteAsHex(int));
    //      break;
    //
    //    case /nn/.test(raw):
    //      // numbered label 00-99, digits 00-11
    //      raw = raw.replace(/nn/, DecoderFOCAL.convertByteAsHex(int));
    //      break;
    //
    //    case /ll/.test(raw):
    //      // char label as number A-J,a-e
    //      raw = raw.replace(/ll/, "CF " + DecoderFOCAL.convertByteAsHex(int));
    //      break;
    //
    //    case /ww ww/.test(raw):
    //      // SIZE
    //      raw = raw.replace(
    //        /ww ww/,
    //        DecoderFOCAL.convertByteAsHex(int / 256) +
    //        " " +
    //        DecoderFOCAL.convertByteAsHex(int % 256)
    //      );
    //      break;
    //
    //    case /([\dA-F])l/.test(raw):
    //      // not working: hex = hex.replace(/([\dA-F])l/, this.convertNumberToHexString(parseInt('0x' + '$1' + '0') + 1 + int));
    //      match = raw.match(/([\dA-F])l/);
    //      if (match) {
    //        raw = raw.replace(
    //          /([\dA-F])l/,
    //          DecoderFOCAL.convertByteAsHex(
    //  parseInt("0x" + match[1] + "0") + 1 + int
    //          )
    //        );
    //      }
    //      break;
    //
    //    case /(\d)r/.test(raw):
    //      // not working: $1
    //      match = raw.match(/(\d)r/);
    //      if (match) {
    //        raw = raw.replace(
    //          /(\d)r/,
    //          DecoderFOCAL.convertByteAsHex(parseInt(match[1]) * 16 + int)
    //        );
    //      }
    //      break;
    //
    //    case /([\dA-F])t/.test(raw):
    //      // stack, not working: $1
    //      match = raw.match(/([\dA-F])t/);
    //      if (match) {
    //        raw = raw.replace(/([\dA-F])t/, match[1] + num);
    //      }
    //      break;
    //
    //    default:
    //      break;
    //  }
    //} else {
    //  raw = undefined;
    //}

    return num;
  }

  /** Changing numbers into corresponding opcodes.
   * "1.234E-455" -> 11 1A 12 13 14 1B 1C 14 15 15 00
   */
  static convertRawToNumber(raw: unstring): unstring {
    let number: unstring;
    //if (num !== undefined) {
    //  // "1.234E-455" -> 11 1A 12 13 14 1B 1C 14 15 15 00
    //  num =
    //    num
    //      .replace(/(\d)/g, " 1$1") // replace 1234E-455                 -> 11 .  12 13 14 E  -  14 15 15
    //      .replace(/\./, " 1A") // replace .                             -> 11 1A 12 13 14 E  -  14 15 15
    //      .replace(/(ᴇ|e|E)/, " 1B") // replace (ᴇ|e|E)                  -> 11 1A 12 13 14 1B -  14 15 15
    //      .replace(/-/g, " 1C") // replace - -> 1C                       -> 11 1A 12 13 14 1B 1C 14 15 15
    //      .replace(" ", "") + " 00"; // remove first space + append 00   ->11 1A 12 13 14 1B 1C 14 15 15 00
    //}

    return number;
  }

  /** Changing integers (size one byte, 0-255) into hex string .
   * 123 -> 7B, 255 -> FF
   */
  static convertByteAsHex(byte: number): string {
    let hex = ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
    return hex;
  }

  //#endregion

  //#region Arrays

  /*
  private static arr_opCode = [
    { key: '00', value: 'NULL' },
    { key: '0l', value: 'LBL sl' },
    { key: '1D Fn', value: 'GTO `lbl`' },
    { key: '1E Fn', value: 'XEQ `lbl`' },
    { key: '2r', value: 'RCL sr' },
    { key: '3r', value: 'STO sr' },
    { key: '40', value: '+' },
    { key: '41', value: '-' },
    { key: '42', value: '×' },
    { key: '43', value: '÷' },
    { key: '44', value: 'X<Y?' },
    { key: '45', value: 'X>Y?' },
    { key: '46', value: 'X≤Y?' },
    { key: '47', value: 'Σ+' },
    { key: '48', value: 'Σ-' },
    { key: '49', value: 'HMS+' },
    { key: '4A', value: 'HMS-' },
    { key: '4B', value: 'MOD' },
    { key: '4C', value: '%' },
    { key: '4D', value: '%CH' },
    { key: '4E', value: '→REC' },
    { key: '4F', value: '→POL' },
    { key: '50', value: 'LN' },
    { key: '51', value: 'X↑2' },
    { key: '52', value: 'SQRT' },
    { key: '53', value: 'Y↑X' },
    { key: '54', value: '+/-' },
    { key: '55', value: 'E↑X' },
    { key: '56', value: 'LOG' },
    { key: '57', value: '10↑X' },
    { key: '58', value: 'E↑X-1' },
    { key: '59', value: 'SIN' },
    { key: '5A', value: 'COS' },
    { key: '5B', value: 'TAN' },
    { key: '5C', value: 'ASIN' },
    { key: '5D', value: 'ACOS' },
    { key: '5E', value: 'ATAN' },
    { key: '5F', value: '→DEC' },
    { key: '60', value: '1/X' },
    { key: '61', value: 'ABS' },
    { key: '62', value: 'N!' },
    { key: '63', value: 'X≠0?' },
    { key: '64', value: 'X>0?' },
    { key: '65', value: 'LN1+X' },
    { key: '66', value: 'X<0?' },
    { key: '67', value: 'X=0?' },
    { key: '68', value: 'IP' },
    { key: '69', value: 'FP' },
    { key: '6A', value: '→RAD' },
    { key: '6B', value: '→DEG' },
    { key: '6C', value: '→HMS' },
    { key: '6D', value: '→HR' },
    { key: '6E', value: 'RND' },
    { key: '6F', value: '→OCT' },
    { key: '70', value: 'CLΣ' },
    { key: '71', value: 'X≶Y' },
    { key: '72', value: 'PI' },
    { key: '73', value: 'CLST' },
    { key: '74', value: 'R↑' },
    { key: '75', value: 'R↓' },
    { key: '76', value: 'LASTX' },
    { key: '77', value: 'CLX' },
    { key: '78', value: 'X=Y?' },
    { key: '79', value: 'X≠Y?' },
    { key: '7A', value: 'SIGN' },
    { key: '7B', value: 'X≤0?' },
    { key: '7C', value: 'MEAN' },
    { key: '7D', value: 'SDEV' },
    { key: '7E', value: 'AVIEW' },
    { key: '7F', value: 'CLD' },
    { key: '80', value: 'DEG' },
    { key: '81', value: 'RAD' },
    { key: '82', value: 'GRAD' },
    { key: '83', value: 'ENTER' },
    { key: '84', value: 'STOP' },
    { key: '85', value: 'RTN' },
    { key: '86', value: 'BEEP' },
    { key: '87', value: 'CLA' },
    { key: '88', value: 'ASHF' },
    { key: '89', value: 'PSE' },
    { key: '8A', value: 'CLRG' },
    { key: '8B', value: 'AOFF' },
    { key: '8C', value: 'AON' },
    { key: '8D', value: 'OFF' },
    { key: '8E', value: 'PROMPT' },
    { key: '8F', value: 'ADV' },
    { key: '90 7t', value: 'RCL ST `stk`' },
    { key: '90 8r', value: 'RCL IND rr|reg' },
    { key: '90 Ft', value: 'RCL IND ST `stk`' },
    { key: '90 rr|reg', value: 'RCL rr|reg' },
    { key: '91 7t', value: 'STO ST `stk`' },
    { key: '91 8r', value: 'STO IND rr|reg' },
    { key: '91 Ft', value: 'STO IND ST `stk`' },
    { key: '91 rr|reg', value: 'STO rr|reg' },
    { key: '92 7t', value: 'STO+ ST `stk`' },
    { key: '92 8r', value: 'STO+ IND rr|reg' },
    { key: '92 Ft', value: 'STO+ IND ST `stk`' },
    { key: '92 rr|reg', value: 'STO+ rr|reg' },
    { key: '93 7t', value: 'STO- ST `stk`' },
    { key: '93 8r', value: 'STO- IND rr|reg' },
    { key: '93 Ft', value: 'STO- IND ST `stk`' },
    { key: '93 rr|reg', value: 'STO- rr|reg' },
    { key: '94 7t', value: 'STO× ST `stk`' },
    { key: '94 8r', value: 'STO× IND rr|reg' },
    { key: '94 Ft', value: 'STO× IND ST `stk`' },
    { key: '94 rr|reg', value: 'STO× rr|reg' },
    { key: '95 7t', value: 'STO÷ ST `stk`' },
    { key: '95 8r', value: 'STO÷ IND rr|reg' },
    { key: '95 Ft', value: 'STO÷ IND ST `stk`' },
    { key: '95 rr|reg', value: 'STO÷ rr|reg' },
    { key: '96 7t', value: 'ISG ST `stk`' },
    { key: '96 8r', value: 'ISG IND rr|reg' },
    { key: '96 Ft', value: 'ISG IND ST `stk`' },
    { key: '96 rr|reg', value: 'ISG rr|reg' },
    { key: '97 7t', value: 'DSE ST `stk`' },
    { key: '97 8r', value: 'DSE IND rr|reg' },
    { key: '97 Ft', value: 'DSE IND ST `stk`' },
    { key: '97 rr|reg', value: 'DSE rr|reg' },
    { key: '98 7t', value: 'VIEW ST `stk`' },
    { key: '98 8r', value: 'VIEW IND rr|reg' },
    { key: '98 Ft', value: 'VIEW IND ST `stk`' },
    { key: '98 rr|reg', value: 'VIEW rr|reg' },
    { key: '99 8r', value: 'ΣREG IND rr|reg' },
    { key: '99 Ft', value: 'ΣREG IND ST `stk`' },
    { key: '99 rr|reg', value: 'ΣREG rr|reg' },
    { key: '9A 7t', value: 'ASTO ST `stk`' },
    { key: '9A 8r', value: 'ASTO IND rr|reg' },
    { key: '9A Ft', value: 'ASTO IND ST `stk`' },
    { key: '9A rr|reg', value: 'ASTO rr|reg' },
    { key: '9B 7t', value: 'ARCL ST `stk`' },
    { key: '9B 8r', value: 'ARCL IND rr|reg' },
    { key: '9B Ft', value: 'ARCL IND ST `stk`' },
    { key: '9B rr|reg', value: 'ARCL rr|reg' },
    { key: '9C 8r', value: 'FIX IND rr|reg' },
    { key: '9C Ft', value: 'FIX IND ST `stk`' },
    { key: '9C nn', value: 'FIX sd' },
    { key: '9D 8r', value: 'SCI IND rr|reg' },
    { key: '9D Ft', value: 'SCI IND ST `stk`' },
    { key: '9D nn', value: 'SCI sd' },
    { key: '9E 8r', value: 'ENG IND rr|reg' },
    { key: '9E Ft', value: 'ENG IND ST `stk`' },
    { key: '9E nn', value: 'ENG sd' },
    { key: '9F 8r', value: 'TONE IND rr|reg' },
    { key: '9F Ft', value: 'TONE IND ST `stk`' },
    { key: '9F rr|reg', value: 'TONE tn' },
    { key: 'A0 61', value: 'SINH' },
    { key: 'A0 62', value: 'COSH' },
    { key: 'A0 63', value: 'TANH' },
    { key: 'A0 64', value: 'ASINH' },
    { key: 'A0 65', value: 'ATANH' },
    { key: 'A0 66', value: 'ACOSH' },
    { key: 'A0 6F', value: 'COMB' },
    { key: 'A0 70', value: 'PERM' },
    { key: 'A0 71', value: 'RAN' },
    { key: 'A0 72', value: 'COMPLEX' },
    { key: 'A0 73', value: 'SEED' },
    { key: 'A0 74', value: 'GAMMA' },
    { key: 'A0 9F', value: 'BEST' },
    { key: 'A0 A0', value: 'EXPF' },
    { key: 'A0 A1', value: 'LINF' },
    { key: 'A0 A2', value: 'LOGF' },
    { key: 'A0 A3', value: 'PWRF' },
    { key: 'A0 A4', value: 'SLOPE' },
    { key: 'A0 A5', value: 'SUM' },
    { key: 'A0 A6', value: 'YINT' },
    { key: 'A0 A7', value: 'COrr|reg' },
    { key: 'A0 A8', value: 'FCSTX' },
    { key: 'A0 A9', value: 'FCSTY' },
    { key: 'A0 AA', value: 'INSR' },
    { key: 'A0 AB', value: 'DELR' },
    { key: 'A0 AC', value: 'WMEAN' },
    { key: 'A0 AD', value: 'LINΣ' },
    { key: 'A0 AE', value: 'ALLΣ' },
    { key: 'A0 E2', value: 'HEXM' },
    { key: 'A0 E3', value: 'DECM' },
    { key: 'A0 E4', value: 'OCTM' },
    { key: 'A0 E5', value: 'BINM' },
    { key: 'A0 E6', value: 'BASE+' },
    { key: 'A0 E7', value: 'BASE-' },
    { key: 'A0 E8', value: 'BASE×' },
    { key: 'A0 E9', value: 'BASE÷' },
    { key: 'A0 EA', value: 'BASE±' },
    { key: 'A2 59', value: 'POLAR' },
    { key: 'A2 5A', value: 'RECT' },
    { key: 'A2 5B', value: 'RDX.' },
    { key: 'A2 5C', value: 'RDX,' },
    { key: 'A2 5D', value: 'ALL' },
    { key: 'A2 5E', value: 'MENU' },
    { key: 'A2 5F', value: 'X≥0?' },
    { key: 'A2 60', value: 'X≥Y?' },
    { key: 'A2 62', value: 'CLKEYS' },
    { key: 'A2 63', value: 'KEYASN' },
    { key: 'A2 64', value: 'LCLBL' },
    { key: 'A2 65', value: 'REAL?' },
    { key: 'A2 66', value: 'MAT?' },
    { key: 'A2 67', value: 'CPX?' },
    { key: 'A2 68', value: 'STR?' },
    { key: 'A2 6A', value: 'CPXRES' },
    { key: 'A2 6B', value: 'REALRES' },
    { key: 'A2 6C', value: 'EXITALL' },
    { key: 'A2 6D', value: 'CLMENU' },
    { key: 'A2 6E', value: 'GETKEY' },
    { key: 'A2 6F', value: 'CUSTOM' },
    { key: 'A2 70', value: 'ON' },
    { key: 'A5 87', value: 'NOT' },
    { key: 'A5 88', value: 'AND' },
    { key: 'A5 89', value: 'OR' },
    { key: 'A5 8A', value: 'XOR' },
    { key: 'A5 8B', value: 'ROTXY' },
    { key: 'A5 8C', value: 'BIT?' },
    { key: 'A6 31', value: 'AIP' },
    { key: 'A6 41', value: 'ALENG' },
    { key: 'A6 46', value: 'AROT' },
    { key: 'A6 47', value: 'ATOX' },
    { key: 'A6 5C', value: 'POSA' },
    { key: 'A6 6F', value: 'XTOA' },
    { key: 'A6 78', value: 'ΣREG?' },
    { key: 'A6 81', value: 'ADATE' },
    { key: 'A6 84', value: 'ATIME' },
    { key: 'A6 85', value: 'ATIME24' },
    { key: 'A6 86', value: 'CLK12' },
    { key: 'A6 87', value: 'CLK24' },
    { key: 'A6 8C', value: 'DATE' },
    { key: 'A6 8D', value: 'DATE+' },
    { key: 'A6 8E', value: 'DDAYS' },
    { key: 'A6 8F', value: 'DMY' },
    { key: 'A6 90', value: 'DOW' },
    { key: 'A6 91', value: 'MDY' },
    { key: 'A6 9C', value: 'TIME' },
    { key: 'A6 C9', value: 'TRANS' },
    { key: 'A6 CA', value: 'CROSS' },
    { key: 'A6 CB', value: 'DOT' },
    { key: 'A6 CC', value: 'DET' },
    { key: 'A6 CD', value: 'UVEC' },
    { key: 'A6 CE', value: 'INVRT' },
    { key: 'A6 CF', value: 'FNRM' },
    { key: 'A6 D0', value: 'RSUM' },
    { key: 'A6 D1', value: 'R<>R' },
    { key: 'A6 D2', value: 'I+' },
    { key: 'A6 D3', value: 'I-' },
    { key: 'A6 D4', value: 'J+' },
    { key: 'A6 D5', value: 'J-' },
    { key: 'A6 D6', value: 'STOEL' },
    { key: 'A6 D7', value: 'RCLEL' },
    { key: 'A6 D8', value: 'STOIJ' },
    { key: 'A6 D9', value: 'RCLIJ' },
    { key: 'A6 DA', value: 'NEWMAT' },
    { key: 'A6 DB', value: 'OLD' },
    { key: 'A6 DC', value: '←' },
    { key: 'A6 DD', value: '→' },
    { key: 'A6 DE', value: '↑' },
    { key: 'A6 DF', value: '↓' },
    { key: 'A6 E1', value: 'EDIT' },
    { key: 'A6 E2', value: 'WRAP' },
    { key: 'A6 E3', value: 'GROW' },
    { key: 'A6 E7', value: 'DIM?' },
    { key: 'A6 E8', value: 'GETM' },
    { key: 'A6 E9', value: 'PUTM' },
    { key: 'A6 EA', value: '[MIN]' },
    { key: 'A6 EB', value: '[MAX]' },
    { key: 'A6 EC', value: '[FIND]' },
    { key: 'A6 ED', value: 'RNRM' },
    { key: 'A7 48', value: 'PRA' },
    { key: 'A7 52', value: 'PRΣ' },
    { key: 'A7 53', value: 'PRSTK' },
    { key: 'A7 54', value: 'PRX' },
    { key: 'A7 5B', value: 'MAN' },
    { key: 'A7 5C', value: 'NORM' },
    { key: 'A7 5D', value: 'TRACE' },
    { key: 'A7 5E', value: 'PRON' },
    { key: 'A7 5F', value: 'PROFF' },
    { key: 'A7 60', value: 'DELAY' },
    { key: 'A7 61', value: 'PRUSR' },
    { key: 'A7 62', value: 'PRLCD' },
    { key: 'A7 63', value: 'CLLCD' },
    { key: 'A7 64', value: 'AGRAPH' },
    { key: 'A7 65', value: 'PIXEL' },
    { key: 'A7 CF', value: 'ACCEL' },
    { key: 'A7 D0', value: 'LOCAT' },
    { key: 'A7 D1', value: 'HEADING' },
    { key: 'A8 8r', value: 'SF IND rr|reg' },
    { key: 'A8 Ft', value: 'SF IND ST `stk`' },
    { key: 'A8 rr|reg', value: 'SF rr|reg' },
    { key: 'A9 8r', value: 'CF IND rr|reg' },
    { key: 'A9 Ft', value: 'CF IND ST `stk`' },
    { key: 'A9 rr|reg', value: 'CF rr|reg' },
    { key: 'AA 8r', value: 'FS?C IND rr|reg' },
    { key: 'AA Ft', value: 'FS?C IND ST `stk`' },
    { key: 'AA rr|reg', value: 'FS?C rr|reg' },
    { key: 'AB 8r', value: 'FC?C IND rr|reg' },
    { key: 'AB Ft', value: 'FC?C IND ST `stk`' },
    { key: 'AB rr|reg', value: 'FC?C rr|reg' },
    { key: 'AC 8r', value: 'FS? IND rr|reg' },
    { key: 'AC Ft', value: 'FS? IND ST `stk`' },
    { key: 'AC rr|reg', value: 'FS? rr|reg' },
    { key: 'AD 8r', value: 'FC? IND rr|reg' },
    { key: 'AD Ft', value: 'FC? IND ST `stk`' },
    { key: 'AD rr|reg', value: 'FC? rr|reg' },
    { key: 'AE 7t', value: 'GTO IND ST `stk`' },
    { key: 'AE 8r', value: 'XEQ IND rr|reg' },
    { key: 'AE Ft', value: 'XEQ IND ST `stk`' },
    { key: 'AE nn', value: 'GTO IND rr|reg' },
    { key: 'Bl 00', value: 'GTO sl' },
    { key: 'C0 00 0D', value: '.END.' },
    { key: 'C0 00 0D', value: 'END' },
    { key: 'C0 00 Fn 00', value: 'LBL `lbl`' },
    { key: 'CE 7t', value: 'X<> ST `stk`' },
    { key: 'CE 8r', value: 'X<> IND rr|reg' },
    { key: 'CE Ft', value: 'X<> IND ST `stk`' },
    { key: 'CE rr|reg', value: 'X<> rr|reg' },
    { key: 'CF nn', value: 'LBL ll' },
    { key: 'D0 00 nn', value: 'GTO ll' },
    { key: 'E0 00 nn', value: 'XEQ ll' },
    { key: 'E0 00 nn', value: 'XEQ sl' },
    { key: 'F1 D5', value: 'FIX 10' },
    { key: 'F1 D6', value: 'SCI 10' },
    { key: 'F1 D7', value: 'ENG 10' },
    { key: 'F1 E5', value: 'FIX 11' },
    { key: 'F1 E6', value: 'SCI 11' },
    { key: 'F1 E7', value: 'ENG 11' },
    { key: 'F2 D0 7t', value: 'INPUT ST `stk`' },
    { key: 'F2 D0 rr|reg', value: 'INPUT rr|reg' },
    { key: 'F2 D1 7t', value: 'RCL+ ST `stk`' },
    { key: 'F2 D1 8r', value: 'RCL+ IND rr|reg' },
    { key: 'F2 D1 Ft', value: 'RCL+ IND ST `stk`' },
    { key: 'F2 D1 rr|reg', value: 'RCL+ rr|reg' },
    { key: 'F2 D2 7t', value: 'RCL- ST `stk`' },
    { key: 'F2 D2 8r', value: 'RCL- IND rr|reg' },
    { key: 'F2 D2 Ft', value: 'RCL- IND ST `stk`' },
    { key: 'F2 D2 rr|reg', value: 'RCL- rr|reg' },
    { key: 'F2 D3 7t', value: 'RCL× ST `stk`' },
    { key: 'F2 D3 8r', value: 'RCL× IND rr|reg' },
    { key: 'F2 D3 Ft', value: 'RCL× IND ST `stk`' },
    { key: 'F2 D3 rr|reg', value: 'RCL× rr|reg' },
    { key: 'F2 D4 7t', value: 'RCL÷ ST `stk`' },
    { key: 'F2 D4 8r', value: 'RCL÷ IND rr|reg' },
    { key: 'F2 D4 Ft', value: 'RCL÷ IND ST `stk`' },
    { key: 'F2 D4 rr|reg', value: 'RCL÷ rr|reg' },
    { key: 'F2 D8 8r', value: 'CLV IND rr|reg' },
    { key: 'F2 D8 Ft', value: 'CLV IND ST `stk`' },
    { key: 'F2 D9 8r', value: 'PRV IND rr|reg' },
    { key: 'F2 D9 Ft', value: 'PRV IND ST `stk`' },
    { key: 'F2 DA 8r', value: 'INDEX IND rr|reg' },
    { key: 'F2 DA Ft', value: 'INDEX IND ST `stk`' },
    { key: 'F2 E8 8r', value: 'PGMINT IND rr|reg' },
    { key: 'F2 E8 Ft', value: 'PGMINT IND ST `stk`' },
    { key: 'F2 E9 8r', value: 'PGMSLV IND rr|reg' },
    { key: 'F2 E9 Ft', value: 'PGMSLV IND ST `stk`' },
    { key: 'F2 EA 8r', value: 'INTEG IND rr|reg' },
    { key: 'F2 EA Ft', value: 'INTEG IND ST `stk`' },
    { key: 'F2 EB 8r', value: 'SOLVE IND rr|reg' },
    { key: 'F2 EB Ft', value: 'SOLVE IND ST `stk`' },
    { key: 'F2 EC 8r', value: 'DIM IND rr|reg' },
    { key: 'F2 EC Ft', value: 'DIM IND ST `stk`' },
    { key: 'F2 EE 8r', value: 'INPUT IND rr|reg' },
    { key: 'F2 EE Ft', value: 'INPUT IND ST `stk`' },
    { key: 'F2 EF 8r', value: 'EDITN IND rr|reg' },
    { key: 'F2 EF Ft', value: 'EDITN IND ST `stk`' },
    { key: 'F2 F8 8r', value: 'VARMENU IND rr|reg' },
    { key: 'F2 F8 Ft', value: 'VARMENU IND ST `stk`' },
    { key: 'F3 E2 kk 8r', value: 'KEY `key` XEQ IND rr|reg' },
    { key: 'F3 E2 kk Ft', value: 'KEY `key` XEQ IND ST `stk`' },
    { key: 'F3 E2 kk rr|reg', value: 'KEY `key` XEQ ll' },
    { key: 'F3 E2 kk rr|reg', value: 'KEY `key` XEQ sl' },
    { key: 'F3 E3 kk 8r', value: 'KEY `key` GTO IND rr|reg' },
    { key: 'F3 E3 kk Ft', value: 'KEY `key` GTO IND ST `stk`' },
    { key: 'F3 E3 kk rr|reg', value: 'KEY `key` GTO ll' },
    { key: 'F3 E3 kk rr|reg', value: 'KEY `key` GTO sl' },
    { key: 'F3 F7 ww ww', value: 'SIZE rr|reg' },
    { key: 'Fn 7F', value: '⊢`str`' },
    { key: 'Fn 80', value: 'VIEW `nam`|strlen' },
    { key: 'Fn 81', value: 'STO `nam`|strlen' },
    { key: 'Fn 82', value: 'STO+ `nam`|strlen' },
    { key: 'Fn 83', value: 'STO- `nam`|strlen' },
    { key: 'Fn 84', value: 'STO× `nam`|strlen' },
    { key: 'Fn 85', value: 'STO÷ `nam`|strlen' },
    { key: 'Fn 86', value: 'X<> `nam`|strlen' },
    { key: 'Fn 87', value: 'INDEX `nam`|strlen' },
    { key: 'Fn 88', value: 'VIEW IND `nam`|strlen' },
    { key: 'Fn 89', value: 'STO IND `nam`|strlen' },
    { key: 'Fn 8A', value: 'STO+ IND `nam`|strlen' },
    { key: 'Fn 8B', value: 'STO- IND `nam`|strlen' },
    { key: 'Fn 8C', value: 'STO× IND `nam`|strlen' },
    { key: 'Fn 8D', value: 'STO÷ IND `nam`|strlen' },
    { key: 'Fn 8E', value: 'X<> IND `nam`|strlen' },
    { key: 'Fn 8F', value: 'INDEX IND `nam`|strlen' },
    { key: 'Fn 90', value: 'MVAR `nam`|strlen' },
    { key: 'Fn 91', value: 'RCL `nam`|strlen' },
    { key: 'Fn 92', value: 'RCL+ `nam`|strlen' },
    { key: 'Fn 93', value: 'RCL- `nam`|strlen' },
    { key: 'Fn 94', value: 'RCL× `nam`|strlen' },
    { key: 'Fn 95', value: 'RCL÷ `nam`|strlen' },
    { key: 'Fn 96', value: 'ISG `nam`|strlen' },
    { key: 'Fn 97', value: 'DSE `nam`|strlen' },
    { key: 'Fn 99', value: 'RCL IND `nam`|strlen' },
    { key: 'Fn 9A', value: 'RCL+ IND `nam`|strlen' },
    { key: 'Fn 9B', value: 'RCL- IND `nam`|strlen' },
    { key: 'Fn 9C', value: 'RCL× IND `nam`|strlen' },
    { key: 'Fn 9D', value: 'RCL÷ IND `nam`|strlen' },
    { key: 'Fn 9E', value: 'ISG IND `nam`|strlen' },
    { key: 'Fn 9F', value: 'DSE IND `nam`|strlen' },
    { key: 'Fn A8', value: 'SF IND `nam`|strlen' },
    { key: 'Fn A9', value: 'CF IND `nam`|strlen' },
    { key: 'Fn AA', value: 'FS?C IND `nam`|strlen' },
    { key: 'Fn AB', value: 'FC?C IND `nam`|strlen' },
    { key: 'Fn AC', value: 'FS? IND `nam`|strlen' },
    { key: 'Fn AD', value: 'FC? IND `nam`|strlen' },
    { key: 'Fn AE', value: 'GTO IND `nam`|strlen' },
    { key: 'Fn AF', value: 'XEQ IND `nam`|strlen' },
    { key: 'Fn B0', value: 'CLV `nam`|strlen' },
    { key: 'Fn B1', value: 'PRV `nam`|strlen' },
    { key: 'Fn B2', value: 'ASTO `nam`|strlen' },
    { key: 'Fn B3', value: 'ARCL `nam`|strlen' },
    { key: 'Fn B4', value: 'PGMINT `lbl`' },
    { key: 'Fn B5', value: 'PGMSLV `lbl`' },
    { key: 'Fn B6', value: 'INTEG `lbl`' },
    { key: 'Fn B7', value: 'SOLVE `lbl`' },
    { key: 'Fn B8', value: 'CLV IND `nam`|strlen' },
    { key: 'Fn B9', value: 'PRV IND `nam`|strlen' },
    { key: 'Fn BA', value: 'ASTO IND `nam`|strlen' },
    { key: 'Fn BB', value: 'ARCL IND `nam`|strlen' },
    { key: 'Fn BC', value: 'PGMINT IND `nam`|strlen' },
    { key: 'Fn BD', value: 'PGMSLV IND `nam`|strlen' },
    { key: 'Fn BE', value: 'INTEG IND `nam`|strlen' },
    { key: 'Fn BF', value: 'SOLVE IND `nam`|strlen' },
    { key: 'Fn C0 aa', value: 'ASSIGN `nam` TO `csk`' },
    { key: 'Fn C1', value: 'VARMENU `nam`|strlen' },
    { key: 'Fn C2 kk', value: 'KEY `key` XEQ `lbl`' },
    { key: 'Fn C3 kk', value: 'KEY `key` GTO `lbl`' },
    { key: 'Fn C4', value: 'DIM `nam`|strlen' },
    { key: 'Fn C5', value: 'INPUT `nam`|strlen' },
    { key: 'Fn C6', value: 'EDITN `nam`|strlen' },
    { key: 'Fn C9', value: 'VARMENU IND `nam`|strlen' },
    { key: 'Fn CA kk', value: 'KEY `key` XEQ IND `nam`|strlen' },
    { key: 'Fn CB kk', value: 'KEY `key` GTO IND `nam`|strlen' },
    { key: 'Fn CC', value: 'DIM IND `nam`|strlen' },
    { key: 'Fn CD', value: 'INPUT IND `nam`|strlen' },
    { key: 'Fn CE', value: 'EDITN IND `nam`|strlen' },
    { key: 'Fn DB', value: 'ΣREG IND `nam`|strlen' },
    { key: 'Fn DC', value: 'FIX IND `nam`|strlen' },
    { key: 'Fn DD', value: 'SCI IND `nam`|strlen' },
    { key: 'Fn DE', value: 'ENG IND `nam`|strlen' },
    { key: 'Fn DF', value: 'TONE IND `nam`|strlen' },
    { key: 'Fn F0', value: 'CLP `lbl`' },
    { key: 'Fn', value: '`str`' }
  ];
  */
  // #endregion

  private static arr_stack = [
    { key: 'T', value: 0 },
    { key: 'Z', value: 1 },
    { key: 'Y', value: 2 },
    { key: 'X', value: 3 },
    { key: 'L', value: 4 }
  ];

  // 0(?<lblnumber>[2-9A-F]): LBL 01-15
  // Fn: F([1-9A-F]) Label: max. length 14
  // 7t: 7([0-4]); stack 0-4
  // 8r: ([89A-E][0-9A-F]); r: dec:1..99; 128 + r => hex:81..E3
  // Ft: F([0-4]); ... IND ST [XYZLT]
  // [23]r: (2[0-9A-E]); register dec:1-14, hex: 21-2E
  // rr: ([123456][0-9A-F]); register dec:16-99, hex:10-63
  // nn: (?<digits>0[1-9]); digits; dec:1-9; 01-09
  // nn: digits; dec:10,11
  // tone: (?<tone>0[0-9]); dec:1-9; hex:01-09

  //#region Arrays

  private static arr_opCode = [
    {
      key: '0',
      value: [
        { regex: /00/, len: 1, rpn: 'NULL' },
        { regex: /0([2-9A-F])/, len: 1, rpn: 'LBL sl|lblnumber' } // 'LBL 01-15'
      ]
    },
    {
      key: '1',
      value: [
        { regex: /1D F([1-9A-F])/, len: 2, rpn: 'GTO `lbl`|strlen' }, // 'lbl max length 14'
        { regex: /1E F([1-9A-F])/, len: 2, rpn: 'XEQ `lbl`|strlen' } // 'lbl max length 14'
      ]
    },
    { key: '2', value: [{ regex: /2([0-9A-E])/, len: 1, rpn: 'RCL sr|reg' }] },
    { key: '3', value: [{ regex: /3([0-9A-E])/, len: 1, rpn: 'STO sr|reg' }] },
    {
      key: '4',
      value: [
        { regex: /40/, len: 1, rpn: '+' },
        { regex: /41/, len: 1, rpn: '-' },
        { regex: /42/, len: 1, rpn: '×' },
        { regex: /43/, len: 1, rpn: '÷' },
        { regex: /44/, len: 1, rpn: 'X<Y?' },
        { regex: /45/, len: 1, rpn: 'X>Y?' },
        { regex: /46/, len: 1, rpn: 'X≤Y?' },
        { regex: /47/, len: 1, rpn: 'Σ+' },
        { regex: /48/, len: 1, rpn: 'Σ-' },
        { regex: /49/, len: 1, rpn: 'HMS+' },
        { regex: /4A/, len: 1, rpn: 'HMS-' },
        { regex: /4B/, len: 1, rpn: 'MOD' },
        { regex: /4C/, len: 1, rpn: '%' },
        { regex: /4D/, len: 1, rpn: '%CH' },
        { regex: /4E/, len: 1, rpn: '→REC' },
        { regex: /4F/, len: 1, rpn: '→POL' }
      ]
    },

    {
      key: '5',
      value: [
        { regex: /50/, len: 1, rpn: 'LN' },
        { regex: /51/, len: 1, rpn: 'X↑2' },
        { regex: /52/, len: 1, rpn: 'SQRT' },
        { regex: /53/, len: 1, rpn: 'Y↑X' },
        { regex: /54/, len: 1, rpn: '+/-' },
        { regex: /55/, len: 1, rpn: 'E↑X' },
        { regex: /56/, len: 1, rpn: 'LOG' },
        { regex: /57/, len: 1, rpn: '10↑X' },
        { regex: /58/, len: 1, rpn: 'E↑X-1' },
        { regex: /59/, len: 1, rpn: 'SIN' },
        { regex: /5A/, len: 1, rpn: 'COS' },
        { regex: /5B/, len: 1, rpn: 'TAN' },
        { regex: /5C/, len: 1, rpn: 'ASIN' },
        { regex: /5D/, len: 1, rpn: 'ACOS' },
        { regex: /5E/, len: 1, rpn: 'ATAN' },
        { regex: /5F/, len: 1, rpn: '→DEC' }
      ]
    },
    {
      key: '6',
      value: [
        { regex: /60/, len: 1, rpn: '1/X' },
        { regex: /61/, len: 1, rpn: 'ABS' },
        { regex: /62/, len: 1, rpn: 'N!' },
        { regex: /63/, len: 1, rpn: 'X≠0?' },
        { regex: /64/, len: 1, rpn: 'X>0?' },
        { regex: /65/, len: 1, rpn: 'LN1+X' },
        { regex: /66/, len: 1, rpn: 'X<0?' },
        { regex: /67/, len: 1, rpn: 'X=0?' },
        { regex: /68/, len: 1, rpn: 'IP' },
        { regex: /69/, len: 1, rpn: 'FP' },
        { regex: /6A/, len: 1, rpn: '→RAD' },
        { regex: /6B/, len: 1, rpn: '→DEG' },
        { regex: /6C/, len: 1, rpn: '→HMS' },
        { regex: /6D/, len: 1, rpn: '→HR' },
        { regex: /6E/, len: 1, rpn: 'RND' },
        { regex: /6F/, len: 1, rpn: '→OCT' }
      ]
    },

    {
      key: '7',
      value: [
        { regex: /70/, len: 1, rpn: 'CLΣ' },
        { regex: /71/, len: 1, rpn: 'X≶Y' },
        { regex: /72/, len: 1, rpn: 'PI' },
        { regex: /73/, len: 1, rpn: 'CLST' },
        { regex: /74/, len: 1, rpn: 'R↑' },
        { regex: /75/, len: 1, rpn: 'R↓' },
        { regex: /76/, len: 1, rpn: 'LASTX' },
        { regex: /77/, len: 1, rpn: 'CLX' },
        { regex: /78/, len: 1, rpn: 'X=Y?' },
        { regex: /79/, len: 1, rpn: 'X≠Y?' },
        { regex: /7A/, len: 1, rpn: 'SIGN' },
        { regex: /7B/, len: 1, rpn: 'X≤0?' },
        { regex: /7C/, len: 1, rpn: 'MEAN' },
        { regex: /7D/, len: 1, rpn: 'SDEV' },
        { regex: /7E/, len: 1, rpn: 'AVIEW' },
        { regex: /7F/, len: 1, rpn: 'CLD' }
      ]
    },

    {
      key: '8',
      value: [
        { regex: /80/, len: 1, rpn: 'DEG' },
        { regex: /81/, len: 1, rpn: 'RAD' },
        { regex: /82/, len: 1, rpn: 'GRAD' },
        { regex: /83/, len: 1, rpn: 'ENTER' },
        { regex: /84/, len: 1, rpn: 'STOP' },
        { regex: /85/, len: 1, rpn: 'RTN' },
        { regex: /86/, len: 1, rpn: 'BEEP' },
        { regex: /87/, len: 1, rpn: 'CLA' },
        { regex: /88/, len: 1, rpn: 'ASHF' },
        { regex: /89/, len: 1, rpn: 'PSE' },
        { regex: /8A/, len: 1, rpn: 'CLRG' },
        { regex: /8B/, len: 1, rpn: 'AOFF' },
        { regex: /8C/, len: 1, rpn: 'AON' },
        { regex: /8D/, len: 1, rpn: 'OFF' },
        { regex: /8E/, len: 1, rpn: 'PROMPT' },
        { regex: /8F/, len: 1, rpn: 'ADV' }
      ]
    },

    {
      key: '9',
      value: [
        { regex: /90 7([0-4])/, len: 2, rpn: 'RCL ST `stk`|stk' },
        { regex: /90 ([89A-E][0-9A-F])/, len: 2, rpn: 'RCL IND rr|reg' }, // 'r dec:0-99 + 128'
        { regex: /90 F([0-4])/, len: 1, rpn: 'RCL IND ST `stk`|stk' },
        { regex: /90 ([123456][0-9A-F])/, len: 2, rpn: 'RCL rr|reg' }, // 'rr dec:16-99; hex:10-63'
        { regex: /91 7([0-4])/, len: 2, rpn: 'STO ST `stk`|stk' },
        { regex: /91 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO IND rr|reg' },
        { regex: /91 F([0-4])/, len: 2, rpn: 'STO IND ST `stk`|stk' },
        { regex: /91 ([123456][0-9A-F])/, len: 2, rpn: 'STO rr|reg' },
        { regex: /92 7([0-4])/, len: 2, rpn: 'STO+ ST `stk`|stk' },
        { regex: /92 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO+ IND rr|reg' },
        { regex: /92 F([0-4])/, len: 2, rpn: 'STO+ IND ST `stk`|stk' },
        { regex: /92 ([123456][0-9A-F])/, len: 2, rpn: 'STO+ rr|reg' },
        { regex: /93 7([0-4])/, len: 2, rpn: 'STO- ST `stk`|stk' },
        { regex: /93 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO- IND rr|reg' },
        { regex: /93 F([0-4])/, len: 2, rpn: 'STO- IND ST `stk`|stk' },
        { regex: /93 ([123456][0-9A-F])/, len: 2, rpn: 'STO- rr|reg' },
        { regex: /94 7([0-4])/, len: 2, rpn: 'STO× ST `stk`|stk' },
        { regex: /94 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO× IND rr|reg' },
        { regex: /94 F([0-4])/, len: 2, rpn: 'STO× IND ST `stk`|stk' },
        { regex: /94 ([123456][0-9A-F])/, len: 2, rpn: 'STO× rr|reg' },
        { regex: /95 7([0-4])/, len: 2, rpn: 'STO÷ ST `stk`|stk' },
        { regex: /95 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO÷ IND rr|reg' },
        { regex: /95 F([0-4])/, len: 2, rpn: 'STO÷ IND ST `stk`|stk' },
        { regex: /95 ([123456][0-9A-F])/, len: 2, rpn: 'STO÷ rr|reg' },
        { regex: /96 7([0-4])/, len: 2, rpn: 'ISG ST `stk`|stk' },
        { regex: /96 ([89A-E][0-9A-F])/, len: 2, rpn: 'ISG IND rr|reg' },
        { regex: /96 F([0-4])/, len: 2, rpn: 'ISG IND ST `stk`|stk' },
        { regex: /96 ([123456][0-9A-F])/, len: 2, rpn: 'ISG rr|reg' },
        { regex: /97 7([0-4])/, len: 2, rpn: 'DSE ST `stk`|stk' },
        { regex: /97 ([89A-E][0-9A-F])/, len: 2, rpn: 'DSE IND rr|reg' },
        { regex: /97 F([0-4])/, len: 2, rpn: 'DSE IND ST `stk`|stk' },
        { regex: /97 ([123456][0-9A-F])/, len: 2, rpn: 'DSE rr|reg' },
        { regex: /98 7([0-4])/, len: 2, rpn: 'VIEW ST `stk`|stk' },
        { regex: /98 ([89A-E][0-9A-F])/, len: 2, rpn: 'VIEW IND rr|reg' },
        { regex: /98 F([0-4])/, len: 2, rpn: 'VIEW IND ST `stk`|stk' },
        { regex: /98 ([123456][0-9A-F])/, len: 2, rpn: 'VIEW rr|reg' },
        { regex: /99 ([89A-E][0-9A-F])/, len: 2, rpn: 'ΣREG IND rr|reg' },
        { regex: /99 F([0-4])/, len: 2, rpn: 'ΣREG IND ST `stk`|stk' },
        { regex: /99 ([123456][0-9A-F])/, len: 2, rpn: 'ΣREG rr|reg' },
        { regex: /9A 7([0-4])/, len: 2, rpn: 'ASTO ST `stk`|stk' },
        { regex: /9A ([89A-E][0-9A-F])/, len: 2, rpn: 'ASTO IND rr|reg' },
        { regex: /9A F([0-4])/, len: 2, rpn: 'ASTO IND ST `stk`|stk' },
        { regex: /9A ([123456][0-9A-F])/, len: 2, rpn: 'ASTO rr|reg' },
        { regex: /9B 7([0-4])/, len: 2, rpn: 'ARCL ST `stk`|stk' },
        { regex: /9B ([89A-E][0-9A-F])/, len: 2, rpn: 'ARCL IND rr|reg' },
        { regex: /9B F([0-4])/, len: 2, rpn: 'ARCL IND ST `stk`|stk' },
        { regex: /9B ([123456][0-9A-F])/, len: 2, rpn: 'ARCL rr|reg' },
        { regex: /9C ([89A-E][0-9A-F])/, len: 2, rpn: 'FIX IND rr|reg' },
        { regex: /9C F([0-4])/, len: 2, rpn: 'FIX IND ST `stk`|stk' },
        { regex: /9C (0[1-9])/, len: 2, rpn: 'FIX sd|digits' },
        { regex: /9D ([89A-E][0-9A-F])/, len: 2, rpn: 'SCI IND rr|reg' },
        { regex: /9D F([0-4])/, len: 2, rpn: 'SCI IND ST `stk`|stk' },
        { regex: /9D (0[1-9])/, len: 2, rpn: 'SCI sd|digits' },
        { regex: /9E ([89A-E][0-9A-F])/, len: 2, rpn: 'ENG IND rr|reg' },
        { regex: /9E F([0-4])/, len: 2, rpn: 'ENG IND ST `stk`|stk' },
        { regex: /9E (0[1-9])/, len: 2, rpn: 'ENG sd|digits' },
        { regex: /9F ([89A-E][0-9A-F])/, len: 2, rpn: 'TONE IND rr|reg' },
        { regex: /9F F([0-4])/, len: 2, rpn: 'TONE IND ST `stk`|stk' },
        { regex: /9F (0[0-9])/, len: 2, rpn: 'TONE tn|tone' }
      ]
    },
    {
      key: 'A',
      value: [
        { regex: /A0 61/, len: 2, rpn: 'SINH' },
        { regex: /A0 62/, len: 2, rpn: 'COSH' },
        { regex: /A0 63/, len: 2, rpn: 'TANH' },
        { regex: /A0 64/, len: 2, rpn: 'ASINH' },
        { regex: /A0 65/, len: 2, rpn: 'ATANH' },
        { regex: /A0 66/, len: 2, rpn: 'ACOSH' },
        { regex: /A0 6F/, len: 2, rpn: 'COMB' },
        { regex: /A0 70/, len: 2, rpn: 'PERM' },
        { regex: /A0 71/, len: 2, rpn: 'RAN' },
        { regex: /A0 72/, len: 2, rpn: 'COMPLEX' },
        { regex: /A0 73/, len: 2, rpn: 'SEED' },
        { regex: /A0 74/, len: 2, rpn: 'GAMMA' },
        { regex: /A0 9F/, len: 2, rpn: 'BEST' },
        { regex: /A0 A0/, len: 2, rpn: 'EXPF' },
        { regex: /A0 A1/, len: 2, rpn: 'LINF' },
        { regex: /A0 A2/, len: 2, rpn: 'LOGF' },
        { regex: /A0 A3/, len: 2, rpn: 'PWRF' },
        { regex: /A0 A4/, len: 2, rpn: 'SLOPE' },
        { regex: /A0 A5/, len: 2, rpn: 'SUM' },
        { regex: /A0 A6/, len: 2, rpn: 'YINT' },
        { regex: /A0 A7/, len: 2, rpn: 'COrr|reg' },
        { regex: /A0 A8/, len: 2, rpn: 'FCSTX' },
        { regex: /A0 A9/, len: 2, rpn: 'FCSTY' },
        { regex: /A0 AA/, len: 2, rpn: 'INSR' },
        { regex: /A0 AB/, len: 2, rpn: 'DELR' },
        { regex: /A0 AC/, len: 2, rpn: 'WMEAN' },
        { regex: /A0 AD/, len: 2, rpn: 'LINΣ' },
        { regex: /A0 AE/, len: 2, rpn: 'ALLΣ' },
        { regex: /A0 E2/, len: 2, rpn: 'HEXM' },
        { regex: /A0 E3/, len: 2, rpn: 'DECM' },
        { regex: /A0 E4/, len: 2, rpn: 'OCTM' },
        { regex: /A0 E5/, len: 2, rpn: 'BINM' },
        { regex: /A0 E6/, len: 2, rpn: 'BASE+' },
        { regex: /A0 E7/, len: 2, rpn: 'BASE-' },
        { regex: /A0 E8/, len: 2, rpn: 'BASE×' },
        { regex: /A0 E9/, len: 2, rpn: 'BASE÷' },
        { regex: /A0 EA/, len: 2, rpn: 'BASE±' },
        { regex: /A2 59/, len: 2, rpn: 'POLAR' },
        { regex: /A2 5A/, len: 2, rpn: 'RECT' },
        { regex: /A2 5B/, len: 2, rpn: 'RDX.' },
        { regex: /A2 5C/, len: 2, rpn: 'RDX,' },
        { regex: /A2 5D/, len: 2, rpn: 'ALL' },
        { regex: /A2 5E/, len: 2, rpn: 'MENU' },
        { regex: /A2 5F/, len: 2, rpn: 'X≥0?' },
        { regex: /A2 60/, len: 2, rpn: 'X≥Y?' },
        { regex: /A2 62/, len: 2, rpn: 'CLKEYS' },
        { regex: /A2 63/, len: 2, rpn: 'KEYASN' },
        { regex: /A2 64/, len: 2, rpn: 'LCLBL' },
        { regex: /A2 65/, len: 2, rpn: 'REAL?' },
        { regex: /A2 66/, len: 2, rpn: 'MAT?' },
        { regex: /A2 67/, len: 2, rpn: 'CPX?' },
        { regex: /A2 68/, len: 2, rpn: 'STR?' },
        { regex: /A2 6A/, len: 2, rpn: 'CPXRES' },
        { regex: /A2 6B/, len: 2, rpn: 'REALRES' },
        { regex: /A2 6C/, len: 2, rpn: 'EXITALL' },
        { regex: /A2 6D/, len: 2, rpn: 'CLMENU' },
        { regex: /A2 6E/, len: 2, rpn: 'GETKEY' },
        { regex: /A2 6F/, len: 2, rpn: 'CUSTOM' },
        { regex: /A2 70/, len: 2, rpn: 'ON' },
        { regex: /A5 87/, len: 2, rpn: 'NOT' },
        { regex: /A5 88/, len: 2, rpn: 'AND' },
        { regex: /A5 89/, len: 2, rpn: 'OR' },
        { regex: /A5 8A/, len: 2, rpn: 'XOR' },
        { regex: /A5 8B/, len: 2, rpn: 'ROTXY' },
        { regex: /A5 8C/, len: 2, rpn: 'BIT?' },
        { regex: /A6 31/, len: 2, rpn: 'AIP' },
        { regex: /A6 41/, len: 2, rpn: 'ALENG' },
        { regex: /A6 46/, len: 2, rpn: 'AROT' },
        { regex: /A6 47/, len: 2, rpn: 'ATOX' },
        { regex: /A6 5C/, len: 2, rpn: 'POSA' },
        { regex: /A6 6F/, len: 2, rpn: 'XTOA' },
        { regex: /A6 78/, len: 2, rpn: 'ΣREG?' },
        { regex: /A6 81/, len: 2, rpn: 'ADATE' },
        { regex: /A6 84/, len: 2, rpn: 'ATIME' },
        { regex: /A6 85/, len: 2, rpn: 'ATIME24' },
        { regex: /A6 86/, len: 2, rpn: 'CLK12' },
        { regex: /A6 87/, len: 2, rpn: 'CLK24' },
        { regex: /A6 8C/, len: 2, rpn: 'DATE' },
        { regex: /A6 8D/, len: 2, rpn: 'DATE+' },
        { regex: /A6 8E/, len: 2, rpn: 'DDAYS' },
        { regex: /A6 8F/, len: 2, rpn: 'DMY' },
        { regex: /A6 90/, len: 2, rpn: 'DOW' },
        { regex: /A6 91/, len: 2, rpn: 'MDY' },
        { regex: /A6 9C/, len: 2, rpn: 'TIME' },
        { regex: /A6 C9/, len: 2, rpn: 'TRANS' },
        { regex: /A6 CA/, len: 2, rpn: 'CROSS' },
        { regex: /A6 CB/, len: 2, rpn: 'DOT' },
        { regex: /A6 CC/, len: 2, rpn: 'DET' },
        { regex: /A6 CD/, len: 2, rpn: 'UVEC' },
        { regex: /A6 CE/, len: 2, rpn: 'INVRT' },
        { regex: /A6 CF/, len: 2, rpn: 'FNRM' },
        { regex: /A6 D0/, len: 2, rpn: 'RSUM' },
        { regex: /A6 D1/, len: 2, rpn: 'R<>R' },
        { regex: /A6 D2/, len: 2, rpn: 'I+' },
        { regex: /A6 D3/, len: 2, rpn: 'I-' },
        { regex: /A6 D4/, len: 2, rpn: 'J+' },
        { regex: /A6 D5/, len: 2, rpn: 'J-' },
        { regex: /A6 D6/, len: 2, rpn: 'STOEL' },
        { regex: /A6 D7/, len: 2, rpn: 'RCLEL' },
        { regex: /A6 D8/, len: 2, rpn: 'STOIJ' },
        { regex: /A6 D9/, len: 2, rpn: 'RCLIJ' },
        { regex: /A6 DA/, len: 2, rpn: 'NEWMAT' },
        { regex: /A6 DB/, len: 2, rpn: 'OLD' },
        { regex: /A6 DC/, len: 2, rpn: '←' },
        { regex: /A6 DD/, len: 2, rpn: '→' },
        { regex: /A6 DE/, len: 2, rpn: '↑' },
        { regex: /A6 DF/, len: 2, rpn: '↓' },
        { regex: /A6 E1/, len: 2, rpn: 'EDIT' },
        { regex: /A6 E2/, len: 2, rpn: 'WRAP' },
        { regex: /A6 E3/, len: 2, rpn: 'GROW' },
        { regex: /A6 E7/, len: 2, rpn: 'DIM?' },
        { regex: /A6 E8/, len: 2, rpn: 'GETM' },
        { regex: /A6 E9/, len: 2, rpn: 'PUTM' },
        { regex: /A6 EA/, len: 2, rpn: '[MIN]' },
        { regex: /A6 EB/, len: 2, rpn: '[MAX]' },
        { regex: /A6 EC/, len: 2, rpn: '[FIND]' },
        { regex: /A6 ED/, len: 2, rpn: 'RNRM' },
        { regex: /A7 48/, len: 2, rpn: 'PRA' },
        { regex: /A7 52/, len: 2, rpn: 'PRΣ' },
        { regex: /A7 53/, len: 2, rpn: 'PRSTK' },
        { regex: /A7 54/, len: 2, rpn: 'PRX' },
        { regex: /A7 5B/, len: 2, rpn: 'MAN' },
        { regex: /A7 5C/, len: 2, rpn: 'NORM' },
        { regex: /A7 5D/, len: 2, rpn: 'TRACE' },
        { regex: /A7 5E/, len: 2, rpn: 'PRON' },
        { regex: /A7 5F/, len: 2, rpn: 'PROFF' },
        { regex: /A7 60/, len: 2, rpn: 'DELAY' },
        { regex: /A7 61/, len: 2, rpn: 'PRUSR' },
        { regex: /A7 62/, len: 2, rpn: 'PRLCD' },
        { regex: /A7 63/, len: 2, rpn: 'CLLCD' },
        { regex: /A7 64/, len: 2, rpn: 'AGRAPH' },
        { regex: /A7 65/, len: 2, rpn: 'PIXEL' },
        { regex: /A7 CF/, len: 2, rpn: 'ACCEL' },
        { regex: /A7 D0/, len: 2, rpn: 'LOCAT' },
        { regex: /A7 D1/, len: 2, rpn: 'HEADING' },
        { regex: /A8 ([89A-E][0-9A-F])/, len: 2, rpn: 'SF IND rr|reg' },
        { regex: /A8 F([0-4])/, len: 2, rpn: 'SF IND ST `stk`|stk' },
        { regex: /A8 ([123456][0-9A-F])/, len: 2, rpn: 'SF rr|reg' },
        { regex: /A9 ([89A-E][0-9A-F])/, len: 2, rpn: 'CF IND rr|reg' },
        { regex: /A9 F([0-4])/, len: 2, rpn: 'CF IND ST `stk`|stk' },
        { regex: /A9 ([123456][0-9A-F])/, len: 2, rpn: 'CF rr|reg' },
        { regex: /AA ([89A-E][0-9A-F])/, len: 2, rpn: 'FS?C IND rr|reg' },
        { regex: /AA F([0-4])/, len: 2, rpn: 'FS?C IND ST `stk`|stk' },
        { regex: /AA ([123456][0-9A-F])/, len: 2, rpn: 'FS?C rr|reg' },
        { regex: /AB ([89A-E][0-9A-F])/, len: 2, rpn: 'FC?C IND rr|reg' },
        { regex: /AB F([0-4])/, len: 2, rpn: 'FC?C IND ST `stk`|stk' },
        { regex: /AB ([123456][0-9A-F])/, len: 2, rpn: 'FC?C rr|reg' },
        { regex: /AC ([89A-E][0-9A-F])/, len: 2, rpn: 'FS? IND rr|reg' },
        { regex: /AC F([0-4])/, len: 2, rpn: 'FS? IND ST `stk`|stk' },
        { regex: /AC ([123456][0-9A-F])/, len: 2, rpn: 'FS? rr|reg' },
        { regex: /AD ([89A-E][0-9A-F])/, len: 2, rpn: 'FC? IND rr|reg' },
        { regex: /AD F([0-4])/, len: 2, rpn: 'FC? IND ST `stk`|stk' },
        { regex: /AD ([123456][0-9A-F])/, len: 2, rpn: 'FC? rr|reg' },
        { regex: /AE 7([0-4])/, len: 2, rpn: 'GTO IND ST `stk`|stk' },
        { regex: /AE ([89A-E][0-9A-F])/, len: 2, rpn: 'XEQ IND rr|reg' },
        { regex: /AE F([0-4])/, len: 2, rpn: 'XEQ IND ST `stk`|stk' },
        { regex: /AE ([0-6][0-9A-F])/, len: 2, rpn: 'GTO IND rr|reg' }
      ]
    },
    {
      key: 'B',
      value: [{ regex: /B([2-9A-F]) 00/, len: 2, rpn: 'GTO sl|lblnumber' }]
    }, // dec: 01-14, l+1: 2-F
    {
      key: 'C',
      value: [
        { regex: /C0 00 0D/, len: 3, rpn: 'END' },
        { regex: /C0 00 F([1-9A-F]) 00/, len: 4, rpn: 'LBL `lbl`|strlen' },
        { regex: /CE 7([0-4])/, len: 2, rpn: 'X<> ST `stk`|stk' },
        { regex: /CE ([89A-E][0-9A-F])/, len: 2, rpn: 'X<> IND rr|reg' },
        { regex: /CE F([0-4])/, len: 2, rpn: 'X<> IND ST `stk`|stk' },
        { regex: /CE ([123456][0-9A-F])/, len: 2, rpn: 'X<> rr|reg' },
        { regex: /CF ([1-6][0-9A-F])/, len: 2, rpn: 'LBL ll|lblnumber' } // 'dec:16-99; hex:10-63'
      ]
    },
    {
      key: 'D',
      value: [
        { regex: /D0 00 ([0-6][0-9A-F])/, len: 3, rpn: 'GTO ll|lblnumber' } // 'dec:15-99 hex:0F-63'
      ]
    },

    {
      key: 'E0 00 ',
      value: [
        { regex: /E0 00 ([0-6][0-9A-F])/, len: 3, rpn: 'XEQ ll|lblnumber' }, // 'dec:15-99 hex:0F-63'
        { regex: /E0 00 ([0-6][0-9A-F])/, len: 3, rpn: 'XEQ sl|lblnumber' } //'dec:15-99 hex:0F-63'
      ]
    },

    {
      key: 'F',
      value: [
        { regex: /F1 D5/, len: 2, rpn: 'FIX 10' },
        { regex: /F1 D6/, len: 2, rpn: 'SCI 10' },
        { regex: /F1 D7/, len: 2, rpn: 'ENG 10' },
        { regex: /F1 E5/, len: 2, rpn: 'FIX 11' },
        { regex: /F1 E6/, len: 2, rpn: 'SCI 11' },
        { regex: /F1 E7/, len: 2, rpn: 'ENG 11' },
        { regex: /F2 D0 7([0-4])/, len: 3, rpn: 'INPUT ST `stk`|stk' },
        { regex: /F2 D0 ([123456][0-9A-F])/, len: 3, rpn: 'INPUT rr|reg' },
        { regex: /F2 D1 7([0-4])/, len: 3, rpn: 'RCL+ ST `stk`|stk' },
        { regex: /F2 D1 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL+ IND rr|reg' },
        { regex: /F2 D1 F([0-4])/, len: 3, rpn: 'RCL+ IND ST `stk`|stk' },
        { regex: /F2 D1 ([123456][0-9A-F])/, len: 3, rpn: 'RCL+ rr|reg' },
        { regex: /F2 D2 7([0-4])/, len: 3, rpn: 'RCL- ST `stk`|stk' },
        { regex: /F2 D2 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL- IND rr|reg' },
        { regex: /F2 D2 F([0-4])/, len: 3, rpn: 'RCL- IND ST `stk`|stk' },
        { regex: /F2 D2 ([123456][0-9A-F])/, len: 3, rpn: 'RCL- rr|reg' },
        { regex: /F2 D3 7([0-4])/, len: 3, rpn: 'RCL× ST `stk`|stk' },
        { regex: /F2 D3 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL× IND rr|reg' },
        { regex: /F2 D3 F([0-4])/, len: 3, rpn: 'RCL× IND ST `stk`|stk' },
        { regex: /F2 D3 ([123456][0-9A-F])/, len: 3, rpn: 'RCL× rr|reg' },
        { regex: /F2 D4 7([0-4])/, len: 3, rpn: 'RCL÷ ST `stk`|stk' },
        { regex: /F2 D4 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL÷ IND rr|reg' },
        { regex: /F2 D4 F([0-4])/, len: 3, rpn: 'RCL÷ IND ST `stk`|stk' },
        { regex: /F2 D4 ([123456][0-9A-F])/, len: 3, rpn: 'RCL÷ rr|reg' },
        { regex: /F2 D8 ([89A-E][0-9A-F])/, len: 3, rpn: 'CLV IND rr|reg' },
        { regex: /F2 D8 F([0-4])/, len: 3, rpn: 'CLV IND ST `stk`|stk' },
        { regex: /F2 D9 ([89A-E][0-9A-F])/, len: 3, rpn: 'PRV IND rr|reg' },
        { regex: /F2 D9 F([0-4])/, len: 3, rpn: 'PRV IND ST `stk`|stk' },
        { regex: /F2 DA ([89A-E][0-9A-F])/, len: 3, rpn: 'INDEX IND rr|reg' },
        { regex: /F2 DA F([0-4])/, len: 3, rpn: 'INDEX IND ST `stk`|stk' },
        { regex: /F2 E8 ([89A-E][0-9A-F])/, len: 3, rpn: 'PGMINT IND rr|reg' },
        { regex: /F2 E8 F([0-4])/, len: 3, rpn: 'PGMINT IND ST `stk`|stk' },
        { regex: /F2 E9 ([89A-E][0-9A-F])/, len: 3, rpn: 'PGMSLV IND rr|reg' },
        { regex: /F2 E9 F([0-4])/, len: 3, rpn: 'PGMSLV IND ST `stk`|stk' },
        { regex: /F2 EA ([89A-E][0-9A-F])/, len: 3, rpn: 'INTEG IND rr|reg' },
        { regex: /F2 EA F([0-4])/, len: 3, rpn: 'INTEG IND ST `stk`|stk' },
        { regex: /F2 EB ([89A-E][0-9A-F])/, len: 3, rpn: 'SOLVE IND rr|reg' },
        { regex: /F2 EB F([0-4])/, len: 3, rpn: 'SOLVE IND ST `stk`|stk' },
        { regex: /F2 EC ([89A-E][0-9A-F])/, len: 3, rpn: 'DIM IND rr|reg' },
        { regex: /F2 EC F([0-4])/, len: 3, rpn: 'DIM IND ST `stk`|stk' },
        { regex: /F2 EE ([89A-E][0-9A-F])/, len: 3, rpn: 'INPUT IND rr|reg' },
        { regex: /F2 EE F([0-4])/, len: 3, rpn: 'INPUT IND ST `stk`|stk' },
        { regex: /F2 EF ([89A-E][0-9A-F])/, len: 3, rpn: 'EDITN IND rr|reg' },
        { regex: /F2 EF F([0-4])/, len: 3, rpn: 'EDITN IND ST `stk`|stk' },
        { regex: /F2 F8 ([89A-E][0-9A-F])/, len: 3, rpn: 'VARMENU IND rr|reg' },
        { regex: /F2 F8 F([0-4])/, len: 3, rpn: 'VARMENU IND ST `stk`|stk' },
        { regex: /F3 E2 (0[1-9]) ([89A-E][0-9A-F])/, len: 4, rpn: 'KEY `key` XEQ IND rr|key,reg' },
        { regex: /F3 E2 (0[1-9]) F([0-4])/, len: 4, rpn: 'KEY `key` XEQ IND ST `stk`|key,stk' },
        { regex: /F3 E2 (0[1-9]) ([123456][0-9A-F])/, len: 4, rpn: 'KEY `key` XEQ ll|key,reg' },
        { regex: /F3 E2 (0[1-9]) ([123456][0-9A-F])/, len: 4, rpn: 'KEY `key` XEQ sl|key,reg' },
        { regex: /F3 E3 (0[1-9]) ([89A-E][0-9A-F])/, len: 4, rpn: 'KEY `key` GTO IND rr|key,reg' },
        { regex: /F3 E3 (0[1-9]) F([0-4])/, len: 4, rpn: 'KEY `key` GTO IND ST `stk`|key,stk' },
        { regex: /F3 E3 (0[1-9]) ([123456][0-9A-F])/, len: 4, rpn: 'KEY `key` GTO ll|key,lblnumber' },
        { regex: /F3 E3 (0[1-9]) ([123456][0-9A-F])/, len: 4, rpn: 'KEY `key` GTO sl|key,lblnumber' },
        { regex: /F3 F7 ([0-9A-F][0-9A-F] [0-9A-F][0-9A-F])/, len: 4, rpn: 'SIZE rr|size' },
        { regex: /F([1-9A-F]) 7F/, len: 2, rpn: '⊢`str`|strlen' },
        { regex: /F([1-9A-F]) 80/, len: 2, rpn: 'VIEW `nam`|strlen' },
        { regex: /F([1-9A-F]) 81/, len: 2, rpn: 'STO `nam`|strlen' },
        { regex: /F([1-9A-F]) 82/, len: 2, rpn: 'STO+ `nam`|strlen' },
        { regex: /F([1-9A-F]) 83/, len: 2, rpn: 'STO- `nam`|strlen' },
        { regex: /F([1-9A-F]) 84/, len: 2, rpn: 'STO× `nam`|strlen' },
        { regex: /F([1-9A-F]) 85/, len: 2, rpn: 'STO÷ `nam`|strlen' },
        { regex: /F([1-9A-F]) 86/, len: 2, rpn: 'X<> `nam`|strlen' },
        { regex: /F([1-9A-F]) 87/, len: 2, rpn: 'INDEX `nam`|strlen' },
        { regex: /F([1-9A-F]) 88/, len: 2, rpn: 'VIEW IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 89/, len: 2, rpn: 'STO IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 8A/, len: 2, rpn: 'STO+ IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 8B/, len: 2, rpn: 'STO- IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 8C/, len: 2, rpn: 'STO× IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 8D/, len: 2, rpn: 'STO÷ IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 8E/, len: 2, rpn: 'X<> IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 8F/, len: 2, rpn: 'INDEX IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 90/, len: 2, rpn: 'MVAR `nam`|strlen' },
        { regex: /F([1-9A-F]) 91/, len: 2, rpn: 'RCL `nam`|strlen' },
        { regex: /F([1-9A-F]) 92/, len: 2, rpn: 'RCL+ `nam`|strlen' },
        { regex: /F([1-9A-F]) 93/, len: 2, rpn: 'RCL- `nam`|strlen' },
        { regex: /F([1-9A-F]) 94/, len: 2, rpn: 'RCL× `nam`|strlen' },
        { regex: /F([1-9A-F]) 95/, len: 2, rpn: 'RCL÷ `nam`|strlen' },
        { regex: /F([1-9A-F]) 96/, len: 2, rpn: 'ISG `nam`|strlen' },
        { regex: /F([1-9A-F]) 97/, len: 2, rpn: 'DSE `nam`|strlen' },
        { regex: /F([1-9A-F]) 99/, len: 2, rpn: 'RCL IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 9A/, len: 2, rpn: 'RCL+ IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 9B/, len: 2, rpn: 'RCL- IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 9C/, len: 2, rpn: 'RCL× IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 9D/, len: 2, rpn: 'RCL÷ IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 9E/, len: 2, rpn: 'ISG IND `nam`|strlen' },
        { regex: /F([1-9A-F]) 9F/, len: 2, rpn: 'DSE IND `nam`|strlen' },
        { regex: /F([1-9A-F]) A8/, len: 2, rpn: 'SF IND `nam`|strlen' },
        { regex: /F([1-9A-F]) A9/, len: 2, rpn: 'CF IND `nam`|strlen' },
        { regex: /F([1-9A-F]) AA/, len: 2, rpn: 'FS?C IND `nam`|strlen' },
        { regex: /F([1-9A-F]) AB/, len: 2, rpn: 'FC?C IND `nam`|strlen' },
        { regex: /F([1-9A-F]) AC/, len: 2, rpn: 'FS? IND `nam`|strlen' },
        { regex: /F([1-9A-F]) AD/, len: 2, rpn: 'FC? IND `nam`|strlen' },
        { regex: /F([1-9A-F]) AE/, len: 2, rpn: 'GTO IND `nam`|strlen' },
        { regex: /F([1-9A-F]) AF/, len: 2, rpn: 'XEQ IND `nam`|strlen' },
        { regex: /F([1-9A-F]) B0/, len: 2, rpn: 'CLV `nam`|strlen' },
        { regex: /F([1-9A-F]) B1/, len: 2, rpn: 'PRV `nam`|strlen' },
        { regex: /F([1-9A-F]) B2/, len: 2, rpn: 'ASTO `nam`|strlen' },
        { regex: /F([1-9A-F]) B3/, len: 2, rpn: 'ARCL `nam`|strlen' },
        { regex: /F([1-9A-F]) B4/, len: 2, rpn: 'PGMINT `lbl`' },
        { regex: /F([1-9A-F]) B5/, len: 2, rpn: 'PGMSLV `lbl`' },
        { regex: /F([1-9A-F]) B6/, len: 2, rpn: 'INTEG `lbl`' },
        { regex: /F([1-9A-F]) B7/, len: 2, rpn: 'SOLVE `lbl`' },
        { regex: /F([1-9A-F]) B8/, len: 2, rpn: 'CLV IND `nam`|strlen' },
        { regex: /F([1-9A-F]) B9/, len: 2, rpn: 'PRV IND `nam`|strlen' },
        { regex: /F([1-9A-F]) BA/, len: 2, rpn: 'ASTO IND `nam`|strlen' },
        { regex: /F([1-9A-F]) BB/, len: 2, rpn: 'ARCL IND `nam`|strlen' },
        { regex: /F([1-9A-F]) BC/, len: 2, rpn: 'PGMINT IND `nam`|strlen' },
        { regex: /F([1-9A-F]) BD/, len: 2, rpn: 'PGMSLV IND `nam`|strlen' },
        { regex: /F([1-9A-F]) BE/, len: 2, rpn: 'INTEG IND `nam`|strlen' },
        { regex: /F([1-9A-F]) BF/, len: 2, rpn: 'SOLVE IND `nam`|strlen' },
        { regex: /F([1-9A-F]) C0 aa/, len: 3, rpn: 'ASSIGN `nam` TO `csk`' },
        { regex: /F([1-9A-F]) C1/, len: 2, rpn: 'VARMENU `nam`|strlen' },
        { regex: /F([1-9A-F]) C2 (0[1-9])/, len: 3, rpn: 'KEY `key` XEQ `lbl`|strlen,key' },
        { regex: /F([1-9A-F]) C3 (0[1-9])/, len: 3, rpn: 'KEY `key` GTO `lbl`|strlen,key' },
        { regex: /F([1-9A-F]) C4/, len: 2, rpn: 'DIM `nam`|strlen' },
        { regex: /F([1-9A-F]) C5/, len: 2, rpn: 'INPUT `nam`|strlen' },
        { regex: /F([1-9A-F]) C6/, len: 2, rpn: 'EDITN `nam`|strlen' },
        { regex: /F([1-9A-F]) C9/, len: 2, rpn: 'VARMENU IND `nam`|strlen' },
        { regex: /F([1-9A-F]) CA (0[1-9])/, len: 3, rpn: 'KEY `key` XEQ IND `nam`|strlen,key' },
        { regex: /F([1-9A-F]) CB (0[1-9])/, len: 3, rpn: 'KEY `key` GTO IND `nam`|strlen,key' },
        { regex: /F([1-9A-F]) CC/, len: 2, rpn: 'DIM IND `nam`|strlen' },
        { regex: /F([1-9A-F]) CD/, len: 2, rpn: 'INPUT IND `nam`|strlen' },
        { regex: /F([1-9A-F]) CE/, len: 2, rpn: 'EDITN IND `nam`|strlen' },
        { regex: /F([1-9A-F]) DB/, len: 2, rpn: 'ΣREG IND `nam`|strlen' },
        { regex: /F([1-9A-F]) DC/, len: 2, rpn: 'FIX IND `nam`|strlen' },
        { regex: /F([1-9A-F]) DD/, len: 2, rpn: 'SCI IND `nam`|strlen' },
        { regex: /F([1-9A-F]) DE/, len: 2, rpn: 'ENG IND `nam`|strlen' },
        { regex: /F([1-9A-F]) DF/, len: 2, rpn: 'TONE IND `nam`|strlen' },
        { regex: /F([1-9A-F]) F0/, len: 2, rpn: 'CLP `lbl`' },
        {
          regex: /F([1-9A-F])/,
          len: 1,
          rpn: '`str`' //'max. length 15'
        }
      ]
    }
  ];

  // #endregion
}
