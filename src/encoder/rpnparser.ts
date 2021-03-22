import * as vscode from "vscode";

import { CodeError } from "../common/codeerror";
import { Configuration } from "../common/configuration";
import { Encoder42 } from "./encoder42";
import { RawProgram } from "./rawprogram";
import { RawLine } from "./rawline";
import { RawPattern } from "./rawpattern";

/** Command parser for a code line */
export class RpnParser {
  //#region Member

  debug = 0; // debug level 0=nothing, 1=minimal, 2=verbose

  programs: RawProgram[] = [];
  prgmLineNo = 0; // by parser auto incremented number
  prgmIndex = -1;
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
          this.prgmIndex++;
          program = new RawProgram(docLine);
          this.programs.push(program);
        }

        if (program) {
          // search in avaiable commands
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

  /**
   *
   * @param docLine
   * @param line
   * @returns a RawLine object
   */
  parseLine(docLine: number, line: string): RawLine {
    let progErrorText: string | undefined;

    // Create new RawLine object
    let rawLine = new RawLine();

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
      // increment program line number
      this.prgmLineNo++;

      // read codeLineNo from code line
      if (this.config && this.config.useLineNumbers) {
        let match = line.match(/(^\d+)(▸|▶|>|\s+)/);
        if (match) {
          rawLine.codeLineNo = parseInt(match[1]);
        }
      }

      //#region prepare line

      //save original code
      rawLine.docCode = line;
      rawLine.workCode = this.formatLine(line);

      //Check if string/number/rpn command ?
      if (/^\s*(⊢|)(".*")/.test(rawLine.workCode)) {
        // Is it a string "abc", ⊢"cde" ?
        this.readString(rawLine);
      } else if (
        /^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/.test(rawLine.workCode)
      ) {
        // Is it a number ?
        this.readFloatNumber(rawLine);
      } else if (Encoder42.rpnMap.has(rawLine.token)) {
        // Is it a rpn command ?
        progErrorText = this.readRpnCommand(rawLine);
      } else {
        progErrorText = "unvalid command";
      }

      //#endregion

      //#region Checks ...

      if (
        this.config &&
        this.config.useLineNumbers &&
        this.prgmLineNo !== rawLine.codeLineNo
      ) {
        progErrorText =
          "line number not correct: " +
          this.prgmLineNo +
          "!==" +
          rawLine.codeLineNo;
      }

      //#endregion
    }

    if (progErrorText) {
      rawLine.error = new CodeError(
        docLine,
        this.config && this.config.useLineNumbers ? this.prgmLineNo : -1,
        rawLine.docCode,
        "" + progErrorText
      );
    }

    return rawLine;
  }

  //#endregion

  //#region Private Methods

  /** Read a string */
  private readString(rawLine: RawLine) {
    let str: string = "";
    // only ⊢, not |- or ├
    let match = rawLine.workCode.match(/^\s*(⊢|)(".*")/);
    if (match) {
      str = this.removeDoubleQuotes(match[2]);
      rawLine.workCode = rawLine.workCode.replace(/^\s*(⊢|)"(.*)"/, "$1`str`");
      if (match[1] === "") {
        rawLine.raw = "Fn"; //see EncoderFOCAL.rpnMap.get(`str`)[0];
      } else {
        rawLine.raw = "Fn 7F"; //see EncoderFOCAL.rpnMap.get(⊢`str`)[0];
      }
    }
    // replace all occurences of focal character
    if (
      str &&
      str.match(
        /(÷|×|√|∫|░|Σ|▶|π|¿|≤|\[LF\]|≥|≠|↵|↓|→|←|µ|μ|£|₤|°|Å|Ñ|Ä|∡|ᴇ|Æ|…|␛|Ö|Ü|▒|■|•|\\\\|↑)/
      )
    ) {
      Encoder42.charCodeMap.forEach((value, key) => {
        const regex = new RegExp(key, "g");
        if (str) {
          str = str.replace(regex, String.fromCharCode(value));
        }
      });
    }
    rawLine.params.str = str;
  }

  /** Read a number */
  private readFloatNumber(rawLine: RawLine) {
    const match = rawLine.workCode.match(
      /^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/
    );
    if (match) {
      rawLine.params.num = match[0];
      rawLine.params.numno = parseFloat(match[0]); // or parseInt()
      rawLine.workCode = rawLine.workCode.replace(
        /^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/,
        "`num`"
      );
    }
  }

  /** Read Rpn command */
  private readRpnCommand(rawLine: RawLine): string | undefined {
    let progErrorText: string | undefined;
    const patterns = Encoder42.rpnMap.get(rawLine.token);

    if (patterns) {
      let matched = false;

      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];

        //Append whitespace + eol to all pattern.regex
        const regex = new RegExp(pattern.regex.source + /\s*$/.source);
        //match ?
        let match = rawLine.workCode.match(regex);
        if (match) {
          matched = true;
          // Params included ?
          this.checkParamsInMatch(pattern, rawLine, match);

          rawLine.raw = pattern.raw;

          break;
        }
      }

      if (!matched) {
        progErrorText = "unvalid parameter";
      }
    } else {
      progErrorText = "unvalid command";
    }

    return progErrorText;
  }

  /** Read params from match like regex named group */
  private checkParamsInMatch(
    pattern: RawPattern,
    rawLine: RawLine,
    match: RegExpMatchArray
  ) {
    if (pattern.params) {
      const params = pattern.params.split(",");
      // assign params like regex named groups
      for (let p = 0; p < params.length; p++) {
        const param = params[p];
        let k = p + 1;
        switch (true) {
          case param === "dig":
            rawLine.params.dig = match[k];
            rawLine.params.digno = parseInt(match[k]);
            break;
          case param === "flg":
            rawLine.params.flg = match[k];
            rawLine.params.flgno = parseInt(match[k]);
            break;
          case param === "key-1":
            rawLine.params.key = match[k];
            rawLine.params.keyno = parseInt(match[k]) - 1;
            break;
          case param === "key":
            rawLine.params.key = match[k];
            rawLine.params.keyno = parseInt(match[k]);
            break;
          case param === "lblno":
            rawLine.params.lblno = parseInt(this.getLblNo(match[k])); //parseInt(this.getLblNo(match[k]));
            break;
          case param === "lbl":
            rawLine.params.lbl = this.removeDoubleQuotes(match[k]);
            break;
          case param === "nam":
            rawLine.params.nam = this.removeDoubleQuotes(match[k]);
            break;
          case param === "reg":
            rawLine.params.reg = match[k];
            rawLine.params.regno = parseInt(match[k]);
            break;
          case param === "siz":
            rawLine.params.siz = match[k];
            rawLine.params.sizno = parseInt(match[k]);
            break;
          case param === "stk":
            rawLine.params.stk = match[k];
            break;
          case param === "ton":
            rawLine.params.ton = match[k];
            rawLine.params.tonno = parseInt(match[k]);
          case param === "err":
            rawLine.params.err = match[k];
            rawLine.params.errno = parseInt(match[k]);
            break;
          default:
            break;
        }
      }
    }
  }
  
  /** Converts lbl to number */
  private getLblNo(lbl: string): string {
    let int: number;
    let num: string = "";

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
      console.log(rawLine.workCode + " -> " + rawLine.raw);
    }

    this.programs[this.prgmIndex].addLine(rawLine);
  }

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
    line = line.replace(/^\d+(▸|▶|>|\s+)/, "");

    // Comment //|@|#...
    let match = line.match(/"/);
    if (match) {
      // lines with strings and comment ...
      line = line.replace(/(".*")\s*(\/\/|@|#).*$/, "$1");
    } else {
      // all other lines ...
      line = line.replace(/(\/\/|@|#).*$/, "");

      // Replace too long spaces (?<!".*)\s{2,} , but not in strings
      //let regex = new RegExp(/\s{2,}/, "g");
      line = line.replace(/\s{2,}/g, " ");
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
    return (x - min) * (x - max) <= 0;
  }

  //#endregion
}
