import { createFileRoute } from "@tanstack/react-router";

interface ScenarioParams {
  intervention: number;     // 0..1
  horizonMonths: number;    // 6..60
  capitalAllocation: number;// 0..1
  ecoPriority: number;      // 0..1
  scenarioName?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export const Route = createFileRoute("/api/simulation/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Partial<ScenarioParams>;
        const p: ScenarioParams = {
          intervention: body.intervention ?? 0.5,
          horizonMonths: body.horizonMonths ?? 18,
          capitalAllocation: body.capitalAllocation ?? 0.4,
          ecoPriority: body.ecoPriority ?? 0.6,
          scenarioName: body.scenarioName ?? "S-12",
        };

        // Simple deterministic-ish model
        const eco = clamp(0.85 - p.intervention * 0.5 - p.ecoPriority * 0.2 + (Math.random() - 0.5) * 0.05);
        const econ = clamp(0.40 + p.capitalAllocation * 0.4 - p.intervention * 0.1 + (Math.random() - 0.5) * 0.05);
        const risk = clamp(0.75 - p.intervention * 0.45 - p.ecoPriority * 0.15 + (Math.random() - 0.5) * 0.05);
        const confidence = clamp(0.6 + (1 - Math.abs(0.5 - p.intervention)) * 0.3);

        const branches = [
          { label: "Status quo",    ecological: clamp(eco + 0.2), economic: clamp(econ - 0.05), risk: clamp(risk + 0.15) },
          { label: "Intervention A", ecological: eco, economic: econ, risk },
          { label: "Intervention B", ecological: clamp(eco - 0.1), economic: clamp(econ + 0.1), risk: clamp(risk - 0.1) },
        ];

        return Response.json({
          scenario: `${p.scenarioName} — ${p.horizonMonths}mo horizon`,
          horizon: `T+${p.horizonMonths}mo`,
          ecological_impact: Number(eco.toFixed(2)),
          economic_impact: Number(econ.toFixed(2)),
          risk_score: Number(risk.toFixed(2)),
          confidence: Number(confidence.toFixed(2)),
          branches,
          params: p,
          ts: Date.now(),
        });
      },
    },
  },
});
