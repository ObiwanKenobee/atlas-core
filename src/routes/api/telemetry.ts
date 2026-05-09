import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/telemetry")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        const series = Array.from({ length: 30 }, (_, i) => ({
          t: i,
          ecological: 0.4 + 0.2 * Math.sin((i + now / 60000) / 4),
          economic: 0.5 + 0.15 * Math.cos(i / 5),
          risk: 0.3 + 0.25 * Math.sin(i / 6 + 1) + (Math.random() - 0.5) * 0.04,
        }));
        const stats = {
          agents_online: 4,
          events_24h: 1280 + Math.floor(Math.random() * 30),
          risk_index: Number((0.4 + Math.random() * 0.15).toFixed(2)),
          active_alerts: 2,
        };
        return Response.json({ series, stats, ts: now });
      },
    },
  },
});
