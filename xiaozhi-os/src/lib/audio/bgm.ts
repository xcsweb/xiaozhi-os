export interface BgmController {
  unlocked: boolean
  playing: boolean
  volume: number
  muted: boolean
  unlock: () => Promise<void>
  play: () => void
  pause: () => void
  setVolume: (v: number) => void
  setMuted: (m: boolean) => void
  duck: (on: boolean) => void
}

let singleton: BgmController | null = null

export function getBgmController(initial: { volume: number; muted: boolean }): BgmController {
  if (singleton) return singleton

  let ctx: AudioContext | null = null
  let gain: GainNode | null = null
  let osc: OscillatorNode | null = null
  let unlocked = false
  let playing = false
  let volume = initial.volume
  let muted = initial.muted
  let ducked = false

  function ensure() {
    if (ctx) return
    ctx = new AudioContext()
    gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(ctx.destination)
    osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 196
    osc.connect(gain)
    osc.start()
  }

  async function unlock() {
    ensure()
    if (!ctx) return
    if (ctx.state !== 'running') {
      await ctx.resume()
    }
    unlocked = true
    if (playing) {
      rampTo(targetGain(), 0.25)
    }
  }

  function targetGain() {
    if (!playing) return 0
    if (muted) return 0
    const base = Math.max(0, Math.min(1, volume))
    const duckFactor = ducked ? 0.25 : 1
    return base * 0.22 * duckFactor
  }

  function rampTo(v: number, seconds: number) {
    ensure()
    if (!ctx || !gain) return
    const t = ctx.currentTime
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.linearRampToValueAtTime(v, t + seconds)
  }

  function applyImmediate() {
    ensure()
    if (!ctx || !gain) return
    gain.gain.value = targetGain()
  }

  function play() {
    ensure()
    playing = true
    if (!unlocked) return
    rampTo(targetGain(), 0.25)
  }

  function pause() {
    playing = false
    if (!unlocked) return
    rampTo(0, 0.25)
  }

  function setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v))
    if (!unlocked) return
    rampTo(targetGain(), 0.18)
  }

  function setMuted(m: boolean) {
    muted = m
    if (!unlocked) return
    rampTo(targetGain(), 0.18)
  }

  function duck(on: boolean) {
    ducked = on
    if (!unlocked) return
    rampTo(targetGain(), 0.2)
  }

  singleton = {
    get unlocked() {
      return unlocked
    },
    get playing() {
      return playing
    },
    get volume() {
      return volume
    },
    get muted() {
      return muted
    },
    unlock,
    play,
    pause,
    setVolume,
    setMuted,
    duck,
  }
  applyImmediate()
  return singleton
}

