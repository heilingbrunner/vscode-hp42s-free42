export interface IRawJson {
    tokens: Array<
        {
            pos: string;             // start position of matching bytes
            pl: string;              // n-th command as program line
            type: 'code';
            token: {
                raw: string;         // the RAW string
                rpn: string;         // the RPN string
                len: string;         // length of the token
                lid: number;         // language ID of the token
            };
        }
        |
        {
            pos: string;             // start position of error bytes
            pl: string;              // n-th command as program line
            type: 'error';
            msg: string;             // the error RAW string
        }
    >;
}