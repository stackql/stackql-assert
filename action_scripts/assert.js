let core;
const parseResult = (resultStr) =>{
    let parsedResult = resultStr;
    const registerPullPattern = /^[\w\s]+provider, version '.*' successfully installed\n\[.*\]$/;
    if(registerPullPattern.test(resultStr)){
    const lines = resultStr.split('\n')
    parsedResult =  lines[1]
    }
    return JSON.parse(parsedResult)
   
}

const getExpectedResult = (expectedResultStr, expectedResultFilePath) =>{
    let expectedResult; 
    if(expectedResultStr){
        expectedResult  = JSON.parse(expectedResultStr)
    }
    else if(expectedResultFilePath){
        const content = require(expectedResultFilePath)
        expectedResult = JSON.parse(content)
    }

    return expectedResult
}

const checkResult= (expectedResult, expectedRows, actualResult) =>{
    let equality;
    let message;
    // if only passed expectedRows, check expectedRows
    // if only passed expected result, only check expected result
    // if both passed, check both
    if(expectedRows){
        equality = actualResult.length === expectedRows
        message =`============ StackQL Assert Failed ============ \n
        Expected Number of Rows: ${expectedRows} \n
        Actual Number of Rows: ${actualResult.length}
        Execution Result: ${JSON.stringify(actualResult)}
        `
    }
  
    if(expectedResult){
        equality = JSON.stringify(expectedResult) === JSON.stringify(actualResult)
        message = `============ StackQL Assert Failed ============ \n
        Expected: ${JSON.stringify(expectedResult)} \n
        Actual: ${JSON.stringify(actualResult)}
        `
    }
 
    if(!equality){
        core.setFailed(message)
    }


}

module.exports = (coreObj) =>{
    core = coreObj
    try{
        let [execResultStr, expectedResultStr, expectedResultFilePath, expectedRows] =
        [process.env.RESULT, process.env.EXPECTED_RESULTS_STR, process.env.EXPECTED_RESULTS_FILE_PATH, process.env.EXPECTED_ROWS]

        if(!expectedResultStr && !expectedResultFilePath && !expectedRows){
            core.setFailed('Cannot find expected result, file path or expected rows')
        }

        

        let expectedResult = getExpectedResult(expectedResultStr, expectedResultFilePath)
        
        const actualResult = parseResult(execResultStr)

        if(!actualResult){
            core.setFailed('No Output from executing query');
        }


        checkResult(expectedResult, expectedRows, actualResult)

        core.info('============ StackQL Assert Succeed ============ ')

      }catch(e){
        core.setFailed(e);
      }


}