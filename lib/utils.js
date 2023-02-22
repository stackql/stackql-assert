async function setupAuth(core) {
  const fs = require("fs");

  let auth;
  const fileName = process.env.AUTH_FILE_NAME;

  if (!fileName) {
    auth = process.env.AUTH_STR;
    if (!auth) {
      core.setFailed("ERROR: Either AUTH_FILE_NAME or AUTH_STR must be set.");
    }
  } else {
    // Read the contents of the JSON file into a string
    auth = fs.readFileSync(fileName, "utf-8");
  }

  // Set the AUTH environment variable
  core.info("Setting AUTH environment variable...");
  core.setOutput("auth", auth);
}

module.exports = {
    setupAuth,
};