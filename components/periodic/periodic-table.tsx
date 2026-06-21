"use client"

import { useMemo, useState } from "react"
import { Search, X, Atom } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ELEMENTS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Category,
  type Element,
} from "./elements"

export function PeriodicTable() {
  const [query, setQuery] = useState("")
  const [activeCat, setActiveCat] = useState<Category | null>(null)
  const [selected, setSelected] = useState<Element | null>(null)

  const q = query.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!q) return null
    return new Set(
      ELEMENTS.filter(
        (e) =>
          e.sym.toLowerCase() === q ||
          e.sym.toLowerCase().startsWith(q) ||
          e.name.toLowerCase().includes(q) ||
          e.nameKz.toLowerCase().includes(q) ||
          String(e.n) === q,
      ).map((e) => e.n),
    )
  }, [q])

  const isDimmed = (e: Element) => {
    if (matches) return !matches.has(e.n)
    if (activeCat) return e.cat !== activeCat
    return false
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* heading + search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Atom className="size-3.5 text-primary" />
              Менделеев кестесі
            </span>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Химиялық элементтер</h1>
            <p className="text-sm text-muted-foreground">
              Элементке бассаң, толық мәліметін көресің. Іздеп немесе санат бойынша сүзіп көр.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Іздеу: O, Темір, 26…"
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Тазалау"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* legend */}
        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
            const c = CATEGORY_COLORS[cat]
            const active = activeCat === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(active ? null : cat)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                  active ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="size-2.5 rounded-full" style={{ background: c.dot }} />
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>

        {/* table */}
        <div className="mt-6 overflow-x-auto pb-4">
          <div
            className="grid min-w-[760px] gap-1"
            style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
          >
            {ELEMENTS.map((e) => {
              const c = CATEGORY_COLORS[e.cat]
              const dim = isDimmed(e)
              return (
                <button
                  key={e.n}
                  onClick={() => setSelected(e)}
                  style={{
                    gridColumnStart: e.x,
                    gridRowStart: e.y,
                    background: c.bg,
                    color: c.fg,
                  }}
                  className={cn(
                    "group flex aspect-square flex-col items-center justify-center rounded-md border border-black/5 p-0.5 transition-all hover:scale-[1.12] hover:border-primary hover:shadow-md",
                    dim && "opacity-20",
                  )}
                >
                  <span className="text-[7px] leading-none opacity-70">{e.n}</span>
                  <span className="text-[11px] font-bold leading-tight md:text-sm">{e.sym}</span>
                  <span className="hidden text-[6px] leading-none opacity-70 md:block">{e.mass}</span>
                </button>
              )
            })}

            {/* f-block label markers */}
            <div
              className="flex items-center justify-center rounded-md bg-secondary text-[8px] font-medium text-muted-foreground"
              style={{ gridColumnStart: 3, gridRowStart: 6 }}
            >
              57-71
            </div>
            <div
              className="flex items-center justify-center rounded-md bg-secondary text-[8px] font-medium text-muted-foreground"
              style={{ gridColumnStart: 3, gridRowStart: 7 }}
            >
              89-103
            </div>
          </div>
        </div>
      </div>

      {selected && <ElementDetail element={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function ElementDetail({ element, onClose }: { element: Element; onClose: () => void }) {
  const c = CATEGORY_COLORS[element.cat]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div
            className="flex size-20 flex-col items-center justify-center rounded-2xl"
            style={{ background: c.bg, color: c.fg }}
          >
            <span className="text-[10px]">{element.n}</span>
            <span className="text-2xl font-bold">{element.sym}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Жабу"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-foreground">{element.nameKz}</h2>
        <p className="text-sm text-muted-foreground">{element.name}</p>

        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: c.bg, color: c.fg }}
        >
          <span className="size-2 rounded-full" style={{ background: c.dot }} />
          {CATEGORY_LABELS[element.cat]}
        </span>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat label="Реттік нөмір" value={String(element.n)} />
          <Stat label="Атом массасы" value={element.mass} />
          <Stat label="Топ" value={element.y >= 9 ? "f-блок" : String(element.x)} />
          <Stat label="Период" value={element.y >= 9 ? (element.y === 9 ? "6" : "7") : String(element.y)} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-base font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  )
}
