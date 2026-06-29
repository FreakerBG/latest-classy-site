// lib/dedup.js — Phone-based 24-hour rolling dedup using Netlify Blobs
// One booking per phone number per 24h, rolling window.

const { getStore, connectLambda } = require("@netlify/blobs");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Normalize a phone number: keep digits + leading +, strip spaces/dashes/parens.
 * Returns "" if it doesn't look like a phone.
 */
function normalizePhone(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  // Keep an optional leading + and digits only
  const hasPlus = s.startsWith("+");
  s = s.replace(/[^\d]/g, "");
  if (!s) return "";
  // If user typed "0888..." (Bulgarian national format), convert to +359
  if (!hasPlus && s.startsWith("0") && s.length >= 9) {
    s = "359" + s.slice(1);
    return "+" + s;
  }
  return (hasPlus ? "+" : "") + s;
}

/**
 * Returns true if this phone has booked within the last 24h.
 * Throws if storage fails (caller decides whether to allow or block).
 */
async function hasRecentBooking(event, phone) {
  const norm = normalizePhone(phone);
  if (!norm) return false;

  // Required for Lambda compatibility mode (exports.handler style)
  connectLambda(event);
  const store = getStore({ name: "phone-dedup", consistency: "strong" });

  const lastIso = await store.get(norm);
  if (!lastIso) return false;

  const last = new Date(lastIso).getTime();
  if (isNaN(last)) return false;

  return (Date.now() - last) < ONE_DAY_MS;
}

/**
 * Record a successful booking for this phone (timestamp = now).
 * Best-effort — failures here should not block the booking.
 */
async function recordBooking(event, phone) {
  const norm = normalizePhone(phone);
  if (!norm) return;

  try {
    connectLambda(event);
    const store = getStore({ name: "phone-dedup", consistency: "strong" });
    await store.set(norm, new Date().toISOString());
  } catch (e) {
    // Log but don't fail the booking
    console.error("dedup recordBooking failed:", e.message);
  }
}

module.exports = { hasRecentBooking, recordBooking, normalizePhone };
