# JudgeNot0 — Agent Guide

## Project Overview

JudgeNot0 is the **frontend client** for an online judge / competitive programming platform. It is a Next.js 15+ web application built with React 19. It provides role-based interfaces for:

- **Admins** — create contests, manage setters, bulk-register users via CSV, view standings and submissions.
- **Setters** — create and edit problems, write test cases, solutions, and custom checkers.
- **Users / Participants** — browse contests, solve problems in an embedded code editor, view submissions, and see real-time standings.

The frontend communicates with a separate backend API (default: `http://localhost:8000`). The backend handles authentication (JWT in HttpOnly cookie), code execution, judging, and persistence.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15+ (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + PostCSS |
| HTTP Client | Axios |
| Code Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Rich Text / Math | TipTap v2 + `@tiptap/extension-mathematics` + KaTeX |
| Icons | `react-icons` |
| Auth Storage | localStorage (user profile only); JWT token lives in HttpOnly cookie (server-managed) |
| Linting | ESLint 9 with `next/core-web-vitals` |

---

## Project Structure

```
client/
├── app/                    # Next.js App Router pages
│   ├── page.jsx            # Root redirector (role-based routing)
│   ├── layout.jsx          # Root layout with AuthProvider + Navbar + ErrorBoundary
│   ├── globals.css         # Global styles + Tailwind import
│   ├── login/page.jsx      # Login page
│   ├── admin/              # Admin-only pages
│   ├── setter/             # Setter dashboard
│   ├── edit/               # Problem / contest editors (setter + admin)
│   ├── preview/            # Problem preview (setter / admin)
│   ├── contests/           # Contest listing, problem solving, standings, submissions
│   └── loading.jsx         # Global loading fallback
├── api/                    # API abstraction modules (NOT Next.js API routes)
│   ├── user/user.js
│   ├── contest/contest.js
│   ├── problem/problem.js
│   ├── setter/setter.js
│   ├── submission/submission.js
│   └── compile_run/compileRun.js
├── components/             # React components organized by feature
│   ├── HOC/withAuth.jsx    # Route-protection HOCs (withAuth, withRole, withGuest)
│   ├── TipTapEditor/       # Rich text + math editor
│   ├── EditorComponent/    # CodeMirror code editor
│   ├── ProblemEditComponent/
│   ├── ContestEditComponent/
│   └── ...
├── contexts/
│   └── AuthContext.jsx     # Global auth state (login, logout, role checks)
├── utils/
│   ├── apiClient.js        # Axios instance with interceptors
│   ├── auth.js             # localStorage auth helpers
│   ├── constants.js        # Roles, endpoints, storage keys, statuses
│   ├── errorHandler.js     # Centralized error logging / formatting
│   ├── dateFormatter.js    # Safe date / duration formatting
│   ├── verdictFormatter.js # Submission verdict colors & icons
│   ├── tiptapToHtml.js     # TipTap JSON-to-HTML converter
│   └── compileRun.js       # Code execution helper
├── handlers/
│   └── mentionHandler.jsx  # Simple mention highlight formatter
├── public/
│   └── 0.png               # Site favicon / logo
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # Compose service (port 5121)
├── next.config.mjs         # Standalone output + API rewrite to :8000
├── middleware.js           # Placeholder middleware (currently no-op for auth)
└── jsconfig.json           # Path alias `@/*` → `./*`
```

### Important Conventions

- **Almost every page is a client component** (`"use client"`). The only server component found is `app/contests/page.jsx` (an async function that fetches contests directly).
- **Path alias `@/`** maps to the project root. Always use `@/components/...` and `@/utils/...` instead of relative paths.
- **Params unwrapping in Next.js 15+** uses `use(params)` inside client components (e.g., `const { contestId } = use(params)`).
- **API modules** in `/api/` are plain JS objects that wrap axios calls and return `{ data, error }` objects. They are **not** Next.js API routes.

---

## Build and Run Commands

```bash
# Development (starts Next.js dev server, usually on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server (requires build first)
npm run start

# Linting
npm run lint
```

### Environment Variables

Create a `.env` file (`.env.example` is provided):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This variable points to the backend API. The `next.config.mjs` also contains a rewrite rule so that requests to `/api/*` are proxied to the same backend URL during development.

---

## Deployment

### Docker (Production)

The project includes a multi-stage `Dockerfile` and a `docker-compose.yml`.

- **Build target:** `standalone` output from Next.js.
- **Runtime image:** `node:current-alpine3.21`
- **Exposed port:** `5121` (see `docker-compose.yml` mapping `5121:5121`)
- **User:** runs as unprivileged `nextjs` user.

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Standalone Output

`next.config.mjs` sets `output: "standalone"`. This means the build produces a self-contained `.next/standalone` directory that can run with `node server.js` without needing the full `node_modules`.

---

## Authentication & Authorization

### How Auth Works

1. **Login** posts to `/api/users/login`. The backend sets the JWT as an **HttpOnly cookie**.
2. The backend response body contains user profile info (id, username, role, etc.).
3. The frontend stores this profile in **localStorage** under key `user`.
4. Axios (`apiClient.js`) sends requests with `withCredentials: true` so the browser automatically attaches the HttpOnly cookie.
5. On **401**, the axios interceptor clears localStorage and redirects to `/login`.

### Roles

Defined in `utils/constants.js`:

- `admin` — full access
- `setter` — can create/edit problems; limited contest access
- `user` / `participant` — can view contests, submit solutions, view own submissions

### Route Protection

- **HOCs** in `components/HOC/withAuth.jsx`:
  - `withAuth(Component)` — requires any authenticated user.
  - `withRole(Component, allowedRoles)` — requires specific role(s); redirects unauthorized users to their home page.
  - `withGuest(Component)` — redirects already-authenticated users away from public pages like `/login`.
- **Middleware** (`middleware.js`) exists but is currently a no-op for auth. All real protection happens client-side via HOCs.

---

## Code Style Guidelines

- **Language:** JavaScript (JSX). No TypeScript is used.
- **Quotes:** Double quotes for strings.
- **Indentation:** 2 spaces.
- **Naming:**
  - Components: PascalCase files and exports (`ProblemEditComponent.jsx`).
  - Utility modules: camelCase (`apiClient.js`, `errorHandler.js`).
  - API modules: grouped by domain in `/api/<domain>/<domain>.js`, exported as a default object (e.g., `problemModule`).
- **Styles:** Tailwind utility classes. Custom CSS is rare and lives next to its component (e.g., `editorStyle.css`, `katexContent.css`).
- **Icons:** Use `react-icons` (commonly `Md*`, `Fa*`, `Go*`, `Go*` prefixes).
- **Comments:** JSDoc-style block comments are used heavily in utility and API files.

---

## Testing

**There is currently no testing framework configured in this project.** There are no unit tests, integration tests, or E2E tests. If you add tests, consider:

- **Vitest** or **Jest** for unit tests.
- **Playwright** or **Cypress** for E2E tests (useful for the code editor and contest flow).

---

## Security Considerations

1. **HttpOnly Cookie for JWT:** The frontend never touches the JWT token directly; it is stored in an HttpOnly cookie by the backend. The frontend only stores non-sensitive profile data in localStorage.
2. **Client-Side Route Guards:** Because Next.js middleware is not enforcing auth, all route protection is client-side. Do not rely on HOCs alone for sensitive operations—always verify permissions on the backend.
3. **`dangerouslySetInnerHTML`:** Used in `handlers/mentionHandler.jsx` and in the TipTap HTML renderer (`tiptapToHtml.js`). Ensure any server-generated content passed into these is sanitized on the backend.
4. **CORS:** The frontend expects the backend to allow credentials (`withCredentials: true`). Ensure the backend CORS config matches the deployed frontend origin.
5. **Docker:** The production container runs as a non-root user (`nextjs`).

---

## Common Development Tasks

### Adding a New API Endpoint

1. Add the endpoint string to `utils/constants.js` inside `API_ENDPOINTS`.
2. Add a wrapper method in the appropriate `/api/<domain>/<domain>.js` file.
3. Follow the `{ data, error }` return pattern and use `handleApiError` for consistent error handling.

### Adding a New Page

1. Create the route under `app/`.
2. If the page needs auth/role protection, wrap the exported component with `withAuth` or `withRole` from `@/components/HOC/withAuth`.
3. Remember to add `"use client"` at the top if you use hooks like `useState`, `useEffect`, or `useRouter`.
4. Use `use(params)` to access dynamic route parameters in client components.

### Using the Code Editor

The editor is `components/EditorComponent/EditorComponent.jsx`. It supports:
- `cpp`, `python`, `java`, `js`
- Props: `value`, `handleChange`, `selectedLanguage`, `height`

### Using the Rich Text Editor

`components/TipTapEditor/TipTapEditor.jsx` accepts:
- `initialContent` — JSON string or TipTap JSON object.
- `onUpdate` — callback receiving the TipTap JSON document.

It supports inline math (`$...$`) and block math (`$$...$$`) via KaTeX.

---

## Notes for AI Agents

- Do **not** assume a `README.md` exists—there is none in this project.
- Do **not** assume tests exist—there are none.
- Do **not** change the backend API URL in `next.config.mjs` or `.env` without explicit user instruction.
- When editing API modules, preserve the existing error-status mapping (401 → auth error, 403 → permission error, 404 → not found, etc.) so UI messages remain accurate.
- When creating new pages that require authentication, always import and apply `withAuth` or `withRole`.
- The project uses **React 19** and **Next.js 15+**; keep hooks and patterns compatible with these versions.
