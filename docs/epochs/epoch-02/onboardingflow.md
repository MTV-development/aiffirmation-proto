# Aiffirmation Onboarding Flow

> **Note:** Screens without detailed comments are exactly as in version **FO-12 / implementation TZ-V3-2502**. If there are changes, they are described in this document.
>
> **Confetti** should be removed from the app as we do not have any design for it.
>
> If there are screens in FO-12 that are not mentioned in this flow, they should be **left out**.

---

## Flow Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Screen 1  │───▶│   Screen 2  │───▶│   Screen 3  │───▶│   Screen 4  │
│   Welcome   │    │    Name     │    │Aff-Familiarity│   │    Goal     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
                                                        ╔═════════════╗
                                                        ║ ⏳ Thinking A║
                                                        ╚═════════════╝
                                                                │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│   Screen 5  │─────────────────────────────────────────▶║ ⏳ Thinking B║
│What's Going │                                          ╚═════════════╝
│     On      │                                                 │
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│   Screen 6  │─────────────────────────────────────────▶║ ⏳ Thinking C║
│    Tone     │                                          ╚═════════════╝
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐    ┌─────────────┐                        ╔═════════════╗
│   Screen 7  │───▶│ Screen 8.1  │───────────────────────▶║ ⏳ Thinking D║
│  0-20-aff-  │    │     1-5     │                        ╚═════════════╝
│    ready    │    │             │                               │
└─────────────┘    └─────────────┘                               │
       ┌─────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│ Screen 8.2  │─────────────────────────────────────────▶║ ⏳ Thinking E║
│     6-10    │                                          ╚═════════════╝
│             │                                                 │
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│ Screen 8.3  │─────────────────────────────────────────▶║ ⏳ Thinking F║
│    11-15    │                                          ╚═════════════╝
│             │                                                 │
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│ Screen 8.4  │─────────────────────────────────────────▶║ ⏳ Thinking G║
│    16-20    │                                          ╚═════════════╝
│             │                                                 │
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐    ┌─────────────┐                        ╔═════════════╗
│   Screen 9  │───▶│  Screen 10  │───────────────────────▶║ ⏳ Thinking H║
│ Create-List │    │   21-40     │                        ╚═════════════╝
│             │    │ Affirmations│                               │
└─────────────┘    └─────────────┘                               │
       ┌─────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Screen 11  │───▶│  Screen 12  │───▶│  Screen 13  │───▶│  Screen 14  │
│    Theme    │    │Notifications│    │   Premium   │    │    Feed     │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Legend
```
┌─────────────┐
│   Screen    │  = Regular screen (user interaction)
└─────────────┘

╔═════════════╗
║ ⏳ Thinking  ║  = Thinking/Loading transition (auto-advances)
╚═════════════╝
```

---

## Screen Details

### Screen 1: Welcome
*Same as FO-12*

---

### Screen 2: Name
*Same as FO-12*

---

### Screen 3: Aff-Familiarity
*Same as FO-12*

---

### Screen 4: Goal
*Same as FO-12*

---

### Screen 5: What's Going On
*Same as FO-12*

---

### Screen 6: Tone
*Same as FO-12*

---

### Screen 7: 0-20-aff-ready
**Headline:** Your personal affirmations are beginning to form, {firstName}!

**Text:** You'll now explore a set of affirmations. Select what feels true to shape what supports you right now.

**Button:** [Continue]

---

### Screen 8.1: 1-5
**Counter:** 1 of 20 / 2 of 20 / 3 of 20 / 4 of 20 / 5 of 20

**Headline:** Does this affirmation resonate with you?

**Content:** "{affirmation text}"

**Actions:** ✗ Discard | ♡ Love it

---

### Screen 8.2: 6-10
**Counter:** 6 of 20 / 7 of 20 / 8 of 20 / 9 of 20 / 10 of 20

**Headline:** Does this affirmation resonate with you?

**Content:** "{affirmation text}"

**Actions:** ✗ Discard | ♡ Love it

---

### Screen 8.3: 11-15
**Counter:** 11 of 20 / 12 of 20 / 13 of 20 / 14 of 20 / 15 of 20

**Headline:** Does this affirmation resonate with you?

**Content:** "{affirmation text}"

**Actions:** ✗ Discard | ♡ Love it

---

### Screen 8.4: 16-20
**Counter:** 16 of 20 / 17 of 20 / 18 of 20 / 19 of 20 / 20 of 20

**Headline:** Does this affirmation resonate with you?

**Content:** "{affirmation text}"

**Actions:** ✗ Discard | ♡ Love it

---

### Screen 9: Create-List
**Headline:** You've already built something personal, {firstName}.

**Text:** Your personal feed is now updated with the affirmations you love. Add more to create a richer and more varied daily feed.

**Button:** [Continue]

**Link:** Add more later

---

### Screen 10: 21-40 Affirmations
**Counter:** 21 of 40 / 22 of 40 / ... / 40 of 40

**Headline:** Does this affirmation resonate with you?

**Content:** "{affirmation text}"

**Actions:** ✗ Discard | ♡ Love it

---

### Screen 11: Theme
*Same as FO-12*

---

### Screen 12: Notifications
*Same as FO-12*

---

### Screen 13: Premium
*Same as FO-12*

---

### Screen 14: Feed
**Change:** "Welcome to SELF" → "Welcome to your personal affirmation feed"


---

## ⏳ Thinking Screen Details

> **Note:** All thinking screens display the **pulsing heart** visual.
>
> When messages are numbered, they should **pulse in sequence** (sentence 1 appears first, then is replaced by sentence 2, and so forth).

---

### Thinking A: After Goal (between Screen 4 → Screen 5)
**Messages:**
1. "Thank you for sharing, {firstName}…"
2. "Shaping affirmations to align with you…"

---

### Thinking B: After What's Going On (between Screen 5 → Screen 6)
**Messages:**
1. "Learning…"
2. "Your affirmations are taking shape…"

*System is analyzing user responses*

---

### Thinking C: After Tone (between Screen 6 → Screen 7)
**Messages:**
1. "Thank you for sharing, {firstName}…"
2. "Creating affirmations that feel true…"

*System is analyzing user responses*

---

### Thinking D: After 1-5 (between Screen 8.1 → Screen 8.2)
**Messages:**
1. "Noticing what resonates…"
2. "Your next affirmations are taking shape…"

*System is analyzing user responses*

---

### Thinking E: After 6-10 (between Screen 8.2 → Screen 8.3)
**Messages:**
1. "Refining your affirmations further…"

*System is analyzing user responses*

---

### Thinking F: After 11-15 (between Screen 8.3 → Screen 8.4)
**Messages:**
1. "Polishing the final details…"

*System is analyzing user responses*

---

### Thinking G: After 16-20 (between Screen 8.4 → Screen 9: Create-List)
**Messages:**
1. "Saving your preferences…"
2. "Saving the affirmations you love…"
3. "Creating your personal feed…"

*System is analyzing user responses*

---

### Thinking H: After 21-40 Affirmations (between Screen 10 → Screen 11)
**Messages:**
1. "Beautiful, {firstName}."
2. "Bringing your personal set together…"

*System is analyzing user responses*

---

## Linear Flow (Quick Reference)

```
┌─────────────────────────────────────────────────┐
│  1. Welcome                                     │
├─────────────────────────────────────────────────┤
│  Welcome! Let's get to know you so we can       │
│  create your personal affirmations.             │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  2. Name                                        │
├─────────────────────────────────────────────────┤
│  What's your name?                              │
│                                                 │
│  [___________________________]                  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  3. Aff-Familiarity                             │
├─────────────────────────────────────────────────┤
│  Have you used affirmations before?             │
│                                                 │
│  ○ I'm new                                      │
│  ○ Tried a few                                  │
│  ○ Use regularly                                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  4. Goal                                        │
├─────────────────────────────────────────────────┤
│  What's your main goal with affirmations        │
│  today, {firstName}?                            │
│                                                 │
│  [___________________________]                  │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking A                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Thank you for sharing, {firstName}…"       ║
║  2. "Shaping affirmations to align with you…"   ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  5. What's Going On                             │
├─────────────────────────────────────────────────┤
│  What's been happening in your life recently    │
│  that makes self-love feel important to you     │
│  right now?                                     │
│                                                 │
│  [___________________________]                  │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking B                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Learning…"                                 ║
║  2. "Your affirmations are taking shape…"       ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  6. Tone                                        │
├─────────────────────────────────────────────────┤
│  {firstName}, if you had a supportive voice to  │
│  uplift you during your days at home, how would │
│  you want it to feel?                           │
│                                                 │
│  [___________________________]                  │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking C                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Thank you for sharing, {firstName}…"       ║
║  2. "Creating affirmations that feel true…"     ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  7. 0-20-aff-ready                              │
├─────────────────────────────────────────────────┤
│  Your personal affirmations are beginning to    │
│  form, {firstName}!                                   │
│                                                 │
│  You'll now explore a set of affirmations.      │
│  Select what feels true to shape what supports  │
│  you right now.                                  │
│                                                 │
│  [        Continue        ]                     │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  8.1. 1-5                                       │
├─────────────────────────────────────────────────┤
│  1 of 20  /  2 of 20  /  3 of 20  /  etc.       │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking D                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Noticing what resonates…"                  ║
║  2. "Your next affirmations are taking shape…"  ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  8.2. 6-10                                      │
├─────────────────────────────────────────────────┤
│  6 of 20  /  7 of 20  /  8 of 20  /  etc.       │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking E                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Refining your affirmations further…"       ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  8.3. 11-15                                     │
├─────────────────────────────────────────────────┤
│  11 of 20  /  12 of 20  /  13 of 20  /  etc.    │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking F                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Polishing the final details…"              ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  8.4. 16-20                                     │
├─────────────────────────────────────────────────┤
│  16 of 20  /  17 of 20  /  18 of 20  /  etc.    │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking G                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Saving your preferences…"                  ║
║  2. "Saving the affirmations you love…"         ║
║  3. "Creating your personal feed…"              ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  9. Create-List                                 │
├─────────────────────────────────────────────────┤
│  You've already built something personal,       │
│  {firstName}.                                   │
│                                                 │
│  Your personal feed is now updated with the     │
│  affirmations you love.                         │
│  Add more to create a richer and more varied    │
│  daily feed.                                    │
│                                                 │
│  [        Continue        ]                     │
│                                                 │
│          Add more later                         │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  10. 21-40 Affirmations                         │
├─────────────────────────────────────────────────┤
│  21 of 40  /  22 of 40  /  ...  /  40 of 40     │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking H                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Beautiful, {firstName}."                   ║
║  2. "Bringing your personal set together…"      ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  11. Theme                                      │
├─────────────────────────────────────────────────┤
│  Choose your background.                        │
│                                                 │
│  This is the space your affirmations will live  │
│  in. You can change it anytime.                 │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  12. Notifications                              │
├─────────────────────────────────────────────────┤
│  *Same as FO-12*                                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  13. Premium                                    │
├─────────────────────────────────────────────────┤
│  *Same as FO-12*                                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  14. Feed                                       │
├─────────────────────────────────────────────────┤
│  "Welcome to SELF" → "Welcome to your personal  │
│  affirmation feed"                              │
│                                                 │
│  (Design same as FO-12)                         │
└─────────────────────────────────────────────────┘
```
