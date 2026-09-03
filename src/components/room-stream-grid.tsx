import { FlvPlayer } from '@/components/flv-player'
import type { RoomName } from '@/lib/rooms'
import type { RoomStream } from '@/lib/room-streams'
import { roomStreams } from '@/lib/room-streams'

type RoomStreamGridProps = {
  roomName: RoomName
}

export function RoomStreamGrid({ roomName }: RoomStreamGridProps) {
  return (
    <div className="mt-5 grid gap-3 xl:grid-cols-2">
      {roomStreams[roomName].map((stream) => (
        <StreamWindow
          key={stream.id}
          title={stream.title}
          type={stream.type}
          url={stream.url}
        />
      ))}
    </div>
  )
}

type StreamWindowProps = Pick<RoomStream, 'title' | 'type' | 'url'>

function StreamWindow({ title, type, url }: StreamWindowProps) {
  return (
    <section className="flex min-h-52 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#11141b]">
      <header className="flex h-11 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            aria-hidden="true"
          />

          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>

        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          Live
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center bg-black">
        {url && type === 'flv' ? (
          <FlvPlayer title={title} url={url} />
        ) : url ? (
          <iframe
            className="absolute inset-0 size-full border-0"
            src={url}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="px-4 text-center">
            <p className="text-xs font-medium text-zinc-400">
              Stream is not configured
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
