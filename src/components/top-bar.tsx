import { useEffect, useState } from "react";
import { fmtTime } from "@/lib/atlas-data";
import { useAtlasStore } from "@/lib/store";

export function TopBar() {
  const [now, setNow] = useState(() => Date.now());
  const activeAlerts = useAtlasStore((s) => s.alerts.filter((a) => !a.ack).length);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
        <span className="text-foreground">SYS NOMINAL</span>
      </span>
      <span>UPTIME 412:08:33</span>
      <span className="text-foreground">{fmtTime(now)}</span>
      <span>NODES 24/24</span>
      <span className={activeAlerts > 0 ? "text-danger" : "text-signal"}>ALERTS {activeAlerts}</span>
    </div>
  );
}
