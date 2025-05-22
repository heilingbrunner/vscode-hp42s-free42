import * as vscode from 'vscode';

import { Encoding } from "./Encoding";
import { IRpnResult } from "./IRpnResult";
import * as RpnProgParser from "./RpnProgParser";

export class Encoder {

    constructor() {
        // nothing to do
    }

    /** Encode RPN to raw */
    encode(
        languageId: string,
        editor: vscode.TextEditor
    ): Encoding {

        let result: IRpnResult | undefined;

        try {

            const content = editor.document.getText();

            result = RpnProgParser.parse(content) as IRpnResult;

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

        const encoding = new Encoding(result as IRpnResult);

        return encoding;
    }

    dispose() { }
}
