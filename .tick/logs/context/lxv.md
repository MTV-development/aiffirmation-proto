# Epic Context: lxv - FO-06: Environment validation

## Relevant Code
- `package.json` - Build scripts and dependencies
- `tsconfig.json` - TypeScript configuration

## Architecture
- Next.js 15 application with App Router
- Mastra AI framework for agents
- Drizzle ORM with PostgreSQL/Supabase

## Testing
- Build command: `npm run build`
- TypeScript check: `npx tsc --noEmit`
- Lint: `npm run lint`

## Conventions
- Pre-flight checks should verify build health before new feature work
- Document any pre-existing issues in tick notes
