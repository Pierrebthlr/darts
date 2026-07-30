<script lang="ts">
  export let values: number[] = [];

  const w = 280;
  const h = 40;
  const pad = 4;

  $: lo = values.length ? (Math.min(...values) === Math.max(...values) ? Math.min(...values) - 1 : Math.min(...values)) : 0;
  $: hi = values.length ? (Math.min(...values) === Math.max(...values) ? Math.max(...values) + 1 : Math.max(...values)) : 1;
  $: range = hi - lo;
  $: points = values
    .map((v, i) => {
      const x = pad + (values.length > 1 ? i / (values.length - 1) : 0.5) * (w - 2 * pad);
      const y = h - pad - ((v - lo) / range) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
</script>

<svg viewBox="0 0 {w} {h}" width="100%" height={h} style="display:block;margin-bottom:12px;">
  <polyline {points} fill="none" stroke="#60a5fa" stroke-width="2" />
</svg>
