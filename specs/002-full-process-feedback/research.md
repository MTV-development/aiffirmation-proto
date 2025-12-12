# Research: Full Process 2 - Feedback-Aware Affirmation Generation

**Date**: 2025-12-12
**Branch**: `002-full-process-feedback`

## Research Summary

This document captures research findings and design decisions for FP-02. Since this feature follows established patterns with no unknowns requiring clarification, research focused on confirming implementation approaches.

## Decision 1: Agent Directory Structure

**Decision**: Create `src/mastra/agents/full-process-2/` with `agent.ts` and `index.ts`

**Rationale**: Mirrors existing agent structure (full-process, ag-aff-01, ag-good-ten). Each agent has its own directory with:
- `agent.ts` - Agent class definition and factory function
- `index.ts` - Clean exports

**Alternatives Considered**:
- Single file in agents directory: Rejected - inconsistent with existing pattern
- Shared base class with FP-01: Rejected - spec explicitly requires independent implementation (FR-011, NR-006)

## Decision 2: KV Store Namespace

**Decision**: Use `versions.fp-02.*` namespace for all FP-02 configuration

**Rationale**: Follows constitution requirement for KV key format `{namespace}.{version}.{keyName}.{implementation}`. Keeps FP-02 completely separate from FP-01.

**Required KV Entries**:
| Key | Purpose |
|-----|---------|
| `versions.fp-02._info.default` | Agent metadata (name, description, author) |
| `versions.fp-02._model_name.default` | Model identifier (e.g., `openai/gpt-4o`) |
| `versions.fp-02._temperature.default` | Generation temperature (e.g., `0.95`) |
| `versions.fp-02.system.default` | System prompt with feedback analysis instructions |
| `versions.fp-02.prompt.default` | User prompt template with Liquid variables |

**Alternatives Considered**:
- Extend FP-01 namespace with sub-version: Rejected - would couple FP-02 to FP-01

## Decision 3: Feedback Data in Prompt Template

**Decision**: Pass `approvedAffirmations` and `skippedAffirmations` as separate Liquid template variables

**Rationale**:
- Clear semantic distinction between positive and negative examples
- Agent can analyze patterns in each list independently
- Liquid's `for` loop handles list rendering naturally

**Template Variables**:
```liquid
{% if approvedAffirmations and approvedAffirmations.size > 0 %}
## Affirmations You Liked
{% for affirmation in approvedAffirmations %}- {{ affirmation }}
{% endfor %}
{% endif %}

{% if skippedAffirmations and skippedAffirmations.size > 0 %}
## Affirmations You Skipped
{% for affirmation in skippedAffirmations %}- {{ affirmation }}
{% endfor %}
{% endif %}
```

**Alternatives Considered**:
- Single combined list with labels: Rejected - harder for agent to analyze patterns
- JSON object: Rejected - less readable in prompt

## Decision 4: Feedback List Limits

**Decision**: Limit to 20 most recent approved and 20 most recent skipped affirmations

**Rationale**:
- Prevents prompt from becoming too long (per FR-005)
- Most recent feedback is most relevant to current preferences
- 20+20 = 40 affirmations × ~10 words each = ~400 words, well within token limits

**Alternatives Considered**:
- No limit: Rejected - could exceed token limits with heavy users
- Smaller limit (10): Rejected - may not capture enough pattern data
- Dynamic limit based on token count: Rejected - over-engineering for current scope

## Decision 5: System Prompt Enhancement

**Decision**: Add a dedicated "Feedback Analysis" section to FP-02 system prompt instructing the agent to:
1. Analyze approved affirmations for patterns (length, tone, structure, themes)
2. Analyze skipped affirmations for anti-patterns (what to avoid)
3. Generate new affirmations that lean toward approved patterns
4. Avoid characteristics common in skipped affirmations

**Rationale**: Explicit instructions help the agent understand how to use feedback data effectively.

**Alternatives Considered**:
- Rely on agent to infer from data: Rejected - less reliable results
- Fine-tuned model: Rejected - outside current scope, requires infrastructure

## Decision 6: Server Action Integration

**Decision**: Create new `generateFullProcess2Affirmations` server action in `app/full-process/actions.ts`

**Rationale**:
- Keeps FP-02 independent from FP-01 action
- Frontend can choose which action to call based on configuration
- Cleaner separation than parameter-based switching

**Alternatives Considered**:
- Single action with version parameter: Possible but mixes concerns
- Separate actions file: Over-engineering for single additional function

## Decision 7: Deriving Skipped Affirmations

**Decision**: Compute skipped affirmations as `shownAffirmations.filter(a => !likedAffirmations.includes(a))`

**Rationale**:
- UI already tracks `shownAffirmations` and `likedAffirmations`
- No additional state needed
- Computation is trivial and can happen in server action

**Alternatives Considered**:
- Track skipped explicitly in UI: Rejected - requires UI changes (violates NR-001)
- Store in separate state: Rejected - redundant data

## No Unresolved Clarifications

All technical decisions have been made. The implementation path is clear:

1. Create FP-02 agent directory with agent code
2. Add seed data for KV entries
3. Register agent in Mastra index
4. Add server action for FP-02 generation
5. Verify via Mastra Studio and manual testing
