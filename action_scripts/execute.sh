#!/bin/sh

set -e

if [ -z "$AUTH" ]; then
  echo "ERROR: AUTH must be set."
  exit 1
fi

if [ -z "$QUERY" ] && [ -z "$QUERY_FILE_PATH" ]; then
  echo "ERROR: Either QUERY or QUERY_FILE_PATH must be set."
  exit 1
fi

if [ -n "$QUERY" ]; then
  stackql exec -i "$QUERY_FILE_PATH" --auth="${AUTH}" --output="${OUTPUT}"
else
  stackql exec "$QUERY" --auth="${AUTH}" --output="${OUTPUT}"
fi

