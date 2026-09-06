# Estimation Gym

A daily Fermi-estimation puzzle for the [Omarchy](https://omarchy.org) shell bar.

Every calendar day everyone sees the same question - a real-world quantity
you have to estimate ("how many piano tuners are there in Chicago?"), in the
spirit of the classic Fermi problem. You're scored on **order-of-magnitude
closeness** (Bullseye / Close / Ballpark / Off), not exact value, because
getting within a factor of 10 of a hard question is a genuinely useful skill,
and getting the exact number is not the point. Answering builds a daily
streak; after you answer, the widget reveals a decomposition hint showing how
to break the estimate down.

No account, no server, no network calls - the question bank ships with the
plugin and your history/streak live in a local JSON file.

## Screenshot

_(add a screenshot once you've used it for a few days)_

## Install

```bash
mkdir -p ~/.config/omarchy/plugins
git clone https://github.com/SidathPeiris/estimation-gym-omarchy.git ~/.config/omarchy/plugins/estimation-gym
omarchy plugin validate ~/.config/omarchy/plugins/estimation-gym
omarchy plugin enable sidath.estimation-gym
omarchy restart shell
```

For local development, symlink your working copy instead of cloning so edits
take effect on the shell's live-reload:

```bash
ln -s "$(pwd)" ~/.config/omarchy/plugins/estimation-gym
```

## Remove

```bash
omarchy plugin disable sidath.estimation-gym
omarchy plugin remove sidath.estimation-gym
omarchy restart shell
rm -rf ~/.local/state/estimation-gym   # optional: also clears your streak/history
```

## Usage

- Click the bar chip to open today's puzzle.
- Type a numeric guess and press Enter (or click "Go").
- After answering, the panel shows your guess vs. the actual value, how many
  orders of magnitude off you were, a hint for how to decompose the estimate
  next time, and your current/best streak.
- One puzzle per calendar day; the bar chip shows your streak once you've
  answered.

## Develop / test

```bash
node Model.test.js          # scoring/streak/day-selection logic
omarchy plugin validate .   # manifest schema check
qmllint -I /usr/share/omarchy/shell Widget.qml   # QML lint (best-effort; the qs.* shell modules aren't fully resolvable by plain qmllint)
```

State lives at `~/.local/state/estimation-gym/state.json`. Delete it to reset
your streak/history.

## Project layout

```
manifest.json          # plugin id, kind (bar-widget), entry point
Widget.qml             # bar chip + popup panel UI
Model.js               # pure logic: day selection, scoring, streaks (unit-testable with plain node)
Model.test.js
content/
└── questions.js       # the question bank
```

## Dependencies

None beyond Omarchy/Quickshell itself (uses the shared `qs.Ui`/`qs.Commons`
shell components and `Quickshell.Io` for local file persistence). No network
access, no external services, no extra system packages.

## Status

Built for personal daily use; submitted to the
[Omarchy plugin marketplace](https://plugins.omarchy.org) for listing.

## License

MIT
