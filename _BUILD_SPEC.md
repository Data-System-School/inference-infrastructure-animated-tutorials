# Build spec — IOP Inference teaching animations

You are building ONE self-contained HTML page of interactive teaching animations for one
module of the "Inference Infrastructure" blog series. All pages share `shared.css` +
`shared.js` and must look/behave consistently. Read `_TEMPLATE.html` first and copy its
structure exactly.

## Hard rules
1. **Self-contained & offline.** Only dependencies allowed are `shared.css` and `shared.js`
   (already built). NO CDNs, NO external libraries, NO web fonts, NO network calls. Vanilla
   JS + inline SVG only. Pages are opened from the local filesystem (file://).
2. **Use the framework.** Build every animation with `IOP.Stepper` (step-through) or
   `IOP.Loop` (auto-play) from shared.js. Do not hand-roll control bars — you get
   play/pause/step/reset/speed for free and consistency matters. See `_TEMPLATE.html` for
   exact wiring of both.
3. **SVG, not canvas** (prefer SVG for crisp text/labels). `viewBox` width 920 is the house
   size; height per figure as needed (260–420). The stage is responsive width.
4. **Mix of interaction (per the user's request):** use `Stepper` for the conceptually hard
   mechanisms (where pacing/back-step helps) and `Loop` for simpler illustrations or
   steady-state processes. Most pages should have BOTH kinds across their figures.
5. **Color semantics — be consistent** (constants in `IOP.C`, CSS vars in shared.css):
   - token = cyan `--token`, weights/params = violet `--weight`, KV cache = amber `--kv`,
     compute/GPU work = green `--compute`, attention scores/heat = rose `--attn`,
     memory/HBM = blue `--mem`, stalls/waste/bubbles = `--warn` (red).
   Always include a `.legend` when colors carry meaning.
6. **Accuracy first.** FETCH AND READ your module's article before building. The animation
   must faithfully reflect what the article actually says (real mechanism, real terms, real
   tradeoffs). Label things with the article's vocabulary. Don't invent numbers that
   contradict it; illustrative small numbers are fine.
7. **Teaching quality.** Each figure: a clear title, a one-line `.blurb`, the animation, and
   for steppers a `captions[]` array that narrates each step in plain language and bolds the
   key term. Add brief `.prose` or a `.callout` between figures to connect ideas. Aim for
   2–4 figures per page. Self-explanatory without audio.
8. **Audience:** calibrate per figure — gentle ramp for intro concepts, more depth/tradeoffs
   for advanced ones. Define jargon the first time it appears.

## Files & naming
- Write your page to the workspace root as the filename given in your task (e.g. `m02-kvcache.html`).
- Keep the `.topnav` chip = `Module N / 11`, hero eyebrow, prev/next pager hrefs.

## Module list (number · file · slug · title)
1. m01-transformers.html   · transformers   · LLMs and Transformers
2. m02-kvcache.html        · kvcache        · Inference and the KV Cache
3. m03-sharding.html       · modelsharding  · Sharding a Model
4. m04-batching.html       · batching       · Batching, Scheduling, and Paging
5. m05-flashattention.html · flashattn      · I/O-Aware Kernels
6. m06-speculative.html    · speculative    · Speculative Decoding
7. m07-disaggregation.html · disaggregation · Prefill-Decode Scheduling and Disaggregation
8. m08-kvoffload.html      · kvoffload      · KV Cache Management and Offload
9. m09-training.html       · training       · Appendix: Overview of Training
10. m10-hardware.html      · hardware       · Appendix: GPU Hardware
11. m11-runtimes.html      · software       · Appendix: Inference Runtimes

Article URL pattern: `https://iop.systems/blog/llm-inference/<slug>/`
Pager: prev = module N-1's file, next = module N+1's file (module 1 prev → index.html,
module 11 next → index.html).

## Definition of done
- File parses and runs with zero console errors when opened from disk.
- Every animation plays, pauses, steps, and resets via the shared controls.
- Visuals match the house theme (dark, the figure/stage/caption structure from the template).
- Content is faithful to the article and genuinely teaches the concept.
