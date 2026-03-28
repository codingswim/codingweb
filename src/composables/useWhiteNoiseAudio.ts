import { ref, shallowRef, onUnmounted, type Ref, type ShallowRef } from 'vue'
import {
  WHITE_NOISE_SOUND_IDS,
  type WhiteNoiseSoundId,
} from '@/constants/whiteNoiseSounds'

export type TrackRuntime = {
  id: WhiteNoiseSoundId
  active: boolean
  volume: number
  loaded: boolean
  loadError: boolean
  gainNode: GainNode | null
  sourceNode: AudioBufferSourceNode | null
  buffer: AudioBuffer | null
}

function createWhiteNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const channels = 1
  const rate = ctx.sampleRate
  const length = Math.floor(rate * seconds)
  const buffer = ctx.createBuffer(channels, length, rate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

async function loadMp3(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const arr = await res.arrayBuffer()
  return ctx.decodeAudioData(arr.slice(0))
}

export function useWhiteNoiseAudio(): {
  analyser: ShallowRef<AnalyserNode | null>
  isPlaying: Ref<boolean>
  masterVolume: Ref<number>
  tracks: Ref<Record<WhiteNoiseSoundId, TrackRuntime>>
  contextState: Ref<string>
  initFromUserGesture: () => Promise<void>
  ensureTrackLoaded: (id: WhiteNoiseSoundId) => Promise<void>
  setTrackActive: (id: WhiteNoiseSoundId, active: boolean) => void
  setTrackVolume: (id: WhiteNoiseSoundId, volume: number) => void
  setMasterVolume: (v: number) => void
  play: () => void
  pause: () => void
  stopAll: () => void
  dispose: () => Promise<void>
  applyLevels: (levels: Partial<Record<WhiteNoiseSoundId, number>>) => void
} {
  const audioContext = shallowRef<AudioContext | null>(null)
  const masterGain = shallowRef<GainNode | null>(null)
  const analyser = shallowRef<AnalyserNode | null>(null)
  const isPlaying = ref(false)
  const masterVolume = ref(0.8)
  const contextState = ref('suspended')

  const tracks = ref<Record<WhiteNoiseSoundId, TrackRuntime>>(
    {} as Record<WhiteNoiseSoundId, TrackRuntime>
  )

  for (const id of WHITE_NOISE_SOUND_IDS) {
    tracks.value[id] = {
      id,
      active: false,
      volume: 0.7,
      loaded: false,
      loadError: false,
      gainNode: null,
      sourceNode: null,
      buffer: null,
    }
  }

  function wireGraph(ctx: AudioContext) {
    const m = ctx.createGain()
    m.gain.value = masterVolume.value
    const a = ctx.createAnalyser()
    a.fftSize = 256
    a.smoothingTimeConstant = 0.65
    m.connect(a)
    a.connect(ctx.destination)
    masterGain.value = m
    analyser.value = a
  }

  function stopTrackSource(id: WhiteNoiseSoundId) {
    const t = tracks.value[id]
    if (t.sourceNode) {
      try {
        t.sourceNode.stop()
      } catch {
        /* already stopped */
      }
      try {
        t.sourceNode.disconnect()
      } catch {
        /* */
      }
      t.sourceNode = null
    }
  }

  function startTrackSource(id: WhiteNoiseSoundId) {
    const ctx = audioContext.value
    const t = tracks.value[id]
    if (!ctx || !t.gainNode || !t.buffer || !t.active || !isPlaying.value) {
      return
    }
    stopTrackSource(id)
    const src = ctx.createBufferSource()
    src.buffer = t.buffer
    src.loop = true
    src.connect(t.gainNode)
    src.start(0)
    t.sourceNode = src
  }

  function syncTrackGain(id: WhiteNoiseSoundId) {
    const t = tracks.value[id]
    if (!t.gainNode) return
    const g = t.active && isPlaying.value ? t.volume : 0
    t.gainNode.gain.value = g
  }

  async function initFromUserGesture() {
    if (audioContext.value) {
      if (audioContext.value.state === 'suspended') {
        await audioContext.value.resume()
      }
      contextState.value = audioContext.value.state
      return
    }
    const ctx = new AudioContext()
    audioContext.value = ctx
    wireGraph(ctx)

    for (const id of WHITE_NOISE_SOUND_IDS) {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(masterGain.value!)
      tracks.value[id].gainNode = g
    }

    contextState.value = ctx.state
  }

  async function ensureTrackLoaded(id: WhiteNoiseSoundId) {
    await initFromUserGesture()
    const ctx = audioContext.value!
    const t = tracks.value[id]
    if (t.loaded || t.loadError) return

    try {
      if (id === 'whitenoise') {
        t.buffer = createWhiteNoiseBuffer(ctx)
      } else {
        t.buffer = await loadMp3(ctx, `/sounds/${id}.mp3`)
      }
      t.loaded = true
      t.loadError = false
    } catch {
      t.loadError = true
      t.loaded = false
      t.buffer = null
    }
  }

  function setTrackActive(id: WhiteNoiseSoundId, active: boolean) {
    const t = tracks.value[id]
    t.active = active
    if (active) {
      void ensureTrackLoaded(id).then(() => {
        if (t.active && isPlaying.value && t.loaded) {
          startTrackSource(id)
          syncTrackGain(id)
        }
      })
    } else {
      stopTrackSource(id)
      syncTrackGain(id)
    }
  }

  function setTrackVolume(id: WhiteNoiseSoundId, volume: number) {
    const t = tracks.value[id]
    t.volume = Math.min(1, Math.max(0, volume))
    syncTrackGain(id)
  }

  function setMasterVolume(v: number) {
    masterVolume.value = Math.min(1, Math.max(0, v))
    if (masterGain.value) {
      masterGain.value.gain.value = masterVolume.value
    }
  }

  function play() {
    void initFromUserGesture().then(() => {
      const ctx = audioContext.value
      if (!ctx) return
      void ctx.resume().then(() => {
        contextState.value = ctx.state
        isPlaying.value = true
        for (const id of WHITE_NOISE_SOUND_IDS) {
          const t = tracks.value[id]
          syncTrackGain(id)
          if (t.active && t.loaded) {
            startTrackSource(id)
          } else if (t.active && !t.loaded && !t.loadError) {
            void ensureTrackLoaded(id).then(() => {
              if (isPlaying.value && tracks.value[id].active && tracks.value[id].loaded) {
                startTrackSource(id)
                syncTrackGain(id)
              }
            })
          }
        }
      })
    })
  }

  function pause() {
    isPlaying.value = false
    for (const id of WHITE_NOISE_SOUND_IDS) {
      stopTrackSource(id)
      syncTrackGain(id)
    }
    const ctx = audioContext.value
    if (ctx && ctx.state === 'running') {
      void ctx.suspend().then(() => {
        contextState.value = ctx.state
      })
    }
  }

  function stopAll() {
    isPlaying.value = false

    for (const id of WHITE_NOISE_SOUND_IDS) {
      tracks.value[id].active = false // 重置音轨状态
      stopTrackSource(id) // 停止所有音轨
      syncTrackGain(id) // 同步音轨音量
    }
    const ctx = audioContext.value
    if (ctx && ctx.state === 'running') {
      void ctx.suspend().then(() => {
        contextState.value = ctx.state
      })
    }
  }

  function applyLevels(levels: Partial<Record<WhiteNoiseSoundId, number>>) {
    for (const id of WHITE_NOISE_SOUND_IDS) {
      const v = levels[id]
      if (v === undefined) {
        tracks.value[id].active = false
        stopTrackSource(id)
        syncTrackGain(id)
      } else {
        tracks.value[id].active = true
        tracks.value[id].volume = Math.min(1, Math.max(0, v))
        void ensureTrackLoaded(id).then(() => {
          if (isPlaying.value && tracks.value[id].active && tracks.value[id].loaded) {
            startTrackSource(id)
          }
          syncTrackGain(id)
        })
      }
    }
  }

  async function dispose() {
    isPlaying.value = false
    for (const id of WHITE_NOISE_SOUND_IDS) {
      stopTrackSource(id)
      const t = tracks.value[id]
      if (t.gainNode) {
        try {
          t.gainNode.disconnect()
        } catch {
          /* */
        }
        t.gainNode = null
      }
      t.sourceNode = null
    }
    if (masterGain.value) {
      try {
        masterGain.value.disconnect()
      } catch {
        /* */
      }
      masterGain.value = null
    }
    if (analyser.value) {
      try {
        analyser.value.disconnect()
      } catch {
        /* */
      }
      analyser.value = null
    }
    const ctx = audioContext.value
    if (ctx) {
      try {
        await ctx.close()
      } catch {
        /* */
      }
      audioContext.value = null
    }
    contextState.value = 'closed'

    for (const id of WHITE_NOISE_SOUND_IDS) {
      tracks.value[id] = {
        id,
        active: false,
        volume: tracks.value[id].volume,
        loaded: false,
        loadError: false,
        gainNode: null,
        sourceNode: null,
        buffer: null,
      }
    }
  }

  onUnmounted(() => {
    void dispose()
  })

  return {
    analyser,
    isPlaying,
    masterVolume,
    tracks,
    contextState,
    initFromUserGesture,
    ensureTrackLoaded,
    setTrackActive,
    setTrackVolume,
    setMasterVolume,
    play,
    pause,
    stopAll,
    dispose,
    applyLevels,
  }
}
