import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Crosshair, Gauge, TrendingUp, WalletCards } from 'lucide-react';
import '../styles/fire.css';

interface ProjectionPoint {
  month: number;
  assets: number;
  contributions: number;
  returns: number;
}

interface FireInputs {
  initialAssets: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  annualReturn: number;
  target: number;
  forecastYears: number;
  timeStepYears: number;
  assetStep: number;
}

const defaults: FireInputs = {
  initialAssets: 200000,
  monthlyIncome: 20000,
  monthlyExpenses: 9000,
  annualReturn: 7,
  target: 5000000,
  forecastYears: 35,
  timeStepYears: 5,
  assetStep: 1000000,
};

const chart = { width: 1200, height: 560, left: 84, right: 30, top: 28, bottom: 58 };

export default function FirePage() {
  const [inputs, setInputs] = useState(defaults);
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'FIRE · 财富自由规划';
    return () => { document.title = previousTitle; };
  }, []);

  const result = useMemo(() => calculateProjection(inputs), [inputs]);
  const visiblePoint = hoverMonth === null
    ? result.points.at(-1) || result.points[0]
    : result.points[Math.min(result.points.length - 1, Math.max(0, hoverMonth))];
  const monthlySurplus = inputs.monthlyIncome - inputs.monthlyExpenses;
  const savingsRate = inputs.monthlyIncome > 0 ? monthlySurplus / inputs.monthlyIncome : 0;
  const passiveMonthlyIncome = Math.max(0, (result.points.at(-1)?.assets || 0) * (inputs.annualReturn / 100) / 12);

  const update = (field: keyof FireInputs, raw: string) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    setInputs((current) => ({ ...current, [field]: value }));
    setHoverMonth(null);
  };

  const inspectChart = (clientX: number) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = ((clientX - bounds.left) / bounds.width) * chart.width;
    const ratio = Math.min(1, Math.max(0, (x - chart.left) / (chart.width - chart.left - chart.right)));
    setHoverMonth(Math.round(ratio * result.durationMonths));
  };

  return (
    <main className="fire-page">
      <header className="fire-header">
        <div className="fire-brand"><TrendingUp size={19} /><span>FIRE</span></div>
        <div className={`fire-status ${result.reached ? 'reached' : ''}`}>
          {result.reached ? `${formatDuration(result.durationMonths)}后达到目标` : `${inputs.forecastYears}年内尚未达到目标`}
        </div>
      </header>

      <section className="fire-overview" aria-label="财富自由概览">
        <div className="fire-primary-stat">
          <span>{hoverMonth === null ? (result.reached ? '目标时间' : '规划期末资产') : `第 ${formatDuration(visiblePoint.month)}`}</span>
          <strong>{hoverMonth === null && result.reached ? formatDuration(result.durationMonths) : formatMoney(visiblePoint.assets)}</strong>
          <small>{hoverMonth === null ? `目标 ${formatMoney(Math.max(1, inputs.target))}` : `本金投入 ${formatMoney(visiblePoint.contributions)} · 收益 ${formatMoney(visiblePoint.returns)}`}</small>
        </div>
        <div className="fire-metrics">
          <Metric icon={<WalletCards />} label="每月结余" value={formatMoney(monthlySurplus)} tone={monthlySurplus >= 0 ? 'positive' : 'negative'} />
          <Metric icon={<Gauge />} label="储蓄率" value={`${(savingsRate * 100).toFixed(1)}%`} />
          <Metric icon={<CalendarDays />} label="预计被动收入" value={`${formatMoney(passiveMonthlyIncome)}/月`} />
        </div>
      </section>

      <ProjectionChart
        ref={svgRef}
        points={result.points}
        target={Math.max(1, inputs.target)}
        durationMonths={result.durationMonths}
        timeStepYears={Math.max(0.25, inputs.timeStepYears)}
        assetStep={Math.max(1, inputs.assetStep)}
        hoverPoint={hoverMonth === null ? null : visiblePoint}
        onPointerMove={inspectChart}
        onPointerLeave={() => setHoverMonth(null)}
      />

      <section className="fire-controls" aria-label="规划参数">
        <div className="fire-control-heading">
          <div><Crosshair size={18} /><strong>规划参数</strong></div>
          <span>所有计算仅保留在当前页面</span>
        </div>
        <div className="fire-input-grid">
          <MoneyInput label="初始资产" value={inputs.initialAssets} onChange={(value) => update('initialAssets', value)} />
          <MoneyInput label="每月收入" value={inputs.monthlyIncome} onChange={(value) => update('monthlyIncome', value)} />
          <MoneyInput label="每月支出" value={inputs.monthlyExpenses} onChange={(value) => update('monthlyExpenses', value)} />
          <NumberInput label="每年年化" value={inputs.annualReturn} suffix="%" step="0.1" min="-99" max="100" onChange={(value) => update('annualReturn', value)} />
          <MoneyInput label="个人目标" value={inputs.target} onChange={(value) => update('target', value)} />
          <NumberInput label="最长规划" value={inputs.forecastYears} suffix="年" min="1" max="100" onChange={(value) => update('forecastYears', value)} />
          <NumberInput label="横轴每格" value={inputs.timeStepYears} suffix="年" step="0.5" min="0.25" onChange={(value) => update('timeStepYears', value)} />
          <NumberInput label="纵轴每格" value={inputs.assetStep} suffix="元" step="10000" min="1" onChange={(value) => update('assetStep', value)} />
        </div>
      </section>

      <footer className="fire-footnote">按月复利、每月末结余投入；结果为规划参考，不构成投资建议。</footer>
    </main>
  );
}

function Metric({ icon, label, value, tone = '' }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return <div className={`fire-metric ${tone}`}>{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function MoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return <NumberInput label={label} value={value} suffix="元" step="1000" onChange={onChange} />;
}

function NumberInput({ label, value, suffix, onChange, step = '1', min, max }: {
  label: string; value: number; suffix: string; onChange: (value: string) => void; step?: string; min?: string; max?: string;
}) {
  return (
    <label className="fire-field">
      <span>{label}</span>
      <div><input type="number" inputMode="decimal" value={value} step={step} min={min} max={max} onChange={(event) => onChange(event.target.value)} /><small>{suffix}</small></div>
    </label>
  );
}

const ProjectionChart = forwardRef<SVGSVGElement, {
    points: ProjectionPoint[]; target: number; durationMonths: number; timeStepYears: number; assetStep: number;
    hoverPoint: ProjectionPoint | null; onPointerMove: (clientX: number) => void; onPointerLeave: () => void;
  }>(function ProjectionChart({ points, target, durationMonths, timeStepYears, assetStep, hoverPoint, onPointerMove, onPointerLeave }, ref) {
    const innerWidth = chart.width - chart.left - chart.right;
    const innerHeight = chart.height - chart.top - chart.bottom;
    const minimumAsset = Math.min(0, ...points.map((point) => point.assets));
    const range = Math.max(1, target - minimumAsset);
    const x = (month: number) => chart.left + (month / Math.max(1, durationMonths)) * innerWidth;
    const y = (assets: number) => chart.top + ((target - Math.min(target, Math.max(minimumAsset, assets))) / range) * innerHeight;
    const line = points.map((point, index) => `${index ? 'L' : 'M'} ${x(point.month).toFixed(2)} ${y(point.assets).toFixed(2)}`).join(' ');
    const area = `${line} L ${x(durationMonths)} ${chart.top + innerHeight} L ${chart.left} ${chart.top + innerHeight} Z`;
    const timeTicks = createTicks(0, durationMonths, Math.max(1, Math.round(timeStepYears * 12)));
    const assetTicks = createAssetTicks(minimumAsset, target, assetStep);
    const hoverX = hoverPoint ? x(hoverPoint.month) : 0;
    const hoverY = hoverPoint ? y(hoverPoint.assets) : 0;

    return (
      <section className="fire-chart-wrap" aria-label="资产增长折线图">
        <svg ref={ref} className="fire-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img"
          onPointerMove={(event) => onPointerMove(event.clientX)} onPointerLeave={onPointerLeave}>
          <title>资产随时间增长的预测曲线</title>
          {assetTicks.map((tick) => <g key={`y-${tick}`}><line className="grid-line" x1={chart.left} x2={chart.width - chart.right} y1={y(tick)} y2={y(tick)} /><text className={tick === target ? 'target-tick' : ''} x={chart.left - 14} y={y(tick) + 5} textAnchor="end">{formatCompactMoney(tick)}</text></g>)}
          {timeTicks.map((tick) => <g key={`x-${tick}`}><line className="grid-line vertical" x1={x(tick)} x2={x(tick)} y1={chart.top} y2={chart.top + innerHeight} /><text x={x(tick)} y={chart.height - 20} textAnchor="middle">{formatAxisTime(tick)}</text></g>)}
          <line className="target-line" x1={chart.left} x2={chart.width - chart.right} y1={chart.top} y2={chart.top} />
          <path className="asset-area" d={area} />
          <path className="asset-line" d={line} />
          {hoverPoint && <g className="chart-cursor"><line x1={hoverX} x2={hoverX} y1={chart.top} y2={chart.top + innerHeight} /><circle cx={hoverX} cy={hoverY} r="7" /></g>}
        </svg>
        <div className="chart-legend"><span><i className="legend-assets" />资产</span><span><i className="legend-target" />个人目标</span></div>
      </section>
    );
  });

function calculateProjection(inputs: FireInputs) {
  const target = Math.max(1, inputs.target);
  const maximumMonths = Math.max(12, Math.min(1200, Math.round(inputs.forecastYears * 12)));
  const monthlyReturn = Math.pow(Math.max(0.01, 1 + inputs.annualReturn / 100), 1 / 12) - 1;
  const monthlyContribution = inputs.monthlyIncome - inputs.monthlyExpenses;
  const points: ProjectionPoint[] = [{ month: 0, assets: inputs.initialAssets, contributions: inputs.initialAssets, returns: 0 }];
  let assets = inputs.initialAssets;
  let contributions = inputs.initialAssets;
  let reached = assets >= target;
  let month = 0;
  while (month < maximumMonths && !reached) {
    month += 1;
    assets = assets * (1 + monthlyReturn) + monthlyContribution;
    contributions += monthlyContribution;
    points.push({ month, assets, contributions, returns: assets - contributions });
    reached = assets >= target;
  }
  return { points, reached, durationMonths: month };
}

function createTicks(start: number, end: number, step: number) {
  const ticks = [start];
  for (let value = start + step; value < end && ticks.length < 60; value += step) ticks.push(value);
  if (end !== start) ticks.push(end);
  return ticks;
}

function createAssetTicks(minimum: number, target: number, step: number) {
  const safeStep = Math.max(1, step);
  const ticks: number[] = [];
  const start = Math.floor(minimum / safeStep) * safeStep;
  for (let value = start; value < target && ticks.length < 60; value += safeStep) ticks.push(value);
  if (!ticks.includes(target)) ticks.push(target);
  return ticks;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value);
}

function formatCompactMoney(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absolute >= 100000000) return `${sign}${(absolute / 100000000).toFixed(1)}亿`;
  if (absolute >= 10000) return `${sign}${(absolute / 10000).toFixed(0)}万`;
  return `${Math.round(value)}`;
}

function formatDuration(months: number) {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (!years) return `${remainder}个月`;
  return remainder ? `${years}年${remainder}个月` : `${years}年`;
}

function formatAxisTime(months: number) {
  if (months === 0) return '现在';
  const years = months / 12;
  return Number.isInteger(years) ? `${years}年` : `${years.toFixed(1)}年`;
}
