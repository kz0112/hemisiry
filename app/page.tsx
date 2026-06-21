"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Sparkles, MousePointerClick, Hand } from "lucide-react"
import { Sidebar, type ViewId } from "@/components/lab/sidebar"
import { ReactionMonitor } from "@/components/lab/reaction-monitor"
import { Dock } from "@/components/lab/dock"
import { GestureLayer } from "@/components/lab/gesture-layer"
import { CourseView } from "@/components/course/course-view"
import { PeriodicTable } from "@/components/periodic/periodic-table"
import { REAGENTS, type BeakerState, type Reagent } from "@/components/lab/lab-scene"
import {
  primeAudio,
  setMuted,
  playPour,
  playSuccess,
  playError,
  playToggle,
  startFizz,
  stopFizz,
} from "@/lib/sound"

const LabScene = dynamic(() => import("@/components/lab/lab-scene").then((m) => m.LabScene), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Зертхана жүктелуде…
    </div>
  ),
})

function mix(a: string, b: string, t: number) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)]
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)]
  const r = pa.map((v, i) => Math.round(v + (pb[i] - v) * t))
  return `#${r.map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

function liquidColorForPh(ph: number) {
  if (ph <= 7) return mix("#f43f5e", "#10b981", Math.max(0, Math.min(1, ph / 7)))
  return mix("#10b981", "#3b82f6", Math.max(0, Math.min(1, (ph - 7) / 7)))
}

const INITIAL: BeakerState = { ph: 7, temp: 22, color: "#10b981", bubbling: false, filled: 0.25 }

export default function Page() {
  const [view, setView] = useState<ViewId>("lab")
  const [beaker, setBeaker] = useState<BeakerState>(INITIAL)
  const [toast, setToast] = useState<string | null>(null)
  const [gesture, setGesture] = useState(false)
  const [muted, setMutedState] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // keep the fizz loop in sync with the bubbling state
  useEffect(() => {
    if (beaker.bubbling) startFizz()
    else stopFizz()
    return () => stopFizz()
  }, [beaker.bubbling])

  useEffect(() => stopFizz, [])

  const flash = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const handlePour = useCallback(
    (r: Reagent) => {
      primeAudio()
      playPour()
      setBeaker((prev) => {
        const ph = Math.max(0, Math.min(14, prev.ph + r.phShift))
        let temp = prev.temp
        let bubbling = prev.bubbling
        const filled = Math.min(1, prev.filled + (r.isMetal ? 0.05 : 0.12))

        if (r.isMetal) {
          if (prev.ph < 6.2) {
            bubbling = true
            temp = Math.min(100, prev.temp + 14)
            flash(`${r.formula} + қышқыл → H₂ газы бөлінді! Температура көтерілді.`)
          } else {
            playError()
            flash(`${r.formula} салынды, бірақ реакция үшін қышқыл орта керек.`)
          }
        } else if (r.phShift < 0) {
          flash(`${r.formula} құйылды — орта қышқылданды (pH ${ph.toFixed(1)}).`)
          if (bubbling && ph >= 6.2) bubbling = false
        } else if (r.phShift > 0) {
          flash(`${r.formula} құйылды — орта сілтіленді (pH ${ph.toFixed(1)}).`)
        } else {
          flash("Индикатор қосылды — түс өзгерісін бақылаңыз.")
        }

        const neutral = ph >= 6.5 && ph <= 7.5
        if (neutral && Math.abs(prev.ph - 7) > 0.5) {
          playSuccess()
          flash("Нейтралдау сәтті! pH ≈ 7")
        }

        return { ph, temp, bubbling, filled, color: liquidColorForPh(ph) }
      })
    },
    [flash],
  )

  const reset = useCallback(() => {
    setBeaker(INITIAL)
    flash("Зертхана бастапқы күйге қайтарылды.")
  }, [flash])

  const toggleGesture = useCallback(() => {
    primeAudio()
    playToggle()
    setGesture((g) => !g)
  }, [])

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m
      setMuted(next)
      if (!next) {
        primeAudio()
        playToggle()
      }
      return next
    })
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar active={view} onChange={setView} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {view === "lab" && (
          <main className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0">
              <LabScene beakerState={beaker} onPour={handlePour} />
            </div>

            <GestureLayer enabled={gesture} onPour={handlePour} onReset={reset} />

            {/* task card */}
            <div className="pointer-events-none absolute left-5 top-5 w-64 rounded-2xl border border-border bg-card/70 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Тапсырма: Нейтралдау</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Қышқыл мен сілтіні араластырып, pH деңгейін 7-ге жеткізіңіз. Мырышты қышқыл ортаға салып, газ бөлінуін
                бақылаңыз.
              </p>
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11px] text-secondary-foreground">
                {gesture ? (
                  <>
                    <Hand className="size-3.5 shrink-0 text-primary" />
                    Қолыңызды қысып реагентті ұстаңыз, колба үстінде жіберіңіз
                  </>
                ) : (
                  <>
                    <MousePointerClick className="size-3.5 shrink-0 text-primary" />
                    Колбаны ұстап, ортадағы ыдысқа сүйреңіз
                  </>
                )}
              </div>
            </div>

            {/* reagent legend */}
            <div className="pointer-events-none absolute bottom-5 left-5 flex flex-col gap-1.5 rounded-2xl border border-border bg-card/70 p-3 shadow-xl shadow-primary/5 backdrop-blur-xl">
              {REAGENTS.map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-xs">
                  <span className="size-3 rounded-full" style={{ background: r.color }} />
                  <span className="font-medium text-foreground">{r.formula}</span>
                  <span className="text-muted-foreground">— {r.name}</span>
                </div>
              ))}
            </div>

            {/* monitor */}
            <div className="absolute right-5 top-5">
              <ReactionMonitor state={beaker} />
            </div>

            {/* dock */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
              <Dock
                onReset={reset}
                gesture={gesture}
                onToggleGesture={toggleGesture}
                muted={muted}
                onToggleMute={toggleMute}
              />
            </div>

            {/* toast */}
            {toast && (
              <div className="absolute left-1/2 top-5 -translate-x-1/2 animate-in fade-in slide-in-from-top-2">
                <div className="rounded-full border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl">
                  {toast}
                </div>
              </div>
            )}
          </main>
        )}

        {view === "course" && <CourseView />}
        {view === "table" && <PeriodicTable />}
      </div>
    </div>
  )
}
