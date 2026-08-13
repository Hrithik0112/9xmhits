import { useCallback, useEffect, useRef, useState } from 'react'
import { MASCOT_CLIPS } from '../data/mascotClips'

type DuckControls = {
  isPlaying: boolean
  volume: number
  pause: () => void
  play: () => void
  changeVolume: (value: number) => void
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

function pickClip(excludeId?: string) {
  const pool =
    excludeId && MASCOT_CLIPS.length > 1
      ? MASCOT_CLIPS.filter((c) => c.id !== excludeId)
      : MASCOT_CLIPS
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function useMascotVoice(radio: DuckControls) {
  const playerRef = useRef<YT.Player | null>(null)
  const readyRef = useRef(false)
  const speakingRef = useRef(false)
  const lastClipRef = useRef<string | undefined>(undefined)
  const restoreRef = useRef<{ wasPlaying: boolean; volume: number } | null>(null)
  const radioRef = useRef(radio)
  const endWatchRef = useRef<number | undefined>(undefined)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    radioRef.current = radio
  }, [radio])

  const restoreRadio = useCallback(() => {
    if (endWatchRef.current) {
      window.clearInterval(endWatchRef.current)
      endWatchRef.current = undefined
    }
    speakingRef.current = false
    setSpeaking(false)
    const saved = restoreRef.current
    restoreRef.current = null
    if (!saved) return
    radioRef.current.changeVolume(saved.volume)
    if (saved.wasPlaying) radioRef.current.play()
  }, [])

  useEffect(() => {
    let cancelled = false

    const mount = async () => {
      await loadYouTubeAPI()
      if (cancelled) return

      playerRef.current = new window.YT.Player('yt-mascot-player', {
        height: 1,
        width: 1,
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
          onReady: () => {
            readyRef.current = true
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              restoreRadio()
            }
          },
          onError: () => {
            restoreRadio()
          },
        },
      })
    }

    void mount()

    return () => {
      cancelled = true
      if (endWatchRef.current) window.clearInterval(endWatchRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
      readyRef.current = false
    }
  }, [restoreRadio])

  const speak = useCallback(() => {
    const player = playerRef.current
    if (!player || !readyRef.current || speakingRef.current) return

    const clip = pickClip(lastClipRef.current)
    lastClipRef.current = clip.id

    const radioNow = radioRef.current
    restoreRef.current = {
      wasPlaying: radioNow.isPlaying,
      volume: radioNow.volume,
    }
    speakingRef.current = true
    setSpeaking(true)

    radioNow.pause()
    radioNow.changeVolume(Math.min(radioNow.volume, 18))

    player.loadVideoById({
      videoId: clip.id,
      startSeconds: 0,
      endSeconds: clip.endSeconds,
    })
    player.setVolume(90)
    window.setTimeout(() => player.playVideo(), 40)

    if (endWatchRef.current) window.clearInterval(endWatchRef.current)
    endWatchRef.current = window.setInterval(() => {
      const t = player.getCurrentTime?.() ?? 0
      if (t >= clip.endSeconds - 0.15) {
        player.stopVideo()
        restoreRadio()
      }
    }, 200)
  }, [restoreRadio])

  return { speak, speaking }
}
