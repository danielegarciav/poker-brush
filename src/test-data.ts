import { GameData, GameRequestData, PlayerData } from './model';

export const generateTestGames = (): GameData[] => [
  {
    id: 'awcdjuf',
    title: 'Texas Hold Em',
    subtitle: '10/20',
  },
  {
    id: '8yvrqck',
    title: 'Texas Hold Em',
    subtitle: '20/40',
  },
  {
    id: 'z6g19tq',
    title: 'Texas Hold Em',
    subtitle: '40/80',
    subtitle2: 'big PP',
  },
];

export const generateTestPlayers = (): PlayerData[] => [
  {
    id: 'n8xgist',
    name: 'Daniel',
  },
  {
    id: 'jthi3vk',
    name: 'Davo',
  },
  {
    id: '9xuj309',
    name: 'Yanny',
  },
  {
    id: 'nh4ma8l',
    name: 'Laurel',
  },
  {
    id: '648syo0',
    name: 'Johnny',
  },
];

export const generateTestGameRequests = (testPlayers: PlayerData[], testGames: GameData[]): GameRequestData[] => [
  {
    id: '2he9dhk',
    game: testGames[0],
    player: testPlayers[0],
    isMainRequest: true,
    timestamp: Date.now(),
    calls: [],
  },
  {
    id: 'pdk3ur5',
    game: testGames[0],
    player: testPlayers[1],
    isMainRequest: true,
    timestamp: Date.now() + 1,
    calls: [],
  },
  {
    id: 'dix02us',
    game: testGames[1],
    player: testPlayers[2],
    isMainRequest: true,
    timestamp: Date.now() + 2,
    calls: [],
  },
  {
    id: 'cwda2ya',
    game: testGames[1],
    player: testPlayers[3],
    isMainRequest: true,
    timestamp: Date.now() + 3,
    calls: [],
  },
  {
    id: '4myv5s5',
    game: testGames[2],
    player: testPlayers[4],
    isMainRequest: true,
    timestamp: Date.now() + 4,
    calls: [],
  },
];

export const generateTestData = () => {
  const players = generateTestPlayers();
  const games = generateTestGames();
  const gameRequests = generateTestGameRequests(players, games);
  return { players, games, gameRequests };
};
