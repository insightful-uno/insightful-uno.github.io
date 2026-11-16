/* Walk with Red · hand-built worlds.
   Each entry turns one comic's level into its own world: backdrop, obstacles, characters,
   outfit and a story moment. Keys match the level keys in levels.js. Anything a world
   leaves out falls back to the level's template settings.

   Hooks (all optional):
     level    overrides for the level data (obs, target, props, npcs, captions...)
     sprites  { name: { rows, pal } } extra pixel sprites (usable as npcs or props)
     obs      { type: { w, h, y, vx, draw(o, x, y, t) } } obstacles
     targets  { kind: { draw(tg, x, t), react(tg, S), line } } pee targets
     outfit   palette overrides for Red (W/w = briefs)
     reset(S) update(dt, S, p) bg(t, S) mid(t, S) fg(t, S) drawNpc(n, x, t)       */
window.RED_WORLDS = {};
(() => {
const W = window.RED_WORLDS;

/* ---------- shared bits other comics can reuse ---------- */
const lerp = (a, b, u) => a + (b - a) * u;
function mix(c1, c2, u) {
  const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), a = p(c1), b = p(c2);
  return "#" + a.map((v, i) => Math.round(lerp(v, b[i], u)).toString(16).padStart(2, "0")).join("");
}
function disc(A, c, x, y, r) { const k = A.ctx; k.fillStyle = c; k.beginPath(); k.arc(Math.round(x), Math.round(y), r, 0, 7); k.fill(); }
function puff(A, x, y, r, c, a) { const k = A.ctx; k.globalAlpha = a == null ? 1 : a; disc(A, c, x, y, r); disc(A, c, x - r * .8, y + r * .3, r * .7); disc(A, c, x + r * .8, y + r * .25, r * .75); k.globalAlpha = 1; }
const sx = (A, wx, f = 1) => Math.round(wx - A.S.camX * f);           // world x -> screen x at a parallax factor
function confetti(A, S, n) { for (let i = 0; i < n; i++) S.fx.push({ kind: "spark", x: S.camX + Math.random() * A.W, y: 120 + Math.random() * 60, vx: (Math.random() - .5) * 30, vy: -20 - Math.random() * 30, t: -Math.random() * .8, life: 2.6 }); }
const OWL = (eye, extra) => ({ pal: { G: "#5ab83a", g: "#2f7d22", Y: "#e8c23a", h: "#f59ab4" }, rows: [
  "..g.......g..", ".gGg.....gGg.", ".GGGGGGGGGGG.", ...(extra || []),
  "GGEEEGGGEEEGG", eye, "GGEEEGYGEEEGG", "GGGGGYYYGGGGG", "GGGGGGYGGGGGG",
  "gGGGGGGGGGGGg", "gGGGGGGGGGGGg", "gGGGGGGGGGGGg", ".gGGGGGGGGGg.", "..gGGGGGGGg..", "...YY...YY...", "..YYY...YYY.."] });
W.__shared = { lerp, mix, disc, puff, sx, confetti, OWL };

/* =====================================================================
   KRAKUSSY: 3:33 AM, a search for "best way to summon a Kraken",
   a chalk circle by the pool, and it actually works.
   ===================================================================== */
W["krakussy"] = A => {
  const R = A.R, G = A.G, POOL = [600, 905], KX = 745;
  const st = () => A.S.kr;
  function summon(S, how) {
    if (S.kr.on) return; S.kr.on = true; S.kr.t = 0;
    A.showCaption(how === "pee" ? "...it worked." : "Close enough. It worked.");
    for (let i = 0; i < 24; i++) S.fx.push({ kind: "spark", x: 560 + (Math.random() - .5) * 40, y: 4 + Math.random() * 30, vx: (Math.random() - .5) * 50, vy: 30 + Math.random() * 40, t: 0, life: 1.1 });
  }
  function tentacle(x, base, h, t, ph, c, c2) {   // a curling purple arm, x/base in screen px
    const seg = j => { const u = j / Math.max(1, h); return [Math.round(Math.sin(t * 3 + ph + u * 3) * u * 5), Math.max(2, Math.round(6 - u * 4))]; };
    for (let j = 0; j < h; j++) { const [dx, w] = seg(j); R(A.C.ink, x + dx - 1, base - j - 2, w + 2, 2); }
    for (let j = 0; j < h; j++) { const [dx, w] = seg(j); R(c, x + dx, base - j - 1, w, 1); if (j % 5 === 3) R(c2, x + dx + w - 2, base - j - 1, 1, 1); }
    const tip = Math.round(Math.sin(t * 3 + ph + 3) * 5);
    R(c, x + tip - 2, base - h - 3, 3, 2); R(A.C.ink, x + tip - 3, base - h - 4, 1, 3);
  }
  return {
    outfit: { W: "#E8C23A", w: "#5aa83a" },                       // yellow trunks, green octopus print
    sprites: { chalk: { rows: ["E", "E", "E", "E", "E"] } },
    level: {
      obs: [["kr_chair", 120], ["kr_float", 300], ["kr_float", 420], ["kr_tent", 650], ["kr_ink", 700], ["kr_tent", 735], ["kr_ink", 790], ["kr_tent", 830]],
      target: "kr_circle", targetAt: 560, prop: "chalk", propAt: 175,
      captions: [[30, "3:33 AM. One more search."], [180, "Step 1: chalk. Step 2: backyard."], [430, "Step 3: draw the circle. Step 4: ...improvise."]],
      npcs: []
    },
    obs: {
      kr_chair: { w: 12, h: 13, y: 0, vx: -38, draw(o, x, y, t) {   // office chair rolling across the bedroom
        R(A.C.ink, x + 1, y, 10, 7); R("#3a3a4a", x + 2, y + 1, 8, 5); R(A.C.ink, x + 1, y + 7, 10, 2); R("#55556a", x + 2, y + 7, 8, 1);
        R(A.C.ink, x + 5, y + 9, 2, 3); R(A.C.ink, x + 1, y + 11, 10, 1); const s = Math.floor(t * 10) % 2; R("#888", x + 1 + s, y + 12, 2, 1); R("#888", x + 8 - s, y + 12, 2, 1); } },
      kr_float: { w: 12, h: 8, y: 0, vx: -62, draw(o, x, y, t) {     // pink pool float rolling across the lawn
        const f = Math.floor(t * 8) % 4;
        R(A.C.ink, x + 2, y, 8, 8); R(A.C.ink, x, y + 2, 12, 4); R("#ff8fc4", x + 3, y + 1, 6, 6); R("#ff8fc4", x + 1, y + 3, 10, 2);
        R("#fff", x + 3 + (f % 2) * 4, y + 1 + (f > 1 ? 4 : 0), 2, 2); R(A.C.ink, x + 5, y + 3, 2, 2); } },
      kr_tent: { w: 8, h: 0, y: 0, vx: 0, tough: "SLURP", draw(o, x, y, t) {
        if (!st().on || o.h < 2) return; tentacle(x + 1, G + 1, o.h, t, o.x * .1, "#a87ae0", "#f2c4ff");
        R("#2a4a8a", x - 4, G - 1, 16, 2); } },                    // little splash ring where it breaks the lawn
      kr_ink: { w: 9, h: 6, y: 16, vx: -125, draw(o, x, y, t) {
        if (!st().on) return; const w = Math.floor(t * 10) % 2;
        R(A.C.ink, x, y + 1, 9, 4); R(A.C.ink, x + 2, y, 5, 6); R("#2a1a3a", x + 1, y + 2, 7, 2); R("#2a1a3a", x + 9, y + 2 + w, 3, 1); R("#2a1a3a", x + 12, y + 3 - w, 2, 1); } }
    },
    targets: {
      kr_circle: { line: "By the power of... pee?", lineY: 30, draw(tg, x, t) {
        const on = st().on, c = on ? (Math.floor(t * 6) % 2 ? "#e2a8ff" : "#c86ed2") : "#f4f4f2";
        for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; R(c, x + Math.round(Math.cos(a) * 18), G + 2 + Math.round(Math.sin(a) * 3), 2, 1); }
        const pts = [0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; return [x + Math.cos(a) * 17, G + 2 + Math.sin(a) * 3]; });
        for (let i = 0; i < 5; i++) { const [a1, b1] = pts[i], [a2, b2] = pts[(i + 2) % 5]; for (let u = 0; u <= 1; u += .08) R(c, lerp(a1, a2, u), lerp(b1, b2, u), 1, 1); }
        pts.forEach(([px, py], i) => { R("#f4f4f2", px, py - 4, 1, 3); if (Math.floor(t * 8 + i) % 3) R("#ffcf4a", px, py - 6, 1, 2); });
        if (on) { A.ctx.globalAlpha = .18 + Math.sin(t * 4) * .08; R("#c86ed2", x - 22, G - 30, 44, 30); A.ctx.globalAlpha = 1; } },
        react(tg, S) { summon(S, "pee"); } }
    },
    reset(S) { S.kr = { on: false, t: 0, love: false }; S.obs.forEach(o => { if (o.type === "kr_tent") { o.h = 0; o.off = true; } if (o.type === "kr_ink") { o.wait = true; o.off = true; } }); },
    update(dt, S, p) {
      const k = S.kr; k.t += dt;
      if (!k.on && p.x > 615) summon(S, "walk");
      for (const o of S.obs) {
        if (o.type === "kr_tent") {   // arms rise out of the lawn in turns once it's awake
          if (!k.on) { o.h = 0; o.off = true; continue; }
          const c = ((k.t * .55 + o.x * .013) % 1); const up = c < .15 ? c / .15 : c < .55 ? 1 : c < .7 ? 1 - (c - .55) / .15 : 0;
          o.h = Math.round(up * 26); o.off = o.h < 7;
        }
        if (o.type === "kr_ink") { if (!k.on) { o.active = false; o.off = true; } else if (o.wait && k.t > 1.2) { o.wait = false; o.off = false; } }
      }
      if (k.on && !k.love && p.x > 862) { k.love = true; A.say("Hey there, sailor.", KX, 96, 2.6); }
      if (k.love && Math.random() < dt * 4) S.fx.push({ kind: "heart", x: KX - 30 + Math.random() * 60, y: 70 + Math.random() * 30, vx: (Math.random() - .5) * 8, vy: 14, t: 0, life: 2.2 });
    },
    bg(t, S) {
      const cam = S.camX;
      A.sky({ sky: ["#0f1830", "#162044", "#1d2858"] }); A.stars({});
      A.layer(.08, 110, (x, k) => { const y = 18 + A.hash(k, 3) * 26; puff(A, x + 30, y, 7, "#5a5a8a", .5);
        if (A.hash(k, 4) > .6) { const hx = x + 70, hy = y + 6; R("#7a6a9a", hx, hy, 3, 2); R("#7a6a9a", hx + 4, hy, 3, 2); R("#7a6a9a", hx, hy + 2, 7, 2); R("#7a6a9a", hx + 1, hy + 4, 5, 1); R("#7a6a9a", hx + 3, hy + 5, 1, 1); } });
      disc(A, "#f3d23b", 280, 24, 9); disc(A, "#162044", 284, 21, 8);
      // wooden fence along the backyard
      A.layer(.6, 7, (x, k) => { const wx = k * 7; if (wx < 150) return; R("#8a5a32", x, 96, 6, 40); R("#6a4224", x + 6, 96, 1, 40); R("#a8703a", x + 1, 96, 1, 40); R("#6a4224", x, 96, 6, 1); });
      A.layer(.6, 7, (x, k) => { if (k * 7 >= 150) { R("#6a4224", x, 104, 7, 2); R("#6a4224", x, 124, 7, 2); } });
      // the Kraken, rising out of the pool
      const kr = S.kr, rise = kr.on ? A.clamp(kr.t / 2.4, 0, 1) : 0, kx = sx(A, KX, .92);
      if (rise > 0 && kx > -120 && kx < A.W + 120) {
        const top = G - 14 - Math.round(rise * 92), bob = Math.round(Math.sin(t * 1.6) * 2);
        for (let i = 0; i < 4; i++) tentacleBig(kx + (i < 2 ? -46 - i * 16 : 46 + (i - 2) * 16), G - 12, Math.round(rise * (44 + i * 6)), t, i);
        A.ctx.fillStyle = "#14110F"; A.ctx.beginPath(); A.ctx.ellipse(kx, top + 40 + bob, 34, 48, 0, 0, 7); A.ctx.fill();
        A.ctx.fillStyle = "#a87ae0"; A.ctx.beginPath(); A.ctx.ellipse(kx, top + 40 + bob, 32, 46, 0, 0, 7); A.ctx.fill();
        A.ctx.fillStyle = "#8a5ac8"; A.ctx.beginPath(); A.ctx.ellipse(kx + 12, top + 46 + bob, 14, 36, 0, 0, 7); A.ctx.fill();
        R("#c8a0f0", kx - 18, top + 14 + bob, 6, 3); [[-20, 52], [-8, 64], [18, 58], [-24, 30], [6, 72]].forEach(([dx, dy]) => R("#8a5ac8", kx + dx, top + dy + bob, 4, 3));
        const look = A.clamp((S.p.x - KX) / 60, -1, 1) * 2;
        [-13, 13].forEach(ex => { const ey = top + 34 + bob; R("#14110F", kx + ex - 7, ey - 3, 14, 8); R("#f3d23b", kx + ex - 6, ey - 2, 12, 6); R("#14110F", kx + ex + Math.round(look) - 1, ey - 2, 2, 6); });
        if (kr.love) { R("#ff8fc4", kx - 22, top + 44 + bob, 5, 2); R("#ff8fc4", kx + 17, top + 44 + bob, 5, 2); }
        if (kr.t < 3.2) { const a = A.clamp(1 - (kr.t - 1.6) / 1.6, 0, 1); for (let i = 0; i < 9; i++) puff(A, kx - 50 + i * 12, top + 20 + Math.sin(i * 2 + t) * 8, 12, "#ece8f4", .85 * a); }
      }
      // pool strip: water, then the stone coping in front of the Kraken's base
      const p0 = sx(A, POOL[0], .92), p1 = sx(A, POOL[1], .92);
      if (p1 > 0 && p0 < A.W) { R("#3a7ad0", p0, G - 16, p1 - p0, 12); A.layer(.92, 9, (x, k) => { if (k * 9 > POOL[0] && k * 9 < POOL[1] - 9) R("#7ab8f0", x + (Math.floor(t * 2 + k) % 4), G - 13 + (k % 3) * 3, 4, 1); });
        for (let x = p0; x < p1; x += 6) { R("#b8b0a4", x, G - 5, 5, 3); R("#8a8478", x + 5, G - 5, 1, 3); } R("#b8b0a4", p0 - 3, G - 17, p1 - p0 + 6, 2); }
      // lawn
      R("#2f7a2b", 0, G, A.W, 1); R("#2a6a26", 0, G + 1, A.W, 29);
      A.layer(1, 5, (x, k) => R("#3a8a2a", x, G + 1 + (k % 4) * 6, 1, 2));
      // the bedroom, until the sliding door
      const door = sx(A, 210);
      if (door > 0) {
        R("#9fb4bc", 0, 0, door, G); R("#7a8a90", 0, G - 4, door, 4); R("#5a6a74", 0, G, door, 30); A.layer(1, 12, (x) => { if (x < door) R("#4a5a64", x, G + 1, 1, 29); });
        const px = sx(A, 40);                                                           // Kraken poster
        R(A.C.ink, px, 40, 26, 34); R("#f4f4f2", px + 1, 41, 24, 32); R("#a87ae0", px + 8, 46, 10, 10); R("#a87ae0", px + 6, 56, 2, 8); R("#a87ae0", px + 11, 56, 2, 9); R("#a87ae0", px + 16, 56, 2, 8);
        R("#f3d23b", px + 10, 50, 2, 2); R("#f3d23b", px + 14, 50, 2, 2); R("#E8271A", px + 4, 67, 18, 2);
        const dx = sx(A, 95);                                                           // desk, CRT and lava lamp
        R(A.C.ink, dx - 1, 104, 72, 4); R("#c8d0d4", dx, 105, 70, 2); R("#8a9298", dx + 2, 108, 3, 42); R("#8a9298", dx + 64, 108, 3, 42);
        R(A.C.ink, dx + 22, 74, 34, 30); R("#d8d0b4", dx + 23, 75, 32, 28); R(A.C.ink, dx + 26, 78, 26, 18);
        const fl = Math.floor(t * 9) % 7 ? "#9fd8b8" : "#c8f0d8"; R(fl, dx + 27, 79, 24, 16); R("#f4f4f2", dx + 29, 81, 20, 3); R(A.C.ink, dx + 30, 82, 1, 1);
        for (let i = 0; i < 6; i++) R("#3a6a5a", dx + 29 + i * 3, 87 + (i % 2) * 3, 2, 1);
        R(A.C.ink, dx + 18, 101, 38, 3); R("#d8d0b4", dx + 19, 101, 36, 2);
        R(A.C.ink, dx + 6, 88, 6, 16); R("#ff5fa2", dx + 7, 92 + Math.floor(t * 2) % 3, 4, 4); R("#7a2a5a", dx + 7, 89, 4, 2);
        ctxGlow(dx + 39, 86, "#9fd8b8", .10 + (Math.floor(t * 9) % 7 ? 0 : .08));
        R(A.C.ink, door - 3, 30, 4, G - 30); R("#d8dee2", door - 2, 30, 2, G - 30);   // sliding door frame
      }
      function ctxGlow(x, y, c, a) { A.ctx.globalAlpha = a; disc(A, c, x, y, 26); A.ctx.globalAlpha = 1; }
      function tentacleBig(x, base, h, t, i) {
        const seg = j => { const u = j / Math.max(1, h); return [Math.round(Math.sin(t * 1.8 + i * 1.7 + u * 3) * u * 10), Math.max(3, Math.round(9 - u * 6))]; };
        for (let j = 0; j < h; j++) { const [dx, w] = seg(j); R(A.C.ink, x + dx - 1, base - j - 2, w + 2, 2); }
        for (let j = 0; j < h; j++) { const [dx, w] = seg(j); R(i % 2 ? "#8a5ac8" : "#a87ae0", x + dx, base - j - 1, w, 1); if (j % 6 === 3) R("#f2c4ff", x + dx + 1, base - j - 1, 2, 1); }
      }
    },
    fg(t, S) {                                                           // headband from the comic
      const r = A.red; if (r.back || r.duck) return;
      R("#f4f4f2", r.x - 6, r.top + 3, 10, 1); R("#f4f4f2", r.face > 0 ? r.x - 8 : r.x + 4, r.top + 4 + Math.floor(t * 6) % 2, 3, 1);
      for (const f of S.fx) if (f.kind === "heart" && f.t >= 0) { const x = Math.round(f.x - S.camX), y = Math.round(A.G - f.y); A.ctx.globalAlpha = A.clamp(1 - f.t / f.life, 0, 1);
        R("#ff8fc4", x, y, 2, 2); R("#ff8fc4", x + 3, y, 2, 2); R("#ff8fc4", x, y + 1, 5, 2); R("#ff8fc4", x + 1, y + 3, 3, 1); R("#ff8fc4", x + 2, y + 4, 1, 1); A.ctx.globalAlpha = 1; }
    }
  };
};

/* =====================================================================
   YOU ARE ___ THE FATHER: hatched in an owl nest, then a live
   paternity reveal on a daytime talk show.
   ===================================================================== */
W["you-are-the-father"] = A => {
  const R = A.R, G = A.G, STAGE = 300, HOST = 900, CH1 = 790, CH2 = 822;
  const mom = OWL("GGEKEGGGEKEGG", null), dad = OWL("GGEEKGGGKEEGG", ["GKKGGGGGGGKKG"]);
  mom.rows[6] = "hGGGGYYYGGGGh";   // blush
  return {
    sprites: { owlMom: mom, owlDad: dad, owlDadSad: OWL("GGEKEGGGEKEGG", ["GGKKGGGGGKKGG"]),
      host: { pal: { a: "#E8271A", d: "#e8c870", b: "#6a9ae0", c: "#5a88d0", s: "#14110F" }, rows: [
        "...dddd...", "..dddddd..", "..daaaad..", "..aaKaaK..", "..aaaaaa..", "...aKKa...", "....aa....", "..bbbbbb..", ".bbbbbbbb.", ".bbbEbbbbK", ".abbbbbbaK",
        "..bbbbbb..", "..cccccc..", "..cccccc..", "..cc..cc..", "..cc..cc..", "..cc..cc..", "..cc..cc..", ".sss..sss."] },
      mic: { rows: ["KK", "KK", ".K", ".K", ".K"] } },
    level: {
      obs: [["yt_twig", 150], ["yt_feather", 240], ["yt_cam", 400], ["yt_card", 480], ["yt_cam", 590], ["yt_card", 700], ["yt_feather", 760]],
      target: "yt_podium", targetAt: 660, prop: "mic", propAt: 360,
      npcs: [["owlMom", 92, 1, "He has your eyes."], ["owlDad", 116, -1, "...that's not mine."], ["owlMom", CH1, -1], ["owlDad", CH2, -1], ["host", HOST, -1, "The results are in..."]],
      captions: [[40, "Congratulations. It's a... Red?"], [250, "Mom has some explaining to do."], [330, "One DNA test later. Live."]]
    },
    obs: {
      yt_twig: { w: 14, h: 5, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y + 1, 14, 3); R("#7a5432", x + 1, y + 2, 12, 1); R(A.C.ink, x + 3, y, 2, 2); R(A.C.ink, x + 9, y + 3, 2, 2); } },
      yt_feather: { w: 8, h: 5, y: 15, vx: -38, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 3 + o.x) * 3);
        R(A.C.ink, x, yy + 1, 8, 3); R("#5ab83a", x + 1, yy + 2, 6, 1); R("#2f7d22", x + 4, yy + 1, 1, 3); } },
      yt_cam: { w: 16, h: 18, y: 0, vx: -48, tough: "We're rolling!", draw(o, x, y, t) {
        R(A.C.ink, x, y, 14, 9); R("#4a4a52", x + 1, y + 1, 12, 7); R(A.C.ink, x - 3, y + 3, 4, 4); R("#9fd0ee", x - 2, y + 4, 2, 2);
        if (Math.floor(t * 3) % 2) R("#ff3a3a", x + 11, y + 2, 1, 1);
        R(A.C.ink, x + 6, y + 9, 2, 6); R(A.C.ink, x + 1, y + 15, 12, 1); R("#888", x + 1 + Math.floor(t * 8) % 2, y + 16, 2, 2); R("#888", x + 10, y + 16, 2, 2); } },
      yt_card: { w: 9, h: 6, y: 17, vx: -140, draw(o, x, y, t) { const s = Math.floor(t * 12) % 2;
        R(A.C.ink, x, y + s, 9, 6); R("#f4f4f2", x + 1, y + 1 + s, 7, 4); R("#3460BE", x + 2, y + 2 + s, 5, 1); R("#3460BE", x + 2, y + 4 + s, 3, 1); } }
    },
    targets: {
      yt_podium: { line: "Results: soggy.", draw(tg, x, t) {
        R(A.C.ink, x - 9, G - 22, 18, 22); R("#6a9ae0", x - 8, G - 21, 16, 21); R("#f4f4f2", x - 8, G - 21, 16, 3); R("#f3d23b", x - 5, G - 14, 10, 6);
        R(A.C.ink, x - 4, G - 27, 8, 5); R(tg.done ? "#d8c070" : "#f4f4f2", x - 3, G - 26, 6, 3); R("#E8271A", x - 1, G - 25, 2, 1);
        if (tg.done) R("#f3d23b", x - 8, G - 2, 16, 2); } }
    },
    reset(S) { S.yt = { hatch: 0, shells: false, drum: -1, cheer: 0, said: 0 }; },
    update(dt, S, p) {
      const y = S.yt; y.hatch += dt;
      if (!y.shells && (y.hatch > 1.3 || p.x > 38)) { y.shells = true; A.say("CRACK", 30, 34, .9);
        for (let i = 0; i < 10; i++) S.fx.push({ kind: "shell", x: 30 + (i - 5) * 2, y: 10 + (i % 3) * 5, vx: (i - 5) * 18, vy: 60 + (i % 4) * 15, t: 0, life: .9 }); }
      for (const f of S.fx) if (f.kind === "shell") f.vy -= 260 * dt;
      // the reveal: walk up to Maury and the drumroll starts
      if (y.drum < 0 && p.x > HOST - 60) { y.drum = 0; A.showCaption("YOU... are..."); }
      if (y.drum >= 0) { const before = y.drum; y.drum += dt;
        if (before < 2.2 && y.drum >= 2.2) { A.showCaption("...THE FATHER!"); y.cheer = 6; confetti(A, S, 60);
          const d = S.npcs.find(n => n.kind === "owlDad" && n.x > STAGE); if (d) { d.kind = "owlDadSad"; d.face = 1; d.walk = 1; A.say("I'm out.", d.x, 22, 1.6); }
          A.redSays("YEAH! That's my... wait.", 2.6); } }
      for (const n of S.npcs) if (n.walk) n.x += 26 * dt;
      if (y.cheer > 0) { y.cheer -= dt; if (Math.random() < dt * 8) confetti(A, S, 3); }
    },
    bg(t, S) {
      const st = sx(A, STAGE);
      // nest in the sky
      if (st > 0) {
        A.sky({ sky: ["#3a7ad8", "#4f8ce0", "#6aa2e8"] }); A.clouds({});
        A.layer(.3, 70, (x, k) => { if (k * 70 < STAGE + 80) puff(A, x + 30, 60 + A.hash(k, 2) * 20, 10, "#f4f4f2", .9); });
        R("#4a3018", 0, G - 10, st, 10); A.layer(1, 6, (x, k) => { if (x < st) { R("#6a4a2a", x, G - 12 + (k % 3), 7, 1); R("#2f1f10", x + 2, G - 7 + (k % 2) * 3, 5, 1); } });
        R("#3a2614", 0, G, st, 30); A.layer(1, 9, (x, k) => { if (x < st) R("#5a3d22", x, G + 3 + (k % 5) * 5, 8, 1); });
        const eg = sx(A, 30);   // the egg Red hatched from
        if (!S.yt.shells) { const j = Math.round(Math.sin(t * 30) * (S.yt.hatch > .6 ? 1 : 0));
          A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(eg + j, G - 17, 12, 17, 0, 0, 7); A.ctx.fill();
          A.ctx.fillStyle = "#e8e8e4"; A.ctx.beginPath(); A.ctx.ellipse(eg + j, G - 17, 11, 16, 0, 0, 7); A.ctx.fill(); R("#c8c8c4", eg + 4 + j, G - 24, 3, 12);
          if (S.yt.hatch > .5) { R(A.C.ink, eg - 3 + j, G - 27, 1, 4); R(A.C.ink, eg - 2 + j, G - 24, 3, 1); R(A.C.ink, eg + 1 + j, G - 25, 1, 3); } }
        else { R("#e8e8e4", eg - 11, G - 9, 9, 9); R("#e8e8e4", eg + 3, G - 8, 8, 8); R(A.C.ink, eg - 11, G - 10, 9, 1); R(A.C.ink, eg + 3, G - 9, 8, 1); }
      }
      // talk show stage
      if (st < A.W) {
        const x0 = Math.max(0, st);
        R("#1f3aa8", x0, 0, A.W - x0, G); A.layer(1, 8, (x, k) => { if (x >= st) { R("#16288a", x + 5, 0, 2, G); R("#3a5ad0", x + 1, 0, 1, G); } });
        A.layer(.25, 60, (x, k) => { if (x + 10 > st) { R("#555", x + 14, 0, 2, 8); disc(A, "#ffffff", x + 15, 10, 4); A.ctx.globalAlpha = .06; R("#ffffff", x + 4, 14, 22, G - 14); A.ctx.globalAlpha = 1; } });
        R("#e8c82a", x0, G, A.W - x0, 30); A.layer(1, 14, (x, k) => { if (x >= st) R("#d8b81f", x, G + 4 + (k % 3) * 8, 9, 1); });
        const sp = sx(A, 806);                                   // spotlight on the chairs
        A.ctx.globalAlpha = .22; A.ctx.fillStyle = "#fff6b0"; A.ctx.beginPath(); A.ctx.moveTo(sp - 10, 0); A.ctx.lineTo(sp + 10, 0); A.ctx.lineTo(sp + 46, G + 8); A.ctx.lineTo(sp - 46, G + 8); A.ctx.fill(); A.ctx.globalAlpha = 1;
        R(A.C.ink, st - 4, 0, 6, G); R("#8a1a1a", st - 3, 0, 4, G);      // curtain edge
      }
    },
    mid(t, S) {                                                  // the two armchairs on stage
      [CH1, CH2].forEach(cx => { const x = sx(A, cx); if (x < -30 || x > A.W + 30) return;
        R(A.C.ink, x - 11, G - 22, 22, 22); R("#a8784a", x - 10, G - 21, 20, 14); R("#8a5a32", x - 10, G - 8, 20, 3); R("#c89a6a", x - 8, G - 19, 16, 2);
        R("#888", x - 9, G - 5, 1, 5); R("#888", x + 8, G - 5, 1, 5); });
    },
    drawNpc(n, x, t) {
      if (n.kind !== "host" && !n.kind.startsWith("owl")) return false;
      const im = A.NS[n.face < 0 ? n.kind + "L" : n.kind], onChair = n.x > STAGE && !n.walk && n.kind.startsWith("owl");
      const bob = n.kind.startsWith("owl") ? Math.floor(t * 2 + n.x) % 2 : 0;
      A.ctx.drawImage(im, Math.round(x - im.width / 2), G - im.height + 1 - (onChair ? 9 : 0) - bob);
      if (n.kind === "host") { const mx = x + (n.face < 0 ? -6 : 4); R(A.C.ink, mx, G - 15, 2, 4); R("#555", mx, G - 11, 1, 3); }
      return true;
    },
    fg(t, S) {
      for (const f of S.fx) if (f.kind === "shell" && f.t >= 0) { const x = Math.round(f.x - S.camX), y = Math.round(A.G - f.y); R(A.C.ink, x - 1, y - 1, 4, 3); R("#e8e8e4", x, y, 2, 1); }
      // studio audience in the foreground
      const st = sx(A, STAGE + 20, 1.15), up = S.yt.cheer > 0;
      A.layer(1.15, 11, (x, k) => { if (x < st) return; const b = Math.floor(t * (up ? 8 : 2) + k) % 2;
        R("#0a0a14", x, A.H - 13 - b, 9, 13); A.ctx.fillStyle = "#0a0a14"; A.ctx.beginPath(); A.ctx.arc(x + 4, A.H - 15 - b, 5, 0, 7); A.ctx.fill();
        if (up && k % 2) { R("#0a0a14", x + (k % 4 ? 0 : 7), A.H - 30 - b, 2, 12); R("#0a0a14", x - 1 + (k % 4 ? 0 : 7), A.H - 32 - b, 4, 3); } });
    }
  };
};

/* =====================================================================
   SURVIVOR'S HUNGER: plane down, one yellow raft, a lot of days,
   and your raft buddy starts seeing a burger.
   ===================================================================== */
W["survivors-hunger"] = A => {
  const R = A.R, G = A.G, HUNGRY = 520, SHORE = 830;
  const blue = { R: "#2f5fd0", r: "#1f45a8", W: "#2f5fd0", w: "#1f45a8" };
  const spr = {}; ["stand", "a", "b", "c", "d"].forEach(k => spr["blue_" + k] = { rows: A.SP[k], pal: blue });
  const SKY = [["#a6e2ec", "#6ac8c8"], ["#f6b07a", "#e8907a"], ["#1a2a4a", "#14304a"], ["#f4c8d0", "#8ac8c8"]];
  function skyAt(cam) { const u = (cam / 260) % 4, i = Math.floor(u), f = u - i, a = SKY[i], b = SKY[(i + 1) % 4], e = A.clamp((f - .7) / .3, 0, 1);
    return [mix(a[0], b[0], e), mix(a[1], b[1], e), i === 2 ? 1 - e : i === 1 ? e : 0]; }
  return {
    sprites: Object.assign(spr, { pen: { rows: ["K", "B", "B", "B", "E"] } }),
    level: {
      obs: [["sh_gull", 170], ["sh_bag", 260], ["sh_wave", 340], ["sh_gull", 470], ["sh_bag", 600], ["sh_wave", 690], ["sh_gull", 760]],
      target: "sh_bottle", targetAt: 410, prop: "pen", propAt: 120,
      npcs: [],
      captions: [[30, "Plane went down. Raft came up."], [230, "Day 12. Keeping count."], [380, "Day 31. Bottle!"], [SHORE, "LAND!"]]
    },
    obs: {
      sh_gull: { w: 10, h: 6, y: 16, vx: -105, draw(o, x, y, t) { const f = Math.floor(t * 10 + o.x) % 2;
        R(A.C.ink, x + 2, y + 2, 7, 3); R("#f4f4f2", x + 3, y + 3, 5, 1); R(A.C.ink, x + (f ? 0 : 1), y + (f ? 0 : 3), 4, 2); R(A.C.ink, x + 7, y + (f ? 0 : 3), 4, 2);
        R("#c8c8c8", x + 1 + (f ? 0 : 1), y + (f ? 1 : 3), 2, 1); R("#f3a91f", x, y + 3, 2, 1); } },
      sh_bag: { w: 12, h: 9, y: 0, vx: 0, draw(o, x, y, t) { const b = Math.floor(t * 2 + o.x) % 2;
        R(A.C.ink, x, y + 1 - b, 12, 9); R("#8a5a32", x + 1, y + 2 - b, 10, 7); R("#6a4224", x + 1, y + 5 - b, 10, 1); R(A.C.ink, x + 4, y - 1 - b, 4, 2); R("#f4f4f2", x + 9, y + 3 - b, 2, 3); } },
      sh_wave: { w: 13, h: 10, y: 0, vx: -88, draw(o, x, y, t) { const f = Math.floor(t * 8) % 2;
        R(A.C.ink, x + 1, y + 2, 12, 8); R("#5ab8c0", x + 2, y + 3, 10, 7); R(A.C.ink, x + 6, y, 7, 3); R("#f4f4f2", x + 7, y + 1, 5, 2); R("#f4f4f2", x + 3, y + 3 + f, 3, 1); R("#9ae0e6", x + 2, y + 7, 9, 1); } }
    },
    targets: {
      sh_bottle: { line: "Message received.", draw(tg, x, t) { const b = Math.floor(t * 2) % 2;
        R(A.C.ink, x - 3, G - 13 + b, 7, 13); R("#3a8a3a", x - 2, G - 12 + b, 5, 12); R("#5aa85a", x - 2, G - 12 + b, 1, 12); R(A.C.ink, x - 1, G - 16 + b, 3, 4); R("#a8783a", x, G - 15 + b, 1, 2);
        R("#f4e8c8", x - 1, G - 9 + b, 3, 6); if (tg.done) R("#f3d23b", x - 2, G - 5 + b, 5, 3); } }
    },
    reset(S) { S.sh = { bx: 6, bd: 0, face: 1, hungry: false, said: false, chomp: 0, sorry: false }; },
    update(dt, S, p) {
      const s = S.sh;
      if (!s.hungry && p.x > HUNGRY) { s.hungry = true; A.showCaption("Day 47. He's looking at you funny."); A.say("...burger?", s.bx, 40, 2); }
      const atShore = p.x > SHORE, goal = s.hungry && !atShore ? p.x : Math.min(p.x - 24, SHORE - 30), spd = s.hungry ? 62 : 74;
      const d = goal - s.bx, mv = Math.sign(d) * Math.min(Math.abs(d), spd * dt);
      if (Math.abs(d) > 2) { s.bx += mv; s.bd += Math.abs(mv); s.face = Math.sign(d) || s.face; }
      if (s.chomp > 0) s.chomp -= dt;
      if (s.hungry && !atShore && s.chomp <= 0 && p.inv <= 0 && Math.abs(s.bx - p.x) < 8 && p.y < 10) {
        s.chomp = 1.6; p.inv = 1.3; p.kb = 0.16; p.vy = 140; p.onG = false; S.p.x += 10; A.say("CHOMP", p.x, 44, .9); A.redSays("Hey! I'm not a burger!", 2); s.bx -= 34;
      }
      if (atShore && !s.sorry) { s.sorry = true; A.say("...sorry, buddy.", s.bx, 40, 2.4); }
    },
    bg(t, S) {
      const [top, sea, night] = skyAt(S.camX);
      R(top, 0, 0, A.W, 96);
      if (night > 0) { A.ctx.globalAlpha = night; A.stars({}); disc(A, "#f6f1c7", 260, 22, 6); A.ctx.globalAlpha = 1; }
      else disc(A, "#fff6c8", 60 + (S.camX % 1040) / 12, 24, 7);
      R(sea, 0, 96, A.W, G - 96); A.layer(.3, 13, (x, k) => R(mix(sea, "#ffffff", .35), x + (Math.floor(t * 2 + k) % 5), 100 + (k % 5) * 9, 6, 1));
      // the plane going down, still smoking
      const px = sx(A, 150, .6);
      if (px > -60 && px < A.W + 40) {
        for (let i = 0; i < 8; i++) { const u = ((t * .25 + i / 8) % 1); puff(A, px + 6 - u * 30, 90 - u * 80, 5 + u * 8, "#3a3a3a", .8 * (1 - u)); }
        A.ctx.save(); A.ctx.translate(px, 100); A.ctx.rotate(-.9);
        R(A.C.ink, -2, -2, 34, 12); R("#f4f4f2", -1, -1, 32, 10); R("#c8c8c8", -1, 6, 32, 3); for (let i = 0; i < 5; i++) R("#3a5a8a", 4 + i * 5, 1, 2, 2);
        R(A.C.ink, 26, -10, 8, 9); R("#f4f4f2", 27, -9, 6, 8); A.ctx.restore();
        R("#f4f4f2", px - 10, 104, 22, 1);
      }
      // the island and its resort, waiting at the end
      const ix = sx(A, 560, .6);
      if (ix < A.W + 40) {
        R("#8a6a4a", ix - 20, 70, 30, 30); R("#7a5a3a", ix + 4, 60, 34, 40); R("#9a7a5a", ix + 30, 74, 26, 26);
        R(A.C.ink, ix - 2, 68, 50, 26); R("#e8ecf0", ix - 1, 69, 48, 24); R("#8aa0b8", ix - 4, 64, 56, 6); R("#6a80a0", ix + 14, 58, 18, 6);
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) R("#3a5a8a", ix + 3 + i * 7, 73 + j * 9, 4, 5);
        R("#e8c890", ix - 40, 92, 140, 8); R("#f0d8a0", ix - 36, 92, 132, 2);
        [ix - 30, ix + 64].forEach(xx => { R("#6a4a2a", xx, 70, 2, 24); R("#2f8a2b", xx - 7, 66, 16, 4); R("#2f8a2b", xx - 9, 69, 5, 2); R("#2f8a2b", xx + 6, 69, 5, 2); });
        [ix - 6, ix + 12, ix + 30].forEach((xx, i) => { const b = Math.floor(t * 2 + i) % 2; R("#ff8fc4", xx, 102 + b, 3, 4); R("#e870a0", xx, 102 + b, 3, 1); });
      }
      // the raft (and the sand once you make it)
      const shore = sx(A, SHORE + 20);
      R("#14110F", 0, G, A.W, 1); R("#e8d84a", 0, G + 1, Math.min(A.W, Math.max(0, shore)), 29);
      A.layer(1, 30, (x, k) => { if (x > shore) return; R("#f6ec8a", x, G + 2, 26, 1); R("#c8b82a", x + 27, G + 1, 3, 29); });
      R("#f4f0d0", 0, G + 9, Math.max(0, Math.min(A.W, shore)), 1); R("#f4f0d0", 0, G + 19, Math.max(0, Math.min(A.W, shore)), 1);
      A.layer(1, 22, (x, k) => { const wx = k * 22; if (wx < 120 || wx > SHORE - 20 || x > shore) return;   // tally marks, one bundle per day
        for (let i = 0; i < 4; i++) R("#3a3a3a", x + i * 2, G + 11, 1, 6); R("#3a3a3a", x - 1, G + 15, 9, 1); });
      if (shore < A.W) { R("#e8c890", Math.max(0, shore), G + 1, A.W - Math.max(0, shore), 29); A.layer(1, 11, (x, k) => { if (x > shore) R("#d8b478", x, G + 5 + (k % 4) * 6, 2, 1); }); }
      if (night > 0) { A.ctx.globalAlpha = night * .35; R("#0a1430", 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; }
    },
    mid(t, S) {                                                // the raft buddy
      const s = S.sh, x = sx(A, s.bx), moving = Math.abs((S.p.x - (s.hungry ? 0 : 24)) - s.bx) > 3 && !(S.p.x > SHORE && s.bx >= SHORE - 31);
      const key = "blue_" + (moving ? A.WALK[Math.floor(s.bd / 7) % 4] : "stand"), im = A.NS[s.face < 0 ? key + "L" : key];
      A.ctx.drawImage(im, s.face > 0 ? x - 9 : x - (im.width - 9), G - im.height + 1);
      if (s.hungry && S.p.x < SHORE && Math.floor(t * 4) % 2) { R("#9ae0e6", x + (s.face > 0 ? 4 : -6), G - 24, 2, 3); }   // drool
    },
    fg(t, S) {                                                 // what he sees: Red's head is a burger
      const s = S.sh; if (!s.hungry || S.p.x > SHORE + 40 || Math.floor(t * 1.5) % 5 === 0) return;
      const r = A.red; if (r.back) return; const x = r.x - 7, y = r.top - 1 + (r.duck ? 0 : 0);
      R(A.C.ink, x, y, 14, 12); R("#d8963a", x + 1, y + 1, 12, 3); R("#f0b860", x + 3, y + 1, 4, 1); R("#f4f4f2", x + 4, y + 2, 1, 1); R("#f4f4f2", x + 9, y + 2, 1, 1);
      R("#5ab83a", x + 1, y + 4, 12, 1); R("#f3d23b", x + 2, y + 5, 10, 1); R("#6a3a1a", x + 1, y + 6, 12, 2); R("#E8271A", x + 1, y + 8, 12, 1); R("#d8963a", x + 1, y + 9, 12, 2);
    }
  };
};
})();

/* ======================= batch 2: shared parts ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx, confetti, OWL } = W.__shared;

// a curling arm (tentacles, vines). outline pass then fill so it reads as one shape
function arm(A, x, base, h, t, ph, c, c2, w0 = 6, amp = 5) {
  const R = A.R, seg = j => { const u = j / Math.max(1, h); return [Math.round(Math.sin(t * 3 + ph + u * 3) * u * amp), Math.max(2, Math.round(w0 - u * (w0 - 2)))]; };
  for (let j = 0; j < h; j++) { const [dx, w] = seg(j); R(A.C.ink, x + dx - 1, base - j - 2, w + 2, 2); }
  for (let j = 0; j < h; j++) { const [dx, w] = seg(j); R(c, x + dx, base - j - 1, w, 1); if (c2 && j % 5 === 3) R(c2, x + dx + w - 2, base - j - 1, 1, 1); }
}
// sprites for another Red (recoloured), keyed prefix_stand / prefix_a..d
function reds(A, prefix, pal) { const o = {}; ["stand", "a", "b", "c", "d", "jump"].forEach(k => o[prefix + "_" + k] = { rows: A.SP[k], pal }); return o; }
// draw a follower Red (buddy, shadow, mirror enemy) from a simple state {x, y, d, face, moving}
function drawWalker(A, prefix, f, alpha) {
  const x = sx(A, f.x), key = prefix + "_" + (f.y > 1 ? "jump" : f.moving ? A.WALK[Math.floor(f.d / 7) % 4] : "stand"), im = A.NS[f.face < 0 ? key + "L" : key];
  if (alpha != null) A.ctx.globalAlpha = alpha;
  A.ctx.drawImage(im, f.face > 0 ? x - 9 : x - (im.width - 9), A.G - Math.round(f.y || 0) - im.height + 1);
  A.ctx.globalAlpha = 1; return x;
}
function follow(f, goal, spd, dt) { const d = goal - f.x, mv = Math.sign(d) * Math.min(Math.abs(d), spd * dt); f.moving = Math.abs(d) > 2; if (f.moving) { f.x += mv; f.d += Math.abs(mv); f.face = Math.sign(d); } }
// talk-show / competition stage: curtains, lights, floor; audience in front
function stage(A, t, x0, cur, cur2, floor, floor2) {
  const R = A.R; x0 = Math.max(0, x0);
  R(cur, x0, 0, A.W - x0, A.G); A.layer(1, 8, (x) => { if (x >= x0) { R(cur2, x + 5, 0, 2, A.G); R(mix(cur, "#ffffff", .15), x + 1, 0, 1, A.G); } });
  A.layer(.25, 60, (x) => { if (x + 10 > x0) { R("#555", x + 14, 0, 2, 8); disc(A, "#ffffff", x + 15, 10, 4); A.ctx.globalAlpha = .06; R("#ffffff", x + 4, 14, 22, A.G - 14); A.ctx.globalAlpha = 1; } });
  R(floor, x0, A.G, A.W - x0, 30); A.layer(1, 14, (x, k) => { if (x >= x0) R(floor2, x, A.G + 4 + (k % 3) * 8, 9, 1); });
}
function spot(A, x, c = "#fff6b0", a = .22) { const k = A.ctx; k.globalAlpha = a; k.fillStyle = c; k.beginPath(); k.moveTo(x - 10, 0); k.lineTo(x + 10, 0); k.lineTo(x + 46, A.G + 8); k.lineTo(x - 46, A.G + 8); k.fill(); k.globalAlpha = 1; }
function audience(A, t, fromX, cheer, c = "#0a0a14") {
  const R = A.R; A.layer(1.15, 11, (x, k) => { if (x < fromX) return; const b = Math.floor(t * (cheer ? 8 : 2) + k) % 2;
    R(c, x, A.H - 13 - b, 9, 13); A.ctx.fillStyle = c; A.ctx.beginPath(); A.ctx.arc(x + 4, A.H - 15 - b, 5, 0, 7); A.ctx.fill();
    if (cheer && k % 2) { R(c, x + (k % 4 ? 0 : 7), A.H - 30 - b, 2, 12); R(c, x - 1 + (k % 4 ? 0 : 7), A.H - 32 - b, 4, 3); } });
}
// something worn on Red's head: fn(x, top, face) in screen px, skipped while peeing (back turned)
function onHead(A, fn) { const r = A.red; if (r.back) return; fn(r.x, r.top + (r.duck ? 0 : 0), r.face, r.duck); }
function heartFx(A, S) { for (const f of S.fx) if (f.kind === "heart" && f.t >= 0) { const R = A.R, x = Math.round(f.x - S.camX), y = Math.round(A.G - f.y); A.ctx.globalAlpha = A.clamp(1 - f.t / f.life, 0, 1);
  R("#ff8fc4", x, y, 2, 2); R("#ff8fc4", x + 3, y, 2, 2); R("#ff8fc4", x, y + 1, 5, 2); R("#ff8fc4", x + 1, y + 3, 3, 1); R("#ff8fc4", x + 2, y + 4, 1, 1); A.ctx.globalAlpha = 1; } }
function hearts(S, x, y, n) { for (let i = 0; i < n; i++) S.fx.push({ kind: "heart", x: x + (Math.random() - .5) * 20, y: y + Math.random() * 10, vx: (Math.random() - .5) * 10, vy: 16, t: -i * .15, life: 2 }); }
function splash(S, x, y, n, c) { for (let i = 0; i < n; i++) S.fx.push({ kind: "drop", c, x: x + (Math.random() - .5) * 10, y, vx: (Math.random() - .5) * 70, vy: 40 + Math.random() * 60, t: 0, life: 1 }); }
function dropFx(A, S, dt) { for (const f of S.fx) if (f.kind === "drop") { if (dt) f.vy -= 240 * dt; else if (f.t >= 0 && f.y > -2) A.R(f.c || "#9fe0ff", Math.round(f.x - S.camX), Math.round(A.G - f.y), 2, 2); } }
function crowdText(A, S, text, x, y) { S.fx.push({ kind: "txt", text, x, y, vx: 0, vy: 10, t: 0, life: 1.2 }); }
function txtFx(A, S) { const k = A.ctx; k.font = "bold 7px monospace"; k.textAlign = "center";
  for (const f of S.fx) if (f.kind === "txt" && f.t >= 0) { k.globalAlpha = A.clamp(1 - f.t / f.life, 0, 1); k.fillStyle = A.C.ink; k.fillText(f.text, Math.round(f.x - S.camX) + 1, Math.round(A.G - f.y) + 1); k.fillStyle = f.c || "#ffffff"; k.fillText(f.text, Math.round(f.x - S.camX), Math.round(A.G - f.y)); }
  k.globalAlpha = 1; }
function smoke(A, x, y, t, n = 7, c = "#2a2a2a", spread = 26, rise = 70) { for (let i = 0; i < n; i++) { const u = (t * .22 + i / n) % 1; puff(A, x - u * spread, y - u * rise, 4 + u * 9, c, .75 * (1 - u)); } }
W.__shared2 = { arm, reds, drawWalker, follow, stage, spot, audience, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke };

/* =====================================================================
   TENTICLE TICKLER: out on the board, something under the water
   is very ticklish. Reuses the Kraken's arms.
   ===================================================================== */
W["tenticle-tickler"] = A => {
  const R = A.R, G = A.G, GRAB = 540, PINK = "#c88ab8", SUCK = "#f0d84a";
  return {
    level: {
      obs: [["tt_jelly", 190], ["tt_tent", 270], ["tt_tent", 360], ["tt_jelly", 440], ["tt_tent", 650], ["tt_jelly", 720], ["tt_tent", 790], ["tt_tent", 860]],
      target: "tt_buoy", targetAt: 470, prop: "fish", propAt: 130, npcs: [],
      captions: [[30, "Surf's up. Board's long."], [230, "Something brushed my foot."]]
    },
    obs: {
      tt_tent: { w: 8, h: 0, y: 0, vx: 0, tough: "hehe", draw(o, x, y, t) { if (o.h < 2) return; arm(A, x + 1, G + 4, o.h + 4, t, o.x * .1, PINK, SUCK); R("#9ff0dc", x - 4, G + 2, 16, 1); } },
      tt_jelly: { w: 9, h: 9, y: 13, vx: -34, draw(o, x, y, t) { const b = Math.round(Math.sin(t * 4 + o.x) * 2), yy = y + b;
        R(A.C.ink, x, yy, 9, 5); R("#f4c8f0", x + 1, yy + 1, 7, 3); R("#ffffff", x + 2, yy + 1, 2, 1); for (let i = 0; i < 3; i++) R("#c88ab8", x + 1 + i * 3, yy + 5 + ((i + Math.floor(t * 6)) % 2), 1, 4); } }
    },
    targets: { tt_buoy: { line: "Buoy, oh buoy.", draw(tg, x, t) { const b = Math.floor(t * 2) % 2;
      R(A.C.ink, x - 6, G - 15 + b, 12, 13); R("#E8271A", x - 5, G - 14 + b, 10, 11); R("#f4f4f2", x - 5, G - 10 + b, 10, 3); R(A.C.ink, x - 1, G - 20 + b, 2, 6); R("#f3d23b", x - 1, G - 21 + b, 2, 2); if (tg.done) R("#f3d23b", x - 7, G - 1, 14, 1); } } },
    reset(S) { S.tt = { grab: -1, x: 0, done: false }; S.obs.forEach(o => { if (o.type === "tt_tent") { o.h = 0; o.off = true; } }); },
    update(dt, S, p) {
      const g = S.tt;
      for (const o of S.obs) if (o.type === "tt_tent") { const c = (S.t * .5 + o.x * .017) % 1, up = c < .15 ? c / .15 : c < .5 ? 1 : c < .65 ? 1 - (c - .5) / .15 : 0; o.h = Math.round(up * 24); o.off = o.h < 7; }
      if (g.grab < 0 && !g.done && p.x > GRAB) { g.grab = 0; g.x = p.x; A.showCaption("Something's got you."); }
      if (g.grab >= 0 && !g.done) { g.grab += dt; p.x = g.x; p.y = Math.min(p.y, 6 + Math.sin(g.grab * 20) * 2); p.vy = 0; p.inv = .2;
        if (Math.random() < dt * 5) A.__s2.crowdText(A, S, ["HEHE", "HEHEHE", "HE HE"][Math.floor(Math.random() * 3)], g.x + (Math.random() - .5) * 70, 40 + Math.random() * 40);
        if (g.grab > .5 && !g.said) { g.said = true; A.redSays("hehe... HEHEHEHE stop!", 2.2); }
        if (g.grab > 2.4) { g.done = true; p.x = g.x + 14; p.vy = 160; p.onG = false; A.showCaption("Tickled half to death. Keep paddling."); A.__s2.splash(S, g.x, 4, 14, "#9ff0dc"); } }
    },
    bg(t, S) {
      R("#6ae6cc", 0, 0, A.W, G); A.layer(.15, 23, (x, k) => R("#5adcc0", x + (Math.floor(t + k) % 6), 20 + (k % 7) * 16, 9, 1));
      A.layer(.4, 17, (x, k) => { R("#9ff0dc", x + (Math.floor(t * 2 + k) % 4), 60 + (k % 6) * 14, 5, 1); });
      A.layer(.55, 160, (x, k) => { if (A.hash(k, 9) < .5) return; const h = 30 + A.hash(k, 4) * 20; arm(A, x + 40, G - 6, Math.round(h + Math.sin(t + k) * 4), t * .6, k, "#b07aa8", null, 5, 7); arm(A, x + 70, G - 6, Math.round(h * .8), t * .6, k + 2, "#b07aa8", null, 5, 7); });
      // the surfboard Red is standing on
      R("#5adcc0", 0, G, A.W, 30); R(A.C.ink, 0, G, A.W, 1); R("#f0d84a", 0, G + 1, A.W, 12); R("#3460BE", 0, G + 5, A.W, 4); R("#f6e88a", 0, G + 1, A.W, 1); R(A.C.ink, 0, G + 13, A.W, 1);
      A.layer(1, 9, (x, k) => R("#9ff0dc", x + (Math.floor(t * 2 + k) % 3), G + 17 + (k % 4) * 3, 5, 1));
    },
    fg(t, S) {
      const g = S.tt;
      if (g.grab >= 0 && !g.done) { const x = sx(A, g.x), r = A.red; arm(A, x - 18, G + 4, 26, t * 2, 1, PINK, SUCK, 6, 6); arm(A, x + 18, G + 4, 26, t * 2, 4, PINK, SUCK, 6, 6);
        R(A.C.ink, x - 15, r.top + 13, 6, 4); R(PINK, x - 14, r.top + 14, 4, 2); R(A.C.ink, x + 9, r.top + 13, 6, 4); R(PINK, x + 10, r.top + 14, 4, 2); }
      A.__s2.txtFx(A, S); A.__s2.dropFx(A, S);
    }
  };
};

/* =====================================================================
   STRONG AND WEAK: bodybuilding finals. Big on the outside,
   small on the inside. Reuses the talk-show stage.
   ===================================================================== */
W["strong-and-weak"] = A => {
  const R = A.R, G = A.G, INSIDE = 640, ARCH = 860;
  return {
    outfit: { W: "#14110F", w: "#3a3a3a" },
    sprites: { curled: { pal: { r: "#8a1a10", R: "#a8221a" }, rows: ["...KKKK..", "..KKKKKK.", "..KrrrrK.", "..rRRRRrR", ".rRRRRRRR", "rRRRRRRRr", "rRRrRRRRr", "rRRrRRRRr", "rRRrRRRr.", ".rRRrRRr.", ".rRRRRRr.", "..rRRRRr.", "..rr.rrr."] },
      dumbbell: { rows: ["KK.KK", "KKKKK", "KK.KK"] } },
    level: {
      obs: [["sw_bell", 170], ["sw_card", 260], ["sw_shake", 340], ["sw_card", 420], ["sw_bell", 520], ["sw_doubt", 700], ["sw_doubt", 780], ["sw_doubt", 840]],
      target: "sw_trophy", targetAt: 590, prop: "dumbbell", propAt: 110, npcs: [],
      captions: [[30, "Bodybuilding finals. Flex."], [300, "Judges are watching. Smile."], [INSIDE, "Inside, though..."]]
    },
    obs: {
      sw_bell: { w: 14, h: 6, y: 0, vx: -60, tough: "CLANK", draw(o, x, y, t) { R(A.C.ink, x, y, 4, 6); R(A.C.ink, x + 10, y, 4, 6); R(A.C.ink, x + 3, y + 2, 8, 2); R("#5a5a5a", x + 1, y + 1, 2, 4); R("#5a5a5a", x + 11, y + 1, 2, 4); R("#aaa", x + 4, y + 2, 6, 1); } },
      sw_card: { w: 10, h: 7, y: 16, vx: -130, draw(o, x, y, t) { const s = Math.floor(t * 12) % 2; R(A.C.ink, x, y + s, 10, 7); R("#f4f4f2", x + 1, y + 1 + s, 8, 5); R(A.C.ink, x + 3, y + 2 + s, 1, 3); R(A.C.ink, x + 5, y + 2 + s, 2, 1); R(A.C.ink, x + 6, y + 2 + s, 1, 3); R(A.C.ink, x + 5, y + 4 + s, 2, 1); } },
      sw_shake: { w: 6, h: 10, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 6, 10); R("#6EAAE6", x + 1, y + 2, 4, 8); R("#f4f4f2", x + 1, y + 1, 4, 1); R("#f4f4f2", x + 2, y + 4, 2, 3); } },
      sw_doubt: { w: 10, h: 8, y: 14, vx: -45, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 3 + o.x) * 2); R("#14110F", x, yy + 1, 10, 6); R("#14110F", x + 2, yy, 6, 8);
        for (let i = 0; i < 4; i++) R("#5a1a12", x + 1 + ((i * 3 + Math.floor(t * 8)) % 8), yy + 2 + (i % 3) * 2, 2, 1); } }
    },
    targets: { sw_trophy: { line: "Champion of the world.", draw(tg, x, t) {
      R(A.C.ink, x - 7, G - 22, 14, 10); R("#e8c23a", x - 6, G - 21, 12, 8); R(A.C.ink, x - 10, G - 21, 3, 5); R(A.C.ink, x + 7, G - 21, 3, 5); R("#f6e08a", x - 4, G - 20, 2, 5);
      R(A.C.ink, x - 2, G - 12, 4, 5); R("#e8c23a", x - 1, G - 12, 2, 4); R(A.C.ink, x - 6, G - 7, 12, 7); R("#8a5a32", x - 5, G - 6, 10, 6); if (tg.done) R("#f3d23b", x - 6, G - 2, 12, 2); } } },
    reset(S) { S.sw = { flex: 0, inside: 0 }; },
    update(dt, S, p) {
      const s = S.sw; if (p.x > INSIDE) s.inside = Math.min(1, s.inside + dt * .7);
      const idle = !(p.x !== s.lx); s.lx = p.x; s.flex = idle && p.onG && !p.pee && s.inside < .5 ? s.flex + dt : 0;
      if (s.flex > 1.2 && !s.cheered) { s.cheered = true; A.__s2.crowdText(A, S, "WOOO!", p.x, 60); A.redSays("Look at these guns.", 1.8); }
      if (p.x > ARCH - 40 && !s.small) { s.small = true; A.say("...I'm not enough.", ARCH, 30, 2.6); }
    },
    bg(t, S) {
      const k = S.sw.inside;
      stage(A, t, 0, mix("#1a6a8a", "#c81a10", k), mix("#14485e", "#8a1008", k), mix("#a87a3a", "#6a0c06", k), mix("#8a6230", "#4a0804", k));
      if (k < .9) spot(A, sx(A, S.p.x), "#fff6b0", .2 * (1 - k));
      if (k > 0) { const ax = sx(A, ARCH, .9); A.ctx.globalAlpha = k;            // the white arch with him curled up inside
        R(A.C.ink, ax - 21, 50, 42, G - 50); A.ctx.fillStyle = "#14110F"; A.ctx.beginPath(); A.ctx.arc(ax, 70, 21, Math.PI, 0); A.ctx.fill();
        R("#f4f0e8", ax - 20, 70, 40, G - 70); A.ctx.fillStyle = "#f4f0e8"; A.ctx.beginPath(); A.ctx.arc(ax, 70, 20, Math.PI, 0); A.ctx.fill();
        const im = A.NS.curled; A.ctx.drawImage(im, ax - 5, G - im.height - 1); A.ctx.globalAlpha = 1; }
    },
    fg(t, S) {
      audience(A, t, 0, S.sw.flex > 1.2, mix("#0a0a14", "#3a0402", S.sw.inside));
      if (S.sw.flex > .6 && S.sw.inside < .5) onHead(A, (x, top, face) => { const f = Math.floor(t * 6) % 2; R("#E8271A", x - 9 - f, top + 12, 3, 3); R("#E8271A", x + 6 + f, top + 12, 3, 3); R(A.C.ink, x - 9 - f, top + 11, 3, 1); R(A.C.ink, x + 6 + f, top + 11, 3, 1); });
      if (S.sw.inside > .2) onHead(A, (x, top) => { if (Math.floor(t * 3) % 3 === 0) R("#9fd0ee", x + 3, top + 6, 1, 2); });   // sweat
      A.__s2.txtFx(A, S);
    }
  };
};

/* =====================================================================
   LOVE THYSELF: just Red and his shadow, on a blank page.
   ===================================================================== */
W["love-thyself"] = A => {
  const R = A.R, G = A.G, HUG = 880;
  const shade = { R: "#14110F", r: "#14110F", W: "#14110F", w: "#14110F", E: "#14110F", K: "#14110F" };
  return {
    sprites: Object.assign(reds(A, "shadow", shade), { flower: { rows: [".R.", "RYR", ".R.", ".Q.", "QQ.", ".Q."] } }),
    level: {
      obs: [["lt_doubt", 200], ["lt_doubt", 310], ["lt_scrib", 400], ["lt_doubt", 520], ["lt_scrib", 640], ["lt_doubt", 740]],
      target: "lt_mirror", targetAt: 590, prop: "flower", propAt: 150, npcs: [],
      captions: [[30, "Just you and your shadow."], [260, "It's always been right there."], [700, "Maybe let it in."]]
    },
    obs: {
      lt_doubt: { w: 12, h: 8, y: 15, vx: -40, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 2 + o.x) * 2); for (let i = 0; i < 9; i++) { const a = t * 3 + i; R("#14110F", x + 6 + Math.round(Math.cos(a) * (3 + i % 3 * 2)), yy + 4 + Math.round(Math.sin(a * 1.3) * 3), 2, 1); } } },
      lt_scrib: { w: 10, h: 6, y: 0, vx: 0, draw(o, x, y, t) { for (let i = 0; i < 10; i++) R("#14110F", x + ((i * 7) % 10), y + ((i * 3) % 6), 3, 1); } }
    },
    targets: { lt_mirror: { line: "Hey, handsome.", draw(tg, x, t) { R(A.C.ink, x - 6, G - 30, 12, 26); R("#cfe4ee", x - 5, G - 29, 10, 24); R("#ffffff", x - 3, G - 27, 2, 8); R(A.C.ink, x - 1, G - 4, 2, 4); R(A.C.ink, x - 5, G - 1, 10, 1); if (tg.done) R("#ff8fc4", x - 2, G - 20, 4, 3); } } },
    reset(S) { S.lt = { f: { x: 44, y: 0, d: 0, face: 1, moving: false }, hug: false, hand: false }; },
    update(dt, S, p) {
      const l = S.lt, f = l.f;
      if (!l.hug) { follow(f, p.x - 12 * (p.face > 0 ? 1 : -1), 130, dt); if (Math.abs(f.x - p.x) > 60) f.x = p.x - 40 * Math.sign(p.face || 1); f.y += ((p.y) - f.y) * Math.min(1, dt * 6); if (!f.moving) f.face = p.face; }
      if (!l.hand && p.x > 700) { l.hand = true; A.say("I got you.", f.x, 40, 2.2); }
      if (!l.hug && p.x > HUG && p.onG) { l.hug = true; f.x = p.x + 7; f.face = -1; f.moving = false; A.showCaption("Love thyself."); A.__s2.hearts(S, p.x, 34, 8); }
      if (l.hug && Math.random() < dt * 2) A.__s2.hearts(S, f.x, 34, 1);
    },
    bg(t, S) {
      R("#ecebe6", 0, 0, A.W, A.H); A.layer(.6, 7, (x, k) => { R("#e2e0da", x + A.hash(k, 1) * 6, A.hash(k, 2) * 180, 1, 1); R("#f4f3ef", x + A.hash(k, 3) * 6, A.hash(k, 4) * 180, 1, 1); });
      R("#dedcd6", 0, G + 1, A.W, 1);
    },
    mid(t, S) {
      const l = S.lt, f = l.f, r = A.red, fx = sx(A, f.x), rx = sx(A, S.p.x);
      A.ctx.globalAlpha = .85; A.ctx.fillStyle = "#14110F"; A.ctx.beginPath();          // the cast shadow on the floor linking them
      A.ctx.moveTo(rx - 2, G + 1); A.ctx.lineTo(rx + 3, G + 1); A.ctx.lineTo(fx + 3, G - 2); A.ctx.lineTo(fx - 2, G - 2); A.ctx.fill(); A.ctx.globalAlpha = 1;
      drawWalker(A, "shadow", f);
      if (l.hand && !l.hug) R("#14110F", Math.min(fx, rx) + 2, G - 22, Math.abs(fx - rx), 2);   // hand on the shoulder
    },
    fg(t, S) { const l = S.lt; if (l.hug) { const r = A.red, x = r.x; R("#14110F", x - 7, r.top + 12, 14, 3); R("#14110F", x - 8, r.top + 12, 2, 8); R("#14110F", x + 6, r.top + 12, 2, 8); } A.__s2.heartFx(A, S); }
  };
};

/* =====================================================================
   LEAP OF FAITH: everyone's lined up at the hole. You jump,
   fall through the earth and the sky, and come back... fuzzy.
   ===================================================================== */
W["leap-of-faith"] = A => {
  const R = A.R, G = A.G, HOLE = 520, OUT = 600, SKY = ["#b8c4c4", "#aab8b8", "#9cacac"], GREEN = "#1f7a5a";
  const fuzz = (rows, k) => rows.map((row, j) => row.replace(/R/g, (c, i) => ((i * 7 + j * 13 + k.length) % 5 === 0 ? "r" : (i * 3 + j * 5) % 7 === 0 ? "K" : "R")));
  const queue = { R: "#E8271A", r: "#B21A10", W: "#E8271A", w: "#B21A10" }, furry = { R: "#c8201a", r: "#6a0c06", W: "#c8201a", w: "#6a0c06" };
  const furRows = k => fuzz(A.SP[k], k);
  return {
    sprites: Object.assign(reds(A, "q", queue), { stick: { pal: { N: "#8a5a32" }, rows: ["N....", ".N...", "..NN.", "...NN"] }, fz_stand: { rows: furRows("stand"), pal: furry } }),
    level: {
      obs: [["lf_mound", 220], ["lf_crow", 300], ["lf_mound", 400], ["lf_crow", 680], ["lf_mound", 760]],
      target: "lf_hole", targetAt: HOLE, prop: "stick", propAt: 150,
      npcs: [["q_stand", 70, -1], ["q_stand", 84, -1], ["q_stand", 98, -1, "You first."], ["q_stand", 112, -1], ["fz_stand", 820, -1, "Welcome back."], ["fz_stand", 836, -1], ["fz_stand", 852, -1], ["fz_stand", 868, -1]],
      captions: [[30, "Everyone's lined up."], [300, "It's just a hole. Probably."], [460, "Don't look down. Jump in."]]
    },
    obs: {
      lf_mound: { w: 12, h: 5, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x + 2, y, 8, 5); R(A.C.ink, x, y + 2, 12, 3); R("#6a3a1a", x + 3, y + 1, 6, 4); R("#6a3a1a", x + 1, y + 3, 10, 2); } },
      lf_crow: { w: 10, h: 5, y: 16, vx: -95, draw(o, x, y, t) { const f = Math.floor(t * 9 + o.x) % 2; R(A.C.ink, x + 2, y + 2, 7, 3); R(A.C.ink, x + (f ? 0 : 1), y + (f ? 0 : 3), 4, 2); R(A.C.ink, x + 6, y + (f ? 0 : 3), 4, 2); R("#e8a23a", x, y + 3, 2, 1); } }
    },
    targets: { lf_hole: { line: "...echo... echo...", draw(tg, x, t) {
      A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(x, G + 3, 20, 5, 0, 0, 7); A.ctx.fill();
      A.ctx.fillStyle = "#4a2410"; A.ctx.beginPath(); A.ctx.ellipse(x, G + 3, 19, 4, 0, 0, 7); A.ctx.fill();
      A.ctx.fillStyle = "#1a0a04"; A.ctx.beginPath(); A.ctx.ellipse(x, G + 4, 14, 3, 0, 0, 7); A.ctx.fill(); } } },
    reset(S) { S.lf = { fall: -1, back: false }; },
    update(dt, S, p) {
      const l = S.lf;
      if (l.fall < 0 && !l.back && Math.abs(p.x - HOLE) < 9 && p.onG && !p.pee) { l.fall = 0; A.showCaption("Leap of faith."); }
      if (l.fall >= 0) { l.fall += dt; p.x = HOLE; p.y = 0; p.vy = 0; p.inv = .3;
        if (l.fall > 3.4) { l.fall = -1; l.back = true; p.x = OUT; p.y = 40; p.vy = -40; p.onG = false;
          A.reskin(rows => fuzz(rows, "x"), furry); A.showCaption("...and back. Fuzzier."); A.redSays("Did... I change?", 2); } }
    },
    bg(t, S) {
      A.sky({ sky: SKY }); R(GREEN, 0, 108, A.W, G - 108); A.layer(.3, 13, (x, k) => R("#1a6a4e", x + A.hash(k, 1) * 9, 112 + A.hash(k, 2) * 36, 2, 1));
      R(GREEN, 0, G, A.W, 30); A.layer(1, 6, (x, k) => R("#1a6a4e", x + A.hash(k, 5) * 4, G + 3 + A.hash(k, 6) * 24, 1, 2));
    },
    fg(t, S) {
      const l = S.lf; if (l.fall < 0) return;
      const u = l.fall, k = A.ctx;
      if (u < 1.6) {                                             // down the tunnel
        R("#2a1206", 0, 0, A.W, A.H); const tx = A.W / 2; R("#7a4a22", tx - 22, 0, 44, A.H); for (let y = -((u * 160) % 12); y < A.H; y += 12) R("#5a3416", tx - 22, y, 44, 1);
        R(A.C.ink, tx - 23, 0, 1, A.H); R(A.C.ink, tx + 22, 0, 1, A.H);
        k.save(); k.translate(tx, 90); k.rotate(u * 9); const im = A.NS.q_jump || A.NS.q_stand; k.drawImage(im, -im.width / 2, -im.height / 2); k.restore();
      } else {                                                  // out the other side, through the clouds
        const v = u - 1.6; R("#c8d4d4", 0, 0, A.W, A.H); R("#2a1206", 0, 0, A.W, Math.max(0, 40 - v * 50)); R("#7a4a22", A.W / 2 - 8, 0, 16, Math.max(0, 40 - v * 50));
        for (let i = 0; i < 9; i++) { const cy = (i * 31 + 200 - v * 120) % 240 - 20; puff(A, (i * 71) % A.W + 20, cy, 10 + (i % 3) * 4, "#f4f4f2", .95); }
        k.save(); k.translate(A.W / 2 + Math.sin(v * 3) * 20, 70 + v * 30); k.rotate(v * 6); const im = A.NS.q_stand; k.scale(.6, .6); k.drawImage(im, -im.width / 2, -im.height / 2); k.restore();
      }
      if (u > 3) { k.globalAlpha = (u - 3) / .4; R("#f4f4f2", 0, 0, A.W, A.H); k.globalAlpha = 1; }
    }
  };
};

/* =====================================================================
   PUBLIC DIPPERS: hot day, cool canal, a few regulars.
   ===================================================================== */
W["public-dippers"] = A => {
  const R = A.R, G = A.G, DIVER = 760;
  const sp = (b, w) => ({ R: "#E8271A", r: "#B21A10", W: b, w });
  return {
    sprites: Object.assign(reds(A, "green", sp("#5aa83a", "#e8c23a")), reds(A, "yellow", sp("#e8d84a", "#5aa83a")), reds(A, "speedo", sp("#a06ad6", "#8CC83C")), reds(A, "out", sp("#f4f4f2", "#c8c2b8"))),
    level: {
      obs: [["pd_fly", 170], ["pd_can", 260], ["pd_fly", 360], ["pd_puddle", 450], ["pd_can", 560], ["pd_fly", 640], ["pd_puddle", 820]],
      target: "pd_drain", targetAt: 520, prop: "cup", propAt: 120,
      npcs: [["green_stand", 230, 1, "Water's fine."], ["yellow_stand", 252, -1], ["out_stand", 610, 1, "zzz..."], ["speedo_stand", DIVER, -1, "Watch this."]],
      captions: [[30, "Hot day. Cool canal."], [400, "The regulars are here."]]
    },
    obs: {
      pd_fly: { w: 5, h: 4, y: 15, vx: -55, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 9 + o.x) * 3), f = Math.floor(t * 24) % 2; R(A.C.ink, x + 1, yy + 1, 3, 2); R("rgba(255,255,255,.8)", x + (f ? 0 : 2), yy - 1, 2, 2); } },
      pd_can: { w: 6, h: 6, y: 0, vx: -110, draw(o, x, y, t) { const f = Math.floor(t * 12) % 2; R(A.C.ink, x, y, 6, 6); R("#c8c8c8", x + 1, y + 1, 4, 4); R("#3460BE", x + 1 + f * 2, y + 2, 2, 2); } },
      pd_puddle: { w: 14, h: 2, y: 0, vx: 0, tough: "slip!", draw(o, x, y, t) { R("#7ac8e6", x, A.G - 1, 14, 2); R("#ffffff", x + 3 + Math.floor(t * 2) % 4, A.G - 1, 2, 1); } }
    },
    targets: { pd_drain: { line: "Public pool.", draw(tg, x, t) { R(A.C.ink, x - 8, G - 3, 16, 4); R("#5a5a5a", x - 7, G - 2, 14, 2); for (let i = 0; i < 4; i++) R(A.C.ink, x - 5 + i * 3, G - 2, 1, 2); if (tg.done) R("#f3d23b", x - 7, G - 3, 14, 1); } } },
    reset(S) { S.pd = { dive: -1 }; },
    update(dt, S, p) {
      const d = S.pd;
      if (d.dive < 0 && p.x > DIVER - 50) { d.dive = 0; A.say("CANNONBALL!", DIVER, 40, 1.6); }
      if (d.dive >= 0 && d.dive < 9) { d.dive += dt; const n = S.npcs.find(n => n.kind.startsWith("speedo"));
        if (n && d.dive > .7 && !d.splashed) { d.splashed = true; n.gone = true; A.__s2.splash(S, n.x, 2, 22, "#9fd8f0"); A.__s2.crowdText(A, S, "SPLOOSH", n.x, 40); } }
      dropFxStep(S, dt);
    },
    bg(t, S) {
      R("#5aa83a", 0, 0, A.W, 52); A.layer(.3, 9, (x, k) => R("#4a982f", x + A.hash(k, 1) * 6, 10 + A.hash(k, 2) * 38, 1, 2));
      R("#8a8a8a", 0, 52, A.W, 20); R("#7a7a7a", 0, 72, A.W, 4); R("#9a9a9a", 0, 76, A.W, G - 76);
      A.layer(.7, 5, (x, k) => R("#8e8e8e", x + A.hash(k, 3) * 4, 80 + A.hash(k, 4) * 66, 1, 1));
      R(A.C.ink, 0, G, A.W, 1); R("#8a8a8a", 0, G + 1, A.W, 6); R("#7ac8e6", 0, G + 7, A.W, 23);
      A.layer(1, 11, (x, k) => R("#b6e4f4", x + (Math.floor(t * 2 + k) % 5), G + 11 + (k % 4) * 4, 6, 1));
    },
    drawNpc(n, x, t) {
      if (n.gone) return true;
      if (!n.kind.startsWith("out")) return false;
      const im = A.NS.out_stand, k = A.ctx; k.save(); k.translate(x, A.G - 4); k.rotate(-Math.PI / 2); k.drawImage(im, -4, -im.height / 2); k.restore();
      if (Math.floor(t * 1.2) % 2) { A.R("#f4f4f2", x - 14, A.G - 18, 2, 1); A.R("#f4f4f2", x - 12, A.G - 20, 3, 1); }
      return true;
    },
    fg(t, S) { A.__s2.dropFx(A, S); A.__s2.txtFx(A, S); }
  };
  function dropFxStep(S, dt) { A.__s2.dropFx(A, S, dt); }
};

/* =====================================================================
   WAR ON SELF: over the top into no man's land, and the enemy
   across the field moves exactly like you.
   ===================================================================== */
W["war-on-self"] = A => {
  const R = A.R, G = A.G, MID = 735, PEACE = 760;
  const enemy = { R: "#E8271A", r: "#B21A10", W: "#4a6a2a", w: "#3a5a1f" };
  return {
    outfit: { W: "#4a6a2a", w: "#3a5a1f" },
    sprites: Object.assign(reds(A, "enemy", enemy), { helmet: { pal: { Q: "#5a8a2a" }, rows: [".QQQ.", "QQQQQ", "KKKKK"] }, officer: { pal: { a: "#E8271A", d: "#14110F", b: "#5a7a2a", c: "#4a5a2a", e: "#5a8a2a", s: "#3a2a1a" }, rows: [
      "...eeee...", "..eeeeee..", "..aaaaaa..", "..aEKaEK..", "..aaaaaa..", "..adddda..", "....aa....", "..bbbbbb..", ".bbbbbbbb.", ".bbbbbbbb.", ".abbbbbba.",
      "..bbbbbb..", "..cccccc..", "..cccccc..", "..cc..cc..", "..cc..cc..", "..cc..cc..", ".sss..sss."] } }),
    level: {
      obs: [["ws_wire", 210], ["ws_bag", 300], ["ws_wire", 400], ["ws_bag", 500], ["ws_wire", 590]],
      target: "ws_crate", targetAt: 160, prop: "helmet", propAt: 260,
      npcs: [["officer", 70, 1, "Over the top, boys! FWEEET!"]],
      captions: [[30, "The trenches. Whistle's coming."], [230, "No man's land."], [560, "Someone's coming the other way."]]
    },
    obs: {
      ws_wire: { w: 16, h: 9, y: 0, vx: 0, tough: "ow, wire", draw(o, x, y) { for (let i = 0; i < 4; i++) { A.ctx.strokeStyle = "#5a5a5a"; A.ctx.lineWidth = 1; A.ctx.beginPath(); A.ctx.ellipse(x + 2 + i * 4, y + 4, 3, 4, 0, 0, 7); A.ctx.stroke(); } R("#6a4224", x - 1, y - 2, 2, 11); R("#6a4224", x + 15, y - 2, 2, 11); } },
      ws_bag: { w: 12, h: 7, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 12, 7); R("#a8905a", x + 1, y + 1, 10, 2); R("#a8905a", x + 1, y + 4, 10, 2); R("#8a7444", x + 5, y + 1, 1, 5); } }
    },
    targets: { ws_crate: { line: "Ammo... damp.", draw(tg, x, t) { R(A.C.ink, x - 8, G - 11, 16, 11); R("#c8a24a", x - 7, G - 10, 14, 9); R("#a8822a", x - 7, G - 6, 14, 1); R("#f4f4f2", x - 4, G - 15, 2, 5); R("#f4f4f2", x, G - 15, 2, 5); R("#E8271A", x - 4, G - 16, 2, 1); R("#E8271A", x, G - 16, 2, 1); } } },
    reset(S) { S.ws = { booms: [], next: 1.5, e: { x: 960, y: 0, d: 0, face: -1, moving: false }, met: -1, peace: 0 }; },
    update(dt, S, p) {
      const w = S.ws;
      if (w.met < 0 && p.x > 220 && p.x < 680) { w.next -= dt; if (w.next <= 0) { w.next = 1.4 + Math.random(); w.booms.push({ x: p.x + 40 + Math.random() * 90, t: 0 }); } }
      for (const b of w.booms) { const before = b.t; b.t += dt;
        if (before < .9 && b.t >= .9) { A.__s2.splash(S, b.x, 2, 12, "#6a4224"); if (Math.abs(b.x - p.x) < 16 && p.inv <= 0) { p.inv = 1.2; p.kb = .16; p.vy = 160; p.onG = false; A.redSays("Incoming!", 1.4); } } }
      w.booms = w.booms.filter(b => b.t < 1.6);
      if (p.x > 520 && w.met < 0) { const e = w.e; e.x = 2 * MID - p.x; e.face = -p.face; e.moving = Math.abs(p.vx || 1) > 0; e.d = p.dist; e.y = p.y;   // the mirror
        if (e.x - p.x < 16) { w.met = 0; A.showCaption("Wait... he looks familiar."); } }
      if (w.met >= 0) { w.met += dt; if (w.met > 1 && w.peace === 0) { w.peace = .001; A.showCaption("Ceasefire."); A.say("...hey, me.", w.e.x, 40, 2); } }
      if (w.peace > 0) w.peace = Math.min(1, w.peace + dt * .6);
      A.__s2.dropFx(A, S, dt);
    },
    bg(t, S) {
      const pc = S.ws.peace;
      R("#7a7a7a", 0, 0, A.W, 40); R("#c8822a", 0, 40, A.W, 30); R("#e8902a", 0, 70, A.W, 40); R("#8a5a2a", 0, 110, A.W, G - 110);
      A.layer(.2, 140, (x, k) => smoke(A, x + 40, 104, t + k, 7, "#2a2a2a", 30, 80));
      A.layer(.5, 40, (x, k) => { R("#5a3a1f", x, 120 + (k % 3) * 4, 22, 3); if (k % 2) { R("#6a4224", x + 10, 112, 2, 14); } });
      R("#6a4a28", 0, G, A.W, 30); A.layer(1, 19, (x, k) => { R("#4a2e14", x + A.hash(k, 1) * 10, G + 6 + (k % 4) * 6, 8, 2); R("#7a8a9a", x + A.hash(k, 2) * 10, G + 4 + (k % 3) * 8, 5, 1); });
      if (pc > 0) {                                              // the field on the other side of the war
        A.ctx.globalAlpha = pc; R("#9fd0ee", 0, 0, A.W, 60); R("#d090e0", 0, 0, A.W, 18);
        [[30, 40], [110, 30], [190, 44], [270, 34]].forEach(([mx, h]) => { A.ctx.fillStyle = "#8a90b0"; A.ctx.beginPath(); A.ctx.moveTo(mx - 50, 90); A.ctx.lineTo(mx, 90 - h - 20); A.ctx.lineTo(mx + 50, 90); A.ctx.fill(); R("#f4f4f2", mx - 4, 90 - h - 20, 8, 5); });
        R("#2f6a3a", 0, 84, A.W, 10); R("#3a8ad6", 60, 96, 200, 6); R("#5aa83a", 0, 94, A.W, G - 94); R("#5aa83a", 0, G, A.W, 30); A.layer(1, 7, (x, k) => R("#3a8a2a", x, G + 2 + (k % 5) * 5, 1, 2));
        A.ctx.globalAlpha = 1;
      }
    },
    mid(t, S) {
      for (const b of S.ws.booms) { const x = sx(A, b.x); if (b.t < .9) { if (Math.floor(b.t * 10) % 2) { R("#E8271A", x - 1, G - 2, 3, 2); } A.ctx.globalAlpha = b.t / .9 * .5; R(A.C.ink, x - 6, G - 1, 12, 1); A.ctx.globalAlpha = 1; }
        else { const r = Math.round((b.t - .9) * 40); puff(A, x, G - 8 - r, 6 + r / 3, "#f3a91f", 1 - (b.t - .9) / .7); puff(A, x, G - 14 - r, 5 + r / 3, "#2a2a2a", .6 * (1 - (b.t - .9) / .7)); } }
      if (S.p.x > 500) { drawWalker(A, "enemy", S.ws.e); }
    },
    fg(t, S) {
      const helmet = (x, top) => { A.R(A.C.ink, x - 6, top - 1, 12, 5); A.R("#5a8a2a", x - 5, top, 10, 3); A.R("#7aa83a", x - 3, top, 3, 1); A.R(A.C.ink, x - 7, top + 3, 14, 1); };
      onHead(A, (x, top) => helmet(x, top));
      if (S.p.x > 500) { const e = S.ws.e, ex = sx(A, e.x), top = A.G - Math.round(e.y) - A.NS.enemy_stand.height + 1; helmet(ex, top); }
      const m = S.ws.met; if (m >= 0 && m < 1.4) { const cx = sx(A, MID), a = 1 - m / 1.4; A.ctx.globalAlpha = a; A.R("#ffffff", 0, 0, A.W, A.H); A.ctx.globalAlpha = Math.min(1, a * 2);
        A.ctx.strokeStyle = "#14110F"; A.ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { const ang = i * .7; A.ctx.beginPath(); A.ctx.moveTo(cx, 110); let px = cx, py = 110; for (let j = 0; j < 4; j++) { px += Math.cos(ang + j * .4) * 14; py += Math.sin(ang + j * .4) * 14; A.ctx.lineTo(px, py); } A.ctx.stroke(); } A.ctx.globalAlpha = 1; }
      A.__s2.dropFx(A, S);
    }
  };
};

/* =====================================================================
   CHEATING ASS RABBIT: dinner's cold, the kids are loud, and
   there's a carrot out in the field calling his name.
   ===================================================================== */
W["cheating-ass-rabbit"] = A => {
  const R = A.R, G = A.G, DOOR = 230, CARROT = 820;
  return {
    sprites: {
      wife: { pal: { Z: "#f4f4f2", R: "#E8271A", Y: "#e8d84a", P: "#f0a0b8", K: "#14110F" }, rows: [
        ".ZZ..ZZ.", ".ZP..PZ.", ".ZP..PZ.", ".ZZZZZZ.", "ZZZZZZZZ", "ZKZZZKZZ", "ZZZRZZZZ", ".ZZZZZZ.", "..ZZZZ..", ".YYYYYY.", "ZYYYYYYZ", "ZYYYYYYZ", ".YYYYYY.", ".ZRZZRZ.", ".ZZRZZZ.", ".ZZ..ZZ.", ".ZZ..ZZ."] },
      kit: { pal: { Z: "#f4f4f2", R: "#E8271A" }, rows: ["R.R..", "R.R..", "ZRZZ.", "ZZKZ.", "RZZRZ", "ZRZZZ", "Z..Z."] },
      lady: { pal: { O: "#e8762a", o: "#c8541a", Q: "#3a8a2a", q: "#5aa83a", P: "#f0a0d0", E: "#ffffff", K: "#14110F" }, rows: [
        "..Q.q.Q..", "..QqQqQ..", "...QqQ...", "..OOOOO..", ".OOOOOOO.", ".OEKOEKO.", ".OOOOOOO.", ".OOOPPOO.", ".oOOOOOo.", "..OOOOO..", "..OoOOO..", "..OOOOo..", "...OOO...", "...OoO...", "....O....", "....O...."] },
      carrot: { pal: { O: "#e8762a", Q: "#3a8a2a" }, rows: ["Q.Q", ".Q.", "OOO", "OOO", ".O.", ".O."] }
    },
    level: {
      obs: [["cr_kit", 120], ["cr_kit", 170], ["bat", 360], ["cr_grass", 430], ["bat", 560], ["cr_grass", 650], ["bat", 720]],
      target: "cr_mailbox", targetAt: 300, prop: "carrot", propAt: 260,
      npcs: [["wife", 60, 1, "Out AGAIN? The kids need you!"], ["kit", 200, -1], ["lady", CARROT, -1, "Hey there, bunny."]],
      captions: [[30, "Dinner's cold. Kids are loud."], [DOOR + 10, "Just going for a walk. Alone."], [600, "Something's growing out there."]]
    },
    obs: {
      cr_kit: { w: 6, h: 7, y: 0, vx: -40, draw(o, x, y, t) { const h = Math.abs(Math.sin(t * 8 + o.x)) * 4; A.ctx.drawImage(A.NS.kitL, x - 1, y - 1 - Math.round(h)); } },
      cr_grass: { w: 10, h: 10, y: 0, vx: 0, draw(o, x, y, t) { for (let i = 0; i < 5; i++) { const s = Math.round(Math.sin(t * 2 + i) * 1); R(A.C.ink, x + i * 2, y + 1, 2, 9); R("#3a9a2a", x + i * 2 + s, y + 2, 1, 8); } } }
    },
    targets: { cr_mailbox: { line: "Return to sender.", draw(tg, x, t) { R(A.C.ink, x - 1, G - 14, 2, 14); R(A.C.ink, x - 6, G - 22, 12, 9); R("#3460BE", x - 5, G - 21, 10, 7); R("#E8271A", x + 5, G - 24, 1, 6); R("#E8271A", x + 5, G - 24, 3, 2); } } },
    reset(S) { S.cr = { met: false }; },
    update(dt, S, p) { const c = S.cr; if (!c.met && p.x > CARROT - 40) { c.met = true; A.showCaption("Cheating ass rabbit."); A.__s2.hearts(S, CARROT, 30, 6); } if (c.met && Math.random() < dt * 2) A.__s2.hearts(S, CARROT, 30, 1); },
    bg(t, S) {
      const door = sx(A, DOOR);
      A.sky({ sky: ["#0a1430", "#121c40", "#1a2650"] }); A.stars({}); disc(A, "#f6f1c7", 250, 26, 6); disc(A, "#0a1430", 253, 24, 5);
      const hx = sx(A, 330, .3); R(A.C.ink, hx - 14, 96, 28, 18); R("#6a6a5a", hx - 13, 97, 26, 17); A.ctx.fillStyle = "#4a4a3a"; A.ctx.beginPath(); A.ctx.arc(hx, 98, 15, Math.PI, 0); A.ctx.fill(); R("#f3d23b", hx - 2, 104, 4, 5); smoke(A, hx + 6, 82, t, 6, "#5a6070", 30, 40);
      R("#1f5a2a", 0, 112, A.W, G - 112); A.layer(.4, 9, (x, k) => { R("#2a7a2f", x, 108 + (k % 3) * 2, 5, 4); });
      R("#2f7a2b", 0, G, A.W, 30); A.layer(1, 4, (x, k) => R("#3c8f2a", x, G + 1 + (k % 5) * 5, 1, 3));
      if (door > 0) {                                           // the kitchen
        const x1 = Math.min(A.W, door); R("#3a5ac8", 0, 0, x1, G); R("#2a48a8", 0, G - 30, x1, 30);
        [sx(A, 40), sx(A, 160)].forEach(wx => { R(A.C.ink, wx - 12, 30, 24, 24); R("#16226a", wx - 11, 31, 22, 22); R(A.C.ink, wx - 1, 30, 2, 24); R(A.C.ink, wx - 12, 41, 24, 2); });
        const tx = sx(A, 110); R(A.C.ink, tx - 30, 116, 60, 5); R("#8a5a32", tx - 29, 117, 58, 3); R("#6a4224", tx - 26, 121, 3, 29); R("#6a4224", tx + 23, 121, 3, 29); R("#f4f4f2", tx - 6, 113, 12, 3); R("#e8762a", tx - 2, 113, 4, 1);
        R("#1f3a8a", 0, G, x1, 30); A.layer(1, 12, (x) => { if (x < door) R("#2a48a8", x, G + 2, 6, 26); });
        R(A.C.ink, door - 3, 30, 4, G - 30); R("#8a5a32", door - 2, 30, 2, G - 30);
      }
    },
    drawNpc(n, x, t) { if (n.kind !== "lady" && n.kind !== "ladyL") return false; const im = A.NS[n.face < 0 ? "ladyL" : "lady"], s = 3, b = Math.round(Math.sin(t * 2) * 2);
      A.ctx.imageSmoothingEnabled = false; A.ctx.drawImage(im, x - im.width * s / 2, A.G - im.height * s + 1 + b, im.width * s, im.height * s); return true; },
    fg(t, S) {
      onHead(A, (x, top, face) => { const w = Math.floor(t * 2) % 2; R(A.C.ink, x - 5, top - 9, 4, 11); R(A.C.ink, x + 1, top - 10 + w, 4, 11); R("#E8271A", x - 4, top - 8, 2, 9); R("#E8271A", x + 2, top - 9 + w, 2, 9); R("#f0a0b8", x - 4, top - 6, 1, 5); R("#f0a0b8", x + 2, top - 7 + w, 1, 5);
        R(A.C.ink, x + (face > 0 ? 0 : -5), top + 11, 5, 1); });          // ears and a little mustache
      A.__s2.heartFx(A, S);
    }
  };
};

/* =====================================================================
   MOTHERHOOD: a night swim in the glowing pond behind the factory.
   Something grows. Something hatches.
   ===================================================================== */
W["motherhood"] = A => {
  const R = A.R, G = A.G, POND = [360, 640], TOWEL = 760, PINK = "#ff5fd2";
  return {
    sprites: { girl: { pal: { a: "#b08ad6", d: "#14110F", b: "#e8c23a", c: "#e8c23a", s: "#b08ad6" }, rows: [
      "...dddd...", "..dddddd..", ".ddaaaadd.", ".daKaaKad.", ".daaaaaad.", ".d.aRRa.d.", ".d..aa..d.", "..aaaaaa..", ".abbabbaa.", ".aaaaaaaa.", ".aaaaaaaa.", "..aaaaaa..", "..cccccc..", "..aaaaaa..", "..aa..aa..", "..aa..aa..", "..aa..aa..", ".sss..sss."] },
      bub: { pal: { P: "#ff5fd2" }, rows: [".P.", "P.P", ".P."] } },
    level: {
      obs: [["mh_bike", 170], ["rat", 260], ["mh_bub", 420], ["mh_bub", 520], ["mh_bub", 600], ["mh_bike", 700]],
      target: "mh_barrel", targetAt: 300, prop: "egg", propAt: 120,
      npcs: [["girl", TOWEL, -1, "Come dry off, babe."]],
      captions: [[30, "Behind the factory. Full moon."], [POND[0] - 10, "Pink water. Totally safe."], [POND[1] - 40, "...do you feel full?"]]
    },
    obs: {
      mh_bike: { w: 18, h: 8, y: 0, vx: 0, draw(o, x, y) { A.ctx.strokeStyle = "#14110F"; [[x + 4, y + 4], [x + 14, y + 4]].forEach(([cx, cy]) => { A.ctx.beginPath(); A.ctx.arc(cx, cy, 4, 0, 7); A.ctx.stroke(); }); R("#3a8ad6", x + 4, y + 3, 10, 1); R("#3a8ad6", x + 8, y, 1, 4); R(A.C.ink, x + 7, y, 3, 1); } },
      mh_bub: { w: 6, h: 6, y: 13, vx: -30, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 3 + o.x) * 3); R(A.C.ink, x, yy, 6, 6); R(PINK, x + 1, yy + 1, 4, 4); R("#ffd0f4", x + 1, yy + 1, 1, 1); } }
    },
    targets: { mh_barrel: { line: "Glowing.", draw(tg, x, t) { R(A.C.ink, x - 6, G - 16, 12, 16); R("#e8c23a", x - 5, G - 15, 10, 15); R(A.C.ink, x - 5, G - 11, 10, 1); R(A.C.ink, x - 5, G - 5, 10, 1); R(A.C.ink, x - 2, G - 10, 4, 4); R("#e8c23a", x - 1, G - 9, 2, 2); if (Math.floor(t * 3) % 2) R(PINK, x - 3, G - 17, 6, 1); } } },
    reset(S) { S.mh = { belly: 0, pop: -1, kids: [] }; },
    update(dt, S, p) {
      const m = S.mh; const inPond = p.x > POND[0] && p.x < POND[1];
      if (inPond && m.pop < 0) m.belly = Math.min(1, m.belly + dt * .18);
      if (inPond && Math.random() < dt * 3) S.fx.push({ kind: "spark", x: p.x + (Math.random() - .5) * 20, y: 2, vx: 0, vy: 20, t: 0, life: .6 });
      if (m.pop < 0 && m.belly > .3 && p.x > TOWEL - 30) { m.pop = 0; A.showCaption("...congratulations?"); A.say("Oh. OH.", TOWEL, 40, 1.6);
        A.__s2.splash(S, p.x, 14, 24, "#7CFC6A"); A.__s2.splash(S, p.x, 14, 12, "#E8271A");
        for (let i = 0; i < 4; i++) m.kids.push({ x: p.x, vx: 40 + i * 16, t: 0 }); m.belly = 0; }
      for (const k of m.kids) { k.t += dt; k.x += k.vx * dt; }
      A.__s2.dropFx(A, S, dt);
    },
    bg(t, S) {
      A.sky({ sky: ["#2a4a8a", "#3a5a9a", "#4a6aaa"] }); disc(A, "#f4f4ec", 160, 26, 11); A.ctx.globalAlpha = .25; disc(A, "#ffffff", 160, 26, 16); A.ctx.globalAlpha = 1;
      A.layer(.3, 150, (x, k) => { R(A.C.ink, x, 66, 70, 48); R("#5a5e66", x + 1, 67, 68, 47); R("#4a4e56", x + 1, 67, 68, 6);
        [x + 14, x + 26].forEach(cx => { R(A.C.ink, cx, 40, 6, 27); R("#7a7e86", cx + 1, 41, 4, 26); R("#E8271A", cx + 1, 46, 4, 2); smoke(A, cx + 3, 36, t + k, 6, "#1a2236", 50, 30); }); });
      A.layer(.6, 14, (x, k) => { R("#6a6e76", x, 96, 1, 34); for (let j = 0; j < 7; j++) { R("#5a5e66", x + j * 2, 98 + j * 4, 1, 1); R("#5a5e66", x + 13 - j * 2, 98 + j * 4, 1, 1); } }); R("#7a7e86", 0, 96, A.W, 1);
      R("#1f6a2a", 0, 128, A.W, G - 128);
      R("#2f8a2b", 0, G, A.W, 30); A.layer(1, 5, (x, k) => R("#24782a", x, G + 2 + (k % 5) * 5, 1, 2));
      const p0 = sx(A, POND[0]), p1 = sx(A, POND[1]);               // the glowing pond (Red wades right through it)
      if (p1 > 0 && p0 < A.W) { A.ctx.globalAlpha = .35 + Math.sin(t * 2) * .08; R(PINK, p0 - 10, G - 30, p1 - p0 + 20, 30); A.ctx.globalAlpha = 1;
        R("#ff8ae0", p0, G - 4, p1 - p0, 34); R(PINK, p0, G + 6, p1 - p0, 24); A.layer(1, 9, (x, k) => { if (x > p0 && x < p1 - 6) R("#ffd0f4", x + (Math.floor(t * 2 + k) % 4), G + (k % 4) * 6, 5, 1); }); }
    },
    mid(t, S) {
      const tw = sx(A, TOWEL + 9); R(A.C.ink, tw - 1, G - 26, 16, 18); for (let i = 0; i < 4; i++) { R("#f4f4f2", tw, G - 25 + i * 4, 14, 2); R("#3460BE", tw, G - 23 + i * 4, 14, 2); }
      for (const k of S.mh.kids) { const x = sx(A, k.x), h = Math.abs(Math.sin(k.t * 10)) * 3; R(A.C.ink, x - 2, G - 7 - h, 5, 7); R("#b08ad6", x - 1, G - 6 - h, 3, 5); R(A.C.ink, x, G - 5 - h, 1, 1); }
    },
    fg(t, S) {
      const b = S.mh.belly; if (b > .05) onHead(A, (x, top, face, duck) => { if (duck) return; const r = Math.round(2 + b * 6), cx = x + (face > 0 ? 2 : -2), cy = top + 15;
        disc(A, A.C.ink, cx, cy, r + 1); disc(A, "#E8271A", cx, cy, r); A.R("#ff7a5e", cx - 1, cy - r + 1, 2, 1); });
      A.__s2.dropFx(A, S);
    }
  };
};
})();
