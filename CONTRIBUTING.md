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
- **Tagged with a reasoning archetype.** `strategy` says what *shape* of
  problem it is. Pick the closest one from the table below; if nothing fits,
  `decompose` is the honest default and never wrong.

## Format

```js
{
  "id": "pianos-in-japan",              // kebab-case, unique across the bank
  "prompt": "How many pianos are there in Japan?",
  "asOf": 2025,                          // optional - see below
  "unit": "pianos",                      // reads after the number
  "answerValue": 2000000,                // positive number
  "decompositionHint": "Japan's population is about 125 million, roughly one household in twenty owns a piano, and a household averages about 2.3 people.",
  "strategy": "population-rate",          // see the table below
  "source": "Japanese musical instrument industry surveys"
}
```

### Add to the end, never the middle

**New questions go at the bottom of the file.** Do not insert, reorder or
delete existing entries.

The bank's array order *is* the calendar: the question for a given day is read
straight off the array. Appending is therefore free — it extends the schedule
by one more day at the far end and moves nothing. Inserting a question in the
middle would shift every question after it onto a different date, including
days people have already played.

`questions.test.js` pins the order of the questions already scheduled, so an
accidental reorder fails the tests rather than quietly rewriting everyone's
calendar. Correcting a value, a typo or a source on an existing question is
fine and does not trip it — only moving entries does.

### The `strategy` archetype

Every question names the shape of reasoning it wants. This drives the **Hint**
button: guidance is written once per archetype, in `Model.js`, rather than once
per question — a dozen texts to keep correct instead of five hundred, and what
it teaches transfers, because recognising that a problem is population-times-rate
helps with every such problem rather than only today's.

The guidance never mentions the answer, only the method, so a player who takes
the hint still has to do the estimating. Taking it halves the points for that
day and keeps the day out of calibration; it does not touch the streak.

Pick the closest match. `node questions.test.js` rejects anything not in this
list, so a typo fails loudly rather than silently falling back.

| `strategy` | The move it wants |
| --- | --- |
| `decompose` | Split into two or three factors you can each guess, then multiply |
| `chain-multiply` | A product of several estimated quantities |
| `rate-time` | A rate sustained over a span of time |
| `population-rate` | How many people, times how often each does the thing |
| `divide-total` | Estimate a total, divide by the size of one unit |
| `area-density` | Area or volume, times how densely it is packed |
| `volume-packing` | Container volume over item volume |
| `unit-conversion` | Chained conversion factors, no real-world guess needed |
| `stock-flow` | Stock equals flow times lifetime |
| `energy-balance` | Energy per unit, times how many units |
| `molar` | Mass to moles to molecules via Avogadro's number |
| `exponential` | Repeated doubling or halving; count the doublings |
| `combinatorial` | Counting arrangements rather than measuring |
| `anchor-scale` | Anchor on a known size, then scale by a ratio |
| `recall-sanity` | A half-remembered figure, magnitude-checked |

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

## Running the tests

These moved here out of the README, which is now for people playing the puzzle
rather than working on it.

```bash
node Model.test.js          # scoring, streaks, day selection, calibration
node questions.test.js      # bank schema, magnitudes, duplicate prompts
omarchy plugin validate .   # manifest schema check
qmllint -I /usr/share/omarchy/shell Widget.qml
```

`qmllint` is best-effort: the `qs.*` shell modules are not fully resolvable by
plain qmllint, so import warnings about `qs.Ui`, `qs.Commons`, `Panel` and
friends are expected. What matters is that it reports no errors.

## Project layout

```
manifest.json          # plugin id, kind (bar-widget), entry point
Widget.qml             # bar chip + popup panel UI
Model.js               # pure logic: day selection, scoring, streaks, stats, calibration
Model.test.js
questions.test.js      # question bank validation
preview.png            # marketplace listing preview
content/
└── questions.js       # the question bank
```

State lives at `~/.local/state/estimation-gym/state.json`. Delete it to reset a
streak while testing.

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
