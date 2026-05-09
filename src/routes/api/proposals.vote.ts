import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/proposals/vote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { id?: string; vote?: "yes" | "no" };
        if (!body.id || (body.vote !== "yes" && body.vote !== "no")) {
          return new Response(JSON.stringify({ error: "id and vote required" }), { status: 400 });
        }
        // Simulated agent re-evaluation
        const consensus = Math.random() > 0.3 ? "approve" : "modify";
        return Response.json({
          id: body.id,
          vote: body.vote,
          recordedAt: Date.now(),
          agentRecommendation: consensus,
        });
      },
    },
  },
});
