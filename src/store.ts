import { defineStore } from 'pinia';
import { GameData, GameRequestData, PlayerData } from './model';
import { generateTestData } from './test-data';

export const useMainStore = defineStore({
  id: 'main',

  state: () => ({
    games: [] as GameData[],
    players: [] as PlayerData[],
    gameRequests: [] as GameRequestData[],
  }),

  getters: {
    activeCalls(): GameRequestData[] {
      return this.gameRequests.filter(gr => gr.calls.length).sort((a, b) => a.calls[0] - b.calls[0]);
    },
  },

  actions: {
    resetModel() {
      const { players, games, gameRequests } = generateTestData();
      this.$state = { players, games, gameRequests };
    },
  },
});

export type MainStore = ReturnType<typeof useMainStore>;
export type State = MainStore['$state'];
