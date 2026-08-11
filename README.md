# SetOne — Landing Page

Static marketing / waitlist page. Plain HTML, CSS, JS. No framework, no build
step, no trackers. Works on any static host.

## Files

```
index.html          the page
styles.css          all styling (dark-first; opt-in light variant)
app.js              waitlist + launch-day App Store badge swap
favicon.png
assets/
  icon-green-1024.png / icon-cream-1024.png   brand mark
  fonts/DMMono-400.woff2 / DMMono-500.woff2   self-hosted (no CDN)
```

Everything is same-origin. The page makes exactly one outbound request, and
only when someone submits the waitlist form: a `POST` to Supabase. No fonts,
scripts, or pixels are fetched from third parties. That's the brand promise.

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly (`file://`) also works, but the waitlist POST
needs the page served over http(s).

## Deploy

Host-agnostic — pick either:

- **GitHub Pages**: push these files to a public repo, enable Pages on the
  default branch, root folder.
- **Netlify / Vercel**: drag-and-drop the folder, or point at the repo. No
  build command; publish directory is the repo root.

No host-specific features are used (no Netlify Forms, etc.).

## Waitlist backend (Supabase)

Reuses the existing project `cplvfccjhsctjxequhww`. Run once in the SQL editor:

```sql
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
-- Insert-only for the public: can join, can never read the list.
create policy "anon can join waitlist" on public.waitlist
  for insert to anon with check (true);
grant insert on public.waitlist to anon;
```

The publishable key in `app.js` is safe to embed — RLS is the wall. The public
can insert but never read. `201` = joined, `409` = already on the list; both
are shown as success. The SQL lives in `supabase-waitlist.sql` too.

## Launch day

One switch. In `app.js`, set:

```js
const APP_STORE_URL = "https://apps.apple.com/app/idXXXXXXXXX";
```

When set, the hero and closing waitlist forms swap to Apple's
"Download on the App Store" badge linking there. Before shipping, replace the
inline recreated badge in `app.js` (`appStoreBadgeMarkup`) with Apple's
official asset per their marketing guidelines.

## Light variant (optional)

Dark is the default. To preview the light palette, add `data-theme="light"` to
the `<html>` tag. No toggle is wired in the UI by design.
