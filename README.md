# stackql-assert

The `stackql/stackql-assert` action is an composite action that runs stackql query and check if result matches expected result


# Usage

## AUTH
> **Note**
> stackql-assert action uses same auth setup as [stackql-exec](https://github.com/stackql/stackql-exec/blob/main/README.md). 
> [Learn more](https://stackql.io/docs/getting-started/authenticating) about authentication setup when running stackql

### Example auth string
```
{   "google": { "type": "service_account",  "credentialsfilepath": "sa-key.json" },
    "github": { "type": "basic", "credentialsenvvar": "STACKQL_GITHUB_CREDS" }}
```
It can be passed with `auth_str` as a string, or stored in a file and pass filename to `auth-obj-path`
- For "basic" auth, you need to set a environment variable with same name as the value of `credentialsenvvar` in the auth string for the Github Action step. You can use [Github Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) to store the value of the environment variable, and use env to pass it to the action. For example:
```
env:
  STACKQL_GITHUB_CREDS: ${{ secrets.STACKQL_GITHUB_CREDS }}
```
- For "service_account" auth, you need to store the credentials into a file; You can follow the example of `Prep Google Creds (bash)` step in the [example workflow](./.github/workflows/stackql-assert.yml)

## Test Query
- Use `test_query` or `test_query_path` to pass the test query to the action. The test query should be a valid StackQL query. The action will run the query and check if the result is empty or not. If the result is empty, the action will fail the step.
- Either `test_query` or `test_query_path` is required. If both are provided, `test_query` will be used.
- query example can be found in [example workflow](./.github/workflows/stackql-assert.yml) and [example .iql file](./.github/workflows/workflow_scripts)

## Expected Result
- Use `expected_results_str` or `expected_results_file_path` to pass the expected result to the action. The expected result should be a valid JSON object. The action will compare the result with the expected result. If the result is not the same as the expected result, the action will fail the step.
- Either `expected_results_str` or `expected_results_file_path` is required. If both are provided, `expected_results_str` will be used.
- Expected result example can be found in [example workflow](./.github/workflows/stackql-assert.yml) and [example .json file](./.github/workflows/workflow_scripts)


## Input
- `auth_obj_path` - Path to the auth object file.
- `auth_str` - Auth string.
- `test_query` - Test query to run (overrides test_query_path).
- `test_query_file_path` - Path to the test query file.
- `expected_rows` - Expected number of rows in the result.
- `expected_results_str` - expected result from executing test query, support object string (overrides expected_results_file_path)
- `expected_results_file_path` - file that stores expected result, json is support
