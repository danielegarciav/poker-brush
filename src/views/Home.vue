<template>
  <div class="home">
    <Dialog
      v-model:visible="isAddPlayerDialogOpen"
      modal
      closeOnEscape
      dismissableMask
      :contentStyle="{ width: '500px' }"
    >
      <template #header>
        <h3 class="dialog-title">
          Add new player
        </h3>
      </template>
      <form @submit.prevent="onAddPlayerSubmit()">
        <input
          ref="newPlayerInputRef"
          type="text"
          class="dialog-big-input"
          placeholder="Player name"
          v-model="newPlayerName"
          @keyup.esc="isAddPlayerDialogOpen = false"
        />
        <hr />
        <div class="dialog-game-type-columns">
          <div class="dialog-game-type-column">
            <div class="dialog-game-type-select header">
              <p>Primary games</p>
            </div>
            <div
              v-for="game in store.games"
              :key="game.id"
              class="dialog-game-type-select"
              @click="toggleGameType(selectedPrimaryGameTypes, game.id)"
            >
              <p>
                <input
                  type="checkbox"
                  disabled
                  :checked="isGameTypeSelected(selectedPrimaryGameTypes, game.id)"
                  @click.prevent
                />
                <b>{{ game.title }}</b> {{ game.subtitle }}
              </p>
            </div>
          </div>
          <div class="dialog-game-type-column">
            <div class="dialog-game-type-select header">
              <p>Secondary games</p>
            </div>

            <div
              v-for="game in store.games"
              :key="game.id"
              class="dialog-game-type-select"
              @click="toggleGameType(selectedSecondaryGameTypes, game.id)"
            >
              <p>
                <input
                  type="checkbox"
                  :checked="isGameTypeSelected(selectedSecondaryGameTypes, game.id)"
                  @click.prevent
                />
                <b>{{ game.title }}</b> {{ game.subtitle }}
              </p>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button class="dialog-button" @click="isAddPlayerDialogOpen = false">Cancel</button>
        <button class="dialog-button" :disabled="!canSubmitNewPlayer" @click="onAddPlayerSubmit()">
          Add to list
        </button>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="isPlayerListDialogOpen"
      modal
      closeOnEscape
      dismissableMask
      :contentStyle="{ width: '600px' }"
    >
      <template #header>
        <h3 class="dialog-title">
          Player list
        </h3>
      </template>

      <input
        ref="playerListQueryInputRef"
        type="text"
        class="dialog-big-input"
        placeholder="Search for a player"
        v-model="playerListQuery"
        @keyup.esc="isPlayerListDialogOpen = false"
      />
      <hr />

      <div class="p-d-flex">
        <Listbox
          style="width: 160px"
          :value="selectedPlayer"
          :options="playerListQueryResult"
          optionLabel="name"
          @change="selectedPlayer = $event.value"
        />
        <div
          v-if="selectedPlayer"
          class="game-requests-column"
          style="flex-grow: 1; border-radius: 2px; padding: 0 0.5rem;"
        >
          <div
            v-for="gr in getGameRequestsByPlayer(selectedPlayer)"
            :key="gr.id"
            class="game-request"
            style="border-radius: 4px;"
            :class="{ 'main-request': gr.isMainRequest, 'called-request': gr.calls.length > 0 }"
            @click="showGameRequestPanel(gr, $event)"
          >
            <p>{{ gr.game.title }} {{ gr.game.subtitle }}</p>
          </div>
        </div>
      </div>

      <p>Selected player: {{ selectedPlayer ? selectedPlayer.name : 'None' }}</p>
    </Dialog>

    <Dialog
      v-model:visible="isSaveLoadDialogOpen"
      modal
      closeOnEscape
      dismissableMask
      :contentStyle="{ width: '500px' }"
    >
      <template #header>
        <h3 class="dialog-title">
          <b>Save / load</b>
        </h3>
      </template>
      <button class="dialog-button" @click="dumpModelData()">Save</button>
      <span>&nbsp;</span>
      <button class="dialog-button" @click="loadModelData()">Load</button>
      <hr />
      <textarea class="save-load-textarea" v-model="saveLoadData"></textarea>
      <Message v-if="saveLoadErrorText" severity="error" :closable="false">{{ saveLoadErrorText }}</Message>
    </Dialog>

    <OverlayPanel ref="gameRequestPanelRef" ismissable>
      <button class="dialog-button" @click="callSelectedGameRequest">
        <template v-if="selectedGameRequest && !selectedGameRequest.calls.length">
          <span>Call {{ selectedGameRequest.player.name }} for this game</span>
        </template>
        <template v-else-if="selectedGameRequest">
          <span>Call {{ selectedGameRequest.player.name }} for this game again</span>
        </template>
      </button>
      <template v-if="selectedGameRequest && selectedGameRequest.calls.length">
        <hr />
        <p>Called {{ selectedGameRequest.calls.length }} time(s)</p>
      </template>
    </OverlayPanel>

    <div class="dashboard">
      <div class="games-panel">
        <div class="game-columns">
          <div class="game-column" v-for="game in store.games" :key="game.id">
            <p class="game-column-header">
              <b>{{ game.title }}</b> {{ game.subtitle }}
            </p>
            <div class="game-requests-column">
              <div
                v-for="(gr, index) in getGameRequestsByGame(game)"
                :key="gr.id"
                class="game-request"
                :class="{ 'main-request': gr.isMainRequest, 'called-request': gr.calls.length > 0 }"
                @click="showGameRequestPanel(gr, $event)"
              >
                <p>{{ index + 1 }}. {{ gr.player.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="active-calls-sidebar">
        <p class="active-calls-header">Active calls</p>
        <div class="game-requests-column">
          <div
            v-for="gr in store.activeCalls"
            :key="gr.id"
            class="game-request"
            :class="{ 'main-request': gr.isMainRequest }"
            @click="showGameRequestPanel(gr, $event)"
          >
            <p>{{ gr.player.name }} ({{ gr.calls.length }})</p>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <input
        type="text"
        placeholder="Enter new player name"
        @keypress.prevent="openAddPlayerDialog($event.key)"
        @paste.prevent="openAddPlayerDialog($event.clipboardData ? $event.clipboardData.getData('text/plain') : '')"
      />
      <button @click="openAddPlayerDialog()">Add player</button>
      <button @click="openPlayerListDialog()">List of players</button>
      <button @click="resetModelData()">Reset model data</button>
      <button @click="openSaveLoadDialog()">Save / load</button>
      <button @click="toggleFullscreen()">Fullscreen</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, Ref, computed } from 'vue';
import fscreen from 'fscreen';

import { MainStore, useMainStore } from '@/store';
import { GameData, GameRequestData, PlayerData } from '@/model';
import { randomId, throwError } from '@/util';
import { deserializeState, serializeState } from '@/serialization';

import Dialog from 'primevue/dialog';
import OverlayPanel from 'primevue/overlaypanel';
import Message from 'primevue/message';
import Listbox from 'primevue/listbox';

export default defineComponent({
  name: 'home',
  components: { Dialog, OverlayPanel, Message, Listbox },

  setup() {
    const store = useMainStore();
    const resetModelData = () => store.resetModel();

    const getGameRequestsByGame = (game: GameData): GameRequestData[] =>
      store.gameRequests.filter(gr => gr.game.id === game.id).sort((a, b) => a.timestamp - b.timestamp);

    const getGameRequestsByPlayer = (player: PlayerData): GameRequestData[] =>
      store.gameRequests.filter(gr => gr.player.id === player.id).sort((a, b) => a.timestamp - b.timestamp);

    const useAddPlayerDialog = (store: MainStore) => {
      const isAddPlayerDialogOpen = ref(false);
      const newPlayerName = ref('');
      const newPlayerInputRef = ref<HTMLInputElement>();
      const selectedPrimaryGameTypes = ref<string[]>([]);
      const selectedSecondaryGameTypes = ref<string[]>([]);

      const canSubmitNewPlayer = computed(
        () =>
          !!(
            (selectedPrimaryGameTypes.value.length || selectedSecondaryGameTypes.value.length) &&
            newPlayerName.value.trim().length
          ),
      );

      const openAddPlayerDialog = (startingValue?: string) => {
        selectedPrimaryGameTypes.value = [];
        selectedSecondaryGameTypes.value = [];
        newPlayerName.value = startingValue ?? '';
        isAddPlayerDialogOpen.value = true;
        nextTick(() => {
          if (!newPlayerInputRef.value) return;
          newPlayerInputRef.value.focus();
        });
      };

      const onAddPlayerSubmit = () => {
        if (!canSubmitNewPlayer.value) return;

        const newPlayer: PlayerData = { id: randomId(), name: newPlayerName.value };
        store.players.push(newPlayer);

        const createRequests = (gameIds: Ref<string[]>, isMainRequest: boolean): GameRequestData[] =>
          gameIds.value.map(gameId => ({
            isMainRequest,
            id: randomId(),
            player: newPlayer,
            game: store.games.find(g => g.id === gameId) ?? throwError(),
            timestamp: Date.now(),
            calls: [],
          }));

        const newPrimaryRequests = createRequests(selectedPrimaryGameTypes, true);
        const newSecondaryRequests = createRequests(selectedSecondaryGameTypes, false);
        store.gameRequests.push(...newPrimaryRequests, ...newSecondaryRequests);

        isAddPlayerDialogOpen.value = false;
      };

      const toggleGameType = (gameList: string[], gameId: string) => {
        const idx = gameList.indexOf(gameId);
        if (idx > -1) {
          gameList.splice(idx, 1);
        } else {
          gameList.push(gameId);
        }
      };

      const isGameTypeSelected = (gameList: string[], gameId: string) => gameList.includes(gameId);

      return {
        isAddPlayerDialogOpen,
        newPlayerName,
        newPlayerInputRef,
        openAddPlayerDialog,
        onAddPlayerSubmit,
        toggleGameType,
        isGameTypeSelected,
        selectedPrimaryGameTypes,
        selectedSecondaryGameTypes,
        canSubmitNewPlayer,
      };
    };

    const usePlayerListDialog = (store: MainStore) => {
      const isPlayerListDialogOpen = ref(false);
      const playerListQueryInputRef = ref<HTMLInputElement>();
      const playerListQuery = ref('');
      const normalizedPlayerListQuery = computed(() => playerListQuery.value.trim().toLowerCase());
      const selectedPlayer = ref<PlayerData>();

      const playerListQueryResult = computed(() =>
        normalizedPlayerListQuery.value
          ? store.players.filter(p => p.name.toLowerCase().includes(normalizedPlayerListQuery.value))
          : store.players,
      );

      const openPlayerListDialog = (startingValue?: string) => {
        isPlayerListDialogOpen.value = true;
        playerListQuery.value = startingValue ?? '';
        nextTick(() => {
          if (!playerListQueryInputRef.value) return;
          playerListQueryInputRef.value.focus();
          selectedPlayer.value = playerListQueryResult.value[0];
        });
      };

      return {
        isPlayerListDialogOpen,
        openPlayerListDialog,
        playerListQuery,
        playerListQueryResult,
        playerListQueryInputRef,
        selectedPlayer,
      };
    };

    const useGameRequestPanel = () => {
      const gameRequestPanelRef = ref<OverlayPanel>();
      const selectedGameRequest = ref<GameRequestData>();

      const callGameRequest = (gr: GameRequestData): void => {
        gr.calls.push(Date.now());
      };

      const showGameRequestPanel = (gr: GameRequestData, e: MouseEvent) => {
        const panel = gameRequestPanelRef.value;
        if (!panel) return;
        selectedGameRequest.value = gr;
        panel.hide();
        nextTick(() => panel.show(e));
      };

      const callSelectedGameRequest = () => {
        const panel = gameRequestPanelRef.value;
        const gr = selectedGameRequest.value;
        if (!panel || !gr) return;
        callGameRequest(gr);
        panel.hide();
      };

      return { gameRequestPanelRef, showGameRequestPanel, selectedGameRequest, callSelectedGameRequest };
    };

    const useSaveLoadDialog = (store: MainStore) => {
      const isSaveLoadDialogOpen = ref(false);
      const saveLoadData = ref('');
      const saveLoadErrorText = ref('');

      const openSaveLoadDialog = () => {
        isSaveLoadDialogOpen.value = true;
      };

      const dumpModelData = () => {
        const serializedState = serializeState(store.$state);
        saveLoadData.value = JSON.stringify(serializedState, null, 2);
      };

      const loadModelData = () => {
        try {
          const serializedState = JSON.parse(saveLoadData.value);
          const state = deserializeState(serializedState);
          store.$state = state;
          saveLoadErrorText.value = '';
        } catch (err) {
          console.log(err);
          if (!(err instanceof Error)) return;
          if (err instanceof SyntaxError) {
            const message = `Invalid syntax - ${err.message}`;
            saveLoadErrorText.value = message;
            return;
          }
          saveLoadErrorText.value = err.message;
        }
      };

      return {
        isSaveLoadDialogOpen,
        openSaveLoadDialog,
        saveLoadData,
        saveLoadErrorText,
        dumpModelData,
        loadModelData,
      };
    };

    const useFullscreen = () => {
      const isFullscreenActive = ref(false);

      const onFullscreenChange = () => {
        isFullscreenActive.value = !!fscreen.fullscreenElement;
      };

      // Ideally we'd register and unregister event listeners using lifecycle hooks
      // But for whatever reason I can't get onMounted and onUnmounted to work here

      fscreen.addEventListener('fullscreenchange', onFullscreenChange);

      const toggleFullscreen = () => {
        if (isFullscreenActive.value) {
          fscreen.exitFullscreen();
        } else {
          fscreen.requestFullscreen(document.documentElement);
        }
      };

      return { isFullscreenActive, toggleFullscreen };
    };

    return {
      ...useAddPlayerDialog(store),
      ...usePlayerListDialog(store),
      ...useGameRequestPanel(),
      ...useSaveLoadDialog(store),
      ...useFullscreen(),
      store,
      resetModelData,
      getGameRequestsByGame,
      getGameRequestsByPlayer,
    };
  },
});
</script>

<style lang="scss">
@mixin unselectable {
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
}

.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  padding: 1rem;
}

.dashboard {
  flex-grow: 1;
  display: flex;
}

.games-panel {
  flex-grow: 1;
  background-color: #dddddd;
  overflow-x: scroll;
  overflow-y: hidden;
}

.game-columns {
  display: flex;
  flex-direction: row;
}

.active-calls-sidebar {
  margin-left: 6px;
  width: 200px;
  height: 100%;
}

.game-column {
  display: inline-block;
  width: 240px;
  min-width: 200px;
  height: 100%;

  &:not(:first-child) {
    margin-left: 4px;
  }
}

.game-column-header,
.active-calls-header {
  padding: 1rem 0;
  background-color: #777777;
  color: white;
  text-align: center;

  b {
    font-weight: bold;
  }
}

.game-requests-column {
  display: flex;
  flex-direction: column;
}

.game-request {
  @include unselectable;

  display: block;
  height: 36px;
  width: 100%;
  padding: 4px;
  color: rgb(22, 22, 22);
  font-family: Consolas, 'Courier New', Courier, monospace;
  font-weight: bold;
  margin-top: 4px;
  font-size: 1.05rem;
  cursor: default;

  background-color: #d4d3d3;
  &.main-request {
    background-color: #b3b3b3;
  }
  &.called-request {
    background-color: #84e27b;
  }

  b {
    font-weight: bold;
  }
  &:hover {
    background-color: rgb(139, 32, 139);
  }
}

@mixin action-bar-button {
  padding: 0 2rem;
  border-style: solid;
  border-color: #aaaaaa;

  &:hover {
    background-color: #e7eff1;
  }

  &:active {
    background-color: #d5e0e2;
    transform: translateY(1px);
  }
}

.action-bar {
  background-color: #eeeeee;
  margin-top: 6px;
  padding: 10px 8px;
  height: 52px;
  display: flex;

  input,
  button {
    &:not(:last-child) {
      margin-right: 8px;
    }
  }

  input {
    width: 400px;
    padding-left: 1rem;
  }

  button {
    @include action-bar-button;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.dialog-game-type-columns {
  display: flex;
  width: 100%;
}

.dialog-game-type-column {
  flex-basis: 50%;
  display: flex;
  flex-direction: column;
  margin: 0 2px;
}

.dialog-game-type-select {
  @include unselectable;
  width: 100%;
  padding: 0.5rem;
  background-color: #eeeeee;
  &:not(:last-child) {
    margin-bottom: 4px;
  }
}

.dialog-title {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.dialog-big-input {
  font-size: 1.5rem;
  border-style: none none solid;
  outline: none;
}

.dialog-button {
  @include action-bar-button;
  height: 1.8rem;
}

.save-load-textarea {
  width: 100%;
  height: 14rem;
  resize: vertical;
}
</style>
