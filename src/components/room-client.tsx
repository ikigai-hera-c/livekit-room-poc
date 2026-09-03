'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiveKitRoom } from '@livekit/components-react'
import { OperatorRoom } from '@/components/operator-room'
import type { RoomName } from '@/lib/rooms'

type RoomClientProps = {
  roomName: RoomName
  participantName: string
}

type ConnectionDetails = {
  serverUrl: string
  token: string
}

type TokenResponse = Partial<ConnectionDetails> & {
  error?: string
}

export function RoomClient({ roomName, participantName }: RoomClientProps) {
  const router = useRouter()

  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null)

  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function getConnectionDetails() {
      try {
        setError('')

        const response = await fetch('/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName,
            participantName,
            role: 'operator',
          }),
          signal: controller.signal,
        })

        const result = (await response.json()) as TokenResponse

        if (!response.ok) {
          throw new Error(result.error ?? 'Unable to join the room')
        }

        if (!result.serverUrl || !result.token) {
          throw new Error('The server returned invalid connection details')
        }

        setConnectionDetails({
          serverUrl: result.serverUrl,
          token: result.token,
        })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        console.error('Failed to get connection details', error)

        setError(
          error instanceof Error ? error.message : 'Unable to join the room',
        )
      }
    }

    getConnectionDetails()

    return () => {
      controller.abort()
    }
  }, [participantName, roomName])

  function returnHome() {
    router.push('/')
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090e] px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11141b] p-8 text-center">
          <h1 className="text-2xl font-semibold">Unable to join the room</h1>

          <p className="mt-3 text-zinc-400">{error}</p>

          <button
            className="mt-8 h-12 w-full rounded-xl bg-violet-600 font-semibold hover:bg-violet-500"
            type="button"
            onClick={returnHome}
          >
            Return to home
          </button>
        </section>
      </main>
    )
  }

  if (!connectionDetails) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090e] px-6 text-white">
        <section className="text-center">
          <div className="mx-auto mb-6 size-10 animate-spin rounded-full border-3 border-white/20 border-t-violet-500" />

          <h1 className="text-2xl font-semibold">Joining {roomName}</h1>

          <p className="mt-2 text-zinc-400">
            Preparing your secure connection...
          </p>
        </section>
      </main>
    )
  }

  return (
    <main
      className="grid h-dvh grid-rows-[64px_minmax(0,1fr)] bg-[#07090e]"
      data-lk-theme="default"
    >
      <header className="flex items-center border-b border-white/10 bg-[#11141b] px-6 text-white">
        <div className="flex items-center gap-3">
          <strong>{roomName}</strong>
          <span className="text-sm text-zinc-400">{participantName}</span>
        </div>
      </header>

      <LiveKitRoom
        className="min-h-0"
        serverUrl={connectionDetails.serverUrl}
        token={connectionDetails.token}
        connect
        audio={false}
        video={false}
        onDisconnected={returnHome}
      >
        <OperatorRoom roomName={roomName} />
      </LiveKitRoom>
    </main>
  )
}
