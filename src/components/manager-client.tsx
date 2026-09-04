'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RoomName } from '@/lib/rooms'
import { rooms } from '@/lib/rooms'
import { ManagerRoomConnection } from '@/components/manager-room-connection'

type ManagerClientProps = {
  participantName: string
  managerId: string
}

type RoomConnectionDetails = {
  roomName: RoomName
  serverUrl: string
  token: string
}

export function ManagerClient({
  participantName,
  managerId,
}: ManagerClientProps) {
  const router = useRouter()
  const [connections, setConnections] = useState<RoomConnectionDetails[]>([])
  const [selectedRooms, setSelectedRooms] = useState<Set<RoomName>>(new Set())
  const [mutedRooms, setMutedRooms] = useState<Set<RoomName>>(
    () => new Set(rooms.map((room) => room.name)),
  )
  const [isAnnouncing, setIsAnnouncing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function connectRooms() {
      const results = await Promise.allSettled(
        rooms.map(async ({ name: roomName }) => {
          const response = await fetch('/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              roomName,
              participantName,
              role: 'operator_manager',
              managerId,
            }),
            signal: controller.signal,
          })

          const result = (await response.json()) as {
            serverUrl?: string
            token?: string
            error?: string
          }

          if (!response.ok || !result.serverUrl || !result.token) {
            throw new Error(result.error ?? `Unable to connect to ${roomName}`)
          }

          return {
            roomName,
            serverUrl: result.serverUrl,
            token: result.token,
          }
        }),
      )

      if (controller.signal.aborted) {
        return
      }

      const successfulConnections = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      )

      setConnections(successfulConnections)

      const failedCount = results.length - successfulConnections.length

      if (failedCount > 0) {
        setError(`${failedCount} room connection(s) failed`)
      }
    }

    connectRooms()

    return () => controller.abort()
  }, [managerId, participantName])

  const connectedRoomNames = connections.map(
    (connection) => connection.roomName,
  )

  const allRoomsSelected =
    connections.length > 0 &&
    connections.every((connection) => selectedRooms.has(connection.roomName))

  function toggleRoom(roomName: RoomName) {
    setSelectedRooms((current) => {
      const next = new Set(current)

      if (next.has(roomName)) {
        next.delete(roomName)
      } else {
        next.add(roomName)
      }

      return next
    })
  }

  function toggleAllRooms() {
    if (allRoomsSelected) {
      setSelectedRooms(new Set())
      return
    }

    setSelectedRooms(new Set(connectedRoomNames))
  }

  function setRoomMuted(roomName: RoomName, muted: boolean) {
    setMutedRooms((current) => {
      const next = new Set(current)

      if (muted) {
        next.add(roomName)
      } else {
        next.delete(roomName)
      }

      return next
    })
  }

  return (
    <main className="min-h-dvh bg-[#07090e] p-8 text-white">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-violet-400">{managerId}</p>
          <h1 className="text-3xl font-semibold">Operator Manager</h1>
          <p className="mt-2 text-zinc-400">{participantName}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-white/10"
        >
          Leave
        </button>
      </header>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#11141b] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
              Multi-room call
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Select operator rooms
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {selectedRooms.size} of {connections.length} rooms selected
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={connections.length === 0 || isAnnouncing}
              onClick={toggleAllRooms}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allRoomsSelected ? 'Clear all' : 'Select all rooms'}
            </button>

            <button
              type="button"
              disabled={selectedRooms.size === 0 || connections.length === 0}
              onClick={() => setIsAnnouncing((current) => !current)}
              className={
                isAnnouncing
                  ? 'rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold disabled:opacity-50'
                  : 'rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold disabled:opacity-50'
              }
            >
              {isAnnouncing ? 'End call' : 'Start call'}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {connections.map((connection) => {
          const selected = selectedRooms.has(connection.roomName)

          return (
            <ManagerRoomConnection
              key={connection.roomName}
              {...connection}
              selected={selected}
              microphoneEnabled={selected && isAnnouncing}
              operatorMuted={mutedRooms.has(connection.roomName)}
              selectionDisabled={isAnnouncing}
              onToggle={() => toggleRoom(connection.roomName)}
              onOperatorMutedChange={(muted) =>
                setRoomMuted(connection.roomName, muted)
              }
            />
          )
        })}
      </section>

      {error ? <p className="mt-4 text-sm text-amber-400">{error}</p> : null}
    </main>
  )
}
