const fs = require("fs");

function setupAuth(core) {
  let auth;
  const fileName = process.env.AUTH_FILE_PATH;
  const authStr = process.env.AUTH_STR;

  if (!checkEnvVarValid(fileName) && !checkEnvVarValid(authStr)) {
    // core.info("Neither AUTH_FILE_PATH nor AUTH_STR is set. Proceeding using default provider environment variable names.");
    return;
  }

  if (checkEnvVarValid(fileName)) {
    try {
      // Read the contents of the JSON file into a string
      auth = fs.readFileSync(fileName, "utf-8");
    } catch (error) {
      core.error(error);
      core.setFailed(`Cannot find auth file ${fileName}`);
      return;
    }
  }
  if (checkEnvVarValid(authStr)) {
    auth = authStr
  }

  core.info("Setting AUTH environment variable...");
  core.exportVariable("AUTH", auth);
}

async function getStackqlCommand(core) {
  
  const [query, queryFilePath, dataFilePath, vars, auth, output = "json"] = [
    process.env.QUERY,
    process.env.QUERY_FILE_PATH,
    process.env.DATA_FILE_PATH,
    process.env.VARS,
    process.env.AUTH,
    process.env.OUTPUT,
  ];

  if (!checkEnvVarValid(query) && !checkEnvVarValid(queryFilePath)) {
    core.setFailed("Either test_query or test_query_file_path need to be set");
    return;
  }

  let args = ["exec"];

  if (query) {
    args.push(`"${query}"`);
  } else {
    args.push("-i", queryFilePath);    
  }
  
  if (checkEnvVarValid(dataFilePath)) {
    args.push(`--iqldata='${dataFilePath}'`);
  }
  
  if (checkEnvVarValid(vars)) {
    args.push(`--var='${vars}'`);
  }

  if (checkEnvVarValid(auth)) {
    args.push(`--auth='${auth}'`);
  }

  args.push(`--output='${output}'`);

  try {
    core.exportVariable('STACKQL_COMMAND', `stackql ${args.join(" ")}`)
  } catch (error) {
    core.error(error);
    core.setFailed("Error when executing stackql");
  }
}

/**
 * Checking if environment variable is not empty or undefined
 * @param {*} variable
 */
const checkEnvVarValid = (variable) => {
  if (!variable || variable === "" || variable === "undefined") {
    return false;
  }
  return true;
};

module.exports = {
  setupAuth,
  getStackqlCommand,
};
