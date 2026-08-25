export type RoomStream = {
  id: string
  title: string
  type: 'iframe' | 'flv'
  url: string
}

export const roomStreams: Record<string, RoomStream[]> = {
  'QA-BAC-01': [
    {
      id: 'left-stream',
      title: 'Left Stream',
      type: 'iframe',
      url: 'https://192.168.20.23:8443/live/qa01_gpc?muted=true&autoplay=true',
    },
    {
      id: 'right-stream',
      title: 'Right Stream',
      type: 'flv',
      url: 'https://livepull-ws.iki-utl.cc/live/qa01hd.flv',
    },
  ],
}
