import { useCallback, useEffect, useRef, useState } from 'react'
import type { Song } from '../data/songs'
import { loadYouTubeAPI } from '../lib/youtubeApi'

type PlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'buffering'

type UseYouTubePlayerOptions = {
  songs: Song[]
  /** Bump when the queue is replaced so playback restarts from track 0. */
  queueKey?: string
  onTrackChange?: () => void
}

export function useYouTubePlayer({
  songs,
  queueKey = 'default',
  onTrackChange,
}: UseYouTubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null)
  const indexRef = useRef(0)
  const volumeRef = useRef(80)
  const songsRef = useRef(songs)
  const onTrackChangeRef = useRef(onTrackChange)
  const lastQueueKeyRef = useRef(queueKey)
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
    songsRef.current = songs
  }, [songs])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    let cancelled = false
    let tick: number | undefined

    const mount = async () => {
      await loadYouTubeAPI()
      if (cancelled || !songsRef.current[0]) return

      playerRef.current = new window.YT.Player('yt-audio-player', {
        height: 1,
        width: 1,
        videoId: songsRef.current[0].id,
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
              const list = songsRef.current
              if (!list.length) return
              const next = (indexRef.current + 1) % list.length
              indexRef.current = next
              setIndex(next)
              onTrackChangeRef.current?.()
              event.target.loadVideoById(list[next]!.id)
            }
          },
          onError: () => {
            const list = songsRef.current
            if (!list.length) return
            const next = (indexRef.current + 1) % list.length
            indexRef.current = next
            setIndex(next)
            onTrackChangeRef.current?.()
            playerRef.current?.loadVideoById(list[next]!.id)
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
  }, [])

  const loadIndex = useCallback((nextIndex: number, autoplay = true) => {
    const list = songsRef.current
    if (!list.length) return
    const normalized = (nextIndex + list.length) % list.length
    indexRef.current = normalized
    setIndex(normalized)
    setCurrentTime(0)
    onTrackChangeRef.current?.()
    const player = playerRef.current
    if (!player) return
    if (autoplay) {
      player.loadVideoById(list[normalized]!.id)
      window.setTimeout(() => player.playVideo(), 50)
    } else {
      player.cueVideoById(list[normalized]!.id)
    }
  }, [])

  useEffect(() => {
    if (!ready || !songs.length) return
    if (lastQueueKeyRef.current === queueKey) return
    lastQueueKeyRef.current = queueKey
    indexRef.current = 0
    setIndex(0)
    setCurrentTime(0)
    onTrackChangeRef.current?.()
    const player = playerRef.current
    if (!player) return
    player.loadVideoById(songs[0]!.id)
    window.setTimeout(() => player.playVideo(), 50)
  }, [queueKey, ready, songs])

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

  const playAt = useCallback(
    (nextIndex: number) => {
      loadIndex(nextIndex, true)
    },
    [loadIndex],
  )

  return {
    song: songs[index] ?? songs[0],
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
    playAt,
    seek,
    changeVolume,
  }
}
