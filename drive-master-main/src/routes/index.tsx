import { createFileRoute } from "@tanstack/react-router";
import routeMap from "@/assets/route-map.jpg";
import carHero from "@/assets/car-hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand/30 selection:text-brand">
      {/* Global top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-lg tracking-tight">
              DRIVE
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              / telemetry.os
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <a href="#dashboard" className="hover:text-foreground">Dashboard</a>
            <a href="#hud" className="hover:text-foreground">HUD</a>
            <a href="#summary" className="hover:text-foreground">Session</a>
            <a href="#garage" className="hover:text-foreground">Garage</a>
          </nav>
          <button className="text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-md ring-1 ring-border hover:ring-brand hover:text-brand transition">
            Connect OBD-II
          </button>
        </div>
      </header>

      {/* Hero intro */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="flex flex-col gap-6 max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand">
            // A telemetry platform for drivers
          </span>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance leading-[1.05]">
            Every corner a segment.
            <br />
            Every drive, a{" "}
            <span className="italic text-brand">signal</span>.
          </h1>
          <p className="text-muted-foreground text-pretty max-w-2xl leading-relaxed">
            Drive captures your car's soul and your skill as data. Live HUD,
            smoothness scores, segment battles, and a digital garage that
            remembers every mod and mile.
          </p>
        </div>
      </section>

      {/* Mobile mocks grid */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-16 md:gap-20">
          <DashboardMock />
          <HudMock />
          <SummaryMock />
          <GarageMock />
        </div>

        <SectionBreak label="03 / Metrics we invented" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          {[
            { k: "Corner Smoothness", v: "94.2" },
            { k: "Flow Percentage", v: "98%" },
            { k: "Brake Firmness Map", v: "LAYER" },
            { k: "Throttle Command", v: "1.24g" },
          ].map((m) => (
            <div key={m.k} className="bg-background p-6">
              <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2">
                {m.k}
              </p>
              <p className="font-mono text-2xl text-foreground">{m.v}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>drive.os · v4.0.2 / alpha</span>
          <span>encrypted telemetry</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Section break ---------- */

function SectionBreak({ label }: { label: string }) {
  return (
    <div className="my-20 flex items-center gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ---------- Phone frame ---------- */

function Phone({
  children,
  label,
  id,
}: {
  children: React.ReactNode;
  label: string;
  id?: string;
}) {
  return (
    <div id={id} className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand">
          {label}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          screen.mobile
        </span>
      </div>
      <div className="w-full max-w-[390px] mx-auto rounded-[2.5rem] bg-black ring-1 ring-border p-2 shadow-2xl">
        <div className="rounded-[2rem] bg-background overflow-hidden aspect-[9/19.5] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- 1. Dashboard ---------- */

function DashboardMock() {
  return (
    <Phone label="01 / dashboard" id="dashboard">
      <div className="p-6 space-y-6 overflow-hidden">
        <header className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Driver Identity
            </span>
            <h1 className="text-xl font-medium">Elias Thorne</h1>
          </div>
          <div className="size-10 rounded-full bg-secondary ring-1 ring-border grid place-items-center font-mono text-xs">
            ET
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <Stat k="Precision Index" v="94.2" accent />
          <Stat k="Distance" v="14,208" suffix="KM" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Recent Segments
          </h2>
          <div className="flex flex-col divide-y divide-border ring-1 ring-border rounded-xl bg-card/50 overflow-hidden">
            <SegRow name="Blackwood Pass S1" meta="14 min ago · 8.4 km" t="04:12.8" />
            <SegRow
              name="Coastal Ridge Climb"
              meta="Yesterday · 12.1 km"
              t="07:44.2"
              highlight
            />
            <SegRow name="Boğaz Kıvrımları" meta="2d ago · 6.8 km" t="03:58.1" />
          </div>
        </div>

        <div className="flex gap-2">
          {["Feed", "Segments", "Explore"].map((t, i) => (
            <span
              key={t}
              className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-md ring-1 ${
                i === 0
                  ? "ring-brand text-brand bg-brand/5"
                  : "ring-border text-muted-foreground"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Phone>
  );
}

function Stat({
  k,
  v,
  suffix,
  accent,
}: {
  k: string;
  v: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-card ring-1 ring-border">
      <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
        {k}
      </span>
      <span
        className={`text-2xl font-mono ${accent ? "text-brand" : "text-foreground"}`}
      >
        {v}
        {suffix && (
          <span className="text-sm text-muted-foreground ml-1">{suffix}</span>
        )}
      </span>
    </div>
  );
}

function SegRow({
  name,
  meta,
  t,
  highlight,
}: {
  name: string;
  meta: string;
  t: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <span
        className={`text-sm font-mono ${highlight ? "text-brand" : "text-muted-foreground"}`}
      >
        {t}
      </span>
    </div>
  );
}

/* ---------- 2. HUD ---------- */

function HudMock() {
  return (
    <Phone label="02 / live hud" id="hud">
      <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden relative bg-black">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(249,115,22,0.15), transparent 60%)",
          }}
        />

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Segment Delta
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-brand font-mono text-xl">-01.24</span>
              <span className="text-[10px] font-mono text-brand/60">SEC</span>
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-brand/10 ring-1 ring-brand/40 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-[10px] font-mono text-brand uppercase">
              Recording
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[140px] leading-none font-mono tracking-tighter text-foreground tabular-nums">
            142
          </span>
          <span className="text-xs font-mono text-muted-foreground -mt-2 uppercase tracking-[0.5em]">
            km / h
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>RPM × 1000</span>
              <span className="text-foreground">7.2</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full flex gap-0.5 p-0.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const active = i < 7;
                const red = i >= 7 && i < 8;
                return (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-sm ${
                      red
                        ? "bg-brand/40"
                        : active
                          ? i > 5
                            ? "bg-brand"
                            : "bg-muted-foreground/60"
                          : "bg-secondary"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card/50 rounded-lg ring-1 ring-border">
              <span className="text-[10px] font-mono text-muted-foreground block">
                LATERAL G
              </span>
              <span className="text-lg font-mono">1.24</span>
            </div>
            <div className="p-3 bg-card/50 rounded-lg ring-1 ring-border">
              <span className="text-[10px] font-mono text-muted-foreground block">
                FLOW SCORE
              </span>
              <span className="text-lg font-mono text-brand">98</span>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* ---------- 3. Activity Summary ---------- */

function SummaryMock() {
  return (
    <Phone label="03 / session dossier" id="summary">
      <div className="p-6 space-y-5 overflow-y-auto">
        <div>
          <span className="text-[10px] font-mono uppercase text-muted-foreground">
            Session Dossier · #4820
          </span>
          <h2 className="text-xl font-medium tracking-tight mt-1">
            Night Run: Obsidian Pass
          </h2>
        </div>

        <div className="relative rounded-2xl overflow-hidden ring-1 ring-border">
          <img
            src={routeMap}
            alt="3D relief map of a winding mountain road with an orange telemetry line"
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="absolute bottom-2 left-2 flex gap-1">
            <LayerTag active>Speed</LayerTag>
            <LayerTag>G-Force</LayerTag>
            <LayerTag>Brake</LayerTag>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0.5 bg-border">
          <StatCell k="Peak G" v="1.42" active />
          <StatCell k="Brake Avg" v="64%" />
          <StatCell k="Top Speed" v="218" />
        </div>

        <div className="p-4 bg-brand/5 ring-1 ring-brand/20 rounded-xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand">
            AI Insight
          </span>
          <p className="text-sm leading-relaxed mt-2 text-pretty">
            Entry speed at Apex 4 was <span className="text-brand">8.2%</span>{" "}
            higher than your previous best. Smoothness held despite the late
            braking phase.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Speed trace</span>
            <span>48,290 pts</span>
          </div>
          <div className="h-10 flex items-end gap-0.5">
            {[40, 55, 62, 78, 85, 92, 70, 88, 95, 82, 74, 90, 100, 78, 65, 88].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-brand/70"
                  style={{ height: `${h}%` }}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </Phone>
  );
}

function LayerTag({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widest ${
        active
          ? "bg-brand text-primary-foreground"
          : "bg-background/80 ring-1 ring-border text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function StatCell({ k, v, active }: { k: string; v: string; active?: boolean }) {
  return (
    <div
      className={`bg-background p-3 border-l-2 ${
        active ? "border-brand" : "border-transparent"
      }`}
    >
      <span className="text-[9px] font-mono text-muted-foreground uppercase block">
        {k}
      </span>
      <span className="text-base font-mono">{v}</span>
    </div>
  );
}

/* ---------- 4. Garage ---------- */

function GarageMock() {
  return (
    <Phone label="04 / the garage" id="garage">
      <div className="p-4 space-y-5 overflow-y-auto">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Fleet · 2 vehicles
          </span>
          <span className="size-7 grid place-items-center ring-1 ring-border rounded-md text-xs">
            +
          </span>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
          <img
            src={carHero}
            alt="Porsche 911 GT3 RS side profile"
            className="w-full aspect-video object-cover"
          />
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-medium">2023 911 GT3 RS</h3>
                <p className="text-[10px] text-muted-foreground font-mono">
                  VIN · WP0ZZZ99ZNS2
                </p>
              </div>
              <span className="text-xl font-mono">
                518
                <span className="text-[10px] text-muted-foreground ml-1 uppercase">
                  HP
                </span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-2">
                Modification Log
              </span>
              <div className="grid grid-cols-2 gap-2">
                <ModCell name="Akrapovič Evo" delta="+14HP · −8kg" positive />
                <ModCell name="Cup 2 R Tires" delta="1.2k km used" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-2">
                Maintenance
              </span>
              <div className="relative pl-4 space-y-3">
                <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border" />
                <TimelineItem
                  date="Oct 12 · 12,400 km"
                  title="Stage 1 Remap"
                  note="+15HP · −0.2s to 100"
                  active
                />
                <TimelineItem
                  date="Sep 28 · 11,800 km"
                  title="Brake pad replacement"
                  note="Brembo Z-series carbon"
                />
              </div>
            </div>

            <button className="w-full bg-foreground text-background text-sm font-medium py-2.5 px-4 rounded-lg flex items-center justify-between">
              <span>Open service book</span>
              <span className="text-[10px] font-mono opacity-60">
                02 ALERTS
              </span>
            </button>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function ModCell({
  name,
  delta,
  positive,
}: {
  name: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="p-3 bg-background/60 rounded-lg ring-1 ring-border">
      <p className="text-xs font-medium">{name}</p>
      <p
        className={`text-[10px] font-mono mt-1 ${
          positive ? "text-brand" : "text-muted-foreground"
        }`}
      >
        {delta}
      </p>
    </div>
  );
}

function TimelineItem({
  date,
  title,
  note,
  active,
}: {
  date: string;
  title: string;
  note: string;
  active?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[16px] top-1.5 size-2 rounded-full ${
          active ? "bg-brand shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "bg-border"
        }`}
      />
      <p className="text-[10px] font-mono text-muted-foreground uppercase">
        {date}
      </p>
      <p className="text-sm font-medium">{title}</p>
      <p
        className={`text-[10px] font-mono uppercase mt-0.5 ${
          active ? "text-brand" : "text-muted-foreground"
        }`}
      >
        {note}
      </p>
    </div>
  );
}
