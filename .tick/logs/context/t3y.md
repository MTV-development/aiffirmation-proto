# Epic Context: t3y - FO-04: Dynamic Input Component

## Relevant Code
- `app/fo-03/components/text-with-chips.tsx` - Reference component (different UX but similar concept)
- `app/fo-04/components/` - Where new component will live
- `docs/projects/2026-01-23-FO-04/2026-01-23-FO-04-spec.md` - Spec with UX requirements

## Architecture
- React functional components with TypeScript
- Framer Motion for animations
- Tailwind CSS for styling
- Component receives props for content, manages internal state for chip selection

## Key UX Requirements (from spec)
- Chips below input have `+` prefix (e.g., "+ work stress")
- Clicking chip inserts it as a small tag INSIDE the input field
- Tags inside input have `-` or `x` to remove them
- User can type freely AND add chips (combined answer)
- "Show more" button expands additional chips
- "Next" button disabled until text or chip selected

## Testing
- Visual verification in browser
- Component should render with test data

## Conventions
- Use motion.div for animations
- Props interface with TypeScript
- Controlled component pattern (value + onChange)
