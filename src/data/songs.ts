import youtubeTracks from './youtubeTracks.json'

export type Song = {
  id: string
  title: string
  artist: string
  movie: string
  year: number
}

export const YOUTUBE_PLAYLIST_ID = 'PLDL1LmzYahkcwTMCkYg9wizbtcB_30yax'

export const PLAYLIST_LINKS = {
  youtubeMusic: `https://music.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`,
} as const

/** Tracks from the YouTube Music playlist */
export const SONGS = youtubeTracks as Song[]

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function shuffleSongs(songs: Song[]): Song[] {
  const arr = [...songs]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
