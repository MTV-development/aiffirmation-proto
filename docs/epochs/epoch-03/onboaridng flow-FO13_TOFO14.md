# Aiffirmation Onboarding Flow FO14

> **Note:** FO-13 is really good - we keep most of it - only changing af few things which is listed below (I have only listed changes).
> **Confetti** should be removed from the app as we do not have any design for it - I keep it here as it is still in FO-13.


---



## Change 1: Changes in the online Flow

Online flow is perfect - only we need to devide screen 10 into more screens with thinking screens in between. See the flow below.
Use texts on thinking screen from "## Linear Flow (Quick Reference)" further down.

┌─────────────┐    ┌─────────────┐                        ╔═════════════╗
│   Screen 9  │───▶│ Screen 10.1 │───────────────────────▶║ ⏳ Thinking H║
│ Create-List │    │   1-8      │                        ╚═════════════╝
│             │    │ Affirmations│                               │
└─────────────┘    └─────────────┘                               │
       ┌─────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│ Screen 10.2  │─────────────────────────────────────────▶║ ⏳ Thinking I║
│     8-16    │                                          ╚═════════════╝
│             │                                                 │
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐                                          ╔═════════════╗
│ Screen 10.3  │─────────────────────────────────────────▶║ ⏳ Thinking J║
│   16-20   │                                          ╚═════════════╝
│             │                                                 │
└─────────────┘                                                 │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐    
│  Screen 11  │───▶...
│    Theme    │ 
│             │ 
└─────────────┘ 

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

## Change 2: Changes in Screens 8.1-8.4:

**Counter must count number of affirmations shown (instead of selected affirmations):** 1 of 20 / 2 of 20 / 3 of 20 / 4 of 20 / 5 of 20 etc.
**Insert Headline in all screens:** Does this affirmation resonate with you?

---




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
│  form, {firstName}!                             │
│                                                 │
│  Next, choose the affirmations that feel most   │
│  supportive right now.                          │
│                                                 │
│  [        Begin        ]                        │
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
║  1. "Refining your affirmations …"       ║
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
║  1. "Polishing the details…"              ║
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
│  To create a richer experience you can add a    │ 
│  few more.                                      │
│                                                 │
│  [        Add more        ]                     │
│                                                 │
│          Add more later                         │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  10.1 1-8 Affirmations                         │
├─────────────────────────────────────────────────┤
│  1 of 20  /  2 of 20  /  ...  /  8 of 20     │
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
║  1. "Saving your choices..."   ║
║  2. "Bringing your next affirmations together…"   ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  10.2 9-16 Affirmations                         │
├─────────────────────────────────────────────────┤
│  9 of 20  /  10 of 20  /  ...  /  16 of 20     │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                          ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking I                                  ║
╠═════════════════════════════════════════════════╣
║  1. "Saving what felt right"                     ║
║  2. "Gently shaping last 4 affirmation for now…" ║
╚═════════════════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────┐
│  10.3 16-20 Affirmations                         │
├─────────────────────────────────────────────────┤
│  16 of 20  /  17 of 20  /  ...  /  20 of 20     │
│                                                 │
│  Does this affirmation resonate with you?       │
│                                                 │
│  "{affirmation text}"                           │
│                                                 │
│  ✗ Discard          ♡ Love it                   │
└─────────────────────────────────────────────────┘
                        ↓
╔═════════════════════════════════════════════════╗
║  ⏳ Thinking J                                   ║
╠═════════════════════════════════════════════════╣
║  1. "Bringing your personal set together…"      ║
║  2. "Updating your personal feed..."      ║
║  2. "Getting your personalized experience ready for you…" ║
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
│  affirmation feed"   swipe→ Your personal       │
│  affirmations will swipe up here for you        │
│                                                 │
│  (Design same as FO-12)                         │
└─────────────────────────────────────────────────┘
```
