import * as vscode from "vscode";

import { CodeError } from "../common/codeerror";
import { Configuration } from "../common/configuration";
import { EncoderFOCAL } from "./encoderfocal";
import { RawProgram } from "./rawprogram";
import { RawLine } from "./rawline";

/** Command parser for a code line */
export class RpnParser {
  debug = 1; // debug level 0=nothing, 1=minimal, 2=verbose

  programs: RawProgram[] = [];
  document?: vscode.TextDocument;

  lastError?: string;
  error?: CodeError;
  config?: Configuration;

  // parsed
  ignored: boolean = false;

  // line numbers
  prgmLineNo: number = 0; // by parser auto incremented number

  constructor() {}

  private reset() {
    this.lastError = undefined;
    this.error = undefined;
  }

  parse() {
    if (this.document) {
      let docLineCount = this.document.lineCount;
      let program: RawProgram | undefined;

      for (let docLineIndex = 0; docLineIndex < docLineCount; docLineIndex++) {
        let line = this.document.lineAt(docLineIndex);
        let lineText = line.text;

        //{ ... }-line detected -> Prgm Start
        let match = line.text.match(/\{.*\}/);
        if (match) {
          program = new RawProgram(docLineIndex);
          this.programs.push(program);
        }

        if (program) {
          let rawLine = this.parseLine(docLineIndex, lineText);

          // no parser error ...
          if (rawLine.error === undefined) {
            if (this.debug > 1) {
              console.log("-> " + rawLine.normCode);
            }

            if (!rawLine.ignored) {
              program.addLine(rawLine);
            }
          } else {
            // parse error
            program.addLine(rawLine);
          }
        }
      }
    }
  }

  parseLine(docLineIndex: number, line: string): RawLine {
    let progErrorText: string | undefined;
    let rawLine = new RawLine();

    this.reset();

    //save original code
    rawLine.code = line;
    rawLine.normCode = line;

    if (this.ignoredLine(line)) {
      rawLine.ignored = true;

      // reset line number when {} header line
      if (this.config && this.config.useLineNumbers) {
        switch (true) {
          // code line is { n-Byte Prgm }
          case /^00 {.*\}/.test(line):
            this.prgmLineNo = 0;
            break;

          default:
          //nothing
        }
      }
    } else {
      // increment
      this.prgmLineNo++;

      // read codeLineNo from code line
      if (this.config && this.config.useLineNumbers) {
        let match = line.match(/(^\d+)(▸|▶|>|\s+)/);
        if (match) {
          rawLine.codeLineNo = parseInt(match[1]);
        }
      }

      //#region prepare line

      rawLine.normCode = this.formatLine(rawLine.normCode);

      // alpha in `str`
      this.replaceString(rawLine);

      // key number in `key`
      this.replaceKey(rawLine);

      // global labels in `lbl`
      this.replaceGlobalLabel(rawLine);

      // local char labels
      this.replaceLocalCharLabel(rawLine);

      // variables in `nam`
      this.replaceName(rawLine);

      // custom in `csk`
      this.replaceCustomKey(rawLine);

      // tone in tn
      this.replaceTone(rawLine);

      // stack in `stk`
      this.replaceStack(rawLine);

      // flag in rr
      this.replaceFlag(rawLine);

      // number in `num`/local labels in `sl|ll`/number in sr/rr/sd/10/11
      this.replaceNumber(rawLine);

      //#endregion

      //#region Checks ...

      if (this.config && this.config.useLineNumbers && this.prgmLineNo !== rawLine.codeLineNo) {
        progErrorText = "line number not correct: " + this.prgmLineNo + "!==" + rawLine.codeLineNo;
      }

      if (rawLine.params.str && progErrorText === undefined) {
        progErrorText = this.checkString(rawLine.params.str);
      }
      if (rawLine.params.nam && progErrorText === undefined) {
        progErrorText = this.checkName(rawLine.params.nam);
      }
      if (rawLine.params.key && progErrorText === undefined) {
        progErrorText = this.checkKey(rawLine.params.key);
      }
      if (rawLine.params.csk && progErrorText === undefined) {
        progErrorText = this.checkCustomKey(rawLine.params.csk);
      }
      if (rawLine.params.ton && progErrorText === undefined) {
        progErrorText = this.checkTone(rawLine.params.ton);
      }
      if (rawLine.params.flg && progErrorText === undefined) {
        progErrorText = this.checkFlag(rawLine.params.flg);
      }
      if (rawLine.params.lbl && progErrorText === undefined) {
        progErrorText = this.checkGlobalLabel(rawLine.params.lbl);
      }
      if (rawLine.params.clb && progErrorText === undefined) {
        progErrorText = this.checkLocalCharLabel(rawLine.params.clb);
      }

      //#endregion
    }

    if (progErrorText) {
      rawLine.error = new CodeError(docLineIndex, this.config && this.config.useLineNumbers ? this.prgmLineNo : -1, rawLine.code, String(progErrorText));
    }

    return rawLine;
  }

  //#region Line prepare

  /** check if line can be ignored */
  private ignoredLine(line: string): boolean {
    // ignore blank lines, length === 0
    // ignore { 33-Byte Prgm }...
    // ignore comments (#|//)
    line = line.trim();
    const ignored = line.length === 0 || line.match(/\{.*\}/) !== null || line.match(/^\s*(#|@|\/\/)/) !== null;
    return ignored;
  }

  /** Prepare line */
  private formatLine(line: string): string {
    // Remove leading line numbers 01▸LBL "AA" or 07 SIN
    line = line.replace(/^\d+(▸|▶|>|\s+)/, "");

    // Comment //|@|#...
    let match = line.match(/"/);
    if (match) {
      line = line.replace(/(".*")\s*(\/\/|@|#).*$/, "$1");
    } else {
      line = line.replace(/(\/\/|@|#).*$/, "");

      // Replace too long spaces (?<!".*)\s{2,} , but not in strings
      //let regex = new RegExp(/\s{2,}/, "g");
      line = line.replace(/\s{2,}/g, " ");
    }

    // Trim spaces
    line = line.trim();

    return line;
  }

  //#endregion

  //#region Replace ...

  /** Replace a string with `str` */
  private replaceString(rawLine: RawLine) {
    let str: string | undefined;
    // ⊢ or |- or ├
    let match = rawLine.normCode.match(/^\s*(⊢|\|-|├|)(".*")/);
    if (match) {
      str = this.removeDoubleQuotes(match[2]);
      rawLine.normCode = rawLine.normCode.replace(/^\s*(⊢|\|-|├|)"(.*)"/, "$1`str`");
    }

    // replace all occurences of focal character
    if (str && str.match(/(÷|×|√|∫|░|Σ|▶|π|¿|≤|\[LF\]|≥|≠|↵|↓|→|←|µ|μ|£|₤|°|Å|Ñ|Ä|∡|ᴇ|Æ|…|␛|Ö|Ü|▒|■|•|\\\\|↑)/)) {
      EncoderFOCAL.charMap.forEach((value, key) => {
        const regex = new RegExp(key, "g");
        if (str) {
          str = str.replace(regex, String.fromCharCode(value));
        }
      });
    }
    rawLine.params.str = str;
  }

  /** Replace key number with `key` */
  private replaceKey(rawLine: RawLine) {
    let key: string | undefined;
    let match = rawLine.normCode.match(/KEY\s+(\d+)/);
    if (match) {
      key = match[1];
      rawLine.normCode = rawLine.normCode.replace(/KEY\s+\d+/, "KEY `key`");
    }

    rawLine.params.key = key;
  }

  /** Replace global label */
  private replaceGlobalLabel(rawLine: RawLine) {
    //Global labels: string with max. 7 characters
    //               unique to calculator
    let lbl: string | undefined = undefined;
    let match = rawLine.normCode.match(/(LBL|GTO|XEQ|CLP|INTEG|PGMSLV|PGMINT|SOLVE)\s+(".{1,7}")/);
    if (match) {
      lbl = this.removeDoubleQuotes(match[2]);
      rawLine.normCode = rawLine.normCode.replace(/(LBL|GTO|XEQ|CLP|INTEG|PGMSLV|PGMINT|SOLVE)\s+".{1,7}"/, "$1 `lbl`");
    }

    rawLine.params.lbl = lbl;
  }

  /** Replace a variable with `nam` */
  private replaceName(rawLine: RawLine) {
    let nam: string | undefined;
    let match = rawLine.normCode.match(/".*"/);
    if (match) {
      nam = this.removeDoubleQuotes(match[0]);
      rawLine.normCode = rawLine.normCode.replace(/".*"/, "`nam`");
    }

    rawLine.params.nam = nam;
  }

  /** Replace stack with `stk` */
  private replaceStack(rawLine: RawLine) {
    let stk: string | undefined;
    let match = rawLine.normCode.match(/\s+ST\s+([LXYZT])/);
    if (match) {
      stk = match[1];
      rawLine.normCode = rawLine.normCode.replace(/\s+ST\s+([LXYZT])/, " ST `stk`");
    }

    rawLine.params.stk = stk;
  }

  /** Replace tone with `tn` */
  private replaceTone(rawLine: RawLine) {
    let ton: string | undefined;
    let match = rawLine.normCode.match(/TONE\s+(\d+)\b/);
    if (match) {
      ton = match[1];
      rawLine.normCode = rawLine.normCode.replace(/TONE\s+(\d+)\b/, "TONE tn");
    }

    rawLine.params.ton = ton;
  }

  /** Replace CUSTOM key */
  private replaceCustomKey(rawLine: RawLine) {
    // others use 01-18 -> csk hex:00-11
    let csk: string | undefined;
    let match = rawLine.normCode.match(/\bTO\s+(\d+)/);
    if (match) {
      let int = parseInt(match[1]) - 1;
      csk = String(int);
      rawLine.normCode = rawLine.normCode.replace(/\bTO\s+(\d+)/, "TO `csk`");
    }

    rawLine.params.csk = csk;
  }

  /** Replace local char label
   * A-J, a-e
   */
  private replaceLocalCharLabel(rawLine: RawLine) {
    let num: string | undefined;
    let lbl: string | undefined;
    let int: number = 0;
    let match: RegExpMatchArray | null;

    switch (true) {
      // char labels A-J
      case /(LBL|GTO|XEQ)\s+\b(A|B|C|D|E|F|G|H|I|J)\b/.test(rawLine.normCode):
        match = rawLine.normCode.match(/(LBL|GTO|XEQ)\s+\b(A|B|C|D|E|F|G|H|I|J)\b/);
        if (match) {
          lbl = match[2]; // A=102(0x66),B=107(0x67),...
          rawLine.normCode = rawLine.normCode.replace(/(LBL|GTO|XEQ)\s+\b(A|B|C|D|E|F|G|H|I|J)\b/, "$1 ll");
        }
        break;

      // char labels a-e
      case /(LBL|GTO|XEQ)\s+\b(a|b|c|d|e)\b/.test(rawLine.normCode):
        match = rawLine.normCode.match(/(LBL|GTO|XEQ)\s+\b(a|b|c|d|e)\b/);
        if (match) {
          lbl = match[2]; // a=123(0x7B),b=124(0x7C),...
          rawLine.normCode = rawLine.normCode.replace(/(LBL|GTO|XEQ)\s+\b(a|b|c|d|e)\b/, "$1 ll");
        }
        break;

      default:
        // nothing
        break;
    }

    // Label A-J,a-e to number, or local number label
    if (lbl) {
      if (lbl.match(/(A|B|C|D|E|F|G|H|I|J)/)) {
        // A=65+37=102(0x66),B=66+37=103(0x67),...
        int = lbl.charCodeAt(0) + 37;
        num = String(int);
      } else if (lbl.match(/(a|b|c|d|e)/)) {
        // a=97+26=123(0x7B),b=98+26=124(0x7C),...
        int = lbl.charCodeAt(0) + 26;
        num = String(int);
      } else {
        num = lbl;
      }
    }

    rawLine.params.clb = num;
  }

  /** Replace number */
  private replaceFlag(rawLine: RawLine) {
    let num: string | undefined;
    let match: RegExpMatchArray | null;

    switch (true) {
      case /(CF|SF|F[CS]\?|F[CS]\?C)\s+(\d+)/.test(rawLine.normCode):
        match = rawLine.normCode.match(/(CF|SF|F[CS]\?|F[CS]\?C)\s+(\d+)/);
        if (match) {
          num = match[2];
          rawLine.normCode = rawLine.normCode.replace(/(CF|SF|F[CS]\?|F[CS]\?C)\s+(\d+)/, "$1 rr");
        }
        break;

      default:
        // nothing
        break;
    }

    rawLine.params.flg = num;
  }

  /** Replace number */
  private replaceNumber(rawLine: RawLine) {
    let num: string | undefined;
    let int: number = 0;
    let match: RegExpMatchArray | null;

    switch (true) {
      // number label 00-14, 15-99
      case /(LBL|GTO|XEQ)\s+(\d{2})/.test(rawLine.normCode):
        match = rawLine.normCode.match(/(LBL|GTO|XEQ)\s+(\d{2})/);
        if (match) {
          num = match[2];

          // 00-14
          int = parseInt(num);
          if (this.inRange(int, 0, 14)) {
            rawLine.normCode = rawLine.normCode.replace(/(LBL|GTO|XEQ)\s+(\d{2})/, "$1 sl");
          }

          // 15-99
          if (this.inRange(int, 15, 99)) {
            rawLine.normCode = rawLine.normCode.replace(/(LBL|GTO|XEQ)\s+(\d{2})/, "$1 ll");
          }
        }
        break;

      case /^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/.test(rawLine.normCode):
        match = rawLine.normCode.match(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/);
        if (match) {
          num = match[0];
          rawLine.normCode = rawLine.normCode.replace(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/, "`num`");
        }
        break;

      case /\b(STO|RCL)\s+(\d{2})/.test(rawLine.normCode):
        // sr/rr only for STO/RCL
        match = rawLine.normCode.match(/\b(STO|RCL)\s+(\d{2})/);
        if (match) {
          num = match[2];
          int = parseInt(num);
          rawLine.normCode = rawLine.normCode.replace(/\b(STO|RCL)\s+(\d{2})/, "$1 " + (int < 16 ? "sr" : "rr"));
        }
        break;

      case /\b(STO|RCL)(\+|-|x|×|\/|÷)\s+(\d{2})/.test(rawLine.normCode):
        // sr/rr only for STO/RCL
        match = rawLine.normCode.match(/\b(STO|RCL)(\+|-|x|×|\/|÷)\s+(\d{2})/);
        if (match) {
          num = match[3];
          rawLine.normCode = rawLine.normCode.replace(/\b(STO|RCL)(\+|-|x|×|\/|÷)\s+(\d{2})/, "$1$2 rr");
        }
        break;

      case /(ENG|FIX|SCI)\s+IND\s+(\d{2})/.test(rawLine.normCode):
        // sr/rr only for STO/RCL
        match = rawLine.normCode.match(/(ENG|FIX|SCI)\s+IND\s+(\d{2})/);
        if (match) {
          num = match[2];
          rawLine.normCode = rawLine.normCode.replace(/(ENG|FIX|SCI)\s+IND\s+(\d{2})/, "$1 IND rr");
        }
        break;

      case /(ENG|FIX|SCI)\s+(\d{2})/.test(rawLine.normCode):
        // sr/rr only for STO/RCL
        match = rawLine.normCode.match(/(ENG|FIX|SCI)\s+(\d{2})/);
        if (match) {
          num = match[2];
          int = parseInt(num);
          rawLine.normCode = rawLine.normCode.replace(/(ENG|FIX|SCI)\s+(\d{2})/, "$1 " + (int < 10 ? "sd" : "$2"));
        }
        break;

      case /X<>\s+\d{2}/.test(rawLine.normCode):
        match = rawLine.normCode.match(/X<>\s+(\d{2})/);
        if (match) {
          num = match[1];
          rawLine.normCode = rawLine.normCode.replace(/X<>\s+(\d{2})/, "X<> rr");
        }
        break;

      case /SIZE\s+\d{1,4}/.test(rawLine.normCode):
        match = rawLine.normCode.match(/SIZE\s+(\d{1,4})/);
        if (match) {
          num = match[1];
          rawLine.normCode = rawLine.normCode.replace(/SIZE\s+(\d{1,4})/, "SIZE rr");
        }
        break;

      case /(\w+)(\?|)(\s+IND|)\s+(\d{2})/.test(rawLine.normCode):
        // others use 00-99 -> rr
        match = rawLine.normCode.match(/(\w+)(\?|)(\s+IND|)\s+(\d{2})/);
        if (match) {
          num = match[4];
          rawLine.normCode = rawLine.normCode.replace(/(\w+)(\?|)(\s+IND|)\s+(\d{2})/, "$1$2$3 rr");
        }
        break;

      default:
        // nothing
        break;
    }

    rawLine.params.num = num;
  }

  /** Removes double quotes */
  private removeDoubleQuotes(str: string): string {
    if (str) {
      // too simple
      // str = str.replace(/"/g, '');
      // cut start and end
      str = str.substr(1, str.length - 2);
    }
    return str;
  }

  //#endregion

  //#region Checks ...

  private checkString(str: string | undefined): string | undefined {
    if (str !== undefined) {
      return this.inRange(str.length, 0, 15) ? undefined : "alpha too long";
    }
    return undefined;
  }

  private checkName(nam: string | undefined): string | undefined {
    if (nam !== undefined) {
      return this.inRange(nam.length, 1, 7) ? undefined : "name length unvalid";
    }
    return undefined;
  }

  /** Check length of global label */
  private checkKey(key: string | undefined): string | undefined {
    if (key !== undefined) {
      return this.inRange(parseInt(key), 1, 9) ? undefined : "key value invalid";
    }
    return undefined;
  }

  /** Check length of global label */
  private checkTone(ton: string | undefined): string | undefined {
    if (ton !== undefined) {
      return this.inRange(parseInt(ton), 1, 9) && ton.length === 1 ? undefined : "tone value invalid";
    }
    return undefined;
  }

  /** Check flag of global label */
  private checkFlag(flg: string | undefined): string | undefined {
    if (flg !== undefined) {
      return this.inRange(parseInt(flg), 0, 99) && flg.length === 2 ? undefined : "flag value invalid";
    }
    return undefined;
  }

  /** Check length of global label */
  private checkGlobalLabel(lbl: string | undefined): string | undefined {
    if (lbl !== undefined) {
      return this.inRange(lbl.length, 0, 7) ? undefined : "label length unvalid";
    }
    return undefined;
  }

  /** Check Local Char Label */
  private checkLocalCharLabel(clb: string | undefined): string | undefined {
    if (clb !== undefined) {
      let int = parseInt(clb);
      // A=102(0x66),B=107(0x67),...             -> 102-111
      // a=97+26=123(0x7B),b=98+26=124(0x7C),... -> 123-127
      return this.inRange(int, 102, 111) || this.inRange(int, 123, 127) ? undefined : "wrong label";
    }
    return undefined;
  }

  /** Check Custom Key */
  private checkCustomKey(csk: string | undefined): string | undefined {
    if (csk !== undefined) {
      let int = parseInt(csk);
      return this.inRange(int, 0, 17) ? undefined : "custom key out of range";
    }
    return undefined;
  }

  /** Check in range min <= x <= max */
  private inRange(x: number, min: number, max: number) {
    return (x - min) * (x - max) <= 0;
  }

  //#endregion
}
