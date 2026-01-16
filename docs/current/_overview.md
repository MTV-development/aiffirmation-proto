# Documentation Overview

This folder contains the current technical documentation for the Aiffirmation project.

## Documentation Index

### Core Architecture
| Document | Description |
|----------|-------------|
| [devmethods.md](devmethods.md) | Next.js development setup and commands |
| [navigation.md](navigation.md) | Navigation system architecture and extension guide |
| [supabase-and-drizzle.md](supabase-and-drizzle.md) | Database setup, migrations, and Supabase integration |

### AI & Templating
| Document | Description |
|----------|-------------|
| [mastra.md](mastra.md) | Mastra AI agent framework, tools, and observability |
| [keyvaluestore-and-template-engine.md](keyvaluestore-and-template-engine.md) | KV store and Liquid templating for configurable prompts |
| [mastra-workflow-integration.md](mastra-workflow-integration.md) | Patterns for suspend/resume workflows with Next.js |

### Features
| Document | Description |
|----------|-------------|
| [chat-survey-user-journey.md](chat-survey-user-journey.md) | Chat Survey feature - user experience flow |

### Testing
| Document | Description |
|----------|-------------|
| [e2e-testing.md](e2e-testing.md) | E2E testing setup with Playwright |

## Quick Start

1. **Setup**: See [devmethods.md](devmethods.md) for running the dev server
2. **Database**: See [supabase-and-drizzle.md](supabase-and-drizzle.md) for database configuration
3. **AI Agents**: See [mastra.md](mastra.md) for working with AI agents

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 App                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   App       │  │  Components │  │   API Routes        │ │
│  │   Router    │  │  (React 19) │  │   (Server Actions)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────┐
│   Supabase    │   │     Mastra      │   │  KV Store +   │
│   (Postgres)  │   │   AI Agents     │   │  Templates    │
└───────────────┘   └─────────────────┘   └───────────────┘
```

## Key Technologies

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **AI Framework**: Mastra (agents, tools, workflows)
- **Templating**: LiquidJS for configurable prompts
- **Testing**: Playwright for E2E tests
