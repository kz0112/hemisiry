"use client"

import { Thermometer, Droplets, Activity } from "lucide-react"
import type { BeakerState } from "./lab-scene"

function VerticalGauge({
  value,
  min,
  max,
  unit,
  label,
  color,
}: {
  value: number
  min: number
  max: number
  unit: string
  label: string
  color: string
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative h-40 w-3 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute bottom-0 w-full rounded-full transition-all duration-500"
          style={{ height: `${pct}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground tabular-nums">{value.toFixed(1)}</p>
        <p className="text-[10px] text-muted-foreground">{unit}</p>
      </div>
    </div>
  )
}

export function ReactionMonitor({ state }: { state: BeakerState }) {
  const neutral = state.ph >= 6.5 && state.ph <= 7.5
  return (
    <div className="flex w-56 shrink-0 flex-col gap-4 rounded-2xl border border-border bg-card/70 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Реакция мониторы</h2>
      </div>

      <div className="flex items-end justify-around rounded-xl bg-secondary/40 p-4">
        <div className="flex flex-col items-center gap-1">
          <Droplets className="size-4 text-chart-3" />
          <VerticalGauge
            value={state.ph}
            min={0}
            max={14}
            unit="pH"
            label="pH"
            color="var(--color-chart-3)"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Thermometer className="size-4 text-destructive" />
          <VerticalGauge
            value={state.temp}
            min={15}
            max={100}
            unit="°C"
            label="Темп."
            color="var(--color-destructive)"
          />
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <Row label="Толтыру" value={`${Math.round(state.filled * 100)}%`} />
        <Row label="Көпіршік" value={state.bubbling ? "Иә (H₂)" : "Жоқ"} />
        <div
          className="rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors"
          style={{
            background: neutral ? "color-mix(in oklch, var(--color-accent) 30%, transparent)" : "var(--color-secondary)",
            color: neutral ? "var(--color-accent-foreground)" : "var(--color-muted-foreground)",
          }}
        >
          {neutral ? "Нейтралдау сәтті!" : "Реакция тепе-теңдікте емес"}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}
