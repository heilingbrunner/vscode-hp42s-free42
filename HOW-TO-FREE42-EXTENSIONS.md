# How to add new free42 commands

## Get infos

- Get description from command, see [free42 Documentation](https://thomasokken.com/free42/#doc)
- Use free42 calculator.
- Get hex code from example program with only the new command in it.

## Add command

- Try to keep insertion in alpha-numeric order for better understanding
- Edit/add `free42snippets.json`
- Edit/add `free42tmlanguage.json`
- Edit/add `Encoder42.getLanguageIdFromCode()`
- Edit/add `Encoder42.arr_rpnMap`
- Edit/add `Decoder42.arr_rawMap`
- Edit/add `RawParser.checkLanguageId()`