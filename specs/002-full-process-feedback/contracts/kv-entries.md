# KV Store Contract: FP-02 Configuration Entries

**Namespace**: `versions.fp-02`

## Required Entries

### 1. Agent Info

**Key**: `versions.fp-02._info.default`

```json
{
  "name": "Default",
  "text": "Full Process 2 - Feedback-aware affirmation generator that learns from user approval patterns to generate better-aligned affirmations over multiple batches.",
  "author": "System",
  "createdAt": "2025-12-12"
}
```

### 2. Model Name

**Key**: `versions.fp-02._model_name.default`

```json
{
  "text": "openai/gpt-4o"
}
```

### 3. Temperature

**Key**: `versions.fp-02._temperature.default`

```json
{
  "text": "0.95"
}
```

### 4. System Prompt

**Key**: `versions.fp-02.system.default`

```json
{
  "text": "[Full system prompt - see System Prompt section below]"
}
```

### 5. User Prompt Template

**Key**: `versions.fp-02.prompt.default`

```json
{
  "text": "[Liquid template - see Prompt Template section below]"
}
```

## System Prompt Content

The system prompt includes all FP-01 affirmation guidelines PLUS a new "Feedback Analysis" section:

```
You are an expert affirmation coach who creates deeply meaningful, psychologically effective affirmations. Your affirmations are crafted with care and intention.

## Your Task
When the user provides their preferences (focus area, challenges, tone), generate exactly 8 unique affirmations tailored to their needs.

## Learning from Feedback

You may receive two lists of previous affirmations:
1. **Approved Affirmations**: Affirmations the user liked and saved
2. **Skipped Affirmations**: Affirmations the user passed on

When feedback is provided, analyze it carefully:

### What to Learn from Approved Affirmations
- Notice the length (short vs. detailed)
- Notice the tone (gentle vs. assertive)
- Notice the structure (simple "I am" vs. growth-oriented "I am learning")
- Notice themes that resonate
- Generate MORE affirmations with these characteristics

### What to Learn from Skipped Affirmations
- Identify patterns in what was rejected
- Avoid similar phrasing, length, or tone
- If the user skips assertive statements, lean toward gentler ones
- If the user skips long affirmations, keep them shorter

### Balancing Feedback
- Prioritize approved patterns over avoiding skipped patterns
- When in doubt, match the style of approved affirmations
- Still maintain variety - don't just repeat approved structures

[... rest of standard affirmation guidelines from FP-01 ...]

## Output Format
Return exactly 8 affirmations as a JSON array of strings:
["Affirmation 1", "Affirmation 2", ...]

Do not include numbering, explanations, or any other text - just the JSON array.
```

## Prompt Template Content

Liquid template with feedback sections:

```liquid
Please generate 8 personalized affirmations for me.

## My Preferences
- **Focus Area**: {{ focus }}
- **Challenges I Face**: {% if challenges and challenges != "" %}{{ challenges }}{% else %}general life challenges{% endif %}
- **Tone I Prefer**: {{ tone }}
{% if feedback %}

## Additional Context
{{ feedback }}
{% endif %}
{% if approvedAffirmations and approvedAffirmations.size > 0 %}

## Affirmations I Liked (Generate MORE Like These)
These resonated with me - please create similar ones:
{% for affirmation in approvedAffirmations %}- {{ affirmation }}
{% endfor %}
{% endif %}
{% if skippedAffirmations and skippedAffirmations.size > 0 %}

## Affirmations I Skipped (Avoid These Styles)
These didn't resonate - please avoid similar approaches:
{% for affirmation in skippedAffirmations %}- {{ affirmation }}
{% endfor %}
{% endif %}
{% if previousAffirmations and previousAffirmations.size > 0 %}

## Already Seen (Do Not Repeat)
I have already seen these affirmations. Please generate COMPLETELY DIFFERENT ones:
{% for affirmation in previousAffirmations %}- {{ affirmation }}
{% endfor %}
{% endif %}
```

## Key Format Compliance

All keys follow the constitution-mandated format:
- `{namespace}.{version}.{keyName}.{implementation}`
- Example: `versions.fp-02.system.default`

## Extensibility

Additional implementations can be added:
- `versions.fp-02.system.experimental`
- `versions.fp-02.prompt.concise`
- etc.
