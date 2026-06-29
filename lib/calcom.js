// lib/calcom.js — Cal.com API v2 client (slots: 2024-09-04, bookings: 2024-08-13)

const CAL_API_BASE = "https://api.cal.com/v2";

async function calFetch(path, { method = "GET", body, calApiVersion = "2024-09-04" } = {}) {
  // Read at runtime so Netlify env vars are available
  const CAL_API_KEY = process.env.CAL_API_KEY;
  if (!CAL_API_KEY) {
    throw new Error("CAL_API_KEY environment variable is not set");
  }

  const res = await fetch(`${CAL_API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CAL_API_KEY}`,
      "cal-api-version": calApiVersion,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const txt = await res.text();
  let data = {};
  if (txt) {
    try {
      data = JSON.parse(txt);
    } catch (e) {
      // Non-JSON body (e.g. rate-limit plain text). Keep the raw text for messaging.
      data = { _raw: txt };
    }
  }

  if (!res.ok) {
    // Rate limit — give it a clear, tagged error the frontend can recognize
    if (res.status === 429) {
      const err = new Error("rate_limited");
      err.status = 429;
      err.rateLimited = true;
      throw err;
    }

    const msg =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      data?._raw ||
      `Cal.com error ${res.status}`;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    // Cal.com signals slot conflicts in different ways depending on version
    const lower = String(err.message).toLowerCase();
    if (
      res.status === 409 ||
      lower.includes("already has booking") ||
      lower.includes("no_available_users_found") ||
      lower.includes("slot is not available") ||
      lower.includes("booking already exists") ||
      lower.includes("not available")
    ) {
      err.conflict = true;
    }
    throw err;
  }

  return data;
}

/**
 * Get available slots for an event type.
 * Uses cal-api-version 2024-09-04 which expects `start` and `end` query params
 * and returns slots with `.start` (ISO string).
 *
 * Returns: array of ISO datetime strings.
 */
async function getAvailability({ username, eventTypeSlug, startTime, endTime, timeZone = "Europe/Sofia" }) {
  const params = new URLSearchParams({
    username,
    eventTypeSlug,
    start: startTime,
    end: endTime,
    timeZone,
  });

  const data = await calFetch(`/slots?${params.toString()}`);
  const slotsByDay = data?.data || {};

  // Response shape: { data: { "YYYY-MM-DD": [{ start: "ISO" }, ...] } }
  // Older shape:    { data: { slots: { "YYYY-MM-DD": [{ time: "ISO" }, ...] } } }
  const isolated = slotsByDay.slots && typeof slotsByDay.slots === "object" ? slotsByDay.slots : slotsByDay;

  return Object.values(isolated)
    .flat()
    .map((s) => s.start || s.time)
    .filter(Boolean);
}

/**
 * Create a booking by username + event type slug. No event-type ID lookup needed.
 * Uses cal-api-version 2024-08-13 (the booking endpoint version).
 *
 * Email is REQUIRED by Cal.com. If the customer doesn't provide one, we synthesize
 * a placeholder like "+359888123456@sms.classy-barbershop.local" so Cal.com accepts
 * the booking. The phone is the real contact method in that case.
 */
async function createBooking({
  username,
  eventTypeSlug,
  startTime,
  attendeeName,
  attendeeEmail,
  attendeePhone,
  timeZone = "Europe/Sofia",
  language = "bg",
}) {
  // Cal.com requires a syntactically valid email even when phone is the real channel.
  // Synthesize a placeholder tied to the phone so it's traceable.
  let email = (attendeeEmail || "").trim();
  if (!email && attendeePhone) {
    const digits = String(attendeePhone).replace(/[^\d]/g, "");
    email = `${digits}@sms.classy-barbershop.local`;
  }

  const attendee = {
    name: attendeeName,
    email,
    timeZone,
    language,
  };
  if (attendeePhone) {
    attendee.phoneNumber = attendeePhone;
  }

  // Metadata is for our own tracking. Cal.com v2 stores it and shows it in dashboard.
  // ALL metadata values must be strings — Cal.com rejects numbers/objects with 400.
  const metadata = {};
  if (attendeePhone)        metadata.phone = String(attendeePhone);
  if (!attendeeEmail && attendeePhone) metadata.emailSynthesized = "true";

  const result = await calFetch("/bookings", {
    method: "POST",
    calApiVersion: "2024-08-13",
    body: {
      eventTypeSlug,
      username,
      start: startTime,
      attendee,
      metadata,
    },
  });

  return result?.data || result;
}

module.exports = { getAvailability, createBooking };
