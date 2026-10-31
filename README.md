# DevCommunity

A developer community platform for learning, sharing and discovering technical content. Developers can
discover communities, join the ones they care about, publish technical posts into them, explore content
by topic and keep a public developer profile.

Built as the capstone project of the TechTalks Full-Stack Bootcamp with **Next.js 16**, **MongoDB Atlas +
Mongoose**, **Auth.js** (GitHub + Google) and **Zod**.

**Live demo:** _add the Vercel URL here_

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Architecture](#architecture)
- [Rendering strategies](#rendering-strategies)
- [Data model](#data-model)
- [API](#api)
- [Authentication and authorization](#authentication-and-authorization)
- [Validation](#validation)
- [Deployment](#deployment)
- [Trade-offs and known limitations](#trade-offs-and-known-limitations)

## Features

- **Explore** – featured communities, latest posts, popular topics and new developers.
- **Communities** – search, a detail page with topics, newest members and latest posts, join / leave.
- **Blogs** – write a post in Markdown, save it as a draft or publish it into a community, edit and delete
  your own posts.
- **Search and filters** – full-text search, filter by community, topic or author, newest first, paginated.
  All of it runs as a MongoDB query.
- **Comments** and **bookmarks** for signed-in users.
- **Public profiles** with bio, skills, joined communities and published posts.
- **Dashboard** (your posts and drafts, your communities) and **settings** to edit your profile.
- **Sign in with GitHub or Google.**

## Tech stack

| Area       | Choice                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack), React 19, TypeScript               |
| Styling    | Tailwind CSS 4, lucide-react icons                                     |
| Database   | MongoDB Atlas, Mongoose 9                                              |
| Auth       | Auth.js v5 (`next-auth@beta`), GitHub + Google OAuth, JWT sessions     |
| Validation | Zod 4, shared by the forms and the Route Handlers                      |
| Content    | Markdown rendered on the server with `react-markdown`                  |
| Hosting    | Vercel                                                                 |

## Getting started

### Prerequisites

- Node.js 20.9 or newer (the seed script needs Node 22.18+ because Node runs it as TypeScript directly)
- A MongoDB database – a free MongoDB Atlas cluster is enough
- A GitHub OAuth app and a Google OAuth client (see below)

### 1. Install

```bash
git clone <repository-url>
cd devcommunity
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is ignored by git; never commit it.

| Name                 | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| `MONGODB_URI`        | MongoDB connection string, including the database name                              |
| `AUTH_SECRET`        | Secret used to encrypt the session cookie. Generate one with `npx auth secret`      |
| `AUTH_GITHUB_ID`     | Client ID of the GitHub OAuth app                                                   |
| `AUTH_GITHUB_SECRET` | Client secret of the GitHub OAuth app                                               |
| `AUTH_GOOGLE_ID`     | Client ID of the Google OAuth client                                                |
| `AUTH_GOOGLE_SECRET` | Client secret of the Google OAuth client                                            |

Auth.js picks up the `AUTH_*` variables automatically. On Vercel the site URL is detected automatically, so
`AUTH_URL` is not needed.

### 3. OAuth apps for local development

**GitHub** – Settings → Developer settings → OAuth Apps → New OAuth App

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

A GitHub OAuth app has a single callback URL, so use a second app for production.

**Google** – Google Cloud Console → APIs & Services. Configure the OAuth consent screen first, then
Credentials → Create credentials → OAuth client ID → Web application.

- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### 4. Seed and run

```bash
npm run seed   # creates the communities and makes sure all indexes exist
npm run dev    # http://localhost:3000
```

The seed script is safe to run again; it updates the communities instead of duplicating them.

### Scripts

| Script          | What it does                                       |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Development server                                 |
| `npm run build` | Production build (needs `MONGODB_URI`, see below)  |
| `npm run start` | Serve the production build                         |
| `npm run lint`  | ESLint                                             |
| `npm run seed`  | Seed communities and sync indexes                  |

## Architecture

### Folder structure

```
app/              Routes, layouts, loading / error / not-found boundaries
app/api/          Route Handlers (the HTTP API)
components/ui/    Design system: buttons, cards, badges, form controls, empty states, pagination
components/*/     Feature components (posts, communities, comments, profile, auth, layout)
lib/services/     Business and data logic: queries, mutations, ownership checks
lib/              Database connection, session helpers, API error handling, mappers
models/           Mongoose models
schemas/          Zod schemas, shared by forms and Route Handlers
types/            Plain types that leave the data layer, Auth.js type augmentation
constants/        Seed data and navigation
scripts/          Seed script
auth.ts           Auth.js configuration
```

The rule of thumb: pages compose features, components render UI, schemas validate input, models describe
stored data, and `lib/services` holds the logic. Route Handlers stay thin – they check the session,
validate the body, call a service, revalidate cached pages and turn errors into status codes.

### How a request flows

**Reads.** A Server Component page calls a service function directly
(`page → lib/services → Mongoose → MongoDB`). Pages don't call our own API over HTTP; that would only add a
network round trip to the same server. Services return plain serializable objects (`types/index.ts`), never
Mongoose documents.

**Writes.** A Client Component sends a `fetch` to a Route Handler:

```
session check (401) → Zod validation (400) → service: load, check ownership (404 / 403), write
→ revalidatePath() for the cached pages that changed → JSON response (200 / 201)
```

Route Handlers are used for writes because the components that trigger them live in the browser, and for
the public read endpoints (`GET /api/posts`, `GET /api/communities`) that other clients could use.

### Server and Client Components

Everything is a Server Component unless it needs the browser. Each Client Component starts with a short
comment explaining why it needs `"use client"`:

| Client Component                         | Why                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `layout/providers.tsx`                   | `SessionProvider` shares the session through React context                  |
| `layout/nav-links.tsx`                   | Highlighting the active link needs `usePathname()`                          |
| `layout/user-menu.tsx`                   | Reads the session in the browser, dropdown open/closed state                |
| `communities/join-community-button.tsx`  | Per-user state on a cached page, instant feedback                           |
| `posts/bookmark-button.tsx`              | Per-user state on a cached page, optimistic toggle                          |
| `posts/post-owner-actions.tsx`           | Shows Edit / Delete only to the author of a cached page                     |
| `posts/delete-post-button.tsx`           | Confirmation dialog, calls the API                                          |
| `posts/post-form.tsx`                    | Controlled form, topics depend on the chosen community, instant validation  |
| `comments/comment-form.tsx`              | Form state and validation, session check on a cached page                   |
| `comments/delete-comment-button.tsx`     | Shown only to the comment's author, confirmation                            |
| `profile/settings-form.tsx`              | Form state, refreshes the session after saving                              |
| `auth/sign-in-buttons.tsx`               | Reads `?callbackUrl` in the browser so the sign-in page can stay static     |
| `app/error.tsx`                          | Error boundaries have to be Client Components                               |

Pages, cards, the rendered Markdown, the comment list, pagination and the search/filter forms are Server
Components. The filters on `/blogs` and `/communities` are plain GET forms (`next/form`): submitting one just
changes the URL, the server reads the URL and queries MongoDB. No client state, and every result page has a
shareable URL.

One decision shapes the whole app: **the root layout never calls `auth()`.** `auth()` reads cookies, and doing
that in the layout would make every page dynamic. Instead the user-specific parts of public pages (user menu,
join button, bookmark button, edit/delete buttons, comment form) are small Client Components that read the
session in the browser, and the pages around them stay cacheable.

## Rendering strategies

| Route                                   | Strategy                                                   | Why                                                                                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/signin`                               | Static                                                     | Nothing on it depends on the request. `?callbackUrl` is read in the browser.                                                                                                                               |
| `/`                                     | ISR, `revalidate = 300` + on demand                        | Public and identical for everyone. It mixes several collections (communities, posts, topics, new users), so a 5-minute window is simpler than tracking every write. Publishing a post revalidates it at once. |
| `/communities/[slug]`                   | ISR, pre-rendered at build, `revalidate = 3600` + on demand | Public, read far more than it changes. There are only a few curated communities, so all of them are built ahead of time.                                                                                    |
| `/blogs/[slug]`                         | ISR, rendered on first visit, `revalidate = 3600` + on demand | The most read page. Edits, deletes and new comments revalidate it right away, so readers never wait for the hour to pass.                                                                                  |
| `/profile/[username]`                   | ISR, rendered on first visit, `revalidate = 3600` + on demand | Public, changes only when the user edits their profile, publishes or joins a community – and those writes revalidate it.                                                                                   |
| `/communities`, `/blogs`                | Dynamic                                                    | The result depends on `?search`, filters and `?page`; there are too many combinations to cache.                                                                                                             |
| `/dashboard`, `/bookmarks`, `/settings`, `/create`, `/blogs/[slug]/edit` | Dynamic, protected                | The response depends on who is signed in.                                                                                                                                                                  |

**On-demand revalidation.** The time-based `revalidate` is only a safety net. After each write the Route
Handler calls `revalidatePath` for the pages that show the changed data:

| Write                              | Revalidated paths                                                       |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Create / edit / delete a post      | `/`, `/blogs/[slug]`, `/communities/[slug]` (old and new), `/profile/[username]` |
| Add / delete a comment             | `/blogs/[slug]`                                                         |
| Join / leave a community           | `/communities/[slug]`, `/profile/[username]`                            |
| Edit profile                       | Everything (`revalidatePath("/", "layout")`) – the name and avatar appear on posts, comments and member lists everywhere, and profile edits are rare |

`create-next-app` turns on Cache Components (`cacheComponents: true`) by default in Next 16. It is turned off
here on purpose: the classic route segment config (`export const revalidate`) plus `revalidatePath` makes the
strategy of each page explicit and easy to see in the build output.

Because the home page and the community pages are generated at build time, `npm run build` needs
`MONGODB_URI` (on Vercel it is set as an environment variable).

## Data model

```
User ──< Membership >── Community
 │                         │
 ├──< Post >───────────────┘
 │     │
 │     ├──< Comment >── User
 │     └──< Bookmark >── User
```

| Collection    | Key fields                                                                    | Notes                                                                 |
| ------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `users`       | `provider`, `providerAccountId`, `email`, `image`, `name`, `username`, `bio`, `skills` | Identity fields come from OAuth; `name`, `username`, `bio`, `skills` are editable |
| `communities` | `slug`, `name`, `description`, `topics[]`, `memberCount`                      | Curated, created by the seed script                                   |
| `memberships` | `user`, `community`                                                           | One document per user per community                                   |
| `posts`       | `slug`, `title`, `content`, `excerpt`, `author`, `community`, `tags[]`, `status`, `publishedAt` | `status` is `draft` or `published`                       |
| `comments`    | `post`, `author`, `body`                                                      |                                                                       |
| `bookmarks`   | `user`, `post`                                                                |                                                                       |

### Embedding vs referencing

- **Community topics are embedded** (`topics: string[]`). The list is short, bounded, curated, and always read
  together with the community.
- **Members are a separate `memberships` collection**, not an array on the community. A popular community
  would grow that array without limit. The community keeps a `memberCount` counter so cards don't have to
  count memberships.
- **Posts reference their author and community.** Both are shared by many posts and change independently
  (a user can rename themselves).
- **Comments are their own collection.** A post can collect any number of comments (16 MB document limit),
  each has its own author, and many users write them at the same time.
- **Bookmarks are their own collection** instead of an array on the user: the list is unbounded, `/bookmarks`
  paginates it newest first, and most of the time we only need "did I bookmark this post?".
- **Post tags must be topics of the post's community.** The form only offers those topics and the server
  checks it again, so topic filters always match the communities' hashtags.
- **`excerpt` is stored** when a post is saved, so list queries can skip the (large) `content` field.

### Indexes

Every index matches a query in `lib/services`:

| Index                                                   | Query it serves                                                      |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `users { username }` unique                             | Profile lookup, username uniqueness                                  |
| `users { provider, providerAccountId }` unique          | Finding the user after an OAuth sign-in                              |
| `communities { slug }` unique                           | Community page                                                       |
| `memberships { user, community }` unique                | "Am I a member?", "communities of this user", no double joins       |
| `memberships { community, createdAt: -1 }`              | Newest members of a community                                        |
| `posts { slug }` unique                                 | Blog post page                                                       |
| `posts { status, publishedAt: -1 }`                     | Latest published posts (explore, `/blogs`)                           |
| `posts { community, status, publishedAt: -1 }`          | Community page, `?community=` filter                                 |
| `posts { author, status, publishedAt: -1 }`             | Profile, dashboard, `?author=` filter                                |
| `posts { tags, status, publishedAt: -1 }`               | `?topic=` filter                                                     |
| `posts` text index on `title` (×5), `tags` (×3), `content` | `?search=` full-text search                                       |
| `comments { post, createdAt }`                          | Comments of a post, oldest first                                     |
| `bookmarks { user, post }` unique                       | "Did I bookmark this?", no duplicates                                |
| `bookmarks { user, createdAt: -1 }`                     | `/bookmarks`, newest first                                           |

Community search uses a case-insensitive regex instead of a text index. It's a small curated collection, and a
regex gives partial matches ("lara" finds Laravel).

### MongoDB, Atlas and Mongoose

MongoDB is the database. Atlas is the hosted service it runs on in production. Mongoose is the library the app
uses to talk to it: schemas, models, validation on save, `populate()` for references. The connection is created
once and cached on `globalThis` (`lib/db.ts`) so serverless functions and dev reloads don't open a new one
each time.

## API

All responses are JSON. Errors look like `{ "error": "message", "fieldErrors": { "title": ["..."] } }`.

| Method   | Endpoint                               | Auth   | Description                                         | Status codes            |
| -------- | -------------------------------------- | ------ | --------------------------------------------------- | ----------------------- |
| `GET`    | `/api/posts`                           | –      | List published posts. Query: `search`, `community`, `topic`, `author`, `page`, `limit` (max 50) | 200, 400 |
| `POST`   | `/api/posts`                           | yes    | Create a post (draft or published)                  | 201, 400, 401           |
| `GET`    | `/api/posts/:id`                       | –      | One post. Drafts only for their author              | 200, 404                |
| `PATCH`  | `/api/posts/:id`                       | owner  | Update a post                                       | 200, 400, 401, 403, 404 |
| `DELETE` | `/api/posts/:id`                       | owner  | Delete a post with its comments and bookmarks       | 200, 401, 403, 404      |
| `POST`   | `/api/posts/:id/comments`              | yes    | Comment on a published post                         | 201, 400, 401, 404      |
| `DELETE` | `/api/comments/:id`                    | owner  | Delete your comment                                 | 200, 401, 403, 404      |
| `GET`    | `/api/posts/:id/bookmark`              | yes    | Is this post bookmarked by me?                      | 200, 401, 404           |
| `POST`   | `/api/posts/:id/bookmark`              | yes    | Bookmark (201 new, 200 if it already was)           | 200, 201, 401, 404      |
| `DELETE` | `/api/posts/:id/bookmark`              | yes    | Remove bookmark                                     | 200, 401, 404           |
| `GET`    | `/api/communities`                     | –      | List / search communities. Query: `search`, `page`, `limit` | 200, 400        |
| `GET`    | `/api/communities/:slug/membership`    | yes    | Am I a member?                                      | 200, 401, 404           |
| `POST`   | `/api/communities/:slug/membership`    | yes    | Join (201 new, 200 if already a member)             | 200, 201, 401, 404      |
| `DELETE` | `/api/communities/:slug/membership`    | yes    | Leave                                               | 200, 401, 404           |
| `PATCH`  | `/api/me`                              | yes    | Update your own profile                             | 200, 400, 401, 409      |

Any unexpected error returns `500` with a generic message; the details are only logged on the server.
Identifiers are path parameters (`/api/posts/:id`); search, filters and pagination are query parameters.

## Authentication and authorization

**Authentication (who are you?)** is handled by Auth.js with the GitHub and Google providers. After the OAuth
flow succeeds, Auth.js calls the `jwt` callback in `auth.ts` with the provider account. That callback finds or
creates our own `User` document (by provider + account id) and stores the user's MongoDB id and username in
the session token. The token lives in an encrypted, http-only cookie (JWT strategy, no database adapter).
On the server, `auth()` decrypts it; in the browser, `useSession()` asks `/api/auth/session`.

Users are matched by provider + account id, not by email. Linking accounts by email would let someone who
controls that address at one provider take over the account created with the other, so signing in with
GitHub and Google creates two separate accounts.

**Authorization (what are you allowed to do?)** happens on the server, next to the database write:

- Only the author can edit or delete a post (`findOwnedPost` in `lib/services/posts.ts`).
- Only the author can delete a comment (`deleteComment` in `lib/services/comments.ts`).
- The author of a new post or comment is always the session user. Owner ids and other server-controlled
  fields are never read from the request body; the Zod schemas reject unknown fields.
- Profile updates go to `PATCH /api/me`, which only ever updates the signed-in user.

Hiding the Edit and Delete buttons is just UX. If someone calls `DELETE /api/posts/<id of another user's post>`
manually, the server answers **403 Forbidden**. Without a session it answers **401 Unauthorized**:

- **401** – we don't know who you are (no or expired session). Signing in would help.
- **403** – we know who you are, and you're not allowed to do this. Signing in again wouldn't change anything.

Protected pages (`/dashboard`, `/bookmarks`, `/settings`, `/create`, `/blogs/[slug]/edit`) check the session
on the server and redirect guests to `/signin?callbackUrl=...`, which sends them back after signing in. The edit
page shows a "you can't edit this post" message to signed-in users who aren't the author.

Pages that have a `loading.tsx` start streaming the loading skeleton before the page runs its session check, so
for those the redirect arrives inside the stream (Next.js sends a client redirect plus a `<meta refresh>`
fallback) instead of as an HTTP 307. Either way no protected content is sent to a guest.

## Validation

Zod schemas in `schemas/` run in two places:

- **In the form** (Client Component) for instant, field-level feedback.
- **In the Route Handler** before any business logic or database write. This is the check that matters: a
  request can be sent without our UI, so "the frontend already validated it" is never enough.

The handlers use the parsed result, not the raw body. The schemas use `z.strictObject`, so unknown fields
(like `author`) are rejected with a 400. Checks that need the database – the community exists, the tags
belong to it, the username isn't taken – happen in the service layer. Query parameters for
`GET /api/posts` and `GET /api/communities` are validated too (an out-of-range `limit` is a 400).

## Deployment

### MongoDB Atlas

1. Create a project and a free cluster.
2. Create a database user (Database Access).
3. Network Access: allow `0.0.0.0/0`. Vercel functions don't have fixed IP addresses.
4. Connect → Drivers → copy the connection string. Add a database name before the `?`, for example
   `...mongodb.net/devcommunity?retryWrites=true&w=majority`.
5. Run `npm run seed` once with that `MONGODB_URI` to create the communities and indexes.

### Vercel

1. Push the `main` branch to GitHub.
2. In Vercel, Add New → Project and import the repository. Next.js is detected automatically.
3. Settings → Environment Variables: add `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`,
   `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
4. Deploy and check the build log.
5. Update the OAuth apps with the production domain:
   - GitHub (production OAuth app): callback URL `https://<your-domain>/api/auth/callback/github`
   - Google: add `https://<your-domain>` to authorized origins and
     `https://<your-domain>/api/auth/callback/google` to authorized redirect URIs
6. Environment variable changes only apply to new deployments, so redeploy after changing them.

### What changes between localhost and production

- The database is the Atlas cluster, reached from Vercel's serverless functions (hence the open network access
  and the cached connection).
- OAuth callback URLs point at the production domain, and production uses its own GitHub OAuth app.
- Pages are built with `next build`: ISR pages are generated at build time or on first visit and cached, which
  doesn't happen in `next dev`.
- Secrets live in Vercel's environment variables instead of `.env.local`.

## Trade-offs and known limitations

- Joining and leaving update the membership and the `memberCount` counter in two separate writes, without a
  transaction. A crash in between could leave the counter off by one. That's acceptable for a display number.
- Text search matches whole (stemmed) words: "react" finds "React" and "reacting", but "reac" finds nothing.
- Post slugs are generated from the title once, with a short random suffix, and don't change when the title is
  edited, so shared links keep working.
- A bookmark of a post that goes back to draft is hidden from `/bookmarks`, but still counted on the dashboard.
- Communities are curated through the seed script; there is no UI to create them.
