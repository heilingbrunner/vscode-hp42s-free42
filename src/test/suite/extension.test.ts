import * as assert from 'assert';
import * as RpnProgParser from "../../encoder/RpnProgParser";
import * as RawProgParser from "../../decoder/RawProgParser";
import { IRpnResult } from '../../encoder/IRpnResult';
import { IRawResult } from '../../decoder/IRawResult';

export async function runTests(): Promise<void> {
    const rpnContent = '00 { 0-Byte Pgrm }';
    const rpnResult = RpnProgParser.parse(rpnContent) as IRpnResult;
    assert.strictEqual(rpnResult, undefined, 'RPN Parsing failed');

    const rawContent = 'C0 00 F2 00 41 61 61 59 89 FF C0 00 0D';
    const rawResult = RawProgParser.parse(rawContent) as IRawResult;
    assert.strictEqual(rawResult, undefined, 'RAW Parsing failed');
}
