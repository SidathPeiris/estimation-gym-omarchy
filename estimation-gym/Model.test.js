const assert = require("node:assert/strict")
const Model = require("./Model.js")

// --- dayIndex ---
assert.equal(Model.dayIndex(new Date(Date.UTC(2024, 0, 1))), 0)
assert.equal(Model.dayIndex(new Date(Date.UTC(2024, 0, 2))), 1)
assert.equal(Model.dayIndex(new Date(Date.UTC(2023, 11, 31))), -1)

// --- question selection: deterministic, covers full bank before repeating ---
const bank = ["a", "b", "c", "d", "e"]
const seenInFirstPass = new Set()
for (let day = 0; day < bank.length; day++) {
  const idx = Model.pickQuestionIndex(day, bank.length)
  assert.ok(idx >= 0 && idx < bank.length, "index in range")
  assert.ok(!seenInFirstPass.has(idx), "no repeat within first pass")
  seenInFirstPass.add(idx)
}
assert.equal(seenInFirstPass.size, bank.length, "every question seen exactly once in a full pass")

// Same day always yields the same index (determinism across restarts).
assert.equal(Model.pickQuestionIndex(3, bank.length), Model.pickQuestionIndex(3, bank.length))

// A different cycle (second full pass) should reorder rather than repeat pass 1's order.
const pass1 = []
const pass2 = []
for (let i = 0; i < bank.length; i++) {
  pass1.push(Model.pickQuestionIndex(i, bank.length))
  pass2.push(Model.pickQuestionIndex(i + bank.length, bank.length))
}
assert.notDeepEqual(pass1, pass2, "second pass reshuffles rather than repeating the exact same order")

// --- scoring bands ---
assert.equal(Model.scoreGuess(100, 100).band, "Bullseye")
assert.equal(Model.scoreGuess(150, 100).band, "Bullseye") // ~0.176 decades off
assert.equal(Model.scoreGuess(1000, 100).band, "Close") // exactly 1 decade off
assert.equal(Model.scoreGuess(10000, 100).band, "Ballpark") // exactly 2 decades off
assert.equal(Model.scoreGuess(100000, 100).band, "Off") // 3 decades off
assert.equal(Model.scoreGuess(0, 100).band, "Off") // invalid guess handled, not a crash
assert.equal(Model.scoreGuess(-5, 100).band, "Off")

// --- streaks ---
let state = Model.emptyState()
state = Model.recordAnswer(state, 10, 100, 100) // Bullseye, first answer -> streak 1
assert.equal(state.streak, 1)
assert.equal(state.bestStreak, 1)

state = Model.recordAnswer(state, 11, 100, 100) // consecutive day, Bullseye -> streak 2
assert.equal(state.streak, 2)
assert.equal(state.bestStreak, 2)

state = Model.recordAnswer(state, 12, 1, 1e9) // consecutive day but way Off -> streak resets to 0
assert.equal(state.streak, 0)
assert.equal(state.bestStreak, 2, "best streak is preserved even after a reset")

state = Model.recordAnswer(state, 14, 100, 100) // day 13 skipped -> not consecutive, restarts at 1
assert.equal(state.streak, 1)

// Re-recording the same day must not double count (idempotent).
const beforeReplay = Model.recordAnswer(Model.emptyState(), 5, 100, 100)
const afterReplay = Model.recordAnswer(beforeReplay, 5, 999, 1)
assert.deepEqual(afterReplay, beforeReplay, "answering the same day twice is a no-op")

assert.equal(Model.hasAnsweredDay(beforeReplay, 5), true)
assert.equal(Model.hasAnsweredDay(beforeReplay, 6), false)

// --- emptyState shape (Widget.qml's loadState() trusts this shape check) ---
const fresh = Model.emptyState()
assert.deepEqual(Object.keys(fresh).sort(), ["bestStreak", "history", "lastCompletedDay", "streak"])
assert.equal(fresh.streak, 0)
assert.equal(fresh.bestStreak, 0)

// --- formatCompact ---
assert.equal(Model.formatCompact(100), "100")
assert.equal(Model.formatCompact(1234), "1,234")
assert.equal(Model.formatCompact(1.2e18), "1.2 × 10^18")

console.log("All Model.js tests passed.")
