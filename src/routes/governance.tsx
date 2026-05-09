import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel } from "@/components/panel";
import { PROPOSALS, type Proposal } from "@/lib/atlas-data";
import { Button } from "@/components/ui/button";
import { Check, X, Cpu } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance — Atlas Sanctum" },
      { name: "description", content: "Proposals, AI evaluation, and consensus voting." },
    ],
  }),
  component: GovernanceView,
});

function GovernanceView() {
  const [proposals, setProposals] = useState<Proposal[]>(PROPOSALS);

  const vote = (id: string, kind: "yes" | "no") => {
    setProposals((prev) =>
      prev.map((p) => p.id === id ? { ...p, votes: { ...p.votes, [kind]: p.votes[kind] + 1 } } : p)
    );
    toast.success(`Vote cast`, { description: `Proposal #${id} · ${kind.toUpperCase()}` });
  };

  const decide = (id: string, status: "approved" | "rejected") => {
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    toast.success(`Proposal #${id} ${status}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Civilization Layer</span>
        <h1 className="text-2xl font-semibold tracking-tight">Governance <span className="text-primary">Engine</span></h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {proposals.map((p) => {
          const total = p.votes.yes + p.votes.no || 1;
          const yesPct = (p.votes.yes / total) * 100;
          return (
            <Panel
              key={p.id}
              title={`PROP #${p.id} · ${p.title}`}
              meta={
                p.status === "approved" ? "✓ APPROVED"
                : p.status === "rejected" ? "✕ REJECTED"
                : "PENDING"
              }
            >
              <p className="text-sm text-foreground/80">{p.description}</p>

              <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-widest">
                {[
                  { l: "Impact", v: p.impact, c: "text-foreground" },
                  { l: "Eco", v: p.ecological, c: "text-signal" },
                  { l: "Econ", v: p.economic, c: "text-[oklch(0.78_0.17_145)]" },
                  { l: "Risk", v: p.risk, c: "text-danger" },
                ].map((m) => (
                  <div key={m.l} className="rounded-sm border border-border/40 bg-background/40 p-2">
                    <div className="text-muted-foreground">{m.l}</div>
                    <div className={`mt-0.5 font-mono text-lg ${m.c}`}>{m.v.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-sm border border-primary/30 bg-primary/5 p-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
                  <Cpu className="h-3 w-3" /> Governance Agent
                </div>
                <p className="mt-1 font-mono text-[11px] text-foreground/85">
                  → {p.impact > 0.6 && p.risk < 0.5
                    ? "Recommend APPROVE — net systemic benefit projected."
                    : p.risk > 0.55
                    ? "Recommend REJECT — risk exceeds threshold T-3."
                    : "Recommend MODIFY — re-scope before commitment."}
                </p>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Consensus</span>
                  <span><span className="text-signal">{p.votes.yes}</span> / <span className="text-danger">{p.votes.no}</span></span>
                </div>
                <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-[oklch(0.82_0.16_195)]" style={{ width: `${yesPct}%` }} />
                  <div className="h-full bg-[oklch(0.68_0.22_25)]" style={{ width: `${100 - yesPct}%` }} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => vote(p.id, "yes")} className="gap-1 text-xs">
                  <Check className="h-3 w-3" /> Vote yes
                </Button>
                <Button size="sm" variant="secondary" onClick={() => vote(p.id, "no")} className="gap-1 text-xs">
                  <X className="h-3 w-3" /> Vote no
                </Button>
                {p.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => decide(p.id, "approved")} className="ml-auto gap-1 text-xs">
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => decide(p.id, "rejected")} className="gap-1 text-xs">
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
