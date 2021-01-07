import { GameData, GameRequestData, PlayerData } from './model';
import { State } from './store';
import { throwError } from './util';

export type SerializedGameRequestData = Omit<GameRequestData, 'player' | 'game'> & {
  playerId: string;
  gameId: string;
};

export type SerializedState = Omit<State, 'gameRequests'> & {
  gameRequests: SerializedGameRequestData[];
};

export const serializeGameRequests = (gameRequests: GameRequestData[]): SerializedGameRequestData[] =>
  gameRequests.map(({ player, game, ...gameRequest }) => ({
    ...gameRequest,
    playerId: player.id,
    gameId: game.id,
  }));

export const deserializeGameRequests = (
  gameRequests: SerializedGameRequestData[],
  players: PlayerData[],
  games: GameData[],
) =>
  gameRequests.map(({ playerId, gameId, ...gameRequest }) => ({
    ...gameRequest,
    player: players.find(p => p.id === playerId) ?? throwError(`Player with ID '${playerId}' not found`),
    game: games.find(g => g.id === gameId) ?? throwError(`Game with ID '${gameId}' not found`),
  }));

export const serializeState = (state: State): SerializedState => {
  const { gameRequests, ...staticState } = state;
  return {
    ...staticState,
    gameRequests: serializeGameRequests(gameRequests),
  };
};

export const deserializeState = (state: SerializedState): State => {
  const { gameRequests, ...staticState } = state;
  return {
    ...staticState,
    gameRequests: deserializeGameRequests(gameRequests, staticState.players, staticState.games),
  };
};
