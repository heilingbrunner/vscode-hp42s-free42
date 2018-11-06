import { unstring } from './contracts';
import { Parser } from './parser';
import { ProgError } from './progerror';
import { RawLine } from './rawline';

export class Free42 {
  //#region Members

  static opCode: Map<string, string> = new Map<string, string>();
  static stack: Map<string, number> = new Map<string, number>();
  static charFocal: Map<string, number> = new Map<string, number>();

  static initialized: boolean = false;

  //#endregion

  //#region public

  static initialize() {
    if (!Free42.initialized) {
      // transform arr_op1 -> opCode1
      Free42.arr_opCode.forEach((e: { key: string; value: string }) => {
        //FREE42.opCode[e.key] = e.value;
        Free42.opCode.set(e.key, e.value);
      });

      // transform arr_stack -> dic_stack
      Free42.arr_stack.forEach((e: { key: string; value: number }) => {
        Free42.stack.set(e.key, e.value);
      });

      // transform arr_special -> dic_special
      Free42.arr_special.forEach((e: { key: string; value: number }) => {
        Free42.charFocal.set(e.key, e.value);
      });

      Free42.initialized = true;
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
      if(parser.token && parser.token.match(/(ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE\+|DDAYS|DMY|DOW|MDY|TIME)/)){
        languageIdFromCode = 'free42';
      } else {
        languageIdFromCode = languageId;
      }

      if(languageId !== languageIdFromCode){
        progErrorText = 'free42 command \'' + parser.token + '\' in hp42s program';
      }

      if(progErrorText === undefined){
        if (parser.tokenLength === 1) {
          //#region 1 Token
  
          // is it a string ...
          if (
            raw === undefined &&
            progErrorText === undefined &&
            parser.str &&
            parser.out.match(/`str`/)
          ) {
            if (Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
              if (raw !== undefined) {
                raw = Free42.insertStringInRaw(raw, parser.str);
              }
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.str + "' in '" + parser.code + "'";
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
            Free42.opCode.has(parser.out)
          ) {
            raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
            }
            if (raw === undefined) {
              progErrorText = "'" + parser.code + "'";
            }
          }
  
          // is it a register/indirect count of digit/flag ...
          if (parser.num && parser.out.match(/rr/)) {
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            if (raw === undefined && Free42.opCode.has(parser.out)) {
              raw = Free42.opCode.get(parser.out);
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
            progErrorText = "'" + parser.code + "'";
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
  //static fromRaw(hex: string): [string, unstring, unarrerror] {
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
    if(raw !== undefined){
      
      if (str !== undefined) {
        let len_str = str.length;
        let pos_Fn = raw.indexOf('Fn');
  
        // replace all occurences of focal character
        Free42.charFocal.forEach((value, key) => {
          const regex = new RegExp(key, 'g');
          if (str) {
            str = str.replace(regex, String.fromCharCode(value));
          }
        });
  
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

  private static arr_opCode = [
    { key: 'CLX', value: '77' },
    { key: 'ENTER', value: '83' },
    { key: 'X<>Y', value: '71' },
    { key: 'X≶Y', value: '71' },
    { key: 'Rv', value: '75' },
    { key: 'R↓', value: '75' },
    { key: '+/-', value: '54' },
    { key: '±', value: '54' },
    { key: '/', value: '43' },
    { key: '÷', value: '43' },
    { key: 'x', value: '42' },
    { key: '×', value: '42' },
    { key: '-', value: '41' },
    { key: '+', value: '40' },
    { key: 'LASTX', value: '76' },
    { key: 'SIN', value: '59' },
    { key: 'COS', value: '5A' },
    { key: 'TAN', value: '5B' },
    { key: 'ASIN', value: '5C' },
    { key: 'ACOS', value: '5D' },
    { key: 'ATAN', value: '5E' },
    { key: 'LOG', value: '56' },
    { key: '10^X', value: '57' },
    { key: '10↑X', value: '57' },
    { key: 'LN', value: '50' },
    { key: 'E^X', value: '55' },
    { key: 'E↑X', value: '55' },
    { key: 'SQRT', value: '52' },
    { key: 'X^2', value: '51' },
    { key: 'X↑2', value: '51' },
    { key: '1/X', value: '60' },
    { key: 'Y^X', value: '53' },
    { key: 'Y↑X', value: '53' },
    { key: '%', value: '4C' },
    { key: 'PI', value: '72' },
    { key: 'π', value: '72' },
    { key: 'COMPLEX', value: 'A0 72' },
    { key: 'ALL', value: 'A2 5D' },
    { key: 'NULL', value: '00' },
    { key: 'CLA', value: '87' },
    { key: 'DEG', value: '80' },
    { key: 'RAD', value: '81' },
    { key: 'GRAD', value: '82' },
    { key: 'RECT', value: 'A2 5A' },
    { key: 'POLAR', value: 'A2 59' },
    { key: 'CPXRES', value: 'A2 6A' },
    { key: 'REALRES', value: 'A2 6B' },
    { key: 'KEYASN', value: 'A2 63' },
    { key: 'LCLBL', value: 'A2 64' },
    { key: 'RDX.', value: 'A2 5B' },
    { key: 'RDX,', value: 'A2 5C' },
    { key: 'CLSigma', value: '70' },
    { key: 'CLΣ', value: '70' },
    { key: 'CLST', value: '73' },
    { key: 'CLRG', value: '8A' },
    { key: 'CLKEYS', value: 'A2 62' },
    { key: 'CLLCD', value: 'A7 63' },
    { key: 'CLMENU', value: 'A2 6D' },
    { key: '->DEG', value: '6B' },
    { key: '->RAD', value: '6A' },
    { key: '->HR', value: '6D' },
    { key: '->HMS', value: '6C' },
    { key: '->REC', value: '4E' },
    { key: '->POL', value: '4F' },
    { key: '→DEG', value: '6B' },
    { key: '→RAD', value: '6A' },
    { key: '→HR', value: '6D' },
    { key: '→HMS', value: '6C' },
    { key: '→REC', value: '4E' },
    { key: '→POL', value: '4F' },
    { key: 'IP', value: '68' },
    { key: 'FP', value: '69' },
    { key: 'RND', value: '6E' },
    { key: 'ABS', value: '61' },
    { key: 'SIGN', value: '7A' },
    { key: 'MOD', value: '4B' },
    { key: 'COMB', value: 'A0 6F' },
    { key: 'PERM', value: 'A0 70' },
    { key: 'N!', value: '62' },
    { key: 'GAMMA', value: 'A0 74' },
    { key: 'RAN', value: 'A0 71' },
    { key: 'SEED', value: 'A0 73' },
    { key: 'RTN', value: '85' },
    { key: 'AVIEW', value: '7E' },
    { key: 'PROMPT', value: '8E' },
    { key: 'PSE', value: '89' },
    { key: 'AIP', value: 'A6 31' },
    { key: 'XTOA', value: 'A6 6F' },
    { key: 'AGRAPH', value: 'A7 64' },
    { key: 'PIXEL', value: 'A7 65' },
    { key: 'BEEP', value: '86' },
    { key: 'GETKEY', value: 'A2 6E' },
    { key: 'MENU', value: 'A2 5E' },
    { key: 'X=0?', value: '67' },
    { key: 'X!=0?', value: '63' },
    { key: 'X≠0?', value: '63' },
    { key: 'X<0?', value: '66' },
    { key: 'X>0?', value: '64' },
    { key: 'X<=0?', value: '7B' },
    { key: 'X≤0?', value: '7B' },
    { key: 'X>=0?', value: 'A2 5F' },
    { key: 'X≥0?', value: 'A2 5F' },
    { key: 'X=Y?', value: '78' },
    { key: 'X!=Y?', value: '79' },
    { key: 'X≠Y?', value: '79' },
    { key: 'X<Y?', value: '44' },
    { key: 'X>Y?', value: '45' },
    { key: 'X<=Y?', value: '46' },
    { key: 'X≤Y?', value: '46' },
    { key: 'X>=Y?', value: 'A2 60' },
    { key: 'X≥Y?', value: 'A2 60' },
    { key: 'PRSigma', value: 'A7 52' },
    { key: 'PRΣ', value: 'A7 52' },
    { key: 'PRSTK', value: 'A7 53' },
    { key: 'PRA', value: 'A7 48' },
    { key: 'PRX', value: 'A7 54' },
    { key: 'PRUSR', value: 'A7 61' },
    { key: 'ADV', value: '8F' },
    { key: 'PRLCD', value: 'A7 62' },
    { key: 'DELAY', value: 'A7 60' },
    { key: 'PRON', value: 'A7 5E' },
    { key: 'PROFF', value: 'A7 5F' },
    { key: 'MAN', value: 'A7 5B' },
    { key: 'NORM', value: 'A7 5C' },
    { key: 'TRACE', value: 'A7 5D' },
    { key: 'Sigma+', value: '47' },
    { key: 'Σ+', value: '47' },
    { key: 'Sigma-', value: '48' },
    { key: 'Σ-', value: '48' },
    { key: 'END', value: 'C0 00 0D' },
    { key: '.END.', value: 'C0 00 0D' },
    { key: 'STOP', value: '84' },
    { key: 'NEWMAT', value: 'A6 DA' },
    { key: 'R^', value: '74' },
    { key: 'R↑', value: '74' },
    { key: 'REAL?', value: 'A2 65' },
    { key: 'CPX?', value: 'A2 67' },
    { key: 'STR?', value: 'A2 68' },
    { key: 'MAT?', value: 'A2 66' },
    { key: 'DIM?', value: 'A6 E7' },
    { key: 'ON', value: 'A2 70' },
    { key: 'OFF', value: '8D' },
    { key: 'SigmaREG?', value: 'A6 78' },
    { key: 'ΣREG?', value: 'A6 78' },
    { key: 'CLD', value: '7F' },
    { key: 'ACOSH', value: 'A0 66' },
    { key: 'ALENG', value: 'A6 41' },
    { key: 'ALLSigma', value: 'A0 AE' },
    { key: 'ALLΣ', value: 'A0 AE' },
    { key: 'AND', value: 'A5 88' },
    { key: 'AOFF', value: '8B' },
    { key: 'AON', value: '8C' },
    { key: 'AROT', value: 'A6 46' },
    { key: 'ASHF', value: '88' },
    { key: 'ASINH', value: 'A0 64' },
    { key: 'ATANH', value: 'A0 65' },
    { key: 'ATOX', value: 'A6 47' },
    { key: 'BASE+', value: 'A0 E6' },
    { key: 'BASE-', value: 'A0 E7' },
    { key: 'BASE×', value: 'A0 E8' },
    { key: 'BASEx', value: 'A0 E8' },
    { key: 'BASE/', value: 'A0 E9' },
    { key: 'BASE÷', value: 'A0 E9' },
    { key: 'BASE+/-', value: 'A0 EA' },
    { key: 'BASE±', value: 'A0 EA' },
    { key: 'BEST', value: 'A0 9F' },
    { key: 'BINM', value: 'A0 E5' },
    { key: 'BIT?', value: 'A5 8C' },
    { key: 'CORR', value: 'A0 A7' },
    { key: 'COSH', value: 'A0 62' },
    { key: 'CROSS', value: 'A6 CA' },
    { key: 'CUSTOM', value: 'A2 6F' },
    { key: 'DECM', value: 'A0 E3' },
    { key: 'DELR', value: 'A0 AB' },
    { key: 'DET', value: 'A6 CC' },
    { key: 'DOT', value: 'A6 CB' },
    { key: 'EDIT', value: 'A6 E1' },
    { key: 'EXITALL', value: 'A2 6C' },
    { key: 'EXPF', value: 'A0 A0' },
    { key: 'E^X-1', value: '58' },
    { key: 'E↑X-1', value: '58' },
    { key: 'FCSTX', value: 'A0 A8' },
    { key: 'FCSTY', value: 'A0 A9' },
    { key: 'FNRM', value: 'A6 CF' },
    { key: 'GETM', value: 'A6 E8' },
    { key: 'GROW', value: 'A6 E3' },
    { key: 'HEXM', value: 'A0 E2' },
    { key: 'HMS+', value: '49' },
    { key: 'HMS-', value: '4A' },
    { key: 'I+', value: 'A6 D2' },
    { key: 'I-', value: 'A6 D3' },
    { key: 'INSR', value: 'A0 AA' },
    { key: 'INVRT', value: 'A6 CE' },
    { key: 'J+', value: 'A6 D4' },
    { key: 'J-', value: 'A6 D5' },
    { key: 'LINF', value: 'A0 A1' },
    { key: 'LINSigma', value: 'A0 AD' },
    { key: 'LINΣ', value: 'A0 AD' },
    { key: 'LN1+X', value: '65' },
    { key: 'LOGF', value: 'A0 A2' },
    { key: 'MEAN', value: '7C' },
    { key: 'NOT', value: 'A5 87' },
    { key: 'OCTM', value: 'A0 E4' },
    { key: 'OLD', value: 'A6 DB' },
    { key: 'OR', value: 'A5 89' },
    { key: 'POSA', value: 'A6 5C' },
    { key: 'PUTM', value: 'A6 E9' },
    { key: 'PWRF', value: 'A0 A3' },
    { key: 'RCLEL', value: 'A6 D7' },
    { key: 'RCLIJ', value: 'A6 D9' },
    { key: 'RNRM', value: 'A6 ED' },
    { key: 'ROTXY', value: 'A5 8B' },
    { key: 'RSUM', value: 'A6 D0' },
    { key: 'R<>R', value: 'A6 D1' },
    { key: 'SDEV', value: '7D' },
    { key: 'SINH', value: 'A0 61' },
    { key: 'SLOPE', value: 'A0 A4' },
    { key: 'STOEL', value: 'A6 D6' },
    { key: 'STOIJ', value: 'A6 D8' },
    { key: 'SUM', value: 'A0 A5' },
    { key: 'TANH', value: 'A0 63' },
    { key: 'TRANS', value: 'A6 C9' },
    { key: 'UVEC', value: 'A6 CD' },
    { key: 'WMEAN', value: 'A0 AC' },
    { key: 'WRAP', value: 'A6 E2' },
    { key: 'XOR', value: 'A5 8A' },
    { key: 'YINT', value: 'A0 A6' },
    { key: '->DEC', value: '5F' },
    { key: '->OCT', value: '6F' },
    { key: '→DEC', value: '5F' },
    { key: '→OCT', value: '6F' },
    { key: '<-', value: 'A6 DC' },
    { key: '←', value: 'A6 DC' },
    { key: '^', value: 'A6 DE' },
    { key: '↑', value: 'A6 DE' },
    { key: 'v', value: 'A6 DF' },
    { key: '↓', value: 'A6 DF' },
    { key: '->', value: 'A6 DD' },
    { key: '→', value: 'A6 DD' },
    { key: '%CH', value: '4D' },
    { key: '`str`', value: 'Fn' },
    { key: '⊢`str`', value: 'Fn 7F' },
    { key: '|-`str`', value: 'Fn 7F' },
    { key: '|-`str`', value: 'Fn 7F' },
    { key: '|-`str`', value: 'Fn 7F' },
    { key: '├`str`', value: 'Fn 7F' },
    { key: '[MAX]', value: 'A6 EB' },
    { key: '[MIN]', value: 'A6 EA' },
    { key: '[FIND]', value: 'A6 EC' },
    //--------------------------------------------------------
    //free42 added
    //--------------------------------------------------------
    { key: 'ACCEL', value: 'A7 CF' },
    { key: 'LOCAT', value: 'A7 D0' },
    { key: 'HEADING', value: 'A7 D1' },
    { key: 'ADATE', value: 'A6 81' },
    { key: 'ATIME', value: 'A6 84' },
    { key: 'ATIME24', value: 'A6 85' },
    { key: 'CLK12', value: 'A6 86' },
    { key: 'CLK24', value: 'A6 87' },
    { key: 'DATE', value: 'A6 8C' },
    { key: 'DATE+', value: 'A6 8D' },
    { key: 'DDAYS', value: 'A6 8E' },
    { key: 'DMY', value: 'A6 8F' },
    { key: 'DOW', value: 'A6 90' },
    { key: 'MDY', value: 'A6 91' },
    { key: 'TIME', value: 'A6 9C' },
    //--------------------------------------------------------
    { key: 'STO sr', value: '3r' },
    { key: 'STO rr', value: '91 rr' },
    { key: 'STO `nam`', value: 'Fn 81' },
    //
    { key: 'STO+ rr', value: '92 rr' },
    { key: 'STO+ `nam`', value: 'Fn 82' },
    //
    { key: 'STO- rr', value: '93 rr' },
    { key: 'STO- `nam`', value: 'Fn 83' },
    //
    { key: 'STOx rr', value: '94 rr' },
    { key: 'STOx `nam`', value: 'Fn 84' },
    //
    { key: 'STO× rr', value: '94 rr' },
    { key: 'STO× `nam`', value: 'Fn 84' },
    //
    { key: 'STO/ rr', value: '95 rr' },
    { key: 'STO/ `nam`', value: 'Fn 85' },
    //
    { key: 'STO÷ rr', value: '95 rr' },
    { key: 'STO÷ `nam`', value: 'Fn 85' },
    //
    { key: 'RCL sr', value: '2r' },
    { key: 'RCL rr', value: '90 rr' },
    { key: 'RCL `nam`', value: 'Fn 91' },
    //
    { key: 'RCL+ rr', value: 'F2 D1 rr' },
    { key: 'RCL+ `nam`', value: 'Fn 92' },
    //
    { key: 'RCL- rr', value: 'F2 D2 rr' },
    { key: 'RCL- `nam`', value: 'Fn 93' },
    //
    { key: 'RCLx rr', value: 'F2 D3 rr' },
    { key: 'RCLx `nam`', value: 'Fn 94' },
    //
    { key: 'RCL× rr', value: 'F2 D3 rr' },
    { key: 'RCL× `nam`', value: 'Fn 94' },
    //
    { key: 'RCL/ rr', value: 'F2 D4 rr' },
    { key: 'RCL/ `nam`', value: 'Fn 95' },
    //
    { key: 'RCL÷ rr', value: 'F2 D4 rr' },
    { key: 'RCL÷ `nam`', value: 'Fn 95' },
    //
    { key: 'LBL sl', value: '0l' }, // 00-14
    { key: 'LBL ll', value: 'CF nn' }, // 15-99,A-J,a-e
    { key: 'LBL `lbl`', value: 'C0 00 Fn 00' },
    //
    { key: 'GTO sl', value: 'Bl 00' },
    { key: 'GTO ll', value: 'D0 00 nn' },
    { key: 'GTO `lbl`', value: '1D Fn' },
    //
    { key: 'XEQ sl', value: 'E0 00 nn' },
    { key: 'XEQ ll', value: 'E0 00 nn' },
    { key: 'XEQ `lbl`', value: '1E Fn' },
    //
    { key: 'ASTO rr', value: '9A rr' },
    { key: 'ASTO `nam`', value: 'Fn B2' },
    //
    { key: 'ARCL rr', value: '9B rr' },
    { key: 'ARCL `nam`', value: 'Fn B3' },
    //
    { key: 'FIX sd', value: '9C nn' },
    { key: 'FIX 10', value: 'F1 D5' },
    { key: 'FIX 11', value: 'F1 E5' },
    //
    { key: 'SCI sd', value: '9D nn' },
    { key: 'SCI 10', value: 'F1 D6' },
    { key: 'SCI 11', value: 'F1 E6' },
    //
    { key: 'ENG sd', value: '9E nn' },
    { key: 'ENG 10', value: 'F1 D7' },
    { key: 'ENG 11', value: 'F1 E7' },
    //
    { key: 'ISG rr', value: '96 rr' },
    { key: 'ISG `nam`', value: 'Fn 96' },
    //
    { key: 'DSE rr', value: '97 rr' },
    { key: 'DSE `nam`', value: 'Fn 97' },
    //
    //
    //
    { key: 'DIM `nam`', value: 'Fn C4' },
    //
    { key: 'EDITN `nam`', value: 'Fn C6' },
    //
    { key: 'INDEX `nam`', value: 'Fn 87' },
    //
    { key: 'X<> rr', value: 'CE rr' },
    { key: 'X<> `nam`', value: 'Fn 86' },
    //
    { key: 'SF rr', value: 'A8 rr' },
    //
    { key: 'CF rr', value: 'A9 rr' },
    //
    { key: 'FS? rr', value: 'AC rr' },
    //
    { key: 'FC? rr', value: 'AD rr' },
    //
    { key: 'FS?C rr', value: 'AA rr' },
    //
    { key: 'FC?C rr', value: 'AB rr' },
    //
    { key: 'VIEW rr', value: '98 rr' },
    { key: 'VIEW `nam`', value: 'Fn 80' },
    //
    { key: 'INPUT rr', value: 'F2 D0 rr' },
    { key: 'INPUT `nam`', value: 'Fn C5' },
    //
    { key: 'CLV `nam`', value: 'Fn B0' },
    //
    { key: 'CLP `lbl`', value: 'Fn F0' },
    //
    { key: 'TONE tn', value: '9F rr' },
    //
    { key: 'MVAR `nam`', value: 'Fn 90' },
    //
    { key: 'VARMENU `nam`', value: 'Fn C1' },
    //
    { key: 'PRV `nam`', value: 'Fn B1' },
    //
    { key: 'SigmaREG rr', value: '99 rr' },
    //
    { key: 'ΣREG rr', value: '99 rr' },
    //
    { key: 'INTEG `lbl`', value: 'Fn B6' },
    //
    { key: 'PGMSLV `lbl`', value: 'Fn B5' },
    //
    { key: 'PGMINT `lbl`', value: 'Fn B4' },
    //
    { key: 'SOLVE `lbl`', value: 'Fn B7' },
    //
    //{ key: 'ASSIGN `nam`', value: 'Fn C0 aa' },
    //
    { key: 'SIZE rr', value: 'F3 F7 ww ww' },
    //--------------------------------------------------------
    { key: 'STO ST `stk`', value: '91 7t' },
    { key: 'STO+ ST `stk`', value: '92 7t' },
    { key: 'STO- ST `stk`', value: '93 7t' },
    { key: 'STOx ST `stk`', value: '94 7t' },
    { key: 'STO× ST `stk`', value: '94 7t' },
    { key: 'STO/ ST `stk`', value: '95 7t' },
    { key: 'STO÷ ST `stk`', value: '95 7t' },
    { key: 'RCL ST `stk`', value: '90 7t' },
    { key: 'RCL+ ST `stk`', value: 'F2 D1 7t' },
    { key: 'RCL- ST `stk`', value: 'F2 D2 7t' },
    { key: 'RCLx ST `stk`', value: 'F2 D3 7t' },
    { key: 'RCL× ST `stk`', value: 'F2 D3 7t' },
    { key: 'RCL/ ST `stk`', value: 'F2 D4 7t' },
    { key: 'RCL÷ ST `stk`', value: 'F2 D4 7t' },
    { key: 'ASTO ST `stk`', value: '9A 7t' },
    { key: 'ARCL ST `stk`', value: '9B 7t' },
    { key: 'ISG ST `stk`', value: '96 7t' },
    { key: 'DSE ST `stk`', value: '97 7t' },
    { key: 'X<> ST `stk`', value: 'CE 7t' },
    { key: 'VIEW ST `stk`', value: '98 7t' },
    { key: 'INPUT ST `stk`', value: 'F2 D0 7t' },
    //
    //
    { key: 'STO IND rr', value: '91 8r' },
    { key: 'STO IND `nam`', value: 'Fn 89' },
    //
    { key: 'STO+ IND rr', value: '92 8r' },
    { key: 'STO+ IND `nam`', value: 'Fn 8A' },
    //
    { key: 'STO- IND rr', value: '93 8r' },
    { key: 'STO- IND `nam`', value: 'Fn 8B' },
    //
    { key: 'STOx IND rr', value: '94 8r' },
    { key: 'STOx IND `nam`', value: 'Fn 8C' },
    //
    { key: 'STO× IND rr', value: '94 8r' },
    { key: 'STO× IND `nam`', value: 'Fn 8C' },
    //
    { key: 'STO/ IND rr', value: '95 8r' },
    { key: 'STO/ IND `nam`', value: 'Fn 8D' },
    //
    { key: 'STO÷ IND rr', value: '95 8r' },
    { key: 'STO÷ IND `nam`', value: 'Fn 8D' },
    //
    { key: 'RCL IND rr', value: '90 8r' },
    { key: 'RCL IND `nam`', value: 'Fn 99' },
    //
    { key: 'RCL+ IND rr', value: 'F2 D1 8r' },
    { key: 'RCL+ IND `nam`', value: 'Fn 9A' },
    //
    { key: 'RCL- IND rr', value: 'F2 D2 8r' },
    { key: 'RCL- IND `nam`', value: 'Fn 9B' },
    //
    { key: 'RCLx IND rr', value: 'F2 D3 8r' },
    { key: 'RCLx IND `nam`', value: 'Fn 9C' },
    //
    { key: 'RCL× IND rr', value: 'F2 D3 8r' },
    { key: 'RCL× IND `nam`', value: 'Fn 9C' },
    //
    { key: 'RCL/ IND rr', value: 'F2 D4 8r' },
    { key: 'RCL/ IND `nam`', value: 'Fn 9D' },
    //
    { key: 'RCL÷ IND rr', value: 'F2 D4 8r' },
    { key: 'RCL÷ IND `nam`', value: 'Fn 9D' },
    //
    { key: 'GTO IND rr', value: 'AE nn' },
    { key: 'GTO IND `nam`', value: 'Fn AE' },
    //
    { key: 'XEQ IND rr', value: 'AE 8r' },
    { key: 'XEQ IND `nam`', value: 'Fn AF' },
    //
    { key: 'ASTO IND rr', value: '9A 8r' },
    { key: 'ASTO IND `nam`', value: 'Fn BA' },
    //
    { key: 'ARCL IND rr', value: '9B 8r' },
    { key: 'ARCL IND `nam`', value: 'Fn BB' },
    //
    { key: 'FIX IND rr', value: '9C 8r' },
    { key: 'FIX IND `nam`', value: 'Fn DC' },
    //
    { key: 'SCI IND rr', value: '9D 8r' },
    { key: 'SCI IND `nam`', value: 'Fn DD' },
    //
    { key: 'ENG IND rr', value: '9E 8r' },
    { key: 'ENG IND `nam`', value: 'Fn DE' },
    //
    { key: 'ISG IND rr', value: '96 8r' },
    { key: 'ISG IND `nam`', value: 'Fn 9E' },
    //
    { key: 'DSE IND rr', value: '97 8r' },
    { key: 'DSE IND `nam`', value: 'Fn 9F' },
    //
    { key: 'DIM IND rr', value: 'F2 EC 8r' },
    { key: 'DIM IND `nam`', value: 'Fn CC' },
    //
    { key: 'EDITN IND rr', value: 'F2 EF 8r' },
    { key: 'EDITN IND `nam`', value: 'Fn CE' },
    //
    { key: 'INDEX IND rr', value: 'F2 DA 8r' },
    { key: 'INDEX IND `nam`', value: 'Fn 8F' },
    //
    { key: 'X<> IND rr', value: 'CE 8r' },
    { key: 'X<> IND `nam`', value: 'Fn 8E' },
    //
    { key: 'SF IND rr', value: 'A8 8r' },
    { key: 'SF IND `nam`', value: 'Fn A8' },
    //
    { key: 'CF IND rr', value: 'A9 8r' },
    { key: 'CF IND `nam`', value: 'Fn A9' },
    //
    { key: 'FS? IND rr', value: 'AC 8r' },
    { key: 'FS? IND `nam`', value: 'Fn AC' },
    //
    { key: 'FC? IND rr', value: 'AD 8r' },
    { key: 'FC? IND `nam`', value: 'Fn AD' },
    //
    { key: 'FS?C IND rr', value: 'AA 8r' },
    { key: 'FS?C IND `nam`', value: 'Fn AA' },
    //
    { key: 'FC?C IND rr', value: 'AB 8r' },
    { key: 'FC?C IND `nam`', value: 'Fn AB' },
    //
    { key: 'VIEW IND rr', value: '98 8r' },
    { key: 'VIEW IND `nam`', value: 'Fn 88' },
    //
    { key: 'INPUT IND rr', value: 'F2 EE 8r' },
    { key: 'INPUT IND `nam`', value: 'Fn CD' },
    //
    { key: 'CLV IND rr', value: 'F2 D8 8r' },
    { key: 'CLV IND `nam`', value: 'Fn B8' },
    //
    { key: 'TONE IND rr', value: '9F 8r' },
    { key: 'TONE IND `nam`', value: 'Fn DF' },
    //
    { key: 'VARMENU IND rr', value: 'F2 F8 8r' },
    { key: 'VARMENU IND `nam`', value: 'Fn C9' },
    //
    { key: 'PRV IND rr', value: 'F2 D9 8r' },
    { key: 'PRV IND `nam`', value: 'Fn B9' },
    //
    { key: 'SigmaREG IND rr', value: '99 8r' },
    { key: 'SigmaREG IND `nam`', value: 'Fn DB' },
    //
    { key: 'ΣREG IND rr', value: '99 8r' },
    { key: 'ΣREG IND `nam`', value: 'Fn DB' },
    //
    { key: 'INTEG IND rr', value: 'F2 EA 8r' },
    { key: 'INTEG IND `nam`', value: 'Fn BE' },
    //
    { key: 'PGMSLV IND rr', value: 'F2 E9 8r' },
    { key: 'PGMSLV IND `nam`', value: 'Fn BD' },
    //
    { key: 'PGMINT IND rr', value: 'F2 E8 8r' },
    { key: 'PGMINT IND `nam`', value: 'Fn BC' },
    //
    { key: 'SOLVE IND rr', value: 'F2 EB 8r' },
    { key: 'SOLVE IND `nam`', value: 'Fn BF' },
    //--------------------------------------------------------
    { key: 'STO IND ST `stk`', value: '91 Ft' },
    { key: 'STO+ IND ST `stk`', value: '92 Ft' },
    { key: 'STO- IND ST `stk`', value: '93 Ft' },
    { key: 'STOx IND ST `stk`', value: '94 Ft' },
    { key: 'STO× IND ST `stk`', value: '94 Ft' },
    { key: 'STO/ IND ST `stk`', value: '95 Ft' },
    { key: 'STO÷ IND ST `stk`', value: '95 Ft' },
    { key: 'RCL IND ST `stk`', value: '90 Ft' },
    { key: 'RCL+ IND ST `stk`', value: 'F2 D1 Ft' },
    { key: 'RCL- IND ST `stk`', value: 'F2 D2 Ft' },
    { key: 'RCLx IND ST `stk`', value: 'F2 D3 Ft' },
    { key: 'RCL× IND ST `stk`', value: 'F2 D3 Ft' },
    { key: 'RCL/ IND ST `stk`', value: 'F2 D4 Ft' },
    { key: 'RCL÷ IND ST `stk`', value: 'F2 D4 Ft' },
    { key: 'GTO IND ST `stk`', value: 'AE 7t' },
    { key: 'XEQ IND ST `stk`', value: 'AE Ft' },
    { key: 'ASTO IND ST `stk`', value: '9A Ft' },
    { key: 'ARCL IND ST `stk`', value: '9B Ft' },
    { key: 'FIX IND ST `stk`', value: '9C Ft' },
    { key: 'SCI IND ST `stk`', value: '9D Ft' },
    { key: 'ENG IND ST `stk`', value: '9E Ft' },
    { key: 'ISG IND ST `stk`', value: '96 Ft' },
    { key: 'DSE IND ST `stk`', value: '97 Ft' },
    { key: 'DIM IND ST `stk`', value: 'F2 EC Ft' },
    { key: 'EDITN IND ST `stk`', value: 'F2 EF Ft' },
    { key: 'INDEX IND ST `stk`', value: 'F2 DA Ft' },
    { key: 'X<> IND ST `stk`', value: 'CE Ft' },
    { key: 'SF IND ST `stk`', value: 'A8 Ft' },
    { key: 'CF IND ST `stk`', value: 'A9 Ft' },
    { key: 'FS? IND ST `stk`', value: 'AC Ft' },
    { key: 'FC? IND ST `stk`', value: 'AD Ft' },
    { key: 'FS?C IND ST `stk`', value: 'AA Ft' },
    { key: 'FC?C IND ST `stk`', value: 'AB Ft' },
    { key: 'VIEW IND ST `stk`', value: '98 Ft' },
    { key: 'INPUT IND ST `stk`', value: 'F2 EE Ft' },
    { key: 'CLV IND ST `stk`', value: 'F2 D8 Ft' },
    { key: 'TONE IND ST `stk`', value: '9F Ft' },
    { key: 'VARMENU IND ST `stk`', value: 'F2 F8 Ft' },
    { key: 'PRV IND ST `stk`', value: 'F2 D9 Ft' },
    { key: 'SigmaREG IND ST `stk`', value: '99 Ft' },
    { key: 'ΣREG IND ST `stk`', value: '99 Ft' },
    { key: 'INTEG IND ST `stk`', value: 'F2 EA Ft' },
    { key: 'PGMSLV IND ST `stk`', value: 'F2 E9 Ft' },
    { key: 'PGMINT IND ST `stk`', value: 'F2 E8 Ft' },
    { key: 'SOLVE IND ST `stk`', value: 'F2 EB Ft' },
    //
    { key: 'ASSIGN `nam` TO `csk`', value: 'Fn C0 aa' },
    //
    { key: 'KEY `key` GTO sl', value: 'F3 E3 kk rr' },
    { key: 'KEY `key` GTO ll', value: 'F3 E3 kk rr' },
    { key: 'KEY `key` GTO `lbl`', value: 'Fn C3 kk' },
    //
    { key: 'KEY `key` XEQ sl', value: 'F3 E2 kk rr' },
    { key: 'KEY `key` XEQ ll', value: 'F3 E2 kk rr' },
    { key: 'KEY `key` XEQ `lbl`', value: 'Fn C2 kk' },
    //--------------------------------------------------------
    { key: 'KEY `key` GTO IND rr', value: 'F3 E3 kk 8r' },
    { key: 'KEY `key` GTO IND `nam`', value: 'Fn CB kk' },
    //
    { key: 'KEY `key` XEQ IND rr', value: 'F3 E2 kk 8r' },
    { key: 'KEY `key` XEQ IND `nam`', value: 'Fn CA kk' },
    //--------------------------------------------------------
    { key: 'KEY `key` GTO IND ST `stk`', value: 'F3 E3 kk Ft' },
    { key: 'KEY `key` XEQ IND ST `stk`', value: 'F3 E2 kk Ft' }
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
    { key: '\\[LF\\]', value: 10 },
    { key: '≥', value: 11 },
    { key: '≠', value: 12 },
    { key: '↵', value: 13 },
    { key: '↓', value: 14 },
    { key: '→', value: 15 },
    { key: '←', value: 16 },
    { key: 'µ', value: 17 },
    { key: '£', value: 18 },
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
