//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as RpnProgParser from "../../encoder/RpnProgParser";
import * as RawProgParser from "../../decoder/RawProgParser";
import { IRpnResult } from '../../encoder/IRpnResult';
import { IRawResult } from '../../decoder/IRawResult';


// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function () {

    test('Parse RPN', function () {
        const content = '00 { 0-Byte Pgrm }';
        const result = RpnProgParser.parse(content) as IRpnResult;

        assert.strictEqual(result, undefined, 'RPN Parsing failed');
    });

    test('Parse RAW', function () {
        const content = 'C0 00 F2 00 41 61 61 59 89 FF C0 00 0D';
        const result = RawProgParser.parse(content) as IRawResult;

        assert.strictEqual(result, undefined, 'RAW Parsing failed');
    });

});
