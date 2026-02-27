# Lessons Learned

Reusable gotchas and patterns discovered during development.

## Animation & Transitions

### AnimatePresence spring animations require text-change detection
`AnimatePresence mode="wait"` with spring animations (`stiffness: 300, damping: 30`) means exit animations must complete before enter. A simple `sleep(400)` is NOT sufficient for E2E tests — you must detect when the card text actually changes. Use a `waitForNextCard` helper that polls for text content change with a settle period (~600ms).

### Transition coordination without useEffect setState
When a transition screen (thinking/heart) plays during async data loading, avoid `setState` in `useEffect` (causes lint errors and cascading renders). Instead, have the data-loading `.then()` callbacks use functional state updaters to check `prev.thinkingCompleted` — if true, advance the step in the same setState call. This handles both cases (data finishes first, or transition finishes first) without a coordination useEffect. FO-13 uses this pattern; FO-12 has the older useEffect pattern with a lint error.

### Static lookup tables must be module-level constants
Objects defined inside a component (e.g., `const thinkingMessages = { 8: [...] }`) will trigger `react-hooks/exhaustive-deps` warnings when used in `useCallback`. Move them to module-level `const` (e.g., `const BATCH_THINKING_MESSAGES = { ... }`) since they don't depend on state.

## Copy-Modify-Iterate Pattern

### Step number guards must be updated when renumbering
When copying a version and renumbering steps, every component with a step guard (`if (currentStep !== X)`) must be updated. This is error-prone — always grep for the old step numbers after renumbering. Example: FO-11→FO-12 shifted discovery from steps 5-6 to steps 4-5.

### Always check step guards, counter formats, and prop interfaces
The copy-modify-iterate pattern requires verifying three things in every copied component:
1. Step number guards match the new flow
2. Counter formats (e.g., "X of Y") match the new UI
3. Prop interfaces are compatible with the new state machine

## KV Store

### Namespace isolation prevents cross-version contamination
Each FO version uses its own KV namespace (e.g., `fo-11-discovery`, `fo-12`). Never reuse another version's namespace — this prevents prompt changes in one version from affecting others.

## Testing & Tooling

### `node --import tsx` not `npx tsx` on Windows Git Bash
`npx tsx` has issues with path resolution on Windows Git Bash. Always use `node --import tsx e2e/<file>.test.ts`.

### LLM-generated content requires flexible assertions
When testing LLM-generated questions, verify structure (non-empty, length > 10 chars) rather than exact text. The content varies between runs.

### countAllChipButtons() for single-word chips
The standard `countChips()` helper requires `text.length > 10`, which misses single-word chips. Use a separate `countAllChipButtons()` for tone-style single-word selections.

## UI Components

### FragmentInput mode="words" vs default affects layout significantly
`mode="words"` removes `max-w-[200px]` and `whitespace-normal`/`text-left`, adds `text-center` for compact single-word pills. Forgetting to set the mode produces visually broken layouts.

### Component props over types.ts imports
Components should define their own prop interfaces rather than importing from `types.ts`. The state machine (`fo-experience.tsx`) wires everything together. Constants like `GOAL_QUESTION` are inlined in the component rather than imported.

## Batch Generation

### Emergency batch sizing: `max(2*remaining, 20)`
When phase 3 pool exhaustion occurs before reaching the target, generate an emergency batch sized at `max(2 * remaining, 20)`. This ensures enough affirmations to finish while avoiding excessive generation.

### Batch size as template variable
Use `{{ batch_size }}` in KV templates for dynamic batch sizing (phase 3), while initial prompts can hardcode the count.
