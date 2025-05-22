import { CodeError } from "../common/codeerror";
import { RpnProg } from "./RpnProg";
import { IRpnResult } from "./IRpnResult";

/** Encoding result of the complete code content */
export class Encoding {
    result: IRpnResult | undefined;
    progs: RpnProg[] = [];

    constructor(result: IRpnResult) {
        this.result = result;

        if (!this.result) {
            return;
        }

        this.progs = this.result.progs.map((prog, index) => new RpnProg(index, prog));
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

    get programs(): RpnProg[] {
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
        const max = this.progs
            .map(prog => prog.getLanguageId())
            .reduce((max, lid) => Math.max(max, lid), 0);

        return max;
    }

    getRaw(asNumbers: boolean): string | number[] | undefined {

        if (this.progs.length === 0) {
            return undefined;
        }

        if (asNumbers) {
            return this.progs
                .map(prog => prog.getRaw(true) as number[])
                .reduce((acc, curr) => acc.concat(curr), []);
        } else {
            return this.progs
                .map(prog => prog.getRaw(false) as string)
                .join(' ');
        }
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
