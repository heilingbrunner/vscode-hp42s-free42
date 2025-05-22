export interface IRpnJson {
    header: {
        dl: string;                  // document line of the header
        pl: string;                  // program line
        sep: string;                 // separator
        type: 'header';
        token: {
            rpn: string;             // the RPN string
        };
    };
    tokens: Array<
        {
            dl: string;              // document line of empty line
            pl: string;              // program line
            type: 'empty';
        }
        |
        {
            dl: string;              // document line of the comment
            type: 'comment';
        }
        |
        {
            dl: string;              // document line of the code
            pl: string;              // program line
            sep: string;
            type: 'code';
            token: {
                raw: string;         // the RAW string
                rpn: string;         // the RPN string
                len: string;         // the length of the RPN string
                lid: number;         // language ID of the token
            };
        }
        |
        {
            dl: string;              // document line of the error
            pl: string;              // program line
            sep: string;
            type: 'error';
            msg: string;             // the error RPN string
        }
    >;
}