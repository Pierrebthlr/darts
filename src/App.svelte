<script lang="ts">
  import { onMount } from 'svelte';
  import { app } from './lib/store';
  import { fetchMatches } from './lib/firebase';
  import { setCanvas, resizeCanvas } from './lib/effects';
  import Setup from './components/Setup.svelte';
  import GameScreen from './components/GameScreen.svelte';
  import WinScreen from './components/WinScreen.svelte';
  import Leaderboard from './components/Leaderboard.svelte';
  import PlayerStats from './components/PlayerStats.svelte';

  async function loadKnownNames() {
    try {
      const matches = await fetchMatches(300);
      const names = new Set<string>();
      const leagues = new Set<string>();
      matches.forEach((m: any) => {
        (m.players || []).forEach((p: any) => {
          if (p.name) names.add(p.name);
        });
        leagues.add(m.league || 'Général');
      });
      app.update((s) => ({ ...s, knownNames: Array.from(names).sort(), knownLeagues: Array.from(leagues).sort() }));
    } catch (e) {
      console.error('loadKnownNames failed', e);
    }
  }

  onMount(() => {
    const canvas = document.getElementById('fx') as HTMLCanvasElement;
    setCanvas(canvas);
    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);
    loadKnownNames();
    return () => window.removeEventListener('resize', onResize);
  });

  $: screen = $app.screen;
  $: gamePhase = $app.game?.phase;
</script>

{#if screen === 'setup'}
  <Setup />
{:else if screen === 'leaderboard'}
  <Leaderboard />
{:else if screen === 'playerstats'}
  <PlayerStats />
{:else if $app.game && gamePhase === 'won'}
  <WinScreen />
{:else}
  <GameScreen />
{/if}
