<script lang="ts">
  import { app, pushHistory, popHistory } from '../lib/store';
  import { advanceTurn, applyThrow, applyManualScore, CRICKET_NUMS, ALL_NUMS, MARKS, MULT_COLOR, MULT_LABEL } from '../lib/gameLogic';
  import { findCheckout, formatDart } from '../lib/checkout';
  import { triggerBullEffect, trigger180Effect, toast } from '../lib/celebrations';
  import { recordMatch } from '../lib/firebase';
  import DartboardTarget from './DartboardTarget.svelte';
  import type { GameState } from '../lib/types';

  $: g = $app.game as GameState;
  $: p = g.players[g.cur];

  function throwDart(mult: number, val: number, cx?: number, cy?: number) {
    pushHistory(g);
    const result = applyThrow(g, mult, val);
    if (result.bullHit) triggerBullEffect(mult, cx, cy);
    if (result.scored180) trigger180Effect(cx, cy);
    if (result.matchWon) recordMatch(result.next);
    app.update((s) => ({ ...s, game: result.next, mult: 1 }));
  }

  function onNumClick(e: MouseEvent, n: number) {
    const target = e.currentTarget as HTMLElement;
    const r = target.getBoundingClientRect();
    throwDart($app.mult, n, r.left + r.width / 2, r.top + r.height / 2);
  }

  function pass() {
    pushHistory(g);
    const lastTurn = {
      name: p.name,
      throws: g.throws,
      pts: g.throws.reduce((s, t) => s + t.pts, 0),
      scoreAfter: p.score,
      busted: false
    };
    app.update((s) => ({ ...s, game: advanceTurn({ ...g, lastTurn }), mult: 1 }));
  }

  function undo() {
    const prev = popHistory();
    if (!prev) return;
    app.update((s) => ({ ...s, game: prev, inputMode: 'buttons', manualVal: '', mult: 1 }));
  }

  function confirmManual() {
    const pts = parseInt($app.manualVal, 10);
    if (isNaN(pts) || pts < 0 || pts > 180) {
      alert('Score invalide (0–180)');
      return;
    }
    pushHistory(g);
    const result = applyManualScore(g, pts);
    if (result.scored180) trigger180Effect(window.innerWidth / 2, window.innerHeight / 2);
    if (result.matchWon) recordMatch(result.next);
    app.update((s) => ({ ...s, game: result.next, inputMode: 'buttons', manualVal: '', mult: 1 }));
  }

  function quit() {
    app.update((s) => ({ ...s, game: null, screen: 'setup' }));
  }

  // Manual round-score entry replaces the whole round at once, so switching into it
  // must undo any darts already thrown this turn via buttons/target — otherwise their
  // score effect would double up with the manual total.
  function setInputMode(mode: 'buttons' | 'target' | 'manual') {
    if (mode === $app.inputMode) return;
    let game = g;
    if (mode === 'manual' && g.throws.length) {
      for (let i = 0; i < g.throws.length; i++) {
        const prev = popHistory();
        if (prev) game = prev;
      }
    }
    app.update((s) => ({ ...s, game, inputMode: mode, manualVal: '', mult: 1 }));
  }

  $: dartsLeft = g.mode === '501' ? 3 - g.throws.length : 0;
  $: checkoutSeq = g.mode === '501' && dartsLeft > 0 ? findCheckout(p.score, dartsLeft) : null;
  $: modeLabel = g.mode === '501' ? '🎯 501' : g.cutthroat ? '☠️ Cutthroat' : '🦗 Cricket';
  $: effectiveInputMode = g.mode === 'cricket' && $app.inputMode === 'manual' ? 'buttons' : $app.inputMode;
  $: bullDisabled = $app.mult === 3;
  $: bullHit = $toast != null && $toast.val === 25 && $toast.kind === 'bull';
</script>

<div class="screen">
  <div class="g-header">
    <span>{modeLabel}</span>
    <button class="quit-btn" on:click={quit}>✕ Quitter</button>
  </div>

  {#if g.mode === '501'}
    <div class="sb501">
      <div class="round-lbl">Round {g.round}</div>
      <div class="sb501-players">
        {#each g.players as pl, i}
          <div class="sb-card" class:active={i === g.cur}>
            <div class="sb-name">{i === g.cur ? '🎯 ' : ''}{pl.name}</div>
            <div class="sb-score">{pl.score}</div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="sbcr">
      <div class="round-lbl">Round {g.round}</div>
      <table>
        <thead>
          <tr>
            <th>N°</th>
            {#each g.players as pl, i}
              <th class:active={i === g.cur}>{i === g.cur ? '🎯 ' : ''}{pl.name}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each CRICKET_NUMS as num}
            {@const closed = g.players.every((pl) => (pl.marks?.[num] || 0) >= 3)}
            <tr class:closed>
              <td>{num === 25 ? 'Bull' : num}</td>
              {#each g.players as pl}
                {@const m = Math.min(3, pl.marks?.[num] || 0)}
                <td class:mark-closed={m >= 3}>{MARKS[m]}</td>
              {/each}
            </tr>
          {/each}
          <tr class="pts-row">
            <td>Pts</td>
            {#each g.players as pl, i}
              <td class:active={i === g.cur}>{pl.score}</td>
            {/each}
          </tr>
        </tbody>
      </table>
    </div>
  {/if}

  <div class="turn-hint">
    Tour de <b>{p.name}</b>{#if g.mode === '501' && g.throws.length > 0} · reste {p.score}{/if}
    {#if checkoutSeq}
      <div class="finish-hint">⚡ Finish : {checkoutSeq.map(formatDart).join(' ')}</div>
    {/if}
  </div>

  {#if g.lastTurn}
    <div class="last-turn-hint" class:busted={g.lastTurn.busted}>
      Dernier tour · <b>{g.lastTurn.name}</b> :
      {g.lastTurn.throws.length ? g.lastTurn.throws.map((t) => formatDart(t)).join(' ') : `${g.lastTurn.pts} pts`}
      {#if g.lastTurn.busted}
        · BUST (score inchangé)
      {:else if g.lastTurn.throws.length}
        · {g.lastTurn.pts} pts
      {/if}
    </div>
  {/if}

  <div class="mode-row">
    <button class="mode-btn" class:active={effectiveInputMode === 'buttons'} on:click={() => setInputMode('buttons')}>🔢 Boutons</button>
    <button class="mode-btn" class:active={effectiveInputMode === 'target'} on:click={() => setInputMode('target')}>🎯 Cible</button>
    {#if g.mode === '501'}
      <button class="mode-btn" class:active={effectiveInputMode === 'manual'} on:click={() => setInputMode('manual')}>✏️ Manuel</button>
    {/if}
  </div>

  {#if effectiveInputMode === 'manual'}
    <input
      class="manual-input"
      type="number"
      inputmode="numeric"
      placeholder="Score du round (0–180)"
      bind:value={$app.manualVal}
    />
    <button class="win-btn primary" on:click={confirmManual}>✓ Valider</button>
  {:else}
    <div class="slots">
      {#each [0, 1, 2] as i}
        {@const t = g.throws[i]}
        {#if t}
          <div class="slot filled" style="border-color:{MULT_COLOR[t.mult] || '#374151'}">
            <div class="slot-mult">{MULT_LABEL[t.mult] || ''}</div>
            <div class="slot-val">{t.val === 25 ? 'Bull' : t.val === 0 ? 'Miss' : t.val}</div>
            {#if t.pts > 0}<div class="slot-pts">+{t.pts}</div>{/if}
          </div>
        {:else}
          <div class="slot empty"><div class="slot-dash">—</div></div>
        {/if}
      {/each}
    </div>

    {#if effectiveInputMode === 'buttons'}
      <div class="mult-row">
        {#each [1, 2, 3] as m}
          <button
            class="mult-btn"
            style="background:{$app.mult === m ? MULT_COLOR[m] : '#1f2937'}"
            on:click={() => app.update((s) => ({ ...s, mult: m }))}
          >{MULT_LABEL[m]}</button>
        {/each}
      </div>

      <div class="num-grid">
        {#each ALL_NUMS.filter((n) => n !== 25) as n}
          {@const isCr = g.mode === 'cricket' && CRICKET_NUMS.indexOf(n) >= 0}
          {@const isHit180 = n === 20 && $toast != null && $toast.val === 20 && $toast.kind === '180'}
          <button
            class="num-btn"
            class:cricket-target={isCr}
            class:hit180={isHit180}
            on:click={(e) => onNumClick(e, n)}
          >{n}</button>
        {/each}
        <button
          class="num-btn bull"
          class:cricket-target={g.mode === 'cricket'}
          class:hit={bullHit}
          class:disabled={bullDisabled}
          disabled={bullDisabled}
          on:click={(e) => onNumClick(e, 25)}
        >Bull</button>
        <button class="miss-btn" on:click={() => throwDart(1, 0)}>Miss 0</button>
      </div>
    {:else}
      <DartboardTarget onThrow={throwDart} />
      <button class="miss-btn-solo" on:click={() => throwDart(1, 0)}>Miss 0</button>
    {/if}
  {/if}

  <div class="action-row">
    <button class="action-btn" on:click={undo}>↩ Annuler</button>
    <button class="action-btn" on:click={pass}>⏭ Passer</button>
  </div>

  {#if $toast}
    <div class="fx-toast" class:toast-180={$toast.kind === '180'}>{$toast.label}</div>
  {/if}
</div>
