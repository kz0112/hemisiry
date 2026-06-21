"use client"

import { Suspense, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { Atom as AtomIcon, RotateCw, Move3d } from "lucide-react"
import { MOLECULES, ELEMENTS, type Molecule, type MoleculeId } from "./molecules"

/* ----------------------------- single atom ----------------------------- */
function AtomMesh({ el, pos }: { el: keyof typeof ELEMENTS; pos: [number, number, number] }) {
  const info = ELEMENTS[el]
  return (
    <mesh position={pos} castShadow>
      <sphereGeometry args={[info.radius, 48, 48]} />
      <meshPhysicalMaterial
        color={info.color}
        roughness={0.25}
        metalness={0.1}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        emissive={info.color}
        emissiveIntensity={0.08}
      />
    </mesh>
  )
}

/* ----------------------------- a bond (1–3) ----------------------------- */
function BondMesh({
  start,
  end,
  order = 1,
  ionic = false,
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  order?: 1 | 2 | 3
  ionic?: boolean
}) {
  const { mid, len, quat, offsets } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start)
    const len = dir.length()
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    // perpendicular vector for multi-bond offsets
    const perp = new THREE.Vector3(0, 1, 0).cross(dir).normalize()
    if (perp.lengthSq() < 0.001) perp.set(1, 0, 0)
    const gap = 0.12
    let offsets: THREE.Vector3[] = [new THREE.Vector3()]
    if (order === 2) offsets = [perp.clone().multiplyScalar(gap), perp.clone().multiplyScalar(-gap)]
    if (order === 3)
      offsets = [perp.clone().multiplyScalar(gap * 1.6), new THREE.Vector3(), perp.clone().multiplyScalar(-gap * 1.6)]
    return { mid, len, quat, offsets }
  }, [start, end, order])

  if (ionic) {
    // dashed-look electrostatic link: a few small spheres along the line
    const dots = 5
    return (
      <group>
        {Array.from({ length: dots }).map((_, i) => {
          const t = (i + 1) / (dots + 1)
          const p = new THREE.Vector3().lerpVectors(start, end, t)
          return (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color="#94a3b8" transparent opacity={0.55} />
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <group>
      {offsets.map((off, i) => (
        <mesh key={i} position={mid.clone().add(off)} quaternion={quat}>
          <cylinderGeometry args={[0.1, 0.1, len, 20]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

/* ----------------------------- the molecule ----------------------------- */
function MoleculeGroup({ molecule, spin }: { molecule: Molecule; spin: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const positions = useMemo(() => molecule.atoms.map((a) => new THREE.Vector3(...a.pos)), [molecule])

  useFrame((_, dt) => {
    if (ref.current && spin) ref.current.rotation.y += dt * 0.5
  })

  return (
    <group ref={ref}>
      {molecule.bonds.map((b, i) => (
        <BondMesh key={i} start={positions[b.a]} end={positions[b.b]} order={b.order} ionic={b.ionic} />
      ))}
      {molecule.atoms.map((a, i) => (
        <AtomMesh key={i} el={a.el} pos={a.pos} />
      ))}
    </group>
  )
}

/* ----------------------------- scene wrapper ----------------------------- */
function Scene({ molecule, spin }: { molecule: Molecule; spin: boolean }) {
  return (
    <>
      <color attach="background" args={["#f3fbf9"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#5eead4" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <MoleculeGroup molecule={molecule} spin={spin} />
        <ContactShadows position={[0, -1.8, 0]} opacity={0.25} scale={8} blur={2.5} far={3} color="#0f766e" />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={9} enableDamping />
    </>
  )
}

function MoleculeViewerInner({ id }: { id: MoleculeId }) {
  const molecule = MOLECULES[id]
  const [spin, setSpin] = useState(true)
  const usedElements = useMemo(() => Array.from(new Set(molecule.atoms.map((a) => a.el))), [molecule])

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <AtomIcon className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">
              {molecule.name} <span className="font-mono text-primary">{molecule.formula}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">{molecule.geometry}</p>
          </div>
        </div>
        <button
          onClick={() => setSpin((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RotateCw className={spin ? "size-3.5 text-primary" : "size-3.5"} />
          {spin ? "Айналуды тоқтату" : "Айналдыру"}
        </button>
      </div>

      <div className="relative h-64 w-full">
        <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.2, 5], fov: 45 }} gl={{ antialias: true }}>
          <Scene molecule={molecule} spin={spin} />
        </Canvas>
        <div className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
          <Move3d className="size-3" />
          Тінтуірмен айналдырыңыз
        </div>
      </div>

      {/* legend + info */}
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {usedElements.map((el) => {
            const info = ELEMENTS[el]
            return (
              <span key={el} className="inline-flex items-center gap-1.5 text-xs text-foreground">
                <span className="size-3 rounded-full ring-1 ring-border" style={{ background: info.color }} />
                {info.symbol} — {info.name}
              </span>
            )
          })}
        </div>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{molecule.info}</p>
      </div>
    </figure>
  )
}

/* Lazy, client-only export to avoid SSR issues with the WebGL canvas */
export const MoleculeViewer = dynamic(() => Promise.resolve(MoleculeViewerInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-border bg-secondary/40 text-sm text-muted-foreground">
      3D модель жүктелуде…
    </div>
  ),
})
