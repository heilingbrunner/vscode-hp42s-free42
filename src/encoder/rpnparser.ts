import * as vscode from 'vscode';

import { unstring } from '../typedefs';
import { CodeError } from '../common/codeerror';
import { Configuration } from '../helper/configuration';
import { RPN } from './rpn';

/** Command Parser for HP42S code */
export class RpnParser {
  lastError: unstring = undefined;
  error: CodeError | undefined = undefined;
  config: Configuration;

  // parsed
  code: string = '';
  ignored: boolean = false;

  // line numbers
  prgmLineNo: number = 0; // by parser auto incremented number
  codeLineNo: number = 0; // 03 SIN -> 3
  docLineIndex: number = -1;

  token: unstring = undefined;
  tokens: string[] = [];
  tokenLength: number = 0;
  // parameters
  str: unstring = undefined;
  num: unstring = undefined;
  flg: unstring = undefined;
  key: unstring = undefined;
  lbl: unstring = undefined;
  clb: unstring = undefined;
  nam: unstring = undefined;
  stk: unstring = undefined;
  ton: unstring = undefined;
  csk: unstring = undefined;
  out: unstring = undefined;

  constructor(useWorkspaceConfiguration: boolean) {
    this.config = new Configuration(useWorkspaceConfiguration);
  }

  private reset() {
    this.tokens = [];
    this.tokenLength = 0;
    this.token = undefined;
    this.codeLineNo = 0;
    this.docLineIndex = -1;
    this.code = '';
    this.str = undefined;
    this.num = undefined;
    this.flg = undefined;
    this.key = undefined;
    this.lbl = undefined;
    this.clb = undefined;
    this.nam = undefined;
    this.stk = undefined;
    this.ton = undefined;
    this.csk = undefined;
    this.out = undefined;
    this.lastError = undefined;
    this.ignored = false;
    this.error = undefined;
  }

  read(line: string) {
    let progErrorText: unstring;
    let tpl: [string, unstring] = ['', undefined];

    this.reset();
    this.code = line;

    // get line number from code
    if (this.config.useLineNumbers) {
      switch (true) {
        // code line is { n-Byte Prgm }
        case /^00 {.*\}/.test(line):
          this.codeLineNo = 0;
          this.prgmLineNo = 0;
          break;
        // increment
        default:
          this.prgmLineNo++;
      }
    }

    if (this.ignoredLine(line)) {
      this.ignored = true;
      return undefined;
    } else {

      // read codeLineNo from code line 
      if (this.config.useLineNumbers) {
        let match = line.match(/(^\d+)(▸|▶|>|\s+)/);
        if (match) {
          this.codeLineNo = parseInt(match[1]);
        }
      }

      //#region prepare line

      line = this.formatLine(line);

      // alpha in `str`
      tpl = this.replaceString(line);
      line = tpl[0];
      this.str = tpl[1];

      // key number in `key`
      tpl = this.replaceKey(line);
      line = tpl[0];
      this.key = tpl[1];

      // global labels in `lbl`
      tpl = this.replaceGlobalLabel(line);
      line = tpl[0];
      this.lbl = tpl[1];

      // local char labels
      tpl = this.replaceLocalCharLabel(line);
      line = tpl[0];
      this.clb = tpl[1];

      // variables in `nam`
      tpl = this.replaceName(line);
      line = tpl[0];
      this.nam = tpl[1];

      // custom in `csk`
      tpl = this.replaceCustomKey(line);
      line = tpl[0];
      this.csk = tpl[1];

      // tone in tn
      tpl = this.replaceTone(line);
      line = tpl[0];
      this.ton = tpl[1];

      // stack in `stk`
      tpl = this.replaceStack(line);
      line = tpl[0];
      this.stk = tpl[1];

      // flag in rr
      tpl = this.replaceFlag(line);
      line = tpl[0];
      this.flg = tpl[1];

      // number in `num`/local labels in `sl|ll`/number in sr/rr/sd/10/11
      tpl = this.replaceNumber(line);
      line = tpl[0];
      this.num = tpl[1];

      //#endregion

      // Split line into tokens ...
      this.tokens = line.split(' ');

      this.tokenLength = this.tokens.length;
      if (this.tokenLength > 0) {
        this.token = this.tokens[0];
      }

      this.out = line;

      if (this.config.useLineNumbers && this.prgmLineNo !== this.codeLineNo) {
        progErrorText = 'line number not correct';
      }

      if (this.str && progErrorText === undefined) {
        progErrorText = this.checkString(this.str);
      }
      if (this.nam && progErrorText === undefined) {
        progErrorText = this.checkName(this.nam);
      }
      if (this.key && progErrorText === undefined) {
        progErrorText = this.checkKey(this.key);
      }
      if (this.csk && progErrorText === undefined) {
        progErrorText = this.checkCustomKey(this.csk);
      }
      if (this.ton && progErrorText === undefined) {
        progErrorText = this.checkTone(this.ton);
      }
      if (this.flg && progErrorText === undefined) {
        progErrorText = this.checkFlag(this.flg);
      }
      if (this.lbl && progErrorText === undefined) {
        progErrorText = this.checkGlobalLabel(this.lbl);
      }
      if (this.clb && progErrorText === undefined) {
        progErrorText = this.checkLocalCharLabel(this.clb);
      }
    }

    this.error = progErrorText
      ? new CodeError((this.config.useLineNumbers ? this.prgmLineNo : -1), this.code, String(progErrorText))
      : undefined;
  }

  //#region Line prepare

  /** check if line can be ignored */
  private ignoredLine(line: string): boolean {
    // ignore blank lines, length === 0
    // ignore { 33-Byte Prgm }...
    // ignore comments (#|//)
    line = line.trim();
    const ignored =
      line.length === 0 ||
      line.match(/\{.*\}/) !== null ||
      line.match(/^\s*(#|@|\/\/)/) !== null;
    return ignored;
  }

  /** Prepare line */
  private formatLine(line: string): string {
    // Remove leading line numbers 01▸LBL "AA" or 07 SIN
    line = line.replace(/^\d+(▸|▶|>|\s+)/, '');

    // Comment //|@|#...
    let match = line.match(/"/);
    if (match) {
      line = line.replace(/(".*")\s*(\/\/|@|#).*$/, '$1');
    } else {
      line = line.replace(/(\/\/|@|#).*$/, '');

      // Replace too long spaces (?<!".*)\s{2,} , but not in strings
      //let regex = new RegExp(/\s{2,}/, "g");
      line = line.replace(/\s{2,}/g, ' ');
    }

    // Trim spaces
    line = line.trim();

    return line;
  }

  /** Replace a string with `str` */
  private replaceString(line: string): [string, unstring] {
    let str: unstring = undefined;
    // ⊢ or |- or ├
    let match = line.match(/^\s*(⊢|\|-|├|)(".*")/);
    if (match) {
      str = this.removeDoubleQuotes(match[2]);
      line = line.replace(/^\s*(⊢|\|-|├|)"(.*)"/, '$1`str`');
    }

    // replace all occurences of focal character
    if (
      str &&
      str.match(
        /(÷|×|√|∫|░|Σ|▶|π|¿|≤|\[LF\]|≥|≠|↵|↓|→|←|µ|μ|£|₤|°|Å|Ñ|Ä|∡|ᴇ|Æ|…|␛|Ö|Ü|▒|■|•|\\\\|↑)/
      )
    ) {
      RPN.charFocal.forEach((value, key) => {
        const regex = new RegExp(key, 'g');
        if (str) {
          str = str.replace(regex, String.fromCharCode(value));
        }
      });
    }

    return [line, str];
  }

  /** Replace key number with `key` */
  private replaceKey(line: string): [string, unstring] {
    let key: unstring = undefined;
    let match = line.match(/KEY\s+(\d+)/);
    if (match) {
      key = match[1];
      line = line.replace(/KEY\s+\d+/, 'KEY `key`');
    }

    return [line, key];
  }

  /** Replace global label */
  private replaceGlobalLabel(line: string): [string, unstring] {
    //Global labels: string with max. 7 characters
    //               unique to calculator
    let lbl: unstring = undefined;
    let match = line.match(
      /(LBL|GTO|XEQ|CLP|INTEG|PGMSLV|PGMINT|SOLVE)\s+(".{1,7}")/
    );
    if (match) {
      lbl = this.removeDoubleQuotes(match[2]);
      line = line.replace(
        /(LBL|GTO|XEQ|CLP|INTEG|PGMSLV|PGMINT|SOLVE)\s+".{1,7}"/,
        '$1 `lbl`'
      );
    }

    return [line, lbl];
  }

  /** Replace a variable with `nam` */
  private replaceName(line: string): [string, unstring] {
    let nam: unstring = undefined;
    let match = line.match(/".*"/);
    if (match) {
      nam = this.removeDoubleQuotes(match[0]);
      line = line.replace(/".*"/, '`nam`');
    }

    return [line, nam];
  }

  /** Replace stack with `stk` */
  private replaceStack(line: string): [string, unstring] {
    let stk: unstring = undefined;
    let match = line.match(/\s+ST\s+([LXYZT])/);
    if (match) {
      stk = match[1];
      line = line.replace(/\s+ST\s+([LXYZT])/, ' ST `stk`');
    }

    return [line, stk];
  }

  /** Replace tone with `tn` */
  private replaceTone(line: string): [string, unstring] {
    let stk: unstring = undefined;
    let match = line.match(/TONE\s+(\d+)\b/);
    if (match) {
      stk = match[1];
      line = line.replace(/TONE\s+(\d+)\b/, 'TONE tn');
    }

    return [line, stk];
  }

  /** Replace CUSTOM key */
  private replaceCustomKey(line: string): [string, unstring] {
    // others use 1-18 -> csk
    let csk: unstring = undefined;
    let match = line.match(/\bTO\s+(\d+)/);
    if (match) {
      let int = parseInt(match[1]);
      csk = String(int - 1);
      line = line.replace(/\bTO\s+(\d+)/, 'TO `csk`');
    }

    return [line, csk];
  }

  /** Replace local char label
   * A-J, a-e
   */
  private replaceLocalCharLabel(line: string): [string, unstring] {
    let num: unstring = undefined;
    let lbl: unstring = undefined;
    let int: number = 0;
    let match: RegExpMatchArray | null;

    switch (true) {
      // char labels A-J
      case /(LBL|GTO|XEQ)\s+\b(A|B|C|D|E|F|G|H|I|J)\b/.test(line):
        match = line.match(/(LBL|GTO|XEQ)\s+\b(A|B|C|D|E|F|G|H|I|J)\b/);
        if (match) {
          lbl = match[2]; // A=102(0x66),B=107(0x67),...
          line = line.replace(
            /(LBL|GTO|XEQ)\s+\b(A|B|C|D|E|F|G|H|I|J)\b/,
            '$1 ll'
          );
        }
        break;

      // char labels a-e
      case /(LBL|GTO|XEQ)\s+\b(a|b|c|d|e)\b/.test(line):
        match = line.match(/(LBL|GTO|XEQ)\s+\b(a|b|c|d|e)\b/);
        if (match) {
          lbl = match[2]; // a=123(0x7B),b=124(0x7C),...
          line = line.replace(/(LBL|GTO|XEQ)\s+\b(a|b|c|d|e)\b/, '$1 ll');
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

    return [line, num];
  }

  /** Replace number */
  private replaceFlag(line: string): [string, unstring] {
    let num: unstring = undefined;
    let match: RegExpMatchArray | null;

    switch (true) {
      case /(CF|SF|F[CS]\?|F[CS]\?C)\s+(\d+)/.test(line):
        match = line.match(/(CF|SF|F[CS]\?|F[CS]\?C)\s+(\d+)/);
        if (match) {
          num = match[2];
          line = line.replace(/(CF|SF|F[CS]\?|F[CS]\?C)\s+(\d+)/, '$1 rr');
        }
        break;

      default:
        // nothing
        break;
    }

    return [line, num];
  }


  /** Replace number */
  private replaceNumber(line: string): [string, unstring] {
    let num: unstring = undefined;
    let int: number = 0;
    let match: RegExpMatchArray | null;

    switch (true) {
      // number label 00-14, 15-99
      case /(LBL|GTO|XEQ)\s+(\d{2})/.test(line):
        match = line.match(/(LBL|GTO|XEQ)\s+(\d{2})/);
        if (match) {
          num = match[2];

          // 00-14
          int = parseInt(num);
          if (this.inRange(int, 0, 14)) {
            line = line.replace(/(LBL|GTO|XEQ)\s+(\d{2})/, '$1 sl');
          }

          // 15-99
          if (this.inRange(int, 15, 99)) {
            line = line.replace(/(LBL|GTO|XEQ)\s+(\d{2})/, '$1 ll');
          }
        }
        break;

      case /^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/.test(line):
        match = line.match(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/);
        if (match) {
          num = match[0];
          line = line.replace(
            /^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/,
            '`num`'
          );
        }
        break;

      case /\b(STO|RCL)\s+(\d{2})/.test(line):
        // sr/rr only for STO/RCL
        match = line.match(/\b(STO|RCL)\s+(\d{2})/);
        if (match) {
          num = match[2];
          int = parseInt(num);
          line = line.replace(
            /\b(STO|RCL)\s+(\d{2})/,
            '$1 ' + (int < 16 ? 'sr' : 'rr')
          );
        }
        break;

      case /\b(STO|RCL)(\+|-|x|×|\/|÷)\s+(\d{2})/.test(line):
        // sr/rr only for STO/RCL
        match = line.match(/\b(STO|RCL)(\+|-|x|×|\/|÷)\s+(\d{2})/);
        if (match) {
          num = match[3];
          line = line.replace(
            /\b(STO|RCL)(\+|-|x|×|\/|÷)\s+(\d{2})/,
            '$1$2 rr'
          );
        }
        break;

      case /(ENG|FIX|SCI)\s+IND\s+(\d{2})/.test(line):
        // sr/rr only for STO/RCL
        match = line.match(/(ENG|FIX|SCI)\s+IND\s+(\d{2})/);
        if (match) {
          num = match[2];
          line = line.replace(/(ENG|FIX|SCI)\s+IND\s+(\d{2})/, '$1 IND rr');
        }
        break;

      case /(ENG|FIX|SCI)\s+(\d{2})/.test(line):
        // sr/rr only for STO/RCL
        match = line.match(/(ENG|FIX|SCI)\s+(\d{2})/);
        if (match) {
          num = match[2];
          int = parseInt(num);
          line = line.replace(
            /(ENG|FIX|SCI)\s+(\d{2})/,
            '$1 ' + (int < 10 ? 'sd' : '$2')
          );
        }
        break;

      case /X<>\s+\d{2}/.test(line):
        match = line.match(/X<>\s+(\d{2})/);
        if (match) {
          num = match[1];
          line = line.replace(/X<>\s+(\d{2})/, 'X<> rr');
        }
        break;

      case /SIZE\s+\d{1,4}/.test(line):
        match = line.match(/SIZE\s+(\d{1,4})/);
        if (match) {
          num = match[1];
          line = line.replace(/SIZE\s+(\d{1,4})/, 'SIZE rr');
        }
        break;

      case /(\w+)(\?|)(\s+IND|)\s+(\d{2})/.test(line):
        // others use 00-99 -> rr
        match = line.match(/(\w+)(\?|)(\s+IND|)\s+(\d{2})/);
        if (match) {
          num = match[4];
          line = line.replace(/(\w+)(\?|)(\s+IND|)\s+(\d{2})/, '$1$2$3 rr');
        }
        break;

      default:
        // nothing
        break;
    }

    return [line, num];
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

  //#region checks
  private checkString(str: unstring): unstring {
    if (str !== undefined) {
      return this.inRange(str.length, 0, 15) ? undefined : 'alpha too long';
    }
    return undefined;
  }

  private checkName(nam: unstring): unstring {
    if (nam !== undefined) {
      return this.inRange(nam.length, 1, 7) ? undefined : 'name length unvalid';
    }
    return undefined;
  }

  /** Check length of global label */
  private checkKey(key: unstring): unstring {
    if (key !== undefined) {
      return this.inRange(parseInt(key), 1, 9)
        ? undefined
        : 'key value invalid';
    }
    return undefined;
  }

  /** Check length of global label */
  private checkTone(ton: unstring): unstring {
    if (ton !== undefined) {
      return this.inRange(parseInt(ton), 1, 9) && ton.length === 1
        ? undefined
        : 'tone value invalid';
    }
    return undefined;
  }

  /** Check flag of global label */
  private checkFlag(flg: unstring): unstring {
    if (flg !== undefined) {
      return this.inRange(parseInt(flg), 0, 99) && flg.length === 2
        ? undefined
        : 'flag value invalid';
    }
    return undefined;
  }

  /** Check length of global label */
  private checkGlobalLabel(lbl: unstring): unstring {
    if (lbl !== undefined) {
      return this.inRange(lbl.length, 0, 7)
        ? undefined
        : 'label length unvalid';
    }
    return undefined;
  }

  /** Check Local Char Label */
  private checkLocalCharLabel(clb: unstring): unstring {
    if (clb !== undefined) {
      let int = parseInt(clb);
      // A=102(0x66),B=107(0x67),...             -> 102-111
      // a=97+26=123(0x7B),b=98+26=124(0x7C),... -> 123-127
      return this.inRange(int, 102, 111) || this.inRange(int, 123, 127)
        ? undefined
        : 'wrong label';
    }
    return undefined;
  }

  /** Check Custom Key */
  private checkCustomKey(csk: unstring): unstring {
    if (csk !== undefined) {
      let int = parseInt(csk);
      return this.inRange(int, 0, 18) ? undefined : 'custom key out of range';
    }
    return undefined;
  }

  /** Check in range min <= x <= max */
  private inRange(x: number, min: number, max: number) {
    return (x - min) * (x - max) <= 0;
  }

  //#endregion
}
