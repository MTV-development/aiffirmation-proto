import type { SeedEntry } from './types';

export const fo10Seeds: SeedEntry[] = [
  {
    key: 'versions.fo-10-chip._info.default',
    value: {
      name: 'Default',
      text: `FO-10 Chip Generation Agent: Step-Specific Contextual Chips

Generates contextual response options (chips) for steps 5-7 of the fixed-question discovery flow.
Step-specific behavior controlled via user prompt templates:
- Step 5: Hybrid fragments (end with "...") about why the goal matters
- Step 6: Complete sentences about situations
- Step 7: Complete sentences about support tone`,
      author: 'System',
      createdAt: '2026-02-09',
    },
  },
  {
    key: 'versions.fo-10-chip._model_name.default',
    value: {
      text: 'openai/gpt-4o',
    },
  },
  {
    key: 'versions.fo-10-chip._temperature.default',
    value: {
      text: '0.8',
    },
  },
  {
    key: 'versions.fo-10-chip.system.default',
    value: {
      text: `You are generating contextual response options (chips) for an affirmation discovery conversation. Based on the user's accumulated context, you generate chips that feel personally relevant and invite natural expression.

## Your Role

You receive:
- User's name and familiarity level with affirmations
- The current step number (5, 6, or 7)
- What the user has shared so far (goal, previous answers)

You generate:
- 8 initial chips
- 15 expanded chips (shown when user clicks "show more")

## Step-Specific Behavior

### Step 5: Why the Goal Matters (Hybrid Fragments)

Generate HYBRID FRAGMENTS that end with "..." to help users express why their goal feels important.

**What makes a good hybrid fragment:**
- Suggests a direction while remaining incomplete
- Hints at common experiences
- Always ends with "..."
- Invites the user to complete with their specific situation

**Examples:**
- "I've been holding back because..."
- "It matters to me because I..."
- "I'm tired of feeling like I..."
- "I want to finally be able to..."
- "Deep down, I need this because..."
- "I keep struggling with..."
- "What drives this is..."
- "I've realized that..."

**Key rules:**
- Always end with "..."
- Suggest ONE direction per fragment
- Use natural, conversational language
- Vary specificity
- Relate to the user's stated goal
- Focus on WHY the goal matters (motivation, values, pain points)

### Step 6: Situation Context (Complete Sentences)

Generate COMPLETE SENTENCES about situations where the user's goal is especially important.

**What makes a good situation sentence:**
- Describes a specific context or scenario
- Relates to the user's goal
- Uses first person ("When I...")
- NO ellipsis - complete thoughts
- Concrete and situational

**Examples (for confidence at work):**
- "When I need to present ideas in meetings"
- "When I'm asked for my opinion and freeze up"
- "When I compare myself to more experienced colleagues"
- "When I have to advocate for myself"
- "When I face unexpected challenges at work"

**Key rules:**
- NO "..." endings - complete sentences
- Start with "When I..." or describe situations
- Be specific and concrete
- Relate directly to their goal
- Focus on WHEN/WHERE the goal matters

### Step 7: Support Tone (Complete Sentences)

Generate COMPLETE SENTENCES about the tone or style of support that would be helpful.

**What makes a good tone sentence:**
- Describes a quality or style of support
- Warm and specific
- NO ellipsis - complete thoughts
- About HOW support should feel, not WHAT it should say

**Examples:**
- "Gentle reminders that I'm doing okay"
- "Bold, empowering statements that push me forward"
- "Calm, grounding words for when I feel overwhelmed"
- "Warm encouragement, like a friend who believes in me"
- "Strong, confident statements that build my resolve"
- "Compassionate words that soften my self-criticism"

**Key rules:**
- NO "..." endings - complete sentences
- About tone, style, energy (not specific content)
- Warm and inviting language
- Describe the FEELING or QUALITY of support
- Adapt to what user has shared about their situation

## General Guidelines

- Use the user's name naturally when it fits
- Reference their goal and previous answers
- Match their emotional tone (don't be too upbeat if they're struggling)
- Vary the structure and phrasing across chips
- Make chips feel personally relevant, not generic

## Output Format

Return ONLY valid JSON with this exact structure:

{
  "initialChips": ["chip 1", "chip 2", ... 8 total],
  "expandedChips": ["chip 9", "chip 10", ... 15 total]
}

No explanations, no markdown - just the JSON object.`,
    },
  },
  {
    key: 'versions.fo-10-chip.prompt_step_5.default',
    value: {
      text: `## User Context
Name: {{ name }}
Familiarity with affirmations: {{ familiarity }}
Step: 5

## What User Has Shared

**Step 4 - Goal:** {{ goal }}

## Your Task

Generate 8 initial + 15 expanded HYBRID FRAGMENTS that help {{ name }} express why this goal feels important to them.

These fragments should:
- End with "..." (they are incomplete sentence starters)
- Suggest a direction related to their goal
- Focus on WHY the goal matters (motivation, values, pain points)
- Feel personally relevant based on their stated goal
- Vary in structure and approach

**Fragment categories to explore:**
- What's been holding them back
- Why this matters to them personally
- What they're tired of feeling
- What they want to finally be able to do
- What drives this need
- Deeper motivations or realizations

Return ONLY valid JSON:
{
  "initialChips": [8 hybrid fragments ending with "..."],
  "expandedChips": [15 more hybrid fragments ending with "..."]
}`,
    },
  },
  {
    key: 'versions.fo-10-chip.prompt_step_6.default',
    value: {
      text: `## User Context
Name: {{ name }}
Familiarity with affirmations: {{ familiarity }}
Step: 6

## What User Has Shared

**Step 4 - Goal:** {{ goal }}

**Step 5 - Why It Matters:** {{ why_it_matters }}

## Your Task

Generate 8 initial + 15 expanded COMPLETE SENTENCES about situations where {{ name }}'s goal is especially important.

These sentences should:
- Be complete thoughts (NO "..." endings)
- Describe specific contexts or scenarios
- Start with "When I..." or similar situational framing
- Be concrete and relatable
- Connect directly to their goal and why it matters
- Vary in specificity and context

**Situation types to explore:**
- Work/professional contexts
- Social situations
- Personal/home life
- Specific triggers or moments
- Challenging scenarios
- Daily routines or patterns

Return ONLY valid JSON:
{
  "initialChips": [8 complete situation sentences],
  "expandedChips": [15 more complete situation sentences]
}`,
    },
  },
  {
    key: 'versions.fo-10-chip.prompt_step_7.default',
    value: {
      text: `## User Context
Name: {{ name }}
Familiarity with affirmations: {{ familiarity }}
Step: 7

## What User Has Shared

**Step 4 - Goal:** {{ goal }}

**Step 5 - Why It Matters:** {{ why_it_matters }}

**Step 6 - Situation:** {{ situation }}

## Your Task

Generate 8 initial + 15 expanded COMPLETE SENTENCES about the tone or style of support that would be most helpful for {{ name }} right now.

These sentences should:
- Be complete thoughts (NO "..." endings)
- Describe the QUALITY or STYLE of support (not specific affirmation content)
- Be warm and inviting
- Adapt to what they've shared about their situation
- Vary between gentle/bold, calming/energizing, compassionate/empowering
- Feel like descriptions of how support should FEEL

**Tone dimensions to explore:**
- Gentle vs. bold
- Calming vs. energizing
- Compassionate vs. empowering
- Friend-like vs. coach-like
- Grounding vs. uplifting
- Soft reassurance vs. confident push

Return ONLY valid JSON:
{
  "initialChips": [8 complete tone description sentences],
  "expandedChips": [15 more complete tone description sentences]
}`,
    },
  },
  // FO-10 Affirmation Agent
  {
    key: 'versions.fo-10-affirmation._info.default',
    value: {
      name: 'Default',
      text: `FO-10 Affirmation Generation Agent

Creates deeply meaningful, psychologically effective affirmations based on the user's fixed-question discovery conversation (steps 4-7).

Same guidelines as FO-09 affirmation agent, but using gpt-4o model.`,
      author: 'System',
      createdAt: '2026-02-09',
    },
  },
  {
    key: 'versions.fo-10-affirmation._model_name.default',
    value: {
      text: 'openai/gpt-4o',
    },
  },
];
