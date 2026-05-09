import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel } from "@/components/panel";
import { useAtlasStore, type AuditKind } from "@/lib/store";
import { fmtTime } from "@/lib/atlas-data";
import {
  Activity, FileSignature, Cpu, GanttChart, Bell, Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Timeline — Atlas Sanctum" },
      { name: "description", content: "End-to-end trace of agent runs, decisions, and telemetry." },
    ],
  }),
  component: AuditView,
});

const FILTERS: { key: AuditKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "agent_run", label: "Agent runs" },
  { key: "simulation_run", label: "Simulations" },
  { key: "proposal_vote", label: "Votes" },
  { key: "proposal_decision", label: "Decisions" },
  { key: "telemetry_update", label: "Telemetry" },
  { key: "alert_ack", label: "Alert acks" },
];

const ICONS: Record<AuditKind, React.ComponentType<{ className?: string }>> = {
  agent_run: Cpu,
  simulation_run: GanttChart,
  proposal_vote: Vote,
  proposal_decision: FileSignature,
  telemetry_update: Activity,
  alert_ack: Bell,
};

function AuditView() {
  const audit = useAtlasStore((s) => s.audit);
  const [filter, setFilter] = useState<AuditKind | "all">("all");
  const filtered = filter === "all" ? audit : audit.filter((a) => a.kind === filter);

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Provenance</span>
        <h1 className="text-2xl font-semibold tracking-tight">Audit <span className="text-primary">Timeline</span></h1>
      </div>

      <Panel title="Filters" meta={`${filtered.length} / ${audit.length} ENTRIES`}>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "secondary"}
              onClick={() => setFilter(f.key)}
              className="h-7 text-[10px] uppercase tracking-widest"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Panel>

      <Panel title="Trace" meta="NEWEST FIRST">
        <ol className="relative space-y-3 border-l border-border/60 pl-5">
          {filtered.length === 0 && (
            <li className="font-mono text-xs text-muted-foreground">› No entries match filter.</li>
          )}
          {filtered.map((e) => {
            const Icon = ICONS[e.kind];
            return (
              <li key={e.id} className="relative">
                <span className={cn(
                  "absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border bg-background",
                  e.kind === "alert_ack" ? "border-warn text-warn" :
                  e.kind === "proposal_decision" ? "border-primary text-primary" :
                  "border-border text-muted-foreground"
                )}>
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <div className="rounded-sm border border-border/40 bg-background/40 p-2.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{e.id} · <span className="text-foreground/80">{e.actor}</span></span>
                    <span>{fmtTime(e.ts)}</span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-foreground/90">{e.summary}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-widest text-primary">{e.kind.replace("_", " ")}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}
