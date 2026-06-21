"use client"

import { Suspense, useMemo, useReducer, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, ContactShadows, RoundedBox, OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { RotateCcw, FlaskConical, CheckCircle2, Flame, ListChecks } from "lucide-react"
import type { LabSim, SimStep } from "./lab-sims"

/* ───────────────────────────── simulation state ───────────────────────────── */
type LabState = {
  color: string
  level: number
  bubbling: number
  precipitate: number
  heating: boolean
  temp: number
  smoke: number
  glow: boolean
  litBulb: boolean
}

function initState(sim: LabSim): LabState {
  return {
    color: sim.startColor ?? "#dbeafe",
    level: sim.startLevel ?? 0.45,
    bubbling: 0,
    precipitate: 0,
    heating: false,
    temp: 22,
    smoke: 0,
    glow: false,
    litBulb: false,
  }
}

function reducer(state: LabState, step: SimStep): LabState {
  const e = step.effect
  return {
    ...state,
    color: e.color ?? state.color,
    level: e.level !== undefined ? e.level : Math.min(1, state.level + (e.add ?? 0)),
    bubbling: e.bubbling ?? state.bubbling,
    precipitate: e.precipitate ?? state.precipitate,
    heating: e.heating ?? state.heating,
    temp: e.temp ?? state.temp,
    smoke: e.smoke ?? state.smoke,
    glow: e.glow ?? state.glow,
    litBulb: e.litBulb ?? state.litBulb,
  }
}

/* ───────────────────────────── realistic glassware ───────────────────────────── */
const GLASS_TINT = "#eafcf8"

function Liquid({ color, level, bubbling, precipitate }: { color: string; level: number; bubbling: number; precipitate: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const surf = useRef<THREE.Mesh>(null)
  const target = useMemo(() => new THREE.Color(color), [])
  useFrame((_, dt) => {
    const t = performance.now() * 0.001
    target.set(color)
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial
      m.color.lerp(target, dt * 4)
      m.emissive.copy(m.color)
      m.emissiveIntensity = 0.22
      ref.current.scale.x = 1 + Math.sin(t * 2) * 0.01
      ref.current.scale.z = 1 + Math.cos(t * 2) * 0.01
    }
    if (surf.current) {
      const m = surf.current.material as THREE.MeshStandardMaterial
      m.color.lerp(target, dt * 4)
      surf.current.rotation.z = t * 0.5
    }
  })
  const h = 0.12 + level * 1.15
  return (
    <group>
      <mesh ref={ref} position={[0, h / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.57, 0.5, h, 56]} />
        <meshStandardMaterial color={color} roughness={0.22} metalness={0.04} transparent opacity={0.92} />
      </mesh>
      <mesh ref={surf} position={[0, h + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.565, 56]} />
        <meshStandardMaterial color={color} roughness={0.12} side={THREE.DoubleSide} />
      </mesh>
      {precipitate > 0.02 && <Precipitate amount={precipitate} color={color} />}
      {bubbling > 0.02 && <Bubbles fill={level} intensity={bubbling} />}
    </group>
  )
}

function BeakerGlass() {
  // graduation ticks
  const ticks = [0.35, 0.6, 0.85, 1.1]
  return (
    <group>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.64, 0.56, 1.55, 64, 1, true]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.22}
          roughness={0.02}
          transmission={1}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          color={GLASS_TINT}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.04, 64]} />
        <meshPhysicalMaterial transparent opacity={0.3} roughness={0.05} transmission={0.9} color={GLASS_TINT} />
      </mesh>
      {/* rim with pour spout */}
      <mesh position={[0, 1.55, 0]}>
        <torusGeometry args={[0.64, 0.028, 16, 64]} />
        <meshStandardMaterial color="#bdeee6" roughness={0.15} metalness={0.1} />
      </mesh>
      {/* graduation marks */}
      {ticks.map((y, i) => (
        <mesh key={i} position={[0.6, y, 0.18]} rotation={[0, -0.5, 0]}>
          <boxGeometry args={[0.16, 0.012, 0.004]} />
          <meshBasicMaterial color="#5eead4" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Precipitate({ amount, color }: { amount: number; color: string }) {
  const count = 40
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.85,
        z: (Math.random() - 0.5) * 0.85,
        y: 0.1 + Math.random() * 0.6,
        rest: 0.06 + Math.random() * 0.12,
        s: 0.03 + Math.random() * 0.05,
      })),
    [],
  )
  useFrame((_, dt) => {
    if (!ref.current) return
    data.forEach((p, i) => {
      if (p.y > p.rest) p.y = Math.max(p.rest, p.y - dt * 0.4)
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(p.s * Math.min(1, amount * 1.5))
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </instancedMesh>
  )
}

function Bubbles({ fill, intensity }: { fill: number; intensity: number }) {
  const count = 30
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.7,
        z: (Math.random() - 0.5) * 0.7,
        y: Math.random() * 1.1,
        speed: 0.4 + Math.random() * 0.8,
        scale: 0.025 + Math.random() * 0.05,
      })),
    [],
  )
  useFrame((_, dt) => {
    if (!ref.current) return
    const top = 0.15 + fill * 1.15
    data.forEach((b, i) => {
      b.y += b.speed * dt * (0.5 + intensity)
      if (b.y > top) b.y = 0.1
      dummy.position.set(b.x, b.y, b.z)
      dummy.scale.setScalar(b.scale * Math.min(1.4, 0.5 + intensity))
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.6} emissive="#d1fae5" emissiveIntensity={0.4} />
    </instancedMesh>
  )
}

function Steam({ intensity }: { intensity: number }) {
  const count = 18
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
        y: 1.6 + Math.random() * 1.2,
        speed: 0.3 + Math.random() * 0.4,
        scale: 0.1 + Math.random() * 0.18,
      })),
    [],
  )
  useFrame((_, dt) => {
    if (!ref.current) return
    data.forEach((p, i) => {
      p.y += p.speed * dt
      if (p.y > 3.2) p.y = 1.6
      const fade = Math.max(0, 1 - (p.y - 1.6) / 1.6)
      dummy.position.set(p.x + Math.sin(p.y * 2) * 0.1, p.y, p.z)
      dummy.scale.setScalar(p.scale * fade * intensity * 3)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
    </instancedMesh>
  )
}

function Burner({ on }: { on: boolean }) {
  const flame = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (flame.current) {
      const f = 0.85 + Math.random() * 0.3
      flame.current.scale.set(0.6 * f, f, 0.6 * f)
      flame.current.visible = on
    }
  })
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.1, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.5, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={flame} position={[0, 0.75, 0]}>
        <coneGeometry args={[0.18, 0.6, 24]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
      </mesh>
      {on && <pointLight position={[0, 0.9, 0]} color="#fb923c" intensity={2.2} distance={4} />}
    </group>
  )
}

function Bulb({ lit }: { lit: boolean }) {
  return (
    <group position={[1.9, 1.4, 0]}>
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={lit ? 0.9 : 0.4}
          transmission={0.6}
          color={lit ? "#fde68a" : "#e2e8f0"}
          emissive={lit ? "#fbbf24" : "#000000"}
          emissiveIntensity={lit ? 1.4 : 0}
        />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.2, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      {lit && <pointLight color="#fbbf24" intensity={2} distance={3} />}
    </group>
  )
}

function PourStream({ color }: { color: string }) {
  return (
    <group position={[0.1, 2.1, 0]}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function Bench() {
  return (
    <RoundedBox args={[7, 0.3, 3.5]} radius={0.07} smoothness={4} position={[0, -0.7, 0]}>
      <meshStandardMaterial color="#f0fdfa" roughness={0.45} metalness={0.08} />
    </RoundedBox>
  )
}

function LabContents({ sim, state, pouring }: { sim: LabSim; state: LabState; pouring: string | null }) {
  return (
    <>
      <color attach="background" args={["#eafdfa"]} />
      <fog attach="fog" args={["#eafdfa", 10, 20]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 7, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} color="#5eead4" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Bench />
        {sim.burner && <Burner on={state.heating} />}
        {sim.bulb && <Bulb lit={state.litBulb} />}
        <group>
          <Liquid color={state.color} level={state.level} bubbling={state.bubbling} precipitate={state.precipitate} />
          <BeakerGlass />
          {pouring && <PourStream color={pouring} />}
          {(state.smoke > 0.02 || (state.heating && state.temp > 60)) && (
            <Steam intensity={Math.max(state.smoke, state.heating && state.temp > 60 ? 0.5 : 0)} />
          )}
        </group>
        <ContactShadows position={[0, -0.54, 0]} opacity={0.35} scale={10} blur={2.4} far={4} color="#0f766e" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={4.5}
        maxDistance={9}
        minPolarAngle={0.6}
        maxPolarAngle={1.45}
        enableDamping
        target={[0, 0.7, 0]}
      />
    </>
  )
}

/* ───────────────────────────── public component ───────────────────────────── */
function VirtualLabInner({ sim }: { sim: LabSim }) {
  const [state, dispatch] = useReducer(reducer, sim, initState)
  const [done, setDone] = useState<number[]>([])
  const [log, setLog] = useState<string[]>([])
  const [pouring, setPouring] = useState<string | null>(null)
  const pourTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, force] = useState(0)

  const runStep = (step: SimStep, i: number) => {
    if (step.effect.color || step.effect.add !== undefined || step.effect.level !== undefined) {
      setPouring(step.effect.color ?? state.color)
      if (pourTimer.current) clearTimeout(pourTimer.current)
      pourTimer.current = setTimeout(() => setPouring(null), 1100)
    }
    dispatch(step)
    setDone((d) => (d.includes(i) ? d : [...d, i]))
    setLog((l) => [step.observation, ...l].slice(0, 5))
  }

  const reset = () => {
    setDone([])
    setLog([])
    setPouring(null)
    // re-init by dispatching a synthetic reset step
    dispatch({ label: "", observation: "", effect: { ...initStateAsEffect(sim) } })
    force((n) => n + 1)
  }

  const allDone = done.length >= sim.steps.length

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FlaskConical className="size-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">Виртуалды зертхана — 3D тәжірибе</p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RotateCcw className="size-3.5" />
          Қайта бастау
        </button>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_300px]">
        {/* 3D viewport */}
        <div className="relative h-80 w-full border-b border-border md:border-b-0 md:border-r">
          <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 2.4, 6.2], fov: 44 }} gl={{ antialias: true, alpha: true }}>
            <LabContents sim={sim} state={state} pouring={pouring} />
          </Canvas>
          {/* readouts */}
          <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-card/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
              <Flame className="size-3.5 text-primary" />
              {Math.round(state.temp)}°C
            </span>
          </div>
        </div>

        {/* controls + log */}
        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ListChecks className="size-3.5 text-primary" />
              Қадамдарды ретімен орында
            </p>
            <div className="flex flex-col gap-2">
              {sim.steps.map((step, i) => {
                const isDone = done.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => runStep(step, i)}
                    className={
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all " +
                      (isDone
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary")
                    }
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: step.color ?? "var(--secondary)", color: step.color ? "#fff" : undefined }}
                    >
                      {isDone ? <CheckCircle2 className="size-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0">{step.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* observation log */}
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="mb-1 text-[11px] font-semibold text-foreground">Бақылау журналы</p>
            {log.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Қадамды басып, нәтижені бақыла…</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {log.map((m, i) => (
                  <li key={i} className="text-[11px] leading-snug text-secondary-foreground">
                    • {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {allDone && (
            <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed text-foreground animate-in fade-in">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Тәжірибе аяқталды! </span>
                {sim.conclusion}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** helper to turn the sim start values into an effect patch for reset */
function initStateAsEffect(sim: LabSim) {
  const s = initState(sim)
  return {
    color: s.color,
    level: s.level,
    bubbling: 0,
    precipitate: 0,
    heating: false,
    temp: 22,
    smoke: 0,
    glow: false,
    litBulb: false,
  }
}

export const VirtualLab = dynamic(() => Promise.resolve(VirtualLabInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-border bg-secondary/40 text-sm text-muted-foreground">
      3D зертхана жүктелуде…
    </div>
  ),
})
