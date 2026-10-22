# Contributing

Before contributing, read [README.md](./README.md) for project scope.

## Setup

1. Fork and clone the repository, then create a branch for your change.
2. Install Node.js 24.22.1 or later to match CI. Earlier Node.js 24 releases are affected by the [October 2026 Node.js security releases](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
3. From the repository root, install dependencies and run the unit tests:

   ```sh
   npm ci --ignore-scripts
   npm test -- --runInBand
   ```

Unit tests use Jest and do not require StackQL or provider credentials. There is no separate build, lint, or `check` script.

## Making changes

- [action.yml](./action.yml) defines the composite action, its inputs, and its call to `stackql/stackql-exec`.
- [lib/assert.js](./lib/assert.js) implements result parsing and assertions.
- [lib/tests](./lib/tests) contains unit tests and result fixtures. Add regression tests for fixes and tests for new behavior here.
- Update [README.md](./README.md) when changing inputs or user-visible behavior.

## CI tests

Both workflows run on pushes to `main`, pull requests, and manual dispatch:

- [npm-test.yml](./.github/workflows/npm-test.yml) runs the unit tests using the commands above.
- [stackql-assert-test.yml](./.github/workflows/stackql-assert-test.yml) tests the local action (`uses: ./`). Credential-free smoke tests cover automatic, wrapped, and plain StackQL installation, file paths with spaces, empty results, and assertion failures. Provider integration tests use the query and data fixtures in [workflow_scripts](./.github/workflows/workflow_scripts).

Both workflows cover Linux, Windows, and macOS on x64 and ARM64. Keep code and file handling compatible with all six targets.

Provider integration tests require repository secrets `GOOGLE_CREDENTIALS`, `STACKQL_GITHUB_USERNAME`, and `STACKQL_GITHUB_PASSWORD`, plus repository variables `TEST_ORG` and `TEST_REPO`. They also depend on the resources referenced by the queries and expected results. If you cannot run these tests, note that limitation in your pull request. Never commit credentials or sensitive query results.

## Pull requests

- Target `main` and keep changes focused on one fix or feature.
- Describe the change, its reason, and the tests run, including any checks you could not run.
- Include tests with functional changes and keep fixtures free of secrets.
- For security vulnerabilities, follow [SECURITY.md](./SECURITY.md) and report privately.
