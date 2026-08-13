export {}

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }

  namespace YT {
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface PlayerOptions {
      height?: string | number
      width?: string | number
      videoId?: string
      playerVars?: Record<string, string | number | boolean>
      events?: {
        onReady?: (event: PlayerEvent) => void
        onStateChange?: (event: OnStateChangeEvent) => void
        onError?: (event: OnErrorEvent) => void
      }
    }

    interface PlayerEvent {
      target: Player
    }

    interface OnStateChangeEvent {
      target: Player
      data: PlayerState
    }

    interface OnErrorEvent {
      target: Player
      data: number
    }

    class Player {
      constructor(elementId: string | HTMLElement, options: PlayerOptions)
      playVideo(): void
      pauseVideo(): void
      stopVideo(): void
      seekTo(seconds: number, allowSeekAhead: boolean): void
      setVolume(volume: number): void
      getVolume(): number
      getCurrentTime(): number
      getDuration(): number
      getPlayerState(): PlayerState
      loadVideoById(videoId: string, startSeconds?: number): void
      cueVideoById(videoId: string, startSeconds?: number): void
      destroy(): void
    }
  }
}
