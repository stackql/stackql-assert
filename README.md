# stackql-assert

The `stackql/stackql-assert` action is an composite action that runs a `stackql` query and checks if the result matches an expected result

# Usage

## Provider Authentication
Authentication to StackQL providers is done via environment variables source from GitHub Actions Secrets.  To learn more about authentication, see the setup instructions for your provider or providers at the [StackQL Provider Registry Docs](https://stackql.io/registry).

## Inputs
- `test_query` - stackql query to execute **(need to supply either `test_query` or `test_query_file_path`)**
- `test_query_file_path` - stackql query file to execute **(need to supply either `test_query` or `test_query_file_path`)**
- `data_file_path` - (optional) path to data file to pass to the stackql query preprocessor (`json` or `jsonnet`)
- `vars` - (optional) comma delimited list of variables to pass to the stackql query preprocessor (supported with `jsonnet` config blocks or `jsonnet` data files only), accepts `var1=val1,var2=val2`, can be used to source environment variables into stackql queries 
- `expected_rows` - (optional) Expected number of rows in the result.
- `expected_results_str` - (optional) Expected result (`json`) from executing test query, support object string (overrides `expected_results_file_path`)
- `expected_results_file_path` - (optional) Results file (`json`) that stores expected result, json is support
- `auth_obj_path` - (optional) the path of json file that stores stackql AUTH string **(only required when using non-standard environment variable names)**
- `auth_str` - (optional) stackql AUTH string **(only required when using non-standard environment variable names)**

**__NOTE:__ one of `expected_rows`, `expected_results_str` or `expected_results_file_path` is required**

## Test Query
- Use `test_query` or `test_query_file_path` to pass the test query to the action. The test query should be a valid StackQL query. The action will run the query and check if the result is empty or not. If the result is empty, the action will fail the step.
- Either `test_query` or `test_query_file_path` are required. If both are provided, `test_query` will be used.
- query example can be found in [example workflow](./.github/workflows/stackql-assert.yml) and [example .iql file](./.github/workflows/workflow_scripts)

## Expected Result
- Use `expected_results_str` or `expected_results_file_path` or `expected_rows` to pass the expected result to the action. The expected result (`expected_results_str` or `expected_results_file_path`) should be a valid `json` object. The action will compare the result with the expected result. If the result is not the same as the expected result, the action will fail the step.
- Either `expected_results_str` or `expected_results_file_path` or `expected_rows` are required. If `expected_results_str` and `expected_results_file_path` are provided, `expected_results_str` will be used.  
- Expected result example can be found in [example workflow](./.github/workflows/stackql-assert.yml) and [example .json file](./.github/workflows/workflow_scripts)

## Examples
The following excerpts from a GitHub Actions workflow demonstrate how to use the `stackql/stackql-assert` action.

## Example `test_query` with `expected_rows`

```yaml
    - name: Use test query string and expected rows
      uses: ./
      with:
        test_query: |
            REGISTRY PULL google;
            SELECT name
            FROM google.compute.instances 
            WHERE project = 'stackql-demo' AND zone = 'australia-southeast1-a' AND name = 'stackql-demo-001';
        expected_rows: 1
      env: 
        GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
```

## Example `test_query_file_path` with `expected_results_str`

```yaml
    - name: Use test query file and expected result string
      uses: ./
      with:
        test_query_file_path: './.github/workflows/workflow_scripts/google-example.iql'
        expected_results_str: '[{"name":"stackql-demo-001"}]'
      env: 
        GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
```

## Example `test_query_file_path` with `expected_results_file_path` supplying `vars` using an inline `jsonnet` config block

```yaml
    - name: Use test query file and expected results file path using inline jsonnet config block and external vars
      uses: ./
      with:
        test_query_file_path: './.github/workflows/workflow_scripts/google-example-inline-jsonnet.iql'
        expected_results_file_path: './.github/workflows/workflow_scripts/google-example-inline-jsonnet-results.json'
        vars: GOOGLE_PROJECT=${{ env.GOOGLE_PROJECT }},GOOGLE_ZONE=${{ env.GOOGLE_ZONE }}
      env: 
        GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
        GOOGLE_PROJECT: ${{ vars.GOOGLE_PROJECT }}
        GOOGLE_ZONE: ${{ vars.GOOGLE_ZONE }}
```

## Example `test_query_file_path` with `expected_rows` supplying `vars` using `jsonnet` config provided using `data_file_path`

```yaml
    - name: Use test query string and expected results file, with auth object
      uses: ./
      with:
        test_query_file_path: './.github/workflows/workflow_scripts/github-example.iql'
        data_file_path: './.github/workflows/workflow_scripts/github-example-data.jsonnet'
        vars: TEST_ORG=${{ env.TEST_ORG }},TEST_REPO=${{ env.TEST_REPO }}
        expected_rows: 1        
      env:
        STACKQL_GITHUB_USERNAME: ${{  secrets.STACKQL_GITHUB_USERNAME }}
        STACKQL_GITHUB_PASSWORD: ${{  secrets.STACKQL_GITHUB_PASSWORD }}
        TEST_ORG: ${{ vars.TEST_ORG }}
        TEST_REPO: ${{ vars.TEST_REPO }}
```



