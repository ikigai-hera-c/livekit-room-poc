import type { RoomName } from '@/lib/rooms'

export type RoomStream = {
  id: string
  title: string
  type: 'iframe' | 'flv'
  url: string
}

function createRoomStreams(gpcUrl = '', dealerUrl = ''): RoomStream[] {
  return [
    {
      id: 'gpc-stream',
      title: 'GPC View',
      type: 'iframe',
      url: gpcUrl,
    },
    {
      id: 'dealer-stream',
      title: 'Dealer View',
      type: 'iframe',
      url: dealerUrl,
    },
  ]
}

export const roomStreams: Record<RoomName, RoomStream[]> = {
  'BAC-01': createRoomStreams(),
  'BAC-02': createRoomStreams(),
  'BAC-03': createRoomStreams(),
  'BAC-04': createRoomStreams(
    'https://192.168.20.23:8443/live/qa01_gpc/?muted=true&autoplay=true',
    'https://192.168.20.23:8443/live/ZCam_16/?muted=true&autoplay=true',
  ),
}
