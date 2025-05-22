import { toBytes } from '../common/bytes';
import { CodeError } from '../common/codeerror';
import { IRpnJson } from './IRpnJson';

export class RpnProg {
    headerDocLine: number = -1;
    index: number = -1;
    prog: IRpnJson;

    constructor(index: number, json: IRpnJson) {
        this.index = index;
        this.prog = json;

        this.headerDocLine = Number(this.prog.header.dl);
    }

    getErrors(): CodeError[] {
        return this.prog.tokens.filter(entry => entry.type === 'error').map(entry => {
            return new CodeError(entry.dl, entry.pl, entry.msg, entry.type);
        });
    }

    getHex42(eol: string, useLineNumbers: boolean): string {
        return this.prog.tokens
            .filter(entry => entry.type === 'code')
            .map((entry, index) => {
                const lineNumber = useLineNumbers ? `${(index + 1) < 10 ? `0${(index + 1)}` : `${(index + 1)}`} ` : ''; // using index instead of entry.pl
                //const lineNumber = useLineNumbers ? `${entry.pl} ` : '';                                              // using entry.pl instead of index
                const lineNumberAndRpn = (lineNumber + entry.token.rpn).padEnd(64, ' ');
                
                return `${lineNumberAndRpn} [${entry.token.len}] ${entry.token.raw}${eol}`;
            })
            .join('');
    }

    getLanguageId(): number {
        // get maximum language ID from all tokens
        const max = this.prog.tokens
            .filter(entry => entry.type === 'code')
            .map(entry => entry.token.lid)
            .reduce((max, lid) => Math.max(max, lid), 0);

        return max;
    }

    getRaw(asNumbers: boolean): string | number[] {
        const raw = this.prog.tokens
            .filter(entry => entry.type === 'code')
            .map(entry => entry.token.raw)
            .join(' ')
            .trim();

        if (asNumbers) {
            return toBytes(raw);
        } else {
            return raw;
        };
    }

    getSize(): number {
        const raw = this.getRaw(false) as string;
        const rawbytes = this.getRaw(true) as number[];

        // HP42S: ignore last END, substract 3 bytes
        const size = raw.endsWith('C0 00 0D') ? rawbytes.length - 3 : rawbytes.length;

        return size;
    }

    getTokens(): string[] {
        return this.prog.tokens
            .map(entry => {
                switch (entry.type) {
                    case 'code':
                        return (entry.pl + ' ' + entry.token.rpn).padEnd(64, ' ') + ' [' + (entry.token.raw.length +1)/3 + '] ' + entry.token.raw;
                    case 'empty':
                        return entry.type;
                    case 'comment':
                        return entry.type;
                    case 'error':
                        return (entry.pl + ' ' + entry.msg).padEnd(64, ' ') + ' -> ' + entry.type;
                }
            });
    }

    hasErrors(): boolean {
        return !this.prog.tokens.every(entry => entry.type === 'code' || entry.type === 'comment' || entry.type === 'empty');
    }
}
