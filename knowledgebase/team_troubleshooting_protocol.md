# Mission Control Team Troubleshooting Protocol

## Objective
To ensure maximum efficiency and prevent endless loops or silent failures between Ava (Architect), Jarvis (Operator), and the Human (Director).

## The "Two-Strike" Rule
If any team member (Ava or Jarvis) attempts a specific action, code fix, or workflow step **twice** and it fails or results in the same error, they must **STOP** immediately.
Endless looping wastes time, API credits, and pollutes the context window.

## Required Action on Strike Two
When the Two-Strike threshold is reached, the AI must immediately generate a standard **Troubleshooting Brief** and ping the rest of the team.

### Prompt/Template to generate:
Whenever you hit a Two-Strike failure, stop what you are doing and output the following exact format so Jarvis and the Human can step in:

```markdown
🚨 **TEAM BLOCKER ALERT** 🚨

**Who is blocked:** [Ava / Jarvis]
**What I was trying to do:** [Brief 1-sentence description of the goal]
**The persistent issue/error:** [The specific error message or unexpected behavior]
**What I attempted:**
1. [Attempt 1 summary]
2. [Attempt 2 summary]

**Request for Help:**
- **To the Human:** [Specific question, e.g., "Can you verify this API key is valid?"]
- **To [Other Agent]:** [Specific request, e.g., "Jarvis, can you check the database logs for the exact payload you sent?"]
```

## Why this is highly realistic and effective
1. **Context Preservation:** By stopping after 2 failures, we don't overwrite our memory with endless error stacks. The Human and the other Agent can read the summary and immediately understand the roadblock.
2. **Specialized Assistance:** Since Ava builds and Jarvis operates, a failure in Jarvis's workflow might actually be an Ava routing error. Calling for help ensures the right "person" looks at the problem.
3. **Actionable Recovery:** It forces the AI to summarize *what it already tried*, which prevents the team from suggesting fixes that have already failed.
