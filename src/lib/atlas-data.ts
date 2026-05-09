// Mock planetary intelligence data — deterministic-ish for demo feel
export type AgentKey = "ecological" | "economic" | "governance" | "simulation";

export interface AgentStatus {
  key: AgentKey;
  name: string;
  status: "online" | "processing" | "idle" | "alert";
  load: number;
  lastOutput: string;
  cycles: number;
}

export interface SystemEvent {
  id: string;
  type: "ecological" | "economic" | "governance";
  source: string;
  message: string;
  severity: "info" | "warn" | "danger";
  ts: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  impact: number;
  ecological: number;
  economic: number;
  risk: number;
  status: "pending" | "approved" | "rejected";
  votes: { yes: number; no: number };
}

export const AGENTS: AgentStatus[] = [
  { key: "ecological", name: "Ecological Agent", status: "online", load: 0.42, lastOutput: "Amazon basin: risk 0.31 — declining", cycles: 18432 },
  { key: "economic", name: "Economic Agent", status: "processing", load: 0.71, lastOutput: "Capital rebalance simulated: +2.4% stability", cycles: 22018 },
  { key: "governance", name: "Governance Agent", status: "online", load: 0.28, lastOutput: "Proposal #047 evaluated → recommend approve", cycles: 9123 },
  { key: "simulation", name: "Simulation Agent", status: "alert", load: 0.88, lastOutput: "Scenario S-12: cascading risk detected", cycles: 5430 },
];

export const REGIONS = [
  { code: "AMZ", name: "Amazon Basin", lat: -3, lng: -60, risk: 0.71 },
  { code: "ARC", name: "Arctic Shelf", lat: 78, lng: 30, risk: 0.62 },
  { code: "SAH", name: "Sahel Belt", lat: 14, lng: 10, risk: 0.55 },
  { code: "PAC", name: "Pacific Trench", lat: 0, lng: -150, risk: 0.34 },
  { code: "EUR", name: "Western Europe", lat: 48, lng: 8, risk: 0.21 },
  { code: "SEA", name: "SE Asia Coast", lat: 8, lng: 110, risk: 0.48 },
  { code: "AUS", name: "Coral Sea", lat: -18, lng: 148, risk: 0.59 },
];

const now = Date.now();
export const EVENTS: SystemEvent[] = [
  { id: "e1", type: "ecological", source: "AMZ-SAT-04", message: "Deforestation spike +12% over 72h window", severity: "danger", ts: now - 60_000 },
  { id: "e2", type: "economic", source: "FX-NODE", message: "Capital outflow detected — emerging markets", severity: "warn", ts: now - 180_000 },
  { id: "e3", type: "governance", source: "PROP-047", message: "New proposal: Carbon dividend protocol", severity: "info", ts: now - 240_000 },
  { id: "e4", type: "ecological", source: "ARC-BUOY-19", message: "Sea ice extent below 5-yr median", severity: "warn", ts: now - 360_000 },
  { id: "e5", type: "economic", source: "TRADE-AGG", message: "Supply chain index: 0.82 (stable)", severity: "info", ts: now - 540_000 },
  { id: "e6", type: "ecological", source: "PAC-MESH", message: "Coral bleaching threshold crossed in 3 sectors", severity: "danger", ts: now - 720_000 },
  { id: "e7", type: "governance", source: "AGENT-GOV", message: "Proposal #046 approved by simulation consensus", severity: "info", ts: now - 900_000 },
];

export const PROPOSALS: Proposal[] = [
  {
    id: "047",
    title: "Carbon Dividend Protocol",
    description: "Allocate 0.4% of simulated capital pool to carbon sequestration grid across Sahel + Amazon.",
    impact: 0.78, ecological: 0.82, economic: 0.41, risk: 0.27,
    status: "pending", votes: { yes: 412, no: 188 },
  },
  {
    id: "046",
    title: "Arctic Monitoring Mesh Expansion",
    description: "Deploy 240 additional buoy nodes across the Arctic shelf for real-time ice telemetry.",
    impact: 0.62, ecological: 0.71, economic: 0.34, risk: 0.18,
    status: "approved", votes: { yes: 588, no: 102 },
  },
  {
    id: "045",
    title: "Speculative Capital Throttle",
    description: "Apply governance throttle on derivative flows exceeding volatility threshold T-3.",
    impact: 0.55, ecological: 0.12, economic: 0.74, risk: 0.61,
    status: "rejected", votes: { yes: 221, no: 488 },
  },
  {
    id: "048",
    title: "Coral Reef Intervention Fund",
    description: "Trigger ecological intervention layer for Pacific bleaching events above severity 0.7.",
    impact: 0.69, ecological: 0.88, economic: 0.22, risk: 0.31,
    status: "pending", votes: { yes: 301, no: 144 },
  },
];

export const TIMESERIES = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  ecological: 0.4 + 0.2 * Math.sin(i / 4) + (i > 20 ? 0.1 : 0),
  economic: 0.5 + 0.15 * Math.cos(i / 5),
  risk: 0.3 + 0.25 * Math.sin(i / 6 + 1),
}));

export const SIMULATION_RESULT = {
  scenario: "S-12 — Cascading Climate-Capital Feedback",
  ecological_impact: 0.74,
  economic_impact: 0.58,
  risk_score: 0.66,
  confidence: 0.81,
  horizon: "T+18mo",
  branches: [
    { label: "Status quo", ecological: 0.78, economic: 0.42, risk: 0.71 },
    { label: "Intervention A", ecological: 0.41, economic: 0.55, risk: 0.38 },
    { label: "Intervention B", ecological: 0.34, economic: 0.61, risk: 0.29 },
  ],
};

export function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toUTCString().slice(17, 25) + " UTC";
}
