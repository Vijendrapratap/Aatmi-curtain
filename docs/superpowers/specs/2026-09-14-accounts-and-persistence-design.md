# Accounts, brands and persistence

Date: 2026-09-14
Status: approved in conversation, implemented directly

## Decisions

- **Backend: built into this server.** No third-party service. Accounts,
  brands, invites, sessions and brand data live in a SQLite file
  (`DATA_DIR/aatmi.sqlite`, default `./data`) through Node's built-in
  `node:sqlite`. Images live as files under `DATA_DIR/images` and are
  served at `/images/<id>.<ext>`.
- **One brand per login.** A user belongs to exactly one brand (or is a
  platform admin). The brand switcher in the header goes away; the
  header shows the user's brand.
- **Admin creates brands and sends invites.** There is no public sign-up.
  An admin creates a brand, then creates an invite for an email address;
  the invite is a link the admin sends (the app shows the link; email
  delivery is not part of this work). The invitee opens the link, sets
  their name and password, and is logged in to that brand.
- **First admin** is bootstrapped from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  when the server starts and no admin exists.

## Data

Tables: `brands(id, name, slug, status, accent, monthly_cap, monthly_used, created_at)`,
`users(id, email UNIQUE, name, password_hash, role 'admin'|'brand', brand_id, created_at)`,
`invites(token, email, brand_id, role, created_by, expires_at, used_at)`,
`sessions(token, user_id, expires_at)`,
`documents(brand_id, collection, id, json, updated_at)` for designs, fabrics and templates.

Passwords: `scrypt` with a per-user salt. Sessions: 32-byte random token in
an `HttpOnly`, `SameSite=Lax` cookie, 30-day expiry. Invites expire after
7 days and are single-use.

Any `data:image/...` string inside a stored document is written to the
image store and replaced with its `/images/...` URL before the JSON is
saved, so the database stays small and images are served as files.

## API

| Route | Who | Purpose |
| --- | --- | --- |
| `POST /api/auth/login` | anyone | `{ email, password }` → sets cookie, returns `{ user, brand }` |
| `POST /api/auth/logout` | user | clears the cookie |
| `GET /api/auth/me` | user | `{ user, brand }` or 401 |
| `GET /api/auth/invite/:token` | anyone | `{ email, brandName }` or 404/410 |
| `POST /api/auth/invite/:token/accept` | anyone | `{ name, password }` → creates the user, logs in |
| `GET /api/admin/brands` | admin | brands with user counts |
| `POST /api/admin/brands` | admin | `{ name, accent? }` → brand |
| `PATCH /api/admin/brands/:id` | admin | `{ status?, name?, monthly_cap? }` |
| `POST /api/admin/brands/:id/invites` | admin | `{ email }` → `{ token, url, expiresAt }` |
| `GET /api/data/:collection` | user | all documents of the user's brand |
| `PUT /api/data/:collection/:id` | user | upsert one document (images externalised) |
| `DELETE /api/data/:collection/:id` | user | remove one document |

`collection` is one of `designs`, `fabrics`, `templates`. Render jobs take
the brand from the session, not the body; the quota is the brand's.

## Client

- **Login page** replaces the demo auto-login. An invite link
  (`/invite/<token>`) opens the accept form instead.
- **Admin page** (admins only, reached from the account menu): brand list
  with status and users, create brand, create invite (shows the link to
  copy), suspend/activate.
- **Header:** brand name and user, sign out; no switcher.
- **Stores:** on login, designs, fabrics and templates for the brand are
  loaded from `/api/data`; every save/update/delete writes through. The
  built-in catalog (brand-less styles and fabrics) is still merged in as
  platform defaults.
- The onboarding wizard is no longer routed.

## Out of scope

Email delivery of invites, password reset, multi-user roles inside a
brand, moving the render job store out of memory.
