import { REGIONS } from "@/lib/atlas-data";

// Stylized 2D "globe" with risk markers — pure SVG, no external deps.
export function GlobeViz() {
  // Equirectangular projection: lng -180..180 -> 0..1, lat 90..-90 -> 0..1
  const proj = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  });

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-sm border border-border/60 bg-[oklch(0.14_0.025_240)] scanline">
      {/* meridian/parallel grid */}
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="atmo" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="oklch(0.82 0.16 195 / 0.10)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100" height="50" fill="url(#atmo)" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`m${i}`} x1={(i + 1) * (100 / 13)} y1="0" x2={(i + 1) * (100 / 13)} y2="50"
            stroke="oklch(0.82 0.16 195 / 0.12)" strokeWidth="0.08" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`p${i}`} x1="0" y1={(i + 1) * (50 / 7)} x2="100" y2={(i + 1) * (50 / 7)}
            stroke="oklch(0.82 0.16 195 / 0.12)" strokeWidth="0.08" />
        ))}
        {/* equator */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="oklch(0.82 0.16 195 / 0.35)" strokeWidth="0.12" strokeDasharray="0.6 0.4" />
      </svg>

      {/* risk markers */}
      {REGIONS.map((r) => {
        const p = proj(r.lat, r.lng);
        const color = r.risk > 0.6 ? "var(--danger)" : r.risk > 0.4 ? "var(--warn)" : "var(--signal)";
        return (
          <div
            key={r.code}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span
              className="block h-2 w-2 rounded-full pulse-dot"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            />
            <span className="mt-1 block whitespace-nowrap text-[9px] uppercase tracking-widest text-muted-foreground">
              {r.code}
            </span>
          </div>
        );
      })}

      <div className="pointer-events-none absolute left-2 top-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        EQUIRECTANGULAR · LIVE TELEMETRY
      </div>
      <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] uppercase tracking-[0.2em] text-primary">
        ◉ {REGIONS.length} NODES
      </div>
    </div>
  );
}
