// lib/catalog.js — single source of truth for the Cal.com booking backend.
//
// HOW THIS MAPS TO CAL.COM
// ────────────────────────
// • Each barber has a `calUsername` = the Cal.com username whose calendar/availability
//   should be used (e.g. cal.com/osman-classy → "osman-classy").
// • Each service `slug` MUST match the Cal.com *event type* slug exactly
//   (e.g. cal.com/osman-classy/classic-haircut → "classic-haircut").
// • Prices are stored here as metadata only. They are NOT shown to the customer.
//
// Only Osman is live today (osman-classy). The other barbers use placeholder
// usernames — replace them with the real Cal.com usernames once those accounts
// exist. See HOW-TO-CHANGE.md.

const SERVICES = {
  "classic-haircut": { slug: "classic-haircut", duration: 45, price: null },
  "beard-grooming":  { slug: "beard-grooming",  duration: 30, price: null },
  "hair-coloring":   { slug: "hair-coloring",   duration: 60, price: null },
  "kids-haircut":    { slug: "kids-haircut",    duration: 30, price: null },
  "manicure":        { slug: "manicure",        duration: 45, price: null },
};

// Services every barber offers (everything except the nails-only service).
const BARBER_SERVICES = ["classic-haircut", "beard-grooming", "hair-coloring", "kids-haircut"];

const BARBERS = {
  // ── LIVE — booking is fully wired for Osman ──
  osman: {
    name: "Осман А.",
    nameEn: "Osman A.",
    calUsername: "osman-classy", // connected to Osman's Google Calendar via Cal.com
    services: BARBER_SERVICES,
  },

  // ── PLACEHOLDERS — set real names + Cal.com usernames later ──
  barber2: { name: "Бръснар 2", nameEn: "Barber 2", calUsername: "barber2-classy", services: BARBER_SERVICES },
  barber3: { name: "Бръснар 3", nameEn: "Barber 3", calUsername: "barber3-classy", services: BARBER_SERVICES },
  barber4: { name: "Бръснар 4", nameEn: "Barber 4", calUsername: "barber4-classy", services: BARBER_SERVICES },
  barber5: { name: "Бръснар 5", nameEn: "Barber 5", calUsername: "barber5-classy", services: BARBER_SERVICES },

  // ── DEDICATED NAILS / MANICURE SPECIALIST ──
  nails: { name: "Маникюрист", nameEn: "Nail Specialist", calUsername: "nails-classy", services: ["manicure"] },
};

module.exports = { BARBERS, SERVICES, BARBER_SERVICES };
