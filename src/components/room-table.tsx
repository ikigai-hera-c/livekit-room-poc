'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { rooms, type RoomName } from '@/lib/rooms'

type RoomTableProps = {
  joiningRoom: RoomName | null
  onJoinRoom: (roomName: RoomName) => void
}

export function RoomTable({ joiningRoom, onJoinRoom }: RoomTableProps) {
  return (
    <section aria-labelledby="available-rooms-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="available-rooms-heading"
          className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Available rooms
        </h2>

        <span className="text-sm text-muted-foreground">
          {rooms.length} rooms
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card/50">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-5">ID</TableHead>
              <TableHead className="h-12 px-5">Status</TableHead>
              <TableHead className="h-12 px-5">Participants</TableHead>
              <TableHead className="h-12 px-5">My role</TableHead>
              <TableHead className="h-12 px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rooms.map((room) => {
              const isJoining = joiningRoom === room.name

              return (
                <TableRow key={room.name}>
                  <TableCell className="px-5 py-5">
                    <span className="font-mono font-medium">{room.name}</span>
                  </TableCell>

                  <TableCell className="px-5 py-5">
                    <Badge
                      variant="outline"
                      className="gap-2 border-emerald-500/30 text-emerald-400"
                    >
                      <span
                        className="size-2 rounded-full bg-emerald-400"
                        aria-hidden="true"
                      />
                      Active
                    </Badge>
                  </TableCell>

                  <TableCell className="px-5 py-5 text-muted-foreground">
                    <span title="Participant count is not available in this PoC">
                      —
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-5">Operator</TableCell>

                  <TableCell className="px-5 py-5 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={joiningRoom !== null}
                      onClick={() => onJoinRoom(room.name)}
                    >
                      {isJoining ? 'Joining...' : 'Join'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
