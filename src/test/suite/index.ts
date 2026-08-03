import * as path from 'path';
import { glob } from 'glob';

export function run(): Promise<void> {
	const testsRoot = path.resolve(__dirname, '..');

	return new Promise(async (c, e) => {
		try {
			const files = await glob('**/*.test.js', { cwd: testsRoot });

			for (const f of files) {
				const testFilePath = path.resolve(testsRoot, f);
				const testModule = require(testFilePath) as {
					runTests?: () => Promise<void> | void;
				};

				if (typeof testModule.runTests !== 'function') {
					throw new Error(`Test module does not export runTests(): ${testFilePath}`);
				}

				await Promise.resolve(testModule.runTests());
			}

			c();
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}
