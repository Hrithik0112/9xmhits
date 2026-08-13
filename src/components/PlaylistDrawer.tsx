import { useEffect, useRef, useState } from 'react'
import type { Song } from '../data/songs'
import { youtubeThumb } from '../data/songs'

type PlaylistDrawerProps = {
  open: boolean
  songs: Song[]
  currentIndex: number
  isPlaying: boolean
  playlistTitle: string
  playlistSubtitle: string
  isCustom: boolean
  loadingCustom: boolean
  customError: string | null
  onClose: () => void
  onSelect: (index: number) => void
  onLoadPlaylist: (url: string) => void
  onResetDefault: () => void
}

export function PlaylistDrawer({
  open,
  songs,
  currentIndex,
  isPlaying,
  playlistTitle,
  playlistSubtitle,
  isCustom,
  loadingCustom,
  customError,
  onClose,
  onSelect,
  onLoadPlaylist,
  onResetDefault,
}: PlaylistDrawerProps) {
  const listRef = useRef<HTMLUListElement | null>(null)
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 180)
    return () => window.clearTimeout(id)
  }, [open, currentIndex])

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close playlist"
        onClick={onClose}
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Playlist"
        className={`playlist-drawer absolute inset-y-0 right-0 flex w-[min(100vw,22.5rem)] flex-col border-l border-[#f0c27a]/30 bg-[rgba(18,12,8,0.92)] shadow-[-18px_0_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-300 ease-out sm:w-[26rem] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,220,160,0.16),transparent_42%,rgba(20,12,8,0.2))]"
          aria-hidden
        />

        <header className="relative z-10 flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0">
            <p className="font-display text-[11px] tracking-[0.2em] text-[#f0d2a0]">PLAYLIST</p>
            <h2 className="font-display mt-1 truncate text-[1.65rem] leading-none tracking-[0.08em] text-foam sm:text-[1.85rem]">
              {playlistTitle}
            </h2>
            <p className="mt-1.5 text-xs text-white/55">{playlistSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-foam/80 transition hover:bg-white/10 hover:text-white"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="relative z-10 border-b border-white/10 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-medium tracking-wide text-[#f2d7a8]/90">
            Add your playlist
          </p>
          <p className="mt-0.5 text-[11px] text-white/45">
            Paste a YouTube or YouTube Music playlist link
          </p>
          <form
            className="mt-2.5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!url.trim() || loadingCustom) return
              onLoadPlaylist(url.trim())
            }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://music.youtube.com/playlist?list=…"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-[12px] text-foam outline-none placeholder:text-white/30 focus:border-[#f2d7a8]/50"
            />
            <button
              type="submit"
              disabled={loadingCustom || !url.trim()}
              className="shrink-0 rounded-lg bg-[#f2d7a8] px-3 py-2 text-[12px] font-semibold text-[#1a1208] transition hover:bg-[#fff1d6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingCustom ? 'Loading…' : 'Load'}
            </button>
          </form>
          {customError ? (
            <p className="mt-2 text-[11px] text-red-300/90">{customError}</p>
          ) : null}
          {isCustom ? (
            <button
              type="button"
              onClick={onResetDefault}
              className="mt-2 text-[11px] font-medium text-[#f2d7a8]/90 underline decoration-[#f2d7a8]/40 underline-offset-2 transition hover:text-[#fff1d6]"
            >
              Back to Morning Hits
            </button>
          ) : null}
        </div>

        <ul
          ref={listRef}
          className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3 sm:py-3"
        >
          {songs.map((song, index) => {
            const active = index === currentIndex
            const meta = [song.movie, song.year > 0 ? String(song.year) : '']
              .filter(Boolean)
              .join(' · ')

            return (
              <li key={`${song.id}-${index}`}>
                <button
                  ref={active ? activeRef : undefined}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition sm:gap-3.5 sm:px-3 sm:py-3 ${
                    active
                      ? 'bg-[#f2d7a8]/14 ring-1 ring-[#f2d7a8]/35'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`w-5 shrink-0 text-center font-mono text-[11px] tabular-nums ${
                      active ? 'text-[#f2d7a8]' : 'text-white/35'
                    }`}
                  >
                    {active && isPlaying ? <LiveBars /> : index + 1}
                  </span>

                  <img
                    src={youtubeThumb(song.id)}
                    alt=""
                    className="size-11 shrink-0 rounded-lg object-cover shadow-[0_4px_12px_rgba(0,0,0,0.35)] sm:size-12"
                    draggable={false}
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] font-semibold leading-tight sm:text-sm ${
                        active ? 'text-[#f6e4c4]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/55 sm:text-xs">
                      {song.artist}
                    </span>
                    {meta ? (
                      <span className="mt-0.5 block truncate text-[10px] text-white/35 sm:text-[11px]">
                        {meta}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

function LiveBars() {
  return (
    <span className="live-bars mx-auto inline-flex h-3.5 w-3 items-end justify-between" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  )
}
