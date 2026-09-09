# Estimation Gym

**A daily Fermi-estimation puzzle for the [Omarchy](https://omarchy.org) shell
bar. One question a day, scored on how close you get in powers of ten.**

Every calendar day everyone sees the same question — a real-world quantity you
have to estimate, like *"how many piano tuners work in Chicago?"* You are scored
on **order-of-magnitude closeness**, not the exact value, because getting within
a factor of ten of a hard question is a genuinely useful skill and getting the
number exactly right is not the point.

**No account, no server, and no network calls of any kind.** The question bank
ships with the plugin and your history lives in a single local file. Nothing
about your play ever leaves your machine, because nothing here ever connects to
anything.

![Estimation Gym: the guess panel with a hint revealed, the scored result with its history strip and stats, and the bar chip](preview.png)

## Install

```bash
omarchy plugin add https://github.com/SidathPeiris/estimation-gym-omarchy.git --enable
omarchy restart shell
```

The restart is the part that matters — the running shell keeps serving the
previous version until it reloads. (It refuses to run while the session is
locked, so unlock first.)

## Using it

- The bar chip shows 🎯 **Guess** until you have answered; afterwards it shows
  the band you scored and your current streak, e.g. 🎯 **Bullseye · x7**.
- Click the chip to open today's puzzle. Type a number and press Enter, or click
  **Go**. Scientific notation like `3e12` works for big numbers.
- After answering you get your guess against the real value, how many orders of
  magnitude off you were, the points earned, how to decompose the estimate next
  time, where the figure comes from, and your streak.
- Expand **Stats** for lifetime totals: band distribution, days played, best
  streak, median distance off, and — once you have played ten days — which way
  you lean, e.g. *"You tend to guess low, by about 3.8×"*. Knowing your
  direction of error is the part you can actually correct.

## How scoring works

Most useful estimation is not about precision, it is about not being wrong by
1000×. Scoring in *decades* (powers of ten) rewards the skill that transfers:
decomposing an unknown quantity into things you roughly know, and
sanity-checking the size of the answer.

| Band | How close | Points |
| --- | --- | --- |
| **Bullseye** | within ~2× | 100 |
| **Close** | within 10× | 70 |
| **Ballpark** | within 100× | 40 |
| **Off** | more than 100× out | 10 |

Anything better than **Off** extends your streak; an **Off** resets it to zero.
Your best streak is kept alongside the current one.

## Hints

Stuck? **Hint** tells you how to attack that *shape* of problem — "stock equals
flow times lifetime", "people times per-person rate", "mass to moles to
molecules" — without saying anything about the answer, so you still do the
estimating.

Taking it halves the day's points and leaves the day out of your calibration,
but deliberately does **not** break your streak: the streak measures showing up,
and charging someone for wanting to learn the method would be the wrong
incentive.

## The daily question

- The question is picked from the calendar date, the same trick Wordle uses, so
  everyone gets the same one on a given day with no server involved.
- There are **500 questions**, drawn in a shuffled order that cycles through the
  whole bank before anything repeats — nearly a year and a half before you see
  one twice.
- Questions whose answer drifts carry a year, shown as *"as of 2025"* above the
  prompt, so answers do not silently go stale. That also makes the same quantity
  at different dates a genuinely different puzzle: world population in 1800,
  1900, 1950 and 2025 teaches growth rates.
- One puzzle per calendar day, and answering is idempotent — a shell restart
  cannot double-count a day or inflate your streak.

## Also on your phone

The same puzzle runs as an installable web app:

**<https://sidathpeiris.github.io/estimation-gym-app/>**

It shows the same question on the same day and scores it identically. Install it
to your home screen and it plays offline.

Streaks are kept **independently** on each device. Nothing syncs, and this
plugin never talks to the app — its no-network guarantee is unconditional.

## Update

```bash
omarchy plugin update sidath.estimation-gym
omarchy restart shell
```

## Remove

```bash
omarchy plugin disable sidath.estimation-gym
omarchy plugin remove sidath.estimation-gym
omarchy restart shell
rm -rf ~/.local/state/estimation-gym   # optional: also clears your streak/history
```

## Requirements

Nothing beyond Omarchy/Quickshell itself. No network access, no external
services, no extra system packages.

Your streak and history live at `~/.local/state/estimation-gym/state.json`.
Delete that file to start over.

## License

MIT

---

*Got a good question for the bank? [Suggest one](https://github.com/SidathPeiris/estimation-gym-omarchy/issues/new?template=suggest-a-question.yml).*
