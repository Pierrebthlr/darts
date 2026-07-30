<script lang="ts">
  import { app } from '../lib/store';
  import { init501, initCricket } from '../lib/gameLogic';

  function addPlayer() {
    app.update((s) => ({ ...s, names: [...s.names, `Joueur ${s.names.length + 1}`] }));
  }
  function removePlayer(i: number) {
    app.update((s) => (s.names.length > 1 ? { ...s, names: s.names.filter((_, idx) => idx !== i) } : s));
  }
  function start() {
    app.update((s) => {
      const names = s.names.filter((n) => n.trim());
      const league = (s.league || '').trim() || 'Général';
      const knownLeagues = s.knownLeagues.indexOf(league) < 0 ? [...s.knownLeagues, league] : s.knownLeagues;
      const knownNames = [...s.knownNames];
      names.forEach((n) => {
        if (knownNames.indexOf(n) < 0) knownNames.push(n);
      });
      const game = s.mode === '501' ? init501(names, league) : initCricket(names, s.cutthroat, league);
      return { ...s, game, screen: 'game', mult: 1, history: [], knownLeagues, knownNames };
    });
  }
  function openLeaderboard() {
    app.update((s) => ({ ...s, leaderboard: null, screen: 'leaderboard' }));
  }
</script>

<div class="screen">
  <div class="logo"><img src="{import.meta.env.BASE_URL}logo.png" alt="Darty Crousty" /></div>

  <div class="mode-row">
    <button class="mode-btn" class:active={$app.mode === '501'} on:click={() => app.update((s) => ({ ...s, mode: '501' }))}>🎯 501</button>
    <button class="mode-btn" class:active={$app.mode === 'cricket'} on:click={() => app.update((s) => ({ ...s, mode: 'cricket' }))}>🦗 Cricket</button>
  </div>

  <div class="player-row">
    <input type="text" list="known-leagues" placeholder="Ligue (ex : Amis, Travail)" bind:value={$app.league} />
  </div>

  {#if $app.mode === 'cricket'}
    <div class="cutthroat-row">
      <label class="cutthroat-label">
        <input type="checkbox" bind:checked={$app.cutthroat} />
        ☠️ Variante Cutthroat
      </label>
    </div>
    <div class="rule-box">
      {#if $app.cutthroat}
        ☠️ Cutthroat : fermez 15–20 et Bull (3 touches chacun). Vos points en trop sont infligés aux adversaires qui n'ont pas fermé le numéro. Gagne celui qui ferme tout avec le score le plus BAS.
      {:else}
        Fermez 15–20 et Bull (3 touches chacun). Marquez des points sur vos numéros fermés tant que l'adversaire ne les a pas fermés. Gagne celui qui ferme tout avec le score le plus haut.
      {/if}
    </div>
  {/if}

  {#each $app.names as name, i}
    <div class="player-row">
      <input type="text" list="known-players" bind:value={$app.names[i]} />
      <button class="rm-btn" on:click={() => removePlayer(i)}>✕</button>
    </div>
  {/each}

  {#if $app.names.length < 6}
    <button class="add-btn" on:click={addPlayer}>+ Ajouter un joueur</button>
  {/if}

  <button class="start-btn" on:click={start}>Commencer</button>
  <button class="win-btn secondary" on:click={openLeaderboard}>🏆 Classement</button>

  <datalist id="known-players">
    {#each $app.knownNames as n}<option value={n} />{/each}
  </datalist>
  <datalist id="known-leagues">
    {#each $app.knownLeagues as n}<option value={n} />{/each}
  </datalist>
</div>
