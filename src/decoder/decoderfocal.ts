import { unstring } from "../typedefs";
import { CodeError } from "../common/codeerror";
import { CodeInfo } from "../common/codeinfo";

export class DecoderFOCAL {
  //#region Members

  static opCode: Map<string, CodeInfo> = new Map<string, CodeInfo>();

  static initializedForDecode: boolean = false;

  //#endregion

  //#region public

  static initializeForDecode() {
    if (!DecoderFOCAL.initializedForDecode) {
      // transform arr_opCode -> opCode
      DecoderFOCAL.arr_opCode.forEach((e: { key: string; value: CodeInfo }) => {
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
    let error: CodeError = new CodeError(0, "", "Not implemented yet!");
    let languageId: string = "free42";

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
    //            parseInt("0x" + match[1] + "0") + 1 + int
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
    let hex = ("0" + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
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
    { key: '90 8r', value: 'RCL IND rr' },
    { key: '90 Ft', value: 'RCL IND ST `stk`' },
    { key: '90 rr', value: 'RCL rr' },
    { key: '91 7t', value: 'STO ST `stk`' },
    { key: '91 8r', value: 'STO IND rr' },
    { key: '91 Ft', value: 'STO IND ST `stk`' },
    { key: '91 rr', value: 'STO rr' },
    { key: '92 7t', value: 'STO+ ST `stk`' },
    { key: '92 8r', value: 'STO+ IND rr' },
    { key: '92 Ft', value: 'STO+ IND ST `stk`' },
    { key: '92 rr', value: 'STO+ rr' },
    { key: '93 7t', value: 'STO- ST `stk`' },
    { key: '93 8r', value: 'STO- IND rr' },
    { key: '93 Ft', value: 'STO- IND ST `stk`' },
    { key: '93 rr', value: 'STO- rr' },
    { key: '94 7t', value: 'STO× ST `stk`' },
    { key: '94 8r', value: 'STO× IND rr' },
    { key: '94 Ft', value: 'STO× IND ST `stk`' },
    { key: '94 rr', value: 'STO× rr' },
    { key: '95 7t', value: 'STO÷ ST `stk`' },
    { key: '95 8r', value: 'STO÷ IND rr' },
    { key: '95 Ft', value: 'STO÷ IND ST `stk`' },
    { key: '95 rr', value: 'STO÷ rr' },
    { key: '96 7t', value: 'ISG ST `stk`' },
    { key: '96 8r', value: 'ISG IND rr' },
    { key: '96 Ft', value: 'ISG IND ST `stk`' },
    { key: '96 rr', value: 'ISG rr' },
    { key: '97 7t', value: 'DSE ST `stk`' },
    { key: '97 8r', value: 'DSE IND rr' },
    { key: '97 Ft', value: 'DSE IND ST `stk`' },
    { key: '97 rr', value: 'DSE rr' },
    { key: '98 7t', value: 'VIEW ST `stk`' },
    { key: '98 8r', value: 'VIEW IND rr' },
    { key: '98 Ft', value: 'VIEW IND ST `stk`' },
    { key: '98 rr', value: 'VIEW rr' },
    { key: '99 8r', value: 'ΣREG IND rr' },
    { key: '99 Ft', value: 'ΣREG IND ST `stk`' },
    { key: '99 rr', value: 'ΣREG rr' },
    { key: '9A 7t', value: 'ASTO ST `stk`' },
    { key: '9A 8r', value: 'ASTO IND rr' },
    { key: '9A Ft', value: 'ASTO IND ST `stk`' },
    { key: '9A rr', value: 'ASTO rr' },
    { key: '9B 7t', value: 'ARCL ST `stk`' },
    { key: '9B 8r', value: 'ARCL IND rr' },
    { key: '9B Ft', value: 'ARCL IND ST `stk`' },
    { key: '9B rr', value: 'ARCL rr' },
    { key: '9C 8r', value: 'FIX IND rr' },
    { key: '9C Ft', value: 'FIX IND ST `stk`' },
    { key: '9C nn', value: 'FIX sd' },
    { key: '9D 8r', value: 'SCI IND rr' },
    { key: '9D Ft', value: 'SCI IND ST `stk`' },
    { key: '9D nn', value: 'SCI sd' },
    { key: '9E 8r', value: 'ENG IND rr' },
    { key: '9E Ft', value: 'ENG IND ST `stk`' },
    { key: '9E nn', value: 'ENG sd' },
    { key: '9F 8r', value: 'TONE IND rr' },
    { key: '9F Ft', value: 'TONE IND ST `stk`' },
    { key: '9F rr', value: 'TONE tn' },
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
    { key: 'A0 A7', value: 'CORR' },
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
    { key: 'A8 8r', value: 'SF IND rr' },
    { key: 'A8 Ft', value: 'SF IND ST `stk`' },
    { key: 'A8 rr', value: 'SF rr' },
    { key: 'A9 8r', value: 'CF IND rr' },
    { key: 'A9 Ft', value: 'CF IND ST `stk`' },
    { key: 'A9 rr', value: 'CF rr' },
    { key: 'AA 8r', value: 'FS?C IND rr' },
    { key: 'AA Ft', value: 'FS?C IND ST `stk`' },
    { key: 'AA rr', value: 'FS?C rr' },
    { key: 'AB 8r', value: 'FC?C IND rr' },
    { key: 'AB Ft', value: 'FC?C IND ST `stk`' },
    { key: 'AB rr', value: 'FC?C rr' },
    { key: 'AC 8r', value: 'FS? IND rr' },
    { key: 'AC Ft', value: 'FS? IND ST `stk`' },
    { key: 'AC rr', value: 'FS? rr' },
    { key: 'AD 8r', value: 'FC? IND rr' },
    { key: 'AD Ft', value: 'FC? IND ST `stk`' },
    { key: 'AD rr', value: 'FC? rr' },
    { key: 'AE 7t', value: 'GTO IND ST `stk`' },
    { key: 'AE 8r', value: 'XEQ IND rr' },
    { key: 'AE Ft', value: 'XEQ IND ST `stk`' },
    { key: 'AE nn', value: 'GTO IND rr' },
    { key: 'Bl 00', value: 'GTO sl' },
    { key: 'C0 00 0D', value: '.END.' },
    { key: 'C0 00 0D', value: 'END' },
    { key: 'C0 00 Fn 00', value: 'LBL `lbl`' },
    { key: 'CE 7t', value: 'X<> ST `stk`' },
    { key: 'CE 8r', value: 'X<> IND rr' },
    { key: 'CE Ft', value: 'X<> IND ST `stk`' },
    { key: 'CE rr', value: 'X<> rr' },
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
    { key: 'F2 D0 rr', value: 'INPUT rr' },
    { key: 'F2 D1 7t', value: 'RCL+ ST `stk`' },
    { key: 'F2 D1 8r', value: 'RCL+ IND rr' },
    { key: 'F2 D1 Ft', value: 'RCL+ IND ST `stk`' },
    { key: 'F2 D1 rr', value: 'RCL+ rr' },
    { key: 'F2 D2 7t', value: 'RCL- ST `stk`' },
    { key: 'F2 D2 8r', value: 'RCL- IND rr' },
    { key: 'F2 D2 Ft', value: 'RCL- IND ST `stk`' },
    { key: 'F2 D2 rr', value: 'RCL- rr' },
    { key: 'F2 D3 7t', value: 'RCL× ST `stk`' },
    { key: 'F2 D3 8r', value: 'RCL× IND rr' },
    { key: 'F2 D3 Ft', value: 'RCL× IND ST `stk`' },
    { key: 'F2 D3 rr', value: 'RCL× rr' },
    { key: 'F2 D4 7t', value: 'RCL÷ ST `stk`' },
    { key: 'F2 D4 8r', value: 'RCL÷ IND rr' },
    { key: 'F2 D4 Ft', value: 'RCL÷ IND ST `stk`' },
    { key: 'F2 D4 rr', value: 'RCL÷ rr' },
    { key: 'F2 D8 8r', value: 'CLV IND rr' },
    { key: 'F2 D8 Ft', value: 'CLV IND ST `stk`' },
    { key: 'F2 D9 8r', value: 'PRV IND rr' },
    { key: 'F2 D9 Ft', value: 'PRV IND ST `stk`' },
    { key: 'F2 DA 8r', value: 'INDEX IND rr' },
    { key: 'F2 DA Ft', value: 'INDEX IND ST `stk`' },
    { key: 'F2 E8 8r', value: 'PGMINT IND rr' },
    { key: 'F2 E8 Ft', value: 'PGMINT IND ST `stk`' },
    { key: 'F2 E9 8r', value: 'PGMSLV IND rr' },
    { key: 'F2 E9 Ft', value: 'PGMSLV IND ST `stk`' },
    { key: 'F2 EA 8r', value: 'INTEG IND rr' },
    { key: 'F2 EA Ft', value: 'INTEG IND ST `stk`' },
    { key: 'F2 EB 8r', value: 'SOLVE IND rr' },
    { key: 'F2 EB Ft', value: 'SOLVE IND ST `stk`' },
    { key: 'F2 EC 8r', value: 'DIM IND rr' },
    { key: 'F2 EC Ft', value: 'DIM IND ST `stk`' },
    { key: 'F2 EE 8r', value: 'INPUT IND rr' },
    { key: 'F2 EE Ft', value: 'INPUT IND ST `stk`' },
    { key: 'F2 EF 8r', value: 'EDITN IND rr' },
    { key: 'F2 EF Ft', value: 'EDITN IND ST `stk`' },
    { key: 'F2 F8 8r', value: 'VARMENU IND rr' },
    { key: 'F2 F8 Ft', value: 'VARMENU IND ST `stk`' },
    { key: 'F3 E2 kk 8r', value: 'KEY `key` XEQ IND rr' },
    { key: 'F3 E2 kk Ft', value: 'KEY `key` XEQ IND ST `stk`' },
    { key: 'F3 E2 kk rr', value: 'KEY `key` XEQ ll' },
    { key: 'F3 E2 kk rr', value: 'KEY `key` XEQ sl' },
    { key: 'F3 E3 kk 8r', value: 'KEY `key` GTO IND rr' },
    { key: 'F3 E3 kk Ft', value: 'KEY `key` GTO IND ST `stk`' },
    { key: 'F3 E3 kk rr', value: 'KEY `key` GTO ll' },
    { key: 'F3 E3 kk rr', value: 'KEY `key` GTO sl' },
    { key: 'F3 F7 ww ww', value: 'SIZE rr' },
    { key: 'Fn 7F', value: '⊢`str`' },
    { key: 'Fn 80', value: 'VIEW `nam`' },
    { key: 'Fn 81', value: 'STO `nam`' },
    { key: 'Fn 82', value: 'STO+ `nam`' },
    { key: 'Fn 83', value: 'STO- `nam`' },
    { key: 'Fn 84', value: 'STO× `nam`' },
    { key: 'Fn 85', value: 'STO÷ `nam`' },
    { key: 'Fn 86', value: 'X<> `nam`' },
    { key: 'Fn 87', value: 'INDEX `nam`' },
    { key: 'Fn 88', value: 'VIEW IND `nam`' },
    { key: 'Fn 89', value: 'STO IND `nam`' },
    { key: 'Fn 8A', value: 'STO+ IND `nam`' },
    { key: 'Fn 8B', value: 'STO- IND `nam`' },
    { key: 'Fn 8C', value: 'STO× IND `nam`' },
    { key: 'Fn 8D', value: 'STO÷ IND `nam`' },
    { key: 'Fn 8E', value: 'X<> IND `nam`' },
    { key: 'Fn 8F', value: 'INDEX IND `nam`' },
    { key: 'Fn 90', value: 'MVAR `nam`' },
    { key: 'Fn 91', value: 'RCL `nam`' },
    { key: 'Fn 92', value: 'RCL+ `nam`' },
    { key: 'Fn 93', value: 'RCL- `nam`' },
    { key: 'Fn 94', value: 'RCL× `nam`' },
    { key: 'Fn 95', value: 'RCL÷ `nam`' },
    { key: 'Fn 96', value: 'ISG `nam`' },
    { key: 'Fn 97', value: 'DSE `nam`' },
    { key: 'Fn 99', value: 'RCL IND `nam`' },
    { key: 'Fn 9A', value: 'RCL+ IND `nam`' },
    { key: 'Fn 9B', value: 'RCL- IND `nam`' },
    { key: 'Fn 9C', value: 'RCL× IND `nam`' },
    { key: 'Fn 9D', value: 'RCL÷ IND `nam`' },
    { key: 'Fn 9E', value: 'ISG IND `nam`' },
    { key: 'Fn 9F', value: 'DSE IND `nam`' },
    { key: 'Fn A8', value: 'SF IND `nam`' },
    { key: 'Fn A9', value: 'CF IND `nam`' },
    { key: 'Fn AA', value: 'FS?C IND `nam`' },
    { key: 'Fn AB', value: 'FC?C IND `nam`' },
    { key: 'Fn AC', value: 'FS? IND `nam`' },
    { key: 'Fn AD', value: 'FC? IND `nam`' },
    { key: 'Fn AE', value: 'GTO IND `nam`' },
    { key: 'Fn AF', value: 'XEQ IND `nam`' },
    { key: 'Fn B0', value: 'CLV `nam`' },
    { key: 'Fn B1', value: 'PRV `nam`' },
    { key: 'Fn B2', value: 'ASTO `nam`' },
    { key: 'Fn B3', value: 'ARCL `nam`' },
    { key: 'Fn B4', value: 'PGMINT `lbl`' },
    { key: 'Fn B5', value: 'PGMSLV `lbl`' },
    { key: 'Fn B6', value: 'INTEG `lbl`' },
    { key: 'Fn B7', value: 'SOLVE `lbl`' },
    { key: 'Fn B8', value: 'CLV IND `nam`' },
    { key: 'Fn B9', value: 'PRV IND `nam`' },
    { key: 'Fn BA', value: 'ASTO IND `nam`' },
    { key: 'Fn BB', value: 'ARCL IND `nam`' },
    { key: 'Fn BC', value: 'PGMINT IND `nam`' },
    { key: 'Fn BD', value: 'PGMSLV IND `nam`' },
    { key: 'Fn BE', value: 'INTEG IND `nam`' },
    { key: 'Fn BF', value: 'SOLVE IND `nam`' },
    { key: 'Fn C0 aa', value: 'ASSIGN `nam` TO `csk`' },
    { key: 'Fn C1', value: 'VARMENU `nam`' },
    { key: 'Fn C2 kk', value: 'KEY `key` XEQ `lbl`' },
    { key: 'Fn C3 kk', value: 'KEY `key` GTO `lbl`' },
    { key: 'Fn C4', value: 'DIM `nam`' },
    { key: 'Fn C5', value: 'INPUT `nam`' },
    { key: 'Fn C6', value: 'EDITN `nam`' },
    { key: 'Fn C9', value: 'VARMENU IND `nam`' },
    { key: 'Fn CA kk', value: 'KEY `key` XEQ IND `nam`' },
    { key: 'Fn CB kk', value: 'KEY `key` GTO IND `nam`' },
    { key: 'Fn CC', value: 'DIM IND `nam`' },
    { key: 'Fn CD', value: 'INPUT IND `nam`' },
    { key: 'Fn CE', value: 'EDITN IND `nam`' },
    { key: 'Fn DB', value: 'ΣREG IND `nam`' },
    { key: 'Fn DC', value: 'FIX IND `nam`' },
    { key: 'Fn DD', value: 'SCI IND `nam`' },
    { key: 'Fn DE', value: 'ENG IND `nam`' },
    { key: 'Fn DF', value: 'TONE IND `nam`' },
    { key: 'Fn F0', value: 'CLP `lbl`' },
    { key: 'Fn', value: '`str`' }
  ];
  */
  // #endregion

  private static arr_stack = [
    { key: "T", value: 0 },
    { key: "Z", value: 1 },
    { key: "Y", value: 2 },
    { key: "X", value: 3 },
    { key: "L", value: 4 }
  ];

  // 0(?<lblnumber>[2-9A-F]): LBL 01-15
  // Fn: F(?<strlen>\d) Label: max. length 14
  // 7t: 7(?<stk>[0-4]); stack 0-4
  // 8r: (?<reg>[89A-E][0-9A-F]); r: dec:1..99; 128 + r => hex:81..E3
  // Ft: F(?<stk>[0-4]); ... IND ST [XYZLT]
  // [23]r: (?<reg>2[0-9A-E]); register dec:1-14, hex: 21-2E
  // rr: (?<reg>[123456][0123]); register dec:16-99, hex:10-63
  // nn: (?<digits>0[1-9]); digits; dec:1-9; 01-09
  // nn: digits; dec:10,11
  // tone: (?<tone>0[0-9]); dec:1-9; hex:01-09

  //#region Arrays

  private static arr_opCode = [
    { key: "00", value: { len: 1, Rpn: "NULL" } },
    { key: "0(?<lblnumber>[2-9A-F])", value: { len: 1, Rpn: "LBL sl" } }, // LBL 01-15
    { key: "1D F(?<strlen>\d)", value: { len: 2, Rpn: "GTO `lbl`" } }, // lbl max length 14
    { key: "1E F(?<strlen>\d)", value: { len: 2, Rpn: "XEQ `lbl`" } }, // lbl max length 14
    { key: "2(?<reg>[0-9A-E])", value: { len: 1, Rpn: "RCL sr" } },
    { key: "3(?<reg>[0-9A-E])", value: { len: 1, Rpn: "STO sr" } },
    { key: "40", value: { len: 1, Rpn: "+" } },
    { key: "41", value: { len: 1, Rpn: "-" } },
    { key: "42", value: { len: 1, Rpn: "×" } },
    { key: "43", value: { len: 1, Rpn: "÷" } },
    { key: "44", value: { len: 1, Rpn: "X<Y?" } },
    { key: "45", value: { len: 1, Rpn: "X>Y?" } },
    { key: "46", value: { len: 1, Rpn: "X≤Y?" } },
    { key: "47", value: { len: 1, Rpn: "Σ+" } },
    { key: "48", value: { len: 1, Rpn: "Σ-" } },
    { key: "49", value: { len: 1, Rpn: "HMS+" } },
    { key: "4A", value: { len: 1, Rpn: "HMS-" } },
    { key: "4B", value: { len: 1, Rpn: "MOD" } },
    { key: "4C", value: { len: 1, Rpn: "%" } },
    { key: "4D", value: { len: 1, Rpn: "%CH" } },
    { key: "4E", value: { len: 1, Rpn: "→REC" } },
    { key: "4F", value: { len: 1, Rpn: "→POL" } },
    { key: "50", value: { len: 1, Rpn: "LN" } },
    { key: "51", value: { len: 1, Rpn: "X↑2" } },
    { key: "52", value: { len: 1, Rpn: "SQRT" } },
    { key: "53", value: { len: 1, Rpn: "Y↑X" } },
    { key: "54", value: { len: 1, Rpn: "+/-" } },
    { key: "55", value: { len: 1, Rpn: "E↑X" } },
    { key: "56", value: { len: 1, Rpn: "LOG" } },
    { key: "57", value: { len: 1, Rpn: "10↑X" } },
    { key: "58", value: { len: 1, Rpn: "E↑X-1" } },
    { key: "59", value: { len: 1, Rpn: "SIN" } },
    { key: "5A", value: { len: 1, Rpn: "COS" } },
    { key: "5B", value: { len: 1, Rpn: "TAN" } },
    { key: "5C", value: { len: 1, Rpn: "ASIN" } },
    { key: "5D", value: { len: 1, Rpn: "ACOS" } },
    { key: "5E", value: { len: 1, Rpn: "ATAN" } },
    { key: "5F", value: { len: 1, Rpn: "→DEC" } },
    { key: "60", value: { len: 1, Rpn: "1/X" } },
    { key: "61", value: { len: 1, Rpn: "ABS" } },
    { key: "62", value: { len: 1, Rpn: "N!" } },
    { key: "63", value: { len: 1, Rpn: "X≠0?" } },
    { key: "64", value: { len: 1, Rpn: "X>0?" } },
    { key: "65", value: { len: 1, Rpn: "LN1+X" } },
    { key: "66", value: { len: 1, Rpn: "X<0?" } },
    { key: "67", value: { len: 1, Rpn: "X=0?" } },
    { key: "68", value: { len: 1, Rpn: "IP" } },
    { key: "69", value: { len: 1, Rpn: "FP" } },
    { key: "6A", value: { len: 1, Rpn: "→RAD" } },
    { key: "6B", value: { len: 1, Rpn: "→DEG" } },
    { key: "6C", value: { len: 1, Rpn: "→HMS" } },
    { key: "6D", value: { len: 1, Rpn: "→HR" } },
    { key: "6E", value: { len: 1, Rpn: "RND" } },
    { key: "6F", value: { len: 1, Rpn: "→OCT" } },
    { key: "70", value: { len: 1, Rpn: "CLΣ" } },
    { key: "71", value: { len: 1, Rpn: "X≶Y" } },
    { key: "72", value: { len: 1, Rpn: "PI" } },
    { key: "73", value: { len: 1, Rpn: "CLST" } },
    { key: "74", value: { len: 1, Rpn: "R↑" } },
    { key: "75", value: { len: 1, Rpn: "R↓" } },
    { key: "76", value: { len: 1, Rpn: "LASTX" } },
    { key: "77", value: { len: 1, Rpn: "CLX" } },
    { key: "78", value: { len: 1, Rpn: "X=Y?" } },
    { key: "79", value: { len: 1, Rpn: "X≠Y?" } },
    { key: "7A", value: { len: 1, Rpn: "SIGN" } },
    { key: "7B", value: { len: 1, Rpn: "X≤0?" } },
    { key: "7C", value: { len: 1, Rpn: "MEAN" } },
    { key: "7D", value: { len: 1, Rpn: "SDEV" } },
    { key: "7E", value: { len: 1, Rpn: "AVIEW" } },
    { key: "7F", value: { len: 1, Rpn: "CLD" } },
    { key: "80", value: { len: 1, Rpn: "DEG" } },
    { key: "81", value: { len: 1, Rpn: "RAD" } },
    { key: "82", value: { len: 1, Rpn: "GRAD" } },
    { key: "83", value: { len: 1, Rpn: "ENTER" } },
    { key: "84", value: { len: 1, Rpn: "STOP" } },
    { key: "85", value: { len: 1, Rpn: "RTN" } },
    { key: "86", value: { len: 1, Rpn: "BEEP" } },
    { key: "87", value: { len: 1, Rpn: "CLA" } },
    { key: "88", value: { len: 1, Rpn: "ASHF" } },
    { key: "89", value: { len: 1, Rpn: "PSE" } },
    { key: "8A", value: { len: 1, Rpn: "CLRG" } },
    { key: "8B", value: { len: 1, Rpn: "AOFF" } },
    { key: "8C", value: { len: 1, Rpn: "AON" } },
    { key: "8D", value: { len: 1, Rpn: "OFF" } },
    { key: "8E", value: { len: 1, Rpn: "PROMPT" } },
    { key: "8F", value: { len: 1, Rpn: "ADV" } },
    { key: "90 7(?<stk>[0-4])", value: { len: 2, Rpn: "RCL ST `stk`" } },
    { key: "90 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "RCL IND rr" } }, // r dec:0-99 + 128
    { key: "90 F(?<stk>[0-4])", value: { len: 1, Rpn: "RCL IND ST `stk`" } },
    { key: "90 (?<reg>[123456][0123])", value: { len: 2, Rpn: "RCL rr" } }, // rr dec:16-99; hex:10-63
    { key: "91 7(?<stk>[0-4])", value: { len: 2, Rpn: "STO ST `stk`" } },
    { key: "91 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "STO IND rr" } },
    { key: "91 F(?<stk>[0-4])", value: { len: 2, Rpn: "STO IND ST `stk`" } },
    { key: "91 (?<reg>[123456][0123])", value: { len: 2, Rpn: "STO rr" } },
    { key: "92 7(?<stk>[0-4])", value: { len: 2, Rpn: "STO+ ST `stk`" } },
    { key: "92 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "STO+ IND rr" }},
    { key: "92 F(?<stk>[0-4])", value: { len: 2, Rpn: "STO+ IND ST `stk`" } },
    { key: "92 (?<reg>[123456][0123])", value: { len: 2, Rpn: "STO+ rr" } },
    { key: "93 7(?<stk>[0-4])", value: { len: 2, Rpn: "STO- ST `stk`" } },
    {
      key: "93 (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "STO- IND rr" }
    },
    { key: "93 F(?<stk>[0-4])", value: { len: 2, Rpn: "STO- IND ST `stk`" } },
    { key: "93 (?<reg>[123456][0123])", value: { len: 2, Rpn: "STO- rr" } },
    { key: "94 7(?<stk>[0-4])", value: { len: 2, Rpn: "STO× ST `stk`" } },
    {
      key: "94 (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "STO× IND rr" }
    },
    { key: "94 F(?<stk>[0-4])", value: { len: 2, Rpn: "STO× IND ST `stk`" } },
    { key: "94 (?<reg>[123456][0123])", value: { len: 2, Rpn: "STO× rr" } },
    { key: "95 7(?<stk>[0-4])", value: { len: 2, Rpn: "STO÷ ST `stk`" } },
    {
      key: "95 (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "STO÷ IND rr" }
    },
    { key: "95 F(?<stk>[0-4])", value: { len: 2, Rpn: "STO÷ IND ST `stk`" } },
    { key: "95 (?<reg>[123456][0123])", value: { len: 2, Rpn: "STO÷ rr" } },
    { key: "96 7(?<stk>[0-4])", value: { len: 2, Rpn: "ISG ST `stk`" } },
    { key: "96 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "ISG IND rr" } },
    { key: "96 F(?<stk>[0-4])", value: { len: 2, Rpn: "ISG IND ST `stk`" } },
    { key: "96 (?<reg>[123456][0123])", value: { len: 2, Rpn: "ISG rr" } },
    { key: "97 7(?<stk>[0-4])", value: { len: 2, Rpn: "DSE ST `stk`" } },
    { key: "97 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "DSE IND rr" } },
    { key: "97 F(?<stk>[0-4])", value: { len: 2, Rpn: "DSE IND ST `stk`" } },
    { key: "97 (?<reg>[123456][0123])", value: { len: 2, Rpn: "DSE rr" } },
    { key: "98 7(?<stk>[0-4])", value: { len: 2, Rpn: "VIEW ST `stk`" } },
    {
      key: "98 (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "VIEW IND rr" }
    },
    { key: "98 F(?<stk>[0-4])", value: { len: 2, Rpn: "VIEW IND ST `stk`" } },
    { key: "98 (?<reg>[123456][0123])", value: { len: 2, Rpn: "VIEW rr" } },
    {
      key: "99 (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "ΣREG IND rr" }
    },
    { key: "99 F(?<stk>[0-4])", value: { len: 2, Rpn: "ΣREG IND ST `stk`" } },
    { key: "99 (?<reg>[123456][0123])", value: { len: 2, Rpn: "ΣREG rr" } },
    { key: "9A 7(?<stk>[0-4])", value: { len: 2, Rpn: "ASTO ST `stk`" } },
    {
      key: "9A (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "ASTO IND rr" }
    },
    { key: "9A F(?<stk>[0-4])", value: { len: 2, Rpn: "ASTO IND ST `stk`" } },
    { key: "9A (?<reg>[123456][0123])", value: { len: 2, Rpn: "ASTO rr" } },
    { key: "9B 7(?<stk>[0-4])", value: { len: 2, Rpn: "ARCL ST `stk`" } },
    {
      key: "9B (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "ARCL IND rr" }
    },
    { key: "9B F(?<stk>[0-4])", value: { len: 2, Rpn: "ARCL IND ST `stk`" } },
    { key: "9B (?<reg>[123456][0123])", value: { len: 2, Rpn: "ARCL rr" } },
    { key: "9C (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "FIX IND rr" } },
    { key: "9C F(?<stk>[0-4])", value: { len: 2, Rpn: "FIX IND ST `stk`" } },
    { key: "9C (?<digits>0[1-9])", value: { len: 2, Rpn: "FIX sd" } },
    { key: "9D (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "SCI IND rr" } },
    { key: "9D F(?<stk>[0-4])", value: { len: 2, Rpn: "SCI IND ST `stk`" } },
    { key: "9D (?<digits>0[1-9])", value: { len: 2, Rpn: "SCI sd" } },
    { key: "9E (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "ENG IND rr" } },
    { key: "9E F(?<stk>[0-4])", value: { len: 2, Rpn: "ENG IND ST `stk`" } },
    { key: "9E (?<digits>0[1-9])", value: { len: 2, Rpn: "ENG sd" } },
    {
      key: "9F (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "TONE IND rr" }
    },
    { key: "9F F(?<stk>[0-4])", value: { len: 2, Rpn: "TONE IND ST `stk`" } },
    { key: "9F (?<tone>0[0-9])", value: { len: 2, Rpn: "TONE tn" } },
    { key: "A0 61", value: { len: 2, Rpn: "SINH" } },
    { key: "A0 62", value: { len: 2, Rpn: "COSH" } },
    { key: "A0 63", value: { len: 2, Rpn: "TANH" } },
    { key: "A0 64", value: { len: 2, Rpn: "ASINH" } },
    { key: "A0 65", value: { len: 2, Rpn: "ATANH" } },
    { key: "A0 66", value: { len: 2, Rpn: "ACOSH" } },
    { key: "A0 6F", value: { len: 2, Rpn: "COMB" } },
    { key: "A0 70", value: { len: 2, Rpn: "PERM" } },
    { key: "A0 71", value: { len: 2, Rpn: "RAN" } },
    { key: "A0 72", value: { len: 2, Rpn: "COMPLEX" } },
    { key: "A0 73", value: { len: 2, Rpn: "SEED" } },
    { key: "A0 74", value: { len: 2, Rpn: "GAMMA" } },
    { key: "A0 9F", value: { len: 2, Rpn: "BEST" } },
    { key: "A0 A0", value: { len: 2, Rpn: "EXPF" } },
    { key: "A0 A1", value: { len: 2, Rpn: "LINF" } },
    { key: "A0 A2", value: { len: 2, Rpn: "LOGF" } },
    { key: "A0 A3", value: { len: 2, Rpn: "PWRF" } },
    { key: "A0 A4", value: { len: 2, Rpn: "SLOPE" } },
    { key: "A0 A5", value: { len: 2, Rpn: "SUM" } },
    { key: "A0 A6", value: { len: 2, Rpn: "YINT" } },
    { key: "A0 A7", value: { len: 2, Rpn: "CORR" } },
    { key: "A0 A8", value: { len: 2, Rpn: "FCSTX" } },
    { key: "A0 A9", value: { len: 2, Rpn: "FCSTY" } },
    { key: "A0 AA", value: { len: 2, Rpn: "INSR" } },
    { key: "A0 AB", value: { len: 2, Rpn: "DELR" } },
    { key: "A0 AC", value: { len: 2, Rpn: "WMEAN" } },
    { key: "A0 AD", value: { len: 2, Rpn: "LINΣ" } },
    { key: "A0 AE", value: { len: 2, Rpn: "ALLΣ" } },
    { key: "A0 E2", value: { len: 2, Rpn: "HEXM" } },
    { key: "A0 E3", value: { len: 2, Rpn: "DECM" } },
    { key: "A0 E4", value: { len: 2, Rpn: "OCTM" } },
    { key: "A0 E5", value: { len: 2, Rpn: "BINM" } },
    { key: "A0 E6", value: { len: 2, Rpn: "BASE+" } },
    { key: "A0 E7", value: { len: 2, Rpn: "BASE-" } },
    { key: "A0 E8", value: { len: 2, Rpn: "BASE×" } },
    { key: "A0 E9", value: { len: 2, Rpn: "BASE÷" } },
    { key: "A0 EA", value: { len: 2, Rpn: "BASE±" } },
    { key: "A2 59", value: { len: 2, Rpn: "POLAR" } },
    { key: "A2 5A", value: { len: 2, Rpn: "RECT" } },
    { key: "A2 5B", value: { len: 2, Rpn: "RDX." } },
    { key: "A2 5C", value: { len: 2, Rpn: "RDX," } },
    { key: "A2 5D", value: { len: 2, Rpn: "ALL" } },
    { key: "A2 5E", value: { len: 2, Rpn: "MENU" } },
    { key: "A2 5F", value: { len: 2, Rpn: "X≥0?" } },
    { key: "A2 60", value: { len: 2, Rpn: "X≥Y?" } },
    { key: "A2 62", value: { len: 2, Rpn: "CLKEYS" } },
    { key: "A2 63", value: { len: 2, Rpn: "KEYASN" } },
    { key: "A2 64", value: { len: 2, Rpn: "LCLBL" } },
    { key: "A2 65", value: { len: 2, Rpn: "REAL?" } },
    { key: "A2 66", value: { len: 2, Rpn: "MAT?" } },
    { key: "A2 67", value: { len: 2, Rpn: "CPX?" } },
    { key: "A2 68", value: { len: 2, Rpn: "STR?" } },
    { key: "A2 6A", value: { len: 2, Rpn: "CPXRES" } },
    { key: "A2 6B", value: { len: 2, Rpn: "REALRES" } },
    { key: "A2 6C", value: { len: 2, Rpn: "EXITALL" } },
    { key: "A2 6D", value: { len: 2, Rpn: "CLMENU" } },
    { key: "A2 6E", value: { len: 2, Rpn: "GETKEY" } },
    { key: "A2 6F", value: { len: 2, Rpn: "CUSTOM" } },
    { key: "A2 70", value: { len: 2, Rpn: "ON" } },
    { key: "A5 87", value: { len: 2, Rpn: "NOT" } },
    { key: "A5 88", value: { len: 2, Rpn: "AND" } },
    { key: "A5 89", value: { len: 2, Rpn: "OR" } },
    { key: "A5 8A", value: { len: 2, Rpn: "XOR" } },
    { key: "A5 8B", value: { len: 2, Rpn: "ROTXY" } },
    { key: "A5 8C", value: { len: 2, Rpn: "BIT?" } },
    { key: "A6 31", value: { len: 2, Rpn: "AIP" } },
    { key: "A6 41", value: { len: 2, Rpn: "ALENG" } },
    { key: "A6 46", value: { len: 2, Rpn: "AROT" } },
    { key: "A6 47", value: { len: 2, Rpn: "ATOX" } },
    { key: "A6 5C", value: { len: 2, Rpn: "POSA" } },
    { key: "A6 6F", value: { len: 2, Rpn: "XTOA" } },
    { key: "A6 78", value: { len: 2, Rpn: "ΣREG?" } },
    { key: "A6 81", value: { len: 2, Rpn: "ADATE" } },
    { key: "A6 84", value: { len: 2, Rpn: "ATIME" } },
    { key: "A6 85", value: { len: 2, Rpn: "ATIME24" } },
    { key: "A6 86", value: { len: 2, Rpn: "CLK12" } },
    { key: "A6 87", value: { len: 2, Rpn: "CLK24" } },
    { key: "A6 8C", value: { len: 2, Rpn: "DATE" } },
    { key: "A6 8D", value: { len: 2, Rpn: "DATE+" } },
    { key: "A6 8E", value: { len: 2, Rpn: "DDAYS" } },
    { key: "A6 8F", value: { len: 2, Rpn: "DMY" } },
    { key: "A6 90", value: { len: 2, Rpn: "DOW" } },
    { key: "A6 91", value: { len: 2, Rpn: "MDY" } },
    { key: "A6 9C", value: { len: 2, Rpn: "TIME" } },
    { key: "A6 C9", value: { len: 2, Rpn: "TRANS" } },
    { key: "A6 CA", value: { len: 2, Rpn: "CROSS" } },
    { key: "A6 CB", value: { len: 2, Rpn: "DOT" } },
    { key: "A6 CC", value: { len: 2, Rpn: "DET" } },
    { key: "A6 CD", value: { len: 2, Rpn: "UVEC" } },
    { key: "A6 CE", value: { len: 2, Rpn: "INVRT" } },
    { key: "A6 CF", value: { len: 2, Rpn: "FNRM" } },
    { key: "A6 D0", value: { len: 2, Rpn: "RSUM" } },
    { key: "A6 D1", value: { len: 2, Rpn: "R<>R" } },
    { key: "A6 D2", value: { len: 2, Rpn: "I+" } },
    { key: "A6 D3", value: { len: 2, Rpn: "I-" } },
    { key: "A6 D4", value: { len: 2, Rpn: "J+" } },
    { key: "A6 D5", value: { len: 2, Rpn: "J-" } },
    { key: "A6 D6", value: { len: 2, Rpn: "STOEL" } },
    { key: "A6 D7", value: { len: 2, Rpn: "RCLEL" } },
    { key: "A6 D8", value: { len: 2, Rpn: "STOIJ" } },
    { key: "A6 D9", value: { len: 2, Rpn: "RCLIJ" } },
    { key: "A6 DA", value: { len: 2, Rpn: "NEWMAT" } },
    { key: "A6 DB", value: { len: 2, Rpn: "OLD" } },
    { key: "A6 DC", value: { len: 2, Rpn: "←" } },
    { key: "A6 DD", value: { len: 2, Rpn: "→" } },
    { key: "A6 DE", value: { len: 2, Rpn: "↑" } },
    { key: "A6 DF", value: { len: 2, Rpn: "↓" } },
    { key: "A6 E1", value: { len: 2, Rpn: "EDIT" } },
    { key: "A6 E2", value: { len: 2, Rpn: "WRAP" } },
    { key: "A6 E3", value: { len: 2, Rpn: "GROW" } },
    { key: "A6 E7", value: { len: 2, Rpn: "DIM?" } },
    { key: "A6 E8", value: { len: 2, Rpn: "GETM" } },
    { key: "A6 E9", value: { len: 2, Rpn: "PUTM" } },
    { key: "A6 EA", value: { len: 2, Rpn: "[MIN]" } },
    { key: "A6 EB", value: { len: 2, Rpn: "[MAX]" } },
    { key: "A6 EC", value: { len: 2, Rpn: "[FIND]" } },
    { key: "A6 ED", value: { len: 2, Rpn: "RNRM" } },
    { key: "A7 48", value: { len: 2, Rpn: "PRA" } },
    { key: "A7 52", value: { len: 2, Rpn: "PRΣ" } },
    { key: "A7 53", value: { len: 2, Rpn: "PRSTK" } },
    { key: "A7 54", value: { len: 2, Rpn: "PRX" } },
    { key: "A7 5B", value: { len: 2, Rpn: "MAN" } },
    { key: "A7 5C", value: { len: 2, Rpn: "NORM" } },
    { key: "A7 5D", value: { len: 2, Rpn: "TRACE" } },
    { key: "A7 5E", value: { len: 2, Rpn: "PRON" } },
    { key: "A7 5F", value: { len: 2, Rpn: "PROFF" } },
    { key: "A7 60", value: { len: 2, Rpn: "DELAY" } },
    { key: "A7 61", value: { len: 2, Rpn: "PRUSR" } },
    { key: "A7 62", value: { len: 2, Rpn: "PRLCD" } },
    { key: "A7 63", value: { len: 2, Rpn: "CLLCD" } },
    { key: "A7 64", value: { len: 2, Rpn: "AGRAPH" } },
    { key: "A7 65", value: { len: 2, Rpn: "PIXEL" } },
    { key: "A7 CF", value: { len: 2, Rpn: "ACCEL" } },
    { key: "A7 D0", value: { len: 2, Rpn: "LOCAT" } },
    { key: "A7 D1", value: { len: 2, Rpn: "HEADING" } },
    { key: "A8 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "SF IND rr" } },
    { key: "A8 F(?<stk>[0-4])", value: { len: 2, Rpn: "SF IND ST `stk`" } },
    { key: "A8 (?<reg>[123456][0123])", value: { len: 2, Rpn: "SF rr" } },
    { key: "A9 (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "CF IND rr" } },
    { key: "A9 F(?<stk>[0-4])", value: { len: 2, Rpn: "CF IND ST `stk`" } },
    { key: "A9 (?<reg>[123456][0123])", value: { len: 2, Rpn: "CF rr" } },
    {
      key: "AA (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "FS?C IND rr" }
    },
    { key: "AA F(?<stk>[0-4])", value: { len: 2, Rpn: "FS?C IND ST `stk`" } },
    { key: "AA (?<reg>[123456][0123])", value: { len: 2, Rpn: "FS?C rr" } },
    {
      key: "AB (?<reg>[89A-E][0-9A-F])",
      value: { len: 2, Rpn: "FC?C IND rr" }
    },
    { key: "AB F(?<stk>[0-4])", value: { len: 2, Rpn: "FC?C IND ST `stk`" } },
    { key: "AB (?<reg>[123456][0123])", value: { len: 2, Rpn: "FC?C rr" } },
    { key: "AC (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "FS? IND rr" } },
    { key: "AC F(?<stk>[0-4])", value: { len: 2, Rpn: "FS? IND ST `stk`" } },
    { key: "AC (?<reg>[123456][0123])", value: { len: 2, Rpn: "FS? rr" } },
    { key: "AD (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "FC? IND rr" } },
    { key: "AD F(?<stk>[0-4])", value: { len: 2, Rpn: "FC? IND ST `stk`" } },
    { key: "AD (?<reg>[123456][0123])", value: { len: 2, Rpn: "FC? rr" } },
    { key: "AE 7(?<stk>[0-4])", value: { len: 2, Rpn: "GTO IND ST `stk`" } },
    { key: "AE (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "XEQ IND rr" } },
    { key: "AE F(?<stk>[0-4])", value: { len: 2, Rpn: "XEQ IND ST `stk`" } },
    { key: "AE (?<reg>[0-6][0-9A-F])", value: { len: 2, Rpn: "GTO IND rr" } },
    { key: "B(?<lblnumber>[2-9A-F]) 00", value: { len: 2, Rpn: "GTO sl" } }, // dec: 01-14, l+1: 2-F
    { key: "C0 00 0D", value: { len: 3, Rpn: ".END." } },
    { key: "C0 00 0D", value: { len: 3, Rpn: "END" } },
    { key: "C0 00 F(?<strlen>\d) 00", value: { len: 4, Rpn: "LBL `lbl`" } },
    { key: "CE 7(?<stk>[0-4])", value: { len: 2, Rpn: "X<> ST `stk`" } },
    { key: "CE (?<reg>[89A-E][0-9A-F])", value: { len: 2, Rpn: "X<> IND rr" } },
    { key: "CE F(?<stk>[0-4])", value: { len: 2, Rpn: "X<> IND ST `stk`" } },
    { key: "CE (?<reg>[123456][0123])", value: { len: 2, Rpn: "X<> rr" } },
    { key: "CF (?<lblnumber>[1-6][0-9A-F])", value: { len: 2, Rpn: "LBL ll" } }, // 16-99; hex:10-63
    {
      key: "D0 00 (?<lblnumber>[0-6][0-9A-F])",
      value: { len: 3, Rpn: "GTO ll" }
    }, //15-99 hex:0F-63
    {
      key: "E0 00 (?<lblnumber>[0-6][0-9A-F])",
      value: { len: 3, Rpn: "XEQ ll" }
    }, //15-99 hex:0F-63
    {
      key: "E0 00 (?<lblnumber>[0-6][0-9A-F])",
      value: { len: 3, Rpn: "XEQ sl" }
    }, //15-99 hex:0F-63
    { key: "F1 D5", value: { len: 2, Rpn: "FIX 10" } },
    { key: "F1 D6", value: { len: 2, Rpn: "SCI 10" } },
    { key: "F1 D7", value: { len: 2, Rpn: "ENG 10" } },
    { key: "F1 E5", value: { len: 2, Rpn: "FIX 11" } },
    { key: "F1 E6", value: { len: 2, Rpn: "SCI 11" } },
    { key: "F1 E7", value: { len: 2, Rpn: "ENG 11" } },
    { key: "F2 D0 7(?<stk>[0-4])", value: { len: 3, Rpn: "INPUT ST `stk`" } },
    { key: "F2 D0 (?<reg>[123456][0123])", value: { len: 3, Rpn: "INPUT rr" } },
    { key: "F2 D1 7(?<stk>[0-4])", value: { len: 3, Rpn: "RCL+ ST `stk`" } },
    {
      key: "F2 D1 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "RCL+ IND rr" }
    },
    {
      key: "F2 D1 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "RCL+ IND ST `stk`" }
    },
    { key: "F2 D1 (?<reg>[123456][0123])", value: { len: 3, Rpn: "RCL+ rr" } },
    { key: "F2 D2 7(?<stk>[0-4])", value: { len: 3, Rpn: "RCL- ST `stk`" } },
    {
      key: "F2 D2 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "RCL- IND rr" }
    },
    {
      key: "F2 D2 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "RCL- IND ST `stk`" }
    },
    { key: "F2 D2 (?<reg>[123456][0123])", value: { len: 3, Rpn: "RCL- rr" } },
    { key: "F2 D3 7(?<stk>[0-4])", value: { len: 3, Rpn: "RCL× ST `stk`" } },
    {
      key: "F2 D3 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "RCL× IND rr" }
    },
    {
      key: "F2 D3 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "RCL× IND ST `stk`" }
    },
    { key: "F2 D3 (?<reg>[123456][0123])", value: { len: 3, Rpn: "RCL× rr" } },
    { key: "F2 D4 7(?<stk>[0-4])", value: { len: 3, Rpn: "RCL÷ ST `stk`" } },
    {
      key: "F2 D4 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "RCL÷ IND rr" }
    },
    {
      key: "F2 D4 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "RCL÷ IND ST `stk`" }
    },
    { key: "F2 D4 (?<reg>[123456][0123])", value: { len: 3, Rpn: "RCL÷ rr" } },
    {
      key: "F2 D8 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "CLV IND rr" }
    },
    { key: "F2 D8 F(?<stk>[0-4])", value: { len: 3, Rpn: "CLV IND ST `stk`" } },
    {
      key: "F2 D9 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "PRV IND rr" }
    },
    { key: "F2 D9 F(?<stk>[0-4])", value: { len: 3, Rpn: "PRV IND ST `stk`" } },
    {
      key: "F2 DA (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "INDEX IND rr" }
    },
    {
      key: "F2 DA F(?<stk>[0-4])",
      value: { len: 3, Rpn: "INDEX IND ST `stk`" }
    },
    {
      key: "F2 E8 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "PGMINT IND rr" }
    },
    {
      key: "F2 E8 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "PGMINT IND ST `stk`" }
    },
    {
      key: "F2 E9 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "PGMSLV IND rr" }
    },
    {
      key: "F2 E9 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "PGMSLV IND ST `stk`" }
    },
    {
      key: "F2 EA (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "INTEG IND rr" }
    },
    {
      key: "F2 EA F(?<stk>[0-4])",
      value: { len: 3, Rpn: "INTEG IND ST `stk`" }
    },
    {
      key: "F2 EB (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "SOLVE IND rr" }
    },
    {
      key: "F2 EB F(?<stk>[0-4])",
      value: { len: 3, Rpn: "SOLVE IND ST `stk`" }
    },
    {
      key: "F2 EC (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "DIM IND rr" }
    },
    { key: "F2 EC F(?<stk>[0-4])", value: { len: 3, Rpn: "DIM IND ST `stk`" } },
    {
      key: "F2 EE (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "INPUT IND rr" }
    },
    {
      key: "F2 EE F(?<stk>[0-4])",
      value: { len: 3, Rpn: "INPUT IND ST `stk`" }
    },
    {
      key: "F2 EF (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "EDITN IND rr" }
    },
    {
      key: "F2 EF F(?<stk>[0-4])",
      value: { len: 3, Rpn: "EDITN IND ST `stk`" }
    },
    {
      key: "F2 F8 (?<reg>[89A-E][0-9A-F])",
      value: { len: 3, Rpn: "VARMENU IND rr" }
    },
    {
      key: "F2 F8 F(?<stk>[0-4])",
      value: { len: 3, Rpn: "VARMENU IND ST `stk`" }
    },
    {
      key: "F3 E2 (?<key>0[1-9]) (?<reg>[89A-E][0-9A-F])",
      value: { len: 4, Rpn: "KEY `key` XEQ IND rr" }
    },
    {
      key: "F3 E2 (?<key>0[1-9]) F(?<stk>[0-4])",
      value: { len: 4, Rpn: "KEY `key` XEQ IND ST `stk`" }
    },
    {
      key: "F3 E2 (?<key>0[1-9]) (?<reg>[123456][0123])",
      value: { len: 4, Rpn: "KEY `key` XEQ ll" }
    },
    {
      key: "F3 E2 (?<key>0[1-9]) (?<reg>[123456][0123])",
      value: { len: 4, Rpn: "KEY `key` XEQ sl" }
    },
    {
      key: "F3 E3 (?<key>0[1-9]) (?<reg>[89A-E][0-9A-F])",
      value: { len: 4, Rpn: "KEY `key` GTO IND rr" }
    },
    {
      key: "F3 E3 (?<key>0[1-9]) F(?<stk>[0-4])",
      value: { len: 4, Rpn: "KEY `key` GTO IND ST `stk`" }
    },
    {
      key: "F3 E3 (?<key>0[1-9]) (?<reg>[123456][0123])",
      value: { len: 4, Rpn: "KEY `key` GTO ll" }
    },
    {
      key: "F3 E3 (?<key>0[1-9]) (?<reg>[123456][0123])",
      value: { len: 4, Rpn: "KEY `key` GTO sl" }
    },
    {
      key: "F3 F7 (?<size>[0-9A-F][0-9A-F] [0-9A-F][0-9A-F]) ww",
      value: { len: 4, Rpn: "SIZE rr" }
    },
    { key: "F(?<strlen>\d) 7F", value: { len: 2, Rpn: "⊢`str`" } },
    { key: "F(?<strlen>\d) 80", value: { len: 2, Rpn: "VIEW `nam`" } },
    { key: "F(?<strlen>\d) 81", value: { len: 2, Rpn: "STO `nam`" } },
    { key: "F(?<strlen>\d) 82", value: { len: 2, Rpn: "STO+ `nam`" } },
    { key: "F(?<strlen>\d) 83", value: { len: 2, Rpn: "STO- `nam`" } },
    { key: "F(?<strlen>\d) 84", value: { len: 2, Rpn: "STO× `nam`" } },
    { key: "F(?<strlen>\d) 85", value: { len: 2, Rpn: "STO÷ `nam`" } },
    { key: "F(?<strlen>\d) 86", value: { len: 2, Rpn: "X<> `nam`" } },
    { key: "F(?<strlen>\d) 87", value: { len: 2, Rpn: "INDEX `nam`" } },
    { key: "F(?<strlen>\d) 88", value: { len: 2, Rpn: "VIEW IND `nam`" } },
    { key: "F(?<strlen>\d) 89", value: { len: 2, Rpn: "STO IND `nam`" } },
    { key: "F(?<strlen>\d) 8A", value: { len: 2, Rpn: "STO+ IND `nam`" } },
    { key: "F(?<strlen>\d) 8B", value: { len: 2, Rpn: "STO- IND `nam`" } },
    { key: "F(?<strlen>\d) 8C", value: { len: 2, Rpn: "STO× IND `nam`" } },
    { key: "F(?<strlen>\d) 8D", value: { len: 2, Rpn: "STO÷ IND `nam`" } },
    { key: "F(?<strlen>\d) 8E", value: { len: 2, Rpn: "X<> IND `nam`" } },
    { key: "F(?<strlen>\d) 8F", value: { len: 2, Rpn: "INDEX IND `nam`" } },
    { key: "F(?<strlen>\d) 90", value: { len: 2, Rpn: "MVAR `nam`" } },
    { key: "F(?<strlen>\d) 91", value: { len: 2, Rpn: "RCL `nam`" } },
    { key: "F(?<strlen>\d) 92", value: { len: 2, Rpn: "RCL+ `nam`" } },
    { key: "F(?<strlen>\d) 93", value: { len: 2, Rpn: "RCL- `nam`" } },
    { key: "F(?<strlen>\d) 94", value: { len: 2, Rpn: "RCL× `nam`" } },
    { key: "F(?<strlen>\d) 95", value: { len: 2, Rpn: "RCL÷ `nam`" } },
    { key: "F(?<strlen>\d) 96", value: { len: 2, Rpn: "ISG `nam`" } },
    { key: "F(?<strlen>\d) 97", value: { len: 2, Rpn: "DSE `nam`" } },
    { key: "F(?<strlen>\d) 99", value: { len: 2, Rpn: "RCL IND `nam`" } },
    { key: "F(?<strlen>\d) 9A", value: { len: 2, Rpn: "RCL+ IND `nam`" } },
    { key: "F(?<strlen>\d) 9B", value: { len: 2, Rpn: "RCL- IND `nam`" } },
    { key: "F(?<strlen>\d) 9C", value: { len: 2, Rpn: "RCL× IND `nam`" } },
    { key: "F(?<strlen>\d) 9D", value: { len: 2, Rpn: "RCL÷ IND `nam`" } },
    { key: "F(?<strlen>\d) 9E", value: { len: 2, Rpn: "ISG IND `nam`" } },
    { key: "F(?<strlen>\d) 9F", value: { len: 2, Rpn: "DSE IND `nam`" } },
    { key: "F(?<strlen>\d) A8", value: { len: 2, Rpn: "SF IND `nam`" } },
    { key: "F(?<strlen>\d) A9", value: { len: 2, Rpn: "CF IND `nam`" } },
    { key: "F(?<strlen>\d) AA", value: { len: 2, Rpn: "FS?C IND `nam`" } },
    { key: "F(?<strlen>\d) AB", value: { len: 2, Rpn: "FC?C IND `nam`" } },
    { key: "F(?<strlen>\d) AC", value: { len: 2, Rpn: "FS? IND `nam`" } },
    { key: "F(?<strlen>\d) AD", value: { len: 2, Rpn: "FC? IND `nam`" } },
    { key: "F(?<strlen>\d) AE", value: { len: 2, Rpn: "GTO IND `nam`" } },
    { key: "F(?<strlen>\d) AF", value: { len: 2, Rpn: "XEQ IND `nam`" } },
    { key: "F(?<strlen>\d) B0", value: { len: 2, Rpn: "CLV `nam`" } },
    { key: "F(?<strlen>\d) B1", value: { len: 2, Rpn: "PRV `nam`" } },
    { key: "F(?<strlen>\d) B2", value: { len: 2, Rpn: "ASTO `nam`" } },
    { key: "F(?<strlen>\d) B3", value: { len: 2, Rpn: "ARCL `nam`" } },
    { key: "F(?<strlen>\d) B4", value: { len: 2, Rpn: "PGMINT `lbl`" } },
    { key: "F(?<strlen>\d) B5", value: { len: 2, Rpn: "PGMSLV `lbl`" } },
    { key: "F(?<strlen>\d) B6", value: { len: 2, Rpn: "INTEG `lbl`" } },
    { key: "F(?<strlen>\d) B7", value: { len: 2, Rpn: "SOLVE `lbl`" } },
    { key: "F(?<strlen>\d) B8", value: { len: 2, Rpn: "CLV IND `nam`" } },
    { key: "F(?<strlen>\d) B9", value: { len: 2, Rpn: "PRV IND `nam`" } },
    { key: "F(?<strlen>\d) BA", value: { len: 2, Rpn: "ASTO IND `nam`" } },
    { key: "F(?<strlen>\d) BB", value: { len: 2, Rpn: "ARCL IND `nam`" } },
    { key: "F(?<strlen>\d) BC", value: { len: 2, Rpn: "PGMINT IND `nam`" } },
    { key: "F(?<strlen>\d) BD", value: { len: 2, Rpn: "PGMSLV IND `nam`" } },
    { key: "F(?<strlen>\d) BE", value: { len: 2, Rpn: "INTEG IND `nam`" } },
    { key: "F(?<strlen>\d) BF", value: { len: 2, Rpn: "SOLVE IND `nam`" } },
    {
      key: "F(?<strlen>\d) C0 aa",
      value: { len: 3, Rpn: "ASSIGN `nam` TO `csk`" }
    },
    { key: "F(?<strlen>\d) C1", value: { len: 2, Rpn: "VARMENU `nam`" } },
    {
      key: "F(?<strlen>\d) C2 (?<key>0[1-9])",
      value: { len: 3, Rpn: "KEY `key` XEQ `lbl`" }
    },
    {
      key: "F(?<strlen>\d) C3 (?<key>0[1-9])",
      value: { len: 3, Rpn: "KEY `key` GTO `lbl`" }
    },
    { key: "F(?<strlen>\d) C4", value: { len: 2, Rpn: "DIM `nam`" } },
    { key: "F(?<strlen>\d) C5", value: { len: 2, Rpn: "INPUT `nam`" } },
    { key: "F(?<strlen>\d) C6", value: { len: 2, Rpn: "EDITN `nam`" } },
    { key: "F(?<strlen>\d) C9", value: { len: 2, Rpn: "VARMENU IND `nam`" } },
    {
      key: "F(?<strlen>\d) CA (?<key>0[1-9])",
      value: { len: 3, Rpn: "KEY `key` XEQ IND `nam`" }
    },
    {
      key: "F(?<strlen>\d) CB (?<key>0[1-9])",
      value: { len: 3, Rpn: "KEY `key` GTO IND `nam`" }
    },
    { key: "F(?<strlen>\d) CC", value: { len: 2, Rpn: "DIM IND `nam`" } },
    { key: "F(?<strlen>\d) CD", value: { len: 2, Rpn: "INPUT IND `nam`" } },
    { key: "F(?<strlen>\d) CE", value: { len: 2, Rpn: "EDITN IND `nam`" } },
    { key: "F(?<strlen>\d) DB", value: { len: 2, Rpn: "ΣREG IND `nam`" } },
    { key: "F(?<strlen>\d) DC", value: { len: 2, Rpn: "FIX IND `nam`" } },
    { key: "F(?<strlen>\d) DD", value: { len: 2, Rpn: "SCI IND `nam`" } },
    { key: "F(?<strlen>\d) DE", value: { len: 2, Rpn: "ENG IND `nam`" } },
    { key: "F(?<strlen>\d) DF", value: { len: 2, Rpn: "TONE IND `nam`" } },
    { key: "F(?<strlen>\d) F0", value: { len: 2, Rpn: "CLP `lbl`" } },
    { key: "F(?<strlen>\d)", value: { len: 1, Rpn: "`str`" } } //max. length 15
  ];

  // #endregion
}
