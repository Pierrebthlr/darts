<script lang="ts">
  import { app } from '../lib/store';
  import { fetchMatches } from '../lib/firebase';

  function load() {
    app.update((s) => ({ ...s, leaderboard: { loading: true, matches: null, error: null } }));
    fetchMatches(300)
      .then((matches) => {
        app.update((s) => ({ ...s, leaderboard: { loading: false, matches, error: null } }));
      })
      .catch((e) => {
        app.update((s) => ({ ...s, leaderboard: { loading: false, matches: null, error: e.message } }));
      });
  }

  $: if (!$app.leaderboard) load();

  function openPlayer(name: string) {
    app.update((s) => ({ ...s, statsPlayer: name, screen: 'playerstats' }));
  }
  function close() {
    app.update((s) => ({ ...s, screen: 'setup' }));
  }
  function selectLeague(l: string) {
    app.update((s) => (s.leaderboard ? { ...s, leaderboard: { ...s.leaderboard, selectedLeague: l } } : s));
  }
  function setH2h(which: 'h2hA' | 'h2hB', name: string) {
    app.update((s) => (s.leaderboard ? { ...s, leaderboard: { ...s.leaderboard, [which]: name } } : s));
  }
  function onH2hAChange(e: Event) {
    setH2h('h2hA', (e.target as HTMLSelectElement).value);
  }
  function onH2hBChange(e: Event) {
    setH2h('h2hB', (e.target as HTMLSelectElement).value);
  }

  $: lb = $app.leaderboard;
  $: allMatches = lb?.matches ?? [];

  $: leagues = (() => {
    const set: string[] = [];
    allMatches.forEach((m: any) => {
      const l = m.league || 'Général';
      if (set.indexOf(l) < 0) set.push(l);
    });
    return set.sort();
  })();

  $: selectedLeague =
    lb && (!lb.selectedLeague || leagues.indexOf(lb.selectedLeague) < 0) && allMatches.length
      ? allMatches[0].league || 'Général'
      : lb?.selectedLeague;

  $: matches = allMatches.filter((m: any) => (m.league || 'Général') === selectedLeague);

  $: aggregation = (() => {
    const wins: Record<string, { total: number; '501': number; cricket: number; cutthroat: number }> = {};
    let bestCheckout501: any = null;
    let bestCheckoutCricket: any = null;
    matches.forEach((m: any) => {
      const key = m.mode === 'cricket' && m.cutthroat ? 'cutthroat' : m.mode;
      if (!wins[m.winnerName]) wins[m.winnerName] = { total: 0, '501': 0, cricket: 0, cutthroat: 0 };
      wins[m.winnerName].total++;
      (wins[m.winnerName] as any)[key] = ((wins[m.winnerName] as any)[key] || 0) + 1;
      if (m.mode === '501' && m.winnerDarts > 0 && (!bestCheckout501 || m.winnerDarts < bestCheckout501.winnerDarts)) bestCheckout501 = m;
      if (m.mode === 'cricket' && m.winnerDarts > 0 && (!bestCheckoutCricket || m.winnerDarts < bestCheckoutCricket.winnerDarts)) bestCheckoutCricket = m;
    });
    const ranking = Object.keys(wins)
      .map((name) => ({ name, ...wins[name] }))
      .sort((a, b) => b.total - a.total);
    return { ranking, bestCheckout501, bestCheckoutCricket };
  })();

  $: allNames = (() => {
    const set: string[] = [];
    matches.forEach((m: any) => m.players.forEach((p: any) => { if (set.indexOf(p.name) < 0) set.push(p.name); }));
    return set.sort();
  })();

  $: h2hA = lb && allNames.length >= 2 ? (lb.h2hA && allNames.indexOf(lb.h2hA) >= 0 ? lb.h2hA : allNames[0]) : undefined;
  $: h2hB =
    lb && allNames.length >= 2
      ? lb.h2hB && allNames.indexOf(lb.h2hB) >= 0 && lb.h2hB !== h2hA
        ? lb.h2hB
        : allNames.filter((n) => n !== h2hA)[0] || allNames[1]
      : undefined;
  $: h2hMatches =
    h2hA && h2hB
      ? matches.filter(
          (m: any) => m.players.length === 2 && m.players.some((p: any) => p.name === h2hA) && m.players.some((p: any) => p.name === h2hB)
        )
      : [];
  $: h2hWinsA = h2hMatches.filter((m: any) => m.winnerName === h2hA).length;
  $: h2hWinsB = h2hMatches.filter((m: any) => m.winnerName === h2hB).length;

  function formatDate(m: any) {
    return m.createdAt && m.createdAt.toDate
      ? m.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '';
  }
  function playersLine(m: any) {
    return m.players.map((p: any) => p.name + (p.name === m.winnerName ? ' 🏆' : '')).join(', ');
  }
  function modeLabel(m: any) {
    return m.mode === '501' ? '501' : m.cutthroat ? 'Cutthroat' : 'Cricket';
  }
</script>

<div class="screen">
  <div class="g-header">
    <span>🏆 Classement</span>
    <button class="quit-btn" on:click={close}>✕ Fermer</button>
  </div>

  {#if !lb || lb.loading}
    <div class="rule-box">Chargement…</div>
  {:else if lb.error}
    <div class="rule-box">Erreur de chargement : {lb.error}</div>
  {:else if !allMatches.length}
    <div class="rule-box">Aucune partie enregistrée pour l'instant.</div>
  {:else}
    {#if leagues.length > 1}
      <div class="mode-row">
        {#each leagues as l}
          <button class="mode-btn" class:active={l === selectedLeague} on:click={() => selectLeague(l)}>{l}</button>
        {/each}
      </div>
    {/if}

    <div class="lb-section-title">Classement général · {selectedLeague}</div>
    <div class="lb-table">
      {#each aggregation.ranking as r, i}
        <div class="lb-row" style="cursor:pointer" on:click={() => openPlayer(r.name)} on:keypress={() => openPlayer(r.name)} role="button" tabindex="0">
          <div class="lb-row-top">
            <div class="lb-rank">{i + 1}</div>
            <div class="lb-name">{r.name}</div>
            <div class="lb-wins">{r.total} 🏆</div>
          </div>
          <div class="lb-split">501 : {r['501']} · Cricket : {r.cricket}{r.cutthroat ? ` · Cutthroat : ${r.cutthroat}` : ''}</div>
        </div>
      {/each}
    </div>

    {#if aggregation.bestCheckout501 || aggregation.bestCheckoutCricket}
      <div class="lb-section-title">Records</div>
      <div class="rule-box">
        {#if aggregation.bestCheckout501}
          <div>⚡ Finish 501 le plus rapide : {aggregation.bestCheckout501.winnerName} en {aggregation.bestCheckout501.winnerDarts} fléchettes</div>
        {/if}
        {#if aggregation.bestCheckoutCricket}
          <div>🦗 Cricket le plus rapide : {aggregation.bestCheckoutCricket.winnerName} en {aggregation.bestCheckoutCricket.winnerDarts} fléchettes</div>
        {/if}
      </div>
    {/if}

    {#if allNames.length >= 2}
      <div class="lb-section-title">Face-à-face</div>
      <div class="h2h-row">
        <select value={h2hA} on:change={onH2hAChange}>
          {#each allNames as n}<option value={n}>{n}</option>{/each}
        </select>
        <span class="h2h-vs">vs</span>
        <select value={h2hB} on:change={onH2hBChange}>
          {#each allNames as n}<option value={n}>{n}</option>{/each}
        </select>
      </div>
      <div class="h2h-result">
        {#if h2hMatches.length}
          {h2hA} {h2hWinsA} — {h2hWinsB} {h2hB} ({h2hMatches.length} match{h2hMatches.length > 1 ? 's' : ''})
        {:else}
          Aucune confrontation directe pour l'instant.
        {/if}
      </div>
    {/if}

    <div class="lb-section-title">Historique récent</div>
    <div class="lb-history">
      {#each matches.slice(0, 20) as m}
        <div class="lb-history-row">
          <div class="lb-history-date">{formatDate(m)} · {modeLabel(m)}</div>
          <div class="lb-history-players">{playersLine(m)}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>
