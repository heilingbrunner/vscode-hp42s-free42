import * as vscode from 'vscode';

import { Decoding } from './Decoding';
import { IRawResult } from './IRawResult';
import * as RawProgParser from "./RawProgParser";

export class Decoder {


    constructor() {
        // nothing to do
    }

    /** Decode raw input to readable code string */
    decode(editor: vscode.TextEditor): Decoding {

        let result: IRawResult | undefined;

        try {

            const bytes = this.readDocumentBytes(editor.document);
            const content = bytes.join(' ');

            result = RawProgParser.parse(content) as IRawResult;

        } catch (e) {

            // TypeScript weiß nicht, dass das Error-Objekt zusätzliche Eigenschaften hat
            if (e instanceof Error && (e as any).location) {
                const err = e as any; // Workaround, um an Peggy-spezifische Felder zu kommen

                console.error("Parse-Error:");
                console.error(`  → Position: line ${err.location.start.line}, column ${err.location.start.column}`);
                //console.error(`  → Expected: ${err.expected ? err.expected.map((e: any) => e.description).join(", ") : "n/a"}`);
                console.error(`  → Found   : ${err.found !== null ? JSON.stringify(err.found) : "nothing"}`);
                console.error(`  → Message : ${err.message}`);
                //console.error(`  → Diagnose: ${err.diagnostic || "no more details available"}`);
            } else {
                console.error("Error:", e);
            }
        }

        const decoding = new Decoding(result as IRawResult);

        return decoding;
    }

    readDocumentBytes(document: vscode.TextDocument): string[] {
        const docLineCount = document.lineCount;
        let bytes: string[];
        let content: string = '';

        for (let docLine = 0; docLine < docLineCount; docLine++) {
            let line = document.lineAt(docLine);
            let linetext = line.text;

            //   Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 	                 <----- not this
            // 00000000: C0 00 F8 00 54 4F 4F 2D 4C 4F 4E 99 16 C0 00 F4    @.x.TOO-LON..@.t <----- this

            if (/(\d+:)( [0-9a-fA-F]{2})+/.test(linetext)) {
                linetext = linetext.replace(/^\d{8}: /, '');
                let match = linetext.match(/([0-9a-fA-F]{2} )+/);
                if (match) {
                    content += match[0];
                }
            }
        }

        // All together
        bytes = content.trim().split(' ');

        return bytes;
    }

    dispose() { }
}
