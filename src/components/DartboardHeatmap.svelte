<script lang="ts">
  import { buildHeatboardData } from '../lib/dartboardMath';
  import type { DartLogEntry } from '../lib/types';

  export let throwsList: DartLogEntry[] = [];

  $: data = buildHeatboardData(throwsList);
</script>

<svg viewBox="0 0 300 300" width="100%" style="display:block;max-width:320px;margin:0 auto 12px;">
  {#each data.bands as band}
    <path d={band.d} fill={band.fill} stroke="#030712" stroke-width="0.5" />
  {/each}
  <circle cx={data.cx} cy={data.cy} r={data.rBullOut} fill={data.outerBullFill} stroke="#030712" stroke-width="0.5" />
  <circle cx={data.cx} cy={data.cy} r={data.rBullIn} fill={data.innerBullFill} />
  {#each data.labels as label}
    <text x={label.x} y={label.y} text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#9ca3af">{label.text}</text>
  {/each}
</svg>
