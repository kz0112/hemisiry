"use client"

import { useRef, useState, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import { Environment, ContactShadows, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

export type Reagent = {
  id: string
  name: string
  formula: string
  color: string
  /** how this reagent shifts pH when poured (negative = acid, positive = base) */
  phShift: number
  /** true for solid metals that produce gas + heat in acid */
  isMetal?: boolean
}

export const REAGENTS: Reagent[] = [
  { id: "hcl", name: "Тұз қышқылы", formula: "HCl", color: "#f43f5e", phShift: -2.4 },
  { id: "naoh", name: "Сілті", formula: "NaOH", color: "#3b82f6", phShift: 2.4 },
  { id: "ind", name: "Индикатор", formula: "Ind", color: "#10b981", phShift: 0 },
  { id: "zn", name: "Мырыш", formula: "Zn", color: "#94a3b8", phShift: 0, isMetal: true },
]

export type BeakerState = {
  ph: number
  temp: number
  color: string
  bubbling: boolean
  filled: number
}

type DragInfo = { reagent: Reagent; pointerId: number } | null

/* ---------------------------------- Glassware ---------------------------------- */

function Glass({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/** Beaker: a tinted glass cylinder with an animated liquid inside */
function Beaker({
  state,
  highlighted,
  onPointerUp,
}: {
  state: BeakerState
  highlighted: boolean
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void
}) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const surfaceRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const glow = useRef(0)
  const prevColor = useRef(state.color)
  const flash = useRef(0)
  const tmpA = useMemo(() => new THREE.Color(), [])
  const tmpB = useMemo(() => new THREE.Color(), [])

  // detect a color change to trigger a swirl/flash pulse (e.g. when indicator is added)
  if (prevColor.current !== state.color) {
    prevColor.current = state.color
    flash.current = 1
  }

  useFrame((_, dt) => {
    glow.current = THREE.MathUtils.lerp(glow.current, highlighted ? 1 : 0, dt * 8)
    flash.current = THREE.MathUtils.lerp(flash.current, 0, dt * 2.5)
    const t = performance.now() * 0.001

    // smoothly blend the liquid toward the target color so transitions are visible
    tmpA.set(state.color)
    if (liquidRef.current) {
      const mat = liquidRef.current.material as THREE.MeshStandardMaterial
      mat.color.lerp(tmpA, dt * 4)
      mat.emissive.copy(mat.color)
      mat.emissiveIntensity = 0.45 + flash.current * 0.9 + Math.sin(t * 3) * 0.05
      // gentle liquid wobble + a stronger swirl right after a color change
      liquidRef.current.rotation.y = t * 0.6
      liquidRef.current.scale.x = 1 + Math.sin(t * 2) * 0.012 + flash.current * 0.04
      liquidRef.current.scale.z = 1 + Math.cos(t * 2) * 0.012 + flash.current * 0.04
    }
    if (surfaceRef.current) {
      const mat = surfaceRef.current.material as THREE.MeshStandardMaterial
      mat.color.lerp(tmpA, dt * 4)
      mat.emissive.copy(mat.color)
      mat.emissiveIntensity = 0.6 + flash.current
      surfaceRef.current.rotation.z = t * 0.8
    }
    // little color-change pulse on the whole beaker
    if (groupRef.current) {
      const s = 1 + flash.current * 0.03
      groupRef.current.scale.setScalar(s)
    }
  })

  const fillH = 0.25 + state.filled * 1.05
  const surfaceY = fillH + 0.06

  return (
    <group ref={groupRef} position={[0, 0, 0]} onPointerUp={onPointerUp}>
      {/* liquid body — vivid and opaque so the color always reads clearly */}
      <mesh ref={liquidRef} position={[0, fillH / 2 + 0.04, 0]}>
        <cylinderGeometry args={[0.56, 0.49, fillH, 48]} />
        <meshStandardMaterial color={state.color} roughness={0.25} metalness={0.05} />
      </mesh>
      {/* bright top surface (meniscus) — visible from the camera above, sells color changes */}
      <mesh ref={surfaceRef} position={[0, surfaceY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.555, 48]} />
        <meshStandardMaterial color={state.color} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* glass body — clear so the liquid inside shows through */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.62, 0.55, 1.5, 48, 1, true]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.14}
          roughness={0.03}
          transmission={0.95}
          thickness={0.4}
          color="#f0ffff"
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* highlight ring on table */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 48]} />
        <meshBasicMaterial color="#10b981" transparent opacity={glowOpacity(glow.current)} />
      </mesh>
      {state.bubbling && <Bubbles fill={state.filled} />}
    </group>
  )
}

function glowOpacity(g: number) {
  return Math.min(0.9, g)
}

/** Rising gas bubbles inside the beaker */
function Bubbles({ fill }: { fill: number }) {
  const count = 26
  const ref = useRef<THREE.InstancedMesh>(null)
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.7,
        z: (Math.random() - 0.5) * 0.7,
        y: Math.random() * 1.1,
        speed: 0.4 + Math.random() * 0.7,
        scale: 0.03 + Math.random() * 0.05,
      })),
    [],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    if (!ref.current) return
    const top = 0.2 + fill * 1.1
    data.forEach((b, i) => {
      b.y += b.speed * dt
      if (b.y > top) b.y = 0.1
      dummy.position.set(b.x, b.y + 0.1, b.z)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.55} emissive="#d1fae5" emissiveIntensity={0.4} />
    </instancedMesh>
  )
}

/** Small Erlenmeyer-style reagent flask on the shelf, draggable */
function ReagentFlask({
  reagent,
  position,
  isDragging,
  onPointerDown,
}: {
  reagent: Reagent
  position: [number, number, number]
  isDragging: boolean
  onPointerDown: (e: ThreeEvent<PointerEvent>, r: Reagent) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const hover = useRef(0)
  const [hovered, setHovered] = useState(false)

  useFrame((_, dt) => {
    hover.current = THREE.MathUtils.lerp(hover.current, hovered && !isDragging ? 1 : 0, dt * 10)
    if (ref.current) {
      ref.current.position.y = position[1] + hover.current * 0.08
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "grab"
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = "auto"
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        onPointerDown(e, reagent)
      }}
      visible={!isDragging}
      scale={1.25}
    >
      {/* glowing base disc so each reagent reads clearly against the bright lab */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 40]} />
        <meshBasicMaterial color={reagent.color} transparent opacity={0.28} />
      </mesh>

      {reagent.isMetal ? (
        // metal sample jar (short cylinder with granules)
        <>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.55, 32, 1, true]} />
            <meshPhysicalMaterial transparent opacity={0.5} roughness={0.1} color="#cdeee8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.24, 24]} />
            <meshStandardMaterial color={reagent.color} roughness={0.5} metalness={0.7} />
          </mesh>
        </>
      ) : (
        // erlenmeyer flask = cone + neck with vivid liquid
        <>
          {/* liquid inside cone (rendered first, opaque, so it stays vivid) */}
          <mesh position={[0, 0.17, 0]}>
            <coneGeometry args={[0.3, 0.4, 32]} />
            <meshStandardMaterial color={reagent.color} emissive={reagent.color} emissiveIntensity={0.55} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.31, 0]}>
            <coneGeometry args={[0.36, 0.62, 32, 1, true]} />
            <meshPhysicalMaterial transparent opacity={0.4} roughness={0.08} thickness={0.3} color="#cdeee8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.3, 24, 1, true]} />
            <meshPhysicalMaterial transparent opacity={0.4} roughness={0.08} color="#cdeee8" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  )
}

/** a thin falling stream + droplets of reagent, shown while pouring into the beaker */
function PourStream({ color }: { color: string }) {
  const count = 14
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        y: -(i / count) * 1.3,
        speed: 2.2 + Math.random() * 0.8,
        x: (Math.random() - 0.5) * 0.04,
        scale: 0.035 + Math.random() * 0.03,
      })),
    [],
  )

  useFrame((_, dt) => {
    if (!ref.current) return
    data.forEach((d, i) => {
      d.y -= d.speed * dt
      if (d.y < -1.35) d.y = 0
      dummy.position.set(d.x, d.y, 0)
      dummy.scale.setScalar(d.scale)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[0.22, 0.05, 0]}>
      {/* continuous thin stream */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.3, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.85} />
      </mesh>
      {/* droplets */}
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </instancedMesh>
    </group>
  )
}

/** the flask that follows the pointer while dragging; tilts and pours when over the beaker */
function DragGhost({
  reagent,
  target,
  pouring,
}: {
  reagent: Reagent
  target: React.RefObject<THREE.Vector3>
  pouring: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  const tilt = useRef(0)
  useFrame((_, dt) => {
    if (ref.current && target.current) {
      ref.current.position.lerp(target.current, 0.5)
      // tilt hard toward the beaker when pouring, upright otherwise
      tilt.current = THREE.MathUtils.lerp(tilt.current, pouring ? 1.15 : 0.1, dt * 9)
      ref.current.rotation.z = -tilt.current
    }
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.34, 0.6, 32, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.3} transmission={0.85} roughness={0.05} color="#e6fffb" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.26, 0.32, 32]} />
        <meshStandardMaterial color={reagent.color} emissive={reagent.color} emissiveIntensity={0.6} transparent opacity={0.95} />
      </mesh>
      {pouring && <PourStream color={reagent.color} />}
    </group>
  )
}

/* ---------------------------------- Table + rig ---------------------------------- */

function Table() {
  return (
    <group>
      <RoundedBox args={[8, 0.3, 4]} radius={0.08} smoothness={4} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#f0fdfa" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      {/* shelf line */}
      <mesh position={[0, 0, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 0.02]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function Rig({
  beakerState,
  drag,
  setDrag,
  onPour,
}: {
  beakerState: BeakerState
  drag: DragInfo
  setDrag: (d: DragInfo) => void
  onPour: (r: Reagent) => void
}) {
  const { camera, gl } = useThree()
  const dragTarget = useRef(new THREE.Vector3(0, 1.6, 1.5))
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.2), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const [overBeaker, setOverBeaker] = useState(false)

  const updateDrag = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const rect = gl.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const point = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, point)
      if (point) {
        dragTarget.current.set(point.x, Math.max(point.y, 1.2), 1.0)
        setOverBeaker(Math.abs(point.x) < 0.9 && point.y < 2.3)
      }
    },
    [camera, gl, plane, raycaster],
  )

  const startDrag = useCallback(
    (e: ThreeEvent<PointerEvent>, r: Reagent) => {
      ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
      setDrag({ reagent: r, pointerId: e.pointerId })
      updateDrag(e)
    },
    [setDrag, updateDrag],
  )

  const endDrag = useCallback(() => {
    if (drag && overBeaker) onPour(drag.reagent)
    setDrag(null)
    setOverBeaker(false)
    document.body.style.cursor = "auto"
  }, [drag, overBeaker, onPour, setDrag])

  // shelf positions — flanking the central beaker so they read clearly
  const shelf: [number, number, number][] = [
    [-2.1, 0, 0.4],
    [-1.3, 0, 0.7],
    [1.3, 0, 0.7],
    [2.1, 0, 0.4],
  ]

  return (
    <group
      onPointerMove={(e) => {
        if (drag) updateDrag(e)
      }}
      onPointerUp={endDrag}
    >
      {/* invisible catcher so drags anywhere release */}
      <mesh position={[0, 2, 0]} visible={false}>
        <boxGeometry args={[20, 12, 1]} />
        <meshBasicMaterial />
      </mesh>

      <Table />

      <Glass>
        <Beaker state={beakerState} highlighted={!!drag && overBeaker} onPointerUp={endDrag} />
      </Glass>

      {REAGENTS.map((r, i) => (
        <ReagentFlask
          key={r.id}
          reagent={r}
          position={shelf[i]}
          isDragging={drag?.reagent.id === r.id}
          onPointerDown={startDrag}
        />
      ))}

      {drag && <DragGhost reagent={drag.reagent} target={dragTarget} pouring={overBeaker} />}
    </group>
  )
}

/** Keeps the camera aimed at the glassware (around y≈0.9) instead of the table origin */
function CameraTarget() {
  const { camera } = useThree()
  useFrame(() => {
    camera.lookAt(0, 0.9, 0)
  })
  return null
}

/* ---------------------------------- Public component ---------------------------------- */

export function LabScene({
  beakerState,
  onPour,
}: {
  beakerState: BeakerState
  onPour: (r: Reagent) => void
}) {
  const [drag, setDrag] = useState<DragInfo>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 2.2, 6.4], fov: 44 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#eafdfa"]} />
      <fog attach="fog" args={["#eafdfa", 9, 18]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-4, 3, 2]} intensity={0.4} color="#5eead4" />
      <Environment preset="city" />

      <CameraTarget />
      <Rig beakerState={beakerState} drag={drag} setDrag={setDrag} onPour={onPour} />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={12} blur={2.4} far={4} color="#0f766e" />
    </Canvas>
  )
}
