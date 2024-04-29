const {checkResult, parseResult, assertResult, getExpectedResult} = require('../assert')

describe('parseResult', ()=>{

    it('should parsedResult correctly', ()=>{
        const resultString = `[{"name":"stackql-demo-001","status":"TERMINATED"}]`
        const expected = [{"name":"stackql-demo-001","status":"TERMINATED"}]
        const actual = parseResult(resultString);
        expect(actual).toEqual(expected);
    })
})

describe('getExpectedResult', ()=>{
    it('should return expectedResult when expectedResultStr is passed', ()=>{
        const expectedResultStr = `[{"name":"stackql-demo-001","status":"TERMINATED"}]`
        const expectedResult = [{"name":"stackql-demo-001","status":"TERMINATED"}]

        const actual = getExpectedResult(expectedResultStr, undefined);

        expect(actual).toEqual(expectedResult);
    })

    it('should return expectedResult when expectedResultFilePath is passed', ()=>{
        const expectedResultFilePath = 'lib/tests/success-result.json'
        const expectedResult = [{"name":"stackql-demo-001","status":"TERMINATED"}]

        const actual = getExpectedResult(undefined, expectedResultFilePath);

        expect(actual).toEqual(expectedResult);
    })

})

describe('checkResult', () => {
    const core = {
        info: jest.fn(),
        error: jest.fn(),
        setFailed: jest.fn()
    };

    beforeEach(() => {
        core.info.mockClear();
        core.error.mockClear();
        core.setFailed.mockClear();
    });    

    it('should return false and log an error when the actual length does not match expected rows', () => {
        const expectedRows = "3";
        const actualResult = [{}, {}, {}, {}];  // 4 items, should not match expectedRows

        const result = checkResult(core, undefined, actualResult, expectedRows);

        expect(result).toBe(false);
        expect(core.error).toHaveBeenCalledWith(`Expected rows: ${expectedRows}, got: ${actualResult.length}`);
    });

    it('should return true when the actual length matches expected rows', () => {
        const expectedRows = "2";
        const actualResult = [{}, {}];  // 2 items, matches expectedRows

        const result = checkResult(core, undefined, actualResult, expectedRows);

        expect(result).toBe(true);
        expect(core.error).not.toHaveBeenCalled();
    });

    it('should return false and log an error when expected does not match actual and expectedRows is undefined', () => {
        const expected = [{ name: "test1" }, { name: "test2" }];
        const actual = [{ name: "test1" }, { name: "test3" }];

        const result = checkResult(core, expected, actual, undefined);

        expect(result).toBe(false);
        expect(core.error).toHaveBeenCalledWith(`Expected results do not match actual results.\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    });

    it('should return true when expected matches actual and expectedRows is undefined', () => {
        const expected = [{ name: "test1" }, { name: "test2" }];
        const actual = [{ name: "test1" }, { name: "test2" }];

        const result = checkResult(core, expected, actual, undefined);

        expect(result).toBe(true);
        expect(core.error).not.toHaveBeenCalled();
    });
});

describe('assertResult', ()=>{
    let coreObj;

    const ACTION_ENV = {
        RESULT: `[{"name":"stackql-demo-001","status":"TERMINATED"}]`,
        EXPECTED_RESULTS_STR: `[{"name":"stackql-demo-001","status":"TERMINATED"}]`,
        EXPECTED_RESULTS_FILE_PATH: 'test.json',
        EXPECTED_ROWS: 1
    }

    beforeEach(() => {
        jest.resetModules()
        process.env = {...ACTION_ENV}
        coreObj = {
            setFailed: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        }
    })
    afterEach(() => {
        process.env = ACTION_ENV
    })


    it('it should setFailed when there is expected results are undefined', () => {
        process.env.EXPECTED_RESULTS_FILE_PATH = undefined
        process.env.EXPECTED_RESULTS_STR = undefined
        process.env.EXPECTED_ROWS = undefined

        assertResult(coreObj)

        expect(coreObj.setFailed).toHaveBeenCalledWith('Assertion error: ❌ Cannot find expected result, file path or expected rows')
    });

    it('it should setFailed when actual result is not equal to expected result', () => {
        process.env.RESULT= "[{\"name\":\"stackql-demo-001\",\"status\":\"RUNNING\"}]"

        assertResult(coreObj)

        expect(coreObj.setFailed).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Failed'))
    });

    it('it should not setFailed when actual result equal to expected result', () => {
        assertResult(coreObj)

        expect(coreObj.setFailed).not.toHaveBeenCalled()
        expect(coreObj.info).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Successful'))
    });

    it('it should setFailed when actual result is not equal to expected result', () => {
        process.env.EXPECTED_RESULTS_STR= undefined;
        process.env.EXPECTED_RESULTS_FILE_PATH = 'lib/tests/failed-result.json'

        assertResult(coreObj)

        expect(coreObj.setFailed).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Failed'))
    });

    it('it should not setFailed when actual result equal to expected result in file', () => {
        process.env.EXPECTED_RESULTS_STR= undefined;
        process.env.EXPECTED_RESULTS_FILE_PATH = 'lib/tests/success-result.json'

        assertResult(coreObj)

        expect(coreObj.setFailed).not.toHaveBeenCalled()
        expect(coreObj.info).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Successful'))
    })

    it('it should setFailed when actual result does not match expected rows', () => {
        process.env.EXPECTED_RESULTS_STR= undefined;
        process.env.EXPECTED_RESULTS_FILE_PATH = undefined;
        process.env.EXPECTED_ROWS = 2

        assertResult(coreObj)

        expect(coreObj.setFailed).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Failed'))
    });

    it('it should not setFailed when actual result match expected rows', ()=>{
        process.env.EXPECTED_RESULTS_STR= undefined;
        process.env.EXPECTED_RESULTS_FILE_PATH = undefined;
        process.env.EXPECTED_ROWS = 1

        assertResult(coreObj)

        expect(coreObj.setFailed).not.toHaveBeenCalled()
        expect(coreObj.info).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Successful'))
    })

    it('it should not setFailed when actual result match expected rows in string number', ()=>{
        process.env.EXPECTED_RESULTS_STR= undefined;
        process.env.EXPECTED_RESULTS_FILE_PATH = undefined;
        process.env.EXPECTED_ROWS = '1'

        assertResult(coreObj)

        expect(coreObj.setFailed).not.toHaveBeenCalled()
        expect(coreObj.info).toHaveBeenCalledWith(expect.stringContaining('StackQL Assert Successful'))
    })

    

})
