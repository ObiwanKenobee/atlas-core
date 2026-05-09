import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel } from "@/components/panel";
import { atlasStore, useAtlasStore, type AlertSeverity } from "@/lib/store";
import { fmtTime } from "@/lib/atlas-data";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Atlas Sanctum" },
      { name: "description", content: "Active alerts based on telemetry risk thresholds." },
    ],
  }),
  component: AlertsView,
});

const SEV_META: Record<AlertSeverity, { color: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string }> = {
  danger: { color: "var(--danger)", Icon: AlertTriangle, label: "CRITICAL" },
  warn:   { color: "var(--warn)",   Icon: AlertCircle,   label: "ELEVATED" },
  info:   { color: "var(--signal)", Icon: Info,          label: "INFO" },
};

type Filter = "all" | "active" | "ack" | AlertSeverity;

function AlertsView() {
  const alerts = useAtlasStore((s) => s.alerts);
  const [filter, setFilter] = useState<Filter>("active");

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "active") return !a.ack;
    if (filter === "ack") return a.ack;
    return a.severity === filter;
  });

  const counts = {
    all: alerts.length,
    active: alerts.filter((a) => !a.ack).length,
    danger: alerts.filter((a) => a.severity === "danger" && !a.ack).length,
    warn: alerts.filter((a) => a.severity === "warn" && !a.ack).length,
    info: alerts.filter((a) => a.severity === "info" && !a.ack).length,
  };

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "active", label: "Active",   count: counts.active },
    { key: "danger", label: "Critical", count: counts.danger },
    { key: "warn",   label: "Elevated", count: counts.warn },
    { key: "info",   label: "Info",     count: counts.info },
    { key: "ack",    label: "Acked",    count: alerts.length - counts.active },
    { key: "all",    label: "All",      count: counts.all },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Threshold Monitor</span>
          <h1 className="text-2xl font-semibold tracking-tight">Active <span className="text-primary">Alerts</span></h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => atlasStore.ackAll()}
          disabled={counts.active === 0}
          className="gap-2 text-xs uppercase tracking-widest"
        >
          <BellOff className="h-3.5 w-3.5" /> Ack all
        </Button>
      </div>

      <Panel title="Filters" meta={`${filtered.length} SHOWN`}>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "secondary"}
              onClick={() => setFilter(f.key)}
              className="h-7 gap-1.5 text-[10px] uppercase tracking-widest"
            >
              {f.label}
              <span className={cn(
                "rounded-sm px-1 font-mono",
                filter === f.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background/60 text-muted-foreground"
              )}>{f.count}</span>
            </Button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Panel title="Status" meta="OK">
            <p className="font-mono text-xs text-muted-foreground">› No alerts match the current filter.</p>
          </Panel>
        )}
        {filtered.map((a) => {
          const meta = SEV_META[a.severity];
          return (
            <div
              key={a.id}
              className={cn("panel rounded-sm p-3", a.ack && "opacity-60")}
              style={{ borderLeft: `3px solid ${meta.color}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <meta.Icon className="mt-0.5 h-4 w-4" style={{ color: meta.color }} />
                  <div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span>·</span>
                      <span>{a.id}</span>
                      <span>·</span>
                      <span>{a.source}</span>
                      <span>·</span>
                      <span>{fmtTime(a.ts)}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">{a.title}</h3>
                    <p className="mt-0.5 text-xs text-foreground/80">{a.detail}</p>
                    <div className="mt-1.5 inline-block rounded-sm border border-border/40 bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      THRESHOLD · {a.threshold}
                    </div>
                  </div>
                </div>
                {!a.ack ? (
                  <Button size="sm" variant="secondary" onClick={() => atlasStore.ackAlert(a.id)} className="gap-1.5 text-xs">
                    <Bell className="h-3 w-3" /> Acknowledge
                  </Button>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-signal">✓ Acked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
