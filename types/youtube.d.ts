export interface YTPlayer {
  destroy(): void;
  getPlayerState(): number;
}

export interface YTPlayerEvent {
  data: number;
  target: YTPlayer;
}

export interface YTPlayerOptions {
  videoId: string;
  events?: {
    onStateChange?: (event: YTPlayerEvent) => void;
    onReady?: (event: YTPlayerEvent) => void;
  };
}

export interface YouTubeAPI {
  Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
  }
}

export {};