# HP42S - free42

![hp42s-free42-extension-logo](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/vscode-hp42s-free42-logo.png)

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

Language support for HP42S/free42 programming language.

Features

- syntax highlighting
- snipptes with description
- comments
- document formatter
- encoding code
  
Supported filetypes __`*.hp42s`__ and __`*.free42`__.
Depending on the file type, snippets, syntax highlighting with the additional commands of free42 are supported or not.

Useful for [FREE42](http://thomasokken.com/free42/) applications and  [SwissMicros-DM42](https://www.swissmicros.com/dm42.php) calculators.

## Features

### Syntax Highligthing

![Syntax Highligthing](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/syntax-highlighting.gif)

### Snippets with description

Every keystroke command and its variations with a description.

![Snippets with description](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/snippets-with-description.gif)

- Normal snippets appear when writing the command
- Snippets for commands with leading special character appear when writing the command name (eg: use `DEC` for `→DEC`, use `REG` for `ΣREG`)
- Use `e`, `ᴇ` or `E` for `ᴇ` in `1.2ᴇ-23`
- Use `OP` for `+,-,×,÷,+/-,Σ+,Σ-,←,↑,↓,→,%,⊢,%CH`
- Use `FLAG` for all flags `01` to `99`
- Use `FOC` for `√,∫,░,Σ,▶,π,¿,≤,≥,≠,↵,↓,→,←,µ,£,°,Å,Ñ,Ä,∡,ᴇ,Æ,…,␛,Ö,Ü,▒,■`

### Comments

Comments are possible in several variants.

![Comments](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/comments.gif)

### Document Formatter

Right-click in the editor to get the context menu, then select menu `Format Document` or press keyboard-shortcut __Win__: `SHIFT+ALT+F`/ __Linux__: `SHIFT+ALT+F`/ __Mac-OSX__: `⇧⌥F`.

![Document Formatter](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/document-formatter.gif)

The formatter has several configurations:

- Remove Line Numbers: This will remove all leading line numbers.
- Remove Too Long Spaces: This will reduce whitespaces in the code.
- Replace Abbreviations: Abbreviations for special characters will be replaced by the correct intended character.
- Trim Line: This removes whitespaces at the beginnning and at the end of a code line.

### `Encode Code` - Comand

Press __Win/Linux__: `Ctrl+Shift+P`, __Mac-OSX__: `⇧⌘P`, then write `HP42S` to get the command `hp42s/free42: Encode Code` in the drop down list.

The `hp42s/free42: Encode Code` command generates a `*.hp42s.raw` or `*.free42.raw` file. These files can be loaded by `free42` or `DM42`.

![Encode Code](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-code.gif)

#### Encoding Success

Encoding with no errors: The raw program size is reported in the first line.

![Encode Success](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-success.gif)

The command generates two output files:

- a file in `raw` format
- a file in `hex` format

#### Encoding Errors

Encoding with errors: The first line line contains the first error.

![Encode Error](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-error.gif)

Encoding with errors: All errors are logged to the *.log file.

![Encode Log](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-log.gif)

## Used References

- [Thomas Okken - free42](http://thomasokken.com/free42/)
- [SwissMicros](https://www.swissmicros.com/)
- [SwissMicros - Forum](https://forum.swissmicros.com/viewtopic.php?f=2&t=2011)
- [MoHPC, The Museum of HP Calculators](http://www.hpmuseum.org/)
- [MoHPC - Forum](http://www.hpmuseum.org/forum/thread-11743.html)
- [FOCAL character set](https://en.wikipedia.org/wiki/FOCAL_character_set)
- perl script [txt2raw.pl V1.0](https://forum.swissmicros.com/viewtopic.php?t=285&start=10) by Vini Matangrano

## Documents

- [Hewlett-Packard HP-42S RPN Scientific Calculator Owner´s Manual](http://www.hp41.net/forum/fileshp41net/manuel-hp42s-us.pdf)
- [Hewlett-Packard HP-42S RPN Scientific Programming Examples and Techniques](http://www.hp41.net/forum/fileshp41net/hp42s-programming-examples.pdf)

## Requirements

None.

## Extension Settings

Document Formatter Settings:

- HP42S/free42.formatterRemoveLineNumbers: see above Document Formatter
- HP42S/free42.formatterReplaceAbreviations: see above Document Formatter
- HP42S/free42.formatterRemoveTooLongSpaces: see above Document Formatter
- HP42S/free42.formatterTrimLines: see above Document Formatter

## Known Issues

None.

## Release Notes

### 0.0.1

Initial release.

## Snippets



