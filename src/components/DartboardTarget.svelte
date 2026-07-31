<script lang="ts">
  import { buildTargetZones } from '../lib/dartboardMath';
  import { MULT_LABEL } from '../lib/gameLogic';

  export let onThrow: (mult: number, val: number, cx: number, cy: number) => void;

  const data = buildTargetZones();

  let hoveredLabel: string | null = null;

  function zoneLabel(val: number, mult: number): string {
    if (val === 25) return mult === 2 ? 'Bull double' : 'Bull';
    return `${MULT_LABEL[mult]} ${val}`;
  }

  function preview(val: number, mult: number) {
    hoveredLabel = zoneLabel(val, mult);
  }

  function clearPreview() {
    hoveredLabel = null;
  }

  function fire(e: MouseEvent | KeyboardEvent, val: number, mult: number) {
    const r = (e.currentTarget as Element).getBoundingClientRect();
    onThrow(mult, val, r.left + r.width / 2, r.top + r.height / 2);
  }
</script>

<svg viewBox="0 0 350 350" width="100%" style="display:block;max-width:320px;margin:0 auto 8px;touch-action:manipulation;">
  {#each data.bands as band}
    <path
      d={band.d}
      fill={band.fill}
      stroke="#030712"
      stroke-width="0.5"
      style="cursor:pointer"
      role="button"
      tabindex="0"
      aria-label={zoneLabel(band.val, band.mult)}
      on:pointerenter={() => preview(band.val, band.mult)}
      on:pointerleave={clearPreview}
      on:focus={() => preview(band.val, band.mult)}
      on:blur={clearPreview}
      on:click={(e) => fire(e, band.val, band.mult)}
      on:keypress={(e) => fire(e, band.val, band.mult)}
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
    aria-label={zoneLabel(25, 1)}
    on:pointerenter={() => preview(25, 1)}
    on:pointerleave={clearPreview}
    on:focus={() => preview(25, 1)}
    on:blur={clearPreview}
    on:click={(e) => fire(e, 25, 1)}
    on:keypress={(e) => fire(e, 25, 1)}
  />
  <circle
    cx={data.cx}
    cy={data.cy}
    r={data.rBullIn}
    fill={data.innerBullFill}
    style="cursor:pointer"
    role="button"
    tabindex="0"
    aria-label={zoneLabel(25, 2)}
    on:pointerenter={() => preview(25, 2)}
    on:pointerleave={clearPreview}
    on:focus={() => preview(25, 2)}
    on:blur={clearPreview}
    on:click={(e) => fire(e, 25, 2)}
    on:keypress={(e) => fire(e, 25, 2)}
  />
  {#each data.labels as label}
    <text x={label.x} y={label.y} text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#9ca3af">{label.text}</text>
  {/each}
</svg>

<div class="target-caption" class:active={!!hoveredLabel}>{hoveredLabel ?? 'Survolez ou touchez une zone pour viser'}</div>

<style>
  .target-caption {
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    min-height: 1.4em;
    margin: -4px 0 12px;
  }
  .target-caption.active {
    color: #e5e7eb;
    font-weight: bold;
  }
</style>
