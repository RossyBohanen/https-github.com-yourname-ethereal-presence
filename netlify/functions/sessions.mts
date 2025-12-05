/**
 * Sessions API Function
 *
 * Serverless function for managing VR therapy session data.
 * Integrates with Netlify Blobs for session storage.
 */

import type { Context, Config } from "@netlify/functions";
import {
  listUserSessions,
  getSessionMetadata,
  deleteSessionRecording,
} from "../../lib/blobs/sessions";

/**
 * Extracts user ID from authorization header.
 * In production, this would validate a JWT or session token.
 */
function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  // In a real implementation, decode and validate the token
  // For now, we'll use a placeholder that would be replaced with actual auth logic
  const token = authHeader.slice(7);
  // Return token as user ID placeholder - replace with actual JWT validation
  return token || null;
}

/**
 * Handle POST requests - create a new session
 */
async function handlePost(
  req: Request,
  userId: string
): Promise<Response> {
  try {
    const body = await req.json();
    const { sessionType, duration, notes } = body;

    // Validate required fields
    if (!sessionType || !duration) {
      return new Response(
        JSON.stringify({ error: "sessionType and duration are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate session type
    const validTypes = ["grief-processing", "exposure-therapy", "memory-work", "guided-meditation"];
    if (!validTypes.includes(sessionType)) {
      return new Response(
        JSON.stringify({ error: "Invalid session type" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Create empty session recording with metadata
    const { storeSessionRecording } = await import("../../lib/blobs/sessions");

    // Create an empty placeholder for the session
    const emptyBlob = new Blob([], { type: "application/octet-stream" });

    await storeSessionRecording(userId, sessionId, emptyBlob, {
      duration: duration * 60, // Convert minutes to seconds
      sessionType: sessionType,
      file: { name: `session-${sessionId}`, type: "application/octet-stream", size: 0 },
    });

    // If notes were provided, add them
    if (notes) {
      const { addSessionNotes } = await import("../../lib/blobs/sessions");
      await addSessionNotes(userId, sessionId, notes);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: sessionId,
          sessionType,
          duration: duration * 60,
          notes,
          createdAt: Date.now(),
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle PUT requests - update session notes or metadata
 */
async function handlePut(
  req: Request,
  userId: string,
  sessionId?: string
): Promise<Response> {
  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: "Session ID is required for updates" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body = await req.json();
    const { notes } = body;

    if (notes !== undefined) {
      const { addSessionNotes } = await import("../../lib/blobs/sessions");
      await addSessionNotes(userId, sessionId, notes);
    }

    // Get updated metadata
    const metadata = await getSessionMetadata(userId, sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        session: metadata,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle GET requests - list sessions or get specific session metadata
 */
async function handleGet(
  req: Request,
  userId: string,
  sessionId?: string
): Promise<Response> {
  if (sessionId) {
    // Get specific session metadata
    const metadata = await getSessionMetadata(userId, sessionId);
    if (!metadata) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ session: metadata }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // List all sessions for the user
  const sessions = await listUserSessions(userId);
  return new Response(JSON.stringify({ sessions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Handle DELETE requests - delete a session
 */
async function handleDelete(
  req: Request,
  userId: string,
  sessionId?: string
): Promise<Response> {
  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: "Session ID is required for deletion" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  await deleteSessionRecording(userId, sessionId);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req: Request, context: Context): Promise<Response> => {
  // Authenticate the request
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Extract session ID from URL if present
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const sessionId = pathParts.length > 2 ? pathParts[2] : undefined;

  try {
    switch (req.method) {
      case "GET":
        return handleGet(req, userId, sessionId);
      case "POST":
        return handlePost(req, userId);
      case "PUT":
        return handlePut(req, userId, sessionId);
      case "DELETE":
        return handleDelete(req, userId, sessionId);
      default:
        return new Response(
          JSON.stringify({ error: `Method ${req.method} not allowed` }),
          {
            status: 405,
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Sessions API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: ["/api/sessions", "/api/sessions/*"],
};
