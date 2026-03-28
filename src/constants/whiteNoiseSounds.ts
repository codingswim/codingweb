/** 与 public/sounds 下文件名一致（不含扩展名），默认加载 .mp3 */
export const WHITE_NOISE_SOUND_IDS = [
  'rain',
  'thunder',
  'wind',
  'farm',
  'birds',
  'stream',
  'waves',
  'bonfire',
  'night',
  'fan',
  'train',
  'bowl',
  'whitenoise',
  'chant',
  'meditation',
  'heartbeat',
  'keyboard',
  'library',
] as const

export type WhiteNoiseSoundId = (typeof WHITE_NOISE_SOUND_IDS)[number]

export type SoundIconName =
  | 'Drizzling'
  | 'Lightning'
  | 'WindPower'
  | 'House'
  | 'Sunny'
  | 'Guide'
  | 'Ship'
  | 'Orange'
  | 'Moon'
  | 'Switch'
  | 'Van'
  | 'Bowl'
  | 'Microphone'
  | 'Reading'
  | 'Sunrise'
  | 'FirstAidKit'
  | 'Monitor'
  | 'Collection'

export const SOUND_ICON_MAP: Record<WhiteNoiseSoundId, SoundIconName> = {
  rain: 'Drizzling',
  thunder: 'Lightning',
  wind: 'WindPower',
  farm: 'House',
  birds: 'Sunny',
  stream: 'Guide',
  waves: 'Ship',
  bonfire: 'Orange',
  night: 'Moon',
  fan: 'Switch',
  train: 'Van',
  bowl: 'Bowl',
  whitenoise: 'Microphone',
  chant: 'Reading',
  meditation: 'Sunrise',
  heartbeat: 'FirstAidKit',
  keyboard: 'Monitor',
  library: 'Collection',
}

export type PresetDef = {
  id: string
  tracks: Partial<Record<WhiteNoiseSoundId, number>>
}

export const BUILTIN_PRESETS: PresetDef[] = [
  {
    id: 'temple',
    tracks: { bowl: 0.55, chant: 0.35, wind: 0.2 },
  },
  {
    id: 'yoga',
    tracks: { meditation: 0.5, stream: 0.35, birds: 0.25 },
  },
  {
    id: 'mindfulness',
    tracks: { meditation: 0.6, library: 0.25, fan: 0.15 },
  },
  {
    id: 'etherealRain',
    tracks: { rain: 0.55, thunder: 0.12, night: 0.3 },
  },
]

export const STORAGE_KEY = 'white-noise-mixer-state'
