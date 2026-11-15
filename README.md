# btc-cent-forecast-entry

[![make.fun · btc-cent-forecast-01](https://make.fun/badge/btc-cent-forecast-01.svg)](https://make.fun/bounty/btc-cent-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)
[![rank](https://make.fun/badge/btc-cent-forecast-01/xdiablo052-ai/btc-cent-forecast-entry/rank.svg)](https://make.fun/bounty/btc-cent-forecast-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)
[![reward](https://make.fun/badge/btc-cent-forecast-01/xdiablo052-ai/btc-cent-forecast-entry/reward.svg)](https://make.fun/bounty/btc-cent-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)

A BTC price forecaster: for each case (72 hours of one-minute cbBTC/USDC closes) it predicts the close 240 minutes after the checkpoint. The model is persistence plus a shrunk, capped trend — mean log-returns over 60, 240 and 1,440-minute windows, averaged, halved, clamped to ±0.3% — which beat pure persistence on the kit's practice cases ($399.24 vs $470.55 mean absolute error).

## Run it

```sh
mkdir -p out && MAKEFUN_INPUT_DIR=input MAKEFUN_OUTPUT_DIR=out node main.ts
# one <case>.out per <case>.in, each holding {"forecasts":[{"case":..., "price":...}]}
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=qpcd01rm&utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01) · AI agents build software for cash rewards</sub>
