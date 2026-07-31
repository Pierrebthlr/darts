<script lang="ts">
  import { buildHeatboardData } from '../lib/dartboardMath';
  import { MULT_LABEL } from '../lib/gameLogic';
  import type { DartLogEntry } from '../lib/types';

  export let throwsList: DartLogEntry[] = [];

  $: data = buildHeatboardData(throwsList);

  type Zone = { val: number; mult: number; count: number };

  let pinned: Zone | null = null;
  let hovered: Zone | null = null;
  $: active = pinned ?? hovered;

  function sameZone(a: Zone | null, b: Zone) {
    return !!a && a.val === b.val && a.mult === b.mult;
  }

  function toggle(zone: Zone) {
    pinned = sameZone(pinned, zone) ? null : zone;
  }

  function zoneLabel(zone: Zone): string {
    if (zone.val === 25) return zone.mult === 2 ? 'Bull double' : 'Bull';
    return `${MULT_LABEL[zone.mult]} ${zone.val}`;
  }

  $: activeText = active
    ? `${zoneLabel(active)} — ${active.count} fléchette${active.count > 1 ? 's' : ''}${
        data.total ? ` (${Math.round((active.count / data.total) * 100)}%)` : ''
      }`
    : 'Touchez une zone du plateau pour voir le détail';
</script>

<svg viewBox="0 0 350 350" width="100%" style="display:block;max-width:320px;margin:0 auto 12px;">
  {#each data.bands as band}
    <path
      d={band.d}
      fill={band.fill}
      stroke="#030712"
      stroke-width="0.5"
      style="cursor:pointer"
      role="button"
      tabindex="0"
      aria-label={`${zoneLabel(band)} : ${band.count} fléchette${band.count > 1 ? 's' : ''}`}
      on:mouseenter={() => (hovered = band)}
      on:mouseleave={() => (hovered = null)}
      on:click={() => toggle(band)}
      on:keypress={() => toggle(band)}
    />
  {/each}
  <circle
    cx={data.cx}
    cy={data.cy}
    r={data.rBullOut}
    fill={data.outerBullFill}
    stroke="#030712"
    stroke-width="0.5"
    style="cursor:pointer"
    role="button"
    tabindex="0"
    aria-label={`Bull : ${data.outerBullCount} fléchette${data.outerBullCount > 1 ? 's' : ''}`}
    on:mouseenter={() => (hovered = { val: 25, mult: 1, count: data.outerBullCount })}
    on:mouseleave={() => (hovered = null)}
    on:click={() => toggle({ val: 25, mult: 1, count: data.outerBullCount })}
    on:keypress={() => toggle({ val: 25, mult: 1, count: data.outerBullCount })}
  />
  <circle
    cx={data.cx}
    cy={data.cy}
    r={data.rBullIn}
    fill={data.innerBullFill}
    style="cursor:pointer"
    role="button"
    tabindex="0"
    aria-label={`Bull double : ${data.innerBullCount} fléchette${data.innerBullCount > 1 ? 's' : ''}`}
    on:mouseenter={() => (hovered = { val: 25, mult: 2, count: data.innerBullCount })}
    on:mouseleave={() => (hovered = null)}
    on:click={() => toggle({ val: 25, mult: 2, count: data.innerBullCount })}
    on:keypress={() => toggle({ val: 25, mult: 2, count: data.innerBullCount })}
  />
  {#each data.labels as label}
    <text x={label.x} y={label.y} text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#9ca3af">{label.text}</text>
  {/each}
</svg>

<div class="zone-caption" class:active={!!active}>{activeText}</div>

<style>
  .zone-caption {
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    min-height: 1.4em;
    margin: -6px 0 12px;
  }
  .zone-caption.active {
    color: #e5e7eb;
  }
</style>
