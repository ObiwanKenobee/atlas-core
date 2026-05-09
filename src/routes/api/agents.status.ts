import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/agents/status")({
  server: {
    handlers: {
      GET: async () => {
        const agents = [
          { key: "ecological", name: "Ecological Agent", status: "online",     load: 0.30 + Math.random() * 0.4, cycles: 18432 + Math.floor(Math.random() * 30), lastOutput: "Amazon basin: risk 0.31 — declining" },
          { key: "economic",   name: "Economic Agent",   status: "processing", load: 0.55 + Math.random() * 0.3, cycles: 22018 + Math.floor(Math.random() * 30), lastOutput: "Capital rebalance simulated: +2.4% stability" },
          { key: "governance", name: "Governance Agent", status: "online",     load: 0.20 + Math.random() * 0.2, cycles: 9123  + Math.floor(Math.random() * 10), lastOutput: "Proposal #047 evaluated → recommend approve" },
          { key: "simulation", name: "Simulation Agent", status: "alert",      load: 0.75 + Math.random() * 0.2, cycles: 5430  + Math.floor(Math.random() * 5),  lastOutput: "Scenario S-12: cascading risk detected" },
        ];
        return Response.json({ agents, ts: Date.now() });
      },
    },
  },
});
