// Schema and sanity checks for the question bank. Kept as a plain node test
// like Model.test.js so it runs with no dependencies:
//
//   node questions.test.js
//
// The bank is the part of this plugin most likely to be edited in bulk, and a
// question with a wrong answer is worse than a missing one - it marks a
// correct guess as "Off" and quietly discredits the scoring.

const assert = require("node:assert/strict")
const QUESTIONS = require("./content/questions.js")
const Model = require("./Model.js")

const REQUIRED = ["id", "prompt", "unit", "answerValue", "decompositionHint", "strategy", "source"]
const OPTIONAL = ["asOf"]
// The strategy selects which hint a player sees, so an invented one would
// silently fall back to generic advice rather than failing loudly.
const STRATEGIES = Object.keys(Model.STRATEGIES)
const CURRENT_YEAR = new Date().getFullYear()

let problems = []
function fail(id, message) { problems.push(`${id}: ${message}`) }

const seenIds = new Set()

for (const q of QUESTIONS) {
  const id = q && q.id ? q.id : "(missing id)"

  for (const field of REQUIRED) {
    if (!(field in q)) { fail(id, `missing required field "${field}"`); continue }
    if (typeof q[field] === "string" && q[field].trim() === "") fail(id, `empty "${field}"`)
  }

  for (const field of Object.keys(q)) {
    if (!REQUIRED.includes(field) && !OPTIONAL.includes(field)) fail(id, `unknown field "${field}"`)
  }

  if (typeof q.id === "string") {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id)) fail(id, "id must be kebab-case")
    if (seenIds.has(q.id)) fail(id, "duplicate id")
    seenIds.add(q.id)
  }

  if (typeof q.answerValue !== "number" || !isFinite(q.answerValue)) {
    fail(id, "answerValue must be a finite number")
  } else if (q.answerValue <= 0) {
    // Scoring is log based, so a non-positive answer can never be scored.
    fail(id, "answerValue must be positive")
  } else if (q.answerValue < 1e-40 || q.answerValue > 1e100) {
    // Loose enough for real physics at both ends - one fission event is
    // 3.2e-11 joules, and the observable universe holds ~10^80 atoms - while
    // still catching a stray exponent.
    fail(id, `answerValue ${q.answerValue} is outside the plausible range`)
  }

  if ("asOf" in q) {
    if (!Number.isInteger(q.asOf)) fail(id, "asOf must be a whole year")
    // Negative years are BCE, so the floor is deep enough for antiquity.
    else if (q.asOf < -10000 || q.asOf > CURRENT_YEAR + 1) fail(id, `asOf ${q.asOf} is out of range`)
  }

  // A prompt that pins itself to a date in prose should carry the structured
  // field instead, otherwise no refresh script can ever find it.
  if (typeof q.prompt === "string" && /\bas of\b/i.test(q.prompt) && !("asOf" in q)) {
    fail(id, "prompt says 'as of' but has no asOf field")
  }

  // Contains rather than ends with, since a prompt may legitimately trail a
  // parenthetical after the question mark.
  if (typeof q.prompt === "string" && !q.prompt.includes("?")) {
    fail(id, "prompt should be a question")
  }
  if (typeof q.decompositionHint === "string" && q.decompositionHint.trim().length < 30) {
    fail(id, "decompositionHint is too short to teach anything")
  }
  if (typeof q.strategy === "string" && !STRATEGIES.includes(q.strategy)) {
    fail(id, `unknown strategy "${q.strategy}" - expected one of: ${STRATEGIES.join(", ")}`)
  }
}

// --- near-duplicate prompts ---
// Two prompts about the same quantity in different years are legitimate and
// intended, so only flag overlap when the questions share a period.
const STOP = new Set(["how", "many", "much", "the", "a", "an", "are", "is", "there", "in",
                      "of", "on", "at", "to", "for", "and", "or", "does", "do", "would",
                      "what", "roughly", "approximately", "about", "per", "you", "your",
                      "it", "take", "as", "single", "average", "typical"])

function tokens(prompt) {
  return new Set(
    prompt.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  )
}

function jaccard(a, b) {
  let shared = 0
  for (const t of a) if (b.has(t)) shared++
  const union = a.size + b.size - shared
  return union === 0 ? 0 : shared / union
}

const prepared = QUESTIONS.map((q) => ({ id: q.id, asOf: q.asOf, tokens: tokens(q.prompt || "") }))
const nearDuplicates = []
for (let i = 0; i < prepared.length; i++) {
  for (let j = i + 1; j < prepared.length; j++) {
    if (prepared[i].asOf !== prepared[j].asOf) continue
    const score = jaccard(prepared[i].tokens, prepared[j].tokens)
    if (score >= 0.7) nearDuplicates.push(`${prepared[i].id} ~ ${prepared[j].id} (${score.toFixed(2)})`)
  }
}
for (const pair of nearDuplicates) fail("duplicate-prompt", pair)

// --- report ---
const dated = QUESTIONS.filter((q) => "asOf" in q)
const magnitudes = QUESTIONS.map((q) => Math.floor(Math.log10(q.answerValue)))
  .filter((m) => isFinite(m))

console.log(`questions:        ${QUESTIONS.length}`)
console.log(`dated (asOf):     ${dated.length}`)
console.log(`timeless:         ${QUESTIONS.length - dated.length}`)
console.log(`magnitude range:  10^${Math.min(...magnitudes)} .. 10^${Math.max(...magnitudes)}`)
console.log(`distinct units:   ${new Set(QUESTIONS.map((q) => q.unit)).size}`)

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

assert.ok(QUESTIONS.length > 0, "bank is not empty")
console.log("\nAll question bank checks passed.")
