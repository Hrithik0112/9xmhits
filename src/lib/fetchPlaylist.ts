import type { Song } from '../data/songs'
import { parsePlaylistId } from './parsePlaylistUrl'
import { loadYouTubeAPI } from './youtubeApi'

export type FetchedPlaylist = {
  id: string
  name: string
  songs: Song[]
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[|–—-]\s*(full\s*)?(video|song|lyrical|official).*$/i, '')
    .replace(/\s*\((full\s*)?(video|song|lyrical|official).*\)\s*$/i, '')
    .replace(/\s*\[(full\s*)?(video|song|lyrical|official).*\]\s*$/i, '')
    .trim() || raw
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const i = next
      next += 1
      results[i] = await fn(items[i]!, i)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

async function enrichVideo(id: string): Promise<Song> {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
    )
    if (!res.ok) throw new Error('meta failed')
    const data = (await res.json()) as { title?: string; author_name?: string; error?: string }
    if (data.error) throw new Error(data.error)
    return {
      id,
      title: cleanTitle(data.title || id),
      artist: data.author_name || 'YouTube',
      movie: '',
      year: 0,
    }
  } catch {
    return { id, title: id, artist: 'YouTube', movie: '', year: 0 }
  }
}

function loadPlaylistVideoIds(playlistId: string): Promise<string[]> {
  return loadYouTubeAPI().then(
    () =>
      new Promise<string[]>((resolve, reject) => {
        const host = document.createElement('div')
        host.id = `yt-pl-loader-${Date.now()}`
        host.setAttribute(
          'style',
          'position:absolute;width:1px;height:1px;left:-9999px;opacity:0;pointer-events:none;overflow:hidden',
        )
        document.body.appendChild(host)

        let settled = false
        let player: YT.Player | null = null

        const finish = (ids: string[] | null, error?: Error) => {
          if (settled) return
          settled = true
          window.clearTimeout(timeout)
          window.clearInterval(poll)
          try {
            player?.destroy()
          } catch {
            /* ignore */
          }
          host.remove()
          if (ids?.length) resolve(ids)
          else reject(error ?? new Error('Could not load that playlist'))
        }

        const tryRead = () => {
          const ids = player?.getPlaylist?.()
          if (ids?.length) finish(ids)
        }

        const timeout = window.setTimeout(() => {
          finish(null, new Error('Timed out loading playlist. Check the link and try again.'))
        }, 18_000)

        const poll = window.setInterval(tryRead, 400)

        player = new window.YT.Player(host.id, {
          height: 1,
          width: 1,
          playerVars: {
            listType: 'playlist',
            list: playlistId,
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
              event.target.cuePlaylist({
                list: playlistId,
                listType: 'playlist',
                index: 0,
              })
              window.setTimeout(tryRead, 600)
            },
            onStateChange: () => tryRead(),
            onError: () => {
              finish(
                null,
                new Error('Playlist is private, invalid, or unavailable.'),
              )
            },
          },
        })
      }),
  )
}

export async function fetchPlaylistFromInput(input: string): Promise<FetchedPlaylist> {
  const id = parsePlaylistId(input)
  if (!id) {
    throw new Error('Paste a YouTube or YouTube Music playlist link.')
  }

  const videoIds = await loadPlaylistVideoIds(id)
  const unique = [...new Set(videoIds)].slice(0, 100)
  const songs = await mapPool(unique, 6, (videoId) => enrichVideo(videoId))

  return {
    id,
    name: 'Your playlist',
    songs,
  }
}
