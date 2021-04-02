# How to add new free42 commands

## Get command infos

- Use free42 calculator.
- Get description from command, see [free42 Documentation](https://thomasokken.com/free42/#doc)
- Get hex code from example program with only the new command in it.

## Search in project history

Command highlighting in project history

- Open [project history](https://thomasokken.com/free42/history.html)
-  Search with regex: `(ACCEL|LOCAT|HEADING|ADATE|ATIME24|ATIME|CLK12|CLK24|DATE|DATE\+|DDAYS|DMY|DOW|MDY|TIME|YMD|BSIGNED|BWRAP|BRESET|LSTO .+|ANUM|FUNC|GETKEY1|MVARCAT|RCLFLAG|STOFLAG|RTNERR|RTNNO|RTNYES|x<>F|NOP)`
-  Note upper and lower case

## Example

Example: RTNERR 1
```
LBL A
RTNERR 1
END
```

Exported RAW:

```
  Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
00000000: CF 66 F2 A0 01 C0 00 0D 
```

Known hex codes:
- `CF 66`: LBL A
- `C0 00 0D `: END

__-> RTNERR 1 : F2 A0 01__
## Insert new command

- Try to keep insertion in alpha-numeric order for better understanding
- Edit snippets `free42snippets.json`, copy/paste description
- Edit TextMate syntax `free42tmlanguage.json`
- Edit array `Decoder42.arr_rawMap`
- Edit array `Encoder42.arr_rpnMap`
- Edit method `Encoder42.getLanguageIdFromCode()`
- Edit method `RawParser.checkLanguageId()`

# free42 Extension Commands

```
ANUM         : A6 42
FMA          : A7 DA
GETKEY1      : A7 D9
NOP          : F0
PGMMENU      : A7 E8
RCLFLAG      : A6 60
RTNERR 1     : F2 A0 01
RTNERR 2     : F2 A0 02
RTNERR 8     : F2 A0 08
RTNNO        : A7 DF
RTNYES       : A7 DE
STOFLAG      : A6 6D
STRACE       : A7 E1
X<>F         : A6 6E
```

## `X=?` Examples

### Encode/Decode `X=?`

```
X=? "A"       : F3 A7 04 41 83      /X=\? (".{1,14}")/        "Fn A7 04", params: "naml+2"
X=? "ABC"     : F5 A7 04 41 42 43   /X=\? (".{1,14}")/        "Fn A7 04", params: "nam"
X=? IND "A"   : F3 A7 0C 41         /X=\? IND (".{1,14}")/    "Fn A7 0C", params: "nam"
X=? IND "ABC" : F5 A7 0C 41 42 43   /X=\? IND (".{1,14}")/    "Fn A7 0C", params: "nam"

X=? ST L      : F3 A7 14 74         /X=\? ST ([XYZLT])/       "F3 A7 14 7t", params: "stk"
X=? ST X      : F3 A7 14 73         /X=\? ST ([XYZLT])/       "F3 A7 14 7t", params: "stk"
X=? ST Y      : F3 A7 14 72         /X=\? ST ([XYZLT])/       "F3 A7 14 7t", params: "stk"
X=? ST Z      : F3 A7 14 71         /X=\? ST ([XYZLT])/       "F3 A7 14 7t", params: "stk"
X=? ST T      : F3 A7 14 70         /X=\? ST ([XYZLT])/       "F3 A7 14 7t", params: "stk"
X=? IND ST L  : F3 A7 14 F4         /X=\? IND ST ([XYZLT])/   "F3 A7 14 Ft", params: "stk"
X=? IND ST X  : F3 A7 14 F3         /X=\? IND ST ([XYZLT])/   "F3 A7 14 Ft", params: "stk"
X=? IND ST Y  : F3 A7 14 F2         /X=\? IND ST ([XYZLT])/   "F3 A7 14 Ft", params: "stk"
X=? IND ST Y  : F3 A7 14 F1         /X=\? IND ST ([XYZLT])/   "F3 A7 14 Ft", params: "stk"

X=? 00        : F3 A7 14 00         /X=\? ([0-9][0-9])/       "F3 A7 14 rr", params: "reg"      //00-99
X=? 01        : F3 A7 14 01         /X=\? ([0-9][0-9])/       "F3 A7 14 rr", params: "reg"
X=? 02        : F3 A7 14 02         /X=\? ([0-9][0-9])/       "F3 A7 14 rr", params: "reg"
X=? 99        : F3 A7 14 63         /X=\? ([0-9][0-9])/       "F3 A7 14 rr", params: "reg"
X=? IND 01    : F3 A7 14 81         /X=\? IND ([0-9][0-9])/   "F3 A7 14 rr", params: ""reg-128" //00-99
X=? IND 15    : F3 A7 14 8F         /X=\? IND ([0-9][0-9])/   "F3 A7 14 rr", params: ""reg-128"
X=? IND 16    : F3 A7 14 90         /X=\? IND ([0-9][0-9])/   "F3 A7 14 rr", params: ""reg-128"
X=? IND 99    : F3 A7 14 E3         /X=\? IND ([0-9][0-9])/   "F3 A7 14 rr", params: ""reg-128"
```

## Addressing example `STO` 

### Encode:

```
key: "STO",
    value: [
    { regex: /STO (".{1,14}")/, raw: "Fn 81", params: "nam" },
    { regex: /STO IND (".{1,14}")/, raw: "Fn 89", params: "nam" },

    { regex: /STO ST ([XYZLT])/, raw: "91 7t", params: "stk" },
    { regex: /STO IND ST ([XYZLT])/, raw: "91 Ft", params: "stk" },

    { regex: /STO (0[0-9]|1[0-5])/, raw: "3r", params: "reg" },        // 00-15
    { regex: /STO (1[6-9]|[2-9][0-9])/, raw: "91 rr", params: "reg" }, // 16-99
    { regex: /STO IND (\d{2})/, raw: "91 8r", params: "reg" },
```

### Decode:

```
{ regex: /F([1-9A-F]) 81/, len: 2, rpn: "STO `nam`", params: "naml-1" },
{ regex: /F([1-9A-F]) 89/, len: 2, rpn: "STO IND `nam`", params: "naml-1", },

{ regex: /91 7([0-4])/, len: 2, rpn: "STO ST `stk`", params: "stk" },
{ regex: /91 F([0-4])/, len: 2, rpn: "STO IND ST `stk`", params: "stk", },

{ regex: /3([0-9A-F])/, len: 1, rpn: "STO sr", params: "reg" }                    // 00-15
{ regex: /91 ([0-7][0-9A-F])/, len: 2, rpn: "STO rr", params: "reg" },            // 16-99
{ regex: /91 ([89A-E][0-9A-F])/, len: 2, rpn: "STO IND rr", params: "reg-128", },
```