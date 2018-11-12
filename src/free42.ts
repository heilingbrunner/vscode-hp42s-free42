import { unstring } from './contracts';
import { Parser } from './parser';
import { ProgError } from './progerror';
import { RawLine } from './rawline';

export class Free42 {
  //#region Members

  static rawCode: Map<string, string> = new Map<string, string>();
  static opCode: Map<string, string> = new Map<string, string>();
  static stack: Map<string, number> = new Map<string, number>();
  static charFocal: Map<string, number> = new Map<string, number>();

  static initializedForEncode: boolean = false;
  static initializedForDecode: boolean = false;

  //#endregion

  //#region public

  static initializeForEncode() {
    if (!Free42.initializedForEncode) {
      // transform arr_rawCode -> rawCode
      Free42.arr_rawCode.forEach((e: { key: string; value: string }) => {
        Free42.rawCode.set(e.key, e.value);
      });

      // transform arr_stack -> dic_stack
      Free42.arr_stack.forEach((e: { key: string; value: number }) => {
        Free42.stack.set(e.key, e.value);
      });

      // transform arr_special -> dic_special
      Free42.arr_special.forEach((e: { key: string; value: number }) => {
        Free42.charFocal.set(e.key, e.value);
      });

      Free42.initializedForEncode = true;
    }
  }

  static initializeForDecode() {
    if (!Free42.initializedForDecode) {
      // transform arr_opCode -> opCode
      Free42.arr_opCode.forEach((e: { key: string; value: string }) => {
        Free42.opCode.set(e.key, e.value);
      });

      Free42.initializedForDecode = true;
    }
  }

  /** Code to raw
   * Input:
   * languageId: free42/hp42s
   * parser: The code line as Parser-Object
   * Return:
   * result: Tuple with raw and error
   */
  static toRaw(languageId: string, parser: Parser): RawLine {
    let raw: unstring = undefined;
    let progErrorText: unstring = undefined;
    let languageIdFromCode: string = '';

    if (parser.out !== undefined) {
      // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
      if (
        parser.token &&
        parser.token.match(
          /(ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE\+|DDAYS|DMY|DOW|MDY|TIME)/
        )
      ) {
        languageIdFromCode = 'free42';
      } else {
        languageIdFromCode = languageId;
      }

      if (languageId !== languageIdFromCode) {
        progErrorText =
          "free42 command '" + parser.token + "' in hp42s program";
      }

      if (progErrorText === undefined) {
        if (parser.tokenLength === 1) {
          //#region 1 Token

          // is it a string ...
          if (
            raw === undefined &&
            progErrorText === undefined &&
            parser.str &&
            parser.out.match(/`str`/)
          ) {
            if (Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
              if (raw !== undefined) {
                raw = Free42.insertStringInRaw(raw, parser.str);
              }
            }
            if (raw === undefined) {
              progErrorText =
                "'" + parser.str + "' in '" + parser.code + "' is unvalid";
            }
          }

          // is it a simple number ...
          if (
            raw === undefined &&
            progErrorText === undefined &&
            parser.num &&
            parser.out.match(/`num`/)
          ) {
            raw = Free42.convertNumberToRaw(parser.num);
            //useless: if (raw === undefined) {..}
          }

          // is it a single "fixed" opcode ...
          if (
            raw === undefined &&
            progErrorText === undefined &&
            parser.token &&
            Free42.rawCode.has(parser.out)
          ) {
            raw = Free42.rawCode.get(parser.out);
            //useless: if (raw === undefined) {..}
          }

          if (raw === undefined && progErrorText === undefined) {
            progErrorText = "Unknown '" + parser.code + "'";
          }

          return new RawLine(
            raw,
            progErrorText
              ? new ProgError(parser.lineNr, parser.code, String(progErrorText))
              : undefined
          );

          //#endregion
        } else {
          //#region n Tokens

          // is it a key ...
          // KEY `key` GTO IND `nam` - Part 1
          if (parser.key && parser.out.match(/`key`/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertNumberInRaw(raw, parser.key);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.key + "' in '" + parser.code + "'";
            }
          }

          // is it a string ...
          // KEY `key` GTO IND `nam` - Part 2
          // ASSIGN `nam` TO `csk` - Part 1
          if (parser.nam && parser.out.match(/`nam`/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertStringInRaw(raw, parser.nam);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.nam + "' in '" + parser.code + "'";
            }
          }

          // is it a custom key, raw must already exist
          // ASSIGN `nam` TO `csk` - Part 2
          if (parser.csk && parser.out.match(/`csk`/)) {
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertNumberInRaw(raw, parser.csk);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.csk + "' in '" + parser.code + "'";
            }
          }

          // is it a global label ...
          if (parser.lbl && parser.out.match(/`lbl`/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertStringInRaw(raw, parser.lbl);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.lbl + "' in '" + parser.code + "'";
            }
          }

          // is it a tone ...
          if (parser.ton && parser.out.match(/tn/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertNumberInRaw(raw, parser.ton);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.ton + "' in '" + parser.code + "'";
            }
          }

          // is it a local char label A-J,a-e coded as number ......
          if (parser.clb && parser.out.match(/(ll)/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertNumberInRaw(raw, parser.clb);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.clb + "' in '" + parser.code + "'";
            }
          }

          // is it a register, number labels, digits, local number label 15-99 ......
          if (parser.num && parser.out.match(/(sd|sl|sr|ll|nn|rr)/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertNumberInRaw(raw, parser.num);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.num + "' in '" + parser.code + "'";
            }
          }

          // 10 or 11 digits
          if (parser.out.match(/(ENG|FIX|SCI) (10|11)/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.code + "'";
            }
          }

          // is it a register/indirect count of digit/flag ...
          if (parser.num && parser.out.match(/rr/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              raw = Free42.insertNumberInRaw(raw, parser.num);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.num + "' in '" + parser.code + "'";
            }
          }

          // is it a stack ...
          if (parser.stk && parser.out.match(/`stk`/)) {
            if (raw === undefined && Free42.rawCode.has(parser.out)) {
              raw = Free42.rawCode.get(parser.out);
            }
            if (raw !== undefined && progErrorText === undefined) {
              const int = Free42.stack.get(parser.stk);
              raw = Free42.insertNumberInRaw(raw, String(int));
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.stk + "' in '" + parser.code + "'";
            }
          }

          if (raw === undefined && progErrorText === undefined) {
            progErrorText = "'" + parser.code + "' is unvalid";
          }

          return new RawLine(
            raw,
            progErrorText
              ? new ProgError(parser.lineNr, parser.code, String(progErrorText))
              : undefined
          );

          //#endregion
        }
      }
    }

    return new RawLine(
      raw,
      progErrorText
        ? new ProgError(parser.lineNr, parser.code, String(progErrorText))
        : undefined
    );
  }

  /** Raw to code
   * Input:
   * raw: raw hex code
   * Output:
   * languageId: free42/hp42s
   * code: The code
   * error: error
   */
  //static toCode(hex: string): [string, unstring, unarrerror] {
  //  let errors: unarrerror = [new Error(0,"Not implemented yet!")];
  //  let languageId: string = "free42";
  //
  //	return [languageId, undefined, errors];
  //}

  //#endregion

  //#region Hex Operations

  /** Changing strings into corresponding opcodes (also adjusting the
   * instruction length in "Fn" byte).
   */
  static insertStringInRaw(raw: unstring, str: unstring): unstring {
    if (raw !== undefined) {
      if (str !== undefined) {
        let len_str = str.length;
        let pos_Fn = raw.indexOf('Fn');

        // replace all occurences of focal character, see parser
        //Free42.charFocal.forEach((value, key) => {
        //  const regex = new RegExp(key, 'g');
        //  if (str) {
        //    str = str.replace(regex, String.fromCharCode(value));
        //  }
        //});

        len_str = str.length;

        // str too long ? len > 14: max concat string length; 15: opcodes with Fn; 7: else
        if (len_str > (raw.match('Fn 7F') ? 14 : raw.match('Fn') ? 15 : 7)) {
          //TODO: error !!
        }

        // loop each character in str and append hex to opcode
        str.split('').forEach(character => {
          raw += ' ' + Free42.convertByteAsHex(character.charCodeAt(0));
        });

        // ASSIGN opcode search, replace aa
        raw = raw.replace(/ aa(.*)/, '$1 nn');

        const length_hex_after_Fn = (raw.length - (pos_Fn + 2)) / 3;

        //console.log(
        //  HP42SEncoder.convertNumberToHexString(240 + length_hex_after_Fn)
        //);

        // concat three parts ...
        raw =
          raw.substr(0, pos_Fn) + // 1. part
          Free42.convertByteAsHex(240 + length_hex_after_Fn) + // 2. part
          raw.substr(pos_Fn + 2); // 3. part
      } else {
        raw = undefined;
      }
    }

    return raw;
  }

  /** Insert a number into raw */
  static insertNumberInRaw(raw: unstring, num: unstring): unstring {
    if (raw !== undefined && num !== undefined) {
      let int = parseInt(num);
      let match: RegExpMatchArray | null = null;

      switch (true) {
        case /kk/.test(raw):
          raw = raw.replace(/kk/, Free42.convertByteAsHex(int));
          break;

        case /rr/.test(raw):
          raw = raw.replace(/rr/, Free42.convertByteAsHex(int));
          break;

        case /nn/.test(raw):
          // numbered label 00-99, digits 00-11
          raw = raw.replace(/nn/, Free42.convertByteAsHex(int));
          break;

        case /ll/.test(raw):
          // char label as number A-J,a-e
          raw = raw.replace(/ll/, 'CF ' + Free42.convertByteAsHex(int));
          break;

        case /ww ww/.test(raw):
          // SIZE
          raw = raw.replace(
            /ww ww/,
            Free42.convertByteAsHex(int / 256) +
              ' ' +
              Free42.convertByteAsHex(int % 256)
          );
          break;

        case /([\dA-F])l/.test(raw):
          // not working: hex = hex.replace(/([\dA-F])l/, this.convertNumberToHexString(parseInt('0x' + '$1' + '0') + 1 + int));
          match = raw.match(/([\dA-F])l/);
          if (match) {
            raw = raw.replace(
              /([\dA-F])l/,
              Free42.convertByteAsHex(parseInt('0x' + match[1] + '0') + 1 + int)
            );
          }
          break;

        case /(\d)r/.test(raw):
          // not working: $1
          match = raw.match(/(\d)r/);
          if (match) {
            raw = raw.replace(
              /(\d)r/,
              Free42.convertByteAsHex(parseInt(match[1]) * 16 + int)
            );
          }
          break;

        case /([\dA-F])t/.test(raw):
          // stack, not working: $1
          match = raw.match(/([\dA-F])t/);
          if (match) {
            raw = raw.replace(/([\dA-F])t/, match[1] + num);
          }
          break;

        default:
          break;
      }
    } else {
      raw = undefined;
    }

    return raw;
  }

  /** Changing numbers into corresponding opcodes.
   * "1.234E-455" -> 11 1A 12 13 14 1B 1C 14 15 15 00
   */
  static convertNumberToRaw(num: unstring): unstring {
    if (num !== undefined) {
      // "1.234E-455" -> 11 1A 12 13 14 1B 1C 14 15 15 00
      num =
        num
          .replace(/(\d)/g, ' 1$1') // replace 1234E-455                 -> 11 .  12 13 14 E  -  14 15 15
          .replace(/\./, ' 1A') // replace .                             -> 11 1A 12 13 14 E  -  14 15 15
          .replace(/(ᴇ|e|E)/, ' 1B') // replace (ᴇ|e|E)                  -> 11 1A 12 13 14 1B -  14 15 15
          .replace(/-/g, ' 1C') // replace - -> 1C                       -> 11 1A 12 13 14 1B 1C 14 15 15
          .replace(' ', '') + ' 00'; // remove first space + append 00   ->11 1A 12 13 14 1B 1C 14 15 15 00
    }

    return num;
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

  private static arr_rawCode = [
    { key: '%', value: '4C' },
    { key: '%CH', value: '4D' },
    { key: '+', value: '40' },
    { key: '+/-', value: '54' },
    { key: '-', value: '41' },
    { key: '.END.', value: 'C0 00 0D' },
    { key: '/', value: '43' },
    { key: '1/X', value: '60' },
    { key: '10^X', value: '57' },
    { key: '10↑X', value: '57' },
    { key: 'ABS', value: '61' },
    { key: 'ACCEL', value: 'A7 CF' },
    { key: 'ACOS', value: '5D' },
    { key: 'ACOSH', value: 'A0 66' },
    { key: 'ADATE', value: 'A6 81' },
    { key: 'ADV', value: '8F' },
    { key: 'AGRAPH', value: 'A7 64' },
    { key: 'AIP', value: 'A6 31' },
    { key: 'ALENG', value: 'A6 41' },
    { key: 'ALL', value: 'A2 5D' },
    { key: 'ALLΣ', value: 'A0 AE' },
    { key: 'AND', value: 'A5 88' },
    { key: 'AOFF', value: '8B' },
    { key: 'AON', value: '8C' },
    { key: 'ARCL IND ST `stk`', value: '9B Ft' },
    { key: 'ARCL IND `nam`', value: 'Fn BB' },
    { key: 'ARCL IND rr', value: '9B 8r' },
    { key: 'ARCL ST `stk`', value: '9B 7t' },
    { key: 'ARCL `nam`', value: 'Fn B3' },
    { key: 'ARCL rr', value: '9B rr' },
    { key: 'AROT', value: 'A6 46' },
    { key: 'ASHF', value: '88' },
    { key: 'ASIN', value: '5C' },
    { key: 'ASINH', value: 'A0 64' },
    { key: 'ASSIGN `nam` TO `csk`', value: 'Fn C0 aa' },
    { key: 'ASTO IND ST `stk`', value: '9A Ft' },
    { key: 'ASTO IND `nam`', value: 'Fn BA' },
    { key: 'ASTO IND rr', value: '9A 8r' },
    { key: 'ASTO ST `stk`', value: '9A 7t' },
    { key: 'ASTO `nam`', value: 'Fn B2' },
    { key: 'ASTO rr', value: '9A rr' },
    { key: 'ATAN', value: '5E' },
    { key: 'ATANH', value: 'A0 65' },
    { key: 'ATIME', value: 'A6 84' },
    { key: 'ATIME24', value: 'A6 85' },
    { key: 'ATOX', value: 'A6 47' },
    { key: 'AVIEW', value: '7E' },
    { key: 'BASE+', value: 'A0 E6' },
    { key: 'BASE-', value: 'A0 E7' },
    { key: 'BASE±', value: 'A0 EA' },
    { key: 'BASE×', value: 'A0 E8' },
    { key: 'BASE÷', value: 'A0 E9' },
    { key: 'BEEP', value: '86' },
    { key: 'BEST', value: 'A0 9F' },
    { key: 'BINM', value: 'A0 E5' },
    { key: 'BIT?', value: 'A5 8C' },
    { key: 'CF IND ST `stk`', value: 'A9 Ft' },
    { key: 'CF IND `nam`', value: 'Fn A9' },
    { key: 'CF IND rr', value: 'A9 8r' },
    { key: 'CF rr', value: 'A9 rr' },
    { key: 'CLA', value: '87' },
    { key: 'CLD', value: '7F' },
    { key: 'CLK12', value: 'A6 86' },
    { key: 'CLK24', value: 'A6 87' },
    { key: 'CLKEYS', value: 'A2 62' },
    { key: 'CLLCD', value: 'A7 63' },
    { key: 'CLMENU', value: 'A2 6D' },
    { key: 'CLP `lbl`', value: 'Fn F0' },
    { key: 'CLRG', value: '8A' },
    { key: 'CLST', value: '73' },
    { key: 'CLV IND ST `stk`', value: 'F2 D8 Ft' },
    { key: 'CLV IND `nam`', value: 'Fn B8' },
    { key: 'CLV IND rr', value: 'F2 D8 8r' },
    { key: 'CLV `nam`', value: 'Fn B0' },
    { key: 'CLX', value: '77' },
    { key: 'CLΣ', value: '70' },
    { key: 'COMB', value: 'A0 6F' },
    { key: 'COMPLEX', value: 'A0 72' },
    { key: 'CORR', value: 'A0 A7' },
    { key: 'COS', value: '5A' },
    { key: 'COSH', value: 'A0 62' },
    { key: 'CPX?', value: 'A2 67' },
    { key: 'CPXRES', value: 'A2 6A' },
    { key: 'CROSS', value: 'A6 CA' },
    { key: 'CUSTOM', value: 'A2 6F' },
    { key: 'DATE', value: 'A6 8C' },
    { key: 'DATE+', value: 'A6 8D' },
    { key: 'DDAYS', value: 'A6 8E' },
    { key: 'DECM', value: 'A0 E3' },
    { key: 'DEG', value: '80' },
    { key: 'DELAY', value: 'A7 60' },
    { key: 'DELR', value: 'A0 AB' },
    { key: 'DET', value: 'A6 CC' },
    { key: 'DIM IND ST `stk`', value: 'F2 EC Ft' },
    { key: 'DIM IND `nam`', value: 'Fn CC' },
    { key: 'DIM IND rr', value: 'F2 EC 8r' },
    { key: 'DIM `nam`', value: 'Fn C4' },
    { key: 'DIM?', value: 'A6 E7' },
    { key: 'DMY', value: 'A6 8F' },
    { key: 'DOT', value: 'A6 CB' },
    { key: 'DOW', value: 'A6 90' },
    { key: 'DSE IND ST `stk`', value: '97 Ft' },
    { key: 'DSE IND `nam`', value: 'Fn 9F' },
    { key: 'DSE IND rr', value: '97 8r' },
    { key: 'DSE ST `stk`', value: '97 7t' },
    { key: 'DSE `nam`', value: 'Fn 97' },
    { key: 'DSE rr', value: '97 rr' },
    { key: 'EDIT', value: 'A6 E1' },
    { key: 'EDITN IND ST `stk`', value: 'F2 EF Ft' },
    { key: 'EDITN IND `nam`', value: 'Fn CE' },
    { key: 'EDITN IND rr', value: 'F2 EF 8r' },
    { key: 'EDITN `nam`', value: 'Fn C6' },
    { key: 'END', value: 'C0 00 0D' },
    { key: 'ENG 10', value: 'F1 D7' },
    { key: 'ENG 11', value: 'F1 E7' },
    { key: 'ENG IND ST `stk`', value: '9E Ft' },
    { key: 'ENG IND `nam`', value: 'Fn DE' },
    { key: 'ENG IND rr', value: '9E 8r' },
    { key: 'ENG sd', value: '9E nn' },
    { key: 'ENTER', value: '83' },
    { key: 'EXITALL', value: 'A2 6C' },
    { key: 'EXPF', value: 'A0 A0' },
    { key: 'E↑X', value: '55' },
    { key: 'E↑X-1', value: '58' },
    { key: 'FC? IND ST `stk`', value: 'AD Ft' },
    { key: 'FC? IND `nam`', value: 'Fn AD' },
    { key: 'FC? IND rr', value: 'AD 8r' },
    { key: 'FC? rr', value: 'AD rr' },
    { key: 'FC?C IND ST `stk`', value: 'AB Ft' },
    { key: 'FC?C IND `nam`', value: 'Fn AB' },
    { key: 'FC?C IND rr', value: 'AB 8r' },
    { key: 'FC?C rr', value: 'AB rr' },
    { key: 'FCSTX', value: 'A0 A8' },
    { key: 'FCSTY', value: 'A0 A9' },
    { key: 'FIX 10', value: 'F1 D5' },
    { key: 'FIX 11', value: 'F1 E5' },
    { key: 'FIX IND ST `stk`', value: '9C Ft' },
    { key: 'FIX IND `nam`', value: 'Fn DC' },
    { key: 'FIX IND rr', value: '9C 8r' },
    { key: 'FIX sd', value: '9C nn' },
    { key: 'FNRM', value: 'A6 CF' },
    { key: 'FP', value: '69' },
    { key: 'FS? IND ST `stk`', value: 'AC Ft' },
    { key: 'FS? IND `nam`', value: 'Fn AC' },
    { key: 'FS? IND rr', value: 'AC 8r' },
    { key: 'FS? rr', value: 'AC rr' },
    { key: 'FS?C IND ST `stk`', value: 'AA Ft' },
    { key: 'FS?C IND `nam`', value: 'Fn AA' },
    { key: 'FS?C IND rr', value: 'AA 8r' },
    { key: 'FS?C rr', value: 'AA rr' },
    { key: 'GAMMA', value: 'A0 74' },
    { key: 'GETKEY', value: 'A2 6E' },
    { key: 'GETM', value: 'A6 E8' },
    { key: 'GRAD', value: '82' },
    { key: 'GROW', value: 'A6 E3' },
    { key: 'GTO IND ST `stk`', value: 'AE 7t' },
    { key: 'GTO IND `nam`', value: 'Fn AE' },
    { key: 'GTO IND rr', value: 'AE nn' },
    { key: 'GTO `lbl`', value: '1D Fn' },
    { key: 'GTO ll', value: 'D0 00 nn' },
    { key: 'GTO sl', value: 'Bl 00' },
    { key: 'HEADING', value: 'A7 D1' },
    { key: 'HEXM', value: 'A0 E2' },
    { key: 'HMS+', value: '49' },
    { key: 'HMS-', value: '4A' },
    { key: 'I+', value: 'A6 D2' },
    { key: 'I-', value: 'A6 D3' },
    { key: 'INDEX IND ST `stk`', value: 'F2 DA Ft' },
    { key: 'INDEX IND `nam`', value: 'Fn 8F' },
    { key: 'INDEX IND rr', value: 'F2 DA 8r' },
    { key: 'INDEX `nam`', value: 'Fn 87' },
    { key: 'INPUT IND ST `stk`', value: 'F2 EE Ft' },
    { key: 'INPUT IND `nam`', value: 'Fn CD' },
    { key: 'INPUT IND rr', value: 'F2 EE 8r' },
    { key: 'INPUT ST `stk`', value: 'F2 D0 7t' },
    { key: 'INPUT `nam`', value: 'Fn C5' },
    { key: 'INPUT rr', value: 'F2 D0 rr' },
    { key: 'INSR', value: 'A0 AA' },
    { key: 'INTEG IND ST `stk`', value: 'F2 EA Ft' },
    { key: 'INTEG IND `nam`', value: 'Fn BE' },
    { key: 'INTEG IND rr', value: 'F2 EA 8r' },
    { key: 'INTEG `lbl`', value: 'Fn B6' },
    { key: 'INVRT', value: 'A6 CE' },
    { key: 'IP', value: '68' },
    { key: 'ISG IND ST `stk`', value: '96 Ft' },
    { key: 'ISG IND `nam`', value: 'Fn 9E' },
    { key: 'ISG IND rr', value: '96 8r' },
    { key: 'ISG ST `stk`', value: '96 7t' },
    { key: 'ISG `nam`', value: 'Fn 96' },
    { key: 'ISG rr', value: '96 rr' },
    { key: 'J+', value: 'A6 D4' },
    { key: 'J-', value: 'A6 D5' },
    { key: 'KEY `key` GTO IND ST `stk`', value: 'F3 E3 kk Ft' },
    { key: 'KEY `key` GTO IND `nam`', value: 'Fn CB kk' },
    { key: 'KEY `key` GTO IND rr', value: 'F3 E3 kk 8r' },
    { key: 'KEY `key` GTO `lbl`', value: 'Fn C3 kk' },
    { key: 'KEY `key` GTO ll', value: 'F3 E3 kk rr' },
    { key: 'KEY `key` GTO sl', value: 'F3 E3 kk rr' },
    { key: 'KEY `key` XEQ IND ST `stk`', value: 'F3 E2 kk Ft' },
    { key: 'KEY `key` XEQ IND `nam`', value: 'Fn CA kk' },
    { key: 'KEY `key` XEQ IND rr', value: 'F3 E2 kk 8r' },
    { key: 'KEY `key` XEQ `lbl`', value: 'Fn C2 kk' },
    { key: 'KEY `key` XEQ ll', value: 'F3 E2 kk rr' },
    { key: 'KEY `key` XEQ sl', value: 'F3 E2 kk rr' },
    { key: 'KEYASN', value: 'A2 63' },
    { key: 'LASTX', value: '76' },
    { key: 'LBL `lbl`', value: 'C0 00 Fn 00' },
    { key: 'LBL ll', value: 'CF nn' }, // 15-99,A-J,a-e
    { key: 'LBL sl', value: '0l' }, // 00-14
    { key: 'LCLBL', value: 'A2 64' },
    { key: 'LINF', value: 'A0 A1' },
    { key: 'LINΣ', value: 'A0 AD' },
    { key: 'LN', value: '50' },
    { key: 'LN1+X', value: '65' },
    { key: 'LOCAT', value: 'A7 D0' },
    { key: 'LOG', value: '56' },
    { key: 'LOGF', value: 'A0 A2' },
    { key: 'MAN', value: 'A7 5B' },
    { key: 'MAT?', value: 'A2 66' },
    { key: 'MDY', value: 'A6 91' },
    { key: 'MEAN', value: '7C' },
    { key: 'MENU', value: 'A2 5E' },
    { key: 'MOD', value: '4B' },
    { key: 'MVAR `nam`', value: 'Fn 90' },
    { key: 'N!', value: '62' },
    { key: 'NEWMAT', value: 'A6 DA' },
    { key: 'NORM', value: 'A7 5C' },
    { key: 'NOT', value: 'A5 87' },
    { key: 'NULL', value: '00' },
    { key: 'OCTM', value: 'A0 E4' },
    { key: 'OFF', value: '8D' },
    { key: 'OLD', value: 'A6 DB' },
    { key: 'ON', value: 'A2 70' },
    { key: 'OR', value: 'A5 89' },
    { key: 'PERM', value: 'A0 70' },
    { key: 'PGMINT IND ST `stk`', value: 'F2 E8 Ft' },
    { key: 'PGMINT IND `nam`', value: 'Fn BC' },
    { key: 'PGMINT IND rr', value: 'F2 E8 8r' },
    { key: 'PGMINT `lbl`', value: 'Fn B4' },
    { key: 'PGMSLV IND ST `stk`', value: 'F2 E9 Ft' },
    { key: 'PGMSLV IND `nam`', value: 'Fn BD' },
    { key: 'PGMSLV IND rr', value: 'F2 E9 8r' },
    { key: 'PGMSLV `lbl`', value: 'Fn B5' },
    { key: 'PI', value: '72' },
    { key: 'PIXEL', value: 'A7 65' },
    { key: 'POLAR', value: 'A2 59' },
    { key: 'POSA', value: 'A6 5C' },
    { key: 'PRA', value: 'A7 48' },
    { key: 'PRLCD', value: 'A7 62' },
    { key: 'PROFF', value: 'A7 5F' },
    { key: 'PROMPT', value: '8E' },
    { key: 'PRON', value: 'A7 5E' },
    { key: 'PRSTK', value: 'A7 53' },
    { key: 'PRUSR', value: 'A7 61' },
    { key: 'PRV IND ST `stk`', value: 'F2 D9 Ft' },
    { key: 'PRV IND `nam`', value: 'Fn B9' },
    { key: 'PRV IND rr', value: 'F2 D9 8r' },
    { key: 'PRV `nam`', value: 'Fn B1' },
    { key: 'PRX', value: 'A7 54' },
    { key: 'PRΣ', value: 'A7 52' },
    { key: 'PSE', value: '89' },
    { key: 'PUTM', value: 'A6 E9' },
    { key: 'PWRF', value: 'A0 A3' },
    { key: 'R<>R', value: 'A6 D1' },
    { key: 'RAD', value: '81' },
    { key: 'RAN', value: 'A0 71' },
    { key: 'RCL IND ST `stk`', value: '90 Ft' },
    { key: 'RCL IND `nam`', value: 'Fn 99' },
    { key: 'RCL IND rr', value: '90 8r' },
    { key: 'RCL ST `stk`', value: '90 7t' },
    { key: 'RCL `nam`', value: 'Fn 91' },
    { key: 'RCL rr', value: '90 rr' },
    { key: 'RCL sr', value: '2r' },
    { key: 'RCL+ IND ST `stk`', value: 'F2 D1 Ft' },
    { key: 'RCL+ IND `nam`', value: 'Fn 9A' },
    { key: 'RCL+ IND rr', value: 'F2 D1 8r' },
    { key: 'RCL+ ST `stk`', value: 'F2 D1 7t' },
    { key: 'RCL+ `nam`', value: 'Fn 92' },
    { key: 'RCL+ rr', value: 'F2 D1 rr' },
    { key: 'RCL- IND ST `stk`', value: 'F2 D2 Ft' },
    { key: 'RCL- IND `nam`', value: 'Fn 9B' },
    { key: 'RCL- IND rr', value: 'F2 D2 8r' },
    { key: 'RCL- ST `stk`', value: 'F2 D2 7t' },
    { key: 'RCL- `nam`', value: 'Fn 93' },
    { key: 'RCL- rr', value: 'F2 D2 rr' },
    { key: 'RCLEL', value: 'A6 D7' },
    { key: 'RCLIJ', value: 'A6 D9' },
    { key: 'RCL× IND ST `stk`', value: 'F2 D3 Ft' },
    { key: 'RCL× IND `nam`', value: 'Fn 9C' },
    { key: 'RCL× IND rr', value: 'F2 D3 8r' },
    { key: 'RCL× ST `stk`', value: 'F2 D3 7t' },
    { key: 'RCL× `nam`', value: 'Fn 94' },
    { key: 'RCL× rr', value: 'F2 D3 rr' },
    { key: 'RCL÷ IND ST `stk`', value: 'F2 D4 Ft' },
    { key: 'RCL÷ IND `nam`', value: 'Fn 9D' },
    { key: 'RCL÷ IND rr', value: 'F2 D4 8r' },
    { key: 'RCL÷ ST `stk`', value: 'F2 D4 7t' },
    { key: 'RCL÷ `nam`', value: 'Fn 95' },
    { key: 'RCL÷ rr', value: 'F2 D4 rr' },
    { key: 'RDX,', value: 'A2 5C' },
    { key: 'RDX.', value: 'A2 5B' },
    { key: 'REAL?', value: 'A2 65' },
    { key: 'REALRES', value: 'A2 6B' },
    { key: 'RECT', value: 'A2 5A' },
    { key: 'RND', value: '6E' },
    { key: 'RNRM', value: 'A6 ED' },
    { key: 'ROTXY', value: 'A5 8B' },
    { key: 'RSUM', value: 'A6 D0' },
    { key: 'RTN', value: '85' },
    { key: 'R↑', value: '74' },
    { key: 'R↓', value: '75' },
    { key: 'SCI 10', value: 'F1 D6' },
    { key: 'SCI 11', value: 'F1 E6' },
    { key: 'SCI IND ST `stk`', value: '9D Ft' },
    { key: 'SCI IND `nam`', value: 'Fn DD' },
    { key: 'SCI IND rr', value: '9D 8r' },
    { key: 'SCI sd', value: '9D nn' },
    { key: 'SDEV', value: '7D' },
    { key: 'SEED', value: 'A0 73' },
    { key: 'SF IND ST `stk`', value: 'A8 Ft' },
    { key: 'SF IND `nam`', value: 'Fn A8' },
    { key: 'SF IND rr', value: 'A8 8r' },
    { key: 'SF rr', value: 'A8 rr' },
    { key: 'SIGN', value: '7A' },
    { key: 'SIN', value: '59' },
    { key: 'SINH', value: 'A0 61' },
    { key: 'SIZE rr', value: 'F3 F7 ww ww' },
    { key: 'SLOPE', value: 'A0 A4' },
    { key: 'SOLVE IND ST `stk`', value: 'F2 EB Ft' },
    { key: 'SOLVE IND `nam`', value: 'Fn BF' },
    { key: 'SOLVE IND rr', value: 'F2 EB 8r' },
    { key: 'SOLVE `lbl`', value: 'Fn B7' },
    { key: 'SQRT', value: '52' },
    { key: 'STO IND ST `stk`', value: '91 Ft' },
    { key: 'STO IND `nam`', value: 'Fn 89' },
    { key: 'STO IND rr', value: '91 8r' },
    { key: 'STO ST `stk`', value: '91 7t' },
    { key: 'STO `nam`', value: 'Fn 81' },
    { key: 'STO rr', value: '91 rr' },
    { key: 'STO sr', value: '3r' },
    { key: 'STO+ IND ST `stk`', value: '92 Ft' },
    { key: 'STO+ IND `nam`', value: 'Fn 8A' },
    { key: 'STO+ IND rr', value: '92 8r' },
    { key: 'STO+ ST `stk`', value: '92 7t' },
    { key: 'STO+ `nam`', value: 'Fn 82' },
    { key: 'STO+ rr', value: '92 rr' },
    { key: 'STO- IND ST `stk`', value: '93 Ft' },
    { key: 'STO- IND `nam`', value: 'Fn 8B' },
    { key: 'STO- IND rr', value: '93 8r' },
    { key: 'STO- ST `stk`', value: '93 7t' },
    { key: 'STO- `nam`', value: 'Fn 83' },
    { key: 'STO- rr', value: '93 rr' },
    { key: 'STOEL', value: 'A6 D6' },
    { key: 'STOIJ', value: 'A6 D8' },
    { key: 'STOP', value: '84' },
    { key: 'STO× IND ST `stk`', value: '94 Ft' },
    { key: 'STO× IND `nam`', value: 'Fn 8C' },
    { key: 'STO× IND rr', value: '94 8r' },
    { key: 'STO× ST `stk`', value: '94 7t' },
    { key: 'STO× `nam`', value: 'Fn 84' },
    { key: 'STO× rr', value: '94 rr' },
    { key: 'STO÷ IND ST `stk`', value: '95 Ft' },
    { key: 'STO÷ IND `nam`', value: 'Fn 8D' },
    { key: 'STO÷ IND rr', value: '95 8r' },
    { key: 'STO÷ ST `stk`', value: '95 7t' },
    { key: 'STO÷ `nam`', value: 'Fn 85' },
    { key: 'STO÷ rr', value: '95 rr' },
    { key: 'STR?', value: 'A2 68' },
    { key: 'SUM', value: 'A0 A5' },
    { key: 'TAN', value: '5B' },
    { key: 'TANH', value: 'A0 63' },
    { key: 'TIME', value: 'A6 9C' },
    { key: 'TONE IND ST `stk`', value: '9F Ft' },
    { key: 'TONE IND `nam`', value: 'Fn DF' },
    { key: 'TONE IND rr', value: '9F 8r' },
    { key: 'TONE tn', value: '9F rr' },
    { key: 'TRACE', value: 'A7 5D' },
    { key: 'TRANS', value: 'A6 C9' },
    { key: 'UVEC', value: 'A6 CD' },
    { key: 'VARMENU IND ST `stk`', value: 'F2 F8 Ft' },
    { key: 'VARMENU IND `nam`', value: 'Fn C9' },
    { key: 'VARMENU IND rr', value: 'F2 F8 8r' },
    { key: 'VARMENU `nam`', value: 'Fn C1' },
    { key: 'VIEW IND ST `stk`', value: '98 Ft' },
    { key: 'VIEW IND `nam`', value: 'Fn 88' },
    { key: 'VIEW IND rr', value: '98 8r' },
    { key: 'VIEW ST `stk`', value: '98 7t' },
    { key: 'VIEW `nam`', value: 'Fn 80' },
    { key: 'VIEW rr', value: '98 rr' },
    { key: 'WMEAN', value: 'A0 AC' },
    { key: 'WRAP', value: 'A6 E2' },
    { key: 'X<0?', value: '66' },
    { key: 'X<> IND ST `stk`', value: 'CE Ft' },
    { key: 'X<> IND `nam`', value: 'Fn 8E' },
    { key: 'X<> IND rr', value: 'CE 8r' },
    { key: 'X<> ST `stk`', value: 'CE 7t' },
    { key: 'X<> `nam`', value: 'Fn 86' },
    { key: 'X<> rr', value: 'CE rr' },
    { key: 'X<>Y', value: '71' },
    { key: 'X<Y?', value: '44' },
    { key: 'X=0?', value: '67' },
    { key: 'X=Y?', value: '78' },
    { key: 'X>0?', value: '64' },
    { key: 'X>Y?', value: '45' },
    { key: 'XEQ IND ST `stk`', value: 'AE Ft' },
    { key: 'XEQ IND `nam`', value: 'Fn AF' },
    { key: 'XEQ IND rr', value: 'AE 8r' },
    { key: 'XEQ `lbl`', value: '1E Fn' },
    { key: 'XEQ ll', value: 'E0 00 nn' },
    { key: 'XEQ sl', value: 'E0 00 nn' },
    { key: 'XOR', value: 'A5 8A' },
    { key: 'XTOA', value: 'A6 6F' },
    { key: 'X↑2', value: '51' },
    { key: 'X≠0?', value: '63' },
    { key: 'X≠Y?', value: '79' },
    { key: 'X≤0?', value: '7B' },
    { key: 'X≤Y?', value: '46' },
    { key: 'X≥0?', value: 'A2 5F' },
    { key: 'X≥Y?', value: 'A2 60' },
    { key: 'X≶Y', value: '71' },
    { key: 'YINT', value: 'A0 A6' },
    { key: 'Y↑X', value: '53' },
    { key: '[FIND]', value: 'A6 EC' },
    { key: '[MAX]', value: 'A6 EB' },
    { key: '[MIN]', value: 'A6 EA' },
    { key: '`str`', value: 'Fn' },
    { key: '|-`str`', value: 'Fn 7F' },
    { key: '±', value: '54' },
    { key: '×', value: '42' },
    { key: '÷', value: '43' },
    { key: 'Σ+', value: '47' },
    { key: 'Σ-', value: '48' },
    { key: 'ΣREG IND ST `stk`', value: '99 Ft' },
    { key: 'ΣREG IND `nam`', value: 'Fn DB' },
    { key: 'ΣREG IND rr', value: '99 8r' },
    { key: 'ΣREG rr', value: '99 rr' },
    { key: 'ΣREG?', value: 'A6 78' },
    { key: 'π', value: '72' },
    { key: '←', value: 'A6 DC' },
    { key: '↑', value: 'A6 DE' },
    { key: '→', value: 'A6 DD' },
    { key: '→DEC', value: '5F' },
    { key: '→DEG', value: '6B' },
    { key: '→HMS', value: '6C' },
    { key: '→HR', value: '6D' },
    { key: '→OCT', value: '6F' },
    { key: '→POL', value: '4F' },
    { key: '→RAD', value: '6A' },
    { key: '→REC', value: '4E' },
    { key: '↓', value: 'A6 DF' },
    { key: '⊢`str`', value: 'Fn 7F' }
  ];

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

  private static arr_stack = [
    { key: 'T', value: 0 },
    { key: 'Z', value: 1 },
    { key: 'Y', value: 2 },
    { key: 'X', value: 3 },
    { key: 'L', value: 4 }
  ];

  private static arr_errors: string[] = [
    'No errors',
    'Keyword not found',
    'Bad parameters',
    'String too long'
  ];

  // FOCAL character set
  // https://en.wikipedia.org/wiki/FOCAL_character_set
  // key is used as regex
  private static arr_special = [
    { key: '÷', value: 0 },
    { key: '×', value: 1 },
    { key: '√', value: 2 },
    { key: '∫', value: 3 },
    { key: '░', value: 4 },
    { key: 'Σ', value: 5 },
    { key: '▶', value: 6 },
    { key: 'π', value: 7 },
    { key: '¿', value: 8 },
    { key: '≤', value: 9 },
    { key: '\\\[LF\\\]', value: 10 },
    { key: '≥', value: 11 },
    { key: '≠', value: 12 },
    { key: '↵', value: 13 },
    { key: '↓', value: 14 },
    { key: '→', value: 15 },
    { key: '←', value: 16 },
    { key: 'µ', value: 17 },
    { key: 'μ', value: 17 },
    { key: '£', value: 18 },
    { key: '₤', value: 18 },
    { key: '°', value: 19 },
    { key: 'Å', value: 20 },
    { key: 'Ñ', value: 21 },
    { key: 'Ä', value: 22 },
    { key: '∡', value: 23 },
    { key: 'ᴇ', value: 24 },
    { key: 'Æ', value: 25 },
    { key: '…', value: 26 },
    { key: '␛', value: 27 },
    { key: 'Ö', value: 28 },
    { key: 'Ü', value: 29 },
    { key: '▒', value: 30 },
    { key: '■', value: 31 },
    { key: '•', value: 31 },
    // { key: "SP", value: 32 },
    // { key: "!", value: 33 },
    // { key: """, value: 34 },
    // { key: "#", value: 35 },
    // { key: "$", value: 36 },
    // { key: "%", value: 37 },
    // { key: "&", value: 38 },
    // { key: "'", value: 39 },
    // { key: "(", value: 40 },
    // { key: ")", value: 41 },
    // { key: "*", value: 42 },
    // { key: "+", value: 43 },
    // { key: ",", value: 44 },
    // { key: "-", value: 45 },
    // { key: ".", value: 46 },
    // { key: "/", value: 47 },
    // { key: "0", value: 48 },
    // { key: "1", value: 49 },
    // { key: "2", value: 50 },
    // { key: "3", value: 51 },
    // { key: "4", value: 52 },
    // { key: "5", value: 53 },
    // { key: "6", value: 54 },
    // { key: "7", value: 55 },
    // { key: "8", value: 56 },
    // { key: "9", value: 57 },
    // { key: ":", value: 58 },
    // { key: ";", value: 59 },
    // { key: "<", value: 60 },
    // { key: "=", value: 61 },
    // { key: ">", value: 62 },
    // { key: "?", value: 63 },
    // { key: "@", value: 64 },
    // { key: "A", value: 65 },
    // { key: "B", value: 66 },
    // { key: "C", value: 67 },
    // { key: "D", value: 68 },
    // { key: "E", value: 69 },
    // { key: "F", value: 70 },
    // { key: "G", value: 71 },
    // { key: "H", value: 72 },
    // { key: "I", value: 73 },
    // { key: "J", value: 74 },
    // { key: "K", value: 75 },
    // { key: "L", value: 76 },
    // { key: "M", value: 77 },
    // { key: "N", value: 78 },
    // { key: "O", value: 79 },
    // { key: "P", value: 80 },
    // { key: "Q", value: 81 },
    // { key: "R", value: 82 },
    // { key: "S", value: 83 },
    // { key: "T", value: 84 },
    // { key: "U", value: 85 },
    // { key: "V", value: 86 },
    // { key: "W", value: 87 },
    // { key: "X", value: 88 },
    // { key: "Y", value: 89 },
    // { key: "Z", value: 90 },
    // { key: "[", value: 91 },
    { key: '\\\\', value: 92 }, // for \
    // { key: "]", value: 93 },
    { key: '↑', value: 94 }
    // { key: "_", value: 95 },
    // { key: "`", value: 96 },
    // { key: "a", value: 97 },
    // { key: "b", value: 98 },
    // { key: "c", value: 99 },
    // { key: "d", value: 100 },
    // { key: "e", value: 101 },
    // { key: "f", value: 102 },
    // { key: "g", value: 103 },
    // { key: "h", value: 104 },
    // { key: "i", value: 105 },
    // { key: "j", value: 106 },
    // { key: "k", value: 107 },
    // { key: "l", value: 108 },
    // { key: "m", value: 109 },
    // { key: "n", value: 110 },
    // { key: "o", value: 111 },
    // { key: "p", value: 112 },
    // { key: "q", value: 113 },
    // { key: "r", value: 114 },
    // { key: "s", value: 115 },
    // { key: "t", value: 116 },
    // { key: "u", value: 117 },
    // { key: "v", value: 118 },
    // { key: "w", value: 119 },
    // { key: "x", value: 120 },
    // { key: "y", value: 121 },
    // { key: "z", value: 122 },
    // { key: "{", value: 123 },
    // { key: "|", value: 124 },
    // { key: "}", value: 125 },
    // { key: "~", value: 126 },
    // { key: "⊦", value: 127 }
  ];

  // #endregion
}
