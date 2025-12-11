# Affirmation App Onboarding: Complete UX Flow Documentation

## Overview
This document describes the complete user experience and process flow of the Affirmation App Onboarding system. It details what the system actually does at each step, the data structures involved, and how user interactions trigger state changes and API calls.

---

## System Architecture

### High-Level Flow
\`\`\`
Discovery Phase → Affirmation Review Loop → Mid-Journey Check-In → Collection Summary
\`\`\`

### State Management
The application uses React client-side state management with the following key data structures:

#### Main App State (app/page.tsx)
- `step` (OnboardingStep): "discovery" | "review" | "summary"
- `preferences` (UserPreferences): User's selected focus area, timing, challenges, and tone
- `collectedAffirmations` (string[]): Array of affirmations the user has liked

#### UserPreferences Interface
\`\`\`
{
  focus: string                // User's primary focus area (card selection or custom text)
  timing: string[]             // Array of selected timing options (Morning, Evening, All-Day, or custom)
  challenges: string[]         // Array of selected challenges or custom text
  tone: string                 // Selected tone preference or custom description
}
\`\`\`

---

## Phase 1: Discovery (Onboarding Discovery Component)

### Purpose
Gather 4 specific pieces of information about the user through a guided, step-by-step wizard that allows both preset options and custom text input.

### UI Structure
- **Progress Bar**: Shows current step (e.g., "1 of 4")
- **Step Navigation**: Multi-step form with "Back" and "Next" buttons
- **Step Completion Check**: Cannot proceed to next step until current step is answered

### The Four Steps

#### Step 1: Primary Focus
**Question**: "What's your primary focus?"

**Input Options**:
- **Preset Cards** (6 options): Career Growth, Relationships, Health & Wellness, Confidence, Creativity, Self-Worth
  - Layout: 2-column grid
  - Interaction: Click to select (shows ring-2 border + background highlight)
  - Only one can be selected at a time
- **Custom Text Field**: "Or tell us something else..."
  - Placeholder: "e.g., Building creative habits, Finding my voice"
  - Behavior: Selecting a card clears custom text; typing custom text clears card selection

**Data Stored**: `preferences.focus`

#### Step 2: Timing
**Question**: "When do you need them most?"

**Input Options**:
- **Preset Buttons** (3 options, multi-select): Morning, Evening, All-Day
  - Layout: 3-column grid
  - Interaction: Click to toggle on/off (shows ring-2 border when selected)
  - Multiple selections allowed
- **Custom Text Field**: "Other time or frequency..."
  - Placeholder: "e.g., Right before meetings, When I'm feeling anxious"
  - Behavior: Custom timing can be added independently; does not clear preset selections

**Data Stored**: `preferences.timing` (array of strings)

#### Step 3: Challenges
**Question**: "Any specific challenges?"

**Input Options**:
- **Preset Badges** (6 options, multi-select): Anxiety, Self-Doubt, Imposter Syndrome, Procrastination, Perfectionism, Burnout
  - Layout: Flex wrap
  - Interaction: Click to toggle on/off (shows filled badge when selected, outline when unselected)
  - Multiple selections allowed
- **Custom Text Field**: "Describe your own challenge..."
  - Placeholder: "e.g., Recovering from failure, Need courage to speak up"
  - Behavior: Custom challenge can be added independently; does not clear preset selections

**Data Stored**: `preferences.challenges` (array of strings)

#### Step 4: Tone
**Question**: "What tone resonates with you?"

**Input Options**:
- **Preset Cards** (4 options): Gentle & Compassionate, Powerful & Commanding, Practical & Grounded, Spiritual & Reflective
  - Layout: 2-column grid
  - Interaction: Click to select (shows ring-2 border + background highlight)
  - Only one can be selected at a time
- **Custom Text Field**: "Describe the tone you want..."
  - Placeholder: "e.g., Like my mentor would say it, Uplifting but realistic"
  - Behavior: Selecting a card clears custom text; typing custom text clears card selection

**Data Stored**: `preferences.tone`

### Completion Logic
**Proceed Button Logic**:
- Step 1: Enabled if `focus` OR `customFocus` has value
- Step 2: Enabled if `timing` array length > 0 OR `customTiming` has value
- Step 3: Enabled if `challenges` array length > 0 OR `customChallenge` has value
- Step 4: Enabled if `tone` OR `customTone` has value

**On "Find Affirmations" Click**:
1. Assembles final preferences object:
   - `focus`: uses card selection if set, otherwise customFocus value
   - `timing`: uses preset selections if non-empty, otherwise wraps customTiming in array
   - `challenges`: uses preset selections if non-empty, otherwise wraps customChallenge in array (empty if neither)
   - `tone`: uses card selection if set, otherwise customTone value
2. Calls `handleDiscoveryComplete(preferences)`
3. App state updates: `step = "review"` and `preferences` is stored
4. UI transitions to AffirmationReview component

---

## Phase 2: Affirmation Review (Review Loop)

### Purpose
Display generated affirmations one at a time for the user to like or skip, building a collection of affirmations they resonate with. This phase can loop multiple times with different batches of affirmations.

### Initial Load Behavior
When AffirmationReview mounts:
1. State initializes: `affirmations = []`, `likedAffirmations = []`, `currentIndex = 0`, `loading = true`
2. `generateAffirmations(preferences)` is called

### generateAffirmations Function

**Input**: User preferences object

**API Call**:
\`\`\`
POST /api/generate-affirmations
Headers: Content-Type: application/json
Body: { focus, timing, challenges, tone }
\`\`\`

**Expected Response**:
\`\`\`json
{
  "affirmations": ["affirmation text 1", "affirmation text 2", ...]
}
\`\`\`

**Handling Success**:
- If response contains `affirmations` array with length > 0: Sets `affirmations` state
- If response is empty or missing array: Falls back to placeholder affirmations

**Handling Error**:
- On fetch error: Catches error, logs it, and uses placeholder affirmations
- Placeholder Generation: Creates 8 generic but contextual affirmations using user's focus area and challenges

**Example Placeholders**:
- `"I am worthy of success in {focus}."`
- `"{challenges} are opportunities for my growth."`
- `"I am resilient and capable of overcoming obstacles."`
- `"Every day brings new possibilities for {focus}."`

**State Updates After Generation**:
- `affirmations`: populated with response or placeholders
- `currentIndex`: reset to 0
- `loading`: set to false
- `affirmationsExhausted`: set to false

### Affirmation Display UI

**Layout**:
- Title: "What resonates with you?"
- Subtitle: "Collect affirmations that feel true to you"
- Progress Bar: Shows "X of Y" (currentIndex + 1 of total affirmations)
- Large Card: Displays current affirmation in 2xl, semibold text, centered
- Counter: Shows "Liked: {likedAffirmations.length}"

**Current Affirmation**: `affirmations[currentIndex]`

### User Interactions

#### Heart Button ("Love This")
**Trigger**: User clicks heart button

**Behavior**:
1. Adds current affirmation to `likedAffirmations` array
2. Calls `moveToNext()`

**Result**: Affirmation is collected

#### X Button ("Skip")
**Trigger**: User clicks skip button

**Behavior**:
1. Does NOT add current affirmation to `likedAffirmations`
2. Calls `moveToNext()`

**Result**: Affirmation is discarded

#### Finish Early Button
**Trigger**: User clicks "Finish Early" (visible when likedAffirmations.length > 0)

**Behavior**:
1. Calls `handleCollectionComplete(likedAffirmations)`
2. App transitions to summary phase

---

### moveToNext() Logic

**Execution**:
1. Checks if `currentIndex < affirmations.length - 1`

**If MORE affirmations remain**:
1. Increments `currentIndex` to next position
2. **Check-in Trigger Logic**:
   - Calculates `totalLiked` = `likedAffirmations.length + 1`
   - If `totalLiked === 5` OR `totalLiked === 10` OR `(totalLiked > 10 AND (totalLiked - 10) % 5 === 0)`:
     - Sets `showCheckIn = true`
     - Component renders MidJourneyCheckIn instead of affirmation cards
   - Otherwise: Continues displaying next affirmation

**If NO more affirmations in current batch**:
1. Sets `affirmationsExhausted = true`
2. Checks if `likedAffirmations.length >= 5`
3. If yes: Sets `showCheckIn = true` (triggers mid-journey check-in)
4. If no: Stays on last affirmation (user cannot proceed without liking at least 5)

**Check-in Frequency**:
- After liking 5 affirmations
- After liking 10 affirmations
- After liking 15 affirmations
- After liking 20 affirmations
- And so on, every 5 after 10

---

## Phase 3: Mid-Journey Check-In

### Purpose
At predetermined milestones (5, 10, 15+ affirmations liked), pause the collection process to:
1. Show the user what they've collected so far
2. Confirm they're heading in the right direction
3. Allow calibration of preferences without losing progress

### Trigger Conditions
Auto-triggers when:
- User likes 5th affirmation
- User likes 10th affirmation
- Affirmations in current batch are exhausted (after liking at least 5)
- Every 5 likes after the 10th

### Check-In Screen Display

**Header**:
- Large number display: Shows `likedCount`
- Title: "Mid-Journey Check-In"

**Summary Message**:
\`\`\`
"You've connected with {likedCount} affirmations so far. Looking at what you've 
liked, I notice you've been drawn to affirmations about {focus}."
\`\`\`

**Liked Affirmations Section**:
- Title: "Your collection:"
- Scrollable container (max-height 256px) displaying all `likedAffirmations`
- Each affirmation shown as a card with light background
- Text is italicized and muted to distinguish from current affirmation

**Preferences Summary Card**:
- Shows current `preferences.focus`
- Shows current `preferences.timing` (comma-separated)
- Shows current `preferences.tone`

**Main Question**: "Are we heading in the right direction?"

**Three Action Buttons**:

1. **"Yes, Keep Going"** (Primary)
   - Calls `handleCheckInContinue()`
   - If affirmations are exhausted: Calls `generateAffirmations(adjustedPreferences)` to get new batch
   - If affirmations remain: Returns to review loop
   - Clears `showCheckIn` flag

2. **"Let's Adjust"** (Secondary)
   - Opens adjustment modal within the same screen
   - Sets `isAdjusting = true`

3. **"I'm happy with my collection"** (Tertiary/Ghost)
   - Calls `handleFinish()`
   - Transitions to summary phase

### Adjustment Flow

When user clicks "Let's Adjust", a modal appears:

**Title**: "Let's fine-tune"
**Subtitle**: "What would make these better?"

**Adjustment Options**:

1. **Challenge Adjustments**:
   - Multi-select badges (same 6 options as discovery Step 3)
   - User can add/remove challenges they want to emphasize or de-emphasize
   - State: `adjustedChallenges` (array)

2. **Tone Adjustment**:
   - Single-select cards (same 4 options as discovery Step 4)
   - User can change the tone for future affirmations
   - State: `adjustedTone` (string)

3. **Freeform Feedback**:
   - Text input field
   - Placeholder: "e.g., More personal, Less formal, Include more action..."
   - State: `feedback` (string)
   - Note: Currently stored but not actively used in API call

**Submit Button**: "Apply Adjustments"

**On Submit**:
1. Calls `handleCheckInAdjust()` with adjusted values
2. Updates `adjustedPreferences` state with: `{ challenges: adjustedChallenges, tone: adjustedTone, feedback }`
3. Clears `isAdjusting` flag
4. Clears `showCheckIn` flag
5. Calls `generateAffirmations(adjustedPreferences)` with new preferences
6. Generates new batch of affirmations based on adjustments
7. Resets to affirmation review with the new batch

**Back Button**:
- Returns to check-in summary without applying changes
- Sets `isAdjusting = false`

---

## Phase 4: Collection Summary

### Purpose
Display the final collection of affirmations that the user has approved, with export options.

### Trigger
Transitions to summary when:
- User clicks "Finish Early" during review
- User clicks "I'm happy with my collection" during check-in
- Called via `handleCollectionComplete(likedAffirmations)` from review phase

### Display

**Header**:
- Title: "Your Affirmation Collection"
- Subtitle: "{affirmations.length} affirmations tailored just for you"

**Affirmations List**:
- Displays all affirmations in order
- Each shown as a numbered card (1, 2, 3, etc.)
- Layout: Number on left, affirmation text on right
- Scrollable container with max-height

**Export Options**:

1. **Copy All Button**:
   - Copies all affirmations joined with `\n\n` to clipboard
   - Button text changes to "Copied!" for 2 seconds
   - Uses `navigator.clipboard.writeText()`

2. **Download as Text Button**:
   - Creates text file: `my-affirmations.txt`
   - Content: All affirmations joined with `\n\n`
   - Uses blob URL and programmatic download

**Start Over Button**:
- Calls `window.location.reload()`
- Resets entire application to initial discovery state

### Empty State
If `affirmations.length === 0`:
- Shows message: "No affirmations collected yet"
- Export buttons disabled

---

## API Integration

### Endpoint: POST /api/generate-affirmations

**Request Format**:
\`\`\`json
{
  "focus": "string",
  "timing": ["Morning", "Evening"],
  "challenges": ["Anxiety"],
  "tone": "Gentle & Compassionate"
}
\`\`\`

**Expected Response**:
\`\`\`json
{
  "affirmations": [
    "affirmation text 1",
    "affirmation text 2",
    ...
  ]
}
\`\`\`

**Typical Batch Size**: 5-8 affirmations per request

**Error Handling**:
- Network error: Falls back to placeholder affirmations
- Empty response: Falls back to placeholder affirmations
- Invalid response format: Falls back to placeholder affirmations

**Fallback Affirmations**:
Generated dynamically using user's focus area and challenges, ensuring affirmations remain relevant even if API fails.

---

## Data Flow Diagram

\`\`\`
User Input
    ↓
OnboardingDiscovery (preferences gathered)
    ↓
preferences object created
    ↓
AffirmationReview (componentmounts)
    ↓
generateAffirmations() called
    ↓
API /generate-affirmations
    ├── Success → affirmations displayed
    └── Failure → placeholders displayed
    ↓
User likes/skips affirmations one by one
    ↓
moveToNext() checks like count
    ├── Like count = 5, 10, 15, etc. → MidJourneyCheckIn
    │   ├── User clicks "Yes" → continue with new batch
    │   ├── User clicks "Adjust" → modify preferences → regenerate
    │   └── User clicks "Finish" → go to summary
    └── Like count < threshold → show next affirmation
    ↓
User finishes or clicks "Finish Early"
    ↓
CollectionSummary (final affirmations displayed with export options)
\`\`\`

---

## State Transitions

### app/page.tsx State Transitions

\`\`\`
Initial State: step = "discovery"

discovery → review
  Trigger: User completes discovery form
  Payload: UserPreferences object stored

review → summary
  Trigger: User finishes collecting affirmations
  Payload: likedAffirmations array stored

review → review (loop)
  Trigger: User continues after mid-journey check-in
  Behavior: New batch of affirmations generated, currentIndex reset

summary → discovery
  Trigger: User clicks "Start Over"
  Behavior: Full page reload
\`\`\`

---

## Key Business Logic

### Check-In Trigger Calculation
\`\`\`javascript
totalLiked = likedAffirmations.length + 1
showCheckIn = 
  totalLiked === 5 || 
  totalLiked === 10 || 
  (totalLiked > 10 && (totalLiked - 10) % 5 === 0)
\`\`\`

### Preference Finalization (Discovery → Review)
\`\`\`javascript
finalPreferences = {
  focus: focus.length > 0 ? focus : customFocus,
  timing: timing.length > 0 ? timing : [customTiming],
  challenges: challenges.length > 0 ? challenges : [customChallenge] or [],
  tone: tone.length > 0 ? tone : customTone
}
\`\`\`

### Affirmation Placeholder Generation
Uses template strings with user's focus area and challenges to create contextual affirmations when API fails.

---

## Component Hierarchy

\`\`\`
app/page.tsx (Main router)
├── OnboardingDiscovery
│   └── ProgressBar
├── AffirmationReview
│   ├── ProgressBar
│   └── MidJourneyCheckIn (conditionally rendered)
│       └── (Adjustment UI when isAdjusting=true)
└── CollectionSummary
\`\`\`

---

## Color & Design System

### Primary Colors
- **Slate 900** (Dark text): #0f172a
- **Slate 50** (Light background): #f8fafc

### Accent State
- Ring color (selected): Slate 900 / Slate 50 (dark mode)
- Hover background: Slate 50 / Slate 900 (dark mode)
- Button primary: Slate 900 background with light text

### Responsive Breakpoints
- Mobile-first design
- Buttons transition from full-width stacked to horizontal at sm breakpoint

---

## Session Persistence

**Current Behavior**: No session persistence
- All state is in-memory React state
- Closing the browser or refreshing loses all progress
- No localStorage or database integration
- "Start Over" button is the only recovery mechanism

---

## Accessibility

### ARIA & Semantic HTML
- Button elements use semantic `<button>` or Shadcn Button component
- Cards use appropriate visual contrast
- Progress bar provides step indication
- Form labels and inputs follow accessibility patterns

### Screen Reader Considerations
- Affirmations displayed in large text for readability
- Counts and step numbers are visible and announced
- Button text clearly indicates action

---

## Edge Cases & Constraints

### Minimum Requirements to Proceed
- **Discovery**: At least one answer per step (preset OR custom)
- **Review**: At least 5 liked affirmations before can access summary
- **Batch Generation**: Generates minimum 5 affirmations per batch

### Maximum Constraints
- No explicit maximum on number of affirmations user can collect
- No session timeout
- No rate limiting implemented

### Input Validation
- Text fields accept any input (no validation)
- Multi-select fields accumulate selections
- Single-select fields override previous selection

---

## Known Limitations

1. **Feedback in Adjustments**: The `feedback` field is collected during adjustments but not currently sent to the API or used in regeneration
2. **No Persistence**: Progress is lost on page refresh
3. **Timing Data**: Timing preferences are collected in discovery but may not be fully utilized in affirmation generation
4. **Challenge/Tone Adjustment**: Only challenges and tone can be adjusted at check-in; focus cannot be re-selected
5. **Affirmation Deduplication**: No mechanism to prevent same affirmation being shown twice across batches

---

## Summary of Key Flows

### Success Path (Happy Path)
1. User completes 4-step discovery form
2. App generates 5-8 affirmations based on preferences
3. User loves 5 affirmations (check-in trigger)
4. Check-in confirms direction
5. Generation continues, user likes to 10 (check-in again)
6. User satisfied, clicks "Finish"
7. Views and exports final collection

### Adjustment Path
1. During review, user reaches 5 likes (check-in)
2. User clicks "Let's Adjust"
3. Modifies challenges and/or tone
4. New batch generated with adjusted preferences
5. Review continues with new affirmations
6. Process can repeat with multiple check-ins and adjustments

### Early Exit Path
1. During review, at any point with 1+ likes
2. User clicks "Finish Early"
3. Proceeds directly to summary with collected affirmations so far
4. Can export partial collection

</a>
