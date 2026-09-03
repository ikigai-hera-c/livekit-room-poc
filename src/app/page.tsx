'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRandomDisplayName } from '@/lib/display-name'
import { rooms, type RoomName } from '@/lib/rooms'
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
    const resolvedDisplayName = resolveDisplayName()

    setJoiningRoom(roomName)

    const query = new URLSearchParams({
      name: resolvedDisplayName,
    })

    router.push(`/room/${roomName}?${query.toString()}`)
  }

  function openManagerConsole() {
    const resolvedDisplayName = resolveDisplayName()

    setIsOpeningManager(true)

    const query = new URLSearchParams({
      name: resolvedDisplayName,
    })

    router.push(`/manager?${query.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[#101318] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-10 flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold shadow-lg shadow-violet-950/40">
                TS
              </div>

              <span className="text-sm font-semibold tracking-wide text-zinc-300">
                Talkback System
              </span>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Audio conference
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Select a room
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Select a role and room to join. A display name will be generated
              automatically if left empty.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label
              className="mb-2 block text-sm font-medium text-zinc-300"
              htmlFor="display-name"
            >
              Display name
              <span className="ml-1 font-normal text-zinc-500">(optional)</span>
            </label>

            <input
              id="display-name"
              className="h-13 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-3 focus:ring-violet-500/20"
              type="text"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value)
              }}
              placeholder="Leave empty for a random name"
              autoComplete="name"
              maxLength={60}
              autoFocus
            />

            <p className="mt-2 text-xs text-zinc-500">
              You can enter your own name or use an automatically generated one.
            </p>

            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium text-zinc-300">
                Join as
              </legend>

              <div className="grid grid-cols-2 gap-2">
                {(['operator', 'operator_manager'] as const).map(
                  (participantRole) => (
                    <label
                      key={participantRole}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-300"
                    >
                      <input
                        type="radio"
                        name="participant-role"
                        value={participantRole}
                        checked={role === participantRole}
                        onChange={() => setRole(participantRole)}
                      />

                      {participantRole === 'operator' ? 'Operator' : 'OPM'}
                    </label>
                  ),
                )}
              </div>
            </fieldset>

            {role === 'operator_manager' ? (
              <button
                type="button"
                disabled={isOpeningManager}
                onClick={openManagerConsole}
                className="mt-4 h-12 w-full rounded-xl bg-violet-600 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-70"
              >
                {isOpeningManager ? 'Opening console...' : 'Open OPM console'}
              </button>
            ) : null}
          </div>
        </header>

        {role === 'operator' ? (
          <section aria-labelledby="rooms-heading">
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="rooms-heading"
                className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400"
              >
                Available rooms
              </h2>

              <span className="text-sm text-zinc-500">
                {rooms.length} rooms
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {rooms.map((room) => {
                const isJoining = joiningRoom === room.name

                return (
                  <button
                    key={room.name}
                    type="button"
                    disabled={joiningRoom !== null}
                    onClick={() => joinRoom(room.name)}
                    className="group relative flex min-h-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#354052] p-6 text-left shadow-xl shadow-black/20 transition duration-200 hover:-translate-y-1 hover:border-violet-400/60 hover:bg-[#3c485c] hover:shadow-2xl hover:shadow-black/30 focus:outline-none focus:ring-3 focus:ring-violet-500/40 disabled:cursor-wait disabled:opacity-70"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400 opacity-0 transition group-hover:opacity-100" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                          aria-hidden="true"
                        />

                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-300">
                          Available
                        </span>
                      </div>

                      <span className="flex size-10 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition group-hover:border-violet-400 group-hover:bg-violet-500 group-hover:text-white">
                        {isJoining ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <ArrowIcon />
                        )}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-6 flex size-18 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-violet-300 transition group-hover:scale-105 group-hover:bg-violet-500/15 group-hover:text-violet-200">
                        <MicrophoneIcon />
                      </div>

                      <h3 className="font-mono text-2xl font-medium tracking-wide text-zinc-100">
                        {room.name}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {room.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="text-xs text-zinc-400">
                        Talkback ready
                      </span>

                      <span className="text-xs font-semibold text-violet-300 opacity-0 transition group-hover:opacity-100">
                        Join room
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-semibold">OPM multi-room console</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Open the console to monitor all assigned Operator Rooms and make
              multi-room announcements.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MicrophoneIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
