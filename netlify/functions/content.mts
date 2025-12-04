/**
 * Content API Function
 *
 * Serverless function for accessing therapeutic content.
 * Integrates with Netlify Blobs for content storage.
 */

import type { Context, Config } from "@netlify/functions";
import {
  getCatalog,
  getAllCatalogs,
  getTherapeuticContent,
  searchByTags,
  searchByLanguage,
  CONTENT_CATEGORIES,
  type ContentCategory,
} from "../../lib/blobs/content";

export default async (req: Request, context: Context): Promise<Response> => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // GET /api/content - List all content or filter by category
  // GET /api/content/:id - Get specific content
  // GET /api/content?category=meditation - Filter by category
  // GET /api/content?tags=anxiety,stress - Search by tags
  // GET /api/content?language=en - Filter by language

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Check for specific content ID
    const contentId = pathParts.length > 2 ? pathParts[2] : undefined;

    if (contentId) {
      // Get specific content
      const content = await getTherapeuticContent(contentId);
      if (!content) {
        return new Response(
          JSON.stringify({ error: "Content not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Return content metadata (not the actual data for listing)
      return new Response(
        JSON.stringify({
          content: {
            key: `content/${contentId}`,
            ...content.metadata,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle query parameters
    const category = url.searchParams.get("category");
    const tags = url.searchParams.get("tags");
    const language = url.searchParams.get("language");

    let contentItems: any[] = [];

    if (category) {
      // Filter by specific category
      const validCategories = Object.values(CONTENT_CATEGORIES);
      if (!validCategories.includes(category as ContentCategory)) {
        return new Response(
          JSON.stringify({
            error: "Invalid category",
            validCategories,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      contentItems = await getCatalog(category as ContentCategory);
    } else if (tags) {
      // Search by tags
      const tagList = tags.split(",").map((t) => t.trim());
      contentItems = await searchByTags(tagList);
    } else if (language) {
      // Filter by language
      contentItems = await searchByLanguage(language);
    } else {
      // Get all content from all categories
      const allCatalogs = await getAllCatalogs();
      contentItems = Object.values(allCatalogs).flat();
    }

    return new Response(
      JSON.stringify({
        content: contentItems,
        total: contentItems.length,
        categories: Object.values(CONTENT_CATEGORIES),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Content API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config: Config = {
  path: ["/api/content", "/api/content/*"],
};
