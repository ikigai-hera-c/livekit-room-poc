'use client'

import { useEffect, useRef, useState } from 'react'

type FlvPlayerProps = {
  title: string
  url: string
}

export function FlvPlayer({ title, url }: FlvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    const mediaElement = video
    let cancelled = false
    let destroyPlayer = () => {}

    async function startPlayer() {
      const { default: mpegts } = await import('mpegts.js')

      if (cancelled) {
        return
      }

      if (!mpegts.isSupported()) {
        setError('HTTP-FLV playback is not supported in this browser')
        return
      }

      const player = mpegts.createPlayer(
        {
          type: 'flv',
          isLive: true,
          url,
        },
        {
          enableStashBuffer: false,
          liveBufferLatencyChasing: true,
        },
      )

      player.attachMediaElement(mediaElement)
      player.load()

      Promise.resolve(player.play()).catch((playError: unknown) => {
        console.warn('HTTP-FLV autoplay was blocked', playError)
      })

      destroyPlayer = () => {
        player.pause()
        player.unload()
        player.detachMediaElement()
        player.destroy()
      }
    }

    setError('')

    startPlayer().catch((playerError: unknown) => {
      console.error('Unable to start HTTP-FLV player', playerError)
      setError('Unable to play this stream')
    })

    return () => {
      cancelled = true
      destroyPlayer()
    }
  }, [url])

  if (error) {
    return (
      <div className="flex size-full items-center justify-center px-6 text-center text-sm text-red-300">
        {error}
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className="size-full bg-black object-contain"
      title={title}
      autoPlay
      muted
      playsInline
      controls
    />
  )
}
