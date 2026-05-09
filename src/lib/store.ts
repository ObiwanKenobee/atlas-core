import { useSyncExternalStore } from "react";

// ───────── Audit log ─────────
export type AuditKind =
  | "agent_run"
  | "simulation_run"
  | "proposal_vote"
  | "proposal_decision"
  | "telemetry_update"
  | "alert_ack";

export interface AuditEntry {
  id: string;
  kind: AuditKind;
  actor: string;       // "operator" | "agent:governance" | "system"
  summary: string;
  meta?: Record<string, unknown>;
  ts: number;
}

// ───────── Alerts ─────────
export type AlertSeverity = "info" | "warn" | "danger";
export interface Alert {
  id: string;
  severity: AlertSeverity;
  source: string;
  title: string;
  detail: string;
  threshold: string;   // e.g. "risk > 0.65"
  ack: boolean;
  ts: number;
}

interface State {
  audit: AuditEntry[];
  alerts: Alert[];
}

const seedAlerts: Alert[] = [
  { id: "A-101", severity: "danger", source: "AMZ-SAT-04", title: "Deforestation cascade",
    detail: "Amazon basin loss rate exceeded threshold by 12%.", threshold: "risk > 0.65",
    ack: false, ts: Date.now() - 60_000 },
  { id: "A-102", severity: "warn", source: "ARC-BUOY-19", title: "Sea ice anomaly",
    detail: "Extent 4.2σ below 5-yr median.", threshold: "risk > 0.45",
    ack: false, ts: Date.now() - 240_000 },
  { id: "A-103", severity: "warn", source: "FX-NODE", title: "Capital outflow",
    detail: "Emerging market FX volatility above T-2.", threshold: "econ.vol > 0.5",
    ack: false, ts: Date.now() - 360_000 },
  { id: "A-104", severity: "info", source: "AGENT-GOV", title: "Consensus update",
    detail: "Proposal #046 passed simulation review.", threshold: "info",
    ack: true,  ts: Date.now() - 900_000 },
];

const seedAudit: AuditEntry[] = [
  { id: "L-001", kind: "telemetry_update", actor: "system", summary: "Telemetry batch ingested · 1,284 events", ts: Date.now() - 30_000 },
  { id: "L-002", kind: "agent_run", actor: "agent:ecological", summary: "Ecological agent cycle 18432 complete", ts: Date.now() - 120_000 },
  { id: "L-003", kind: "proposal_decision", actor: "operator", summary: "Proposal #046 approved", ts: Date.now() - 900_000 },
];

let state: State = { audit: seedAudit, alerts: seedAlerts };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const store = {
  getState: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },

  logAudit(entry: Omit<AuditEntry, "id" | "ts"> & { ts?: number }) {
    const e: AuditEntry = {
      id: `L-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      ts: entry.ts ?? Date.now(),
      ...entry,
    };
    state = { ...state, audit: [e, ...state.audit].slice(0, 200) };
    notify();
    return e;
  },

  ackAlert(id: string) {
    state = { ...state, alerts: state.alerts.map((a) => a.id === id ? { ...a, ack: true } : a) };
    notify();
    store.logAudit({ kind: "alert_ack", actor: "operator", summary: `Alert ${id} acknowledged`, meta: { id } });
  },

  ackAll() {
    state = { ...state, alerts: state.alerts.map((a) => ({ ...a, ack: true })) };
    notify();
    store.logAudit({ kind: "alert_ack", actor: "operator", summary: `All alerts acknowledged` });
  },

  raiseAlert(a: Omit<Alert, "id" | "ts" | "ack">) {
    const alert: Alert = {
      id: `A-${Math.floor(100 + Math.random() * 900)}`,
      ts: Date.now(),
      ack: false,
      ...a,
    };
    state = { ...state, alerts: [alert, ...state.alerts].slice(0, 100) };
    notify();
    return alert;
  },
};

export const atlasStore = store;

export function useAtlasStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()), () => selector(store.getState()));
}
