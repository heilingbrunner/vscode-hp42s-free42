import { IConverter, unstring } from './contracts';
import { ProgError } from './progerror';
import { Free42 } from './free42';
import { Parser } from './parser';
import { RawLine } from './rawline';
import { Result } from './result';

/** Translator for HP42S code */
export class Converter implements IConverter {
  constructor() {
    Free42.initialize();
  }

  encode(
    languageId: string,
    input: string
  ): Result {
    const debug = 1; // debug level 0=nothing,1=minimal,2=verbose

    let lineNr: number = 0;
    let progErrors: ProgError[] = [];
    let output: string[] = [];
    let hex: unstring = undefined;
    let parseLine = new Parser();
    let rawLine: RawLine;

    // line end /\r?\n/ for *n*x & Windows
    input.split(/\r?\n/).forEach(line => {
      lineNr++;

      if (debug > 1) {
        console.log('[' + lineNr + ']: ' + line);
      }

      parseLine.read(lineNr, line);

      if (parseLine.progError === undefined) {
        if (debug > 1) {
          console.log('-> ' + parseLine.out);
        }

        if (!parseLine.ignored) {
          rawLine = Free42.toRaw(languageId, parseLine);
          if (rawLine.progError === undefined) {
            if (rawLine.raw !== undefined) {
              if (debug > 0) {
                console.log('-> ' + rawLine.raw);
              }
              output.push(rawLine.raw);
            }
          } else {
            progErrors.push(rawLine.progError); // Free42.toRaw() failed
          }
        } else {
          output.push('');
        }
      } else {
        progErrors.push(parseLine.progError); // parseLine.read() failed
      }
    });

    return new Result(
      output,
      progErrors.length > 0 ? progErrors : undefined
    );
  }

  /** Decode raw input to readable code string */
  //decode(input: string): [string, unstring, unarrerror] {
  //  let languageId: string;
  //  let code : unstring;
  //	let errors: unarrerror = [];
  //  let output: string[] = [];
  //
  //  // TODO: ...
  //  let result = FREE42.fromRaw(input);
  //  languageId = result[0];
  //  code = result[1];
  //  errors = result[2];
  //  if (errors === undefined) {
  //    if (code !== undefined) {
  //      //...
  //    }
  //  } else {
  //    //errors.push(error);
  //  }
  //
  //  return [languageId, output.length > 0 ? output.join('\r\n') : undefined, errors];
  //}

  dispose() {}
}
