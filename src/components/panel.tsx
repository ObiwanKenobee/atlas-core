import { cn } from "@/lib/utils";

export function Panel({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel relative rounded-sm", className)}>
      <header className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground">
          <span className="text-primary">▸</span> {title}
        </h2>
        {meta && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{meta}</span>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}
