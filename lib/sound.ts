"use client"

/**
 * Tiny Web Audio synth — generates all lab sounds on the fly (no asset files).
 * Sounds: grab click, liquid pour, fizzing reaction loop, success chime, error,
 * a soft UI toggle, and a steady ambient lab hum.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {})
  return ctx
}

export function setMuted(muted: boolean) {
  enabled = !muted
  if (master) master.gain.value = muted ? 0 : 0.9
}

export function isMuted() {
  return !enabled
}

/** Call from a user gesture (click) to unlock audio on mobile/Safari. */
export function primeAudio() {
  ac()
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.2,
  whenOffset = 0,
  slideTo?: number,
) {
  const a = ac()
  if (!a || !master || !enabled) return
  const t0 = a.currentTime + whenOffset
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

/** Short tactile click when a reagent is grabbed. */
export function playGrab() {
  tone(520, 0.09, "triangle", 0.18)
  tone(780, 0.07, "sine", 0.1, 0.02)
}

/** Soft UI toggle blip. */
export function playToggle() {
  tone(440, 0.08, "sine", 0.14, 0, 660)
}

/** Watery glug when liquid is poured into the beaker. */
export function playPour() {
  const a = ac()
  if (!a || !master || !enabled) return
  // a few descending "glug" blips
  for (let i = 0; i < 4; i++) {
    tone(300 - i * 30 + Math.random() * 40, 0.14, "sine", 0.16, i * 0.09, 180)
  }
  // filtered noise splash
  noiseBurst(0.35, 1200, 0.08)
}

/** Bright success chime — used when neutralization succeeds. */
export function playSuccess() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C E G C
  notes.forEach((f, i) => tone(f, 0.4, "sine", 0.18, i * 0.1))
}

/** Low error buzz. */
export function playError() {
  tone(160, 0.28, "sawtooth", 0.14, 0, 110)
}

/** Filtered noise burst (splashes, hiss). */
function noiseBurst(dur: number, cutoff: number, gain: number) {
  const a = ac()
  if (!a || !master || !enabled) return
  const frames = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, frames, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = a.createBufferSource()
  src.buffer = buf
  const filter = a.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = cutoff
  const g = a.createGain()
  g.gain.value = gain
  src.connect(filter)
  filter.connect(g)
  g.connect(master)
  src.start()
}

/* ----------------------------- Fizz loop ----------------------------- */

let fizzSrc: AudioBufferSourceNode | null = null
let fizzGain: GainNode | null = null

/** Start a looping bubbling/fizz sound for an active gas reaction. */
export function startFizz() {
  const a = ac()
  if (!a || !master || !enabled || fizzSrc) return
  const dur = 2
  const frames = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, frames, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    // sparse crackle to mimic bubbles
    data[i] = Math.random() < 0.06 ? (Math.random() * 2 - 1) * 0.7 : (Math.random() * 2 - 1) * 0.05
  }
  const src = a.createBufferSource()
  src.buffer = buf
  src.loop = true
  const filter = a.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.value = 900
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, a.currentTime)
  g.gain.exponentialRampToValueAtTime(0.12, a.currentTime + 0.3)
  src.connect(filter)
  filter.connect(g)
  g.connect(master)
  src.start()
  fizzSrc = src
  fizzGain = g
}

export function stopFizz() {
  const a = ac()
  if (!fizzSrc || !a) return
  if (fizzGain) {
    fizzGain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.3)
  }
  const s = fizzSrc
  setTimeout(() => {
    try {
      s.stop()
    } catch {}
  }, 350)
  fizzSrc = null
  fizzGain = null
}
