import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Header } from './components/Header'
import { PlayerBar } from './components/PlayerBar'
import { SONGS, shuffleSongs, youtubeThumb } from './data/songs'
import { useClock } from './hooks/useClock'
import { usePresence } from './hooks/usePresence'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'

export default function App() {
  const playlist = useMemo(() => shuffleSongs(SONGS), [])
  const clock = useClock()
  const listeners = usePresence()
  const remoteSound = useRef<HTMLAudioElement | null>(null)

  const playRemoteClick = useCallback(() => {
    if (!remoteSound.current) {
      remoteSound.current = new Audio('/sounds/tv-remote.wav')
      remoteSound.current.volume = 0.55
    }
    const audio = remoteSound.current
    audio.currentTime = 0
    void audio.play().catch(() => {
      /* ignore autoplay blocks before first gesture */
    })
  }, [])

  const player = useYouTubePlayer({
    songs: playlist,
    onTrackChange: playRemoteClick,
  })

  const { toggle, next, prev } = player

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, next, prev])

  return (
    <main className="relative h-dvh w-full overflow-hidden text-foam">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-website.avif')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55"
        aria-hidden
      />

      <Header clock={clock} listeners={listeners} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-40 pt-10">
        <h1 className="select-none text-center text-6xl font-bold tracking-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.6)] sm:text-7xl md:text-8xl lg:text-9xl">
          9XM
        </h1>
        <p className="mt-1 select-none text-center text-lg font-medium tracking-wide text-foam/90 drop-shadow sm:text-xl">
          Morning Hits
        </p>
      </div>

      {player.song && (
        <PlayerBar
          title={player.song.title}
          artist={player.song.artist}
          artworkUrl={youtubeThumb(player.song.id)}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          onToggle={player.toggle}
          onPrev={player.prev}
          onNext={player.next}
          onSeek={player.seek}
          onVolume={player.changeVolume}
        />
      )}

      <div className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <div id="yt-audio-player" />
      </div>
    </main>
  )
}
