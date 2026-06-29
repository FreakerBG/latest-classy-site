// netlify/functions/availability.js

const { getAvailability } = require("../../lib/calcom");
const { BARBERS, SERVICES } = require("../../lib/catalog");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
    "Netlify-CDN-Cache-Control": "no-store",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  try {
    const { barberId, serviceId, date } = event.queryStringParameters || {};
    if (!barberId || !serviceId || !date) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing barberId, serviceId or date" }) };
    }

    const barber  = BARBERS[barberId];
    const service = SERVICES[serviceId];
    if (!barber)  return { statusCode: 404, headers, body: JSON.stringify({ error: "Barber not found: " + barberId }) };
    if (!service) return { statusCode: 404, headers, body: JSON.stringify({ error: "Service not found: " + serviceId }) };

    // Use full-day window in UTC. Cal.com filters server-side to the event type's
    // configured availability (working hours).
    const startTime = `${date}T00:00:00.000Z`;
    const endTime   = `${date}T23:59:59.000Z`;

    const slots = await getAvailability({
      username:      barber.calUsername,
      eventTypeSlug: service.slug,
      startTime,
      endTime,
      timeZone:      "Europe/Sofia",
    });

    return { statusCode: 200, headers, body: JSON.stringify({ slots }) };
  } catch (err) {
    // Log diagnostic info — never expose the key, only whether it exists
    console.error("availability error:", err);
    console.error("CAL_API_KEY present:", Boolean(process.env.CAL_API_KEY), "length:", (process.env.CAL_API_KEY || "").length);

    const message = typeof err === "string" ? err : (err.message || JSON.stringify(err));
    return { statusCode: 500, headers, body: JSON.stringify({ error: message }) };
  }
};
