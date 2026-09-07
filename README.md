# Estimation Gym

A daily Fermi-estimation puzzle for the [Omarchy](https://omarchy.org) shell bar.

Every calendar day everyone sees the same question — a real-world quantity you
have to estimate ("how many piano tuners are there in Chicago?"), in the spirit
of the classic Fermi problem. You're scored on **order-of-magnitude closeness**,
not exact value, because getting within a factor of 10 of a hard question is a
genuinely useful skill and getting the exact number is not the point.

The bar chip shows today's status and your streak. Click it, type a number, and
the panel tells you how close you were in powers of ten — then reveals a
decomposition hint showing how to break the estimate down next time, plus where
the real figure comes from.

No account, no server, no network calls — the question bank ships with the
plugin and your history/streak live in a single local JSON file.

## Screenshot

![Estimation Gym: the guess panel, the scored result, and the bar chip](preview.png)

## Why order-of-magnitude

Most useful estimation isn't about precision, it's about not being wrong by
1000×. Scoring in *decades* (powers of ten) rewards the skill that actually
transfers: decomposing an unknown quantity into things you roughly know, and
sanity-checking the size of the answer.

| Band | Distance from the true value | Meaning |
| --- | --- | --- |
| **Bullseye** | ≤ 0.3 decades | within ~2× |
| **Close** | ≤ 1 decade | within 10× |
| **Ballpark** | ≤ 2 decades | within 100× |
| **Off** | > 2 decades | more than 100× out |

Anything better than **Off** extends your streak; an **Off** resets it to zero.
Your best streak is kept alongside the current one.

## How the daily puzzle works

- The puzzle number is derived from the calendar date (day 0 = 2024-01-01 UTC),
  the same trick Wordle uses — so everyone on a given day gets the same question
  with no server involved.
- Questions are drawn from the bundled bank of **39** using a deterministic
  seeded shuffle. The whole bank is cycled through before anything repeats, and
  each pass reshuffles.
- One puzzle per calendar day. Answering is idempotent — a shell restart can't
  double-count a day or inflate your streak.

## Install

```bash
omarchy plugin add https://github.com/SidathPeiris/estimation-gym-omarchy.git --enable
omarchy restart shell
```

This clones the repo into `~/.config/omarchy/plugins/sidath.estimation-gym`
and enables it. For local development, symlink your working copy instead so
edits take effect on the shell's live-reload:

```bash
ln -s "$(pwd)" ~/.config/omarchy/plugins/estimation-gym
omarchy plugin enable sidath.estimation-gym
```

## Remove

```bash
omarchy plugin disable sidath.estimation-gym
omarchy plugin remove sidath.estimation-gym
omarchy restart shell
rm -rf ~/.local/state/estimation-gym   # optional: also clears your streak/history
```

## Usage

- The bar chip shows 🎯 **Guess** until you've answered; afterwards it shows the
  band you scored and your current streak (e.g. 🎯 **Bullseye · x7**).
- Click the chip to open today's puzzle. Type a numeric guess and press Enter
  (or click "Go"). Scientific notation like `3e12` works for big numbers.
- After answering, the panel shows your guess against the actual value, how many
  orders of magnitude off you were, a hint for how to decompose the estimate next
  time, the source of the figure, and your current/best streak.

## Develop / test

```bash
node Model.test.js          # scoring/streak/day-selection logic
omarchy plugin validate .   # manifest schema check
qmllint -I /usr/share/omarchy/shell Widget.qml   # QML lint (best-effort; the qs.* shell modules aren't fully resolvable by plain qmllint)
```

`Model.js` is deliberately free of QML/Quickshell imports so the scoring, streak
and day-selection logic can be unit tested with plain `node`.

State lives at `~/.local/state/estimation-gym/state.json`. Delete it to reset
your streak/history.

## Project layout

```
manifest.json          # plugin id, kind (bar-widget), entry point
Widget.qml             # bar chip + popup panel UI
Model.js               # pure logic: day selection, scoring, streaks (unit-testable with plain node)
Model.test.js
preview.png            # marketplace listing preview
content/
└── questions.js       # the question bank
```

## Dependencies

None beyond Omarchy/Quickshell itself (uses the shared `qs.Ui`/`qs.Commons`
shell components and `Quickshell.Io` for local file persistence). No network
access, no external services, no extra system packages.

## Status

Built for personal daily use; listed in the
[Omarchy plugin marketplace](https://plugins.omarchy.org/plugin.html?id=sidath.estimation-gym).

## License

MIT
