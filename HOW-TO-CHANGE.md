# Classy Barber — How to change things

This is the **full Classy site** (landing page + online booking) using the same
Cal.com booking engine as the Osman test site. One page, one booking widget,
six barber providers.

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

There are **6 barbers**. Only **Osman** is live right now; the rest are
placeholders until their Cal.com accounts exist.

| id        | shown as   | role          | Cal.com username | live? |
|-----------|------------|---------------|------------------|-------|
| `osman`   | Осман А.   | Master Barber | `osman-classy`   | ✅ yes |
| `barber2` | Бръснар 2  | Master Barber | `barber2-classy` | ⬜ placeholder |
| `barber3` | Бръснар 3  | Barber        | `barber3-classy` | ⬜ placeholder |
| `barber4` | Бръснар 4  | Barber        | `barber4-classy` | ⬜ placeholder |
| `barber5` | Бръснар 5  | Barber        | `barber5-classy` | ⬜ placeholder |
| `barber6` | Бръснар 6  | Barber        | `barber6-classy` | ⬜ placeholder |

To activate a barber after you create their Cal.com account:

1. **`lib/catalog.js`** → set their real `calUsername` (must match `cal.com/<username>`).
2. **`index.html`** → in the `PROVIDERS` array near the top of the `<script>`,
   set their display name (`bg` / `en`), `roleBg/roleEn`, `specBg/specEn`,
   `initial/initialEn`, and `live:true`.

> The `id` (e.g. `barber2`) is what gets sent to Cal.com — keep it the same in
> both files. Only the display fields and `calUsername` change.

---

## 3. Services — `lib/catalog.js` AND `index.html`

### Bookable services (4 — available for online booking)

Each service's `slug` **must exactly match the Cal.com event-type slug**
(`cal.com/<username>/<slug>`):

| slug              | service (BG)             | duration |
|-------------------|--------------------------|----------|
| `classic-haircut` | Класическо подстригване  | 45 min |
| `beard-grooming`  | Оформяне на брада        | 30 min |
| `hair-coloring`   | Боядисване на коса       | 60 min |
| `kids-haircut`    | Детско подстригване      | 30 min |

All 6 barbers offer all four services.

### Marketing-only service (1 — visible but NOT bookable online)

| service  | shown as | notes |
|----------|----------|-------|
| Manicure | Маникюр  | Visible in the Services section with "In salon only / By request" badge. Not selectable in the booking flow. |

**Do not add manicure to `lib/catalog.js` or to any barber's `services` array.**
The service card is static HTML in the `#services` section of `index.html`.

---

## 4. Images

The page expects these image files in the repo root (drop them in):

- `logo.png` — the Classy logo shown top-left in the navbar.
- `logo.webp` — favicon (already included).
- `1.jpg`, `2.jpg`, `3.jpg` — salon photos (hero background, about, gallery).

Missing photos are hidden automatically, so the site still works without them —
but add them for the full look.

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
