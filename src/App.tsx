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
        style={{ backgroundImage: "url('/bg-website.avif?v=3')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30"
        aria-hidden
      />

      <Header clock={clock} listeners={listeners} />

      {/* Top-right brand lockup */}
      <div className="pointer-events-none absolute right-4 top-[3.25rem] z-20 flex w-[min(48vw,15.5rem)] flex-col items-end text-right sm:right-7 sm:top-5 sm:w-[18rem] md:right-8 md:w-[20rem]">
        <h1 className="m-0">
          <img
            src="/9xm-logo.png?v=2"
            alt="9XM"
            className="ml-auto h-11 w-auto select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] sm:h-[3.35rem] md:h-16"
            draggable={false}
          />
        </h1>
        <p className="font-display mt-2.5 select-none text-[1.85rem] leading-none tracking-[0.12em] text-foam drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:mt-3 sm:text-[2.35rem] md:text-[2.75rem]">
          MORNING HITS
        </p>
        <span
          className="mt-2 h-px w-14 bg-gradient-to-l from-foam/80 to-transparent sm:mt-2.5 sm:w-20"
          aria-hidden
        />
      </div>

      {/* Mascots standing on the player */}
      {player.song && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4 sm:pb-6">
          <div className="relative w-full max-w-[540px]">
            <img
              src="/mascot.png"
              alt="Bade and Chote"
              className="mascot-float pointer-events-none absolute bottom-[calc(100%-18px)] left-1/2 z-[5] h-[5.75rem] w-auto -translate-x-1/2 select-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.4)] sm:bottom-[calc(100%-22px)] sm:h-28 md:h-32"
              draggable={false}
            />
            <div className="pointer-events-auto relative z-20">
              <PlayerBar
                embedded
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
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <div id="yt-audio-player" />
      </div>
    </main>
  )
}
