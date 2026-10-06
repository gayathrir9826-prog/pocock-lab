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
  const months = [...keys].sort();
  return {
    months: months.map((key) => ({ key, label: monthLabel(key) })),
    series: [...byCity.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((city) => ({ city, totals: months.map((key) => byCity.get(city).get(key) ?? null) })),
  };
}
