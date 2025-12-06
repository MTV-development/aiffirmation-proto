# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- `npm run dev` - Start development server with hot reload (http://localhost:3000)
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Database Commands (Supabase + Drizzle)

- `npm run db:generate` - Generate SQL migration files from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:push` - Push schema directly (good for prototyping)
- `npm run db:studio` - Open Drizzle Studio GUI for database browsing
- `npm run db:seed` - Run seed script to populate demo data

## Architecture

This is a Next.js 16 application using the App Router pattern with React 19 and TypeScript.

**Key directories:**
- `app/` - Next.js App Router (pages, layouts, and routes)
- `components/` - Shared React components (Sidebar, TopSubmenu)
- `lib/supabase/` - Supabase browser client
- `src/db/` - Drizzle schema, migrations client, and seed scripts
- `docs/` - Plans and documentation

**Stack:**
- Next.js 16 with App Router (React Server Components by default)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4 for styling
- Supabase (database) with Drizzle ORM (schema/migrations)
- ESLint 9 with Next.js configuration

**Patterns:**
- File-based routing via App Router (`page.tsx` files define routes)
- Root layout in `app/layout.tsx` handles fonts, metadata, and global Sidebar
- CSS theming via CSS variables in `globals.css` with light/dark mode support
- Path alias `@/*` maps to project root

## Navigation System

Navigation uses a **single source of truth** in `nav.config.ts`. The `navTree` array defines all routes, labels, and submenus. UI components render from this config.

**Adding a new section:**
1. Add entry to `navTree` in `nav.config.ts`
2. Create route folder under `app/` with `layout.tsx` and `page.tsx`
3. Section layouts inject `TopSubmenu` using the nav config

**Key files:**
- `nav.config.ts` - Central navigation configuration
- `components/sidebar.tsx` - Left sidebar (top-level nav)
- `components/top-submenu.tsx` - Horizontal tabs for section children

See `docs/readmes/README.navigation.md` for detailed navigation patterns.
