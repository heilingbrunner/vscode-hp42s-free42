//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { RpnParser } from '../encoder/rpnparser';
import { EncoderFOCAL } from '../encoder/encoderfocal';
import { RawLine } from '../encoder/rawline';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function() {

  test('Parser Tests', function() {
    let parser = new RpnParser(false);
    parser.read(0, 'LBL "ABC"');

    assert.equal('LBL', parser.token, 'reading token failed');
    assert.equal('ABC', parser.lbl, 'reading parser.lbl failed');

    parser.read(0, '"Some Text"');
    assert.equal('`str`', parser.token, 'reading token failed');
    assert.equal('Some Text', parser.str, 'reading parser.str failed');

    parser.read(0, '1234');
    assert.equal('`num`', parser.token, 'reading parser.token failed');
    assert.equal('1234', parser.num, 'reading parser.num failed');

    parser.read(0, 'TONE 9');
    assert.equal('TONE', parser.token, 'reading parser.token failed');
    assert.equal('9', parser.ton, 'reading parser.ton failed');
  });

  test('Encoder Tests', function() {
    EncoderFOCAL.initializeForEncode();

    let result: RawLine;
    let parser = new RpnParser(false);

    parser.read(0, 'LBL "ABC"');
    result = EncoderFOCAL.toRaw(0, 'hp42s', parser);
    assert.equal(
      'C0 00 F4 00 41 42 43',
      result.raw,
      'encoding failed at ' + parser.code
    );

    parser.read(0, '"Some Text"');
    result = EncoderFOCAL.toRaw(0, 'hp42s', parser);
    assert.equal(
      'F9 53 6F 6D 65 20 54 65 78 74',
      result.raw,
      'encoding failed at ' + parser.code
    );

    parser.read(0, '1234');
    result = EncoderFOCAL.toRaw(0, 'hp42s', parser);
    assert.equal(
      '11 12 13 14 00',
      result.raw,
      'encoding failed at ' + parser.code
    );

  });
});
