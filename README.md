# Inference Infrastructure — Interactive Teaching Animations

An animated, click-through companion to IOP Systems' [**Inference Infrastructure**](https://iop.systems/blog/llm-inference/) blog series. Eleven modules take you from a single attention head all the way to a production serving stack — every concept rendered as a hands-on animation you can **play, pause, and step through** at your own pace.

Everything runs locally in the browser with **zero dependencies**: vanilla JavaScript and inline SVG only. No CDNs, no web fonts, no network calls.

## Quick start

The pages are plain static HTML designed to open straight from disk:

```bash
open index.html          # macOS
# or just double-click index.html in your file manager
```

Prefer a local server (e.g. to avoid any `file://` quirks)? Any static server works:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Start from `index.html` (the hub) and follow the prev/next pager through the modules, or jump straight to any topic below.

## Controls

Every figure shares the same control bar:

| Control | Action |
| --- | --- |
| `▶ / ⏸` | Play & pause |
| `◂ ▸` | Step a mechanism one move at a time |
| `↺` | Replay from the start |
| `speed` | Speed slider on auto-play figures |

Step-through figures also show numbered dots and a per-step caption that narrates what's happening in plain language.

## Modules

### Core

| # | Page | Title | Group | Covers |
| --- | --- | --- | --- | --- |
| 01 | [`m01-transformers.html`](m01-transformers.html) | LLMs & Transformers | Foundations | Embeddings, attention (Q·Kᵀ→softmax→V), multi-head, MHA/MQA/GQA/MLA, Mixture-of-Experts |
| 02 | [`m02-kvcache.html`](m02-kvcache.html) | Inference & the KV Cache | Foundations | Prefill vs decode, why recomputing K/V is wasteful, trading memory for speed |
| 03 | [`m03-sharding.html`](m03-sharding.html) | Sharding a Model | Scaling out | Pipeline parallelism & bubbles, tensor parallelism with all-reduce, expert parallelism |
| 04 | [`m04-batching.html`](m04-batching.html) | Batching, Scheduling & Paging | Scaling out | Static vs continuous batching (Orca), PagedAttention's block table |
| 05 | [`m05-flashattention.html`](m05-flashattention.html) | I/O-Aware Kernels | Kernels | Why attention is memory-bound; FlashAttention tiling + online softmax |
| 06 | [`m06-speculative.html`](m06-speculative.html) | Speculative Decoding | Latency | Draft-then-verify, parallel acceptance, EAGLE, Medusa trees, Multi-Token Prediction |
| 07 | [`m07-disaggregation.html`](m07-disaggregation.html) | Prefill-Decode Disaggregation | Scheduling | Chunked prefill, splitting prefill & decode into separate pools |
| 08 | [`m08-kvoffload.html`](m08-kvoffload.html) | KV Cache Management & Offload | Memory | Prefix caching with a radix tree, offloading cold KV blocks down the memory hierarchy |

### Appendices

| # | Page | Title | Covers |
| --- | --- | --- | --- |
| A1 | [`m09-training.html`](m09-training.html) | Overview of Training | Pretraining → SFT → RLHF/RLAIF, reward models, LoRA, quantization |
| A2 | [`m10-hardware.html`](m10-hardware.html) | GPU Hardware | SMs & warps, register→SRAM→HBM hierarchy, CUDA/ROCm, tiled Triton kernels |
| A3 | [`m11-runtimes.html`](m11-runtimes.html) | Inference Runtimes | The serving stack; how vLLM, SGLang, TensorRT-LLM and Triton package every technique above |

## Project structure

```
inference-system/
├── index.html            # Hub — module grid, color legend, how-to
├── m01-transformers.html … m11-runtimes.html   # 11 module pages
├── shared.css            # House theme (dark) + figure/stage/caption layout
├── shared.js             # IOP animation framework (no dependencies)
├── _TEMPLATE.html        # Page template — copy this to start a new module
└── _BUILD_SPEC.md        # Authoring rules every page must follow
```

## The shared framework (`shared.js`)

All animations are built on a tiny vanilla-JS toolkit exposed on the global `IOP` object — so every page looks and behaves consistently and you get the control bar for free:

- **`IOP.Stepper(cfg)`** — discrete, step-through animations for the conceptually hard mechanisms, where pacing and back-stepping help. Provides prev/next/play/reset, step dots, and per-step captions.
- **`IOP.Loop(cfg)`** — continuous auto-play animations for steady-state processes and simpler illustrations. Provides play/pause/reset and a speed slider.
- **`IOP.C`** — semantic color constants (kept in sync with the CSS `:root` variables).
- **`IOP.svg` / `IOP.S`**, **`IOP.lerp` / `clamp` / `ease` / `map`**, **`IOP.rr`** — SVG element and math/path helpers.

Figures are drawn as inline SVG (`viewBox` width **920** is the house size) — chosen over canvas for crisp text and labels.

### Color semantics

Colors carry meaning consistently across every module (defined in `IOP.C` and `shared.css`); pages that use them include a `.legend`:

| Color | Meaning |
| --- | --- |
| cyan | tokens / requests |
| violet | model weights / params |
| amber | KV cache |
| green | compute / GPU work |
| rose | attention scores / heat |
| blue | memory / HBM |
| red | stalls / waste / bubbles |

## Adding or editing a module

1. Read [`_BUILD_SPEC.md`](_BUILD_SPEC.md) — it lists the hard rules (self-contained & offline, use the framework, SVG not canvas, consistent color semantics, accuracy first, teaching quality).
2. Copy [`_TEMPLATE.html`](_TEMPLATE.html) — it wires up one `Stepper` figure and one `Loop` figure end to end. Keep the `<head>` links to `shared.css` / `shared.js` unchanged.
3. Update the `.topnav` chip (`Module N / 11`), the hero text, the figures, and the prev/next pager hrefs.
4. Aim for 2–4 figures per page, mixing `Stepper` and `Loop`. Each figure gets a title, a one-line `.blurb`, the animation, and (for steppers) a `captions[]` array narrating each step.

**Definition of done:** the file parses and runs with zero console errors from disk, every animation plays/pauses/steps/resets via the shared controls, the visuals match the house theme, and the content faithfully reflects the source article.

## Credits

An interactive teaching companion to the [IOP Systems · Inference Infrastructure](https://iop.systems/blog/llm-inference/) series. All concepts and terminology follow the original articles; the animations are an independent illustration of them.
