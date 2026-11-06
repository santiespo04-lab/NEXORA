/* =====================================================================
   NEXORA — Santiago Esposito
   Vanilla JS, no dependencies. Content comes from js/projects.js.
   ===================================================================== */
(() => {
  "use strict";

  const D = window.PORTFOLIO;
  if (!D) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const RED = "#ff2b2b";

  function h(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children)) if (c != null) n.append(c);
    return n;
  }
  function hashStr(s) {
    let x = 2166136261;
    for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619);
    return x >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, "0");
  const fmtTime = (s) => (isFinite(s) ? `${pad(s / 60)}:${pad(s % 60)}` : "00:00");
  const catLabel = (c) => (D.categories && D.categories[c]) || c;
  const smooth = reduce ? "auto" : "smooth";

  /* ------------------------------------------------------------------
     Site texts (name, year, location, availability, intro, headline)
     ------------------------------------------------------------------ */
  const site = D.site || {};
  $$("[data-site]").forEach((n) => {
    const v = site[n.dataset.site];
    if (typeof v === "string" && v) n.textContent = v;
  });
  if (!site.availability) $$(".status").forEach((s) => s.remove());
  if (site.name) {
    const words = site.name.trim().split(/\s+/);
    const initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
    $$(".mono-mark").forEach((m) => (m.textContent = initials));
  }
  if (Array.isArray(site.headline) && site.headline.length) {
    $$(".hero__word").forEach((w, i) => {
      if (site.headline[i]) w.textContent = site.headline[i];
      else w.closest(".hero__line").remove();
    });
  }
  document.title = site.title || site.name || document.title;

  /* ------------------------------------------------------------------
     About: body, approach, slate, tools, process
     ------------------------------------------------------------------ */
  {
    const A = D.about || {};
    if (A.lead) $('[data-about="lead"]').textContent = A.lead;
    $("#about-body").replaceChildren(...(A.body || []).map((p) => h("p", { text: p })));
    $("#approach").replaceChildren(
      ...(A.approach || []).map((s) => h("li", { class: "reveal" }, [h("h4", { text: s.title }), h("p", { text: s.text })])),
    );
    $("#tools").replaceChildren(...(A.tools || []).map((t) => h("li", { text: t })));
    $("#process").replaceChildren(
      ...(A.process || []).map((s, k) => {
        const li = h("li", {}, [h("h4", { text: s.title }), h("p", { text: s.text })]);
        li.style.setProperty("--k", k);
        return li;
      }),
    );
    const rows = [
      ["Estudio", site.title, "slate__v--brand"],
      ["Dirección", site.name],
      ["Disciplinas", Object.values(D.categories || {}).join(" · ")],
      ["Base", site.location],
      ["Estado", site.availability, "slate__v--live"],
    ].filter(([, v]) => v);
    $("#slate").replaceChildren(
      h("div", { class: "slate__top", "aria-hidden": "true" }),
      h(
        "dl",
        { class: "slate__rows" },
        rows.map(([k, v, cls]) =>
          h("div", { class: "slate__row" }, [
            h("dt", { class: "slate__k", text: k }),
            h("dd", { class: "slate__v" + (cls ? " " + cls : "") }, cls === "slate__v--live" ? [h("i", { class: "status__dot", "aria-hidden": "true" }), v] : v),
          ]),
        ),
      ),
    );
  }

  /* ------------------------------------------------------------------
     Marquee (discipline names, same language as the categories)
     ------------------------------------------------------------------ */
  {
    const names = Object.values(D.categories || {});
    const copy = () => names.map((n, i) => h("span", { class: "marquee__item" + (i % 2 ? "" : " is-solid"), text: n }));
    $("#marquee").replaceChildren(...copy(), ...copy()); // two identical copies → seamless -50% loop
  }

  /* ------------------------------------------------------------------
     Split headings into words
     ------------------------------------------------------------------ */
  function split(node) {
    const text = node.textContent.trim();
    node.textContent = "";
    text.split(/\s+/).forEach((word, i, arr) => {
      const inner = h("span", { text: word });
      inner.style.setProperty("--i", i);
      node.append(h("span", { class: "w" }, inner));
      if (i < arr.length - 1) node.append(" ");
    });
  }
  $$("[data-split]").forEach(split);

  /* ------------------------------------------------------------------
     Reveal on scroll (content is readable at rest; this only adds the lift)
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  function observeReveals(root = document) {
    $$(".reveal", root).forEach((n) => {
      const sibs = $$(":scope > .reveal", n.parentElement);
      n.style.setProperty("--d", `${Math.min(sibs.indexOf(n), 6) * 0.08}s`);
    });
    $$(".reveal, [data-split], .process li", root).forEach((n) => io.observe(n));
  }
  observeReveals();
  // the hero is on screen at load: play its sequence right away
  requestAnimationFrame(() => $$(".hero .reveal, .hero [data-split]").forEach((n) => n.classList.add("is-in")));

  /* ------------------------------------------------------------------
     Hero — rotating roles + one decode pass on the brand word
     ------------------------------------------------------------------ */
  let roleNow = "";
  {
    const roles = site.roles && site.roles.length ? site.roles : ["Editor de video"];
    const track = $("#roles");
    const wrap = track.closest(".roles");
    wrap.setAttribute("aria-label", roles.join(", "));
    track.setAttribute("aria-hidden", "true");
    const items = roles.map((r, i) => h("span", { class: "roles__item" + (i === 0 ? " is-on" : ""), text: r }));
    track.replaceChildren(...items);
    roleNow = roles[0];
    let ri = 0;
    if (!reduce && items.length > 1) {
      setInterval(() => {
        if (document.hidden) return;
        const cur = items[ri];
        const next = items[(ri + 1) % items.length];
        next.style.transition = "none";
        next.classList.remove("is-out", "is-on");
        void next.offsetWidth;
        next.style.transition = "";
        cur.classList.remove("is-on");
        cur.classList.add("is-out");
        next.classList.add("is-on");
        ri = (ri + 1) % items.length;
        roleNow = roles[ri];
      }, 2600);
    }
  }
  if (!reduce) {
    const target = $(".hero__word--accent .w > span");
    if (target) {
      const final = target.textContent;
      const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#/<>_";
      const t0 = performance.now() + 650;
      const dur = 750;
      const step = (now) => {
        const u = clamp((now - t0) / dur, 0, 1);
        if (now < t0) return requestAnimationFrame(step);
        const fixed = Math.floor(u * final.length);
        target.textContent = final
          .split("")
          .map((ch, i) => (i < fixed || /[^A-Z]/i.test(ch) ? ch : glyphs[Math.floor(((now / 45) * (i + 3)) % glyphs.length)]))
          .join("");
        if (u < 1) requestAnimationFrame(step);
        else target.textContent = final;
      };
      requestAnimationFrame(step);
    }
  }

  /* ------------------------------------------------------------------
     Canvas helpers: run a draw loop only while visible
     ------------------------------------------------------------------ */
  function fitCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const hgt = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== hgt) {
      cv.width = w;
      cv.height = hgt;
    }
    return { w, h: hgt, dpr };
  }
  function loop(cv, draw) {
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const frame = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && !reduce) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (reduce && visible) draw(1.2);
      start();
    }).observe(cv);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", () => draw((performance.now() - t0) / 1000), { passive: true });
  }

  /* ------------------------------------------------------------------
     Hero dust field
     ------------------------------------------------------------------ */
  {
    const cv = $("#dust");
    const ctx = cv.getContext("2d");
    const R = rng(7);
    const N = window.innerWidth < 700 ? 70 : 150;
    const P = Array.from({ length: N }, () => ({
      x: R(),
      y: R(),
      z: Math.pow(R(), 1.6),
      vx: (R() - 0.5) * 0.006,
      vy: -(0.004 + R() * 0.012),
      red: R() < 0.07,
      tw: R() * 6.28,
    }));
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    if (finePointer) {
      window.addEventListener(
        "pointermove",
        (e) => {
          tx = e.clientX / innerWidth - 0.5;
          ty = e.clientY / innerHeight - 0.5;
        },
        { passive: true },
      );
    }
    loop(cv, (t) => {
      const { w, h: H, dpr } = fitCanvas(cv);
      mx = lerp(mx, tx, 0.05);
      my = lerp(my, ty, 0.05);
      ctx.clearRect(0, 0, w, H);
      for (const p of P) {
        const x = ((((p.x + p.vx * t - mx * 0.04 * (0.3 + p.z)) % 1) + 1) % 1) * w;
        const y = ((((p.y + p.vy * t - my * 0.04 * (0.3 + p.z)) % 1) + 1) % 1) * H;
        const r = (0.6 + p.z * 2.2) * dpr;
        ctx.globalAlpha = (0.15 + 0.55 * p.z) * (0.6 + 0.4 * Math.sin(t * 1.4 + p.tw));
        ctx.fillStyle = p.red ? RED : "#f4f3ef";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ------------------------------------------------------------------
     Generative covers (projects without a `cover`, service cards)
     ------------------------------------------------------------------ */
  function drawCover(cv, project, w, H) {
    cv.width = w;
    cv.height = H;
    const ctx = cv.getContext("2d");
    const R = rng(hashStr(project.id || project.title || "x"));
    const cat = (project.categories && project.categories[0]) || "motion";
    const s = H / 720;
    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, w, H);
    const g = ctx.createRadialGradient(w * 0.7, H * 0.4, 0, w * 0.7, H * 0.4, w * 0.7);
    g.addColorStop(0, "rgba(255,43,43,0.16)");
    g.addColorStop(1, "rgba(255,43,43,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, H);
    ctx.strokeStyle = "rgba(244,243,239,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 48 * s) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    const white = (a) => `rgba(244,243,239,${a})`;
    ctx.lineWidth = 2 * s;

    if (cat === "video") {
      const top = H * 0.3;
      for (let tr = 0; tr < 4; tr++) {
        const y = top + tr * 78 * s;
        let x = w * 0.06 + R() * 60 * s;
        while (x < w * 0.94) {
          const len = (90 + R() * 260) * s;
          const red = R() < 0.14;
          ctx.fillStyle = red ? "rgba(255,43,43,0.75)" : white(0.08 + R() * 0.12);
          ctx.strokeStyle = red ? RED : white(0.35);
          ctx.fillRect(x, y, Math.min(len, w * 0.94 - x), 54 * s);
          ctx.strokeRect(x, y, Math.min(len, w * 0.94 - x), 54 * s);
          x += len + (8 + R() * 30) * s;
        }
      }
      const px = w * (0.35 + R() * 0.35);
      ctx.fillStyle = RED;
      ctx.fillRect(px - 1.5 * s, H * 0.2, 3 * s, H * 0.62);
    } else if (cat === "motion") {
      const cx = w * (0.55 + R() * 0.2);
      const cy = H * 0.5;
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = i === 4 ? RED : white(0.12 + i * 0.05);
        ctx.lineWidth = (i === 4 ? 4 : 1.5) * s;
        ctx.beginPath();
        ctx.arc(cx, cy, (40 + i * 34) * s, R() * 6, R() * 6 + 2 + R() * 2.5);
        ctx.stroke();
      }
      ctx.strokeStyle = white(0.6);
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(w * 0.05, H * 0.85);
      ctx.bezierCurveTo(w * 0.3, H * 0.1, w * 0.45, H * 0.95, cx, cy);
      ctx.stroke();
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * s, 0, 6.28);
      ctx.fill();
    } else if (cat === "presentations") {
      const cols = 4;
      const gw = w * 0.7;
      const cw = gw / cols - 18 * s;
      const ch = cw * 0.5625;
      const ox = w * 0.15;
      const oy = H * 0.5 - (ch * 2 + 18 * s) / 2;
      const hot = Math.floor(R() * 8);
      for (let i = 0; i < 8; i++) {
        const x = ox + (i % cols) * (cw + 18 * s);
        const y = oy + Math.floor(i / cols) * (ch + 18 * s);
        ctx.strokeStyle = i === hot ? RED : white(0.4);
        ctx.lineWidth = (i === hot ? 3 : 1.5) * s;
        ctx.strokeRect(x, y, cw, ch);
        ctx.fillStyle = i === hot ? "rgba(255,43,43,0.85)" : white(0.25);
        ctx.fillRect(x + 12 * s, y + 14 * s, cw * (0.3 + R() * 0.4), 8 * s);
        ctx.fillStyle = white(0.12);
        ctx.fillRect(x + 12 * s, y + 30 * s, cw * 0.6, 5 * s);
      }
    } else if (cat === "web") {
      const x = w * 0.16;
      const y = H * 0.16;
      const bw = w * 0.68;
      const bh = H * 0.68;
      ctx.strokeStyle = white(0.55);
      ctx.strokeRect(x, y, bw, bh);
      ctx.fillStyle = white(0.08);
      ctx.fillRect(x, y, bw, 34 * s);
      [0, 1, 2].forEach((i) => {
        ctx.fillStyle = i === 0 ? RED : white(0.4);
        ctx.beginPath();
        ctx.arc(x + (20 + i * 18) * s, y + 17 * s, 5 * s, 0, 6.28);
        ctx.fill();
      });
      ctx.fillStyle = white(0.85);
      ctx.fillRect(x + 40 * s, y + 80 * s, bw * 0.45, 26 * s);
      ctx.fillStyle = white(0.25);
      ctx.fillRect(x + 40 * s, y + 120 * s, bw * 0.35, 10 * s);
      ctx.fillStyle = RED;
      ctx.fillRect(x + 40 * s, y + 150 * s, 120 * s, 32 * s);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = white(0.3);
        ctx.strokeRect(x + 40 * s + (i * (bw - 80 * s)) / 3, y + bh - 150 * s, (bw - 80 * s) / 3 - 16 * s, 110 * s);
      }
      const ax = x + bw * (0.55 + R() * 0.2);
      const ay = y + 160 * s;
      ctx.fillStyle = "#f4f3ef";
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 20 * s, ay + 22 * s);
      ctx.lineTo(ax + 9 * s, ay + 22 * s);
      ctx.lineTo(ax + 4 * s, ay + 32 * s);
      ctx.closePath();
      ctx.fill();
    } else {
      for (let i = 0; i < 7; i++) {
        const k = i / 6;
        const fw = (520 - i * 52) * s;
        const fh = fw * 0.5625;
        const fx = w * 0.62 - fw / 2 + i * 26 * s;
        const fy = H * 0.5 - fh / 2 - i * 8 * s;
        ctx.strokeStyle = i === 0 ? RED : white(0.5 - k * 0.4);
        ctx.lineWidth = (i === 0 ? 3 : 1.5) * s;
        ctx.strokeRect(fx, fy, fw, fh);
      }
      ctx.fillStyle = white(0.9);
      ctx.font = `800 ${150 * s}px Archivo, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText("</>", w * 0.07, H * 0.5);
    }
    ctx.strokeStyle = white(0.4);
    ctx.lineWidth = 1.5 * s;
    const m = 22 * s;
    const L = 26 * s;
    [
      [m, m, 1, 1],
      [w - m, m, -1, 1],
      [m, H - m, 1, -1],
      [w - m, H - m, -1, -1],
    ].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * L);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * L, y);
      ctx.stroke();
    });
  }

  /* ------------------------------------------------------------------
     Projects: grid + filters
     ------------------------------------------------------------------ */
  const projects = (D.projects || []).slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const grid = $("#grid");
  const filtersEl = $("#filters");

  function coverNode(p, featured) {
    if (p.cover) return h("img", { class: "card__cover", src: p.cover, alt: "", loading: "lazy", decoding: "async" });
    const cv = h("canvas", { class: "card__cover", "aria-hidden": "true" });
    drawCover(cv, p, featured ? 1680 : 1280, 720);
    return cv;
  }

  const cards = projects.map((p, i) => {
    const featured = i === 0 && p.featured;
    const media = h("div", { class: "card__media" }, [
      coverNode(p, featured),
      h("div", { class: "card__hud mono" }, [
        h("span", {}, [h("i", { class: "live" }), (p.categories || []).map(catLabel)[0] || ""]),
        h("span", { text: p.duration || p.year || "" }),
      ]),
      p.video ? h("span", { class: "card__badge mono", "aria-hidden": "true", text: "▶ Video" }) : null,
      h("div", { class: "card__corners", "aria-hidden": "true" }, [h("i", { class: "a" }), h("i", { class: "b" })]),
    ]);
    const card = h(
      "article",
      { class: "card reveal" + (featured ? " card--featured" : ""), "data-cats": (p.categories || []).join(" ") },
      [
        media,
        h("div", { class: "card__meta" }, [
          h("p", { class: "card__cats mono", text: [(p.categories || []).map(catLabel).join(" · "), p.year].filter(Boolean).join(" — ") }),
          h("h3", { class: "card__title", text: p.title }),
          h("p", { class: "card__sub", text: p.subtitle || p.client || "" }),
          h("span", { class: "card__arrow", "aria-hidden": "true", text: "↗" }),
        ]),
        h("button", {
          class: "card__hit",
          type: "button",
          "aria-label": `Abrir proyecto: ${p.title}`,
          "data-cursor": p.video ? "Play" : "Ver",
          onclick: () => openViewer(i),
        }),
      ],
    );
    if (p.video && finePointer) {
      let v = null;
      card.addEventListener("pointerenter", () => {
        if (!v) {
          v = h("video", { class: "card__preview", src: p.video, muted: true, loop: true, playsinline: true, preload: "auto" });
          v.muted = true;
          media.insertBefore(v, media.children[1]);
        }
        v.play()
          .then(() => card.classList.add("is-playing"))
          .catch(() => {});
      });
      card.addEventListener("pointerleave", () => {
        if (!v) return;
        v.pause();
        card.classList.remove("is-playing");
      });
    }
    return card;
  });

  const ctaCard = h("a", { class: "card card--cta reveal", href: "#contacto", "data-cursor": "Hablemos" }, [
    h("div", { class: "card__media" }, [h("p", { class: "card__cta-text", html: "¿Tu proyecto<br><em>acá?</em>" })]),
    h("div", { class: "card__meta" }, [
      h("p", { class: "card__cats mono", text: site.availability || "Nuevos proyectos" }),
      h("h3", { class: "card__title", text: "Trabajemos juntos" }),
      h("p", { class: "card__sub", text: "Video, motion, presentaciones, web o HyperFrames." }),
      h("span", { class: "card__arrow", "aria-hidden": "true", text: "↗" }),
    ]),
  ]);
  grid.replaceChildren(...cards, ctaCard);

  const present = Object.keys(D.categories || {}).filter((c) => projects.some((p) => (p.categories || []).includes(c)));
  const chips = ["all", ...present].map((c) => {
    const n = c === "all" ? projects.length : projects.filter((p) => (p.categories || []).includes(c)).length;
    return h(
      "button",
      { class: "chip", type: "button", "data-cat": c, "aria-pressed": c === "all" ? "true" : "false", onclick: () => setFilter(c) },
      [c === "all" ? "Todos" : catLabel(c), h("span", { class: "chip__n", text: String(n) })],
    );
  });
  filtersEl.replaceChildren(...chips);

  function setFilter(c) {
    chips.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === c)));
    let k = 0;
    cards.forEach((card) => {
      const show = c === "all" || card.dataset.cats.split(" ").includes(c);
      card.classList.toggle("is-hidden", !show);
      card.classList.remove("is-pop");
      if (show) {
        card.classList.add("is-in");
        card.style.setProperty("--k", k++);
        if (!reduce) {
          void card.offsetWidth;
          card.classList.add("is-pop");
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Project view (modal): video player, gallery, tools, deep link #id
     ------------------------------------------------------------------ */
  const V = {
    root: $("#viewer"),
    stage: $("#viewer-stage"),
    video: $("#viewer-video"),
    img: $("#viewer-img"),
    canvas: $("#viewer-canvas"),
    player: $("#player"),
    play: $("#player-play"),
    scrub: $("#player-scrub"),
    time: $("#player-time"),
    mute: $("#player-mute"),
    full: $("#player-full"),
    thumbs: $("#viewer-thumbs"),
    index: 0,
    opener: null,
    idle: 0,
    scrubbing: false,
  };
  const setHash = (id) => {
    try {
      history.replaceState(null, "", `#${id}`);
    } catch (_) {}
  };

  function showMedia(item, p) {
    V.video.pause();
    V.video.hidden = V.img.hidden = V.canvas.hidden = true;
    V.player.hidden = true;
    if (item.type === "video") {
      if (V.video.getAttribute("src") !== item.src) V.video.src = item.src;
      if (p.cover) V.video.poster = p.cover;
      V.video.hidden = false;
      V.player.hidden = false;
      V.video.play().catch(() => {});
    } else if (item.type === "image") {
      V.img.src = item.src;
      V.img.alt = p.title;
      V.img.hidden = false;
    } else {
      drawCover(V.canvas, p, 1600, 900);
      V.canvas.hidden = false;
    }
    $$(".thumb", V.thumbs).forEach((t) => t.setAttribute("aria-current", t._item === item ? "true" : "false"));
  }

  function openViewer(i) {
    const p = projects[i];
    if (!p) return;
    pauseShowreel();
    V.index = i;
    if (V.root.hidden) V.opener = document.activeElement;
    $("#viewer-cats").textContent = (p.categories || []).map(catLabel).join(" · ");
    $("#viewer-title").textContent = p.title;
    $("#viewer-sub").textContent = p.subtitle || "";
    $("#viewer-summary").textContent = p.summary || "";
    const meta = [
      ["Cliente", p.client],
      ["Año", p.year],
      ["Rol", (p.role || []).join(", ")],
      ["Herramientas", (p.tools || []).join(" · ")],
      ["Duración", p.duration],
      ["Formato", p.format],
    ].filter(([, v]) => v);
    $("#viewer-meta").replaceChildren(...meta.flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })]));
    $("#viewer-tags").replaceChildren(...(p.categories || []).map((c) => h("li", { text: catLabel(c) })));
    const link = $("#viewer-link");
    link.hidden = !p.link;
    if (p.link) link.href = p.link;

    const items = [];
    if (p.video) items.push({ type: "video", src: p.video });
    (p.gallery || []).forEach((src) => items.push({ type: "image", src }));
    if (!items.length) items.push({ type: "cover" });
    V.thumbs.replaceChildren(
      ...(items.length > 1
        ? items.map((it, k) => {
            const b = h("button", {
              class: "thumb" + (it.type === "video" ? " thumb--video" : ""),
              type: "button",
              "aria-label": it.type === "video" ? "Ver video" : `Imagen ${k + 1}`,
              onclick: () => showMedia(it, p),
            });
            const bg = it.type === "image" ? it.src : p.cover;
            if (bg) b.style.backgroundImage = `url("${bg}")`;
            b._item = it;
            return b;
          })
        : []),
    );
    showMedia(items[0], p);
    setHash(p.id);

    if (V.root.hidden) {
      V.root.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(() => V.root.classList.add("is-open"));
      $(".icon-btn--close", V.root).focus({ preventScroll: true });
    }
  }

  function closeViewer() {
    V.video.pause();
    V.root.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setHash("proyectos");
    setTimeout(() => {
      V.root.hidden = true;
      if (V.opener && V.opener.focus) V.opener.focus({ preventScroll: true });
    }, reduce ? 0 : 320);
  }
  const step = (d) => openViewer((V.index + d + projects.length) % projects.length);

  $$("[data-close]", V.root).forEach((b) => b.addEventListener("click", closeViewer));
  $("#viewer-prev").addEventListener("click", () => step(-1));
  $("#viewer-next").addEventListener("click", () => step(1));

  const syncPlayer = () => {
    const d = V.video.duration || 0;
    const c = V.video.currentTime || 0;
    const v = d ? (c / d) * 1000 : 0;
    if (!V.scrubbing) V.scrub.value = v;
    V.scrub.style.setProperty("--v", `${v / 10}%`);
    V.time.textContent = `${fmtTime(c)} / ${fmtTime(d)}`;
    V.play.textContent = V.video.paused ? "▶" : "❚❚";
    V.play.setAttribute("aria-label", V.video.paused ? "Reproducir" : "Pausar");
    V.mute.classList.toggle("is-off", V.video.muted);
    V.mute.setAttribute("aria-label", V.video.muted ? "Activar sonido" : "Silenciar");
  };
  ["timeupdate", "play", "pause", "loadedmetadata", "volumechange", "ended"].forEach((ev) => V.video.addEventListener(ev, syncPlayer));
  const togglePlay = () => (V.video.paused ? V.video.play().catch(() => {}) : V.video.pause());
  V.play.addEventListener("click", togglePlay);
  V.video.addEventListener("click", togglePlay);
  V.scrub.addEventListener("input", () => {
    V.scrubbing = true;
    if (V.video.duration) V.video.currentTime = (V.scrub.value / 1000) * V.video.duration;
    V.scrub.style.setProperty("--v", `${V.scrub.value / 10}%`);
  });
  V.scrub.addEventListener("change", () => (V.scrubbing = false));
  V.mute.addEventListener("click", () => (V.video.muted = !V.video.muted));
  V.full.addEventListener("click", () => {
    // optional: some phones and embedded views refuse fullscreen
    try {
      const req = document.fullscreenElement
        ? document.exitFullscreen()
        : (V.stage.requestFullscreen || V.stage.webkitRequestFullscreen || (() => {})).call(V.stage);
      if (req && req.catch) req.catch(() => {});
    } catch (_) {}
  });
  V.stage.addEventListener("pointermove", () => {
    V.stage.classList.remove("is-idle");
    clearTimeout(V.idle);
    V.idle = setTimeout(() => !V.video.paused && V.stage.classList.add("is-idle"), 2200);
  });

  document.addEventListener("keydown", (e) => {
    if (V.root.hidden) return;
    if (e.key === "Escape") return closeViewer();
    if (e.target === V.scrub) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === " " && !V.video.hidden && e.target.tagName !== "BUTTON") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "Tab") {
      const f = $$("button, a[href], input", V.root).filter((n) => !n.hidden && n.offsetParent);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ------------------------------------------------------------------
     Hero showreel monitor (muted loop; sound only when the visitor asks)
     ------------------------------------------------------------------ */
  let pauseShowreel = () => {};
  {
    const sr = site.showreel || {};
    const cv = $("#monitor");
    const vid = $("#monitor-video");
    const big = $("#monitor-big");
    const playBtn = $("#monitor-play");
    const soundBtn = $("#monitor-sound");
    const openBtn = $("#monitor-open");
    const tc = $("#monitor-tc");
    const bar = $("#monitor-bar");
    const label = $("#monitor-label");
    const srIndex = projects.findIndex((p) => p.id === sr.project);
    label.textContent = sr.label || "";
    if (srIndex >= 0) openBtn.addEventListener("click", () => openViewer(srIndex));
    else openBtn.hidden = true;

    if (sr.video) {
      cv.hidden = true;
      vid.hidden = false;
      vid.muted = true;
      if (sr.poster) vid.poster = sr.poster;
      vid.src = sr.video;
      let userPaused = reduce; // reduced motion: start on the poster, the visitor presses play
      let inView = false;
      const sync = () => {
        const paused = vid.paused;
        playBtn.textContent = paused ? "Reproducir" : "Pausa";
        playBtn.setAttribute("aria-label", paused ? "Reproducir showreel" : "Pausar showreel");
        big.hidden = !paused;
        soundBtn.setAttribute("aria-pressed", String(!vid.muted));
        soundBtn.textContent = vid.muted ? "Sonido" : "Silenciar";
        soundBtn.setAttribute("aria-label", vid.muted ? "Activar sonido" : "Silenciar showreel");
      };
      const play = () => vid.play().catch(() => sync());
      ["play", "pause", "volumechange"].forEach((ev) => vid.addEventListener(ev, sync));
      vid.addEventListener("timeupdate", () => {
        tc.textContent = fmtTime(vid.currentTime);
        bar.style.transform = `scaleX(${vid.duration ? (vid.currentTime / vid.duration).toFixed(4) : 0})`;
      });
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView && !userPaused) play();
        else if (!inView) vid.pause();
      }).observe(vid);
      const toggle = () => {
        if (vid.paused) {
          userPaused = false;
          play();
        } else {
          userPaused = true;
          vid.pause();
        }
      };
      playBtn.addEventListener("click", toggle);
      big.addEventListener("click", toggle);
      vid.addEventListener("click", toggle);
      soundBtn.addEventListener("click", () => {
        vid.muted = !vid.muted;
        if (!vid.muted && vid.paused) {
          userPaused = false;
          play();
        }
      });
      pauseShowreel = () => {
        if (!vid.paused) vid.pause();
      };
      // resume (muted state kept) when the project view closes
      new MutationObserver(() => {
        if (V.root.hidden && inView && !userPaused) play();
      }).observe(V.root, { attributes: true, attributeFilter: ["hidden"] });
      sync();
    } else {
      // no showreel configured: live motion loop
      playBtn.hidden = soundBtn.hidden = true;
      const ctx = cv.getContext("2d");
      loop(cv, (t) => {
        const { w, h: H } = fitCanvas(cv);
        const s = w / 640;
        const cx = w * 0.5;
        const cy = H * 0.47;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, H);
        const arc = (r, a0, len, color, lw) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = lw * s;
          ctx.beginPath();
          ctx.arc(cx, cy, r * s, a0, a0 + len);
          ctx.stroke();
        };
        arc(88, t * 1.1, 1.9, "rgba(244,243,239,0.85)", 1.5);
        arc(74, -t * 1.6, 1.2, "rgba(244,243,239,0.45)", 1);
        arc(130, t * 0.6, 0.9 + 0.6 * Math.sin(t), RED, 3);
        ctx.fillStyle = "#f4f3ef";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `800 ${22 * s}px Archivo, sans-serif`;
        ctx.fillText(roleNow.toUpperCase(), cx, cy);
        tc.textContent = fmtTime(t);
      });
    }
  }

  /* ------------------------------------------------------------------
     Services: visual cards, each filters the project grid
     ------------------------------------------------------------------ */
  {
    const cardsEl = (D.services || []).map((s) => {
      const art = h("canvas", { "aria-hidden": "true" });
      drawCover(art, { id: `svc-${s.id}`, categories: [s.id] }, 1120, 490);
      const clip = h("span", { class: "svc__clip", "aria-hidden": "true" });
      clip.style.setProperty("--a", `${s.clip ? s.clip[0] : 0}%`);
      clip.style.setProperty("--b", `${s.clip ? s.clip[1] : 100}%`);
      const hasWork = projects.some((p) => (p.categories || []).includes(s.id));
      return h("article", { class: "svc reveal" }, [
        h("div", { class: "svc__art" }, [art, s.en && s.en !== s.title ? h("span", { class: "svc__en mono", text: s.en }) : null]),
        h("div", { class: "svc__body" }, [
          h("h3", { class: "svc__title", text: s.title }),
          h("p", { class: "svc__text", text: s.text }),
          h("ul", { class: "tags" }, (s.tags || []).map((t) => h("li", { text: t }))),
        ]),
        h("div", { class: "svc__lane", "aria-hidden": "true" }, [clip, h("i", { class: "svc__ph" })]),
        hasWork
          ? h(
              "button",
              {
                class: "svc__link",
                type: "button",
                onclick: () => {
                  setFilter(s.id);
                  $("#proyectos").scrollIntoView({ behavior: smooth, block: "start" });
                },
              },
              [`Ver proyectos de ${s.title.toLowerCase().startsWith("hyper") ? s.title : s.title.toLowerCase()}`, h("span", { "aria-hidden": "true", text: "→" })],
            )
          : h("a", { class: "svc__link", href: "#contacto" }, ["Consultar", h("span", { "aria-hidden": "true", text: "→" })]),
      ]);
    });
    $("#svc-grid").replaceChildren(...cardsEl);
  }

  /* ------------------------------------------------------------------
     Contact: WhatsApp, email (+ copy), socials
     ------------------------------------------------------------------ */
  {
    const reach = $("#reach");
    const status = $("#reach-status");
    const items = [];
    const wa = site.whatsapp;
    if (wa && wa.number) {
      items.push(
        h(
          "a",
          {
            class: "reach__btn reach__btn--red magnetic",
            href: `https://wa.me/${wa.number}${wa.message ? `?text=${encodeURIComponent(wa.message)}` : ""}`,
            target: "_blank",
            rel: "noopener",
            "data-cursor": "Chat",
          },
          [h("span", { class: "reach__k", text: "WhatsApp" }), h("span", { class: "reach__v", text: wa.display || `+${wa.number}` }), h("span", { class: "reach__arrow", "aria-hidden": "true", text: "↗" })],
        ),
      );
    }
    if (site.email) {
      items.push(
        h(
          "a",
          {
            class: "reach__btn magnetic",
            href: `mailto:${site.email}?subject=${encodeURIComponent(`Proyecto · ${site.title || site.name}`)}`,
            "data-cursor": "Mail",
          },
          [h("span", { class: "reach__k", text: "Correo" }), h("span", { class: "reach__v", text: site.email }), h("span", { class: "reach__arrow", "aria-hidden": "true", text: "↗" })],
        ),
      );
    }
    reach.replaceChildren(...items);
    if (site.email) {
      const copy = h("button", {
        class: "chip-btn mono",
        type: "button",
        text: "Copiar correo",
        onclick: () => {
          const done = () => (status.textContent = `Correo copiado: ${site.email}`);
          const fallback = () => {
            const tmp = h("input", { value: site.email, "aria-hidden": "true" });
            tmp.style.cssText = "position:fixed;opacity:0;pointer-events:none";
            document.body.append(tmp);
            tmp.select();
            let ok = false;
            try {
              ok = document.execCommand("copy");
            } catch (_) {}
            tmp.remove();
            status.textContent = ok ? `Correo copiado: ${site.email}` : `Copialo a mano: ${site.email}`;
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(site.email).then(done, fallback);
          else fallback();
          clearTimeout(copy._t);
          copy._t = setTimeout(() => (status.textContent = ""), 4000);
        },
      });
      reach.after(h("div", { class: "reach__tools" }, [copy]));
    }
    $("#socials").replaceChildren(
      ...(site.socials || []).map((s) => {
        const ready = s.url && s.url !== "#";
        const external = ready && /^https?:/i.test(s.url);
        return h("li", {}, [
          h(
            "a",
            {
              class: "social",
              href: ready ? s.url : "#contacto",
              target: external ? "_blank" : null,
              rel: external ? "noopener" : null,
              "data-cursor": "Abrir",
            },
            [
              h("span", {}, [h("span", { class: "social__name", text: s.label }), h("span", { class: "social__handle mono", text: s.handle || "" })]),
              h("span", { class: "social__arrow", "aria-hidden": "true", text: "↗" }),
            ],
          ),
        ]);
      }),
    );
  }

  observeReveals($("main"));

  /* ------------------------------------------------------------------
     Nav: solid on scroll, active section, mobile menu
     ------------------------------------------------------------------ */
  const nav = $("#nav");
  const menu = $("#menu");
  const toggle = $("#menu-toggle");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    $(".nav__toggle-label", toggle).textContent = open ? "Cerrar" : "Menú";
    document.body.classList.toggle("is-locked", open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => (menu.hidden = true), reduce ? 0 : 350);
    }
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && !menu.hidden && setMenu(false));

  const links = $$(".nav__links a");
  const sectionObs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  $$("main > section[id]").forEach((s) => sectionObs.observe(s));

  /* ------------------------------------------------------------------
     Scroll-linked bits: progress bar, nav state, ruler, closing wordmark
     ------------------------------------------------------------------ */
  const bar = $("#progress-bar");
  const ruler = $(".ruler__ticks");
  const closing = $("#closing");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const prog = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    bar.style.transform = `scaleX(${prog})`;
    nav.classList.toggle("is-solid", scrollY > 24);
    ruler.style.setProperty("--ph", `${8 + prog * 84}%`);
    // fills from the moment the wordmark enters the screen until just before the end of the page
    const start = closing.getBoundingClientRect().top + scrollY - innerHeight;
    const span = Math.max(1, max - start);
    const f = reduce ? 1 : clamp((scrollY - start) / (span * 0.85), 0, 1);
    closing.style.setProperty("--fill", `${(f * 100).toFixed(1)}%`);
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Micro-interactions: magnetic buttons + custom cursor (mouse only)
     ------------------------------------------------------------------ */
  if (finePointer && !reduce) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });

    const c = $("#cursor");
    const label = $("#cursor-label");
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let cx = x;
    let cy = y;
    window.addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
      },
      { passive: true },
    );
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      c.classList.toggle("is-big", !!t);
      label.textContent = t ? t.dataset.cursor : "";
    });
    const follow = () => {
      cx = lerp(cx, x, 0.22);
      cy = lerp(cy, y, 0.22);
      c.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }

  /* ------------------------------------------------------------------
     Deep link: …/#id-del-proyecto opens that project
     ------------------------------------------------------------------ */
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const idx = projects.findIndex((p) => p.id === id);
    if (idx >= 0) openViewer(idx);
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();
