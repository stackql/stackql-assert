let core;
const fs = require("fs");

const parseResult = (resultStr, varName) => {
  const regex = /\[(.*)\]/; // match the first occurrence of square brackets and capture everything in between
  const matches = resultStr.match(regex);
  if (matches) {
    const jsonStr = matches[0]; // extract the captured string
    try {
      const jsonObj = JSON.parse(jsonStr); // parse the JSON string into an object
      return jsonObj;
    } catch (error) {
      throw(`Failed to parse ${varName} JSON
      \nvalue: ${resultStr} 
      \nerror: ${error}`);
    }
  }
  return null; // return null if no JSON object was found in the string
};

const getExpectedResult = (expectedResultStr, expectedResultFilePath) => {
  let expectedResult;
  if (expectedResultStr) {
    expectedResult = parseResult(expectedResultStr, "expectedResultStr");
  } else if (expectedResultFilePath) {
    const fileContent = fs.readFileSync(expectedResultFilePath).toString();
    expectedResult = parseResult(fileContent, "expectedResultFilePath");
  }

  return expectedResult;
};

const checkResult = (expectedResult, expectedRows, actualResult) => {
  let equality;
  let message;
  expectedRows = parseInt(expectedRows);
  // if only passed expectedRows, check expectedRows
  // if only passed expected result, only check expected result
  // if both passed, check both
  if (expectedRows) {
    equality = actualResult.length === expectedRows;
    message = `============ StackQL Assert Failed ============ \n
        Expected Number of Rows: ${expectedRows} \n
        Actual Number of Rows: ${actualResult.length}
        Execution Result: ${JSON.stringify(actualResult)}
        `;
  }

  if (expectedResult) {
    equality = JSON.stringify(expectedResult) === JSON.stringify(actualResult);
    message = `============ StackQL Assert Failed ============ \n
        Expected: ${JSON.stringify(expectedResult)}\n
        Actual: ${JSON.stringify(actualResult)}
        `;
  }


  return { equality, message };
};

function checkParameters(expectedResultStr, expectedResultFilePath, expectedRows) {
  const params = [
    { name: "expectedResultStr", value: expectedResultStr },
    { name: "expectedResultFilePath", value: expectedResultFilePath },
    { name: "expectedRows", value: expectedRows },
  ];

  const missingParams = params
    .filter(param => !param.value || param.value === "undefined")
    .map(param => param.name)
  
    if (missingParams.length === 3) {
      const errorMessage = "Cannot find expected result, file path or expected rows";
      throw errorMessage;
    }
}


const assertResult = (coreObj) =>{
    core = coreObj;
    try {
      let [
        execResultStr,
        expectedResultStr,
        expectedResultFilePath,
        expectedRows,
      ] = [
        process.env.RESULT,
        process.env.EXPECTED_RESULTS_STR,
        process.env.EXPECTED_RESULTS_FILE_PATH,
        process.env.EXPECTED_ROWS,
      ];
      
      checkParameters(expectedResultStr, expectedResultFilePath, expectedRows)
  
      let expectedResult = getExpectedResult(
        expectedResultStr,
        expectedResultFilePath
      );
  
      const actualResult = parseResult(execResultStr);
  
      if (!actualResult) {
        core.setFailed("No Output from executing query");
      }
  
      const {equality, message} = checkResult(expectedResult, expectedRows, actualResult);
      if (equality) {
        core.info("============ StackQL Assert Succeed ============ ");
      } else {
        core.setFailed(message);
      }
    } catch (e) {
      core.setFailed(e);
    }
}

module.exports = {
  assertResult,
  parseResult,
  checkResult,
  getExpectedResult
};
