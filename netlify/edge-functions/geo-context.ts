/**
 * Geolocation Context Edge Function
 *
 * Adds geographic context to requests for the Ethereal Presence therapeutic application.
 * This enables location-aware content delivery and timezone-appropriate session scheduling.
 */

import type { Context, Config } from "@netlify/edge-functions";

interface GeoContext {
  country: string;
  region: string;
  city: string;
  timezone: string;
  locale: string;
}

export default async (req: Request, context: Context): Promise<Response> => {
  // Get geographic information from the edge context
  const geo = context.geo;

  const geoContext: GeoContext = {
    country: geo.country?.code || "unknown",
    region: geo.subdivision?.code || "unknown",
    city: geo.city || "unknown",
    timezone: geo.timezone || "UTC",
    locale: req.headers.get("Accept-Language")?.split(",")[0] || "en-US",
  };

  // Continue to the next handler (origin or function) with geo context in headers
  const response = await context.next();

  // Clone the response to add custom headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-Geo-Country", geoContext.country);
  newHeaders.set("X-Geo-Timezone", geoContext.timezone);
  newHeaders.set("X-Geo-Locale", geoContext.locale);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

export const config: Config = {
  path: "/api/*",
};
