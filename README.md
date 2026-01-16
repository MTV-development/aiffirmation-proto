# Aiffirmation

An AI-powered affirmation generation application built with Next.js 16, React 19, and the Mastra AI agent framework.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see docs/current/supabase-and-drizzle.md)
cp .env.example .env.local

# Push database schema and seed data
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Documentation

All technical documentation is in [`docs/current/`](docs/current/_overview.md):

| Document | Description |
|----------|-------------|
| [Overview](docs/current/_overview.md) | Documentation index and architecture summary |
| [Development](docs/current/devmethods.md) | Next.js development setup and commands |
| [Navigation](docs/current/navigation.md) | Navigation system architecture |
| [Database](docs/current/supabase-and-drizzle.md) | Supabase + Drizzle setup and usage |
| [KV Store](docs/current/keyvaluestore-and-template-engine.md) | Configurable prompts with Liquid templating |
| [AI Agents](docs/current/mastra.md) | Mastra agent framework and tools |
| [Workflow Integration](docs/current/mastra-workflow-integration.md) | Suspend/resume workflow patterns |
| [Chat Survey](docs/current/chat-survey-user-journey.md) | Chat Survey feature UX flow |
| [E2E Testing](docs/current/e2e-testing.md) | Playwright E2E test setup |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |
| `npx mastra dev` | Start Mastra Studio (http://localhost:4111) |
| `npm run db:push` | Push schema and seed database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test:e2e` | Run E2E tests (requires dev server) |
| `npm run test:e2e:install` | Install Chromium for E2E tests |

## Tech Stack

- **Next.js 16** - App Router with React Server Components
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **Supabase** - PostgreSQL database
- **Drizzle ORM** - Schema and migrations
- **Mastra** - AI agent framework
- **LiquidJS** - Template engine for prompts
