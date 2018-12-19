import { CodeError } from '../common/codeerror';
import { RawLine } from './rawline';
import { RawPattern } from './rawpattern';

/** FOCAL (Forty-one calculator language) see https://en.wikipedia.org/wiki/FOCAL_(Hewlett-Packard) */
export class Encoder42 {
  //#region Members

  static rpnMap = new Map<string, RawPattern[]>();
  static stackMap = new Map<string, number>();
  static charCodeMap = new Map<string, number>();

  static initialized: boolean = false;

  //#endregion

  //#region Public

  static initialize() {
    if (!Encoder42.initialized) {
      // transform arr_rpnMap -> rpnMap

      Encoder42.arr_rpnMap.forEach(e => {
        Encoder42.rpnMap.set(e.key, e.value);
      });

      // transform arr_stackMap -> stackMap
      Encoder42.arr_stackMap.forEach(e => {
        Encoder42.stackMap.set(e.key, e.value);
      });

      // transform arr_charMap -> charMap
      Encoder42.arr_charCodeMap.forEach(e => {
        Encoder42.charCodeMap.set(e.key, e.value);
      });

      Encoder42.initialized = true;
    }
  }

  static toRaw(rawLine: RawLine, languageId: string) {
    let progErrorText: string | undefined;
    let languageIdFromCode: string = '';

    if (rawLine.workCode !== undefined) {
      // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
      languageIdFromCode = Encoder42.getLanguageIdFromCode(rawLine, languageId);

      if (languageId !== languageIdFromCode) {
        progErrorText = "free42 command '" + rawLine.token + "' in hp42s program";
      }

      if (progErrorText === undefined) {
        if (rawLine.tokenLength === 1) {
          //#region 1 Token
          if (rawLine.params.str !== undefined && rawLine.workCode.match(/^(⊢|)`str`/)) {
            // is it a string ...
            rawLine.raw = Encoder42.insertStringInRaw(rawLine.raw, rawLine.params.str);
          } else if (rawLine.params.num !== undefined && rawLine.workCode.match(/^`num`/)) {
            // is it a simple number ...
            rawLine.raw = Encoder42.convertNumberToRaw(rawLine.params.num);
          } else if (rawLine.token !== undefined) {
            // is it a single "fixed" opcode ...
          }

          // Some error ...
          if (rawLine.error === undefined && progErrorText !== undefined) {
            rawLine.error = new CodeError(rawLine.docLine, rawLine.codeLineNo, rawLine.docCode, String(progErrorText));
          }

          //#endregion
        } else {
          //#region n Tokens

          // is it a string ...
          // 1. Insert Name
          // KEY `key` GTO IND `nam`
          // ASSIGN `nam` TO `key`
          if (rawLine.params.nam !== undefined) {
            rawLine.raw = Encoder42.insertStringInRaw(rawLine.raw, rawLine.params.nam);
          }

          // is it a key ...
          // 2. Insert key
          // KEY `key` GTO IND `nam`
          // ASSIGN `nam` TO `key`
          if (rawLine.params.keyno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.keyno);
          }

          // is it a global label ...
          if (rawLine.params.lbl !== undefined) {
            rawLine.raw = Encoder42.insertStringInRaw(rawLine.raw, rawLine.params.lbl);
          }

          // is it a register ...
          if (rawLine.params.regno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.regno);
          }

          // is it a tone ...
          if (rawLine.params.tonno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.tonno);
          }

          // is it a local char label A-J,a-e coded as number ......
          if (rawLine.params.lblno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.lblno);
          }

          // flag
          if (rawLine.params.flgno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.flgno);
          }

          // 0-9 digits
          if (rawLine.params.digno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.digno);
          }

          // 10 or 11 digits
          if (rawLine.workCode.match(/(ENG|FIX|SCI) (10|11)/)) {
            // nothing to do ...
          }

          // size
          if (rawLine.params.sizno !== undefined) {
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.sizno);
          }

          // is it a stack ...
          if (rawLine.params.stk !== undefined) {
            const int = Encoder42.stackMap.get(rawLine.params.stk);
            rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, int);
          }

          if (rawLine.error === undefined && progErrorText !== undefined) {
            rawLine.error = new CodeError(rawLine.docLine, rawLine.codeLineNo, rawLine.docCode, String(progErrorText));
          }

          //#endregion
        }
      } else {
        // wrong extension, free42 commands in hp42s file
        if (rawLine.error === undefined) {
          rawLine.error = new CodeError(rawLine.docLine, rawLine.codeLineNo, rawLine.docCode, String(progErrorText));
        }
      }
    }
  }

  //#endregion

  //#region Private Methods

  /** Check if free42 command used */
  private static getLanguageIdFromCode(rawLine: RawLine, languageId: string): string {
    let languageIdFromCode: string;
    // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
    if (
      rawLine.token &&
      rawLine.token.match(/(ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE\+|DDAYS|DMY|DOW|MDY|TIME)/)
    ) {
      languageIdFromCode = 'free42';
    } else {
      languageIdFromCode = languageId;
    }
    return languageIdFromCode;
  }

  /** Changing strings into corresponding opcodes (also adjusting the
   * instruction length in "Fn" byte).
   */
  private static insertStringInRaw(raw?: string, str?: string): string | undefined {
    if (raw !== undefined) {
      if (str !== undefined) {
        let len_str = str.length;
        let pos_Fn = raw.indexOf('Fn');

        len_str = str.length;

        // str too long ? len > 14: max concat string length; 15: opcodes with Fn; 7: else
        if (len_str > (raw.match('Fn 7F') ? 14 : raw.match('Fn') ? 15 : 7)) {
          //TODO: error !!
        }

        // loop each character in str and append hex to opcode
        str.split('').forEach((character: string) => {
          let hexcode = character.charCodeAt(0);
          //special char ?
          if (Encoder42.charCodeMap.has(character)) {
            let v = Encoder42.charCodeMap.get(character);
            hexcode = v ? v : 0;
          }
          raw += ' ' + Encoder42.convertByteAsHex(hexcode);
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
          Encoder42.convertByteAsHex(240 + length_hex_after_Fn) + // 2. part
          raw.substr(pos_Fn + 2); // 3. part
      } else {
        raw = undefined;
      }
    }

    return raw;
  }

  /** Insert a number into raw */
  private static insertNumberInRaw(raw: string | undefined, num: number | undefined): string | undefined {
    if (raw !== undefined && num !== undefined) {
      let match: RegExpMatchArray | null = null;

      switch (true) {
        case /kk/.test(raw):
          raw = raw.replace(/kk/, Encoder42.convertByteAsHex(num));
          break;

        case /rr/.test(raw):
          raw = raw.replace(/rr/, Encoder42.convertByteAsHex(num));
          break;

        case /tn/.test(raw):
          raw = raw.replace(/tn/, Encoder42.convertByteAsHex(num));
          break;

        case /nn/.test(raw):
          // numbered label 00-99, digits 00-11
          raw = raw.replace(/nn/, Encoder42.convertByteAsHex(num));
          break;

        case /ll/.test(raw):
          // char label as number A-J,a-e
          raw = raw.replace(/ll/, 'CF ' + Encoder42.convertByteAsHex(num));
          break;

        case /ss ss/.test(raw):
          // SIZE
          raw = raw.replace(
            /ss ss/,
            Encoder42.convertByteAsHex(num / 256) + ' ' + Encoder42.convertByteAsHex(num % 256)
          );
          break;

        case /([\dA-F])l/.test(raw):
          // not working: hex = hex.replace(/([\dA-F])l/, this.convertNumberToHexString(parseInt('0x' + '$1' + '0') + 1 + int));
          match = raw.match(/([\dA-F])l/);
          if (match) {
            raw = raw.replace(/([\dA-F])l/, Encoder42.convertByteAsHex(parseInt('0x' + match[1] + '0') + 1 + num));
          }
          break;

        case /(\d)r/.test(raw):
          // not working: $1
          match = raw.match(/(\d)r/);
          if (match) {
            raw = raw.replace(/(\d)r/, Encoder42.convertByteAsHex(parseInt(match[1]) * 16 + num));
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
  private static convertNumberToRaw(num?: string): string | undefined {
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
  private static convertByteAsHex(byte: number): string {
    let hex = ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
    return hex;
  }

  //#endregion

  //#region Private Arrays

  private static arr_stackMap = [
    { key: 'T', value: 0 },
    { key: 'Z', value: 1 },
    { key: 'Y', value: 2 },
    { key: 'X', value: 3 },
    { key: 'L', value: 4 }
  ];

  /** FOCAL character set https://en.wikipedia.org/wiki/FOCAL_character_set key is used as regex */
  private static arr_charCodeMap = [
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
    { key: '\\[LF\\]', value: 10 }, // for [LF] line feed
    { key: '␊', value: 10 }, // ␊ see: https://www.compart.com/de/unicode/U+240A
    { key: '≥', value: 11 },
    { key: '≠', value: 12 },
    { key: '↵', value: 13 },
    { key: '↓', value: 14 },
    { key: '→', value: 15 },
    { key: '←', value: 16 },
    { key: 'µ', value: 17 }, // different bytes B5
    { key: 'μ', value: 17 }, // different bytes N<
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
    { key: '␛', value: 27 }, // ␛ see: https://www.compart.com/de/unicode/U+241B
    { key: 'Ö', value: 28 },
    { key: 'Ü', value: 29 },
    { key: '▒', value: 30 },
    { key: '■', value: 31 },
    { key: '•', value: 31 }, // • -> ■
    // { key: 'SP', value: 32 },
    // { key: '!', value: 33 },
    // { key: ''', value: 34 },
    // { key: '#', value: 35 },
    // { key: '$', value: 36 },
    // { key: '%', value: 37 },
    // { key: '&', value: 38 },
    // { key: "'", value: 39 }, // double quotes !!
    // { key: '(', value: 40 },
    // { key: ')', value: 41 },
    // { key: '*', value: 42 },
    // { key: '+', value: 43 },
    // { key: ',', value: 44 },
    // { key: '-', value: 45 },
    // { key: '.', value: 46 },
    // { key: '/', value: 47 },
    // { key: '0', value: 48 },
    // { key: '1', value: 49 },
    // { key: '2', value: 50 },
    // { key: '3', value: 51 },
    // { key: '4', value: 52 },
    // { key: '5', value: 53 },
    // { key: '6', value: 54 },
    // { key: '7', value: 55 },
    // { key: '8', value: 56 },
    // { key: '9', value: 57 },
    // { key: ':', value: 58 },
    // { key: ';', value: 59 },
    // { key: '<', value: 60 },
    // { key: '=', value: 61 },
    // { key: '>', value: 62 },
    // { key: '?', value: 63 },
    // { key: '@', value: 64 },
    // { key: 'A', value: 65 },
    // { key: 'B', value: 66 },
    // { key: 'C', value: 67 },
    // { key: 'D', value: 68 },
    // { key: 'E', value: 69 },
    // { key: 'F', value: 70 },
    // { key: 'G', value: 71 },
    // { key: 'H', value: 72 },
    // { key: 'I', value: 73 },
    // { key: 'J', value: 74 },
    // { key: 'K', value: 75 },
    // { key: 'L', value: 76 },
    // { key: 'M', value: 77 },
    // { key: 'N', value: 78 },
    // { key: 'O', value: 79 },
    // { key: 'P', value: 80 },
    // { key: 'Q', value: 81 },
    // { key: 'R', value: 82 },
    // { key: 'S', value: 83 },
    // { key: 'T', value: 84 },
    // { key: 'U', value: 85 },
    // { key: 'V', value: 86 },
    // { key: 'W', value: 87 },
    // { key: 'X', value: 88 },
    // { key: 'Y', value: 89 },
    // { key: 'Z', value: 90 },
    // { key: '[', value: 91 },
    { key: '\\\\', value: 92 }, // for \
    // { key: ']', value: 93 },
    { key: '↑', value: 94 }
    // { key: '_', value: 95 },
    // { key: '`', value: 96 },
    // { key: '´', value: ??? },
    // { key: 'a', value: 97 },
    // { key: 'b', value: 98 },
    // { key: 'c', value: 99 },
    // { key: 'd', value: 100 },
    // { key: 'e', value: 101 },
    // { key: 'f', value: 102 },
    // { key: 'g', value: 103 },
    // { key: 'h', value: 104 },
    // { key: 'i', value: 105 },
    // { key: 'j', value: 106 },
    // { key: 'k', value: 107 },
    // { key: 'l', value: 108 },
    // { key: 'm', value: 109 },
    // { key: 'n', value: 110 },
    // { key: 'o', value: 111 },
    // { key: 'p', value: 112 },
    // { key: 'q', value: 113 },
    // { key: 'r', value: 114 },
    // { key: 's', value: 115 },
    // { key: 't', value: 116 },
    // { key: 'u', value: 117 },
    // { key: 'v', value: 118 },
    // { key: 'w', value: 119 },
    // { key: 'x', value: 120 },
    // { key: 'y', value: 121 },
    // { key: 'z', value: 122 },
    // { key: '{', value: 123 },
    // { key: '|', value: 124 },
    // { key: '}', value: 125 },
    // { key: '~', value: 126 }
    // { key: '⊦', value: 127 }

    // { key: '´', value: ??? }
  ];

  // 0(?<lblno>[2-9A-F]): LBL 01-15
  // Fn: F([1-9A-F]) Label: max. length 14
  // 7t: 7([0-4]); stack 0-4
  // 8r: ([89A-E][0-9A-F]); r: dec:1..99; 128 + r => hex:81..E3
  // Ft: F([0-4]); ... IND ST [XYZLT]
  // [23]r: (2[0-9A-F]); register dec:1-15, hex: 21-2F
  // rr: ([0-7][0-9A-F]); register dec:16-99, hex:10-63
  // ENG|FIX|SCI sd: digits 00-09
  // ENG|FIX|SCI 10|11: digits 10,11
  // LBL|GTO sl|ll: sl: 00-14, ll:15-99
  // RCL|STO sr|rr: sr 0-15, rr: 16-99
  // tone: dec:0-9; hex:00-09
  // nam: name max length 14
  // CharLabels: A=102(0x66), B=107(0x67), ..., J, a=123(0x7B), b=124(0x7C), ..., e

  // see RpnParser: regex = regex + /\s*$/ !!
  private static arr_rpnMap = [
    { key: '%', value: [{ regex: /%/, raw: '4C' }] },
    { key: '%CH', value: [{ regex: /%CH/, raw: '4D' }] },
    { key: '+', value: [{ regex: /\+/, raw: '40' }] },
    { key: '+/-', value: [{ regex: /\+\/-/, raw: '54' }] },
    { key: '-', value: [{ regex: /-/, raw: '41' }] },
    { key: '.END.', value: [{ regex: /\.END\./, raw: 'C0 00 0D' }] },
    { key: '1/X', value: [{ regex: /1\/X/, raw: '60' }] },
    { key: '10^X', value: [{ regex: /10\^X/, raw: '57' }] },
    { key: '10↑X', value: [{ regex: /10↑X/, raw: '57' }] },
    { key: 'ABS', value: [{ regex: /ABS/, raw: '61' }] },
    { key: 'ACCEL', value: [{ regex: /ACCEL/, raw: 'A7 CF' }] },
    { key: 'ACOS', value: [{ regex: /ACOS/, raw: '5D' }] },
    { key: 'ACOSH', value: [{ regex: /ACOSH/, raw: 'A0 66' }] },
    { key: 'ADATE', value: [{ regex: /ADATE/, raw: 'A6 81' }] },
    { key: 'ADV', value: [{ regex: /ADV/, raw: '8F' }] },
    { key: 'AGRAPH', value: [{ regex: /AGRAPH/, raw: 'A7 64' }] },
    { key: 'AIP', value: [{ regex: /AIP/, raw: 'A6 31' }] },
    { key: 'ALENG', value: [{ regex: /ALENG/, raw: 'A6 41' }] },
    { key: 'ALL', value: [{ regex: /ALL/, raw: 'A2 5D' }] },
    { key: 'ALLΣ', value: [{ regex: /ALLΣ/, raw: 'A0 AE' }] },
    { key: 'AND', value: [{ regex: /AND/, raw: 'A5 88' }] },
    { key: 'AOFF', value: [{ regex: /AOFF/, raw: '8B' }] },
    { key: 'AON', value: [{ regex: /AON/, raw: '8C' }] },
    {
      key: 'ARCL',
      value: [
        { regex: /ARCL IND ST ([XYZLT])/, raw: '9B Ft', params: 'stk' },
        { regex: /ARCL IND (".{1,14}")/, raw: 'Fn BB', params: 'nam' },
        { regex: /ARCL IND (\d{2})/, raw: '9B 8r', params: 'reg' },
        { regex: /ARCL ST ([XYZLT])/, raw: '9B 7t', params: 'stk' },
        { regex: /ARCL (".{1,14}")/, raw: 'Fn B3', params: 'nam' },
        { regex: /ARCL (\d{2})/, raw: '9B rr', params: 'reg' }
      ]
    },
    { key: 'AROT', value: [{ regex: /AROT/, raw: 'A6 46' }] },
    { key: 'ASHF', value: [{ regex: /ASHF/, raw: '88' }] },
    { key: 'ASIN', value: [{ regex: /ASIN/, raw: '5C' }] },
    { key: 'ASINH', value: [{ regex: /ASINH/, raw: 'A0 64' }] },
    {
      key: 'ASSIGN',
      value: [{ regex: /ASSIGN (".{1,14}") TO (0[1-9]|1[0-8])/, raw: 'Fn C0 aa', params: 'nam,key-1' }]
    }, // key: 01-18
    {
      key: 'ASTO',
      value: [
        { regex: /ASTO IND ST ([XYZLT])/, raw: '9A Ft', params: 'stk' },
        { regex: /ASTO IND (".{1,14}")/, raw: 'Fn BA', params: 'nam' },
        { regex: /ASTO IND (\d{2})/, raw: '9A 8r', params: 'reg' },
        { regex: /ASTO ST ([XYZLT])/, raw: '9A 7t', params: 'stk' },
        { regex: /ASTO (".{1,14}")/, raw: 'Fn B2', params: 'nam' },
        { regex: /ASTO (\d{2})/, raw: '9A rr', params: 'reg' }
      ]
    },
    { key: 'ATAN', value: [{ regex: /ATAN/, raw: '5E' }] },
    { key: 'ATANH', value: [{ regex: /ATANH/, raw: 'A0 65' }] },
    { key: 'ATIME', value: [{ regex: /ATIME/, raw: 'A6 84' }] },
    { key: 'ATIME24', value: [{ regex: /ATIME24/, raw: 'A6 85' }] },
    { key: 'ATOX', value: [{ regex: /ATOX/, raw: 'A6 47' }] },
    { key: 'AVIEW', value: [{ regex: /AVIEW/, raw: '7E' }] },
    { key: 'BASE+', value: [{ regex: /BASE\+/, raw: 'A0 E6' }] },
    { key: 'BASE-', value: [{ regex: /BASE-/, raw: 'A0 E7' }] },
    { key: 'BASE±', value: [{ regex: /BASE±/, raw: 'A0 EA' }] },
    { key: 'BASE×', value: [{ regex: /BASE×/, raw: 'A0 E8' }] },
    { key: 'BASE÷', value: [{ regex: /BASE÷/, raw: 'A0 E9' }] },
    { key: 'BEEP', value: [{ regex: /BEEP/, raw: '86' }] },
    { key: 'BEST', value: [{ regex: /BEST/, raw: 'A0 9F' }] },
    { key: 'BINM', value: [{ regex: /BINM/, raw: 'A0 E5' }] },
    { key: 'BIT?', value: [{ regex: /BIT\?/, raw: 'A5 8C' }] },
    {
      key: 'CF',
      value: [
        { regex: /CF IND ST ([XYZLT])/, raw: 'A9 Ft', params: 'stk' },
        { regex: /CF IND (".{1,14}")/, raw: 'Fn A9', params: 'nam' },
        { regex: /CF IND (\d{2})/, raw: 'A9 8r', params: 'reg' },
        { regex: /CF (\d{2})/, raw: 'A9 rr', params: 'flg' } //00-99
      ]
    },
    { key: 'CLA', value: [{ regex: /CLA/, raw: '87' }] },
    { key: 'CLD', value: [{ regex: /CLD/, raw: '7F' }] },
    { key: 'CLK12', value: [{ regex: /CLK12/, raw: 'A6 86' }] },
    { key: 'CLK24', value: [{ regex: /CLK24/, raw: 'A6 87' }] },
    { key: 'CLLCD', value: [{ regex: /CLLCD/, raw: 'A7 63' }] },
    { key: 'CLMENU', value: [{ regex: /CLMENU/, raw: 'A2 6D' }] },
    { key: 'CLP', value: [{ regex: /CLP (".{1,14}")/, raw: 'Fn F0', params: 'lbl' }] },
    { key: 'CLRG', value: [{ regex: /CLRG/, raw: '8A' }] },
    { key: 'CLST', value: [{ regex: /CLST/, raw: '73' }] },
    {
      key: 'CLV',
      value: [
        { regex: /CLV IND ST ([XYZLT])/, raw: 'F2 D8 Ft', params: 'stk' },
        { regex: /CLV IND (".{1,14}")/, raw: 'Fn B8', params: 'nam' },
        { regex: /CLV IND (\d{2})/, raw: 'F2 D8 8r', params: 'reg' },
        { regex: /CLV (".{1,14}")/, raw: 'Fn B0', params: 'nam' }
      ]
    },
    { key: 'CLX', value: [{ regex: /CLX/, raw: '77' }] },
    { key: 'CLKEYS', value: [{ regex: /CLKEYS/, raw: 'A2 62' }] },
    { key: 'CLΣ', value: [{ regex: /CLΣ/, raw: '70' }] },
    { key: 'COMB', value: [{ regex: /COMB/, raw: 'A0 6F' }] },
    { key: 'COMPLEX', value: [{ regex: /COMPLEX/, raw: 'A0 72' }] },
    { key: 'CORR', value: [{ regex: /CORR/, raw: 'A0 A7' }] },
    { key: 'COS', value: [{ regex: /COS/, raw: '5A' }] },
    { key: 'COSH', value: [{ regex: /COSH/, raw: 'A0 62' }] },
    { key: 'CPX?', value: [{ regex: /CPX\?/, raw: 'A2 67' }] },
    { key: 'CPXRES', value: [{ regex: /CPXRES/, raw: 'A2 6A' }] },
    { key: 'CROSS', value: [{ regex: /CROSS/, raw: 'A6 CA' }] },
    { key: 'CUSTOM', value: [{ regex: /CUSTOM/, raw: 'A2 6F' }] },
    { key: 'DATE', value: [{ regex: /DATE/, raw: 'A6 8C' }] },
    { key: 'DATE+', value: [{ regex: /DATE\+/, raw: 'A6 8D' }] },
    { key: 'DDAYS', value: [{ regex: /DDAYS/, raw: 'A6 8E' }] },
    { key: 'DECM', value: [{ regex: /DECM/, raw: 'A0 E3' }] },
    { key: 'DEG', value: [{ regex: /DEG/, raw: '80' }] },
    { key: 'DELAY', value: [{ regex: /DELAY/, raw: 'A7 60' }] },
    { key: 'DELR', value: [{ regex: /DELR/, raw: 'A0 AB' }] },
    { key: 'DET', value: [{ regex: /DET/, raw: 'A6 CC' }] },
    {
      key: 'DIM',
      value: [
        { regex: /DIM IND ST ([XYZLT])/, raw: 'F2 EC Ft', params: 'stk' },
        { regex: /DIM IND (".{1,14}")/, raw: 'Fn CC', params: 'nam' },
        { regex: /DIM IND (\d{2})/, raw: 'F2 EC 8r', params: 'reg' },
        { regex: /DIM (".{1,14}")/, raw: 'Fn C4', params: 'nam' }
      ]
    },
    { key: 'DIM?', value: [{ regex: /DIM\?/, raw: 'A6 E7' }] },
    { key: 'DMY', value: [{ regex: /DMY/, raw: 'A6 8F' }] },
    { key: 'DOT', value: [{ regex: /DOT/, raw: 'A6 CB' }] },
    { key: 'DOW', value: [{ regex: /DOW/, raw: 'A6 90' }] },
    {
      key: 'DSE',
      value: [
        { regex: /DSE IND ST ([XYZLT])/, raw: '97 Ft', params: 'stk' },
        { regex: /DSE IND (".{1,14}")/, raw: 'Fn 9F', params: 'nam' },
        { regex: /DSE IND (\d{2})/, raw: '97 8r', params: 'reg' },
        { regex: /DSE ST ([XYZLT])/, raw: '97 7t', params: 'stk' },
        { regex: /DSE (".{1,14}")/, raw: 'Fn 97', params: 'nam' },
        { regex: /DSE (\d{2})/, raw: '97 rr', params: 'reg' }
      ]
    },
    { key: 'EDIT', value: [{ regex: /EDIT/, raw: 'A6 E1' }] },
    {
      key: 'EDITN',
      value: [
        { regex: /EDITN IND ST ([XYZLT])/, raw: 'F2 EF Ft', params: 'stk' },
        { regex: /EDITN IND (".{1,14}")/, raw: 'Fn CE', params: 'nam' },
        { regex: /EDITN IND (\d{2})/, raw: 'F2 EF 8r', params: 'reg' },
        { regex: /EDITN (".{1,14}")/, raw: 'Fn C6', params: 'nam' }
      ]
    },
    { key: 'END', value: [{ regex: /END/, raw: 'C0 00 0D' }] },
    {
      key: 'ENG',
      value: [
        { regex: /ENG 10/, raw: 'F1 D7' },
        { regex: /ENG 11/, raw: 'F1 E7' },
        { regex: /ENG IND ST ([XYZLT])/, raw: '9E Ft', params: 'stk' },
        { regex: /ENG IND (".{1,14}")/, raw: 'Fn DE', params: 'nam' },
        { regex: /ENG IND (\d{2})/, raw: '9E 8r', params: 'reg' },
        { regex: /ENG (0[0-9])/, raw: '9E nn', params: 'dig' } //00-09
      ]
    },
    { key: 'ENTER', value: [{ regex: /ENTER/, raw: '83' }] },
    { key: 'EXITALL', value: [{ regex: /EXITALL/, raw: 'A2 6C' }] },
    { key: 'EXPF', value: [{ regex: /EXPF/, raw: 'A0 A0' }] },
    { key: 'E↑X', value: [{ regex: /E↑X/, raw: '55' }] },
    { key: 'E↑X-1', value: [{ regex: /E↑X-1/, raw: '58' }] },
    {
      key: 'FC?',
      value: [
        { regex: /FC\? IND ST ([XYZLT])/, raw: 'AD Ft', params: 'stk' },
        { regex: /FC\? IND (".{1,14}")/, raw: 'Fn AD', params: 'nam' },
        { regex: /FC\? IND (\d{2})/, raw: 'AD 8r', params: 'reg' },
        { regex: /FC\? (\d{2})/, raw: 'AD rr', params: 'flg' } //00-99
      ]
    },
    {
      key: 'FC?C',
      value: [
        { regex: /FC\?C IND ST ([XYZLT])/, raw: 'AB Ft', params: 'stk' },
        { regex: /FC\?C IND (".{1,14}")/, raw: 'Fn AB', params: 'nam' },
        { regex: /FC\?C IND (\d{2})/, raw: 'AB 8r', params: 'reg' },
        { regex: /FC\?C (\d{2})/, raw: 'AB rr', params: 'flg' } //00-99
      ]
    },
    { key: 'FCSTX', value: [{ regex: /FCSTX/, raw: 'A0 A8' }] },
    { key: 'FCSTY', value: [{ regex: /FCSTY/, raw: 'A0 A9' }] },
    {
      key: 'FIX',
      value: [
        { regex: /FIX 10/, raw: 'F1 D5' },
        { regex: /FIX 11/, raw: 'F1 E5' },
        { regex: /FIX IND ST ([XYZLT])/, raw: '9C Ft', params: 'stk' },
        { regex: /FIX IND (".{1,14}")/, raw: 'Fn DC', params: 'nam' },
        { regex: /FIX IND (\d{2})/, raw: '9C 8r', params: 'reg' },
        { regex: /FIX (0[0-9])/, raw: '9C nn', params: 'dig' } //00-09
      ]
    },
    { key: 'FNRM', value: [{ regex: /FNRM/, raw: 'A6 CF' }] },
    { key: 'FP', value: [{ regex: /FP/, raw: '69' }] },
    {
      key: 'FS?',
      value: [
        { regex: /FS\? IND ST ([XYZLT])/, raw: 'AC Ft', params: 'stk' },
        { regex: /FS\? IND (".{1,14}")/, raw: 'Fn AC', params: 'nam' },
        { regex: /FS\? IND (\d{2})/, raw: 'AC 8r', params: 'reg' },
        { regex: /FS\? (\d{2})/, raw: 'AC rr', params: 'flg' } //00-99
      ]
    },
    {
      key: 'FS?C',
      value: [
        { regex: /FS\?C IND ST ([XYZLT])/, raw: 'AA Ft', params: 'stk' },
        { regex: /FS\?C IND (".{1,14}")/, raw: 'Fn AA', params: 'nam' },
        { regex: /FS\?C IND (\d{2})/, raw: 'AA 8r', params: 'reg' },
        { regex: /FS\?C (\d{2})/, raw: 'AA rr', params: 'flg' } //00-99
      ]
    },
    { key: 'GAMMA', value: [{ regex: /GAMMA/, raw: 'A0 74' }] },
    { key: 'GETM', value: [{ regex: /GETM/, raw: 'A6 E8' }] },
    { key: 'GETKEY', value: [{ regex: /GETKEY/, raw: 'A2 6E' }] },
    { key: 'GRAD', value: [{ regex: /GRAD/, raw: '82' }] },
    { key: 'GROW', value: [{ regex: /GROW/, raw: 'A6 E3' }] },
    {
      key: 'GTO',
      value: [
        { regex: /GTO IND ST ([XYZLT])/, raw: 'AE 7t', params: 'stk' },
        { regex: /GTO IND (".{1,14}")/, raw: 'Fn AE', params: 'nam' },
        { regex: /GTO IND (\d{2})/, raw: 'AE nn', params: 'reg' },
        { regex: /GTO (".{1,14}")/, raw: '1D Fn', params: 'lbl' },
        { regex: /GTO (1[5-9]|[2-9][0-9]|[a-eA-J])/, raw: 'D0 00 nn', params: 'lblno' }, // 15-99,A-J,a-e
        { regex: /GTO (0[0-9]|1[0-4])/, raw: 'Bl 00', params: 'lblno' } //00-14
      ]
    },
    { key: 'HEADING', value: [{ regex: /HEADING/, raw: 'A7 D1' }] },
    { key: 'HEXM', value: [{ regex: /HEXM/, raw: 'A0 E2' }] },
    { key: 'HMS+', value: [{ regex: /HMS\+/, raw: '49' }] },
    { key: 'HMS-', value: [{ regex: /HMS-/, raw: '4A' }] },
    { key: 'I+', value: [{ regex: /I\+/, raw: 'A6 D2' }] },
    { key: 'I-', value: [{ regex: /I-/, raw: 'A6 D3' }] },
    {
      key: 'INDEX',
      value: [
        { regex: /INDEX IND ST ([XYZLT])/, raw: 'F2 DA Ft', params: 'stk' },
        { regex: /INDEX IND (".{1,14}")/, raw: 'Fn 8F', params: 'nam' },
        { regex: /INDEX IND (\d{2})/, raw: 'F2 DA 8r', params: 'reg' },
        { regex: /INDEX (".{1,14}")/, raw: 'Fn 87', params: 'nam' }
      ]
    },
    {
      key: 'INPUT',
      value: [
        { regex: /INPUT IND ST ([XYZLT])/, raw: 'F2 EE Ft', params: 'stk' },
        { regex: /INPUT IND (".{1,14}")/, raw: 'Fn CD', params: 'nam' },
        { regex: /INPUT IND (\d{2})/, raw: 'F2 EE 8r', params: 'reg' },
        { regex: /INPUT ST ([XYZLT])/, raw: 'F2 D0 7t', params: 'stk' },
        { regex: /INPUT (".{1,14}")/, raw: 'Fn C5', params: 'nam' },
        { regex: /INPUT (\d{2})/, raw: 'F2 D0 rr', params: 'reg' }
      ]
    },
    { key: 'INSR', value: [{ regex: /INSR/, raw: 'A0 AA' }] },
    {
      key: 'INTEG',
      value: [
        { regex: /INTEG IND ST ([XYZLT])/, raw: 'F2 EA Ft', params: 'stk' },
        { regex: /INTEG IND (".{1,14}")/, raw: 'Fn BE', params: 'nam' },
        { regex: /INTEG IND (\d{2})/, raw: 'F2 EA 8r', params: 'reg' },
        { regex: /INTEG (".{1,14}")/, raw: 'Fn B6', params: 'lbl' }
      ]
    },
    { key: 'INVRT', value: [{ regex: /INVRT/, raw: 'A6 CE' }] },
    { key: 'IP', value: [{ regex: /IP/, raw: '68' }] },
    {
      key: 'ISG',
      value: [
        { regex: /ISG IND ST ([XYZLT])/, raw: '96 Ft', params: 'stk' },
        { regex: /ISG IND (".{1,14}")/, raw: 'Fn 9E', params: 'nam' },
        { regex: /ISG IND (\d{2})/, raw: '96 8r', params: 'reg' },
        { regex: /ISG ST ([XYZLT])/, raw: '96 7t', params: 'stk' },
        { regex: /ISG (".{1,14}")/, raw: 'Fn 96', params: 'nam' },
        { regex: /ISG (\d{2})/, raw: '96 rr', params: 'reg' }
      ]
    },
    { key: 'J+', value: [{ regex: /J\+/, raw: 'A6 D4' }] },
    { key: 'J-', value: [{ regex: /J-/, raw: 'A6 D5' }] },
    {
      key: 'KEY',
      value: [
        { regex: /KEY ([1-9]) GTO IND ST ([XYZLT])/, raw: 'F3 E3 kk Ft', params: 'key,stk' }, // key:1-9
        { regex: /KEY ([1-9]) GTO IND (".{1,14}")/, raw: 'Fn CB kk', params: 'key,nam' },
        { regex: /KEY ([1-9]) GTO IND (\d{2})/, raw: 'F3 E3 kk 8r', params: 'key,reg' },
        { regex: /KEY ([1-9]) GTO (".{1,14}")/, raw: 'Fn C3 kk', params: 'key,lbl' },
        { regex: /KEY ([1-9]) GTO (0[0-9]|[1-9][0-9]|[a-eA-J])/, raw: 'F3 E3 kk rr', params: 'key,lblno' }, // { regex: /KEY `key` GTO sl/, raw: 'F3 E3 kk rr' },
        { regex: /KEY ([1-9]) XEQ IND ST ([XYZLT])/, raw: 'F3 E2 kk Ft', params: 'key,stk' },
        { regex: /KEY ([1-9]) XEQ IND (".{1,14}")/, raw: 'Fn CA kk', params: 'key,nam' },
        { regex: /KEY ([1-9]) XEQ IND (\d{2})/, raw: 'F3 E2 kk 8r', params: 'key,reg' },
        { regex: /KEY ([1-9]) XEQ (".{1,14}")/, raw: 'Fn C2 kk', params: 'key,lbl' },
        { regex: /KEY ([1-9]) XEQ (0[0-9]|[1-9][0-9]|[a-eA-J])/, raw: 'F3 E2 kk rr', params: 'key,lblno' } //, { regex: /KEY `key` XEQ sl/, raw: 'F3 E2 kk rr' }
      ]
    },
    { key: 'KEYASN', value: [{ regex: /KEYASN/, raw: 'A2 63' }] },
    { key: 'LASTX', value: [{ regex: /LASTX/, raw: '76' }] },
    {
      key: 'LBL',
      value: [
        { regex: /LBL (".{1,14}")/, raw: 'C0 00 Fn 00', params: 'lbl' },
        { regex: /LBL (1[5-9]|[2-9][0-9]|[a-eA-J])/, raw: 'CF nn', params: 'lblno' }, // 15-99,A-J,a-e
        { regex: /LBL (0[0-9]|1[0-4])/, raw: '0l', params: 'lblno' } // 00-14
      ]
    },
    { key: 'LCLBL', value: [{ regex: /LCLBL/, raw: 'A2 64' }] },
    { key: 'LINF', value: [{ regex: /LINF/, raw: 'A0 A1' }] },
    { key: 'LINΣ', value: [{ regex: /LINΣ/, raw: 'A0 AD' }] },
    { key: 'LN', value: [{ regex: /LN/, raw: '50' }] },
    { key: 'LN1+X', value: [{ regex: /LN1\+X/, raw: '65' }] },
    { key: 'LOCAT', value: [{ regex: /LOCAT/, raw: 'A7 D0' }] },
    { key: 'LOG', value: [{ regex: /LOG/, raw: '56' }] },
    { key: 'LOGF', value: [{ regex: /LOGF/, raw: 'A0 A2' }] },
    { key: 'MAN', value: [{ regex: /MAN/, raw: 'A7 5B' }] },
    { key: 'MAT?', value: [{ regex: /MAT\?/, raw: 'A2 66' }] },
    { key: 'MDY', value: [{ regex: /MDY/, raw: 'A6 91' }] },
    { key: 'MEAN', value: [{ regex: /MEAN/, raw: '7C' }] },
    { key: 'MENU', value: [{ regex: /MENU/, raw: 'A2 5E' }] },
    { key: 'MOD', value: [{ regex: /MOD/, raw: '4B' }] },
    { key: 'MVAR', value: [{ regex: /MVAR (".{1,14}")/, raw: 'Fn 90', params: 'nam' }] },
    { key: 'N!', value: [{ regex: /N!/, raw: '62' }] },
    { key: 'NEWMAT', value: [{ regex: /NEWMAT/, raw: 'A6 DA' }] },
    { key: 'NORM', value: [{ regex: /NORM/, raw: 'A7 5C' }] },
    { key: 'NOT', value: [{ regex: /NOT/, raw: 'A5 87' }] },
    { key: 'NULL', value: [{ regex: /NULL/, raw: '00' }] },
    { key: 'OCTM', value: [{ regex: /OCTM/, raw: 'A0 E4' }] },
    { key: 'OFF', value: [{ regex: /OFF/, raw: '8D' }] },
    { key: 'OLD', value: [{ regex: /OLD/, raw: 'A6 DB' }] },
    { key: 'ON', value: [{ regex: /ON/, raw: 'A2 70' }] },
    { key: 'OR', value: [{ regex: /OR/, raw: 'A5 89' }] },
    { key: 'PERM', value: [{ regex: /PERM/, raw: 'A0 70' }] },
    {
      key: 'PGMINT',
      value: [
        { regex: /PGMINT IND ST ([XYZLT])/, raw: 'F2 E8 Ft', params: 'stk' },
        { regex: /PGMINT IND (".{1,14}")/, raw: 'Fn BC', params: 'nam' },
        { regex: /PGMINT IND (\d{2})/, raw: 'F2 E8 8r', params: 'reg' },
        { regex: /PGMINT (".{1,14}")/, raw: 'Fn B4', params: 'lbl' }
      ]
    },
    {
      key: 'PGMSLV',
      value: [
        { regex: /PGMSLV IND ST ([XYZLT])/, raw: 'F2 E9 Ft', params: 'stk' },
        { regex: /PGMSLV IND (".{1,14}")/, raw: 'Fn BD', params: 'nam' },
        { regex: /PGMSLV IND (\d{2})/, raw: 'F2 E9 8r', params: 'reg' },
        { regex: /PGMSLV (".{1,14}")/, raw: 'Fn B5', params: 'lbl' }
      ]
    },
    { key: 'PI', value: [{ regex: /PI/, raw: '72' }] },
    { key: 'PIXEL', value: [{ regex: /PIXEL/, raw: 'A7 65' }] },
    { key: 'POLAR', value: [{ regex: /POLAR/, raw: 'A2 59' }] },
    { key: 'POSA', value: [{ regex: /POSA/, raw: 'A6 5C' }] },
    { key: 'PRA', value: [{ regex: /PRA/, raw: 'A7 48' }] },
    { key: 'PRLCD', value: [{ regex: /PRLCD/, raw: 'A7 62' }] },
    { key: 'PROFF', value: [{ regex: /PROFF/, raw: 'A7 5F' }] },
    { key: 'PROMPT', value: [{ regex: /PROMPT/, raw: '8E' }] },
    { key: 'PRON', value: [{ regex: /PRON/, raw: 'A7 5E' }] },
    { key: 'PRSTK', value: [{ regex: /PRSTK/, raw: 'A7 53' }] },
    { key: 'PRUSR', value: [{ regex: /PRUSR/, raw: 'A7 61' }] },
    {
      key: 'PRV',
      value: [
        { regex: /PRV IND ST ([XYZLT])/, raw: 'F2 D9 Ft', params: 'stk' },
        { regex: /PRV IND (".{1,14}")/, raw: 'Fn B9', params: 'nam' },
        { regex: /PRV IND (\d{2})/, raw: 'F2 D9 8r', params: 'reg' },
        { regex: /PRV (".{1,14}")/, raw: 'Fn B1', params: 'nam' }
      ]
    },
    { key: 'PRX', value: [{ regex: /PRX/, raw: 'A7 54' }] },
    { key: 'PRΣ', value: [{ regex: /PRΣ/, raw: 'A7 52' }] },
    { key: 'PSE', value: [{ regex: /PSE/, raw: '89' }] },
    { key: 'PUTM', value: [{ regex: /PUTM/, raw: 'A6 E9' }] },
    { key: 'PWRF', value: [{ regex: /PWRF/, raw: 'A0 A3' }] },
    { key: 'R<>R', value: [{ regex: /R<>R/, raw: 'A6 D1' }] },
    { key: 'RAD', value: [{ regex: /RAD/, raw: '81' }] },
    { key: 'RAN', value: [{ regex: /RAN/, raw: 'A0 71' }] },
    {
      key: 'RCL',
      value: [
        { regex: /RCL IND ST ([XYZLT])/, raw: '90 Ft', params: 'stk' },
        { regex: /RCL IND (".{1,14}")/, raw: 'Fn 99', params: 'nam' },
        { regex: /RCL IND (\d{2})/, raw: '90 8r', params: 'reg' },
        { regex: /RCL ST ([XYZLT])/, raw: '90 7t', params: 'stk' },
        { regex: /RCL (".{1,14}")/, raw: 'Fn 91', params: 'nam' },
        { regex: /RCL (1[6-9]|[2-9][0-9])/, raw: '90 rr', params: 'reg' }, // 16-99
        { regex: /RCL (0[0-9]|1[0-5])/, raw: '2r', params: 'reg' } // 00-15
      ]
    },
    {
      key: 'RCL+',
      value: [
        { regex: /RCL\+ IND ST ([XYZLT])/, raw: 'F2 D1 Ft', params: 'stk' },
        { regex: /RCL\+ IND (".{1,14}")/, raw: 'Fn 9A', params: 'nam' },
        { regex: /RCL\+ IND (\d{2})/, raw: 'F2 D1 8r', params: 'reg' },
        { regex: /RCL\+ ST ([XYZLT])/, raw: 'F2 D1 7t', params: 'stk' },
        { regex: /RCL\+ (".{1,14}")/, raw: 'Fn 92', params: 'nam' },
        { regex: /RCL\+ (\d{2})/, raw: 'F2 D1 rr', params: 'reg' }
      ]
    },
    {
      key: 'RCL-',
      value: [
        { regex: /RCL- IND ST ([XYZLT])/, raw: 'F2 D2 Ft', params: 'stk' },
        { regex: /RCL- IND (".{1,14}")/, raw: 'Fn 9B', params: 'nam' },
        { regex: /RCL- IND (\d{2})/, raw: 'F2 D2 8r', params: 'reg' },
        { regex: /RCL- ST ([XYZLT])/, raw: 'F2 D2 7t', params: 'stk' },
        { regex: /RCL- (".{1,14}")/, raw: 'Fn 93', params: 'nam' },
        { regex: /RCL- (\d{2})/, raw: 'F2 D2 rr', params: 'reg' }
      ]
    },
    { key: 'RCLEL', value: [{ regex: /RCLEL/, raw: 'A6 D7' }] },
    { key: 'RCLIJ', value: [{ regex: /RCLIJ/, raw: 'A6 D9' }] },
    {
      key: 'RCL×',
      value: [
        { regex: /RCL× IND ST ([XYZLT])/, raw: 'F2 D3 Ft', params: 'stk' },
        { regex: /RCL× IND (".{1,14}")/, raw: 'Fn 9C', params: 'nam' },
        { regex: /RCL× IND (\d{2})/, raw: 'F2 D3 8r', params: 'reg' },
        { regex: /RCL× ST ([XYZLT])/, raw: 'F2 D3 7t', params: 'stk' },
        { regex: /RCL× (".{1,14}")/, raw: 'Fn 94', params: 'nam' },
        { regex: /RCL× (\d{2})/, raw: 'F2 D3 rr', params: 'reg' }
      ]
    },
    {
      key: 'RCL÷',
      value: [
        { regex: /RCL÷ IND ST ([XYZLT])/, raw: 'F2 D4 Ft', params: 'stk' },
        { regex: /RCL÷ IND (".{1,14}")/, raw: 'Fn 9D', params: 'nam' },
        { regex: /RCL÷ IND (\d{2})/, raw: 'F2 D4 8r', params: 'reg' },
        { regex: /RCL÷ ST ([XYZLT])/, raw: 'F2 D4 7t', params: 'stk' },
        { regex: /RCL÷ (".{1,14}")/, raw: 'Fn 95', params: 'nam' },
        { regex: /RCL÷ (\d{2})/, raw: 'F2 D4 rr', params: 'reg' }
      ]
    },
    { key: 'RDX,', value: [{ regex: /RDX,/, raw: 'A2 5C' }] },
    { key: 'RDX.', value: [{ regex: /RDX./, raw: 'A2 5B' }] },
    { key: 'REAL?', value: [{ regex: /REAL\?/, raw: 'A2 65' }] },
    { key: 'REALRES', value: [{ regex: /REALRES/, raw: 'A2 6B' }] },
    { key: 'RECT', value: [{ regex: /RECT/, raw: 'A2 5A' }] },
    { key: 'RND', value: [{ regex: /RND/, raw: '6E' }] },
    { key: 'RNRM', value: [{ regex: /RNRM/, raw: 'A6 ED' }] },
    { key: 'ROTXY', value: [{ regex: /ROTXY/, raw: 'A5 8B' }] },
    { key: 'RSUM', value: [{ regex: /RSUM/, raw: 'A6 D0' }] },
    { key: 'RTN', value: [{ regex: /RTN/, raw: '85' }] },
    { key: 'R↑', value: [{ regex: /R↑/, raw: '74' }] },
    { key: 'R↓', value: [{ regex: /R↓/, raw: '75' }] },
    {
      key: 'SCI',
      value: [
        { regex: /SCI 10/, raw: 'F1 D6' },
        { regex: /SCI 11/, raw: 'F1 E6' },
        { regex: /SCI IND ST ([XYZLT])/, raw: '9D Ft', params: 'stk' },
        { regex: /SCI IND (".{1,14}")/, raw: 'Fn DD', params: 'nam' },
        { regex: /SCI IND (\d{2})/, raw: '9D 8r', params: 'reg' },
        { regex: /SCI (0[0-9])/, raw: '9D nn', params: 'dig' } //00-09
      ]
    },
    { key: 'SDEV', value: [{ regex: /SDEV/, raw: '7D' }] },
    { key: 'SEED', value: [{ regex: /SEED/, raw: 'A0 73' }] },
    {
      key: 'SF',
      value: [
        { regex: /SF IND ST ([XYZLT])/, raw: 'A8 Ft', params: 'stk' },
        { regex: /SF IND (".{1,14}")/, raw: 'Fn A8', params: 'nam' },
        { regex: /SF IND (\d{2})/, raw: 'A8 8r', params: 'reg' },
        { regex: /SF (\d{2})/, raw: 'A8 rr', params: 'flg' } //00-99
      ]
    },
    { key: 'SIGN', value: [{ regex: /SIGN/, raw: '7A' }] },
    { key: 'SIN', value: [{ regex: /SIN/, raw: '59' }] },
    { key: 'SINH', value: [{ regex: /SINH/, raw: 'A0 61' }] },
    { key: 'SIZE', value: [{ regex: /SIZE (\d{2,4})/, raw: 'F3 F7 ss ss', params: 'siz' }] },
    { key: 'SLOPE', value: [{ regex: /SLOPE/, raw: 'A0 A4' }] },
    {
      key: 'SOLVE',
      value: [
        { regex: /SOLVE IND ST ([XYZLT])/, raw: 'F2 EB Ft', params: 'stk' },
        { regex: /SOLVE IND (".{1,14}")/, raw: 'Fn BF', params: 'nam' },
        { regex: /SOLVE IND (\d{2})/, raw: 'F2 EB 8r', params: 'reg' },
        { regex: /SOLVE (".{1,14}")/, raw: 'Fn B7', params: 'lbl' }
      ]
    },
    { key: 'SQRT', value: [{ regex: /SQRT/, raw: '52' }] },
    {
      key: 'STO',
      value: [
        { regex: /STO IND ST ([XYZLT])/, raw: '91 Ft', params: 'stk' },
        { regex: /STO IND (".{1,14}")/, raw: 'Fn 89', params: 'nam' },
        { regex: /STO IND (\d{2})/, raw: '91 8r', params: 'reg' },
        { regex: /STO ST ([XYZLT])/, raw: '91 7t', params: 'stk' },
        { regex: /STO (".{1,14}")/, raw: 'Fn 81', params: 'nam' },
        { regex: /STO (1[6-9]|[2-9][0-9])/, raw: '91 rr', params: 'reg' }, // 16-99
        { regex: /STO (0[0-9]|1[0-5])/, raw: '3r', params: 'reg' } // 00-15
      ]
    },
    {
      key: 'STO+',
      value: [
        { regex: /STO\+ IND ST ([XYZLT])/, raw: '92 Ft', params: 'stk' },
        { regex: /STO\+ IND (".{1,14}")/, raw: 'Fn 8A', params: 'nam' },
        { regex: /STO\+ IND (\d{2})/, raw: '92 8r', params: 'reg' },
        { regex: /STO\+ ST ([XYZLT])/, raw: '92 7t', params: 'stk' },
        { regex: /STO\+ (".{1,14}")/, raw: 'Fn 82', params: 'nam' },
        { regex: /STO\+ (\d{2})/, raw: '92 rr', params: 'reg' }
      ]
    },
    {
      key: 'STO-',
      value: [
        { regex: /STO- IND ST ([XYZLT])/, raw: '93 Ft', params: 'stk' },
        { regex: /STO- IND (".{1,14}")/, raw: 'Fn 8B', params: 'nam' },
        { regex: /STO- IND (\d{2})/, raw: '93 8r', params: 'reg' },
        { regex: /STO- ST ([XYZLT])/, raw: '93 7t', params: 'stk' },
        { regex: /STO- (".{1,14}")/, raw: 'Fn 83', params: 'nam' },
        { regex: /STO- (\d{2})/, raw: '93 rr', params: 'reg' }
      ]
    },
    { key: 'STOEL', value: [{ regex: /STOEL/, raw: 'A6 D6' }] },
    { key: 'STOIJ', value: [{ regex: /STOIJ/, raw: 'A6 D8' }] },
    { key: 'STOP', value: [{ regex: /STOP/, raw: '84' }] },
    {
      key: 'STO×',
      value: [
        { regex: /STO× IND ST ([XYZLT])/, raw: '94 Ft', params: 'stk' },
        { regex: /STO× IND (".{1,14}")/, raw: 'Fn 8C', params: 'nam' },
        { regex: /STO× IND (\d{2})/, raw: '94 8r', params: 'reg' },
        { regex: /STO× ST ([XYZLT])/, raw: '94 7t', params: 'stk' },
        { regex: /STO× (".{1,14}")/, raw: 'Fn 84', params: 'nam' },
        { regex: /STO× (\d{2})/, raw: '94 rr', params: 'reg' }
      ]
    },
    {
      key: 'STO÷',
      value: [
        { regex: /STO÷ IND ST ([XYZLT])/, raw: '95 Ft', params: 'stk' },
        { regex: /STO÷ IND (".{1,14}")/, raw: 'Fn 8D', params: 'nam' },
        { regex: /STO÷ IND (\d{2})/, raw: '95 8r', params: 'reg' },
        { regex: /STO÷ ST ([XYZLT])/, raw: '95 7t', params: 'stk' },
        { regex: /STO÷ (".{1,14}")/, raw: 'Fn 85', params: 'nam' },
        { regex: /STO÷ (\d{2})/, raw: '95 rr', params: 'reg' }
      ]
    },
    { key: 'STR?', value: [{ regex: /STR\?/, raw: 'A2 68' }] },
    { key: 'SUM', value: [{ regex: /SUM/, raw: 'A0 A5' }] },
    { key: 'TAN', value: [{ regex: /TAN/, raw: '5B' }] },
    { key: 'TANH', value: [{ regex: /TANH/, raw: 'A0 63' }] },
    { key: 'TIME', value: [{ regex: /TIME/, raw: 'A6 9C' }] },
    {
      key: 'TONE',
      value: [
        { regex: /TONE IND ST ([XYZLT])/, raw: '9F Ft', params: 'stk' },
        { regex: /TONE IND (".{1,14}")/, raw: 'Fn DF', params: 'nam' },
        { regex: /TONE IND (\d{2})/, raw: '9F 8r', params: 'reg' },
        { regex: /TONE ([0-9])/, raw: '9F tn', params: 'ton' } // 0-9
      ]
    },
    { key: 'TRACE', value: [{ regex: /TRACE/, raw: 'A7 5D' }] },
    { key: 'TRANS', value: [{ regex: /TRANS/, raw: 'A6 C9' }] },
    { key: 'UVEC', value: [{ regex: /UVEC/, raw: 'A6 CD' }] },
    {
      key: 'VARMENU',
      value: [
        { regex: /VARMENU IND ST ([XYZLT])/, raw: 'F2 F8 Ft', params: 'stk' },
        { regex: /VARMENU IND (".{1,14}")/, raw: 'Fn C9', params: 'nam' },
        { regex: /VARMENU IND (\d{2})/, raw: 'F2 F8 8r', params: 'reg' },
        { regex: /VARMENU (".{1,14}")/, raw: 'Fn C1', params: 'nam' }
      ]
    },
    {
      key: 'VIEW',
      value: [
        { regex: /VIEW IND ST ([XYZLT])/, raw: '98 Ft', params: 'stk' },
        { regex: /VIEW IND (".{1,14}")/, raw: 'Fn 88', params: 'nam' },
        { regex: /VIEW IND (\d{2})/, raw: '98 8r', params: 'reg' },
        { regex: /VIEW ST ([XYZLT])/, raw: '98 7t', params: 'stk' },
        { regex: /VIEW (".{1,14}")/, raw: 'Fn 80', params: 'nam' },
        { regex: /VIEW (\d{2})/, raw: '98 rr', params: 'reg' }
      ]
    },
    { key: 'WMEAN', value: [{ regex: /WMEAN/, raw: 'A0 AC' }] },
    { key: 'WRAP', value: [{ regex: /WRAP/, raw: 'A6 E2' }] },
    { key: 'X<0?', value: [{ regex: /X<0\?/, raw: '66' }] },
    {
      key: 'X<>',
      value: [
        { regex: /X<> IND ST ([XYZLT])/, raw: 'CE Ft', params: 'stk' },
        { regex: /X<> IND (".{1,14}")/, raw: 'Fn 8E', params: 'nam' },
        { regex: /X<> IND (\d{2})/, raw: 'CE 8r', params: 'reg' },
        { regex: /X<> ST ([XYZLT])/, raw: 'CE 7t', params: 'stk' },
        { regex: /X<> (".{1,14}")/, raw: 'Fn 86', params: 'nam' },
        { regex: /X<> (\d{2})/, raw: 'CE rr', params: 'reg' }
      ]
    },
    { key: 'X<>Y', value: [{ regex: /X<>Y/, raw: '71' }] },
    { key: 'X<Y?', value: [{ regex: /X<Y\?/, raw: '44' }] },
    { key: 'X=0?', value: [{ regex: /X=0\?/, raw: '67' }] },
    { key: 'X=Y?', value: [{ regex: /X=Y\?/, raw: '78' }] },
    { key: 'X>0?', value: [{ regex: /X>0\?/, raw: '64' }] },
    { key: 'X>Y?', value: [{ regex: /X>Y\?/, raw: '45' }] },
    {
      key: 'XEQ',
      value: [
        { regex: /XEQ IND ST ([XYZLT])/, raw: 'AE Ft', params: 'stk' },
        { regex: /XEQ IND (".{1,14}")/, raw: 'Fn AF', params: 'nam' },
        { regex: /XEQ IND (\d{2})/, raw: 'AE 8r', params: 'reg' },
        { regex: /XEQ (".{1,14}")/, raw: '1E Fn', params: 'lbl' },
        { regex: /XEQ (\d{2}|[a-eA-J])/, raw: 'E0 00 nn', params: 'lblno' } // 00-99,A-J,a-e { regex: /XEQ sl/, raw: 'E0 00 nn' }
      ]
    },
    { key: 'XOR', value: [{ regex: /XOR/, raw: 'A5 8A' }] },
    { key: 'XTOA', value: [{ regex: /XTOA/, raw: 'A6 6F' }] },
    { key: 'X↑2', value: [{ regex: /X↑2/, raw: '51' }] },
    { key: 'X≠0?', value: [{ regex: /X≠0\?/, raw: '63' }] },
    { key: 'X≠Y?', value: [{ regex: /X≠Y\?/, raw: '79' }] },
    { key: 'X≤0?', value: [{ regex: /X≤0\?/, raw: '7B' }] },
    { key: 'X≤Y?', value: [{ regex: /X≤Y\?/, raw: '46' }] },
    { key: 'X≥0?', value: [{ regex: /X≥0\?/, raw: 'A2 5F' }] },
    { key: 'X≥Y?', value: [{ regex: /X≥Y\?/, raw: 'A2 60' }] },
    { key: 'X≶Y', value: [{ regex: /X≶Y/, raw: '71' }] },
    { key: 'YINT', value: [{ regex: /YINT/, raw: 'A0 A6' }] },
    { key: 'Y↑X', value: [{ regex: /Y↑X/, raw: '53' }] },
    { key: '[FIND]', value: [{ regex: /\[FIND\]/, raw: 'A6 EC' }] },
    { key: '[MAX]', value: [{ regex: /\[MAX\]/, raw: 'A6 EB' }] },
    { key: '[MIN]', value: [{ regex: /\[MIN\]/, raw: 'A6 EA' }] },
    { key: '`str`', value: [{ regex: /(".{15}")/, raw: 'Fn', params: 'str' }] }, // max length 15 !
    { key: '±', value: [{ regex: /±/, raw: '54' }] },
    { key: '×', value: [{ regex: /×/, raw: '42' }] },
    { key: '÷', value: [{ regex: /÷/, raw: '43' }] },
    { key: 'Σ+', value: [{ regex: /Σ\+/, raw: '47' }] },
    { key: 'Σ-', value: [{ regex: /Σ-/, raw: '48' }] },
    {
      key: 'ΣREG',
      value: [
        { regex: /ΣREG IND ST ([XYZLT])/, raw: '99 Ft', params: 'stk' },
        { regex: /ΣREG IND (".{1,14}")/, raw: 'Fn DB', params: 'nam' },
        { regex: /ΣREG IND (\d{2})/, raw: '99 8r', params: 'reg' },
        { regex: /ΣREG (\d{2})/, raw: '99 rr', params: 'reg' }
      ]
    },
    { key: 'ΣREG?', value: [{ regex: /ΣREG\?/, raw: 'A6 78' }] },
    { key: '←', value: [{ regex: /←/, raw: 'A6 DC' }] },
    { key: '↑', value: [{ regex: /↑/, raw: 'A6 DE' }] },
    { key: '→', value: [{ regex: /→/, raw: 'A6 DD' }] },
    { key: '→DEC', value: [{ regex: /→DEC/, raw: '5F' }] },
    { key: '→DEG', value: [{ regex: /→DEG/, raw: '6B' }] },
    { key: '→HMS', value: [{ regex: /→HMS/, raw: '6C' }] },
    { key: '→HR', value: [{ regex: /→HR/, raw: '6D' }] },
    { key: '→OCT', value: [{ regex: /→OCT/, raw: '6F' }] },
    { key: '→POL', value: [{ regex: /→POL/, raw: '4F' }] },
    { key: '→RAD', value: [{ regex: /→RAD/, raw: '6A' }] },
    { key: '→REC', value: [{ regex: /→REC/, raw: '4E' }] },
    { key: '↓', value: [{ regex: /↓/, raw: 'A6 DF' }] },
    { key: '⊢`str`', value: [{ regex: /⊢(".{14}")/, raw: 'Fn 7F', params: 'str' }] } // max. length 14
  ];

  // #endregion
}
