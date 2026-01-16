# Chat Survey Flow - User Journey

This document describes the user experience flow of the Chat Survey feature, from start to finish.

---

## Overview

The Chat Survey is a two-phase experience that creates personalized affirmations for users. Instead of asking users to fill out forms or select from predefined options, it uses a conversational approach to understand what the user needs, then generates affirmations tailored to their situation.

---

## Phase 1: Discovery Chat

### Purpose
Understand the user through natural conversation before generating affirmations.

### How It Works

1. **Opening Question**
   - The AI assistant starts with an open-ended question to understand what brings the user here
   - Example: "What's on your mind today?" or "What would you like affirmations to help with?"

2. **Conversational Discovery**
   - The assistant asks follow-up questions based on the user's responses
   - Questions explore themes like:
     - What challenges or feelings the user is experiencing
     - What tone resonates with them (gentle, empowering, direct)
     - Any specific areas of life they want to focus on
   - Suggested quick responses are offered, but users can type freely

3. **Building Understanding**
   - Through the conversation, the system builds a profile capturing:
     - **Themes**: What topics matter (e.g., "career clarity", "self-worth", "relationships")
     - **Challenges**: What the user is struggling with
     - **Tone preference**: How they want affirmations to sound
     - **Insights**: Specific details that will make affirmations feel personal

4. **Completion**
   - After gathering enough context (typically 3-5 exchanges), the discovery phase ends
   - The conversation summary feeds into affirmation generation

### User Can Skip
- A "Skip to affirmations" option is available for users who want to jump straight to swiping
- Skipping uses generic affirmations since there's no profile to personalize from

---

## Phase 2: Swipe Selection

### Purpose
Let users curate their personal collection by approving or skipping generated affirmations.

### How It Works

1. **Affirmation Generation**
   - Each affirmation is generated one at a time
   - Generation uses the profile from Phase 1 to create personalized content
   - The system learns from what users approve and skip

2. **Swipe Interface**
   - One affirmation is displayed at a time on a card
   - **Swipe Right (or tap right button)**: Save this affirmation
   - **Swipe Left (or tap left button)**: Skip this one

3. **Adaptive Generation**
   - As users swipe, the AI notices patterns:
     - Which affirmations get approved
     - Which get skipped
   - Future affirmations are influenced by this feedback
   - Example: If a user skips all "I am powerful" style affirmations but approves gentler ones, the system adjusts

4. **Progress Tracking**
   - A counter shows how many affirmations have been saved
   - The current affirmation number is displayed

5. **Goal: Collect 10 Affirmations**
   - The phase continues until the user has approved 10 affirmations
   - There's no limit on how many can be skipped

---

## Phase 3: Completion

### What Happens

1. **Success Screen**
   - Once 10 affirmations are approved, a completion screen appears
   - Shows a congratulatory message

2. **Affirmation List**
   - All 10 saved affirmations are displayed in a scrollable list
   - Users can review their personalized collection

3. **Start Over**
   - A "Start Over" button allows users to begin a fresh session
   - This clears all state and returns to the discovery chat

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         START                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DISCOVERY CHAT                      │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   AI asks    │───▶│  User types  │───▶│  AI follows  │──┐   │
│  │   question   │    │   response   │    │     up       │  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘  │   │
│         ▲                                                   │   │
│         └───────────────────────────────────────────────────┘   │
│                              │                                  │
│                    (after 3-5 exchanges)                        │
│                              │                                  │
│                   ┌──────────▼──────────┐                       │
│                   │   Profile Built:    │                       │
│                   │   - Themes          │                       │
│                   │   - Challenges      │                       │
│                   │   - Tone            │                       │
│                   │   - Insights        │                       │
│                   └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 2: SWIPE SELECTION                     │
│                                                                 │
│         ┌─────────────────────────────────────────┐             │
│         │        Generated Affirmation            │             │
│         │                                         │             │
│         │   "I gently trust my next steps..."    │             │
│         │                                         │             │
│         └─────────────────────────────────────────┘             │
│                           │                                     │
│              ┌────────────┴────────────┐                        │
│              │                         │                        │
│        ┌─────▼─────┐             ┌─────▼─────┐                  │
│        │   SKIP    │             │   SAVE    │                  │
│        │  (left)   │             │  (right)  │                  │
│        └───────────┘             └───────────┘                  │
│              │                         │                        │
│              │                         ▼                        │
│              │                   savedCount++                   │
│              │                         │                        │
│              └────────────┬────────────┘                        │
│                           │                                     │
│                           ▼                                     │
│                  Generate next affirmation                      │
│                  (influenced by feedback)                       │
│                           │                                     │
│                           │                                     │
│              ┌────────────┴────────────┐                        │
│              │   savedCount < 10?      │                        │
│              └────────────┬────────────┘                        │
│                     yes   │   no                                │
│                     ┌─────┴─────┐                               │
│                     │           │                               │
│                     ▼           ▼                               │
│               (continue)    (complete)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: COMPLETION                          │
│                                                                 │
│              ┌────────────────────────────┐                     │
│              │    Your Affirmations       │                     │
│              │        Are Ready!          │                     │
│              │                            │                     │
│              │  • Affirmation 1           │                     │
│              │  • Affirmation 2           │                     │
│              │  • ...                     │                     │
│              │  • Affirmation 10          │                     │
│              │                            │                     │
│              │     [ Start Over ]         │                     │
│              └────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### Why Conversation First?
- Traditional affirmation apps offer generic lists
- A conversation surfaces what the user actually needs
- Personalization makes affirmations more meaningful

### Why One Affirmation at a Time?
- Reduces overwhelm
- Creates a focused, intentional selection process
- Allows the AI to learn and adapt in real-time

### Why 10 Affirmations?
- Small enough to feel achievable
- Large enough to be useful for daily practice
- Can be adjusted in configuration

### Why Allow Unlimited Skips?
- No pressure to accept something that doesn't resonate
- User maintains full control over their collection
- The AI learns from skips to improve future suggestions

---

## Session Persistence

- Sessions are stored so users can return where they left off
- If a user closes the browser during discovery, they resume the chat
- If a user closes during swiping, they see the next affirmation when they return
- The "Start Over" button clears all session data for a fresh start
