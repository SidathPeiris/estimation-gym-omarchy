# Contributing

The most useful thing you can add is **questions**. The bank is a plain data
file, so adding one needs no build tooling and no knowledge of QML.

Two ways in:

- **No git required** — open a
  [question suggestion issue](../../issues/new?template=suggest-a-question.yml)
  and someone will turn it into a pull request.
- **Pull request** — edit `content/questions.js` directly, following the format
  below.

## What makes a good question

The point of the game is *estimation*, not recall. A good question can be
reasoned to within an order of magnitude by someone who has never seen the
figure, by breaking it into things they roughly know.

- **Answerable by decomposition.** "How many piano tuners work in Chicago?"
  is good: population, pianos per household, tunings per year. "What year was
  the Eiffel Tower built?" is not - you either know it or you don't.
- **Right to within an order of magnitude.** Scoring is logarithmic and
  forgiving of small errors, but an answer that is wrong by 10x marks a
  *correct* guess as wrong, which quietly discredits the whole scoring system.
  This is the one thing worth being careful about.
- **Honestly sourced.** A published figure is ideal. Where there isn't one,
  say so plainly: "Order-of-magnitude estimate from typical office typing
  patterns" is a perfectly good source. Please don't invent citations.
- **A hint that teaches.** `decompositionHint` is shown *after* answering and
  is the part that makes someone better next time. Explain the route to the
  answer, not the answer.

## Format

```js
{
  "id": "pianos-in-japan",              // kebab-case, unique across the bank
  "prompt": "How many pianos are there in Japan?",
  "asOf": 2025,                          // optional - see below
  "unit": "pianos",                      // reads after the number
  "answerValue": 2000000,                // positive number
  "decompositionHint": "Japan's population is about 125 million, roughly one household in twenty owns a piano, and a household averages about 2.3 people.",
  "source": "Japanese musical instrument industry surveys"
}
```

### The `asOf` year

Set it when the answer **drifts over time** — populations, prices, device
counts, annual production. The UI shows it as "as of 2025" above the question,
so the answer stays correct instead of silently going stale.

Leave it off for fixed quantities. Writing "as of 2025" above *how many atoms
are in a human body* would wrongly imply the number moves.

Dating also means the same quantity at different dates is a **legitimately
different question**. World population in 1800, 1900, 1950 and 2025 are four
separate puzzles that teach growth rates, and the duplicate detector knows to
ignore pairs that differ only by year.

Negative years are BCE, so historical questions are welcome.

## Before you open a pull request

```bash
node questions.test.js   # schema, magnitudes, duplicate prompts
node Model.test.js       # only needed if you touched scoring logic
```

Both are plain node with no dependencies. CI runs them on every pull request.

`questions.test.js` will reject a missing field, a duplicate or malformed id, an
implausible magnitude, an out-of-range year, a prompt that isn't a question, a
hint too short to teach anything, and near-duplicate prompts.

## Changing the widget

There is no automated test for `Widget.qml` — QML needs a running Omarchy
shell. If you change it, please run it in a real shell and say in the pull
request what you checked.

Symlinking your working copy into `~/.config/omarchy/plugins/` saves you
reinstalling, but the shell does **not** hot-reload an edit — run
`omarchy restart shell` after each change, and note it refuses to run while the
session is locked.

`Model.js` is deliberately free of QML imports so all the logic stays testable
with plain node. Please keep it that way: logic in `Model.js` with tests,
presentation in `Widget.qml`.

## A note on the web app

The [companion web app](https://github.com/SidathPeiris/estimation-gym-app)
vendors `Model.js` and `content/questions.js` from this repo verbatim. **This
repo is the source of truth** — question changes belong here, and the app picks
them up with its own sync script.
