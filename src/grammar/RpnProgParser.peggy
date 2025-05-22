// free42-RPN-PARSER
// J.Heilingbrunner
// This grammar is based on the hp42s/free42 RPN programming language.
// The parser transforms the RPN code into a JSON objects with RAW opcodes.
// It covers the commands from free42 (https://thomasokken.com/free42/).
// The parser is written in peggy.js (https://peggyjs.org/).

// Indirect addressing hp42s-om-en.pdf page 74:
//   Alpha parameters specified indirectly are limited to six
//   characters because Alpha strings stored in variables and

// free42 commands from core_table.cc
// https://github.com/thomasokken/free42/blob/v3.3.2/common/core_tables.cc

{{
    var version = "v3.3.4";
    var hp41c = 0;
    var hp42s = 1;
    var free42 = 2;
    var log = '.';
    var charMap = new Map();
    var initDone = false;
    var dl = 0;

    function init() {

        if (initDone) {
            return;
        }

        // see character table hp42s-om-en.pdf p.288
        var charArr = [
        { key: '÷', value: 0 },
        { key: '×', value: 1 },
        { key: '√', value: 2 },
        { key: '∫', value: 3 },
        { key: '░', value: 4 },
        { key: 'Σ', value: 5 },
        { key: '▸', value: 6 },  // ▸, not ▶
        { key: 'π', value: 7 },
        { key: '¿', value: 8 },
        { key: '≤', value: 9 },
        { key: '␊', value: 10 },// ␊ see: https://www.compart.com/de/unicode/U+240A
        { key: '≥', value: 11 },
        { key: '≠', value: 12 },
        { key: '↵', value: 13 },
        { key: '↓', value: 14 },
        { key: '→', value: 15 },
        { key: '←', value: 16 },
        { key: 'µ', value: 17 }, // µ (U+00B5)
        { key: 'μ', value: 17 }, // μ (U+03BC)
        { key: '£', value: 18 },
        { key: '₤', value: 18 },
        { key: '°', value: 19 },
        { key: 'Å', value: 20 },
        { key: 'Ñ', value: 21 },
        { key: 'Ä', value: 22 },
        { key: '∡', value: 23 },
        { key: 'ᴇ', value: 24 },
        { key: 'Æ', value: 25 },
        { key: '…', value: 26 },
        { key: '␛', value: 27 }, // ␛ see: https://www.compart.com/de/unicode/U+241B
        { key: 'Ö', value: 28 },
        { key: 'Ü', value: 29 },
        { key: '▒', value: 30 },
        { key: '■', value: 31 },
        { key: ' ', value: 32 },
        { key: '!', value: 33 },
        { key: '"', value: 34 }, // double quote !!
        { key: '#', value: 35 },
        { key: '$', value: 36 },
        { key: '%', value: 37 },
        { key: '&', value: 38 },
        { key: "'", value: 39 }, // single quote !!
        { key: '(', value: 40 },
        { key: ')', value: 41 },
        { key: '*', value: 42 },
        { key: '+', value: 43 },
        { key: ',', value: 44 },
        { key: '-', value: 45 },
        { key: '.', value: 46 },
        { key: '/', value: 47 },
        { key: '0', value: 48 },
        { key: '1', value: 49 },
        { key: '2', value: 50 },
        { key: '3', value: 51 },
        { key: '4', value: 52 },
        { key: '5', value: 53 },
        { key: '6', value: 54 },
        { key: '7', value: 55 },
        { key: '8', value: 56 },
        { key: '9', value: 57 },
        { key: ':', value: 58 },
        { key: ';', value: 59 },
        { key: '<', value: 60 },
        { key: '=', value: 61 },
        { key: '>', value: 62 },
        { key: '?', value: 63 },
        { key: '@', value: 64 },
        { key: 'A', value: 65 },
        { key: 'B', value: 66 },
        { key: 'C', value: 67 },
        { key: 'D', value: 68 },
        { key: 'E', value: 69 },
        { key: 'F', value: 70 },
        { key: 'G', value: 71 },
        { key: 'H', value: 72 },
        { key: 'I', value: 73 },
        { key: 'J', value: 74 },
        { key: 'K', value: 75 },
        { key: 'L', value: 76 },
        { key: 'M', value: 77 },
        { key: 'N', value: 78 },
        { key: 'O', value: 79 },
        { key: 'P', value: 80 },
        { key: 'Q', value: 81 },
        { key: 'R', value: 82 },
        { key: 'S', value: 83 },
        { key: 'T', value: 84 },
        { key: 'U', value: 85 },
        { key: 'V', value: 86 },
        { key: 'W', value: 87 },
        { key: 'X', value: 88 },
        { key: 'Y', value: 89 },
        { key: 'Z', value: 90 },
        { key: '[', value: 91 },
        { key: '\\', value: 92 }, // for escaped backslash required for '\'
        { key: ']', value: 93 },
        { key: '↑', value: 94 },
        { key: '_', value: 95 },
        { key: '`', value: 96 },
        { key: 'a', value: 97 },
        { key: 'b', value: 98 },
        { key: 'c', value: 99 },
        { key: 'd', value: 100 },
        { key: 'e', value: 101 },
        { key: 'f', value: 102 },
        { key: 'g', value: 103 },
        { key: 'h', value: 104 },
        { key: 'i', value: 105 },
        { key: 'j', value: 106 },
        { key: 'k', value: 107 },
        { key: 'l', value: 108 },
        { key: 'm', value: 109 },
        { key: 'n', value: 110 },
        { key: 'o', value: 111 },
        { key: 'p', value: 112 },
        { key: 'q', value: 113 },
        { key: 'r', value: 114 },
        { key: 's', value: 115 },
        { key: 't', value: 116 },
        { key: 'u', value: 117 },
        { key: 'v', value: 118 },
        { key: 'w', value: 119 },
        { key: 'x', value: 120 },
        { key: 'y', value: 121 },
        { key: 'z', value: 122 },
        { key: '{', value: 123 },
        { key: '|', value: 124 },
        { key: '}', value: 125 },
        { key: '~', value: 126 },
        { key: '⊦', value: 127 },
        { key: '¥', value: 129 }
        ];
        // { key: ':', value: 128 }, double see value { key: ':', value: 58 }
        // new in PLUS42, but causes error !!!!
        // { key: 'Ω', value: 130 }
        // { key: '´', value: ??? }

        var l = charArr.length;
        for (var i = 0; i < l; i++) {
            var k = charArr[i].key;
            var v = charArr[i].value;
            charMap.set(k, parseInt(v));
        }

        log = 'charMap.size: ' + charMap.size;
    }

    function getLog() {
        return log;
    }

    function d2h(dec) {
        return Math.abs(dec).toString(16).toUpperCase();
    }

    function b2h(byte) {
        // convert byte to hex string
        
        // Changing integers (size one byte, 0-255) into hex string . 123 -> 7B, 255 -> FF
        // Step by step:
        // 
        // byte & 0xff   - Performs a bitwise AND operation with 255 (0xff in hex) to ensure the value is within the valid byte range (0-255). This masks off any bits beyond the lowest 8 bits.
        // 
        // .toString(16) - Converts the numeric value to a hexadecimal string. For example, 10 becomes "a", 15 becomes "f", 16 becomes "10".
        // 
        // "0" + ...     - Prepends a leading zero to the string. This ensures single-digit hex values have a leading zero.
        // 
        // .slice(-2)    - Takes only the last two characters of the string:
        // 
        // For values 0-15,   it keeps the leading "0" plus the hex digit
        // For values 16-255, it keeps just the two hex digits, discarding the extra leading "0"
        // .toUpperCase() - Converts any lowercase letters (a-f) to uppercase (A-F)
        // 
        // Examples:
        // For byte = 10: "0A"
        // For byte = 15: "0F"
        // For byte = 16: "10"
        // For byte = 255: "FF"
        // This function ensures consistent two-character hex representation of byte values for the raw opcodes used in the free42 calculator emulator's programming language.

        let hex = ("0" + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
        return hex;
    }

    function s2s(stk) {
        // convert stack to number

        if (stk === null)
            return '?';

        var st = '';
        
        switch(stk){ 
            case 'T':
                st=0;
                break; 
            case 'Z':
                st=1;
                break;
            case 'Y':
                st=2;
                break;
            case 'X':
                st=3;
                break; 
            case 'L':
                st=4;
                break; 
            default: 
                st=-1;
        };
        
        return st;
    }

    function n2r(raw, num) {
        // insert number into raw string

        if (raw !== undefined && num !== undefined) {
            let match = null;

            switch (true) {

                case /0l/.test(raw):
                    // local label
                    raw = raw.replace(/0l/, b2h(parseInt(num,10) + 1));
                    break;

                case /0n/.test(raw):
                    // numeric label 00-09, digits 0-9
                    raw = raw.replace(/0n/, "0" + parseInt(num,10));
                    break;

                case /Bl/.test(raw):
                    // num = '00' - '14', first /Bl/ then only /l/ !!!
                    raw = raw.replace(/l/, (parseInt(num,10) + 1).toString(16).toUpperCase());
                    break;

                case /er/.test(raw):
                    raw = raw.replace(/er/, b2h(parseInt(num,10)));
                    break;
                
                case /fl/.test(raw):                    
                    raw = raw.replace(/fl/, b2h(parseInt(num)));
                    break;
                
                case /kk/.test(raw):
                    raw = raw.replace(/kk/, b2h(parseInt(num,10) - 1));
                    break;

                case /ll/.test(raw):
                    // alpha label as number A-J,a-e
                    raw = raw.replace(/ll/, "CF " + b2h(parseInt(num,10)));
                    break;

                case /nn/.test(raw):
                    // numeric label 00-99, digits 00-11
                    raw = raw.replace(/nn/, b2h(parseInt(num,10)));
                    break;

                case /rr/.test(raw):
                    raw = raw.replace(/rr/, b2h(parseInt(num,10)));
                    break;

                case /tn/.test(raw):
                    // TONE n
                    raw = raw.replace(/tn/, b2h(parseInt(num,10)));
                    break;
                

                case /ss ss/.test(raw):
                    // SIZE
                    raw = raw.replace(/ss ss/, b2h(parseInt(num,10) / 256) + " " + b2h(parseInt(num,10) % 256));
                    break;

                // nested function calls !
                //-/k0/ before /8r/ !---------------------------------------------- 
                // see KEY_key_GTO_IND_rr:
                //                   n2r(n2r('F3 E3 k0 8r',p),q)
                // 1. p is key    ->    n2r('F3 E3 k0 8r',p)        using p at k0
                // 2. q is number -> n2r(   'F3 E3  p 8r'   ,q)     using q at 8r
                // Result         ->       'F3 E3  p  q'
                case /k0/.test(raw):
                    raw = raw.replace(/k0/, b2h(parseInt(num,10)));
                    break;

                case /8r/.test(raw):
                    // 8r: r + 128 -> 80...
                    raw = raw.replace(/8r/, b2h((8 * 16) + parseInt(num,10)));
                    break;
                //-----------------------------------------------------------------    

                // using match groups

                case /[23]r/.test(raw):
                    // 2r: r, 0-F
                    // 3r: r, 0-F
                    match = raw.match(/([23])r/);
                    if (match) {
                        raw = raw.replace(/([23])r/, match[1] + d2h(num));
                    }
                    break;

                case /(7|F)t/.test(raw):
                    // 7t or Ft
                    match = raw.match(/(7|F)t/);
                    if (match) {
                        raw = raw.replace(/(7|F)t/, match[1] + s2s(num));
                    }
                    break;

                // using second num matching

                case /0e/.test(raw):
                	// 00-99, A-J, a-e
                    //numeric: 00-99
                    if (/([0-9][0-9])/.test(num)) {
                    	raw = raw.replace(/0e/, b2h(parseInt(num, 10)));
                    }

                    //alpha: A-J
                    if (/[A-J]/.test(num)) {
                    	raw = raw.replace(/0e/, b2h(parseInt(charMap.get(num), 10) + 37));
                    }

                    //alpha: a-e
                    if (/[a-e]/.test(num)) {
                    	raw = raw.replace(/0e/, b2h(parseInt(charMap.get(num), 10) + 26));
                    }
                    break;
                    
                case /1e/.test(raw):
                	// 15-99, A-J, a-e
                    //numeric: 15-19, 20-99
                    if (/(1[5-9]|[2-9][0-9])/.test(num)) {
                    	raw = raw.replace(/1e/, b2h(parseInt(num,10)));
                    }

                    //alpha: A-J, J: 74 + 37 = 111 -> hex: 6F
                    if (/[A-J]/.test(num)) {
                    	raw = raw.replace(/1e/, b2h(parseInt(charMap.get(num),10) + 37));
                    }

                    //alpha: a-e
                    if (/[a-e]/.test(num)) {
                    	raw = raw.replace(/1e/, b2h(parseInt(charMap.get(num),10) + 26));
                    }
                    break;
                    
                default:
                    break;
            }

        } else {
            raw = '?';// undefined;
        }

        return raw;
    }

    function n2h(num) {
        // convert number to hex
        if (num !== undefined) {
        // '1.234E-455' -> 11 1A 12 13 14 1B 1C 14 15 15 00
        num =
            num
            .replace(/(\d)/g, ' 1$1')  // replace 1234E-455              -> 11 .  12 13 14 E  -  14 15 15
            .replace(/\./, ' 1A')      // replace .                      -> 11 1A 12 13 14 E  -  14 15 15
            .replace(/(ᴇ|e|E)/, ' 1B') // replace (ᴇ|e|E)                -> 11 1A 12 13 14 1B -  14 15 15
            .replace(/-/g, ' 1C')      // replace - -> 1C                -> 11 1A 12 13 14 1B 1C 14 15 15
            .replace(' ', '') + ' 00'; // remove first space + append 00 -> 11 1A 12 13 14 1B 1C 14 15 15 00
        }

        return num;
    }

    function s2h(raw, str) {

        // insert string into raw opcode
        if (raw !== undefined) {

            if (str !== undefined) {

            	str = str.toString();
                
                let len_str = str.length;
                let pos_Fn = raw.indexOf("Fn");

                let max_len = 7;
                switch (true) {
                    case raw.match("Fn A7 41") !== null: // XSTR
                        max_len = 13;
                        break;

                    case raw.match("Fn 7F") !== null:
                        max_len = 14;
                        break;

                    case raw.match("Fn") !== null:      // STR
                        max_len = 15;
                        break;

                    default:
                        break;
                }

                if (len_str > max_len) {
                    // TODO: error !!
                }

                // loop each character in str and append hex to opcode
                str.split("").forEach((character) => {
                    let hexcode = character.charCodeAt(0);

                    //special char ?
                    if (charMap.has(character)) {
                        let v = charMap.get(character);
                        hexcode = v ? v : 0;
                    }

                    raw += " " + b2h(hexcode);
                });

                // For ASSIGN
                // swap kk at the end of raw
                raw = raw.replace(/ kk(.*)/, "$1 kk");

                const length_hex_after_Fn = (raw.length - (pos_Fn + 2)) / 3;

                // concat three parts ...
                raw =
                raw.substr(0, pos_Fn) +                // 1. part
                b2h(240 + length_hex_after_Fn) +       // 2. part
                raw.substr(pos_Fn + 2);                // 3. part

            } else {
                raw = undefined;
            }
        }

        return raw;
    }

    function s2hextended(raw1, raw2, str) {
        // insert long string into two raw opcodes for XSTR
        let raw = undefined;

        // insert string into two raw opcodes
        if ((raw1 !== undefined) && (raw2 !== undefined)) {

            let len_str = str.length;

            if (len_str > 13 && len_str <= 22) {

                let str1 = str.substr(0, 13);
                let str2 = str.substr(13, 22);

                raw = s2h(raw1, str1) + " " + s2h(raw2, str2);
            
            } else {
                raw = undefined;
            }
        }

        return raw;
    }
    
    function ls(s, min, max) {
        // check min, max length of string
        return (s.length >= min) && (s.length <= max);
    }
    
    function lq(s, min, max) {
    	// check min, max length of double quoted string

        s = s.trim();
    	var left = s.indexOf('"');
        var right = s.lastIndexOf('"');
        
        return (left === 0) && (max >= (right - (left+1))) && (min <= (right - (left+1)));
    }

    function sq(p) {
        // get single or double quote from p content
        return (p.length > 0 && p.includes('"')) ? "'" : '"';
    }

}}

{
    dl = 0;
}

//-- Production ---------------------------------------------------------------------------------------------

rpn
    = init p:(prog)+ ws? eof
    { 
        return { version: version, progs: p };
    }

init
    = '' 
    { 
        init(); 
        return null; 
    }

prog
    = 
    (empty / comment_line)* // empty or comment lines
    h:header                // header line
    t:
    ( 
        comment_line /      // comment line
        code /              // code line
        error_code /        // everything else is an error line, unknown things, which begins with a digit
        error_format /      // everything else is an error line, unknown things, which does not begin with a digit
        empty               // empty line
    )+
    { 
        return { header: h, tokens: t } ; 
    }

//--lines ending with lf ---------------------------------------------------------------------------------------

header
    = p:$(digit+) s:sep t:head ws? comment_inline? eol 
    { 
        dl += 1; 
        return { dl: dl, pl: p, sep: s, type: 'header', token: t };
    }

code
    = p:$(digit+) s:sep t:token ws? comment_inline? eol_eof
    { 
        dl += 1;
        t.len = (t.raw.length + 1) / 3;
        return { dl: dl, pl: p, sep: s, type: 'code', token: t }; 
    }

error_code
    // some text with leading line number
    // match everything, but no head (!head), to start new prog
	= p:$(digit+) s:sep* !head e:$(any /'"')* ws? comment_inline? eol_eof 
    { 
        dl += 1; 
        return { dl: dl, pl: p, sep: ' ', type: 'error', eid: 1, msg: e };
    }

error_format
    // some text without leading line number
    = !(digit+) !comment_start e:$( (!eol .)+ ) eol_eof
    {
        dl += 1;
        return { dl: dl, pl: '??', type: 'error', eid: 2, msg: e };
    }

comment_line
    // comment line 
    = ws comment_start (!eol (any / '"'))* eol_eof 
    { 
        dl += 1;
        return { dl: dl, type: 'comment' }; 
    }

comment_inline
    // comment after code
    = ws comment_start c:$(!eol .)* { return c.trim(); }

comment_start
    = '//'

empty
    = eol 
    { 
        dl += 1; 
        return { dl: dl, type: 'empty' }; 
    }

head
    = '{' ws? h:head_content? ws? '}' 
    { 
        return { rpn: `{ ${h ?? ""} }` };
    }

head_content
    = $([^}]*)  // match everything up to the closing brace

//-----------------------------------------------------------------------------------------------------------

token              // rename to 'token_not_used', when using 'debug_token'
    = 
    (
        r_str /
        r_prio /
        r_0 / r_1 / r_4 /
        r_num /
        r_A_F /
        r_G_L /
        r_M_S /
        r_T_Y
    )

r_A_F
    = r_A / r_B / r_C / r_D / r_E / r_F

r_G_L
    = r_G / r_H / r_I / r_J / r_K / r_L

r_M_S
    = r_M / r_N / r_O / r_P / r_R / r_S

r_T_Y
    = r_T / r_U / r_V / r_W / r_X / r_Y

debug_token // debug only, rename to 'token'
    =
    (        
        r_G 
    )

//-- Patterns -----------------------------------------------------------------------------------------------

_
    // space
    = ' '+ //[ ]

ws
    // Whitespace before newline (optional)
    = [ \t]*

eol
    // End-of-line (Windows or Unix)
    = '\r\n' / '\n'

eof 
    // End-of-file
    = !.

eol_eof
    // Matches end of line or end of file
    = eol / eof

lf
    = ((' ')* eol?)

sep
    = (' '/'▸'/'▶'/'>') 
    { 
        return ' '; 
    }

alpha
    = [a-zA-Z]

digit
    = [0-9]

bracket
    = ('('/')'/'{'/'}'/'['/']')
    
arrow
    = ('↑'/'↓'/'→'/'←')
    
compare
    = ('<'/'>'/'='/'≠'/'≤'/'≥')
    
math
    = ('Σ'/'∫'/'√'/'∡'/'°'/'µ'/'μ')

punc
    = ('\.'/','/';'/':'/'!'/'?'/'…'/'_'/'`'/'´'/'¿'/'␊') // no '"', "'", see arg_s_...
    
misc
	= ('$'/'*'/'#'/'/'/'■'/'£'/'₤'/'&'/'@'/'\\'/'~'/'|') // escaped \ as '\\

keyboard
    // direct from key press
    = ('+'/'-'/'×'/'÷'/'%'/'π')

umlaut
    //'ö','ä','§' will be removed in Swissmicros Decoder
    = ('Ä'/'Ö'/'Ü'/'Å'/'Ñ')

foc
    = ('░'/'▶'/'[LF]'/'↵'/'ᴇ'/'Æ'/'␛'/'▒'/'■'/'•'/ '*')

others
    // everything else
    = $('├' / 'ß' / 'Ω' / '⊢')
    
any
    = $(alpha / digit / bracket / arrow / compare / math / punc / misc / keyboard / umlaut / foc / others / ' ')

float
    // no float ! free42:1E499 -> JS: Inifinity, { return parseFloat(n.replace('ᴇ','E')); }
    = n:$(('-')? digit+ ('.' digit+)? (('e'/'ᴇ'/'E')[\-]? digit+)?) 
    { 
        return n; 
    } 

integer      
    // no integer ! { return parseInt(n); }
    = n:$(('-')? [1-9] digit*) 
    { 
        return n; 
    } 
    
hex
    = n:'0x'[0-9A-F]+  { return parseInt(n); }

//-- Arguments ----------------------------------------------------------------------------------------------

arg_stk
    = [XYZLT]

arg_n_00_09
    // 00-09
    = $('0' [0-9] )

arg_n_0_9
    // ARG_NUM9
    = [0-9]

arg_n_00_44
    // ARG_FUNC 0-4 0-4
    = $([0-4] [0-4])

arg_k_01_18
    // ASSIGN "ABC" TO 01-18, see hp42s-om-en.pdf, p.72
    = $('0' [1-9] /'1' [0-8])

arg_k_1_18
    // KEY 1-18 GTO 99, see hp42s-om-en.pdf, p.72
    = $('1' [0-8] / [1-9])

arg_e_0_8
    = [0-8]

arg_f_00_99
    //flag 00-99
    = $([0-9] [0-9])


arg_r_00_99 
    // register 00-99
    = $([0-9] [0-9]) 

arg_r_00_15
    // local label 00-15
    = $('0' [0-9] / '1' [0-5]) 

arg_r_16_99
    // register 16-99
    = $('1' [6-9] / [2-9] digit) 


arg_s_0_7
    = '"' s:(any / "'")* '"' & { return ls(s,0,7); } { return s.join(""); }
    / "'" s:(any / '"')* "'" & { return ls(s,0,7); } { return s.join(''); } 

arg_s_1_6
    = '"' s:$(any / "'")* '"' & { return ls(s,1,6); } { return s; }
    / "'" s:$(any / '"')* "'" & { return ls(s,1,6); } { return s; }

arg_s_1_7
    = '"' s:$(any / "'")* '"' & { return ls(s,1,7); } { return s; }
    / "'" s:$(any / '"')* "'" & { return ls(s,1,7); } { return s; }

arg_s_0_13
    = '"' s:$(any / "'")* '"' & { return ls(s,0,13); } { return s; }
    / "'" s:$(any / '"')* "'" & { return ls(s,0,13); } { return s; }

arg_s_0_14
    = '"' s:$(any / "'")* '"' & { return ls(s,0,14); } { return s; }
    / "'" s:$(any / '"')* "'" & { return ls(s,0,14); } { return s; }

arg_s_1_15
    = '"' s:$(any / "'")* '"' & { return ls(s,1,15); } { return s; }
    / "'" s:$(any / '"')* "'" & { return ls(s,1,15); } { return s; }

arg_s_14_22
    = '"' s:$(any / "'")* '"' & { return ls(s,14,22); } { return s; }
    / "'" s:$(any / '"')* "'" & { return ls(s,14,22); } { return s; }


arg_l_00_14
    // local label
    = $('0' [0-9] / '1'[0-4])
    
arg_l_00_e
    // local label
    = $([0-9] [0-9] / [A-J] / [a-e])

arg_l_15_e
    // local label 15-99, A-J, a-e
    = $('1' [5-9] / [2-9] [0-9] / [A-J] / [a-e]) 

arg_sz_00_9999
    // size 00-9999
    = $([0-9] [0-9] [0-9] [0-9] / [0-9] [0-9] [0-9] / [0-9] [0-9]) 

//----------------------------------------------------------------

r_num
    = n:
    (
        // float before integer !
        float /     
        integer
    )
    { return { rpn: n , raw: n2h(n), lid: hp41c }; }
    
r_str
    = 
    (
        T_STR /
        STR
    )

r_prio
    = 
    (
        CHS /
        INV /

        TO_DEC /
        TO_DEG /

        TO_HMS /
        TO_HR /

        TO_LIST /

        TO_OCT /
        TO_POL /

        TO_RAD /
        TO_REC
    )

r_0
    = 
    (
        r_00 /
        r_01 /
        r_02 /
        r_03 /
        r_04 /
        r_05
    )

r_00
    = 
    (
        _0_EQ_NN_IND_ST_stk /
        _0_EQ_NN_IND_rr /
        _0_EQ_NN_IND_nam /
        _0_EQ_NN_ST_stk /
        _0_EQ_NN_rr /
        _0_EQ_NN_REGS /
        _0_EQ_NN_nam
    )

r_01
    =
    (
        _0_GE_NN_IND_ST_stk /
        _0_GE_NN_IND_rr /
        _0_GE_NN_IND_nam /
        _0_GE_NN_ST_stk /
        _0_GE_NN_rr /
        _0_GE_NN_REGS /
        _0_GE_NN_nam
    )

r_02
    =
    (
        _0_GT_NN_IND_ST_stk /
        _0_GT_NN_IND_rr /
        _0_GT_NN_IND_nam /
        _0_GT_NN_ST_stk /
        _0_GT_NN_rr /
        _0_GT_NN_REGS /
        _0_GT_NN_nam
    )

r_03
    =
    (
        _0_LE_NN_IND_ST_stk /
        _0_LE_NN_IND_rr /
        _0_LE_NN_IND_nam /
        _0_LE_NN_ST_stk /
        _0_LE_NN_rr /
        _0_LE_NN_REGS /
        _0_LE_NN_nam
    )

r_04
    =
    (
        _0_LT_NN_IND_ST_stk /
        _0_LT_NN_IND_rr /
        _0_LT_NN_IND_nam /
        _0_LT_NN_ST_stk /
        _0_LT_NN_rr /
        _0_LT_NN_REGS /
        _0_LT_NN_nam
    )

r_05
    =
    (
        _0_NE_NN_IND_ST_stk /
        _0_NE_NN_IND_rr /
        _0_NE_NN_IND_nam /
        _0_NE_NN_ST_stk /
        _0_NE_NN_rr /
        _0_NE_NN_REGS /
        _0_NE_NN_nam
    )

r_1
    =
    (
        _10_POW_X
    )

r_4
    = 
    (
        _4STK
    )

r_A
    = 
    (
        r_A0 /
        r_A1 /
        r_A2 /
        r_A3 /
        r_A4
    )

r_A0
    =
    (
        A_THRU_F /

        ABS /
        ACCEL /

        // keep order !
        ACOSH /
        ACOS /

        ADATE /
        ADD /
        ADV /

        AGRAPH /
        AIP /
        ALENG
    )

r_A1
    =
    (
        // keep order !
        ALL_SIGMA /
        ALL /

        AND /
        ANUM /
        AOFF /
        AON /
        APPEND
    )

r_A2
    =
    (
        ARCL_IND_ST_stk /
        ARCL_IND_rr /
        ARCL_IND_nam /
        ARCL_ST_stk /
        ARCL_rr /
        ARCL_nam /
        AROT /
        ASHF
    )

r_A3
    =
    (
        // keep order !
        ASINH /
        ASIN /

        // keep order !
        ASRN /
        ASR /

        ASSIGN_nam_TO_key /
        ASTO_IND_ST_stk /
        ASTO_IND_rr /
        ASTO_IND_nam /
        ASTO_ST_stk /
        ASTO_rr /
        ASTO_nam
    )

r_A4
    =
    (
        // keep order !
        ATANH /
        ATAN /

        // keep order !
        ATIME24 /
        ATIME /

        ATOX /
        AVIEW
    )

r_B
    = 
    (
        r_B0 /
        r_B1
    )

r_B0
    =
    (
        B_T /
        BASE_CHS /
        BASE_ADD /
        BASE_DIV /
        BASE_MUL /
        BASE_SUB /
        BD_TO_N /
        BEEP
    )

r_B1
    =
    (
        BEST /
        BINM /
        BINSEP /
        BIT_T /
        BQ_TO_N /
        BRESET /
        BS_TO_N /
        BSIGNED /
        BWRAP
    )

r_C
    = 
    (
        r_C0 /
        r_C1 /
        r_C2 /
        r_C3
    )

r_C0
    =
    (
        C_E_POW_X_1 /
        C_LN_1_X /
        C_T /
        C_TO_N /
        CB /
        CC /
        CF_IND_ST_stk /
        CF_IND_rr /
        CF_IND_nam /
        CF_flg
    )

r_C1
    =
    (
        CLA /
        CLD /
        CLK12 /
        CLK24 /
        CLLCD /
        CLMENU /
        CLP /
        CLRG /
        CLST
    )

r_C2
    =
    (
        CLV_IND_ST_stk /
        CLV_IND_rr /
        CLV_IND_nam /
        CLV_nam /

        CLX /
        CLKEYS /
        CL_SIGMA /
        COMB /
        COMPLEX /
        CORR
    )

r_C3
    =
    (
        // keep order !
        COSH /
        COS /

        CPX_T /
        CPXMAT_T /
        CPXRES /
        CROSS /
        CSLD_T /
        CUSTOM
    )

r_D
    = 
    (
        r_D0 /
        r_D1 /
        r_D2 /
        r_D3 /
        r_D4 /
        r_D5
    )

r_D0
    =
    (
        // keep order !
        DATE_ADD /
        DATE /

        DD_TO_N /
        DDAYS /
        DECINT /
        DECM /
        DECSEP
    )

r_D1
    =
    (
        DEG /
        DELAY /
        DELR /
        DEPTH /
        DET /
        DIM_IND_ST_stk /
        DIM_IND_rr /
        DIM_IND_nam /
        DIM_T /
        DIM_nam
    )

r_D2
    =
    (
        DIV /
        DMY /
        DOT /
        DOW /
        DOWN /
        DQ_TO_N
    )

r_D3
    =
    (
        // keep order !
        DROPN_IND_ST_stk /
        DROPN_IND_rr /
        DROPN_IND_nam /
        DROPN_n /
        DROP /

        DS_TO_N
    )

r_D4
    =
    (
        DSE_IND_ST_stk /
        DSE_IND_rr /
        DSE_IND_nam /
        DSE_ST_stk /
        DSE_rr /
        DSE_nam
    )

r_D5
    =
    (
        // keep order !
        DUPN_IND_ST_stk /
        DUPN_IND_rr /
        DUPN_IND_nam /
        DUPN_n /
        DUP
    )

r_E
    = 
    (
        r_E0 /
        r_E1 /
        r_E2
    )

r_E0
    =
    (
        E_POW_X_1 /
        E_POW_X /

        // keep order !
        EDITN_IND_ST_stk /
        EDITN_IND_rr /
        EDITN_IND_nam /
        EDITN_nam /
        EDIT /
        END_0 /
        END_1
    )

r_E1
    =
    (
        ENG_10 /
        ENG_11 /
        ENG_IND_ST_stk /
        ENG_IND_rr /
        ENG_IND_nam /
        ENG_dec
    )

r_E2
    =
    (
        ENTER /
        ERRMSG /
        ERRNO /
        EXITALL /
        EXPF /
        EXTEND
    )

r_F
    = 
    (
        r_F0 /
        r_F1 /
        r_F2 /
        r_F3 /
        r_F4
    )

r_F0
    =
    (
        FACT /

        FC_T_IND_ST_stk /
        FC_T_IND_rr /
        FC_T_IND_nam /
        FC_T_flg
    )

r_F1
    =
    (
        FCC_T_IND_ST_stk /
        FCC_T_IND_rr /
        FCC_T_IND_nam /
        FCC_T_flg /
        FCSTX /
        FCSTY /
        FIND
    )

r_F2
    =
    (
        FIX_10 /
        FIX_11 /
        FIX_IND_ST_stk /
        FIX_IND_rr /
        FIX_IND_nam /
        FIX_dec /
        FMA /
        FNRM
    )

r_F3
    =
    (
        // keep order !
        FPTEST /
        FP /

        FROM_LIST /
        FS_T_IND_ST_stk /
        FS_T_IND_rr /
        FS_T_IND_nam /
        FS_T_flg
    )

r_F4
    =
    (
        FSC_T_IND_ST_stk /
        FSC_T_IND_rr /
        FSC_T_IND_nam /
        FSC_T_flg /
        FUNC_nn
    )

r_G
    = 
    (
        r_G0 /
        r_G1 /
        r_G2
    )

r_G0
    =
    (
        GAMMA /

        // keep order !
        GETKEY1 /
        GETKEYA /
        GETKEY /

        GETLI_IND_ST_stk /
        GETLI_IND_rr /
        GETLI_IND_nam /
        GETLI_ST_stk /
        GETLI_nam
    )

r_G1
    =
    (
        // keep order !
        GETMI_IND_ST_stk /
        GETMI_IND_rr /
        GETMI_IND_nam /
        GETMI_ST_stk /
        GETMI_nam /
        GETM
    )

r_G2
    =
    (
        GRAD /
        GROW /

        // keep order !
        GTO_IND_ST_stk /
        GTO_IND_rr /
        GTO_IND_nam /
        GTO_lbl_00_14 /
        GTO_lbl_15_e /
        GTO_nam
    )

r_H
    = 
    (
        r_H0 /
        r_H1
    )

r_H0
    =
    (
        HEADING /

        HEAD_IND_ST_stk /
        HEAD_IND_rr /
        HEAD_IND_nam /
        HEAD_ST_stk /
        HEAD_rr /
        HEAD_nam
    )

r_H1
    =
    (
        HEIGHT /
        HEXM /
        HEXSEP /
        HMS_ADD /
        HMS_SUB
    )

r_I0
    =
    (
        I_ADD /
        I_SUB /
        IDENT /
        INDEX_IND_ST_stk /
        INDEX_IND_rr /
        INDEX_IND_nam /
        INDEX_nam
    )

r_I
    = 
    (
        r_I0 /
        r_I1 /
        r_I2 /
        r_I3
    )

r_I1
    =
    (
        INPUT_IND_ST_stk /
        INPUT_IND_rr /
        INPUT_IND_nam /
        INPUT_ST_stk /
        INPUT_rr /
        INPUT_nam
    )

r_I2
    =
    (
        INSR /
        INTEG_IND_ST_stk /
        INTEG_IND_rr /
        INTEG_IND_nam /
        INTEG_nam /
        INVRT /
        IP
    )

r_I3
    =
    (
        ISG_IND_ST_stk /
        ISG_IND_rr /
        ISG_IND_nam /
        ISG_ST_stk /
        ISG_rr /
        ISG_nam
    )

r_J
    = 
    (
        J_ADD /
        J_SUB
    )

r_K
    = 
    (
        r_K0 /
        r_K1
    )

r_K0
    =
    (
        KEY_GTO_IND_ST_stk /
        KEY_GTO_IND_rr /
        KEY_GTO_IND_nam /
        KEY_GTO_nam /
        KEY_GTO_lbl_00_e
    )

r_K1
    =
    (
        KEY_XEQ_IND_ST_stk /
        KEY_XEQ_IND_rr /
        KEY_XEQ_IND_nam /
        KEY_XEQ_nam /
        KEY_XEQ_lbl_00_e /
        KEYASN
    )

r_L0
    =
    (
        L4STK /
        LASTO_IND_ST_stk /
        LASTO_IND_rr /
        LASTO_IND_nam /
        LASTO_nam /
        LASTO_REGS /
        LASTX
    )

r_L
    = 
    (
        r_L0 /
        r_L1 /
        r_L2 /
        r_L3 /
        r_L4
    )

r_L1
    =
    (
        // keep order !
        LBL_lbl_15_e /
        LBL_lbl_00_14 /
		LBL_nam /
        
        LCLBL /
        LCLV_IND_ST_stk /
        LCLV_IND_rr /
        LCLV_IND_nam /
        LCLV_REGS /
        LCLV_nam
    )

r_L2
    =
    (
        LEFT /
        LENGTH /
        LINF /
        LINSIGMA /
        LIST_T /
        LJ /

        // keep order !
        LN_1_X /
        LNSTK /
        LN
    )

r_L3
    =
    (
        LOCAT /

        // keep order !
        LOGF /
        LOG /

        LSTO_IND_ST_stk /
        LSTO_IND_rr /
        LSTO_IND_nam /
        LSTO_nam
    )

r_L4
    =
    (
        LXASTO_IND_ST_stk /
        LXASTO_IND_rr /
        LXASTO_IND_nam /
        LXASTO_REGS /
        LXASTO_nam
    )

r_M
    = 
    (
        r_M0 /
        r_M1
    )

r_M0
    =
    (
        MAN /
        MASKL /
        MASKR /
        MAT_T /
        MAX /
        MDY
    )

r_M1
    =
    (
        MEAN /
        MENU /
        MIN /
        MOD /
        MUL /
        MVAR_nam
    )

r_N
    = 
    (
        r_N0 /
        r_N1
    )

r_N0
    =
    (
        N_TO_BD /
        N_TO_BQ /
        N_TO_BS /
        N_TO_C /
        N_TO_DD /
        N_TO_DQ /
        N_TO_DS /
        N_TO_S
    )

r_N1
    =
    (
        NEWLIST /
        NEWMAT /
        NN_TO_S /
        NOP /
        NORM /
        NOT /
        NSTK /
        NUM_B
    )

r_O
    = 
    (
        OCTM /
        OCTSEP /
        OFF /
        OLD /
        ON /
        OR
    )

r_P
    = 
    (
        r_P0 /
        r_P1 /
        r_P2 /
        r_P3 /
        r_P4 /
        r_P5 /
        r_P6
    )

r_P0
    =
    (
        PCOMPLX /

        // keep order !
        PERCENT_CH /
        PERCENT /

        PERM /
        PGMINT_IND_ST_stk /
        PGMINT_IND_rr /
        PGMINT_IND_nam /
        PGMINT_nam
    )

r_P1
    =
    (
        PGMMENU /
        PGMSLV_IND_ST_stk /
        PGMSLV_IND_rr /
        PGMSLV_IND_nam /
        PGMSLV_nam /
        PGMVAR_IND_ST_stk /
        PGMVAR_IND_rr /
        PGMVAR_IND_nam /
        PGMVAR_nam
    )

r_P2
    =
    (
        PICK_IND_ST_stk /
        PICK_IND_rr /
        PICK_IND_nam /
        PICK_n /

        // keep order !
        PIXEL /
        PI /

        PROFF /
        POLAR /
        PRON
    )

r_P3
    =
    (
        // keep order !
        POSA /
        POS /

        PRA /
        PRLCD /
        PROMPT /
        PRREG /
        PRSIGMA /
        PRSTK /
        PRUSR
    )

r_P4
    =
    (
        PRV_IND_ST_stk /
        PRV_IND_rr /
        PRV_IND_nam /
        PRV_nam /
        PRX /
        PSE
    )

r_P5
    =
    (
        PUTLI_IND_ST_stk /
        PUTLI_IND_rr /
        PUTLI_IND_nam /
        PUTLI_ST_stk /
        PUTLI_nam
    )

r_P6
    =
    (
        // keep order !
        PUTMI_IND_ST_stk /
        PUTMI_IND_rr /
        PUTMI_IND_nam /
        PUTMI_ST_stk /
        PUTMI_REGS /
        PUTMI_nam /
        PUTM /

        PWRF
    )

r_R
    = 
    (
        r_R0 /
        r_R1 /
        r_R2 /
        r_R3 /
        r_R4 /
        r_R5 /
        r_R6 /
        r_R7 /
        r_R8
    )

r_R0
    =
    (
        RAD /
        RAN /
        RCL_IND_ST_stk /
        RCL_IND_rr /
        RCL_IND_nam /
        RCL_ST_stk /
        RCL_16_99 /
        RCL_00_15 /
        RCL_nam
    )

r_R1
    =
    (
        RCL_ADD_IND_ST_stk /
        RCL_ADD_IND_rr /
        RCL_ADD_IND_nam /
        RCL_ADD_ST_stk /
        RCL_ADD_rr /
        RCL_ADD_nam
    )

r_R2
    =
    (
        RCL_SUB_IND_ST_stk /
        RCL_SUB_IND_rr /
        RCL_SUB_IND_nam /
        RCL_SUB_ST_stk /
        RCL_SUB_rr /
        RCL_SUB_nam /
        RCLEL /
        RCLFLAG /
        RCLIJ
    )

r_R3
    =
    (
        RCL_MUL_IND_ST_stk /
        RCL_MUL_IND_rr /
        RCL_MUL_IND_nam /
        RCL_MUL_ST_stk /
        RCL_MUL_rr /
        RCL_MUL_nam
    )

r_R4
    =
    (
        RCL_DIV_IND_ST_stk /
        RCL_DIV_IND_rr /
        RCL_DIV_IND_nam /
        RCL_DIV_ST_stk /
        RCL_DIV_rr /
        RCL_DIV_nam /
        RCOMPLX /
        RDX_COMMA /
        RDX_DOT
    )

r_R5
    =
    (
        // keep order !
        REALRES /
        REAL_T /

        RECT /
        RIGHT /
        RJ /

        // keep order !
        RLCN /
        RLC /
        RLN /
        RL
    )

r_R6
    =
    (
        REV /

        // keep order !
        RDNN_IND_ST_stk /
        RDNN_IND_rr /
        RDNN_IND_nam /
        RDNN_n /
        RDN /

        RND /
        RNRM /
        ROTXY
    )

r_R7
    =
    (
        // keep order !
        RRCN /
        RRC /
        RRN /
        RR /

        RSUM /

        // keep order !
        RTNERR_IND_ST_stk /
        RTNERR_IND_rr /
        RTNERR_IND_nam /
        RTNERR_err
    )

r_R8
    =
    (
        RTNNO /
        RTNYES /
        RTN /

        // keep order !
        RUPN_IND_ST_stk /
        RUPN_IND_rr /
        RUPN_IND_nam /
        RUPN_n /
        RUP /

        R_SWAP
    )

r_S
    = 
    (
        r_S0 /
        r_S1 /
        r_S2 /
        r_S3 /
        r_S4 /
        r_S5 /
        r_S6 /
        r_S7 /
        r_S8 /
        r_S9
    )

r_S0
    =
    (
        S_TO_N /
        SB /

        // keep order !
        SCI_10 /
        SCI_11 /
        SCI_IND_ST_stk /
        SCI_IND_rr /
        SCI_IND_nam /
        SCI_dec /
        SC
    )

r_S1
    =
    (
        SDEV /
        SEED /
        SF_IND_ST_stk /
        SF_IND_rr /
        SF_IND_nam /
        SF_flg
    )

r_S2
    =
    (
        SIGMA_ADD /
        SIGMA_SUB /
        SIGMA_REG_IND_ST_stk /
        SIGMA_REG_IND_rr /
        SIGMA_REG_IND_nam /
        SIGMA_REG_rr /
        SIGMA_REG_T /
        SIGN
    )

r_S3
    =
    (
        // keep order !
        SINH /
        SIN /

        SIZE_ssss /
        SKIP /

        // keep order !
        SLOPE /
        SLN /
        SL /
        
        SOLVE_IND_ST_stk /
        SOLVE_IND_rr /
        SOLVE_IND_nam /
        SOLVE_nam
    )

r_S4
    =
    (
        SQRT /
        SQUARE /

        // keep order !
        SRN /
        SR /
        
        STO_IND_ST_stk /
        STO_IND_rr /
        STO_IND_nam /
        STO_ST_stk /
        STO_nam /
        STO_16_99 /
        STO_00_15
    )

r_S5
    =
    (
        STO_ADD_IND_ST_stk /
        STO_ADD_IND_rr /
        STO_ADD_IND_nam /
        STO_ADD_ST_stk /
        STO_ADD_rr /
        STO_ADD_nam
    )

r_S6
    =
    (
        STO_DIV_IND_ST_stk /
        STO_DIV_IND_rr /
        STO_DIV_IND_nam /
        STO_DIV_ST_stk /
        STO_DIV_rr /
        STO_DIV_nam
    )

r_S7
    =
    (
        STO_MUL_IND_ST_stk /
        STO_MUL_IND_rr /
        STO_MUL_IND_nam /
        STO_MUL_ST_stk /
        STO_MUL_rr /
        STO_MUL_nam
    )

r_S8
    =
    (
        STO_SUB_IND_ST_stk /
        STO_SUB_IND_rr /
        STO_SUB_IND_nam /
        STO_SUB_ST_stk /
        STO_SUB_rr /
        STO_SUB_nam /
        STOEL
    )

r_S9
    =
    (
        STOFLAG /
        STOIJ /
        STOP /
        STR_T /
        STRACE /
        SUBSTR /
        SUB /
        SUM /
        SWAP
    )

r_T
    = 
    (
        // keep order !
        TANH /
        TAN /

        TIME /
        TONE_IND_ST_stk /
        TONE_IND_rr /
        TONE_IND_nam /
        TONE_n /
        TRACE /
        TRANS /
        TYPE_T
    )

r_U
    = 
    (
        UNPICK_IND_ST_stk /
        UNPICK_IND_rr /
        UNPICK_IND_nam /
        UNPICK_n /
        UP /
        UVEC
    )

r_V
    = 
    (
        r_V0 /
        r_V1
    )

r_V0
    =
    (
        VARMENU_IND_ST_stk /
        VARMENU_IND_rr /
        VARMENU_IND_nam /
        VARMENU_nam /
        VARMNU1_IND_ST_stk /
        VARMNU1_IND_rr /
        VARMNU1_IND_nam /
        VARMNU1_nam
    )

r_V1
    =
    (
        VIEW_IND_ST_stk /
        VIEW_IND_rr /
        VIEW_IND_nam /
        VIEW_ST_stk /
        VIEW_rr /
        VIEW_nam
    )

r_W
    = 
    (
        WIDTH /
        WMEAN /
        WRAP /
        WSIZE_T /
        WSIZE
    )

r_X
    = 
    (
        r_X0 /
        r_X1 /
        r_X2 /
        r_X3 /
        r_X4 /
        r_X5 /
        r_X6 /
        r_X7 /
        r_X8 /
        r_X9
    )

r_X0
    =
    (
        X_EQ_0 /
        X_EQ_NN_IND_ST_stk /
        X_EQ_NN_IND_rr /
        X_EQ_NN_IND_nam /
        X_EQ_NN_ST_stk /
        X_EQ_NN_rr /
        X_EQ_NN_REGS /
        X_EQ_NN_nam
    )

r_X1
    =
    (
        X_EQ_Y /
        X_GE_0 /
        X_GE_NN_IND_ST_stk /
        X_GE_NN_IND_rr /
        X_GE_NN_IND_nam /
        X_GE_NN_ST_stk /
        X_GE_NN_rr /
        X_GE_NN_REGS /
        X_GE_NN_nam /
        X_GE_Y
    )

r_X2
    =
    (
        X_GT_0  /
        X_GT_NN_IND_ST_stk /
        X_GT_NN_IND_rr /
        X_GT_NN_IND_nam /
        X_GT_NN_ST_stk /
        X_GT_NN_rr /
        X_GT_NN_REGS /
        X_GT_NN_nam /
        X_GT_Y
    )

r_X3
    =
    (
        X_LE_0  /
        X_LE_NN_IND_ST_stk /
        X_LE_NN_IND_rr /
        X_LE_NN_IND_nam /
        X_LE_NN_ST_stk /
        X_LE_NN_rr /
        X_LE_NN_REGS /
        X_LE_NN_nam /
        X_LE_Y
    )

r_X4
    =
    (

        X_LT_0 /
        X_LT_NN_IND_ST_stk /
        X_LT_NN_IND_rr /
        X_LT_NN_IND_nam /
        X_LT_NN_ST_stk /
        X_LT_NN_rr /
        X_LT_NN_REGS /
        X_LT_NN_nam /
        X_LT_Y
    )

r_X5
    =
    (

        X_NE_0 /
        X_NE_NN_IND_ST_stk /
        X_NE_NN_IND_rr /
        X_NE_NN_IND_nam /
        X_NE_NN_ST_stk /
        X_NE_NN_rr /
        X_NE_NN_REGS /
        X_NE_NN_nam /
        X_NE_Y
    )

r_X6
    =
    (
        XASTO_IND_ST_stk /
        XASTO_IND_rr /
        XASTO_IND_nam /
        XASTO_ST_stk /
        XASTO_rr /
        XASTO_REGS /
        XASTO_nam
    )

r_X7
    =
    (
        // keep order !
        XEQ_IND_ST_stk /
        XEQ_IND_rr /
        XEQ_IND_nam /
        XEQ_lbl_00_e /
        XEQ_nam /

        XOR
    )

r_X8
    =
    (
        X_SWAP_F /
        X_SWAP_IND_ST_stk /
        X_SWAP_IND_rr /
        X_SWAP_IND_nam /
        X_SWAP_ST_stk /
        X_SWAP_rr /
        X_SWAP_REGS /
        X_SWAP_nam
    )

r_X9
    =
    (
        // keep order !
        XSTR_str_22 /
        XSTR_str_13 /

        XTOA /
        XVIEW 
    )

r_Y
    = 
    (
        Y_POW_X /
        YINT /
        YMD
    )


//-- Commands -----------------------------------------------------------------------------------------------

//alpha
STR '"<text[1-15]>"' = p: arg_s_1_15 { var q = sq(p); return { rpn: q + p + q, raw: s2h('Fn',p), lid: hp42s }; }
T_STR '⊢"<text[0-14]>"' = r: '⊢' p: arg_s_0_14 { var q = sq(p); return { rpn: r + q + p + q, raw: s2h('Fn 7F',p), lid: hp42s }; }

//f_0

// _0_EQ_NN ARG_VAR
// 0=? IND ST L      F3 A7 1A F4
// 0=? IND "AB"      F4 A7 2A 41 42
// 0=? IND 99        F3 A7 1A E3
// 0=? ST L          F3 A7 1A 74
// 0=? "AB"          F4 A7 22 41 42
// 0=? 99            F3 A7 1A 63
// 0=? "REGS"        F6 A7 22 52 45 47 53
_0_EQ_NN_IND_ST_stk '0=? IND ST L,T,X,Y,Z' = r: '0=? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1A Ft',p), lid: free42 }; }
_0_EQ_NN_IND_nam '0=? IND "<name[1-6]>"' = r: '0=? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 2A',p), lid: free42 }; }
_0_EQ_NN_IND_rr '0=? IND 00-99' = r: '0=? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1A 8r',p), lid: free42 }; }
_0_EQ_NN_ST_stk '0=? ST L,T,X,Y,Z' = r: '0=? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1A 7t',p), lid: free42 }; }
_0_EQ_NN_nam '0=? "<name[1-7]>"' = r: '0=?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 22',p), lid: free42 }; }
_0_EQ_NN_rr '0=? 00-99' = r: '0=?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1A rr',p), lid: free42 }; }
_0_EQ_NN_REGS '0=? "REGS"' = r: '0=? "REGS"' { return { rpn: r, raw: 'F6 A7 22 52 45 47 53', lid: free42 }; }

// 0_GE_NN ARG_VAR
// _0_GE_NN
// 0≥? IND ST L      F3 A7 1F F4
// 0≥? IND "AB"      F4 A7 2F 41 42
// 0≥? IND 99        F3 A7 1F E3
// 0≥? ST L          F3 A7 1F 74
// 0≥? "AB"          F4 A7 27 41 42
// 0≥? 99            F3 A7 1F 63
// 0≥? "REGS"        F6 A7 27 52 45 47 53
_0_GE_NN_IND_ST_stk '0≥? IND ST L,T,X,Y,Z' = r: '0≥? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1F Ft',p), lid: free42 }; }
_0_GE_NN_IND_nam '0≥? IND "<name[1-6]>"' = r: '0≥? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 2F',p), lid: free42 }; }
_0_GE_NN_IND_rr '0≥? IND 00-99' = r: '0≥? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1F 8r',p), lid: free42 }; }
_0_GE_NN_ST_stk '0≥? ST L,T,X,Y,Z' = r: '0≥? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1F 7t',p), lid: free42 }; }
_0_GE_NN_nam '0≥? "<name[1-7]>"' = r: '0≥?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 27',p), lid: free42 }; }
_0_GE_NN_rr '0≥? 00-99' = r: '0≥?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1F rr',p), lid: free42 }; }
_0_GE_NN_REGS '0≥? "REGS"' = r: '0≥? "REGS"' { return { rpn: r, raw: 'F6 A7 27 52 45 47 53', lid: free42 }; }

// 0_GT_NN ARG_VAR
// _0_GT_NN
// 0>? IND ST L      F3 A7 1D F4
// 0>? IND "AB"      F4 A7 2D 41 42 
// 0>? IND 99        F3 A7 1D E3 
// 0>? ST L          F3 A7 1D 74
// 0>? "AB"          F4 A7 25 41 42
// 0>? 99            F3 A7 1D 63
// 0>? "REGS"        F6 A7 25 52 45 47 53
_0_GT_NN_IND_ST_stk '0>? IND ST L,T,X,Y,Z' = r: '0>? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1D Ft',p), lid: free42 }; }
_0_GT_NN_IND_nam '0>? IND "<name[1-6]>"' = r: '0>? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 2D',p), lid: free42 }; }
_0_GT_NN_IND_rr '0>? IND 00-99' = r: '0>? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1D 8r',p), lid: free42 }; }
_0_GT_NN_ST_stk '0>? ST L,T,X,Y,Z' = r: '0>? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1D 7t',p), lid: free42 }; }
_0_GT_NN_nam '0>? "<name[1-7]>"' = r: '0>?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 25',p), lid: free42 }; }
_0_GT_NN_rr '0>? 00-99' = r: '0>?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1D rr',p), lid: free42 }; }
_0_GT_NN_REGS '0>? "REGS"' = r: '0>? "REGS"' { return { rpn: r, raw: 'F6 A7 25 52 45 47 53', lid: free42 }; }

// 0_LE_NN ARG_VAR
// _0_LE_NN
// 0≤? IND ST L      F3 A7 1E F4
// 0≤? IND "AB"      F4 A7 2E 41 42
// 0≤? IND 99        F3 A7 1E E3
// 0≤? ST L          F3 A7 1E 74
// 0≤? "AB"          F4 A7 26 41 42
// 0≤? 99            F3 A7 1E 63 
// 0≤? "REGS"        F6 A7 26 52 45 47 53
_0_LE_NN_IND_ST_stk '0≤? IND ST L,T,X,Y,Z' = r: '0≤? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1E Ft',p), lid: free42 }; }
_0_LE_NN_IND_nam '0≤? IND "<name[1-6]>"' = r: '0≤? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 2E',p), lid: free42 }; }
_0_LE_NN_IND_rr '0≤? IND 00-99' = r: '0≤? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1E 8r',p), lid: free42 }; }
_0_LE_NN_ST_stk '0≤? ST L,T,X,Y,Z' = r: '0≤? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1E 7t',p), lid: free42 }; }
_0_LE_NN_nam '0≤? "<name[1-7]>"' = r: '0≤?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 26',p), lid: free42 }; }
_0_LE_NN_rr '0≤? 00-99' = r: '0≤?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1E rr',p), lid: free42 }; }
_0_LE_NN_REGS '0≤? "REGS"' = r: '0≤? "REGS"' { return { rpn: r, raw: 'F6 A7 26 52 45 47 53', lid: free42 }; }

// 0_LT_NN ARG_VAR
// _0_LT_NN
// 0<? IND ST L      F3 A7 1C F4
// 0<? IND "AB"      F4 A7 2C 41 42
// 0<? IND 99        F3 A7 1C E3
// 0<? ST L          F3 A7 1C 74 
// 0<? "AB"          F4 A7 24 41 42
// 0<? 99            F3 A7 1C 63
// 0<? "REGS"        F6 A7 24 52 45 47 53
_0_LT_NN_IND_ST_stk '0<? IND ST L,T,X,Y,Z' = r: '0<? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1C Ft',p), lid: free42 }; }
_0_LT_NN_IND_nam '0<? IND "<name[1-6]>"' = r: '0<? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 2C',p), lid: free42 }; }
_0_LT_NN_IND_rr '0<? IND 00-99' = r: '0<? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1C 8r',p), lid: free42 }; }
_0_LT_NN_ST_stk '0<? ST L,T,X,Y,Z' = r: '0<? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1C 7t',p), lid: free42 }; }
_0_LT_NN_nam '0<? "<name[1-7]>"' = r: '0<?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 24',p), lid: free42 }; }
_0_LT_NN_rr '0<? 00-99' = r: '0<?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1C rr',p), lid: free42 }; }
_0_LT_NN_REGS '0<? "REGS"' = r: '0<? "REGS"' { return { rpn: r, raw: 'F6 A7 24 52 45 47 53', lid: free42 }; }

// 0_NE_NN ARG_VAR
// _0_NE_NN
// 0≠? IND ST L      F3 A7 1B F4
// 0≠? IND "AB"      F4 A7 2B 41 42
// 0≠? IND 99        F3 A7 1B E3
// 0≠? ST L          F3 A7 1B 74
// 0≠? "AB"          F4 A7 23 41 42
// 0≠? 99            F3 A7 1B 63
// 0≠? "REGS"        F6 A7 23 52 45 47 53
_0_NE_NN_IND_ST_stk '0≠? IND ST L,T,X,Y,Z' = r: '0≠? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1B Ft',p), lid: free42 }; }
_0_NE_NN_IND_nam '0≠? IND "<name[1-6]>"' = r: '0≠? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 2B',p), lid: free42 }; }
_0_NE_NN_IND_rr '0≠? IND 00-99' = r: '0≠? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1B 8r',p), lid: free42 }; }
_0_NE_NN_ST_stk '0≠? ST L,T,X,Y,Z' = r: '0≠? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1B 7t',p), lid: free42 }; }
_0_NE_NN_nam '0≠? "<name[1-7]>"' = r: '0≠?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 23',p), lid: free42 }; }
_0_NE_NN_rr '0≠? 00-99' = r: '0≠?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 1B rr',p), lid: free42 }; }
_0_NE_NN_REGS '0≠? "REGS"' = r: '0≠? "REGS"' { return { rpn: r, raw: 'F6 A7 23 52 45 47 53', lid: free42 }; }

//f_1
_10_POW_X '10↑X' = r: '10↑X' { return { rpn: r, raw: '57', lid: hp41c }; }

//f_4
_4STK '4STK' = r: '4STK' { return { rpn: r, raw: 'A7 E2', lid: hp42s }; }

A_THRU_F  'A...F' = r: 'A...F' { return { rpn: r, raw: 'A7 1B', lid: hp42s }; }

ABS 'ABS' = r: 'ABS' { return { rpn: r, raw: '61', lid: hp41c }; }

ACCEL 'ACCEL' = r: 'ACCEL' { return { rpn: r, raw: 'A7 CF', lid: free42 }; }

ACOS 'ACOS' = r: 'ACOS' { return { rpn: r, raw: '5D', lid: hp41c }; }

ACOSH 'ACOSH' = r: 'ACOSH' { return { rpn: r, raw: 'A0 66', lid: hp42s }; }

ADATE 'ADATE' = r: 'ADATE' { return { rpn: r, raw: 'A6 81', lid: free42 }; }

ADD '+' = r: '+' { return { rpn: r, raw: '40', lid: hp41c }; }

ADV 'ADV' = r: 'ADV' { return { rpn: r, raw: '8F', lid: hp41c }; }

AGRAPH 'AGRAPH' = r: 'AGRAPH' { return { rpn: r, raw: 'A7 64', lid: hp42s }; }

AIP 'AIP' = r: 'AIP' { return { rpn: r, raw: 'A6 31', lid: hp42s }; }

ALENG 'ALENG' = r: 'ALENG' { return { rpn: r, raw: 'A6 41', lid: hp42s }; }

ALL 'ALL' = r: 'ALL' { return { rpn: r, raw: 'A2 5D', lid: hp42s }; }

ALL_SIGMA 'ALLΣ' = r: 'ALLΣ' { return { rpn: r, raw: 'A0 AE', lid: hp42s }; }

AND 'AND' = r: 'AND' { return { rpn: r, raw: 'A5 88', lid: hp42s }; }

ANUM 'ANUM' = r: 'ANUM' { return { rpn: r, raw: 'A6 42', lid: free42 }; }

AOFF 'AOFF' = r: 'AOFF' { return { rpn: r, raw: '8B', lid: hp41c }; }

AON 'AON' = r: 'AON' { return { rpn: r, raw: '8C', lid: hp41c }; }

APPEND 'APPEND' = r: 'APPEND' { return { rpn: r, raw: 'A7 E9', lid: free42 }; }

// ARCL ARG_VAR
ARCL_IND_ST_stk 'ARCL IND ST L,T,X,Y,Z' = r: 'ARCL IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9B Ft',p), lid: hp41c }; }
// ARCL IND "Z"    : F2 BB 5A
ARCL_IND_nam 'ARCL IND "<name[1-6]>"' = r: 'ARCL IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn BB',p), lid: hp41c }; }
ARCL_IND_rr 'ARCL IND 00-99' = r: 'ARCL IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9B 8r',p), lid: hp41c }; }
ARCL_ST_stk 'ARCL ST L,T,X,Y,Z' = r: 'ARCL ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9B 7t',p), lid: hp41c }; }
ARCL_nam 'ARCL "<name[1-7]>"' = r: 'ARCL' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B3',p), lid: hp41c }; }
ARCL_rr 'ARCL 00-99' = r: 'ARCL' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9B rr',p), lid: hp41c }; }

AROT 'AROT' = r: 'AROT' { return { rpn: r, raw: 'A6 46', lid: hp41c }; }

ASHF 'ASHF' = r: 'ASHF' { return { rpn: r, raw: '88', lid: hp41c }; }

ASIN 'ASIN' = r: 'ASIN' { return { rpn: r, raw: '5C', lid: hp41c }; }

ASINH 'ASINH' = r: 'ASINH' { return { rpn: r, raw: 'A0 64', lid: hp42s }; }

ASR 'ASR' = r: 'ASR' { return { rpn: r, raw: 'A7 2C', lid: free42 }; }

ASRN 'ASRN' = r: 'ASRN' { return { rpn: r, raw: 'A7 75', lid: free42 }; }

// ASSIGN "" TO 01     : F2 C0 00      , key 01-18->00-11, with offset - 1
// ASSIGN "Z" TO 18    : F3 C0 5A 11
ASSIGN_nam_TO_key 'ASSIGN "<name[0-7]>" TO 01-18' = r: 'ASSIGN' _ p: arg_s_0_7 _ t: 'TO' _ k: arg_k_01_18 { var q = sq(p); return { rpn: r + ' ' + q + p + q + ' ' + t + ' ' + k, raw: n2r(s2h('Fn C0 kk', p),k), lid: hp42s }; }

// ASTO ARG_VAR
ASTO_IND_ST_stk 'ASTO IND ST L,T,X,Y,Z' = r: 'ASTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9A Ft',p), lid: hp41c }; }
ASTO_IND_nam 'ASTO IND "<name[1-6]>"' = r: 'ASTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn BA',p), lid: hp41c }; }
ASTO_IND_rr 'ASTO IND 00-99' = r: 'ASTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9A 8r',p), lid: hp41c }; }
ASTO_ST_stk 'ASTO ST L,T,X,Y,Z' = r: 'ASTO ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9A 7t',p), lid: hp41c }; }
ASTO_nam 'ASTO "<name[1-7]>"' = r: 'ASTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B2',p), lid: hp41c }; }
ASTO_rr 'ASTO 00-99' = r: 'ASTO' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9A rr',p), lid: hp41c }; }

ATAN 'ATAN' = r: 'ATAN' { return { rpn: r, raw: '5E', lid: hp41c }; }

ATANH 'ATANH' = r: 'ATANH' { return { rpn: r, raw: 'A0 65', lid: hp42s }; }

ATIME 'ATIME' = r: 'ATIME' { return { rpn: r, raw: 'A6 84', lid: free42 }; }

ATIME24 'ATIME24' = r: 'ATIME24' { return { rpn: r, raw: 'A6 85', lid: free42 }; }

ATOX 'ATOX' = r: 'ATOX' { return { rpn: r, raw: 'A6 47', lid: hp42s }; }

AVIEW 'AVIEW' = r: 'AVIEW' { return { rpn: r, raw: '7E', lid: hp41c }; }

B_T 'B?' = r: 'B?' { return { rpn: r, raw: 'A7 33', lid: free42 }; }

BASE_ADD 'BASE+' = r: 'BASE+' { return { rpn: r, raw: 'A0 E6', lid: hp42s }; }

BASE_SUB 'BASE-' = r: 'BASE-' { return { rpn: r, raw: 'A0 E7', lid: hp42s }; }

BASE_CHS 'BASE±' = r: 'BASE±' { return { rpn: r, raw: 'A0 EA', lid: hp42s }; }

BASE_MUL 'BASE×' = r: 'BASE×' { return { rpn: r, raw: 'A0 E8', lid: hp42s }; }

BASE_DIV 'BASE÷' = r: 'BASE÷' { return { rpn: r, raw: 'A0 E9', lid: hp42s }; }

BD_TO_N 'BD→N' = r: 'BD→N' { return { rpn: r, raw: 'A7 6D', lid: free42 }; }

BEEP 'BEEP' = r: 'BEEP' { return { rpn: r, raw: '86', lid: hp41c }; }

BEST 'BEST' = r: 'BEST' { return { rpn: r, raw: 'A0 9F', lid: hp42s }; }

BINM 'BINM' = r: 'BINM' { return { rpn: r, raw: 'A0 E5', lid: hp42s }; }

BINSEP 'BINSEP' = r: 'BINSEP' { return { rpn: r, raw: 'A7 3B', lid: free42 }; }

BIT_T 'BIT?' = r: 'BIT?' { return { rpn: r, raw: 'A5 8C', lid: hp42s }; }

BQ_TO_N 'BQ→N' = r: 'BQ→N' { return { rpn: r, raw: 'A7 6E', lid: free42 }; }

BRESET 'BRESET' = r: 'BRESET' { return { rpn: r, raw: 'A7 D8', lid: free42 }; }

BS_TO_N 'BS→N' = r: 'BS→N' { return { rpn: r, raw: 'A7 6C', lid: free42 }; }

BSIGNED 'BSIGNED' = r: 'BSIGNED' { return { rpn: r, raw: 'A7 D6', lid: free42 }; }

BWRAP 'BWRAP' = r: 'BWRAP' { return { rpn: r, raw: 'A7 D7', lid: free42 }; }

C_E_POW_X_1 'C.E↑X-1' = r: 'C.E↑X-1' { return { rpn: r, raw: 'A6 FF', lid: free42 }; }

C_LN_1_X  'C.LN1+X' = r: 'C.LN1+X' { return { rpn: r, raw: 'A6 FE', lid: free42 }; }

C_T 'C?' = r: 'C?' { return { rpn: r, raw: 'A7 39', lid: free42 }; }

C_TO_N   'C→N' = r: 'C→N' { return { rpn: r, raw: 'A7 F1', lid: free42 }; }

CB 'CB' = r: 'CB' { return { rpn: r, raw: 'A7 32', lid: free42 }; }

CC 'CC' = r: 'CC' { return { rpn: r, raw: 'A7 38', lid: free42 }; }

// CF ARG_NUM99
CF_IND_ST_stk 'CF IND ST L,T,X,Y,Z' = r: 'CF IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('A9 Ft',p), lid: hp41c }; }
CF_IND_nam 'CF IND "<name[1-6]>"' = r: 'CF IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A9',p), lid: hp41c }; }
CF_IND_rr 'CF IND 00-99' = r: 'CF IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('A9 8r',p), lid: hp41c }; }
CF_flg 'CF 00-99' = r: 'CF' _ p: arg_f_00_99 { return { rpn: r + ' ' + p, raw: n2r('A9 fl',p), lid: hp41c }; }

CHS '+/-' = r: '+/-' { return { rpn: r, raw: '54', lid: hp41c }; }

CLA 'CLA' = r: 'CLA' { return { rpn: r, raw: '87', lid: hp41c }; }

CLD 'CLD' = r: 'CLD' { return { rpn: r, raw: '7F', lid: hp41c }; }

CLK12 'CLK12' = r: 'CLK12' { return { rpn: r, raw: 'A6 86', lid: free42 }; }

CLK24 'CLK24' = r: 'CLK24' { return { rpn: r, raw: 'A6 87', lid: free42 }; }

CLLCD 'CLLCD' = r: 'CLLCD' { return { rpn: r, raw: 'A7 63', lid: hp42s }; }

CLMENU 'CLMENU' = r: 'CLMENU' { return { rpn: r, raw: 'A2 6D', lid: hp42s }; }

CLP 'CLP "<name[0-7]>"' = r: 'CLP' _ p: arg_s_0_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn F0',p), lid: hp41c }; }

CLRG 'CLRG' = r: 'CLRG' { return { rpn: r, raw: '8A', lid: hp41c }; }

CL_SIGMA 'CLΣ' = r: 'CLΣ' { return { rpn: r, raw: '70', lid: hp41c }; }

CLST 'CLST' = r: 'CLST' { return { rpn: r, raw: '73', lid: hp41c }; }

// CLV ARG_NAMED
CLV_IND_ST_stk 'CLV IND ST L,T,X,Y,Z' = r: 'CLV IND ST' _ p: arg_stk { return { rpn:  r + ' ' + p, raw: n2r('F2 D8 Ft',p), lid: hp42s }; }
CLV_IND_nam 'CLV IND "<name[1-6]>"' = r: 'CLV IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B8',p), lid: hp42s }; }
CLV_IND_rr 'CLV IND 00-99' = r: 'CLV IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D8 8r',p), lid: hp42s }; }
CLV_nam 'CLV "<name[1-7]>"' = r: 'CLV' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B0',p), lid: hp42s }; }

CLX 'CLX' = r: 'CLX' { return { rpn: r, raw: '77', lid: hp41c }; }

CLKEYS 'CLKEYS' = r: 'CLKEYS' { return { rpn: r, raw: 'A2 62', lid: hp42s }; }

COMB 'COMB' = r: 'COMB' { return { rpn: r, raw: 'A0 6F', lid: hp42s }; }

COMPLEX 'COMPLEX' = r: 'COMPLEX' { return { rpn: r, raw: 'A0 72', lid: hp42s }; }

CORR 'CORR' = r: 'CORR' { return { rpn: r, raw: 'A0 A7', lid: hp42s }; }

COS 'COS' = r: 'COS' { return { rpn: r, raw: '5A', lid: hp41c }; }

COSH 'COSH' = r: 'COSH' { return { rpn: r, raw: 'A0 62', lid: hp42s }; }

CPX_T 'CPX?' = r: 'CPX?' { return { rpn: r, raw: 'A2 67', lid: hp42s }; }

CPXMAT_T 'CPXMAT?' = r: 'CPXMAT?' { return { rpn: r, raw: 'A2 75', lid: free42 }; }

CPXRES 'CPXRES' = r: 'CPXRES' { return { rpn: r, raw: 'A2 6A', lid: hp42s }; }

CROSS 'CROSS' = r: 'CROSS' { return { rpn: r, raw: 'A6 CA', lid: hp42s }; }

CSLD_T 'CSLD?' = r: 'CSLD?' { return { rpn: r, raw: 'A7 DB', lid: free42 }; }

CUSTOM 'CUSTOM' = r: 'CUSTOM' { return { rpn: r, raw: 'A2 6F', lid: hp42s }; }

DATE 'DATE' = r: 'DATE' { return { rpn: r, raw: 'A6 8C', lid: free42 }; }

DATE_ADD 'DATE+' = r: 'DATE+' { return { rpn: r, raw: 'A6 8D', lid: free42 }; }

DD_TO_N 'DD→N' = r: 'DD→N' { return { rpn: r, raw: 'A7 70', lid: free42 }; }

DDAYS 'DDAYS' = r: 'DDAYS' { return { rpn: r, raw: 'A6 8E', lid: free42 }; }

DECINT 'DECINT' = r: 'DECINT' { return { rpn: r, raw: 'A7 3A', lid: free42 }; }

DECM 'DECM' = r: 'DECM' { return { rpn: r, raw: 'A0 E3', lid: hp42s }; }

DECSEP 'DECSEP' = r: 'DECSEP' { return { rpn: r, raw: 'A7 3D', lid: free42 }; }

DEG 'DEG' = r: 'DEG' { return { rpn: r, raw: '80', lid: hp41c }; }

DELAY 'DELAY' = r: 'DELAY' { return { rpn: r, raw: 'A7 60', lid: hp42s }; }

DELR 'DELR' = r: 'DELR' { return { rpn: r, raw: 'A0 AB', lid: hp42s }; }

DET 'DET' = r: 'DET' { return { rpn: r, raw: 'A6 CC', lid: hp42s }; }

DEPTH 'DEPTH' = r: 'DEPTH' { return { rpn: r, raw: 'A7 E6', lid: free42 }; }

// DIM ARG_MAT
DIM_IND_ST_stk 'DIM IND ST L,T,X,Y,Z' = r: 'DIM IND ST' _ p: arg_stk { return { rpn: r +' ' + p, raw: n2r('F2 EC Ft',p), lid: hp42s }; }
DIM_IND_nam 'DIM IND "<name[1-6]>"' = r: 'DIM IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn CC',p), lid: hp42s }; }
DIM_IND_rr 'DIM IND 00-99' = r: 'DIM IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 EC 8r',p), lid: hp42s }; }
DIM_nam 'DIM "<name[1-7]>"' = r: 'DIM' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn C4',p), lid: hp42s }; }
DIM_T 'DIM?' = r: 'DIM?' { return { rpn: r, raw: 'A6 E7', lid: hp42s }; }

DIV '÷' = r:'÷' { return { rpn: r, raw: '43', lid: hp41c }; }

DMY 'DMY' = r:'DMY' { return { rpn: r, raw: 'A6 8F', lid: free42 }; }

DOT 'DOT' = r:'DOT' { return { rpn: r, raw: 'A6 CB', lid: hp42s }; }

DOW 'DOW' = r:'DOW' { return { rpn: r, raw: 'A6 90', lid: free42 }; }

DOWN '↓' = r:'↓' { return { rpn: r, raw: 'A6 DF', lid: hp42s }; }

DQ_TO_N 'DQ→N' = r:'DQ→N' { return { rpn: r, raw: 'A7 71', lid: free42 }; }

DROP 'DROP' = r:'DROP' { return { rpn: r, raw: 'A2 71', lid: free42 }; }

// DROPN ARG_NUM9
// DROPN IND ST L    F2 A1 F4
// DROPN IND "AB"    F3 F9 41 42
// DROPN IND 99      F2 A1 E3
// DROPN 9           F2 A1 09
DROPN_IND_ST_stk 'DROPN IND ST L,T,X,Y,Z' = r:'DROPN IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A1 Ft',p), lid: free42 }; }
DROPN_IND_nam 'DROPN IND "<name[1-6]>"' = r:'DROPN IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn F9',p), lid: free42 }; }
DROPN_IND_rr 'DROPN IND 00-99' = r:'DROPN IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A1 8r',p), lid: free42 }; }
DROPN_n 'DROPN 0-9' = r:'DROPN' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('F2 A1 0n',p), lid: free42 }; }

DS_TO_N 'DS→N' = r:'DS→N' { return { rpn: r, raw: 'A7 6F', lid: free42 }; }

// DSE ARG_REAL
DSE_IND_ST_stk 'DSE IND ST L,T,X,Y,Z' = r:'DSE IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('97 Ft',p), lid: hp41c }; }
DSE_IND_nam 'DSE IND "<name[1-6]>"' = r:'DSE IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 9F',p), lid: hp41c }; }
DSE_IND_rr 'DSE IND 00-99' = r:'DSE IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('97 8r',p), lid: hp41c }; }
DSE_ST_stk 'DSE ST L,T,X,Y,Z' = r:'DSE ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('97 7t',p), lid: hp41c }; }
DSE_nam 'DSE "<name[1-7]>"' = r:'DSE' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 97',p), lid: hp41c }; }
DSE_rr 'DSE 00-99' = r:'DSE' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('97 rr',p), lid: hp41c }; }

DUP 'DUP' = r: 'DUP' { return { rpn: r, raw: 'A7 E7', lid: free42 }; }

// DUPN ARG_NUM9
// DUPN IND ST L     F2 A2 F4
// DUPN IND "AB"     F3 FA 41 42
// DUPN IND 99       F2 A2 E3
// DUPN 9            F2 A2 09
DUPN_IND_ST_stk 'DUPN IND ST L,T,X,Y,Z' = r: 'DUPN IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A2 Ft',p), lid: free42 }; }
DUPN_IND_nam 'DUPN IND "<name[1-6]>"' = r: 'DUPN IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn FA',p), lid: free42 }; }
DUPN_IND_rr 'DUPN IND 00-99' = r: 'DUPN IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A2 8r',p), lid: free42 }; }
DUPN_n 'DUPN 0-9' = r: 'DUPN' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('F2 A2 0n',p), lid: free42 }; }

EDIT 'EDIT' = r: 'EDIT' { return { rpn: r, raw: 'A6 E1', lid: hp42s }; }

// EDITN ARG_MAT
EDITN_IND_ST_stk 'EDITN IND ST L,T,X,Y,Z' = r: 'EDITN IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 EF Ft',p), lid: hp42s }; }
EDITN_IND_nam 'EDITN IND "<name[1-6]>"' = r: 'EDITN IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn CE',p), lid: hp42s }; }
EDITN_IND_rr 'EDITN IND 00-99' = r: 'EDITN IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 EF 8r',p), lid: hp42s }; }
EDITN_nam 'EDITN "<name[1-7]>"' = r: 'EDITN' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn C6',p), lid: hp42s }; }

END_0 '.END.' = r: '.END.' { return { rpn: r, raw: 'C0 00 0D', lid: hp41c }; }
END_1 'END' = r: 'END' { return { rpn: r, raw: 'C0 00 0D', lid: hp41c }; }

// ENG ARG_NUM11
ENG_10 'ENG 10' = r: 'ENG 10' { return { rpn: r, raw: 'F1 D7', lid: hp41c }; }
ENG_11 'ENG 11' = r: 'ENG 11' { return { rpn: r, raw: 'F1 E7', lid: hp41c }; }
ENG_IND_ST_stk 'ENG IND ST L,T,X,Y,Z' = r: 'ENG IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9E Ft',p), lid: hp41c }; }
ENG_IND_nam 'ENG IND "<name[1-6]>"' = r: 'ENG IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn DE',p), lid: hp41c }; }
ENG_IND_rr 'ENG IND 00-99' = r: 'ENG IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9E 8r',p), lid: hp41c }; }
ENG_dec 'ENG 00-09' = r: 'ENG' _ p: arg_n_00_09 { return { rpn: r + ' ' + p, raw: n2r('9E nn',p), lid: hp41c }; }

ENTER 'ENTER' = r: 'ENTER' { return { rpn: r, raw: '83', lid: hp41c }; }

ERRMSG 'ERRMSG' = r: 'ERRMSG' { return { rpn: r, raw: 'A7 F6', lid: free42 }; }

ERRNO 'ERRNO' = r: 'ERRNO' { return { rpn: r, raw: 'A7 F7', lid: free42 }; }

EXITALL 'EXITALL' = r: 'EXITALL' { return { rpn: r, raw: 'A2 6C', lid: hp42s }; }

EXPF 'EXPF' = r: 'EXPF' { return { rpn: r, raw: 'A0 A0', lid: hp42s }; }

EXTEND  'EXTEND' = r: 'EXTEND' { return { rpn: r, raw: 'A7 EA', lid: free42 }; }

E_POW_X 'E↑X' = r: 'E↑X' { return { rpn: r, raw: '55', lid: hp41c }; }

E_POW_X_1 'E↑X-1' = r: 'E↑X-1' { return { rpn: r, raw: '58', lid: hp41c }; }

FACT 'N!' = r: 'N!' { return { rpn: r, raw: '62', lid: hp41c }; }

// FC_T ARG_NUM99
FC_T_IND_ST_stk 'FC? IND ST L,T,X,Y,Z' = r: 'FC? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('AD Ft',p), lid: hp41c }; }
FC_T_IND_nam 'FC? IND "<name[1-6]>"' = r: 'FC? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn AD',p), lid: hp41c }; }
FC_T_IND_rr 'FC? IND 00-99' = r: 'FC? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AD 8r',p), lid: hp41c }; }
FC_T_flg 'FC? 00-99' = r: 'FC?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AD rr',p), lid: hp41c }; }

// FCC_T ARG_NUM99
FCC_T_IND_ST_stk 'FC?C IND ST L,T,X,Y,Z' = r: 'FC?C IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('AB Ft',p), lid: hp41c }; }
FCC_T_IND_nam 'FC?C IND "<name[1-6]>"' = r: 'FC?C IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn AB',p), lid: hp41c }; }
FCC_T_IND_rr 'FC?C IND 00-99' = r: 'FC?C IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AB 8r',p), lid: hp41c }; }
FCC_T_flg 'FC?C 00-99' = r: 'FC?C' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AB rr',p), lid: hp41c }; }

FCSTX 'FCSTX' = r: 'FCSTX' { return { rpn: r, raw: 'A0 A8', lid: hp42s }; }

FCSTY 'FCSTY' = r: 'FCSTY' { return { rpn: r, raw: 'A0 A9', lid: hp42s }; }

FIND '[FIND]' = r: '[FIND]' { return { rpn: r, raw: 'A6 EC', lid: hp42s }; }

// FIX ARG_NUM11
FIX_10 'FIX 10' = r: 'FIX 10' { return { rpn: r, raw: 'F1 D5', lid: hp41c }; }
FIX_11 'FIX 11' = r: 'FIX 11' { return { rpn: r, raw: 'F1 E5', lid: hp41c }; }
FIX_IND_ST_stk 'FIX IND ST L,T,X,Y,Z' = r: 'FIX IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9C Ft',p), lid: hp41c }; }
FIX_IND_nam 'FIX IND "<name[1-6]>"' = r: 'FIX IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn DC',p), lid: hp41c }; }
FIX_IND_rr 'FIX IND 00-99' = r: 'FIX IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9C 8r',p), lid: hp41c }; }
FIX_dec 'FIX 00-09' = r: 'FIX' _ p: arg_n_00_09 { return { rpn: r + ' ' + p, raw: n2r('9C nn',p), lid: hp41c }; }

FMA 'FMA' = r: 'FMA' { return { rpn: r, raw: 'A7 DA', lid: free42 }; }

FNRM 'FNRM' = r: 'FNRM' { return { rpn: r, raw: 'A6 CF', lid: hp42s }; }

FP 'FP' = r: 'FP' { return { rpn: r, raw: '69', lid: hp41c }; }

FPTEST 'FPTEST' = r: 'FPTEST' { return { rpn: r, raw: 'A7 D2', lid: free42 }; }

FROM_LIST  'LIST→' = r: 'LIST→' { return { rpn: r, raw: 'A6 FD', lid: free42 }; }

// FS_T ARG_NUM99
FS_T_IND_ST_stk 'FS? IND ST L,T,X,Y,Z' = r: 'FS? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('AC Ft',p), lid: hp41c }; }
FS_T_IND_nam 'FS? IND "<name[1-6]>"' = r: 'FS? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn AC',p), lid: hp41c }; }
FS_T_IND_rr 'FS? IND 00-99' = r: 'FS? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AC 8r',p), lid: hp41c }; }
FS_T_flg 'FS? 00-99' = r: 'FS?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AC rr',p), lid: hp41c }; }

// FSC_T ARG_NUM99
FSC_T_IND_ST_stk 'FS?C IND ST L,T,X,Y,Z' = r: 'FS?C IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('AA Ft',p), lid: hp41c }; }
FSC_T_IND_nam 'FS?C IND "<name[1-6]>"' = r: 'FS?C IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn AA',p), lid: hp41c }; }
FSC_T_IND_rr 'FS?C IND 00-99' = r: 'FS?C IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AA 8r',p), lid: hp41c }; }
FSC_T_flg 'FS?C 00-99' = r: 'FS?C' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AA rr',p), lid: hp41c }; }

// FUNC ARG_FUNC
// FUNC 00           F2 E0 00 
// FUNC 01           F2 E0 01 
// FUNC 44           F2 E0 2C
FUNC_nn 'FUNC 00-44' = r: 'FUNC' _ p: arg_n_00_44 { return { rpn: r + ' ' + p, raw: n2r('F2 E0 nn',p), lid: free42 }; }

GAMMA 'GAMMA' = r: 'GAMMA' { return { rpn: r, raw: 'A0 74', lid: hp42s }; }

GETKEY 'GETKEY' = r: 'GETKEY' { return { rpn: r, raw: 'A2 6E', lid: hp42s }; }

GETKEY1 'GETKEY1' = r: 'GETKEY1' { return { rpn: r, raw: 'A7 D9', lid: free42 }; }

GETKEYA 'GETKEYA' = r: 'GETKEYA' { return { rpn: r, raw: 'A6 EE', lid: free42 }; }

// GETLI ARG_L_STK
// GETLI IND ST L    F3 A7 67 F4 
// GETLI IND "AB"    F4 A7 7C 41 42 
// GETLI IND 99      F3 A7 67 E3 
// GETLI ST L        F3 A7 67 74 
// GETLI "AB"        F4 A7 74 41 42
GETLI_IND_ST_stk 'GETLI IND ST L,T,X,Y,Z' = r: 'GETLI IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 67 Ft',p), lid: free42 }; }
GETLI_IND_nam 'GETLI IND "<name[1-6]>"' = r: 'GETLI IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 7C',p), lid: free42 }; }
GETLI_IND_rr 'GETLI IND 00-99' = r: 'GETLI IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 67 8r',p), lid: free42 }; }
GETLI_ST_stk 'GETLI ST L,T,X,Y,Z' = r: 'GETLI ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 67 7t',p), lid: free42 }; }
GETLI_nam 'GETLI "<name[1-7]>"' = r: 'GETLI' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 74',p), lid: free42 }; }

GETM 'GETM' = r: 'GETM' { return { rpn: r, raw: 'A6 E8', lid: hp42s }; }

// GETMI ARG_M_STK
// GETMI IND ST L    F3 A7 65 F4 
// GETMI IND "AB"    F4 A7 7A 41 42 
// GETMI IND 99      F3 A7 65 E3 
// GETMI ST L        F3 A7 65 74 
// GETMI "AB"        F4 A7 72 41 42 
// GETMI "REGS"      F6 A7 72 52 45 47 53
GETMI_IND_ST_stk 'GETMI IND ST L,T,X,Y,Z' = r: 'GETMI IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 65 Ft',p), lid: free42 }; }
GETMI_IND_nam 'GETMI IND "<name[1-6]>"' = r: 'GETMI IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 7A',p), lid: free42 }; }
GETMI_IND_rr 'GETMI IND 00-99' = r: 'GETMI IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 65 8r',p), lid: free42 }; }
GETMI_ST_stk 'GETMI ST L,T,X,Y,Z' = r: 'GETMI ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 65 7t',p), lid: free42 }; }
GETMI_nam 'GETMI "<name[1-7]>"' = r: 'GETMI' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 72',p), lid: free42 }; }
GETMI_REGS 'GETMI "REGS"' = r: 'GETMI "REGS"' { return { rpn: r, raw: 'F6 A7 72 52 45 47 53', lid: free42 }; }

GRAD 'GRAD' = r: 'GRAD' { return { rpn: r, raw: '82', lid: hp41c }; }

GROW 'GROW' = r: 'GROW' { return { rpn: r, raw: 'A6 E3', lid: hp42s }; }

// GTO ARG_LBL
GTO_IND_ST_stk 'GTO IND ST L,T,X,Y,Z' = r: 'GTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('AE 7t',p), lid: hp41c }; }
GTO_IND_nam 'GTO IND "<name[1-6]>"' = r: 'GTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn AE',p), lid: hp41c }; }
GTO_IND_rr 'GTO IND 00-99' = r: 'GTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AE nn',p), lid: hp41c }; }
GTO_nam 'GTO "<name[1-7]>"' = r: 'GTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('1D Fn',p), lid: hp41c }; }
// GTO 00            B1 00 
// GTO 14            BF 00 
GTO_lbl_00_14 'GTO 00-14' = r: 'GTO' _ p: arg_l_00_14 { return { rpn: r + ' ' + p, raw: n2r('Bl',p) + ' 00', lid: hp41c }; }
// GTO 15            D0 00 0F 
// GTO 16            D0 00 10 
// GTO 99            D0 00 63 
// GTO A             D0 00 66 
// GTO e             D0 00 7F 
GTO_lbl_15_e 'GTO 15-e' = r: 'GTO' _ p: arg_l_15_e { return { rpn: r + ' ' + p, raw: n2r('D0 00 1e',p), lid: hp41c }; }

// GTO 64          : D0 00 40
// GTO 80          : D0 00 50
// GTO 90          : D0 00 5A
// GTO 98          : D0 00 62
// GTO 99          : D0 00 63

// HEAD ARG_VAR
// HEAD IND ST L     F3 A7 13 F4 
// HEAD IND "AB"     F4 A7 0B 41 42 
// HEAD IND 99       F3 A7 13 E3 
// HEAD ST L         F3 A7 13 74 
// HEAD "AB"         F4 A7 03 41 42 
// HEAD 99           F3 A7 13 63
HEAD_IND_ST_stk 'HEAD IND ST L,T,X,Y,Z' = r: 'HEAD IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 13 Ft',p), lid: free42 }; }
HEAD_IND_nam 'HEAD IND "<name[1-6]>"' = r: 'HEAD IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 0B',p), lid: free42 }; }
HEAD_IND_rr 'HEAD IND 00-99' = r: 'HEAD IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 13 8r',p), lid: free42 }; }
HEAD_ST_stk 'HEAD ST L,T,X,Y,Z' = r: 'HEAD ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 13 7t',p), lid: free42 }; }
HEAD_nam 'HEAD "<name[1-7]>"' = r: 'HEAD' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 03',p), lid: free42 }; }
HEAD_rr 'HEAD 00-99' = r: 'HEAD' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 13 rr',p), lid: free42 }; }

HEADING 'HEADING' = r: 'HEADING' { return { rpn: r, raw: 'A7 D1', lid: free42 }; }

HEIGHT  'HEIGHT' = r: 'HEIGHT' { return { rpn: r, raw: 'A2 73', lid: free42 }; }

HEXM 'HEXM' = r: 'HEXM' { return { rpn: r, raw: 'A0 E2', lid: hp42s }; }

HEXSEP 'HEXSEP' = r: 'HEXSEP' { return { rpn: r, raw: 'A7 3E', lid: free42 }; }

HMS_ADD 'HMS+' = r: 'HMS+' { return { rpn: r, raw: '49', lid: hp41c }; }

HMS_SUB 'HMS-' = r: 'HMS-' { return { rpn: r, raw: '4A', lid: hp41c }; }

I_ADD 'I+' = r: 'I+' { return { rpn: r, raw: 'A6 D2', lid: hp42s }; }

I_SUB 'I-' = r: 'I-' { return { rpn: r, raw: 'A6 D3', lid: hp42s }; }

IDENT 'IDENT' = r: 'IDENT' { return { rpn: r, raw: 'A7 F5', lid: free42 }; }

// INDEX ARG_MAT
INDEX_IND_ST_stk 'INDEX IND ST L,T,X,Y,Z' = r: 'INDEX IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 DA Ft',p), lid: hp42s }; }
// INDEX IND "A"     F2 8F 41 
// INDEX IND "Z"     F2 8F 5A
INDEX_IND_nam 'INDEX IND "<name[1-6]>"' = r: 'INDEX IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 8F',p), lid: hp42s }; }
// INDEX IND 00      F2 DA 80 
// INDEX IND 19      F2 DA 93 
// INDEX IND 15      F2 DA 8F 
// INDEX IND 99      F2 DA E3
INDEX_IND_rr 'INDEX IND 00-99' = r: 'INDEX IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 DA 8r',p), lid: hp42s }; }
INDEX_nam 'INDEX "<name[1-7]>"' = r: 'INDEX' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 87',p), lid: hp42s }; }
INPUT_IND_ST_stk 'INPUT IND ST L,T,X,Y,Z' = r: 'INPUT IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 EE Ft',p), lid: hp42s }; }

// INPUT ARG_VAR
// INPUT IND "A"     F2 CD 41 
// INPUT IND "z"     F2 CD 7A
INPUT_IND_nam 'INPUT IND "<name[1-6]>"' = r: 'INPUT IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn CD',p), lid: hp42s }; }
// INPUT IND 14      F2 EE 8E 
// INPUT IND 15      F2 EE 8F 
// INPUT IND 16      F2 EE 90 
// INPUT IND 99      F2 EE E3 
INPUT_IND_rr 'INPUT IND 00-99' = r: 'INPUT IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 EE 8r',p), lid: hp42s }; }
INPUT_ST_stk 'INPUT ST L,T,X,Y,Z' = r: 'INPUT ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D0 7t',p), lid: hp42s }; }
INPUT_nam 'INPUT "<name[1-7]>"' = r: 'INPUT' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn C5',p), lid: hp42s }; }
INPUT_rr 'INPUT 00-99' = r: 'INPUT' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D0 rr',p), lid: hp42s }; }

INSR 'INSR' = r: 'INSR' { return { rpn: r, raw: 'A0 AA', lid: hp42s }; }

// INTEG ARG_RVAR
INTEG_IND_ST_stk 'INTEG IND ST L,T,X,Y,Z' = r: 'INTEG IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 EA Ft',p), lid: hp42s }; }
INTEG_IND_nam 'INTEG IND "<name[1-6]>"' = r: 'INTEG IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn BE',p), lid: hp42s }; }
INTEG_IND_rr 'INTEG IND 00-99' = r: 'INTEG IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 EA 8r',p), lid: hp42s }; }
INTEG_nam 'INTEG "<name[1-7]>"' = r: 'INTEG' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B6',p), lid: hp42s }; }

INV '1/X' = r: '1/X' { return { rpn: r, raw: '60', lid: hp41c }; }

INVRT 'INVRT' = r: 'INVRT' { return { rpn: r, raw: 'A6 CE', lid: hp42s }; }

IP 'IP' = r: 'IP' { return { rpn: r, raw: '68', lid: hp41c }; }

// ISG ARG_REAL
ISG_IND_ST_stk 'ISG IND ST L,T,X,Y,Z' = r: 'ISG IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('96 Ft',p), lid: hp41c }; }
ISG_IND_nam 'ISG IND "<name[1-6]>"' = r: 'ISG IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 9E',p), lid: hp41c }; }
ISG_IND_rr 'ISG IND 00-99' = r: 'ISG IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('96 8r',p), lid: hp41c }; }
ISG_ST_stk 'ISG ST L,T,X,Y,Z' = r: 'ISG ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('96 7t',p), lid: hp41c }; }
ISG_nam 'ISG "<name[1-7]>"' = r: 'ISG' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 96',p), lid: hp41c }; }
ISG_rr 'ISG 00-99' = r: 'ISG' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('96 rr',p), lid: hp41c }; }

J_ADD 'J+' = r: 'J+' { return { rpn: r, raw: 'A6 D4', lid: hp42s }; }

J_SUB 'J-' = r: 'J-' { return { rpn: r, raw: 'A6 D5', lid: hp42s }; }

KEY_GTO_IND_ST_stk 'KEY 1-18 GTO IND ST L,T,X,Y,Z' = r: 'KEY' _ k: arg_k_1_18 _ g: 'GTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + k + ' ' + g + ' ' + p, raw: n2r(n2r('F3 E3 k0 Ft',k),p), lid: hp42s }; }
KEY_GTO_IND_nam 'KEY 1-18 GTO IND "<name[1-6]>"' = r: 'KEY' _ k: arg_k_1_18 _ g: 'GTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + k + ' ' + g + ' ' + q + p + q, raw: s2h(n2r('Fn CB k0',k),p), lid: hp42s }; }

// KEY 9 GTO IND 99  F3 E3 09 E3
KEY_GTO_IND_rr 'KEY 1-18 GTO IND 00-99' = r: 'KEY' _ k: arg_k_1_18 _ g: 'GTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + k + ' ' + g + ' ' + p, raw: n2r(n2r('F3 E3 k0 8r',k),p), lid: hp42s }; }
KEY_GTO_nam 'KEY 1-18 GTO "<name[1-7]>"' = r: 'KEY' _ k: arg_k_1_18 _ g: 'GTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + k + ' ' + g + ' ' + q + p + q, raw: s2h(n2r('Fn C3 k0',k),p), lid: hp42s }; }

// KEY 1 GTO 00      F3 E3 01 00 
// KEY 1 GTO 15      F3 E3 01 0F 
// KEY 2 GTO 16      F3 E3 02 10 
// KEY 2 GTO 99      F3 E3 02 63 
// KEY 9 GTO 99      F3 E3 09 63
// KEY 3 GTO A       F3 E3 03 66 
// KEY 3 GTO e       F3 E3 03 7F
KEY_GTO_lbl_00_e 'KEY 1-18 GTO 00-e' = r: 'KEY' _ k: arg_k_1_18 _ g: 'GTO' _ p: arg_l_00_e { return { rpn: r + ' ' + k + ' ' + g + ' ' + p, raw: n2r(n2r('F3 E3 k0 0e',k),p), lid: hp42s }; }

KEY_XEQ_IND_ST_stk 'KEY 1-18 XEQ IND ST L,T,X,Y,Z' = r: 'KEY' _ k: arg_k_1_18 _ x: 'XEQ IND ST' _ p: arg_stk { return { rpn: r + ' ' + k + ' ' + x + ' ' + p, raw: n2r(n2r('F3 E2 k0 Ft',k),p), lid: hp42s }; }
KEY_XEQ_IND_nam 'KEY 1-18 XEQ IND "<name[1-6]>"' = r: 'KEY' _ k: arg_k_1_18 _ x: 'XEQ IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + k + ' ' + x + ' ' + q + p + q, raw: s2h(n2r('Fn CA k0',k),p), lid: hp42s }; }
KEY_XEQ_IND_rr 'KEY 1-18 XEQ IND 00-99' = r: 'KEY' _ k: arg_k_1_18 _ x: 'XEQ IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + k + ' ' + x + ' ' + p, raw: n2r(n2r('F3 E2 k0 8r',k),p), lid: hp42s }; }
KEY_XEQ_nam 'KEY 1-18 XEQ "<name[1-7]>"' = r: 'KEY' _ k: arg_k_1_18 _ x: 'XEQ' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + k + ' ' + x + ' ' + q + p + q, raw: s2h(n2r('Fn C2 k0',k),p), lid: hp42s }; }
KEY_XEQ_lbl_00_e 'KEY 1-18 XEQ 00-e' = r: 'KEY' _ k: arg_k_1_18 _ x: 'XEQ' _ p: arg_l_00_e { return { rpn: r + ' ' + k + ' ' + x + ' ' + p, raw: n2r(n2r('F3 E2 k0 0e',k),p), lid: hp42s }; }

KEYASN 'KEYASN' = r: 'KEYASN' { return { rpn: r, raw: 'A2 63', lid: hp42s }; }

L4STK 'L4STK' = r: 'L4STK' { return { rpn: r, raw: 'A7 E3', lid: hp42s }; }

// LASTO ARG_NAMED
// LASTO IND ST L    F2 C8 F4
// LASTO IND "AB"    F3 FD 41 42
// LASTO IND 99      F2 C8 E3
// LASTO "AB"        F3 F5 41 42
// LASTO "REGS"      F5 F5 52 45 47 53
LASTO_IND_ST_stk 'LASTO IND ST L,T,X,Y,Z' = r: 'LASTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 C8 Ft',p), lid: free42 }; }
LASTO_IND_nam 'LASTO IND "<name[1-6]>"' = r: 'LASTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn FD',p), lid: free42 }; }
LASTO_IND_rr 'LASTO IND 00-99' = r: 'LASTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 C8 8r',p), lid: free42 }; }
LASTO_nam 'LASTO "<name[1-7]>"' = r: 'LASTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn F5',p), lid: free42 }; }
LASTO_REGS 'LASTO "REGS"' = r: 'LASTO "REGS"' { return { rpn: r, raw: 'F5 F5 52 45 47 53', lid: free42 }; }

LASTX 'LASTX' = r: 'LASTX' { return { rpn: r, raw: '76', lid: hp41c }; }

// LBL ARG_OTHER
LBL_nam 'LBL "<name[1-7]>"' = r: 'LBL' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('C0 00 Fn 00',p), lid: hp41c }; }

// LBL 00 : 01 
// LBL 14 : 0F 
LBL_lbl_00_14 'LBL 0-14' = r: 'LBL' _ p: arg_l_00_14 { return { rpn: r + ' ' + p, raw: n2r('0l',p), lid: hp41c }; }

// LBL 15            CF 0F 
// LBL 16            CF 10
// LBL 99            CF 63 
// LBL A             CF 66 
// LBL e             CF 7F 
LBL_lbl_15_e 'LBL 15-e' = r: 'LBL' _ p: arg_l_15_e { return { rpn: r + ' ' + p, raw: n2r('CF 1e',p), lid: hp41c }; }

LCLBL 'LCLBL' = r: 'LCLBL' { return { rpn: r, raw: 'A2 64', lid: hp42s }; }

// LCLV ARG_NAMED
// LCLV IND ST L     F3 A7 64 F4
// LCLV IND "AB"     F4 A7 79 41 42
// LCLV IND 99       F3 A7 64 E3
// LCLV "AB"         F4 A7 71 41 42
// LCLV "REGS"       F6 A7 71 52 45 47 53
LCLV_IND_ST_stk 'LCLV IND ST L,T,X,Y,Z' = r: 'LCLV IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 64 Ft',p), lid: free42 }; }
LCLV_IND_nam 'LCLV IND "<name[1-6]>"' = r: 'LCLV IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 79',p), lid: free42 }; }
LCLV_IND_rr 'LCLV IND 00-99' = r: 'LCLV IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 64 8r',p), lid: free42 }; }
LCLV_nam 'LCLV "<name[1-7]>"' = r: 'LCLV' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 71',p), lid: free42 }; }
LCLV_REGS 'LCLV "REGS"' = r: 'LCLV "REGS"' { return { rpn: r, raw: 'F6 A7 71 52 45 47 53', lid: free42 }; }

LEFT '←' = r: '←' { return { rpn: r, raw: 'A6 DC', lid: hp42s }; }

LENGTH  'LENGTH' = r: 'LENGTH' { return { rpn: r, raw: 'A7 EC', lid: free42 }; }

LINF 'LINF' = r: 'LINF' { return { rpn: r, raw: 'A0 A1', lid: hp42s }; }

LINSIGMA 'LINΣ' = r: 'LINΣ' { return { rpn: r, raw: 'A0 AD', lid: hp42s }; }

LIST_T  'LIST?' = r: 'LIST?' { return { rpn: r, raw: 'A7 F3', lid: free42 }; }

LJ 'LJ' = r: 'LJ' { return { rpn: r, raw: 'A7 2B', lid: free42 }; }

LN 'LN' = r: 'LN' { return { rpn: r, raw: '50', lid: hp41c }; }

LN_1_X 'LN1+X' = r: 'LN1+X' { return { rpn: r, raw: '65', lid: hp41c }; }

LNSTK 'LNSTK' = r: 'LNSTK' { return { rpn: r, raw: 'A7 E5', lid: free42 }; }

LOCAT 'LOCAT' = r: 'LOCAT' { return { rpn: r, raw: 'A7 D0', lid: free42 }; }

LOG 'LOG' = r: 'LOG' { return { rpn: r, raw: '56', lid: hp41c }; }

LOGF 'LOGF' = r: 'LOGF' { return { rpn: r, raw: 'A0 A2', lid: hp42s }; }

// LSTO ARG_NAMED
LSTO_IND_ST_stk 'LSTO IND ST L,T,X,Y,Z' = r: 'LSTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 ED Ft',p), lid: free42 }; }
LSTO_IND_nam 'LSTO IND "<name[1-6]>"' = r: 'LSTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn CF',p), lid: free42 }; }
LSTO_IND_rr 'LSTO IND 00-99' = r: 'LSTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 ED 8r',p), lid: free42 }; }
LSTO_nam 'LSTO "<name[1-7]>"' = r: 'LSTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn C7',p), lid: free42 }; }

// LXASTO ARG_NAMED
// LXASTO IND ST L   F3 A7 12 F4 
// LXASTO IND "AB"   F4 A7 0A 41 42 
// LXASTO IND 99     F3 A7 12 E3 
// LXASTO "AB"       F4 A7 02 41 42 
// LXASTO "REGS"     F6 A7 02 52 45 47 53
LXASTO_IND_ST_stk 'LXASTO IND ST L,T,X,Y,Z' = r: 'LXASTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 12 Ft',p), lid: free42 }; }
LXASTO_IND_nam 'LXASTO IND "<name[1-6]>"' = r: 'LXASTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 0A',p), lid: free42 }; }
LXASTO_IND_rr 'LXASTO IND 00-99' = r: 'LXASTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 12 8r',p), lid: free42 }; }
LXASTO_nam 'LXASTO "<name[1-7]>"' = r: 'LXASTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 02',p), lid: free42 }; }
LXASTO_REGS 'LXASTO "REGS"' = r: 'LXASTO "REGS"' { return { rpn: r, raw: 'F6 A7 02 52 45 47 53', lid: free42 }; }

MAN 'MAN' = r: 'MAN' { return { rpn: r, raw: 'A7 5B', lid: hp42s }; }

MASKL 'MASKL' = r: 'MASKL' { return { rpn: r, raw: 'A7 35', lid: free42 }; }

MASKR 'MASKR' = r: 'MASKR' { return { rpn: r, raw: 'A7 36', lid: free42 }; }

MAT_T 'MAT?' = r: 'MAT?' { return { rpn: r, raw: 'A2 66', lid: hp42s }; }

MAX '[MAX]' = r: '[MAX]' { return { rpn: r, raw: 'A6 EB', lid: hp42s }; }

MIN '[MIN]' = r: '[MIN]' { return { rpn: r, raw: 'A6 EA', lid: hp42s }; }

MUL '×' = r: '×' { return { rpn: r, raw: '42', lid: hp41c }; }

MDY 'MDY' = r: 'MDY' { return { rpn: r, raw: 'A6 91', lid: free42 }; }

MEAN 'MEAN' = r: 'MEAN' { return { rpn: r, raw: '7C', lid: hp41c }; }

MENU 'MENU' = r: 'MENU' { return { rpn: r, raw: 'A2 5E', lid: hp42s }; }

MOD 'MOD' = r: 'MOD' { return { rpn: r, raw: '4B', lid: hp41c }; }

MVAR_nam 'MVAR "<name[1-7]>"' = r: 'MVAR' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 90',p), lid: hp42s }; }

N_TO_BD 'N→BD' = r: 'N→BD' { return { rpn: r, raw: 'A7 67', lid: free42 }; }

N_TO_BQ 'N→BQ' = r: 'N→BQ' { return { rpn: r, raw: 'A7 68', lid: free42 }; }

N_TO_BS 'N→BS' = r: 'N→BS' { return { rpn: r, raw: 'A7 3F', lid: free42 }; }

N_TO_C 'N→C' = r: 'N→C' { return { rpn: r, raw: 'A7 F2', lid: free42 }; }

N_TO_DD 'N→DD' = r: 'N→DD' { return { rpn: r, raw: 'A7 6A', lid: free42 }; }

N_TO_DQ 'N→DQ' = r: 'N→DQ' { return { rpn: r, raw: 'A7 6B', lid: free42 }; }

N_TO_DS 'N→DS' = r: 'N→DS' { return { rpn: r, raw: 'A7 69', lid: free42 }; }

N_TO_S 'N→S' = r: 'N→S' { return { rpn: r, raw: 'A7 F0', lid: free42 }; }

NEWLIST  'NEWLIST' = r: 'NEWLIST' { return { rpn: r, raw: 'A7 F4', lid: free42 }; }

NEWMAT 'NEWMAT' = r: 'NEWMAT' { return { rpn: r, raw: 'A6 DA', lid: hp42s }; }

NN_TO_S  'NN→S' = r: 'NN→S' { return { rpn: r, raw: 'A7 1D', lid: free42 }; }

NOP 'NOP' = r: 'NOP' { return { rpn: r, raw: 'F0', lid: free42 }; }

NORM 'NORM' = r: 'NORM' { return { rpn: r, raw: 'A7 5C', lid: hp42s }; }

NOT 'NOT' = r: 'NOT' { return { rpn: r, raw: 'A5 87', lid: hp42s }; }

NSTK 'NSTK' = r: 'NSTK' { return { rpn: r, raw: 'A7 E4', lid: free42 }; }

NUM_B '#B' = r: '#B' { return { rpn: r, raw: 'A7 34', lid: hp42s }; }

OCTM 'OCTM' = r: 'OCTM' { return { rpn: r, raw: 'A0 E4', lid: hp42s }; }

OCTSEP 'OCTSEP' = r: 'OCTSEP' { return { rpn: r, raw: 'A7 3C', lid: free42 }; }

OFF 'OFF' = r: 'OFF' { return { rpn: r, raw: '8D', lid: hp41c }; }

OLD 'OLD' = r: 'OLD' { return { rpn: r, raw: 'A6 DB', lid: hp42s }; }

ON 'ON' = r: 'ON' { return { rpn: r, raw: 'A2 70', lid: hp41c }; }

OR 'OR' = r: 'OR' { return { rpn: r, raw: 'A5 89', lid: hp42s }; }

PCOMPLX 'PCOMPLX' = r: 'PCOMPLX' { return { rpn: r, raw: 'A7 F9', lid: free42 }; }

PERCENT '%' = r: '%' { return { rpn: r, raw: '4C', lid: hp41c }; }

PERCENT_CH '%CH' = r: '%CH' { return { rpn: r, raw: '4D', lid: hp41c }; }

PERM 'PERM' = r: 'PERM' { return { rpn: r, raw: 'A0 70', lid: hp42s }; }

// PGMINT ARG_PRGM
PGMINT_IND_ST_stk 'PGMINT IND ST L,T,X,Y,Z' = r: 'PGMINT IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 E8 Ft',p), lid: hp42s }; }
PGMINT_IND_nam 'PGMINT IND "<name[1-6]>"' = r: 'PGMINT IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn BC',p), lid: hp42s }; }
PGMINT_IND_rr 'PGMINT IND 00-99' = r: 'PGMINT IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 E8 8r',p), lid: hp42s }; }
PGMINT_nam 'PGMINT "<name[1-7]>"' = r: 'PGMINT' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B4',p), lid: hp42s }; }

PGMMENU 'PGMMENU' = r: 'PGMMENU' { return { rpn: r, raw: 'A7 E8', lid: free42 }; }

// PGMSLV ARG_PRGM
PGMSLV_IND_ST_stk 'PGMSLV IND ST L,T,X,Y,Z' = r: 'PGMSLV IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 E9 Ft',p), lid: hp42s }; }
PGMSLV_IND_nam 'PGMSLV IND "<name[1-6]>"' = r: 'PGMSLV IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn BD',p), lid: hp42s }; }
PGMSLV_IND_rr 'PGMSLV IND 00-99' = r: 'PGMSLV IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 E9 8r',p), lid: hp42s }; }
PGMSLV_nam 'PGMSLV "<name[1-7]>"' = r: 'PGMSLV' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B5',p), lid: hp42s }; }

// PGMVAR ARG_PRGM
// PGMVAR IND ST L   F3 A7 30 F4 
// PGMVAR IND "AB"   F4 A7 48 41 42 
// PGMVAR IND 99     F3 A7 30 E3 
// PGMVAR "AB"       F4 A7 40 41 42
PGMVAR_IND_ST_stk 'PGMVAR IND ST L,T,X,Y,Z' = r: 'PGMVAR IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 30 Ft',p), lid: free42 }; }
PGMVAR_IND_nam 'PGMVAR IND "<name[1-6]>"' = r: 'PGMVAR IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 48',p), lid: free42 }; }
PGMVAR_IND_rr 'PGMVAR IND 00-99' = r: 'PGMVAR IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 30 8r',p), lid: free42 }; }
PGMVAR_nam 'PGMVAR "<name[1-7]>"' = r: 'PGMVAR' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 40',p), lid: free42 }; }

PI 'PI' = r: 'PI' { return { rpn: r, raw: '72', lid: hp41c }; }

// PICK ARG_NUM9
// PICK IND ST L     F2 A3 F4 
// PICK IND "AB"     F3 FB 41 42
// PICK IND 99       F2 A3 E3 
// PICK 9            F2 A3 09
PICK_IND_ST_stk 'PICK IND ST L,T,X,Y,Z' = r: 'PICK IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A3 Ft',p), lid: free42 }; }
PICK_IND_nam 'PICK IND "<name[1-6]>"' = r: 'PICK IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn FB',p), lid: free42 }; }
PICK_IND_rr 'PICK IND 00-99' = r: 'PICK IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A3 8r',p), lid: free42 }; }
PICK_n 'PICK 0-9' = r: 'PICK' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('F2 A3 0n',p), lid: free42 }; }

PIXEL 'PIXEL' = r: 'PIXEL' { return { rpn: r, raw: 'A7 65', lid: hp42s }; }

PROFF 'PROFF' = r: 'PROFF' { return { rpn: r, raw: 'A7 5F', lid: hp42s }; }

POLAR 'POLAR' = r: 'POLAR' { return { rpn: r, raw: 'A2 59', lid: hp42s }; }

PRON 'PRON' = r: 'PRON' { return { rpn: r, raw: 'A7 5E', lid: hp42s }; }

POS  'POS' = r: 'POS' { return { rpn: r, raw: 'A7 EE', lid: free42 }; }

POSA 'POSA' = r: 'POSA' { return { rpn: r, raw: 'A6 5C', lid: hp42s }; }

PRA 'PRA' = r: 'PRA' { return { rpn: r, raw: 'A7 48', lid: hp42s }; }

PRLCD 'PRLCD' = r: 'PRLCD' { return { rpn: r, raw: 'A7 62', lid: hp42s }; }

PROMPT 'PROMPT' = r: 'PROMPT' { return { rpn: r, raw: '8E', lid: hp41c }; }

PRREG  'PRREG' = r: 'PRREG' { return { rpn: r, raw: 'A7 50', lid: free42 }; }

PRSIGMA 'PRΣ' = r: 'PRΣ' { return { rpn: r, raw: 'A7 52', lid: hp42s }; }

PRSTK 'PRSTK' = r: 'PRSTK' { return { rpn: r, raw: 'A7 53', lid: hp42s }; }

PRUSR 'PRUSR' = r: 'PRUSR' { return { rpn: r, raw: 'A7 61', lid: hp42s }; }

// PRV ARG_NAMED
PRV_IND_ST_stk 'PRV IND ST L,T,X,Y,Z' = r: 'PRV IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D9 Ft',p), lid: hp42s }; }
PRV_IND_nam 'PRV IND "<name[1-6]>"' = r: 'PRV IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B9',p), lid: hp42s }; }
PRV_IND_rr 'PRV IND 00-99' = r: 'PRV IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D9 8r',p), lid: hp42s }; }
PRV_nam 'PRV "<name[1-7]>"' = r: 'PRV' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B1',p), lid: hp42s }; }

PRX 'PRX' = r: 'PRX' { return { rpn: r, raw: 'A7 54', lid: hp42s }; }

PSE 'PSE' = r: 'PSE' { return { rpn: r, raw: '89', lid: hp41c }; }

// PUTLI ARG_L_STK
// PUTLI IND ST L    F3 A7 68 F4 
// PUTLI IND "AB"    F4 A7 7D 41 42 
// PUTLI IND 99      F3 A7 68 E3 
// PUTLI ST L        F3 A7 68 74
// PUTLI "AB"        F4 A7 75 41 42
PUTLI_IND_ST_stk 'PUTLI IND ST L,T,X,Y,Z' = r: 'PUTLI IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 68 Ft',p), lid: free42 }; }
PUTLI_IND_nam 'PUTLI IND "<name[1-6]>"' = r: 'PUTLI IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 7D',p), lid: free42 }; }
PUTLI_IND_rr 'PUTLI IND 00-99' = r: 'PUTLI IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 68 8r',p), lid: free42 }; }
PUTLI_ST_stk 'PUTLI ST L,T,X,Y,Z' = r: 'PUTLI ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 68 7t',p), lid: free42 }; }
PUTLI_nam 'PUTLI "<name[1-7]>"' = r: 'PUTLI' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 75',p), lid: free42 }; }

PUTM 'PUTM' = r: 'PUTM' { return { rpn: r, raw: 'A6 E9', lid: hp42s }; }

// PUTMI ARG_M_STK
// PUTMI IND ST L    F3 A7 66 F4 
// PUTMI IND "AB"    F4 A7 7B 41 42 
// PUTMI IND 99      F3 A7 66 E3 
// PUTMI ST L        F3 A7 66 74 
// PUTMI "AB"        F4 A7 73 41 42 
// PUTMI "REGS"      F6 A7 73 52 45 47 53
PUTMI_IND_ST_stk 'PUTMI IND ST L,T,X,Y,Z' = r: 'PUTMI IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 66 Ft',p), lid: free42 }; }
PUTMI_IND_nam 'PUTMI IND "<name[1-6]>"' = r: 'PUTMI IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 7B',p), lid: free42 }; }
PUTMI_IND_rr 'PUTMI IND 00-99' = r: 'PUTMI IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 66 8r',p), lid: free42 }; }
PUTMI_ST_stk 'PUTMI ST L,T,X,Y,Z' = r: 'PUTMI ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 66 7t',p), lid: free42 }; }
PUTMI_nam 'PUTMI "<name[1-7]>"' = r: 'PUTMI' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 73',p), lid: free42 }; }
PUTMI_REGS 'PUTMI "REGS"' = r: 'PUTMI "REGS"' { return { rpn: r, raw: 'F6 A7 73 52 45 47 53', lid: free42 }; }

PWRF 'PWRF' = r: 'PWRF' { return { rpn: r, raw: 'A0 A3', lid: hp42s }; }

RAD 'RAD' = r: 'RAD' { return { rpn: r, raw: '81', lid: hp42s }; }

RAN 'RAN' = r: 'RAN' { return { rpn: r, raw: 'A0 71', lid: hp42s }; }

// RCL ARG_VAR
RCL_IND_ST_stk 'RCL IND ST L,T,X,Y,Z' = r: 'RCL IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('90 Ft',p), lid: hp41c }; }
RCL_IND_nam 'RCL IND "<name[1-6]>"' = r: 'RCL IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 99',p), lid: hp41c }; }
RCL_IND_rr 'RCL IND 00-99' = r: 'RCL IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('90 8r',p), lid: hp41c }; }
RCL_ST_stk 'RCL ST L,T,X,Y,Z' = r: 'RCL ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('90 7t',p), lid: hp41c }; }
RCL_nam 'RCL "<name[1-7]>"' = r: 'RCL' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 91',p), lid: hp41c }; }
RCL_00_15 'RCL 00-15' = r: 'RCL' _ p: arg_r_00_15 { return { rpn: r + ' ' + p, raw: n2r('2r',p), lid: hp41c }; }
RCL_16_99 'RCL 16-99' = r: 'RCL' _ p: arg_r_16_99 { return { rpn: r + ' ' + p, raw: n2r('90 rr',p), lid: hp41c }; }

// RCL_ADD ARG_VAR
RCL_ADD_IND_ST_stk 'RCL+ IND ST L,T,X,Y,Z' = r: 'RCL+ IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D1 Ft',p), lid: hp42s }; }
RCL_ADD_IND_nam 'RCL+ IND "<name[1-6]>"' = r: 'RCL+ IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 9A',p), lid: hp42s }; }
RCL_ADD_IND_rr 'RCL+ IND 00-99' = r: 'RCL+ IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D1 8r',p), lid: hp42s }; }
RCL_ADD_ST_stk 'RCL+ ST L,T,X,Y,Z' = r: 'RCL+ ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D1 7t',p), lid: hp42s }; }
RCL_ADD_nam 'RCL+ "<name[1-7]>"' = r: 'RCL+' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 92',p), lid: hp42s }; }
RCL_ADD_rr 'RCL+ 00-99' = r: 'RCL+' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D1 rr',p), lid: hp42s }; }

// RCL_DIV ARG_VAR
RCL_DIV_IND_ST_stk 'RCL÷ IND ST L,T,X,Y,Z' = r: 'RCL÷ IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D4 Ft',p), lid: hp42s }; }
RCL_DIV_IND_nam 'RCL÷ IND "<name[1-6]>"' = r: 'RCL÷ IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 9D',p), lid: hp42s }; }
RCL_DIV_IND_rr 'RCL÷ IND 00-99' = r: 'RCL÷ IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D4 8r',p), lid: hp42s }; }
RCL_DIV_ST_stk 'RCL÷ ST L,T,X,Y,Z' = r: 'RCL÷ ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D4 7t',p), lid: hp42s }; }
RCL_DIV_nam 'RCL÷ "<name[1-7]>"' = r: 'RCL÷' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 95',p), lid: hp42s }; }
RCL_DIV_rr 'RCL÷ 00-99' = r: 'RCL÷' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D4 rr',p), lid: hp42s }; }

// RCL_MUL ARG_VAR
RCL_MUL_IND_ST_stk 'RCL× IND ST L,T,X,Y,Z' = r: 'RCL× IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D3 Ft',p), lid: hp42s }; }
RCL_MUL_IND_nam 'RCL× IND "<name[1-6]>"' = r: 'RCL× IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 9C',p), lid: hp42s }; }
RCL_MUL_IND_rr 'RCL× IND 00-99' = r: 'RCL× IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D3 8r',p), lid: hp42s }; }
RCL_MUL_ST_stk 'RCL× ST L,T,X,Y,Z' = r: 'RCL× ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D3 7t',p), lid: hp42s }; }
RCL_MUL_nam 'RCL× "<name[1-7]>"' = r: 'RCL×' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 94',p), lid: hp42s }; }
RCL_MUL_rr 'RCL× 00-99' = r: 'RCL×' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D3 rr',p), lid: hp42s }; }

// RCL_SUB ARG_VAR
RCL_SUB_IND_ST_stk 'RCL- IND ST L,T,X,Y,Z' = r: 'RCL- IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D2 Ft',p), lid: hp42s }; }
RCL_SUB_IND_nam 'RCL- IND "<name[1-6]>"' = r: 'RCL- IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 9B',p), lid: hp42s }; }
RCL_SUB_IND_rr 'RCL- IND 00-99' = r: 'RCL- IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D2 8r',p), lid: hp42s }; }
RCL_SUB_ST_stk 'RCL- ST L,T,X,Y,Z' = r: 'RCL- ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 D2 7t',p), lid: hp42s }; }
RCL_SUB_nam 'RCL- "<name[1-7]>"' = r: 'RCL-' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 93',p), lid: hp42s }; }
RCL_SUB_rr 'RCL- 00-99' = r: 'RCL-' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 D2 rr',p), lid: hp42s }; }

RCLEL 'RCLEL' = r: 'RCLEL' { return { rpn: r, raw: 'A6 D7', lid: hp42s }; }

RCLFLAG 'RCLFLAG' = r: 'RCLFLAG' { return { rpn: r, raw: 'A6 60', lid: free42 }; }

RCLIJ 'RCLIJ' = r: 'RCLIJ' { return { rpn: r, raw: 'A6 D9', lid: hp42s }; }

RCOMPLX 'RCOMPLX' = r: 'RCOMPLX' { return { rpn: r, raw: 'A7 F8', lid: free42 }; }

RDX_COMMA 'RDX,' = r: 'RDX,' { return { rpn: r, raw: 'A2 5C', lid: hp42s }; }

RDX_DOT 'RDX.' = r: 'RDX.' { return { rpn: r, raw: 'A2 5B', lid: hp42s }; }

REAL_T 'REAL?' = r: 'REAL?' { return { rpn: r, raw: 'A2 65', lid: hp42s }; }

REALRES 'REALRES' = r: 'REALRES' { return { rpn: r, raw: 'A2 6B', lid: hp42s }; }

RECT 'RECT' = r: 'RECT' { return { rpn: r, raw: 'A2 5A', lid: hp42s }; }

REV  'REV' = r: 'REV' { return { rpn: r, raw: 'A7 ED', lid: free42 }; }

// RDNN ARG_NUM9
// RDNN R↓N
// R↓N IND ST L      F2 A5 F4 
// R↓N IND "AB"      F3 FE 41 42 
// R↓N IND 99        F2 A5 E3 
// R↓N 9             F2 A5 09
RDNN_IND_ST_stk 'R↓N IND ST L,T,X,Y,Z' = r: 'R↓N IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A5 Ft',p), lid: free42 }; }
RDNN_IND_nam 'R↓N IND "<name[1-6]>"' = r: 'R↓N IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn FE',p), lid: free42 }; }
RDNN_IND_rr 'R↓N IND 00-99' = r: 'R↓N IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A5 8r',p), lid: free42 }; }
RDNN_n 'R↓N 0-9' = r: 'R↓N' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('F2 A5 0n',p), lid: free42 }; }

RDN 'R↓' = r: 'R↓' { return { rpn: r, raw: '75', lid: hp41c }; }

RIGHT '→' = r: '→' { return { rpn: r, raw: 'A6 DD', lid: hp42s }; }

RJ 'RJ' = r: 'RJ' { return { rpn: r, raw: 'A7 72', lid: free42 }; }

RL 'RL' = r: 'RL' { return { rpn: r, raw: 'A7 E0', lid: free42 }; }

RLC 'RLC' = r: 'RLC' { return { rpn: r, raw: 'A7 FB', lid: free42 }; }

RLCN 'RLCN' = r: 'RLCN' { return { rpn: r, raw: 'A7 2F', lid: free42 }; }

RLN 'RLN' = r: 'RLN' { return { rpn: r, raw: 'A7 2D', lid: free42 }; }

RND 'RND' = r: 'RND' { return { rpn: r, raw: '6E', lid: hp41c }; }

RNRM 'RNRM' = r: 'RNRM' { return { rpn: r, raw: 'A6 ED', lid: hp42s }; }

ROTXY 'ROTXY' = r: 'ROTXY' { return { rpn: r, raw: 'A5 8B', lid: hp42s }; }

RR 'RR' = r: 'RR' { return { rpn: r, raw: 'A7 FA', lid: free42 }; }

RRC 'RRC' = r: 'RRC' { return { rpn: r, raw: 'A7 2A', lid: free42 }; }

RRCN 'RRCN' = r: 'RRCN' { return { rpn: r, raw: 'A7 30', lid: free42 }; }

RRN 'RRN' = r: 'RRN' { return { rpn: r, raw: 'A7 2E', lid: free42 }; }

RSUM 'RSUM' = r: 'RSUM' { return { rpn: r, raw: 'A6 D0', lid: hp42s }; }

RTN 'RTN' = r: 'RTN' { return { rpn: r, raw: '85', lid: hp41c }; }

// RTNERR IND ST L    F2 A0 F4 
// RTNERR IND "AB"    F3 E4 41 42 
// RTNERR IND 99      F2 A0 E3 
// RTNERR 8           F2 A0 08
RTNERR_IND_ST_stk 'RTNERR IND ST L,T,X,Y,Z' = r: 'RTNERR IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A0 Ft',p), lid: free42 }; }
RTNERR_IND_nam 'RTNERR IND "<name[1-6]>"' = r: 'RTNERR IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn E4',p), lid: free42 }; }
RTNERR_IND_rr 'RTNERR IND 00-99' = r: 'RTNERR IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A0 8r',p), lid: free42 }; }
RTNERR_err 'RTNERR 0-8' = r: 'RTNERR' _ p: arg_e_0_8 { return { rpn: r + ' ' + p, raw: n2r('F2 A0 er',p), lid: free42 }; }

RTNNO 'RTNNO' = r: 'RTNNO' { return { rpn: r, raw: 'A7 DF', lid: free42 }; }

RTNYES 'RTNYES' = r: 'RTNYES' { return { rpn: r, raw: 'A7 DE', lid: free42 }; }

RUP 'R↑' = r: 'R↑' { return { rpn: r, raw: '74', lid: hp41c }; }

// RUPN ARG_NUM9
// R↑N IND ST L      F2 A6 F4 
// R↑N IND "AB"      F3 FF 41 42 
// R↑N IND 99        F2 A6 E3 
// R↑N 9             F2 A6 09
RUPN_IND_ST_stk 'R↑N IND ST L,T,X,Y,Z' = r: 'R↑N IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A6 Ft',p), lid: free42 }; }
RUPN_IND_nam 'R↑N IND "<name[1-6]>"' = r: 'R↑N IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn FF',p), lid: free42 }; }
RUPN_IND_rr 'R↑N IND 00-99' = r: 'R↑N IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A6 8r',p), lid: free42 }; }
RUPN_n 'R↑N 0-9' = r: 'R↑N' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('F2 A6 0n',p), lid: free42 }; }

R_SWAP 'R<>R' = r: 'R<>R' { return { rpn: r, raw: 'A6 D1', lid: hp42s }; }

S_TO_N 'S→N' = r: 'S→N' { return { rpn: r, raw: 'A7 EF', lid: free42 }; }

SB 'SB' = r: 'SB' { return { rpn: r, raw: 'A7 31', lid: free42 }; }

SC 'SC' = r: 'SC' { return { rpn: r, raw: 'A7 37', lid: free42 }; }

// SCI ARG_NUM11
SCI_10 'SCI 10' = r: 'SCI 10' { return { rpn: r, raw: 'F1 D6', lid: hp41c }; }
SCI_11 'SCI 11' = r: 'SCI 11' { return { rpn: r, raw: 'F1 E6', lid: hp41c }; }
SCI_IND_ST_stk 'SCI IND ST L,T,X,Y,Z' = r: 'SCI IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9D Ft',p), lid: hp41c }; }
SCI_IND_nam 'SCI IND "<name[1-6]>"' = r: 'SCI IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn DD',p), lid: hp41c }; }
SCI_IND_rr 'SCI IND 00-99' = r: 'SCI IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9D 8r',p), lid: hp41c }; }
SCI_dec 'SCI 00-09' = r: 'SCI' _ p: arg_n_00_09 { return { rpn: r + ' ' + p, raw: n2r('9D nn',p), lid: hp41c }; }

SDEV 'SDEV' = r: 'SDEV' { return { rpn: r, raw: '7D', lid: hp41c }; }

SEED 'SEED' = r: 'SEED' { return { rpn: r, raw: 'A0 73', lid: hp42s }; }

// SF ARG_NUM99
SF_IND_ST_stk 'SF IND ST L,T,X,Y,Z' = r: 'SF IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('A8 Ft',p), lid: hp41c }; }
SF_IND_nam 'SF IND "<name[1-6]>"' = r: 'SF IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A8',p), lid: hp41c }; }
SF_IND_rr 'SF IND 00-99' = r: 'SF IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('A8 8r',p), lid: hp41c }; }
// SF 00             A8 00 
// SF 15             A8 0F 
// SF 16             A8 10 
// SF 99             A8 63 
SF_flg 'SF 00-99' = r: 'SF' _ p: arg_f_00_99 { return { rpn: r + ' ' + p, raw: n2r('A8 fl',p), lid: hp41c }; }

SIGMA_ADD 'Σ+' = r: 'Σ+' { return { rpn: r, raw: '47', lid: hp41c }; }

// SIGMAREG ARG_NUM99
SIGMA_REG_IND_ST_stk 'ΣREG IND ST L,T,X,Y,Z' = r: 'ΣREG IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('99 Ft',p), lid: hp41c }; }
SIGMA_REG_IND_nam 'ΣREG IND "<name[1-6]>"' = r: 'ΣREG IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn DB',p), lid: hp41c }; }
SIGMA_REG_IND_rr 'ΣREG IND 00-99' = r: 'ΣREG IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('99 8r',p), lid: hp41c }; }
SIGMA_REG_rr 'ΣREG 00-99' = r: 'ΣREG' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('99 rr',p), lid: hp41c }; }

SIGMA_REG_T 'ΣREG?' = r: 'ΣREG?' { return { rpn: r, raw: 'A6 78', lid: hp42s }; }

SIGMA_SUB 'Σ-' = r: 'Σ-' { return { rpn: r, raw: '48', lid: hp41c }; }

SIGN 'SIGN' = r: 'SIGN' { return { rpn: r, raw: '7A', lid: hp41c }; }

SIN 'SIN' = r: 'SIN' { return { rpn: r, raw: '59', lid: hp41c }; }

SINH 'SINH' = r: 'SINH' { return { rpn: r, raw: 'A0 61', lid: hp42s }; }

// SIZE ARG_COUNT
// SIZE 00           F3 F7 00 00 
// SIZE 01           F3 F7 00 01 
// SIZE 999          F3 F7 03 E7 
// SIZE 9999         F3 F7 27 0F 
SIZE_ssss 'SIZE 00-9999' = r: 'SIZE' _ p: arg_sz_00_9999 { return { rpn: r + ' ' + p , raw: n2r('F3 F7 ss ss',p), lid: hp41c }; }

SKIP 'SKIP' = r: 'SKIP' { return { rpn: r, raw: 'A2 74', lid: free42 }; }

SL 'SL' = r: 'SL' { return { rpn: r, raw: 'A7 DC', lid: free42 }; }

SLN 'SLN' = r: 'SLN' { return { rpn: r, raw: 'A7 73', lid: free42 }; }

SLOPE 'SLOPE' = r: 'SLOPE' { return { rpn: r, raw: 'A0 A4', lid: hp42s }; }

// SOLVE ARG_RVAR
SOLVE_IND_ST_stk 'SOLVE IND ST L,T,X,Y,Z' = r: 'SOLVE IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 EB Ft',p), lid: hp42s }; }
SOLVE_IND_nam 'SOLVE IND "<name[1-6]>"' = r: 'SOLVE IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn BF',p), lid: hp42s }; }
SOLVE_IND_rr 'SOLVE IND 00-99' = r: 'SOLVE IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 EB 8r',p), lid: hp42s }; }
SOLVE_nam 'SOLVE "<name[1-7]>"' = r: 'SOLVE' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn B7',p), lid: hp42s }; }

SQRT 'SQRT' = r: 'SQRT' { return { rpn: r, raw: '52', lid: hp41c }; }

SR 'SR' = r: 'SR' { return { rpn: r, raw: 'A7 DD', lid: free42 }; }

SRN 'SRN' = r: 'SRN' { return { rpn: r, raw: 'A7 74', lid: free42 }; }

SQUARE 'X↑2' = r: 'X↑2' { return { rpn: r, raw: '51', lid: hp41c }; }

// STO ARG_VAR
STO_IND_ST_stk 'STO IND ST L,T,X,Y,Z' = r: 'STO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('91 Ft',p), lid: hp41c }; }
STO_IND_nam 'STO IND "<name[1-6]>"' = r: 'STO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 89',p), lid: hp41c }; }
STO_IND_rr 'STO IND 00-99' = r: 'STO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('91 8r',p), lid: hp41c }; }
STO_ST_stk 'STO ST L,T,X,Y,Z' = r: 'STO ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('91 7t',p), lid: hp41c }; }
STO_nam 'STO "<name[1-7]>"' = r: 'STO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 81',p), lid: hp41c }; }
STO_00_15 'STO 00-15' = r: 'STO' _ p: arg_r_00_15 { return { rpn: r + ' ' + p, raw: n2r('3r',p), lid: hp41c }; }
STO_16_99 'STO 16-99' = r: 'STO' _ p: arg_r_16_99 { return { rpn: r + ' ' + p, raw: n2r('91 rr',p), lid: hp41c }; }

// STO_ADD ARG_VAR
STO_ADD_IND_ST_stk 'STO+ IND ST L,T,X,Y,Z' = r: 'STO+ IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('92 Ft',p), lid: hp41c }; }
STO_ADD_IND_nam 'STO+ IND "<name[1-6]>"' = r: 'STO+ IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 8A',p), lid: hp41c }; }
STO_ADD_IND_rr 'STO+ IND 00-99' = r: 'STO+ IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('92 8r',p), lid: hp41c }; }
STO_ADD_ST_stk 'STO+ ST L,T,X,Y,Z' = r: 'STO+ ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('92 7t',p), lid: hp41c }; }
STO_ADD_nam 'STO+ "<name[1-7]>"' = r: 'STO+' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 82',p), lid: hp41c }; }
STO_ADD_rr 'STO+ 00-99' = r: 'STO+' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('92 rr',p), lid: hp41c }; }

// STO_DIV ARG_VAR
STO_DIV_IND_ST_stk 'STO÷ IND ST L,T,X,Y,Z' = r: 'STO÷ IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('95 Ft',p), lid: hp41c }; }
STO_DIV_IND_nam 'STO÷ IND "<name[1-6]>"' = r: 'STO÷ IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 8D',p), lid: hp41c }; }
STO_DIV_IND_rr 'STO÷ IND 00-99' = r: 'STO÷ IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('95 8r',p), lid: hp41c }; }
STO_DIV_ST_stk 'STO÷ ST L,T,X,Y,Z' = r: 'STO÷ ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('95 7t',p), lid: hp41c }; }
STO_DIV_nam 'STO÷ "<name[1-7]>"' = r: 'STO÷' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 85',p), lid: hp41c }; }
STO_DIV_rr 'STO÷ 00-99' = r: 'STO÷' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('95 rr',p), lid: hp41c }; }

// STO_MUL ARG_VAR
STO_MUL_IND_ST_stk 'STO× IND ST L,T,X,Y,Z' = r: 'STO× IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('94 Ft',p), lid: hp41c }; }
STO_MUL_IND_nam 'STO× IND "<name[1-6]>"' = r: 'STO× IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 8C',p), lid: hp41c }; }
STO_MUL_IND_rr 'STO× IND 00-99' = r: 'STO× IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('94 8r',p), lid: hp41c }; }
STO_MUL_ST_stk 'STO× ST L,T,X,Y,Z' = r: 'STO× ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('94 7t',p), lid: hp41c }; }
STO_MUL_nam 'STO× "<name[1-7]>"' = r: 'STO×' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 84',p), lid: hp41c }; }
STO_MUL_rr 'STO× 00-99' = r: 'STO×' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('94 rr',p), lid: hp41c }; }

// STO_SUB ARG_VAR
STO_SUB_IND_ST_stk 'STO- IND ST L,T,X,Y,Z' = r: 'STO- IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('93 Ft',p), lid: hp41c }; }
STO_SUB_IND_nam 'STO- IND "<name[1-6]>"' = r: 'STO- IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 8B',p), lid: hp41c }; }
STO_SUB_IND_rr 'STO- IND 00-99' = r: 'STO- IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('93 8r',p), lid: hp41c }; }
STO_SUB_ST_stk 'STO- ST L,T,X,Y,Z' = r: 'STO- ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('93 7t',p), lid: hp41c }; }
STO_SUB_nam 'STO- "<name[1-7]>"' = r: 'STO-' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 83',p), lid: hp41c }; }
STO_SUB_rr 'STO- 00-99' = r: 'STO-' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('93 rr',p), lid: hp41c }; }

STOEL 'STOEL' = r: 'STOEL' { return { rpn: r, raw: 'A6 D6', lid: hp42s }; }

STOFLAG 'STOFLAG' = r: 'STOFLAG' { return { rpn: r, raw: 'A6 6D', lid: free42 }; }

STOIJ 'STOIJ' = r: 'STOIJ' { return { rpn: r, raw: 'A6 D8', lid: hp42s }; }

STOP 'STOP' = r: 'STOP' { return { rpn: r, raw: '84', lid: hp42s }; }

STR_T 'STR?' = r: 'STR?' { return { rpn: r, raw: 'A2 68', lid: hp42s }; }

STRACE 'STRACE' = r: 'STRACE' { return { rpn: r, raw: 'A7 E1', lid: free42 }; }

SUB '-' = r: '-' { return { rpn: r, raw: '41', lid: hp41c }; }

SUBSTR 'SUBSTR' = r: 'SUBSTR' { return { rpn: r, raw: 'A7 EB', lid: free42 }; }
    
SUM 'SUM' = r: 'SUM' { return { rpn: r, raw: 'A0 A5', lid: hp42s }; }

SWAP 'X<>Y' = r: 'X<>Y' { return { rpn: r, raw: '71', lid: hp41c }; }

TAN 'TAN' = r: 'TAN' { return { rpn: r, raw: '5B', lid: hp41c }; }

TANH 'TANH' = r: 'TANH' { return { rpn: r, raw: 'A0 63', lid: hp42s }; }

TIME 'TIME' = r: 'TIME' { return { rpn: r, raw: 'A6 9C', lid: free42 }; }

TO_DEC '→DEC' = r: '→DEC' { return { rpn: r, raw: '5F', lid: hp41c }; }

TO_DEG '→DEG' = r: '→DEG' { return { rpn: r, raw: '6B', lid: hp41c }; }

TO_HMS '→HMS' = r: '→HMS' { return { rpn: r, raw: '6C', lid: hp41c }; }

TO_HR  '→HR'  = r: '→HR'  { return { rpn: r, raw: '6D', lid: hp41c }; }

TO_LIST '→LIST'  = r: '→LIST'  { return { rpn: r, raw: 'A6 FC', lid: free42 }; }

TO_OCT '→OCT' = r: '→OCT' { return { rpn: r, raw: '6F', lid: hp41c }; }

TO_POL '→POL' = r: '→POL' { return { rpn: r, raw: '4F', lid: hp41c }; }

TO_RAD '→RAD' = r: '→RAD' { return { rpn: r, raw: '6A', lid: hp41c }; }

TO_REC '→REC' = r: '→REC' { return { rpn: r, raw: '4E', lid: hp41c }; }

// TONE ARG_NUM9
TONE_IND_ST_stk 'TONE IND ST L,T,X,Y,Z' = r: 'TONE IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('9F Ft',p), lid: hp41c }; }
TONE_IND_nam 'TONE IND "<name[1-6]>"' = r: 'TONE IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn DF',p), lid: hp41c }; }
TONE_IND_rr 'TONE IND 00-99' = r: 'TONE IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('9F 8r',p), lid: hp41c }; }
TONE_n 'TONE 0-9' = r: 'TONE' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('9F tn',p), lid: hp41c }; }

TRACE 'TRACE' = r: 'TRACE' { return { rpn: r, raw: 'A7 5D', lid: hp42s }; }

TRANS 'TRANS' = r: 'TRANS' { return { rpn: r, raw: 'A6 C9', lid: hp42s }; }

TYPE_T  'TYPE?' = r: 'TYPE?' { return { rpn: r, raw: 'A2 76', lid: free42 }; }

// UNPICK ARG_NUM9
// UNPICK IND ST L   F2 A4 F4 
// UNPICK IND "AB"   F3 FC 41 42 
// UNPICK IND 99     F2 A4 E3 
// UNPICK 9          F2 A4 09
UNPICK_IND_ST_stk 'UNPICK IND ST L,T,X,Y,Z' = r: 'UNPICK IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 A4 Ft',p), lid: free42 }; }
UNPICK_IND_nam 'UNPICK IND "<name[1-6]>"' = r: 'UNPICK IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn FC',p), lid: free42 }; }
UNPICK_IND_rr 'UNPICK IND 00-99' = r: 'UNPICK IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 A4 8r',p), lid: free42 }; }
UNPICK_n 'UNPICK 0-9' = r: 'UNPICK' _ p: arg_n_0_9 { return { rpn: r + ' ' + p, raw: n2r('F2 A4 0n',p), lid: free42 }; }

UP '↑' = r: '↑' { return { rpn: r, raw: 'A6 DE', lid: hp42s }; }

UVEC 'UVEC' = r: 'UVEC' { return { rpn: r, raw: 'A6 CD', lid: hp42s }; }

// VARMENU ARG_PRGM
VARMENU_IND_ST_stk 'VARMENU IND ST L,T,X,Y,Z' = r: 'VARMENU IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F2 F8 Ft',p), lid: hp42s }; }
VARMENU_IND_nam 'VARMENU IND "<name[1-6]>"' = r: 'VARMENU IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn C9',p), lid: hp42s }; }
VARMENU_IND_rr 'VARMENU IND 00-99' = r: 'VARMENU IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F2 F8 8r',p), lid: hp42s }; }
VARMENU_nam 'VARMENU "<name[1-7]>"' = r: 'VARMENU' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn C1',p), lid: hp42s }; }

// VARMNU1 ARG_PRGM
// VARMNU1 IND ST L  F3 A7 31 F4 
// VARMNU1 IND "AB"  F4 A7 4A 41 42 
// VARMNU1 IND 99    F3 A7 31 E3 
// VARMNU1 "AB"      F4 A7 42 41 42
VARMNU1_IND_ST_stk 'VARMNU1 IND ST L,T,X,Y,Z' = r: 'VARMNU1 IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 31 Ft',p), lid: free42 }; }
VARMNU1_IND_nam 'VARMNU1 IND "<name[1-6]>"' = r: 'VARMNU1 IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 4A',p), lid: free42 }; }
VARMNU1_IND_rr 'VARMNU1 IND 00-99' = r: 'VARMNU1 IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 31 8r',p), lid: free42 }; }
VARMNU1_nam 'VARMNU1 "<name[1-7]>"' = r: 'VARMNU1' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 42',p), lid: free42 }; }

// VIEW ARG_VAR
VIEW_IND_ST_stk 'VIEW IND ST L,T,X,Y,Z' = r: 'VIEW IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('98 Ft',p), lid: hp41c }; }
VIEW_IND_nam 'VIEW IND "<name[1-6]>"' = r: 'VIEW IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 88',p), lid: hp41c }; }
VIEW_IND_rr 'VIEW IND 00-99' = r: 'VIEW IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('98 8r',p), lid: hp41c }; }
VIEW_ST_stk 'VIEW ST L,T,X,Y,Z' = r: 'VIEW ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('98 7t',p), lid: hp41c }; }
VIEW_nam 'VIEW "<name[1-7]>"' = r: 'VIEW' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 80',p), lid: hp41c }; }
VIEW_rr 'VIEW 00-99' = r: 'VIEW' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('98 rr',p), lid: hp41c }; }

WIDTH 'WIDTH' = r: 'WIDTH' { return { rpn: r, raw: 'A2 72', lid: free42 }; }

WMEAN 'WMEAN' = r: 'WMEAN' { return { rpn: r, raw: 'A0 AC', lid: hp42s }; }

WRAP 'WRAP' = r: 'WRAP' { return { rpn: r, raw: 'A6 E2', lid: hp42s }; }

WSIZE 'WSIZE' = r: 'WSIZE' { return { rpn: r, raw: 'A7 D3', lid: free42 }; }

WSIZE_T 'WSIZE?' = r: 'WSIZE?' { return { rpn: r, raw: 'A7 D4', lid: free42 }; }

X_EQ_0 'X=0?' = r: 'X=0?' { return { rpn: r, raw: '67', lid: hp41c }; }

// X_EQ_NN ARG_VAR
// X=? IND ST L      F3 A7 14 F4
// X=? IND "AB"      F4 A7 0C 41 42
// X=? IND 99        F3 A7 14 E3
// X=? ST L          F3 A7 14 74
// X=? "AB"          F4 A7 04 41 42
// X=? 99            F3 A7 14 63
// X=? "REGS"        F6 A7 04 52 45 47 53
X_EQ_NN_IND_ST_stk 'X=? IND ST L,T,X,Y,Z' = r: 'X=? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 14 Ft',p), lid: free42 }; }
X_EQ_NN_IND_nam 'X=? IND "<name[1-6]>"' = r: 'X=? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 0C',p), lid: free42 }; }
X_EQ_NN_IND_rr 'X=? IND 00-99' = r: 'X=? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 14 8r',p), lid: free42 }; }
X_EQ_NN_ST_stk 'X=? ST L,T,X,Y,Z' = r: 'X=? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 14 7t',p), lid: free42 }; }
X_EQ_NN_nam 'X=? "<name[1-7]>"' = r: 'X=?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 04',p), lid: free42 }; }
X_EQ_NN_rr 'X=? 00-99' = r: 'X=?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 14 rr',p), lid: free42 }; }
X_EQ_NN_REGS 'X=? "REGS"' = r: 'X=? "REGS"' { return { rpn: r, raw: 'F6 A7 04 52 45 47 53', lid: free42 }; }

X_EQ_Y 'X=Y?' = r: 'X=Y?' { return { rpn: r, raw: '78', lid: hp41c }; }

X_GE_0 'X≥0?' = r: 'X≥0?' { return { rpn: r, raw: 'A2 5F', lid: hp41c }; }

// X_GE_NN ARG_VAR
// X≥? IND ST L      F3 A7 19 F4
// X≥? IND "AB"      F4 A7 29 41 42
// X≥? IND 99        F3 A7 19 E3
// X≥? ST L          F3 A7 19 74
// X≥? "AB"          F4 A7 21 41 42 
// X≥? 99            F3 A7 19 63
// X≥? "REGS"        F6 A7 21 52 45 47 53
X_GE_NN_IND_ST_stk 'X≥? IND ST L,T,X,Y,Z' = r: 'X≥? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 19 Ft',p), lid: free42 }; }
X_GE_NN_IND_nam 'X≥? IND "<name[1-6]>"' = r: 'X≥? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 29',p), lid: free42 }; }
X_GE_NN_IND_rr 'X≥? IND 00-99' = r: 'X≥? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 19 8r',p), lid: free42 }; }
X_GE_NN_ST_stk 'X≥? ST L,T,X,Y,Z' = r: 'X≥? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 19 7t',p), lid: free42 }; }
X_GE_NN_nam 'X≥? "<name[1-7]>"' = r: 'X≥?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 21',p), lid: free42 }; }
X_GE_NN_rr 'X≥? 00-99' = r: 'X≥?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 19 rr',p), lid: free42 }; }
X_GE_NN_REGS 'X≥? "REGS"' = r: 'X≥? "REGS"' { return { rpn: r, raw: 'F6 A7 21 52 45 47 53', lid: free42 }; }

X_GE_Y 'X≥Y?' = r: 'X≥Y?' { return { rpn: r, raw: 'A2 60', lid: hp41c }; }

X_GT_0 'X>0?' = r: 'X>0?' { return { rpn: r, raw: '64', lid: hp41c }; }

// X_GT_NN ARG_VAR
// X>? IND ST L      F3 A7 17 F4
// X>? IND "AB"      F4 A7 0F 41 42
// X>? IND 99        F3 A7 17 E3
// X>? ST L          F3 A7 17 74
// X>? "AB"          F4 A7 07 41 42
// X>? 99            F3 A7 17 63
// X>? "REGS"        F6 A7 07 52 45 47 53
X_GT_NN_IND_ST_stk 'X>? IND ST L,T,X,Y,Z' = r: 'X>? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 17 Ft',p), lid: free42 }; }
X_GT_NN_IND_nam 'X>? IND "<name[1-6]>"' = r: 'X>? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 0F',p), lid: free42 }; }
X_GT_NN_IND_rr 'X>? IND 00-99' = r: 'X>? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 17 8r',p), lid: free42 }; }
X_GT_NN_ST_stk 'X>? ST L,T,X,Y,Z' = r: 'X>? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 17 7t',p), lid: free42 }; }
X_GT_NN_nam 'X>? "<name[1-7]>"' = r: 'X>?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 07',p), lid: free42 }; }
X_GT_NN_rr 'X>? 00-99' = r: 'X>?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 17 rr',p), lid: free42 }; }
X_GT_NN_REGS 'X>? "REGS"' = r: 'X>? "REGS"' { return { rpn: r, raw: 'F6 A7 07 52 45 47 53', lid: free42 }; }

X_GT_Y 'X>Y?' = r: 'X>Y?' { return { rpn: r, raw: '45', lid: hp41c }; }

X_LE_0 'X≤0?' = r: 'X≤0?' { return { rpn: r, raw: '7B', lid: hp41c }; }

// X_LE_NN ARG_VAR
// X≤? IND ST L      F3 A7 18 F4
// X≤? IND "AB"      F4 A7 28 41 42
// X≤? IND 99        F3 A7 18 E3
// X≤? ST L          F3 A7 18 74
// X≤? "AB"          F4 A7 20 41 42
// X≤? 99            F3 A7 18 63
// X≤? "REGS"        F6 A7 20 52 45 47 53
X_LE_NN_IND_ST_stk 'X≤? IND ST L,T,X,Y,Z' = r: 'X≤? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 18 Ft',p), lid: free42 }; }
X_LE_NN_IND_nam 'X≤? IND "<name[1-6]>"' = r: 'X≤? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 28',p), lid: free42 }; }
X_LE_NN_IND_rr 'X≤? IND 00-99' = r: 'X≤? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 18 8r',p), lid: free42 }; }
X_LE_NN_ST_stk 'X≤? ST L,T,X,Y,Z' = r: 'X≤? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 18 7t',p), lid: free42 }; }
X_LE_NN_nam 'X≤? "<name[1-7]>"' = r: 'X≤?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 20',p), lid: free42 }; }
X_LE_NN_rr 'X≤? 00-99' = r: 'X≤?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 18 rr',p), lid: free42 }; }
X_LE_NN_REGS 'X≤? "REGS"' = r: 'X≤? "REGS"' { return { rpn: r, raw: 'F6 A7 20 52 45 47 53', lid: free42 }; }

X_LE_Y 'X≤Y?' = r: 'X≤Y?' { return { rpn: r, raw: '46', lid: hp41c }; }

X_LT_0 'X<0?' = r: 'X<0?' { return { rpn: r, raw: '66', lid: hp41c }; }

// X_LT_NN ARG_VAR
// X<? IND ST L      F3 A7 16 F4
// X<? IND "AB"      F4 A7 0E 41 42
// X<? IND 99        F3 A7 16 E3
// X<? ST L          F3 A7 16 74
// X<? "AB"          F4 A7 06 41 42 
// X<? 99            F3 A7 16 63
// X<? "REGS"        F6 A7 06 52 45 47 53
X_LT_NN_IND_ST_stk 'X<? IND ST L,T,X,Y,Z' = r: 'X<? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 16 Ft',p), lid: free42 }; }
X_LT_NN_IND_nam 'X<? IND "<name[1-6]>"' = r: 'X<? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 0E',p), lid: free42 }; }
X_LT_NN_IND_rr 'X<? IND 00-99' = r: 'X<? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 16 8r',p), lid: free42 }; }
X_LT_NN_ST_stk 'X<? ST L,T,X,Y,Z' = r: 'X<? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 16 7t',p), lid: free42 }; }
X_LT_NN_nam 'X<? "<name[1-7]>"' = r: 'X<?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 06',p), lid: free42 }; }
X_LT_NN_rr 'X<? 00-99' = r: 'X<?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 16 rr',p), lid: free42 }; }
X_LT_NN_REGS 'X<? "REGS"' = r: 'X<? "REGS"' { return { rpn: r, raw: 'F6 A7 06 52 45 47 53', lid: free42 }; }

X_LT_Y 'X<Y?' = r: 'X<Y?' { return { rpn: r, raw: '44', lid: hp41c }; }

X_NE_0 'X≠0?' = r: 'X≠0?' { return { rpn: r, raw: '63', lid: hp41c }; }

// X_NE_NN ARG_VAR
// X≠? IND ST L      F3 A7 15 F4
// X≠? IND "AB"      F4 A7 0D 41 42
// X≠? IND 99        F3 A7 15 E3
// X≠? ST L          F3 A7 15 74
// X≠? "AB"          F4 A7 05 41 42
// X≠? 99            F3 A7 15 63
// X≠? "REGS"        F6 A7 05 52 45 47 53 
X_NE_NN_IND_ST_stk 'X≠? IND ST L,T,X,Y,Z' = r: 'X≠? IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 15 Ft',p), lid: hp42s }; }
X_NE_NN_IND_nam 'X≠? IND "<name[1-6]>"' = r: 'X≠? IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 0D',p), lid: hp42s }; }
X_NE_NN_IND_rr 'X≠? IND 00-99' = r: 'X≠? IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 15 8r',p), lid: hp42s }; }
X_NE_NN_ST_stk 'X≠? ST L,T,X,Y,Z' = r: 'X≠? ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 15 7t',p), lid: hp42s }; }
X_NE_NN_nam 'X≠? "<name[1-7]>"' = r: 'X≠?' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 05',p), lid: hp42s }; }
X_NE_NN_rr 'X≠? 00-99' = r: 'X≠?' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 15 rr',p), lid: hp42s }; }
X_NE_NN_REGS 'X≠? "REGS"' = r: 'X≠? "REGS"' { return { rpn: r, raw: 'F6 A7 05 52 45 47 53', lid: hp42s }; }

X_NE_Y 'X≠Y?' = r: 'X≠Y?' { return { rpn: r, raw: '79', lid: hp41c }; }

// X_SWAP ARG_VAR
// X<> IND ST L      CE F4 
// X<> IND "AB       F3 8E 41 42 
// X<> IND 99        CE E3
// X<> ST L          CE 74 
// X<> "AB"          F3 86 41 42 
// X<> "REGS"        CE 63 F5 86 52 45 47 53 
X_SWAP_IND_ST_stk 'X<> IND ST L,T,X,Y,Z' = r: 'X<> IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('CE Ft',p), lid: hp41c }; }
X_SWAP_IND_nam 'X<> IND "<name[1-6]>"' = r: 'X<> IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 8E',p), lid: hp41c }; }
X_SWAP_IND_rr 'X<> IND 00-99' = r: 'X<> IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('CE 8r',p), lid: hp41c }; }
X_SWAP_ST_stk 'X<> ST L,T,X,Y,Z' = r: 'X<> ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('CE 7t',p), lid: hp41c }; }
X_SWAP_nam 'X<> "<name[1-7]>"' = r: 'X<>' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn 86',p), lid: hp41c }; }
X_SWAP_rr 'X<> 00-99' = r: 'X<>' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('CE rr',p), lid: hp41c }; }
X_SWAP_REGS 'X<> "REGS"' = r: 'X<> "REGS"' { return { rpn: r, raw: 'F5 86 52 45 47 53', lid: hp41c }; }

X_SWAP_F 'X<>F' = r: 'X<>F' { return { rpn: r, raw: 'A6 6E', lid: free42 }; }

// XASTO ARG_VAR
// XASTO IND ST L    F3 A7 11 F4 
// XASTO IND "AB"    F4 A7 09 41 42 
// XASTO IND 99      F3 A7 11 E3 
// XASTO ST L        F3 A7 11 74 
// XASTO "AB"        F4 A7 01 41 42 
// XASTO 99          F3 A7 11 63 
// XASTO "REGS"      F6 A7 01 52 45 47 53
XASTO_IND_ST_stk 'XASTO IND ST L,T,X,Y,Z' = r: 'XASTO IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 11 Ft',p), lid: free42 }; }
XASTO_IND_nam 'XASTO IND "<name[1-6]>"' = r: 'XASTO IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 09',p), lid: free42 }; }
XASTO_IND_rr 'XASTO IND 00-99' = r: 'XASTO IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 11 8r',p), lid: free42 }; }
XASTO_ST_stk 'XASTO ST L,T,X,Y,Z' = r: 'XASTO ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('F3 A7 11 7t',p), lid: free42 }; }
XASTO_nam 'XASTO "<name[1-7]>"' = r: 'XASTO' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 01',p), lid: free42 }; }
XASTO_rr 'XASTO 00-99' = r: 'XASTO' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('F3 A7 11 rr',p), lid: free42 }; }
XASTO_REGS 'XASTO "REGS"' = r: 'XASTO "REGS"' { return { rpn: r, raw: 'F6 A7 01 52 45 47 53', lid: free42 }; }

// XEQ ARG_LBL
// XEQ IND ST L      AE F4 
// XEQ IND "AB"      F3 AF 41 42 
// XEQ IND 99        AE E3 1E 
// XEQ "AB"          F2 41 42 
// XEQ 99            E0 00 63 
XEQ_IND_ST_stk 'XEQ IND ST L,T,X,Y,Z' = r: 'XEQ IND ST' _ p: arg_stk { return { rpn: r + ' ' + p, raw: n2r('AE Ft',p), lid: hp41c }; }
XEQ_IND_nam 'XEQ IND "<name[1-6]>"' = r: 'XEQ IND' _ p: arg_s_1_6 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn AF',p), lid: hp41c }; }
XEQ_IND_rr 'XEQ IND 00-99' = r: 'XEQ IND' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('AE 8r',p), lid: hp41c }; }
XEQ_nam 'XEQ "<name[1-7]>"' = r: 'XEQ' _ p: arg_s_1_7 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('1E Fn',p), lid: hp41c }; }
XEQ_lbl_00_e 'XEQ 00-e' = r: 'XEQ' _ p: arg_l_00_e { return { rpn: r + ' ' + p, raw: n2r('E0 00 0e',p), lid: hp41c }; }
XEQ_rr 'XEQ 00-99' = r: 'XEQ' _ p: arg_r_00_99 { return { rpn: r + ' ' + p, raw: n2r('E0 00 rr',p), lid: hp41c }; }

XOR 'XOR' = r: 'XOR' { return { rpn: r, raw: 'A5 8A', lid: hp42s }; }

// XSTR ARG_XSTR
// XSTR ""                        F4 A7 41                                                                               -> 0 chars
// XSTR "AB"                      F4 A7 41  41 42                                                                        -> < 13 chars
// XSTR "ABCDEFGHIJKLM"           FF A7 41  41 42 43 44 45 46 47 48 49 4A 4B 4C 4D                                       -> ≤ 13 chars
XSTR_str_13 'XSTR "<text[0-13]>"' = r: 'XSTR' _ p: arg_s_0_13 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2h('Fn A7 41',p), lid: free42 }; }

// XSTR "ABCDEFGHIJKLMN"          FF A7 49  41 42 43 44 45 46 47 48 49 4A 4B 4C 4D  F3 A7 41  4E                         ->   14 chars
// XSTR "ABCDEFGHIJKLMNOPQRSTUV"  FF A7 49  41 42 43 44 45 46 47 48 49 4A 4B 4C 4D  FB A7 41  4E 4F 50 51 52 53 54 55 56 -> ≤ 22 chars
XSTR_str_22 'XSTR "<text[14-22]>"' = r: 'XSTR' _ p: arg_s_14_22 { var q = sq(p); return { rpn: r + ' ' + q + p + q, raw: s2hextended('Fn A7 49','Fn A7 41',p), lid: free42 }; }

XTOA 'XTOA' = r: 'XTOA' { return { rpn: r, raw: 'A6 6F', lid: hp42s }; }

XVIEW 'XVIEW' = r: 'XVIEW' { return { rpn: r, raw: 'A7 19', lid: free42 }; }

Y_POW_X 'Y↑X' = r: 'Y↑X' { return { rpn: r, raw: '53', lid: hp41c }; }

YINT 'YINT' = r: 'YINT' { return { rpn: r, raw: 'A0 A6', lid: hp42s }; }

YMD 'YMD' = r: 'YMD' { return { rpn: r, raw: 'A7 D5', lid: free42 }; }
