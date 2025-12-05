/**
 * Request Logger Edge Function
 *
 * Logs API requests for monitoring and debugging purposes.
 * Runs at the edge for minimal latency impact.
 */

import type { Context, Config } from "@netlify/edge-functions";

export default async (req: Request, context: Context): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Add request ID header for tracing
  const modifiedRequest = new Request(req, {
    headers: new Headers(req.headers),
  });
  modifiedRequest.headers.set("X-Request-ID", requestId);

  // Continue to the next handler
  const response = await context.next();

  const duration = Date.now() - startTime;

  // Log request details (visible in Netlify function logs)
  console.log(
    JSON.stringify({
      requestId,
      method: req.method,
      path: new URL(req.url).pathname,
      status: response.status,
      duration: `${duration}ms`,
      userAgent: req.headers.get("User-Agent"),
      timestamp: new Date().toISOString(),
    })
  );

  // Add request ID and timing to response headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-Request-ID", requestId);
  newHeaders.set("X-Response-Time", `${duration}ms`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

export const config: Config = {
  path: "/api/*",
};
