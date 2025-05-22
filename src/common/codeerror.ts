export class CodeError {
    docLine: string = ''; //index 0,... but document line numer starts at 1 !!
    progLine: string = ''; //index 0,... but document line numer starts at 1 !!
    code: string;
    message: string = '';

    constructor(dl: string, pl: string, code: string, message: string) {
        this.docLine = dl;
        this.progLine = pl;
        this.code = code;
        this.message = message;
    }

    toString(useHex: boolean): string {
        const docLine = (this.docLine !== '' ? (this.docLine) + ', ' : '');
        const progLine = (this.progLine !== '' ? (useHex ? this.toHex(Number(this.progLine), 8) : this.progLine) : '');

        const codeextract = (this.code.length > 48) ? this.code.substring(0, 48) + ' ...'
            : (this.code.length > 24) ? this.code.substring(0, 24) + ' ...'
                : (this.code.length > 12) ? this.code.substring(0, 12) + ' ...'
                    : (this.code.length > 6) ? this.code.substring(0, 6) + ' ...'
                        : this.code;

        return (
            'Error [' +
            docLine +
            progLine +
            "]; Message: '" +
            this.message +
            "'; Code: '" +
            codeextract + "'");
    }

    private toHex(number: number, digits: number) {
        return ('0'.repeat(digits) + ((number + 1) & (Math.pow(16, digits) - 1)).toString(16)).slice(-digits).toUpperCase();
    }
}
