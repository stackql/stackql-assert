const fs = require("fs");

const parseResult = (resultStr, description = "result") => {
  try {
    return JSON.parse(resultStr);
  } catch (error) {
    throw new Error(`❌ Failed to parse ${description} JSON:
    Value: ${resultStr}
    Error: ${error.message}`);
  }
};

const getExpectedResult = (expectedResultStr, expectedResultFilePath) => {
  if (expectedResultStr) {
    return parseResult(expectedResultStr, "expected results string");
  } else if (expectedResultFilePath) {
    const fileContent = fs.readFileSync(expectedResultFilePath, 'utf-8');
    return parseResult(fileContent, "expected results file");
  }
  return null;
};

const checkResult = (core, expected, actual, expectedRows) => {
  const actualLength = actual.length;

  if (expectedRows && actualLength !== parseInt(expectedRows)) {
    core.error(`Expected rows: ${expectedRows}, got: ${actualLength}`);
    return false;
  }

  if (expected && JSON.stringify(expected) !== JSON.stringify(actual)) {
    core.error(`Expected results do not match actual results.\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    return false;
  }

  return true;
};

function assertResult(core) {
  try {
    const { RESULT, EXPECTED_RESULTS_STR, EXPECTED_RESULTS_FILE_PATH, EXPECTED_ROWS } = process.env;
    core.info(`RESULT: ${RESULT}`);
    core.info(`EXPECTED_RESULTS_STR: ${EXPECTED_RESULTS_STR}`);
    core.info(`EXPECTED_RESULTS_FILE_PATH: ${EXPECTED_RESULTS_FILE_PATH}`);
    core.info(`EXPECTED_ROWS: ${EXPECTED_ROWS}`);

    if (!RESULT) throw new Error("Result from StackQL execution is missing.");

    // if no EXPECTED_RESULTS_STR, EXPECTED_RESULTS_FILE_PATH or EXPECTED_ROWS, fail the action
    if (!EXPECTED_RESULTS_STR && !EXPECTED_RESULTS_FILE_PATH && !EXPECTED_ROWS) throw new Error("❌ Cannot find expected result, file path or expected rows");
    
    const actualResult = parseResult(RESULT);

    core.info("🔍 Checking results...");

    const expectedResult = getExpectedResult(EXPECTED_RESULTS_STR, EXPECTED_RESULTS_FILE_PATH);

    const resultSuccessful = checkResult(core, expectedResult, actualResult, EXPECTED_ROWS);
    
    if (resultSuccessful) {
      core.info("✅ StackQL Assert Successful");
    } else {
      core.setFailed("❌ StackQL Assert Failed");
    }
  } catch (error) {
    core.setFailed(`Assertion error: ${error.message}`);
  }
}

module.exports = {
  parseResult,
  getExpectedResult,
  checkResult,
  assertResult
};
