const { assertResult, parseResult, getExpectedResult } = require('./assert');
const fs = require('fs');

jest.mock('fs');

describe('assert.js functions', () => {
  let core;

  beforeEach(() => {
    core = {
      info: jest.fn(),
      error: jest.fn(),
      setFailed: jest.fn()
    };
    process.env.RESULT = JSON.stringify([{ id: 1, value: 'test' }]);
    process.env.EXPECTED_ROWS = '1';
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('parseResult', () => {
    it('should correctly parse valid JSON', () => {
      const input = JSON.stringify({ key: 'value' });
      expect(parseResult(input, 'valid JSON')).toEqual({ key: 'value' });
    });

    it('should throw an error on invalid JSON', () => {
      const input = "invalid JSON";
      expect(() => parseResult(input, 'invalid JSON')).toThrow('Failed to parse invalid JSON JSON');
    });
  });

  describe('getExpectedResult', () => {
    it('should return parsed result from string', () => {
      const input = JSON.stringify({ key: 'value' });
      expect(getExpectedResult(input, null)).toEqual({ key: 'value' });
    });

    it('should return parsed result from file', () => {
      const input = JSON.stringify({ key: 'value' });
      fs.readFileSync.mockReturnValue(input);
      expect(getExpectedResult(null, 'path/to/file')).toEqual({ key: 'value' });
      expect(fs.readFileSync).toHaveBeenCalledWith('path/to/file', 'utf-8');
    });

    it('should throw an error if no input is provided', () => {
      expect(() => getExpectedResult(null, null)).toThrow('No expected result provided.');
    });
  });

  describe('assertResult', () => {
    it('should log success if the expected rows and results match', () => {
      process.env.EXPECTED_RESULTS_STR = process.env.RESULT;
      assertResult(core);
      expect(core.info).toHaveBeenCalledWith("✅ StackQL Assert Successful");
    });

    it('should fail if expected rows do not match', () => {
      process.env.EXPECTED_ROWS = '2'; // Actual result will have only one item
      assertResult(core);
      expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("Expected rows: 2, got: 1"));
    });

    it('should fail if expected results do not match', () => {
      process.env.EXPECTED_RESULTS_STR = JSON.stringify([{ id: 1, value: 'wrong' }]);
      assertResult(core);
      expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("Expected results do not match actual results."));
    });

    it('should handle errors during processing', () => {
      process.env.RESULT = 'invalid json';
      assertResult(core);
      expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("Assertion error"));
    });
  });
});
