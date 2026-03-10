# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory Saving Behavior

Whenever the user prefixes a message with `#`, treat it as a memory/instruction to save. Before saving, always ask:

```
Where should this be saved?
  1. Project memory       → ./CLAUDE.md
  2. Project memory (local, gitignored) → ./CLAUDE.local.md
  3. User memory          → ~/.claude/CLAUDE.md
  4. Auto memory          → ~/.claude/projects/.../memory/MEMORY.md
```

Wait for the user to choose before saving anything.

## Code Style

- Use comments sparingly. Only comment complex code.

## Commands

```bash
# Initial setup (install deps + Prisma generate + migrate)
npm run setup

# Development server (Next.js + Turbopack)
npm run dev

# Run tests
npm run test

# Run a single test file
npx vitest src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Build
npm run build

# Database reset
npm run db:reset
```

All `next` commands require `NODE_OPTIONS='--require ./node-compat.cjs'` — the npm scripts handle this automatically.

## Architecture

**UIGen** is an AI-powered React component generator with live preview. Users describe components in a chat interface; Claude generates code into a virtual file system that's immediately rendered in an iframe.

### Data Flow

```
User message (chat)
  → useChat hook (Vercel AI SDK) → POST /api/chat
  → streamText with Claude Haiku 4.5
  → AI calls tools: str_replace_editor / file_manager
  → VirtualFileSystem updated (in-memory)
  → FileSystemContext triggers re-render
  → jsx-transformer.ts (Babel) compiles JSX
  → PreviewFrame.tsx renders in sandboxed iframe
```

### Key Abstractions

**VirtualFileSystem** (`src/lib/file-system.ts`) — All file state lives here, never on disk. Serialized as JSON for DB persistence.

**ChatContext** (`src/lib/contexts/chat-context.tsx`) — Wraps Vercel AI SDK's `useChat`, manages message state and tool call dispatch.

**FileSystemContext** (`src/lib/contexts/file-system-context.tsx`) — Exposes file system state to components, executes tool calls from the AI, tracks the currently selected file.

**Language Model Provider** (`src/lib/provider.ts`) — Factory: returns real Claude if `ANTHROPIC_API_KEY` is set, otherwise falls back to `MockLanguageModel` that simulates component generation deterministically.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — Babel standalone compiles JSX/TSX → JS, builds an import map, generates a blob-URL HTML document for the iframe.

**AI Tools** (`src/lib/tools/`) — `str_replace_editor` handles file view/create/edit/undo; `file_manager` handles rename/delete. Both operate directly on `VirtualFileSystem`.

### Routing

- `/` — Home page; redirects authenticated users to their latest project, anonymous users see the chat UI directly.
- `/[projectId]` — Project page (requires auth).
- `/api/chat` — Streaming AI chat endpoint. Persists messages + file system to DB on completion for authenticated users.

### Auth

JWT sessions via `jose` stored in httpOnly cookies. Server actions in `src/actions/` handle signUp/signIn/signOut. `src/middleware.ts` protects routes. `userId` on `Project` is optional, supporting anonymous use.

### Database

Prisma with SQLite. `messages` and `data` (file system) are stored as JSON strings on the `Project` model. Run `npx prisma studio` to inspect data.

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of the data stored in the database.

### AI Configuration

The system prompt lives in `src/lib/prompts/generation.tsx`. Key constraints it enforces:
- Root entry point must be `/App.jsx`
- Use `@/` import alias for cross-file imports
- Tailwind CSS for styling
- No disk writes — AI operates only through the defined tools

Model: `claude-haiku-4-5`, max 40 steps, 10k max tokens. Anthropic ephemeral caching applied to the system prompt.

### Preview Component

`PreviewFrame.tsx` auto-detects the entry point (`App.jsx`, `index.jsx`, etc.), compiles it with Babel, and renders in a sandboxed iframe via blob URLs. Error states and empty states are handled inline.
