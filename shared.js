/* =====================================================================
   IOP Inference Infrastructure — Shared Animation Framework
   No external dependencies. Provides:
     IOP.C            -> semantic color constants (match shared.css)
     IOP.svg(tag,attrs,children) / IOP.S  -> SVG element helper
     IOP.lerp/clamp/ease/map        -> math helpers
     IOP.Stepper(cfg) -> discrete step-through animation w/ controls
     IOP.Loop(cfg)    -> continuous looping animation w/ play+speed
   Both controllers render a consistent control bar using shared.css classes.
   ===================================================================== */
(function () {
  const IOP = (window.IOP = window.IOP || {});

  /* ----- color constants (keep in sync with :root in shared.css) ----- */
  IOP.C = {
    bg:"#0a0e16", panel:"#111827", card:"#131c2b", raised:"#1b2638",
    border:"#243349", borderSoft:"#1b2740",
    text:"#e8eef6", muted:"#9fb0c6", faint:"#6b7c93",
    accent:"#38bdf8", accent2:"#22d3ee",
    token:"#38bdf8", weight:"#a78bfa", kv:"#fbbf24",
    compute:"#34d399", attn:"#fb7185", mem:"#60a5fa",
    warn:"#f87171", good:"#34d399",
  };

  /* ----------------------------- math ------------------------------ */
  IOP.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  IOP.lerp = (a, b, t) => a + (b - a) * t;
  IOP.map = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a || 1));
  IOP.ease = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2);   // easeInOutCubic
  IOP.easeOut = (t) => 1 - Math.pow(1 - t, 3);
  IOP.easeIn = (t) => t*t*t;

  /* --------------------------- SVG helper -------------------------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  IOP.svg = function (tag, attrs, children) {
    const e = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) {
      if (k === "text") e.textContent = attrs[k];
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(c => c && e.appendChild(c));
    return e;
  };
  IOP.S = IOP.svg;
  IOP.clear = (node) => { while (node && node.firstChild) node.removeChild(node.firstChild); };

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function button(label, cls) {
    const b = el("button", "btn" + (cls ? " " + cls : ""));
    b.innerHTML = label;
    b.type = "button";
    return b;
  }

  /* ===================================================================
     Stepper — discrete steps the learner advances through.
     cfg = {
       controls: HTMLElement (required),
       caption:  HTMLElement (optional) — narrates each step,
       captions: [String,...] (optional) HTML allowed,
       count:    Number (defaults to captions.length),
       render:   (step, p) => void   p = 0..1 entrance progress of current step,
       dwell:    ms held per step while auto-playing (default 1600),
       transition: ms entrance animation (default 500),
       autoplay: Boolean (default false),
       loop:     Boolean (default true),
       dots:     Boolean (default true),
       startAtEndOnLast: keep last frame (default true)
     }
     returns controller { goto,next,prev,play,pause,toggle,reset,step }
  =================================================================== */
  IOP.Stepper = function (cfg) {
    const count = cfg.count || (cfg.captions ? cfg.captions.length : 1);
    const dwell = cfg.dwell ?? 1600;
    const trans = cfg.transition ?? 500;
    const loop = cfg.loop ?? true;
    let step = 0, playing = false, raf = null, tStart = 0, phase = "enter"; // enter|hold

    const bar = cfg.controls;
    IOP.clear(bar);
    bar.classList.add("controls");

    const bPrev = button("◂ Prev");
    const bPlay = button("▶ Play", "primary");
    const bNext = button("Next ▸");
    const bReset = button("↺");
    bReset.title = "Restart";

    const dotsWrap = el("div", "stepdots");
    const dotEls = [];
    if (cfg.dots !== false) {
      for (let i = 0; i < count; i++) {
        const d = el("button", "dot");
        d.addEventListener("click", () => { pause(); goto(i); });
        dotsWrap.appendChild(d); dotEls.push(d);
      }
    }
    const counter = el("span", "stepcount", `1 / ${count}`);
    const spacer = el("span", "ctrl-spacer");

    bar.append(bPrev, bPlay, bNext, bReset, spacer, dotsWrap, counter);

    function paintControls() {
      bPrev.disabled = step === 0;
      bNext.disabled = step === count - 1;
      bPlay.innerHTML = playing ? "⏸ Pause" : (step === count-1 ? "↺ Replay" : "▶ Play");
      counter.textContent = `${step + 1} / ${count}`;
      dotEls.forEach((d, i) => {
        d.classList.toggle("active", i === step);
        d.classList.toggle("done", i < step);
      });
      if (cfg.caption && cfg.captions) cfg.caption.innerHTML = cfg.captions[step] || "";
    }

    function frame(now) {
      if (!tStart) tStart = now;
      const elapsed = now - tStart;
      let p = trans > 0 ? IOP.clamp(elapsed / trans, 0, 1) : 1;
      const ep = IOP.ease(p);
      try { cfg.render && cfg.render(step, ep); } catch (e) { console.error(e); }
      if (playing) {
        if (elapsed >= trans + dwell) {
          if (step < count - 1) { goto(step + 1, true); }
          else if (loop) { goto(0, true); }
          else { pause(); return; }
        }
        raf = requestAnimationFrame(frame);
      } else if (p < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
      }
    }

    function start() { cancelAnimationFrame(raf); tStart = 0; raf = requestAnimationFrame(frame); }

    function goto(i, keepPlaying) {
      step = IOP.clamp(i, 0, count - 1);
      if (!keepPlaying) playing = playing && false;
      paintControls();
      start();
    }
    function next() { pause(); if (step < count - 1) goto(step + 1); }
    function prev() { pause(); if (step > 0) goto(step - 1); }
    function play() {
      if (step === count - 1) step = 0;      // replay from start
      playing = true; paintControls(); start();
    }
    function pause() { playing = false; paintControls(); }
    function toggle() { playing ? pause() : play(); }
    function reset() { pause(); goto(0); }

    bPrev.addEventListener("click", prev);
    bNext.addEventListener("click", next);
    bReset.addEventListener("click", reset);
    bPlay.addEventListener("click", toggle);

    paintControls();
    start(); // draw initial frame

    return { goto, next, prev, play, pause, toggle, reset, get step(){return step;}, get count(){return count;} };
  };

  /* ===================================================================
     Loop — continuous animation with play/pause + speed slider.
     cfg = {
       controls: HTMLElement (required),
       render: (t, dt) => void   t = scaled elapsed seconds, dt = scaled delta,
       autoplay: Boolean (default true),
       speed: Number (default 1),
       speedRange: [min,max] (default [0.25,3]),
       label: optional extra control (HTMLElement) appended to bar,
     }
  =================================================================== */
  IOP.Loop = function (cfg) {
    let playing = cfg.autoplay ?? true;
    let speed = cfg.speed ?? 1;
    let t = 0, last = 0, raf = null;
    const range = cfg.speedRange || [0.25, 3];

    const bar = cfg.controls;
    IOP.clear(bar);
    bar.classList.add("controls");

    const bPlay = button(playing ? "⏸ Pause" : "▶ Play", "primary");
    const bReset = button("↺ Reset");
    const spacer = el("span", "ctrl-spacer");
    const speedWrap = el("label", "speed");
    speedWrap.innerHTML = `<span>speed</span>`;
    const slider = document.createElement("input");
    slider.type = "range"; slider.min = range[0]; slider.max = range[1];
    slider.step = "0.05"; slider.value = speed;
    const sval = el("span", null, speed.toFixed(2) + "×");
    speedWrap.append(slider, sval);

    bar.append(bPlay, bReset, spacer);
    if (cfg.label) bar.append(cfg.label);
    bar.append(speedWrap);

    function frame(now) {
      if (!last) last = now;
      let dt = (now - last) / 1000; last = now;
      dt = Math.min(dt, 0.05);          // clamp big gaps (tab switches)
      if (playing) t += dt * speed;
      try { cfg.render && cfg.render(t, playing ? dt * speed : 0); } catch (e) { console.error(e); }
      raf = requestAnimationFrame(frame);
    }
    function play() { playing = true; bPlay.innerHTML = "⏸ Pause"; }
    function pause() { playing = false; bPlay.innerHTML = "▶ Play"; }
    function toggle() { playing ? pause() : play(); }
    function reset() { t = 0; try { cfg.render && cfg.render(0, 0); } catch(e){} }

    bPlay.addEventListener("click", toggle);
    bReset.addEventListener("click", reset);
    slider.addEventListener("input", () => { speed = parseFloat(slider.value); sval.textContent = speed.toFixed(2) + "×"; });

    raf = requestAnimationFrame(frame);
    return { play, pause, toggle, reset, get t(){return t;}, setSpeed(s){ speed=s; slider.value=s; sval.textContent=s.toFixed(2)+"×"; } };
  };

  /* ---- small helper: rounded-rect path string ---- */
  IOP.rr = function (x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    return `M${x+r},${y}h${w-2*r}a${r},${r} 0 0 1 ${r},${r}v${h-2*r}a${r},${r} 0 0 1 ${-r},${r}h${-(w-2*r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(h-2*r)}a${r},${r} 0 0 1 ${r},${-r}z`;
  };

  IOP.el = el;
})();
