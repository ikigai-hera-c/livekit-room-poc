'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EntryProfilePanel } from '@/components/entry-profile-panel'
import { RoomTable } from '@/components/room-table'
import { createRandomDisplayName } from '@/lib/display-name'
import type { RoomName } from '@/lib/rooms'
import type { ParticipantRole } from '@/lib/talkback'

export default function HomePage() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<ParticipantRole>('operator')
  const [joiningRoom, setJoiningRoom] = useState<RoomName | null>(null)
  const [isOpeningManager, setIsOpeningManager] = useState(false)

  function resolveDisplayName() {
    return displayName.trim() || createRandomDisplayName(role)
  }

  function joinRoom(roomName: RoomName) {
    setJoiningRoom(roomName)

    const query = new URLSearchParams({
      name: resolveDisplayName(),
    })

    router.push(`/room/${roomName}?${query.toString()}`)
  }

  function openManagerConsole() {
    setIsOpeningManager(true)

    const query = new URLSearchParams({
      name: resolveDisplayName(),
    })

    router.push(`/manager?${query.toString()}`)
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        <header className="border-b pb-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                  TS
                </div>

                <span className="text-sm font-semibold">Talkback System</span>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Audio conference
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Channel overview
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Select a role and room to join. A display name will be
                  generated automatically when left empty.
                </p>
              </div>
            </div>

            <EntryProfilePanel
              displayName={displayName}
              role={role}
              isOpeningManager={isOpeningManager}
              onDisplayNameChange={setDisplayName}
              onRoleChange={setRole}
              onOpenManager={openManagerConsole}
            />
          </div>
        </header>

        <div className="mt-8">
          {role === 'operator' ? (
            <RoomTable joiningRoom={joiningRoom} onJoinRoom={joinRoom} />
          ) : (
            <section className="rounded-xl border bg-card/50 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Operator Manager
              </p>

              <h2 className="mt-2 text-xl font-semibold">Multi-room console</h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Open the console to monitor Operator Rooms, make announcements,
                and manage room microphone permissions.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
