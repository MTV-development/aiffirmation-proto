# Epic Context: esj - fo-07: Page Routes and Navigation

## Relevant Code
- `app/fo-04/page.tsx` - Reference for main page
- `app/fo-04/layout.tsx` - Reference for layout
- `app/fo-04/info/page.tsx` - Reference for info page
- `app/overview/page.tsx` - Add FO-07 entry

## Files to Create
- `app/fo-07/page.tsx` - Main page importing FOExperience
- `app/fo-07/layout.tsx` - Layout (same as FO-04)
- `app/fo-07/info/page.tsx` - Info page describing FO-07

## Architecture
- Next.js App Router structure
- Layout provides common styling/metadata
- Main page imports and renders FOExperience component
- Info page describes the FO-07 variant

## Testing
- Run `npm run dev` and verify /fo-07 loads without errors
- Verify /fo-07/info loads without errors
- Verify /overview shows FO-07 entry

## Conventions
- Export metadata for page titles
- Use consistent styling with other FO variants
- Info page should compare FO-07 to FO-04
