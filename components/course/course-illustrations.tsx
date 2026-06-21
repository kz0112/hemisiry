"use client"

import { cn } from "@/lib/utils"

export type DiagramKind =
  | "atom"
  | "ionic-bond"
  | "covalent-water"
  | "ph-scale"
  | "neutralize"
  | "redox"
  | "states"
  | "reaction-types"

/* ------------------------------------------------------------------ */
/*  Small reusable atom badge                                          */
/* ------------------------------------------------------------------ */
function AtomBadge({
  symbol,
  charge,
  tone = "neutral",
}: {
  symbol: string
  charge?: string
  tone?: "neutral" | "pos" | "neg"
}) {
  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
      <span className="text-lg font-bold text-foreground">{symbol}</span>
      {charge && (
        <span
          className={cn(
            "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
            tone === "pos" && "bg-[#ef4444] text-white",
            tone === "neg" && "bg-[#3b82f6] text-white",
            tone === "neutral" && "bg-secondary text-secondary-foreground",
          )}
        >
          {charge}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  1. Atom structure                                                  */
/* ------------------------------------------------------------------ */
function AtomDiagram() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative size-52">
        {/* orbit rings */}
        <div className="absolute inset-0 rounded-full border border-primary/30" />
        <div className="absolute inset-6 rounded-full border border-primary/30" />

        {/* orbiting electrons */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "7s" }}>
          <span className="absolute left-1/2 top-0 size-4 -translate-x-1/2 rounded-full bg-[#3b82f6] shadow" />
          <span className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 rounded-full bg-[#3b82f6] shadow" />
        </div>
        <div className="absolute inset-6 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }}>
          <span className="absolute right-0 top-1/2 size-4 -translate-y-1/2 rounded-full bg-[#3b82f6] shadow" />
        </div>

        {/* nucleus */}
        <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-0.5 rounded-full bg-secondary p-2">
          <span className="size-4 rounded-full bg-[#ef4444]" title="протон" />
          <span className="size-4 rounded-full bg-muted-foreground" title="нейтрон" />
          <span className="size-4 rounded-full bg-[#ef4444]" title="протон" />
          <span className="size-4 rounded-full bg-muted-foreground" title="нейтрон" />
        </div>
      </div>

      {/* legend */}
      <div className="ml-6 flex flex-col gap-2 text-sm">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ef4444]" /> Протон (+)
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-muted-foreground" /> Нейтрон (0)
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#3b82f6]" /> Электрон (−)
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  2. Ionic bond (NaCl)                                               */
/* ------------------------------------------------------------------ */
function IonicBondDiagram() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center gap-4">
        <AtomBadge symbol="Na" charge="+" tone="pos" />
        <div className="flex flex-col items-center text-primary">
          <span className="text-xs font-medium text-muted-foreground">e⁻ береді</span>
          <span className="text-2xl">→</span>
        </div>
        <AtomBadge symbol="Cl" charge="−" tone="neg" />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Натрий 1 электронын хлорға береді → Na⁺ және Cl⁻ иондары бір-бірін тартады
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  3. Covalent bond (H₂O)                                             */
/* ------------------------------------------------------------------ */
function CovalentWaterDiagram() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center">
        <AtomBadge symbol="H" />
        <span className="mx-1 h-1 w-6 rounded-full bg-primary" />
        <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
          <span className="text-xl font-bold text-foreground">O</span>
        </div>
        <span className="mx-1 h-1 w-6 rounded-full bg-primary" />
        <AtomBadge symbol="H" />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Сутегі мен оттегі электрон жұбын бөліп ұстайды (ковалентті байланыс)
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  4. pH scale                                                        */
/* ------------------------------------------------------------------ */
function PhScaleDiagram() {
  const cells = [
    { n: 0, c: "#b91c1c" },
    { n: 1, c: "#dc2626" },
    { n: 2, c: "#ef4444" },
    { n: 3, c: "#f97316" },
    { n: 4, c: "#fb923c" },
    { n: 5, c: "#facc15" },
    { n: 6, c: "#a3e635" },
    { n: 7, c: "#22c55e" },
    { n: 8, c: "#34d399" },
    { n: 9, c: "#22d3ee" },
    { n: 10, c: "#38bdf8" },
    { n: 11, c: "#3b82f6" },
    { n: 12, c: "#2563eb" },
    { n: 13, c: "#1d4ed8" },
    { n: 14, c: "#1e3a8a" },
  ]
  return (
    <div className="py-4">
      <div className="flex overflow-hidden rounded-lg">
        {cells.map((c) => (
          <div key={c.n} className="flex-1 py-3 text-center text-xs font-semibold text-white" style={{ backgroundColor: c.c }}>
            {c.n}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
        <span>← Қышқыл (HCl, лимон)</span>
        <span>Бейтарап (су)</span>
        <span>Сілтілі (NaOH, сабын) →</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  5. Neutralization                                                  */
/* ------------------------------------------------------------------ */
function Beaker({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-16 w-12 overflow-hidden rounded-b-xl border-2 border-border bg-card">
        <div className="absolute inset-x-0 bottom-0 h-2/3" style={{ backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function NeutralizeDiagram() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center gap-3">
        <Beaker color="#ef4444" label="Қышқыл" />
        <span className="text-2xl text-muted-foreground">+</span>
        <Beaker color="#3b82f6" label="Негіз" />
        <span className="text-2xl text-primary">→</span>
        <Beaker color="#22c55e" label="Тұз + су" />
      </div>
      <p className="rounded-lg bg-secondary px-3 py-1.5 font-mono text-sm font-semibold text-foreground">
        HCl + NaOH → NaCl + H₂O
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  6. Redox electron transfer                                         */
/* ------------------------------------------------------------------ */
function RedoxDiagram() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <AtomBadge symbol="Zn" />
          <span className="text-xs font-medium text-[#ef4444]">тотығады (e⁻ береді)</span>
        </div>
        <span className="text-2xl text-primary">⇌</span>
        <div className="flex flex-col items-center gap-1">
          <AtomBadge symbol="2H" charge="+" tone="pos" />
          <span className="text-xs font-medium text-[#3b82f6]">тотықсызданады (e⁻ алады)</span>
        </div>
      </div>
      <p className="rounded-lg bg-secondary px-3 py-1.5 font-mono text-sm font-semibold text-foreground">
        Zn + 2HCl → ZnCl₂ + H₂↑
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  7. States of matter                                                */
/* ------------------------------------------------------------------ */
function StatesDiagram() {
  const states = [
    { name: "Қатты", desc: "Бөлшектер тығыз, реттелген", dots: "tight" },
    { name: "Сұйық", desc: "Бөлшектер жақын, еркін", dots: "loose" },
    { name: "Газ", desc: "Бөлшектер алыс, жылдам", dots: "spread" },
  ]
  return (
    <div className="grid grid-cols-3 gap-3 py-4">
      {states.map((s) => (
        <div key={s.name} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3">
          <div className="grid size-16 place-items-center rounded-lg bg-secondary">
            <div
              className={cn(
                "grid",
                s.dots === "tight" && "grid-cols-3 gap-0.5",
                s.dots === "loose" && "grid-cols-3 gap-1",
                s.dots === "spread" && "grid-cols-2 gap-2",
              )}
            >
              {Array.from({ length: s.dots === "spread" ? 4 : 9 }).map((_, i) => (
                <span key={i} className="size-2 rounded-full bg-primary" />
              ))}
            </div>
          </div>
          <span className="text-sm font-semibold text-foreground">{s.name}</span>
          <span className="text-center text-xs text-muted-foreground">{s.desc}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  8. Reaction types                                                  */
/* ------------------------------------------------------------------ */
function ReactionTypesDiagram() {
  const rows = [
    { name: "Қосылу", eq: "A + B → AB", ex: "2H₂ + O₂ → 2H₂O" },
    { name: "Ыдырау", eq: "AB → A + B", ex: "2H₂O → 2H₂ + O₂" },
    { name: "Орынбасу", eq: "A + BC → AC + B", ex: "Zn + 2HCl → ZnCl₂ + H₂" },
    { name: "Алмасу", eq: "AB + CD → AD + CB", ex: "HCl + NaOH → NaCl + H₂O" },
  ]
  return (
    <div className="flex flex-col gap-2 py-4">
      {rows.map((r) => (
        <div key={r.name} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-foreground">{r.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{r.eq}</span>
          <span className="font-mono text-xs font-medium text-primary">{r.ex}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
export function Diagram({ kind, caption }: { kind: DiagramKind; caption?: string }) {
  const map: Record<DiagramKind, React.ReactNode> = {
    atom: <AtomDiagram />,
    "ionic-bond": <IonicBondDiagram />,
    "covalent-water": <CovalentWaterDiagram />,
    "ph-scale": <PhScaleDiagram />,
    neutralize: <NeutralizeDiagram />,
    redox: <RedoxDiagram />,
    states: <StatesDiagram />,
    "reaction-types": <ReactionTypesDiagram />,
  }
  return (
    <figure className="rounded-2xl border border-border bg-secondary/40 px-4">
      {map[kind]}
      {caption && <figcaption className="pb-3 text-center text-xs italic text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}
