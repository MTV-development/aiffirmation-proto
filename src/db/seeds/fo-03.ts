import type { SeedEntry } from './types';

export const fo03Seeds: SeedEntry[] = [
  {
    key: 'versions.fo-03._info.default',
    value: {
      name: 'Default',
      text: `FO-03: Full Onboarding with Multi-Step Context Collection

A gradual, multi-question onboarding flow that collects richer context through:
- Familiarity level with affirmations
- Topics of interest (multi-select)
- Current situation (chips + free text)
- Current feelings (chips + free text)
- What helps them feel good (chips + free text)

Generates affirmations in batches of 10 with iterative feedback learning.`,
      author: 'System',
      createdAt: '2026-01-23',
    },
  },
  {
    key: 'versions.fo-03._model_name.default',
    value: {
      text: 'openai/gpt-4o-mini',
    },
  },
  {
    key: 'versions.fo-03._temperature.default',
    value: {
      text: '0.9',
    },
  },
  {
    key: 'versions.fo-03.prompt_initial.default',
    value: {
      text: `Generate 10 personalized affirmations for {{ name }}.

## About {{ name }}

**Experience with affirmations:** {{ familiarity }}
{% if familiarity == 'new' %}(Keep affirmations simple and accessible){% endif %}
{% if familiarity == 'some' %}(Can use more varied structures){% endif %}
{% if familiarity == 'very' %}(Can include more nuanced, growth-oriented statements){% endif %}

{% if topics and topics.size > 0 %}
**Topics they want help with:** {{ topics | join: ", " }}
{% endif %}

{% if situation_chips.size > 0 or situation_text != "" %}
**What's going on in their life:**
{% if situation_chips.size > 0 %}- Selected: {{ situation_chips | join: ", " }}{% endif %}
{% if situation_text != "" %}- In their words: "{{ situation_text }}"{% endif %}
{% endif %}

{% if feelings_chips.size > 0 or feelings_text != "" %}
**How they're feeling:**
{% if feelings_chips.size > 0 %}- Selected: {{ feelings_chips | join: ", " }}{% endif %}
{% if feelings_text != "" %}- In their words: "{{ feelings_text }}"{% endif %}
{% endif %}

{% if whatHelps_chips.size > 0 or whatHelps_text != "" %}
**What normally makes them feel good:**
{% if whatHelps_chips.size > 0 %}- Selected: {{ whatHelps_chips | join: ", " }}{% endif %}
{% if whatHelps_text != "" %}- In their words: "{{ whatHelps_text }}"{% endif %}
{% endif %}

Create affirmations that speak directly to {{ name }}'s situation, feelings, and what helps them.`,
    },
  },
  {
    key: 'versions.fo-03.prompt_with_feedback.default',
    value: {
      text: `Generate 10 personalized affirmations for {{ name }}.

## About {{ name }}

**Experience with affirmations:** {{ familiarity }}
{% if familiarity == 'new' %}(Keep affirmations simple and accessible){% endif %}
{% if familiarity == 'some' %}(Can use more varied structures){% endif %}
{% if familiarity == 'very' %}(Can include more nuanced, growth-oriented statements){% endif %}

{% if topics and topics.size > 0 %}
**Topics they want help with:** {{ topics | join: ", " }}
{% endif %}

{% if situation_chips.size > 0 or situation_text != "" %}
**What's going on in their life:**
{% if situation_chips.size > 0 %}- Selected: {{ situation_chips | join: ", " }}{% endif %}
{% if situation_text != "" %}- In their words: "{{ situation_text }}"{% endif %}
{% endif %}

{% if feelings_chips.size > 0 or feelings_text != "" %}
**How they're feeling:**
{% if feelings_chips.size > 0 %}- Selected: {{ feelings_chips | join: ", " }}{% endif %}
{% if feelings_text != "" %}- In their words: "{{ feelings_text }}"{% endif %}
{% endif %}

{% if whatHelps_chips.size > 0 or whatHelps_text != "" %}
**What normally makes them feel good:**
{% if whatHelps_chips.size > 0 %}- Selected: {{ whatHelps_chips | join: ", " }}{% endif %}
{% if whatHelps_text != "" %}- In their words: "{{ whatHelps_text }}"{% endif %}
{% endif %}

{% if approvedAffirmations.size > 0 %}
## Style to Match (user approved these - match the style but NOT the content)

The user liked these affirmations. Analyze their characteristics:
- Length (short vs. detailed)
- Tone (gentle vs. assertive)
- Structure (simple "I am" vs. growth-oriented "I am learning")
- Themes that resonate

Generate MORE affirmations with similar characteristics.

{% for aff in approvedAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

{% if skippedAffirmations.size > 0 %}
## Patterns to Avoid (user skipped these)

The user passed on these affirmations. Identify patterns to avoid:
- Similar phrasing, length, or tone
- Themes that didn't resonate

{% for aff in skippedAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

{% if allPreviousAffirmations.size > 0 %}
## Do Not Repeat

CRITICAL: Do not generate any of these existing affirmations or close variations:

{% for aff in allPreviousAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

Create affirmations that speak directly to {{ name }}'s situation, feelings, and what helps them.`,
    },
  },
];
