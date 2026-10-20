import * as vscode from 'vscode';

import { Encoding } from "./Encoding";
import { IRpnResult } from "./IRpnResult";
import * as RpnProgParser from "./RpnProgParser";
import { logParseError } from "../common/parseerror";

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

            logParseError(e);
        }

        const encoding = new Encoding(result as IRpnResult);

        return encoding;
    }

    dispose() { }
}
