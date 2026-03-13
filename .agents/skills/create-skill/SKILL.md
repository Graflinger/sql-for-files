---
name: create-skill
description: Create or update a reusable project skill in .agents/skills using this repo's conventions and a portable Agent Skills format. Use when adding repeatable workflows such as new pages, reviews, or repo-specific implementation patterns.
---

# Create Skill

Use this skill when adding a new repository skill for SQL for Files.

## Goal

Create a skill that is:

- useful for a repeatable workflow
- specific enough to trigger correctly
- portable across skill-supporting tools where practical
- aligned with this repo's decision to keep project skills in `.agents/skills`

## Repository decisions

- Canonical in-repo skill location: `.agents/skills/<skill-name>/SKILL.md`
- Use lowercase kebab-case for the directory and skill `name`
- Keep the directory name and frontmatter `name` identical
- Prefer the portable frontmatter subset:
  - `name`
  - `description`
- Avoid tool-specific metadata unless explicitly requested or clearly necessary
- When a new skill introduces a lasting repo workflow, add a short note to `AGENTS.md`

## When to create a skill

Create a skill when the repo has a repeated, opinionated workflow such as:

- adding a new page
- performing a recurring review flow
- implementing a repo-specific feature pattern
- handling release or maintenance tasks with stable steps

Do not create a skill for:

- one-off tasks
- generic coding advice already covered by `AGENTS.md`
- very broad instructions that should live as repository policy instead

## Required workflow

1. Choose a narrow, descriptive kebab-case skill name
2. Create `.agents/skills/<skill-name>/SKILL.md`
3. Add YAML frontmatter with `name` and `description`
4. Write instructions that clearly state:
   - when to use the skill
   - when not to use it
   - required inputs
   - concrete workflow steps
   - validation expectations
5. Keep the core instructions portable and markdown-only by default
6. If the skill establishes a new repo convention, update `AGENTS.md`

## Writing guidance

Descriptions matter most for discoverability. Write them so an agent can distinguish the skill from nearby tasks.

Good descriptions:

- mention the exact workflow
- name the relevant repo area when useful
- say when the skill should not trigger

Good bodies:

- use imperative steps
- define a clear scope
- reference the repo's real files and patterns
- keep the workflow practical rather than theoretical

## Portability guidance

Default to the common Agent Skills format so the skill is easier to reuse across tools.

Only add tool-specific behavior when explicitly needed. If you do, keep the main instructions understandable without relying on that metadata.

## Validation checklist

Before finishing, verify:

- skill path is `.agents/skills/<skill-name>/SKILL.md`
- directory name matches frontmatter `name`
- `name` is lowercase kebab-case
- `description` is specific and scoped
- the skill is focused on one repeatable workflow
- `AGENTS.md` was updated if a new repo-level convention was introduced
