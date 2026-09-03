'use client'

import { useEffect, useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useIsSpeaking,
  useRoomContext,
} from '@livekit/components-react'
import { RoomEvent } from 'livekit-client'
import type { RemoteParticipant } from 'livekit-client'
import { RoomStreamGrid } from '@/components/room-stream-grid'
import type { RoomName } from '@/lib/rooms'
import {
  decodeTalkbackMessage,
  encodeTalkbackMessage,
  TALKBACK_TOPIC,
} from '@/lib/talkback'

type ActiveCall = {
  sessionId: string
  operatorIdentity: string
}

type ManagerRoomConnectionProps = {
  roomName: RoomName
  serverUrl: string
  token: string
  selected: boolean
  microphoneEnabled: boolean
  onToggle: () => void
}

export function ManagerRoomConnection(props: ManagerRoomConnectionProps) {
  return (
    <LiveKitRoom
      serverUrl={props.serverUrl}
      token={props.token}
      connect
      audio={false}
      video={false}
    >
      <ManagerRoomCard {...props} />
    </LiveKitRoom>
  )
}

function ManagerRoomCard({
  roomName,
  selected,
  microphoneEnabled,
  onToggle,
}: ManagerRoomConnectionProps) {
  const room = useRoomContext()
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null)
  const operatorCalling = activeCall !== null
  const shouldPublishMicrophone = operatorCalling || microphoneEnabled
  const isLocalParticipantSpeaking = useIsSpeaking(room.localParticipant)
  const isOpmSpeaking = shouldPublishMicrophone && isLocalParticipantSpeaking

  useEffect(() => {
    void room.localParticipant.setMicrophoneEnabled(shouldPublishMicrophone)
  }, [room, shouldPublishMicrophone])

  useEffect(() => {
    function handleData(
      payload: Uint8Array,
      participant: RemoteParticipant | undefined,
      _kind: unknown,
      topic?: string,
    ) {
      if (topic !== TALKBACK_TOPIC || !participant) {
        return
      }

      const message = decodeTalkbackMessage(payload)

      if (!message) {
        return
      }

      if (message.type === 'talk-started') {
        setActiveCall({
          sessionId: message.sessionId,
          operatorIdentity: participant.identity,
        })
      }

      if (message.type === 'talk-ended') {
        setActiveCall((current) =>
          current?.sessionId === message.sessionId ? null : current,
        )
      }
    }

    room.on(RoomEvent.DataReceived, handleData)

    return () => {
      room.off(RoomEvent.DataReceived, handleData)
    }
  }, [room])

  useEffect(() => {
    function handleParticipantDisconnected(participant: RemoteParticipant) {
      setActiveCall((current) =>
        current?.operatorIdentity === participant.identity ? null : current,
      )
    }

    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)

    return () => {
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
    }
  }, [room])

  async function endCall() {
    if (!activeCall) {
      return
    }

    const currentCall = activeCall

    try {
      await room.localParticipant.publishData(
        encodeTalkbackMessage({
          type: 'talk-ended',
          sessionId: currentCall.sessionId,
          roomName,
          endedAt: Date.now(),
          endedBy: 'operator_manager',
        }),
        {
          reliable: true,
          topic: TALKBACK_TOPIC,
          destinationIdentities: [currentCall.operatorIdentity],
        },
      )
    } finally {
      setActiveCall(null)
    }
  }

  return (
    <article
      aria-label={`${roomName}${isOpmSpeaking ? ', OPM is speaking' : ''}`}
      className={
        isOpmSpeaking
          ? 'relative rounded-2xl border border-emerald-300 bg-emerald-500/15 p-5 shadow-[0_0_0_3px_rgba(52,211,153,0.2),0_0_28px_rgba(52,211,153,0.35)] transition duration-200'
          : operatorCalling
            ? 'rounded-2xl border border-red-400 bg-red-500/10 p-5'
            : selected
              ? 'rounded-2xl border border-violet-400 bg-violet-500/10 p-5'
              : 'rounded-2xl border border-white/10 bg-white/5 p-5'
      }
    >
      <RoomAudioRenderer />

      {isOpmSpeaking ? (
        <div
          className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-950/30"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-900 opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-950" />
          </span>
          OPM speaking
        </div>
      ) : null}

      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle} />

        <span className="font-semibold">{roomName}</span>
      </label>

      <p className="mt-3 text-sm text-zinc-400">
        {isOpmSpeaking
          ? 'OPM is speaking to this room'
          : operatorCalling
            ? 'Two-way Talkback active — your microphone is live'
            : microphoneEnabled
              ? 'Announcement active'
              : 'Connected'}
      </p>

      <RoomStreamGrid roomName={roomName} />

      {activeCall ? (
        <button
          type="button"
          onClick={endCall}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          End Call
        </button>
      ) : null}
    </article>
  )
}
