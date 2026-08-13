import { formatTime } from '../lib/format'

type PlayerBarProps = {
  title: string
  artist: string
  artworkUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  /** When true, render just the glass bar (parent handles positioning). */
  embedded?: boolean
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (seconds: number) => void
  onVolume: (value: number) => void
}

export function PlayerBar({
  title,
  artist,
  artworkUrl,
  isPlaying,
  currentTime,
  duration,
  volume,
  embedded = false,
  onToggle,
  onPrev,
  onNext,
  onSeek,
  onVolume,
}: PlayerBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const bar = (
    <div className="player-shell pointer-events-auto relative w-full max-w-[540px] overflow-hidden rounded-[22px] border border-[#f0c27a]/35 px-3 py-3 shadow-[0_18px_50px_rgba(40,20,0,0.35)] sm:rounded-[26px] sm:gap-4 sm:px-4 sm:py-3.5">
      {/* Warm morning glass + faint album bleed */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${artworkUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(28px) saturate(1.4)',
          transform: 'scale(1.35)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,220,160,0.3),rgba(20,12,8,0.58)_50%,rgba(30,18,10,0.4))] backdrop-blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffe6b0]/55 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-2.5 sm:gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={artworkUrl}
              alt={`${title} artwork`}
              className={`size-[3.35rem] rounded-full object-cover shadow-[0_0_0_2px_rgba(255,230,190,0.55),0_0_0_5px_rgba(255,210,140,0.2)] sm:size-16 ${isPlaying ? 'spin-art' : 'spin-art paused'}`}
              draggable={false}
            />
            <span className="absolute inset-0 m-auto size-2.5 rounded-full bg-[#0a0a0a]/85 ring-1 ring-white/35" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] tracking-[0.22em] text-[#f0d2a0] drop-shadow-sm sm:text-[11px]">
              NOW PLAYING
            </p>
            <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-white drop-shadow-sm sm:text-base">
              {title}
            </p>
            <p className="truncate text-[12px] text-white/70 sm:text-[13px]">{artist}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <label className="mr-1 hidden items-center gap-1.5 sm:flex">
              <VolumeIcon />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => onVolume(Number(e.target.value))}
                aria-label="Volume"
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-[#f2d7a8]"
              />
            </label>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous track"
              className="grid size-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10 active:scale-95 sm:size-11"
            >
              <PrevIcon />
            </button>
            <button
              type="button"
              onClick={onToggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="grid size-12 place-items-center rounded-full bg-[#f4e6c8] text-[#1a1208] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition hover:scale-[1.04] hover:bg-[#fff1d6] active:scale-95"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="grid size-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10 active:scale-95 sm:size-11"
            >
              <NextIcon />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-0.5 sm:gap-3">
          <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular-nums tracking-wide text-white/55 sm:w-9 sm:text-[11px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek"
            className="seek-range h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20"
            style={{
              background: `linear-gradient(to right, #f2d7a8 ${progress}%, rgba(255,255,255,0.22) ${progress}%)`,
            }}
          />
          <span className="w-8 shrink-0 font-mono text-[10px] tabular-nums tracking-wide text-white/55 sm:w-9 sm:text-[11px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )

  if (embedded) return bar

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4 sm:pb-6">
      {bar}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.02-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 6h2v12h-2V6zM6 18l8.5-6L6 6v12z" />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-white/70">
      <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06A7.98 7.98 0 0 1 19 12a7.98 7.98 0 0 1-5 6.71v2.06c4.01-1.14 7-4.82 7-8.77s-2.99-7.63-7-8.77z" />
    </svg>
  )
}
