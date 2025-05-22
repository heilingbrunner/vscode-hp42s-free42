import * as vscode from 'vscode';
import { Configuration } from '../common/configuration';

interface SnippetEntry {
    prefix: string;
    body: string | string[];
    description: string;
}

interface CommandRule {
    name: string;
    reName: RegExp;
    reCommand: RegExp | undefined;
    isValid: (text: string) => boolean;
    message: string;
}

export class RpnDiagnostic {
    private static SUPPORTED_LANGUAGES: string[] = ['hp42s', 'free42'];
    private collection: vscode.DiagnosticCollection;
    private extensionContext: vscode.ExtensionContext | undefined;
    private regexRules: CommandRule[] | undefined;

    // the order of the expression ist important !!!!! (example: ACOSH before ACOS)
    private static cmdRegex: string[] = [
        '0<\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        '0=\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        '0≠\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        '0>\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        '0≤\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        '0≥\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        '1/X',
        '10↑X',
        '4STK',
        '(-)?\\d+(\.|,)?(\\d+)?(ᴇ(-)?(\\d+))?',// numbers
        '-',
        '\\[FIND\\]',
        '\\[MAX\\]',
        '\\[MIN\\]',
        '#B',
        '%CH',
        '%',
        '→DEC',
        '→DEG',
        '→HMS',
        '→HR',
        '→LIST',
        '→OCT',
        '→POL',
        '→RAD',
        '→REC',
        '→',
        '←',
        '↑',
        '↓',
        '\\+/-',
        '\\+',
        '÷',
        '×',
        '⊢(".{0,14}"|\\\'.{0,14}\\\')',
        'A...F',
        'ABS',
        'ACCEL',
        'ACOSH',
        'ACOS',
        'ADATE',
        'ADV',
        'AGRAPH',
        'AIP',
        'ALENG',
        'ALLΣ',
        'ALL',
        'AND',
        'ANUM',
        'AOFF',
        'AON',
        'APPEND',
        'ARCL (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'AROT',
        'ASHF',
        'ASINH',
        'ASIN',
        'ASRN',
        'ASR',
        'ASSIGN (".{0,7}"|\'.{0,7}\') TO (0[1-9]|1[0-8])',
        'ASTO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'ATANH',
        'ATAN',
        'ATIME24',
        'ATIME',
        'ATOX',
        'AVIEW',
        'B\\?',
        'BASE-',
        'BASE\\+',
        'BASE±',
        'BASE÷',
        'BASE×',
        'BD→N',
        'BEEP',
        'BEST',
        'BINM',
        'BINSEP',
        'BIT\\?',
        'BQ→N',
        'BRESET',
        'BS→N',
        'BSIGNED',
        'BWRAP',
        'C\\?',
        'C.E↑X-1',
        'C.LN1\\+X',
        'C→N',
        'CB',
        'CC',
        'CF (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        'CLA',
        'CLD',
        'CLK12',
        'CLK24',
        'CLKEYS',
        'CLLCD',
        'CLMENU',
        'CLP (".{0,7}"|\'.{0,7}\')',
        'CLRG',
        'CLST',
        'CLV (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'CLX',
        'CLΣ',
        'COMB',
        'COMPLEX',
        'CORR',
        'COSH',
        'COS',
        'CPX\\?',
        'CPXMAT\\?',
        'CPXRES',
        'CROSS',
        'CSLD\\?',
        'CUSTOM',
        'DATE\\+',
        'DATE',
        'DD→N',
        'DDAYS',
        'DECINT',
        'DECM',
        'DECSEP',
        'DEG',
        'DELAY',
        'DELR',
        'DEPTH',
        'DET',
        'DIM\\?',
        'DIM (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'DMY',
        'DOT',
        'DOW',
        'DQ→N',
        'DROPN (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'DROP',
        'DS→N',
        'DSE (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'DUPN (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'DUP',
        'E↑X-1',
        'E↑X',
        'EDITN (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'EDIT',
        'END',
        'ENG (10|11|IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|0[0-9])',
        'ENTER',
        'ERRMSG',
        'ERRNO',
        'EXITALL',
        'EXPF',
        'EXTEND',
        'FC\\?C (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        'FC\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        'FCSTX',
        'FCSTY',
        'FIX (10|11|IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|0[0-9])',
        'FMA',
        'FNRM',
        'FPTEST',
        'FP',
        'FS\\?C (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        'FS\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        'FUNC [0-4][0-4]',
        'GAMMA',
        'GETKEY1',
        'GETKEYA',
        'GETKEY',
        'GETLI (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\'))',
        'GETMI (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|"REGS")',
        'GETM',
        'GRAD',
        'GROW',
        'GTO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|[A-J]|[a-e])',
        'HEADING',
        'HEAD (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'HEIGHT',
        'HEXM',
        'HEXSEP',
        'HMS-',
        'HMS\\+',
        'I-',
        'I\\+',
        'IDENT',
        'INDEX (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'INPUT (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'INSR',
        'INTEG (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'INVRT',
        'IP',
        'ISG (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'J-',
        'J\\+',
        'KEYASN',
        'KEY ((1[0-8]|[1-9]) GTO IND ST (L|T|X|Y|Z)|(1[0-8]|[1-9]) GTO IND (".{1,6}"|\'.{1,6}\')|(1[0-8]|[1-9]) GTO IND [0-9][0-9]|(1[0-8]|[1-9]) GTO (".{1,7}"|\'.{1,7}\')|(1[0-8]|[1-9]) GTO ([0-9][0-9]|[A-J]|[a-e])|(1[0-8]|[1-9]) XEQ IND ST (L|T|X|Y|Z)|(1[0-8]|[1-9]) XEQ IND (".{1,6}"|\'.{1,6}\')|(1[0-8]|[1-9]) XEQ IND [0-9][0-9]|(1[0-8]|[1-9]) XEQ (".{1,7}"|\'.{1,7}\')|(1[0-8]|[1-9]) XEQ ([0-9][0-9]|[A-J]|[a-e]))',
        'L4STK',
        'LASTO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\')|"REGS")',
        'LASTX',
        'LBL ((".{1,7}"|\'.{1,7}\')|([0-9][0-9]|[A-J]|[a-e]))',
        'LCLBL',
        'LCLV (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\')|"REGS")',
        'LENGTH',
        'LINF',
        'LINΣ',
        'LIST\\?',
        'LIST→',
        'LJ',
        'LN1\\+X',
        'LNSTK',
        'LN',
        'LOCAT',
        'LOGF',
        'LOG',
        'LSTO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'LXASTO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\')|"REGS")',
        'MAN',
        'MASKL',
        'MASKR',
        'MAT\\?',
        'MDY',
        'MEAN',
        'MENU',
        'MOD',
        'MVAR (".{1,7}"|\'.{1,7}\')',
        'N!',
        'N→BD',
        'N→BQ',
        'N→BS',
        'N→C',
        'N→DD',
        'N→DQ',
        'N→DS',
        'N→S',
        'NEWLIST',
        'NEWMAT',
        'NN→S',
        'NOP',
        'NORM',
        'NOT',
        'NSTK',
        'OCTM',
        'OCTSEP',
        'OFF',
        'OLD',
        'ON',
        'OR',
        'PCOMPLX',
        'PERM',
        'PGMINT (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'PGMMENU',
        'PGMSLV (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'PGMVAR (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'PICK (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'PIXEL',
        'PI',
        'POLAR',
        'POSA',
        'POS',
        'PRA',
        'PRLCD',
        'PROFF',
        'PROMPT',
        'PRON',
        'PRREG',
        'PRSTK',
        'PRUSR',
        'PRV (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'PRX',
        'PRΣ',
        'PSE',
        'PUTLI (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\'))',
        'PUTMI (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|"REGS")',
        'PUTM',
        'PWRF',
        'R↑N (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'R↑',
        'R↓N (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'R↓',
        'R<>R',
        'RAD',
        'RAN',
        'RCL- (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'RCL\\+ (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'RCL÷ (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'RCL× (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'RCLEL',
        'RCLFLAG',
        'RCLIJ',
        'RCL (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])', // 00-15,16-99 -> 00-99
        'RCOMPLX',
        'RDX,',
        'RDX.',
        'REAL\\?',
        'REALRES',
        'RECT',
        'REV',
        'RJ',
        'RLCN',
        'RLC',
        'RLN',
        'RL',
        'RND',
        'RNRM',
        'ROTXY',
        'RRCN',
        'RRC',
        'RRN',
        'RR',
        'RSUM',
        'RTNERR (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-8])',
        'RTNNO',
        'RTNYES',
        'RTN',
        'S→N',
        'SB',
        'SCI (10|11|IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|0[0-9])',
        'SC',
        'SDEV',
        'SEED',
        'SF (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        'SIGN',
        'SINH',
        'SIN',
        'SIZE ([0-9][0-9][0-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9])',
        'SKIP',
        'SLN',
        'SLOPE',
        'SL',
        'SOLVE (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'SQRT',
        'SRN',
        'SR',
        'STO- (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'STO\\+ (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'STO÷ (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'STO× (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'STOEL',
        'STOFLAG',
        'STOIJ',
        'STOP',
        'STO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])', // 00-15,16-99 -> 00-99
        'STR\\?',
        'STRACE',
        'SUBSTR',
        'SUM',
        'TANH',
        'TAN',
        'TIME',
        'TONE (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'TRACE',
        'TRANS',
        'TYPE\\?',
        'UNPICK (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9])',
        'UVEC',
        'VARMENU (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'VARMNU1 (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\'))',
        'VIEW (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9])',
        'WIDTH',
        'WMEAN',
        'WRAP',
        'WSIZE\\?',
        'WSIZE',
        'X↑2',
        'X<\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X<>F',
        'X<>Y',
        'X<> (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X<0\\?',
        'X<Y\\?',
        'X=\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X≠\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X=0\\?',
        'X≠0\\?',
        'X=Y\\?',
        'X≠Y\\?',
        'X>\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X>0\\?',
        'X>Y\\?',
        'X≤\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X≤0\\?',
        'X≤Y\\?',
        'X≥\\? (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'X≥0\\?',
        'X≥Y\\?',
        'XASTO (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|ST (L|T|X|Y|Z)|(".{1,7}"|\'.{1,7}\')|[0-9][0-9]|"REGS")',
        'XEQ (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|(".{1,7}"|\'.{1,7}\')|([0-9][0-9]|[A-J]|[a-e]))',
        'XOR',
        'XSTR ((".{0,13}"|\'.{0,13}\')|(".{14,22}"|\'.{14,22}\'))',
        'XTOA',
        'XVIEW',
        'Y↑X',
        'YINT',
        'YMD',
        'Σ-',
        'Σ\\+',
        'ΣREG\\?',
        'ΣREG (IND ST (L|T|X|Y|Z)|IND (".{1,6}"|\'.{1,6}\')|IND [0-9][0-9]|[0-9][0-9])',
        '(".{1,15}"|\'.{1,15}\')',
    ];

    constructor() {
        this.collection = vscode.languages.createDiagnosticCollection('hp42s');
    }

    public activate(context: vscode.ExtensionContext) {

        // Store the context for later use
        this.extensionContext = context;

        // when opening file
        context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => {
            if (this.isSupported(doc)) {
                this.validate(doc);
            }
        }));

        // when changing file
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
            if (this.isSupported(e.document)) {
                this.validate(e.document);
            }
        }));

        // Initial check of all open documents
        vscode.workspace.textDocuments.forEach(doc => {
            if (this.isSupported(doc)) {
                this.validate(doc);
            }
        });
    }

    private isSupported(doc: vscode.TextDocument): boolean {
        return RpnDiagnostic.SUPPORTED_LANGUAGES.includes(doc.languageId);
    }

    private async validate(document: vscode.TextDocument) {
        // read workspace Configuration
        let config = new Configuration(true);

        // check if diagnostic is enabled
        if (!config.enableDiagnostic) {
            this.collection.clear();
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];

        // all rules here ...
        diagnostics.push(...this.checkStringLength(document));
        diagnostics.push(...this.checkStringCharacterValidity(document));

        // not yet implemented/correct
        //diagnostics.push(...this.checkLineContextRules(document));
        diagnostics.push(...await this.checkCommandsByRegex(document));

        this.collection.set(document.uri, diagnostics);
    }

    private checkStringLength(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];

        // Command strings (with IND or direct)
        // Updated regex to handle both space and ▸ between line number and commands
        const commandRegex = /^(\d+(?:\s+|▸))?(LBL|A?STO|A?RCL)(\+|-|×|÷)?(\s+)(IND\s+)?(".*?"|'.*?')/g;

        // Standalone strings
        const standaloneRegex = /^(\d+\s+)?(⊢)?(".*?"|'.*?')(?:\s+.*)?$/g;

        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
            const lineText = document.lineAt(lineNumber).text;
            const commentSplit = lineText.split('//')[0]; // Ignore comments

            // First check for command strings
            let commandMatch: RegExpExecArray | null;
            let foundCommand = false;
            commandRegex.lastIndex = 0; // Reset regex index

            while ((commandMatch = commandRegex.exec(commentSplit)) !== null) {

                foundCommand = true;

                const commandPrefix = commandMatch[1] || '';
                const command = commandMatch[2];
                const modifier = commandMatch[3] || '';
                const space = commandMatch[4];
                const indirect = commandMatch[5] || '';
                const content = commandMatch[6];

                let maxLength = 7 + 2; // default variable max length 7 plus 2 quotes for normal commands
                if (indirect) {
                    // hp42s-om-en.pdf page 74
                    maxLength = 6 + 2; // max length 6 plus 2 quotes for indirect addressing
                }

                if (content.length > maxLength) {

                    // Calculate position correctly for both formats
                    const commandStart = commandMatch.index + commandPrefix.length;
                    const start = commandStart + command.length + modifier.length + space.length + indirect.length;
                    const end = start + content.length;
                    const range = new vscode.Range(lineNumber, start, lineNumber, end);

                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Name too long (${content.length - 2}, max. ${maxLength - 2})`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }

            // If no command was found, check for standalone strings
            if (!foundCommand) {

                let standaloneMatch: RegExpExecArray | null;

                standaloneRegex.lastIndex = 0; // Reset regex index

                while ((standaloneMatch = standaloneRegex.exec(commentSplit)) !== null) {
                    const content = standaloneMatch[3];

                    let maxLength = 15; // max length for standalone strings
                    const t_str = standaloneMatch[2] || '';
                    if(t_str){
                        maxLength = 14;
                    }

                    // Skip this if it's an empty string or very short
                    if (content && content.length - 2 > maxLength) {

                        const lineStart = standaloneMatch[1]?.length || 0;
                        const start = standaloneMatch.index + lineStart;
                        const end = start + standaloneMatch[3].length + 1; // +2 for quotes
                        const range = new vscode.Range(lineNumber, start, lineNumber, end);

                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `String too long (${content.length - 2}, max. ${maxLength})`,
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }
            }
        }

        return diagnostics;
    }

    private checkStringCharacterValidity(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];

        // see character table hp42s-om-en.pdf p.288
        // valid  : ÷×√∫░Σ▶π¿≤␊≥≠↵↓→←µμ£₤°ÅÑÄ∡ᴇÆ…␛ÖÜ▒■ !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]↑_`abcdefghijklmnopqrstuvwxyz{|}~⊦¥
        // unvalid: Ω (from plus42)
        // µ (U+00B5)
        // μ (U+03BC)
        // ₤
        const regex = /^["'÷×√∫░Σ▸π¿≤␊≥≠↵↓→←µμ£°ÅÑÄ∡ᴇÆ…␛ÖÜ▒■ !#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\]↑_`abcdefghijklmnopqrstuvwxyz{|}~⊦¥]*$/;

        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
            const line = document.lineAt(lineNumber).text;

            // Split the line at comment marker to ignore strings in comments
            const codePart = line.split('//')[0];

            // Remove leading line numbers and whitespace
            const codeWithoutLineNumber = codePart.replace(/^\s*\d+\s+/, '');

            // Find all quoted strings in the code part (before any comment and without line numbers)
            const stringRegex = /(['"])(.*?)\1/g;
            let match;

            while ((match = stringRegex.exec(codeWithoutLineNumber)) !== null) {
                const quoteChar = match[1]; // ' or "
                const content = match[2];   // string content without quotes

                if (!regex.test(content)) {
                    // Calculate actual position in the original line
                    const leadingPartLength = codePart.length - codeWithoutLineNumber.length;
                    const start = leadingPartLength + match.index;
                    const end = start + match[0].length;
                    const range = new vscode.Range(lineNumber, start, lineNumber, end);

                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `String contains unvalid character.`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }
        }

        return diagnostics;
    }

    private checkLineContextRules(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];

        interface ContextRule {
            name: string;
            match: RegExp;
            preCondition?: RegExp;
            postCondition?: RegExp;
            message: string;
        }

        const rules: ContextRule[] = [
            // {
            //     name: 'string-before-key-xeq',
            //     match: /\bKEY\s+\d+\s+XEQ\b/,                                     // before this
            //     preCondition: /^(\d+\s+)?".{0,}"|'.{0,}'(\s+|$)/,                           // must be that
            //     message: `Missing string before 'KEY ... XEQ ...' statement.`
            // },
            // {
            //     name: 'string-before-prompt',
            //     match: /\bPROMPT(\s+|$)/,                                          // before this
            //     preCondition: /^(\d+\s+)?".{1,}"|'.{1,}'(\s+|$)/,                           // must be that
            //     message: `Missing string before 'PROMPT' statement.`
            // },
            //   {
            //     name: 'string-before-aview',
            //     match: /\bAVIEW(\s+|$)/,                                           // before this
            //     preCondition: /^(\d+\s+)?".{1,}"|'.{1,}'(\s+|$)/,                           // must be that
            //     message: `Missing string before 'AVIEW' statement.`
            //   },
            //   {
            //     name: 'gto-after-flag-test',
            //     match: /(C\?|FS\?C|FS\?|FC\?C|FC\?)(\s+|$)/,                    // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                          // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after flag test ('FS?','FC?','FC?C',...).`
            //   },
            //   {
            //     name: 'gto-after-type-test',
            //     match: /(REAL\?|CPXMAT\?|CPX\?|MAT\?|STR\?)(\s+|$)/,            // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                          // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after type test ('REAL?','CPX?','MAT?','STR?'...).`
            //   },
            //   {
            //     name: 'gto-after-bit-test',
            //     match: /(BIT\?|B\?)(\s+|$)/,                                    // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                          // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after bit test ('BIT?','B?').`
            //   },
            //   {
            //     name: 'gto-after-csld-test',
            //     match: /(CSLD\?)(\s+|$)/,                                       // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                          // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after 'caller stack lift disabled' test ('CSLD?').`
            //   },
            //   {
            //     name: 'gto-after-xy-test',
            //     match: /(X=Y\?|X≠Y\?|X<Y\?|X>Y\?|X≤Y\?|X≥Y\?)(\s+|$)/,          // after this
            //     postCondition: /^(\d+\s+)?GTO\s+/,                              // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after X,Y-test ('X=Y?','X≠Y?','X<Y?',...).`
            //   },
            //   {
            //     name: 'gto-after-x0-test',
            //     match: /(X=0\?|X≠0\?|X<0\?|X>0\?|X≤0\?|X≥0\?)(\s+|$)/,          // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                          // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after X,0-test ('X=0?','X≠0?','X<0?',...).`
            //   },
            //   {
            //     name: 'gto-after-x-test',
            //     match: /(X=\?|X≠\?|X<\?|X>\?|X≤\?|X≥\?)(\s+|$)/,                            // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                            // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after X-test ('X=?','X≠?','X<?',...).`
            //   },
            //   {
            //     name: 'gto-after-0-test',
            //     match: /(0=\?|0≠\?|0<\?|0>\?|0≤\?|0≥\?)(\s+|$)/,                            // after this
            //     postCondition: /^(\d+\s+)?GTO(\s+|$)/,                            // must be that
            //     message: `Do-If-True: Missing 'GTO ...' after 0-test ('0=?','0≠?','0<?',...).`
            //   },
            //
            // CSLD? variant#1: normal menu
            // MENU
            // STOP
            //
            // variant#2: using R/S loop LBL A/GTO A keeps the program running
            // MENU
            // LBL A
            // STOP
            // GTO A
            //
            // {
            //   name: 'stop-after-menu',
            //   match: /\bMENU(\s+|$)/i,
            //   postCondition: /\bSTOP(\s+|$)/i,
            //   message: `Missing 'STOP' after 'MENU'.`
            // }
        ];

        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {

            const currentLine = document.lineAt(lineNumber).text.trim();
            const prevLine = lineNumber > 0 ? document.lineAt(lineNumber - 1).text.trim() : '';
            const nextLine = lineNumber < document.lineCount - 1 ? document.lineAt(lineNumber + 1).text.trim() : '';

            for (const rule of rules) {
                if (rule.match.test(currentLine)) {

                    // Check preCondition
                    if (rule.preCondition && !rule.preCondition.test(prevLine)) {
                        const range = new vscode.Range(lineNumber, 0, lineNumber, currentLine.length);
                        diagnostics.push(new vscode.Diagnostic(range, rule.message, vscode.DiagnosticSeverity.Warning));
                    }
                    // Check postCondition
                    if (rule.postCondition && !rule.postCondition.test(nextLine)) {
                        const range = new vscode.Range(lineNumber, 0, lineNumber, currentLine.length);
                        diagnostics.push(new vscode.Diagnostic(range, rule.message, vscode.DiagnosticSeverity.Warning));
                    }

                }
            }
        }

        return diagnostics;
    }

    private async checkCommandsByRegex(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];

        if (!this.extensionContext) {
            return diagnostics;
        }

        try {
            const rules = this.regexRules || await this.initCommandRules();

            // Cache the rules if this is the first time loading
            if (!this.regexRules) {
                this.regexRules = rules;
            }

            // Split the document into lines and process each line
            for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {

                const line = document.lineAt(lineNumber).text;
                const codePart = line.split('//')[0].trim(); // Ignore comments

                // Skip empty lines
                if (!codePart) { 
                    continue;
                }

                let checked = false;
                // Check each rule against the line
                for (const rule of rules) {

                    if (rule.reName.test(codePart)) {

                        checked = true;

                        if (!rule.isValid(codePart)) {
                            const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);

                            diagnostics.push(new vscode.Diagnostic(
                                range,
                                rule.message,
                                vscode.DiagnosticSeverity.Warning
                            ));
                        }

                    }

                    if (checked) {
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error applying command rules:', error);
        }

        return diagnostics;
    }

    private async initCommandRules(): Promise<CommandRule[]> {

        let rules: CommandRule[] = [];

        for (const line of RpnDiagnostic.cmdRegex) {

            try {
                const match = line.match(/^([^\s]+)/);

                if (match) {
                    const name = match[1];
                    const pattern = line.replace(/\s/, '\\s+');

                    const reName = new RegExp('^(\\d+(\\s+|▸))' + name);
                    const reCommand = new RegExp('^(\\d+(\\s+|▸))?' + pattern + '(\\s+|//.*)?$');

                    // Add the rule
                    rules.push({
                        name: name,
                        reName: reName,
                        reCommand: reCommand,
                        isValid: (text) => {
                            return reCommand.test(text);
                        },
                        message: `Invalid syntax for ${name}. Expected format: ${pattern}`
                    });
                }
                else {
                    console.log('Problem creating regex rule:', line);
                }
            }
            catch (error) {
                console.error('Error creating regex rule:', error);
            }

        }

        return rules;
    }

}
