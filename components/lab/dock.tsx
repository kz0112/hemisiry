"use client"

import { Hand, RotateCcw, MousePointer2, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

export function Dock({
  onReset,
  gesture,
  onToggleGesture,
  muted,
  onToggleMute,
}: {
  onReset: () => void
  gesture: boolean
  onToggleGesture: () => void
  muted: boolean
  onToggleMute: () => void
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-card p-1.5 shadow-xl shadow-primary/10">
      <button
        onClick={onToggleGesture}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
          gesture ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-secondary",
        )}
      >
        {gesture ? <Hand className="size-4" /> : <MousePointer2 className="size-4" />}
        {gesture ? "Жест-басқару қосулы" : "Жест-басқаруды қосу"}
      </button>

      <button
        onClick={onToggleMute}
        aria-label={muted ? "Дыбысты қосу" : "Дыбысты өшіру"}
        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      <button
        onClick={onReset}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <RotateCcw className="size-4" />
        Қайта бастау
      </button>
    </div>
  )
}
