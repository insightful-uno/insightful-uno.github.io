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
