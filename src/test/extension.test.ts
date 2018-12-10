//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { EncoderFOCAL } from '../encoder/encoderfocal';
import { DecoderFOCAL } from '../decoder/decoderfocal';
import { RpnParser } from '../encoder/rpnparser';
import { RawParser } from '../decoder/rawparser';
import { RawLine } from '../encoder/rawline';
import { RpnLine } from '../decoder/rpnline';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function() {
  test('Rpn Parser Tests', function() {
    let parser = new RpnParser();
    let rawLine: RawLine;

    rawLine = parser.parseLine(0, 'LBL "ABC"');

    assert.equal('LBL', rawLine.token, 'reading token failed');
    assert.equal('ABC', rawLine.params.lbl, 'reading parser.lbl failed');

    rawLine = parser.parseLine(0, '"Some Text"');
    assert.equal('`str`', rawLine.token, 'reading token failed');
    assert.equal('Some Text', rawLine.params.str, 'reading parser.str failed');

    rawLine = parser.parseLine(0, '1234');
    assert.equal('`num`', rawLine.token, 'reading parser.token failed');
    assert.equal('1234', rawLine.params.num, 'reading parser.num failed');

    rawLine = parser.parseLine(0, 'TONE 9');
    assert.equal('TONE', rawLine.token, 'reading parser.token failed');
    assert.equal('9', rawLine.params.ton, 'reading parser.ton failed');
  });

  test('Encoder Tests', function() {
    EncoderFOCAL.initialize();

    let parser = new RpnParser();
    let rawLine: RawLine;

    rawLine = parser.parseLine(0, 'LBL "ABC"');
    EncoderFOCAL.toRaw(rawLine, 'hp42s');
    assert.equal('C0 00 F4 00 41 42 43', rawLine.raw, 'encoding failed at ' + rawLine.code);

    rawLine = parser.parseLine(0, '"Some Text"');
    EncoderFOCAL.toRaw(rawLine, 'hp42s');
    assert.equal('F9 53 6F 6D 65 20 54 65 78 74', rawLine.raw, 'encoding failed at ' + rawLine.code);

    rawLine = parser.parseLine(0, '1234');
    EncoderFOCAL.toRaw(rawLine, 'hp42s');
    assert.equal('11 12 13 14 00', rawLine.raw, 'encoding failed at ' + rawLine.code);
  });

  test('Raw Parser Tests', function() {
    DecoderFOCAL.initialize();

    let bytes = ['C0','00','F8','00','54','4F','4F','2D','4C','4F','4E','11','11','11','00','C0','00','0D'];
    let parser = new RawParser(bytes);

    //LBL `lbl`
    let length = parser.parseCommand(0);

    assert.equal('11', length, 'decoding failed at ' + parser.programs[0].rpnLines[0].normCode);

    //11 11 11 00
    length = parser.parseNumber(11);
    length = parser.parseNumber(12);
    length = parser.parseNumber(13);
    length = parser.parseNumber(14);

    assert.equal('`num`', parser.programs[0].rpnLines[1].normCode, 'decoding failed at ' + parser.programs[0].rpnLines[1].normCode);

  });

});
