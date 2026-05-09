import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/components/panel";
import { GlobeViz } from "@/components/globe-viz";
import { EVENTS, fmtTime } from "@/lib/atlas-data";
import { atlasStore, useAtlasStore } from "@/lib/store";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Cpu, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command — Atlas Sanctum" },
      { name: "description", content: "Live planetary intelligence dashboard." },
    ],
  }),
  component: CommandView,
});

interface TelemetryResp {
  series: { t: number; ecological: number; economic: number; risk: number }[];
  stats: { agents_online: number; events_24h: number; risk_index: number; active_alerts: number };
  ts: number;
}
interface AgentsResp {
  agents: { key: string; name: string; status: "online" | "processing" | "alert"; load: number; cycles: number; lastOutput: string }[];
}

function CommandView() {
  const telemetry = useQuery<TelemetryResp>({
    queryKey: ["telemetry"],
    queryFn: () => fetch("/api/telemetry").then((r) => r.json()),
    refetchInterval: 5000,
  });

  const agentsQ = useQuery<AgentsResp>({
    queryKey: ["agents-status"],
    queryFn: () => fetch("/api/agents/status").then((r) => r.json()),
    refetchInterval: 6000,
  });

  // Log telemetry refresh + auto-raise alert on high risk
  const activeAlerts = useAtlasStore((s) => s.alerts.filter((a) => !a.ack).length);
  useEffect(() => {
    if (!telemetry.data) return;
    atlasStore.logAudit({
      kind: "telemetry_update",
      actor: "system",
      summary: `Telemetry refresh · risk ${telemetry.data.stats.risk_index.toFixed(2)}`,
      meta: { stats: telemetry.data.stats },
    });
    if (telemetry.data.stats.risk_index > 0.5) {
      atlasStore.raiseAlert({
        severity: "warn",
        source: "TELEMETRY",
        title: "Risk index elevated",
        detail: `Composite risk ${telemetry.data.stats.risk_index.toFixed(2)} above watch threshold.`,
        threshold: "risk > 0.50",
      });
    }
  }, [telemetry.data?.ts]);

  const stats = telemetry.data?.stats;
  const series = telemetry.data?.series ?? [];
  const agents = agentsQ.data?.agents ?? [];

  const kpis = [
    { label: "Agents Online", value: stats ? `${stats.agents_online} / 4` : "— / —", icon: Cpu, tone: "text-signal" },
    { label: "Events / 24h", value: stats ? stats.events_24h.toLocaleString() : "—", icon: Activity, tone: "text-foreground" },
    { label: "Risk Index", value: stats ? stats.risk_index.toFixed(2) : "—", icon: TrendingUp, tone: "text-warn" },
    { label: "Active Alerts", value: String(activeAlerts), icon: AlertTriangle, tone: activeAlerts > 0 ? "text-danger" : "text-signal" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Mission Control · {telemetry.isFetching ? "syncing…" : "stable"}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Planetary Intelligence <span className="text-primary">// Live</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((s) => (
          <div key={s.label} className="panel rounded-sm p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <s.icon className={`h-3.5 w-3.5 ${s.tone}`} />
            </div>
            <div className={`mt-2 font-mono text-2xl font-semibold ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Geosphere" meta="EQR · 7 ZONES" className="lg:col-span-2">
          <GlobeViz />
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[oklch(0.82_0.16_195)]" />nominal</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[oklch(0.82_0.17_75)]" />elevated</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[oklch(0.68_0.22_25)]" />critical</span>
          </div>
        </Panel>

        <Panel title="Agent Stack" meta={agentsQ.isFetching ? "SYNC" : "RUNTIME"}>
          <ul className="space-y-2">
            {agents.length === 0 && (
              <li className="font-mono text-xs text-muted-foreground">… establishing link</li>
            )}
            {agents.map((a) => (
              <li key={a.key} className="rounded-sm border border-border/40 bg-background/40 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider">{a.name}</span>
                  <span className={`text-[10px] uppercase tracking-widest ${
                    a.status === "alert" ? "text-danger" : a.status === "processing" ? "text-warn" : "text-signal"
                  }`}>● {a.status}</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{
                    width: `${a.load * 100}%`,
                    background: a.status === "alert" ? "var(--danger)" : "var(--gradient-signal)",
                  }} />
                </div>
                <p className="mt-1.5 truncate text-[10px] text-muted-foreground">{a.lastOutput}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Signal Telemetry" meta="T-30 → T0 · LIVE" className="lg:col-span-2">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.16 195)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.82 0.16 195)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.17 145)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.17 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.22 25)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.68 0.22 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="oklch(0.5 0.04 220)" fontSize={10} tickLine={false} />
                <YAxis stroke="oklch(0.5 0.04 220)" fontSize={10} tickLine={false} domain={[0, 1]} />
                <Area type="monotone" dataKey="ecological" stroke="oklch(0.82 0.16 195)" fill="url(#g1)" strokeWidth={1.5} isAnimationActive={false} />
                <Area type="monotone" dataKey="economic" stroke="oklch(0.78 0.17 145)" fill="url(#g2)" strokeWidth={1.5} isAnimationActive={false} />
                <Area type="monotone" dataKey="risk" stroke="oklch(0.68 0.22 25)" fill="url(#g3)" strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Event Stream" meta="LIVE">
          <ul className="space-y-1.5 font-mono text-[11px] leading-tight">
            {EVENTS.map((e) => (
              <li key={e.id} className="border-l-2 pl-2"
                  style={{ borderColor: e.severity === "danger" ? "var(--danger)" : e.severity === "warn" ? "var(--warn)" : "var(--signal)" }}>
                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-muted-foreground">
                  <span>{e.source}</span>
                  <span>{fmtTime(e.ts)}</span>
                </div>
                <div className="text-foreground/90">{e.message}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
