import * as vscode from 'vscode';

import { Configuration } from '../common/configuration';

/** Formatter for the code */
export class RpnFormatProvider {
    constructor() { }

    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.ProviderResult<vscode.TextEdit[]> {
        let edits: vscode.TextEdit[] = [];

        if (document.languageId.match(/(hp42s|free42)/i)) {

            // read workspace Configuration
            let config = new Configuration(true);

            let codeLineNo = 0;

            // go through document line by line
            for (let i = 0; i < document.lineCount; i++) {

                let line = document.lineAt(i);
                let text = line.text;

                // 1. Seperate code and comment
                const commentPos = text.indexOf('//');
                let codePart = text;
                let commentPart = '';

                // If there's a comment, split the line into code and comment parts
                if (commentPos !== -1) {
                    codePart = text.substring(0, commentPos);
                    commentPart = text.substring(commentPos);
                }

                if (!line.isEmptyOrWhitespace) {

                    // 1. Remove line numbers
                    switch (true) {
                        // no replace for 123 // comment
                        case /^\s*\d+\s+(\/\/)(.*)/.test(codePart):
                            // do nothing
                            break;

                        case /(^\s*\d+)\s+(\d+)(.+)/.test(codePart):
                            codePart = codePart.replace(/(^\s*\d+)\s+(\d+)(.+)/, '$2$3'); //01 33  -> 33
                            break;
                        case /(^\s*\d+)\s+(\w+)/.test(codePart):
                            codePart = codePart.replace(/(^\s*\d+)\s+(\w+)/, '$2'); //01 ABC -> ABC
                            break;
                        case /(^\s*\d+)\s+(\W)/.test(codePart):
                            codePart = codePart.replace(/(^\s*\d+)\s+(\W)/, '$2'); //01 +   -> +
                            break;
                        case /(^\s*\d+)\s+(\{.*)/.test(codePart):
                            codePart = codePart.replace(/(^\s*\d+)\s+(\{.*)/, '$2'); //01 { 1 -> { 1
                            break;
                        case /(^\s*\d+)(▸|▶|>)(LBL.+)/.test(codePart):
                            codePart = codePart.replace(/(^\s*\d+)(▸|▶|>)(LBL.+)/, '$3'); //01>LBL  -> LBL
                            break;

                        default:
                            break;
                    }

                    // 2. Replace always ...
                    codePart = codePart.replace(/“/, '"'); // ->“RSAST”
                    codePart = codePart.replace(/”/, '"'); //   “RSAST”<-
                    codePart = codePart.replace(/^\*/, '×'); //  * -> ×
                    codePart = codePart.replace(/^x/, '×'); //  x -> ×  
                    codePart = codePart.replace(/–/g, '-'); //  – -> -
                    codePart = codePart.replace(/\[LF\]/g, '␊'); //  [LF] -> ␊

                    // 3. Remove abbreviarion \Sigma, \GS, +/-, ...
                    if (config.replaceAbbreviations) {
                        // see https://www.swissmicros.com/dm42/decoder/ see 2. tab
                        codePart = codePart.replace(/(^\s*)RCLx/, '$1RCL×');
                        codePart = codePart.replace(/(^\s*)RCL\*/, '$1RCL×');
                        codePart = codePart.replace(/(^\s*)RCL\//, '$1RCL÷');

                        codePart = codePart.replace(/(^\s*)STOx/, '$1STO×');
                        codePart = codePart.replace(/(^\s*)STO\*/, '$1STO×');
                        codePart = codePart.replace(/(^\s*)STO\//, '$1STO÷');

                        codePart = codePart.replace(/(^\s*)BASEx/, '$1BASE×');
                        codePart = codePart.replace(/(^\s*)BASE\*/, '$1BASE×');
                        codePart = codePart.replace(/(^\s*)BASE\//, '$1BASE÷');
                        codePart = codePart.replace(/(^\s*)BASE\+\/-/, '$1BASE±');

                        codePart = codePart.replace(/(^\s*)(R(\\|)\^N)/, '$1R↑N');
                        codePart = codePart.replace(/(^\s*)(R(\\|)\^)/, '$1R↑');

                        codePart = codePart.replace(/(^\s*)(R(\\|)vN)/, '$1R↓N');
                        codePart = codePart.replace(/(^\s*)(R(\\|)v)\b/, '$1R↓');

                        codePart = codePart.replace(/(^\s*)(\\|)(Sigma|SUM|GS)\+/, '$1Σ+');
                        codePart = codePart.replace(/(^\s*)(\\|)(Sigma|SUM|GS)-/, '$1Σ-');
                        codePart = codePart.replace(/(^\s*)ALL(\\|)(Sigma|SUM|GS)/, '$1ALLΣ');
                        codePart = codePart.replace(/(^\s*)CL(\\|)(Sigma|SUM|GS)/, '$1CLΣ');
                        codePart = codePart.replace(/(^\s*)LIN(\\|)(Sigma|SUM|GS)/, '$1LINΣ');
                        codePart = codePart.replace(/(^\s*)PR(\\|)(Sigma|SUM|GS)/, '$1PRΣ');
                        codePart = codePart.replace(/(^\s*)(\\|)(Sigma|SUM|GS)REG/, '$1ΣREG');

                        codePart = codePart.replace(/(^\s*)(\\|)->HR/, '$1→HR');
                        codePart = codePart.replace(/(^\s*)(\\|)->HMS/, '$1→HMS');

                        codePart = codePart.replace(/(^\s*)(\\|)->DEC/, '$1→DEC');
                        codePart = codePart.replace(/(^\s*)(\\|)->OCT/, '$1→OCT');
                        codePart = codePart.replace(/(^\s*)(\\|)->RAD/, '$1→RAD');
                        codePart = codePart.replace(/(^\s*)(\\|)->HMS/, '$1→HMS');
                        codePart = codePart.replace(/(^\s*)(\\|)->REC/, '$1→REC');
                        codePart = codePart.replace(/(^\s*)(\\|)->DEG/, '$1→DEG');
                        codePart = codePart.replace(/(^\s*)(\\|)->POL/, '$1→POL');

                        codePart = codePart.replace(/(^\s*)X!=0\?/, '$1X≠0?');
                        codePart = codePart.replace(/(^\s*)X\/=0\?/, '$1X≠0?');
                        codePart = codePart.replace(/(^\s*)X#Y\?/, '$1X≠Y?');
                        codePart = codePart.replace(/(^\s*)X#0\?/, '$1X≠0?');
                        codePart = codePart.replace(/(^\s*)X<=0\?/, '$1X≤0?');
                        codePart = codePart.replace(/(^\s*)X>=0\?/, '$1X≥0?');
                        codePart = codePart.replace(/(^\s*)X!=Y\?/, '$1X≠Y');
                        codePart = codePart.replace(/(^\s*)X<=Y\?/, '$1X≤Y?');
                        codePart = codePart.replace(/(^\s*)X>=Y\?/, '$1X≥Y?');

                        codePart = codePart.replace(/(^\s*)10\^(x|X)/, '$110↑X');
                        codePart = codePart.replace(/(^\s*)(x|X)\^2/, '$1X↑2');
                        codePart = codePart.replace(/(^\s*)Y\^(x|X)/, '$1Y↑X');
                        codePart = codePart.replace(/(^\s*)(e|E)\^(x|X)/, '$1E↑X');
                        codePart = codePart.replace(/(^\s*)(e|E)\^(x|X)-1/, '$1E↑X-1');

                        codePart = codePart.replace(/(^\s*)<-\b/, '$1←');
                        codePart = codePart.replace(/(^\s*)\^\b/, '$1↑');
                        codePart = codePart.replace(/(^\s*)v\b/, '$1↓');
                        codePart = codePart.replace(/(^\s*)->\b/, '$1→');

                        codePart = codePart.replace(/(^\s*)\/$/, '$1÷');

                        codePart = codePart.replace(/(^\s*)\|-/, '$1⊢');  // |-
                        codePart = codePart.replace(/(^\s*)├/, '$1⊢');    // ├

                        codePart = codePart.replace(/(\d+)\s*(e|E)(.*)/, '$1ᴇ$3');
                    }

                    // 4. Reduce whitspace
                    if (config.removeTooLongSpaces) {
                        if (!/".*"/.test(codePart)) {

                            // All without double quotes
                            codePart = codePart.replace(/\s{2,}/g, ' ');

                        } else {
                            // with double quotes ...

                            // reduce whitespace from line beginning to first double quotes
                            if (/^(\w+)(\s+)"/.test(codePart)) {

                                codePart = codePart.replace(/^(\w+)(\s+)"/, '$1 "');

                            }

                            // reduce whitespace from last double quote to the end of line
                            //if (/"\s{2,}/.test(codePart)) {
                            //  codePart = codePart.replace(/"\s{2,}/g, '" ');
                            //}
                        }

                        if (/\s+IND\s+/.test(codePart)) {

                            codePart = codePart.replace(/\s+IND\s+/, ' IND ');

                        }

                        if (/\s+TO\s+/.test(codePart)) {

                            codePart = codePart.replace(/\s+TO\s+/, ' TO ');

                        }

                        // LBL "A" -> LBL A, without doublequotes
                        if (/(LBL|GTO|XEQ) "([A-J,a-e])"/.test(codePart)) {

                            codePart = codePart.replace(/(LBL|GTO|XEQ) "([A-J,a-e])"/, '$1 $2');

                        }
                    }

                    // 5. Trim
                    if (config.trimLine) {
                        codePart = codePart.trim();
                    }


                    // 6.1 Replace outer double quotes, when string contains double quotes
                    // Count the number of double quotes in the non-comment part
                    const doubleQuoteCount = (codePart.match(/"/g) || []).length;

                    // If there are more than 2 double quotes, it suggests we have quotes within quotes
                    if (doubleQuoteCount > 2) {
                        // Find the positions of the first and last double quote
                        const firstPos = codePart.indexOf('"');
                        const lastPos = codePart.lastIndexOf('"');

                        if (firstPos !== -1 && lastPos !== -1 && firstPos !== lastPos) {
                            // Replace the first and last double quotes with single quotes
                            codePart = codePart.substring(0, firstPos) + '\'' +
                                codePart.substring(firstPos + 1, lastPos) + '\'' +
                                codePart.substring(lastPos + 1);
                        }
                    }

                    // 6.2 Replace outer single quotes, when string contains single quotes
                    // Count the number of single quotes in the non-comment part
                    const singleQuoteCount = (codePart.match(/'/g) || []).length;

                    // If there are more than 2 single quotes, it suggests we have quotes within quotes
                    if (singleQuoteCount > 2) {
                        // Find the positions of the first and last single quote
                        const firstPos = codePart.indexOf("'");
                        const lastPos = codePart.lastIndexOf("'");

                        if (firstPos !== -1 && lastPos !== -1 && firstPos !== lastPos) {
                            // Replace the first and last single quotes with double quotes
                            codePart = codePart.substring(0, firstPos) + '"' +
                                codePart.substring(firstPos + 1, lastPos) + '"' +
                                codePart.substring(lastPos + 1);
                        }
                    }




                    // 7. Combine the modified code part with the comment part (if any)
                    text = codePart + (codePart ? ' ': '') + commentPart;

                    // 7. Insert/Refresh line numbers, when using line numbers
                    // when not comment line ...
                    if (!text.match(/^\s*(\/\/)/)) {
                        switch (true) {
                            // code line is { n-Byte Prgm }
                            case /^\{.*\}/.test(text):
                                codeLineNo = 0;
                                break;
                            default:
                                codeLineNo++;
                        }

                        // prepend line number
                        let sep = text.startsWith('LBL') ? '▸' : ' '; // ▸, not ▶
                        text = (codeLineNo < 10 ? '0' + codeLineNo : codeLineNo) + sep + text;

                    }

                    edits.push(vscode.TextEdit.replace(new vscode.Range(line.range.start, line.range.end), text));
                }
            }
        }

        return edits;
    }

    dispose() { }
}
