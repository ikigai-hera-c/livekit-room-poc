export const rooms = [
  {
    name: 'BAC-01',
    description: 'BAC 01',
    status: 'available',
  },
  {
    name: 'BAC-02',
    description: 'BAC 02',
    status: 'available',
  },
  {
    name: 'BAC-03',
    description: 'BAC 03',
    status: 'available',
  },
  {
    name: 'BAC-04',
    description: 'BAC 04',
    status: 'available',
  },
] as const

export const allowedRooms = rooms.map((room) => room.name)

export type RoomName = (typeof rooms)[number]['name']

export function isAllowedRoom(roomName: string): roomName is RoomName {
  return allowedRooms.some((allowedRoom) => allowedRoom === roomName)
}
