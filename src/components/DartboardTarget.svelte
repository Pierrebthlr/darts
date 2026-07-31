<script lang="ts">
  import { buildTargetZones } from '../lib/dartboardMath';
  import { MULT_LABEL } from '../lib/gameLogic';

  export let onThrow: (mult: number, val: number, cx: number, cy: number) => void;

  const data = buildTargetZones();

  function zoneLabel(val: number, mult: number): string {
    if (val === 25) return mult === 2 ? 'Bull double' : 'Bull';
    return `${MULT_LABEL[mult]} ${val}`;
  }

  function fire(e: MouseEvent | KeyboardEvent, val: number, mult: number) {
    const r = (e.currentTarget as Element).getBoundingClientRect();
    onThrow(mult, val, r.left + r.width / 2, r.top + r.height / 2);
  }
</script>

<svg viewBox="0 0 350 350" width="100%" style="display:block;max-width:320px;margin:0 auto 12px;touch-action:manipulation;">
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
    on:click={(e) => fire(e, 25, 2)}
    on:keypress={(e) => fire(e, 25, 2)}
  />
  {#each data.labels as label}
    <text x={label.x} y={label.y} text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#9ca3af">{label.text}</text>
  {/each}
</svg>
