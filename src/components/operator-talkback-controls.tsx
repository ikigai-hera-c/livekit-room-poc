'use client'

import { useEffect, useRef, useState } from 'react'
import {
  RoomAudioRenderer,
  useIsSpeaking,
  useRoomContext,
  useSpeakingParticipants,
} from '@livekit/components-react'
import type { Participant } from 'livekit-client'
import { RoomEvent } from 'livekit-client'
import {
  decodeTalkbackMessage,
  encodeTalkbackMessage,
  TALKBACK_TOPIC,
} from '@/lib/talkback'

type OperatorTalkbackControlsProps = {
  roomName: string
  compact?: boolean
}

function isOperatorManager(participant: Participant): boolean {
  try {
    const metadata = JSON.parse(participant.metadata ?? '{}') as {
      role?: unknown
    }

    return metadata.role === 'operator_manager'
  } catch {
    return false
  }
}

export function OperatorTalkbackControls({
  roomName,
  compact = false,
}: OperatorTalkbackControlsProps) {
  const room = useRoomContext()
  const sessionIdRef = useRef<string | null>(null)

  const [isTalking, setIsTalking] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState('')

  const isLocalParticipantSpeaking = useIsSpeaking(room.localParticipant)
  const isOperatorSpeaking = isTalking && isLocalParticipantSpeaking
  const speakingParticipants = useSpeakingParticipants()
  const isOpmSpeaking = speakingParticipants.some(isOperatorManager)

  useEffect(() => {
    function handleData(
      payload: Uint8Array,
      _participant: unknown,
      _kind: unknown,
      topic?: string,
    ) {
      if (topic !== TALKBACK_TOPIC) {
        return
      }

      const message = decodeTalkbackMessage(payload)

      if (
        message?.type !== 'talk-ended' ||
        message.endedBy !== 'operator_manager' ||
        message.sessionId !== sessionIdRef.current
      ) {
        return
      }

      void room.localParticipant.setMicrophoneEnabled(false).finally(() => {
        sessionIdRef.current = null
        setIsTalking(false)
        setIsChanging(false)
      })
    }

    room.on(RoomEvent.DataReceived, handleData)

    return () => {
      room.off(RoomEvent.DataReceived, handleData)
    }
  }, [room])

  async function startTalkback() {
    if (isChanging || isTalking) {
      return
    }

    setIsChanging(true)
    setError('')

    const sessionId = crypto.randomUUID()

    try {
      await room.localParticipant.setMicrophoneEnabled(true)

      await room.localParticipant.publishData(
        encodeTalkbackMessage({
          type: 'talk-started',
          sessionId,
          roomName,
          startedAt: Date.now(),
        }),
        {
          reliable: true,
          topic: TALKBACK_TOPIC,
        },
      )

      sessionIdRef.current = sessionId
      setIsTalking(true)
    } catch (error) {
      await room.localParticipant.setMicrophoneEnabled(false)

      setError(
        error instanceof Error ? error.message : 'Unable to start Talkback',
      )
    } finally {
      setIsChanging(false)
    }
  }

  async function endTalkback() {
    if (isChanging || !isTalking) {
      return
    }

    setIsChanging(true)
    setError('')

    try {
      const sessionId = sessionIdRef.current

      if (sessionId) {
        await room.localParticipant.publishData(
          encodeTalkbackMessage({
            type: 'talk-ended',
            sessionId,
            roomName,
            endedAt: Date.now(),
            endedBy: 'operator',
          }),
          {
            reliable: true,
            topic: TALKBACK_TOPIC,
          },
        )
      }

      await room.localParticipant.setMicrophoneEnabled(false)

      sessionIdRef.current = null
      setIsTalking(false)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Unable to end Talkback',
      )
    } finally {
      setIsChanging(false)
    }
  }

  async function leaveRoom() {
    if (isChanging) {
      return
    }

    setIsChanging(true)
    setError('')

    try {
      const sessionId = sessionIdRef.current

      if (isTalking && sessionId) {
        await room.localParticipant.publishData(
          encodeTalkbackMessage({
            type: 'talk-ended',
            sessionId,
            roomName,
            endedAt: Date.now(),
            endedBy: 'operator',
          }),
          {
            reliable: true,
            topic: TALKBACK_TOPIC,
          },
        )
      }

      await room.localParticipant.setMicrophoneEnabled(false)
      await room.disconnect()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Unable to leave the room',
      )
      setIsChanging(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            disabled={isChanging}
            onClick={isTalking ? endTalkback : startTalkback}
            aria-label={
              isOperatorSpeaking
                ? 'End Talk. Operator is speaking.'
                : isTalking
                  ? 'End Talk'
                  : 'Call OPM'
            }
            className={
              isOperatorSpeaking
                ? 'lk-button border! border-[#DC95FF]! bg-[#DC95FF]/20! text-[#F2D9FF]! shadow-[0_0_0_3px_rgba(220,149,255,0.2),0_0_24px_rgba(220,149,255,0.55)]!'
                : isTalking
                  ? 'lk-button bg-red-600! text-white!'
                  : 'lk-button'
            }
          >
            {isChanging
              ? 'Please wait...'
              : isTalking
                ? 'End Talk'
                : 'Call OPM'}
          </button>

          {isOperatorSpeaking ? (
            <span
              className="absolute -right-2 -top-2 flex size-4"
              aria-hidden="true"
            >
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#DC95FF] opacity-60" />

              <span className="relative inline-flex size-4 rounded-full bg-[#DC95FF] shadow-[0_0_12px_rgba(220,149,255,0.9)]" />
            </span>
          ) : null}
        </div>

        {isOperatorSpeaking ? (
          <span
            className="rounded-full bg-[#DC95FF] px-3 py-1 text-xs font-semibold text-[#27102F]"
            role="status"
            aria-live="polite"
          >
            Operator speaking
          </span>
        ) : null}

        {isOpmSpeaking ? (
          <span
            className="flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
            role="status"
            aria-live="polite"
          >
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-700 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-900" />
            </span>
            OPM speaking
          </span>
        ) : null}

        {error ? (
          <span className="text-sm text-red-400" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <section className="flex min-h-0 flex-col items-center justify-center p-6 text-white">
      <RoomAudioRenderer />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11141b] p-8 text-center">
        <p className="text-sm text-zinc-400">{roomName}</p>

        <h1 className="mt-2 text-2xl font-semibold">
          {isTalking ? 'Connected to OPM' : 'Talkback ready'}
        </h1>

        {isOpmSpeaking ? (
          <div
            className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
            role="status"
            aria-live="polite"
          >
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-700 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-900" />
            </span>
            OPM speaking
          </div>
        ) : null}

        <p className="mt-3 text-sm text-zinc-400">
          {isTalking
            ? 'Your microphone is live.'
            : 'Call the Operator Manager when assistance is required.'}
        </p>

        <button
          type="button"
          disabled={isChanging}
          onClick={isTalking ? endTalkback : startTalkback}
          className={
            isTalking
              ? 'mt-8 h-14 w-full rounded-xl bg-red-600 font-semibold disabled:opacity-50'
              : 'mt-8 h-14 w-full rounded-xl bg-violet-600 font-semibold disabled:opacity-50'
          }
        >
          {isChanging ? 'Please wait...' : isTalking ? 'End Talk' : 'Call OPM'}
        </button>

        <button
          type="button"
          disabled={isChanging}
          onClick={leaveRoom}
          className="mt-3 h-12 w-full rounded-xl border border-white/15 font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          Leave
        </button>

        {error ? (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
