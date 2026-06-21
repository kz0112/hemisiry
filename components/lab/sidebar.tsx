"use client"

import { FlaskConical, GraduationCap, Grid3x3, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewId = "lab" | "course" | "table"

const NAV: { id: ViewId; label: string; desc: string; icon: typeof FlaskConical }[] = [
  { id: "lab", label: "Виртуалды зертхана", desc: "Реагенттерді араластыр", icon: FlaskConical },
  { id: "course", label: "Оқу курсы", desc: "Сабақтар мен сұрақтар", icon: GraduationCap },
  { id: "table", label: "Менделеев кестесі", desc: "Элементтерді зертте", icon: Grid3x3 },
]

export function Sidebar({
  active,
  onChange,
}: {
  active: ViewId
  onChange: (id: ViewId) => void
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Leaf className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold text-sidebar-foreground">EcoTech</p>
          <p className="text-xs text-muted-foreground">Химия · Интерактивті оқу</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-2">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isActive ? "bg-primary-foreground/15" : "bg-secondary",
                )}
              >
                <Icon className={cn("size-[18px]", isActive ? "text-primary-foreground" : "text-primary")} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span
                  className={cn(
                    "block text-[11px]",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {item.desc}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-card px-3 py-3">
          <img
            src="/teacher.png"
            alt="Қажиакпарова Аякоз Ерлановна"
            className="size-11 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-semibold leading-snug text-sidebar-foreground">
              Қажиакпарова Аякоз Ерлановна
            </p>
            <p className="text-[11px] text-muted-foreground">Химия пәнінің мұғалімі</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Leaf className="size-4 shrink-0 text-primary" />
          <p className="text-[11px] leading-snug text-secondary-foreground">
            Тегін · Тіркеусіз білім беру жобасы
          </p>
        </div>
      </div>
    </aside>
  )
}
