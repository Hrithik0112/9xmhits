import { PLAYLIST_LINKS } from '../data/songs'

type HeaderProps = {
  clock: string
  listeners: number
}

export function Header({ clock, listeners }: HeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4 pt-4 text-sm text-foam sm:px-6 sm:pt-5">
      <time className="pointer-events-auto tabular-nums tracking-wide opacity-90">{clock}</time>

      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-sm">
        <span className="pulse-dot inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="tabular-nums font-medium">{listeners} online</span>
      </div>

      <nav className="pointer-events-auto flex items-center gap-3 text-[13px] font-medium">
        <a
          href={PLAYLIST_LINKS.youtubeMusic}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 opacity-90 transition hover:opacity-100"
          aria-label="Open on YouTube Music"
        >
          <YTMusicIcon />
          <span className="hidden sm:inline">YT Music</span>
          <span aria-hidden>↗</span>
        </a>
      </nav>
    </header>
  )
}

function YTMusicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zm-2.16 9.3V8.928l5.616 3.072-5.616 3.072z" />
    </svg>
  )
}
