// netlify/functions/book.js

const { createBooking } = require("../../lib/calcom");
const { BARBERS, SERVICES } = require("../../lib/catalog");
const { hasRecentBooking, recordBooking, normalizePhone } = require("../../lib/dedup");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const { barberId, serviceId, startTime, name, language } = body;
    const email = (body.email || "").trim();
    const rawPhone = (body.phone || "").trim();

    // Required: barber, service, time, name, phone
    if (!barberId || !serviceId || !startTime || !name || !rawPhone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const phone = normalizePhone(rawPhone);
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Невалиден телефонен номер / Invalid phone number" }) };
    }

    const barber  = BARBERS[barberId];
    const service = SERVICES[serviceId];
    if (!barber)  return { statusCode: 404, headers, body: JSON.stringify({ error: "Barber not found: " + barberId }) };
    if (!service) return { statusCode: 404, headers, body: JSON.stringify({ error: "Service not found: " + serviceId }) };

    // Anti-spam: 24h rolling per-phone limit. Failures here do NOT block bookings.
    try {
      const isDuplicate = await hasRecentBooking(event, phone);
      if (isDuplicate) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: "duplicate_phone",
            message: "Вече има резервация с този телефонен номер през последните 24 часа."
          })
        };
      }
    } catch (dedupErr) {
      console.error("dedup check failed (allowing booking):", dedupErr.message);
    }

    const booking = await createBooking({
      username:      barber.calUsername,
      eventTypeSlug: service.slug,
      startTime,
      attendeeName:  name,
      attendeeEmail: email,            // may be empty — calcom.js synthesizes one
      attendeePhone: phone,
      timeZone:      "Europe/Sofia",
      language:      language === "en" ? "en" : "bg",
    });

    // Record successful booking for dedup (best-effort)
    await recordBooking(event, phone);

    return { statusCode: 200, headers, body: JSON.stringify({ booking }) };
  } catch (err) {
    console.error("book error:", err);
    console.error("CAL_API_KEY present:", Boolean(process.env.CAL_API_KEY), "length:", (process.env.CAL_API_KEY || "").length);

    const message = typeof err === "string" ? err : (err.message || JSON.stringify(err));
    const status  = err.conflict ? 409 : (err.status && err.status < 600 ? err.status : 500);
    return { statusCode: status, headers, body: JSON.stringify({ error: message }) };
  }
};
