<script lang="ts">
  import { app } from '../lib/store';
  import Sparkline from './Sparkline.svelte';
  import DartboardHeatmap from './DartboardHeatmap.svelte';

  function close() {
    app.update((s) => ({ ...s, screen: 'leaderboard' }));
  }

  $: name = $app.statsPlayer as string;
  $: lb = $app.leaderboard;

  $: bounced = (() => {
    if (!lb || !lb.matches || !lb.matches.length) {
      app.update((s) => ({ ...s, screen: 'leaderboard' }));
      return true;
    }
    return false;
  })();

  $: league = lb?.selectedLeague || (lb?.matches?.[0] as any)?.league || 'Général';

  $: matches = bounced
    ? []
    : (lb!.matches as any[]).filter((m) => (m.league || 'Général') === league && m.players.some((p: any) => p.name === name));

  $: m501 = matches.filter((m: any) => m.mode === '501');
  $: wins501 = m501.filter((m: any) => m.winnerName === name).length;

  $: stats501 = (() => {
    let totalPts = 0;
    let totalDarts = 0;
    let bestFinish: number | null = null;
    const trend: number[] = [];
    m501
      .slice()
      .reverse()
      .forEach((m: any) => {
        const me = m.players.find((p: any) => p.name === name);
        if (me && me.darts > 0) {
          const scored = 501 - me.score;
          totalPts += scored;
          totalDarts += me.darts;
          trend.push((scored / me.darts) * 3);
        }
        if (m.winnerName === name && m.winnerCheckout != null && (bestFinish === null || m.winnerCheckout > bestFinish)) {
          bestFinish = m.winnerCheckout;
        }
      });
    const avg3 = totalDarts > 0 ? (totalPts / totalDarts) * 3 : null;
    return { avg3, bestFinish, trend };
  })();

  $: mCr = matches.filter((m: any) => m.mode === 'cricket');
  $: winsCr = mCr.filter((m: any) => m.winnerName === name).length;

  $: mpr = (() => {
    let totalMarks = 0;
    let totalCrDarts = 0;
    mCr.forEach((m: any) => {
      const me = m.players.find((p: any) => p.name === name);
      if (me) {
        totalMarks += me.totalMarks || 0;
        totalCrDarts += me.darts || 0;
      }
    });
    return totalCrDarts > 0 ? totalMarks / (totalCrDarts / 3) : null;
  })();

  $: myThrows = matches.reduce((acc: any[], m: any) => acc.concat((m.throws || []).filter((t: any) => t.name === name)), []);
  $: missCount = myThrows.filter((t: any) => !t.val).length;
</script>

{#if !bounced}
  <div class="screen">
    <div class="g-header">
      <span>👤 {name}</span>
      <button class="quit-btn" on:click={close}>✕ Fermer</button>
    </div>

    <div class="lb-section-title">Statistiques · {league}</div>

    {#if m501.length}
      <div class="rule-box">
        <div>🎯 501 — {m501.length} partie{m501.length > 1 ? 's' : ''} jouées, {wins501} gagnées ({Math.round((wins501 / m501.length) * 100)}%)</div>
        {#if stats501.avg3 != null}<div>Moyenne 3 fléchettes : {stats501.avg3.toFixed(1)}</div>{/if}
        {#if stats501.bestFinish != null}<div>Meilleur finish : {stats501.bestFinish}</div>{/if}
      </div>
    {:else}
      <div class="rule-box">Aucune partie 501 dans cette ligue.</div>
    {/if}

    {#if stats501.trend.length > 1}
      <div class="lb-section-title">Tendance moyenne 3 fléchettes</div>
      <Sparkline values={stats501.trend} />
    {/if}

    {#if mCr.length}
      <div class="rule-box">
        <div>🦗 Cricket — {mCr.length} partie{mCr.length > 1 ? 's' : ''} jouées, {winsCr} gagnées ({Math.round((winsCr / mCr.length) * 100)}%)</div>
        {#if mpr != null}<div>MPR (marques par round) : {mpr.toFixed(2)}</div>{/if}
      </div>
    {:else}
      <div class="rule-box">Aucune partie Cricket dans cette ligue.</div>
    {/if}

    <div class="lb-section-title">Zones chaudes</div>
    {#if myThrows.length}
      <DartboardHeatmap throwsList={myThrows} />
      <div class="lb-split">
        Basé sur {myThrows.length} fléchette{myThrows.length > 1 ? 's' : ''} enregistrée{myThrows.length > 1 ? 's' : ''}{missCount ? ` · ${missCount} manquée${missCount > 1 ? 's' : ''}` : ''}
      </div>
    {:else}
      <div class="rule-box">Pas encore de données de précision pour ce joueur — cette fonctionnalité vient d'être activée, elle se remplira avec les prochaines parties.</div>
    {/if}
  </div>
{/if}
