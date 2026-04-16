# Agent-Driven Development — Integrated Workflow Guide

A step-by-step guide for building a complete project using an agentic workflow. Technology-agnostic. Applies to any project scope or complexity level.

---

## Workshop Overview

| Phase | Title | Time | Core / Stretch |
|---|---|---|---|
| [0](#phase-0--environment--project-foundation-20-min) | Environment & Project Foundation | ~20 min | Core |
| [1](#phase-1--blueprint--research-30-min--hard-stop) | Blueprint & Research | ~30 min *(hard stop)* | Core |
| [2](#phase-2--base--domain-instructions-20-min) | Base & Domain Instructions | ~20 min | Core |
| [3](#phase-3--specialist-agents-25-min) | Specialist Agents | ~25 min | Core |
| [4](#phase-4--skills-15-min--templates-pre-exist-in-github) | Skills | ~15 min | Core |
| [5](#phase-5--feature-implementation-6090-min--one-backlog-item-end-to-end) | Feature Implementation | 60–90 min | Core |
| [6](#phase-6--retrospective-15-min) | Retrospective | ~15 min | Core |
| [7](#phase-7--stretch-hooks--orchestration-post-workshop--if-time-allows) | Hooks & Orchestration | open-ended | Stretch |
| | **Core total** | **~3 h 25 min** | |

> **Hard constraint** — Phase 1 must stop at 30 minutes regardless of completeness. An incomplete blueprint is better than no time left for implementation.

---

## Mode Reference

Use this as a quick guide when deciding how to approach each step throughout the workflow.

| Mode | When to use | Typical steps |
|---|---|---|
| **Ask** | Still deciding — no file edits needed; use AI as a sparring partner | Requirements, domain analysis, design, conceptual reviews |
| **Plan** | Multi-file or sequenced work — review the plan before execution runs | Feature implementation, hook authoring, agent refactoring |
| **Agent** | Well-scoped, direct execution — file creation, commands, tool invocations | Scaffolding files, running scripts, wiring infrastructure |

> **Rule of thumb:** If you are still *deciding*, use Ask. If the task touches more than ~3 files or has a TDD sequence, use Plan first. Otherwise, use Agent directly.

---

## Two Principles to Carry Through Every Phase

1. **Human-in-the-loop.** Design your agents to stop and report back at key decision points. A human reviews, comments, and approves before work continues. An agent that runs end-to-end without checkpoints is a liability, not an asset.
2. **Brevity.** Agent definitions, skill instructions, and protocols that grow beyond ~150 lines lose focus. Keep instructions tight, specific, and structured.

---

## Design Checklist

Review this before you consider any phase complete:

- [ ] Does each agent stop for human approval at key decision points?
- [ ] Could any LLM guesswork be replaced with a deterministic tool (script, skill, hook) to get facts into context?
- [ ] Are agent instructions under ~150 lines and clearly structured?
- [ ] Is each agent's tool list minimal — only what it actually needs?
- [ ] Does each agent have a defined input/output contract?
- [ ] Have you tested each agent with a concrete task and observed its behaviour?

---

## Phase 0 — Environment & Project Foundation *(~20 min)*

### 0.1 Select Your Project (Ask Mode)

Choose what you want to build. Consider:
- What problem does it solve?
- What are the main functional areas (data ingestion, display, analysis, interaction)?
- What is the expected complexity? Start simpler if new to agentic workflows.

### 0.2 Verify Your Environment

Before anything else, confirm:
- Your IDE and Copilot extensions are installed and functional
- Agent mode is available and responsive
- You can switch between custom agents in the agent picker

### 0.3 Enable the Chat Debug View

Open your IDE's Chat panel, access the `...` menu, and select **Open Chat Debug View**. This reveals the agent's reasoning blocks, tool invocations, and skill/hook execution logs. Use it throughout every phase to understand *why* an agent made a decision.

### 0.4 Create the Infrastructure Directories (Agent Mode)

```
.github/agents/
.github/skills/
.github/hooks/
.github/instructions/
.github/prompts/
```

These directories house every artefact you build. Nothing lives in ad-hoc locations.

---

## Phase 1 — Blueprint & Research *(~30 min — hard stop)*

*Produce the foundational artefacts before writing a single line of implementation code.*

### 1.1 Define the Project with AI (Ask Mode)

Open Ask mode. Use it as a sparring partner — not a code generator. Ask it to quiz you about:
- The problem your project solves and who it serves
- The key features and how users will interact with them
- The data your project needs to work with
- The architectural layers (data layer, logic layer, presentation layer)
- Constraints and non-functional requirements

Let the AI ask clarifying questions. The goal is to surface decisions you haven't made yet.

### 1.2 Generate `BLUEPRINT.md` (Ask Mode)

Have the AI produce a project specification covering:
- **Purpose and user scenarios** — who uses it, what they do, what they need to see
- **Feature list** — broken down by functional area
- **Data model** — the key entities, their fields, and relationships
- **API surface** — the endpoints or interfaces that will expose data
- **Constraints** — anything that must remain true (no external APIs, in-memory data, mock endpoints, etc.)

This is the single source of truth all subsequent agents reference.

### 1.3 Generate `developer_todo.md` (Ask Mode)

Have the AI produce a phased task breakdown. Every task must:
- Be completable in a **single agent context window** (a rough guide: ≤5 files touched)
- Have a clear **acceptance criterion** — a specific, testable statement of done
- Include a **TDD requirement** — what tests should exist before the task is considered complete
- Be tagged with the domain it belongs to (data layer, API layer, frontend, etc.)

Tasks that are too large must be split. An agent that receives an oversized task will lose context mid-way.

**Checkpoint:** Do not proceed to Phase 2 until `BLUEPRINT.md` and `developer_todo.md` exist and have been reviewed.

---

## Phase 2 — Base & Domain Instructions *(~20 min)*

*Encoding your standards so every agent follows them without being told repeatedly.*

### 2.1 Generate Base Custom Instructions (Ask Mode)

Create `.github/copilot-instructions.md`. This file applies universally — it sets project-wide conventions. Use Ask mode (with `BLUEPRINT.md` as context) to generate it. Include:
- Project purpose in one paragraph
- Code style conventions (naming, file organisation)
- Universal error handling expectations
- Commit and documentation expectations

These are the non-negotiables. Do not include domain-specific rules here.

### 2.2 Identify Your Domains (Ask Mode)

With the AI, identify 2–3 domains relevant to your project. For the workshop projects, typical domains are:
- **Business logic** — risk scoring, pattern detection, or migration rules
- **Presentation layer** — components, data loading, state
- **Tests** — unit test conventions

For each, note a glob pattern (e.g. `src/logic/**`, `src/components/**`) and the key concerns. Capture this inline — you do not need a separate document.

### 2.3 Generate Domain Instruction Files (Agent Mode)

For each domain, create a file in `.github/instructions/` named `<domain>.instructions.md`. Include in the YAML frontmatter an `applyTo` glob pattern that activates it automatically when matching files are open.

Use the AI to generate each file. Provide the domain name, glob pattern, and your tech stack — the AI will apply appropriate best practices.

Each instruction file should cover:
- What to always do (patterns, validations, structure)
- What to never do (anti-patterns, shortcuts that cause problems)
- Domain-specific security or performance concerns

Do not duplicate guidance already in the base instructions.

### 2.4 Validate for Contradictions (Agent Mode)

Add all instruction files as context and ask: are there contradictions between domain and base instructions, or gaps in coverage? Resolve any issues before moving on. Keep this to 5 minutes.

---

## Phase 3 — Specialist Agents *(~25 min)*

*Creating focused AI assistants with clear roles and enforced boundaries.*

### 3.1 Design Your Specialists with AI (Ask Mode)

Use Ask mode with your domain list from 2.2 as context. For each domain, design a specialist agent:
- What is its **single responsibility**?
- What **tools** does it need? (file editing, terminal, search, problems — only what it genuinely needs)
- What are its **explicit boundaries**? What files or domains must it never touch?
- What **protocols** ensure consistent output?

Document the design before creating any files.

### 3.2 Create Specialist Agent Files (Agent Mode)

Create one `.agent.md` file per specialist in `.github/agents/`. Each file has YAML frontmatter defining the agent's name, description, allowed tools, and optionally a preferred model.

Use Agent mode to scaffold these files — provide the design from 3.1 and ask it to generate the `.agent.md` frontmatter and instructions. Review and refine the output; do not hand-author YAML by guessing.

Each agent's instructions must include:
- A clear statement of its responsibility
- An explicit list of what it will not do
- A reference to the relevant domain instruction file
- A protocol for how it produces output (what format, what review steps)

### 3.3 Create the Project Manager Agent (Agent Mode)

The PM agent is distinct from domain specialists. It:
- Analyses the current state of the project
- Selects and elaborates backlog items from `developer_todo.md`
- Produces structured, properly sized backlog items with acceptance criteria and TDD requirements
- Does **not** implement anything

The PM should reference the `create-backlog-item` skill (which you will build in Phase 4) in its instructions so it always uses a consistent item structure.

### 3.4 Validate Agent Boundaries (Agent Mode)

Test each specialist:
- Ask a domain question it should answer — verify it answers correctly
- Ask a question that falls outside its domain — verify it declines and suggests the correct agent
- Switch between specialists for a feature that spans two domains — verify each maintains focus

---

## Phase 4 — Skills *(~15 min — templates pre-exist in `.github/`)*

*Replacing LLM guesswork with deterministic, reusable capabilities.*

### 4.1 Understand the Distinction (Ask Mode)

A skill is not a custom instruction. It is a directory under `.github/skills/<name>/` containing:
- A `SKILL.md` with a `name` and `description` in its YAML frontmatter
- Optional scripts that run deterministically
- Optional resource files (templates, reference data) the agent loads verbatim

Skills are loaded on-demand when the agent judges them relevant. They are portable across agents. Use them when you want the agent to have a specific, repeatable capability — not just general guidance.

**Rule of thumb:** If an LLM might guess wrong, make it a script. If the value is in the structure (not the execution), make it a resource template.

### 4.2 Create `create-backlog-item` (Agent Mode)

This skill ensures every backlog item has the same structure regardless of which agent creates it.

Create `.github/skills/create-backlog-item/` with:
- `SKILL.md` — instructs the agent to always use the included template
- `backlog-item-template.md` — the canonical item structure: title, description, acceptance criteria, TDD plan, file-scope estimate, definition of done

Reference this skill explicitly in the PM agent's instructions.

### 4.3 Create `run-tests` (Agent Mode)

This skill ensures agents run tests correctly — with the right command, the right flags, and structured output.

Without it, agents invent their own test command, which is often wrong.

Create `.github/skills/run-tests/` with:
- `SKILL.md` — instructions for test execution
- A shell script that runs the test suite and outputs structured pass/fail information (test count, failing test names, exit code)

This skill is reusable. Any agent that needs to verify tests can invoke it.

### 4.4 Create `project-metrics` (Agent Mode)

This skill gives the PM agent deterministic project state so it does not guess.

Create a script that collects: source file count by layer, test count, any lint or build status signals. The PM uses this before planning instead of scanning files manually.

### 4.5 Create Workflow Prompt Files (Agent Mode)

In `.github/prompts/`, create reusable prompt files that automate common multi-step tasks. Each file has YAML frontmatter specifying the mode and tools, and a body that guides the user through a structured workflow.

Suggested prompts for the workshop projects:
- One for loading and transforming data from a JSON source
- One for creating a UI component connected to a data source
- One for the TDD loop sequence (write tests → confirm fail → implement → pass)

---

## Phase 5 — Feature Implementation *(60–90 min — one backlog item end-to-end)*

*Using the full domain system to build the project's required features.*

### 5.1 Select a Feature (Agent Mode)

Review `developer_todo.md`. Use the PM agent to:
1. Assess the current project state (using the `project-metrics` skill)
2. Select the next logical backlog item
3. Produce a fully elaborated item using the `create-backlog-item` skill

Review the item. If it's too large (touches >5 files), ask the PM to split it. Approve the item before any implementation begins.

### 5.2 Data & Logic Layer Implementation (Plan Mode)

Switch to the appropriate specialist agent. Use the relevant workflow prompt. Follow this sequence:
1. Write the data-loading module that reads from the provided JSON files
2. Add the business logic layer on top (risk scoring, pattern detection, or migration rules)
3. Add error handling for missing or malformed data
4. Ask the specialist to review the output for standard compliance before moving on

Do not move to the presentation layer until the data and logic layers are stable and tested.

### 5.3 Presentation Layer Implementation (Plan Mode)

Switch to the frontend specialist. Use the workflow prompt for the presentation component. Ensure it:
- Connects to the data/logic layer built in 5.2
- Handles loading states, empty states, and errors
- Meets the acceptance criteria from the backlog item

Ask the specialist to evaluate the component for accessibility and user experience before signing off.

### 5.4 Testing — Strict TDD Loop (Plan Mode)

Switch to the Test Engineer. The sequence must be:

1. **Write failing tests first** that directly map to the acceptance criteria
2. **Run the tests** using the `run-tests` skill — confirm they fail for the right reasons
3. **Implement** the production code to make the tests pass
4. **Run the tests again** — loop until all pass
5. **Do not declare success** until the `run-tests` skill reports all green

The Test Engineer must not skip to step 3. If it does, redirect it.

### 5.5 Cross-Domain Validation (Agent Mode)

Return to general Agent mode. Verify that the layers integrate correctly:
- Does the frontend correctly consume the data layer?
- Do the tests cover the integration points, not just the units?
- Ask for a final review of the complete feature for security, performance, and standards compliance

---

## Phase 6 — Retrospective *(~15 min)*

Look back at the workflow cycle just completed:
- Where did agents stay within their boundaries — and where did they drift?
- Which steps consumed the most time unexpectedly?
- What would you change in the instructions or skills before running a second feature?
- Open the Chat Debug View log: what can you learn from the tool invocations and skill/hook execution trace?

Use the Open Questions at the end of this document as discussion prompts.

---

## Phase 7 — Stretch: Hooks & Orchestration *(post-workshop — if time allows)*

*System-level guarantees and automated coordination. Tackle these after completing at least one full Phase 5 cycle.*

### Hooks

An instruction that says "always run the linter" is a suggestion the LLM may ignore. A hook that runs the linter is a guarantee. Hooks are shell commands that run at specific lifecycle points, defined in JSON files in `.github/hooks/`.

Available lifecycle events: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `SubagentStart`, `SubagentStop`, `Stop`.

**A. Smart Gatekeeper — `PreToolUse` (Plan Mode)**

The stub already exists in `.github/hooks/gatekeeper.json` and `.github/hooks/scripts/gatekeeper.sh`. Review it, adjust the safe/danger patterns for your project's commands, and test it: a safe command should auto-approve; a destructive command should prompt. Confirm both in the Chat Debug View.

**B. Post-Edit Quality Hook — `PostToolUse` (Agent Mode)**

Create a `PostToolUse` hook JSON that runs your linter or formatter after every file edit. This enforces code quality as a system guarantee, not a suggestion.

**C. PM Audit Hook — Agent-Scoped (Agent Mode)**

Add a `hooks` field to the PM agent's `.agent.md` frontmatter. On `Stop`, append a timestamped entry to `.github/pm-audit.log`. Verify the log updates after a PM session and that the hook appears in the Chat Debug View.

### Orchestration

In Phase 5 you manually switched between agents and re-explained context each time. Orchestration eliminates that through three roles running in separate context windows:

| Role | Responsibility |
|---|---|
| **Coordinator** | Delegates to subagents, sees only summaries, never reads files directly |
| **Researcher** | Reads files, returns a compact summary — context is disposable |
| **Implementer** | Receives precise instructions, writes code |

Key steps: set `user-invocable: false` on specialists, add I/O contracts to each agent's instructions, create a Coordinator with `tools: [agent]` only, and run one feature from `developer_todo.md` end-to-end.

---

## Artefact Reference

| File | Produced by | Purpose |
|---|---|---|
| `BLUEPRINT.md` | Architect (Ask mode) | Technical decisions, data model, API surface, constraints |
| `developer_todo.md` | Planning (Ask mode) | Phased task list with acceptance criteria and TDD requirements |
| `.github/copilot-instructions.md` | Agent mode | Universal project conventions |
| `.github/instructions/<domain>.instructions.md` | Agent mode | Domain-specific standards, activated by `applyTo` glob |
| `.github/agents/<name>.agent.md` | Agent mode | Specialist agent definition (tools, boundaries, protocols) |
| `.github/skills/<name>/SKILL.md` | Agent mode | Reusable skill with optional scripts and resource files |
| `.github/prompts/<name>.prompt.md` | Agent mode | Reusable workflow automation prompts |
| `.github/hooks/<name>.json` | Phase 7 stretch | Lifecycle hook definitions |
| `.github/pm-audit.log` | Phase 7 stretch | Timestamped record of PM agent sessions |

---

## Debugging Guide

| Symptom | Where to look | What to check |
|---|---|---|
| Agent ignores instructions | Chat Debug View → context panel | Is the instruction file in context? Does the `applyTo` glob match? |
| Skill never fires | Chat Debug View → skill log | Is the skill name in the agent's `agents` list or instructions? |
| Hook doesn't run | Chat Debug View → execution log | Is the hook JSON valid? Is the event name correct? *(Phase 7 stretch)* |
| Agent crosses domain boundary | Agent instructions | Is the boundary stated explicitly as a prohibition? |
| TDD loop skipped | Implementer instructions | State the sequence explicitly: tests first, fail confirmation, then implementation |

---

## Open Questions to Discuss at Each Phase

- How specific should instructions be vs. how much should the model exercise judgment?
- Where are the right human checkpoints — frequent enough to catch errors, infrequent enough not to defeat the purpose of automation?
- Which skills are reusable across multiple agents, and which are agent-specific?
- What happens when an agent produces incorrect output mid-task? How do you redirect it without losing context?
