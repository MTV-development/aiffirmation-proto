# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- `npm run dev` - Start development server with hot reload (http://localhost:3000)
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Architecture

This is a Next.js 16 application using the App Router pattern with React 19 and TypeScript.

**Key directories:**
- `app/` - Next.js App Router (pages, layouts, and routes)
- `public/` - Static assets served at root

**Stack:**
- Next.js 16 with App Router (React Server Components by default)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4 for styling
- ESLint 9 with Next.js configuration

**Patterns:**
- File-based routing via App Router (`page.tsx` files define routes)
- Root layout in `app/layout.tsx` handles fonts and metadata
- CSS theming via CSS variables in `globals.css` with light/dark mode support
- Path alias `@/*` maps to project root
