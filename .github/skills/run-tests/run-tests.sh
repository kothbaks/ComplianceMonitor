#!/bin/bash
#
# run-tests.sh — Deterministic test execution with structured output reporting
# Usage: bash run-tests.sh [optional-test-path]
#
# This script:
# - Runs npm test with optional path filter
# - Captures and parses Vitest output
# - Reports: test count, failing tests, exit code, summary
# - Returns structured output for agent consumption
#

set -o pipefail

# Configuration
TEST_PATH="${1:-.}"  # Default to current directory if no path provided
LOG_FILE="/tmp/vitest-output-$$.log"
EXIT_CODE=0

# Cleanup on exit
cleanup() {
    rm -f "$LOG_FILE"
}
trap cleanup EXIT

# Ensure we're in the aml-dashboard directory (or a parent that contains package.json)
if [[ ! -f "package.json" ]] && [[ ! -f "aml-dashboard/package.json" ]]; then
    echo "ERROR: package.json not found. Please run from project root or aml-dashboard directory."
    exit 1
fi

# If running from project root, cd into aml-dashboard
if [[ -f "aml-dashboard/package.json" ]] && [[ ! -f "package.json" ]]; then
    cd aml-dashboard
fi

# Run tests and capture output
echo "Running: npm test -- $TEST_PATH"
echo ""

npm test -- "$TEST_PATH" 2>&1 | tee "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "========================================"
echo "TEST EXECUTION REPORT"
echo "========================================"
echo "Command: npm test -- $TEST_PATH"
echo "Exit Code: $EXIT_CODE"
echo ""
echo "Test Summary"
echo "────────────"

# Parse Vitest output for test counts
# Vitest typically outputs: "PASS" or "FAIL" followed by a summary line
# Example: "Test Files  1 passed (1)"
#          "Tests      15 passed (15)"

PASSED=$(grep -oP '(\d+)(?= passed)' "$LOG_FILE" | tail -1)
FAILED=$(grep -oP '(\d+)(?= failed)' "$LOG_FILE" | tail -1)
TOTAL=$((${PASSED:-0} + ${FAILED:-0}))

if [[ $TOTAL -eq 0 ]]; then
    # Fallback: count PASS/FAIL lines if summary not found
    PASS_FILES=$(grep -c "PASS " "$LOG_FILE" || true)
    if [[ $PASS_FILES -gt 0 ]]; then
        TOTAL="unknown (see output above)"
        PASSED="unknown"
        FAILED=0
    fi
fi

echo "Total Tests:  ${TOTAL}"
echo "Passed:       ${PASSED:-0}"
echo "Failed:       ${FAILED:-0}"
echo ""

# Extract failing test names
echo "Failing Tests:"
if [[ $EXIT_CODE -eq 0 ]]; then
    echo "(none)"
else
    # Look for test failure lines (usually marked with ✕ or FAIL)
    # Filter for test names within failure output
    grep -E "✕|FAIL|Expected|AssertionError" "$LOG_FILE" \
        | head -20 \
        | sed 's/^/  ❌ /' || echo "  (see output above for details)"
fi

echo ""
echo "Summary:"
if [[ $EXIT_CODE -eq 0 ]]; then
    echo "✅ All tests passing."
else
    echo "⚠️ ${FAILED:-1} test(s) failing. Review error details above."
fi

echo "========================================"
echo ""

exit $EXIT_CODE

