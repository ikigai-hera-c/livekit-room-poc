export const rooms = [
  {
    name: 'ARO-001',
    description: 'ARO 001',
    status: 'available',
  },
  {
    name: 'ARO-002',
    description: 'ARO 002',
    status: 'available',
  },
  {
    name: 'SBO-001',
    description: 'SBO 001',
    status: 'available',
  },
  {
    name: 'QA-BAC-01',
    description: 'QA BAC 01',
    status: 'available',
  },
] as const

export const allowedRooms = rooms.map((room) => room.name)

export type RoomName = (typeof rooms)[number]['name']

export function isAllowedRoom(roomName: string): roomName is RoomName {
  return allowedRooms.some((allowedRoom) => allowedRoom === roomName)
}
