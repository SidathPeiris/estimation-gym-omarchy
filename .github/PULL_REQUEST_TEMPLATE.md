<!--
Adding questions? Run `node questions.test.js` before pushing - it checks the
schema, magnitudes and duplicate prompts, and CI will run it anyway.
-->

## What does this change?

<!-- One or two lines. -->

## If you are adding questions

- [ ] `node questions.test.js` passes
- [ ] Each answer is right to within an order of magnitude, and I have said
      where it comes from in `source`
- [ ] `decompositionHint` explains **how to work it out**, not just what the
      answer is
- [ ] `strategy` names the closest reasoning archetype (see CONTRIBUTING.md);
      `decompose` is the fine default when nothing else fits
- [ ] `asOf` is set for anything that drifts over time (populations, prices,
      device counts) and omitted for fixed quantities
- [ ] The question is answerable by reasoning, not only by having memorised it

## If you are changing code

- [ ] `node Model.test.js` passes
- [ ] Widget changes have been run in a real Omarchy shell (there is no
      automated QML test - please say what you checked)
