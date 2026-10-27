// src/admin/pages/accounts/components/charts.jsx
// Dependency-free SVG charts (dummy data friendly). Swap for recharts later if you like.
import { useId, useState } from "react";

const niceMax = (v) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};
const compact = (n) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : `${n}`);
const usd = (v) => `$${Math.round(v).toLocaleString()}`;

const Grid = ({ W, pl, pr, pt, ih, max, ticks = 4 }) =>
  Array.from({ length: ticks + 1 }, (_, i) => {
    const v = (max / ticks) * i;
    const y = pt + ih - (v / max) * ih;
    return (
      <g key={i}>
        <line x1={pl} x2={W - pr} y1={y} y2={y} className="stroke-gray-100 dark:stroke-gray-700" strokeWidth="1" />
        <text x={pl - 8} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize="10">
          ${compact(v)}
        </text>
      </g>
    );
  });

const Tip = ({ x, W, pr, title, rows }) => {
  const w = 150, h = 24 + rows.length * 16;
  const left = Math.min(Math.max(x - w / 2, 4), W - pr - w);
  return (
    <g pointerEvents="none">
      <rect x={left} y={4} width={w} height={h} rx="8" className="fill-gray-900 dark:fill-gray-950" opacity="0.95" />
      <text x={left + 10} y={20} fontSize="10" fontWeight="700" fill="#fff">{title}</text>
      {rows.map((r, i) => (
        <g key={r.name}>
          <circle cx={left + 14} cy={33 + i * 16} r="3" fill={r.color} />
          <text x={left + 22} y={36 + i * 16} fontSize="10" fill="#d1d5db">{r.name}</text>
          <text x={left + w - 10} y={36 + i * 16} fontSize="10" fontWeight="700" textAnchor="end" fill="#fff">{usd(r.value)}</text>
        </g>
      ))}
    </g>
  );
};

/* ---------- Line / area ---------- */
export const LineChart = ({ labels, series, height = 260, area = true }) => {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState(null);
  const W = 720, pl = 48, pr = 14, pt = 14, pb = 26;
  const iw = W - pl - pr, ih = height - pt - pb;
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const x = (i) => pl + (labels.length === 1 ? iw / 2 : (i * iw) / (labels.length - 1));
  const y = (v) => pt + ih - (v / max) * ih;
  const line = (vals) =>
    vals.map((v, i) => {
      if (!i) return `M${x(0)},${y(v)}`;
      const mx = (x(i - 1) + x(i)) / 2;
      return `C${mx},${y(vals[i - 1])} ${mx},${y(v)} ${x(i)},${y(v)}`;
    }).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
      <defs>
        {series.map((s, k) => (
          <linearGradient key={k} id={`${gid}${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      <Grid {...{ W, pl, pr, pt, ih, max }} />
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" className="fill-gray-400">{l}</text>
      ))}
      {series.map((s, k) => (
        <g key={s.name}>
          {area && <path d={`${line(s.values)} L${x(labels.length - 1)},${pt + ih} L${x(0)},${pt + ih} Z`} fill={`url(#${gid}${k})`} />}
          <path d={line(s.values)} fill="none" stroke={s.color} strokeWidth="2.25" strokeLinecap="round" />
        </g>
      ))}
      {hover !== null && (
        <>
          <line x1={x(hover)} x2={x(hover)} y1={pt} y2={pt + ih} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
          {series.map((s) => (
            <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="4" fill="#fff" stroke={s.color} strokeWidth="2" />
          ))}
          <Tip x={x(hover)} W={W} pr={pr} title={labels[hover]} rows={series.map((s) => ({ name: s.name, color: s.color, value: s.values[hover] }))} />
        </>
      )}
      {labels.map((_, i) => (
        <rect key={i} x={x(i) - iw / labels.length / 2} y={pt} width={iw / labels.length} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
      ))}
    </svg>
  );
};

/* ---------- Grouped bars ---------- */
export const BarChart = ({ labels, series, height = 260 }) => {
  const [hover, setHover] = useState(null);
  const W = 720, pl = 48, pr = 14, pt = 14, pb = 26;
  const iw = W - pl - pr, ih = height - pt - pb;
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const band = iw / labels.length;
  const bw = Math.min(22, (band * 0.62) / series.length);
  const cx = (i) => pl + band * i + band / 2;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
      <Grid {...{ W, pl, pr, pt, ih, max }} />
      {labels.map((l, i) => (
        <g key={i}>
          {hover === i && <rect x={pl + band * i} y={pt} width={band} height={ih} className="fill-gray-50 dark:fill-gray-700/30" />}
          {series.map((s, k) => {
            const h = (s.values[i] / max) * ih;
            const bx = cx(i) - (bw * series.length) / 2 + k * bw;
            return <rect key={s.name} x={bx + 1} y={pt + ih - h} width={bw - 2} height={h} rx="3" fill={s.color} />;
          })}
          <text x={cx(i)} y={height - 8} textAnchor="middle" fontSize="10" className="fill-gray-400">{l}</text>
          <rect x={pl + band * i} y={pt} width={band} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
        </g>
      ))}
      {hover !== null && (
        <Tip x={cx(hover)} W={W} pr={pr} title={labels[hover]} rows={series.map((s) => ({ name: s.name, color: s.color, value: s.values[hover] }))} />
      )}
    </svg>
  );
};

/* ---------- Donut ---------- */
export const DonutChart = ({ data, size = 170, thickness = 22, centerTop, centerBottom }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-gray-100 dark:stroke-gray-700" />
        {data.map((d) => {
          const len = Math.max((d.value / total) * c - 2, 0);
          const el = (
            <circle key={d.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
          );
          offset += (d.value / total) * c;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{centerTop}</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">{centerBottom}</span>
      </div>
    </div>
  );
};

/* ---------- Sparkline ---------- */
export const Sparkline = ({ values, color = "#2563eb", height = 32 }) => {
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${height - 3 - ((v - min) / (max - min || 1)) * (height - 6)}`);
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

/* ---------- Horizontal stacked-style bars (aging) ---------- */
export const HBars = ({ items, color = "#2563eb" }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-300">{it.label}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{usd(it.value)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: it.color || color }} />
          </div>
        </div>
      ))}
    </div>
  );
};