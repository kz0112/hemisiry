"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Hand, Loader2, CameraOff, Sparkles } from "lucide-react"
import { useHandTracking, type HandFrame } from "./use-hand-tracking"
import { REAGENTS, type Reagent } from "./lab-scene"
import { playGrab, playToggle } from "@/lib/sound"

// Approximate on-stage positions (% of the canvas) matching the 3D layout.
const ZONES: Record<string, { x: number; y: number }> = {
  hcl: { x: 12, y: 60 },
  naoh: { x: 30, y: 64 },
  ind: { x: 70, y: 64 },
  zn: { x: 88, y: 60 },
}
const BEAKER = { x: 50, y: 52, r: 16 }
const ZONE_R = 11

export function GestureLayer({
  enabled,
  onPour,
  onReset,
}: {
  enabled: boolean
  onPour: (r: Reagent) => void
  onReset?: () => void
}) {
  const [cursor, setCursor] = useState<HandFrame>({ x: 0.5, y: 0.5, pinching: false, open: false, present: false })
  const [held, setHeld] = useState<Reagent | null>(null)
  const heldRef = useRef<Reagent | null>(null)
  const wasPinching = useRef(false)
  const openFrames = useRef(0)
  const lastResetAt = useRef(0)

  const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

  const handleFrame = useCallback(
    (f: HandFrame) => {
      setCursor(f)
      const cx = f.x * 100
      const cy = f.y * 100

      // pinch just started → try to grab a reagent
      if (f.pinching && !wasPinching.current && !heldRef.current) {
        for (const r of REAGENTS) {
          const z = ZONES[r.id]
          if (z && dist(cx, cy, z.x, z.y) < ZONE_R + 4) {
            heldRef.current = r
            setHeld(r)
            playGrab()
            break
          }
        }
      }

      // pinch released → if holding over the beaker, pour
      if (!f.pinching && wasPinching.current && heldRef.current) {
        if (dist(cx, cy, BEAKER.x, BEAKER.y) < BEAKER.r) {
          onPour(heldRef.current)
        }
        heldRef.current = null
        setHeld(null)
      }
      wasPinching.current = f.pinching

      // sustained open palm (≈0.7s) with empty hand → reset the lab
      if (f.open && !heldRef.current) {
        openFrames.current += 1
        if (openFrames.current > 42 && performance.now() - lastResetAt.current > 2500) {
          lastResetAt.current = performance.now()
          openFrames.current = 0
          playToggle()
          onReset?.()
        }
      } else {
        openFrames.current = 0
      }
    },
    [onPour, onReset],
  )

  const { videoRef, status } = useHandTracking(enabled, handleFrame)

  // canvas mirror of the video for the preview thumbnail
  const previewRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (!enabled || status !== "ready") return
    let raf = 0
    const draw = () => {
      const v = videoRef.current
      const c = previewRef.current
      if (v && c && v.readyState >= 2) {
        const ctx = c.getContext("2d")
        if (ctx) {
          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(v, -c.width, 0, c.width, c.height)
          ctx.restore()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [enabled, status, videoRef])

  // hidden video element is always mounted so the hook can attach the stream
  const video = <video ref={videoRef} className="hidden" playsInline muted aria-hidden />

  if (!enabled) return video

  const overBeaker = dist(cursor.x * 100, cursor.y * 100, BEAKER.x, BEAKER.y) < BEAKER.r

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {video}

      {/* live camera preview (picture-in-picture) */}
      <div className="absolute bottom-5 right-5 w-44 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <span className={`size-2 rounded-full ${status === "ready" ? "bg-primary" : "bg-muted-foreground"}`} />
            Камера
          </span>
          {cursor.present && (
            <span className="text-[10px] font-medium text-primary">
              {held ? "ұстауда" : cursor.pinching ? "қысу" : cursor.open ? "ашық алақан" : "қол анықталды"}
            </span>
          )}
        </div>
        <div className="relative aspect-[4/3] w-full bg-secondary">
          <canvas ref={previewRef} width={176} height={132} className="h-full w-full object-cover" />
          {cursor.present && (
            <span
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
              style={{
                left: `${cursor.x * 100}%`,
                top: `${cursor.y * 100}%`,
                background: held ? held.color : "var(--color-primary)",
              }}
            />
          )}
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
              {status === "loading" ? "жүктелуде…" : status === "error" ? "қолжетімсіз" : ""}
            </div>
          )}
        </div>
      </div>

      {/* status pill */}
      {status !== "ready" && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-lg">
          {status === "loading" && (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              Камера мен қол үлгісі жүктелуде…
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-2 text-destructive">
              <CameraOff className="size-4" />
              Камераға қолжетімділік берілмеді
            </span>
          )}
          {status === "idle" && "Жест-басқару тоқтатылды"}
        </div>
      )}

      {/* gesture hint */}
      {status === "ready" && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-foreground shadow-sm">
          <Sparkles className="size-3.5 text-primary" />
          {held
            ? "Колбаның үстіне апарып, саусақты жазыңыз — құйылады"
            : "Реагентті қысып ұстаңыз · алақанды ашсаңыз — қалпына келеді"}
        </div>
      )}

      {/* reagent target zones */}
      {REAGENTS.map((r) => {
        const z = ZONES[r.id]
        if (!z) return null
        const isHeld = held?.id === r.id
        return (
          <div
            key={r.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed transition-opacity"
            style={{
              left: `${z.x}%`,
              top: `${z.y}%`,
              width: `${ZONE_R * 2}%`,
              aspectRatio: "1",
              borderColor: r.color,
              opacity: isHeld ? 0.2 : 0.55,
            }}
          />
        )
      })}

      {/* beaker drop zone, lights up when holding over it */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all"
        style={{
          left: `${BEAKER.x}%`,
          top: `${BEAKER.y}%`,
          width: `${BEAKER.r * 2}%`,
          aspectRatio: "1",
          borderColor: "var(--color-primary)",
          background: held && overBeaker ? "color-mix(in oklch, var(--color-primary) 18%, transparent)" : "transparent",
          opacity: held ? 1 : 0.3,
        }}
      />

      {/* hand cursor */}
      {cursor.present && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
        >
          <div
            className="flex items-center justify-center rounded-full border-2 shadow-lg"
            style={{
              width: cursor.pinching ? 28 : 44,
              height: cursor.pinching ? 28 : 44,
              borderColor: held ? held.color : "var(--color-primary)",
              background: held
                ? `color-mix(in oklch, ${held.color} 35%, white)`
                : "color-mix(in oklch, var(--color-primary) 12%, white)",
            }}
          >
            <Hand className="size-4" style={{ color: held ? held.color : "var(--color-primary)" }} />
          </div>
          {held && (
            <span
              className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow"
              style={{ background: held.color }}
            >
              {held.formula}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
