# HP42S-free42

![hp42s-free42-extension-logo](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/vscode-hp42s-free42-logo.png)

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
![Installs](https://vsmarketplacebadge.apphb.com/installs-short/JHeilingbrunner.vscode-hp42s-free42.svg)
![Downloads](https://vsmarketplacebadge.apphb.com/downloads-short/JHeilingbrunner.vscode-hp42s-free42.svg)

Language support for HP42S/free42 programming language.

## What's new in HP42S-free42:

- package updates
- bug fix

## Features

- syntax highlighting
- snipptes with description
- comments
- document formatter
- encoding code to raw
- decoding raw to code
  
Supported filetypes

- __`*.hp42s`__ for the __original__ operation set of the __HP-42S__
- __`*.free42`__ for the __extended__ operation set of the __free42__

The endless chain of encoding and decoding:

`*.hp42s` -> `*.hp42s.hex42` -> `*.hp42s.raw` -> `*.hp42s.raw.hex42` -> `*.hp42s.raw.hp42s` -> ...

Depending on the file type, snippets, syntax highlighting with the additional commands of free42 are supported or not.

Useful for [Hewlett Packard HP-42S](https://en.wikipedia.org/wiki/HP-42S) calculators, [SwissMicros-DM42](https://www.swissmicros.com/dm42.php) calculators and [FREE42](http://thomasokken.com/free42/) applications.

![Demo](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/demo.gif)

## Features

### Instruction sets

- HP42S instruction set
- Support [Free42 Extensions to the HP-42S Instruction Set (v2.4)](https://thomasokken.com/free42/#time)

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
- Use `FOC` for `√,∫,░,Σ,▶,π,¿,␊,≤,≥,≠,↵,↓,→,←,µ,£,°,Å,Ñ,Ä,∡,ᴇ,Æ,…,␛,Ö,Ü,▒,■`
- Use `[LF]` or `␊` for a line feed in a string. Formatter will replace `[LF]` to `␊`.

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

Depending on the setting `HP42S/free42.encoderGenerateHexFile` setting, the command will generate a readable `hex42` file.

Although the program size will be calculated and shown in the first line (`{ n-Byte Prgm }`). For some reason, the last ending `END` command is ignored. Real program size will be 3 bytes more.

> __That's what the real HP-42S does. It is strange, since the END is, in fact, a part of the program... but that's the way it is.__

![Encode Code](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-code.gif)

#### Encoding Success

Encoding with no errors: The raw program size is reported in the first line.

![Encode Success](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-success.gif)

The command generates two output files:

- a file in `raw42` format
- a file in `hex42` format, when setting `HP42S/free42.encoderGenerateHexFile` is checked

#### Encoding Errors

Encoding with errors: The first line line contains the first error.

![Encode Error](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-error.gif)

Encoding with errors: All errors are logged to the *.log file.

![Encode Log](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/encode-log.gif)

### `Decode Code` - Comand

From a `*.raw` file the decoder generates the following files

- `*.hex42`: The sequence of the command bytes, when setting `HP42S/free42.decoderGenerateHexFile` is checked.
- `*.hp42s`: The code file with only pure HP42S commands.
- `*.free42`: The decode has detected free42 commands. The code will only run on free42 applications.

To decode a raw file, please select `hp42s/free42: Show Raw` in the context menu of the file listed in the right explorer pane.

![Explorer context menu](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/explorer-contextmenu-showraw.png)

This will show the formatted bytes of the file.

![Raw view](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/showraw-1.png)

In the editor open the context menu again an select `hp42s/free42: Decode Raw`.

![Raw view context menu](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/showraw-contextmenu.png)

The decoder will generate the output files.

![Decoded files](https://raw.githubusercontent.com/heilingbrunner/vscode-hp42s-free42/master/images/explorer-decoded.png)

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

- `HP42S/free42.encodergenerateHexFile`: This will although generate a `*.hex42` file, to see the correct hex encoding.

Decoding Settings:

- `HP42S/free42.decodergenerateHexFile`: This will although generate a `*.hex42` file, to see the correct hex encoding.
  
Document Formatter Settings:

- `HP42S/free42.formatterUseLineNumbers`: see above __Document Formatter__
- `HP42S/free42.formatterReplaceAbreviations`: see above __Document Formatter__
- `HP42S/free42.formatterRemoveTooLongSpaces`: see above __Document Formatter__
- `HP42S/free42.formatterTrimLines`: see above __Document Formatter__
- `HP42S/free42.formatterUseWhitespaceBetweenHex`: see generated hex files

## Recommendations

Visual Studio Extensions:

- [hexdump for VSCode](https://marketplace.visualstudio.com/items?itemName=slevesque.vscode-hexdump) for raw file inspections
- [gitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) for better integration of the source code management
