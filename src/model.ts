export interface GameData {
  id: string;
  title: string;
  subtitle?: string;
  subtitle2?: string;
}

export interface PlayerData {
  id: string;
  name: string;
}

export interface GameRequestData {
  id: string;
  player: PlayerData;
  game: GameData;
  isMainRequest: boolean;
  timestamp: number;
  /** The timestamp of each call for this game request. */
  calls: number[];
}
