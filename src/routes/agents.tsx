import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/panel";
import { AGENTS, SIMULATION_RESULT } from "@/lib/atlas-data";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agent Console — Atlas Sanctum" },
      { name: "description", content: "AI agent runtime, outputs, and simulation results." },
    ],
  }),
  component: AgentsView,
});

function AgentsView() {
  const [scenario, setScenario] = useState(SIMULATION_RESULT);
  const [running, setRunning] = useState(false);

  const reroll = () => {
    setRunning(true);
    setTimeout(() => {
      const jitter = (n: number) => Math.max(0, Math.min(1, n + (Math.random() - 0.5) * 0.2));
      setScenario({
        ...scenario,
        ecological_impact: jitter(scenario.ecological_impact),
        economic_impact: jitter(scenario.economic_impact),
        risk_score: jitter(scenario.risk_score),
        confidence: jitter(scenario.confidence),
        branches: scenario.branches.map((b) => ({
          ...b, ecological: jitter(b.ecological), economic: jitter(b.economic), risk: jitter(b.risk),
        })),
      });
      setRunning(false);
      toast.success("Scenario re-simulated", { description: "Agent consensus updated." });
    }, 900);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">AI Runtime</span>
          <h1 className="text-2xl font-semibold tracking-tight">Agent <span className="text-primary">Console</span></h1>
        </div>
        <Button onClick={reroll} disabled={running} className="gap-2 font-mono text-xs uppercase tracking-widest">
          <Play className="h-3.5 w-3.5" /> {running ? "Simulating…" : "Re-run scenario"}
        </Button>
      </div>

      {/* Agent grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {AGENTS.map((a) => (
          <Panel key={a.key} title={a.name} meta={`CYC ${a.cycles.toLocaleString()}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-widest ${
                a.status === "alert" ? "text-danger" : a.status === "processing" ? "text-warn" : "text-signal"
              }`}>● {a.status}</span>
              <span className="font-mono text-xs text-muted-foreground">load {(a.load * 100).toFixed(0)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full" style={{
                width: `${a.load * 100}%`,
                background: a.status === "alert" ? "var(--danger)" : "var(--gradient-signal)",
              }} />
            </div>
            <div className="mt-3 rounded-sm border border-border/40 bg-background/40 p-2 font-mono text-[11px]">
              <span className="text-muted-foreground">$ output › </span>
              <span className="text-foreground/90">{a.lastOutput}</span>
              <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-primary/80" />
            </div>
          </Panel>
        ))}
      </div>

      {/* Simulation result */}
      <Panel title={`Simulation · ${scenario.scenario}`} meta={`HORIZON ${scenario.horizon} · CONF ${(scenario.confidence * 100).toFixed(0)}%`}>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Ecological Impact", value: scenario.ecological_impact, color: "oklch(0.82 0.16 195)" },
            { label: "Economic Impact", value: scenario.economic_impact, color: "oklch(0.78 0.17 145)" },
            { label: "Risk Score", value: scenario.risk_score, color: "oklch(0.68 0.22 25)" },
          ].map((m) => (
            <div key={m.label} className="rounded-sm border border-border/40 bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
              <div className="mt-1 font-mono text-3xl font-semibold" style={{ color: m.color }}>
                {m.value.toFixed(2)}
              </div>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-full" style={{ width: `${m.value * 100}%`, backgroundColor: m.color }} />
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Branch comparison</h3>
        <div className="mt-2 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenario.branches} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" stroke="oklch(0.5 0.04 220)" fontSize={10} tickLine={false} />
              <YAxis stroke="oklch(0.5 0.04 220)" fontSize={10} tickLine={false} domain={[0, 1]} />
              <Bar dataKey="ecological" fill="oklch(0.82 0.16 195)" radius={[2, 2, 0, 0]}>
                {scenario.branches.map((_, i) => <Cell key={i} />)}
              </Bar>
              <Bar dataKey="economic" fill="oklch(0.78 0.17 145)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="risk" fill="oklch(0.68 0.22 25)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
