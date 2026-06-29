# Classy Barber — How to change things

This is the **full Classy site** (landing page + online booking) using the same
Cal.com booking engine as the Osman test site. One page, one booking widget,
six providers.

---

## 1. The booking engine (Cal.com)

The booking talks to **Cal.com API v2** through two Netlify Functions:

- `netlify/functions/availability.js` → returns free time slots
- `netlify/functions/book.js` → creates the real booking

The shared logic lives in `lib/`:

- `lib/calcom.js` — Cal.com client (do not edit unless the API changes)
- `lib/catalog.js` — **the list of barbers and services** (edit this)
- `lib/dedup.js` — blocks duplicate bookings (1 per phone / 24h)

### Required environment variable (set in Netlify, never in code)

```
CAL_API_KEY = <your Cal.com API key>
```

Netlify → Site settings → Environment variables → Add `CAL_API_KEY`.
**Do not** put the key in any file in the repo.

---

## 2. Barbers / providers — `lib/catalog.js` AND `index.html`

There are **6 providers**. Only **Osman** is live right now; the rest are
placeholders until their Cal.com accounts exist.

| id        | shown as       | Cal.com username | live? |
|-----------|----------------|------------------|-------|
| `osman`   | Осман А.       | `osman-classy`   | ✅ yes |
| `barber2` | Бръснар 2      | `barber2-classy` | ⬜ placeholder |
| `barber3` | Бръснар 3      | `barber3-classy` | ⬜ placeholder |
| `barber4` | Бръснар 4      | `barber4-classy` | ⬜ placeholder |
| `barber5` | Бръснар 5      | `barber5-classy` | ⬜ placeholder |
| `nails`   | Маникюрист     | `nails-classy`   | ⬜ placeholder (Manicure only) |

To activate a barber after you create their Cal.com account:

1. **`lib/catalog.js`** → set their real `calUsername` (must match `cal.com/<username>`).
2. **`index.html`** → in the `PROVIDERS` array near the top of the `<script>`,
   set their display name (`bg` / `en`), `roleBg/roleEn`, `specBg/specEn`,
   `initial/initialEn`, and `live:true`.

> The `id` (e.g. `barber2`) is what gets sent to Cal.com — keep it the same in
> both files. Only the display fields and `calUsername` change.

---

## 3. Services — `lib/catalog.js` AND `index.html`

Five services. Each service's `slug` **must exactly match the Cal.com event-type
slug** (`cal.com/<username>/<slug>`):

| slug              | service (BG)             | duration |
|-------------------|--------------------------|----------|
| `classic-haircut` | Класическо подстригване  | 45 min |
| `beard-grooming`  | Оформяне на брада        | 30 min |
| `hair-coloring`   | Боядисване на коса       | 60 min |
| `kids-haircut`    | Детско подстригване      | 30 min |
| `manicure`        | Маникюр                  | 45 min |

- The 5 barbers offer the first four. The **Маникюрист** offers only `manicure`.
- Edit who offers what in the `services:[...]` array of each provider
  (both `lib/catalog.js` and the `PROVIDERS` array in `index.html`).
- **Prices are intentionally not shown** anywhere on the site.

> Each barber needs an event type with the matching slug in their own Cal.com
> account for booking to work for that service.

---

## 4. Images

The page expects these image files in the repo root (drop them in):

- `Logo.jpg` — the Classy logo (shown in the hero). If missing, it falls back to `logo.webp`.
- `1.jpg`, `2.jpg`, `3.jpg` — salon photos (hero background, about, gallery).

Missing photos are hidden automatically, so the site still works without them —
but add them for the full look. `logo.webp` is already included and used as the favicon.

---

## 5. Other quick edits (in `index.html`)

- **Phone number** → search `loc_phone` (appears twice, BG + EN).
- **Address / hours / email** → search `loc_addr`, `loc_hours`, `loc_email_label`.
- **Map** → replace the `<iframe>` `src` in the `#location` section.
- **Social links** → the `footer-col` "Последвайте ни" / "Follow Us" list.

---

## 6. Run / deploy

```bash
npm install            # installs @netlify/blobs (used by dedup)
netlify dev            # local dev with functions at /.netlify/functions/*
```

Deploy on Netlify (publish dir = `.`, functions dir = `netlify/functions` —
already set in `netlify.toml`). Remember to set `CAL_API_KEY` in Netlify.
