'use client'

import { useState } from 'react'
import type { WidgetState } from '@livekit/components-core'
import {
  Chat,
  ChatToggle,
  DisconnectButton,
  LayoutContextProvider,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { OperatorTalkbackControls } from '@/components/operator-talkback-controls'
import type { RoomName } from '@/lib/rooms'

type OperatorRoomProps = {
  roomName: RoomName
}

export function OperatorRoom({ roomName }: OperatorRoomProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
  })

  return (
    <LayoutContextProvider onWidgetChange={setWidgetState}>
      <div className="flex min-h-0 flex-1 bg-[#07090e]">
        <div className="grid min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
          <main className="flex min-h-0 items-center justify-center overflow-auto p-4">
            <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#11141b] p-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                Operator Room
              </p>

              <h1 className="mt-3 text-3xl font-semibold text-white">
                {roomName}
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Talkback is ready. Use Call OPM when immediate assistance is
                required.
              </p>
            </section>
          </main>

          <div className="lk-control-bar">
            <OperatorTalkbackControls roomName={roomName} compact />

            <ChatToggle>Chat</ChatToggle>

            <DisconnectButton>Leave</DisconnectButton>
          </div>
        </div>

        {widgetState.showChat ? <Chat /> : null}

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  )
}
