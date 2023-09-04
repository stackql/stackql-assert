const {checkResult, parseResult, assertResult, getExpectedResult} = require('../assert')

describe('parseResult', ()=>{

    it('should parsedResult correctly when it starts with register', ()=>{
        const resultString = `google provider, version 'v23.01.00116' successfully installed \n
        [{"name":"stackql-demo-001","status":"TERMINATED"}]`

        const expected = [{"name":"stackql-demo-001","status":"TERMINATED"}]

        const actual = parseResult(resultString);
        expect(actual).toEqual(expected);
    })

    it('should parsedResult correctly when it is only the object', ()=>{
        const resultString = `[{"name":"stackql-demo-001","status":"TERMINATED"}]`

        const expected = [{"name":"stackql-demo-001","status":"TERMINATED"}]

        const actual = parseResult(resultString);
        expect(actual).toEqual(expected);
    })
})

describe('checkResult', ()=>{
    let expectedResult;
    let actualResult;
    beforeEach(()=>{
        expectedResult= [{"name":"stackql-demo-001","status":"TERMINATED"}]
        actualResult= [{"name":"stackql-demo-001","status":"TERMINATED"}]

    })
    it('should return equality false when the result object does not match', ()=>{
        actualResult = [{"name":"stackql-demo-001","status":"RUNNING"}]

        const {equality} = checkResult(expectedResult, undefined, actualResult);

        expect(equality).toEqual(false);
    })

    it('should return equality true when the result object does match', ()=>{

        const {equality} = checkResult(expectedResult, undefined, actualResult);

        expect(equality).toEqual(true);
    })

    it('should return equality false when expected row is not matching', ()=>{

        const expectedRows = 2;

        const {equality} = checkResult(undefined, expectedRows, actualResult);

        expect(equality).toEqual(false);
    })

    it('should return equality true when expected row is matching', ()=>{
        const expectedRows = 1;

        const {equality} = checkResult(undefined, expectedRows, actualResult);

        expect(equality).toEqual(true);
    })

    it('should return equality false when expected row is matching, but result object does not match', ()=>{
        const expectedRows = 1;
        actualResult = [{"name":"stackql-demo-001","status":"RUNNING"}]

        const {equality} = checkResult(expectedResult, expectedRows, actualResult);

        expect(equality).toEqual(false);
    })

    it('should return equality true when expected row is matching, but result object matches', ()=>{
        const expectedRows = 1;
        actualResult = [{"name":"stackql-demo-001","status":"TERMINATED"}]

        const {equality} = checkResult(expectedResult, expectedRows, actualResult);

        expect(equality).toEqual(true);
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

    describe('assertResult integration test', ()=>{
        let coreObj;

        const ACTION_ENV = {
            RESULT: `google provider, version 'v23.01.00116' successfully installed \n
            [{"name":"stackql-demo-001","status":"TERMINATED"}]`,
            EXPECTED_RESULTS_STR: `[{"name":"stackql-demo-001","status":"TERMINATED"}]`,
            EXPECTED_RESULTS_FILE_PATH: 'test.json',
            EXPECTED_ROWS: 1
        }

        beforeEach(() => {
            jest.resetModules()
            process.env = {...ACTION_ENV}
            coreObj = {
                setFailed: jest.fn(),
                info: jest.fn().mockImplementation((message)=>{console.log(message)})
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

            expect(coreObj.setFailed).toHaveBeenCalledWith('❌ Cannot find expected result, file path or expected rows')
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
