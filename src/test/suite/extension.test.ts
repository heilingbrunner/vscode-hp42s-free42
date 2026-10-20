import * as assert from 'assert';
import * as RpnProgParser from "../../encoder/RpnProgParser";
import * as RawProgParser from "../../decoder/RawProgParser";
import { IRpnResult } from '../../encoder/IRpnResult';
import { IRawResult } from '../../decoder/IRawResult';

export async function runTests(): Promise<void> {
    const rpnContent = '00 { 0-Byte Prgm }\n01 LBL "A"\n02 END\n';
    const rpnResult = RpnProgParser.parse(rpnContent) as IRpnResult;
    assert.ok(rpnResult, 'RPN Parsing failed');
    assert.strictEqual(rpnResult.progs.length, 1, 'RPN: expected one program');

    const rawContent = 'C0 00 F2 00 41 61 61 59 89 FF C0 00 0D';
    const rawResult = RawProgParser.parse(rawContent) as IRawResult;
    assert.ok(rawResult, 'RAW Parsing failed');
    assert.strictEqual(rawResult.progs.length, 1, 'RAW: expected one program');
}
