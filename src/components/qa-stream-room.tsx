'use client'

import { useState } from 'react'
import type { WidgetState } from '@livekit/components-core'
import {
  Chat,
  ChatToggle,
  DisconnectButton,
  LayoutContextProvider,
  RoomAudioRenderer,
  TrackToggle,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { FlvPlayer } from '@/components/flv-player'
import type { RoomStream } from '@/lib/room-streams'
import { roomStreams } from '@/lib/room-streams'

type QAStreamRoomProps = {
  roomName: string
}

export function QAStreamRoom({ roomName }: QAStreamRoomProps) {
  const streams = roomStreams[roomName] ?? []

  const [widgetState, setWidgetState] = useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
  })

  return (
    <LayoutContextProvider onWidgetChange={setWidgetState}>
      <div className="flex min-h-0 flex-1 bg-[#07090e]">
        <div className="grid min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
          <div className="grid min-h-0 gap-4 overflow-auto p-4 lg:grid-cols-2">
            {streams.map((stream) => (
              <StreamWindow
                key={stream.id}
                title={stream.title}
                type={stream.type}
                url={stream.url}
              />
            ))}
          </div>

          <div className="lk-control-bar">
            <TrackToggle source={Track.Source.Microphone}>
              Talk
            </TrackToggle>

            <ChatToggle>Chat</ChatToggle>

            <DisconnectButton>Leave</DisconnectButton>
          </div>
        </div>

        {widgetState.showChat && <Chat />}

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  )
}

type StreamWindowProps = Pick<RoomStream, 'title' | 'type' | 'url'>

function StreamWindow({ title, type, url }: StreamWindowProps) {
  return (
    <section className="flex min-h-80 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11141b]">
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

          <h2 className="font-medium text-white">{title}</h2>
        </div>

        <span className="text-xs uppercase tracking-wider text-zinc-500">
          Live
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center bg-black">
        {url && type === 'flv' ? (
          <FlvPlayer title={title} url={url} />
        ) : url ? (
          <iframe
            className="absolute inset-0 size-full border-0"
            src={url}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-400">
              Stream is not configured
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Add a stream URL to continue
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
