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

async function showStackQLQuery(core) {
  try {
    let [
      dryRunCommand,
      dryRunResult,
    ] = [
      process.env.STACKQL_DRYRUN_COMMAND,
      process.env.DRYRUN_RESULT,      
    ];
    
    if (!dryRunResult) {
      core.setFailed("No Dryrun Output from stackql command");
    }

    core.info(`🚀 stackql dryrun command:\n${dryRunCommand}`);
    core.info(`🚀 stackql query:\n${dryRunResult}`);

  } catch (e) {
    core.setFailed(e);
  }
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
  let dryRunArgs = ["exec", "-H"];

  if (query) {
    args.push(`"${query}"`);
    dryRunArgs.push(`"${query}"`);
  } else {
    args.push("-i", queryFilePath);
    dryRunArgs.push("-i", queryFilePath);
  }

  if (checkEnvVarValid(dataFilePath)) {
    args.push(`--iqldata='${dataFilePath}'`);
    dryRunArgs.push(`--iqldata='${dataFilePath}'`);
  }

  if (checkEnvVarValid(vars)) {
    args.push(`--var='${vars}'`);
    dryRunArgs.push(`--var='${vars}'`);
  }

  if (checkEnvVarValid(auth)) {
    args.push(`--auth='${auth}'`);
    dryRunArgs.push(`--auth='${auth}'`);
  }

  args.push(`--output='${output}'`);
  dryRunArgs.push(`--output='text'`);

  try {
    const stackqlQuery = `stackql ${args.join(" ")}`;
    const stackqlDryRunQuery = `stackql ${dryRunArgs.join(" ")}`;
    core.exportVariable('STACKQL_COMMAND', stackqlQuery);
    core.exportVariable('STACKQL_DRYRUN_COMMAND', stackqlDryRunQuery);
    core.info(`🚀 stackql command:\n${stackqlQuery}`);
  } catch (error) {
    core.error(error);
    core.setFailed("Error exporting stackql command");
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
  showStackQLQuery,
};
