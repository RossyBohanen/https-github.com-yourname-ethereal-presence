import type { Context, Config } from "@netlify/functions";

// Sanitize input to prevent control character injection and limit length
// Note: JSON.stringify() provides automatic escaping for special characters
function sanitizeInput(input: string): string {
  // Remove control characters that could interfere with logs or parsing
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .slice(0, 100); // Limit to 100 characters to prevent abuse
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const rawName = url.searchParams.get("name") || "World";
  const name = sanitizeInput(rawName);

  return new Response(
    JSON.stringify({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
      geo: context.geo,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const config: Config = {
  path: "/api/hello",
};
