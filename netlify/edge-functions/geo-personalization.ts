import type { Context, Config } from "@netlify/edge-functions";

export default async (_req: Request, context: Context) => {
  // Get the response from the origin (or next in chain)
  const response = await context.next();

  // Get the HTML content
  const html = await response.text();

  // Get visitor's country for personalization
  const country = context.geo?.country?.name || "Unknown";
  const city = context.geo?.city || "Unknown";

  // Inject a welcome banner based on geo location
  const banner = `
    <div id="geo-banner" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 8px 16px;
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      z-index: 9999;
      animation: slideDown 0.5s ease-out;
    ">
      Welcome, visitor from ${city}, ${country}! 🌍
    </div>
    <style>
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      body { padding-top: 40px !important; }
    </style>
  `;

  // Inject the banner after the opening body tag
  const modifiedHtml = html.replace(
    "<body>",
    `<body>${banner}`
  );

  return new Response(modifiedHtml, {
    status: response.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": response.headers.get("Cache-Control") || "public, max-age=0, must-revalidate",
    },
  });
};

export const config: Config = {
  path: "/",
  excludedPath: ["/api/*", "/.netlify/*", "/assets/*"],
};
