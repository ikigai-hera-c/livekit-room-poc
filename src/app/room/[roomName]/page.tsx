import { redirect } from 'next/navigation'
import { RoomClient } from '@/components/room-client'
import { allowedRooms, isAllowedRoom } from '@/lib/rooms'

export function generateStaticParams() {
  return allowedRooms.map((roomName) => ({
    roomName,
  }))
}

type RoomPageProps = {
  params: Promise<{
    roomName: string
  }>
  searchParams: Promise<{
    name?: string | string[]
  }>
}

export default async function RoomPage({
  params,
  searchParams,
}: RoomPageProps) {
  const { roomName } = await params
  const { name } = await searchParams

  if (!isAllowedRoom(roomName)) {
    redirect('/')
  }

  if (typeof name !== 'string' || !name.trim()) {
    redirect('/')
  }

  return <RoomClient roomName={roomName} participantName={name.trim()} />
}
