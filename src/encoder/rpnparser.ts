import * as vscode from 'vscode';

import { CodeError } from '../common/codeerror';
import { Configuration } from '../common/configuration';
import { Encoder42 } from './encoder42';
import { RawProgram } from './rawprogram';
import { RawLine } from './rawline';

/** Command parser for a code line */
export class RpnParser {

  //#region Member

  debug = 1; // debug level 0=nothing, 1=minimal, 2=verbose

  programs: RawProgram[] = [];
  prgmLineNo: number = 0; // by parser auto incremented number
  document?: vscode.TextDocument;
  config?: Configuration;

  //#endregion

  //#region Public

  constructor() {}

  parse() {
    if (this.document) {
      let docLineCount = this.document.lineCount;
      let program: RawProgram | undefined;

      for (let docLine = 0; docLine < docLineCount; docLine++) {
        let line = this.document.lineAt(docLine);

        //{ ... }-line detected -> Prgm Start
        let match = line.text.match(/\{.*\}/);
        if (match) {
          program = new RawProgram(docLine);
          this.programs.push(program);
        }

        if (program) {
          let rawLine = this.parseLine(docLine, line.text);

          // no parser error ...
          if (rawLine.error === undefined) {
            if (!rawLine.ignored) {
              this.pushLine(rawLine);
            }
          } else {
            // parse error
            this.pushLine(rawLine);
          }
        }
      }
    }
  }

  parseLine(docLine: number, line: string): RawLine {
    let progErrorText: string | undefined;
    let rawLine = new RawLine();

    //save original code

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
      rawLine.docCode = line;
      rawLine.workCode = this.formatLine(line);

      if (/^\s*(⊢|)(".*")/.test(rawLine.workCode)) {
        // Is it a string "abc", ⊢"cde" ?
        this.readString(rawLine);

      } else if (/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/.test(rawLine.workCode)) {
        // Is it a number ?
        this.readNumber(rawLine);
      } else if (Encoder42.rpnMap.has(rawLine.token)) {
        // Is it a rpn command ?
        const patterns = Encoder42.rpnMap.get(rawLine.token);

        if (patterns) {
          let matched = false;

          for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];

            //match ?
            let match = rawLine.workCode.match(pattern.regex);
            if (match) {
              matched = true;
              // Params included ?
              this.checkParamsInMatch(pattern, rawLine, match);

              rawLine.raw = pattern.raw;

              break;
            }
          }

          if (!matched) {
            progErrorText = 'unvalid parameter';
          }
        } else {
          progErrorText = 'unvalid command';
        }
      } else {
        progErrorText = 'unvalid command';
      }

      //#endregion

      //#region Checks ...

      if (this.config && this.config.useLineNumbers && this.prgmLineNo !== rawLine.codeLineNo) {
        progErrorText = 'line number not correct: ' + this.prgmLineNo + '!==' + rawLine.codeLineNo;
      }

      //#endregion
    }

    if (progErrorText) {
      rawLine.error = new CodeError(
        docLine,
        this.config && this.config.useLineNumbers ? this.prgmLineNo : -1,
        rawLine.docCode,
        String(progErrorText)
      );
    }

    return rawLine;
  }

  //#endregion

  //#region Private Methods

  /** Read params from match like regex named group */
  private checkParamsInMatch(pattern: import("c:/Temp/#Workbench#/visual-studio/vscode-hp42s-free42/src/encoder/rawpattern").RawPattern, rawLine: RawLine, match: RegExpMatchArray) {
    if (pattern.params) {
      const params = pattern.params.split(',');
      // assign params like regex named groups
      for (let p = 0; p < params.length; p++) {
        const param = params[p];
        let k = p + 1;
        switch (true) {
          case param === 'dig':
            rawLine.params.dig = match[k];
            rawLine.params.digno = parseInt(match[k]);
            break;
          case param === 'flg':
            rawLine.params.flg = match[k];
            rawLine.params.flgno = parseInt(match[k]);
            break;
          case param === 'key':
            rawLine.params.key = match[k];
            rawLine.params.keyno = parseInt(match[k]);
            break;
          case param === 'lblno':
            rawLine.params.lblno = parseInt(this.getLblNo(match[k])); //parseInt(this.getLblNo(match[k]));
            break;
          case param === 'lbl':
            rawLine.params.lbl = this.removeDoubleQuotes(match[k]);
            break;
          case param === 'nam':
            rawLine.params.nam = this.removeDoubleQuotes(match[k]);
            break;
          case param === 'reg':
            rawLine.params.reg = match[k];
            rawLine.params.regno = parseInt(match[k]);
            break;
          case param === 'siz':
            rawLine.params.siz = match[k];
            rawLine.params.sizno = parseInt(match[k]);
            break;
          case param === 'stk':
            rawLine.params.stk = match[k];
            break;
          case param === 'ton':
            rawLine.params.ton = match[k];
            rawLine.params.tonno = parseInt(match[k]);
            break;
          default:
            break;
        }
      }
    }
  }

  /** Read a number */
  private readNumber(rawLine: RawLine) {
    const match = rawLine.workCode.match(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/);
    if (match) {
      rawLine.params.num = match[0];
      rawLine.workCode = rawLine.workCode.replace(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/, '`num`');
    }
  }

  /** Read a string */
  private readString(rawLine: RawLine) {
    let str: string = '';
    // only ⊢, not |- or ├
    let match = rawLine.workCode.match(/^\s*(⊢|)(".*")/);
    if (match) {
      str = this.removeDoubleQuotes(match[2]);
      rawLine.workCode = rawLine.workCode.replace(/^\s*(⊢|)"(.*)"/, '$1`str`');
      if (match[1] === '') {
        rawLine.raw = 'Fn'; //see EncoderFOCAL.rpnMap.get(`str`)[0];
      }
      else {
        rawLine.raw = 'Fn 7F'; //see EncoderFOCAL.rpnMap.get(⊢`str`)[0];
      }
    }
    // replace all occurences of focal character
    if (str && str.match(/(÷|×|√|∫|░|Σ|▶|π|¿|≤|\[LF\]|≥|≠|↵|↓|→|←|µ|μ|£|₤|°|Å|Ñ|Ä|∡|ᴇ|Æ|…|␛|Ö|Ü|▒|■|•|\\\\|↑)/)) {
      Encoder42.charCodeMap.forEach((value, key) => {
        const regex = new RegExp(key, 'g');
        if (str) {
          str = str.replace(regex, String.fromCharCode(value));
        }
      });
    }
    rawLine.params.str = str;
  }

  /** Converts lbl to number */
  private getLblNo(lbl: string): string {
    let int: number;
    let num: string = '';

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

    return num;
  }

  private pushLine(rawLine: RawLine) {
    if (this.debug > 0) {
      console.log(rawLine.workCode + ' -> ' + rawLine.raw);
    }

    this.programs[0].addLine(rawLine);
  }

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
    line = line.replace(/^\d+(▸|▶|>|\s+)/, '');

    // Comment //|@|#...
    let match = line.match(/"/);
    if (match) {
      // lines with strings and comment ...
      line = line.replace(/(".*")\s*(\/\/|@|#).*$/, '$1');
    } else {
      // all other lines ...
      line = line.replace(/(\/\/|@|#).*$/, '');

      // Replace too long spaces (?<!".*)\s{2,} , but not in strings
      //let regex = new RegExp(/\s{2,}/, "g");
      line = line.replace(/\s{2,}/g, ' ');
    }

    // Trim spaces
    line = line.trim();

    return line;
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

  /** Check in range min <= x <= max */
  private inRange(x: number, min: number, max: number) {
    return ((x - min) * (x - max)) <= 0;
  }

  //#endregion
  
}
