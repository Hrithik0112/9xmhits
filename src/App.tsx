import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header'
import { PlayerBar } from './components/PlayerBar'
import { PlaylistDrawer } from './components/PlaylistDrawer'
import { SONGS, shuffleSongs, youtubeThumb, type Song } from './data/songs'
import { useClock } from './hooks/useClock'
import { useMascotVoice } from './hooks/useMascotVoice'
import { usePresence } from './hooks/usePresence'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import { fetchPlaylistFromInput } from './lib/fetchPlaylist'

const DEFAULT_QUEUE_KEY = 'morning-hits'

export default function App() {
  const defaultPlaylist = useMemo(() => shuffleSongs(SONGS), [])
  const [playlist, setPlaylist] = useState<Song[]>(defaultPlaylist)
  const [queueKey, setQueueKey] = useState(DEFAULT_QUEUE_KEY)
  const [playlistTitle, setPlaylistTitle] = useState('MORNING HITS')
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const clock = useClock()
  const listeners = usePresence()
  const [playlistOpen, setPlaylistOpen] = useState(false)
  const remoteSound = useRef<HTMLAudioElement | null>(null)
  const isCustom = queueKey !== DEFAULT_QUEUE_KEY

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
    queueKey,
    onTrackChange: playRemoteClick,
  })

  const loadCustomPlaylist = useCallback(async (url: string) => {
    setCustomLoading(true)
    setCustomError(null)
    try {
      const result = await fetchPlaylistFromInput(url)
      setPlaylist(result.songs)
      setPlaylistTitle('YOUR PLAYLIST')
      setQueueKey(`custom:${result.id}`)
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : 'Could not load playlist')
    } finally {
      setCustomLoading(false)
    }
  }, [])

  const resetDefaultPlaylist = useCallback(() => {
    setPlaylist(defaultPlaylist)
    setPlaylistTitle('MORNING HITS')
    setQueueKey(DEFAULT_QUEUE_KEY)
    setCustomError(null)
  }, [defaultPlaylist])

  const mascot = useMascotVoice({
    isPlaying: player.isPlaying,
    volume: player.volume,
    pause: player.pause,
    play: player.play,
    changeVolume: player.changeVolume,
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

      {/* Indexable copy for search / assistive tech (visually hidden) */}
      <section className="sr-only" aria-label="About 9XM Morning Hits">
        <h1>9XM Morning Hits — Free Bollywood Nostalgia Web Radio</h1>
        <p>
          Stream free 9XM-style morning hits online: classic Bollywood songs from
          the 2000s and 2010s. The Bollywood bangers that woke up a generation —
          best between 6 AM and 10 AM.
        </p>
        <h2>Morning hits playlist highlights</h2>
        <ul>
          {SONGS.slice(0, 24).map((song) => (
            <li key={song.id}>
              {song.title}
              {song.movie ? ` — ${song.movie}` : ''}
              {song.year > 0 ? ` (${song.year})` : ''}
            </li>
          ))}
        </ul>
        <p>
          Built by{' '}
          <a href="https://www.hrithikdutta.me/">Hrithik Dutta</a>. Paste your own
          YouTube Music playlist to listen inside the player.
        </p>
      </section>

      {/* Top-right brand lockup */}
      <div className="pointer-events-none absolute right-4 top-[3.25rem] z-20 flex w-[min(48vw,15.5rem)] flex-col items-end text-right sm:right-7 sm:top-5 sm:w-[18rem] md:right-8 md:w-[20rem]">
        <p className="m-0" aria-hidden>
          <img
            src="/9xm-logo.png?v=2"
            alt=""
            className="ml-auto h-11 w-auto select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] sm:h-[3.35rem] md:h-16"
            draggable={false}
          />
        </p>
        <p
          className="font-display mt-2.5 select-none text-[1.85rem] leading-none tracking-[0.12em] text-foam drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:mt-3 sm:text-[2.35rem] md:text-[2.75rem]"
          aria-hidden
        >
          MORNING HITS
        </p>
        <span
          className="mt-2 h-px w-14 bg-gradient-to-l from-foam/80 to-transparent sm:mt-2.5 sm:w-20"
          aria-hidden
        />
      </div>

      {/* Bottom-left: mascots standing on the page edge */}
      <div className="pointer-events-none absolute bottom-0 left-2 z-30 sm:left-4 md:left-6">
        <div className="group pointer-events-auto relative flex flex-col items-center">
          <span
            className={`mascot-hint pointer-events-none absolute bottom-[calc(100%+0.25rem)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#f2d7a8]/35 bg-black/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#f2d7a8] shadow-[0_6px_18px_rgba(0,0,0,0.4)] backdrop-blur-md transition duration-200 sm:text-xs ${
              mascot.speaking
                ? 'translate-y-0 opacity-100'
                : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
            }`}
          >
            {mascot.speaking ? 'Bakwaas on…' : 'Click for Bade Chote jokes'}
          </span>

          <button
            type="button"
            onClick={mascot.speak}
            aria-label="Play Bade and Chote jokes"
            className={`relative cursor-pointer border-0 bg-transparent p-0 outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#f2d7a8]/45 ${
              mascot.speaking ? 'mascot-talking' : 'mascot-float'
            }`}
          >
            <img
              src="/mascot.png"
              alt=""
              className="h-28 w-auto select-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)] sm:h-36 md:h-44"
              draggable={false}
            />
          </button>
        </div>
      </div>

      {/* Bottom player */}
      {player.song && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3 sm:pb-4">
          <div className="relative flex w-full max-w-[540px] flex-col items-center">
            <div className="pointer-events-auto relative z-20 w-full">
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
                trackCount={playlist.length}
                playlistLabel={isCustom ? 'songs · your playlist' : 'morning hits · 2001–2016'}
                onOpenPlaylist={() => setPlaylistOpen(true)}
              />
            </div>
            <a
              href="https://www.hrithikdutta.me/"
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto relative z-30 mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3.5 py-1.5 text-[13px] font-medium text-foam shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-white/40 hover:bg-black/70 hover:text-white sm:mt-3 sm:px-4 sm:text-sm"
            >
              Built by <span className="font-semibold underline decoration-white/50 underline-offset-[3px]">Hrithik</span>
              <span aria-hidden className="text-foam/70">↗</span>
            </a>
          </div>
        </div>
      )}

      <PlaylistDrawer
        open={playlistOpen}
        songs={playlist}
        currentIndex={player.index}
        isPlaying={player.isPlaying}
        playlistTitle={playlistTitle}
        playlistSubtitle={
          isCustom
            ? `${playlist.length} songs · your queue · tap to play`
            : `${playlist.length} hits · 2001–2016 · tap to play`
        }
        isCustom={isCustom}
        loadingCustom={customLoading}
        customError={customError}
        onClose={() => setPlaylistOpen(false)}
        onSelect={(index) => {
          player.playAt(index)
          setPlaylistOpen(false)
        }}
        onLoadPlaylist={loadCustomPlaylist}
        onResetDefault={resetDefaultPlaylist}
      />

      <div className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <div id="yt-audio-player" />
        <div id="yt-mascot-player" />
      </div>
    </main>
  )
}
