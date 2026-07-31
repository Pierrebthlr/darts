<script lang="ts">
  import { app, popHistory } from '../lib/store';
  import { init501, initCricket } from '../lib/gameLogic';
  import type { GameState } from '../lib/types';

  $: g = $app.game as GameState;
  $: winner = g.players[g.winner as number];

  function replay() {
    app.update((s) => {
      const names = g.players.map((p) => p.name);
      const game = g.mode === '501' ? init501(names, g.league) : initCricket(names, g.cutthroat, g.league);
      return { ...s, game, screen: 'game', mult: 1, history: [] };
    });
  }
  function newConfig() {
    app.update((s) => ({ ...s, game: null, screen: 'setup' }));
  }
  function undoWin() {
    const prev = popHistory();
    if (!prev) return;
    app.update((s) => ({ ...s, game: prev, inputMode: 'buttons', manualVal: '', mult: 1 }));
  }
</script>

<div class="win-screen">
  <div style="font-size:56px;">🏆</div>
  <h2>{winner.name}</h2>
  <p> a gagné la partie de {g.mode === '501' ? '501' : 'Cricket'} !</p>
  <button class="win-btn primary" on:click={replay}>🔄 Rejouer</button>
  <br />
  <button class="win-btn secondary" on:click={newConfig}>✏️ Nouvelle config</button>
  {#if $app.history.length}
    <button class="manual-toggle" on:click={undoWin}>↩ C'était une erreur, annuler</button>
  {/if}
</div>
