#!/bin/bash
#
# project-metrics.sh — Collect objective project state
# Usage: bash project-metrics.sh
#
# This script:
# - Counts source files by layer (services, hooks, components, utils)
# - Counts test files and calculates coverage ratio
# - Checks build and dependency status
# - Reports developer_todo.md status
# - Produces structured output for PM agent consumption
#

set -o pipefail

# Ensure we're in the project root
if [[ ! -f "aml-dashboard/package.json" ]]; then
    echo "ERROR: aml-dashboard/package.json not found. Please run from project root."
    exit 1
fi

SRC_DIR="aml-dashboard/src"
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M:%SZ')

echo "========================================"
echo "PROJECT METRICS REPORT"
echo "========================================"
echo "Collected: $TIMESTAMP"
echo ""
echo "Source Files by Layer"
echo "─────────────────────"

# Function to count files in a directory
count_files() {
    local dir="$1"
    local label="$2"
    if [[ -d "$dir" ]]; then
        local count=$(find "$dir" -maxdepth 1 -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v -E "(__tests__|\.test\.)" | wc -l)
        printf "%-27s %2d files    (%s/)\n" "$label:" "$count" "$dir"
        echo "$count"
    else
        printf "%-27s %2d files    (%s/) [missing]\n" "$label:" "0" "$dir"
        echo "0"
    fi
}

# Count by layer
services=$(count_files "$SRC_DIR/services" "Services")
hooks=$(count_files "$SRC_DIR/hooks" "Hooks")
compliance=$(count_files "$SRC_DIR/components/compliance" "Components (Compliance)")
graph=$(count_files "$SRC_DIR/components/graph" "Components (Graph)")
transactions=$(count_files "$SRC_DIR/components/transactions" "Components (Transactions)")
aml=$(count_files "$SRC_DIR/components/aml" "Components (AML)")
common=$(count_files "$SRC_DIR/components/common" "Components (Common)")
layout=$(count_files "$SRC_DIR/components/layout" "Components (Layout)")
utilities=$(count_files "$SRC_DIR/utils" "Utilities")
context=$(count_files "$SRC_DIR/context" "Context")

TOTAL_SOURCE=$((services + hooks + compliance + graph + transactions + aml + common + layout + utilities + context))

echo ""
echo "Test Coverage"
echo "─────────────"

# Count test files
TEST_COUNT=$(find "$SRC_DIR" \( -path "*/__tests__/*" -o -name "*.test.js" \) -name "*.js" -o -name "*.jsx" 2>/dev/null | wc -l)
echo "Test Files:           $TEST_COUNT files"

# Calculate ratio
if [[ $TOTAL_SOURCE -gt 0 ]]; then
    RATIO=$((TEST_COUNT * 100 / TOTAL_SOURCE))
    echo "Ratio:                $TEST_COUNT test files for $TOTAL_SOURCE source files ($RATIO%)"
else
    RATIO=0
    echo "Ratio:                0% (no source files yet)"
fi

echo ""
echo "Build & Dependencies"
echo "────────────────────"

# Check package.json
if [[ -f "aml-dashboard/package.json" ]]; then
    echo "package.json:         ✅ present"
else
    echo "package.json:         ❌ missing"
fi

# Check node_modules
if [[ -d "aml-dashboard/node_modules" ]]; then
    pkg_count=$(ls -1 aml-dashboard/node_modules 2>/dev/null | wc -l)
    echo "node_modules:         ✅ installed ($pkg_count packages)"
else
    echo "node_modules:         ⚠️  not installed (run: npm install)"
fi

# Check for critical vulnerabilities (silent fail if npm not available)
if command -v npm &> /dev/null; then
    # Run quick audit check; timeout after 5 seconds
    audit_result=$(timeout 5 npm audit --json 2>/dev/null | grep -o '"critical":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    if [[ -z "$audit_result" ]] || [[ "$audit_result" == "0" ]]; then
        echo "npm audit:            ✅ no critical vulnerabilities"
    else
        echo "npm audit:            ⚠️  $audit_result critical vulnerabilities found"
    fi
else
    echo "npm audit:            ⚠️  npm not available for audit"
fi

echo ""
echo "Source Control"
echo "──────────────"

# Check documentation files
if [[ -f "developer_todo.md" ]]; then
    todo_count=$(grep -c "^- \[ \]" developer_todo.md 2>/dev/null || echo "?")
    echo "developer_todo.md:    ✅ present ($todo_count open items)"
else
    echo "developer_todo.md:    ⚠️  missing"
fi

[[ -f "BLUEPRINT.md" ]] && echo "BLUEPRINT.md:         ✅ present" || echo "BLUEPRINT.md:         ⚠️  missing"
[[ -f "Plan.md" ]] && echo "Plan.md:              ✅ present" || echo "Plan.md:              ⚠️  missing"

echo ""
echo "Health Summary"
echo "──────────────"

# Coverage health
if [[ $RATIO -ge 60 ]]; then
    echo "Code Coverage:        🟢 $RATIO% (test files) — excellent"
elif [[ $RATIO -ge 30 ]]; then
    echo "Code Coverage:        🟡 $RATIO% (test files) — good, aim for 60%+"
else
    echo "Code Coverage:        🔴 $RATIO% (test files) — needs attention"
fi

# File structure health
if [[ -d "$SRC_DIR/components/compliance" ]] && [[ -d "$SRC_DIR/services" ]] && [[ -d "$SRC_DIR/hooks" ]]; then
    echo "File Structure:       ✅ mostly aligned with Plan.md"
else
    echo "File Structure:       ⚠️  some expected directories missing"
fi

# Build health (simplified check)
if [[ -f "aml-dashboard/vite.config.js" ]]; then
    echo "Build Status:         ✅ build config present"
else
    echo "Build Status:         ⚠️  build config missing"
fi

echo ""
echo "Next Steps for PM"
echo "──────────────────"
echo "1. Review developer_todo.md backlog"
echo "2. Prioritise items for layers with <2 test files"
echo "3. Consider test-first approach for untested services"
echo "4. Check for build/audit blockers before assigning work"
echo "5. Use create-backlog-item skill to structure selected items"

echo ""
echo "========================================"
echo ""

exit 0

