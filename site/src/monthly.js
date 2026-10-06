// Monthly totals of ride rows: [{ date, city, rides }, ...] with rides as strings or numbers.

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-07" -> "Jul 2026", read from the text so time zones cannot shift the Month.
function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

export function monthlyTotals(rows) {
  const byCity = new Map();
  const keys = new Set();
  for (const row of rows) {
    const key = row.date.slice(0, 7);
    keys.add(key);
    if (!byCity.has(row.city)) byCity.set(row.city, new Map());
    const totals = byCity.get(row.city);
    totals.set(key, (totals.get(key) ?? 0) + Number(row.rides));
  }
  const monthKeys = [...keys].sort();
  return {
    months: monthKeys.map((key) => ({ key, label: monthLabel(key) })),
    series: [...byCity.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((city) => ({ city, totals: monthKeys.map((key) => byCity.get(city).get(key) ?? null) })),
  };
}

// The page's SVG viewBox; pass it to lineChartLayout so both agree.
export const CHART_SIZE = { width: 600, height: 300 };

// Room around the plot for axis labels.
const MARGIN = { top: 20, right: 40, bottom: 40, left: 60 };

// Smallest step of 1, 2 or 5 x 10^n that covers max in at most 5 intervals.
function tickStep(max) {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max / 5));
  return [1, 2, 5, 10].map((m) => m * magnitude).find((step) => max / step <= 5);
}

// SVG geometry for monthlyTotals(rows) drawn in a width x height box.
export function lineChartLayout(monthly, { width, height }) {
  const plot = {
    left: MARGIN.left,
    top: MARGIN.top,
    right: width - MARGIN.right,
    bottom: height - MARGIN.bottom,
  };
  const knownTotals = monthly.series.flatMap((s) => s.totals).filter((t) => t !== null);
  const largest = Math.max(0, ...knownTotals);
  const step = tickStep(largest);
  const intervals = Math.max(1, Math.ceil(largest / step));
  const axisMax = step * intervals;
  const y = (value) => plot.bottom - (value / axisMax) * (plot.bottom - plot.top);

  const yTicks = [];
  for (let i = 0; i <= intervals; i++) yTicks.push({ value: i * step, y: y(i * step) });

  // Months run edge to edge; a lone Month sits in the middle.
  const count = monthly.months.length;
  const x = (i) =>
    count === 1 ? (plot.left + plot.right) / 2 : plot.left + (i * (plot.right - plot.left)) / (count - 1);
  const xTicks = monthly.months.map(({ label }, i) => ({ label, x: x(i) }));

  // A Missing month has no point and ends the current segment.
  const series = monthly.series.map(({ city, totals }) => {
    const points = [];
    const segments = [];
    let segment = [];
    totals.forEach((value, i) => {
      if (value === null) {
        if (segment.length > 0) segments.push(segment);
        segment = [];
        return;
      }
      const label = `${city}, ${monthly.months[i].label}: ${value.toLocaleString("en-US")}`;
      const point = { x: x(i), y: y(value), value, label };
      points.push(point);
      segment.push(point);
    });
    if (segment.length > 0) segments.push(segment);
    return { city, points, segments };
  });

  return { plot, yTicks, xTicks, series };
}
