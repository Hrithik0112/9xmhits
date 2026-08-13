import { useCallback, useEffect, useRef, useState } from 'react'
import type { Song } from '../data/songs'

type PlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'buffering'

type UseYouTubePlayerOptions = {
  songs: Song[]
  onTrackChange?: () => void
}

let apiLoadPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })

  return apiLoadPromise
}

export function useYouTubePlayer({ songs, onTrackChange }: UseYouTubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null)
  const indexRef = useRef(0)
  const volumeRef = useRef(80)
  const onTrackChangeRef = useRef(onTrackChange)
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onTrackChangeRef.current = onTrackChange
  }, [onTrackChange])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    let cancelled = false
    let tick: number | undefined

    const mount = async () => {
      await loadYouTubeAPI()
      if (cancelled || !songs[0]) return

      playerRef.current = new window.YT.Player('yt-audio-player', {
        height: 1,
        width: 1,
        videoId: songs[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volumeRef.current)
            setReady(true)
            setStatus('ready')
            setDuration(event.target.getDuration() || 0)
          },
          onStateChange: (event) => {
            const state = event.data
            if (state === window.YT.PlayerState.PLAYING) {
              setStatus('playing')
              setDuration(event.target.getDuration() || 0)
            } else if (state === window.YT.PlayerState.PAUSED) {
              setStatus('paused')
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setStatus('buffering')
            } else if (state === window.YT.PlayerState.ENDED) {
              const next = (indexRef.current + 1) % songs.length
              indexRef.current = next
              setIndex(next)
              onTrackChangeRef.current?.()
              event.target.loadVideoById(songs[next].id)
            }
          },
          onError: () => {
            const next = (indexRef.current + 1) % songs.length
            indexRef.current = next
            setIndex(next)
            onTrackChangeRef.current?.()
            playerRef.current?.loadVideoById(songs[next].id)
          },
        },
      })

      tick = window.setInterval(() => {
        const player = playerRef.current
        if (!player?.getCurrentTime) return
        setCurrentTime(player.getCurrentTime() || 0)
        const d = player.getDuration?.() || 0
        if (d) setDuration(d)
      }, 250)
    }

    void mount()

    return () => {
      cancelled = true
      if (tick) window.clearInterval(tick)
      playerRef.current?.destroy()
      playerRef.current = null
    }
    // songs identity is stable after shuffle-on-mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  const toggle = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    const state = player.getPlayerState()
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [])

  const loadIndex = useCallback(
    (nextIndex: number, autoplay = true) => {
      if (!songs.length) return
      const normalized = (nextIndex + songs.length) % songs.length
      indexRef.current = normalized
      setIndex(normalized)
      setCurrentTime(0)
      onTrackChangeRef.current?.()
      const player = playerRef.current
      if (!player) return
      if (autoplay) {
        player.loadVideoById(songs[normalized].id)
        window.setTimeout(() => player.playVideo(), 50)
      } else {
        player.cueVideoById(songs[normalized].id)
      }
    },
    [songs],
  )

  const next = useCallback(() => {
    loadIndex(indexRef.current + 1)
  }, [loadIndex])

  const prev = useCallback(() => {
    if (currentTime > 3) {
      playerRef.current?.seekTo(0, true)
      setCurrentTime(0)
      return
    }
    loadIndex(indexRef.current - 1)
  }, [currentTime, loadIndex])

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
    setCurrentTime(seconds)
  }, [])

  const changeVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(100, value))
    volumeRef.current = clamped
    setVolume(clamped)
    playerRef.current?.setVolume(clamped)
  }, [])

  return {
    song: songs[index],
    index,
    status,
    ready,
    currentTime,
    duration,
    volume,
    isPlaying: status === 'playing',
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    changeVolume,
  }
}
