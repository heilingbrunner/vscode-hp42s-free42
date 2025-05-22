import * as vscode from 'vscode';

import { Configuration } from './common/configuration';
import { writeBytes, writeText, deleteFile, getPhysicalPath, existsSync } from './common/filesystem';

import { Encoder } from './encoder/encoder';
import { Decoder } from './decoder/decoder';
import { Encoding } from './encoder/Encoding';
import { Decoding } from './decoder/Decoding';

export class Tool {
    // The team players ...
    private encoder: Encoder;
    private decoder: Decoder;
    private static EXTPREFIX = 'hp42s/free42';

    constructor() {
        this.encoder = new Encoder();
        this.decoder = new Decoder();
    }

    encode(editor: vscode.TextEditor) {
        if (editor) {

            const config = new Configuration(true);
            const document = editor.document;

            const useLineNumbers = config.useLineNumbers || false;
            const encoderGenerateHexFile = config.encoderGenerateHexFile || false;

            if (document) {
                const documentlanguageId = document.languageId.toLowerCase();
                const eol = ['', '\n', '\r\n'][document.eol];

                if (documentlanguageId.match(/(hp42s|free42)/)) {

                    // start encoding ...
                    const encoding = this.encoder.encode(documentlanguageId, editor);

                    if (encoding.hasResult) {

                        if (encoding.programs && encoding.programs.length > 0) {

                            // no encoding errors ...
                            if (!encoding.hasErrors) {

                                if (encoderGenerateHexFile) {
                                    this.saveEncodingHex42(encoding, eol, useLineNumbers, (document.fileName + '.hex42'));
                                }

                                this.checkEncodingFileExtension(encoding, documentlanguageId);

                                this.saveEncoding(encoding, (document.fileName + '.raw'));

                                deleteFile(document.fileName + '.log');

                            } else {

                                this.showInformationMessage('Errors found.');

                                this.showEncodingFirstError(encoding, useLineNumbers, eol);

                                this.writeEncodingErrorsToLog(document.fileName + '.log', encoding, eol, useLineNumbers);

                            }

                        } else {

                            this.showEncodingFirstError(encoding, useLineNumbers, eol);

                            this.writeEncodingErrorsToLog(document.fileName + '.log', encoding, eol, useLineNumbers);

                        }

                        this.updateEncodingHeadLines(editor, encoding, useLineNumbers);

                    } else {
                        this.showErrorMessage('Encoding failed due to unformatted program ' +
                            '(unknown characters, missing program header, single/double quotes not correct, ...). ' +
                            'Please use "Format Document" command from editor context menu.');
                    }
                }
            } else {
                this.showWarningMessage('Document is not a *.hp42s/*.free42 file type.');
            }
        }
    }

    private checkEncodingFileExtension(encoding: Encoding, documentlanguageId: string) {
        let encodinglanguageId = this.getEncodingLanguageId(encoding);

        if (documentlanguageId === "hp42s" && encodinglanguageId === "hp41c") {
            this.showInformationMessage('Document contains only hp41c code !');
        }

        if (documentlanguageId === "free42" && encodinglanguageId === "hp42s") {
            this.showInformationMessage('Document contains only hp42s code !');
        }

        if (documentlanguageId === "hp42s" && encodinglanguageId === "free42") {
            this.showWarningMessage('Document extension ".' + documentlanguageId + '" should be ".' + encodinglanguageId + '" !');
        }
    }

    private getEncodingLanguageId(encoding: Encoding) {
        let languageId = encoding.getLanguageId();
        let languageIdAsString = 'hp42s';

        switch (languageId) {
            case 0:
                languageIdAsString = 'hp41c';
                break;
            case 1:
                languageIdAsString = 'hp42s';
                break;
            case 2:
                languageIdAsString = 'free42';
                break;
        }

        return languageIdAsString;
    }

    private showEncodingFirstError(encoding: Encoding, useLineNumbers: boolean, eol: string) {
        const firstError = encoding.getErrors()?.at(0);
        let firstErrorText = firstError !== undefined ? firstError.toString(false) : '';

        if (!useLineNumbers) {
            firstErrorText = firstErrorText.replace(/ \[.*\]/, '');
        }

        this.showErrorMessage('Encoding failed.' + eol + firstErrorText);
    }

    private saveEncodingHex42(encoding: Encoding, eol: string, useLineNumbers: boolean, hexFileName: string) {
        const hex = encoding.getHex42(eol, useLineNumbers);

        writeText(hexFileName, hex);
    }

    private saveEncoding(encoding: Encoding, rawFileName: string) {
        const raw = encoding.getRaw(false);
        const size = encoding.getSize();

        writeBytes(rawFileName, String(raw));

        this.showInformationMessage('{ ' + size + '-Byte Prgm }');
    }

    private writeEncodingErrorsToLog(filename: string, result: Encoding, eol: string, useLineNumbers: boolean) {
        let allErrors = '';
        let allTokens = '';

        if (result.programs) {

            allErrors += result.programs
                .flatMap(prog => prog.getErrors() || [])
                .map(error => error.toString(true))
                .join(eol);

            if (!useLineNumbers) {
                allErrors = allErrors.replace(/ \[.*\]/g, '');
            }

            allTokens += result.programs.map(prog => prog.getTokens().join(eol)).join(eol);

            writeText(filename, allErrors + '\n\n' + allTokens);
        }
    }

    private updateEncodingHeadLines(editor: vscode.TextEditor, result: Encoding, useLineNumbers: boolean) {

        editor
            .edit(e => {

                // Walk through reverse (!!) all programs and insert/update head line.
                // Reverse iteration for easier insert of new header lines.
                result.programs.reverse().forEach(prog => {

                    const headerDocLine = prog.headerDocLine;
                    const size = prog.getSize();

                    const firstError = prog.getErrors()?.at(0);
                    let firstErrorText = firstError ? firstError.toString(false) : '';

                    if (!useLineNumbers) {
                        firstErrorText = firstErrorText.replace(/ \[.*\]/, '');
                    }

                    const headLine = editor.document.lineAt(headerDocLine - 1); // 0-based !
                    let line = '';

                    if (!prog.hasErrors()) {
                        line = (useLineNumbers ? '00 ' : '') + '{ ' + size + '-Byte Prgm }';
                    } else {
                        line = (useLineNumbers ? '00 ' : '') + '{ ' + firstErrorText + ' }';
                    }

                    if (headLine) {
                        if (/\{.*\}/.test(headLine.text)) {
                            e.replace(new vscode.Range(headLine.range.start, headLine.range.end), line);
                        }
                    }

                });

            })
            .then(success => {
                //done;
            });
    }

    decode(editor: vscode.TextEditor) {
        if (editor) {

            const config = new Configuration(true);
            const document = editor.document;

            if (document) {

                const eol = ['', '\n', '\r\n'][document.eol];

                const languageId = document.languageId.toLowerCase();
                const scheme = document.uri.scheme.toLowerCase();

                const useLineNumbers = config.useLineNumbers || false;
                const decoderGenerateHexFile = config.decoderGenerateHexFile || false;

                if (languageId.match(/raw42/) && scheme.match(/raw42/)) {

                    const decoding = this.decoder.decode(editor);

                    if (decoding.hasResult) {

                        if (!decoding.hasErrors) {

                            if (decoderGenerateHexFile) {
                                this.saveDecodingHex42(decoding, useLineNumbers, eol, document.fileName.replace('raw42', 'hex42'));
                            }

                            let fileExtension = this.getDecodingLanguageId(decoding);

                            this.saveDecoding(decoding, useLineNumbers, eol, document.fileName.replace('raw42', fileExtension));

                            deleteFile(document.fileName.replace('raw42', 'log'));

                        } else {

                            this.showDecodingFirstError(decoding, eol);

                            this.writeDecodingErrorsToLog(document.fileName.replace('raw42', 'log'), decoding, eol, config.useLineNumbers);

                        }
                    }
                } else {
                    this.showErrorMessage('Decoding failed.' + eol + 'Wrong file type.');
                }
            }
        }
    }

    private getDecodingLanguageId(decoding: Decoding) {
        // get file extension from languageId
        // 0 = hp42s, 1 = free42
        let languageId = decoding.getLanguageId();
        let languageIdAsString = 'hp42s';

        switch (languageId) {
            case 0:
                languageIdAsString = 'hp41c';
                break;
            case 1:
                languageIdAsString = 'hp42s';
                break;
            case 2:
                languageIdAsString = 'free42';
                break;
        }

        // check if only hp41c code is present, but languageId is hp42s or free42
        if (languageIdAsString === 'hp41c') {
            this.showInformationMessage('Document contains only hp41c code !');
            languageIdAsString = 'hp42s';
        }

        return languageIdAsString;
    }

    private showDecodingFirstError(decoding: Decoding, eol: string) {
        const firstError = decoding.getErrors()?.at(0);
        const firstErrorText = firstError !== undefined ? firstError.toString(false) : '';

        this.showErrorMessage('Decoding failed.' + eol + firstErrorText);
    }

    private saveDecodingHex42(decoding: Decoding, useLineNumbers: boolean, eol: string, hexFileName: string) {

        const hex = decoding.getHex42(eol, useLineNumbers);

        writeText(hexFileName, hex);
    }

    private saveDecoding(decoding: Decoding, useLineNumbers: boolean, eol: string, rpnFileName: string) {
        let headLine = '';
        
        if (!decoding.hasErrors) {

            const size = decoding.getSize();

            headLine = (useLineNumbers ? '00 ' : '') + '{ ' + size + '-Byte Prgm }';

            this.showInformationMessage('{ ' + size + '-Byte Prgm }');

        } else {

            const firstError = decoding.getErrors()?.at(0);
            let firstErrorText = firstError ? firstError.toString(true) : '';

            if (!useLineNumbers) {
                firstErrorText = firstErrorText.replace(/ \[.*\]/, '');
            }

            headLine = (useLineNumbers ? '00 ' : '') + '{ ' + firstErrorText + ' }';

            this.showErrorMessage('{ ' + firstErrorText + ' }');
        }

        let rpn = headLine + eol;
        rpn += decoding.getRpn();

        writeText(rpnFileName, rpn);
    }

    private writeDecodingErrorsToLog(filename: string, result: Decoding, eol: string, useLineNumbers?: boolean) {
        let allErrors = '';
        let allTokens = '';

        if (result.programs) {

            allErrors += result.programs
                .flatMap(prog => prog.getErrors() || [])
                .map(error => error.toString(false))
                .join(eol);

            if (!useLineNumbers) {
                allErrors = allErrors.replace(/ \[.*\]/g, '');
            }

            //             POS  ADDRESS      HEX                                                                   RPN
            //            [000, 000000000-0] CA 00 F5 00 42 41 53 45                                            -> 01 LBL "BASE"
            allTokens += ' POS  ADDRESS      HEX                                                                   RPN\n';
            allTokens += '-------------------------------------------------------------------------------------------------------------------\n';

            allTokens += result.programs.map(prog => prog.getTokens().join(eol)).join(eol);

            writeText(filename, allErrors + '\n\n' + allTokens);
        }
    }

    showRaw(fileUri: vscode.Uri | undefined) {

        if (typeof fileUri === 'undefined' || !(fileUri instanceof vscode.Uri)) {
            if (vscode.window.activeTextEditor === undefined) {
                vscode.commands.executeCommand('hexdump.hexdumpPath');
                return;
            }
            fileUri = vscode.window.activeTextEditor.document.uri;
        }

        if (fileUri.scheme === 'hexdump') {

            //toggle with actual file
            const filePath = getPhysicalPath(fileUri);
            for (const editor of vscode.window.visibleTextEditors) {
                if (editor.document.uri.fsPath === filePath) {
                    vscode.window.showTextDocument(editor.document, editor.viewColumn);
                    return;
                }
            }

            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));

        } else {
            this.vscodeOpenRaw42(fileUri.fsPath);
        }
    }

    private showInformationMessage(message: string) {
        vscode.window.showInformationMessage(Tool.EXTPREFIX + ': ' + message);
    }

    private showWarningMessage(message: string) {
        vscode.window.showWarningMessage(Tool.EXTPREFIX + ': ' + message);
    }

    private showErrorMessage(message: string) {
        vscode.window.showErrorMessage(Tool.EXTPREFIX + ': ' + message);
    }

    private vscodeOpenRaw42(filePath: string) {

        if (typeof filePath === 'undefined') {
            return;
        }

        if (!existsSync(filePath)) {
            return;
        }

        const fileUri = vscode.Uri.file(filePath.concat('.raw42'));

        // add 'raw42' extension to assign an editorLangId
        const hexUri = fileUri.with({ scheme: 'raw42' });

        vscode.commands.executeCommand('vscode.open', hexUri);
    }

    dispose() {
        this.encoder.dispose();
        this.decoder.dispose();
    }
}
