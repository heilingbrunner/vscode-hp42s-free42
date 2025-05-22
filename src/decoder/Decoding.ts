import { CodeError } from "../common/codeerror";
import { RawProg } from "./RawProg";
import { IRawResult } from "./IRawResult";

export class Decoding {
    result: IRawResult | undefined;
    progs: RawProg[] = [];

    constructor(result: IRawResult) {
        this.result = result;

        if (!this.result) {
            return;
        }

        this.progs = this.result.progs.map((prog, index) => new RawProg(index, prog));
    }

    get hasResult(): boolean {
        return this.result !== undefined;
    }

    get hasErrors(): boolean {
        let hasErrors = false;

        this.progs.forEach(prog => {
            if (prog.hasErrors()) {
                hasErrors = true;
            }
        });

        return hasErrors;
    }

    get programs(): RawProg[] {
        if (this.progs.length === 0) {
            return [];
        }

        return this.progs;
    }

    getErrors(): CodeError[] {
        return this.progs
            .flatMap(prog => prog.getErrors() || []);
    }

    getHex42(eol: string, useLineNumbers: boolean): string {
        let hexAll = this.progs
            .map(prog => prog.getHex42(eol, useLineNumbers))
            .join('');

        return hexAll;
    }

    getLanguageId(): number {
        return this.progs
            .map(prog => prog.getLanguageId())
            .reduce((max, lid) => Math.max(max, lid), 0);
    }

    getRpn(): string | undefined {
        if (this.progs.length === 0) {
            return undefined;
        }

        return this.progs
            .map(prog => prog.getRpn() as string)
            .join('\n');
    }

    getSize(): number | undefined {
        return this.progs
            .reduce((totalSize, prog) => totalSize + prog.getSize(), 0);
    }

    getTokens(): string[] {
        return this.progs.map(prog => prog.getTokens())
            .reduce((acc, curr) => acc.concat(curr), []);
    }
}