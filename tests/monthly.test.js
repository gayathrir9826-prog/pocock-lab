import { test } from "node:test";
import assert from "node:assert/strict";
import { monthlyTotals } from "../site/src/monthly.js";

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
