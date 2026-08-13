# 9XM Morning Hits

Nostalgia web radio — the Bollywood bangers that woke up a generation.

full-bleed background, YouTube audio playback from a curated 9XM playlist.

## Stack

- React + TypeScript + Vite + Tailwind CSS
- YouTube IFrame API (hidden video → audio)

## Local development

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub and import on Vercel (or any static host).

Playlist link is set in `src/data/songs.ts` (`PLAYLIST_LINKS.youtubeMusic`). Track list lives in `src/data/youtubeTracks.json`.

## Controls

- Space — play / pause
- ← / → — previous / next track
- Seek + volume in the bottom glass player
- TV remote click sound on track change
