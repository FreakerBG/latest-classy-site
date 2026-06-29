# Latest — Classy Site

Full marketing site + online booking for **Classy Barber & Academy Salon** (Sofia).
Single-page site (`index.html`) with an integrated 4-step booking widget powered by
**Cal.com API v2** via **Netlify Functions**.

- **Booking engine:** Cal.com (same logic as the Osman test site)
- **Providers:** 6 (Osman live; 4 barber placeholders; 1 manicure specialist)
- **Services:** Classic Haircut, Beard Grooming, Hair Coloring, Kids' Cut, Manicure (no prices shown)
- **Languages:** Bulgarian / English toggle

## Structure

```
index.html                       # whole site + booking UI
lib/calcom.js                    # Cal.com API client
lib/catalog.js                   # barbers + services (edit me)
lib/dedup.js                     # 1 booking per phone / 24h
netlify/functions/availability.js# free slots
netlify/functions/book.js        # create booking
netlify.toml                     # Netlify config
```

## Setup

1. `npm install`
2. Set `CAL_API_KEY` in Netlify env vars (never commit it).
3. `netlify dev` to run locally, or deploy to Netlify.

See **HOW-TO-CHANGE.md** for activating barbers, editing services, and adding images.
