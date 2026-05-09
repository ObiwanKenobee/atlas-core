import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/panel";
import { TIMESERIES, AGENTS, REGIONS } from "@/lib/atlas-data";
import {
  Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Atlas Sanctum" },
      { name: "description", content: "System metrics, regional risk, and agent throughput." },
    ],
  }),
  component: AnalyticsView,
});

function AnalyticsView() {
  const radarData = AGENTS.map((a) => ({ subject: a.name.split(" ")[0], load: a.load, cycles: a.cycles / 25000 }));
  const regionData = REGIONS.map((r) => ({ name: r.code, risk: r.risk }));

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Observability</span>
        <h1 className="text-2xl font-semibold tracking-tight">System <span className="text-primary">Analytics</span></h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Signal Trajectories" meta="T-30 → T0" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TIMESERIES} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.32 0.04 230 / 0.3)" strokeDasharray="2 4" />
                <XAxis dataKey="t" stroke="oklch(0.5 0.04 220)" fontSize={10} />
                <YAxis stroke="oklch(0.5 0.04 220)" fontSize={10} domain={[0, 1]} />
                <Line type="monotone" dataKey="ecological" stroke="oklch(0.82 0.16 195)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="economic" stroke="oklch(0.78 0.17 145)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="risk" stroke="oklch(0.68 0.22 25)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Agent Profile" meta="LOAD vs CYCLES">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.32 0.04 230 / 0.5)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "oklch(0.7 0.04 220)", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: "oklch(0.5 0.04 220)", fontSize: 9 }} />
                <Radar dataKey="load" stroke="oklch(0.82 0.16 195)" fill="oklch(0.82 0.16 195)" fillOpacity={0.3} />
                <Radar dataKey="cycles" stroke="oklch(0.78 0.17 145)" fill="oklch(0.78 0.17 145)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Regional Risk Index" meta={`${regionData.length} ZONES`}>
        <div className="space-y-2">
          {regionData
            .sort((a, b) => b.risk - a.risk)
            .map((r) => {
              const tone = r.risk > 0.6 ? "var(--danger)" : r.risk > 0.4 ? "var(--warn)" : "var(--signal)";
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="w-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">{r.name}</span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted">
                    <div
                      className="h-full"
                      style={{ width: `${r.risk * 100}%`, background: `linear-gradient(90deg, ${tone}, transparent 200%)` }}
                    />
                    <span className="absolute right-2 top-0.5 font-mono text-[10px]" style={{ color: tone }}>
                      {r.risk.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </Panel>
    </div>
  );
}
