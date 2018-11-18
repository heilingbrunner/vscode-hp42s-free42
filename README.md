# HP42S - free42

![hp42s-free42-extension-logo](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/vscode-hp42s-free42-logo.png)

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
[![Build Status](https://travis-ci.org/heilingbrunner/vscode-hp42s-free42.svg?branch=master)](https://travis-ci.org/heilingbrunner/vscode-hp42s-free42)
![Installs](https://vsmarketplacebadge.apphb.com/installs-short/JHeilingbrunner.vscode-hp42s-free42.svg)

Language support for HP42S/free42 programming language.

Features

- syntax highlighting
- snipptes with description
- comments
- document formatter
- encoding code to raw
  
Supported filetypes

- __`*.hp42s`__ for the __original__ operation set of the __HP-42S__
- __`*.free42`__ for the __extended__ operation set of the __free42__

Depending on the file type, snippets, syntax highlighting with the additional commands of free42 are supported or not.

Useful for [Hewlett Packard HP-42S](https://en.wikipedia.org/wiki/HP-42S) calculators, [SwissMicros-DM42](https://www.swissmicros.com/dm42.php) calculators and [FREE42](http://thomasokken.com/free42/) applications.

![Demo](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/demo.gif)

## Features

### Syntax Highligthing

![Syntax Highligthing](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/syntax-highlighting.gif)

### Snippets with description

Every keystroke command and its variations with a description.

![Snippets with description](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/snippets-with-description.gif)

- Normal snippets appear when writing the command
- Snippets for commands with leading special character appear when writing the command name (eg: use `DEC` for `→DEC`, use `REG` for `ΣREG`)
- Use `e`, `ᴇ` or `E` for `ᴇ` in `1.2ᴇ-23`
- Use `OP` for `×,÷,+/-,Σ+,Σ-,←,↑,↓,→,%,⊢,%CH`
- Use `FLAG` for all flags `01` to `99`
- Use `FOC` for `√,∫,░,Σ,▶,π,¿,≤,≥,≠,↵,↓,→,←,µ,£,°,Å,Ñ,Ä,∡,ᴇ,Æ,…,␛,Ö,Ü,▒,■`

### Comments

Comments are possible in several variants.

![Comments](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/comments.gif)

### Document Formatter

The formatter prepares the code for encoding. It will replace all abbreviations, which are used for ascii text editing. When using __Visual Studio Code__, the code is displayed in UTF8, though all original characters of the HP42S/free42 can be displayed correct.

> __However when I enter a program manually into a real calculator it helps to have line numbers. If I miss a command it helps to find the error.__

Right-click in the editor to get the context menu, then select menu `Format Document` or press keyboard-shortcut __Win__: `SHIFT+ALT+F`/ __Linux__: `SHIFT+ALT+F`/ __Mac-OSX__: `⇧⌥F`.

![Document Formatter](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/document-formatter.gif)

The formatter has several settings:

- `Use Line Numbers`: This will insert/refresh the leading line numbers.
- `Remove Too Long Spaces`: This will reduce whitespaces in the code.
- `Replace Abbreviations`: Abbreviations for special characters will be replaced by the correct intended character.
- `Trim Line`: This removes whitespaces at the beginnning and at the end of a code line.

### `Encode Code` - Comand

Before encoding, please format the code. This avoids further special cases that would otherwise have to be taken into account.

Press __Win/Linux__: `Ctrl+Shift+P`, __Mac-OSX__: `⇧⌘P`, then write `HP42S` to get the command `hp42s/free42: Encode Code` in the drop down list.

The `hp42s/free42: Encode Code` command generates a `*.hp42s.raw` or `*.free42.raw` file. These files can be loaded by `free42` or `DM42`.

Depending on the setting `HP42S/free42.encoderGenerateHexFile` setting, the command will generate a readable hex file.

Although the program size will be calculated and shown in the first line (`{ n-Byte Prgm }`). For some reason, the last ending `END` command is ignored. Real program size will be 3 bytes more.

> __That's what the real HP-42S does. It is strange, since the END is, in fact, a part of the program... but that's the way it is.__

![Encode Code](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-code.gif)

#### Encoding Success

Encoding with no errors: The raw program size is reported in the first line.

![Encode Success](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-success.gif)

The command generates two output files:

- a file in `raw` format
- a file in `hex` format, when setting `HP42S/free42.encoderGenerateHexFile` is checked

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

Encoding Settings:

- `HP42S/free42.encoderGenerateHexFile`: This will although generate a *.hex file, to see the correct hex encoding.
  
Document Formatter Settings:

- `HP42S/free42.formatterUseLineNumbers`: see above __Document Formatter__
- `HP42S/free42.formatterReplaceAbreviations`: see above __Document Formatter__
- `HP42S/free42.formatterRemoveTooLongSpaces`: see above __Document Formatter__
- `HP42S/free42.formatterTrimLines`: see above __Document Formatter__

## Recommendations

Visual Studio Extensions:

- [hexdump for VSCode](https://marketplace.visualstudio.com/items?itemName=slevesque.vscode-hexdump) for raw file inspections
- [gitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) for better integration of the source code management

## Known Issues

None.

## Release Notes

### 0.0.8

- multi program support in *.hp42s/*.free42 files debugged

### 0.0.7

- multi program support in *.hp42s/*.free42 files
- `HP42S/free42.encoderIgnoreLastEndCommandForBytePrgm` setting removed

### 0.0.6

- formatter and parser improved

### 0.0.5

- further formatter rule

### 0.0.4

- setting `formatterRemoveLineNumbers` changed to `formatterUseLineNumbers`
- document formatter inserts/refreshes line numbers, when `formatterUseLineNumbers` is set

### 0.0.3

- new setting bit for program size calculation adjustment
- new setting bit for hex file generation

### 0.0.2

Handling of comments improved.

### 0.0.1

Initial release.
