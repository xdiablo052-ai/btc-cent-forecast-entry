// btc-cent-forecast-01 entry (Node 22, standard library only).
//
// Forecast for one case: the close 240 minutes after the checkpoint, from the
// case's 4,320 one-minute closes. The model is persistence plus a shrunk,
// capped trend: the mean log-return over each of three lookback windows
// (60, 240 and 1,440 minutes) is extrapolated to the 240-minute horizon,
// the three horizon drifts are averaged, halved, and clamped to +/-0.3%
// before being applied to the last close. On the kit's practice cases
// (scored against the next case's checkpoint close) this cut the mean
// absolute error from $470.55 (pure persistence) to $399.24.
//
//   mkdir -p out && MAKEFUN_INPUT_DIR=input MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const MIN_PRICE = 0.00001;
const MAX_PRICE = 9_999_999.99999;
const HORIZON_MIN = 240;
const WINDOWS = [60, 240, 1440];
const SHRINK = 0.5;
const CAP = 0.003; // the guess never strays more than 0.3% from the last close

interface CaseMarket {
  id: string;
  prices: number[];
}

interface Case {
  markets: CaseMarket[];
}

const price5 = (x: number): number =>
  Math.round(Math.min(MAX_PRICE, Math.max(MIN_PRICE, x)) * 1e5) / 1e5;

/** Mean log-return per minute over the last `w` minutes of `prices`.
 *  A step touching a non-positive or non-finite price is skipped rather than
 *  allowed to poison the average with NaN; with no usable step the drift is 0. */
function meanLogReturn(prices: number[], w: number): number {
  const n = Math.min(w, prices.length - 1);
  let sum = 0;
  let used = 0;
  for (let j = prices.length - n; j < prices.length; j++) {
    const a = prices[j - 1] as number;
    const b = prices[j] as number;
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0) {
      sum += Math.log(b / a);
      used++;
    }
  }
  return used === 0 ? 0 : sum / used;
}

function forecast(m: CaseMarket): number {
  if (!Array.isArray(m.prices) || m.prices.length < 2) {
    throw new Error(`market ${m.id} has too few prices`);
  }
  const last = m.prices[m.prices.length - 1] as number;
  if (typeof last !== 'number' || !Number.isFinite(last) || last <= 0) {
    throw new Error(`market ${m.id}'s last price is not a finite positive number`);
  }
  let drift = 0;
  for (const w of WINDOWS) drift += meanLogReturn(m.prices, w) * HORIZON_MIN;
  drift = (drift / WINDOWS.length) * SHRINK;
  drift = Math.max(-CAP, Math.min(CAP, drift));
  return price5(last * Math.exp(drift));
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const inputs = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.in')).sort();
for (const file of inputs) {
  const id = file.slice(0, -'.in'.length);
  const c = JSON.parse(readFileSync(join(INPUT_DIR, file), 'utf8')) as Case;
  if (!Array.isArray(c.markets) || c.markets.length !== 1) {
    throw new Error(`${file} does not hold exactly one market`);
  }
  const out = { forecasts: [{ case: id, price: forecast(c.markets[0] as CaseMarket) }] };
  writeFileSync(join(OUTPUT_DIR, `${id}.out`), `${JSON.stringify(out)}\n`);
}
