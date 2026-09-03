import type { ParticipantRole } from '@/lib/talkback'

const adjectives = [
  'Blue',
  'Calm',
  'Bright',
  'Swift',
  'Lucky',
  'Silent',
] as const

const nouns = ['Falcon', 'Panda', 'Tiger', 'Dolphin', 'Koala', 'Otter'] as const

function randomItem<T>(items: readonly T[]) {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)

  return items[values[0] % items.length]
}

function randomNumber() {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)

  return String(values[0] % 10000).padStart(4, '0')
}

export function createRandomDisplayName(role: ParticipantRole) {
  const prefix = role === 'operator_manager' ? 'OPM' : 'Operator'

  return [
    prefix,
    randomItem(adjectives),
    randomItem(nouns),
    randomNumber(),
  ].join('-')
}
