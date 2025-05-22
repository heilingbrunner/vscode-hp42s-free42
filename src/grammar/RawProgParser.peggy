// free42-RAW-PARSER
// J.Heilingbrunner
// This grammar is based on the hp42s/free42 RAW programming language.
// The parser transforms the RAW code into a JSON objects with RPN opcodes.
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
	var pos = 0;
	var n = 0;

    function init() {

        if (initDone) {
            return;
        }

        // init charMap
        
        // see page 288, hp42s-om-en.pdf
        // 0-129, hex:00-81
        var charArr = [
        { key: 0, value: '÷' },
        { key: 1, value: '×' },
        { key: 2, value: '√' },
        { key: 3, value: '∫' },
        { key: 4, value: '░' },
        { key: 5, value: 'Σ' },
        { key: 6, value: '▸' },   // ▸, not ▶
        { key: 7, value: 'π' },
        { key: 8, value: '¿' },
        { key: 9, value: '≤' },
        { key: 10, value: '␊' }, // ␊ see: https://www.compart.com/de/unicode/U+240A
        { key: 11, value: '≥' },
        { key: 12, value: '≠' },
        { key: 13, value: '↵' },
        { key: 14, value: '↓' },
        { key: 15, value: '→' },
        { key: 16, value: '←' },
        // { key: 17, value: 'µ' }, // different bytes B5
        { key: 17, value: 'μ' }, // different bytes N<
        { key: 18, value: '£' },
        { key: 18, value: '₤' },
        { key: 19, value: '°' },
        { key: 20, value: 'Å' },
        { key: 21, value: 'Ñ' },
        { key: 22, value: 'Ä' },
        { key: 23, value: '∡' },
        { key: 24, value: 'ᴇ' },
        { key: 25, value: 'Æ' },
        { key: 26, value: '…' },
        { key: 27, value: '␛' },
        { key: 28, value: 'Ö' },
        { key: 29, value: 'Ü' },
        { key: 30, value: '▒' },
        { key: 31, value: '■' },
        { key: 32, value: ' ' },
        { key: 33, value: '!' },
        { key: 34, value: '"' }, // double quote !!
        { key: 35, value: '£' },
        { key: 35, value: '₤' },
        { key: 35, value: '#' },
        { key: 36, value: '$' },
        { key: 37, value: '%' },
        { key: 38, value: '&' },
        { key: 39, value: "'" }, // single quote !!
        { key: 40, value: '(' },
        { key: 41, value: ')' },
        { key: 42, value: '*' },
        { key: 43, value: '+' },
        { key: 44, value: ',' },
        { key: 45, value: '-' },
        { key: 46, value: '.' },
        { key: 47, value: '/' },
        { key: 48, value: '0' },
        { key: 49, value: '1' },
        { key: 50, value: '2' },
        { key: 51, value: '3' },
        { key: 52, value: '4' },
        { key: 53, value: '5' },
        { key: 54, value: '6' },
        { key: 55, value: '7' },
        { key: 56, value: '8' },
        { key: 57, value: '9' },
        { key: 58, value: ':' },
        { key: 59, value: ';' },
        { key: 60, value: '<' },
        { key: 61, value: '=' },
        { key: 62, value: '>' },
        { key: 63, value: '?' },
        { key: 64, value: '@' },
        { key: 65, value: 'A' },
        { key: 66, value: 'B' },
        { key: 67, value: 'C' },
        { key: 68, value: 'D' },
        { key: 69, value: 'E' },
        { key: 70, value: 'F' },
        { key: 71, value: 'G' },
        { key: 72, value: 'H' },
        { key: 73, value: 'I' },
        { key: 74, value: 'J' },
        { key: 75, value: 'K' },
        { key: 76, value: 'L' },
        { key: 77, value: 'M' },
        { key: 78, value: 'N' },
        { key: 79, value: 'O' },
        { key: 80, value: 'P' },
        { key: 81, value: 'Q' },
        { key: 82, value: 'R' },
        { key: 83, value: 'S' },
        { key: 84, value: 'T' },
        { key: 85, value: 'U' },
        { key: 86, value: 'V' },
        { key: 87, value: 'W' },
        { key: 88, value: 'X' },
        { key: 89, value: 'Y' },
        { key: 90, value: 'Z' },
        { key: 91, value: '[' },
        { key: 92, value: '\\' }, // for escaped backslash required for '\'
        { key: 93, value: ']' },
        { key: 94, value: '↑' },
        { key: 95, value: '_' },
        { key: 96, value: '`' },
        { key: 97, value: 'a' },
        { key: 98, value: 'b' },
        { key: 99, value: 'c' },
        { key: 100, value: 'd' },
        { key: 101, value: 'e' },
        { key: 102, value: 'f' },
        { key: 103, value: 'g' },
        { key: 104, value: 'h' },
        { key: 105, value: 'i' },
        { key: 106, value: 'j' },
        { key: 107, value: 'k' },
        { key: 108, value: 'l' },
        { key: 109, value: 'm' },
        { key: 110, value: 'n' },
        { key: 111, value: 'o' },
        { key: 112, value: 'p' },
        { key: 113, value: 'q' },
        { key: 114, value: 'r' },
        { key: 115, value: 's' },
        { key: 116, value: 't' },
        { key: 117, value: 'u' },
        { key: 118, value: 'v' },
        { key: 119, value: 'w' },
        { key: 120, value: 'x' },
        { key: 121, value: 'y' },
        { key: 122, value: 'z' },
        { key: 123, value: '{' },
        { key: 124, value: '|' },
        { key: 125, value: '}' },
        { key: 126, value: '~' },
        { key: 127, value: '⊦' }, // ENTER, start char for second line
        { key: 129, value: '¥' }
        ];
        // { key: 128, value: ':' }, double see { key: 58, value: ':' }
        // new in PLUS42, but causes error !!!!
        // { key: 130, value: 'Ω' } 
        // { key: ???, value: '´' }

        var l = charArr.length;
        for (var i = 0; i < l; i++) {
            var k = charArr[i].key;
            var v = charArr[i].value;
            charMap.set(parseInt(k),v);
        }

        log = 'charMap.size: ' + charMap.size;
    }

    function getLog() {
        return log;
    }

    function ft(stk) {
        // convert number to stack name
        if (stk === null)
            return '?';

        var st = '';
        var i = parseInt(stk,10);
        switch(i){ 
            case 0:
                st='T';
                break; 
            case 1:
                st='Z'; 
                break;
            case 2:
                st='Y'; 
                break;
            case 3:
                st='X';
                break; 
            case 4: 
                st='L'; 
                break; 
            default: 
                st='?';
        };
        return st;
    }

    function fi(p) {
        // convert hex to integer
        if (p === null)
            return '?';
            
        return parseInt(p,16);
    }

    function fn(p) {
        // convert hex code to number. 11 1A 12 13 14 1B 1C 14 15 15 00 -> '1.234E-455'
        if (p === null)
            return '?';
            
        let num = "";
    
        p = p.toString();  
        if (p) {
            p = p.replace(/00$/, "");
            p = p.replace(/1A/, ".");
            p = p.replace(/1B/, "ᴇ");
            p = p.replace(/1C/g, "-");
            p = p.replace(/1([0-9])/g, "$1");
            p = p.replace(/ /g, "");
            num = p;
        }

        // TODO: Format 0.008 -> 8ᴇ-3
        const match = num.match(/(0+)\.(0+)(\d+)(ᴇ|)((-|)\d+|)/);
        if (match) {
            let len1 = match[1].length;
            let len2 = match[2].length;
            let len3 = match[3].length;
            let exp = parseInt(match[5]);
            let float = parseFloat(match[0].replace("ᴇ", "e"));
            // 0.008 -> 8ᴇ-3
            if (len2 > 1) {
                //console.log(
                //  (float * Math.pow(10, (-exp + len2 + len3))).toExponential(0).replace('e', 'ᴇ') + (exp - (len2 + len3))
                //);
            }
        }

        return num;
    }

    function fs(ch) {
        // get value from charMap for given char
        if (ch === null)
            return '?';

        let str = '';
        ch = ch.toString();

        if (ch) {
          let chars = ch.split(' ');

          chars.forEach((char) => {
            let val = fi(char);

            if (charMap.has(val)) {
              str += charMap.get(val);
            }

          });
        }
        
        return str;
    }
    
    function fc(k,offset) {
        // get char from charMap for given index
        if (k === null)
            return '?';
     
        let i = k-offset;
        
        let str = '';
        if (charMap.has(i)) {
           str = charMap.get(i);
        }     

        return str;
    }
    
    function fmt(num, zeros){
        // format number with leading zeros
        return String(num).padStart(zeros, '0');
    }

    function sq(p) {
        // get single or double quote from p content, 22=", 27='
        return (p.length > 0 && p.includes('22')) ? "'" : '"';
    }

}}

{
    pos = 0;
    n = 0;
}

//-- Production --------------------------------------------------------------------------------------------

raw
    = init p:
    (prog)+
    { 
        return { version: version, progs: p };
    }

init
  = '' { init(); return null; }

prog
    = t: (       
    ( 
        code /               // matching hex codes
        error                // everything else is not matching hex code, error
    )+             
    ) { return { tokens: t}; }

code
	= 
    c:rules ( _ / '' ) { return c; }
    
rules
    = t:
    (
        r_n /
        r_7 /
        r_4 /
        r_3 /
        r_2 / 
        r_1 /
        r_num
    ) 
    { 
        // from counter n to program line pl
        n += 1;
        var pl = n < 10 ? '0' + n : n;

        // preserve current position
        var prev = pos;

        // ... and set new position
        pos += parseInt(t.len,10); 

        return { pos: prev, pl: pl, type: 'code', token: t };
    }

error
	= e:$(.+) 
    { 
        // from counter n to program line pl
        n += 1;
        var pl = n < 10 ? '0' + n : n;

        return { pos: pos, pl: pl, type: 'error', eid: 1, msg: e }; 
    }

//-- Patterns -----------------------------------------------------------------------------------------------

digit
    = [0-9]
    
hex
    = [0-9A-F]
    
byte
     = $(hex hex)
    
character
    // hex:00-81 -> dec:0-129
    = $( [0-7][0-F] / '8'[0-1] )

hex_0_F
    // hex:1-F -> dec:01-15'
    = [0-9A-F]

hex_00_11
    // hex:00-11 -> dec:0-17
    = $( '0' [0-9A-F] / '1' [0-1] )

hex_00_63
    // hex:00-63 -> dec:00-99
    = $( [0-5] [0-F] / '6' [0-3] )

hex_01_12
    // hex:01-12 -> dec:1-18
    = $( '0' [1-9A-F] / '1' [0-2] )

hex_0F_63
    // hex:0F-63 -> dec:15-99
    = $( '0F' / [1-5][0-F] / '6' [0-3] )

hex_1_F
    // hex:1-F -> dec:01-15
    = [1-9A-F]

hex_10_63
    //  hex:10-63 -> dec:[16-99
    = $( [1-5] [0-F] / '6' [0-3] )

hex_66_6F
    // hex:66-6F -> dec:102-111
    = $( '6' [6-F] )

hex_7B_7F
    // hex:7B-7F -> dec:123-127
    = $( '7' [B-F] )

hex_80_E3
    // hex:80-E3 -> dec:128-227
    = $( [89A-D] hex / 'E' [0-3] )

_ 'space'
    = [ ]

bytes
    = ($( byte (_ byte)+) / byte )
    
characters
    = ( $( character ( _ character )+ ) / character )

length_0F
    = n: [0-9A-F] { return fi(n) }

length_1F
    = n: [1-9A-F] { return fi(n) }
   
str_l
    = $( n: length_0F _ l: $byte+ & { return l.length === ((n * 2) + (n-1)); } )
    
str_l_1
    = $( n: length_1F _ l: $byte+ & { return l.length === (((n - 1) * 2) + ((n - 1) - 1)); } )

word
    = byte _ byte

s0 = ''
s1 = s:character
s2 = $(s1 (_ s1)|1|)
s3 = $(s1 (_ s1)|2|)
s4 = $(s1 (_ s1)|3|)
s5 = $(s1 (_ s1)|4|)
s6 = $(s1 (_ s1)|5|)
s7 = $(s1 (_ s1)|6|)
s8 = $(s1 (_ s1)|7|)
s9 = $(s1 (_ s1)|8|)
sA = $(s1 (_ s1)|9|)
sB = $(s1 (_ s1)|10|)
sC = $(s1 (_ s1)|11|)
sD = $(s1 (_ s1)|12|)
sE = $(s1 (_ s1)|13|)
sF = $(s1 (_ s1)|14|)

//-- Arguments ----------------------------------------------------------------------------------------------

arg_n_00_09
    // decimal for ENG, SCI, FIX
	= p:$('0' digit) { return { raw: p, values: [fi(p)] } }

arg_t_00_09
    // tone
	= p:$('0' digit) { return { raw: p, values: [fi(p)] } }

arg_e_0_8
    // err, hex:0-8 -> dec:0-8
    = p:[0-8] { return { raw: p, values: [fi(p)] } }

arg_f_00_63
    // format: '00', flg, hex:00-63 -> dec:00-99
    = p:$([0-5] hex / '6' [0-3]) { return { raw: p, values: [fi(p)] } }

arg_sz_0000_270F
    // format: '0000', hex:0000-270F -> dec:0000-9999
    = p:byte _ q: byte { return { raw: p + ' ' + q, values: [fi(p) * 256 + fi(q)] } }

arg_r_0_F
    // format: '00', hex:0-F -> dec:0-15
    = p:hex { return { raw: p, values: [fi(p)] } }

arg_r_00_63
    //The HP-42S has 25 storage registers (designated R00—R24), with SIZE extended from R00 through R99
    //00-63, format: '00', hex:00-63-> dec:00-99
    = p:$([0-6] hex / '6' [0-3]) { return { raw: p, values: [fi(p)] } }

arg_r_80_E3
    //80-E3, format: '00', r-128, hex:80-E3 -> dec:00-99
    = p:hex_80_E3 { return { raw: p, values: [fi(p) - 128] } }

arg_n_0_9
    // 0-9, format: '0', hex:0-9 -> dec:0-9, ARG_NUM9
    = p:$('0' [0-9]) { return { raw: p, values: [fi(p)] } }

arg_n_00_2C 
    // ARG_FUNC hex:00-2C:0-4,10-14,20-24,30-34,40-44
    = p:$('0' [0-F] / '1' [0-F] / '2' [0-C]) { return { raw: p, values: [fi(p)] } }

arg_n_00_FF
    // 0-255, format: '00', hex:00-FF -> dec:00-255
    = p:$(hex hex) { return { raw: p, values: [fi(p)] } }

arg_stk
    //0:T,1:Z,2:Y,3:X,4:L
    = p:[0-4] 
    { 
        var st = ft(p);
        return { raw: p, values: [st] }; 
    }

arg_k_00_11
    // format: '00', hex:00-11 -> dec:00-17, keys 1-18 for ASSIGN with offsett + 1
    = p:hex_00_11 { return { raw: p, values: [fi(p) + 1] } }

arg_k_01_12
    // format: '00', hex:01-12 -> dec:1-18, key 1-18, key:1-18, see hp42s-om-en.pdf, p.72
    = p:hex_01_12 { return { raw: p, values: [fi(p)] } }

arg_l_00_15
    // 0-F, format: '00', hex:0-F -> dec:00-15
    = p:hex_0_F { return { raw: p, values: [fi(p)] } }

arg_l_00_99
    // local numeric labels
    // 00-63, format: '00', hex:00-63 -> dec:00-99', see XEQ_lbl_00_99
    = p:hex_00_63 { return { raw: p, values: [fi(p)] } }

arg_l_1_F_1
    // local numeric labels
    // 1-F, format: '0', hex:1-F -> dec:00-14
    = p:hex_1_F { return { raw: p, values: [fi(p) - 1] } }

arg_l_15_99
    // local numeric labels
    // [0F - 63], format: '00', hex:0F-63 -> dec:15-99
    = p:hex_0F_63 { return { raw: p, values: [fi(p)] } }
    
arg_l_16_99
    // local numeric labels
    // [10 - 63], format: '00', hex:10-63 -> dec:16-99
    = p:hex_10_63 { return { raw: p, values: [fi(p)] } }

arg_l_A_J
    // local alpha labels
    // [66 - 6F], format: '00', hex:66-6F -> dec:102-111
    = p:hex_66_6F { return { raw: p, values: [fi(p)] } }

arg_l_a_e
    // local alpha labels
    // [7B - 7F], format: '00', hex:7B-7F -> dec:123-127
    = p:hex_7B_7F { return { raw: p, values: [fi(p)] } }

//-- Sub-Expressions ----------------------------------------------------------------------------------------

r_1
    =
    (
        r_1_0 /
        r_1_1 /
        r_1_2 /
        r_1_3 /
        r_1_4 /
        r_1_5 /
        r_1_6 /
        r_1_7 /
        r_1_8
    )

r_1_0
    = c:
    (
        _10_POW_X /

        ABS /
        ACOS /
        ADD /
        ADV /
        AOFF /
        AON /
        ASHF /
        ASIN /
        ATAN /
        AVIEW /
        BEEP
    ) { c.len=1; return c; }  // inject len=1

r_1_1
    = c:
    (
        CHS /
        CLA /
        CLD /
        CLRG /
        CL_SIGMA /
        CLST /
        CLX /
        COS
    ) { c.len=1; return c; }  // inject len=1

r_1_2
    = c:
    (
        DEG /
        DIV /

        ENTER /
        E_POW_X_1 /
        E_POW_X /

        FACT /
        FP
    ) { c.len=1; return c; }  // inject len=1

r_1_3
    = c:
    (
        GRAD /

        HMS_ADD /
        HMS_SUB /

        INV /
        IP /

        LASTX /
        LBL_lbl_00_14 /
        LN /
        LN_1_X /
        LOG 
    ) { c.len=1; return c; }  // inject len=1

r_1_4
    = c:
    (
        MEAN /
        MOD /
        MULTIPLY /

        NOP /

        OFF
    ) { c.len=1; return c; }  // inject len=1

r_1_5
    = c:
    (
        PERCENT /
        PERCENT_CH /
        PI /
        PROMPT /
        PSE /

        RAD /
        RCL_00_15 /
        RDN /
        RND /
        RTN /
        RUP
    ) { c.len=1; return c; }  // inject len=1

r_1_6
    = c:
    (
        SDEV /
        SIGMA_ADD /
        SIGMA_SUB /
        SIGN /
        SIN /
        SQRT /
        SQUARE /
        STO_00_15 /
        STOP /
        SUB /
        
        SWAP
    ) { c.len=1; return c; }  // inject len=1

r_1_7
    = c:
    (
        TAN /
        TO_DEC /
        TO_DEG /
        TO_HMS /
        TO_HR /
        TO_OCT /
        TO_POL /
        TO_RAD /
        TO_REC
    ) { c.len=1; return c; }  // inject len=1

r_1_8
    = c:
    (
        X_EQ_0 /
        X_EQ_Y /
        X_GT_0 /
        X_GT_Y /
        X_LE_0 /
        X_LT_0 /
        X_LE_Y /
        X_LT_Y /
        X_NE_0 /
        X_NE_Y /

        Y_POW_X
    ) { c.len=1; return c; }  // inject len=1

r_2
    =
    (
        r_2_0_9 /
        r_2_10_19 /
        r_2_20_29 /
        r_2_30_38
    )

r_2_0_9
    =
    (
        r_2_0 /
        r_2_1 /
        r_2_2 /
        r_2_3 /
        r_2_4 /
        r_2_5 /
        r_2_6 /
        r_2_7 /
        r_2_8 /
        r_2_9
    )

r_2_10_19
    =
    (
        r_2_10 /
        r_2_11 /
        r_2_12 /
        r_2_13 /
        r_2_14 /
        r_2_15 /
        r_2_16 /
        r_2_17 /
        r_2_18 /
        r_2_19
    )

r_2_20_29
    =
    (
        r_2_20 /
        r_2_21 /
        r_2_22 /
        r_2_23 /
        r_2_24 /
        r_2_25 /
        r_2_26 /
        r_2_27 /
        r_2_28 /
        r_2_29
    )

r_2_30_38
    =
    (
        r_2_30 /
        r_2_31 /
        r_2_32 /
        r_2_33 /
        r_2_34 /
        r_2_35 /
        r_2_36 /
        r_2_37 /
        r_2_38
    )

r_2_0
    = c:
    (
        _4STK /
        
        ACCEL /
        ACOSH /
        ADATE /
        AGRAPH /
        AIP /
        ALENG /
        ALL /
        ALL_SIGMA
    ) { c.len=2; return c; } // inject len=2

r_2_1
    = c:
    (
        AND /
        ANUM /
        APPEND /
        ARCL_IND_ST_stk /
        ARCL_IND_rr /
        ARCL_ST_stk /
        ARCL_rr /
        AROT /
        ASINH /
        ASR /
        ASRN
    ) { c.len=2; return c; } // inject len=2

r_2_2
    = c:
    (
        ASTO_IND_ST_stk /
        ASTO_IND_rr /
        ASTO_ST_stk /
        ASTO_rr /
        ATANH /
        ATIME /
        ATIME24 /
        ATOX /
        A_THRU_F 
    ) { c.len=2; return c; } // inject len=2

r_2_3
    = c:
    (
        B_T /
        BASE_ADD /
        BASE_CHS /
        BASE_DIV /
        BASE_MUL /
        BASE_SUB /
        BD_TO_N /
        BEST /
        BINM
    ) { c.len=2; return c; } // inject len=2

r_2_4
    = c:
    (
        BINSEP /
        BIT_T /
        BQ_TO_N /
        BRESET /
        BS_TO_N /
        BSIGNED /
        BWRAP
    ) { c.len=2; return c; } // inject len=2

r_2_5
    = c:
    (
        C_E_POW_X_1 /
        C_LN_1_X /
        C_T /
        C_TO_N /
        CB /
        CC /
        CF_IND_ST_stk /
        CF_IND_rr /
        CF_flg
    ) { c.len=2; return c; } // inject len=2

r_2_6
    = c:
    (
        CLK12 /
        CLK24 /
        CLKEYS /
        CLLCD /
        CLMENU /
        COMB /
        COMPLEX /
        CORR
    ) { c.len=2; return c; } // inject len=2

r_2_7
    = c:
    (
        COSH /
        CPXMAT_T /
        CPXRES /
        CPX_T /
        CROSS /
        CSLD_T /
        CUSTOM
    ) { c.len=2; return c; } // inject len=2

r_2_8
    = c:
    (
        DATE /
        DATE_ADD /
        DD_TO_N /
        DDAYS /
        DECINT /
        DECM /
        DECSEP /
        DELAY /
        DELR
    ) { c.len=2; return c; } // inject len=2

r_2_9
    = c:
    (
        DEPTH /
        DET /
        DIM_T /
        DMY /
        DOT /
        DOW /
        DOWN /
        DQ_TO_N /
        DROP
    ) { c.len=2; return c; } // inject len=2

r_2_10
    = c:
    (
        DS_TO_N /
        DSE_IND_ST_stk /
        DSE_IND_rr /
        DSE_ST_stk /
        DSE_rr /
        DUP
    ) { c.len=2; return c; } // inject len=2

r_2_11
    = c:
    (
        EDIT /
        ENG_10 /
        ENG_11 /
        ENG_IND_ST_stk /
        ENG_IND_rr /
        ENG_dec /
        ERRMSG /
        ERRNO
    ) { c.len=2; return c; } // inject len=2

r_2_12
    = c:
    (
        EXITALL /
        EXPF /
        EXTEND /

        FCC_T_IND_ST_stk /
        FCC_T_IND_rr /
        FCC_T_flg /
        FCSTX /
        FCSTY
    ) { c.len=2; return c; } // inject len=2

r_2_13
    = c:
    (
        FC_T_IND_ST_stk /
        FC_T_IND_rr /
        FC_T_flg /
        FIND /
        FIX_10 /
        FIX_11 /
        FIX_IND_ST_stk /
        FIX_IND_rr /
        FIX_dec
    ) { c.len=2; return c; } // inject len=2

r_2_14
    = c:
    (
        FMA /
        FNRM /
        FPTEST /
        FROM_LIST /
        FSC_T_IND_ST_stk /
        FSC_T_IND_rr /
        FSC_T_flg /
        FS_T_IND_ST_stk /
        FS_T_IND_rr /
        FS_T_flg
    ) { c.len=2; return c; } // inject len=2

r_2_15
    = c:
    (
        GAMMA /
        GETKEY /
        GETKEY1 /
        GETKEYA /
        GETM /
        GROW
    ) { c.len=2; return c; } // inject len=2

r_2_16
    = c:
    (
        GTO_IND_ST_stk /
        GTO_IND_rr /
        GTO_lbl_00_14 /
        GTO_lbl_15_99 /
        GTO_lbl_A_J /
        GTO_lbl_a_e
    ) { c.len=2; return c; } // inject len=2

r_2_17
    = c:
    (
        HEADING /
        HEIGHT /
        HEXM /
        HEXSEP /

        IDENT /
        INSR /

        INVRT
    ) { c.len=2; return c; } // inject len=2

r_2_18
    = c:
    (
        ISG_IND_ST_stk /
        ISG_IND_rr /
        ISG_ST_stk /
        ISG_rr /
        I_ADD /
        I_SUB /

        J_ADD /
        J_SUB /

        KEYASN
    ) { c.len=2; return c; } // inject len=2

r_2_19
    = c:
    (
        L4STK /

        LBL_lbl_15_99 /
        LBL_lbl_A_J /
        LBL_lbl_a_e /
        LCLBL /
        LEFT /
        LENGTH /
        LINF /
        LINSIGMA
    ) { c.len=2; return c; } // inject len=2

r_2_20
    = c:
    (
        LIST_T /
        LJ /
        LNSTK /
        LOCAT /
        LOGF /

        MAN /
        MASKL /
        MASKR /
        MAT_T
    ) { c.len=2; return c; } // inject len=2

r_2_21
    = c:
    (
        MAX /
        MDY /
        MENU /
        MIN /

        NEWLIST /
        NEWMAT /
        NN_TO_S /
        NORM /
        NOT 
    ) { c.len=2; return c; } // inject len=2

r_2_22
    = c:
    (
        N_TO_BD /
        N_TO_BQ /
        N_TO_BS /
        N_TO_C /
        N_TO_DD /
        N_TO_DQ /
        N_TO_DS /
        N_TO_S /
        NSTK /
        NUM_B
    ) { c.len=2; return c; } // inject len=2

r_2_23
    = c:
    (
        OCTM /
        OCTSEP /
        OLD /
        ON /
        OR /

        PCOMPLX /
        PERM /
        PGMMENU /
        PIXEL
    ) { c.len=2; return c; } // inject len=2

r_2_24
    = c:
    (
        PROFF /
        POLAR /
        PRON /
        POS /
        POSA /
        PRA /
        PRLCD /
        PRREG
    ) { c.len=2; return c; } // inject len=2

r_2_25
    = c:
    (
        PRSIGMA /
        PRSTK /
        PRUSR /
        PRX /
        PUTM /
        PWRF
    ) { c.len=2; return c; } // inject len=2

r_2_26
    = c:
    (
        RAN /
        RCLEL /
        RCLFLAG /
        RCLIJ /
        RCL_16_99 /
        RCL_IND_ST_stk /
        RCL_IND_rr /
        RCL_ST_stk 
    ) { c.len=2; return c; } // inject len=2

r_2_27
    = c:
    (
        RCOMPLX /
        RDX_COMMA /
        RDX_DOT /
        REALRES /
        REAL_T /
        RECT /
        REV /
        RIGHT
    ) { c.len=2; return c; } // inject len=2

r_2_28
    = c:
    (
        RJ /
        RL /
        RLC /
        RLCN /
        RLN /

        RNRM /
        ROTXY /
        RR /
        RRC /
        RRCN
    ) { c.len=2; return c; } // inject len=2

r_2_29
    = c:
    (
        RRN /
        RSUM /
        R_SWAP /
        RTNNO /
        RTNYES /

        SB /
        SC /
        SCI_10 /
        SCI_11 /
        SCI_IND_ST_stk /
        SCI_IND_rr /
        SCI_dec
    ) { c.len=2; return c; } // inject len=2

r_2_30
    = c:
    (
        SEED /
        SF_IND_ST_stk /
        SF_IND_rr /
        SF_flg /
        SIGMA_REG_IND_ST_stk /
        SIGMA_REG_IND_rr /
        SIGMA_REG_T /
        SIGMA_REG_rr /
        SINH /
        SKIP /
        SL /
        SLN /
        SR /
        SRN
    ) { c.len=2; return c; } // inject len=2

r_2_31
    = c:
    (
        SLOPE /
        STOEL /
        STOFLAG /
        STOIJ /
        STO_16_99 /
        STO_ADD_IND_ST_stk /
        STO_ADD_IND_rr /
        STO_ADD_ST_stk /
        STO_ADD_rr
    ) { c.len=2; return c; } // inject len=2

r_2_32
    = c:
    (
        STO_DIV_IND_ST_stk /
        STO_DIV_IND_rr /
        STO_DIV_ST_stk /
        STO_DIV_rr /
        STO_IND_ST_stk /
        STO_IND_rr
    ) { c.len=2; return c; } // inject len=2

r_2_33
    = c:
    (
        STO_MUL_IND_ST_stk /
        STO_MUL_IND_rr /
        STO_MUL_ST_stk /
        STO_MUL_rr /
        STO_ST_stk /
        STO_SUB_IND_ST_stk /
        STO_SUB_IND_rr /
        STO_SUB_ST_stk /
        STO_SUB_rr
    ) { c.len=2; return c; } // inject len=2

r_2_34
    = c:
    (
        STRACE /
        STR_T /
        SUBSTR /
        SUM /
        
        S_TO_N /

        TANH /
        TIME
    ) { c.len=2; return c; } // inject len=2

r_2_35
    = c:
    (
        TONE_IND_ST_stk /
        TONE_IND_rr /
        TONE_ton /
        TO_LIST /
        TRACE /
        TRANS /
        TYPE_T /

        UP /
        UVEC
    ) { c.len=2; return c; } // inject len=2

r_2_36
    = c:
    (
        VIEW_IND_ST_stk /
        VIEW_IND_rr /
        VIEW_ST_stk /
        VIEW_rr /

        WIDTH /
        WMEAN /
        WRAP /
        WSIZE /
        WSIZE_T
    ) { c.len=2; return c; } // inject len=2

r_2_37
    = c:
    (
        XEQ_IND_ST_stk /
        XEQ_IND_rr /
        XEQ_nam /
        XOR /
        XTOA /
        XVIEW /
        X_GE_0 /
        X_GE_Y
    ) { c.len=2; return c; } // inject len=2

r_2_38
    = c:
    (
        X_SWAP_F /
        X_SWAP_IND_ST_stk /
        X_SWAP_IND_rr /
        X_SWAP_ST_stk /
        X_SWAP_rr /

        YINT /
        YMD
    ) { c.len=2; return c; } // inject len=2

r_3
    =
    (
        r_3_0 /
        r_3_1 /
        r_3_2 /
        r_3_3 /
        r_3_4 /
        r_3_5 /
        r_3_6 /
        r_3_7 /
        r_3_8 /
        r_3_9
    )

r_3_0
    = c:
    (
        CLV_IND_ST_stk /
        CLV_IND_rr /

        DIM_IND_ST_stk /
        DIM_IND_rr /
        DROPN_IND_ST_stk /
        DROPN_IND_rr /
        DROPN_n
    ) { c.len=3; return c; } // inject len=3

r_3_1
    = c:
    (
        DUPN_IND_ST_stk /
        DUPN_IND_rr /
        DUPN_n /

        EDITN_IND_ST_stk /
        EDITN_IND_rr /
        END /

        FUNC_nn
    ) { c.len=3; return c; } // inject len=3

r_3_2
    = c:
    (
        GTO_lbl_15_99 /
        GTO_lbl_A_J /
        GTO_lbl_a_e /

        INDEX_IND_ST_stk /
        INDEX_IND_rr /
        INPUT_IND_ST_stk /
        INPUT_IND_rr /
        INPUT_ST_stk /
        INPUT_rr
    ) { c.len=3; return c; } // inject len=3

r_3_3
    = c:
    (
        INTEG_IND_ST_stk /
        INTEG_IND_rr /

        LASTO_IND_ST_stk /
        LASTO_IND_rr /
        
        
        LSTO_IND_ST_stk /
        LSTO_IND_rr
    ) { c.len=3; return c; } // inject len=3

r_3_4
    = c:
    (
        

        PGMINT_IND_ST_stk /
        PGMINT_IND_rr /
        PGMSLV_IND_ST_stk /
        PGMSLV_IND_rr
    ) { c.len=3; return c; } // inject len=3

r_3_5
    = c:
    (
        PICK_IND_ST_stk /
        PICK_IND_rr /
        PICK_n /

        PRV_IND_ST_stk /
        PRV_IND_rr /

        RCL_ADD_IND_ST_stk /
        RCL_ADD_IND_rr /
        RCL_ADD_ST_stk /
        RCL_ADD_rr 
    ) { c.len=3; return c; } // inject len=3

r_3_6
    = c:
    (
        RCL_DIV_IND_ST_stk /
        RCL_DIV_IND_rr /
        RCL_DIV_ST_stk /
        RCL_DIV_rr /
        RCL_MUL_IND_ST_stk /
        RCL_MUL_IND_rr /
        RCL_MUL_ST_stk /
        RCL_MUL_rr
    ) { c.len=3; return c; } // inject len=3

r_3_7
    = c:
    (
        RCL_SUB_IND_ST_stk /
        RCL_SUB_IND_rr /
        RCL_SUB_ST_stk /
        RCL_SUB_rr /
        RDNN_IND_ST_stk /
        RDNN_IND_rr /
        RDNN_n
    ) { c.len=3; return c; } // inject len=3

r_3_8
    = c:
    (
        RTNERR_IND_ST_stk /
        RTNERR_IND_rr /
        RTNERR_err /
        RUPN_IND_ST_stk /
        RUPN_IND_rr /
        RUPN_n /

        SOLVE_IND_ST_stk /
        SOLVE_IND_rr
    ) { c.len=3; return c; } // inject len=3

r_3_9
    = c:
    (
        UNPICK_IND_ST_stk /
        UNPICK_IND_rr /
        UNPICK_n /

        VARMENU_IND_ST_stk /
        VARMENU_IND_rr /

        XEQ_lbl_00_99 /
        XEQ_lbl_A_J /
        XEQ_lbl_a_e
    ) { c.len=3; return c; } // inject len=3

r_4
    =
    (
        r_4_0 /
        r_4_1 /
        r_4_2 /
        r_4_3 /
        r_4_4 /
        r_4_5 /
        r_4_6 /
        r_4_7 /
        r_4_8 /
        r_4_9 /
        r_4_10
    )

r_4_0
    = c:
    (
        _0_EQ_NN_IND_ST_stk /
        _0_EQ_NN_IND_rr /
        _0_EQ_NN_ST_stk /
        _0_EQ_NN_rr /

        _0_GE_NN_IND_ST_stk /
        _0_GE_NN_IND_rr /
        _0_GE_NN_ST_stk /
        _0_GE_NN_rr
    ) { c.len=4; return c; } // inject len=4

r_4_1
    = c:
    (
        _0_GT_NN_IND_ST_stk /
        _0_GT_NN_IND_rr /
        _0_GT_NN_ST_stk /
        _0_GT_NN_rr /

        _0_LE_NN_IND_ST_stk /
        _0_LE_NN_IND_rr /
        _0_LE_NN_ST_stk /
        _0_LE_NN_rr
    ) { c.len=4; return c; } // inject len=4

r_4_2
    = c:
    (
        _0_LT_NN_IND_ST_stk /
        _0_LT_NN_IND_rr /
        _0_LT_NN_ST_stk /
        _0_LT_NN_rr /

        _0_NE_NN_IND_ST_stk /
        _0_NE_NN_IND_rr /
        _0_NE_NN_ST_stk /
        _0_NE_NN_rr
    ) { c.len=4; return c; } // inject len=4

r_4_3
    = c:
    (
        GETLI_IND_ST_stk /
        GETLI_IND_rr /
        GETLI_ST_stk /

        GETMI_IND_ST_stk /
        GETMI_IND_rr /
        GETMI_ST_stk
    ) { c.len=4; return c; } // inject len=4

r_4_4
    = c:
    (
        HEAD_IND_ST_stk /
        HEAD_IND_rr /
        HEAD_ST_stk /
        HEAD_rr /

        KEY_GTO_IND_rr /
        KEY_GTO_IND_ST_stk /
        KEY_GTO_lbl_00_99 /
        KEY_GTO_lbl_A_J /
        KEY_GTO_lbl_a_e
    ) { c.len=4; return c; } // inject len=4

r_4_5
    = c:
    (
        KEY_XEQ_IND_rr /
        KEY_XEQ_IND_ST_stk /
        KEY_XEQ_lbl_00_99 /
        KEY_XEQ_lbl_A_J /
        KEY_XEQ_lbl_a_e /

        LCLV_IND_ST_stk /
        LCLV_IND_rr /

        LXASTO_IND_ST_stk /
        LXASTO_IND_rr /

        PGMVAR_IND_ST_stk /
        PGMVAR_IND_rr
    ) { c.len=4; return c; } // inject len=4

r_4_6
    = c:
    (
        PUTLI_IND_ST_stk /
        PUTLI_IND_rr /
        PUTLI_ST_stk /
        PUTMI_IND_ST_stk /
        PUTMI_IND_rr /
        PUTMI_ST_stk /

        SIZE_ssss 
    ) { c.len=4; return c; } // inject len=4

r_4_7
    = c:
    (
        VARMNU1_IND_ST_stk /
        VARMNU1_IND_rr /

        XASTO_IND_ST_stk /
        XASTO_IND_rr /
        XASTO_stk /
        XASTO_rr
    ) { c.len=4; return c; } // inject len=4

r_4_8
    = c:
    (
        X_EQ_NN_IND_ST_stk /
        X_EQ_NN_IND_rr /
        X_EQ_NN_ST_stk /
        X_EQ_NN_rr /

        X_GE_NN_IND_ST_stk /
        X_GE_NN_IND_rr /
        X_GE_NN_ST_stk /
        X_GE_NN_rr
    ) { c.len=4; return c; } // inject len=4

r_4_9
    = c:
    (
        X_GT_NN_IND_ST_stk /
        X_GT_NN_IND_rr /
        X_GT_NN_ST_stk /
        X_GT_NN_rr /

        X_LE_NN_IND_ST_stk /
        X_LE_NN_IND_rr /
        X_LE_NN_ST_stk /
        X_LE_NN_rr
    ) { c.len=4; return c; } // inject len=4

r_4_10
    = c:
    (
        X_LT_NN_IND_ST_stk /
        X_LT_NN_IND_rr /
        X_LT_NN_ST_stk /
        X_LT_NN_rr /

        X_NE_NN_IND_ST_stk /
        X_NE_NN_IND_rr /
        X_NE_NN_ST_stk /
        X_NE_NN_rr
    ) { c.len=4; return c; } // inject len=4

r_7
    =
    (
        r_7_0 /
        r_7_1
    )

r_7_0
    = c:
    (
        _0_EQ_NN_REGS /
        _0_GE_NN_REGS /
        _0_GT_NN_REGS /
        _0_LE_NN_REGS /
        _0_LT_NN_REGS /
        _0_NE_NN_REGS /

        GETMI_REGS /
        LASTO_REGS
    ) { c.len=7; return c; } // inject len=7

r_7_1
    = c:
    (
        LCLV_REGS /
        LXASTO_REGS/

        PUTMI_REGS /

        X_EQ_NN_REGS /
        X_GE_NN_REGS /
        X_GT_NN_REGS /
        X_LE_NN_REGS /
        X_LT_NN_REGS /
        X_NE_NN_REGS
    ) { c.len=7; return c; } // inject len=7

// commands with hex length calculation

r_n
    =
    (
        r_n_0 /
        r_n_1 /
        r_n_2 /
        r_n_3 /
        r_n_4 /
        r_n_5 /
        r_n_6 /
        r_n_7 /
        r_n_8 /
        r_n_9 /
        r_n_10 /
        r_n_11 /
        r_n_12 /
        r_n_13 /
        r_n_14
    )

r_n_0
    = c:
    (
        _0_EQ_NN_IND_nam /
        _0_EQ_NN_nam /

        _0_GE_NN_IND_nam /
        _0_GE_NN_nam /

        _0_GT_NN_IND_nam /
        _0_GT_NN_nam /

        _0_LE_NN_IND_nam /
        _0_LE_NN_nam /

        _0_LT_NN_IND_nam /
        _0_LT_NN_nam /

        _0_NE_NN_IND_nam /
        _0_NE_NN_nam
    ) { return c; } // with hex length calculation

r_n_1
    = c:
    (
        ARCL_IND_nam /
        ARCL_nam /
        ASSIGN_nam_TO_key /
        ASTO_IND_nam /
        ASTO_nam /

        CF_IND_nam /
        CLP_nam /
        CLV_IND_nam /
        CLV_nam /

        DIM_IND_nam /
        DIM_nam
    ) { return c; } // with hex length calculation

r_n_2
    = c:
    (
        DROPN_IND_nam /
        DSE_IND_nam /
        DSE_nam /
        DUPN_IND_nam /

        EDITN_IND_nam /
        EDITN_nam /
        ENG_IND_nam /

        FCC_T_IND_nam /
        FC_T_IND_nam 
    ) { return c; } // with hex length calculation

r_n_3
    = c:
    (
        FIX_IND_nam /
        FSC_T_IND_nam /
        FS_T_IND_nam /

        GETLI_IND_nam /
        GETLI_nam /
        GETMI_IND_nam /
        GETMI_nam /
        GTO_IND_nam /
        GTO_nam
    ) { return c; } // with hex length calculation

r_n_4
    = c:
    (
        HEAD_IND_nam /
        HEAD_nam /

        INDEX_IND_nam /
        INDEX_nam /
        INPUT_IND_nam /
        INPUT_nam /
        INTEG_IND_nam /
        INTEG_nam
    ) { return c; } // with hex length calculation

r_n_5
    = c:
    (
        ISG_IND_nam /
        ISG_nam /

        KEY_key_GTO_IND_nam /
        KEY_key_GTO_nam /
        KEY_key_XEQ_IND_nam /
        KEY_key_XEQ_nam /

        LASTO_IND_nam /
        LASTO_nam /
        
        LBL_nam
    ) { return c; } // with hex length calculation

r_n_6
    = c:
    (
        LCLV_IND_nam /
        LCLV_nam /
        LSTO_IND_nam /
        LSTO_nam /
        LXASTO_IND_nam /
        LXASTO_nam /

        MVAR_nam
    ) { return c; } // with hex length calculation

r_n_7
    = c:
    (
        PGMINT_IND_nam /
        PGMINT_nam /
        PGMSLV_IND_nam /
        PGMSLV_nam /
        PGMVAR_IND_nam /
        PGMVAR_nam /
        PICK_IND_nam /
        PRV_IND_nam /
        PRV_nam
    ) { return c; } // with hex length calculation

r_n_8
    = c:
    (
        PUTLI_IND_nam /
        PUTLI_nam /
        PUTMI_IND_nam /
        PUTMI_nam /

        RCL_ADD_IND_nam /
        RCL_ADD_nam /
        RCL_DIV_IND_nam /
        RCL_DIV_nam /
        RCL_IND_nam
    ) { return c; } // with hex length calculation

r_n_9
    = c:
    (
        RCL_MUL_IND_nam /
        RCL_MUL_nam /
        RCL_SUB_IND_nam /
        RCL_SUB_nam /
        RCL_nam /
        RDNN_IND_nam /
        RTNERR_IND_nam /
        RUPN_IND_nam /

        SCI_IND_nam /
        SF_IND_nam
    ) { return c; } // with hex length calculation

r_n_10
    = c:
    (
        SIGMAREG_IND_nam /
        SOLVE_IND_nam /
        SOLVE_nam /
        STO_ADD_IND_nam /
        STO_ADD_nam /
        STO_DIV_IND_nam /
        STO_DIV_nam /
        STO_IND_nam /
        STO_MUL_IND_nam /
        STO_MUL_nam
    ) { return c; } // with hex length calculation

r_n_11
    = c:
    (
        STO_SUB_IND_nam /
        STO_SUB_nam /
        STO_nam /

        // keep order
        T_STR /
        STR /
        
        TONE_IND_nam /

        UNPICK_IND_nam /

        VIEW_IND_nam /
        VIEW_nam
    ) { return c; } // with hex length calculation

r_n_12
    = c:
    (
        VARMENU_IND_nam /
        VARMENU_nam /
        VARMNU1_IND_nam /
        VARMNU1_nam /

        XASTO_IND_nam /
        XASTO_nam /
        XEQ_IND_nam /
        XEQ_nam
    ) { return c; } // with hex length calculation

r_n_13
    = c:
    (
        X_EQ_NN_IND_nam /
        X_EQ_NN_nam /
        X_GE_NN_IND_nam /
        X_GE_NN_nam /
        X_GT_NN_IND_nam /
        X_GT_NN_nam /
        X_LE_NN_IND_nam /
        X_LE_NN_nam
    ) { return c; } // with hex length calculation

r_n_14
    = c:
    (
        X_LT_NN_IND_nam /
        X_LT_NN_nam /
        X_NE_NN_IND_nam /
        X_NE_NN_nam /
        X_SWAP_IND_nam /
        X_SWAP_nam /

        XSTR_str_22 /
        XSTR_str_13
    ) { return c; } // len set in rule

// 10 1A 11 00 : 0,1
// A '.'
// B 'ᴇ'
// C '-'
// 1C 11 1A 12 00 : -1.2
r_num
    = p:
    $(
        ('1'[0-9A-C]) (_ ('1'[0-9A-C]))+ /
        ('1'[0-9])
    ) _ '00' { return { raw: p + ' ' + '00', params: [fn(p)], rpn: fn(p), len: (p.length + 1) / 3 + 1, lid: hp41c }; }

//--------------------------------------------------------------------------------------------------

// 0...
// TODO: check: NULL 'NULL' = r: '00' { return { raw: r, rpn: 'NULL', lid: hp42s }; } // from where ???

// 0=? IND ST L   F3 A7 1A F4
_0_EQ_NN_IND_ST_stk '0=? IND ST L,T,X,Y,Z' = r: 'F3 A7 1A F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0=? IND ST ' + p.values[0], lid: free42 }; }
_0_NE_NN_IND_ST_stk '0≠? IND ST L,T,X,Y,Z' = r: 'F3 A7 1B F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0≠? IND ST ' + p.values[0], lid: free42 }; }
_0_LT_NN_IND_ST_stk '0<? IND ST L,T,X,Y,Z' = r: 'F3 A7 1C F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0<? IND ST ' + p.values[0], lid: free42 }; }
_0_GT_NN_IND_ST_stk '0>? IND ST L,T,X,Y,Z' = r: 'F3 A7 1D F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0>? IND ST ' + p.values[0], lid: free42 }; }
_0_LE_NN_IND_ST_stk '0≤? IND ST L,T,X,Y,Z' = r: 'F3 A7 1E F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0≤? IND ST ' + p.values[0], lid: free42 }; }
_0_GE_NN_IND_ST_stk '0≥? IND ST L,T,X,Y,Z' = r: 'F3 A7 1F F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0≥? IND ST ' + p.values[0], lid: free42 }; }

// 0=? ST L       F3 A7 1A 74
_0_EQ_NN_ST_stk '0=? ST L,T,X,Y,Z' = r: 'F3 A7 1A 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0=? ST ' + p.values[0], lid: free42 }; }
_0_NE_NN_ST_stk '0≠? ST L,T,X,Y,Z' = r: 'F3 A7 1B 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0≠? ST ' + p.values[0], lid: free42 }; }
_0_LT_NN_ST_stk '0<? ST L,T,X,Y,Z' = r: 'F3 A7 1C 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0<? ST ' + p.values[0], lid: free42 }; }
_0_GT_NN_ST_stk '0>? ST L,T,X,Y,Z' = r: 'F3 A7 1D 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0>? ST ' + p.values[0], lid: free42 }; }
_0_LE_NN_ST_stk '0≤? ST L,T,X,Y,Z' = r: 'F3 A7 1E 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0≤? ST ' + p.values[0], lid: free42 }; }
_0_GE_NN_ST_stk '0≥? ST L,T,X,Y,Z' = r: 'F3 A7 1F 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: '0≥? ST ' + p.values[0], lid: free42 }; }

// 0=? IND 99     F3 A7 1A E3
_0_EQ_NN_IND_rr '0=? IND 00-99' = r: 'F3 A7 1A' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: '0=? IND ' + fmt(p.values[0],2), lid: free42 }; }
_0_NE_NN_IND_rr '0≠? IND 00-99' = r: 'F3 A7 1B' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: '0≠? IND ' + fmt(p.values[0],2), lid: free42 }; }
_0_LT_NN_IND_rr '0<? IND 00-99' = r: 'F3 A7 1C' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: '0<? IND ' + fmt(p.values[0],2), lid: free42 }; }
_0_GT_NN_IND_rr '0>? IND 00-99' = r: 'F3 A7 1D' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: '0>? IND ' + fmt(p.values[0],2), lid: free42 }; }
_0_LE_NN_IND_rr '0≤? IND 00-99' = r: 'F3 A7 1E' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: '0≤? IND ' + fmt(p.values[0],2), lid: free42 }; }
_0_GE_NN_IND_rr '0≥? IND 00-99' = r: 'F3 A7 1F' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: '0≥? IND ' + fmt(p.values[0],2), lid: free42 }; }

// 0=? 99         F3 A7 1A 63
_0_EQ_NN_rr '0=? 00-99' = r: 'F3 A7 1A' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: '0=? ' + fmt(p.values[0],2), lid: free42 }; }
_0_NE_NN_rr '0≠? 00-99' = r: 'F3 A7 1B' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: '0≠? ' + fmt(p.values[0],2), lid: free42 }; }
_0_LT_NN_rr '0<? 00-99' = r: 'F3 A7 1C' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: '0<? ' + fmt(p.values[0],2), lid: free42 }; }
_0_GT_NN_rr '0>? 00-99' = r: 'F3 A7 1D' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: '0>? ' + fmt(p.values[0],2), lid: free42 }; }
_0_LE_NN_rr '0≤? 00-99' = r: 'F3 A7 1E' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: '0≤? ' + fmt(p.values[0],2), lid: free42 }; }
_0_GE_NN_rr '0≥? 00-99' = r: 'F3 A7 1F' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: '0≥? ' + fmt(p.values[0],2), lid: free42 }; }

// 0=? "REGS"     F6 A7 22 52 45 47 53
// 0≠? "REGS"     F6 A7 23 52 45 47 53
// 0<? "REGS"     F6 A7 24 52 45 47 53
_0_EQ_NN_REGS '0=? "REGS"' = r: 'F6 A7 22 52 45 47 53' { return { raw: r, rpn: '0=? "REGS"', lid: free42 }; }
_0_NE_NN_REGS '0=? "REGS"' = r: 'F6 A7 23 52 45 47 53' { return { raw: r, rpn: '0≠? "REGS"', lid: free42 }; }
_0_LT_NN_REGS '0=? "REGS"' = r: 'F6 A7 24 52 45 47 53' { return { raw: r, rpn: '0<? "REGS"', lid: free42 }; }
_0_GT_NN_REGS '0=? "REGS"' = r: 'F6 A7 25 52 45 47 53' { return { raw: r, rpn: '0>? "REGS"', lid: free42 }; }
_0_LE_NN_REGS '0=? "REGS"' = r: 'F6 A7 26 52 45 47 53' { return { raw: r, rpn: '0≤? "REGS"', lid: free42 }; }
_0_GE_NN_REGS '0=? "REGS"' = r: 'F6 A7 27 52 45 47 53' { return { raw: r, rpn: '0≥? "REGS"', lid: free42 }; }

// 1...
_10_POW_X '10↑X' = r: '57' { return { raw: r, rpn: '10↑X', lid: hp41c }; }

_4STK '4STK' = r: 'A7 E2' { return { raw: r, rpn: '4STK', lid: hp42s }; }

A_THRU_F  'A...F' = r:'A7 1B' { return { raw: r, rpn: 'A...F', lid: free42 }; }

ABS 'ABS' = r: '61' { return { raw: r, rpn: 'ABS', lid: hp41c }; }

ACCEL 'ACCEL' = r: 'A7 CF' { return { raw: r, rpn: 'ACCEL', lid: hp42s }; }

ACOS 'ACOS' = r: '5D' { return { raw: r, rpn: 'ACOS', lid: hp41c }; }

ACOSH 'ACOSH' = r: 'A0 66' { return { raw: r, rpn: 'ACOSH', lid: hp42s }; }

ADATE 'ADATE' = r: 'A6 81' { return { raw: r, rpn: 'ADATE', lid: hp42s }; }

ADD '+' = r: '40' { return { raw: r, rpn: '+', lid: hp41c }; }

ADV 'ADV' = r: '8F' { return { raw: r, rpn: 'ADV', lid: hp41c }; }

AGRAPH 'AGRAPH' = r: 'A7 64' { return { raw: r, rpn: 'AGRAPH', lid: hp42s }; }

AIP 'AIP' = r: 'A6 31' { return { raw: r, rpn: 'AIP', lid: hp42s }; }

ALENG 'ALENG' = r: 'A6 41' { return { raw: r, rpn: 'ALENG', lid: hp42s }; }

ALL 'ALL' = r: 'A2 5D' { return { raw: r, rpn: 'ALL', lid: hp42s }; }

ALL_SIGMA 'ALLΣ' = r: 'A0 AE' { return { raw: r, rpn: 'ALLΣ', lid: hp42s }; }

AND 'AND' = r: 'A5 88' { return { raw: r, rpn: 'AND', lid: hp42s }; }

ANUM 'ANUM' = r: 'A6 42' { return { raw: r, rpn: 'ANUM', lid: hp42s }; }

AOFF 'AOFF' = r: '8B' { return { raw: r, rpn: 'AOFF', lid: hp41c }; }

AON 'AON' = r: '8C' { return { raw: r, rpn: 'AON', lid: hp41c }; }

APPEND 'APPEND' = r: 'A7 E9' { return { raw: r, rpn: 'APPEND', lid: hp42s }; }

ARCL_IND_ST_stk 'ARCL IND ST L,T,X,Y,Z' = r: '9B F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ARCL IND ST ' + p.values[0], lid: hp41c }; }
ARCL_IND_rr 'ARCL IND 00-99' = r: '9B' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ARCL IND ' + fmt(p.values[0],2), lid: hp41c }; }
ARCL_ST_stk 'ARCL ST L,T,X,Y,Z' = r: '9B 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ARCL ST ' + p.values[0], lid: hp41c }; }
ARCL_rr 'ARCL 00-99' = r: '9B' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ARCL ' + fmt(p.values[0],2), lid: hp41c }; }

AROT 'AROT' = r: 'A6 46' { return { raw: r, rpn: 'AROT', lid: hp41c }; }

ASHF 'ASHF' = r: '88' { return { raw: r, rpn: 'ASHF', lid: hp41c }; }

ASIN 'ASIN' = r: '5C' { return { raw: r, rpn: 'ASIN', lid: hp41c }; }

ASINH 'ASINH' = r: 'A0 64' { return { raw: r, rpn: 'ASINH', lid: hp42s }; }

ASR 'ASR' = r: 'A7 2C' { return { raw: r, rpn: 'ASR', lid: hp42s }; }

ASRN 'ASR' = r: 'A7 75' { return { raw: r, rpn: 'ASRN', lid: hp42s }; }

ASTO_IND_ST_stk 'ASTO IND ST L,T,X,Y,Z' = r: '9A F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ASTO IND ST ' + p.values[0], lid: hp41c }; }
ASTO_IND_rr 'ASTO IND 00-99' = r: '9A' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ASTO IND ' + fmt(p.values[0],2), lid: hp41c }; }
ASTO_ST_stk 'ASTO ST L,T,X,Y,Z' = r: '9A 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ASTO ST ' + p.values[0], lid: hp41c }; }
ASTO_rr 'ASTO 00-99' = r: '9A' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ASTO ' + fmt(p.values[0],2), lid: hp41c }; }

ATAN 'ATAN' = r: '5E' { return { raw: r, rpn: 'ATAN', lid: hp41c }; }

ATANH 'ATANH' = r: 'A0 65' { return { raw: r, rpn: 'ATANH', lid: hp42s }; }

ATIME 'ATIME' = r: 'A6 84' { return { raw: r, rpn: 'ATIME', lid: hp42s }; }

ATIME24 'ATIME24' = r: 'A6 85' { return { raw: r, rpn: 'ATIME24', lid: hp42s }; }

ATOX 'ATOX' = r: 'A6 47' { return { raw: r, rpn: 'ATOX', lid: hp42s }; }

AVIEW 'AVIEW' = r: '7E' { return { raw: r, rpn: 'AVIEW', lid: hp41c }; }

B_T 'B?' = r: 'A7 33' { return { raw: r, rpn: 'B?', lid: free42 }; }

BASE_ADD 'BASE+' = r: 'A0 E6' { return { raw: r, rpn: 'BASE+', lid: hp42s }; }

BASE_CHS 'BASE±' = r: 'A0 EA' { return { raw: r, rpn: 'BASE±', lid: hp42s }; }

BASE_DIV 'BASE÷' = r: 'A0 E9' { return { raw: r, rpn: 'BASE÷', lid: hp42s }; }

BASE_MUL 'BASE×' = r: 'A0 E8' { return { raw: r, rpn: 'BASE×', lid: hp42s }; }

BASE_SUB 'BASE-' = r: 'A0 E7' { return { raw: r, rpn: 'BASE-', lid: hp42s }; }

BD_TO_N 'BD→N' = r: 'A7 6D' { return { raw: r, rpn: 'BD→N', lid: free42 }; }

BEEP 'BEEP' = r: '86' { return { raw: r, rpn: 'BEEP', lid: hp41c }; }

BEST 'BEST' = r: 'A0 9F' { return { raw: r, rpn: 'BEST', lid: hp42s }; }

BINM 'BINM' = r: 'A0 E5' { return { raw: r, rpn: 'BINM', lid: hp42s }; }

BINSEP 'BINSEP' = r: 'A7 3B' { return { raw: r, rpn: 'BINSEP', lid: free42 }; }

BIT_T 'BIT?' = r: 'A5 8C' { return { raw: r, rpn: 'BIT?', lid: hp42s }; }

BQ_TO_N 'BQ→N' = r: 'A7 6E' { return { raw: r, rpn: 'BQ→N', lid: free42 }; }

BRESET 'BRESET' = r: 'A7 D8' { return { raw: r, rpn: 'BRESET', lid: free42 }; }

BS_TO_N 'BS→N' = r: 'A7 6C' { return { raw: r, rpn: 'BS→N', lid: free42 }; }

BSIGNED 'BSIGNED' = r: 'A7 D6' { return { raw: r, rpn: 'BSIGNED', lid: free42 }; }

BWRAP 'BWRAP' = r: 'A7 D7' { return { raw: r, rpn: 'BWRAP', lid: free42 }; }

C_E_POW_X_1 'C.E↑X-1' = r: 'A6 FF' { return { raw: r, rpn: 'C.E↑X-1', lid: free42 }; }

C_LN_1_X  'C.LN1+X' = r: 'A6 FE' { return { raw: r, rpn: 'C.LN1+X', lid: free42 }; }

C_T 'C?' = r: 'A7 39' { return { raw: r, rpn: 'C?', lid: free42 }; }

C_TO_N   'C→N' = r: 'A7 F1' { return { raw: r, rpn: 'C→N', lid: free42 }; }

CB 'CB' = r: 'A7 32' { return { raw: r, rpn: 'CB', lid: free42 }; }

CC 'CC' = r: 'A7 38' { return { raw: r, rpn: 'CC', lid: free42 }; }

CF_IND_ST_stk 'CF IND ST L,T,X,Y,Z' = r: 'A9 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'CF IND ST ' + p.values[0], lid: hp41c }; }
CF_IND_rr 'CF IND 00-99' = r: 'A9' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'CF IND ' + fmt(p.values[0],2), lid: hp41c }; }
CF_flg 'CF 00-09' = r: 'A9' _ p: arg_f_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'CF ' + fmt(p.values[0],2), lid: hp41c }; }

CHS '+/-' = r: '54' { return { raw: r, rpn: '+/-', lid: hp41c }; }

CLA 'CLA' = r: '87' { return { raw: r, rpn: 'CLA', lid: hp41c }; }

CLD 'CLD' = r: '7F' { return { raw: r, rpn: 'CLD', lid: hp41c }; }

CLK12 'CLK12' = r: 'A6 86' { return { raw: r, rpn: 'CLK12', lid: free42 }; }

CLK24 'CLK24' = r: 'A6 87' { return { raw: r, rpn: 'CLK24', lid: free42 }; }

CLKEYS 'CLKEYS' = r: 'A2 62' { return { raw: r, rpn: 'CLKEYS', lid: hp42s }; }

CLLCD 'CLLCD' = r: 'A7 63' { return { raw: r, rpn: 'CLLCD', lid: hp42s }; }

CLMENU 'CLMENU' = r: 'A2 6D' { return { raw: r, rpn: 'CLMENU', lid: hp42s }; }

CLRG 'CLRG' = r: '8A' { return { raw: r, rpn: 'CLRG', lid: hp42s }; }

CL_SIGMA 'CLΣ' = r: '70' { return { raw: r, rpn: 'CLΣ', lid: hp41c }; }

CLST 'CLST' = r: '73' { return { raw: r, rpn: 'CLST', lid: hp41c }; }

CLV_IND_ST_stk 'CLV IND ST L,T,X,Y,Z' = r: 'F2 D8 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'CLV IND ST ' + p.values[0], lid: hp42s }; }
CLV_IND_rr 'CLV IND 00-99' = r: 'F2 D8' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'CLV IND ' + fmt(p.values[0],2), lid: hp42s }; }

CLX 'CLX' = r: '77' { return { raw: r, rpn: 'CLX', lid: hp41c }; }

COMB 'COMB' = r: 'A0 6F' { return { raw: r, rpn: 'COMB', lid: hp42s }; }

COMPLEX 'COMPLEX' = r: 'A0 72' { return { raw: r, rpn: 'COMPLEX', lid: hp42s }; }

CORR 'CORR' = r: 'A0 A7' { return { raw: r, rpn: 'CORR', lid: hp42s }; }

COS 'COS' = r: '5A' { return { raw: r, rpn: 'COS', lid: hp41c }; }

COSH 'COSH' = r: 'A0 62' { return { raw: r, rpn: 'COSH', lid: hp42s }; }

CPXMAT_T 'CPXMAT?' = r: 'A2 75' { return { raw: r, rpn: 'CPXMAT?', lid: free42 }; }

CPXRES 'CPXRES' = r: 'A2 6A' { return { raw: r, rpn: 'CPXRES', lid: hp42s }; }

CPX_T 'CPX?' = r: 'A2 67' { return { raw: r, rpn: 'CPX?', lid: hp42s }; }

CROSS 'CROSS' = r: 'A6 CA' { return { raw: r, rpn: 'CROSS', lid: hp42s }; }

CSLD_T 'CSLD?' = r: 'A7 DB' { return { raw: r, rpn: 'CSLD?', lid: free42 }; }

CUSTOM 'CUSTOM' = r: 'A2 6F' { return { raw: r, rpn: 'CUSTOM', lid: hp42s }; }

DATE 'DATE' = r: 'A6 8C' { return { raw: r, rpn: 'DATE', lid: free42 }; }

DATE_ADD 'DATE+' = r: 'A6 8D' { return { raw: r, rpn: 'DATE+', lid: free42 }; }

DD_TO_N 'DD→N' = r: 'A7 70' { return { raw: r, rpn: 'DD→N', lid: free42 }; }

DDAYS 'DDAYS' = r: 'A6 8E' { return { raw: r, rpn: 'DDAYS', lid: free42 }; }

DECINT 'DECINT' = r: 'A7 3A' { return { raw: r, rpn: 'DECINT', lid: free42 }; }

DECM 'DECM' = r: 'A0 E3' { return { raw: r, rpn: 'DECM', lid: hp42s }; }

DECSEP 'DECSEP' = r: 'A7 3D' { return { raw: r, rpn: 'DECSEP', lid: free42 }; }

DEG 'DEG' = r: '80' { return { raw: r, rpn: 'DEG', lid: hp41c }; }

DELAY 'DELAY' = r: 'A7 60' { return { raw: r, rpn: 'DELAY', lid: hp42s }; }

DELR 'DELR' = r: 'A0 AB' { return { raw: r, rpn: 'DELR', lid: hp42s }; }

DEPTH 'DEPTH' = r: 'A7 E6' { return { raw: r, rpn: 'DEPTH', lid: free42 }; }

DET 'DET' = r: 'A6 CC' { return { raw: r, rpn: 'DET', lid: hp42s }; }

DIM_IND_ST_stk 'DIM IND ST L,T,X,Y,Z' = r: 'F2 EC F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'DIM IND ST ' + p.values[0], lid: hp42s }; }
DIM_IND_rr 'DIM IND 00-99' = r: 'F2 EC' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DIM IND ' + fmt(p.values[0],2), lid: hp42s }; }
DIM_T 'DIM?' = r: 'A6 E7' { return { raw: r, rpn: 'DIM?', lid: hp42s }; }

DIV '÷' = r: '43' { return { raw: r, rpn: '÷', lid: hp42s }; }

DMY 'DMY' = r: 'A6 8F' { return { raw: r, rpn: 'DMY', lid: free42 }; }

DOT 'DOT' = r: 'A6 CB' { return { raw: r, rpn: 'DOT', lid: hp42s }; }

DOW 'DOW' = r: 'A6 90' { return { raw: r, rpn: 'DOW', lid: free42 }; }

DOWN '↓' = r: 'A6 DF' { return { raw: r, rpn: '↓', lid: hp42s }; }

DQ_TO_N 'DQ→N' = r: 'A7 71' { return { raw: r, rpn: 'DQ→N', lid: free42 }; }

DROP 'DROP' = r: 'A2 71' { return { raw: r, rpn: 'DROP', lid: hp42s }; }

// DROPN ARG_NUM9
// DROPN IND ST L    F2 A1 F4
// DROPN IND 99      F2 A1 E3
// DROPN 9           F2 A1 09
DROPN_IND_ST_stk 'DROPN IND ST L,T,X,Y,Z' = r: 'F2 A1 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'DROPN IND ST ' + p.values[0], lid: hp42s }; }
DROPN_IND_rr 'DROPN IND 00-99' = r: 'F2 A1' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DROPN IND ' + fmt(p.values[0],2), lid: hp42s }; }
DROPN_n 'DROPN 0-9' = r: 'F2 A1' _ p: arg_n_0_9 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DROPN ' + p.values[0], lid: hp42s }; }

DS_TO_N 'DS→N' = r: 'A7 6F' { return { raw: r, rpn: 'DS→N', lid: hp42s }; }

DSE_IND_ST_stk 'DSE IND ST L,T,X,Y,Z' = r: '97 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'DSE IND ST ' + p.values[0], lid: hp41c }; }
DSE_IND_rr 'DSE IND 00-99' = r: '97' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DSE IND ' + fmt(p.values[0],2), lid: hp41c }; }
DSE_ST_stk 'DSE ST L,T,X,Y,Z' = r: '97 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'DSE ST ' + p.values[0], lid: hp41c }; }
DSE_rr 'DSE 00-99' = r: '97' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DSE ' + fmt(p.values[0],2), lid: hp41c }; }

DUP 'DUP' = r: 'A7 E7' { return { raw: r, rpn: 'DUP', lid: free42 }; }

// DUPN ARG_NUM9
// DUPN IND ST L     F2 A2 F4
// DUPN IND 99       F2 A2 E3
// DUPN 9            F2 A2 09
DUPN_IND_ST_stk 'DUPN IND ST L,T,X,Y,Z' = r: 'F2 A2 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'DUPN IND ST ' + p.values[0], lid: free42 }; }
DUPN_IND_rr 'DUPN IND 00-99' = r: 'F2 A2' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DUPN IND ' + fmt(p.values[0],2), lid: free42 }; }
DUPN_n 'DUPN 0-9' = r: 'F2 A2' _ p: arg_n_0_9 { return { raw: r + ' ' + p.raw, params: p, rpn: 'DUPN ' + p.values[0], lid: free42 }; }

E_POW_X 'E↑X' = r: '55' { return { raw: r, rpn: 'E↑X', lid: hp41c }; }

E_POW_X_1 'E↑X-1' = r: '58' { return { raw: r, rpn: 'E↑X-1', lid: hp41c }; }

EDIT 'EDIT' = r: 'A6 E1' { return { raw: r, rpn: 'EDIT', lid: hp42s }; }

EDITN_IND_ST_stk 'EDITN IND ST L,T,X,Y,Z' = r: 'F2 EF F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'EDITN IND ST ' + p.values[0], lid: hp42s }; }

EDITN_IND_rr 'EDITN IND 00-99' = r: 'F2 EF' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'EDITN IND ' + fmt(p.values[0],2), lid: hp42s }; }

END 'END' = r: 'C0 00 0D' { return { raw: r, params: {}, rpn: 'END', lid: hp41c }; }

ENG_10 'ENG 10' = r: 'F1 D7' { return { raw: r, params: {}, rpn: 'ENG 10', lid: hp41c }; }
ENG_11 'ENG 11' = r: 'F1 E7' { return { raw: r, params: {}, rpn: 'ENG 11', lid: hp41c }; }
ENG_IND_ST_stk 'ENG IND ST L,T,X,Y,Z' = r: '9E F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ENG IND ST ' + p.values[0], lid: hp41c }; }
ENG_IND_rr 'ENG IND 00-99' = r: '9E' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ENG IND ' + fmt(p.values[0],2), lid: hp41c }; }
ENG_dec 'ENG 00-09' = r: '9E' _ p: arg_n_00_09 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ENG ' + fmt(p.values[0],2), lid: hp41c }; }

ENTER 'ENTER' = r: '83' { return { raw: r, rpn: 'ENTER', lid: hp41c }; }

ERRMSG 'ERRMSG' = r: 'A7 F6' { return { raw: r, rpn: 'ERRMSG', lid: free42 }; }

ERRNO 'ERRNO' = r: 'A7 F7' { return { raw: r, rpn: 'ERRNO', lid: free42 }; }

EXITALL 'EXITALL' = r: 'A2 6C' { return { raw: r, rpn: 'EXITALL', lid: hp42s }; }

EXPF 'EXPF' = r: 'A0 A0' { return { raw: r, rpn: 'EXPF', lid: hp42s }; }

EXTEND  'EXTEND' = r: 'A7 EA' { return { raw: r, rpn: 'EXTEND', lid: free42 }; }

FACT 'N!' = r: '62' { return { raw: r, rpn: 'N!', lid: hp41c }; }

FC_T_IND_ST_stk 'FC? IND ST L,T,X,Y,Z' = r: 'AD F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'FC? IND ST ' + p.values[0], lid: hp41c }; }
FC_T_IND_rr 'FC? IND 00-99' = r: 'AD' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FC? IND ' + fmt(p.values[0],2), lid: hp41c }; }
FC_T_flg 'FC? 00-09' = r: 'AD' _ p: arg_f_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FC? ' + fmt(p.values[0],2), lid: hp41c }; }

FCC_T_IND_ST_stk 'FC?C IND ST L,T,X,Y,Z' = r: 'AB F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'FC?C IND ST ' + p.values[0], lid: hp41c }; }
FCC_T_IND_rr 'FC?C IND 00-99' = r: 'AB' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FC?C IND ' + fmt(p.values[0],2), lid: hp41c }; }
FCC_T_flg 'FC?C 00-09' = r: 'AB' _ p: arg_f_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FC?C ' + fmt(p.values[0],2), lid: hp41c }; }

FCSTX 'FCSTX' = r: 'A0 A8' { return { raw: r, rpn: 'FCSTX', lid: hp42s }; }

FCSTY 'FCSTY' = r: 'A0 A9' { return { raw: r, rpn: 'FCSTY', lid: hp42s }; }

FIND '[FIND]' = r: 'A6 EC' { return { raw: r, rpn: '[FIND]', lid: hp42s }; }

FIX_10 'FIX 10' = r: 'F1 D5' { return { raw: r, params: {}, rpn: 'FIX 10', lid: hp41c }; }
FIX_11 'FIX 11' = r: 'F1 E5' { return { raw: r, params: {}, rpn: 'FIX 11', lid: hp41c }; }
FIX_IND_ST_stk 'FIX IND ST L,T,X,Y,Z' = r: '9C F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'FIX IND ST ' + p.values[0], lid: hp41c }; }
FIX_IND_rr 'FIX IND 00-99' = r: '9C' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FIX IND ' + fmt(p.values[0],2), lid: hp41c }; }
FIX_dec 'FIX 00-09' = r: '9C' _ p: arg_n_00_09 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FIX ' + fmt(p.values[0],2), lid: hp41c }; }

FMA 'FMA' = r: 'A7 DA' { return { raw: r, rpn: 'FMA', lid: free42 }; }

FNRM 'FNRM' = r: 'A6 CF' { return { raw: r, rpn: 'FNRM', lid: hp42s }; }

FP 'FP' = r: '69' { return { raw: r, rpn: 'FP', lid: hp41c }; }

FPTEST 'FPTEST' = r: 'A7 D2' { return { raw: r, rpn: 'FPTEST', lid: free42 }; }

FROM_LIST  'LIST→' = r: 'A6 FD' { return { raw: r, rpn: 'LIST→', lid: free42 }; }

FS_T_IND_ST_stk 'FS? IND ST L,T,X,Y,Z' = r: 'AC F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'FS? IND ST ' + p.values[0], lid: hp41c }; }
FS_T_IND_rr 'FS? IND 00-99' = r: 'AC' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FS? IND ' + fmt(p.values[0],2), lid: hp41c }; }
FS_T_flg 'FS? 00-09' = r: 'AC' _ p: arg_f_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FS? ' + fmt(p.values[0],2), lid: hp41c }; }

FSC_T_IND_ST_stk 'FS?C IND ST L,T,X,Y,Z'  = r: 'AA F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'FS?C IND ST ' + p.values[0], lid: hp41c }; }
FSC_T_IND_rr 'FS?C IND 00-99'  = r: 'AA' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FS?C IND ' + fmt(p.values[0],2), lid: hp41c }; }
FSC_T_flg 'FS?C flg'  = r: 'AA' _ p: arg_f_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'FS?C ' + fmt(p.values[0],2), lid: hp41c }; }

// FUNC ARG_FUNC
// FUNC 00           F2 E0 00 
// FUNC 01           F2 E0 01 
// FUNC 44           F2 E0 2C
FUNC_nn 'FUNC nn' = r: 'F2 E0' _ p: arg_n_00_2C { return { raw: r + ' ' + p.raw, rpn: 'FUNC ' + fmt(p.values[0],2), lid: free42 }; }

GAMMA 'GAMMA' = r: 'A0 74' { return { raw: r, rpn: 'GAMMA', lid: hp42s }; }

GETKEY 'GETKEY' = r: 'A2 6E' { return { raw: r, rpn: 'GETKEY', lid: hp42s }; }

GETKEY1 'GETKEY1' = r: 'A7 D9' { return { raw: r, rpn: 'GETKEY1', lid: free42 }; }

GETKEYA 'GETKEYA' = r: 'A6 EE' { return { raw: r, rpn: 'GETKEYA', lid: free42 }; }

// GETLI ARG_L_STK
// GETLI IND ST L    F3 A7 67 F4 
// GETLI IND 99      F3 A7 67 E3 
// GETLI ST L        F3 A7 67 74 
GETLI_IND_ST_stk 'GETLI IND ST L,T,X,Y,Z' = r: 'F3 A7 67 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'GETLI IND ST ' + p.values[0], lid: free42 }; }
GETLI_IND_rr 'GETLI IND 00-99' = r: 'F3 A7 67' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'GETLI IND ' + fmt(p.values[0],2), lid: free42 }; }
GETLI_ST_stk 'GETLI ST L,T,X,Y,Z' = r: 'F3 A7 67 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'GETLI ST ' + p.values[0], lid: free42 }; }

GETM 'GETM' = r: 'A6 E8' { return { raw: r, rpn: 'GETM', lid: hp42s }; }

// GETMI IND ST L    F3 A7 65 F4 
// GETMI IND 99      F3 A7 65 E3 
// GETMI ST L        F3 A7 65 74 
// GETMI "REGS"      F6 A7 72 52 45 47 53
GETMI_IND_ST_stk 'GETMI IND ST L,T,X,Y,Z' = r: 'F3 A7 65 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'GETMI IND ST ' + p.values[0], lid: free42 }; }
GETMI_IND_rr 'GETMI IND 00-99' = r: 'F3 A7 65' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'GETMI IND ' + fmt(p.values[0],2), lid: free42 }; }
GETMI_ST_stk 'GETMI ST L,T,X,Y,Z' = r: 'F3 A7 65 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'GETMI ST ' + p.values[0], lid: free42 }; }
GETMI_REGS 'GETMI "REGS"' = r: 'F6 A7 72 52 45 47 53' { return { raw: r, rpn: 'GETMI "REGS"', lid: free42 }; }

GRAD 'GRAD' = r: '82' { return { raw: r, rpn: 'GRAD', lid: hp41c }; }

GROW 'GROW' = r: 'A6 E3' { return { raw: r, rpn: 'GROW', lid: hp42s }; }

// GTO IND ST L     AE 74
// GTO IND 99       AE 63 
GTO_IND_ST_stk 'GTO IND ST L,T,X,Y,Z' = r: 'AE 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'GTO IND ST ' + p.values[0], lid: hp41c }; }
GTO_IND_rr 'GTO IND 00-99' = r: 'AE' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'GTO IND ' + fmt(p.values[0],2), lid: hp41c }; }

// GTO 00           B1 00
// GTO 14           BF 00
// free42/DM42 do not ignore the second hex from GTO 00-14
GTO_lbl_00_14 'GTO 00-14' = r: 'B' p: arg_l_1_F_1 _ '00' { return { raw: r + p.raw + ' ' + '00', params: p, rpn: 'GTO ' + fmt(p.values[0],2), lid: hp41c }; }
// Some decoders (DM42-Web-Decoder,...) ignore the second hex from GTO 00-14
// GTO_lbl_00_14 'GTO 00-14' = r: 'B' p: arg_lbl_00_14_1 _ q:arg_n_00_FF { return { raw: r + p.raw + ' ' + q.raw, params: p, rpn: 'GTO ' + fmt(p.values[0],2), lid: hp41c }; }

// GTO 15           D0 00 0F
// GTO 16           D0 00 10
// GTO 99           D0 00 63
GTO_lbl_15_99 'GTO 15-99' = r: 'D0 00' _ p: arg_l_15_99 { return { raw: r + ' ' + p.raw, params: p, rpn: 'GTO ' + fmt(p.values[0],2), lid: hp41c }; }

// GTO A            D0 00 66
// GTO B            D0 00 67
// GTO C            D0 00 68
// GTO a            D0 00 7B
// GTO b            D0 00 7C
// GTO c            D0 00 7D
GTO_lbl_A_J 'GTO A-J' = r: 'D0 00' _ p: arg_l_A_J { return { raw: r + ' '+ p.raw, params: p, rpn: 'GTO ' + fc(p.values[0],37), lid: hp41c }; }
GTO_lbl_a_e 'GTO a-e' = r: 'D0 00' _ p: arg_l_a_e { return { raw: r + ' '+ p.raw, params: p, rpn: 'GTO ' + fc(p.values[0],26), lid: hp41c }; }

// HEAD ARG_VAR
// HEAD IND ST L     F3 A7 13 F4
// HEAD IND 99       F3 A7 13 E3 
// HEAD ST L         F3 A7 13 74 
// HEAD 99           F3 A7 13 63
HEAD_IND_ST_stk 'HEAD IND ST L,T,X,Y,Z' = r: 'F3 A7 13 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'HEAD IND ST ' + p.values[0], lid: free42 }; }
HEAD_IND_rr 'HEAD IND 00-99' = r: 'F3 A7 13' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'HEAD IND ' + fmt(p.values[0],2), lid: free42 }; }
HEAD_ST_stk 'HEAD ST L,T,X,Y,Z' = r: 'F3 A7 13 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'HEAD ST ' + p.values[0], lid: free42 }; }
HEAD_rr 'HEAD 00-99' = r: 'F3 A7 13' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'HEAD ' + fmt(p.values[0],2), lid: free42 }; }

HEADING 'HEADING' = r: 'A7 D1' { return { raw: r, rpn: 'HEADING', lid: free42 }; }

HEIGHT  'HEIGHT' = r: 'A2 73' { return { raw: r, rpn: 'HEIGHT', lid: free42 }; }

HEXM 'HEXM' = r: 'A0 E2' { return { raw: r, rpn: 'HEXM', lid: hp42s }; }

HEXSEP 'HEXSEP' = r: 'A7 3E' { return { raw: r, rpn: 'HEXSEP', lid: free42 }; }

HMS_ADD 'HMS+' = r: '49' { return { raw: r, rpn: 'HMS+', lid: hp41c }; }

HMS_SUB 'HMS-' = r: '4A' { return { raw: r, rpn: 'HMS-', lid: hp41c }; }

IDENT 'IDENT' = r: 'A7 F5' { return { raw: r, rpn: 'IDENT', lid: free42 }; }

INDEX_IND_ST_stk 'INDEX IND ST L,T,X,Y,Z' = r: 'F2 DA F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'INDEX IND ST ' + p.values[0], lid: hp42s }; }
INDEX_IND_rr 'INDEX IND 00-99' = r: 'F2 DA' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'INDEX IND ' + fmt(p.values[0],2), lid: hp42s }; }

INPUT_IND_ST_stk 'INPUT IND ST L,T,X,Y,Z' = r: 'F2 EE F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'INPUT IND ST ' + p.values[0], lid: hp42s }; }
INPUT_IND_rr 'INPUT IND 00-99' = r: 'F2 EE' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'INPUT IND ' + fmt(p.values[0],2), lid: hp42s }; }
INPUT_ST_stk 'INPUT ST L,T,X,Y,Z' = r: 'F2 D0 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'INPUT ST ' + p.values[0], lid: hp42s }; }
INPUT_rr 'INPUT 00-99' = r: 'F2 D0' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'INPUT ' + fmt(p.values[0],2), lid: hp42s }; }

INSR 'INSR' = r: 'A0 AA' { return { raw: r, rpn: 'INSR', lid: hp42s }; }

INTEG_IND_ST_stk 'INTEG IND ST L,T,X,Y,Z' = r: 'F2 EA F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'INTEG IND ST ' + p.values[0], lid: hp42s }; }
INTEG_IND_rr 'INTEG IND 00-99' = r: 'F2 EA' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'INTEG IND ' + fmt(p.values[0],2), lid: hp42s }; }

INV '1/X' = r: '60' { return { raw: r, rpn: '1/X', lid: hp41c }; }

INVRT 'INVRT' = r: 'A6 CE' { return { raw: r, rpn: 'INVRT', lid: hp42s }; }

IP 'IP' = r: '68' { return { raw: r, rpn: 'IP', lid: hp41c }; }

ISG_IND_ST_stk 'ISG IND ST L,T,X,Y,Z' = r: '96 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ISG IND ST ' + p.values[0], lid: hp41c }; }
ISG_IND_rr 'ISG IND 00-99' = r: '96' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ISG IND ' + fmt(p.values[0],2), lid: hp41c }; }
ISG_ST_stk 'ISG ST L,T,X,Y,Z' = r: '96 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ISG ST ' + p.values[0], lid: hp41c }; }
ISG_rr 'ISG 00-99' = r: '96' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ISG ' + fmt(p.values[0],2), lid: hp41c }; }

I_ADD 'I+' = r: 'A6 D2' { return { raw: r, rpn: 'I+', lid: hp42s }; }

I_SUB 'I-' = r: 'A6 D3' { return { raw: r, rpn: 'I-', lid: hp42s }; }

J_ADD 'J+' = r: 'A6 D4' { return { raw: r, rpn: 'J+', lid: hp42s }; }

J_SUB 'J-' = r: 'A6 D5' { return { raw: r, rpn: 'J-', lid: hp42s }; }

KEYASN 'KEYASN' = r: 'A2 63' { return { raw: r, rpn: 'KEYASN', lid: hp42s }; }

KEY_GTO_IND_ST_stk 'KEY 01-18 GTO IND ST L,T,X,Y,Z' = r: 'F3 E3' _ p: arg_k_01_12 _ 'F' q: arg_stk { return { raw: r + ' ' + p.raw + ' F' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' GTO IND ST ' + q.values[0], lid: hp42s }; }

// KEY 9 GTO IND 99  : F3 E3 09 E3
KEY_GTO_IND_rr 'KEY 01-18 GTO IND 00-99' = r: 'F3 E3' _ p: arg_k_01_12 _ q: arg_r_80_E3{ return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' GTO IND ' + fmt(q.values[0],2), lid: hp42s }; }

// KEY 1 GTO 00      : F3 E3 01 00
// KEY 1 GTO 16      : F3 E3 01 10
// KEY 9 GTO 99      : F3 E3 09 63 
// KEY 1 GTO A       : F3 E3 01 66
// KEY 4 GTO 01      : F3 E3 04 01
// KEY 6 GTO J       : F3 E3 06 6F
KEY_GTO_lbl_00_99 'KEY 01-18 GTO 00-99' = r: 'F3 E3' _ p: arg_k_01_12 _ q: arg_l_00_99 { return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' GTO ' + fmt(q.values[0],2), lid: hp42s }; }
KEY_GTO_lbl_A_J 'KEY 01-18 GTO A-J' = r: 'F3 E3' _ p: arg_k_01_12 _ q: arg_l_A_J { return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' GTO ' + fc(q.values[0],37), lid: hp42s }; }
KEY_GTO_lbl_a_e 'KEY 01-18 GTO a-e' = r: 'F3 E3' _ p: arg_k_01_12 _ q: arg_l_a_e { return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' GTO ' + fc(q.values[0],26), lid: hp42s }; }

KEY_XEQ_IND_ST_stk 'KEY 01-18 XEQ IND ST L,T,X,Y,Z' = r: 'F3 E2' _ p: arg_k_01_12 _ 'F' q: arg_stk { return { raw: r + ' ' + p.raw + ' F' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' XEQ IND ST ' + q.values[0], lid: hp42s }; }
KEY_XEQ_IND_rr 'KEY 01-18 XEQ IND 00-99' = r: 'F3 E2' _ p: arg_k_01_12 _ q: arg_r_80_E3{ return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' XEQ IND ' + fmt(q.values[0],2), lid: hp42s }; }
KEY_XEQ_lbl_00_99 'KEY 01-18 XEQ 00-99' = r: 'F3 E2' _ p: arg_k_01_12 _ q: arg_l_00_99 { return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' XEQ ' + fmt(q.values[0],2), lid: hp42s }; }
KEY_XEQ_lbl_A_J 'KEY 01-18 XEQ A-J' = r: 'F3 E2' _ p: arg_k_01_12 _ q: arg_l_A_J { return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' XEQ ' + fc(q.values[0],37), lid: hp42s }; }
KEY_XEQ_lbl_a_e 'KEY 01-18 XEQ a-e' = r: 'F3 E2' _ p: arg_k_01_12 _ q: arg_l_a_e { return { raw: r + ' ' + p.raw + ' ' + q.raw, params: p, rpn: 'KEY ' + p.values[0] + ' XEQ ' + fc(q.values[0],26), lid: hp42s }; }

L4STK 'L4STK' = r: 'A7 E3' { return { raw: r, rpn: 'L4STK', lid: free42 }; }

// LASTO ARG_NAMED
// LASTO IND ST L    F2 C8 F4
// LASTO IND 99      F2 C8 E3
// LASTO "REGS"      F5 F5 52 45 47 53
LASTO_IND_ST_stk 'LASTO IND ST L,T,X,Y,Z' = r: 'F2 C8 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'LASTO IND ST ' + p.values[0], lid: free42 }; }
LASTO_IND_rr 'LASTO IND 00-99' = r: 'F2 C8' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'LASTO IND ' + fmt(p.values[0],2), lid: free42 }; }
LASTO_REGS 'LASTO "REGS"' = r: 'F5 F5 52 45 47 53' { return { raw: r, rpn: 'LASTO "REGS"', lid: free42 }; }


LASTX 'LASTX' = r: '76' { return { raw: r, rpn: 'LASTX', lid: hp41c }; }

// LBL 00      : 01    : hex:01-0F, dec:00-14
// LBL 14      : 0F    :
LBL_lbl_00_14 'LBL 00-14' = r: '0' p: arg_l_1_F_1 { return { raw: r + p.raw, params: p, rpn: 'LBL ' + fmt(p.values[0],2), lid: hp41c }; }

// LBL 15      : CF 0F : hex:0F-63, dec:15-99
// LBL 16      : CF 10 :
// LBL 99      : CF 63 :
LBL_lbl_15_99 'LBL 15-99' = r: 'CF' _ p: arg_l_15_99 { return { raw: r + ' ' + p.raw, params: p, rpn: 'LBL ' + fmt(p.values[0],2), lid: hp41c }; }

// LBL A       : CF 66 : hex:66-6F, A-J
// LBL J       : CF 6F
// LBL a       : CF 7B : hex:7B-7F, a-e
// LBL e       : CF 7F
LBL_lbl_A_J 'LBL A-J' = r: 'CF' _ p: arg_l_A_J { return { raw: r + ' ' + p.raw, params: p, rpn: 'LBL ' + fc(p.values[0],37), lid: hp41c }; }
LBL_lbl_a_e 'LBL a-e' = r: 'CF' _ p: arg_l_a_e { return { raw: r + ' ' + p.raw, params: p, rpn: 'LBL ' + fc(p.values[0],26), lid: hp41c }; }

LCLBL 'LCLBL' = r: 'A2 64' { return { raw: r, rpn: 'LCLBL', lid: hp42s }; }

// LCLV ARG_NAMED
// LCLV IND ST L     F3 A7 64 F4
// LCLV IND 99       F3 A7 64 E3
// LCLV "REGS"       F6 A7 71 52 45 47 53
LCLV_IND_ST_stk 'LCLV IND ST L,T,X,Y,Z' = r: 'F3 A7 64 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'LCLV IND ST ' + p.values[0], lid: free42 }; }
LCLV_IND_rr 'LCLV IND 00-99' = r: 'F3 A7 64' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'LCLV IND ' + fmt(p.values[0],2), lid: free42 }; }
LCLV_REGS 'LCLV "REGS"' = r: 'F6 A7 71 52 45 47 53' { return { raw: r, rpn: 'LCLV "REGS"', lid: free42 }; }

LEFT '←' = r: 'A6 DC' { return { raw: r, rpn: '←', lid: hp42s }; }

LENGTH  'LENGTH' = r: 'A7 EC' { return { raw: r, rpn: 'LENGTH', lid: free42 }; }

LINF 'LINF' = r: 'A0 A1' { return { raw: r, rpn: 'LINF', lid: hp42s }; }

LINSIGMA 'LINΣ' = r: 'A0 AD' { return { raw: r, rpn: 'LINΣ', lid: hp42s }; }

LIST_T  'LIST?' = r: 'A7 F3' { return { raw: r, rpn: 'LIST?', lid: free42 }; }

LJ 'LJ' = r: 'A7 2B' { return { raw: r, rpn: 'LJ', lid: free42 }; }

LN 'LN' = r: '50' { return { raw: r, rpn: 'LN', lid: hp41c }; }

LN_1_X 'LN1+X' = r: '65' { return { raw: r, rpn: 'LN1+X', lid: hp41c }; }

LNSTK 'LNSTK' = r: 'A7 E5' { return { raw: r, rpn: 'LNSTK', lid: free42 }; }

LOCAT 'LOCAT' = r: 'A7 D0' { return { raw: r, rpn: 'LOCAT', lid: free42 }; }

LOG 'LOG' = r: '56' { return { raw: r, rpn: 'LOG', lid: hp41c }; }

LOGF 'LOGF' = r: 'A0 A2' { return { raw: r, rpn: 'LOGF', lid: hp42s }; }

LSTO_IND_ST_stk 'LSTO IND ST L,T,X,Y,Z' = r: 'F2 ED F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'LSTO IND ST ' + p.values[0], lid: free42 }; }
LSTO_IND_rr 'LSTO IND 00-99' = r: 'F2 ED' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'LSTO IND ' + fmt(p.values[0],2), lid: free42 }; }

// LXASTO ARG_NAMED
// LXASTO IND ST L   F3 A7 12 F4
// LXASTO IND 99     F3 A7 12 E3 
// LXASTO "REGS"     F6 A7 02 52 45 47 53
LXASTO_IND_ST_stk 'LXASTO IND ST L,T,X,Y,Z' = r: 'F3 A7 12 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'LXASTO IND ST ' + p.values[0], lid: free42 }; }
LXASTO_IND_rr 'LXASTO IND 00-99' = r: 'F3 A7 12' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'LXASTO IND ' + fmt(p.values[0],2), lid: free42 }; }
LXASTO_REGS 'LXASTO "REGS"' = r: 'F6 A7 02 52 45 47 53' { return { raw: r, rpn: 'LXASTO "REGS"', lid: free42 }; }

MAN 'MAN' = r: 'A7 5B' { return { raw: r, rpn: 'MAN', lid: hp42s }; }

MASKL 'MASKL' = r: 'A7 35' { return { raw: r, rpn: 'MASKL', lid: free42 }; }

MASKR 'MASKR' = r: 'A7 36' { return { raw: r, rpn: 'MASKR', lid: free42 }; }

MAT_T 'MAT?' = r: 'A2 66' { return { raw: r, rpn: 'MAT?', lid: hp42s }; }

MAX '[MAX]' = r: 'A6 EB' { return { raw: r, rpn: '[MAX]', lid: hp42s }; }

MDY 'MDY' = r: 'A6 91' { return { raw: r, rpn: 'MDY', lid: free42 }; }

MEAN 'MEAN' = r: '7C' { return { raw: r, rpn: 'MEAN', lid: hp41c }; }

MENU 'MENU' = r: 'A2 5E' { return { raw: r, rpn: 'MENU', lid: hp42s }; }

MIN '[MIN]' = r: 'A6 EA' { return { raw: r, rpn: '[MIN]', lid: hp42s }; }

MOD 'MOD' = r: '4B' { return { raw: r, rpn: 'MOD', lid: hp41c }; }

MULTIPLY '×' = r: '42' { return { raw: r, rpn: '×', lid: hp42s }; }

N_TO_BD 'N→BD' = r: 'A7 67' { return { raw: r, rpn: 'N→BD', lid: free42 }; }

N_TO_BQ 'N→BQ' = r: 'A7 68' { return { raw: r, rpn: 'N→BQ', lid: free42 }; }

N_TO_BS 'N→BS' = r: 'A7 3F' { return { raw: r, rpn: 'N→BS', lid: free42 }; }

N_TO_C 'N→C' = r: 'A7 F2' { return { raw: r, rpn: 'N→C', lid: free42 }; }

N_TO_DD 'N→DD' = r: 'A7 6A' { return { raw: r, rpn: 'N→DD', lid: free42 }; }

N_TO_DQ 'N→DQ' = r: 'A7 6B' { return { raw: r, rpn: 'N→DQ', lid: free42 }; }

N_TO_DS 'N→DS' = r: 'A7 69' { return { raw: r, rpn: 'N→DS', lid: free42 }; }

N_TO_S 'N→S' = r: 'A7 F0' { return { raw: r, rpn: 'N→S', lid: free42 }; }

NEWLIST  'NEWLIST' = r: 'A7 F4' { return { raw: r, rpn: 'NEWLIST', lid: free42 }; }

NEWMAT 'NEWMAT' = r: 'A6 DA' { return { raw: r, rpn: 'NEWMAT', lid: hp42s }; }

NN_TO_S  'NN→S' = r: 'A7 1D' { return { raw: r, rpn: 'NN→S', lid: free42 }; }

NOP 'NOP' = r: 'F0' { return { raw: r, params: {}, rpn: 'NOP', lid: free42 }; }

NORM 'NORM' = r: 'A7 5C' { return { raw: r, rpn: 'NORM', lid: hp42s }; }

NOT 'NOT' = r: 'A5 87' { return { raw: r, rpn: 'NOT', lid: hp42s }; }

NSTK 'NSTK' = r: 'A7 E4' { return { raw: r, rpn: 'NSTK', lid: free42 }; }

NUM_B '#B' = r: 'A7 34' { return { raw: r, rpn: '#B', lid: free42 }; }

OCTM 'OCTM' = r: 'A0 E4' { return { raw: r, rpn: 'OCTM', lid: hp42s }; }

OCTSEP 'OCTSEP' = r: 'A7 3C' { return { raw: r, rpn: 'OCTSEP', lid: free42 }; }

OFF 'OFF' = r: '8D' { return { raw: r, rpn: 'OFF', lid: hp41c }; }

OLD 'OLD' = r: 'A6 DB' { return { raw: r, rpn: 'OLD', lid: hp42s }; }

ON 'ON' = r: 'A2 70' { return { raw: r, rpn: 'ON', lid: hp41c }; }

OR 'OR' = r: 'A5 89' { return { raw: r, rpn: 'OR', lid: hp42s }; }

PCOMPLX 'PCOMPLX' = r: 'A7 F9' { return { raw: r, rpn: 'PCOMPLX', lid: free42 }; }

PERCENT = r: '4C' { return { raw: r, rpn: '%', lid: hp42s }; }

PERCENT_CH  '%CH' = r: '4D' { return { raw: r, rpn: '%CH', lid: hp42s }; }

PERM 'PERM' = r: 'A0 70' { return { raw: r, rpn: 'PERM', lid: hp42s }; }

PGMINT_IND_ST_stk 'PGMINT IND ST L,T,X,Y,Z' = r: 'F2 E8 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PGMINT IND ST ' + p.values[0], lid: hp42s }; }
PGMINT_IND_rr 'PGMINT IND 00-99' = r: 'F2 E8' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PGMINT IND ' + fmt(p.values[0],2), lid: hp42s }; }

PGMMENU 'PGMMENU' = r: 'A7 E8' { return { raw: r, rpn: 'PGMMENU', lid: free42 }; }

PGMSLV_IND_ST_stk 'PGMSLV IND ST L,T,X,Y,Z' = r: 'F2 E9 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PGMSLV IND ST ' + p.values[0], lid: hp42s }; }
PGMSLV_IND_rr 'PGMSLV IND 00-99' = r: 'F2 E9' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PGMSLV IND ' + fmt(p.values[0],2), lid: hp42s }; }

// PGMVAR ARG_PRGM
// PGMVAR IND ST L   F3 A7 30 F4 
// PGMVAR IND 99     F3 A7 30 E3
PGMVAR_IND_ST_stk 'PGMVAR IND ST L,T,X,Y,Z' = r: 'F3 A7 30 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PGMVAR IND ST ' + p.values[0], lid: free42 }; }
PGMVAR_IND_rr 'PGMVAR IND 00-99' = r: 'F3 A7 30' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PGMVAR IND ' + fmt(p.values[0],2), lid: free42 }; }

PI 'PI' = r: '72' { return { raw: r, rpn: 'PI', lid: hp41c }; }

// PICK IND ST L     F2 A3 F4 
// PICK IND 99       F2 A3 E3 
// PICK 9            F2 A3 09
PICK_IND_ST_stk 'PICK IND ST L,T,X,Y,Z' = r: 'F2 A3 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PICK IND ST ' + p.values[0], lid: free42 }; }
PICK_IND_rr 'PICK IND 00-99' = r: 'F2 A3' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PICK IND ' + fmt(p.values[0],2), lid: free42 }; }
PICK_n 'PICK 0-9' = r: 'F2 A3' _ p: arg_n_0_9 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PICK ' + p.values[0], lid: free42 }; }

PIXEL 'PIXEL' = r: 'A7 65' { return { raw: r, rpn: 'PIXEL', lid: hp42s }; }

PROFF 'PROFF' = r: 'A7 5F' { return { raw: r, rpn: 'PROFF', lid: hp42s }; }

POLAR 'POLAR' = r: 'A2 59' { return { raw: r, rpn: 'POLAR', lid: hp42s }; }

PRON 'PRON' = r: 'A7 5E' { return { raw: r, rpn: 'PRON', lid: hp42s }; }

POS  'POS' = r: 'A7 EE' { return { raw: r, rpn: 'POS', lid: free42 }; }

POSA 'POSA' = r: 'A6 5C' { return { raw: r, rpn: 'POSA', lid: hp42s }; }

PRA 'PRA' = r: 'A7 48' { return { raw: r, rpn: 'PRA', lid: hp42s }; }

PRLCD 'PRLCD' = r: 'A7 62' { return { raw: r, rpn: 'PRLCD', lid: hp42s }; }

PROMPT 'PROMPT' = r: '8E' { return { raw: r, rpn: 'PROMPT', lid: hp41c }; }

PRREG  'PRREG' = r: 'A7 50' { return { raw: r, rpn: 'PRREG', lid: free42 }; }

PRSIGMA 'PRΣ' = r: 'A7 52' { return { raw: r, rpn: 'PRΣ', lid: hp42s }; }

PRSTK 'PRSTK' = r: 'A7 53' { return { raw: r, rpn: 'PRSTK', lid: hp42s }; }

PRUSR 'PRUSR' = r: 'A7 61' { return { raw: r, rpn: 'PRUSR', lid: hp42s }; }

PRV_IND_ST_stk 'PRV IND ST L,T,X,Y,Z' = r: 'F2 D9 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PRV IND ST ' + p.values[0], lid: hp42s }; }
PRV_IND_rr 'PRV IND 00-99' = r: 'F2 D9' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PRV IND ' + fmt(p.values[0],2), lid: hp42s }; }

PRX 'PRX' = r: 'A7 54' { return { raw: r, rpn: 'PRX', lid: hp42s }; }

PSE 'PSE' = r: '89' { return { raw: r, rpn: 'PSE', lid: hp41c }; }

// PUTLI ARG_L_STK
// PUTLI IND ST L    F3 A7 68 F4 
// PUTLI IND 99      F3 A7 68 E3 
// PUTLI ST L        F3 A7 68 74
PUTLI_IND_ST_stk 'PUTLI IND ST L,T,X,Y,Z' = r: 'F3 A7 68 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PUTLI IND ST ' + p.values[0], lid: free42 }; }
PUTLI_IND_rr 'PUTLI IND 00-99' = r: 'F3 A7 68' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PUTLI IND ' + fmt(p.values[0],2), lid: free42 }; }
PUTLI_ST_stk 'PUTLI ST L,T,X,Y,Z' = r: 'F3 A7 68 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PUTLI ST ' + p.values[0], lid: free42 }; }

PUTM 'PUTM' = r: 'A6 E9' { return { raw: r, rpn: 'PUTM', lid: hp42s }; }

// PUTMI ARG_M_STK
// PUTMI IND ST L    F3 A7 66 F4 
// PUTMI IND 99      F3 A7 66 E3 
// PUTMI ST L        F3 A7 66 74 
// PUTMI "REGS"      F6 A7 73 52 45 47 53
PUTMI_IND_ST_stk 'PUTMI IND ST L,T,X,Y,Z' = r: 'F3 A7 66 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PUTMI IND ST ' + p.values[0], lid: free42 }; }
PUTMI_IND_rr 'PUTMI IND 00-99' = r: 'F3 A7 66' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'PUTMI IND ' + fmt(p.values[0],2), lid: free42 }; }
PUTMI_ST_stk 'PUTMI ST L,T,X,Y,Z' = r: 'F3 A7 66 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'PUTMI ST ' + p.values[0], lid: free42 }; }
PUTMI_REGS 'PUTMI "REGS"' = r: 'F6 A7 73 52 45 47 53' { return { raw: r, rpn: 'PUTMI "REGS"', lid: free42 }; }

PWRF 'PWRF' = r: 'A0 A3' { return { raw: r, rpn: 'PWRF', lid: hp42s }; }

RAD 'RAD' = r: '81' { return { raw: r, rpn: 'RAD', lid: hp42s }; }

RAN 'RAN' = r: 'A0 71' { return { raw: r, rpn: 'RAN', lid: hp42s }; }

RCLEL 'RCLEL' = r: 'A6 D7' { return { raw: r, rpn: 'RCLEL', lid: hp42s }; }

RCLFLAG 'RCLFLAG' = r: 'A6 60' { return { raw: r, rpn: 'RCLFLAG', lid: free42 }; }

RCLIJ 'RCLIJ' = r: 'A6 D9' { return { raw: r, rpn: 'RCLIJ', lid: hp42s }; }

RCL_00_15 'RCL 00-15' = r: '2' p: arg_r_0_F { return { raw: r + p.raw, params: p, rpn: 'RCL ' + fmt(p.values[0],2), lid: hp41c }; }
RCL_16_99 'RCL 16-99' = r: '90' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL ' + fmt(p.values[0],2), lid: hp41c }; }

RCL_ADD_IND_ST_stk 'RCL+ IND ST L,T,X,Y,Z' = r: 'F2 D1 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL+ IND ST ' + p.values[0], lid: hp42s }; }
RCL_ADD_IND_rr 'RCL+ IND 00-99' = r: 'F2 D1' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL+ IND ' + fmt(p.values[0],2), lid: hp42s }; }
RCL_ADD_ST_stk 'RCL+ ST L,T,X,Y,Z' = r: 'F2 D1 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL+ ST ' + p.values[0], lid: hp42s }; }
RCL_ADD_rr 'RCL+ 00-99' = r: 'F2 D1' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL+ ' + fmt(p.values[0],2), lid: hp42s }; }

RCL_DIV_IND_ST_stk 'RCL÷ IND ST L,T,X,Y,Z' = r: 'F2 D4 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL÷ IND ST ' + p.values[0], lid: hp42s }; }
RCL_DIV_IND_rr 'RCL÷ IND 00-99' = r: 'F2 D4' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL÷ IND ' + fmt(p.values[0],2), lid: hp42s }; }
RCL_DIV_ST_stk 'RCL÷ ST L,T,X,Y,Z' = r: 'F2 D4 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL÷ ST ' + p.values[0], lid: hp42s }; }
RCL_DIV_rr 'RCL÷ 00-99' = r: 'F2 D4' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL÷ ' + fmt(p.values[0],2), lid: hp42s }; }

RCL_IND_ST_stk 'RCL IND ST L,T,X,Y,Z' = r: '90 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL IND ST ' + p.values[0], lid: hp42s }; }
RCL_IND_rr 'RCL IND 00-99' = r: '90' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL IND ' + fmt(p.values[0],2), lid: hp42s }; }

RCL_MUL_IND_ST_stk 'RCL× IND ST L,T,X,Y,Z' = r: 'F2 D3 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL× IND ST ' + p.values[0], lid: hp42s }; }
RCL_MUL_IND_rr 'RCL× IND 00-99' = r: 'F2 D3' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL× IND ' + fmt(p.values[0],2), lid: hp42s }; }
RCL_MUL_ST_stk 'RCL× ST L,T,X,Y,Z' = r: 'F2 D3 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL× ST ' + p.values[0], lid: hp42s }; }
RCL_MUL_rr 'RCL× 00-99' = r: 'F2 D3' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL× ' + fmt(p.values[0],2), lid: hp42s }; }

RCL_ST_stk 'RCL ST L,T,X,Y,Z' = r: '90 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL ST ' + p.values[0], lid: hp42s }; }

RCL_SUB_IND_ST_stk 'RCL- IND ST L,T,X,Y,Z' = r: 'F2 D2 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL- IND ST ' + p.values[0], lid: hp42s }; }
RCL_SUB_IND_rr 'RCL- IND 00-99' = r: 'F2 D2' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL- IND ' + fmt(p.values[0],2), lid: hp42s }; }
RCL_SUB_ST_stk 'RCL- ST L,T,X,Y,Z' = r: 'F2 D2 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RCL- ST ' + p.values[0], lid: hp42s }; }
RCL_SUB_rr 'RCL- 00-99' = r: 'F2 D2' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RCL- ' + fmt(p.values[0],2), lid: hp42s }; }

RCOMPLX 'RCOMPLX' = r: 'A7 F8' { return { raw: r, rpn: 'RCOMPLX', lid: free42 }; }

RDN 'R↓' = r: '75' { return { raw: r, rpn: 'R↓', lid: hp41c }; }

// RDNN R↓N ARG_NUM9
// R↓N IND ST L      F2 A5 F4 
// R↓N IND 99        F2 A5 E3 
// R↓N 9             F2 A5 09
RDNN_IND_ST_stk 'R↓N IND ST L,T,X,Y,Z' = r: 'F2 A5 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'R↓N IND ST ' + p.values[0], lid: free42 }; }
RDNN_IND_rr 'R↓N IND 00-99' = r: 'F2 A5' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'R↓N IND ' + fmt(p.values[0],2), lid: free42 }; }
RDNN_n 'R↓N 0-9' = r: 'F2 A5' _ p: arg_n_0_9 { return { raw: r + ' ' + p.raw, params: p, rpn: 'R↓N ' + p.values[0], lid: free42 }; }

RDX_COMMA 'RDX,' = r: 'A2 5C' { return { raw: r, rpn: 'RDX,', lid: hp42s }; }

RDX_DOT 'RDX.' = r: 'A2 5B' { return { raw: r, rpn: 'RDX.', lid: hp42s }; }

REALRES 'REALRES' = r: 'A2 6B' { return { raw: r, rpn: 'REALRES', lid: hp42s }; }

REAL_T 'REAL?' = r: 'A2 65' { return { raw: r, rpn: 'REAL?', lid: hp42s }; }

RECT 'RECT' = r: 'A2 5A' { return { raw: r, rpn: 'RECT', lid: hp42s }; }

REV  'REV' = r: 'A7 ED' { return { raw: r, rpn: 'REV', lid: free42 }; }

RIGHT '→' = r: 'A6 DD' { return { raw: r, rpn: '→', lid: hp42s }; }

RJ 'RJ' = r: 'A7 72' { return { raw: r, rpn: 'RJ', lid: free42 }; }

RL 'RL' = r: 'A7 E0' { return { raw: r, rpn: 'RL', lid: free42 }; }

RLC 'RLC' = r: 'A7 FB' { return { raw: r, rpn: 'RLC', lid: free42 }; }

RLCN 'RLCN' = r: 'A7 2F' { return { raw: r, rpn: 'RLCN', lid: free42 }; }

RLN 'RLN' = r: 'A7 2D' { return { raw: r, rpn: 'RLN', lid: free42 }; }

RND 'RND' = r: '6E' { return { raw: r, rpn: 'RND', lid: hp41c }; }

RNRM 'RNRM' = r: 'A6 ED' { return { raw: r, rpn: 'RNRM', lid: hp42s }; }

ROTXY 'ROTXY' = r: 'A5 8B' { return { raw: r, rpn: 'ROTXY', lid: hp42s }; }

RR 'RR' = r: 'A7 FA' { return { raw: r, rpn: 'RR', lid: free42 }; }

RRC 'RRC' = r: 'A7 2A' { return { raw: r, rpn: 'RRC', lid: free42 }; }

RRCN 'RRCN' = r: 'A7 30' { return { raw: r, rpn: 'RRCN', lid: free42 }; }

RRN 'RRN' = r: 'A7 2E' { return { raw: r, rpn: 'RRN', lid: free42 }; }

RSUM 'RSUM' = r: 'A6 D0' { return { raw: r, rpn: 'RSUM', lid: hp42s }; }

RTN 'RTN' = r: '85' { return { raw: r, rpn: 'RTN', lid: hp41c }; }

// RTNERR IND ST L    F2 A0 F4 
// RTNERR IND 99      F2 A0 E3 
// RTNERR 8           F2 A0 08
RTNERR_IND_ST_stk 'RTNERR IND ST L,T,X,Y,Z' = r: 'F2 A0 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'RTNERR IND ST ' + p.values[0], lid: free42 }; }
RTNERR_IND_rr 'RTNERR IND 00-99' = r: 'F2 A0' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'RTNERR IND ' + fmt(p.values[0],2), lid: free42 }; }
RTNERR_err 'RTNERR 0-8' = r: 'F2 A0 0' p: arg_e_0_8 { return { raw: r + p.raw, params: p, rpn: 'RTNERR ' + fi(p.values[0]), lid: free42 }; }

RTNNO 'RTNNO' = r: 'A7 DF' { return { raw: r, rpn: 'RTNNO', lid: free42 }; }

RTNYES 'RTNYES' = r: 'A7 DE' { return { raw: r, rpn: 'RTNYES', lid: free42 }; }

RUP 'R↑' = r: '74' { return { raw: r, rpn: 'R↑', lid: hp41c }; }

// RUPN ARG_NUM9
// R↑N IND ST L      F2 A6 F4 
// R↑N IND 99        F2 A6 E3 
// R↑N 9             F2 A6 09
RUPN_IND_ST_stk 'R↑N IND ST L,T,X,Y,Z' = r: 'F2 A6 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'R↑N IND ST ' + p.values[0], lid: free42 }; }
RUPN_IND_rr 'R↑N IND 00-99' = r: 'F2 A6' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'R↑N IND ' + fmt(p.values[0],2), lid: free42 }; }
RUPN_n 'R↑N 0-9' = r: 'F2 A6' _ p: arg_n_0_9 { return { raw: r + ' ' + p.raw, params: p, rpn: 'R↑N ' + p.values[0], lid: free42 }; }

R_SWAP 'R<>R' = r: 'A6 D1' { return { raw: r, rpn: 'R<>R', lid: hp42s }; }

S_TO_N 'S→N' = r: 'A7 EF' { return { raw: r, rpn: 'S→N', lid: free42 }; }

SB 'SB' = r: 'A7 31' { return { raw: r, rpn: 'SB', lid: free42 }; }

SC 'SC' = r: 'A7 37' { return { raw: r, rpn: 'SC', lid: free42 }; }

SCI_10 'SCI 10' = r: 'F1 D6' { return { raw: r, params: {}, rpn: 'SCI 10', lid: hp41c}; }
SCI_11 'SCI 11' = r: 'F1 E6' { return { raw: r, params: {}, rpn: 'SCI 11', lid: hp41c}; }
SCI_IND_ST_stk 'SCI IND ST L,T,X,Y,Z' = r: '9D F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'SCI IND ST ' + p.values[0], lid: hp41c }; }
SCI_IND_rr 'SCI IND 00-99' = r: '9D' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'SCI IND ' + fmt(p.values[0],2), lid: hp41c }; }
SCI_dec 'SCI 00-09' = r: '9D' _ p: arg_n_00_09 { return { raw: r + ' ' + p.raw, params: p, rpn: 'SCI ' + fmt(p.values[0],2), lid: hp41c }; }

SDEV 'SDEV' = r: '7D' { return { raw: r, rpn: 'SDEV', lid: hp41c }; }

SEED 'SEED' = r: 'A0 73' { return { raw: r, rpn: 'SEED', lid: hp42s }; }

SF_IND_ST_stk 'SF INDL,T,X,Y,Z' = r: 'A8 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'SF IND ST ' + p.values[0], lid: hp41c }; }
SF_IND_rr 'SF IND 00-99' = r: 'A8' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'SF IND ' + fmt(p.values[0],2), lid: hp41c }; }
SF_flg 'SF 00-09' = r: 'A8' _ p: arg_f_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'SF ' + fmt(p.values[0],2), lid: hp41c }; }

SIGMA_ADD 'Σ+' = r: '47' { return { raw: r, rpn: 'Σ+', lid: hp42s }; }

SIGMA_REG_IND_ST_stk 'ΣREG IND ST L,T,X,Y,Z' = r: '99 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'ΣREG IND ST ' + p.values[0], lid: hp42s }; }
SIGMA_REG_IND_rr 'ΣREG IND 00-99' = r: '99' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ΣREG IND ' + fmt(p.values[0],2), lid: hp42s }; }
SIGMA_REG_T 'ΣREG?' = r: 'A6 78' { return { raw: r, rpn: 'ΣREG?', lid: hp42s }; }
SIGMA_REG_rr 'ΣREG 00-99' = r: '99' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'ΣREG ' + fmt(p.values[0],2), lid: hp42s }; }

SIGMA_SUB 'Σ-' = r: '48' { return { raw: r, rpn: 'Σ-', lid: hp42s }; }

SIGN 'SIGN' = r: '7A' { return { raw: r, rpn: 'SIGN', lid: hp41c }; }

SIN 'SIN' = r: '59' { return { raw: r, rpn: 'SIN', lid: hp41c }; }

SINH 'SINH' = r: 'A0 61' { return { raw: r , rpn: 'SINH', lid: hp42s }; }

// F3 F7 00 00 
// F3 F7 27 0F
SIZE_ssss 'SIZE ssss' = r: 'F3 F7' _ p: arg_sz_0000_270F { 
        return { 
            raw: r + ' ' + p.raw, 
            params: p, 
            rpn: 'SIZE ' + (p.values[0] < 100 ? fmt(p.values[0],2) : (p.values[0] < 1000 ? fmt(p.values[0],3) : fmt(p.values[0],4))), 
            lid: hp41c 
        }; 
    }

SKIP 'SKIP' = r: 'A2 74' { return { raw: r, rpn: 'SKIP', lid: free42 }; }

SL 'SL' = r: 'A7 DC' { return { raw: r, rpn: 'SL', lid: free42 }; }

SLN 'SLN' = r: 'A7 73' { return { raw: r, rpn: 'SLN', lid: free42 }; }

SLOPE 'SLOPE' = r: 'A0 A4' { return { raw: r, rpn: 'SLOPE', lid: hp42s }; }

SOLVE_IND_ST_stk 'SOLVE IND ST L,T,X,Y,Z' = r: 'F2 EB F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'SOLVE IND ST ' + p.values[0], lid: hp42s }; }
SOLVE_IND_rr 'SOLVE IND 00-99' = r: 'F2 EB' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'SOLVE IND ' + fmt(p.values[0],2), lid: hp42s }; }

SQRT 'SQRT' = r: '52' { return { raw: r, rpn: 'SQRT', lid: hp41c }; }

SQUARE 'X↑2' = r: '51' { return { raw: r, rpn: 'X↑2', lid: hp41c }; }

SR 'SR' = r: 'A7 DD' { return { raw: r, rpn: 'SR', lid: free42 }; }

SRN 'SRN' = r: 'A7 74' { return { raw: r, rpn: 'SRN', lid: free42 }; }

STOEL 'STOEL' = r: 'A6 D6' { return { raw: r, rpn: 'STOEL', lid: hp42s }; }

STOFLAG 'STOFLAG' = r: 'A6 6D' { return { raw: r, rpn: 'STOFLAG', lid: free42 }; }

STOIJ 'STOIJ' = r: 'A6 D8' { return { raw: r, rpn: 'STOIJ', lid: hp42s }; }

STOP 'STOP' = r: '84' { return { raw: r, rpn: 'STOP', lid: hp42s }; }

STO_00_15 'STO 00-15' = r: '3' p: arg_r_0_F { return { raw: r + p.raw, params: p, rpn: 'STO ' + fmt(p.values[0],2), lid: hp41c }; }
STO_16_99 'STO 16-99' = r: '91' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO ' + fmt(p.values[0],2), lid: hp41c }; }
STO_IND_ST_stk 'STO IND ST L,T,X,Y,Z' = r: '91 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO IND ST ' + p.values[0], lid: hp41c }; }
STO_IND_rr 'STO IND 00-99' = r: '91' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO IND ' + fmt(p.values[0],2), lid: hp41c }; }
STO_ST_stk 'STO ST L,T,X,Y,Z' = r: '91 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO ST ' + p.values[0], lid: hp42s }; }

STO_ADD_IND_ST_stk 'STO+ IND ST L,T,X,Y,Z' = r: '92 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO+ IND ST ' + p.values[0], lid: hp41c }; }
STO_ADD_IND_rr 'STO+ IND 00-99' = r: '92' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO+ IND ' + fmt(p.values[0],2), lid: hp41c }; }
STO_ADD_ST_stk 'STO+ ST L,T,X,Y,Z' = r: '92 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO+ ST ' + p.values[0], lid: hp41c }; }
STO_ADD_rr 'STO+ 00-99' = r: '92' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO+ ' + fmt(p.values[0],2), lid: hp41c }; }

STO_DIV_IND_ST_stk 'STO÷ IND ST L,T,X,Y,Z' = r: '95 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO÷ IND ST ' + p.values[0], lid: hp41c }; }
STO_DIV_IND_rr 'STO÷ IND 00-99' = r: '95' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO÷ IND ' + fmt(p.values[0],2), lid: hp41c }; }
STO_DIV_ST_stk 'STO÷ ST L,T,X,Y,Z' = r: '95 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO÷ ST ' + p.values[0], lid: hp41c }; }
STO_DIV_rr 'STO÷ 00-99' = r: '95' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO÷ ' + fmt(p.values[0],2), lid: hp41c }; }

STO_MUL_IND_ST_stk 'STO× IND ST L,T,X,Y,Z' = r: '94 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO× IND ST ' + p.values[0], lid: hp41c }; }
STO_MUL_IND_rr 'STO× IND 00-99' = r: '94' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO× IND ' + fmt(p.values[0],2), lid: hp41c }; }
STO_MUL_ST_stk 'STO× ST L,T,X,Y,Z' = r: '94 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO× ST ' + p.values[0], lid: hp41c }; }
STO_MUL_rr 'STO× 00-99' = r: '94' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO× ' + fmt(p.values[0],2), lid: hp41c }; }

STO_SUB_IND_ST_stk 'STO- IND ST L,T,X,Y,Z' = r: '93 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO- IND ST ' + p.values[0], lid: hp41c }; }
STO_SUB_IND_rr 'STO- IND 00-99' = r: '93' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO- IND ' + fmt(p.values[0],2), lid: hp41c }; }
STO_SUB_ST_stk 'STO- ST L,T,X,Y,Z' = r: '93 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'STO- ST ' + p.values[0], lid: hp41c }; }
STO_SUB_rr 'STO- 00-99' = r: '93' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'STO- ' + fmt(p.values[0],2), lid: hp41c }; }

STRACE 'STRACE' = r: 'A7 E1' { return { raw: r, rpn: 'STRACE', lid: free42 }; }

STR_T 'STR?' = r: 'A2 68' { return { raw: r, rpn: 'STR?', lid: hp42s }; }

SUB '-' = r: '41' { return { raw: r, rpn: '-', lid: hp42s }; }

SUBSTR 'SUBSTR' = r: 'A7 EB' { return { raw: r, rpn: 'SUBSTR', lid: free42 }; }

SUM 'SUM' = r: 'A0 A5' { return { raw: r, rpn: 'SUM', lid: hp42s }; }

SWAP 'X<>Y' = r: '71' { return { raw: r, rpn: 'X<>Y', lid: hp42s }; }

TAN 'TAN' = r: '5B' { return { raw: r, rpn: 'TAN', lid: hp41c }; }

TANH 'TANH' = r: 'A0 63' { return { raw: r, rpn: 'TANH', lid: hp42s }; }

TIME 'TIME' = r: 'A6 9C' { return { raw: r, rpn: 'TIME', lid: free42 }; }

TONE_IND_ST_stk 'TONE IND ST L,T,X,Y,Z' = r: '9F F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'TONE IND ST ' + p.values[0], lid: hp41c }; }
TONE_IND_rr 'TONE IND 00-99' = r: '9F' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'TONE IND ' + fmt(p.values[0],2), lid: hp41c }; }
TONE_ton 'TONE ton' = r: '9F' _ p: arg_t_00_09 { return { raw: r + ' ' + p.raw, params: p, rpn: 'TONE ' + fi(p.values[0]), lid: hp41c }; }

TO_DEC '→DEC' = r: '5F' { return { raw: r, rpn: '→DEC', lid: hp42s }; }

TO_DEG '→DEG' = r: '6B' { return { raw: r, rpn: '→DEG', lid: hp42s }; }

TO_HMS '→HMS' = r: '6C' { return { raw: r, rpn: '→HMS', lid: hp42s }; }

TO_HR '→HR' = r: '6D' { return { raw: r, rpn: '→HR', lid: hp42s }; }

TO_LIST '→LIST'  = r: 'A6 FC'  { return { raw: r, rpn: '→LIST', lid: hp42s }; }

TO_OCT '→OCT' = r: '6F' { return { raw: r, rpn: '→OCT', lid: hp42s }; }

TO_POL '→POL' = r: '4F' { return { raw: r, rpn: '→POL', lid: hp42s }; }

TO_RAD '→RAD' = r: '6A' { return { raw: r, rpn: '→RAD', lid: hp42s }; }

TO_REC '→REC' = r: '4E' { return { raw: r, rpn: '→REC', lid: hp42s }; }

TRACE 'TRACE' = r: 'A7 5D' { return { raw: r, rpn: 'TRACE', lid: hp42s }; }

TRANS 'TRANS' = r: 'A6 C9' { return { raw: r, rpn: 'TRANS', lid: hp42s }; }

TYPE_T  'TYPE?' = r: 'A2 76' { return { raw: r, rpn: 'TYPE?', lid: free42 }; }

// UNPICK ARG_NUM9
// UNPICK IND ST L   F2 A4 F4 
// UNPICK IND 99     F2 A4 E3 
// UNPICK 9          F2 A4 09
UNPICK_IND_ST_stk 'UNPICK IND ST L,T,X,Y,Z' = r: 'F2 A4 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'UNPICK IND ST ' + p.values[0], lid: free42 }; }
UNPICK_IND_rr 'UNPICK IND 00-99' = r: 'F2 A4' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'UNPICK IND ' + fmt(p.values[0],2), lid: free42 }; }
UNPICK_n 'UNPICK 0-9' = r: 'F2 A4' _ p: arg_n_0_9 { return { raw: r + ' ' + p.raw, params: p, rpn: 'UNPICK ' + p.values[0], lid: free42 }; }

UP '↑' = r: 'A6 DE' { return { raw: r, rpn: '↑', lid: hp42s }; }

UVEC 'UVEC' = r: 'A6 CD' { return { raw: r, rpn: 'UVEC', lid: hp42s }; }

VARMENU_IND_ST_stk 'VARMENU IND ST L,T,X,Y,Z' = r: 'F2 F8 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'VARMENU IND ST ' + p.values[0], lid: hp42s }; }
VARMENU_IND_rr 'VARMENU IND 00-99' = r: 'F2 F8' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'VARMENU IND ' + fmt(p.values[0],2), lid: hp42s }; }

// VARMNU1 ARG_PRGM
// VARMNU1 IND ST L  F3 A7 31 F4 
// VARMNU1 IND 99    F3 A7 31 E3 
VARMNU1_IND_ST_stk 'VARMNU1 IND ST L,T,X,Y,Z' = r: 'F3 A7 31 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'VARMNU1 IND ST ' + p.values[0], lid: free42 }; }
VARMNU1_IND_rr 'VARMNU1 IND 00-99' = r: 'F3 A7 31' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'VARMNU1 IND ' + fmt(p.values[0],2), lid: free42 }; }


VIEW_IND_ST_stk 'VIEW IND ST L,T,X,Y,Z' = r: '98 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'VIEW IND ST ' + p.values[0], lid: hp41c }; }
VIEW_IND_rr 'VIEW IND 00-99' = r: '98' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'VIEW IND ' + fmt(p.values[0],2), lid: hp41c }; }
VIEW_ST_stk 'VIEW ST L,T,X,Y,Z' = r: '98 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'VIEW ST ' + p.values[0], lid: hp41c }; }
VIEW_rr 'VIEW 00-99' = r: '98' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'VIEW ' + fmt(p.values[0],2), lid: hp41c }; }

WIDTH 'WIDTH' = r: 'A2 72' { return { raw: r, rpn: 'WIDTH', lid: free42 }; }

WMEAN 'WMEAN' = r: 'A0 AC' { return { raw: r, rpn: 'WMEAN', lid: hp42s }; }

WRAP 'WRAP' = r: 'A6 E2' { return { raw: r, rpn: 'WRAP', lid: hp42s }; }

WSIZE 'WSIZE' = r: 'A7 D3' { return { raw: r, rpn: 'WSIZE', lid: free42 }; }

WSIZE_T 'WSIZE?' = r: 'A7 D4' { return { raw: r, rpn: 'WSIZE?', lid: free42 }; }

XOR 'XOR' = r: 'A5 8A' { return { raw: r, rpn: 'XOR', lid: hp42s }; }

XTOA 'XTOA' = r: 'A6 6F' { return { raw: r, rpn: 'XTOA', lid: hp42s }; }

X_EQ_0 'X=0?' = r: '67' { return { raw: r, rpn: 'X=0?', lid: hp41c }; }

X_EQ_Y 'X=Y?' = r: '78' { return { raw: r, rpn: 'X=Y?', lid: hp41c }; }

X_GE_0 'X≥0?' = r: 'A2 5F' { return { raw: r, rpn: 'X≥0?', lid: hp41c }; }

X_GE_Y 'X≥Y?' = r: 'A2 60' { return { raw: r, rpn: 'X≥Y?', lid: hp41c }; }

X_GT_0 'X>0?' = r: '64' { return { raw: r, rpn: 'X>0?', lid: hp41c }; }

X_GT_Y 'X>Y?' = r: '45' { return { raw: r, rpn: 'X>Y?', lid: hp41c }; }

X_LE_0 'X≤0?' = r: '7B' { return { raw: r, rpn: 'X≤0?', lid: hp41c }; }

X_LT_0 'X<0?' = r: '66' { return { raw: r, rpn: 'X<0?', lid: hp41c }; }

X_LE_Y 'X≤Y?' = r: '46' { return { raw: r, rpn: 'X≤Y?', lid: hp41c }; }

X_LT_Y 'X<Y?' = r: '44' { return { raw: r, rpn: 'X<Y?', lid: hp41c }; }

X_NE_0 'X≠0?' = r: '63' { return { raw: r, rpn: 'X≠0?', lid: hp41c }; }

X_NE_Y 'X≠Y?' = r: '79' { return { raw: r, rpn: 'X≠Y?', lid: hp41c }; }

X_SWAP_F 'X<>F' = r: 'A6 6E' { return { raw: r, rpn: 'X<>F', lid: free42 }; }

X_SWAP_IND_ST_stk 'X<> IND ST L,T,X,Y,Z' = r: 'CE F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X<> IND ST ' + p.values[0], lid: hp41c }; }
X_SWAP_IND_rr 'X<> IND 00-99' = r: 'CE' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X<> IND ' + fmt(p.values[0],2), lid: hp41c }; }
X_SWAP_ST_stk 'X<> ST L,T,X,Y,Z' = r: 'CE 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X<> ST ' + p.values[0], lid: hp41c }; }
X_SWAP_rr 'X<> 00-99' = r: 'CE' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X<> ' + fmt(p.values[0],2), lid: hp41c }; }

// X_EQ_NN ARG_VAR
// X=? IND ST L      F3 A7 14 F4
// X=? IND 99        F3 A7 14 E3
// X=? ST L          F3 A7 14 74
// X=? 99            F3 A7 14 63
X_EQ_NN_IND_ST_stk 'X=? IND ST L,T,X,Y,Z' = r: 'F3 A7 14 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X=? IND ST ' + p.values[0], lid: free42 }; }
X_EQ_NN_IND_rr 'X=? IND 00-99' = r: 'F3 A7 14' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X=? IND ' + fmt(p.values[0],2), lid: free42 }; }
X_EQ_NN_ST_stk 'X=? ST L,T,X,Y,Z' = r: 'F3 A7 14 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X=? ST ' + p.values[0], lid: free42 }; }
X_EQ_NN_rr 'X=? 00-99' = r: 'F3 A7 14' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X=? ' + fmt(p.values[0],2), lid: free42 }; }
X_EQ_NN_REGS 'X=? "REGS"' = r: 'F6 A7 04 52 45 47 53' { return { raw: r, rpn: 'X=? "REGS"', lid: free42 }; }

// X_GE_NN ARG_VAR
// X≥? IND ST L      F3 A7 19 F4
// X≥? IND 99        F3 A7 19 E3
// X≥? ST L          F3 A7 19 74
// X≥? 99            F3 A7 19 63
X_GE_NN_IND_ST_stk 'X≥? IND ST L,T,X,Y,Z' = r: 'F3 A7 19 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X≥? IND ST ' + p.values[0], lid: free42 }; }
X_GE_NN_IND_rr 'X≥? IND 00-99' = r: 'F3 A7 19' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X≥? IND ' + fmt(p.values[0],2), lid: free42 }; }
X_GE_NN_ST_stk 'X≥? ST L,T,X,Y,Z' = r: 'F3 A7 19 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X≥? ST ' + p.values[0], lid: free42 }; }
X_GE_NN_rr 'X≥? 00-99' = r: 'F3 A7 19' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X≥? ' + fmt(p.values[0],2), lid: free42 }; }
X_GE_NN_REGS 'X≥? "REGS"' = r: 'F6 A7 21 52 45 47 53' { return { raw: r, rpn: 'X≥? "REGS"', lid: free42 }; }

// X_GT_NN ARG_VAR
// X>? IND ST L      F3 A7 17 F4
// X>? IND 99        F3 A7 17 E3
// X>? ST L          F3 A7 17 74
// X>? 99            F3 A7 17 63
X_GT_NN_IND_ST_stk 'X>? IND ST L,T,X,Y,Z' = r: 'F3 A7 17 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X>? IND ST ' + p.values[0], lid: free42 }; }
X_GT_NN_IND_rr 'X>? IND 00-99' = r: 'F3 A7 17' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X>? IND ' + fmt(p.values[0],2), lid: free42 }; }
X_GT_NN_ST_stk 'X>? ST L,T,X,Y,Z' = r: 'F3 A7 17 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X>? ST ' + p.values[0], lid: free42 }; }
X_GT_NN_rr 'X>? 00-99' = r: 'F3 A7 17' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X>? ' + fmt(p.values[0],2), lid: free42 }; }
X_GT_NN_REGS 'X>? "REGS"' = r: 'F6 A7 07 52 45 47 53' { return { raw: r, rpn: 'X>? "REGS"', lid: free42 }; }

// X_LE_NN ARG_VAR
// X≤? IND ST L      F3 A7 18 F4
// X≤? IND 99        F3 A7 18 E3
// X≤? ST L          F3 A7 18 74
// X≤? 99            F3 A7 18 63
X_LE_NN_IND_ST_stk 'X≤? IND ST L,T,X,Y,Z' = r: 'F3 A7 18 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X≤? IND ST ' + p.values[0], lid: free42 }; }
X_LE_NN_IND_rr 'X≤? IND 00-99' = r: 'F3 A7 18' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X≤? IND ' + fmt(p.values[0],2), lid: free42 }; }
X_LE_NN_ST_stk 'X≤? ST L,T,X,Y,Z' = r: 'F3 A7 18 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X≤? ST ' + p.values[0], lid: free42 }; }
X_LE_NN_rr 'X≤? 00-99' = r: 'F3 A7 18' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X≤? ' + fmt(p.values[0],2), lid: free42 }; }
X_LE_NN_REGS 'X≤? "REGS"' = r: 'F6 A7 20 52 45 47 53' { return { raw: r, rpn: 'X≤? "REGS"', lid: free42 }; }

// X_LT_NN ARG_VAR
// X<? IND ST L      F3 A7 16 F4
// X<? IND 99        F3 A7 16 E3
// X<? ST L          F3 A7 16 74
// X<? 99            F3 A7 16 63
X_LT_NN_IND_ST_stk 'X<? IND ST L,T,X,Y,Z' = r: 'F3 A7 16 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X<? IND ST ' + p.values[0], lid: free42 }; }
X_LT_NN_IND_rr 'X<? IND 00-99' = r: 'F3 A7 16' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X<? IND ' + fmt(p.values[0],2), lid: free42 }; }
X_LT_NN_ST_stk 'X<? ST L,T,X,Y,Z' = r: 'F3 A7 16 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X<? ST ' + p.values[0], lid: free42 }; }
X_LT_NN_rr 'X<? 00-99' = r: 'F3 A7 16' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X<? ' + fmt(p.values[0],2), lid: free42 }; }
X_LT_NN_REGS 'X<? "REGS"' = r: 'F6 A7 06 52 45 47 53' { return { raw: r, rpn: 'X<? "REGS"', lid: free42 }; }

// X_NE_NN ARG_VAR
// X≠? IND ST L      F3 A7 15 F4
// X≠? IND 99        F3 A7 15 E3
// X≠? ST L          F3 A7 15 74
// X≠? 99            F3 A7 15 63
X_NE_NN_IND_ST_stk 'X≠? IND ST L,T,X,Y,Z' = r: 'F3 A7 15 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X≠? IND ST ' + p.values[0], lid: free42 }; }
X_NE_NN_IND_rr 'X≠? IND 00-99' = r: 'F3 A7 15' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X≠? IND ' + fmt(p.values[0],2), lid: free42 }; }
X_NE_NN_ST_stk 'X≠? ST L,T,X,Y,Z' = r: 'F3 A7 15 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'X≠? ST ' + p.values[0], lid: free42 }; }
X_NE_NN_rr 'X≠? 00-99' = r: 'F3 A7 15' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'X≠? ' + fmt(p.values[0],2), lid: free42 }; }
X_NE_NN_REGS 'X≠? "REGS"' = r: 'F6 A7 05 52 45 47 53' { return { raw: r, rpn: 'X≠? "REGS"', lid: free42 }; }

// XASTO ARG_VAR
// XASTO IND ST L    F3 A7 11 F4
// XASTO IND 99      F3 A7 11 E3
// XASTO ST L        F3 A7 11 74
// XASTO 99          F3 A7 11 63
// XASTO "REGS"      F6 A7 01 52 45 47 53
XASTO_IND_ST_stk 'XASTO IND ST L,T,X,Y,Z' = r: 'F3 A7 11 F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'XASTO IND ST ' + p.values[0], lid: free42 }; }
XASTO_IND_rr 'XASTO IND 00-99' = r: 'F3 A7 11' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'XASTO IND ' + fmt(p.values[0],2), lid: free42 }; }
XASTO_stk 'XASTO ST L,T,X,Y,Z' = r: 'F3 A7 11 7' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'XASTO ST ' + p.values[0], lid: free42 }; }
XASTO_rr 'XASTO 00-99' = r: 'F3 A7 11' _ p: arg_r_00_63 { return { raw: r + ' ' + p.raw, params: p, rpn: 'XASTO ' + fmt(p.values[0],2), lid: free42 }; }
XASTO_REGS 'XASTO "REGS"' = r: 'F6 A7 01 52 45 47 53' { return { raw: r + p.raw, rpn: 'XASTO "REGS"', lid: free42 }; }

XEQ_IND_ST_stk 'XEQ IND ST L,T,X,Y,Z' = r: 'AE F' p: arg_stk { return { raw: r + p.raw, params: p, rpn: 'XEQ IND ST ' + p.values[0], lid: hp42s }; }
XEQ_IND_rr 'XEQ IND 00-99' = r: 'AE' _ p: arg_r_80_E3 { return { raw: r + ' ' + p.raw, params: p, rpn: 'XEQ IND ' + fmt(p.values[0],2), lid: hp42s }; }
XEQ_lbl_00_99 'XEQ 00-99' = r: 'E0 00' _ p: arg_l_00_99 { return { raw: r + ' ' + p.raw, params: p, rpn: 'XEQ ' + fmt(p.values[0],2), lid: hp42s }; }
// XEQ A              E0 00 66
// XEQ B              E0 00 67
// XEQ J              E0 00 6F
XEQ_lbl_A_J 'XEQ A-J' = r: 'E0 00' _ p: arg_l_A_J { return { raw: r + ' ' + p.raw, params: p, rpn: 'XEQ ' + fc(p.values[0],37), lid: hp41c }; }
// XEQ a              E0 00 7B -> hex:7B=dec:123 -> 123-97=26 -> 'a'
// XEQ b              E0 00 7C
// XEQ e              E0 00 7F
XEQ_lbl_a_e 'XEQ a-e' = r: 'E0 00' _ p: arg_l_a_e { return { raw: r + ' ' + p.raw, params: p, rpn: 'XEQ ' + fc(p.values[0],26), lid: hp41c }; }

XVIEW 'XVIEW' = r: 'A7 19' { return { raw: r, rpn: 'XVIEW', lid: free42 }; }

YINT 'YINT' = r: 'A0 A6' { return { raw: r, rpn: 'YINT', lid: hp42s }; }

YMD 'YMD' = r: 'A7 D5' { return { raw: r, rpn: 'YMD', lid: free42 }; }

Y_POW_X 'Y↑X' = r: '53' { return { raw: r, rpn: 'Y↑X', lid: hp41c }; }

// 0=? IND "AB"      F4 A7 2A 41 42 -> Fn where n = len+2 !!!
// 0≠? IND "AB"      F4 A7 2B 41 42
// 0<? IND "AB"     F4 A7 2C 41 42
// p.substring(8), substring following '3 A7 2A '
// example: 'F' + '4 A7 2A 41 42' -> '41 42'
// 1 + (p.length-1) / 3, calculates hex length
// example: 'F' + '4 A7 2A 41 42' -> 5 hex numbers
_0_EQ_NN_IND_nam '0=? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 2A' _ s1) /
        $('4' _ 'A7 2A' _ s2) /
        $('5' _ 'A7 2A' _ s3) /
        $('6' _ 'A7 2A' _ s4) /
        $('7' _ 'A7 2A' _ s5) /
        $('8' _ 'A7 2A' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0=? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_NE_NN_IND_nam '0≠? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 2B' _ s1) /
        $('4' _ 'A7 2B' _ s2) /
        $('5' _ 'A7 2B' _ s3) /
        $('6' _ 'A7 2B' _ s4) /
        $('7' _ 'A7 2B' _ s5) /
        $('8' _ 'A7 2B' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0≠? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_LT_NN_IND_nam '0<? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 2C' _ s1) /
        $('4' _ 'A7 2C' _ s2) /
        $('5' _ 'A7 2C' _ s3) /
        $('6' _ 'A7 2C' _ s4) /
        $('7' _ 'A7 2C' _ s5) /
        $('8' _ 'A7 2C' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0<? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_GT_NN_IND_nam '0>? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 2D' _ s1) /
        $('4' _ 'A7 2D' _ s2) /
        $('5' _ 'A7 2D' _ s3) /
        $('6' _ 'A7 2D' _ s4) /
        $('7' _ 'A7 2D' _ s5) /
        $('8' _ 'A7 2D' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0>? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_LE_NN_IND_nam '0≤? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 2E' _ s1) /
        $('4' _ 'A7 2E' _ s2) /
        $('5' _ 'A7 2E' _ s3) /
        $('6' _ 'A7 2E' _ s4) /
        $('7' _ 'A7 2E' _ s5) /
        $('8' _ 'A7 2E' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0≤? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_GE_NN_IND_nam '0≥? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 2F' _ s1) /
        $('4' _ 'A7 2F' _ s2) /
        $('5' _ 'A7 2F' _ s3) /
        $('6' _ 'A7 2F' _ s4) /
        $('7' _ 'A7 2F' _ s5) /
        $('8' _ 'A7 2F' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0≥? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// 0=? "AB"          F4 A7 22 41 42
// 0≠? "AB"          F4 A7 23 41 42
// 0<? "AB"          F4 A7 24 41 42
_0_EQ_NN_nam '0=? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 22' _ s1) /
        $('4' _ 'A7 22' _ s2) /
        $('5' _ 'A7 22' _ s3) /
        $('6' _ 'A7 22' _ s4) /
        $('7' _ 'A7 22' _ s5) /
        $('8' _ 'A7 22' _ s6) /
        $('9' _ 'A7 22' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0=? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_NE_NN_nam '0≠? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 23' _ s1) /
        $('4' _ 'A7 23' _ s2) /
        $('5' _ 'A7 23' _ s3) /
        $('6' _ 'A7 23' _ s4) /
        $('7' _ 'A7 23' _ s5) /
        $('8' _ 'A7 23' _ s6) /
        $('9' _ 'A7 23' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0≠? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_LT_NN_nam '0<? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 24' _ s1) /
        $('4' _ 'A7 24' _ s2) /
        $('5' _ 'A7 24' _ s3) /
        $('6' _ 'A7 24' _ s4) /
        $('7' _ 'A7 24' _ s5) /
        $('8' _ 'A7 24' _ s6) /
        $('9' _ 'A7 24' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0<? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_GT_NN_nam '0>? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 25' _ s1) /
        $('4' _ 'A7 25' _ s2) /
        $('5' _ 'A7 25' _ s3) /
        $('6' _ 'A7 25' _ s4) /
        $('7' _ 'A7 25' _ s5) /
        $('8' _ 'A7 25' _ s6) /
        $('9' _ 'A7 25' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0>? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_LE_NN_nam '0≤? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 26' _ s1) /
        $('4' _ 'A7 26' _ s2) /
        $('5' _ 'A7 26' _ s3) /
        $('6' _ 'A7 26' _ s4) /
        $('7' _ 'A7 26' _ s5) /
        $('8' _ 'A7 26' _ s6) /
        $('9' _ 'A7 26' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0≤? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }
_0_GE_NN_nam '0≥? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 27' _ s1) /
        $('4' _ 'A7 27' _ s2) /
        $('5' _ 'A7 27' _ s3) /
        $('6' _ 'A7 27' _ s4) /
        $('7' _ 'A7 27' _ s5) /
        $('8' _ 'A7 27' _ s6) /
        $('9' _ 'A7 27' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '0≥? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

ARCL_IND_nam 'ARCL IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'BB' _ s1) /
        $('3' _ 'BB' _ s2) /
        $('4' _ 'BB' _ s3) /
        $('5' _ 'BB' _ s4) /
        $('6' _ 'BB' _ s5) /
        $('7' _ 'BB' _ s6)                                                                                                     //   'F'+ p        + 1(missing space after p '00 ') / 3 (chars per hex)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ARCL IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

ARCL_nam 'ARCL "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B3' _ s1) /
        $('3' _ 'B3' _ s2) /
        $('4' _ 'B3' _ s3) /
        $('5' _ 'B3' _ s4) /
        $('6' _ 'B3' _ s5) /
        $('7' _ 'B3' _ s6) /
        $('8' _ 'B3' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ARCL ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

//                ↓key             ↓key = value + 1
// ASSIGN "AA" TO 01 : F4 C0 41 41 00, first row left button
// ASSIGN "BB" TO 12 : F4 C0 42 42 0B, second row right button
// ASSIGN "CC" TO 18 : F4 C0 43 43 11, third row right button
// F5 C0 22 5A 22 11, 5A = "Z", 11 = 17
ASSIGN_nam_TO_key 'ASSIGN "<name[0-7]>" TO 01-18'
    = 'F'
    p: (
        $('2' _ 'C0') /
        $('3' _ 'C0' _ s1) /
        $('4' _ 'C0' _ s2) /
        $('5' _ 'C0' _ s3) /
        $('6' _ 'C0' _ s4) /
        $('7' _ 'C0' _ s5) /
        $('8' _ 'C0' _ s6) /
        $('9' _ 'C0' _ s7)
    )
    _
    k: arg_k_00_11  // hex:00-11 -> dec:0-17, offsett + 1, 1-18, formatted 01-18                                                                                                                            'F'+ p        +' '+ k.raw        + 1(missing space after p '00 ') / 3 (chars per hex)
    { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p + ' ' + k.raw, params: { raw: p + ' ' + k.raw, values: [fs(ps), k] }, rpn: 'ASSIGN ' + q + fs(ps) + q + ' TO ' + fmt(k.values[0],2), len: (1 + p.length + 1 + k.raw.length + 1) / 3, lid: hp42s }; }

ASTO_IND_nam 'ASTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'BA' _ s1) /
        $('3' _ 'BA' _ s2) /
        $('4' _ 'BA' _ s3) /
        $('5' _ 'BA' _ s4) /
        $('6' _ 'BA' _ s5) /
        $('7' _ 'BA' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ASTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

ASTO_nam 'ASTO "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B2' _ s1) /
        $('3' _ 'B2' _ s2) /
        $('4' _ 'B2' _ s3) /
        $('5' _ 'B2' _ s4) /
        $('6' _ 'B2' _ s5) /
        $('7' _ 'B2' _ s6) /
        $('8' _ 'B2' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ASTO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

CF_IND_nam 'CF IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'A9' _ s1) /
        $('3' _ 'A9' _ s2) /
        $('4' _ 'A9' _ s3) /
        $('5' _ 'A9' _ s4) /
        $('6' _ 'A9' _ s5) /
        $('7' _ 'A9' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'CF IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

CLP_nam 'CLP "<name[0-7]>"'
    = 'F'
    p: (
        $('1' _ 'F0') /
        $('2' _ 'F0' _ s1) /
        $('3' _ 'F0' _ s2) /
        $('4' _ 'F0' _ s3) /
        $('5' _ 'F0' _ s4) /
        $('6' _ 'F0' _ s5) /
        $('7' _ 'F0' _ s6) /
        $('8' _ 'F0' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p , values: [fs(ps)] }, rpn: 'CLP ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

CLV_IND_nam 'CLV IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'B8' _ s1) /
        $('3' _ 'B8' _ s2) /
        $('4' _ 'B8' _ s3) /
        $('5' _ 'B8' _ s4) /
        $('6' _ 'B8' _ s5) /
        $('7' _ 'B8' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'CLV IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

CLV_nam 'CLV "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B0' _ s1) /
        $('3' _ 'B0' _ s2) /
        $('4' _ 'B0' _ s3) /
        $('5' _ 'B0' _ s4) /
        $('6' _ 'B0' _ s5) /
        $('7' _ 'B0' _ s6) /
        $('8' _ 'B0' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'CLV ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

DIM_IND_nam 'DIM IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'CC' _ s1) /
        $('3' _ 'CC' _ s2) /
        $('4' _ 'CC' _ s3) /
        $('5' _ 'CC' _ s4) /
        $('6' _ 'CC' _ s5) /
        $('7' _ 'CC' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'DIM IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

DIM_nam 'DIM "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'C4' _ s1) /
        $('3' _ 'C4' _ s2) /
        $('4' _ 'C4' _ s3) /
        $('5' _ 'C4' _ s4) /
        $('6' _ 'C4' _ s5) /
        $('7' _ 'C4' _ s6) /
        $('8' _ 'C4' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'DIM ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// DROPN IND "AB"    F3 F9 41 42
DROPN_IND_nam 'DROPN IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'F9' _ s1) /
        $('3' _ 'F9' _ s2) /
        $('4' _ 'F9' _ s3) /
        $('5' _ 'F9' _ s4) /
        $('6' _ 'F9' _ s5) /
        $('7' _ 'F9' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'DROPN IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

DSE_IND_nam 'DSE IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '9F' _ s1) /
        $('3' _ '9F' _ s2) /
        $('4' _ '9F' _ s3) /
        $('5' _ '9F' _ s4) /
        $('6' _ '9F' _ s5) /
        $('7' _ '9F' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'DSE IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

DSE_nam 'DSE "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '97' _ s1) /
        $('3' _ '97' _ s2) /
        $('4' _ '97' _ s3) /
        $('5' _ '97' _ s4) /
        $('6' _ '97' _ s5) /
        $('7' _ '97' _ s6) /
        $('8' _ '97' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'DSE ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// DUPN IND "AB"     F3 FA 41 42
DUPN_IND_nam 'DUPN IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'FA' _ s1) /
        $('3' _ 'FA' _ s2) /
        $('4' _ 'FA' _ s3) /
        $('5' _ 'FA' _ s4) /
        $('6' _ 'FA' _ s5) /
        $('7' _ 'FA' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'DUPN IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

EDITN_IND_nam 'EDITN IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'CE' _ s1) /
        $('3' _ 'CE' _ s2) /
        $('4' _ 'CE' _ s3) /
        $('5' _ 'CE' _ s4) /
        $('6' _ 'CE' _ s5) /
        $('7' _ 'CE' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'EDITN IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

EDITN_nam 'EDITN "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'C6' _ s1) /
        $('3' _ 'C6' _ s2) /
        $('4' _ 'C6' _ s3) /
        $('5' _ 'C6' _ s4) /
        $('6' _ 'C6' _ s5) /
        $('7' _ 'C6' _ s6) /
        $('8' _ 'C6' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'EDITN ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

ENG_IND_nam 'ENG IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'DE' _ s1) /
        $('3' _ 'DE' _ s2) /
        $('4' _ 'DE' _ s3) /
        $('5' _ 'DE' _ s4) /
        $('6' _ 'DE' _ s5) /
        $('7' _ 'DE' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ENG IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

FIX_IND_nam 'FIX IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'DC' _ s1) /
        $('3' _ 'DC' _ s2) /
        $('4' _ 'DC' _ s3) /
        $('5' _ 'DC' _ s4) /
        $('6' _ 'DC' _ s5) /
        $('7' _ 'DC' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'FIX IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

FC_T_IND_nam 'FC? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'AD' _ s1) /
        $('3' _ 'AD' _ s2) /
        $('4' _ 'AD' _ s3) /
        $('5' _ 'AD' _ s4) /
        $('6' _ 'AD' _ s5) /
        $('7' _ 'AD' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'FC? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

FCC_T_IND_nam 'FC?C IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'AB' _ s1) /
        $('3' _ 'AB' _ s2) /
        $('4' _ 'AB' _ s3) /
        $('5' _ 'AB' _ s4) /
        $('6' _ 'AB' _ s5) /
        $('7' _ 'AB' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'FC?C IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

FS_T_IND_nam 'FS? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'AC' _ s1) /
        $('3' _ 'AC' _ s2) /
        $('4' _ 'AC' _ s3) /
        $('5' _ 'AC' _ s4) /
        $('6' _ 'AC' _ s5) /
        $('7' _ 'AC' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'FS? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

FSC_T_IND_nam 'FS?C IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'AA' _ s1) /
        $('3' _ 'AA' _ s2) /
        $('4' _ 'AA' _ s3) /
        $('5' _ 'AA' _ s4) /
        $('6' _ 'AA' _ s5) /
        $('7' _ 'AA' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'FS?C IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// GETLI IND "AB"    F4 A7 7C 41 42 
GETLI_IND_nam 'GETLI IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 7C' _ s1) /
        $('4' _ 'A7 7C' _ s2) /
        $('5' _ 'A7 7C' _ s3) /
        $('6' _ 'A7 7C' _ s4) /
        $('7' _ 'A7 7C' _ s5) /
        $('8' _ 'A7 7C' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'GETLI IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// GETLI "AB"        F4 A7 74 41 42
GETLI_nam 'GETLI "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 74' _ s1) /
        $('4' _ 'A7 74' _ s2) /
        $('5' _ 'A7 74' _ s3) /
        $('6' _ 'A7 74' _ s4) /
        $('7' _ 'A7 74' _ s5) /
        $('8' _ 'A7 74' _ s6) /
        $('9' _ 'A7 74' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'GETLI ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// GETMI IND "AB"    F4 A7 7A 41 42
GETMI_IND_nam 'GETMI IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 7A' _ s1) /
        $('4' _ 'A7 7A' _ s2) /
        $('5' _ 'A7 7A' _ s3) /
        $('6' _ 'A7 7A' _ s4) /
        $('7' _ 'A7 7A' _ s5) /
        $('8' _ 'A7 7A' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'GETMI IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// GETMI "AB"        F4 A7 72 41 42
GETMI_nam 'GETMI "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 72' _ s1) /
        $('4' _ 'A7 72' _ s2) /
        $('5' _ 'A7 72' _ s3) /
        $('6' _ 'A7 72' _ s4) /
        $('7' _ 'A7 72' _ s5) /
        $('8' _ 'A7 72' _ s6) /
        $('9' _ 'A7 72' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'GETMI ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// GTO IND "AB"       F3 AE 41 42 
GTO_IND_nam 'GTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'AE' _ s1) /
        $('3' _ 'AE' _ s2) /
        $('4' _ 'AE' _ s3) /
        $('5' _ 'AE' _ s4) /
        $('6' _ 'AE' _ s5) /
        $('7' _ 'AE' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'GTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// GTO "AB"    1D F2 41 42
// GTO "ABC"   1D F3 41 42 43
GTO_nam 'GTO "<name[1-7]>"'
    = '1D' _
    p: (
        $('F1' _ s1) /
        $('F2' _ s2) /
        $('F3' _ s3) /
        $('F4' _ s4) /
        $('F5' _ s5) /
        $('F6' _ s6) /
        $('F7' _ s7)                                                                                                                                        // 1D' _ + p        + 1(missing space after p '00 ') / 3 (chars per hex)
    ) { var ps = p.substring(3); var q = sq(ps); return { raw: '1D' + ' ' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'GTO ' + q + fs(ps) + q, len: (3 + p.length + 1) / 3, lid: hp41c }; }

// HEAD IND "AB"     F4 A7 0B 41 42 
HEAD_IND_nam 'HEAD IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 0B' _ s1) /
        $('4' _ 'A7 0B' _ s2) /
        $('5' _ 'A7 0B' _ s3) /
        $('6' _ 'A7 0B' _ s4) /
        $('7' _ 'A7 0B' _ s5) /
        $('8' _ 'A7 0B' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'HEAD IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// HEAD "AB"         F4 A7 03 41 42 
HEAD_nam 'HEAD "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 03' _ s1) /
        $('4' _ 'A7 03' _ s2) /
        $('5' _ 'A7 03' _ s3) /
        $('6' _ 'A7 03' _ s4) /
        $('7' _ 'A7 03' _ s5) /
        $('8' _ 'A7 03' _ s6) /
        $('9' _ 'A7 03' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'HEAD ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

INDEX_IND_nam 'INDEX IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '8F' _ s1) /
        $('3' _ '8F' _ s2) /
        $('4' _ '8F' _ s3) /
        $('5' _ '8F' _ s4) /
        $('6' _ '8F' _ s5) /
        $('7' _ '8F' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'INDEX IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

INDEX_nam 'INDEX "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '87' _ s1) /
        $('3' _ '87' _ s2) /
        $('4' _ '87' _ s3) /
        $('5' _ '87' _ s4) /
        $('6' _ '87' _ s5) /
        $('7' _ '87' _ s6) /
        $('8' _ '87' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'INDEX ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

INTEG_IND_nam 'INTEG IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'BE' _ s1) /
        $('3' _ 'BE' _ s2) /
        $('4' _ 'BE' _ s3) /
        $('5' _ 'BE' _ s4) /
        $('6' _ 'BE' _ s5) /
        $('7' _ 'BE' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'INTEG IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

INTEG_nam 'INTEG "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B6' _ s1) /
        $('3' _ 'B6' _ s2) /
        $('4' _ 'B6' _ s3) /
        $('5' _ 'B6' _ s4) /
        $('6' _ 'B6' _ s5) /
        $('7' _ 'B6' _ s6) /
        $('8' _ 'B6' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'INTEG ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

INPUT_IND_nam 'INPUT IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'CD' _ s1) /
        $('3' _ 'CD' _ s2) /
        $('4' _ 'CD' _ s3) /
        $('5' _ 'CD' _ s4) /
        $('6' _ 'CD' _ s5) /
        $('7' _ 'CD' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'INPUT IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

INPUT_nam 'INPUT "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'C5' _ s1) /
        $('3' _ 'C5' _ s2) /
        $('4' _ 'C5' _ s3) /
        $('5' _ 'C5' _ s4) /
        $('6' _ 'C5' _ s5) /
        $('7' _ 'C5' _ s6) /
        $('8' _ 'C5' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'INPUT ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

ISG_IND_nam 'ISG IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '9E' _ s1) /
        $('3' _ '9E' _ s2) /
        $('4' _ '9E' _ s3) /
        $('5' _ '9E' _ s4) /
        $('6' _ '9E' _ s5) /
        $('7' _ '9E' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ISG IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

ISG_nam 'ISG "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '96' _ s1) /
        $('3' _ '96' _ s2) /
        $('4' _ '96' _ s3) /
        $('5' _ '96' _ s4) /
        $('6' _ '96' _ s5) /
        $('7' _ '96' _ s6) /
        $('8' _ '96' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ISG ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// KEY 01 GTO IND "AAAAAAA" : F9 CB 01 41 41 41 41 41 41 41, max 7 chars
KEY_key_GTO_IND_nam 'KEY 01-18 GTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'CB' _ byte _ s1) /
        $('4' _ 'CB' _ byte _ s2) /
        $('5' _ 'CB' _ byte _ s3) /
        $('6' _ 'CB' _ byte _ s4) /
        $('7' _ 'CB' _ byte _ s5) /
        $('8' _ 'CB' _ byte _ s6)
    ) { var ks = p.substring(5,7); var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fmt(ks,2), fs(ps)] }, rpn: 'KEY ' + fi(ks) + ' GTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

KEY_key_GTO_nam 'KEY 01-18 GTO "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'C3' _ byte _ s1) /
        $('4' _ 'C3' _ byte _ s2) /
        $('5' _ 'C3' _ byte _ s3) /
        $('6' _ 'C3' _ byte _ s4) /
        $('7' _ 'C3' _ byte _ s5) /
        $('8' _ 'C3' _ byte _ s6) /
        $('9' _ 'C3' _ byte _ s7)
    ) { var ks = p.substring(5,7); var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fmt(ks,2), fs(ps)] }, rpn: 'KEY ' + fi(ks) + ' GTO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// KEY 01 XEQ IND "AAAAAAA" : F9 CA 01 41 41 41 41 41 41 41, max 7 chars
KEY_key_XEQ_IND_nam 'KEY 01-18 XEQ IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'CA' _ byte _ s1) /
        $('4' _ 'CA' _ byte _ s2) /
        $('5' _ 'CA' _ byte _ s3) /
        $('6' _ 'CA' _ byte _ s4) /
        $('7' _ 'CA' _ byte _ s5) /
        $('8' _ 'CA' _ byte _ s6)
    ) { var ks = p.substring(5,7); var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p , params: { raw: p , values: [fmt(ks,2), fs(ps)] }, rpn: 'KEY ' + fi(ks) + ' XEQ IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

//KEY 01 XEQ "AAA"     : F5 C2 01 41 41 41
//KEY 02 XEQ "BBB"     : F5 C2 02 42 42 42
//KEY 08 XEQ "AAAAAAA" : F9 C2 08 41 41 41 41 41 41 41, max 7 chars !!!
KEY_key_XEQ_nam 'KEY 01-18 XEQ "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'C2' _ byte _ s1) /
        $('4' _ 'C2' _ byte _ s2) /
        $('5' _ 'C2' _ byte _ s3) /
        $('6' _ 'C2' _ byte _ s4) /
        $('7' _ 'C2' _ byte _ s5) /
        $('8' _ 'C2' _ byte _ s6) /
        $('9' _ 'C2' _ byte _ s7)
    ) { var ks = p.substring(5,7); var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fmt(ks,2), fs(ps)] }, rpn: 'KEY ' + fi(ks) + ' XEQ ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// LASTO IND "AB"    F3 FD 41 42
LASTO_IND_nam 'LASTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'FD' _ s1) /
        $('3' _ 'FD' _ s2) /
        $('4' _ 'FD' _ s3) /
        $('5' _ 'FD' _ s4) /
        $('6' _ 'FD' _ s5) /
        $('7' _ 'FD' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LASTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// LASTO "AB"        F3 F5 41 42
LASTO_nam 'LASTO "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'F5' _ s1) /
        $('3' _ 'F5' _ s2) /
        $('4' _ 'F5' _ s3) /
        $('5' _ 'F5' _ s4) /
        $('6' _ 'F5' _ s5) /
        $('7' _ 'F5' _ s6) /
        $('8' _ 'F5' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LASTO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

LBL_nam 'LBL "<name[1-7]>"'
    // starts with C0 or CA, see below
	= 'C0 00 F'
    p: (
        $('2' _ '00' _ s1) /
        $('3' _ '00' _ s2) /
        $('4' _ '00' _ s3) /
        $('5' _ '00' _ s4) /
        $('6' _ '00' _ s5) /
        $('7' _ '00' _ s6) /
        $('8' _ '00' _ s7)                                                                                             //   'C0 00 F'=7 + p        + 1(missing space after p '00 ') / 3 (chars per hex)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'C0 00 F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LBL ' + q + fs(ps) + q, len: (7 + p.length + 1) / 3, lid: hp41c }; }

// LCLV IND "AB"     F4 A7 79 41 42
LCLV_IND_nam 'LCLV IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 79' _ s1) /
        $('4' _ 'A7 79' _ s2) /
        $('5' _ 'A7 79' _ s3) /
        $('6' _ 'A7 79' _ s4) /
        $('7' _ 'A7 79' _ s5) /
        $('8' _ 'A7 79' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LCLV IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// LCLV "AB"         F4 A7 71 41 42
LCLV_nam 'LCLV "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 71' _ s1) /
        $('4' _ 'A7 71' _ s2) /
        $('5' _ 'A7 71' _ s3) /
        $('6' _ 'A7 71' _ s4) /
        $('7' _ 'A7 71' _ s5) /
        $('8' _ 'A7 71' _ s6) /
        $('9' _ 'A7 71' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LCLV ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

LSTO_IND_nam 'LSTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'CF' _ s1) /
        $('3' _ 'CF' _ s2) /
        $('4' _ 'CF' _ s3) /
        $('5' _ 'CF' _ s4) /
        $('6' _ 'CF' _ s5) /
        $('7' _ 'CF' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LSTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

LSTO_nam 'LSTO "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'C7' _ s1) /
        $('3' _ 'C7' _ s2) /
        $('4' _ 'C7' _ s3) /
        $('5' _ 'C7' _ s4) /
        $('6' _ 'C7' _ s5) /
        $('7' _ 'C7' _ s6) /
        $('8' _ 'C7' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LSTO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// LXASTO IND "AB"   F4 A7 0A 41 42
LXASTO_IND_nam 'LXASTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 0A' _ s1) /
        $('4' _ 'A7 0A' _ s2) /
        $('5' _ 'A7 0A' _ s3) /
        $('6' _ 'A7 0A' _ s4) /
        $('7' _ 'A7 0A' _ s5) /
        $('8' _ 'A7 0A' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LXASTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// LXASTO "AB"       F4 A7 02 41 42
LXASTO_nam 'LXASTO "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 02' _ s1) /
        $('4' _ 'A7 02' _ s2) /
        $('5' _ 'A7 02' _ s3) /
        $('6' _ 'A7 02' _ s4) /
        $('7' _ 'A7 02' _ s5) /
        $('8' _ 'A7 02' _ s6) /
        $('9' _ 'A7 02' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'LXASTO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

MVAR_nam 'MVAR "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '90' _ s1) /
        $('3' _ '90' _ s2) /
        $('4' _ '90' _ s3) /
        $('5' _ '90' _ s4) /
        $('6' _ '90' _ s5) /
        $('7' _ '90' _ s6) /
        $('8' _ '90' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'MVAR ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

PGMINT_IND_nam 'PGMINT IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'BC' _ s1) /
        $('3' _ 'BC' _ s2) /
        $('4' _ 'BC' _ s3) /
        $('5' _ 'BC' _ s4) /
        $('6' _ 'BC' _ s5) /
        $('7' _ 'BC' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PGMINT IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

PGMINT_nam 'PGMINT "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B4' _ s1) /
        $('3' _ 'B4' _ s2) /
        $('4' _ 'B4' _ s3) /
        $('5' _ 'B4' _ s4) /
        $('6' _ 'B4' _ s5) /
        $('7' _ 'B4' _ s6) /
        $('8' _ 'B4' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PGMINT ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

PGMSLV_IND_nam 'PGMSLV IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'BD' _ s1) /
        $('3' _ 'BD' _ s2) /
        $('4' _ 'BD' _ s3) /
        $('5' _ 'BD' _ s4) /
        $('6' _ 'BD' _ s5) /
        $('7' _ 'BD' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PGMSLV IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

PGMSLV_nam 'PGMSLV "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B5' _ s1) /
        $('3' _ 'B5' _ s2) /
        $('4' _ 'B5' _ s3) /
        $('5' _ 'B5' _ s4) /
        $('6' _ 'B5' _ s5) /
        $('7' _ 'B5' _ s6) /
        $('8' _ 'B5' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PGMSLV ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// PGMVAR IND "AB"   F4 A7 48 41 42
PGMVAR_IND_nam 'PGMVAR IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 48' _ s1) /
        $('4' _ 'A7 48' _ s2) /
        $('5' _ 'A7 48' _ s3) /
        $('6' _ 'A7 48' _ s4) /
        $('7' _ 'A7 48' _ s5) /
        $('8' _ 'A7 48' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PGMVAR IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// PGMVAR "AB"       F4 A7 40 41 42
PGMVAR_nam 'PGMVAR "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 40' _ s1) /
        $('4' _ 'A7 40' _ s2) /
        $('5' _ 'A7 40' _ s3) /
        $('6' _ 'A7 40' _ s4) /
        $('7' _ 'A7 40' _ s5) /
        $('8' _ 'A7 40' _ s6) /
        $('9' _ 'A7 40' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PGMVAR ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// PICK IND "AB"     F3 FB 41 42
PICK_IND_nam 'PICK IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'FB' _ s1) /
        $('3' _ 'FB' _ s2) /
        $('4' _ 'FB' _ s3) /
        $('5' _ 'FB' _ s4) /
        $('6' _ 'FB' _ s5) /
        $('7' _ 'FB' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PICK IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

PRV_IND_nam 'PRV IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'B9' _ s1) /
        $('3' _ 'B9' _ s2) /
        $('4' _ 'B9' _ s3) /
        $('5' _ 'B9' _ s4) /
        $('6' _ 'B9' _ s5) /
        $('7' _ 'B9' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PRV IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

PRV_nam 'PRV "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B1' _ s1) /
        $('3' _ 'B1' _ s2) /
        $('4' _ 'B1' _ s3) /
        $('5' _ 'B1' _ s4) /
        $('6' _ 'B1' _ s5) /
        $('7' _ 'B1' _ s6) /
        $('8' _ 'B1' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PRV ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// PUTLI IND "AB"    F4 A7 7D 41 42
PUTLI_IND_nam 'PUTLI IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 7D' _ s1) /
        $('4' _ 'A7 7D' _ s2) /
        $('5' _ 'A7 7D' _ s3) /
        $('6' _ 'A7 7D' _ s4) /
        $('7' _ 'A7 7D' _ s5) /
        $('8' _ 'A7 7D' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PUTLI IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// PUTLI "AB"        F4 A7 75 41 42
PUTLI_nam 'PUTLI "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 75' _ s1) /
        $('4' _ 'A7 75' _ s2) /
        $('5' _ 'A7 75' _ s3) /
        $('6' _ 'A7 75' _ s4) /
        $('7' _ 'A7 75' _ s5) /
        $('8' _ 'A7 75' _ s6) /
        $('9' _ 'A7 75' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PUTLI ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// PUTMI IND "AB"    F4 A7 7B 41 42 
PUTMI_IND_nam 'PUTMI IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 7B' _ s1) /
        $('4' _ 'A7 7B' _ s2) /
        $('5' _ 'A7 7B' _ s3) /
        $('6' _ 'A7 7B' _ s4) /
        $('7' _ 'A7 7B' _ s5) /
        $('8' _ 'A7 7B' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PUTMI IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// PUTMI "AB"        F4 A7 73 41 42
PUTMI_nam 'PUTMI "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 73' _ s1) /
        $('4' _ 'A7 73' _ s2) /
        $('5' _ 'A7 73' _ s3) /
        $('6' _ 'A7 73' _ s4) /
        $('7' _ 'A7 73' _ s5) /
        $('8' _ 'A7 73' _ s6) /
        $('9' _ 'A7 73' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'PUTMI ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

RCL_IND_nam 'RCL IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '99' _ s1) /
        $('3' _ '99' _ s2) /
        $('4' _ '99' _ s3) /
        $('5' _ '99' _ s4) /
        $('6' _ '99' _ s5) /
        $('7' _ '99' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

RCL_nam 'RCL "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '91' _ s1) /
        $('3' _ '91' _ s2) /
        $('4' _ '91' _ s3) /
        $('5' _ '91' _ s4) /
        $('6' _ '91' _ s5) /
        $('7' _ '91' _ s6) /
        $('8' _ '91' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

RCL_ADD_IND_nam 'RCL+ IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '9A' _ s1) /
        $('3' _ '9A' _ s2) /
        $('4' _ '9A' _ s3) /
        $('5' _ '9A' _ s4) /
        $('6' _ '9A' _ s5) /
        $('7' _ '9A' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL+ IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_ADD_nam 'RCL+ "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '92' _ s1) /
        $('3' _ '92' _ s2) /
        $('4' _ '92' _ s3) /
        $('5' _ '92' _ s4) /
        $('6' _ '92' _ s5) /
        $('7' _ '92' _ s6) /
        $('8' _ '92' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL+ ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_DIV_IND_nam 'RCL÷ IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '9D' _ s1) /
        $('3' _ '9D' _ s2) /
        $('4' _ '9D' _ s3) /
        $('5' _ '9D' _ s4) /
        $('6' _ '9D' _ s5) /
        $('7' _ '9D' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL÷ IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_DIV_nam 'RCL÷ "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '95' _ s1) /
        $('3' _ '95' _ s2) /
        $('4' _ '95' _ s3) /
        $('5' _ '95' _ s4) /
        $('6' _ '95' _ s5) /
        $('7' _ '95' _ s6) /
        $('8' _ '95' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL÷ ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_MUL_IND_nam 'RCL× IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '9C' _ s1) /
        $('3' _ '9C' _ s2) /
        $('4' _ '9C' _ s3) /
        $('5' _ '9C' _ s4) /
        $('6' _ '9C' _ s5) /
        $('7' _ '9C' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL× IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_MUL_nam 'RCL× "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '94' _ s1) /
        $('3' _ '94' _ s2) /
        $('4' _ '94' _ s3) /
        $('5' _ '94' _ s4) /
        $('6' _ '94' _ s5) /
        $('7' _ '94' _ s6) /
        $('8' _ '94' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL× ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_SUB_IND_nam 'RCL- IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '9B' _ s1) /
        $('3' _ '9B' _ s2) /
        $('4' _ '9B' _ s3) /
        $('5' _ '9B' _ s4) /
        $('6' _ '9B' _ s5) /
        $('7' _ '9B' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL- IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

RCL_SUB_nam 'RCL- "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '93' _ s1) /
        $('3' _ '93' _ s2) /
        $('4' _ '93' _ s3) /
        $('5' _ '93' _ s4) /
        $('6' _ '93' _ s5) /
        $('7' _ '93' _ s6) /
        $('8' _ '93' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RCL- ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// R↓N IND "AB"      F3 FE 41 42 
RDNN_IND_nam 'R↓N IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'FE' _ s1) /
        $('3' _ 'FE' _ s2) /
        $('4' _ 'FE' _ s3) /
        $('5' _ 'FE' _ s4) /
        $('6' _ 'FE' _ s5) /
        $('7' _ 'FE' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'R↓N IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// RTNERR IND "AB"    F3 E4 41 42
RTNERR_IND_nam 'RTNERR IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'E4' _ s1) /
        $('3' _ 'E4' _ s2) /
        $('4' _ 'E4' _ s3) /
        $('5' _ 'E4' _ s4) /
        $('6' _ 'E4' _ s5) /
        $('7' _ 'E4' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'RTNERR IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// R↑N IND "AB"      F3 FF 41 42 
RUPN_IND_nam 'R↑N IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'FF' _ s1) /
        $('3' _ 'FF' _ s2) /
        $('4' _ 'FF' _ s3) /
        $('5' _ 'FF' _ s4) /
        $('6' _ 'FF' _ s5) /
        $('7' _ 'FF' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'R↑N IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

SCI_IND_nam 'SCI IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'DD' _ s1) /
        $('3' _ 'DD' _ s2) /
        $('4' _ 'DD' _ s3) /
        $('5' _ 'DD' _ s4) /
        $('6' _ 'DD' _ s5) /
        $('7' _ 'DD' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'SCI IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

SF_IND_nam 'SF IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'A8' _ s1) /
        $('3' _ 'A8' _ s2) /
        $('4' _ 'A8' _ s3) /
        $('5' _ 'A8' _ s4) /
        $('6' _ 'A8' _ s5) /
        $('7' _ 'A8' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'SF IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

SIGMAREG_IND_nam 'ΣREG IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'DB' _ s1) /
        $('3' _ 'DB' _ s2) /
        $('4' _ 'DB' _ s3) /
        $('5' _ 'DB' _ s4) /
        $('6' _ 'DB' _ s5) /
        $('7' _ 'DB' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'ΣREG IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

//SOLVE IND "ABCDEFG" : F8 BF 41 42 43 44 45 46 47, max 7 chars !!!
SOLVE_IND_nam 'SOLVE IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'BF' _ s1) /
        $('3' _ 'BF' _ s2) /
        $('4' _ 'BF' _ s3) /
        $('5' _ 'BF' _ s4) /
        $('6' _ 'BF' _ s5) /
        $('7' _ 'BF' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'SOLVE IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

SOLVE_nam 'SOLVE "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'B7' _ s1) /
        $('3' _ 'B7' _ s2) /
        $('4' _ 'B7' _ s3) /
        $('5' _ 'B7' _ s4) /
        $('6' _ 'B7' _ s5) /
        $('7' _ 'B7' _ s6) /
        $('8' _ 'B7' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'SOLVE ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_IND_nam 'STO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '89' _ s1) /
        $('3' _ '89' _ s2) /
        $('4' _ '89' _ s3) /
        $('5' _ '89' _ s4) /
        $('6' _ '89' _ s5) /
        $('7' _ '89' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

STO_nam 'STO "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '81' _ s1) /
        $('3' _ '81' _ s2) /
        $('4' _ '81' _ s3) /
        $('5' _ '81' _ s4) /
        $('6' _ '81' _ s5) /
        $('7' _ '81' _ s6) /
        $('8' _ '81' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

STO_ADD_IND_nam 'STO+ IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '8A' _ s1) /
        $('3' _ '8A' _ s2) /
        $('4' _ '8A' _ s3) /
        $('5' _ '8A' _ s4) /
        $('6' _ '8A' _ s5) /
        $('7' _ '8A' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO+ IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_ADD_nam 'STO+ "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '82' _ s1) /
        $('3' _ '82' _ s2) /
        $('4' _ '82' _ s3) /
        $('5' _ '82' _ s4) /
        $('6' _ '82' _ s5) /
        $('7' _ '82' _ s6) /
        $('8' _ '82' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO+ ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_DIV_IND_nam 'STO÷ IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '8D' _ s1) /
        $('3' _ '8D' _ s2) /
        $('4' _ '8D' _ s3) /
        $('5' _ '8D' _ s4) /
        $('6' _ '8D' _ s5) /
        $('7' _ '8D' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO÷ IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_DIV_nam 'STO÷ "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '85' _ s1) /
        $('3' _ '85' _ s2) /
        $('4' _ '85' _ s3) /
        $('5' _ '85' _ s4) /
        $('6' _ '85' _ s5) /
        $('7' _ '85' _ s6) /
        $('8' _ '85' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO÷ ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_MUL_IND_nam 'STO× IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '8C' _ s1) /
        $('3' _ '8C' _ s2) /
        $('4' _ '8C' _ s3) /
        $('5' _ '8C' _ s4) /
        $('6' _ '8C' _ s5) /
        $('7' _ '8C' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO× IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_MUL_nam 'STO× "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '84' _ s1) /
        $('3' _ '84' _ s2) /
        $('4' _ '84' _ s3) /
        $('5' _ '84' _ s4) /
        $('6' _ '84' _ s5) /
        $('7' _ '84' _ s6) /
        $('8' _ '84' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO× ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_SUB_IND_nam 'STO- IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '8B' _ s1) /
        $('3' _ '8B' _ s2) /
        $('4' _ '8B' _ s3) /
        $('5' _ '8B' _ s4) /
        $('6' _ '8B' _ s5) /
        $('7' _ '8B' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO- IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

STO_SUB_nam 'STO- "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '83' _ s1) /
        $('3' _ '83' _ s2) /
        $('4' _ '83' _ s3) /
        $('5' _ '83' _ s4) /
        $('6' _ '83' _ s5) /
        $('7' _ '83' _ s6) /
        $('8' _ '83' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'STO- ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

//  "ABC"              F4 3A 41 42 43 free42
//                     F3 41 42 43    DM42-Web
// ">">"             : F3 3E 22 3E              minehunt.raw: 3E=62, 22="
// "ABCDE"           : F5 41 42 43 44 45
// "ABCDEFGHIJKLMNO" : FF 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F, max 15 chars
// exclude string beginning with '80', see VIEW "<str>"
STR '"<text[0-15]>"'
    = 'F'
    p: (
        $('1' _ !('80') s1) /
        $('2' _ !('80') s2) /
        $('3' _ !('80') s3) /
        $('4' _ !('80') s4) /
        $('5' _ !('80') s5) /
        $('6' _ !('80') s6) /
        $('7' _ !('80') s7) /
        $('8' _ !('80') s8) /
        $('9' _ !('80') s9) /
        $('A' _ !('80') sA) /
        $('B' _ !('80') sB) /
        $('C' _ !('80') sC) /
        $('D' _ !('80') sD) /
        $('E' _ !('80') sE) /
        $('F' _ !('80') sF)                                                                                                                       //    'F'+ p        + 1 (missing space after hex)
    ) { var ps = p.substring(2); var q = sq(ps); return { raw: 'F' + p, params: { raw: [p], values: [fs(ps)]}, rpn: '' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// ⊢"ABC"              F4 7F 41 42 43 free42
//                     F4 7F 41 42 43 DM42-Web
// ⊢" with [orange][ALPHA][ENTER] in program mode, see hp42s-om-en.pdf, page 140
// F2 7F 65               p.length=2    1*2 + 0
// F6 7F 65 AA BB CC DD   p.length=14   5*2 + 4
// ⊢"ABCDEFGHIJKLMN" : FF 7F 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E, max 14 chars
// see although STR
// { key: 127, value: '⊦' } -> hex:7F=dec:127
T_STR '⊢"<text[0-14]>"'
    = 'F'
    p: (
        $('1' _ '7F') /
        $('2' _ '7F' _ s1) /
        $('3' _ '7F' _ s2) /
        $('4' _ '7F' _ s3) /
        $('5' _ '7F' _ s4) /
        $('6' _ '7F' _ s5) /
        $('7' _ '7F' _ s6) /
        $('8' _ '7F' _ s7) /
        $('9' _ '7F' _ s8) /
        $('A' _ '7F' _ s9) /
        $('B' _ '7F' _ sA) /
        $('C' _ '7F' _ sB) /
        $('D' _ '7F' _ sC) /
        $('E' _ '7F' _ sD) /
        $('F' _ '7F' _ sE)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: '⊢' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

TONE_IND_nam 'TONE IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'DF' _ s1) /
        $('3' _ 'DF' _ s2) /
        $('4' _ 'DF' _ s3) /
        $('5' _ 'DF' _ s4) /
        $('6' _ 'DF' _ s5) /
        $('7' _ 'DF' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'TONE IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// UNPICK IND "AB"   F3 FC 41 42 
UNPICK_IND_nam 'UNPICK IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'FC' _ s1) /
        $('3' _ 'FC' _ s2) /
        $('4' _ 'FC' _ s3) /
        $('5' _ 'FC' _ s4) /
        $('6' _ 'FC' _ s5) /
        $('7' _ 'FC' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'UNPICK IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

VARMENU_IND_nam 'VARMENU IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'C9' _ s1) /
        $('3' _ 'C9' _ s2) /
        $('4' _ 'C9' _ s3) /
        $('5' _ 'C9' _ s4) /
        $('6' _ 'C9' _ s5) /
        $('7' _ 'C9' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'VARMENU IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

//VARMENU "ABCDEFG" : F8 C1 41 42 43 44 45 46 47, max 7 chars !!!
VARMENU_nam 'VARMENU "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ 'C1' _ s1) /
        $('3' _ 'C1' _ s2) /
        $('4' _ 'C1' _ s3) /
        $('5' _ 'C1' _ s4) /
        $('6' _ 'C1' _ s5) /
        $('7' _ 'C1' _ s6) /
        $('8' _ 'C1' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'VARMENU ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp42s }; }

// VARMNU1 IND "AB"  F4 A7 4A 41 42
VARMNU1_IND_nam 'VARMNU1 IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 4A' _ s1) /
        $('4' _ 'A7 4A' _ s2) /
        $('5' _ 'A7 4A' _ s3) /
        $('6' _ 'A7 4A' _ s4) /
        $('7' _ 'A7 4A' _ s5) /
        $('8' _ 'A7 4A' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'VARMNU1 IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// VARMNU1 "AB"      F4 A7 42 41 42
VARMNU1_nam 'VARMNU1 "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 42' _ s1) /
        $('4' _ 'A7 42' _ s2) /
        $('5' _ 'A7 42' _ s3) /
        $('6' _ 'A7 42' _ s4) /
        $('7' _ 'A7 42' _ s5) /
        $('8' _ 'A7 42' _ s6) /
        $('9' _ 'A7 42' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'VARMNU1 ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }


VIEW_IND_nam 'VIEW IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '88' _ s1) /
        $('3' _ '88' _ s2) /
        $('4' _ '88' _ s3) /
        $('5' _ '88' _ s4) /
        $('6' _ '88' _ s5) /
        $('7' _ '88' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'VIEW IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

VIEW_nam 'VIEW "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '80' _ s1) /
        $('3' _ '80' _ s2) /
        $('4' _ '80' _ s3) /
        $('5' _ '80' _ s4) /
        $('6' _ '80' _ s5) /
        $('7' _ '80' _ s6) /
        $('8' _ '80' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'VIEW ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// XASTO IND "AB"    F4 A7 09 41 42 
XASTO_IND_nam 'XASTO IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 09' _ s1) /
        $('4' _ 'A7 09' _ s2) /
        $('5' _ 'A7 09' _ s3) /
        $('6' _ 'A7 09' _ s4) /
        $('7' _ 'A7 09' _ s5) /
        $('8' _ 'A7 09' _ s6)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'XASTO IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// XASTO "AB"        F4 A7 01 41 42 
XASTO_nam 'XASTO "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 01' _ s1) /
        $('4' _ 'A7 01' _ s2) /
        $('5' _ 'A7 01' _ s3) /
        $('6' _ 'A7 01' _ s4) /
        $('7' _ 'A7 01' _ s5) /
        $('8' _ 'A7 01' _ s6) /
        $('9' _ 'A7 01' _ s7)
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'XASTO ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

XEQ_IND_nam 'XEQ IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ 'AF' _ s1) /
        $('3' _ 'AF' _ s2) /
        $('4' _ 'AF' _ s3) /
        $('5' _ 'AF' _ s4) /
        $('6' _ 'AF' _ s5) /
        $('7' _ 'AF' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'XEQ IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

//XEQ_lbl 'XEQ lbl' = r: '1E F' p: arg_lbl00_14 { return { raw: r + p.raw, params: p, rpn: 'XEQ ' + fmt(p.values[0],2), lid: hp42s }; }
// TODO: check lbls
XEQ_nam 'XEQ "<name[1-7]>"'
    = '1E' _
    p: (
        $('F1' _ s1) /
        $('F2' _ s2) /
        $('F3' _ s3) /
        $('F4' _ s4) /
        $('F5' _ s5) /
        $('F6' _ s6) /
        $('F7' _ s7)                                                                                                       // ('1E' _)=3 + p        + 1 (missing space after hex)
    ) { var ps = p.substring(3); var q = sq(ps); return { raw: '1E' + ' ' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'XEQ ' + q + fs(ps) + q, len: (3 + p.length + 1) / 3, lid: hp41c }; }

// X=? IND "AB"      F4 A7 0C 41 42
X_EQ_NN_IND_nam 'X=? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 0C' _ s1) /
        $('4' _ 'A7 0C' _ s2) /
        $('5' _ 'A7 0C' _ s3) /
        $('6' _ 'A7 0C' _ s4) /
        $('7' _ 'A7 0C' _ s5) /
        $('8' _ 'A7 0C' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X=? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X=? "AB"          F4 A7 04 41 42
X_EQ_NN_nam 'X=? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 04' _ s1) /
        $('4' _ 'A7 04' _ s2) /
        $('5' _ 'A7 04' _ s3) /
        $('6' _ 'A7 04' _ s4) /
        $('7' _ 'A7 04' _ s5) /
        $('8' _ 'A7 04' _ s6) /
        $('9' _ 'A7 04' _ s7)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X=? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X≥? IND "AB"      F4 A7 29 41 42
X_GE_NN_IND_nam 'X≥? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 29' _ s1) /
        $('4' _ 'A7 29' _ s2) /
        $('5' _ 'A7 29' _ s3) /
        $('6' _ 'A7 29' _ s4) /
        $('7' _ 'A7 29' _ s5) /
        $('8' _ 'A7 29' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X≥? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X≥? "AB"          F4 A7 21 41 42 
X_GE_NN_nam 'X≥? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 21' _ s1) /
        $('4' _ 'A7 21' _ s2) /
        $('5' _ 'A7 21' _ s3) /
        $('6' _ 'A7 21' _ s4) /
        $('7' _ 'A7 21' _ s5) /
        $('8' _ 'A7 21' _ s6) /
        $('9' _ 'A7 21' _ s7)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X≥? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X>? IND "AB"      F4 A7 0F 41 42
X_GT_NN_IND_nam 'X>? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 0F' _ s1) /
        $('4' _ 'A7 0F' _ s2) /
        $('5' _ 'A7 0F' _ s3) /
        $('6' _ 'A7 0F' _ s4) /
        $('7' _ 'A7 0F' _ s5) /
        $('8' _ 'A7 0F' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X>? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X>? "AB"          F4 A7 07 41 42
X_GT_NN_nam 'X>? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 07' _ s1) /
        $('4' _ 'A7 07' _ s2) /
        $('5' _ 'A7 07' _ s3) /
        $('6' _ 'A7 07' _ s4) /
        $('7' _ 'A7 07' _ s5) /
        $('8' _ 'A7 07' _ s6) /
        $('9' _ 'A7 07' _ s7)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X>? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X≤? IND "AB"      F4 A7 28 41 42
X_LE_NN_IND_nam 'X≤? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 28' _ s1) /
        $('4' _ 'A7 28' _ s2) /
        $('5' _ 'A7 28' _ s3) /
        $('6' _ 'A7 28' _ s4) /
        $('7' _ 'A7 28' _ s5) /
        $('8' _ 'A7 28' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X≤? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X≤? "AB"          F4 A7 20 41 42
X_LE_NN_nam 'X≤? "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 20' _ s1) /
        $('4' _ 'A7 20' _ s2) /
        $('5' _ 'A7 20' _ s3) /
        $('6' _ 'A7 20' _ s4) /
        $('7' _ 'A7 20' _ s5) /
        $('8' _ 'A7 20' _ s6) /
        $('9' _ 'A7 20' _ s7)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X≤? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X<? IND "AB"      F4 A7 0E 41 42
X_LT_NN_IND_nam 'X<? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 0E' _ s1) /
        $('4' _ 'A7 0E' _ s2) /
        $('5' _ 'A7 0E' _ s3) /
        $('6' _ 'A7 0E' _ s4) /
        $('7' _ 'A7 0E' _ s5) /
        $('8' _ 'A7 0E' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X<? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X<? "AB"          F4 A7 06 41 42 
X_LT_NN_nam 'X<? IND "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 06' _ s1) /
        $('4' _ 'A7 06' _ s2) /
        $('5' _ 'A7 06' _ s3) /
        $('6' _ 'A7 06' _ s4) /
        $('7' _ 'A7 06' _ s5) /
        $('8' _ 'A7 06' _ s6) /
        $('9' _ 'A7 06' _ s7)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X<? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X≠? IND "AB"      F4 A7 0D 41 42
X_NE_NN_IND_nam 'X≠? IND "<name[1-6]>"'
    = 'F'
    p: (
        $('3' _ 'A7 0D' _ s1) /
        $('4' _ 'A7 0D' _ s2) /
        $('5' _ 'A7 0D' _ s3) /
        $('6' _ 'A7 0D' _ s4) /
        $('7' _ 'A7 0D' _ s5) /
        $('8' _ 'A7 0D' _ s6)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X≠? IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

// X≠? "AB"          F4 A7 05 41 42
X_NE_NN_nam 'X≠? IND "<name[1-7]>"'
    = 'F'
    p: (
        $('3' _ 'A7 05' _ s1) /
        $('4' _ 'A7 05' _ s2) /
        $('5' _ 'A7 05' _ s3) /
        $('6' _ 'A7 05' _ s4) /
        $('7' _ 'A7 05' _ s5) /
        $('8' _ 'A7 05' _ s6) /
        $('9' _ 'A7 05' _ s7)                             
    ) { var ps = p.substring(8); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X≠? ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: free42 }; }

X_SWAP_IND_nam 'X<> IND "<name[1-6]>"'
    = 'F'
    p: (
        $('2' _ '8E' _ s1) /
        $('3' _ '8E' _ s2) /
        $('4' _ '8E' _ s3) /
        $('5' _ '8E' _ s4) /
        $('6' _ '8E' _ s5) /
        $('7' _ '8E' _ s6)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X<> IND ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

X_SWAP_nam 'X<> "<name[1-7]>"'
    = 'F'
    p: (
        $('2' _ '86' _ s1) /
        $('3' _ '86' _ s2) /
        $('4' _ '86' _ s3) /
        $('5' _ '86' _ s4) /
        $('6' _ '86' _ s5) /
        $('7' _ '86' _ s6) /
        $('8' _ '86' _ s7)
    ) { var ps = p.substring(5); var q = sq(ps); return { raw: 'F' + p, params: { raw: p, values: [fs(ps)] }, rpn: 'X<> ' + q + fs(ps) + q, len: (1 + p.length + 1) / 3, lid: hp41c }; }

// XSTR ARG_XSTR
//                                Fn A7 41  .....
// XSTR "AB"                      F4 A7 41  41 42                                                                        -> < 13 chars
// XSTR "ABCDEFGHIJKLM"           FF A7 41  41 42 43 44 45 46 47 48 49 4A 4B 4C 4D                                       -> ≤ 13 chars
XSTR_str_13 'XSTR "<name[0-13]>"'
    = 'F'
    p: (
        $('2' _ 'A7 41' s0) /	
        $('3' _ 'A7 41' _ s1) /
        $('4' _ 'A7 41' _ s2) /
        $('5' _ 'A7 41' _ s3) /
        $('6' _ 'A7 41' _ s4) /
        $('7' _ 'A7 41' _ s5) /
        $('8' _ 'A7 41' _ s6) /
        $('9' _ 'A7 41' _ s7) /
        $('A' _ 'A7 41' _ s8) /
        $('B' _ 'A7 41' _ s9) /
        $('C' _ 'A7 41' _ sA) /
        $('D' _ 'A7 41' _ sB) /
        $('E' _ 'A7 41' _ sC) /
        $('F' _ 'A7 41' _ sD) 
    ) { 
        var ps = p.substring(8); 
        var q = sq(ps); 
        return { 
            raw: 'F' + p, 
            params: { raw: p, values: [fs(ps)] }, 
            rpn: 'XSTR ' + q + fs(ps) + q, 
            len: (1 + p.length + 1) / 3, lid: free42 
        }; 
    }


// XSTR "ABCDEFGHIJKLMN"          FF A7 49  41 42 43 44 45 46 47 48 49 4A 4B 4C 4D  F3 A7 41  4E                         ->   14 chars
// XSTR "ABCDEFGHIJKLMNOPQRSTUV"  FF A7 49  41 42 43 44 45 46 47 48 49 4A 4B 4C 4D  FB A7 41  4E 4F 50 51 52 53 54 55 56 -> ≤ 22 chars
XSTR_str_22 'XSTR "<name[14-22]>"'
    = 'F'
    p1: (
        $('F' _ 'A7 49' _ sD)
    ) 
    _
    'F'
    p2: (
        $('3' _ 'A7 41' _ s1) /
        $('4' _ 'A7 41' _ s2) /
        $('5' _ 'A7 41' _ s3) /
        $('6' _ 'A7 41' _ s4) /
        $('7' _ 'A7 41' _ s5) /
        $('8' _ 'A7 41' _ s6) /
        $('9' _ 'A7 41' _ s7) /
        $('A' _ 'A7 41' _ s8) /
        $('B' _ 'A7 41' _ s9)
    )                                                                                                                                                                                                                                         //        'F'+ p1        +' '+'F'+ p2        + 1 (missing space after hex)
    { 
        var ps1 = p1.substring(8); 
        var ps2 = p2.substring(8); 
        var q = sq(ps1 + ' ' + ps2); 
        return { 
            raw: 'F' + p1 + ' ' + 'F' + p2, 
            params: { raw: 'F' + p1 + ' ' + 'F' + p2, values: [fs(ps1), fs(ps2)] }, 
            rpn: 'XSTR ' + q + fs(ps1) + fs(ps2) + q, 
            len: (1 + p1.length + 1 + 1 + p2.length + 1) / 3, lid: free42 
        }; 
    }