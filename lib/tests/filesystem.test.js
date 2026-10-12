const fs = require('fs');
const os = require('os');
const path = require('path');
const { assertResult } = require('../assert');

describe('native filesystem inputs', () => {
    let directory;
    let savedEnv;
    let core;

    beforeEach(() => {
        savedEnv = process.env;
        process.env = { ...savedEnv, RESULT: '[{"name":"test"}]', EXPECTED_ROWS: '1' };
        delete process.env.EXPECTED_RESULTS_STR;
        delete process.env.EXPECTED_RESULTS_FILE_PATH;
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stackql assert '));
        core = { info: jest.fn(), error: jest.fn(), setFailed: jest.fn() };
    });

    afterEach(() => {
        process.env = savedEnv;
        fs.rmSync(directory, { recursive: true, force: true });
    });

    it.each(['\n', '\r\n'])('reads a native absolute path with spaces and %j newlines', newline => {
        const file = path.join(directory, 'expected results.json');
        fs.writeFileSync(file, ['[', '  {"name":"test"}', ']'].join(newline));
        process.env.EXPECTED_RESULTS_FILE_PATH = file;
        process.env.RESULT = `${newline}[{"name":"test"}]${newline}`;

        assertResult(core);

        expect(core.error).not.toHaveBeenCalled();
        expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('fails when a results file cannot be read', () => {
        process.env.EXPECTED_RESULTS_FILE_PATH = path.join(directory, 'missing.json');

        assertResult(core);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('ENOENT'));
    });
});
