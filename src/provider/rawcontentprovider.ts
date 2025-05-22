import * as vscode from 'vscode';

import { getFileSize, getBuffer } from '../common/filesystem';
import { Configuration } from '../common/configuration';

export default class RawContentProvider implements vscode.TextDocumentContentProvider {
    private static s_instance: RawContentProvider | null = null;
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    constructor() {
        if (RawContentProvider.s_instance) {
            RawContentProvider.s_instance.dispose();
        }
        RawContentProvider.s_instance = this;
    }

    static get instance() {
        return RawContentProvider.s_instance;
    }

    public dispose() {
        this._onDidChange.dispose();
        if (RawContentProvider.s_instance) {
            RawContentProvider.s_instance.dispose();
            RawContentProvider.s_instance = null;
        }
    }

    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        const sizeWarning : number = 5242880; // 5MB, vscode cannot handle files > 5MB, otherwise it will slow down
        const sizeDisplay : number = 5242880; // 5MB

        return new Promise(async resolve => {
            const config = new Configuration(true);
            const tail = ''; //'(Reached the maximum size to display. You can change "raw42.sizeDisplay" in your settings.)';
            const eol = config.eol;
            const size = await getFileSize(uri);

            const proceed =
                    size < sizeWarning
                    ? 'Open'
                    : await vscode.window.showWarningMessage('File might be too big (> 5MB), are you sure you want to continue?', 'Open');

            if (proceed === 'Open') {
                //Example:
                //   Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
                // 00000000: C0 00 F8 00 45 51 55 45 45 4E 53 FD 38 20 51 75
                // 00000010: 65 65 6E 73 20 76 31 2E 30 F7 7F 20 52 65 61 64

                //Offset
                let content = '  Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F' + eol + '00000000: ';
                let buf = await getBuffer(uri);
                if (buf) {
                    let length = buf.length > sizeDisplay ? sizeDisplay : buf.length;

                    for (let index = 0; index < length; index++) {
                        const byte = buf[index];

                        // next line ?  not first line      &&     last line                       00000000: leading address
                        const nl =
                            (index + 1) % 16 === 0 && index < length - 1
                                ? ' ' + eol + this.toHex(index, 8) + ': '
                                : ' ';

                        // add to string
                        content += ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase() + nl;
                    }

                    if (buf.length > sizeDisplay) {
                        content += tail;
                    }
                }

                return resolve(content); //no trim !!
            } else {
                return resolve('("hp42s/free42: Show Raw" cancelled.)');
            }
        });
    }

    private toHex(number: number, digits: number) {
        return ('0'.repeat(digits) + ((number + 1) & (Math.pow(16, digits) - 1)).toString(16)).slice(-digits).toUpperCase();
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }
}
