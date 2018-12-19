module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/extension.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/common/bytes.ts":
/*!*****************************!*\
  !*** ./src/common/bytes.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** Hex string AA BB CC to byte array */
function toBytes(content) {
    let bytes = [];
    content.split(/\s+/).forEach(hex => {
        bytes.push(parseInt(hex, 16));
    });
    return bytes;
}
exports.toBytes = toBytes;


/***/ }),

/***/ "./src/common/codeerror.ts":
/*!*********************************!*\
  !*** ./src/common/codeerror.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class CodeError {
    constructor(docLine, codeLineNo, code, message) {
        this.docLine = -1; //index 0,... but document line numer starts at 1 !!
        this.codeLineNo = -1;
        this.message = '';
        this.docLine = docLine;
        this.codeLineNo = codeLineNo;
        this.code = code;
        this.message = message;
    }
    toString() {
        return ('Error [' +
            (this.docLine > -1 ? (this.docLine + 1) + ', ' : '') +
            (this.codeLineNo > -1 ? (this.codeLineNo < 10 ? '0' + this.codeLineNo : this.codeLineNo) : '') +
            "]! Code: '" +
            this.code +
            "'; Message: \'" +
            this.message +
            '\'');
    }
}
exports.CodeError = CodeError;


/***/ }),

/***/ "./src/common/configuration.ts":
/*!*************************************!*\
  !*** ./src/common/configuration.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Configuration {
    constructor(useWorkspaceConfiguration) {
        this.platform = process.platform;
        if (useWorkspaceConfiguration) {
            let config = vscode.workspace.getConfiguration("HP42S/free42");
            this.encoderGenerateHexFile = config.get("encoderGenerateHexFile");
            this.decoderGenerateHexFile = config.get("decoderGenerateHexFile");
            this.useLineNumbers = config.get("formatterUseLineNumbers");
            this.replaceAbbreviations = config.get("formatterReplaceAbbreviations");
            this.removeTooLongSpaces = config.get("formatterRemoveTooLongSpaces");
            this.trimLine = config.get("formatterTrimLine");
            this.useWhitespaceBetweenHex = config.get("formatterUseWhitespaceBetweenHex");
            // get eol ...
            config = vscode.workspace.getConfiguration("files", null);
            const fileseol = String(config.get("eol"));
            switch (true) {
                case /auto/.test(fileseol):
                    this.eol = (this.platform === 'win32' ? '\r\n' : '\n');
                    break;
                case /\r\n/.test(fileseol):
                    this.eol = '\r\n';
                    break;
                case /\n/.test(fileseol):
                    this.eol = '\n';
                    break;
                default:
                    this.eol = '\r\n';
                    break;
            }
        }
        else {
            this.encoderGenerateHexFile = true;
            this.useLineNumbers = true;
            this.replaceAbbreviations = true;
            this.removeTooLongSpaces = true;
            this.trimLine = true;
            this.useWhitespaceBetweenHex = true;
            this.eol = '\r\n';
        }
    }
}
exports.Configuration = Configuration;


/***/ }),

/***/ "./src/common/filesystem.ts":
/*!**********************************!*\
  !*** ./src/common/filesystem.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const bytes_1 = __webpack_require__(/*! ./bytes */ "./src/common/bytes.ts");
/** Write bytes to file */
function writeBytes(fileName, content) {
    const data = new Buffer(bytes_1.toBytes(content));
    fs.writeFile(fileName, data, err => {
        if (err) {
            vscode.window.showInformationMessage('hp42s/free42: Write binary file failed');
        }
    });
}
exports.writeBytes = writeBytes;
/** Write text file */
function writeText(fileName, content) {
    fs.writeFile(fileName, content, err => {
        if (err) {
            vscode.window.showInformationMessage('hp42s/free42: write text file failed');
        }
    });
}
exports.writeText = writeText;
/** Delete file */
function deleteFile(filename) {
    fs.exists(filename, exists => {
        if (exists) {
            fs.unlink(filename, err => {
                if (err) {
                    vscode.window.showErrorMessage('hp42s/free42: delete file failed');
                }
            });
        }
    });
}
exports.deleteFile = deleteFile;
function getFileSize(uri) {
    const filepath = getPhysicalPath(uri);
    const fstat = fs.statSync(filepath);
    return fstat ? fstat['size'] : -1;
}
exports.getFileSize = getFileSize;
function getPhysicalPath(uri) {
    if (uri.scheme === 'raw42') {
        // remove the '.raw42' extension
        const filepath = uri.with({ scheme: 'file' }).fsPath.slice(0, -('.raw42'.length));
        return filepath;
    }
    return uri.fsPath;
}
exports.getPhysicalPath = getPhysicalPath;
function getBuffer(uri) {
    return getEntry(uri);
}
exports.getBuffer = getBuffer;
function getEntry(uri) {
    // ignore text files with hexdump syntax
    if (uri.scheme !== 'raw42') {
        return;
    }
    const filepath = getPhysicalPath(uri);
    let buffer;
    buffer = fs.readFileSync(filepath);
    return buffer;
}
exports.getEntry = getEntry;
function existsSync(filePath) {
    return fs.existsSync(filePath);
}
exports.existsSync = existsSync;


/***/ }),

/***/ "./src/common/params.ts":
/*!******************************!*\
  !*** ./src/common/params.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Params {
    constructor() { }
}
exports.Params = Params;


/***/ }),

/***/ "./src/decoder/decoder.ts":
/*!********************************!*\
  !*** ./src/decoder/decoder.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const decoder42_1 = __webpack_require__(/*! ./decoder42 */ "./src/decoder/decoder42.ts");
const decoderresult_1 = __webpack_require__(/*! ./decoderresult */ "./src/decoder/decoderresult.ts");
const rawparser_1 = __webpack_require__(/*! ./rawparser */ "./src/decoder/rawparser.ts");
class Decoder {
    constructor() {
        decoder42_1.Decoder42.initialize();
    }
    /** Decode raw input to readable code string */
    decode(editor) {
        const document = editor.document;
        const raw = this.readDocumentBytes(document);
        const parser = new rawparser_1.RawParser(raw);
        parser.parse();
        parser.programs.forEach(program => {
            program.rpnLines.forEach(rpnLine => {
                decoder42_1.Decoder42.toRpn(rpnLine);
            });
        });
        // return result
        const result = new decoderresult_1.DecoderResult();
        result.programs = parser.programs;
        result.languageId = parser.languageId;
        return result;
    }
    readDocumentBytes(document) {
        const docLineCount = document.lineCount;
        let bytes;
        let content = '';
        for (let docLine = 0; docLine < docLineCount; docLine++) {
            let line = document.lineAt(docLine);
            let linetext = line.text;
            //   Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 	                   <----- not this
            // 00000000: C0 00 F8 00 54 4F 4F 2D 4C 4F 4E 99 16 C0 00 F4    @.x.TOO-LON..@.t <----- this
            if (/(\d+:)( [0-9a-fA-F]{2})+/.test(linetext)) {
                linetext = linetext.replace(/^\d{8}: /, '');
                let match = linetext.match(/([0-9a-fA-F]{2} )+/);
                if (match) {
                    content += match[0];
                }
            }
        }
        // All together
        bytes = content.trim().split(' ');
        return bytes;
    }
    dispose() { }
}
exports.Decoder = Decoder;


/***/ }),

/***/ "./src/decoder/decoder42.ts":
/*!**********************************!*\
  !*** ./src/decoder/decoder42.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Decoder42 {
    //#endregion
    //#region Public
    static initialize() {
        if (!Decoder42.initialized) {
            // transform arr_rawMap -> rawMap
            Decoder42.arr_rawMap.forEach((e) => {
                Decoder42.rawMap.set(e.key, e.value);
            });
            Decoder42.arr_stackMap.forEach((e) => {
                Decoder42.stackMap.set(e.key, e.value);
            });
            // transform arr_charMap -> charMap
            Decoder42.arr_charMap.forEach((e) => {
                Decoder42.charMap.set(e.key, e.value);
            });
            Decoder42.initialized = true;
        }
    }
    static toRpn(rpnLine) {
        if (rpnLine.workCode) {
            if ((rpnLine.params.stk !== undefined) && /`stk`/.test(rpnLine.workCode)) {
                this.replaceStack('`stk`', rpnLine);
            }
            if ((rpnLine.params.num !== undefined) && /`num`/.test(rpnLine.workCode)) {
                this.replaceNumber('`num`', rpnLine);
            }
            if ((rpnLine.params.key !== undefined) && /`key`/.test(rpnLine.workCode)) {
                this.replaceKey('`key`', rpnLine);
            }
            // numbers
            if (rpnLine.params.lblno !== undefined && /sl/.test(rpnLine.workCode)) {
                this.replaceLabelNo('sl', rpnLine);
            }
            else if (rpnLine.params.lblno !== undefined && /ll/.test(rpnLine.workCode)) {
                this.replaceLabelNo('ll', rpnLine);
            }
            //
            else if (rpnLine.params.regno !== undefined && /sr/.test(rpnLine.workCode)) {
                this.replaceRegister('sr', rpnLine);
            }
            else if (rpnLine.params.regno !== undefined && /rr/.test(rpnLine.workCode)) {
                this.replaceRegister('rr', rpnLine);
            }
            // numbers
            else if (rpnLine.params.flgno !== undefined && /fl/.test(rpnLine.workCode)) {
                this.replaceFlag('fl', rpnLine);
            }
            else if (rpnLine.params.sizno !== undefined && /ss ss/.test(rpnLine.workCode)) {
                this.replaceSize('ss ss', rpnLine);
            }
            else if (rpnLine.params.tonno !== undefined && /tn/.test(rpnLine.workCode)) {
                this.replaceTone('tn', rpnLine);
            }
            else if (rpnLine.params.digno !== undefined && /sd/.test(rpnLine.workCode)) {
                this.replaceDigits('sd', rpnLine);
            }
            if ((rpnLine.params.lbl !== undefined) && /`lbl`/.test(rpnLine.workCode)) {
                this.replaceLabel('`lbl`', rpnLine);
            }
            if ((rpnLine.params.str !== undefined) && /`str`/.test(rpnLine.workCode)) {
                this.replaceString('`str`', rpnLine);
            }
            if ((rpnLine.params.nam !== undefined) && /`nam`/.test(rpnLine.workCode)) {
                this.replaceName('`nam`', rpnLine);
            }
        }
    }
    //#endregion
    //#region Private Methods
    static replaceLabel(replace, rpnLine) {
        if (rpnLine.workCode) {
            let lbl = this.convertRawToString(rpnLine.params.lbl);
            rpnLine.workCode = rpnLine.workCode.replace(replace, '"' + lbl + '"');
        }
    }
    static replaceString(replace, rpnLine) {
        if (rpnLine.workCode) {
            let str = this.convertRawToString(rpnLine.params.str);
            rpnLine.workCode = rpnLine.workCode.replace(replace, '"' + str + '"');
        }
    }
    static replaceName(replace, rpnLine) {
        if (rpnLine.workCode) {
            let nam = this.convertRawToString(rpnLine.params.nam);
            rpnLine.workCode = rpnLine.workCode.replace(replace, '"' + nam + '"');
        }
    }
    static replaceNumber(replace, rpnLine) {
        if (rpnLine.workCode) {
            let number = this.convertRawToNumber(rpnLine.params.num);
            rpnLine.workCode = rpnLine.workCode.replace(replace, number);
        }
    }
    static replaceLabelNo(replace, rpnLine) {
        // ... 99  ... 63 dec:16-99; hex:10-63
        // ... A   ... 66 dec:102  char:65
        // ... J   ... 6F dec:111
        // ... a   ... 7B dec:123  char:97
        // ... e   ... 7F dec:127
        if (rpnLine.workCode) {
            let number = '';
            if (rpnLine.params.lblno !== undefined) {
                if (Decoder42.inRange(rpnLine.params.lblno, 0, 99)) {
                    //00-99
                    number = this.formatNN(rpnLine.params.lblno);
                }
                else if (Decoder42.inRange(rpnLine.params.lblno, 102, 111)) {
                    //A-F
                    number = String.fromCharCode(rpnLine.params.lblno - 37);
                }
                else if (Decoder42.inRange(rpnLine.params.lblno, 123, 127)) {
                    //a-e
                    number = String.fromCharCode(rpnLine.params.lblno - 26);
                }
            }
            rpnLine.workCode = rpnLine.workCode.replace(replace, number);
        }
    }
    static replaceRegister(replace, rpnLine) {
        if (rpnLine.workCode) {
            let number = this.formatNN(rpnLine.params.regno);
            rpnLine.workCode = rpnLine.workCode.replace(replace, number);
        }
    }
    static replaceFlag(replace, rpnLine) {
        if (rpnLine.workCode) {
            let number = this.formatNN(rpnLine.params.flgno);
            rpnLine.workCode = rpnLine.workCode.replace(replace, number);
        }
    }
    static replaceStack(replace, rpnLine) {
        if (rpnLine.workCode) {
            rpnLine.workCode = rpnLine.workCode.replace(replace, '' + rpnLine.params.stk);
        }
    }
    static replaceKey(replace, rpnLine) {
        if (rpnLine.workCode) {
            rpnLine.workCode = rpnLine.workCode.replace(replace, '' + rpnLine.params.keyno);
        }
    }
    static replaceSize(replace, rpnLine) {
        if (rpnLine.workCode) {
            rpnLine.workCode = rpnLine.workCode.replace(replace, this.formatNN(rpnLine.params.sizno)); // 01-9999
        }
    }
    static replaceTone(replace, rpnLine) {
        if (rpnLine.workCode) {
            rpnLine.workCode = rpnLine.workCode.replace(replace, '' + rpnLine.params.tonno); // 0-9
        }
    }
    static replaceDigits(replace, rpnLine) {
        if (rpnLine.workCode) {
            // rpnLine.params.digno: 0-9, rpnLine.params.dig: 00-09
            rpnLine.workCode = rpnLine.workCode.replace(replace, this.formatNN(rpnLine.params.digno));
        }
    }
    /** Changing numbers into corresponding opcodes. 11 1A 12 13 14 1B 1C 14 15 15 00 -> '1.234E-455' */
    static convertRawToNumber(raw) {
        let number = '';
        if (raw) {
            raw = raw.replace(/00$/, '');
            raw = raw.replace(/1A/, '.');
            raw = raw.replace(/1B/, 'ᴇ');
            raw = raw.replace(/1C/g, '-');
            raw = raw.replace(/1([0-9])/g, '$1');
            raw = raw.replace(/ /g, '');
            number = raw;
        }
        // TODO: Format 0.008 -> 8ᴇ-3
        const match = number.match(/(0+)\.(0+)(\d+)(ᴇ|)((-|)\d+|)/);
        if (match) {
            let len1 = match[1].length;
            let len2 = match[2].length;
            let len3 = match[3].length;
            let exp = parseInt(match[5]);
            let float = parseFloat(match[0].replace('ᴇ', 'e'));
            // 0.008 -> 8ᴇ-3
            if (len2 > 1) {
                //console.log(
                //  (float * Math.pow(10, (-exp + len2 + len3))).toExponential(0).replace('e', 'ᴇ') + (exp - (len2 + len3))
                //);
            }
        }
        return number;
    }
    static convertRawToString(raw) {
        let str = '';
        if (raw) {
            let chars = raw.split(' ');
            chars.forEach(char => {
                let byte = this.convertHexAsByte(char);
                if (Decoder42.charMap.has(byte)) {
                    str += Decoder42.charMap.get(byte);
                }
                else {
                    str += String.fromCharCode(byte);
                }
            });
        }
        return str;
    }
    /** Changing integers (size one byte, 0-255) into hex string . 123 -> 7B, 255 -> FF */
    static convertHexAsByte(hex) {
        let byte = parseInt(hex, 16);
        return byte;
    }
    static formatNN(n) {
        if (n !== undefined) {
            return n > 9 ? '' + n : '0' + n;
        }
        return '??';
    }
    static inRange(x, min, max) {
        return ((x - min) * (x - max)) <= 0;
    }
}
//#region Members
Decoder42.rawMap = new Map();
Decoder42.stackMap = new Map();
Decoder42.charMap = new Map();
Decoder42.lblMap = new Map();
Decoder42.initialized = false;
//#endregion
//#region Private Arrays
Decoder42.arr_stackMap = [
    { key: 0, value: 'T' },
    { key: 1, value: 'Z' },
    { key: 2, value: 'Y' },
    { key: 3, value: 'X' },
    { key: 4, value: 'L' }
];
/** FOCAL character set https://en.wikipedia.org/wiki/FOCAL_character_set key is used as regex */
Decoder42.arr_charMap = [
    { key: 0, value: '÷' },
    { key: 1, value: '×' },
    { key: 2, value: '√' },
    { key: 3, value: '∫' },
    { key: 4, value: '░' },
    { key: 5, value: 'Σ' },
    { key: 6, value: '▶' },
    { key: 7, value: 'π' },
    { key: 8, value: '¿' },
    { key: 9, value: '≤' },
    { key: 10, value: '\\[LF\\]' },
    { key: 10, value: '␊' },
    { key: 11, value: '≥' },
    { key: 12, value: '≠' },
    { key: 13, value: '↵' },
    { key: 14, value: '↓' },
    { key: 15, value: '→' },
    { key: 16, value: '←' },
    { key: 17, value: 'µ' },
    { key: 17, value: 'μ' },
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
    //{ key: 31, value: '•' }, // see above
    // { key: 32, value: 'SP' },
    // { key: 33, value: '!' },
    // { key: 34, value: ''' }, // single quote
    // { key: 35, value: '#' },
    // { key: 36, value: '$' },
    // { key: 37, value: '%' },
    // { key: 38, value: '&' },
    // { key: 39, value: '"' }, // double quotes !!
    // { key: 40, value: '(' },
    // { key: 41, value: ')' },
    // { key: 42, value: '*' },
    // { key: 43, value: '+' },
    // { key: 44, value: ',' },
    // { key: 45, value: '-' },
    // { key: 46, value: '.' },
    // { key: 47, value: '/' },
    // { key: 48, value: '0' },
    // { key: 49, value: '1' },
    // { key: 50, value: '2' },
    // { key: 51, value: '3' },
    // { key: 52, value: '4' },
    // { key: 53, value: '5' },
    // { key: 54, value: '6' },
    // { key: 55, value: '7' },
    // { key: 56, value: '8' },
    // { key: 57, value: '9' },
    // { key: 58, value: ':' },
    // { key: 59, value: ';' },
    // { key: 60, value: '<' },
    // { key: 61, value: '=' },
    // { key: 62, value: '>' },
    // { key: 63, value: '?' },
    // { key: 64, value: '@' },
    // { key: 65, value: 'A' },
    // { key: 66, value: 'B' },
    // { key: 67, value: 'C' },
    // { key: 68, value: 'D' },
    // { key: 69, value: 'E' },
    // { key: 70, value: 'F' },
    // { key: 71, value: 'G' },
    // { key: 72, value: 'H' },
    // { key: 73, value: 'I' },
    // { key: 74, value: 'J' },
    // { key: 75, value: 'K' },
    // { key: 76, value: 'L' },
    // { key: 77, value: 'M' },
    // { key: 78, value: 'N' },
    // { key: 79, value: 'O' },
    // { key: 80, value: 'P' },
    // { key: 81, value: 'Q' },
    // { key: 82, value: 'R' },
    // { key: 83, value: 'S' },
    // { key: 84, value: 'T' },
    // { key: 85, value: 'U' },
    // { key: 86, value: 'V' },
    // { key: 87, value: 'W' },
    // { key: 88, value: 'X' },
    // { key: 89, value: 'Y' },
    // { key: 90, value: 'Z' },
    // { key: 91, value: '[' },
    { key: 92, value: '\\\\' },
    // { key: 93, value: ']' },
    { key: 94, value: '↑' }
    // { key: 95, value: '_' },
    // { key: 96, value: '`' },
    // { key: ??, value: '´' },
    // { key: 97, value: 'a' },
    // { key: 98, value: 'b' },
    // { key: 99, value: 'c' },
    // { key: 100, value: 'd' },
    // { key: 101, value: 'e' },
    // { key: 102, value: 'f' },
    // { key: 103, value: 'g' },
    // { key: 104, value: 'h' },
    // { key: 105, value: 'i' },
    // { key: 106, value: 'j' },
    // { key: 107, value: 'k' },
    // { key: 108, value: 'l' },
    // { key: 109, value: 'm' },
    // { key: 110, value: 'n' },
    // { key: 111, value: 'o' },
    // { key: 112, value: 'p' },
    // { key: 113, value: 'q' },
    // { key: 114, value: 'r' },
    // { key: 115, value: 's' },
    // { key: 116, value: 't' },
    // { key: 117, value: 'u' },
    // { key: 118, value: 'v' },
    // { key: 119, value: 'w' },
    // { key: 120, value: 'x' },
    // { key: 121, value: 'y' },
    // { key: 122, value: 'z' },
    // { key: 123, value: '{' },
    // { key: 124, value: '|' },
    // { key: 125, value: '}' },
    // { key: 126, value: '~' }
    // { key: 127, value: '⊦' }
    // { key: ???, value: '´' }
];
// 0(?<lblno>[2-9A-F]): LBL 01-15
// Fn: F([1-9A-F]) Label: max. length 14
// 7t: 7([0-4]); stack 0-4
// 8r: ([89A-E][0-9A-F]); r: dec:1..99; 128 + r => hex:81..E3
// Ft: F([0-4]); ... IND ST [XYZLT]
// [23]r: (2[0-9A-F]); register dec:1-15, hex: 21-2F
// rr: ([0-7][0-9A-F]); register dec:16-99, hex:10-63
// nn: (?<digits>0[1-9]); digits; dec:0-9; 00-09
// nn: digits; dec:10,11
// tone: (?<tone>0[0-9]); dec:1-9; hex:01-09
// LBL 14  0F
// LBL 99  CF63
// LBL A   CF66
// LBL J   CF6F
// LBL a   CF7B
// LBL e   CF7F
// GTO 14  BF00
// GTO 99  D00063
// GTO A   D00066
// GTO J   D0006F
// GTO a   D0007B
// GTO e   D0007F
// RCL 01  21
// RCL 15  2F
// RCL 16  9010
// RCL 99  9063
// XEQ 14  E0000E
// XEQ 99  E00063
// XEQ A   E00066
// XEQ J   E0006F
// XEQ a   E0007B
// XEQ e   E0007F
Decoder42.arr_rawMap = [
    {
        key: '0',
        value: [
            { regex: /00/, len: 1, rpn: 'NULL' },
            { regex: /0([1-9A-F])/, len: 1, rpn: 'LBL sl', params: 'lblno-1' } //+ LBL 00-14
        ]
    },
    {
        key: '1',
        value: [
            { regex: /1D F([1-9A-F])/, len: 2, rpn: 'GTO `lbl`', params: 'lbll' },
            { regex: /1E F([1-9A-F])/, len: 2, rpn: 'XEQ `lbl`', params: 'lbll' } //+ lbl max length 14
            //no numbers here: { regex: /(1[0-9A-C] )+00/, len: 1, rpn: '`num`', params: 'number' }
        ]
    },
    {
        key: '2',
        value: [
            { regex: /2([0-9A-F])/, len: 1, rpn: 'RCL sr', params: 'reg' }
            // RCL 01  21
            // RCL 15  2F
        ]
    },
    { key: '3', value: [{ regex: /3([0-9A-F])/, len: 1, rpn: 'STO sr', params: 'reg' }] },
    {
        key: '4',
        value: [
            { regex: /40/, len: 1, rpn: '+' },
            { regex: /41/, len: 1, rpn: '-' },
            { regex: /42/, len: 1, rpn: '×' },
            { regex: /43/, len: 1, rpn: '÷' },
            { regex: /44/, len: 1, rpn: 'X<Y?' },
            { regex: /45/, len: 1, rpn: 'X>Y?' },
            { regex: /46/, len: 1, rpn: 'X≤Y?' },
            { regex: /47/, len: 1, rpn: 'Σ+' },
            { regex: /48/, len: 1, rpn: 'Σ-' },
            { regex: /49/, len: 1, rpn: 'HMS+' },
            { regex: /4A/, len: 1, rpn: 'HMS-' },
            { regex: /4B/, len: 1, rpn: 'MOD' },
            { regex: /4C/, len: 1, rpn: '%' },
            { regex: /4D/, len: 1, rpn: '%CH' },
            { regex: /4E/, len: 1, rpn: '→REC' },
            { regex: /4F/, len: 1, rpn: '→POL' }
        ]
    },
    {
        key: '5',
        value: [
            { regex: /50/, len: 1, rpn: 'LN' },
            { regex: /51/, len: 1, rpn: 'X↑2' },
            { regex: /52/, len: 1, rpn: 'SQRT' },
            { regex: /53/, len: 1, rpn: 'Y↑X' },
            { regex: /54/, len: 1, rpn: '+/-' },
            { regex: /55/, len: 1, rpn: 'E↑X' },
            { regex: /56/, len: 1, rpn: 'LOG' },
            { regex: /57/, len: 1, rpn: '10↑X' },
            { regex: /58/, len: 1, rpn: 'E↑X-1' },
            { regex: /59/, len: 1, rpn: 'SIN' },
            { regex: /5A/, len: 1, rpn: 'COS' },
            { regex: /5B/, len: 1, rpn: 'TAN' },
            { regex: /5C/, len: 1, rpn: 'ASIN' },
            { regex: /5D/, len: 1, rpn: 'ACOS' },
            { regex: /5E/, len: 1, rpn: 'ATAN' },
            { regex: /5F/, len: 1, rpn: '→DEC' }
        ]
    },
    {
        key: '6',
        value: [
            { regex: /60/, len: 1, rpn: '1/X' },
            { regex: /61/, len: 1, rpn: 'ABS' },
            { regex: /62/, len: 1, rpn: 'N!' },
            { regex: /63/, len: 1, rpn: 'X≠0?' },
            { regex: /64/, len: 1, rpn: 'X>0?' },
            { regex: /65/, len: 1, rpn: 'LN1+X' },
            { regex: /66/, len: 1, rpn: 'X<0?' },
            { regex: /67/, len: 1, rpn: 'X=0?' },
            { regex: /68/, len: 1, rpn: 'IP' },
            { regex: /69/, len: 1, rpn: 'FP' },
            { regex: /6A/, len: 1, rpn: '→RAD' },
            { regex: /6B/, len: 1, rpn: '→DEG' },
            { regex: /6C/, len: 1, rpn: '→HMS' },
            { regex: /6D/, len: 1, rpn: '→HR' },
            { regex: /6E/, len: 1, rpn: 'RND' },
            { regex: /6F/, len: 1, rpn: '→OCT' }
        ]
    },
    {
        key: '7',
        value: [
            { regex: /70/, len: 1, rpn: 'CLΣ' },
            { regex: /71/, len: 1, rpn: 'X<>Y' },
            { regex: /72/, len: 1, rpn: 'PI' },
            { regex: /73/, len: 1, rpn: 'CLST' },
            { regex: /74/, len: 1, rpn: 'R↑' },
            { regex: /75/, len: 1, rpn: 'R↓' },
            { regex: /76/, len: 1, rpn: 'LASTX' },
            { regex: /77/, len: 1, rpn: 'CLX' },
            { regex: /78/, len: 1, rpn: 'X=Y?' },
            { regex: /79/, len: 1, rpn: 'X≠Y?' },
            { regex: /7A/, len: 1, rpn: 'SIGN' },
            { regex: /7B/, len: 1, rpn: 'X≤0?' },
            { regex: /7C/, len: 1, rpn: 'MEAN' },
            { regex: /7D/, len: 1, rpn: 'SDEV' },
            { regex: /7E/, len: 1, rpn: 'AVIEW' },
            { regex: /7F/, len: 1, rpn: 'CLD' }
        ]
    },
    {
        key: '8',
        value: [
            { regex: /80/, len: 1, rpn: 'DEG' },
            { regex: /81/, len: 1, rpn: 'RAD' },
            { regex: /82/, len: 1, rpn: 'GRAD' },
            { regex: /83/, len: 1, rpn: 'ENTER' },
            { regex: /84/, len: 1, rpn: 'STOP' },
            { regex: /85/, len: 1, rpn: 'RTN' },
            { regex: /86/, len: 1, rpn: 'BEEP' },
            { regex: /87/, len: 1, rpn: 'CLA' },
            { regex: /88/, len: 1, rpn: 'ASHF' },
            { regex: /89/, len: 1, rpn: 'PSE' },
            { regex: /8A/, len: 1, rpn: 'CLRG' },
            { regex: /8B/, len: 1, rpn: 'AOFF' },
            { regex: /8C/, len: 1, rpn: 'AON' },
            { regex: /8D/, len: 1, rpn: 'OFF' },
            { regex: /8E/, len: 1, rpn: 'PROMPT' },
            { regex: /8F/, len: 1, rpn: 'ADV' }
        ]
    },
    {
        key: '9',
        value: [
            { regex: /90 7([0-4])/, len: 2, rpn: 'RCL ST `stk`', params: 'stk' },
            { regex: /90 ([89A-E][0-9A-F])/, len: 2, rpn: 'RCL IND rr', params: 'reg-128' },
            { regex: /90 F([0-4])/, len: 2, rpn: 'RCL IND ST `stk`', params: 'stk' },
            { regex: /90 ([0-7][0-9A-F])/, len: 2, rpn: 'RCL rr', params: 'reg' },
            // RCL 16  90 10  dec:16-99; hex:10-63
            // RCL 99  90 63
            { regex: /91 7([0-4])/, len: 2, rpn: 'STO ST `stk`', params: 'stk' },
            { regex: /91 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO IND rr', params: 'reg-128' },
            { regex: /91 F([0-4])/, len: 2, rpn: 'STO IND ST `stk`', params: 'stk' },
            { regex: /91 ([0-7][0-9A-F])/, len: 2, rpn: 'STO rr', params: 'reg' },
            { regex: /92 7([0-4])/, len: 2, rpn: 'STO+ ST `stk`', params: 'stk' },
            { regex: /92 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO+ IND rr', params: 'reg-128' },
            { regex: /92 F([0-4])/, len: 2, rpn: 'STO+ IND ST `stk`', params: 'stk' },
            { regex: /92 ([0-7][0-9A-F])/, len: 2, rpn: 'STO+ rr', params: 'reg' },
            { regex: /93 7([0-4])/, len: 2, rpn: 'STO- ST `stk`', params: 'stk' },
            { regex: /93 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO- IND rr', params: 'reg-128' },
            { regex: /93 F([0-4])/, len: 2, rpn: 'STO- IND ST `stk`', params: 'stk' },
            { regex: /93 ([0-7][0-9A-F])/, len: 2, rpn: 'STO- rr', params: 'reg' },
            { regex: /94 7([0-4])/, len: 2, rpn: 'STO× ST `stk`', params: 'stk' },
            { regex: /94 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO× IND rr', params: 'reg-128' },
            { regex: /94 F([0-4])/, len: 2, rpn: 'STO× IND ST `stk`', params: 'stk' },
            { regex: /94 ([0-7][0-9A-F])/, len: 2, rpn: 'STO× rr', params: 'reg' },
            { regex: /95 7([0-4])/, len: 2, rpn: 'STO÷ ST `stk`', params: 'stk' },
            { regex: /95 ([89A-E][0-9A-F])/, len: 2, rpn: 'STO÷ IND rr', params: 'reg-128' },
            { regex: /95 F([0-4])/, len: 2, rpn: 'STO÷ IND ST `stk`', params: 'stk' },
            { regex: /95 ([0-7][0-9A-F])/, len: 2, rpn: 'STO÷ rr', params: 'reg' },
            { regex: /96 7([0-4])/, len: 2, rpn: 'ISG ST `stk`', params: 'stk' },
            { regex: /96 ([89A-E][0-9A-F])/, len: 2, rpn: 'ISG IND rr', params: 'reg-128' },
            { regex: /96 F([0-4])/, len: 2, rpn: 'ISG IND ST `stk`', params: 'stk' },
            { regex: /96 ([0-7][0-9A-F])/, len: 2, rpn: 'ISG rr', params: 'reg' },
            { regex: /97 7([0-4])/, len: 2, rpn: 'DSE ST `stk`', params: 'stk' },
            { regex: /97 ([89A-E][0-9A-F])/, len: 2, rpn: 'DSE IND rr', params: 'reg-128' },
            { regex: /97 F([0-4])/, len: 2, rpn: 'DSE IND ST `stk`', params: 'stk' },
            { regex: /97 ([0-7][0-9A-F])/, len: 2, rpn: 'DSE rr', params: 'reg' },
            { regex: /98 7([0-4])/, len: 2, rpn: 'VIEW ST `stk`', params: 'stk' },
            { regex: /98 ([89A-E][0-9A-F])/, len: 2, rpn: 'VIEW IND rr', params: 'reg-128' },
            { regex: /98 F([0-4])/, len: 2, rpn: 'VIEW IND ST `stk`', params: 'stk' },
            { regex: /98 ([0-7][0-9A-F])/, len: 2, rpn: 'VIEW rr', params: 'reg' },
            { regex: /99 ([89A-E][0-9A-F])/, len: 2, rpn: 'ΣREG IND rr', params: 'reg-128' },
            { regex: /99 F([0-4])/, len: 2, rpn: 'ΣREG IND ST `stk`', params: 'stk' },
            { regex: /99 ([0-7][0-9A-F])/, len: 2, rpn: 'ΣREG rr', params: 'reg' },
            { regex: /9A 7([0-4])/, len: 2, rpn: 'ASTO ST `stk`', params: 'stk' },
            { regex: /9A ([89A-E][0-9A-F])/, len: 2, rpn: 'ASTO IND rr', params: 'reg-128' },
            { regex: /9A F([0-4])/, len: 2, rpn: 'ASTO IND ST `stk`', params: 'stk' },
            { regex: /9A ([0-7][0-9A-F])/, len: 2, rpn: 'ASTO rr', params: 'reg' },
            { regex: /9B 7([0-4])/, len: 2, rpn: 'ARCL ST `stk`', params: 'stk' },
            { regex: /9B ([89A-E][0-9A-F])/, len: 2, rpn: 'ARCL IND rr', params: 'reg-128' },
            { regex: /9B F([0-4])/, len: 2, rpn: 'ARCL IND ST `stk`', params: 'stk' },
            { regex: /9B ([0-7][0-9A-F])/, len: 2, rpn: 'ARCL rr', params: 'reg' },
            { regex: /9C ([89A-E][0-9A-F])/, len: 2, rpn: 'FIX IND rr', params: 'reg-128' },
            { regex: /9C F([0-4])/, len: 2, rpn: 'FIX IND ST `stk`', params: 'stk' },
            { regex: /9C (0[0-9])/, len: 2, rpn: 'FIX sd', params: 'dig' },
            { regex: /9D ([89A-E][0-9A-F])/, len: 2, rpn: 'SCI IND rr', params: 'reg-128' },
            { regex: /9D F([0-4])/, len: 2, rpn: 'SCI IND ST `stk`', params: 'stk' },
            { regex: /9D (0[0-9])/, len: 2, rpn: 'SCI sd', params: 'dig' },
            { regex: /9E ([89A-E][0-9A-F])/, len: 2, rpn: 'ENG IND rr', params: 'reg-128' },
            { regex: /9E F([0-4])/, len: 2, rpn: 'ENG IND ST `stk`', params: 'stk' },
            { regex: /9E (0[0-9])/, len: 2, rpn: 'ENG sd', params: 'dig' },
            { regex: /9F ([89A-E][0-9A-F])/, len: 2, rpn: 'TONE IND rr', params: 'reg-128' },
            { regex: /9F F([0-4])/, len: 2, rpn: 'TONE IND ST `stk`', params: 'stk' },
            { regex: /9F (0[0-9])/, len: 2, rpn: 'TONE tn', params: 'ton' } //+
        ]
    },
    {
        key: 'A',
        value: [
            { regex: /A0 61/, len: 2, rpn: 'SINH' },
            { regex: /A0 62/, len: 2, rpn: 'COSH' },
            { regex: /A0 63/, len: 2, rpn: 'TANH' },
            { regex: /A0 64/, len: 2, rpn: 'ASINH' },
            { regex: /A0 65/, len: 2, rpn: 'ATANH' },
            { regex: /A0 66/, len: 2, rpn: 'ACOSH' },
            { regex: /A0 6F/, len: 2, rpn: 'COMB' },
            { regex: /A0 70/, len: 2, rpn: 'PERM' },
            { regex: /A0 71/, len: 2, rpn: 'RAN' },
            { regex: /A0 72/, len: 2, rpn: 'COMPLEX' },
            { regex: /A0 73/, len: 2, rpn: 'SEED' },
            { regex: /A0 74/, len: 2, rpn: 'GAMMA' },
            { regex: /A0 9F/, len: 2, rpn: 'BEST' },
            { regex: /A0 A0/, len: 2, rpn: 'EXPF' },
            { regex: /A0 A1/, len: 2, rpn: 'LINF' },
            { regex: /A0 A2/, len: 2, rpn: 'LOGF' },
            { regex: /A0 A3/, len: 2, rpn: 'PWRF' },
            { regex: /A0 A4/, len: 2, rpn: 'SLOPE' },
            { regex: /A0 A5/, len: 2, rpn: 'SUM' },
            { regex: /A0 A6/, len: 2, rpn: 'YINT' },
            { regex: /A0 A7/, len: 2, rpn: 'CORR' },
            { regex: /A0 A8/, len: 2, rpn: 'FCSTX' },
            { regex: /A0 A9/, len: 2, rpn: 'FCSTY' },
            { regex: /A0 AA/, len: 2, rpn: 'INSR' },
            { regex: /A0 AB/, len: 2, rpn: 'DELR' },
            { regex: /A0 AC/, len: 2, rpn: 'WMEAN' },
            { regex: /A0 AD/, len: 2, rpn: 'LINΣ' },
            { regex: /A0 AE/, len: 2, rpn: 'ALLΣ' },
            { regex: /A0 E2/, len: 2, rpn: 'HEXM' },
            { regex: /A0 E3/, len: 2, rpn: 'DECM' },
            { regex: /A0 E4/, len: 2, rpn: 'OCTM' },
            { regex: /A0 E5/, len: 2, rpn: 'BINM' },
            { regex: /A0 E6/, len: 2, rpn: 'BASE+' },
            { regex: /A0 E7/, len: 2, rpn: 'BASE-' },
            { regex: /A0 E8/, len: 2, rpn: 'BASE×' },
            { regex: /A0 E9/, len: 2, rpn: 'BASE÷' },
            { regex: /A0 EA/, len: 2, rpn: 'BASE±' },
            { regex: /A2 59/, len: 2, rpn: 'POLAR' },
            { regex: /A2 5A/, len: 2, rpn: 'RECT' },
            { regex: /A2 5B/, len: 2, rpn: 'RDX.' },
            { regex: /A2 5C/, len: 2, rpn: 'RDX,' },
            { regex: /A2 5D/, len: 2, rpn: 'ALL' },
            { regex: /A2 5E/, len: 2, rpn: 'MENU' },
            { regex: /A2 5F/, len: 2, rpn: 'X≥0?' },
            { regex: /A2 60/, len: 2, rpn: 'X≥Y?' },
            { regex: /A2 62/, len: 2, rpn: 'CLKEYS' },
            { regex: /A2 63/, len: 2, rpn: 'KEYASN' },
            { regex: /A2 64/, len: 2, rpn: 'LCLBL' },
            { regex: /A2 65/, len: 2, rpn: 'REAL?' },
            { regex: /A2 66/, len: 2, rpn: 'MAT?' },
            { regex: /A2 67/, len: 2, rpn: 'CPX?' },
            { regex: /A2 68/, len: 2, rpn: 'STR?' },
            { regex: /A2 6A/, len: 2, rpn: 'CPXRES' },
            { regex: /A2 6B/, len: 2, rpn: 'REALRES' },
            { regex: /A2 6C/, len: 2, rpn: 'EXITALL' },
            { regex: /A2 6D/, len: 2, rpn: 'CLMENU' },
            { regex: /A2 6E/, len: 2, rpn: 'GETKEY' },
            { regex: /A2 6F/, len: 2, rpn: 'CUSTOM' },
            { regex: /A2 70/, len: 2, rpn: 'ON' },
            { regex: /A5 87/, len: 2, rpn: 'NOT' },
            { regex: /A5 88/, len: 2, rpn: 'AND' },
            { regex: /A5 89/, len: 2, rpn: 'OR' },
            { regex: /A5 8A/, len: 2, rpn: 'XOR' },
            { regex: /A5 8B/, len: 2, rpn: 'ROTXY' },
            { regex: /A5 8C/, len: 2, rpn: 'BIT?' },
            { regex: /A6 31/, len: 2, rpn: 'AIP' },
            { regex: /A6 41/, len: 2, rpn: 'ALENG' },
            { regex: /A6 46/, len: 2, rpn: 'AROT' },
            { regex: /A6 47/, len: 2, rpn: 'ATOX' },
            { regex: /A6 5C/, len: 2, rpn: 'POSA' },
            { regex: /A6 6F/, len: 2, rpn: 'XTOA' },
            { regex: /A6 78/, len: 2, rpn: 'ΣREG?' },
            { regex: /A6 81/, len: 2, rpn: 'ADATE' },
            { regex: /A6 84/, len: 2, rpn: 'ATIME' },
            { regex: /A6 85/, len: 2, rpn: 'ATIME24' },
            { regex: /A6 86/, len: 2, rpn: 'CLK12' },
            { regex: /A6 87/, len: 2, rpn: 'CLK24' },
            { regex: /A6 8C/, len: 2, rpn: 'DATE' },
            { regex: /A6 8D/, len: 2, rpn: 'DATE+' },
            { regex: /A6 8E/, len: 2, rpn: 'DDAYS' },
            { regex: /A6 8F/, len: 2, rpn: 'DMY' },
            { regex: /A6 90/, len: 2, rpn: 'DOW' },
            { regex: /A6 91/, len: 2, rpn: 'MDY' },
            { regex: /A6 9C/, len: 2, rpn: 'TIME' },
            { regex: /A6 C9/, len: 2, rpn: 'TRANS' },
            { regex: /A6 CA/, len: 2, rpn: 'CROSS' },
            { regex: /A6 CB/, len: 2, rpn: 'DOT' },
            { regex: /A6 CC/, len: 2, rpn: 'DET' },
            { regex: /A6 CD/, len: 2, rpn: 'UVEC' },
            { regex: /A6 CE/, len: 2, rpn: 'INVRT' },
            { regex: /A6 CF/, len: 2, rpn: 'FNRM' },
            { regex: /A6 D0/, len: 2, rpn: 'RSUM' },
            { regex: /A6 D1/, len: 2, rpn: 'R<>R' },
            { regex: /A6 D2/, len: 2, rpn: 'I+' },
            { regex: /A6 D3/, len: 2, rpn: 'I-' },
            { regex: /A6 D4/, len: 2, rpn: 'J+' },
            { regex: /A6 D5/, len: 2, rpn: 'J-' },
            { regex: /A6 D6/, len: 2, rpn: 'STOEL' },
            { regex: /A6 D7/, len: 2, rpn: 'RCLEL' },
            { regex: /A6 D8/, len: 2, rpn: 'STOIJ' },
            { regex: /A6 D9/, len: 2, rpn: 'RCLIJ' },
            { regex: /A6 DA/, len: 2, rpn: 'NEWMAT' },
            { regex: /A6 DB/, len: 2, rpn: 'OLD' },
            { regex: /A6 DC/, len: 2, rpn: '←' },
            { regex: /A6 DD/, len: 2, rpn: '→' },
            { regex: /A6 DE/, len: 2, rpn: '↑' },
            { regex: /A6 DF/, len: 2, rpn: '↓' },
            { regex: /A6 E1/, len: 2, rpn: 'EDIT' },
            { regex: /A6 E2/, len: 2, rpn: 'WRAP' },
            { regex: /A6 E3/, len: 2, rpn: 'GROW' },
            { regex: /A6 E7/, len: 2, rpn: 'DIM?' },
            { regex: /A6 E8/, len: 2, rpn: 'GETM' },
            { regex: /A6 E9/, len: 2, rpn: 'PUTM' },
            { regex: /A6 EA/, len: 2, rpn: '[MIN]' },
            { regex: /A6 EB/, len: 2, rpn: '[MAX]' },
            { regex: /A6 EC/, len: 2, rpn: '[FIND]' },
            { regex: /A6 ED/, len: 2, rpn: 'RNRM' },
            { regex: /A7 48/, len: 2, rpn: 'PRA' },
            { regex: /A7 52/, len: 2, rpn: 'PRΣ' },
            { regex: /A7 53/, len: 2, rpn: 'PRSTK' },
            { regex: /A7 54/, len: 2, rpn: 'PRX' },
            { regex: /A7 5B/, len: 2, rpn: 'MAN' },
            { regex: /A7 5C/, len: 2, rpn: 'NORM' },
            { regex: /A7 5D/, len: 2, rpn: 'TRACE' },
            { regex: /A7 5E/, len: 2, rpn: 'PRON' },
            { regex: /A7 5F/, len: 2, rpn: 'PROFF' },
            { regex: /A7 60/, len: 2, rpn: 'DELAY' },
            { regex: /A7 61/, len: 2, rpn: 'PRUSR' },
            { regex: /A7 62/, len: 2, rpn: 'PRLCD' },
            { regex: /A7 63/, len: 2, rpn: 'CLLCD' },
            { regex: /A7 64/, len: 2, rpn: 'AGRAPH' },
            { regex: /A7 65/, len: 2, rpn: 'PIXEL' },
            { regex: /A7 CF/, len: 2, rpn: 'ACCEL' },
            { regex: /A7 D0/, len: 2, rpn: 'LOCAT' },
            { regex: /A7 D1/, len: 2, rpn: 'HEADING' },
            { regex: /A8 ([89A-E][0-9A-F])/, len: 2, rpn: 'SF IND rr', params: 'reg-128' },
            { regex: /A8 F([0-4])/, len: 2, rpn: 'SF IND ST `stk`', params: 'stk' },
            { regex: /A8 ([0-7][0-9A-F])/, len: 2, rpn: 'SF fl', params: 'flg' },
            { regex: /A9 ([89A-E][0-9A-F])/, len: 2, rpn: 'CF IND rr', params: 'reg-128' },
            { regex: /A9 F([0-4])/, len: 2, rpn: 'CF IND ST `stk`', params: 'stk' },
            { regex: /A9 ([0-7][0-9A-F])/, len: 2, rpn: 'CF fl', params: 'flg' },
            { regex: /AA ([89A-E][0-9A-F])/, len: 2, rpn: 'FS?C IND rr', params: 'reg-128' },
            { regex: /AA F([0-4])/, len: 2, rpn: 'FS?C IND ST `stk`', params: 'stk' },
            { regex: /AA ([0-7][0-9A-F])/, len: 2, rpn: 'FS?C fl', params: 'flg' },
            { regex: /AB ([89A-E][0-9A-F])/, len: 2, rpn: 'FC?C IND rr', params: 'reg-128' },
            { regex: /AB F([0-4])/, len: 2, rpn: 'FC?C IND ST `stk`', params: 'stk' },
            { regex: /AB ([0-7][0-9A-F])/, len: 2, rpn: 'FC?C fl', params: 'flg' },
            { regex: /AC ([89A-E][0-9A-F])/, len: 2, rpn: 'FS? IND rr', params: 'reg-128' },
            { regex: /AC F([0-4])/, len: 2, rpn: 'FS? IND ST `stk`', params: 'stk' },
            { regex: /AC ([0-7][0-9A-F])/, len: 2, rpn: 'FS? fl', params: 'flg' },
            { regex: /AD ([89A-E][0-9A-F])/, len: 2, rpn: 'FC? IND rr', params: 'reg-128' },
            { regex: /AD F([0-4])/, len: 2, rpn: 'FC? IND ST `stk`', params: 'stk' },
            { regex: /AD ([0-7][0-9A-F])/, len: 2, rpn: 'FC? fl', params: 'flg' },
            { regex: /AE 7([0-4])/, len: 2, rpn: 'GTO IND ST `stk`', params: 'stk' },
            { regex: /AE ([89A-E][0-9A-F])/, len: 2, rpn: 'XEQ IND rr', params: 'reg-128' },
            { regex: /AE F([0-4])/, len: 2, rpn: 'XEQ IND ST `stk`', params: 'stk' },
            { regex: /AE ([0-7][0-9A-F])/, len: 2, rpn: 'GTO IND rr', params: 'reg' }
        ]
    },
    {
        key: 'B',
        value: [
            { regex: /B([1-9A-F]) 00/, len: 2, rpn: 'GTO sl', params: 'lblno-1' } //+ dec: 01-14, l+1: 2-F
            // GTO 14  BF 00
        ]
    },
    {
        key: 'C',
        value: [
            { regex: /C0 00 0D/, len: 3, rpn: 'END' },
            { regex: /C0 00 F([1-9A-F]) 00/, len: 4, rpn: 'LBL `lbl`', params: 'lbll-1' },
            { regex: /CE 7([0-4])/, len: 2, rpn: 'X<> ST `stk`', params: 'stk' },
            { regex: /CE ([89A-E][0-9A-F])/, len: 2, rpn: 'X<> IND rr', params: 'reg-128' },
            { regex: /CE F([0-4])/, len: 2, rpn: 'X<> IND ST `stk`', params: 'stk' },
            { regex: /CE ([0-6][0-9A-F])/, len: 2, rpn: 'X<> rr', params: 'reg' },
            { regex: /CF ([0-7][0-9A-F])/, len: 2, rpn: 'LBL ll', params: 'lblno' } //+
            // LBL 99  CF 63 dec:16-99; hex:10-63
            // LBL A   CF 66
            // LBL J   CF 6F
            // LBL a   CF 7B
            // LBL e   CF 7F
        ]
    },
    {
        key: 'D',
        value: [
            { regex: /D0 00 ([0-7][0-9A-F])/, len: 3, rpn: 'GTO ll', params: 'lblno' } //+
            // GTO 99  D0 00 63 dec:15-99 hex:0F-63
            // GTO A   D0 00 66
            // GTO J   D0 00 6F
            // GTO a   D0 00 7B
            // GTO e   D0 00 7F
        ]
    },
    {
        key: 'E',
        value: [
            { regex: /E0 00 ([0-7][0-9A-F])/, len: 3, rpn: 'XEQ ll', params: 'lblno' } //+
            // XEQ 14  E0 00 0E dec:15-99 hex:0F-63
            // XEQ 99  E0 00 63
            // XEQ A   E0 00 66
            // XEQ J   E0 00 6F
            // XEQ a   E0 00 7B
            // XEQ e   E0 00 7F
        ]
    },
    {
        key: 'F',
        value: [
            { regex: /F1 D5/, len: 2, rpn: 'FIX 10' },
            { regex: /F1 D6/, len: 2, rpn: 'SCI 10' },
            { regex: /F1 D7/, len: 2, rpn: 'ENG 10' },
            { regex: /F1 E5/, len: 2, rpn: 'FIX 11' },
            { regex: /F1 E6/, len: 2, rpn: 'SCI 11' },
            { regex: /F1 E7/, len: 2, rpn: 'ENG 11' },
            { regex: /F2 D0 7([0-4])/, len: 3, rpn: 'INPUT ST `stk`', params: 'stk' },
            { regex: /F2 D0 ([0-7][0-9A-F])/, len: 3, rpn: 'INPUT rr', params: 'reg' },
            { regex: /F2 D1 7([0-4])/, len: 3, rpn: 'RCL+ ST `stk`', params: 'stk' },
            { regex: /F2 D1 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL+ IND rr', params: 'reg-128' },
            { regex: /F2 D1 F([0-4])/, len: 3, rpn: 'RCL+ IND ST `stk`', params: 'stk' },
            { regex: /F2 D1 ([0-7][0-9A-F])/, len: 3, rpn: 'RCL+ rr', params: 'reg' },
            { regex: /F2 D2 7([0-4])/, len: 3, rpn: 'RCL- ST `stk`', params: 'stk' },
            { regex: /F2 D2 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL- IND rr', params: 'reg-128' },
            { regex: /F2 D2 F([0-4])/, len: 3, rpn: 'RCL- IND ST `stk`', params: 'stk' },
            { regex: /F2 D2 ([0-7][0-9A-F])/, len: 3, rpn: 'RCL- rr', params: 'reg' },
            { regex: /F2 D3 7([0-4])/, len: 3, rpn: 'RCL× ST `stk`', params: 'stk' },
            { regex: /F2 D3 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL× IND rr', params: 'reg-128' },
            { regex: /F2 D3 F([0-4])/, len: 3, rpn: 'RCL× IND ST `stk`', params: 'stk' },
            { regex: /F2 D3 ([0-7][0-9A-F])/, len: 3, rpn: 'RCL× rr', params: 'reg' },
            { regex: /F2 D4 7([0-4])/, len: 3, rpn: 'RCL÷ ST `stk`', params: 'stk' },
            { regex: /F2 D4 ([89A-E][0-9A-F])/, len: 3, rpn: 'RCL÷ IND rr', params: 'reg-128' },
            { regex: /F2 D4 F([0-4])/, len: 3, rpn: 'RCL÷ IND ST `stk`', params: 'stk' },
            { regex: /F2 D4 ([0-7][0-9A-F])/, len: 3, rpn: 'RCL÷ rr', params: 'reg' },
            { regex: /F2 D8 ([89A-E][0-9A-F])/, len: 3, rpn: 'CLV IND rr', params: 'reg-128' },
            { regex: /F2 D8 F([0-4])/, len: 3, rpn: 'CLV IND ST `stk`', params: 'stk' },
            { regex: /F2 D9 ([89A-E][0-9A-F])/, len: 3, rpn: 'PRV IND rr', params: 'reg-128' },
            { regex: /F2 D9 F([0-4])/, len: 3, rpn: 'PRV IND ST `stk`', params: 'stk' },
            { regex: /F2 DA ([89A-E][0-9A-F])/, len: 3, rpn: 'INDEX IND rr', params: 'reg-128' },
            { regex: /F2 DA F([0-4])/, len: 3, rpn: 'INDEX IND ST `stk`', params: 'stk' },
            { regex: /F2 E8 ([89A-E][0-9A-F])/, len: 3, rpn: 'PGMINT IND rr', params: 'reg-128' },
            { regex: /F2 E8 F([0-4])/, len: 3, rpn: 'PGMINT IND ST `stk`', params: 'stk' },
            { regex: /F2 E9 ([89A-E][0-9A-F])/, len: 3, rpn: 'PGMSLV IND rr', params: 'reg-128' },
            { regex: /F2 E9 F([0-4])/, len: 3, rpn: 'PGMSLV IND ST `stk`', params: 'stk' },
            { regex: /F2 EA ([89A-E][0-9A-F])/, len: 3, rpn: 'INTEG IND rr', params: 'reg-128' },
            { regex: /F2 EA F([0-4])/, len: 3, rpn: 'INTEG IND ST `stk`', params: 'stk' },
            { regex: /F2 EB ([89A-E][0-9A-F])/, len: 3, rpn: 'SOLVE IND rr', params: 'reg-128' },
            { regex: /F2 EB F([0-4])/, len: 3, rpn: 'SOLVE IND ST `stk`', params: 'stk' },
            { regex: /F2 EC ([89A-E][0-9A-F])/, len: 3, rpn: 'DIM IND rr', params: 'reg-128' },
            { regex: /F2 EC F([0-4])/, len: 3, rpn: 'DIM IND ST `stk`', params: 'stk' },
            { regex: /F2 EE ([89A-E][0-9A-F])/, len: 3, rpn: 'INPUT IND rr', params: 'reg-128' },
            { regex: /F2 EE F([0-4])/, len: 3, rpn: 'INPUT IND ST `stk`', params: 'stk' },
            { regex: /F2 EF ([89A-E][0-9A-F])/, len: 3, rpn: 'EDITN IND rr', params: 'reg-128' },
            { regex: /F2 EF F([0-4])/, len: 3, rpn: 'EDITN IND ST `stk`', params: 'stk' },
            { regex: /F2 F8 ([89A-E][0-9A-F])/, len: 3, rpn: 'VARMENU IND rr', params: 'reg-128' },
            { regex: /F2 F8 F([0-4])/, len: 3, rpn: 'VARMENU IND ST `stk`', params: 'stk' },
            { regex: /F3 E2 (0[1-9]) ([89A-E][0-9A-F])/, len: 4, rpn: 'KEY `key` XEQ IND rr', params: 'key,reg-128' },
            { regex: /F3 E2 (0[1-9]) F([0-4])/, len: 4, rpn: 'KEY `key` XEQ IND ST `stk`', params: 'key,stk' },
            { regex: /F3 E2 (0[1-9]) ([0-7][0-9A-F])/, len: 4, rpn: 'KEY `key` XEQ ll', params: 'key,lblno' },
            { regex: /F3 E2 (0[1-9]) ([0-7][0-9A-F])/, len: 4, rpn: 'KEY `key` XEQ sl', params: 'key,lblno' },
            // ... XEQ 99  ... 63 dec:16-99; hex:10-63
            // ... XEQ A   ... 66
            // ... XEQ J   ... 6F
            // ... XEQ a   ... 7B
            // ... XEQ e   ... 7F
            { regex: /F3 E3 (0[1-9]) ([89A-E][0-9A-F])/, len: 4, rpn: 'KEY `key` GTO IND rr', params: 'key,reg-128' },
            { regex: /F3 E3 (0[1-9]) F([0-4])/, len: 4, rpn: 'KEY `key` GTO IND ST `stk`', params: 'key,stk' },
            { regex: /F3 E3 (0[1-9]) ([0-7][0-9A-F])/, len: 4, rpn: 'KEY `key` GTO ll', params: 'key,lblno' },
            { regex: /F3 E3 (0[1-9]) ([0-7][0-9A-F])/, len: 4, rpn: 'KEY `key` GTO sl', params: 'key,lblno' },
            { regex: /F3 F7 ([0-9A-F][0-9A-F] [0-9A-F][0-9A-F])/, len: 4, rpn: 'SIZE ss ss', params: 'size' },
            { regex: /F([1-9A-F]) 7F/, len: 2, rpn: '⊢`str`', params: 'strl-1' },
            { regex: /F([1-9A-F]) 80/, len: 2, rpn: 'VIEW `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 81/, len: 2, rpn: 'STO `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 82/, len: 2, rpn: 'STO+ `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 83/, len: 2, rpn: 'STO- `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 84/, len: 2, rpn: 'STO× `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 85/, len: 2, rpn: 'STO÷ `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 86/, len: 2, rpn: 'X<> `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 87/, len: 2, rpn: 'INDEX `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 88/, len: 2, rpn: 'VIEW IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 89/, len: 2, rpn: 'STO IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 8A/, len: 2, rpn: 'STO+ IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 8B/, len: 2, rpn: 'STO- IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 8C/, len: 2, rpn: 'STO× IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 8D/, len: 2, rpn: 'STO÷ IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 8E/, len: 2, rpn: 'X<> IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 8F/, len: 2, rpn: 'INDEX IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 90/, len: 2, rpn: 'MVAR `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 91/, len: 2, rpn: 'RCL `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 92/, len: 2, rpn: 'RCL+ `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 93/, len: 2, rpn: 'RCL- `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 94/, len: 2, rpn: 'RCL× `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 95/, len: 2, rpn: 'RCL÷ `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 96/, len: 2, rpn: 'ISG `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 97/, len: 2, rpn: 'DSE `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 99/, len: 2, rpn: 'RCL IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 9A/, len: 2, rpn: 'RCL+ IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 9B/, len: 2, rpn: 'RCL- IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 9C/, len: 2, rpn: 'RCL× IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 9D/, len: 2, rpn: 'RCL÷ IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 9E/, len: 2, rpn: 'ISG IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) 9F/, len: 2, rpn: 'DSE IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) A8/, len: 2, rpn: 'SF IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) A9/, len: 2, rpn: 'CF IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) AA/, len: 2, rpn: 'FS?C IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) AB/, len: 2, rpn: 'FC?C IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) AC/, len: 2, rpn: 'FS? IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) AD/, len: 2, rpn: 'FC? IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) AE/, len: 2, rpn: 'GTO IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) AF/, len: 2, rpn: 'XEQ IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) B0/, len: 2, rpn: 'CLV `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) B1/, len: 2, rpn: 'PRV `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) B2/, len: 2, rpn: 'ASTO `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) B3/, len: 2, rpn: 'ARCL `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) B4/, len: 2, rpn: 'PGMINT `lbl`', params: 'lbll-1' },
            { regex: /F([1-9A-F]) B5/, len: 2, rpn: 'PGMSLV `lbl`', params: 'lbll-1' },
            { regex: /F([1-9A-F]) B6/, len: 2, rpn: 'INTEG `lbl`', params: 'lbll-1' },
            { regex: /F([1-9A-F]) B7/, len: 2, rpn: 'SOLVE `lbl`', params: 'lbll-1' },
            { regex: /F([1-9A-F]) B8/, len: 2, rpn: 'CLV IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) B9/, len: 2, rpn: 'PRV IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) BA/, len: 2, rpn: 'ASTO IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) BB/, len: 2, rpn: 'ARCL IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) BC/, len: 2, rpn: 'PGMINT IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) BD/, len: 2, rpn: 'PGMSLV IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) BE/, len: 2, rpn: 'INTEG IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) BF/, len: 2, rpn: 'SOLVE IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) C0/, len: 2, rpn: 'ASSIGN `nam` TO `key`', params: 'naml-2,+key+1' },
            { regex: /F([1-9A-F]) C1/, len: 2, rpn: 'VARMENU `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) C2 (0[1-9])/, len: 3, rpn: 'KEY `key` XEQ `lbl`', params: 'lbll-2,key' },
            { regex: /F([1-9A-F]) C3 (0[1-9])/, len: 3, rpn: 'KEY `key` GTO `lbl`', params: 'lbll-2,key' },
            { regex: /F([1-9A-F]) C4/, len: 2, rpn: 'DIM `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) C5/, len: 2, rpn: 'INPUT `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) C6/, len: 2, rpn: 'EDITN `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) C9/, len: 2, rpn: 'VARMENU IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) CA (0[1-9])/, len: 3, rpn: 'KEY `key` XEQ IND `nam`', params: 'naml-2,key' },
            { regex: /F([1-9A-F]) CB (0[1-9])/, len: 3, rpn: 'KEY `key` GTO IND `nam`', params: 'naml-2,key' },
            { regex: /F([1-9A-F]) CC/, len: 2, rpn: 'DIM IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) CD/, len: 2, rpn: 'INPUT IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) CE/, len: 2, rpn: 'EDITN IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) DB/, len: 2, rpn: 'ΣREG IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) DC/, len: 2, rpn: 'FIX IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) DD/, len: 2, rpn: 'SCI IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) DE/, len: 2, rpn: 'ENG IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) DF/, len: 2, rpn: 'TONE IND `nam`', params: 'naml-1' },
            { regex: /F([1-9A-F]) F0/, len: 2, rpn: 'CLP `lbl`', params: 'lbll-1' },
            { regex: /F([1-9A-F])/, len: 1, rpn: '`str`', params: 'strl' } //+ max. length 15
        ]
    }
];
exports.Decoder42 = Decoder42;


/***/ }),

/***/ "./src/decoder/decoderresult.ts":
/*!**************************************!*\
  !*** ./src/decoder/decoderresult.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class DecoderResult {
    constructor() {
        this.programs = [];
        this.languageId = '';
    }
    succeeded() {
        let succeeded = true;
        this.programs.forEach(program => {
            succeeded = succeeded && program.succeeded();
        });
        return succeeded;
    }
    getFirstError() {
        let error;
        for (let index = 0; index < this.programs.length; index++) {
            const program = this.programs[index];
            error = program.getFirstError();
            if (error) {
                return error;
            }
        }
        return undefined;
    }
    getHex(eol, useWhitespaceBetweenHex, useLineNumbers) {
        let hexAll = '';
        this.programs.forEach(rpnprogram => {
            hexAll += rpnprogram.getHex(eol, useLineNumbers);
        });
        if (!useWhitespaceBetweenHex) {
            hexAll = hexAll.replace(/ /g, '');
        }
        return hexAll.trim();
    }
    getRpn(eol, useLineNumbers) {
        let rpn = '';
        this.programs.forEach(rpnprogram => {
            rpn += rpnprogram.getRpn(eol, useLineNumbers);
        });
        return rpn.trim();
    }
    getSize() {
        let size = 0;
        this.programs.forEach(rpnprogram => {
            size += rpnprogram.getSize();
        });
        return size;
    }
}
exports.DecoderResult = DecoderResult;


/***/ }),

/***/ "./src/decoder/rawparser.ts":
/*!**********************************!*\
  !*** ./src/decoder/rawparser.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const rpnline_1 = __webpack_require__(/*! ./rpnline */ "./src/decoder/rpnline.ts");
const decoder42_1 = __webpack_require__(/*! ./decoder42 */ "./src/decoder/decoder42.ts");
const rpnprogram_1 = __webpack_require__(/*! ./rpnprogram */ "./src/decoder/rpnprogram.ts");
const codeerror_1 = __webpack_require__(/*! ../common/codeerror */ "./src/common/codeerror.ts");
class RawParser {
    //#endregion
    //#region Public
    constructor(raw) {
        //#region Members
        this.debug = 0; // debug level 0=nothing, 1=minimal, 2=verbose
        this.programs = [];
        this.languageId = 'hp42s';
        this.codeLineNo = 0;
        this.number = '';
        this.readingNumber = false;
        this.raw = raw;
        // only one program used
        let program = new rpnprogram_1.RpnProgram();
        this.programs.push(program);
    }
    parse() {
        //index walking through byte array
        let index = 0;
        while (index < this.raw.length) {
            let length = 0;
            let b0 = this.raw[index];
            if (/1[0-9A-C]/.test(b0) || this.readingNumber) {
                //this.readingNumber || /1[0-9A-C]/.test(b0) || (/00/.test(b0) && this.readingNumber)
                length = this.parseNumber(index);
            }
            else {
                length = this.parseCommand(index);
            }
            // no match !
            if (length === 0) {
                // abort !
                break;
            }
            index = index + length;
        }
        let size = this.raw.length;
        if (size >= 3) {
            const end = this.raw[size - 3] + ' ' + this.raw[size - 2] + ' ' + this.raw[size - 1];
            if (end === 'C0 00 0D') {
                size -= 3;
            }
        }
        this.programs[0].size = size;
    }
    parseNumber(index) {
        let b0 = this.raw[index];
        // number detected
        if (!this.readingNumber) {
            this.readingNumber = true;
            this.number = '';
        }
        //put it together
        if (/(1[0-9A-C]|00)/.test(b0)) {
            this.number += b0 + ' ';
            //end of number ?
            if (/00/.test(b0)) {
                this.readingNumber = false;
                // create new line
                const rpnLine = new rpnline_1.RpnLine();
                rpnLine.docRaw = this.number.trim();
                rpnLine.rawLength = this.number.length / 3; //'00 '
                rpnLine.workCode = '`num`';
                rpnLine.params.num = this.number.trim();
                // collect rawLines
                this.pushLine(rpnLine);
            }
        }
        else {
            this.readingNumber = false;
            // create new line
            const rpnLine = new rpnline_1.RpnLine();
            rpnLine.docRaw = this.number;
            rpnLine.rawLength = this.number.length / 3; //'00 '
            rpnLine.error = new codeerror_1.CodeError(-1, index, b0 + ' ...', 'Unknown byte sequence for number');
            rpnLine.params.num = this.number.trim();
            // collect rawLines
            this.pushLine(rpnLine);
        }
        return 1;
    }
    parseCommand(index) {
        // new temp maps
        const b0 = this.raw[index];
        const n0 = b0[0];
        // create new line
        const rpnLine = new rpnline_1.RpnLine();
        let hex = '';
        // test first nibble
        if (decoder42_1.Decoder42.rawMap.has(n0)) {
            //get patterns from first nibble
            let patterns = decoder42_1.Decoder42.rawMap.get(n0);
            if (patterns) {
                //params
                let matched = false;
                // walk through all patterns
                for (let i = 0; i < patterns.length; i++) {
                    // get
                    const pattern = patterns[i];
                    //get first n-bytes from raw
                    hex = '';
                    for (let j = 0; j < pattern.len; j++) {
                        hex += this.raw[index + j] + ' ';
                    }
                    hex = hex.trim();
                    //hp42s/free42 ?
                    this.checkLanguageId(pattern, hex);
                    //match ?
                    let match = hex.match(pattern.regex);
                    if (match) {
                        rpnLine.rawLength = pattern.len;
                        // offset
                        const next = index + pattern.len;
                        // read parameters
                        this.checkParamsInMatch(rpnLine, next, pattern, match);
                        // check if strings are too long ?
                        if (this.checkParseLength(rpnLine, next)) {
                            break;
                        }
                        // check if str/lbl/nam found and adjust length ...
                        rpnLine.rawLength += this.readStringParams(rpnLine, next);
                        // increase length for
                        // 'ASSIGN `nam` TO key'
                        // 'KEY `key` GTO (|IND) `nam`'
                        // 'KEY `key` XEQ (|IND) `nam`'
                        // get all raw bytes of this code line
                        hex += ' ';
                        for (let j = pattern.len; j < rpnLine.rawLength; j++) {
                            hex += this.raw[index + j] + ' ';
                        }
                        hex = hex.trim();
                        // fill RpnLine
                        rpnLine.docRaw = hex;
                        rpnLine.workCode = pattern.rpn;
                        // collect rawLines
                        this.pushLine(rpnLine);
                        // someting matched successfully
                        matched = true;
                        break;
                    }
                }
                // no match, then error ...
                if (!matched) {
                    rpnLine.docRaw = b0;
                    rpnLine.error = new codeerror_1.CodeError(-1, index, b0 + ' ...', 'Unknown byte sequence');
                    this.pushLine(rpnLine);
                }
            }
        }
        else {
            // unknown nibble
            rpnLine.docRaw = hex;
            rpnLine.error = new codeerror_1.CodeError(-1, index, b0 + ' ...', 'Unknown byte sequence');
            this.pushLine(rpnLine);
        }
        return rpnLine.rawLength;
    }
    //#endregion
    //#region Private Methods
    /** Check all given matches to named params */
    checkParamsInMatch(rpnLine, next, pattern, match) {
        if (pattern.params) {
            const params = pattern.params.split(',');
            // assign params like regex named groups
            for (let p = 0; p < params.length; p++) {
                const param = params[p];
                let k = p + 1;
                switch (true) {
                    case param === 'strl-2':
                        rpnLine.params.strl = parseInt(match[k], 16) - 2;
                        break;
                    case param === 'strl-1':
                        rpnLine.params.strl = parseInt(match[k], 16) - 1;
                        break;
                    case param === 'strl':
                        rpnLine.params.strl = parseInt(match[k], 16);
                        break;
                    case param === 'lblno-1':
                        rpnLine.params.lblno = parseInt(match[k], 16) - 1;
                        break;
                    case param === 'lblno':
                        rpnLine.params.lblno = parseInt(match[k], 16);
                        break;
                    case param === 'lbll-2':
                        rpnLine.params.lbll = parseInt(match[k], 16) - 2;
                        break;
                    case param === 'lbll-1':
                        rpnLine.params.lbll = parseInt(match[k], 16) - 1;
                        break;
                    case param === 'lbll':
                        rpnLine.params.lbll = parseInt(match[k], 16);
                        break;
                    case param === 'naml-2':
                        rpnLine.params.naml = parseInt(match[k], 16) - 2;
                        break;
                    case param === 'naml-1':
                        rpnLine.params.naml = parseInt(match[k], 16) - 1;
                        break;
                    case param === 'naml':
                        rpnLine.params.naml = parseInt(match[k], 16);
                        break;
                    case param === 'reg-128':
                        rpnLine.params.reg = match[k];
                        rpnLine.params.regno = parseInt(match[k], 16) - 128;
                        break;
                    case param === 'reg':
                        rpnLine.params.reg = match[k];
                        rpnLine.params.regno = parseInt(match[k], 16);
                        break;
                    case param === 'stk':
                        rpnLine.params.stkno = parseInt(match[k], 16);
                        if (decoder42_1.Decoder42.stackMap.has(rpnLine.params.stkno)) {
                            rpnLine.params.stk = decoder42_1.Decoder42.stackMap.get(rpnLine.params.stkno);
                        }
                        break;
                    case param === 'dig':
                        rpnLine.params.dig = match[k];
                        rpnLine.params.digno = parseInt(match[k], 16);
                        break;
                    case param === 'flg':
                        rpnLine.params.flg = match[k];
                        rpnLine.params.flgno = parseInt(match[k], 16);
                        break;
                    case param === '+key+1':
                        // fetch key-byte after name
                        rpnLine.params.key = rpnLine.params.naml ? this.raw[next + rpnLine.params.naml] : undefined;
                        rpnLine.params.keyno = rpnLine.params.naml ? parseInt(this.raw[next + rpnLine.params.naml], 16) + 1 : undefined;
                        // include key byte
                        rpnLine.rawLength++;
                        break;
                    case param === 'key':
                        rpnLine.params.key = match[k];
                        rpnLine.params.keyno = parseInt(match[k], 16);
                        break;
                    case param === 'size':
                        rpnLine.params.siz = match[k];
                        rpnLine.params.sizno = parseInt(match[k].replace(' ', ''), 16);
                    case param === 'ton':
                        rpnLine.params.ton = match[k];
                        rpnLine.params.tonno = parseInt(match[k], 16);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    checkParseLength(rpnLine, next) {
        const rawlength = this.raw.length;
        if ((rpnLine.params.strl !== undefined) && (next + rpnLine.params.strl >= rawlength)) {
            return true;
        }
        if ((rpnLine.params.lbll !== undefined) && (next + rpnLine.params.lbll >= rawlength)) {
            return true;
        }
        if ((rpnLine.params.naml !== undefined) && (next + rpnLine.params.naml >= rawlength)) {
            return true;
        }
        return false;
    }
    /** Check if str/lbl/nam found and adjust length */
    readStringParams(rpnLine, next) {
        if (rpnLine.params.strl !== undefined) {
            rpnLine.params.str = '';
            // where the string starts ...
            for (let j = 0; j < rpnLine.params.strl; j++) {
                rpnLine.params.str += this.raw[next + j] + ' ';
            }
            rpnLine.params.str = rpnLine.params.str.trim();
            return rpnLine.params.strl;
        }
        if (rpnLine.params.lbll !== undefined) {
            rpnLine.params.lbl = '';
            // where the string starts ...
            for (let j = 0; j < rpnLine.params.lbll; j++) {
                rpnLine.params.lbl += this.raw[next + j] + ' ';
            }
            rpnLine.params.lbl = rpnLine.params.lbl.trim();
            return rpnLine.params.lbll;
        }
        if (rpnLine.params.naml !== undefined) {
            rpnLine.params.nam = '';
            // where the string starts ...
            for (let j = 0; j < rpnLine.params.naml; j++) {
                rpnLine.params.nam += this.raw[next + j] + ' ';
            }
            rpnLine.params.nam = rpnLine.params.nam.trim();
            return rpnLine.params.naml;
        }
        return 0;
    }
    checkLanguageId(pattern, hex) {
        if (pattern.len === 2) {
            // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
            let free42All = 'A7 CF' +
                ' ' + // ACCEL
                'A7 D0' +
                ' ' + // LOCAT'
                'A7 D1' +
                ' ' + // HEADING'
                'A6 81' +
                ' ' + // ADATE
                'A6 84' +
                ' ' + // ATIME
                'A6 85' +
                ' ' + // ATIME24
                'A6 86' +
                ' ' + // CLK12
                'A6 87' +
                ' ' + // CLK24
                'A6 8C' +
                ' ' + // DATE
                'A6 8D' +
                ' ' + // DATE+
                'A6 8E' +
                ' ' + // DDAYS
                'A6 8F' +
                ' ' + // DMY
                'A6 90' +
                ' ' + // DOW
                'A6 91' +
                ' ' + // MDY
                'A6 9C' +
                ' '; // TIME
            let isFree42 = free42All.match(hex);
            if (isFree42) {
                this.languageId = 'free42';
            }
        }
    }
    pushLine(rpnLine) {
        this.codeLineNo++;
        rpnLine.codeLineNo = this.codeLineNo;
        if (this.debug > 0) {
            console.log(rpnLine.docRaw + ' -> ' + rpnLine.workCode);
        }
        this.programs[0].addLine(rpnLine);
    }
}
exports.RawParser = RawParser;


/***/ }),

/***/ "./src/decoder/rpnline.ts":
/*!********************************!*\
  !*** ./src/decoder/rpnline.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const params_1 = __webpack_require__(/*! ../common/params */ "./src/common/params.ts");
class RpnLine {
    constructor() {
        this.codeLineNo = 0;
        /** original raw bytes from the document */
        this.docRaw = '';
        this.rawLength = 0;
        this.params = new params_1.Params();
    }
    hasError() {
        return !(this.error === undefined);
    }
    toString() {
        return this.codeLineNo + ': ' + this.docRaw + ', ' + this.workCode + (this.error ? ', ' + this.error : '');
    }
}
exports.RpnLine = RpnLine;


/***/ }),

/***/ "./src/decoder/rpnprogram.ts":
/*!***********************************!*\
  !*** ./src/decoder/rpnprogram.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class RpnProgram {
    constructor() {
        this.rpnLines = [];
        this.size = 0;
    }
    succeeded() {
        return !(this.getFirstError() !== undefined);
    }
    getFirstError() {
        const errors = this.getErrors();
        if (errors) {
            return errors[0];
        }
        return undefined;
    }
    getErrors() {
        const errors = [];
        this.rpnLines.forEach(rpnLine => {
            // when error ...
            if (rpnLine.error) {
                // push error ...
                errors.push(rpnLine.error);
            }
        });
        return errors;
    }
    getHex(eol, useLineNumbers) {
        let rawAll = '';
        this.rpnLines.forEach(rpnLine => {
            rawAll += (useLineNumbers ? (rpnLine.codeLineNo < 10 ? '0' + rpnLine.codeLineNo : rpnLine.codeLineNo) + ': ' : '') + rpnLine.docRaw + eol;
        });
        return rawAll.trim();
    }
    getRpn(eol, useLineNumbers) {
        let rpnAll = '';
        this.rpnLines.forEach(rpnLine => {
            rpnAll += (useLineNumbers ? (rpnLine.codeLineNo < 10 ? '0' + rpnLine.codeLineNo : rpnLine.codeLineNo) + ' ' : '') + rpnLine.workCode + eol;
        });
        return rpnAll.trim();
    }
    getSize() {
        return this.size;
    }
    addLine(rpnLine) {
        this.rpnLines.push(rpnLine);
    }
}
exports.RpnProgram = RpnProgram;


/***/ }),

/***/ "./src/encoder/encoder.ts":
/*!********************************!*\
  !*** ./src/encoder/encoder.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const encoder42_1 = __webpack_require__(/*! ./encoder42 */ "./src/encoder/encoder42.ts");
const encoderesult_1 = __webpack_require__(/*! ./encoderesult */ "./src/encoder/encoderesult.ts");
const rpnparser_1 = __webpack_require__(/*! ./rpnparser */ "./src/encoder/rpnparser.ts");
const configuration_1 = __webpack_require__(/*! ../common/configuration */ "./src/common/configuration.ts");
class Encoder {
    constructor() {
        encoder42_1.Encoder42.initialize();
    }
    /** Encode RPN to raw */
    encode(languageId, editor) {
        const parser = new rpnparser_1.RpnParser();
        parser.document = editor.document;
        parser.config = new configuration_1.Configuration(true);
        parser.parse();
        parser.programs.forEach(program => {
            program.rawLines.forEach(rawLine => {
                encoder42_1.Encoder42.toRaw(rawLine, languageId);
            });
        });
        // return result
        const result = new encoderesult_1.EncoderResult();
        result.programs = parser.programs;
        return result;
    }
    dispose() { }
}
exports.Encoder = Encoder;


/***/ }),

/***/ "./src/encoder/encoder42.ts":
/*!**********************************!*\
  !*** ./src/encoder/encoder42.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const codeerror_1 = __webpack_require__(/*! ../common/codeerror */ "./src/common/codeerror.ts");
/** FOCAL (Forty-one calculator language) see https://en.wikipedia.org/wiki/FOCAL_(Hewlett-Packard) */
class Encoder42 {
    //#endregion
    //#region Public
    static initialize() {
        if (!Encoder42.initialized) {
            // transform arr_rpnMap -> rpnMap
            Encoder42.arr_rpnMap.forEach(e => {
                Encoder42.rpnMap.set(e.key, e.value);
            });
            // transform arr_stackMap -> stackMap
            Encoder42.arr_stackMap.forEach(e => {
                Encoder42.stackMap.set(e.key, e.value);
            });
            // transform arr_charMap -> charMap
            Encoder42.arr_charCodeMap.forEach(e => {
                Encoder42.charCodeMap.set(e.key, e.value);
            });
            Encoder42.initialized = true;
        }
    }
    static toRaw(rawLine, languageId) {
        let progErrorText;
        let languageIdFromCode = '';
        if (rawLine.workCode !== undefined) {
            // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
            languageIdFromCode = Encoder42.getLanguageIdFromCode(rawLine, languageId);
            if (languageId !== languageIdFromCode) {
                progErrorText = "free42 command '" + rawLine.token + "' in hp42s program";
            }
            if (progErrorText === undefined) {
                if (rawLine.tokenLength === 1) {
                    //#region 1 Token
                    if ((rawLine.params.str !== undefined) && (rawLine.workCode.match(/^(⊢|)`str`/))) {
                        // is it a string ...
                        rawLine.raw = Encoder42.insertStringInRaw(rawLine.raw, rawLine.params.str);
                    }
                    else if ((rawLine.params.num !== undefined) && (rawLine.workCode.match(/^`num`/))) {
                        // is it a simple number ...
                        rawLine.raw = Encoder42.convertNumberToRaw(rawLine.params.num);
                    }
                    else if (rawLine.token !== undefined) {
                        // is it a single "fixed" opcode ...
                    }
                    if (rawLine.raw === undefined) {
                        progErrorText = "Unknown '" + rawLine.docCode + "'";
                    }
                    // Some error ...
                    if (progErrorText !== undefined) {
                        rawLine.error = new codeerror_1.CodeError(rawLine.docLine, rawLine.codeLineNo, rawLine.docCode, String(progErrorText));
                    }
                    //#endregion
                }
                else {
                    //#region n Tokens
                    // is it a string ...
                    // 1. Insert Name
                    // KEY `key` GTO IND `nam`
                    // ASSIGN `nam` TO `key`
                    if (rawLine.params.nam !== undefined) {
                        rawLine.raw = Encoder42.insertStringInRaw(rawLine.raw, rawLine.params.nam);
                    }
                    // is it a key ...
                    // 2. Insert key
                    // KEY `key` GTO IND `nam`
                    // ASSIGN `nam` TO `key`
                    if (rawLine.params.keyno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.keyno);
                    }
                    // is it a global label ...
                    if (rawLine.params.lbl !== undefined) {
                        rawLine.raw = Encoder42.insertStringInRaw(rawLine.raw, rawLine.params.lbl);
                    }
                    // is it a register ...
                    if (rawLine.params.regno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.regno);
                    }
                    // is it a tone ...
                    if (rawLine.params.tonno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.tonno);
                    }
                    // is it a local char label A-J,a-e coded as number ......
                    if (rawLine.params.lblno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.lblno);
                    }
                    // flag
                    if (rawLine.params.flgno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.flgno);
                    }
                    // 0-9 digits
                    if (rawLine.params.digno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.digno);
                    }
                    // 10 or 11 digits
                    if (rawLine.workCode.match(/(ENG|FIX|SCI) (10|11)/)) {
                        // nothing to do ...
                    }
                    // size
                    if (rawLine.params.sizno !== undefined) {
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, rawLine.params.sizno);
                    }
                    // is it a stack ...
                    if (rawLine.params.stk !== undefined) {
                        const int = Encoder42.stackMap.get(rawLine.params.stk);
                        rawLine.raw = Encoder42.insertNumberInRaw(rawLine.raw, int);
                    }
                    if ((rawLine.raw === undefined) && (progErrorText === undefined)) {
                        progErrorText = "'" + rawLine.docCode + "' is unvalid";
                    }
                    if (progErrorText !== undefined) {
                        rawLine.error = new codeerror_1.CodeError(rawLine.docLine, rawLine.codeLineNo, rawLine.docCode, String(progErrorText));
                    }
                    //#endregion
                }
            }
            else {
                // wrong extension, free42 commands in hp42s file
                rawLine.error = new codeerror_1.CodeError(rawLine.docLine, rawLine.codeLineNo, rawLine.docCode, String(progErrorText));
            }
        }
    }
    //#endregion
    //#region Private Methods
    /** Check if free42 command used */
    static getLanguageIdFromCode(rawLine, languageId) {
        let languageIdFromCode;
        // free42 commands: ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE+|DDAYS|DMY|DOW|MDY|TIME
        if (rawLine.token &&
            rawLine.token.match(/(ACCEL|LOCAT|HEADING|ADATE|ATIME|ATIME24|CLK12|CLK24|DATE|DATE\+|DDAYS|DMY|DOW|MDY|TIME)/)) {
            languageIdFromCode = 'free42';
        }
        else {
            languageIdFromCode = languageId;
        }
        return languageIdFromCode;
    }
    /** Changing strings into corresponding opcodes (also adjusting the
     * instruction length in "Fn" byte).
     */
    static insertStringInRaw(raw, str) {
        if (raw !== undefined) {
            if (str !== undefined) {
                let len_str = str.length;
                let pos_Fn = raw.indexOf('Fn');
                len_str = str.length;
                // str too long ? len > 14: max concat string length; 15: opcodes with Fn; 7: else
                if (len_str > (raw.match('Fn 7F') ? 14 : raw.match('Fn') ? 15 : 7)) {
                    //TODO: error !!
                }
                // loop each character in str and append hex to opcode
                str.split('').forEach((character) => {
                    let hexcode = character.charCodeAt(0);
                    //special char ?
                    if (Encoder42.charCodeMap.has(character)) {
                        let v = Encoder42.charCodeMap.get(character);
                        hexcode = v ? v : 0;
                    }
                    raw += ' ' + Encoder42.convertByteAsHex(hexcode);
                });
                // ASSIGN opcode search, replace aa
                raw = raw.replace(/ aa(.*)/, '$1 nn');
                const length_hex_after_Fn = (raw.length - (pos_Fn + 2)) / 3;
                //console.log(
                //  HP42SEncoder.convertNumberToHexString(240 + length_hex_after_Fn)
                //);
                // concat three parts ...
                raw =
                    raw.substr(0, pos_Fn) + // 1. part
                        Encoder42.convertByteAsHex(240 + length_hex_after_Fn) + // 2. part
                        raw.substr(pos_Fn + 2); // 3. part
            }
            else {
                raw = undefined;
            }
        }
        return raw;
    }
    /** Insert a number into raw */
    static insertNumberInRaw(raw, num) {
        if (raw !== undefined && num !== undefined) {
            let match = null;
            switch (true) {
                case /kk/.test(raw):
                    raw = raw.replace(/kk/, Encoder42.convertByteAsHex(num));
                    break;
                case /rr/.test(raw):
                    raw = raw.replace(/rr/, Encoder42.convertByteAsHex(num));
                    break;
                case /tn/.test(raw):
                    raw = raw.replace(/tn/, Encoder42.convertByteAsHex(num));
                    break;
                case /nn/.test(raw):
                    // numbered label 00-99, digits 00-11
                    raw = raw.replace(/nn/, Encoder42.convertByteAsHex(num));
                    break;
                case /ll/.test(raw):
                    // char label as number A-J,a-e
                    raw = raw.replace(/ll/, 'CF ' + Encoder42.convertByteAsHex(num));
                    break;
                case /ss ss/.test(raw):
                    // SIZE
                    raw = raw.replace(/ss ss/, Encoder42.convertByteAsHex(num / 256) + ' ' + Encoder42.convertByteAsHex(num % 256));
                    break;
                case /([\dA-F])l/.test(raw):
                    // not working: hex = hex.replace(/([\dA-F])l/, this.convertNumberToHexString(parseInt('0x' + '$1' + '0') + 1 + int));
                    match = raw.match(/([\dA-F])l/);
                    if (match) {
                        raw = raw.replace(/([\dA-F])l/, Encoder42.convertByteAsHex(parseInt('0x' + match[1] + '0') + 1 + num));
                    }
                    break;
                case /(\d)r/.test(raw):
                    // not working: $1
                    match = raw.match(/(\d)r/);
                    if (match) {
                        raw = raw.replace(/(\d)r/, Encoder42.convertByteAsHex(parseInt(match[1]) * 16 + num));
                    }
                    break;
                case /([\dA-F])t/.test(raw):
                    // stack, not working: $1
                    match = raw.match(/([\dA-F])t/);
                    if (match) {
                        raw = raw.replace(/([\dA-F])t/, match[1] + num);
                    }
                    break;
                default:
                    break;
            }
        }
        else {
            raw = undefined;
        }
        return raw;
    }
    /** Changing numbers into corresponding opcodes.
     * "1.234E-455" -> 11 1A 12 13 14 1B 1C 14 15 15 00
     */
    static convertNumberToRaw(num) {
        if (num !== undefined) {
            // "1.234E-455" -> 11 1A 12 13 14 1B 1C 14 15 15 00
            num =
                num
                    .replace(/(\d)/g, ' 1$1') // replace 1234E-455                 -> 11 .  12 13 14 E  -  14 15 15
                    .replace(/\./, ' 1A') // replace .                             -> 11 1A 12 13 14 E  -  14 15 15
                    .replace(/(ᴇ|e|E)/, ' 1B') // replace (ᴇ|e|E)                  -> 11 1A 12 13 14 1B -  14 15 15
                    .replace(/-/g, ' 1C') // replace - -> 1C                       -> 11 1A 12 13 14 1B 1C 14 15 15
                    .replace(' ', '') + ' 00'; // remove first space + append 00   ->11 1A 12 13 14 1B 1C 14 15 15 00
        }
        return num;
    }
    /** Changing integers (size one byte, 0-255) into hex string .
     * 123 -> 7B, 255 -> FF
     */
    static convertByteAsHex(byte) {
        let hex = ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
        return hex;
    }
}
//#region Members
Encoder42.rpnMap = new Map();
Encoder42.stackMap = new Map();
Encoder42.charCodeMap = new Map();
Encoder42.initialized = false;
//#endregion
//#region Private Arrays
Encoder42.arr_stackMap = [
    { key: 'T', value: 0 },
    { key: 'Z', value: 1 },
    { key: 'Y', value: 2 },
    { key: 'X', value: 3 },
    { key: 'L', value: 4 }
];
/** FOCAL character set https://en.wikipedia.org/wiki/FOCAL_character_set key is used as regex */
Encoder42.arr_charCodeMap = [
    { key: '÷', value: 0 },
    { key: '×', value: 1 },
    { key: '√', value: 2 },
    { key: '∫', value: 3 },
    { key: '░', value: 4 },
    { key: 'Σ', value: 5 },
    { key: '▶', value: 6 },
    { key: 'π', value: 7 },
    { key: '¿', value: 8 },
    { key: '≤', value: 9 },
    { key: '\\[LF\\]', value: 10 },
    { key: '␊', value: 10 },
    { key: '≥', value: 11 },
    { key: '≠', value: 12 },
    { key: '↵', value: 13 },
    { key: '↓', value: 14 },
    { key: '→', value: 15 },
    { key: '←', value: 16 },
    { key: 'µ', value: 17 },
    { key: 'μ', value: 17 },
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
    { key: '␛', value: 27 },
    { key: 'Ö', value: 28 },
    { key: 'Ü', value: 29 },
    { key: '▒', value: 30 },
    { key: '■', value: 31 },
    { key: '•', value: 31 },
    // { key: 'SP', value: 32 },
    // { key: '!', value: 33 },
    // { key: ''', value: 34 },
    // { key: '#', value: 35 },
    // { key: '$', value: 36 },
    // { key: '%', value: 37 },
    // { key: '&', value: 38 },
    // { key: "'", value: 39 }, // double quotes !!
    // { key: '(', value: 40 },
    // { key: ')', value: 41 },
    // { key: '*', value: 42 },
    // { key: '+', value: 43 },
    // { key: ',', value: 44 },
    // { key: '-', value: 45 },
    // { key: '.', value: 46 },
    // { key: '/', value: 47 },
    // { key: '0', value: 48 },
    // { key: '1', value: 49 },
    // { key: '2', value: 50 },
    // { key: '3', value: 51 },
    // { key: '4', value: 52 },
    // { key: '5', value: 53 },
    // { key: '6', value: 54 },
    // { key: '7', value: 55 },
    // { key: '8', value: 56 },
    // { key: '9', value: 57 },
    // { key: ':', value: 58 },
    // { key: ';', value: 59 },
    // { key: '<', value: 60 },
    // { key: '=', value: 61 },
    // { key: '>', value: 62 },
    // { key: '?', value: 63 },
    // { key: '@', value: 64 },
    // { key: 'A', value: 65 },
    // { key: 'B', value: 66 },
    // { key: 'C', value: 67 },
    // { key: 'D', value: 68 },
    // { key: 'E', value: 69 },
    // { key: 'F', value: 70 },
    // { key: 'G', value: 71 },
    // { key: 'H', value: 72 },
    // { key: 'I', value: 73 },
    // { key: 'J', value: 74 },
    // { key: 'K', value: 75 },
    // { key: 'L', value: 76 },
    // { key: 'M', value: 77 },
    // { key: 'N', value: 78 },
    // { key: 'O', value: 79 },
    // { key: 'P', value: 80 },
    // { key: 'Q', value: 81 },
    // { key: 'R', value: 82 },
    // { key: 'S', value: 83 },
    // { key: 'T', value: 84 },
    // { key: 'U', value: 85 },
    // { key: 'V', value: 86 },
    // { key: 'W', value: 87 },
    // { key: 'X', value: 88 },
    // { key: 'Y', value: 89 },
    // { key: 'Z', value: 90 },
    // { key: '[', value: 91 },
    { key: '\\\\', value: 92 },
    // { key: ']', value: 93 },
    { key: '↑', value: 94 }
    // { key: '_', value: 95 },
    // { key: '`', value: 96 },
    // { key: '´', value: ??? },
    // { key: 'a', value: 97 },
    // { key: 'b', value: 98 },
    // { key: 'c', value: 99 },
    // { key: 'd', value: 100 },
    // { key: 'e', value: 101 },
    // { key: 'f', value: 102 },
    // { key: 'g', value: 103 },
    // { key: 'h', value: 104 },
    // { key: 'i', value: 105 },
    // { key: 'j', value: 106 },
    // { key: 'k', value: 107 },
    // { key: 'l', value: 108 },
    // { key: 'm', value: 109 },
    // { key: 'n', value: 110 },
    // { key: 'o', value: 111 },
    // { key: 'p', value: 112 },
    // { key: 'q', value: 113 },
    // { key: 'r', value: 114 },
    // { key: 's', value: 115 },
    // { key: 't', value: 116 },
    // { key: 'u', value: 117 },
    // { key: 'v', value: 118 },
    // { key: 'w', value: 119 },
    // { key: 'x', value: 120 },
    // { key: 'y', value: 121 },
    // { key: 'z', value: 122 },
    // { key: '{', value: 123 },
    // { key: '|', value: 124 },
    // { key: '}', value: 125 },
    // { key: '~', value: 126 }
    // { key: '⊦', value: 127 }
    // { key: '´', value: ??? }
];
// 0(?<lblno>[2-9A-F]): LBL 01-15
// Fn: F([1-9A-F]) Label: max. length 14
// 7t: 7([0-4]); stack 0-4
// 8r: ([89A-E][0-9A-F]); r: dec:1..99; 128 + r => hex:81..E3
// Ft: F([0-4]); ... IND ST [XYZLT]
// [23]r: (2[0-9A-F]); register dec:1-15, hex: 21-2F
// rr: ([0-7][0-9A-F]); register dec:16-99, hex:10-63
// ENG|FIX|SCI sd: digits 00-09
// ENG|FIX|SCI 10|11: digits 10,11
// LBL|GTO sl|ll: sl: 00-14, ll:15-99
// RCL|STO sr|rr: sr 0-15, rr: 16-99
// tone: dec:0-9; hex:00-09
// nam: name max length 14
// CharLabels: A=102(0x66), B=107(0x67), ..., J, a=123(0x7B), b=124(0x7C), ..., e
Encoder42.arr_rpnMap = [
    { key: '%', value: [{ regex: /%/, raw: '4C' }] },
    { key: '%CH', value: [{ regex: /%CH/, raw: '4D' }] },
    { key: '+', value: [{ regex: /\+/, raw: '40' }] },
    { key: '+/-', value: [{ regex: /\+\/-/, raw: '54' }] },
    { key: '-', value: [{ regex: /-/, raw: '41' }] },
    { key: '.END.', value: [{ regex: /\.END\./, raw: 'C0 00 0D' }] },
    { key: '1/X', value: [{ regex: /1\/X/, raw: '60' }] },
    { key: '10^X', value: [{ regex: /10\^X/, raw: '57' }] },
    { key: '10↑X', value: [{ regex: /10↑X/, raw: '57' }] },
    { key: 'ABS', value: [{ regex: /ABS/, raw: '61' }] },
    { key: 'ACCEL', value: [{ regex: /ACCEL/, raw: 'A7 CF' }] },
    { key: 'ACOS', value: [{ regex: /ACOS/, raw: '5D' }] },
    { key: 'ACOSH', value: [{ regex: /ACOSH/, raw: 'A0 66' }] },
    { key: 'ADATE', value: [{ regex: /ADATE/, raw: 'A6 81' }] },
    { key: 'ADV', value: [{ regex: /ADV/, raw: '8F' }] },
    { key: 'AGRAPH', value: [{ regex: /AGRAPH/, raw: 'A7 64' }] },
    { key: 'AIP', value: [{ regex: /AIP/, raw: 'A6 31' }] },
    { key: 'ALENG', value: [{ regex: /ALENG/, raw: 'A6 41' }] },
    { key: 'ALL', value: [{ regex: /ALL/, raw: 'A2 5D' }] },
    { key: 'ALLΣ', value: [{ regex: /ALLΣ/, raw: 'A0 AE' }] },
    { key: 'AND', value: [{ regex: /AND/, raw: 'A5 88' }] },
    { key: 'AOFF', value: [{ regex: /AOFF/, raw: '8B' }] },
    { key: 'AON', value: [{ regex: /AON/, raw: '8C' }] },
    {
        key: 'ARCL',
        value: [
            { regex: /ARCL IND ST ([XYZLT])/, raw: '9B Ft', params: 'stk' },
            { regex: /ARCL IND (".{1,14}")/, raw: 'Fn BB', params: 'nam' },
            { regex: /ARCL IND (\d{2})/, raw: '9B 8r', params: 'reg' },
            { regex: /ARCL ST ([XYZLT])/, raw: '9B 7t', params: 'stk' },
            { regex: /ARCL (".{1,14}")/, raw: 'Fn B3', params: 'nam' },
            { regex: /ARCL (\d{2})/, raw: '9B rr', params: 'reg' }
        ]
    },
    { key: 'AROT', value: [{ regex: /AROT/, raw: 'A6 46' }] },
    { key: 'ASHF', value: [{ regex: /ASHF/, raw: '88' }] },
    { key: 'ASIN', value: [{ regex: /ASIN/, raw: '5C' }] },
    { key: 'ASINH', value: [{ regex: /ASINH/, raw: 'A0 64' }] },
    { key: 'ASSIGN', value: [{ regex: /ASSIGN (".{1,14}") TO (0[1-9]|1[0-8])/, raw: 'Fn C0 aa', params: 'nam,key-1' }] },
    {
        key: 'ASTO',
        value: [
            { regex: /ASTO IND ST ([XYZLT])/, raw: '9A Ft', params: 'stk' },
            { regex: /ASTO IND (".{1,14}")/, raw: 'Fn BA', params: 'nam' },
            { regex: /ASTO IND (\d{2})/, raw: '9A 8r', params: 'reg' },
            { regex: /ASTO ST ([XYZLT])/, raw: '9A 7t', params: 'stk' },
            { regex: /ASTO (".{1,14}")/, raw: 'Fn B2', params: 'nam' },
            { regex: /ASTO (\d{2})/, raw: '9A rr', params: 'reg' }
        ]
    },
    { key: 'ATAN', value: [{ regex: /ATAN/, raw: '5E' }] },
    { key: 'ATANH', value: [{ regex: /ATANH/, raw: 'A0 65' }] },
    { key: 'ATIME', value: [{ regex: /ATIME/, raw: 'A6 84' }] },
    { key: 'ATIME24', value: [{ regex: /ATIME24/, raw: 'A6 85' }] },
    { key: 'ATOX', value: [{ regex: /ATOX/, raw: 'A6 47' }] },
    { key: 'AVIEW', value: [{ regex: /AVIEW/, raw: '7E' }] },
    { key: 'BASE+', value: [{ regex: /BASE\+/, raw: 'A0 E6' }] },
    { key: 'BASE-', value: [{ regex: /BASE-/, raw: 'A0 E7' }] },
    { key: 'BASE±', value: [{ regex: /BASE±/, raw: 'A0 EA' }] },
    { key: 'BASE×', value: [{ regex: /BASE×/, raw: 'A0 E8' }] },
    { key: 'BASE÷', value: [{ regex: /BASE÷/, raw: 'A0 E9' }] },
    { key: 'BEEP', value: [{ regex: /BEEP/, raw: '86' }] },
    { key: 'BEST', value: [{ regex: /BEST/, raw: 'A0 9F' }] },
    { key: 'BINM', value: [{ regex: /BINM/, raw: 'A0 E5' }] },
    { key: 'BIT?', value: [{ regex: /BIT\?/, raw: 'A5 8C' }] },
    {
        key: 'CF',
        value: [
            { regex: /CF IND ST ([XYZLT])/, raw: 'A9 Ft', params: 'stk' },
            { regex: /CF IND (".{1,14}")/, raw: 'Fn A9', params: 'nam' },
            { regex: /CF IND (\d{2})/, raw: 'A9 8r', params: 'reg' },
            { regex: /CF (\d{2})/, raw: 'A9 rr', params: 'flg' } //00-99
        ]
    },
    { key: 'CLA', value: [{ regex: /CLA/, raw: '87' }] },
    { key: 'CLD', value: [{ regex: /CLD/, raw: '7F' }] },
    { key: 'CLK12', value: [{ regex: /CLK12/, raw: 'A6 86' }] },
    { key: 'CLK24', value: [{ regex: /CLK24/, raw: 'A6 87' }] },
    { key: 'CLLCD', value: [{ regex: /CLLCD/, raw: 'A7 63' }] },
    { key: 'CLMENU', value: [{ regex: /CLMENU/, raw: 'A2 6D' }] },
    { key: 'CLP', value: [{ regex: /CLP (".{1,14}")/, raw: 'Fn F0', params: 'lbl' }] },
    { key: 'CLRG', value: [{ regex: /CLRG/, raw: '8A' }] },
    { key: 'CLST', value: [{ regex: /CLST/, raw: '73' }] },
    {
        key: 'CLV',
        value: [
            { regex: /CLV IND ST ([XYZLT])/, raw: 'F2 D8 Ft', params: 'stk' },
            { regex: /CLV IND (".{1,14}")/, raw: 'Fn B8', params: 'nam' },
            { regex: /CLV IND (\d{2})/, raw: 'F2 D8 8r', params: 'reg' },
            { regex: /CLV (".{1,14}")/, raw: 'Fn B0', params: 'nam' }
        ]
    },
    { key: 'CLX', value: [{ regex: /CLX/, raw: '77' }] },
    { key: 'CLKEYS', value: [{ regex: /CLKEYS/, raw: 'A2 62' }] },
    { key: 'CLΣ', value: [{ regex: /CLΣ/, raw: '70' }] },
    { key: 'COMB', value: [{ regex: /COMB/, raw: 'A0 6F' }] },
    { key: 'COMPLEX', value: [{ regex: /COMPLEX/, raw: 'A0 72' }] },
    { key: 'CORR', value: [{ regex: /CORR/, raw: 'A0 A7' }] },
    { key: 'COS', value: [{ regex: /COS/, raw: '5A' }] },
    { key: 'COSH', value: [{ regex: /COSH/, raw: 'A0 62' }] },
    { key: 'CPX?', value: [{ regex: /CPX\?/, raw: 'A2 67' }] },
    { key: 'CPXRES', value: [{ regex: /CPXRES/, raw: 'A2 6A' }] },
    { key: 'CROSS', value: [{ regex: /CROSS/, raw: 'A6 CA' }] },
    { key: 'CUSTOM', value: [{ regex: /CUSTOM/, raw: 'A2 6F' }] },
    { key: 'DATE', value: [{ regex: /DATE/, raw: 'A6 8C' }] },
    { key: 'DATE+', value: [{ regex: /DATE\+/, raw: 'A6 8D' }] },
    { key: 'DDAYS', value: [{ regex: /DDAYS/, raw: 'A6 8E' }] },
    { key: 'DECM', value: [{ regex: /DECM/, raw: 'A0 E3' }] },
    { key: 'DEG', value: [{ regex: /DEG/, raw: '80' }] },
    { key: 'DELAY', value: [{ regex: /DELAY/, raw: 'A7 60' }] },
    { key: 'DELR', value: [{ regex: /DELR/, raw: 'A0 AB' }] },
    { key: 'DET', value: [{ regex: /DET/, raw: 'A6 CC' }] },
    {
        key: 'DIM',
        value: [
            { regex: /DIM IND ST ([XYZLT])/, raw: 'F2 EC Ft', params: 'stk' },
            { regex: /DIM IND (".{1,14}")/, raw: 'Fn CC', params: 'nam' },
            { regex: /DIM IND (\d{2})/, raw: 'F2 EC 8r', params: 'reg' },
            { regex: /DIM (".{1,14}")/, raw: 'Fn C4', params: 'nam' }
        ]
    },
    { key: 'DIM?', value: [{ regex: /DIM\?/, raw: 'A6 E7' }] },
    { key: 'DMY', value: [{ regex: /DMY/, raw: 'A6 8F' }] },
    { key: 'DOT', value: [{ regex: /DOT/, raw: 'A6 CB' }] },
    { key: 'DOW', value: [{ regex: /DOW/, raw: 'A6 90' }] },
    {
        key: 'DSE',
        value: [
            { regex: /DSE IND ST ([XYZLT])/, raw: '97 Ft', params: 'stk' },
            { regex: /DSE IND (".{1,14}")/, raw: 'Fn 9F', params: 'nam' },
            { regex: /DSE IND (\d{2})/, raw: '97 8r', params: 'reg' },
            { regex: /DSE ST ([XYZLT])/, raw: '97 7t', params: 'stk' },
            { regex: /DSE (".{1,14}")/, raw: 'Fn 97', params: 'nam' },
            { regex: /DSE (\d{2})/, raw: '97 rr', params: 'reg' }
        ]
    },
    { key: 'EDIT', value: [{ regex: /EDIT/, raw: 'A6 E1' }] },
    {
        key: 'EDITN',
        value: [
            { regex: /EDITN IND ST ([XYZLT])/, raw: 'F2 EF Ft', params: 'stk' },
            { regex: /EDITN IND (".{1,14}")/, raw: 'Fn CE', params: 'nam' },
            { regex: /EDITN IND (\d{2})/, raw: 'F2 EF 8r', params: 'reg' },
            { regex: /EDITN (".{1,14}")/, raw: 'Fn C6', params: 'nam' }
        ]
    },
    { key: 'END', value: [{ regex: /END/, raw: 'C0 00 0D' }] },
    {
        key: 'ENG',
        value: [
            { regex: /ENG 10/, raw: 'F1 D7' },
            { regex: /ENG 11/, raw: 'F1 E7' },
            { regex: /ENG IND ST ([XYZLT])/, raw: '9E Ft', params: 'stk' },
            { regex: /ENG IND (".{1,14}")/, raw: 'Fn DE', params: 'nam' },
            { regex: /ENG IND (\d{2})/, raw: '9E 8r', params: 'reg' },
            { regex: /ENG (0[0-9])/, raw: '9E nn', params: 'dig' } //00-09
        ]
    },
    { key: 'ENTER', value: [{ regex: /ENTER/, raw: '83' }] },
    { key: 'EXITALL', value: [{ regex: /EXITALL/, raw: 'A2 6C' }] },
    { key: 'EXPF', value: [{ regex: /EXPF/, raw: 'A0 A0' }] },
    { key: 'E↑X', value: [{ regex: /E↑X/, raw: '55' }] },
    { key: 'E↑X-1', value: [{ regex: /E↑X-1/, raw: '58' }] },
    {
        key: 'FC?',
        value: [
            { regex: /FC\? IND ST ([XYZLT])/, raw: 'AD Ft', params: 'stk' },
            { regex: /FC\? IND (".{1,14}")/, raw: 'Fn AD', params: 'nam' },
            { regex: /FC\? IND (\d{2})/, raw: 'AD 8r', params: 'reg' },
            { regex: /FC\? (\d{2})/, raw: 'AD rr', params: 'flg' } //00-99
        ]
    },
    {
        key: 'FC?C',
        value: [
            { regex: /FC\?C IND ST ([XYZLT])/, raw: 'AB Ft', params: 'stk' },
            { regex: /FC\?C IND (".{1,14}")/, raw: 'Fn AB', params: 'nam' },
            { regex: /FC\?C IND (\d{2})/, raw: 'AB 8r', params: 'reg' },
            { regex: /FC\?C (\d{2})/, raw: 'AB rr', params: 'flg' } //00-99
        ]
    },
    { key: 'FCSTX', value: [{ regex: /FCSTX/, raw: 'A0 A8' }] },
    { key: 'FCSTY', value: [{ regex: /FCSTY/, raw: 'A0 A9' }] },
    {
        key: 'FIX',
        value: [
            { regex: /FIX 10/, raw: 'F1 D5' },
            { regex: /FIX 11/, raw: 'F1 E5' },
            { regex: /FIX IND ST ([XYZLT])/, raw: '9C Ft', params: 'stk' },
            { regex: /FIX IND (".{1,14}")/, raw: 'Fn DC', params: 'nam' },
            { regex: /FIX IND (\d{2})/, raw: '9C 8r', params: 'reg' },
            { regex: /FIX (0[0-9])/, raw: '9C nn', params: 'dig' } //00-09
        ]
    },
    { key: 'FNRM', value: [{ regex: /FNRM/, raw: 'A6 CF' }] },
    { key: 'FP', value: [{ regex: /FP/, raw: '69' }] },
    {
        key: 'FS?',
        value: [
            { regex: /FS\? IND ST ([XYZLT])/, raw: 'AC Ft', params: 'stk' },
            { regex: /FS\? IND (".{1,14}")/, raw: 'Fn AC', params: 'nam' },
            { regex: /FS\? IND (\d{2})/, raw: 'AC 8r', params: 'reg' },
            { regex: /FS\? (\d{2})/, raw: 'AC rr', params: 'flg' } //00-99
        ]
    },
    {
        key: 'FS?C',
        value: [
            { regex: /FS\?C IND ST ([XYZLT])/, raw: 'AA Ft', params: 'stk' },
            { regex: /FS\?C IND (".{1,14}")/, raw: 'Fn AA', params: 'nam' },
            { regex: /FS\?C IND (\d{2})/, raw: 'AA 8r', params: 'reg' },
            { regex: /FS\?C (\d{2})/, raw: 'AA rr', params: 'flg' } //00-99
        ]
    },
    { key: 'GAMMA', value: [{ regex: /GAMMA/, raw: 'A0 74' }] },
    { key: 'GETM', value: [{ regex: /GETM/, raw: 'A6 E8' }] },
    { key: 'GETKEY', value: [{ regex: /GETKEY/, raw: 'A2 6E' }] },
    { key: 'GRAD', value: [{ regex: /GRAD/, raw: '82' }] },
    { key: 'GROW', value: [{ regex: /GROW/, raw: 'A6 E3' }] },
    {
        key: 'GTO',
        value: [
            { regex: /GTO IND ST ([XYZLT])/, raw: 'AE 7t', params: 'stk' },
            { regex: /GTO IND (".{1,14}")/, raw: 'Fn AE', params: 'nam' },
            { regex: /GTO IND (\d{2})/, raw: 'AE nn', params: 'reg' },
            { regex: /GTO (".{1,14}")/, raw: '1D Fn', params: 'lbl' },
            { regex: /GTO (1[5-9]|[2-9][0-9]|[a-eA-J])/, raw: 'D0 00 nn', params: 'lblno' },
            { regex: /GTO (0[0-9]|1[0-4])/, raw: 'Bl 00', params: 'lblno' } //00-14
        ]
    },
    { key: 'HEADING', value: [{ regex: /HEADING/, raw: 'A7 D1' }] },
    { key: 'HEXM', value: [{ regex: /HEXM/, raw: 'A0 E2' }] },
    { key: 'HMS+', value: [{ regex: /HMS\+/, raw: '49' }] },
    { key: 'HMS-', value: [{ regex: /HMS-/, raw: '4A' }] },
    { key: 'I+', value: [{ regex: /I\+/, raw: 'A6 D2' }] },
    { key: 'I-', value: [{ regex: /I-/, raw: 'A6 D3' }] },
    {
        key: 'INDEX',
        value: [
            { regex: /INDEX IND ST ([XYZLT])/, raw: 'F2 DA Ft', params: 'stk' },
            { regex: /INDEX IND (".{1,14}")/, raw: 'Fn 8F', params: 'nam' },
            { regex: /INDEX IND (\d{2})/, raw: 'F2 DA 8r', params: 'reg' },
            { regex: /INDEX (".{1,14}")/, raw: 'Fn 87', params: 'nam' }
        ]
    },
    {
        key: 'INPUT',
        value: [
            { regex: /INPUT IND ST ([XYZLT])/, raw: 'F2 EE Ft', params: 'stk' },
            { regex: /INPUT IND (".{1,14}")/, raw: 'Fn CD', params: 'nam' },
            { regex: /INPUT IND (\d{2})/, raw: 'F2 EE 8r', params: 'reg' },
            { regex: /INPUT ST ([XYZLT])/, raw: 'F2 D0 7t', params: 'stk' },
            { regex: /INPUT (".{1,14}")/, raw: 'Fn C5', params: 'nam' },
            { regex: /INPUT (\d{2})/, raw: 'F2 D0 rr', params: 'reg' }
        ]
    },
    { key: 'INSR', value: [{ regex: /INSR/, raw: 'A0 AA' }] },
    {
        key: 'INTEG',
        value: [
            { regex: /INTEG IND ST ([XYZLT])/, raw: 'F2 EA Ft', params: 'stk' },
            { regex: /INTEG IND (".{1,14}")/, raw: 'Fn BE', params: 'nam' },
            { regex: /INTEG IND (\d{2})/, raw: 'F2 EA 8r', params: 'reg' },
            { regex: /INTEG (".{1,14}")/, raw: 'Fn B6', params: 'lbl' }
        ]
    },
    { key: 'INVRT', value: [{ regex: /INVRT/, raw: 'A6 CE' }] },
    { key: 'IP', value: [{ regex: /IP/, raw: '68' }] },
    {
        key: 'ISG',
        value: [
            { regex: /ISG IND ST ([XYZLT])/, raw: '96 Ft', params: 'stk' },
            { regex: /ISG IND (".{1,14}")/, raw: 'Fn 9E', params: 'nam' },
            { regex: /ISG IND (\d{2})/, raw: '96 8r', params: 'reg' },
            { regex: /ISG ST ([XYZLT])/, raw: '96 7t', params: 'stk' },
            { regex: /ISG (".{1,14}")/, raw: 'Fn 96', params: 'nam' },
            { regex: /ISG (\d{2})/, raw: '96 rr', params: 'reg' }
        ]
    },
    { key: 'J+', value: [{ regex: /J\+/, raw: 'A6 D4' }] },
    { key: 'J-', value: [{ regex: /J-/, raw: 'A6 D5' }] },
    {
        key: 'KEY',
        value: [
            { regex: /KEY ([1-9]) GTO IND ST ([XYZLT])/, raw: 'F3 E3 kk Ft', params: 'key,stk' },
            { regex: /KEY ([1-9]) GTO IND (".{1,14}")/, raw: 'Fn CB kk', params: 'key,nam' },
            { regex: /KEY ([1-9]) GTO IND (\d{2})/, raw: 'F3 E3 kk 8r', params: 'key,reg' },
            { regex: /KEY ([1-9]) GTO (".{1,14}")/, raw: 'Fn C3 kk', params: 'key,lbl' },
            { regex: /KEY ([1-9]) GTO (0[0-9]|[1-9][0-9]|[a-eA-J])/, raw: 'F3 E3 kk rr', params: 'key,lblno' },
            { regex: /KEY ([1-9]) XEQ IND ST ([XYZLT])/, raw: 'F3 E2 kk Ft', params: 'key,stk' },
            { regex: /KEY ([1-9]) XEQ IND (".{1,14}")/, raw: 'Fn CA kk', params: 'key,nam' },
            { regex: /KEY ([1-9]) XEQ IND (\d{2})/, raw: 'F3 E2 kk 8r', params: 'key,reg' },
            { regex: /KEY ([1-9]) XEQ (".{1,14}")/, raw: 'Fn C2 kk', params: 'key,lbl' },
            { regex: /KEY ([1-9]) XEQ (0[0-9]|[1-9][0-9]|[a-eA-J])/, raw: 'F3 E2 kk rr', params: 'key,lblno' } //, { regex: /KEY `key` XEQ sl/, raw: 'F3 E2 kk rr' }
        ]
    },
    { key: 'KEYASN', value: [{ regex: /KEYASN/, raw: 'A2 63' }] },
    { key: 'LASTX', value: [{ regex: /LASTX/, raw: '76' }] },
    {
        key: 'LBL',
        value: [
            { regex: /LBL (".{1,14}")/, raw: 'C0 00 Fn 00', params: 'lbl' },
            { regex: /LBL (1[5-9]|[2-9][0-9]|[a-eA-J])/, raw: 'CF nn', params: 'lblno' },
            { regex: /LBL (0[0-9]|1[0-4])/, raw: '0l', params: 'lblno' } // 00-14
        ]
    },
    { key: 'LCLBL', value: [{ regex: /LCLBL/, raw: 'A2 64' }] },
    { key: 'LINF', value: [{ regex: /LINF/, raw: 'A0 A1' }] },
    { key: 'LINΣ', value: [{ regex: /LINΣ/, raw: 'A0 AD' }] },
    { key: 'LN', value: [{ regex: /LN/, raw: '50' }] },
    { key: 'LN1+X', value: [{ regex: /LN1\+X/, raw: '65' }] },
    { key: 'LOCAT', value: [{ regex: /LOCAT/, raw: 'A7 D0' }] },
    { key: 'LOG', value: [{ regex: /LOG/, raw: '56' }] },
    { key: 'LOGF', value: [{ regex: /LOGF/, raw: 'A0 A2' }] },
    { key: 'MAN', value: [{ regex: /MAN/, raw: 'A7 5B' }] },
    { key: 'MAT?', value: [{ regex: /MAT\?/, raw: 'A2 66' }] },
    { key: 'MDY', value: [{ regex: /MDY/, raw: 'A6 91' }] },
    { key: 'MEAN', value: [{ regex: /MEAN/, raw: '7C' }] },
    { key: 'MENU', value: [{ regex: /MENU/, raw: 'A2 5E' }] },
    { key: 'MOD', value: [{ regex: /MOD/, raw: '4B' }] },
    { key: 'MVAR', value: [{ regex: /MVAR (".{1,14}")/, raw: 'Fn 90', params: 'nam' }] },
    { key: 'N!', value: [{ regex: /N!/, raw: '62' }] },
    { key: 'NEWMAT', value: [{ regex: /NEWMAT/, raw: 'A6 DA' }] },
    { key: 'NORM', value: [{ regex: /NORM/, raw: 'A7 5C' }] },
    { key: 'NOT', value: [{ regex: /NOT/, raw: 'A5 87' }] },
    { key: 'NULL', value: [{ regex: /NULL/, raw: '00' }] },
    { key: 'OCTM', value: [{ regex: /OCTM/, raw: 'A0 E4' }] },
    { key: 'OFF', value: [{ regex: /OFF/, raw: '8D' }] },
    { key: 'OLD', value: [{ regex: /OLD/, raw: 'A6 DB' }] },
    { key: 'ON', value: [{ regex: /ON/, raw: 'A2 70' }] },
    { key: 'OR', value: [{ regex: /OR/, raw: 'A5 89' }] },
    { key: 'PERM', value: [{ regex: /PERM/, raw: 'A0 70' }] },
    {
        key: 'PGMINT',
        value: [
            { regex: /PGMINT IND ST ([XYZLT])/, raw: 'F2 E8 Ft', params: 'stk' },
            { regex: /PGMINT IND (".{1,14}")/, raw: 'Fn BC', params: 'nam' },
            { regex: /PGMINT IND (\d{2})/, raw: 'F2 E8 8r', params: 'reg' },
            { regex: /PGMINT (".{1,14}")/, raw: 'Fn B4', params: 'lbl' }
        ]
    },
    {
        key: 'PGMSLV',
        value: [
            { regex: /PGMSLV IND ST ([XYZLT])/, raw: 'F2 E9 Ft', params: 'stk' },
            { regex: /PGMSLV IND (".{1,14}")/, raw: 'Fn BD', params: 'nam' },
            { regex: /PGMSLV IND (\d{2})/, raw: 'F2 E9 8r', params: 'reg' },
            { regex: /PGMSLV (".{1,14}")/, raw: 'Fn B5', params: 'lbl' }
        ]
    },
    { key: 'PI', value: [{ regex: /PI/, raw: '72' }] },
    { key: 'PIXEL', value: [{ regex: /PIXEL/, raw: 'A7 65' }] },
    { key: 'POLAR', value: [{ regex: /POLAR/, raw: 'A2 59' }] },
    { key: 'POSA', value: [{ regex: /POSA/, raw: 'A6 5C' }] },
    { key: 'PRA', value: [{ regex: /PRA/, raw: 'A7 48' }] },
    { key: 'PRLCD', value: [{ regex: /PRLCD/, raw: 'A7 62' }] },
    { key: 'PROFF', value: [{ regex: /PROFF/, raw: 'A7 5F' }] },
    { key: 'PROMPT', value: [{ regex: /PROMPT/, raw: '8E' }] },
    { key: 'PRON', value: [{ regex: /PRON/, raw: 'A7 5E' }] },
    { key: 'PRSTK', value: [{ regex: /PRSTK/, raw: 'A7 53' }] },
    { key: 'PRUSR', value: [{ regex: /PRUSR/, raw: 'A7 61' }] },
    {
        key: 'PRV',
        value: [
            { regex: /PRV IND ST ([XYZLT])/, raw: 'F2 D9 Ft', params: 'stk' },
            { regex: /PRV IND (".{1,14}")/, raw: 'Fn B9', params: 'nam' },
            { regex: /PRV IND (\d{2})/, raw: 'F2 D9 8r', params: 'reg' },
            { regex: /PRV (".{1,14}")/, raw: 'Fn B1', params: 'nam' }
        ]
    },
    { key: 'PRX', value: [{ regex: /PRX/, raw: 'A7 54' }] },
    { key: 'PRΣ', value: [{ regex: /PRΣ/, raw: 'A7 52' }] },
    { key: 'PSE', value: [{ regex: /PSE/, raw: '89' }] },
    { key: 'PUTM', value: [{ regex: /PUTM/, raw: 'A6 E9' }] },
    { key: 'PWRF', value: [{ regex: /PWRF/, raw: 'A0 A3' }] },
    { key: 'R<>R', value: [{ regex: /R<>R/, raw: 'A6 D1' }] },
    { key: 'RAD', value: [{ regex: /RAD/, raw: '81' }] },
    { key: 'RAN', value: [{ regex: /RAN/, raw: 'A0 71' }] },
    {
        key: 'RCL',
        value: [
            { regex: /RCL IND ST ([XYZLT])/, raw: '90 Ft', params: 'stk' },
            { regex: /RCL IND (".{1,14}")/, raw: 'Fn 99', params: 'nam' },
            { regex: /RCL IND (\d{2})/, raw: '90 8r', params: 'reg' },
            { regex: /RCL ST ([XYZLT])/, raw: '90 7t', params: 'stk' },
            { regex: /RCL (".{1,14}")/, raw: 'Fn 91', params: 'nam' },
            { regex: /RCL (1[6-9]|[2-9][0-9])/, raw: '90 rr', params: 'reg' },
            { regex: /RCL (0[0-9]|1[0-5])/, raw: '2r', params: 'reg' } // 00-15
        ]
    },
    {
        key: 'RCL+',
        value: [
            { regex: /RCL\+ IND ST ([XYZLT])/, raw: 'F2 D1 Ft', params: 'stk' },
            { regex: /RCL\+ IND (".{1,14}")/, raw: 'Fn 9A', params: 'nam' },
            { regex: /RCL\+ IND (\d{2})/, raw: 'F2 D1 8r', params: 'reg' },
            { regex: /RCL\+ ST ([XYZLT])/, raw: 'F2 D1 7t', params: 'stk' },
            { regex: /RCL\+ (".{1,14}")/, raw: 'Fn 92', params: 'nam' },
            { regex: /RCL\+ (\d{2})/, raw: 'F2 D1 rr', params: 'reg' }
        ]
    },
    {
        key: 'RCL-',
        value: [
            { regex: /RCL- IND ST ([XYZLT])/, raw: 'F2 D2 Ft', params: 'stk' },
            { regex: /RCL- IND (".{1,14}")/, raw: 'Fn 9B', params: 'nam' },
            { regex: /RCL- IND (\d{2})/, raw: 'F2 D2 8r', params: 'reg' },
            { regex: /RCL- ST ([XYZLT])/, raw: 'F2 D2 7t', params: 'stk' },
            { regex: /RCL- (".{1,14}")/, raw: 'Fn 93', params: 'nam' },
            { regex: /RCL- (\d{2})/, raw: 'F2 D2 rr', params: 'reg' }
        ]
    },
    { key: 'RCLEL', value: [{ regex: /RCLEL/, raw: 'A6 D7' }] },
    { key: 'RCLIJ', value: [{ regex: /RCLIJ/, raw: 'A6 D9' }] },
    {
        key: 'RCL×',
        value: [
            { regex: /RCL× IND ST ([XYZLT])/, raw: 'F2 D3 Ft', params: 'stk' },
            { regex: /RCL× IND (".{1,14}")/, raw: 'Fn 9C', params: 'nam' },
            { regex: /RCL× IND (\d{2})/, raw: 'F2 D3 8r', params: 'reg' },
            { regex: /RCL× ST ([XYZLT])/, raw: 'F2 D3 7t', params: 'stk' },
            { regex: /RCL× (".{1,14}")/, raw: 'Fn 94', params: 'nam' },
            { regex: /RCL× (\d{2})/, raw: 'F2 D3 rr', params: 'reg' }
        ]
    },
    {
        key: 'RCL÷',
        value: [
            { regex: /RCL÷ IND ST ([XYZLT])/, raw: 'F2 D4 Ft', params: 'stk' },
            { regex: /RCL÷ IND (".{1,14}")/, raw: 'Fn 9D', params: 'nam' },
            { regex: /RCL÷ IND (\d{2})/, raw: 'F2 D4 8r', params: 'reg' },
            { regex: /RCL÷ ST ([XYZLT])/, raw: 'F2 D4 7t', params: 'stk' },
            { regex: /RCL÷ (".{1,14}")/, raw: 'Fn 95', params: 'nam' },
            { regex: /RCL÷ (\d{2})/, raw: 'F2 D4 rr', params: 'reg' }
        ]
    },
    { key: 'RDX,', value: [{ regex: /RDX,/, raw: 'A2 5C' }] },
    { key: 'RDX.', value: [{ regex: /RDX./, raw: 'A2 5B' }] },
    { key: 'REAL?', value: [{ regex: /REAL\?/, raw: 'A2 65' }] },
    { key: 'REALRES', value: [{ regex: /REALRES/, raw: 'A2 6B' }] },
    { key: 'RECT', value: [{ regex: /RECT/, raw: 'A2 5A' }] },
    { key: 'RND', value: [{ regex: /RND/, raw: '6E' }] },
    { key: 'RNRM', value: [{ regex: /RNRM/, raw: 'A6 ED' }] },
    { key: 'ROTXY', value: [{ regex: /ROTXY/, raw: 'A5 8B' }] },
    { key: 'RSUM', value: [{ regex: /RSUM/, raw: 'A6 D0' }] },
    { key: 'RTN', value: [{ regex: /RTN/, raw: '85' }] },
    { key: 'R↑', value: [{ regex: /R↑/, raw: '74' }] },
    { key: 'R↓', value: [{ regex: /R↓/, raw: '75' }] },
    {
        key: 'SCI',
        value: [
            { regex: /SCI 10/, raw: 'F1 D6' },
            { regex: /SCI 11/, raw: 'F1 E6' },
            { regex: /SCI IND ST ([XYZLT])/, raw: '9D Ft', params: 'stk' },
            { regex: /SCI IND (".{1,14}")/, raw: 'Fn DD', params: 'nam' },
            { regex: /SCI IND (\d{2})/, raw: '9D 8r', params: 'reg' },
            { regex: /SCI (0[0-9])/, raw: '9D nn', params: 'dig' } //00-09
        ]
    },
    { key: 'SDEV', value: [{ regex: /SDEV/, raw: '7D' }] },
    { key: 'SEED', value: [{ regex: /SEED/, raw: 'A0 73' }] },
    {
        key: 'SF',
        value: [
            { regex: /SF IND ST ([XYZLT])/, raw: 'A8 Ft', params: 'stk' },
            { regex: /SF IND (".{1,14}")/, raw: 'Fn A8', params: 'nam' },
            { regex: /SF IND (\d{2})/, raw: 'A8 8r', params: 'reg' },
            { regex: /SF (\d{2})/, raw: 'A8 rr', params: 'flg' } //00-99
        ]
    },
    { key: 'SIGN', value: [{ regex: /SIGN/, raw: '7A' }] },
    { key: 'SIN', value: [{ regex: /SIN/, raw: '59' }] },
    { key: 'SINH', value: [{ regex: /SINH/, raw: 'A0 61' }] },
    { key: 'SIZE', value: [{ regex: /SIZE (\d{2,4})/, raw: 'F3 F7 ss ss', params: 'siz' }] },
    { key: 'SLOPE', value: [{ regex: /SLOPE/, raw: 'A0 A4' }] },
    {
        key: 'SOLVE',
        value: [
            { regex: /SOLVE IND ST ([XYZLT])/, raw: 'F2 EB Ft', params: 'stk' },
            { regex: /SOLVE IND (".{1,14}")/, raw: 'Fn BF', params: 'nam' },
            { regex: /SOLVE IND (\d{2})/, raw: 'F2 EB 8r', params: 'reg' },
            { regex: /SOLVE (".{1,14}")/, raw: 'Fn B7', params: 'lbl' }
        ]
    },
    { key: 'SQRT', value: [{ regex: /SQRT/, raw: '52' }] },
    {
        key: 'STO',
        value: [
            { regex: /STO IND ST ([XYZLT])/, raw: '91 Ft', params: 'stk' },
            { regex: /STO IND (".{1,14}")/, raw: 'Fn 89', params: 'nam' },
            { regex: /STO IND (\d{2})/, raw: '91 8r', params: 'reg' },
            { regex: /STO ST ([XYZLT])/, raw: '91 7t', params: 'stk' },
            { regex: /STO (".{1,14}")/, raw: 'Fn 81', params: 'nam' },
            { regex: /STO (1[6-9]|[2-9][0-9])/, raw: '91 rr', params: 'reg' },
            { regex: /STO (0[0-9]|1[0-5])/, raw: '3r', params: 'reg' } // 00-15
        ]
    },
    {
        key: 'STO+',
        value: [
            { regex: /STO\+ IND ST ([XYZLT])/, raw: '92 Ft', params: 'stk' },
            { regex: /STO\+ IND (".{1,14}")/, raw: 'Fn 8A', params: 'nam' },
            { regex: /STO\+ IND (\d{2})/, raw: '92 8r', params: 'reg' },
            { regex: /STO\+ ST ([XYZLT])/, raw: '92 7t', params: 'stk' },
            { regex: /STO\+ (".{1,14}")/, raw: 'Fn 82', params: 'nam' },
            { regex: /STO\+ (\d{2})/, raw: '92 rr', params: 'reg' }
        ]
    },
    {
        key: 'STO-',
        value: [
            { regex: /STO- IND ST ([XYZLT])/, raw: '93 Ft', params: 'stk' },
            { regex: /STO- IND (".{1,14}")/, raw: 'Fn 8B', params: 'nam' },
            { regex: /STO- IND (\d{2})/, raw: '93 8r', params: 'reg' },
            { regex: /STO- ST ([XYZLT])/, raw: '93 7t', params: 'stk' },
            { regex: /STO- (".{1,14}")/, raw: 'Fn 83', params: 'nam' },
            { regex: /STO- (\d{2})/, raw: '93 rr', params: 'reg' }
        ]
    },
    { key: 'STOEL', value: [{ regex: /STOEL/, raw: 'A6 D6' }] },
    { key: 'STOIJ', value: [{ regex: /STOIJ/, raw: 'A6 D8' }] },
    { key: 'STOP', value: [{ regex: /STOP/, raw: '84' }] },
    {
        key: 'STO×',
        value: [
            { regex: /STO× IND ST ([XYZLT])/, raw: '94 Ft', params: 'stk' },
            { regex: /STO× IND (".{1,14}")/, raw: 'Fn 8C', params: 'nam' },
            { regex: /STO× IND (\d{2})/, raw: '94 8r', params: 'reg' },
            { regex: /STO× ST ([XYZLT])/, raw: '94 7t', params: 'stk' },
            { regex: /STO× (".{1,14}")/, raw: 'Fn 84', params: 'nam' },
            { regex: /STO× (\d{2})/, raw: '94 rr', params: 'reg' }
        ]
    },
    {
        key: 'STO÷',
        value: [
            { regex: /STO÷ IND ST ([XYZLT])/, raw: '95 Ft', params: 'stk' },
            { regex: /STO÷ IND (".{1,14}")/, raw: 'Fn 8D', params: 'nam' },
            { regex: /STO÷ IND (\d{2})/, raw: '95 8r', params: 'reg' },
            { regex: /STO÷ ST ([XYZLT])/, raw: '95 7t', params: 'stk' },
            { regex: /STO÷ (".{1,14}")/, raw: 'Fn 85', params: 'nam' },
            { regex: /STO÷ (\d{2})/, raw: '95 rr', params: 'reg' }
        ]
    },
    { key: 'STR?', value: [{ regex: /STR\?/, raw: 'A2 68' }] },
    { key: 'SUM', value: [{ regex: /SUM/, raw: 'A0 A5' }] },
    { key: 'TAN', value: [{ regex: /TAN/, raw: '5B' }] },
    { key: 'TANH', value: [{ regex: /TANH/, raw: 'A0 63' }] },
    { key: 'TIME', value: [{ regex: /TIME/, raw: 'A6 9C' }] },
    {
        key: 'TONE',
        value: [
            { regex: /TONE IND ST ([XYZLT])/, raw: '9F Ft', params: 'stk' },
            { regex: /TONE IND (".{1,14}")/, raw: 'Fn DF', params: 'nam' },
            { regex: /TONE IND (\d{2})/, raw: '9F 8r', params: 'reg' },
            { regex: /TONE ([0-9])/, raw: '9F tn', params: 'ton' } // 0-9
        ]
    },
    { key: 'TRACE', value: [{ regex: /TRACE/, raw: 'A7 5D' }] },
    { key: 'TRANS', value: [{ regex: /TRANS/, raw: 'A6 C9' }] },
    { key: 'UVEC', value: [{ regex: /UVEC/, raw: 'A6 CD' }] },
    {
        key: 'VARMENU',
        value: [
            { regex: /VARMENU IND ST ([XYZLT])/, raw: 'F2 F8 Ft', params: 'stk' },
            { regex: /VARMENU IND (".{1,14}")/, raw: 'Fn C9', params: 'nam' },
            { regex: /VARMENU IND (\d{2})/, raw: 'F2 F8 8r', params: 'reg' },
            { regex: /VARMENU (".{1,14}")/, raw: 'Fn C1', params: 'nam' }
        ]
    },
    {
        key: 'VIEW',
        value: [
            { regex: /VIEW IND ST ([XYZLT])/, raw: '98 Ft', params: 'stk' },
            { regex: /VIEW IND (".{1,14}")/, raw: 'Fn 88', params: 'nam' },
            { regex: /VIEW IND (\d{2})/, raw: '98 8r', params: 'reg' },
            { regex: /VIEW ST ([XYZLT])/, raw: '98 7t', params: 'stk' },
            { regex: /VIEW (".{1,14}")/, raw: 'Fn 80', params: 'nam' },
            { regex: /VIEW (\d{2})/, raw: '98 rr', params: 'reg' }
        ]
    },
    { key: 'WMEAN', value: [{ regex: /WMEAN/, raw: 'A0 AC' }] },
    { key: 'WRAP', value: [{ regex: /WRAP/, raw: 'A6 E2' }] },
    { key: 'X<0?', value: [{ regex: /X<0\?/, raw: '66' }] },
    {
        key: 'X<>',
        value: [
            { regex: /X<> IND ST ([XYZLT])/, raw: 'CE Ft', params: 'stk' },
            { regex: /X<> IND (".{1,14}")/, raw: 'Fn 8E', params: 'nam' },
            { regex: /X<> IND (\d{2})/, raw: 'CE 8r', params: 'reg' },
            { regex: /X<> ST ([XYZLT])/, raw: 'CE 7t', params: 'stk' },
            { regex: /X<> (".{1,14}")/, raw: 'Fn 86', params: 'nam' },
            { regex: /X<> (\d{2})/, raw: 'CE rr', params: 'reg' }
        ]
    },
    { key: 'X<>Y', value: [{ regex: /X<>Y/, raw: '71' }] },
    { key: 'X<Y?', value: [{ regex: /X<Y\?/, raw: '44' }] },
    { key: 'X=0?', value: [{ regex: /X=0\?/, raw: '67' }] },
    { key: 'X=Y?', value: [{ regex: /X=Y\?/, raw: '78' }] },
    { key: 'X>0?', value: [{ regex: /X>0\?/, raw: '64' }] },
    { key: 'X>Y?', value: [{ regex: /X>Y\?/, raw: '45' }] },
    {
        key: 'XEQ',
        value: [
            { regex: /XEQ IND ST ([XYZLT])/, raw: 'AE Ft', params: 'stk' },
            { regex: /XEQ IND (".{1,14}")/, raw: 'Fn AF', params: 'nam' },
            { regex: /XEQ IND (\d{2})/, raw: 'AE 8r', params: 'reg' },
            { regex: /XEQ (".{1,14}")/, raw: '1E Fn', params: 'lbl' },
            { regex: /XEQ (\d{2}|[a-eA-J])/, raw: 'E0 00 nn', params: 'lblno' } // 00-99,A-J,a-e { regex: /XEQ sl/, raw: 'E0 00 nn' }
        ]
    },
    { key: 'XOR', value: [{ regex: /XOR/, raw: 'A5 8A' }] },
    { key: 'XTOA', value: [{ regex: /XTOA/, raw: 'A6 6F' }] },
    { key: 'X↑2', value: [{ regex: /X↑2/, raw: '51' }] },
    { key: 'X≠0?', value: [{ regex: /X≠0\?/, raw: '63' }] },
    { key: 'X≠Y?', value: [{ regex: /X≠Y\?/, raw: '79' }] },
    { key: 'X≤0?', value: [{ regex: /X≤0\?/, raw: '7B' }] },
    { key: 'X≤Y?', value: [{ regex: /X≤Y\?/, raw: '46' }] },
    { key: 'X≥0?', value: [{ regex: /X≥0\?/, raw: 'A2 5F' }] },
    { key: 'X≥Y?', value: [{ regex: /X≥Y\?/, raw: 'A2 60' }] },
    { key: 'X≶Y', value: [{ regex: /X≶Y/, raw: '71' }] },
    { key: 'YINT', value: [{ regex: /YINT/, raw: 'A0 A6' }] },
    { key: 'Y↑X', value: [{ regex: /Y↑X/, raw: '53' }] },
    { key: '[FIND]', value: [{ regex: /\[FIND\]/, raw: 'A6 EC' }] },
    { key: '[MAX]', value: [{ regex: /\[MAX\]/, raw: 'A6 EB' }] },
    { key: '[MIN]', value: [{ regex: /\[MIN\]/, raw: 'A6 EA' }] },
    { key: '`str`', value: [{ regex: /(".{15}")/, raw: 'Fn', params: 'str' }] },
    { key: '±', value: [{ regex: /±/, raw: '54' }] },
    { key: '×', value: [{ regex: /×/, raw: '42' }] },
    { key: '÷', value: [{ regex: /÷/, raw: '43' }] },
    { key: 'Σ+', value: [{ regex: /Σ\+/, raw: '47' }] },
    { key: 'Σ-', value: [{ regex: /Σ-/, raw: '48' }] },
    {
        key: 'ΣREG',
        value: [
            { regex: /ΣREG IND ST ([XYZLT])/, raw: '99 Ft', params: 'stk' },
            { regex: /ΣREG IND (".{1,14}")/, raw: 'Fn DB', params: 'nam' },
            { regex: /ΣREG IND (\d{2})/, raw: '99 8r', params: 'reg' },
            { regex: /ΣREG (\d{2})/, raw: '99 rr', params: 'reg' }
        ]
    },
    { key: 'ΣREG?', value: [{ regex: /ΣREG\?/, raw: 'A6 78' }] },
    { key: '←', value: [{ regex: /←/, raw: 'A6 DC' }] },
    { key: '↑', value: [{ regex: /↑/, raw: 'A6 DE' }] },
    { key: '→', value: [{ regex: /→/, raw: 'A6 DD' }] },
    { key: '→DEC', value: [{ regex: /→DEC/, raw: '5F' }] },
    { key: '→DEG', value: [{ regex: /→DEG/, raw: '6B' }] },
    { key: '→HMS', value: [{ regex: /→HMS/, raw: '6C' }] },
    { key: '→HR', value: [{ regex: /→HR/, raw: '6D' }] },
    { key: '→OCT', value: [{ regex: /→OCT/, raw: '6F' }] },
    { key: '→POL', value: [{ regex: /→POL/, raw: '4F' }] },
    { key: '→RAD', value: [{ regex: /→RAD/, raw: '6A' }] },
    { key: '→REC', value: [{ regex: /→REC/, raw: '4E' }] },
    { key: '↓', value: [{ regex: /↓/, raw: 'A6 DF' }] },
    { key: '⊢`str`', value: [{ regex: /⊢(".{14}")/, raw: 'Fn 7F', params: 'str' }] } // max. length 14
];
exports.Encoder42 = Encoder42;


/***/ }),

/***/ "./src/encoder/encoderesult.ts":
/*!*************************************!*\
  !*** ./src/encoder/encoderesult.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** Encoding result of the complete code content */
class EncoderResult {
    constructor() {
        this.programs = [];
    }
    succeeded() {
        let succeeded = true;
        this.programs.forEach(program => {
            succeeded = succeeded && program.succeeded();
        });
        return succeeded;
    }
    getFirstError() {
        let error;
        for (let index = 0; index < this.programs.length; index++) {
            const program = this.programs[index];
            error = program.getFirstError();
            if (error) {
                return error;
            }
        }
        return undefined;
    }
    getHex(eol, useWhitespaceBetweenHex, useLineNumbers) {
        let hexAll = '';
        this.programs.forEach(rawprogram => {
            hexAll += rawprogram.getHex(eol, useLineNumbers);
        });
        if (!useWhitespaceBetweenHex) {
            hexAll = hexAll.replace(/ /g, '');
        }
        return hexAll.trim();
    }
    getRaw() {
        let raw = '';
        this.programs.forEach(rawprogram => {
            raw += rawprogram.getRaw() + ' ';
        });
        return raw.trim();
    }
    getSize() {
        let size = 0;
        this.programs.forEach(rawprogram => {
            size += rawprogram.getSize();
        });
        return size;
    }
}
exports.EncoderResult = EncoderResult;


/***/ }),

/***/ "./src/encoder/rawline.ts":
/*!********************************!*\
  !*** ./src/encoder/rawline.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const params_1 = __webpack_require__(/*! ../common/params */ "./src/common/params.ts");
/** Class for a raw line */
class RawLine {
    constructor() {
        this.codeLineNo = 0;
        this.docLine = -1;
        /** original code from the document */
        this.docCode = '';
        this.params = new params_1.Params();
        this.ignored = false;
        this._workCode = '';
        // get/set
        this._tokens = [];
        // get only
        this._token = '';
        // get only
        this._tokenLength = 0;
    }
    /** working code */
    set workCode(nC) {
        this._workCode = nC;
        this.tokens = this._workCode.split(' ');
    }
    get workCode() {
        return this._workCode;
    }
    set tokens(t) {
        this._tokens = t;
        this._tokenLength = this._tokens.length;
        if (this._tokenLength > 0) {
            this._token = this._tokens[0];
        }
    }
    get tokens() {
        return this._tokens;
    }
    get token() {
        return this._token;
    }
    get tokenLength() {
        return this._tokenLength;
    }
    hasError() {
        return !(this.error === undefined);
    }
    toString() {
        return ((this.docLine > -1 ? ', ' + this.docLine : '') +
            (this.codeLineNo ? ', ' + this.codeLineNo : '') +
            this.raw +
            (this.error ? ', ' + this.error : ''));
    }
}
exports.RawLine = RawLine;


/***/ }),

/***/ "./src/encoder/rawprogram.ts":
/*!***********************************!*\
  !*** ./src/encoder/rawprogram.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const bytes_1 = __webpack_require__(/*! ../common/bytes */ "./src/common/bytes.ts");
/** Class for a program, which contains several raw lines */
class RawProgram {
    constructor(startDocLine) {
        this.rawLines = [];
        this.size = 0;
        this.startDocLine = -1;
        this.startDocLine = startDocLine;
    }
    getRaw() {
        let rawAll = '';
        this.rawLines.forEach(rawLine => {
            rawAll += rawLine.raw + ' ';
        });
        return rawAll.trim();
    }
    getHex(eol, useLineNumbers) {
        let hexAll = '';
        this.rawLines.forEach(rawLine => {
            hexAll += (useLineNumbers ? (rawLine.codeLineNo < 10 ? '0' + rawLine.codeLineNo : rawLine.codeLineNo) + ': ' : '') + rawLine.raw + eol;
        });
        return hexAll; //no trim() !
    }
    succeeded() {
        return !(this.getFirstError() !== undefined);
    }
    getFirstError() {
        let errors = this.getErrors();
        if (errors) {
            return errors[0];
        }
        return undefined;
    }
    getErrors() {
        let errors = [];
        this.rawLines.forEach(rawLine => {
            // when error ...
            if (rawLine.error) {
                // push error ...
                errors.push(rawLine.error);
            }
        });
        return errors;
    }
    getSize() {
        // calculate raw program size ...
        // when END = 'C0 00 0D' at the end, ...
        let rawAll = this.getRaw();
        if (rawAll.endsWith('C0 00 0D')) {
            // ignore last END, substract 3 bytes
            this.size = bytes_1.toBytes(rawAll).length - 3;
        }
        else {
            this.size = bytes_1.toBytes(rawAll).length;
        }
        return this.size;
    }
    addLine(rawLine) {
        this.rawLines.push(rawLine);
    }
}
exports.RawProgram = RawProgram;


/***/ }),

/***/ "./src/encoder/rpnparser.ts":
/*!**********************************!*\
  !*** ./src/encoder/rpnparser.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const codeerror_1 = __webpack_require__(/*! ../common/codeerror */ "./src/common/codeerror.ts");
const encoder42_1 = __webpack_require__(/*! ./encoder42 */ "./src/encoder/encoder42.ts");
const rawprogram_1 = __webpack_require__(/*! ./rawprogram */ "./src/encoder/rawprogram.ts");
const rawline_1 = __webpack_require__(/*! ./rawline */ "./src/encoder/rawline.ts");
/** Command parser for a code line */
class RpnParser {
    //#endregion
    //#region Public
    constructor() {
        //#region Member
        this.debug = 0; // debug level 0=nothing, 1=minimal, 2=verbose
        this.programs = [];
        this.prgmLineNo = 0; // by parser auto incremented number
        this.prgmIndex = -1;
    }
    parse() {
        if (this.document) {
            let docLineCount = this.document.lineCount;
            let program;
            for (let docLine = 0; docLine < docLineCount; docLine++) {
                let line = this.document.lineAt(docLine);
                //{ ... }-line detected -> Prgm Start
                let match = line.text.match(/\{.*\}/);
                if (match) {
                    this.prgmIndex++;
                    program = new rawprogram_1.RawProgram(docLine);
                    this.programs.push(program);
                }
                if (program) {
                    let rawLine = this.parseLine(docLine, line.text);
                    // no parser error ...
                    if (rawLine.error === undefined) {
                        if (!rawLine.ignored) {
                            this.pushLine(rawLine);
                        }
                    }
                    else {
                        // parse error
                        this.pushLine(rawLine);
                    }
                }
            }
        }
    }
    parseLine(docLine, line) {
        let progErrorText;
        let rawLine = new rawline_1.RawLine();
        //save original code
        if (this.ignoredLine(line)) {
            rawLine.ignored = true;
            // reset line number when {} header line
            if (this.config && this.config.useLineNumbers) {
                switch (true) {
                    // code line is { n-Byte Prgm }
                    case /^00 {.*\}/.test(line):
                        this.prgmLineNo = 0;
                        break;
                    default:
                    //nothing
                }
            }
        }
        else {
            // increment
            this.prgmLineNo++;
            // read codeLineNo from code line
            if (this.config && this.config.useLineNumbers) {
                let match = line.match(/(^\d+)(▸|▶|>|\s+)/);
                if (match) {
                    rawLine.codeLineNo = parseInt(match[1]);
                }
            }
            //#region prepare line
            rawLine.docCode = line;
            rawLine.workCode = this.formatLine(line);
            if (/^\s*(⊢|)(".*")/.test(rawLine.workCode)) {
                // Is it a string "abc", ⊢"cde" ?
                this.readString(rawLine);
            }
            else if (/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/.test(rawLine.workCode)) {
                // Is it a number ?
                this.readFloatNumber(rawLine);
            }
            else if (encoder42_1.Encoder42.rpnMap.has(rawLine.token)) {
                // Is it a rpn command ?
                const patterns = encoder42_1.Encoder42.rpnMap.get(rawLine.token);
                if (patterns) {
                    let matched = false;
                    for (let i = 0; i < patterns.length; i++) {
                        const pattern = patterns[i];
                        //match ?
                        let match = rawLine.workCode.match(pattern.regex);
                        if (match) {
                            matched = true;
                            // Params included ?
                            this.checkParamsInMatch(pattern, rawLine, match);
                            rawLine.raw = pattern.raw;
                            break;
                        }
                    }
                    if (!matched) {
                        progErrorText = 'unvalid parameter';
                    }
                }
                else {
                    progErrorText = 'unvalid command';
                }
            }
            else {
                progErrorText = 'unvalid command';
            }
            //#endregion
            //#region Checks ...
            if (this.config && this.config.useLineNumbers && this.prgmLineNo !== rawLine.codeLineNo) {
                progErrorText = 'line number not correct: ' + this.prgmLineNo + '!==' + rawLine.codeLineNo;
            }
            //#endregion
        }
        if (progErrorText) {
            rawLine.error = new codeerror_1.CodeError(docLine, this.config && this.config.useLineNumbers ? this.prgmLineNo : -1, rawLine.docCode, String(progErrorText));
        }
        return rawLine;
    }
    //#endregion
    //#region Private Methods
    /** Read params from match like regex named group */
    checkParamsInMatch(pattern, rawLine, match) {
        if (pattern.params) {
            const params = pattern.params.split(',');
            // assign params like regex named groups
            for (let p = 0; p < params.length; p++) {
                const param = params[p];
                let k = p + 1;
                switch (true) {
                    case param === 'dig':
                        rawLine.params.dig = match[k];
                        rawLine.params.digno = parseInt(match[k]);
                        break;
                    case param === 'flg':
                        rawLine.params.flg = match[k];
                        rawLine.params.flgno = parseInt(match[k]);
                        break;
                    case param === 'key-1':
                        rawLine.params.key = match[k];
                        rawLine.params.keyno = parseInt(match[k]) - 1;
                        break;
                    case param === 'key':
                        rawLine.params.key = match[k];
                        rawLine.params.keyno = parseInt(match[k]);
                        break;
                    case param === 'lblno':
                        rawLine.params.lblno = parseInt(this.getLblNo(match[k])); //parseInt(this.getLblNo(match[k]));
                        break;
                    case param === 'lbl':
                        rawLine.params.lbl = this.removeDoubleQuotes(match[k]);
                        break;
                    case param === 'nam':
                        rawLine.params.nam = this.removeDoubleQuotes(match[k]);
                        break;
                    case param === 'reg':
                        rawLine.params.reg = match[k];
                        rawLine.params.regno = parseInt(match[k]);
                        break;
                    case param === 'siz':
                        rawLine.params.siz = match[k];
                        rawLine.params.sizno = parseInt(match[k]);
                        break;
                    case param === 'stk':
                        rawLine.params.stk = match[k];
                        break;
                    case param === 'ton':
                        rawLine.params.ton = match[k];
                        rawLine.params.tonno = parseInt(match[k]);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    /** Read a number */
    readFloatNumber(rawLine) {
        const match = rawLine.workCode.match(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/);
        if (match) {
            rawLine.params.num = match[0];
            rawLine.params.numno = parseFloat(match[0]); // or parseInt()
            rawLine.workCode = rawLine.workCode.replace(/^\s*-?\d+(\.\d+|)((ᴇ|e|E)-?\d{1,3}|)\s*$/, '`num`');
        }
    }
    /** Read a string */
    readString(rawLine) {
        let str = '';
        // only ⊢, not |- or ├
        let match = rawLine.workCode.match(/^\s*(⊢|)(".*")/);
        if (match) {
            str = this.removeDoubleQuotes(match[2]);
            rawLine.workCode = rawLine.workCode.replace(/^\s*(⊢|)"(.*)"/, '$1`str`');
            if (match[1] === '') {
                rawLine.raw = 'Fn'; //see EncoderFOCAL.rpnMap.get(`str`)[0];
            }
            else {
                rawLine.raw = 'Fn 7F'; //see EncoderFOCAL.rpnMap.get(⊢`str`)[0];
            }
        }
        // replace all occurences of focal character
        if (str && str.match(/(÷|×|√|∫|░|Σ|▶|π|¿|≤|\[LF\]|≥|≠|↵|↓|→|←|µ|μ|£|₤|°|Å|Ñ|Ä|∡|ᴇ|Æ|…|␛|Ö|Ü|▒|■|•|\\\\|↑)/)) {
            encoder42_1.Encoder42.charCodeMap.forEach((value, key) => {
                const regex = new RegExp(key, 'g');
                if (str) {
                    str = str.replace(regex, String.fromCharCode(value));
                }
            });
        }
        rawLine.params.str = str;
    }
    /** Converts lbl to number */
    getLblNo(lbl) {
        let int;
        let num = '';
        // Label A-J,a-e to number, or local number label
        if (lbl) {
            if (lbl.match(/(A|B|C|D|E|F|G|H|I|J)/)) {
                // A=65+37=102(0x66),B=66+37=103(0x67),...
                int = lbl.charCodeAt(0) + 37;
                num = String(int);
            }
            else if (lbl.match(/(a|b|c|d|e)/)) {
                // a=97+26=123(0x7B),b=98+26=124(0x7C),...
                int = lbl.charCodeAt(0) + 26;
                num = String(int);
            }
            else {
                num = lbl;
            }
        }
        return num;
    }
    pushLine(rawLine) {
        if (this.debug > 0) {
            console.log(rawLine.workCode + ' -> ' + rawLine.raw);
        }
        this.programs[this.prgmIndex].addLine(rawLine);
    }
    /** check if line can be ignored */
    ignoredLine(line) {
        // ignore blank lines, length === 0
        // ignore { 33-Byte Prgm }...
        // ignore comments (#|//)
        line = line.trim();
        const ignored = line.length === 0 || line.match(/\{.*\}/) !== null || line.match(/^\s*(#|@|\/\/)/) !== null;
        return ignored;
    }
    /** Prepare line */
    formatLine(line) {
        // Remove leading line numbers 01▸LBL "AA" or 07 SIN
        line = line.replace(/^\d+(▸|▶|>|\s+)/, '');
        // Comment //|@|#...
        let match = line.match(/"/);
        if (match) {
            // lines with strings and comment ...
            line = line.replace(/(".*")\s*(\/\/|@|#).*$/, '$1');
        }
        else {
            // all other lines ...
            line = line.replace(/(\/\/|@|#).*$/, '');
            // Replace too long spaces (?<!".*)\s{2,} , but not in strings
            //let regex = new RegExp(/\s{2,}/, "g");
            line = line.replace(/\s{2,}/g, ' ');
        }
        // Trim spaces
        line = line.trim();
        return line;
    }
    /** Removes double quotes */
    removeDoubleQuotes(str) {
        if (str) {
            // too simple
            // str = str.replace(/"/g, '');
            // cut start and end
            str = str.substr(1, str.length - 2);
        }
        return str;
    }
    /** Check in range min <= x <= max */
    inRange(x, min, max) {
        return ((x - min) * (x - max)) <= 0;
    }
}
exports.RpnParser = RpnParser;


/***/ }),

/***/ "./src/extension.ts":
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const tool_1 = __webpack_require__(/*! ./tool */ "./src/tool.ts");
const rawcontentprovider_1 = __webpack_require__(/*! ./provider/rawcontentprovider */ "./src/provider/rawcontentprovider.ts");
const rpnformatprovider_1 = __webpack_require__(/*! ./provider/rpnformatprovider */ "./src/provider/rpnformatprovider.ts");
function activate(context) {
    const tool = new tool_1.Tool();
    // 👍 formatter implemented using API
    // see https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices
    const formatProvider = new rpnformatprovider_1.RpnFormatProvider(); // implements provideDocumentFormattingEdits() method
    const disposableFormatProvider = vscode.languages.registerDocumentFormattingEditProvider([{ scheme: 'file', language: 'hp42s' }, { scheme: 'file', language: 'free42' }], formatProvider);
    const contentProvider = new rawcontentprovider_1.default(); // implements provideTextDocumentContent() method
    const disposableContentProvider = vscode.workspace.registerTextDocumentContentProvider('raw42', contentProvider);
    const disposableCommandEncode = vscode.commands.registerCommand('extension.Encode', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            tool.encode(editor);
        }
    });
    const disposableCommandDecode = vscode.commands.registerCommand('extension.Decode', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            tool.decode(editor);
        }
        else {
        }
    });
    const disposableCommandShow = vscode.commands.registerCommand('extension.ShowRaw', (fileUri) => {
        tool.showRaw(fileUri);
    });
    //Disposables
    context.subscriptions.push(tool);
    context.subscriptions.push(disposableCommandEncode);
    context.subscriptions.push(disposableCommandDecode);
    context.subscriptions.push(disposableCommandShow);
    context.subscriptions.push(disposableFormatProvider);
    context.subscriptions.push(disposableContentProvider);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),

/***/ "./src/provider/rawcontentprovider.ts":
/*!********************************************!*\
  !*** ./src/provider/rawcontentprovider.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const filesystem_1 = __webpack_require__(/*! ../common/filesystem */ "./src/common/filesystem.ts");
const configuration_1 = __webpack_require__(/*! ../common/configuration */ "./src/common/configuration.ts");
class RawContentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        if (RawContentProvider.s_instance) {
            RawContentProvider.s_instance.dispose();
        }
        RawContentProvider.s_instance = this;
    }
    static get instance() {
        return RawContentProvider.s_instance;
    }
    dispose() {
        this._onDidChange.dispose();
        if (RawContentProvider.s_instance) {
            RawContentProvider.s_instance.dispose();
            RawContentProvider.s_instance = null;
        }
    }
    provideTextDocumentContent(uri) {
        const sizeWarning = 5242880;
        const sizeDisplay = 5242880;
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const config = new configuration_1.Configuration(true);
            const tail = ''; //'(Reached the maximum size to display. You can change "raw42.sizeDisplay" in your settings.)';
            const eol = config.eol;
            const proceed = filesystem_1.getFileSize(uri) < sizeWarning
                ? 'Open'
                : yield vscode.window.showWarningMessage('File might be too big, are you sure you want to continue?', 'Open');
            if (proceed === 'Open') {
                //Example:
                //   Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
                // 00000000: C0 00 F8 00 45 51 55 45 45 4E 53 FD 38 20 51 75
                // 00000010: 65 65 6E 73 20 76 31 2E 30 F7 7F 20 52 65 61 64
                //Offset
                let content = '  Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F' + eol + '00000000: ';
                let buf = filesystem_1.getBuffer(uri);
                if (buf) {
                    let length = buf.length > sizeDisplay ? sizeDisplay : buf.length;
                    for (let index = 0; index < length; index++) {
                        const byte = buf[index];
                        // next line ?  not first line      &&     last line                       00000000: leading address
                        const nl = (index + 1) % 16 === 0 && index < length - 1
                            ? ' ' + eol + ('0000000' + ((index + 1) & 0xffffffff).toString(16)).slice(-8).toUpperCase() + ': '
                            : ' ';
                        // add to string
                        content += ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase() + nl;
                    }
                    if (buf.length > sizeDisplay) {
                        content += tail;
                    }
                }
                return resolve(content); //no trim !!
            }
            else {
                return resolve('("hp42s/free42: Show Raw" cancelled.)');
            }
        }));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
}
RawContentProvider.s_instance = null;
exports.default = RawContentProvider;


/***/ }),

/***/ "./src/provider/rpnformatprovider.ts":
/*!*******************************************!*\
  !*** ./src/provider/rpnformatprovider.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const configuration_1 = __webpack_require__(/*! ../common/configuration */ "./src/common/configuration.ts");
/** Formatter for the code */
class RpnFormatProvider {
    constructor() { }
    provideDocumentFormattingEdits(document) {
        let edits = [];
        if (document.languageId.match(/(hp42s|free42)/i)) {
            // read Configuration
            let config = new configuration_1.Configuration(true);
            let codeLineNo = 0;
            // go through document line by line
            for (let i = 0; i < document.lineCount; i++) {
                let line = document.lineAt(i);
                let text = line.text;
                if (!line.isEmptyOrWhitespace) {
                    // 1. Remove line numbers
                    switch (true) {
                        // no replace for 123 @ comment
                        case /^\s*\d+\s+(@|#|\/\/)(.*)/.test(text):
                            //do nothing
                            break;
                        case /(^\s*\d+)\s+(\d+)(.+)/.test(text):
                            text = text.replace(/(^\s*\d+)\s+(\d+)(.+)/, '$2$3'); //01 33  -> 33
                            break;
                        case /(^\s*\d+)\s+(\w+)/.test(text):
                            text = text.replace(/(^\s*\d+)\s+(\w+)/, '$2'); //01 ABC -> ABC
                            break;
                        case /(^\s*\d+)\s+(\W)/.test(text):
                            text = text.replace(/(^\s*\d+)\s+(\W)/, '$2'); //01 +   -> +
                            break;
                        case /(^\s*\d+)\s+(\{.*)/.test(text):
                            text = text.replace(/(^\s*\d+)\s+(\{.*)/, '$2'); //01 { 1 -> { 1
                            break;
                        case /(^\s*\d+)(▸|▶|>)(LBL.+)/.test(text):
                            text = text.replace(/(^\s*\d+)(▸|▶|>)(LBL.+)/, '$3'); //01>LBL  -> LBL
                            break;
                        default:
                            break;
                    }
                    // 2. Replace always ...
                    text = text.replace(/“/, '"'); // ->“RSAST”
                    text = text.replace(/”/, '"'); //   “RSAST”<-
                    text = text.replace(/^\*/, '×'); //  * -> ×
                    text = text.replace(/^x/, '×'); //  x -> ×  
                    text = text.replace(/–/g, '-'); //  – -> -
                    text = text.replace(/\[LF\]/g, '␊'); //  [LF] -> ␊
                    // 3. Remove abbreviarion \Sigma, \GS, +/-, ...
                    if (config.replaceAbbreviations) {
                        // see https://www.swissmicros.com/dm42/decoder/ see 2. tab
                        text = text.replace(/(^\s*)RCLx/, '$1RCL×');
                        text = text.replace(/(^\s*)RCL\*/, '$1RCL×');
                        text = text.replace(/(^\s*)RCL\//, '$1RCL÷');
                        text = text.replace(/(^\s*)STOx/, '$1STO×');
                        text = text.replace(/(^\s*)STO\*/, '$1STO×');
                        text = text.replace(/(^\s*)STO\//, '$1STO÷');
                        text = text.replace(/(^\s*)BASEx/, '$1BASE×');
                        text = text.replace(/(^\s*)BASE\*/, '$1BASE×');
                        text = text.replace(/(^\s*)BASE\//, '$1BASE÷');
                        text = text.replace(/(^\s*)BASE\+\/-/, '$1BASE±');
                        text = text.replace(/(^\s*)(R(\\|)\^)/, '$1R↑');
                        text = text.replace(/(^\s*)(R(\\|)v)\b/, '$1R↓');
                        text = text.replace(/(^\s*)(\\|)(Sigma|SUM|GS)\+/, '$1Σ+');
                        text = text.replace(/(^\s*)(\\|)(Sigma|SUM|GS)-/, '$1Σ-');
                        text = text.replace(/(^\s*)ALL(\\|)(Sigma|SUM|GS)/, '$1ALLΣ');
                        text = text.replace(/(^\s*)CL(\\|)(Sigma|SUM|GS)/, '$1CLΣ');
                        text = text.replace(/(^\s*)LIN(\\|)(Sigma|SUM|GS)/, '$1LINΣ');
                        text = text.replace(/(^\s*)PR(\\|)(Sigma|SUM|GS)/, '$1PRΣ');
                        text = text.replace(/(^\s*)(\\|)(Sigma|SUM|GS)REG/, '$1ΣREG');
                        text = text.replace(/(^\s*)(\\|)->HR/, '$1→HR');
                        text = text.replace(/(^\s*)(\\|)->HMS/, '$1→HMS');
                        text = text.replace(/(^\s*)(\\|)->DEC/, '$1→DEC');
                        text = text.replace(/(^\s*)(\\|)->OCT/, '$1→OCT');
                        text = text.replace(/(^\s*)(\\|)->RAD/, '$1→RAD');
                        text = text.replace(/(^\s*)(\\|)->HMS/, '$1→HMS');
                        text = text.replace(/(^\s*)(\\|)->REC/, '$1→REC');
                        text = text.replace(/(^\s*)(\\|)->DEG/, '$1→DEG');
                        text = text.replace(/(^\s*)(\\|)->POL/, '$1→POL');
                        text = text.replace(/(^\s*)X!=0\?/, '$1X≠0?');
                        text = text.replace(/(^\s*)X\/=0\?/, '$1X≠0?');
                        text = text.replace(/(^\s*)X#Y\?/, '$1X≠Y?');
                        text = text.replace(/(^\s*)X#0\?/, '$1X≠0?');
                        text = text.replace(/(^\s*)X<=0\?/, '$1X≤0?');
                        text = text.replace(/(^\s*)X>=0\?/, '$1X≥0?');
                        text = text.replace(/(^\s*)X!=Y\?/, '$1X≠Y');
                        text = text.replace(/(^\s*)X<=Y\?/, '$1X≤Y?');
                        text = text.replace(/(^\s*)X>=Y\?/, '$1X≥Y?');
                        text = text.replace(/(^\s*)10\^(x|X)/, '$110↑X');
                        text = text.replace(/(^\s*)(x|X)\^2/, '$1X↑2');
                        text = text.replace(/(^\s*)Y\^(x|X)/, '$1Y↑X');
                        text = text.replace(/(^\s*)(e|E)\^(x|X)/, '$1E↑X');
                        text = text.replace(/(^\s*)(e|E)\^(x|X)-1/, '$1E↑X-1');
                        text = text.replace(/(^\s*)<-\b/, '$1←');
                        text = text.replace(/(^\s*)\^\b/, '$1↑');
                        text = text.replace(/(^\s*)v\b/, '$1↓');
                        text = text.replace(/(^\s*)->\b/, '$1→');
                        text = text.replace(/(^\s*)\/$/, '$1÷');
                        text = text.replace(/(^\s*)\|-/, '$1⊢');
                        text = text.replace(/(^\s*)├/, '$1⊢'); //├
                        text = text.replace(/(\d+)\s*(e|E)(.*)/, '$1ᴇ$3');
                    }
                    // 4. Reduce whitspace
                    if (config.removeTooLongSpaces) {
                        if (!/".*"/.test(text)) {
                            // All without double quotes
                            text = text.replace(/\s{2,}/g, ' ');
                        }
                        else {
                            // with double quotes ...
                            // reduce whitespace from line beginning to first double quotes
                            if (/^(\w+)(\s+)"/.test(text)) {
                                text = text.replace(/^(\w+)(\s+)"/, '$1 "');
                            }
                            // reduce whitespace from last double quote to the end of line
                            //if (/"\s{2,}/.test(text)) {
                            //  text = text.replace(/"\s{2,}/g, '" ');
                            //}
                        }
                        if (/\s+IND\s+/.test(text)) {
                            text = text.replace(/\s+IND\s+/, ' IND ');
                        }
                        if (/\s+TO\s+/.test(text)) {
                            text = text.replace(/\s+TO\s+/, ' TO ');
                        }
                        // LBL "A" -> LBL A, without doublequotes
                        if (/(LBL|GTO|XEQ) "([A-J,a-e])"/.test(text)) {
                            text = text.replace(/(LBL|GTO|XEQ) "([A-J,a-e])"/, '$1 $2');
                        }
                    }
                    // 5. Trim
                    if (config.trimLine) {
                        text = text.trim();
                    }
                    // 6. Insert/Refresh line numbers, when using line numbers
                    if (config.useLineNumbers) {
                        // when not comment line ...
                        if (!text.match(/^\s*(@|#|\/\/)/)) {
                            switch (true) {
                                // code line is { n-Byte Prgm }
                                case /^\{.*\}/.test(text):
                                    codeLineNo = 0;
                                    break;
                                default:
                                    codeLineNo++;
                            }
                            // prepend line number
                            text = (codeLineNo < 10 ? '0' + codeLineNo : codeLineNo) + ' ' + text;
                        }
                    }
                    edits.push(vscode.TextEdit.replace(new vscode.Range(line.range.start, line.range.end), text));
                }
            }
        }
        return edits;
    }
    dispose() { }
}
exports.RpnFormatProvider = RpnFormatProvider;


/***/ }),

/***/ "./src/tool.ts":
/*!*********************!*\
  !*** ./src/tool.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const configuration_1 = __webpack_require__(/*! ./common/configuration */ "./src/common/configuration.ts");
const filesystem_1 = __webpack_require__(/*! ./common/filesystem */ "./src/common/filesystem.ts");
const encoder_1 = __webpack_require__(/*! ./encoder/encoder */ "./src/encoder/encoder.ts");
const decoder_1 = __webpack_require__(/*! ./decoder/decoder */ "./src/decoder/decoder.ts");
class Tool {
    constructor() {
        this.encoder = new encoder_1.Encoder();
        this.decoder = new decoder_1.Decoder();
    }
    encode(editor) {
        if (editor) {
            const config = new configuration_1.Configuration(true);
            const document = editor.document;
            if (document) {
                const languageId = document.languageId.toLowerCase();
                const eol = ['', '\n', '\r\n'][document.eol];
                if (languageId.match(/(hp42s|free42)/)) {
                    // start encoding ...
                    let result = this.encoder.encode(languageId, editor);
                    if (result) {
                        const useWhitespaceBetweenHex = config.useWhitespaceBetweenHex;
                        const useLineNumbers = config.useLineNumbers;
                        // no encoding errors ...
                        if (result.succeeded()) {
                            // save result and show messages
                            if (result.programs !== undefined) {
                                // Save *.hex42 output ...
                                if (config.encoderGenerateHexFile) {
                                    const hex = result.getHex(eol, useWhitespaceBetweenHex, useLineNumbers);
                                    filesystem_1.writeText(document.fileName + '.hex42', hex);
                                }
                                // Save *.raw output ...
                                const raw = result.getRaw();
                                const size = result.getSize();
                                filesystem_1.writeBytes(document.fileName + '.raw', raw);
                                // Show Info ...
                                vscode.window.showInformationMessage(Tool.EXTPREFIX + ': { ' + size + '-Byte Prgm }');
                            }
                            else {
                                // nothing happend ...
                                vscode.window.showInformationMessage(Tool.EXTPREFIX + ': No code found.');
                            }
                            // Delete log file
                            filesystem_1.deleteFile(document.fileName + '.log');
                        }
                        else {
                            // handle ecoding errors ...
                            const firstError = result.getFirstError();
                            let firstErrorText = firstError !== undefined ? firstError.toString() : '';
                            if (!useLineNumbers) {
                                firstErrorText = firstErrorText.replace(/ \[.*\]/, '');
                            }
                            // Show error ...
                            vscode.window.showErrorMessage(Tool.EXTPREFIX + ': Encoding failed.' + eol + firstErrorText);
                            // Create log file
                            this.writeErrorsToLog(document.fileName + '.log', result, eol, config.useLineNumbers);
                        }
                        // Update all {...} line
                        this.updateHeadLines(editor, result, config.useLineNumbers);
                    }
                }
                else {
                    // wrong file
                    vscode.window.showWarningMessage(Tool.EXTPREFIX + ': Document is not a *.hp42s/*.free42 file type.');
                }
            }
        }
    }
    decode(editor) {
        if (editor) {
            const config = new configuration_1.Configuration(true);
            const document = editor.document;
            if (document) {
                const eol = ['', '\n', '\r\n'][document.eol];
                const languageId = document.languageId.toLowerCase();
                const scheme = document.uri.scheme.toLowerCase();
                if (languageId.match(/raw42/) && scheme.match(/raw42/)) {
                    // start decoding ...
                    const result = this.decoder.decode(editor);
                    if (result) {
                        // no decoding errors ...
                        if (result.succeeded) {
                            // save result and show messages
                            if (result.programs !== undefined) {
                                const useLineNumbers = config.useLineNumbers;
                                // Save *.hex42 output
                                if (config.decoderGenerateHexFile) {
                                    const useWhitespaceBetweenHex = config.useWhitespaceBetweenHex;
                                    const hex = result.getHex(eol, useWhitespaceBetweenHex, useLineNumbers);
                                    const hexFileName = document.fileName.replace('raw42', 'hex42');
                                    filesystem_1.writeText(hexFileName, hex);
                                }
                                // Save *.hp42s/*.free42
                                const size = result.getSize();
                                let headLine = '';
                                if (result.succeeded()) {
                                    headLine = (useLineNumbers ? '00 ' : '') + '{ ' + size + '-Byte Prgm }';
                                    vscode.window.showInformationMessage(Tool.EXTPREFIX + ': { ' + size + '-Byte Prgm }');
                                }
                                else {
                                    const firstError = result.getFirstError();
                                    let firstErrorText = firstError ? firstError.toString() : '';
                                    if (!useLineNumbers) {
                                        firstErrorText = firstErrorText.replace(/ \[.*\]/, '');
                                    }
                                    headLine = (useLineNumbers ? '00 ' : '') + '{ ' + firstErrorText + ' }';
                                    vscode.window.showErrorMessage(Tool.EXTPREFIX + ': { ' + firstErrorText + ' }');
                                }
                                let rpn = headLine + eol;
                                rpn += result.getRpn(eol, useLineNumbers);
                                const rpnFileName = document.fileName.replace('raw42', result.languageId);
                                filesystem_1.writeText(rpnFileName, rpn);
                            }
                            else {
                                // nothing happend ...
                                vscode.window.showInformationMessage(Tool.EXTPREFIX + ': No raw format found.');
                            }
                        }
                        else {
                            const firstError = result.getFirstError();
                            const firstErrorText = firstError !== undefined ? firstError.toString() : '';
                            // Show error ...
                            vscode.window.showErrorMessage(Tool.EXTPREFIX + ': Decoding failed.' + eol + firstErrorText);
                        }
                    }
                }
                else {
                    vscode.window.showErrorMessage(Tool.EXTPREFIX + ': Decoding failed.' + eol + 'Wrong file type.');
                }
            }
        }
    }
    showRaw(fileUri) {
        if (typeof fileUri === 'undefined' || !(fileUri instanceof vscode.Uri)) {
            if (vscode.window.activeTextEditor === undefined) {
                vscode.commands.executeCommand('hexdump.hexdumpPath');
                return;
            }
            fileUri = vscode.window.activeTextEditor.document.uri;
        }
        if (fileUri.scheme === 'hexdump') {
            //toggle with actual file
            const filePath = filesystem_1.getPhysicalPath(fileUri);
            for (const editor of vscode.window.visibleTextEditors) {
                if (editor.document.uri.fsPath === filePath) {
                    vscode.window.showTextDocument(editor.document, editor.viewColumn);
                    return;
                }
            }
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
        }
        else {
            this.vscodeOpenRaw42(fileUri.fsPath);
        }
    }
    /** Create log file */
    writeErrorsToLog(filename, result, eol, useLineNumbers) {
        let allErrors = '';
        if (result.programs) {
            result.programs.forEach(program => {
                let errors = program.getErrors();
                if (errors) {
                    errors.forEach(error => {
                        allErrors += error ? error.toString() + eol : '';
                    });
                }
            });
            if (!useLineNumbers) {
                allErrors = allErrors.replace(/ \[.*\]/g, '');
            }
            filesystem_1.writeText(filename, allErrors);
        }
    }
    /** {} Head lines */
    updateHeadLines(editor, result, useLineNumbers) {
        editor
            .edit(e => {
            // Walk through reverse (!!) all programs and insert/update head line.
            // Reverse iteration for easier insert of new header lines.
            result.programs.reverse().forEach(program => {
                const startDocLine = program.startDocLine;
                const size = program.getSize();
                const firstError = program.getFirstError();
                let firstErrorText = firstError ? firstError.toString() : '';
                if (!useLineNumbers) {
                    firstErrorText = firstErrorText.replace(/ \[.*\]/, '');
                }
                const headLine = editor.document.lineAt(startDocLine);
                let line = '';
                if (program.succeeded()) {
                    line = (useLineNumbers ? '00 ' : '') + '{ ' + size + '-Byte Prgm }';
                }
                else {
                    line = (useLineNumbers ? '00 ' : '') + '{ ' + firstErrorText + ' }';
                }
                if (headLine) {
                    if (/\{.*\}/.test(headLine.text)) {
                        e.replace(new vscode.Range(headLine.range.start, headLine.range.end), line);
                    }
                }
            });
        })
            .then(success => {
            //done;
        });
    }
    vscodeOpenRaw42(filePath) {
        if (typeof filePath === 'undefined') {
            return;
        }
        if (!filesystem_1.existsSync(filePath)) {
            return;
        }
        const fileUri = vscode.Uri.file(filePath.concat('.raw42'));
        // add 'raw42' extension to assign an editorLangId
        const hexUri = fileUri.with({ scheme: 'raw42' });
        vscode.commands.executeCommand('vscode.open', hexUri);
    }
    dispose() {
        this.encoder.dispose();
        this.decoder.dispose();
    }
}
Tool.EXTPREFIX = 'hp42s/free42';
exports.Tool = Tool;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ })

/******/ });
//# sourceMappingURL=extension.js.map