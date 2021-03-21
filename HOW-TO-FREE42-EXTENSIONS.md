# How to add new free42 commands

## Get infos

- Get description from command, see [free42 Documentation](https://thomasokken.com/free42/#doc)
- Use free42 calculator.
- Get hex code from example program with only the new command in it.

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