---
name: project-metrics
description: Collects objective project state including file counts by layer, test coverage signals, and build/lint status to inform backlog prioritisation.
---

# Project Metrics Skill

## Purpose
Help the **Project Manager Agent** make data-driven decisions about which backlog items to tackle next. Instead of guessing project state, the PM runs this skill once per planning session to collect objective metrics.

## When to Use This Skill
- You are the **Project Manager Agent** starting a planning session
- You need to assess current code coverage and test status before selecting backlog items
- You want to identify gaps in the project structure (missing files, incomplete layers)

## How to Use This Skill

### Option 1: Run via Script
```bash
bash .github/skills/project-metrics/project-metrics.sh
```

The script produces structured output that the PM agent can read and summarise.

### Option 2: Manual Inspection
If you prefer to verify metrics without running the script:
1. Count source files: `find aml-dashboard/src -name "*.{js,jsx}" -not -path "*/__tests__/*" | wc -l`
2. Count test files: `find aml-dashboard/src -name "*.test.js" | wc -l`
3. List missing files: Compare `aml-dashboard/src/` directory tree against expected structure in `Plan.md`
4. Check build status: `npm run build 2>&1 | tail -10` (if build script exists)

## Script Output Format

The `project-metrics.sh` script returns structured output:

```
========================================
PROJECT METRICS REPORT
========================================
Collected: 2026-04-16 14:30:00Z

Source Files by Layer
─────────────────────
Services:              3 files    (aml-dashboard/src/services/)
Hooks:                 4 files    (aml-dashboard/src/hooks/)
Components (Compliance): 6 files (aml-dashboard/src/components/compliance/)
Components (Graph):    2 files    (aml-dashboard/src/components/graph/)
Components (Transactions): 3 files (aml-dashboard/src/components/transactions/)
Components (AML):      7 files    (aml-dashboard/src/components/aml/)
Components (Common):   4 files    (aml-dashboard/src/components/common/)
Components (Layout):   3 files    (aml-dashboard/src/components/layout/)
Utilities:             2 files    (aml-dashboard/src/utils/)
Context:               1 file     (aml-dashboard/src/context/)

Test Coverage
─────────────
Test Files:           12 files   (aml-dashboard/src/**/__tests__/, **/*.test.js)
Ratio:                12 test files for 35 source files (34%)

Build & Dependencies
────────────────────
package.json:         ✅ present
node_modules:         ✅ installed (1234 packages)
npm audit:            ✅ no critical vulnerabilities

Source Control
──────────────
developer_todo.md:    ✅ present (18 open items)
BLUEPRINT.md:         ✅ present
Plan.md:              ✅ present

Health Summary
──────────────
Code Coverage:        🟡 34% (test files) — good, aim for 60%+
File Structure:       ✅ mostly aligned with Plan.md
Build Status:         ✅ clean

Next Steps for PM
──────────────────
1. Review 18 open items in developer_todo.md
2. Prioritise items touching layers with <2 test files
3. Consider test-first items for untested services
4. Verify no blockers before assigning to specialists

========================================
```

## Metrics Explained

| Metric | What It Tells You | Action If Low |
|---|---|---|
| **Source Files by Layer** | Distribution of code across components, services, hooks | Identify thin layers (e.g., services with only 1 file) |
| **Test Files** | Count of test files and ratio to source | Assign test-first items to untested layers |
| **package.json & node_modules** | Dependencies installed and ready | Run `npm install` if missing |
| **Build Status** | Can the project build/lint cleanly? | Fix blockers before assigning feature work |
| **developer_todo.md** | Backlog items waiting for selection | Use this to select next priority items |
| **Coverage Ratio** | Percentage of source files with tests | Aim for 60%+; prioritise untested critical paths |

## Integration with PM Agent

The PM agent uses this skill as follows:

```
Planning Session:
1. Run: bash .github/skills/project-metrics/project-metrics.sh
2. Read output and note:
   - Layers with <2 test files (high priority for TDD items)
   - Build/lint blockers (assign to appropriate specialist first)
   - Open items count (scope this planning session accordingly)
3. Select 1–3 backlog items to elaborate
4. Use create-backlog-item skill to structure each item
5. Return planning report with metrics summary at the top
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Script returns "No such file or directory" | Wrong working directory | Run from project root, not `aml-dashboard/` subdirectory |
| All file counts are 0 | Source tree doesn't exist yet | Check that `aml-dashboard/src/` directory exists |
| "npm audit" hangs | Network slowness or large vulnerability scan | Run `npm audit --offline` or skip this step |
| Build status shows errors | Project has syntax or dependency issues | Fix errors in source files or run `npm install` |

## Quality Checks Before Using Metrics

After collecting metrics:
- [ ] File counts are non-zero (code exists)
- [ ] Test ratio matches your expectations (e.g., if 3 services written, expect ≥1 test file)
- [ ] Build status is ✅ or 🟡, not ❌
- [ ] developer_todo.md open item count matches your planning backlog
- [ ] No critical npm audit vulnerabilities

If any check fails, address it (install dependencies, fix syntax errors) before proceeding.

