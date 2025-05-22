import { CodeError } from '../common/codeerror';
import { IRawJson } from './IRawJson';

export class RawProg {
    index: number = -1;
    prog: IRawJson;

    constructor(index: number, json: IRawJson) {
        this.index = index;
        this.prog = json;
    }

    getErrors(): CodeError[] {
        return this.prog.tokens.filter(entry => entry.type === 'error').map(entry => {
            return new CodeError(entry.pos, entry.pl, entry.msg, entry.type);
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
        return this.prog.tokens
            .filter(entry => entry.type === 'code')
            .map(entry => entry.token.lid)
            .reduce((max, lid) => Math.max(max, lid), 0);
    }

    getRpn(): string {
        return this.prog.tokens
            .filter(entry => entry.type === 'code')
            .map((entry, index) => {
                let lineNumber = entry.pl !== undefined ? `${entry.pl}` : '?';
                let sep = entry.token.rpn.startsWith('LBL') ? '▸' : ' ';

                return `${lineNumber}${sep}${entry.token.rpn}`;
            })
            .join('\n');
    }

    getSize(): number {
        const len = this.prog.tokens
            .filter(entry => entry.type === 'code')
            .map(entry => entry.token.len)
            .reduce((acc, val) => acc + parseInt(val, 10), 0);

        const raw = this.getHex42('', false);
        const size = raw.endsWith('C0 00 0D') ? len - 3 : len;

        return size;
    }

    getTokens(): string[] {
        return this.prog.tokens
            .map(entry => {

                switch (entry.type) {
                    case 'code':
                        {
                            let pos = String(entry.pos).padStart(3, ' ');
                            // pos as hex
                            let hexValue = Number(parseInt(entry.pos, 10)).toString(16).toUpperCase().padStart(10, '0'); // pos to 10 digit 10
                            let address = hexValue.slice(0, 9) + '-' + hexValue.slice(9); // insert '-'
                            let pl = entry.pl !== undefined ? entry.pl : '?';
                            let raw = entry.token.raw;

                            console.log('raw', raw, 'pos', pos, 'pl', pl);

                            return '[' + pos + ': ' + address + '] ' + raw.padEnd(66, ' ') + ' -> ' + pl + ' ' + entry.token.rpn;
                        }
                    case 'error':
                        {
                            let pos = String(entry.pos).padStart(3, ' ');
                            let hexValue = Number(parseInt(entry.pos, 10)).toString(16).toUpperCase().padStart(10, '0'); // pos to 10 digit 10
                            let address = hexValue.slice(0, 9) + '-' + hexValue.slice(9); // insert '-'
                            let pl = entry.pl !== undefined ? entry.pl : '?';
                            let msg = entry.msg;

                            // reduce message length to 6, 12, 24, 48 chars
                            msg = (msg.length > 48) ? msg.substring(0, 48) + ' ...'
                                : (msg.length > 24) ? msg.substring(0, 24) + ' ...'
                                    : (msg.length > 12) ? msg.substring(0, 12) + ' ...'
                                        : (msg.length > 6) ? msg.substring(0, 6) + ' ...'
                                            : msg;

                            console.log('msg', msg, 'pos', pos, 'pl', pl);

                            return '[' + pos + ': ' + address + '] ' + msg.padEnd(66, ' ') + ' -> ' + pl + ' ' + entry.type + '!';
                        }
                }
            });
    }

    hasErrors(): boolean {
        return !this.prog.tokens.every(entry => entry.type === 'code');
    }
}