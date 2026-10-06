import { test } from "node:test";
import assert from "node:assert/strict";
import { monthlyTotals, lineChartLayout } from "../site/src/monthly.js";

test("monthlyTotals sums a City's Daily ride counts within a Month", () => {
  const rows = [
    { date: "2026-07-01", city: "Boston", rides: "10" },
    { date: "2026-07-02", city: "Boston", rides: 15 },
  ];
  assert.deepEqual(monthlyTotals(rows), {
    months: [{ key: "2026-07", label: "Jul 2026" }],
    series: [{ city: "Boston", totals: [25] }],
  });
});

test("monthlyTotals gives one series per City, alphabetically, and Months in date order", () => {
  const rows = [
    { date: "2026-08-03", city: "Miami", rides: "5" },
    { date: "2026-07-01", city: "Miami", rides: "1" },
    { date: "2026-08-01", city: "Boston", rides: "4" },
    { date: "2026-07-31", city: "Boston", rides: "2" },
  ];
  assert.deepEqual(monthlyTotals(rows), {
    months: [
      { key: "2026-07", label: "Jul 2026" },
      { key: "2026-08", label: "Aug 2026" },
    ],
    series: [
      { city: "Boston", totals: [2, 4] },
      { city: "Miami", totals: [1, 5] },
    ],
  });
});

test("monthlyTotals marks a Missing month as null, not zero", () => {
  const rows = [
    { date: "2026-07-01", city: "Boston", rides: "3" },
    { date: "2026-08-01", city: "Denver", rides: "7" },
    { date: "2026-09-01", city: "Boston", rides: "9" },
  ];
  assert.deepEqual(monthlyTotals(rows).series, [
    { city: "Boston", totals: [3, null, 9] },
    { city: "Denver", totals: [null, 7, null] },
  ]);
});

test("monthlyTotals labels Months from the date text across a year boundary", () => {
  const rows = [
    { date: "2027-01-01", city: "Boston", rides: "1" },
    { date: "2026-12-31", city: "Boston", rides: "1" },
  ];
  assert.deepEqual(monthlyTotals(rows).months, [
    { key: "2026-12", label: "Dec 2026" },
    { key: "2027-01", label: "Jan 2027" },
  ]);
});

test("monthlyTotals of no rows has no Months and no series", () => {
  assert.deepEqual(monthlyTotals([]), { months: [], series: [] });
});

const size = { width: 600, height: 300 };
const julToSep = [
  { key: "2026-07", label: "Jul 2026" },
  { key: "2026-08", label: "Aug 2026" },
  { key: "2026-09", label: "Sep 2026" },
];

test("lineChartLayout puts y ticks from 0 at the plot bottom to a rounded maximum at the top", () => {
  const monthly = { months: julToSep, series: [{ city: "Miami", totals: [4881, 5071, 4759] }] };
  const { plot, yTicks } = lineChartLayout(monthly, size);
  assert.deepEqual(yTicks.map((t) => t.value), [0, 2000, 4000, 6000]);
  assert.equal(yTicks[0].y, plot.bottom);
  assert.equal(yTicks[3].y, plot.top);
  assert.equal(yTicks[1].y - yTicks[2].y, yTicks[2].y - yTicks[3].y);
});

test("lineChartLayout spaces Months evenly across the plot and places each Monthly total by value", () => {
  const monthly = { months: julToSep, series: [{ city: "Boston", totals: [0, 3000, 6000] }] };
  const { plot, series, xTicks } = lineChartLayout(monthly, size);
  const middleX = (plot.left + plot.right) / 2;
  assert.deepEqual(xTicks, [
    { label: "Jul 2026", x: plot.left },
    { label: "Aug 2026", x: middleX },
    { label: "Sep 2026", x: plot.right },
  ]);
  assert.deepEqual(
    series[0].points.map(({ x, y, value }) => ({ x, y, value })),
    [
      { x: plot.left, y: plot.bottom, value: 0 },
      { x: middleX, y: (plot.top + plot.bottom) / 2, value: 3000 },
      { x: plot.right, y: plot.top, value: 6000 },
    ],
  );
  assert.equal(series[0].city, "Boston");
});

test("lineChartLayout leaves a Missing month out and breaks the line there", () => {
  const monthly = {
    months: julToSep,
    series: [
      { city: "Boston", totals: [5, null, 6] },
      { city: "Denver", totals: [null, 5, 6] },
    ],
  };
  const [boston, denver] = lineChartLayout(monthly, size).series;
  assert.deepEqual(boston.points.map((p) => p.value), [5, 6]);
  assert.deepEqual(boston.segments.map((s) => s.map((p) => p.value)), [[5], [6]]);
  assert.deepEqual(denver.points.map((p) => p.value), [5, 6]);
  assert.deepEqual(denver.segments.map((s) => s.map((p) => p.value)), [[5, 6]]);
});

test("lineChartLayout labels each point with City, Month and Monthly total for its tooltip", () => {
  const monthly = { months: julToSep, series: [{ city: "Boston", totals: [3907, 4044, null] }] };
  const [boston] = lineChartLayout(monthly, size).series;
  assert.deepEqual(boston.points.map((p) => p.label), ["Boston, Jul 2026: 3,907", "Boston, Aug 2026: 4,044"]);
});

test("lineChartLayout with a single Month centres one point per City", () => {
  const monthly = {
    months: [{ key: "2026-07", label: "Jul 2026" }],
    series: [
      { city: "Boston", totals: [3907] },
      { city: "Denver", totals: [2645] },
    ],
  };
  const { plot, series, xTicks } = lineChartLayout(monthly, size);
  const middleX = (plot.left + plot.right) / 2;
  assert.deepEqual(xTicks, [{ label: "Jul 2026", x: middleX }]);
  assert.deepEqual(series.map((s) => s.points.map((p) => p.x)), [[middleX], [middleX]]);
});
