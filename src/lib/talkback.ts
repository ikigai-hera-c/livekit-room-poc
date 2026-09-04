export const participantRoles = ['operator', 'operator_manager'] as const

export type ParticipantRole = (typeof participantRoles)[number]

export function isParticipantRole(value: unknown): value is ParticipantRole {
  return (
    typeof value === 'string' && participantRoles.some((role) => role === value)
  )
}

export const TALKBACK_TOPIC = 'talkback-control'

export type TalkEndedBy = 'operator' | 'operator_manager'

export type TalkbackMessage =
  | {
      type: 'talk-started'
      sessionId: string
      roomName: string
      startedAt: number
    }
  | {
      type: 'talk-ended'
      sessionId: string
      roomName: string
      endedAt: number
      endedBy: TalkEndedBy
    }
  | {
      type: 'operator-mute-changed'
      roomName: string
      muted: boolean
      changedAt: number
    }

export function encodeTalkbackMessage(
  message: TalkbackMessage,
): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(JSON.stringify(message))

  return new Uint8Array(encoded)
}

export function decodeTalkbackMessage(
  payload: Uint8Array,
): TalkbackMessage | null {
  try {
    const value = JSON.parse(new TextDecoder().decode(payload)) as unknown

    if (!value || typeof value !== 'object' || !('type' in value)) {
      return null
    }

    if (
      value.type !== 'talk-started' &&
      value.type !== 'talk-ended' &&
      value.type !== 'operator-mute-changed'
    ) {
      return null
    }

    return value as TalkbackMessage
  } catch {
    return null
  }
}
