import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Panel } from "@/components/panel";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { atlasStore } from "@/lib/store";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agent Console — Atlas Sanctum" },
      { name: "description", content: "AI agent runtime, scenario builder, and simulation results." },
    ],
  }),
  component: AgentsView,
});

interface AgentsResp {
  agents: { key: string; name: string; status: "online" | "processing" | "alert"; load: number; cycles: number; lastOutput: string }[];
}
interface SimResp {
  scenario: string; horizon: string;
  ecological_impact: number; economic_impact: number; risk_score: number; confidence: number;
  branches: { label: string; ecological: number; economic: number; risk: number }[];
  params: { intervention: number; horizonMonths: number; capitalAllocation: number; ecoPriority: number; scenarioName?: string };
  ts: number;
}

function AgentsView() {
  const agentsQ = useQuery<AgentsResp>({
    queryKey: ["agents-status"],
    queryFn: () => fetch("/api/agents/status").then((r) => r.json()),
    refetchInterval: 6000,
  });

  // Scenario builder state
  const [name, setName] = useState("S-12");
  const [intervention, setIntervention] = useState(0.5);
  const [horizon, setHorizon] = useState(18);
  const [capital, setCapital] = useState(0.4);
  const [ecoPriority, setEcoPriority] = useState(0.6);
  const [result, setResult] = useState<SimResp | null>(null);

  const runSim = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioName: name,
          intervention,
          horizonMonths: horizon,
          capitalAllocation: capital,
          ecoPriority,
        }),
      });
      if (!r.ok) throw new Error("Simulation failed");
      return r.json() as Promise<SimResp>;
    },
    onSuccess: (data) => {
      setResult(data);
      atlasStore.logAudit({
        kind: "simulation_run",
        actor: "operator",
        summary: `Scenario ${data.scenario} → risk ${data.risk_score.toFixed(2)} · conf ${(data.confidence * 100).toFixed(0)}%`,
        meta: data.params,
      });
      atlasStore.logAudit({
        kind: "agent_run",
        actor: "agent:simulation",
        summary: `Simulation Agent emitted branch projection (${data.branches.length} branches)`,
      });
      if (data.risk_score > 0.6) {
        atlasStore.raiseAlert({
          severity: "danger",
          source: "SIM-ENGINE",
          title: `${data.scenario} risk above critical`,
          detail: `Projected risk ${data.risk_score.toFixed(2)} exceeds intervention threshold.`,
          threshold: "risk > 0.60",
        });
      }
      toast.success("Scenario re-simulated", { description: data.scenario });
    },
    onError: () => toast.error("Simulation failed"),
  });

  const agents = agentsQ.data?.agents ?? [];

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">AI Runtime</span>
        <h1 className="text-2xl font-semibold tracking-tight">Agent <span className="text-primary">Console</span></h1>
      </div>

      {/* Agent grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {agents.length === 0 && (
          <div className="font-mono text-xs text-muted-foreground">… establishing link to agent runtime</div>
        )}
        {agents.map((a) => (
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

      {/* Scenario builder + result */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Scenario Builder" meta="OPERATOR INPUT" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sname" className="text-[10px] uppercase tracking-widest text-muted-foreground">Scenario ID</Label>
              <Input
                id="sname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>

            <SliderRow label="Intervention strength" value={intervention} setValue={setIntervention} />
            <SliderRow label="Capital allocation" value={capital} setValue={setCapital} />
            <SliderRow label="Ecological priority" value={ecoPriority} setValue={setEcoPriority} />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                <Label className="text-muted-foreground">Time horizon</Label>
                <span className="font-mono text-foreground">T+{horizon}mo</span>
              </div>
              <Slider min={6} max={60} step={6} value={[horizon]} onValueChange={([v]) => setHorizon(v)} />
            </div>

            <Button
              onClick={() => runSim.mutate()}
              disabled={runSim.isPending}
              className="w-full gap-2 font-mono text-xs uppercase tracking-widest"
            >
              {runSim.isPending ? <Sparkles className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
              {runSim.isPending ? "Simulating…" : "Run scenario"}
            </Button>
          </div>
        </Panel>

        <Panel
          title={result ? `Simulation · ${result.scenario}` : "Simulation Output"}
          meta={result ? `HORIZON ${result.horizon} · CONF ${(result.confidence * 100).toFixed(0)}%` : "AWAITING RUN"}
          className="lg:col-span-3"
        >
          {!result ? (
            <div className="flex h-48 items-center justify-center font-mono text-xs text-muted-foreground">
              › Configure scenario and run to project outcomes.
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Ecological Impact", value: result.ecological_impact, color: "oklch(0.82 0.16 195)" },
                  { label: "Economic Impact", value: result.economic_impact, color: "oklch(0.78 0.17 145)" },
                  { label: "Risk Score", value: result.risk_score, color: "oklch(0.68 0.22 25)" },
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
                  <BarChart data={result.branches} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" stroke="oklch(0.5 0.04 220)" fontSize={10} tickLine={false} />
                    <YAxis stroke="oklch(0.5 0.04 220)" fontSize={10} tickLine={false} domain={[0, 1]} />
                    <Bar dataKey="ecological" fill="oklch(0.82 0.16 195)" radius={[2, 2, 0, 0]}>
                      {result.branches.map((_, i) => <Cell key={i} />)}
                    </Bar>
                    <Bar dataKey="economic" fill="oklch(0.78 0.17 145)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="risk" fill="oklch(0.68 0.22 25)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

function SliderRow({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
        <Label className="text-muted-foreground">{label}</Label>
        <span className="font-mono text-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider min={0} max={1} step={0.05} value={[value]} onValueChange={([v]) => setValue(v)} />
    </div>
  );
}
