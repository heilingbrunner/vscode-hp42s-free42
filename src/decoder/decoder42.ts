import { RpnPattern } from './rpnpattern';
import { RpnLine } from './rpnline';

export class Decoder42 {
  //#region Members

  static rawMap = new Map<string, RpnPattern[]>();
  static stackMap = new Map<number, string>();
  static charMap = new Map<number, string>();
  static lblMap = new Map<number, string>();

  static initialized: boolean = false;

  //#endregion

  //#region Public

  static initialize() {
    if (!Decoder42.initialized) {
      // transform arr_rawMap -> rawMap
      Decoder42.arr_rawMap.forEach((e) => {
        Decoder42.rawMap.set(e.key, e.value);
      });

      Decoder42.arr_stackMap.forEach((e) => {
        Decoder42.stackMap.set(e.key, e.value);
      });

      // transform arr_charMap -> charMap
      Decoder42.arr_charMap.forEach((e) => {
        Decoder42.charMap.set(e.key, e.value);
      });

      Decoder42.initialized = true;
    }
  }

  static toRpn(rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      if (rpnLine.params.stk !== undefined && /`stk`/.test(rpnLine.workCode)) {
        this.replaceStack("`stk`", rpnLine);
      }

      if (rpnLine.params.num !== undefined && /`num`/.test(rpnLine.workCode)) {
        this.replaceNumber("`num`", rpnLine);
      }

      if (rpnLine.params.key !== undefined && /`key`/.test(rpnLine.workCode)) {
        this.replaceKey("`key`", rpnLine);
      }

      // numbers
      if (rpnLine.params.lblno !== undefined && /sl/.test(rpnLine.workCode)) {
        this.replaceLabelNo("sl", rpnLine);
      } else if (
        rpnLine.params.lblno !== undefined &&
        /ll/.test(rpnLine.workCode)
      ) {
        this.replaceLabelNo("ll", rpnLine);
      }
      //
      else if (
        rpnLine.params.regno !== undefined &&
        /sr/.test(rpnLine.workCode)
      ) {
        this.replaceRegister("sr", rpnLine);
      } else if (
        rpnLine.params.regno !== undefined &&
        /rr/.test(rpnLine.workCode)
      ) {
        this.replaceRegister("rr", rpnLine);
      }
      // numbers
      else if (
        rpnLine.params.flgno !== undefined &&
        /fl/.test(rpnLine.workCode)
      ) {
        this.replaceFlag("fl", rpnLine);
      } else if (
        rpnLine.params.sizno !== undefined &&
        /ss ss/.test(rpnLine.workCode)
      ) {
        this.replaceSize("ss ss", rpnLine);
      } else if (
        rpnLine.params.tonno !== undefined &&
        /tn/.test(rpnLine.workCode)
      ) {
        this.replaceTone("tn", rpnLine);
      } else if (
        rpnLine.params.digno !== undefined &&
        /sd/.test(rpnLine.workCode)
      ) {
        this.replaceDigits("sd", rpnLine);
      } else if (
        rpnLine.params.errno !== undefined &&
        /er/.test(rpnLine.workCode)
      ) {
        this.replaceError("er", rpnLine);
      }

      if (rpnLine.params.lbl !== undefined && /`lbl`/.test(rpnLine.workCode)) {
        this.replaceLabel("`lbl`", rpnLine);
      }

      if (rpnLine.params.str !== undefined && /`str`/.test(rpnLine.workCode)) {
        this.replaceString("`str`", rpnLine);
      }

      if (rpnLine.params.nam !== undefined && /`nam`/.test(rpnLine.workCode)) {
        this.replaceName("`nam`", rpnLine);
      }
    }
  }

  //#endregion

  //#region Private Methods

  private static replaceLabel(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      let lbl = this.convertRawToString(rpnLine.params.lbl);
      rpnLine.workCode = rpnLine.workCode.replace(replace, '"' + lbl + '"');
    }
  }

  private static replaceString(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      let str = this.convertRawToString(rpnLine.params.str);
      rpnLine.workCode = rpnLine.workCode.replace(replace, '"' + str + '"');
    }
  }

  private static replaceName(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      let nam = this.convertRawToString(rpnLine.params.nam);
      rpnLine.workCode = rpnLine.workCode.replace(replace, '"' + nam + '"');
    }
  }

  private static replaceNumber(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      let number = this.convertRawToNumber(rpnLine.params.num);
      rpnLine.workCode = rpnLine.workCode.replace(replace, number);
    }
  }

  private static replaceLabelNo(replace: string, rpnLine: RpnLine) {
    // ... 99  ... 63 dec:16-99; hex:10-63
    // ... A   ... 66 dec:102  char:65
    // ... J   ... 6F dec:111
    // ... a   ... 7B dec:123  char:97
    // ... e   ... 7F dec:127
    if (rpnLine.workCode) {
      let number = "";

      if (rpnLine.params.lblno !== undefined) {
        if (Decoder42.inRange(rpnLine.params.lblno, 0, 99)) {
          //00-99
          number = this.formatNN(rpnLine.params.lblno);
        } else if (Decoder42.inRange(rpnLine.params.lblno, 102, 111)) {
          //A-F
          number = String.fromCharCode(rpnLine.params.lblno - 37);
        } else if (Decoder42.inRange(rpnLine.params.lblno, 123, 127)) {
          //a-e
          number = String.fromCharCode(rpnLine.params.lblno - 26);
        }
      }

      rpnLine.workCode = rpnLine.workCode.replace(replace, number);
    }
  }

  private static replaceRegister(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      let number = this.formatNN(rpnLine.params.regno);
      rpnLine.workCode = rpnLine.workCode.replace(replace, number);
    }
  }

  private static replaceFlag(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      let number = this.formatNN(rpnLine.params.flgno);
      rpnLine.workCode = rpnLine.workCode.replace(replace, number);
    }
  }

  private static replaceStack(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      rpnLine.workCode = rpnLine.workCode.replace(
        replace,
        "" + rpnLine.params.stk
      );
    }
  }

  private static replaceKey(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      rpnLine.workCode = rpnLine.workCode.replace(
        replace,
        this.formatNN(rpnLine.params.keyno)
      );
    }
  }

  private static replaceSize(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      rpnLine.workCode = rpnLine.workCode.replace(
        replace,
        this.formatNN(rpnLine.params.sizno)
      ); // 01-9999
    }
  }

  private static replaceTone(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      rpnLine.workCode = rpnLine.workCode.replace(
        replace,
        "" + rpnLine.params.tonno
      ); // 0-9
    }
  }

  private static replaceDigits(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      // rpnLine.params.digno: 0-9, rpnLine.params.dig: 00-09
      rpnLine.workCode = rpnLine.workCode.replace(
        replace,
        this.formatNN(rpnLine.params.digno)
      );
    }
  }

  private static replaceError(replace: string, rpnLine: RpnLine) {
    if (rpnLine.workCode) {
      rpnLine.workCode = rpnLine.workCode.replace(
        replace,
        "" + rpnLine.params.errno
      ); // 0-9
    }
  }

  /** Changing numbers into corresponding opcodes. 11 1A 12 13 14 1B 1C 14 15 15 00 -> '1.234E-455' */
  private static convertRawToNumber(raw?: string): string {
    let number = "";
    if (raw) {
      raw = raw.replace(/00$/, "");
      raw = raw.replace(/1A/, ".");
      raw = raw.replace(/1B/, "ᴇ");
      raw = raw.replace(/1C/g, "-");
      raw = raw.replace(/1([0-9])/g, "$1");
      raw = raw.replace(/ /g, "");
      number = raw;
    }

    // TODO: Format 0.008 -> 8ᴇ-3
    const match = number.match(/(0+)\.(0+)(\d+)(ᴇ|)((-|)\d+|)/);
    if (match) {
      let len1 = match[1].length;
      let len2 = match[2].length;
      let len3 = match[3].length;
      let exp = parseInt(match[5]);
      let float = parseFloat(match[0].replace("ᴇ", "e"));
      // 0.008 -> 8ᴇ-3
      if (len2 > 1) {
        //console.log(
        //  (float * Math.pow(10, (-exp + len2 + len3))).toExponential(0).replace('e', 'ᴇ') + (exp - (len2 + len3))
        //);
      }
    }

    return number;
  }

  private static convertRawToString(raw?: string): string {
    let str = "";
    if (raw) {
      let chars = raw.split(" ");
      chars.forEach((char) => {
        let byte = this.convertHexAsByte(char);
        if (Decoder42.charMap.has(byte)) {
          str += Decoder42.charMap.get(byte);
        } else {
          str += String.fromCharCode(byte);
        }
      });
    }

    return str;
  }

  /** Changing integers (size one byte, 0-255) into hex string . 123 -> 7B, 255 -> FF */
  private static convertHexAsByte(hex: string): number {
    let byte = parseInt(hex, 16);
    return byte;
  }

  private static formatNN(n?: number): string {
    if (n !== undefined) {
      return n > 9 ? "" + n : "0" + n;
    }
    return "??";
  }

  private static inRange(x: number, min: number, max: number): boolean {
    return (x - min) * (x - max) <= 0;
  }

  //#endregion

  //#region Private Arrays

  private static arr_stackMap = [
    { key: 0, value: "T" },
    { key: 1, value: "Z" },
    { key: 2, value: "Y" },
    { key: 3, value: "X" },
    { key: 4, value: "L" },
  ];

  /** FOCAL character set https://en.wikipedia.org/wiki/FOCAL_character_set key is used as regex */
  private static arr_charMap = [
    { key: 0, value: "÷" },
    { key: 1, value: "×" },
    { key: 2, value: "√" },
    { key: 3, value: "∫" },
    { key: 4, value: "░" },
    { key: 5, value: "Σ" },
    { key: 6, value: "▶" },
    { key: 7, value: "π" },
    { key: 8, value: "¿" },
    { key: 9, value: "≤" },
    { key: 10, value: "\\[LF\\]" }, // for [LF] line feed
    { key: 10, value: "␊" }, // ␊ see: https://www.compart.com/de/unicode/U+240A
    { key: 11, value: "≥" },
    { key: 12, value: "≠" },
    { key: 13, value: "↵" },
    { key: 14, value: "↓" },
    { key: 15, value: "→" },
    { key: 16, value: "←" },
    { key: 17, value: "µ" }, // different bytes B5
    { key: 17, value: "μ" }, // different bytes N<
    { key: 18, value: "£" },
    { key: 18, value: "₤" },
    { key: 19, value: "°" },
    { key: 20, value: "Å" },
    { key: 21, value: "Ñ" },
    { key: 22, value: "Ä" },
    { key: 23, value: "∡" },
    { key: 24, value: "ᴇ" },
    { key: 25, value: "Æ" },
    { key: 26, value: "…" },
    { key: 27, value: "␛" }, // ␛ see: https://www.compart.com/de/unicode/U+241B
    { key: 28, value: "Ö" },
    { key: 29, value: "Ü" },
    { key: 30, value: "▒" },
    { key: 31, value: "■" },
    //{ key: 31, value: '•' }, // see above
    // { key: 32, value: 'SP' },
    // { key: 33, value: '!' },
    // { key: 34, value: ''' }, // single quote
    // { key: 35, value: '#' },
    // { key: 36, value: '$' },
    // { key: 37, value: '%' },
    // { key: 38, value: '&' },
    // { key: 39, value: '"' }, // double quotes !!
    // { key: 40, value: '(' },
    // { key: 41, value: ')' },
    // { key: 42, value: '*' },
    // { key: 43, value: '+' },
    // { key: 44, value: ',' },
    // { key: 45, value: '-' },
    // { key: 46, value: '.' },
    // { key: 47, value: '/' },
    // { key: 48, value: '0' },
    // { key: 49, value: '1' },
    // { key: 50, value: '2' },
    // { key: 51, value: '3' },
    // { key: 52, value: '4' },
    // { key: 53, value: '5' },
    // { key: 54, value: '6' },
    // { key: 55, value: '7' },
    // { key: 56, value: '8' },
    // { key: 57, value: '9' },
    // { key: 58, value: ':' },
    // { key: 59, value: ';' },
    // { key: 60, value: '<' },
    // { key: 61, value: '=' },
    // { key: 62, value: '>' },
    // { key: 63, value: '?' },
    // { key: 64, value: '@' },
    // { key: 65, value: 'A' },
    // { key: 66, value: 'B' },
    // { key: 67, value: 'C' },
    // { key: 68, value: 'D' },
    // { key: 69, value: 'E' },
    // { key: 70, value: 'F' },
    // { key: 71, value: 'G' },
    // { key: 72, value: 'H' },
    // { key: 73, value: 'I' },
    // { key: 74, value: 'J' },
    // { key: 75, value: 'K' },
    // { key: 76, value: 'L' },
    // { key: 77, value: 'M' },
    // { key: 78, value: 'N' },
    // { key: 79, value: 'O' },
    // { key: 80, value: 'P' },
    // { key: 81, value: 'Q' },
    // { key: 82, value: 'R' },
    // { key: 83, value: 'S' },
    // { key: 84, value: 'T' },
    // { key: 85, value: 'U' },
    // { key: 86, value: 'V' },
    // { key: 87, value: 'W' },
    // { key: 88, value: 'X' },
    // { key: 89, value: 'Y' },
    // { key: 90, value: 'Z' },
    // { key: 91, value: '[' },
    { key: 92, value: "\\\\" }, // for \
    // { key: 93, value: ']' },
    { key: 94, value: "↑" },
    // { key: 95, value: '_' },
    // { key: 96, value: '`' },
    // { key: ??, value: '´' },
    // { key: 97, value: 'a' },
    // { key: 98, value: 'b' },
    // { key: 99, value: 'c' },
    // { key: 100, value: 'd' },
    // { key: 101, value: 'e' },
    // { key: 102, value: 'f' },
    // { key: 103, value: 'g' },
    // { key: 104, value: 'h' },
    // { key: 105, value: 'i' },
    // { key: 106, value: 'j' },
    // { key: 107, value: 'k' },
    // { key: 108, value: 'l' },
    // { key: 109, value: 'm' },
    // { key: 110, value: 'n' },
    // { key: 111, value: 'o' },
    // { key: 112, value: 'p' },
    // { key: 113, value: 'q' },
    // { key: 114, value: 'r' },
    // { key: 115, value: 's' },
    // { key: 116, value: 't' },
    // { key: 117, value: 'u' },
    // { key: 118, value: 'v' },
    // { key: 119, value: 'w' },
    // { key: 120, value: 'x' },
    // { key: 121, value: 'y' },
    // { key: 122, value: 'z' },
    // { key: 123, value: '{' },
    // { key: 124, value: '|' },
    // { key: 125, value: '}' },
    // { key: 126, value: '~' }
    // { key: 127, value: '⊦' }

    // { key: ???, value: '´' }
  ];

  // 0(?<lblno>[2-9A-F]): LBL 01-15
  // Fn: F([1-9A-F]) Label: max. length 14
  // 7t: 7([0-4]); stack 0-4
  // 8r: ([89A-E][0-9A-F]); r: dec:1..99; 128 + r => hex:81..E3
  // Ft: F([0-4]); ... IND ST [XYZLT]
  // [23]r: (2[0-9A-F]); register dec:1-15, hex: 21-2F
  // rr: ([0-7][0-9A-F]); register dec:16-99, hex:10-63
  // nn: (?<digits>0[1-9]); digits; dec:0-9; 00-09
  // nn: digits; dec:10,11
  // tone: (?<tone>0[0-9]); dec:1-9; hex:01-09

  // LBL 14  0F
  // LBL 99  CF63
  // LBL A   CF66
  // LBL J   CF6F
  // LBL a   CF7B
  // LBL e   CF7F

  // GTO 14  BF00
  // GTO 99  D00063
  // GTO A   D00066
  // GTO J   D0006F
  // GTO a   D0007B
  // GTO e   D0007F

  // RCL 01  21
  // RCL 15  2F
  // RCL 16  9010
  // RCL 99  9063

  // XEQ 14  E0000E
  // XEQ 99  E00063
  // XEQ A   E00066
  // XEQ J   E0006F
  // XEQ a   E0007B
  // XEQ e   E0007F

  private static arr_rawMap = [
    {
      key: "0",
      value: [
        { regex: /00/, len: 1, rpn: "NULL" },
        { regex: /0([1-9A-F])/, len: 1, rpn: "LBL sl", params: "lblno-1" }, //+ LBL 00-14
      ],
    },
    {
      key: "1",
      value: [
        { regex: /1D F([1-9A-F])/, len: 2, rpn: "GTO `lbl`", params: "lbll" }, //+ lbl max length 14
        { regex: /1E F([1-9A-F])/, len: 2, rpn: "XEQ `lbl`", params: "lbll" }, //+ lbl max length 14
        //no numbers here: { regex: /(1[0-9A-C] )+00/, len: 1, rpn: '`num`', params: 'number' }
      ],
    },
    {
      key: "2",
      value: [
        { regex: /2([0-9A-F])/, len: 1, rpn: "RCL sr", params: "reg" },
        // RCL 01  21
        // RCL 15  2F
      ],
    }, //+
    {
      key: "3",
      value: [{ regex: /3([0-9A-F])/, len: 1, rpn: "STO sr", params: "reg" }],
    }, //+
    {
      key: "4",
      value: [
        { regex: /40/, len: 1, rpn: "+" }, //+
        { regex: /41/, len: 1, rpn: "-" }, //+
        { regex: /42/, len: 1, rpn: "×" }, //+
        { regex: /43/, len: 1, rpn: "÷" }, //+
        { regex: /44/, len: 1, rpn: "X<Y?" }, //+
        { regex: /45/, len: 1, rpn: "X>Y?" },
        { regex: /46/, len: 1, rpn: "X≤Y?" }, //+
        { regex: /47/, len: 1, rpn: "Σ+" },
        { regex: /48/, len: 1, rpn: "Σ-" },
        { regex: /49/, len: 1, rpn: "HMS+" },
        { regex: /4A/, len: 1, rpn: "HMS-" },
        { regex: /4B/, len: 1, rpn: "MOD" },
        { regex: /4C/, len: 1, rpn: "%" },
        { regex: /4D/, len: 1, rpn: "%CH" },
        { regex: /4E/, len: 1, rpn: "→REC" },
        { regex: /4F/, len: 1, rpn: "→POL" },
      ],
    },

    {
      key: "5",
      value: [
        { regex: /50/, len: 1, rpn: "LN" },
        { regex: /51/, len: 1, rpn: "X↑2" },
        { regex: /52/, len: 1, rpn: "SQRT" },
        { regex: /53/, len: 1, rpn: "Y↑X" },
        { regex: /54/, len: 1, rpn: "+/-" },
        { regex: /55/, len: 1, rpn: "E↑X" },
        { regex: /56/, len: 1, rpn: "LOG" },
        { regex: /57/, len: 1, rpn: "10↑X" },
        { regex: /58/, len: 1, rpn: "E↑X-1" },
        { regex: /59/, len: 1, rpn: "SIN" },
        { regex: /5A/, len: 1, rpn: "COS" },
        { regex: /5B/, len: 1, rpn: "TAN" },
        { regex: /5C/, len: 1, rpn: "ASIN" },
        { regex: /5D/, len: 1, rpn: "ACOS" },
        { regex: /5E/, len: 1, rpn: "ATAN" },
        { regex: /5F/, len: 1, rpn: "→DEC" },
      ],
    },
    {
      key: "6",
      value: [
        { regex: /60/, len: 1, rpn: "1/X" },
        { regex: /61/, len: 1, rpn: "ABS" }, //+
        { regex: /62/, len: 1, rpn: "N!" },
        { regex: /63/, len: 1, rpn: "X≠0?" },
        { regex: /64/, len: 1, rpn: "X>0?" },
        { regex: /65/, len: 1, rpn: "LN1+X" },
        { regex: /66/, len: 1, rpn: "X<0?" },
        { regex: /67/, len: 1, rpn: "X=0?" }, //+
        { regex: /68/, len: 1, rpn: "IP" }, //+
        { regex: /69/, len: 1, rpn: "FP" },
        { regex: /6A/, len: 1, rpn: "→RAD" },
        { regex: /6B/, len: 1, rpn: "→DEG" },
        { regex: /6C/, len: 1, rpn: "→HMS" },
        { regex: /6D/, len: 1, rpn: "→HR" },
        { regex: /6E/, len: 1, rpn: "RND" },
        { regex: /6F/, len: 1, rpn: "→OCT" },
      ],
    },

    {
      key: "7",
      value: [
        { regex: /70/, len: 1, rpn: "CLΣ" },
        { regex: /71/, len: 1, rpn: "X<>Y" }, //+
        { regex: /72/, len: 1, rpn: "PI" },
        { regex: /73/, len: 1, rpn: "CLST" }, //+
        { regex: /74/, len: 1, rpn: "R↑" },
        { regex: /75/, len: 1, rpn: "R↓" },
        { regex: /76/, len: 1, rpn: "LASTX" },
        { regex: /77/, len: 1, rpn: "CLX" },
        { regex: /78/, len: 1, rpn: "X=Y?" }, //+
        { regex: /79/, len: 1, rpn: "X≠Y?" }, //+
        { regex: /7A/, len: 1, rpn: "SIGN" },
        { regex: /7B/, len: 1, rpn: "X≤0?" },
        { regex: /7C/, len: 1, rpn: "MEAN" },
        { regex: /7D/, len: 1, rpn: "SDEV" },
        { regex: /7E/, len: 1, rpn: "AVIEW" }, //+
        { regex: /7F/, len: 1, rpn: "CLD" },
      ],
    },

    {
      key: "8",
      value: [
        { regex: /80/, len: 1, rpn: "DEG" },
        { regex: /81/, len: 1, rpn: "RAD" },
        { regex: /82/, len: 1, rpn: "GRAD" },
        { regex: /83/, len: 1, rpn: "ENTER" }, //+
        { regex: /84/, len: 1, rpn: "STOP" }, //+
        { regex: /85/, len: 1, rpn: "RTN" }, //+
        { regex: /86/, len: 1, rpn: "BEEP" }, //+
        { regex: /87/, len: 1, rpn: "CLA" },
        { regex: /88/, len: 1, rpn: "ASHF" },
        { regex: /89/, len: 1, rpn: "PSE" }, //+
        { regex: /8A/, len: 1, rpn: "CLRG" },
        { regex: /8B/, len: 1, rpn: "AOFF" },
        { regex: /8C/, len: 1, rpn: "AON" },
        { regex: /8D/, len: 1, rpn: "OFF" },
        { regex: /8E/, len: 1, rpn: "PROMPT" },
        { regex: /8F/, len: 1, rpn: "ADV" },
      ],
    },

    {
      key: "9",
      value: [
        { regex: /90 7([0-4])/, len: 2, rpn: "RCL ST `stk`", params: "stk" },
        {
          regex: /90 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "RCL IND rr",
          params: "reg-128",
        }, //+ r dec:0-99 + 128
        {
          regex: /90 F([0-4])/,
          len: 2,
          rpn: "RCL IND ST `stk`",
          params: "stk",
        },
        { regex: /90 ([0-7][0-9A-F])/, len: 2, rpn: "RCL rr", params: "reg" },
        // RCL 16  90 10  dec:16-99; hex:10-63
        // RCL 99  90 63
        { regex: /91 7([0-4])/, len: 2, rpn: "STO ST `stk`", params: "stk" }, //+
        {
          regex: /91 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "STO IND rr",
          params: "reg-128",
        }, //+
        {
          regex: /91 F([0-4])/,
          len: 2,
          rpn: "STO IND ST `stk`",
          params: "stk",
        },
        { regex: /91 ([0-7][0-9A-F])/, len: 2, rpn: "STO rr", params: "reg" },
        { regex: /92 7([0-4])/, len: 2, rpn: "STO+ ST `stk`", params: "stk" },
        {
          regex: /92 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "STO+ IND rr",
          params: "reg-128",
        },
        {
          regex: /92 F([0-4])/,
          len: 2,
          rpn: "STO+ IND ST `stk`",
          params: "stk",
        },
        { regex: /92 ([0-7][0-9A-F])/, len: 2, rpn: "STO+ rr", params: "reg" },
        { regex: /93 7([0-4])/, len: 2, rpn: "STO- ST `stk`", params: "stk" },
        {
          regex: /93 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "STO- IND rr",
          params: "reg-128",
        },
        {
          regex: /93 F([0-4])/,
          len: 2,
          rpn: "STO- IND ST `stk`",
          params: "stk",
        },
        { regex: /93 ([0-7][0-9A-F])/, len: 2, rpn: "STO- rr", params: "reg" }, //+
        { regex: /94 7([0-4])/, len: 2, rpn: "STO× ST `stk`", params: "stk" },
        {
          regex: /94 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "STO× IND rr",
          params: "reg-128",
        },
        {
          regex: /94 F([0-4])/,
          len: 2,
          rpn: "STO× IND ST `stk`",
          params: "stk",
        },
        { regex: /94 ([0-7][0-9A-F])/, len: 2, rpn: "STO× rr", params: "reg" },
        { regex: /95 7([0-4])/, len: 2, rpn: "STO÷ ST `stk`", params: "stk" },
        {
          regex: /95 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "STO÷ IND rr",
          params: "reg-128",
        },
        {
          regex: /95 F([0-4])/,
          len: 2,
          rpn: "STO÷ IND ST `stk`",
          params: "stk",
        },
        { regex: /95 ([0-7][0-9A-F])/, len: 2, rpn: "STO÷ rr", params: "reg" },
        { regex: /96 7([0-4])/, len: 2, rpn: "ISG ST `stk`", params: "stk" }, //+
        {
          regex: /96 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "ISG IND rr",
          params: "reg-128",
        }, //+
        {
          regex: /96 F([0-4])/,
          len: 2,
          rpn: "ISG IND ST `stk`",
          params: "stk",
        },
        { regex: /96 ([0-7][0-9A-F])/, len: 2, rpn: "ISG rr", params: "reg" }, //+
        { regex: /97 7([0-4])/, len: 2, rpn: "DSE ST `stk`", params: "stk" },
        {
          regex: /97 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "DSE IND rr",
          params: "reg-128",
        },
        {
          regex: /97 F([0-4])/,
          len: 2,
          rpn: "DSE IND ST `stk`",
          params: "stk",
        },
        { regex: /97 ([0-7][0-9A-F])/, len: 2, rpn: "DSE rr", params: "reg" }, //+
        { regex: /98 7([0-4])/, len: 2, rpn: "VIEW ST `stk`", params: "stk" },
        {
          regex: /98 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "VIEW IND rr",
          params: "reg-128",
        },
        {
          regex: /98 F([0-4])/,
          len: 2,
          rpn: "VIEW IND ST `stk`",
          params: "stk",
        },
        { regex: /98 ([0-7][0-9A-F])/, len: 2, rpn: "VIEW rr", params: "reg" },
        {
          regex: /99 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "ΣREG IND rr",
          params: "reg-128",
        },
        {
          regex: /99 F([0-4])/,
          len: 2,
          rpn: "ΣREG IND ST `stk`",
          params: "stk",
        },
        { regex: /99 ([0-7][0-9A-F])/, len: 2, rpn: "ΣREG rr", params: "reg" },
        { regex: /9A 7([0-4])/, len: 2, rpn: "ASTO ST `stk`", params: "stk" },
        {
          regex: /9A ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "ASTO IND rr",
          params: "reg-128",
        },
        {
          regex: /9A F([0-4])/,
          len: 2,
          rpn: "ASTO IND ST `stk`",
          params: "stk",
        },
        { regex: /9A ([0-7][0-9A-F])/, len: 2, rpn: "ASTO rr", params: "reg" },
        { regex: /9B 7([0-4])/, len: 2, rpn: "ARCL ST `stk`", params: "stk" },
        {
          regex: /9B ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "ARCL IND rr",
          params: "reg-128",
        },
        {
          regex: /9B F([0-4])/,
          len: 2,
          rpn: "ARCL IND ST `stk`",
          params: "stk",
        },
        { regex: /9B ([0-7][0-9A-F])/, len: 2, rpn: "ARCL rr", params: "reg" }, //+
        {
          regex: /9C ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "FIX IND rr",
          params: "reg-128",
        },
        {
          regex: /9C F([0-4])/,
          len: 2,
          rpn: "FIX IND ST `stk`",
          params: "stk",
        },
        { regex: /9C (0[0-9])/, len: 2, rpn: "FIX sd", params: "dig" },
        {
          regex: /9D ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "SCI IND rr",
          params: "reg-128",
        },
        {
          regex: /9D F([0-4])/,
          len: 2,
          rpn: "SCI IND ST `stk`",
          params: "stk",
        },
        { regex: /9D (0[0-9])/, len: 2, rpn: "SCI sd", params: "dig" },
        {
          regex: /9E ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "ENG IND rr",
          params: "reg-128",
        },
        {
          regex: /9E F([0-4])/,
          len: 2,
          rpn: "ENG IND ST `stk`",
          params: "stk",
        },
        { regex: /9E (0[0-9])/, len: 2, rpn: "ENG sd", params: "dig" },
        {
          regex: /9F ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "TONE IND rr",
          params: "reg-128",
        },
        {
          regex: /9F F([0-4])/,
          len: 2,
          rpn: "TONE IND ST `stk`",
          params: "stk",
        },
        { regex: /9F (0[0-9])/, len: 2, rpn: "TONE tn", params: "ton" }, //+
      ],
    },
    {
      key: "A",
      value: [
        { regex: /A0 61/, len: 2, rpn: "SINH" },
        { regex: /A0 62/, len: 2, rpn: "COSH" },
        { regex: /A0 63/, len: 2, rpn: "TANH" },
        { regex: /A0 64/, len: 2, rpn: "ASINH" },
        { regex: /A0 65/, len: 2, rpn: "ATANH" },
        { regex: /A0 66/, len: 2, rpn: "ACOSH" },
        { regex: /A0 6F/, len: 2, rpn: "COMB" },
        { regex: /A0 70/, len: 2, rpn: "PERM" },
        { regex: /A0 71/, len: 2, rpn: "RAN" },
        { regex: /A0 72/, len: 2, rpn: "COMPLEX" }, //+
        { regex: /A0 73/, len: 2, rpn: "SEED" },
        { regex: /A0 74/, len: 2, rpn: "GAMMA" },
        { regex: /A0 9F/, len: 2, rpn: "BEST" },
        { regex: /A0 A0/, len: 2, rpn: "EXPF" },
        { regex: /A0 A1/, len: 2, rpn: "LINF" },
        { regex: /A0 A2/, len: 2, rpn: "LOGF" },
        { regex: /A0 A3/, len: 2, rpn: "PWRF" },
        { regex: /A0 A4/, len: 2, rpn: "SLOPE" },
        { regex: /A0 A5/, len: 2, rpn: "SUM" },
        { regex: /A0 A6/, len: 2, rpn: "YINT" },
        { regex: /A0 A7/, len: 2, rpn: "CORR" },
        { regex: /A0 A8/, len: 2, rpn: "FCSTX" },
        { regex: /A0 A9/, len: 2, rpn: "FCSTY" },
        { regex: /A0 AA/, len: 2, rpn: "INSR" }, //+
        { regex: /A0 AB/, len: 2, rpn: "DELR" },
        { regex: /A0 AC/, len: 2, rpn: "WMEAN" },
        { regex: /A0 AD/, len: 2, rpn: "LINΣ" },
        { regex: /A0 AE/, len: 2, rpn: "ALLΣ" },
        { regex: /A0 E2/, len: 2, rpn: "HEXM" },
        { regex: /A0 E3/, len: 2, rpn: "DECM" },
        { regex: /A0 E4/, len: 2, rpn: "OCTM" },
        { regex: /A0 E5/, len: 2, rpn: "BINM" },
        { regex: /A0 E6/, len: 2, rpn: "BASE+" },
        { regex: /A0 E7/, len: 2, rpn: "BASE-" }, //+
        { regex: /A0 E8/, len: 2, rpn: "BASE×" },
        { regex: /A0 E9/, len: 2, rpn: "BASE÷" },
        { regex: /A0 EA/, len: 2, rpn: "BASE±" },
        { regex: /A2 59/, len: 2, rpn: "POLAR" },
        { regex: /A2 5A/, len: 2, rpn: "RECT" }, //+
        { regex: /A2 5B/, len: 2, rpn: "RDX." },
        { regex: /A2 5C/, len: 2, rpn: "RDX," },
        { regex: /A2 5D/, len: 2, rpn: "ALL" }, //+
        { regex: /A2 5E/, len: 2, rpn: "MENU" }, //+
        { regex: /A2 5F/, len: 2, rpn: "X≥0?" },
        { regex: /A2 60/, len: 2, rpn: "X≥Y?" }, //+
        { regex: /A2 62/, len: 2, rpn: "CLKEYS" },
        { regex: /A2 63/, len: 2, rpn: "KEYASN" },
        { regex: /A2 64/, len: 2, rpn: "LCLBL" },
        { regex: /A2 65/, len: 2, rpn: "REAL?" },
        { regex: /A2 66/, len: 2, rpn: "MAT?" },
        { regex: /A2 67/, len: 2, rpn: "CPX?" },
        { regex: /A2 68/, len: 2, rpn: "STR?" },
        { regex: /A2 6A/, len: 2, rpn: "CPXRES" },
        { regex: /A2 6B/, len: 2, rpn: "REALRES" },
        { regex: /A2 6C/, len: 2, rpn: "EXITALL" }, //+
        { regex: /A2 6D/, len: 2, rpn: "CLMENU" }, //+
        { regex: /A2 6E/, len: 2, rpn: "GETKEY" },
        { regex: /A2 6F/, len: 2, rpn: "CUSTOM" },
        { regex: /A2 70/, len: 2, rpn: "ON" },
        { regex: /A5 87/, len: 2, rpn: "NOT" },
        { regex: /A5 88/, len: 2, rpn: "AND" },
        { regex: /A5 89/, len: 2, rpn: "OR" },
        { regex: /A5 8A/, len: 2, rpn: "XOR" },
        { regex: /A5 8B/, len: 2, rpn: "ROTXY" },
        { regex: /A5 8C/, len: 2, rpn: "BIT?" },
        { regex: /A6 31/, len: 2, rpn: "AIP" }, //+
        { regex: /A6 41/, len: 2, rpn: "ALENG" },
        { regex: /A6 42/, len: 2, rpn: "ANUM" },
        { regex: /A6 46/, len: 2, rpn: "AROT" },
        { regex: /A6 47/, len: 2, rpn: "ATOX" },
        { regex: /A6 5C/, len: 2, rpn: "POSA" },
        { regex: /A6 60/, len: 2, rpn: "RCLFLAG" },
        { regex: /A6 6D/, len: 2, rpn: "STOFLAG" },
        { regex: /A6 6E/, len: 2, rpn: "X<>F" },
        { regex: /A6 6F/, len: 2, rpn: "XTOA" },
        { regex: /A6 78/, len: 2, rpn: "ΣREG?" },
        { regex: /A6 81/, len: 2, rpn: "ADATE" },
        { regex: /A6 84/, len: 2, rpn: "ATIME" },
        { regex: /A6 85/, len: 2, rpn: "ATIME24" },
        { regex: /A6 86/, len: 2, rpn: "CLK12" },
        { regex: /A6 87/, len: 2, rpn: "CLK24" },
        { regex: /A6 8C/, len: 2, rpn: "DATE" },
        { regex: /A6 8D/, len: 2, rpn: "DATE+" },
        { regex: /A6 8E/, len: 2, rpn: "DDAYS" },
        { regex: /A6 8F/, len: 2, rpn: "DMY" },
        { regex: /A6 90/, len: 2, rpn: "DOW" },
        { regex: /A6 91/, len: 2, rpn: "MDY" },
        { regex: /A6 9C/, len: 2, rpn: "TIME" },
        { regex: /A6 C9/, len: 2, rpn: "TRANS" },
        { regex: /A6 CA/, len: 2, rpn: "CROSS" },
        { regex: /A6 CB/, len: 2, rpn: "DOT" },
        { regex: /A6 CC/, len: 2, rpn: "DET" },
        { regex: /A6 CD/, len: 2, rpn: "UVEC" },
        { regex: /A6 CE/, len: 2, rpn: "INVRT" },
        { regex: /A6 CF/, len: 2, rpn: "FNRM" },
        { regex: /A6 D0/, len: 2, rpn: "RSUM" },
        { regex: /A6 D1/, len: 2, rpn: "R<>R" },
        { regex: /A6 D2/, len: 2, rpn: "I+" },
        { regex: /A6 D3/, len: 2, rpn: "I-" },
        { regex: /A6 D4/, len: 2, rpn: "J+" }, //+
        { regex: /A6 D5/, len: 2, rpn: "J-" },
        { regex: /A6 D6/, len: 2, rpn: "STOEL" },
        { regex: /A6 D7/, len: 2, rpn: "RCLEL" }, //+
        { regex: /A6 D8/, len: 2, rpn: "STOIJ" },
        { regex: /A6 D9/, len: 2, rpn: "RCLIJ" },
        { regex: /A6 DA/, len: 2, rpn: "NEWMAT" }, //+
        { regex: /A6 DB/, len: 2, rpn: "OLD" },
        { regex: /A6 DC/, len: 2, rpn: "←" },
        { regex: /A6 DD/, len: 2, rpn: "→" }, //+
        { regex: /A6 DE/, len: 2, rpn: "↑" },
        { regex: /A6 DF/, len: 2, rpn: "↓" },
        { regex: /A6 E1/, len: 2, rpn: "EDIT" },
        { regex: /A6 E2/, len: 2, rpn: "WRAP" }, //+
        { regex: /A6 E3/, len: 2, rpn: "GROW" }, //+
        { regex: /A6 E7/, len: 2, rpn: "DIM?" },
        { regex: /A6 E8/, len: 2, rpn: "GETM" },
        { regex: /A6 E9/, len: 2, rpn: "PUTM" },
        { regex: /A6 EA/, len: 2, rpn: "[MIN]" },
        { regex: /A6 EB/, len: 2, rpn: "[MAX]" },
        { regex: /A6 EC/, len: 2, rpn: "[FIND]" },
        { regex: /A6 ED/, len: 2, rpn: "RNRM" },
        { regex: /A7 48/, len: 2, rpn: "PRA" },
        { regex: /A7 52/, len: 2, rpn: "PRΣ" },
        { regex: /A7 53/, len: 2, rpn: "PRSTK" },
        { regex: /A7 54/, len: 2, rpn: "PRX" },
        { regex: /A7 5B/, len: 2, rpn: "MAN" },
        { regex: /A7 5C/, len: 2, rpn: "NORM" },
        { regex: /A7 5D/, len: 2, rpn: "TRACE" },
        { regex: /A7 5E/, len: 2, rpn: "PRON" },
        { regex: /A7 5F/, len: 2, rpn: "PROFF" },
        { regex: /A7 60/, len: 2, rpn: "DELAY" },
        { regex: /A7 61/, len: 2, rpn: "PRUSR" },
        { regex: /A7 62/, len: 2, rpn: "PRLCD" },
        { regex: /A7 63/, len: 2, rpn: "CLLCD" },
        { regex: /A7 64/, len: 2, rpn: "AGRAPH" },
        { regex: /A7 65/, len: 2, rpn: "PIXEL" },
        { regex: /A7 CF/, len: 2, rpn: "ACCEL" },
        { regex: /A7 D0/, len: 2, rpn: "LOCAT" },
        { regex: /A7 D1/, len: 2, rpn: "HEADING" },
        { regex: /A7 D3/, len: 2, rpn: "WSIZE" },
        { regex: /A7 D4/, len: 2, rpn: "WSIZE?" },
        { regex: /A7 D5/, len: 2, rpn: "YMD" },
        { regex: /A7 D6/, len: 2, rpn: "BSIGNED" },
        { regex: /A7 D7/, len: 2, rpn: "BWRAP" },
        { regex: /A7 D8/, len: 2, rpn: "BRESET" },
        { regex: /A7 D9/, len: 2, rpn: "GETKEY1" },
        { regex: /A7 DA/, len: 2, rpn: "FMA" },
        { regex: /A7 DE/, len: 2, rpn: "RTNYES" },
        { regex: /A7 DF/, len: 2, rpn: "RTNNO" },
        { regex: /A7 E1/, len: 2, rpn: "STRACE" },
        { regex: /A7 E8/, len: 2, rpn: "PGMMENU" },
        {
          regex: /A8 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "SF IND rr",
          params: "reg-128",
        },
        { regex: /A8 F([0-4])/, len: 2, rpn: "SF IND ST `stk`", params: "stk" },
        { regex: /A8 ([0-7][0-9A-F])/, len: 2, rpn: "SF fl", params: "flg" }, //+ flags dec:00-99 hex:00-63
        {
          regex: /A9 ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "CF IND rr",
          params: "reg-128",
        },
        { regex: /A9 F([0-4])/, len: 2, rpn: "CF IND ST `stk`", params: "stk" },
        { regex: /A9 ([0-7][0-9A-F])/, len: 2, rpn: "CF fl", params: "flg" },
        {
          regex: /AA ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "FS?C IND rr",
          params: "reg-128",
        },
        {
          regex: /AA F([0-4])/,
          len: 2,
          rpn: "FS?C IND ST `stk`",
          params: "stk",
        },
        { regex: /AA ([0-7][0-9A-F])/, len: 2, rpn: "FS?C fl", params: "flg" }, //+
        {
          regex: /AB ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "FC?C IND rr",
          params: "reg-128",
        },
        {
          regex: /AB F([0-4])/,
          len: 2,
          rpn: "FC?C IND ST `stk`",
          params: "stk",
        },
        { regex: /AB ([0-7][0-9A-F])/, len: 2, rpn: "FC?C fl", params: "flg" },
        {
          regex: /AC ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "FS? IND rr",
          params: "reg-128",
        },
        {
          regex: /AC F([0-4])/,
          len: 2,
          rpn: "FS? IND ST `stk`",
          params: "stk",
        },
        { regex: /AC ([0-7][0-9A-F])/, len: 2, rpn: "FS? fl", params: "flg" }, //+
        {
          regex: /AD ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "FC? IND rr",
          params: "reg-128",
        },
        {
          regex: /AD F([0-4])/,
          len: 2,
          rpn: "FC? IND ST `stk`",
          params: "stk",
        },
        { regex: /AD ([0-7][0-9A-F])/, len: 2, rpn: "FC? fl", params: "flg" }, //+
        {
          regex: /AE 7([0-4])/,
          len: 2,
          rpn: "GTO IND ST `stk`",
          params: "stk",
        },
        {
          regex: /AE ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "XEQ IND rr",
          params: "reg-128",
        },
        {
          regex: /AE F([0-4])/,
          len: 2,
          rpn: "XEQ IND ST `stk`",
          params: "stk",
        },
        {
          regex: /AE ([0-7][0-9A-F])/,
          len: 2,
          rpn: "GTO IND rr",
          params: "reg",
        },
      ],
    },
    {
      key: "B",
      value: [
        { regex: /B([1-9A-F]) 00/, len: 2, rpn: "GTO sl", params: "lblno-1" }, //+ dec: 01-14, l+1: 2-F
        // GTO 14  BF 00
      ],
    },
    {
      key: "C",
      value: [
        { regex: /C0 00 0D/, len: 3, rpn: "END" },
        {
          regex: /C0 00 F([1-9A-F]) 00/,
          len: 4,
          rpn: "LBL `lbl`",
          params: "lbll-1",
        }, //+
        { regex: /CE 7([0-4])/, len: 2, rpn: "X<> ST `stk`", params: "stk" },
        {
          regex: /CE ([89A-E][0-9A-F])/,
          len: 2,
          rpn: "X<> IND rr",
          params: "reg-128",
        },
        {
          regex: /CE F([0-4])/,
          len: 2,
          rpn: "X<> IND ST `stk`",
          params: "stk",
        },
        { regex: /CE ([0-6][0-9A-F])/, len: 2, rpn: "X<> rr", params: "reg" },
        { regex: /CF ([0-7][0-9A-F])/, len: 2, rpn: "LBL ll", params: "lblno" }, //+
        // LBL 99  CF 63 dec:16-99; hex:10-63
        // LBL A   CF 66
        // LBL J   CF 6F
        // LBL a   CF 7B
        // LBL e   CF 7F
      ],
    },
    {
      key: "D",
      value: [
        {
          regex: /D0 00 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "GTO ll",
          params: "lblno",
        }, //+
        // GTO 99  D0 00 63 dec:15-99 hex:0F-63
        // GTO A   D0 00 66
        // GTO J   D0 00 6F
        // GTO a   D0 00 7B
        // GTO e   D0 00 7F
      ],
    },

    {
      key: "E",
      value: [
        {
          regex: /E0 00 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "XEQ ll",
          params: "lblno",
        }, //+
        // XEQ 14  E0 00 0E dec:15-99 hex:0F-63
        // XEQ 99  E0 00 63
        // XEQ A   E0 00 66
        // XEQ J   E0 00 6F
        // XEQ a   E0 00 7B
        // XEQ e   E0 00 7F
      ],
    },

    {
      key: "F",
      value: [
        { regex: /F0/, len: 1, rpn: "NOP" },
        { regex: /F1 D5/, len: 2, rpn: "FIX 10" },
        { regex: /F1 D6/, len: 2, rpn: "SCI 10" },
        { regex: /F1 D7/, len: 2, rpn: "ENG 10" },
        { regex: /F1 E5/, len: 2, rpn: "FIX 11" },
        { regex: /F1 E6/, len: 2, rpn: "SCI 11" },
        { regex: /F1 E7/, len: 2, rpn: "ENG 11" },
        {
          regex: /F2 A0 0([1-8])/,
          len: 3,
          rpn: "RTNERR er",
          params: "err",
        },
        {
          regex: /F2 D0 7([0-4])/,
          len: 3,
          rpn: "INPUT ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D0 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "INPUT rr",
          params: "reg",
        },
        {
          regex: /F2 D1 7([0-4])/,
          len: 3,
          rpn: "RCL+ ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D1 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "RCL+ IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 D1 F([0-4])/,
          len: 3,
          rpn: "RCL+ IND ST `stk`",
          params: "stk",
        }, //+
        {
          regex: /F2 D1 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "RCL+ rr",
          params: "reg",
        },
        {
          regex: /F2 D2 7([0-4])/,
          len: 3,
          rpn: "RCL- ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D2 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "RCL- IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 D2 F([0-4])/,
          len: 3,
          rpn: "RCL- IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D2 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "RCL- rr",
          params: "reg",
        },
        {
          regex: /F2 D3 7([0-4])/,
          len: 3,
          rpn: "RCL× ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D3 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "RCL× IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 D3 F([0-4])/,
          len: 3,
          rpn: "RCL× IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D3 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "RCL× rr",
          params: "reg",
        },
        {
          regex: /F2 D4 7([0-4])/,
          len: 3,
          rpn: "RCL÷ ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D4 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "RCL÷ IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 D4 F([0-4])/,
          len: 3,
          rpn: "RCL÷ IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D4 ([0-7][0-9A-F])/,
          len: 3,
          rpn: "RCL÷ rr",
          params: "reg",
        },
        {
          regex: /F2 D8 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "CLV IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 D8 F([0-4])/,
          len: 3,
          rpn: "CLV IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 D9 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "PRV IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 D9 F([0-4])/,
          len: 3,
          rpn: "PRV IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 DA ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "INDEX IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 DA F([0-4])/,
          len: 3,
          rpn: "INDEX IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 E8 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "PGMINT IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 E8 F([0-4])/,
          len: 3,
          rpn: "PGMINT IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 E9 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "PGMSLV IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 E9 F([0-4])/,
          len: 3,
          rpn: "PGMSLV IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 EA ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "INTEG IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 EA F([0-4])/,
          len: 3,
          rpn: "INTEG IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 EB ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "SOLVE IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 EB F([0-4])/,
          len: 3,
          rpn: "SOLVE IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 EC ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "DIM IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 EC F([0-4])/,
          len: 3,
          rpn: "DIM IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 ED ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "LSTO IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 ED F([0-4])/,
          len: 3,
          rpn: "LSTO IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 EE ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "INPUT IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 EE F([0-4])/,
          len: 3,
          rpn: "INPUT IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 EF ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "EDITN IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 EF F([0-4])/,
          len: 3,
          rpn: "EDITN IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F2 F8 ([89A-E][0-9A-F])/,
          len: 3,
          rpn: "VARMENU IND rr",
          params: "reg-128",
        },
        {
          regex: /F2 F8 F([0-4])/,
          len: 3,
          rpn: "VARMENU IND ST `stk`",
          params: "stk",
        },
        {
          regex: /F3 E2 (0[1-9]) ([89A-E][0-9A-F])/,
          len: 4,
          rpn: "KEY `key` XEQ IND rr",
          params: "key,reg-128",
        },
        {
          regex: /F3 E2 (0[1-9]) F([0-4])/,
          len: 4,
          rpn: "KEY `key` XEQ IND ST `stk`",
          params: "key,stk",
        },
        {
          regex: /F3 E2 (0[1-9]) ([0-7][0-9A-F])/,
          len: 4,
          rpn: "KEY `key` XEQ ll",
          params: "key,lblno",
        },
        {
          regex: /F3 E2 (0[1-9]) ([0-7][0-9A-F])/,
          len: 4,
          rpn: "KEY `key` XEQ sl",
          params: "key,lblno",
        },
        // ... XEQ 99  ... 63 dec:16-99; hex:10-63
        // ... XEQ A   ... 66
        // ... XEQ J   ... 6F
        // ... XEQ a   ... 7B
        // ... XEQ e   ... 7F
        {
          regex: /F3 E3 (0[1-9]) ([89A-E][0-9A-F])/,
          len: 4,
          rpn: "KEY `key` GTO IND rr",
          params: "key,reg-128",
        },
        {
          regex: /F3 E3 (0[1-9]) F([0-4])/,
          len: 4,
          rpn: "KEY `key` GTO IND ST `stk`",
          params: "key,stk",
        },
        {
          regex: /F3 E3 (0[1-9]) ([0-7][0-9A-F])/,
          len: 4,
          rpn: "KEY `key` GTO ll",
          params: "key,lblno",
        },
        {
          regex: /F3 E3 (0[1-9]) ([0-7][0-9A-F])/,
          len: 4,
          rpn: "KEY `key` GTO sl",
          params: "key,lblno",
        },
        {
          regex: /F3 F7 ([0-9A-F][0-9A-F] [0-9A-F][0-9A-F])/,
          len: 4,
          rpn: "SIZE ss ss",
          params: "size",
        },
        { regex: /F([1-9A-F]) 7F/, len: 2, rpn: "⊢`str`", params: "strl-1" }, //+
        {
          regex: /F([1-9A-F]) 80/,
          len: 2,
          rpn: "VIEW `nam`",
          params: "naml-1",
        },
        { regex: /F([1-9A-F]) 81/, len: 2, rpn: "STO `nam`", params: "naml-1" }, //+
        {
          regex: /F([1-9A-F]) 82/,
          len: 2,
          rpn: "STO+ `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 83/,
          len: 2,
          rpn: "STO- `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 84/,
          len: 2,
          rpn: "STO× `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 85/,
          len: 2,
          rpn: "STO÷ `nam`",
          params: "naml-1",
        },
        { regex: /F([1-9A-F]) 86/, len: 2, rpn: "X<> `nam`", params: "naml-1" },
        {
          regex: /F([1-9A-F]) 87/,
          len: 2,
          rpn: "INDEX `nam`",
          params: "naml-1",
        }, //+
        {
          regex: /F([1-9A-F]) 88/,
          len: 2,
          rpn: "VIEW IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 89/,
          len: 2,
          rpn: "STO IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 8A/,
          len: 2,
          rpn: "STO+ IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 8B/,
          len: 2,
          rpn: "STO- IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 8C/,
          len: 2,
          rpn: "STO× IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 8D/,
          len: 2,
          rpn: "STO÷ IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 8E/,
          len: 2,
          rpn: "X<> IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 8F/,
          len: 2,
          rpn: "INDEX IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 90/,
          len: 2,
          rpn: "MVAR `nam`",
          params: "naml-1",
        },
        { regex: /F([1-9A-F]) 91/, len: 2, rpn: "RCL `nam`", params: "naml-1" }, //+
        {
          regex: /F([1-9A-F]) 92/,
          len: 2,
          rpn: "RCL+ `nam`",
          params: "naml-1",
        }, //+
        {
          regex: /F([1-9A-F]) 93/,
          len: 2,
          rpn: "RCL- `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 94/,
          len: 2,
          rpn: "RCL× `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 95/,
          len: 2,
          rpn: "RCL÷ `nam`",
          params: "naml-1",
        },
        { regex: /F([1-9A-F]) 96/, len: 2, rpn: "ISG `nam`", params: "naml-1" }, //+
        { regex: /F([1-9A-F]) 97/, len: 2, rpn: "DSE `nam`", params: "naml-1" },
        {
          regex: /F([1-9A-F]) 99/,
          len: 2,
          rpn: "RCL IND `nam`",
          params: "naml-1",
        }, //+
        {
          regex: /F([1-9A-F]) 9A/,
          len: 2,
          rpn: "RCL+ IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 9B/,
          len: 2,
          rpn: "RCL- IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 9C/,
          len: 2,
          rpn: "RCL× IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 9D/,
          len: 2,
          rpn: "RCL÷ IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 9E/,
          len: 2,
          rpn: "ISG IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) 9F/,
          len: 2,
          rpn: "DSE IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) A8/,
          len: 2,
          rpn: "SF IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) A9/,
          len: 2,
          rpn: "CF IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) AA/,
          len: 2,
          rpn: "FS?C IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) AB/,
          len: 2,
          rpn: "FC?C IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) AC/,
          len: 2,
          rpn: "FS? IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) AD/,
          len: 2,
          rpn: "FC? IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) AE/,
          len: 2,
          rpn: "GTO IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) AF/,
          len: 2,
          rpn: "XEQ IND `nam`",
          params: "naml-1",
        },
        { regex: /F([1-9A-F]) B0/, len: 2, rpn: "CLV `nam`", params: "naml-1" }, //+
        { regex: /F([1-9A-F]) B1/, len: 2, rpn: "PRV `nam`", params: "naml-1" },
        {
          regex: /F([1-9A-F]) B2/,
          len: 2,
          rpn: "ASTO `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) B3/,
          len: 2,
          rpn: "ARCL `nam`",
          params: "naml-1",
        }, //+
        {
          regex: /F([1-9A-F]) B4/,
          len: 2,
          rpn: "PGMINT `lbl`",
          params: "lbll-1",
        },
        {
          regex: /F([1-9A-F]) B5/,
          len: 2,
          rpn: "PGMSLV `lbl`",
          params: "lbll-1",
        },
        {
          regex: /F([1-9A-F]) B6/,
          len: 2,
          rpn: "INTEG `lbl`",
          params: "lbll-1",
        },
        {
          regex: /F([1-9A-F]) B7/,
          len: 2,
          rpn: "SOLVE `lbl`",
          params: "lbll-1",
        },
        {
          regex: /F([1-9A-F]) B8/,
          len: 2,
          rpn: "CLV IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) B9/,
          len: 2,
          rpn: "PRV IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) BA/,
          len: 2,
          rpn: "ASTO IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) BB/,
          len: 2,
          rpn: "ARCL IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) BC/,
          len: 2,
          rpn: "PGMINT IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) BD/,
          len: 2,
          rpn: "PGMSLV IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) BE/,
          len: 2,
          rpn: "INTEG IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) BF/,
          len: 2,
          rpn: "SOLVE IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) C0/,
          len: 2,
          rpn: "ASSIGN `nam` TO `key`",
          params: "naml-2,+key+1",
        }, //
        {
          regex: /F([1-9A-F]) C1/,
          len: 2,
          rpn: "VARMENU `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) C2 (0[1-9])/,
          len: 3,
          rpn: "KEY `key` XEQ `lbl`",
          params: "lbll-2,key",
        }, //+
        {
          regex: /F([1-9A-F]) C3 (0[1-9])/,
          len: 3,
          rpn: "KEY `key` GTO `lbl`",
          params: "lbll-2,key",
        },
        { regex: /F([1-9A-F]) C4/, len: 2, rpn: "DIM `nam`", params: "naml-1" }, //+
        {
          regex: /F([1-9A-F]) C5/,
          len: 2,
          rpn: "INPUT `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) C6/,
          len: 2,
          rpn: "EDITN `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) C7/,
          len: 2,
          rpn: "LSTO `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) C9/,
          len: 2,
          rpn: "VARMENU IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) CA (0[1-9])/,
          len: 3,
          rpn: "KEY `key` XEQ IND `nam`",
          params: "naml-2,key",
        },
        {
          regex: /F([1-9A-F]) CB (0[1-9])/,
          len: 3,
          rpn: "KEY `key` GTO IND `nam`",
          params: "naml-2,key",
        },
        {
          regex: /F([1-9A-F]) CC/,
          len: 2,
          rpn: "DIM IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) CD/,
          len: 2,
          rpn: "INPUT IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) CE/,
          len: 2,
          rpn: "EDITN IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) CF/,
          len: 2,
          rpn: "LSTO IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) DB/,
          len: 2,
          rpn: "ΣREG IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) DC/,
          len: 2,
          rpn: "FIX IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) DD/,
          len: 2,
          rpn: "SCI IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) DE/,
          len: 2,
          rpn: "ENG IND `nam`",
          params: "naml-1",
        },
        {
          regex: /F([1-9A-F]) DF/,
          len: 2,
          rpn: "TONE IND `nam`",
          params: "naml-1",
        },
        { regex: /F([1-9A-F]) F0/, len: 2, rpn: "CLP `lbl`", params: "lbll-1" },
        { regex: /F([1-9A-F])/, len: 1, rpn: "`str`", params: "strl" }, //+ max. length 15
      ],
    },
  ];

  // #endregion
}
