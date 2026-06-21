"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type HandFrame = {
  /** 0..1, already mirrored to match a selfie view */
  x: number
  y: number
  /** true when thumb + index finger are pinched together */
  pinching: boolean
  /** true when all four fingers are extended (open palm) */
  open: boolean
  present: boolean
}

type Status = "idle" | "loading" | "ready" | "error"

/** Count how many of the 4 main fingers are extended (tip above PIP joint). */
function countExtended(hand: any[]): number {
  // [tip, pip] pairs for index, middle, ring, pinky
  const pairs = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18],
  ]
  let n = 0
  for (const [tip, pip] of pairs) {
    // smaller y == higher on screen == extended (hand held upright)
    if (hand[tip].y < hand[pip].y - 0.02) n++
  }
  return n
}

/**
 * Webcam + MediaPipe Hands tracking.
 * Detects the index fingertip position, a pinch gesture (thumb↔index),
 * and an open-palm gesture. Calls `onFrame` every animation frame while enabled.
 */
export function useHandTracking(enabled: boolean, onFrame: (f: HandFrame) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const landmarkerRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const onFrameRef = useRef(onFrame)
  const smooth = useRef({ x: 0.5, y: 0.5 })
  const [status, setStatus] = useState<Status>("idle")

  onFrameRef.current = onFrame

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus("idle")
  }, [])

  useEffect(() => {
    if (!enabled) {
      stop()
      return
    }

    let cancelled = false

    async function start() {
      try {
        setStatus("loading")
        const vision = await import("@mediapipe/tasks-vision")
        const { HandLandmarker, FilesetResolver } = vision

        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
        )
        const landmarker = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        })
        if (cancelled) {
          landmarker.close()
          return
        }
        landmarkerRef.current = landmarker

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream

        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        setStatus("ready")

        const loop = () => {
          const v = videoRef.current
          const lm = landmarkerRef.current
          if (!v || !lm || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(loop)
            return
          }
          const result = lm.detectForVideo(v, performance.now())
          const hand = result.landmarks?.[0]
          if (hand) {
            const index = hand[8]
            const thumb = hand[4]
            // mirror x for selfie view
            const targetX = 1 - index.x
            const targetY = index.y
            smooth.current.x += (targetX - smooth.current.x) * 0.35
            smooth.current.y += (targetY - smooth.current.y) * 0.35
            const dist = Math.hypot(index.x - thumb.x, index.y - thumb.y)
            const extended = countExtended(hand)
            onFrameRef.current({
              x: smooth.current.x,
              y: smooth.current.y,
              pinching: dist < 0.06,
              open: extended >= 4 && dist > 0.1,
              present: true,
            })
          } else {
            onFrameRef.current({
              x: smooth.current.x,
              y: smooth.current.y,
              pinching: false,
              open: false,
              present: false,
            })
          }
          rafRef.current = requestAnimationFrame(loop)
        }
        loop()
      } catch (err) {
        console.log("[v0] hand tracking error:", (err as Error).message)
        if (!cancelled) setStatus("error")
      }
    }

    start()
    return () => {
      cancelled = true
      stop()
    }
  }, [enabled, stop])

  return { videoRef, status }
}
