# Claude Code Delegation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Create a skill that enables Hermes agents to delegate coding tasks to Claude Code CLI via bash instructions.

**Architecture:** The solution involves creating a Hermes skill that encapsulates the patterns for invoking Claude Code CLI, including both print mode and interactive PTY mode usage, with proper dialog handling and verification steps.

**Tech Stack:** 
- Hermes Agent framework
- Claude Code CLI (Anthropic's autonomous coding agent)
- Bash scripting via Hermes terminal tool
- TMUX for interactive mode orchestration

---

## Task 1: Research Claude Code CLI Patterns

**Objective:** Understand the Claude Code CLI usage patterns for both print mode and interactive mode.

**Files:**
- Read: autonomous-ai-agents/claude-code/SKILL.md (existing skill reference)

**Step 1: Examine existing claude-code skill**
```bash
# Already done via skill_view command
```

**Step 2: Verify Claude Code installation**
```bash
which claude
claude --version
```

**Step 3: Test basic Claude Code functionality**
```bash
claude -p 'Say hello' --allowedTools 'Read' --max-turns 1
```

**Step 4: Document patterns for skill creation**

**Step 5: Commit research findings**

---

## Task 2: Create delegate-to-claude-code Skill

**Objective:** Create a new Hermes skill that encapsulates Claude Code delegation patterns.

**Files:**
- Create: delegate-to-claude-code/SKILL.md

**Step 1: Create skill directory and SKILL.md with frontmatter**
```yaml
---
name: delegate-to-claude-code
description: "Skill for delegating coding tasks to Claude Code CLI via bash instructions"
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Coding-Agent, Claude, Delegation, Bash, CLI]
    related_skills: [claude-code, plan, subagent-driven-development]
---
```

**Step 2: Add skill documentation covering:**
- Prerequisites (installation, auth)
- Print mode patterns (recommended)
- Interactive PTY mode patterns (tmux orchestration)
- Dialog handling procedures
- Usage with delegate_task
- Verification steps
- Best practices

**Step 3: Add examples for both modes**
**Step 4: Add related skills section**
**Step 5: Commit skill creation**

---

## Task 3: Test Skill with Simple Delegation

**Objective:** Verify the skill works by delegating a simple coding task.

**Files:**
- Modify: None (delegation creates files in workdir)
- Create (via delegation): hello_from_claude.py (in test directory)

**Step 1: Set up test workspace**
```bash
mkdir -p /tmp/claude-test
cd /tmp/claude-test
```

**Step 2: Delegate task using the skill pattern**
```bash
# This will be done via delegate_task function
delegate_task(
    goal="Run: claude -p 'Create a simple Python script that prints \"Hello from Claude Code!\" and save it as hello_from_claude.py' --allowedTools 'Read,Write' --max-turns 5",
    workdir="/tmp/claude-test",
    toolsets=["terminal"],
    skills=["delegate-to-claude-code"]
)
```

**Step 3: Verify delegation results**
```bash
# Check file was created
ls -la hello_from_claude.py

# Check content
cat hello_from_claude.py

# Run to verify output
python3 hello_from_claude.py
```

**Step 4: Clean up test files**
```bash
rm -rf /tmp/claude-test
```

**Step 5: Commit test results**

---

## Task 4: Document and Finalize

**Objective:** Ensure skill is properly documented and ready for use.

**Files:**
- Modify: delegate-to-claude-code/SKILL.md (final review)

**Step 1: Review skill for completeness and clarity**
**Step 2: Add usage examples if needed**
**Step 3: Verify formatting and structure**
**Step 4: Final commit**

---

## Files Likely to Change
- Create: `delegate-to-claude-code/SKILL.md`
- Create (via delegation): `hello_from_claude.py` (temporary test file)

## Tests / Validation
- Manual verification of Claude Code CLI availability
- Ad-hoc verification script for delegated task output
- File existence and content checks
- Execution output validation

## Risks, Tradeoffs, and Open Questions
- **Risk:** Claude Code CLI not installed or not authenticated - mitigated by prerequisites section
- **Risk:** TMUX not available for interactive mode - mitigated by recommending print mode for most tasks
- **Tradeoff:** Print mode is simpler but lacks interactive capabilities; interactive mode is more complex but allows multi-turn work
- **Open Question:** Should we add automatic skill updating capability when Claude Code CLI changes?

## Verification Approach
Since there's no canonical test/lint/build command for skill creation, we'll use ad-hoc verification:
1. Verify skill file exists with correct content
2. Test delegation with a simple task
3. Verify the delegated task produces expected results
4. Clean up temporary verification artifacts

This follows the user's preference for ad-hoc verification when canonical commands aren't available.