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

/* ======================= batch 3 ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx, confetti } = W.__shared;
const { arm, reds, drawWalker, follow, stage, spot, audience, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke } = W.__shared2;
const flash = (A, a, c = "#ffffff") => { if (a <= 0) return; A.ctx.globalAlpha = Math.min(1, a); A.R(c, 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; };
const note = (A, lines, a) => { const R = A.R, x = 100, y = 30; A.ctx.globalAlpha = a; R(A.C.ink, x - 1, y - 1, 122, 102); R("#f7f4ee", x, y, 120, 100);
  A.ctx.fillStyle = A.C.ink; A.ctx.font = "bold 13px monospace"; A.ctx.textAlign = "left"; lines.forEach((l, i) => A.ctx.fillText(l, x + 8, y + 22 + i * 17)); A.ctx.globalAlpha = 1; };
const hit = (A, S, p, say) => { if (p.inv > 0) return; p.inv = 1.2; p.kb = .16; p.vy = 150; p.onG = false; if (say) A.redSays(say, 1.4); };

/* MUNCH'D: a tiny man in a big blue sea. "You don't have to do this." */
W["munch-d"] = A => {
  const R = A.R, G = A.G, MAN = 800;
  return {
    sprites: { tiny: { pal: { K: "#14110F", A: "#2a2826" }, rows: [".KK.", "KAAK", ".KK.", "KAAK", "KAAK", ".KK.", ".KK.", "K..K"] } },
    level: {
      obs: [["mu_guy", 190], ["rock", 280], ["mu_guy", 380], ["mu_guy", 470], ["rock", 560], ["mu_guy", 660]],
      target: "plant", targetAt: 520, prop: "egg", propAt: 120, npcs: [["tiny", MAN, -1, "You don't have to do this."]],
      captions: [[30, "A little guy. All alone."], [400, "They keep running."], [700, "Don't do it."]]
    },
    obs: { mu_guy: { w: 4, h: 8, y: 0, vx: -60, draw(o, x, y, t) { const f = Math.floor(t * 10 + o.x) % 2; A.ctx.drawImage(A.NS.tinyL, x - 1, y - 1 - f); } } },
    reset(S) { S.mu = { eat: -1 }; },
    update(dt, S, p) { const m = S.mu; if (m.eat < 0 && p.x > MAN - 14) { m.eat = 0; S.npcs.forEach(n => { if (n.kind.startsWith("tiny")) n.gone = true; }); }
      if (m.eat >= 0 && m.eat < 9) { m.eat += dt; p.inv = .2; if (m.eat > 2.2 && !m.done) { m.done = true; A.showCaption("Munch'd."); A.redSays("...snack time.", 2); } } },
    bg(t, S) {
      R("#ecebe2", 0, 0, A.W, A.H); A.layer(.5, 8, (x, k) => R("#e2e0d6", x + A.hash(k, 1) * 6, A.hash(k, 2) * 140, 1, 1));
      // the giant's loop of arm, coiling in the sea
      A.layer(.35, 260, (x, k) => { const k2 = A.ctx; k2.lineWidth = 9; k2.strokeStyle = A.C.ink; k2.beginPath(); k2.ellipse(x + 120, 128, 70, 16, 0, Math.PI * 1.05, Math.PI * 1.95 + Math.sin(t + k) * .05); k2.stroke();
        k2.lineWidth = 7; k2.strokeStyle = "#d8261a"; k2.stroke(); });
      R("#2a4ab8", 0, 120, A.W, G - 120); A.layer(.4, 15, (x, k) => R("#3a5ad0", x + (Math.floor(t + k) % 5), 126 + (k % 5) * 5, 7, 1));
      R("#2a4ab8", 0, G, A.W, 30); A.layer(1, 10, (x, k) => R("#1f3f9a", x + (Math.floor(t * 2 + k) % 4), G + 3 + (k % 5) * 5, 6, 1));
    },
    drawNpc(n) { return !!n.gone; },
    fg(t, S) {
      const e = S.mu.eat; if (e < 0 || e > 3) return;
      // close-up: mouth opens, tiny man drops in, teeth clamp
      const open = e < 1.3 ? Math.min(1, e / .6) : Math.max(0, 1 - (e - 1.3) * 5), cx = A.W / 2, cy = 120;
      R("#c8201a", 0, 0, A.W, A.H); disc(A, "#ff7a5e", 60, 90, 26); disc(A, "#ff7a5e", 260, 90, 26);
      disc(A, A.C.ink, 100, 46, 15); disc(A, "#ffffff", 100, 46, 14); disc(A, A.C.ink, 103, 48, 6); disc(A, A.C.ink, 220, 46, 15); disc(A, "#ffffff", 220, 46, 14); disc(A, A.C.ink, 217, 48, 6);
      const h = Math.round(4 + open * 44); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(cx, cy, 56, h / 2 + 2, 0, 0, 7); A.ctx.fill();
      A.ctx.fillStyle = "#3a0806"; A.ctx.beginPath(); A.ctx.ellipse(cx, cy, 54, h / 2, 0, 0, 7); A.ctx.fill();
      for (let i = -5; i <= 5; i++) { R("#f4f4ee", cx + i * 9 - 4, cy - h / 2, 8, 6); R("#f4f4ee", cx + i * 9 - 4, cy + h / 2 - 6, 8, 6); }
      if (open > .2) { disc(A, "#e8506a", cx, cy + h / 2 - 8, 14); }
      if (e > .5 && e < 1.4) { const ty = 10 + (e - .5) * 120; A.ctx.drawImage(A.NS.tiny, cx - 6, ty, 12, 24); }
      if (e > 1.5) for (let i = 0; i < 5; i++) R(A.C.ink, cx - 30 + i * 14, cy + 4, 2, 4 + (e - 1.5) * 30 * ((i % 3) + 1) / 3);
      flash(A, e > 2.6 ? (e - 2.6) / .4 : 0, "#ecebe2");
    }
  };
};

/* TAKING FROM MOTHER NATURE: she offers a fruit. He takes the whole tree. */
W["taking-from-mother-nature"] = A => {
  const R = A.R, G = A.G, TREE = 760;
  return {
    sprites: { fruit: { pal: { Y: "#e8d83a", Q: "#4a8a2a" }, rows: [".Q.", "YYY", "YYY", ".Y."] }, axe: { pal: { N: "#8a5a32", G: "#9a9a9a" }, rows: ["GG..", "GGN.", ".GNN", "...N", "...N"] }, nobody: { rows: ["."] } },
    level: {
      obs: [["tm_fruit", 200], ["snowball", 290], ["tm_fruit", 380], ["tm_branch", 460], ["tm_fruit", 600], ["tm_branch", 680]],
      target: "tree", targetAt: 520, prop: "fruit", propAt: 120, npcs: [["nobody", TREE, -1, "Take what you need."]],
      captions: [[30, "Fruit for days."], [300, "She keeps giving."], [640, "Maybe a little more."]]
    },
    obs: {
      tm_fruit: { w: 5, h: 5, y: 40, vx: 0, draw(o, x, y, t) { A.ctx.drawImage(A.NS.fruit, x - 1, y - 1); } },
      tm_branch: { w: 14, h: 5, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y + 1, 14, 4); R("#a8763a", x + 1, y + 2, 12, 2); R(A.C.ink, x + 9, y - 2, 2, 4); R("#4a8a2a", x + 10, y - 3, 3, 2); } }
    },
    reset(S) { S.tm = { chop: -1 }; S.obs.forEach(o => { if (o.type === "tm_fruit") { o.y0 = 40 + (o.x % 20); o.y = o.y0; o.vy = 0; } }); },
    update(dt, S, p) {
      for (const o of S.obs) if (o.type === "tm_fruit" && !o.off) { if (Math.abs(o.x - p.x) < 50 || o.vy) { o.vy = (o.vy || 0) + 160 * dt; o.y = Math.max(0, o.y - o.vy * dt); if (o.y === 0) { o.off = true; } } }
      const c = S.tm; if (c.chop < 0 && p.x > TREE - 26) { c.chop = 0; A.redSays("Don't mind if I do.", 1.6); }
      if (c.chop >= 0 && c.chop < 9) { const b = c.chop; c.chop += dt; if (Math.floor(b * 3) !== Math.floor(c.chop * 3) && c.chop < 1.6) crowdText(A, S, "THWACK", TREE + (Math.random() - .5) * 20, 70);
        if (b < 1.6 && c.chop >= 1.6) { A.showCaption("Taking from Mother Nature."); A.__s2.splash(S, TREE, 30, 16, "#a8763a"); } }
    },
    bg(t, S) {
      R("#f4f4f0", 0, 0, A.W, A.H); A.layer(.3, 6, (x, k) => R("#e8e8e4", x + A.hash(k, 1) * 5, A.hash(k, 2) * 150, 1, 1));
      A.layer(.4, 120, (x, k) => { R("#c8a070", x + 30, 112, 6, 38); R(A.C.ink, x + 29, 112, 1, 38); disc(A, "#5aa83a", x + 33, 108, 14); disc(A, "#e8d83a", x + 26, 110, 2); disc(A, "#e8d83a", x + 40, 104, 2); });
      R("#e8e8e4", 0, G, A.W, 30); A.layer(1, 7, (x, k) => R("#d8d8d2", x, G + 3 + (k % 5) * 5, 3, 1));
    },
    mid(t, S) {
      const x = sx(A, TREE), c = S.tm.chop, done = c >= 1.6;
      if (!done) {                                          // Mother Nature herself: trunk body, leafy hair, branch arms with fruit
        const sh = c >= 0 ? Math.round(Math.sin(c * 40) * 2) : 0, X = x + sh;
        R(A.C.ink, X - 11, 60, 22, G - 60); R("#c8843a", X - 10, 61, 20, G - 61); for (let j = 70; j < G; j += 7) R("#a8662a", X - 8 + (j % 3) * 4, j, 6, 1);
        disc(A, A.C.ink, X, 52, 15); disc(A, "#3a8a2a", X, 52, 14); for (let i = 0; i < 12; i++) disc(A, "#5aa83a", X - 11 + (i * 7) % 22, 42 + (i * 5) % 18, 3);
        R("#c8843a", X - 7, 56, 14, 10); R(A.C.ink, X - 5, 59, 2, 3); R(A.C.ink, X + 3, 59, 2, 3); R(A.C.ink, X - 1, 64, 2, 1); R("#e87a6a", X - 7, 63, 2, 1); R("#e87a6a", X + 5, 63, 2, 1);
        [[-1, 0], [1, 2]].forEach(([s, ph]) => { const ax = X + s * 10; for (let j = 0; j < 26; j++) { const u = j / 26, px = ax + s * j, py = 82 - Math.round(Math.sin(u * 3 + t + ph) * 8 + u * 20); R(A.C.ink, px - 1, py - 1, 3, 5); R("#c8843a", px, py, 2, 3); }
          disc(A, "#e8d83a", ax + s * 20, 64 + Math.round(Math.sin(t + ph) * 3), 3); disc(A, "#e8d83a", ax + s * 12, 70, 3); });
      } else {                                              // stump, logs and a wagon full of fruit
        R(A.C.ink, x - 12, G - 10, 24, 10); R("#c8843a", x - 11, G - 9, 22, 9); A.ctx.fillStyle = "#e8b878"; A.ctx.beginPath(); A.ctx.ellipse(x, G - 10, 11, 3, 0, 0, 7); A.ctx.fill();
        [[-40, 0], [-28, 6], [26, 2]].forEach(([dx, dy]) => { R(A.C.ink, x + dx - 1, G - 7 - dy, 14, 7); R("#c8843a", x + dx, G - 6 - dy, 12, 5); R("#e8b878", x + dx + 10, G - 6 - dy, 2, 5); });
        const wx = x + 50; R(A.C.ink, wx - 1, G - 17, 26, 12); R("#8a4a2a", wx, G - 16, 24, 10); for (let i = 0; i < 7; i++) disc(A, "#e8d83a", wx + 3 + i * 3, G - 17, 2);
        disc(A, A.C.ink, wx + 5, G - 3, 4); disc(A, "#9a9a9a", wx + 5, G - 3, 2); disc(A, A.C.ink, wx + 19, G - 3, 4); disc(A, "#9a9a9a", wx + 19, G - 3, 2);
      }
    },
    fg(t, S) { const c = S.tm.chop; if (c >= 0 && c < 1.6) onHead(A, (x, top, face) => { const sw = Math.floor(c * 6) % 2; A.ctx.drawImage(A.NS[face > 0 ? "axe" : "axeL"], x + face * (sw ? 6 : 2) - 2, top + (sw ? 12 : 4)); }); txtFx(A, S); dropFx(A, S); },
    drawNpc() { return true; }
  };
};

/* YOU SMELL: she left a note. He finds a lighter. The gas finds the flame. */
W["you-smell"] = A => {
  const R = A.R, G = A.G, NOTE = 110, BOOM = 640, DOOR = 560;
  return {
    sprites: { lighter: { pal: { Y: "#e8d83a", G: "#9a9a9a" }, rows: ["GG", "YY", "YY", "YY"] } },
    level: {
      obs: [["sock", 200], ["ys_fly", 260], ["sock", 330], ["ys_fly", 420], ["ys_fly", 500], ["rat", 720]],
      target: "lamp", targetAt: 380, prop: "lighter", propAt: 160, npcs: [],
      captions: [[30, "Woke up alone."], [250, "3:32 AM. Can't sleep."], [470, "Lighter in hand. Bad idea."]]
    },
    obs: { ys_fly: { w: 5, h: 4, y: 15, vx: -55, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 9 + o.x) * 3), f = Math.floor(t * 24) % 2; R(A.C.ink, x + 1, yy + 1, 3, 2); R("rgba(255,255,255,.8)", x + (f ? 0 : 2), yy - 1, 2, 2); } } },
    reset(S) { S.ys = { note: -1, gas: [], boom: -1 }; },
    update(dt, S, p) {
      const y = S.ys; if (y.note < 0 && p.x > NOTE) y.note = 0; if (y.note >= 0 && y.note < 9) y.note += dt;
      if (y.boom < 0 && Math.random() < dt * 4) y.gas.push({ x: p.x - p.face * 5, y: 12, t: 0 }); for (const g of y.gas) { g.t += dt; g.y += dt * 6; } y.gas = y.gas.filter(g => g.t < 2.5);
      if (y.boom < 0 && p.x > BOOM && p.x < BOOM + 80) { y.boom = 0; y.gas = []; p.vy = 230; p.onG = false; p.kb = .4; A.reskin(r => r, { R: "#4a2a24", r: "#2a1a14", W: "#5a5a5a", w: "#3a3a3a" }); }
      if (y.boom >= 0) { const b = y.boom; y.boom += dt; if (b < 1 && y.boom >= 1) { A.showCaption("You smell."); A.redSays("...fresh scent.", 2); } }
    },
    bg(t, S) {
      const b = S.ys.boom, door = sx(A, DOOR);
      if (b >= 0 || door < A.W) {                            // outside: the apartment on fire
        R("#a080e0", 0, 0, A.W, 50); R("#7a7aaa", 0, 50, A.W, 40); R("#6a6a7a", 0, 90, A.W, G - 90);
        const bx = sx(A, 720); R(A.C.ink, bx - 41, 20, 82, G - 20); R("#c8c8c8", bx - 40, 21, 80, G - 21);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) { const lit = b >= 0 && i === 2 && j === 1; R(A.C.ink, bx - 34 + i * 18, 28 + j * 17, 12, 11); R(lit ? "#f3a91f" : "#8a9ab0", bx - 33 + i * 18, 29 + j * 17, 10, 9); }
        if (b >= 0) for (let i = 0; i < 6; i++) { const u = (t * .6 + i / 6) % 1; puff(A, bx + 8 + u * 40, 50 - u * 30, 4 + u * 10, i % 2 ? "#f3a91f" : "#e8501a", 1 - u); smoke(A, bx + 10, 30, t + i, 1, "#3a3a3a", 30, 40); }
        R("#5a5a5a", 0, G, A.W, 30); A.layer(1, 30, (x) => R("#f4f4f2", x, G + 14, 12, 2));
      }
      if (b < 0 && door > 0) {                               // the bedroom
        const x1 = Math.min(A.W, door); R("#e8e2d2", 0, 0, x1, G); R("#d8d0bc", 0, G - 40, x1, 40); R("#8a5a32", 0, G, x1, 30); A.layer(1, 18, (x) => { if (x < door) R("#7a4a2a", x, G + 1, 1, 29); });
        const bx = sx(A, 60); R(A.C.ink, bx - 40, 108, 6, 42); R("#8a5a32", bx - 39, 109, 4, 41); R(A.C.ink, bx - 34, 128, 70, 18); R("#3a8ad6", bx - 33, 126, 68, 16); R("#f4f4f2", bx - 32, 122, 14, 6); R("#ffffff", bx - 14, 124, 8, 3);
        const nx = sx(A, 180); R(A.C.ink, nx - 10, 128, 20, 22); R("#a8763a", nx - 9, 129, 18, 21); R(A.C.ink, nx - 6, 122, 12, 6); R("#3a6a3a", nx - 5, 123, 10, 4); A.ctx.fillStyle = "#7CFC6A"; A.ctx.font = "4px monospace"; A.ctx.textAlign = "center"; A.ctx.fillText("3:32", nx, 127);
        R(A.C.ink, door - 3, 40, 4, G - 40); R("#8a5a32", door - 2, 40, 2, G - 40);
      }
    },
    mid(t, S) { for (const g of S.ys.gas) { A.ctx.globalAlpha = .5 * (1 - g.t / 2.5); disc(A, "#9ac83a", sx(A, g.x), A.G - g.y, 3 + g.t * 3); } A.ctx.globalAlpha = 1; },
    fg(t, S) {
      const y = S.ys; if (y.note >= 0 && y.note < 3.2) note(A, ["I LOVE", "YOU, BUT", "I HATE HOW", "YOU SMELL.", "  -goodbye"], Math.min(1, y.note * 3, (3.2 - y.note) * 3));
      const b = y.boom; if (b >= 0 && b < 1.2) { flash(A, 1 - b / 1.2, "#f3a91f"); disc(A, "#ffffff", A.W / 2, 90, Math.max(0, 60 - b * 60)); }
      if (b < 0 && S.p.x > 470) onHead(A, (x, top, face) => { const fl = Math.floor(t * 12) % 2; R("#f3a91f", x + face * 7, top + 9 - fl, 2, 3); R("#ffffff", x + face * 7, top + 11, 1, 1); });
    }
  };
};

/* DEAD ASS: grieving at her grave. She reaches back up for the ring. */
W["dead-ass"] = A => {
  const R = A.R, G = A.G, GRAVE = 780;
  return {
    sprites: { ring: { pal: { Y: "#e8c23a", L: "#9fe0ff" }, rows: [".L.", "YYY", "Y.Y", "YYY"] }, nobody: { rows: ["."] } },
    level: {
      obs: [["bird", 190], ["da_hand", 270], ["da_hand", 360], ["bird", 430], ["da_hand", 600], ["da_hand", 680]],
      target: "da_stone", targetAt: 500, prop: "ring", propAt: 130, npcs: [["nobody", GRAVE, -1, "Put a ring on it."]],
      captions: [[30, "Visiting an old flame."], [300, "The ground's restless today."], [700, "She'd have said yes."]]
    },
    obs: { da_hand: { w: 7, h: 0, y: 0, vx: 0, tough: "grabby!", draw(o, x, y, t) { if (o.h < 2) return; const top = G - o.h; R(A.C.ink, x, top, 7, o.h); R("#3a6ae0", x + 1, top + 1, 5, o.h);
      for (let i = 0; i < 4; i++) { R(A.C.ink, x + i * 2 - 1, top - 4, 2, 5); R("#3a6ae0", x + i * 2 - 1, top - 3, 1, 4); } R("#6a3a1a", x - 3, G - 1, 13, 2); } } },
    targets: { da_stone: { line: "Rest in pee.", draw(tg, x) { R(A.C.ink, x - 8, G - 22, 16, 22); R("#a8a8a8", x - 7, G - 21, 14, 21); R("#c8c8c8", x - 7, G - 21, 14, 2); R("#8a8a8a", x - 3, G - 15, 6, 1); R("#8a8a8a", x - 1, G - 18, 2, 7); R(A.C.ink, x - 10, G - 2, 20, 2); } } },
    reset(S) { S.da = { up: -1 }; S.obs.forEach(o => { if (o.type === "da_hand") { o.h = 0; o.off = true; } }); },
    update(dt, S, p) {
      for (const o of S.obs) if (o.type === "da_hand") { const c = (S.t * .45 + o.x * .013) % 1, up = c < .2 ? c / .2 : c < .5 ? 1 : c < .6 ? 1 - (c - .5) / .1 : 0; o.h = Math.round(up * 16); o.off = o.h < 6; }
      const d = S.da; if (d.up < 0 && p.x > GRAVE - 40) d.up = 0; if (d.up >= 0 && d.up < 9) { const b = d.up; d.up += dt;
        if (b < 2 && d.up >= 2) { A.showCaption("Dead ass."); hearts(S, GRAVE + 8, 30, 8); A.redSays("Till death... and after.", 2.2); } }
      if (d.up > 2 && Math.random() < dt * 1.5) hearts(S, GRAVE + 8, 30, 1);
    },
    bg(t, S) {
      R("#3a9a2a", 0, 0, A.W, A.H); A.layer(.3, 9, (x, k) => R("#2f8a24", x + A.hash(k, 1) * 6, A.hash(k, 2) * 150, 3, 1));
      A.layer(.5, 70, (x, k) => { const h = 14 + (k % 3) * 4; R(A.C.ink, x + 20, 118 - h, 12, h); R("#8a8a8a", x + 21, 119 - h, 10, h - 1); R("#2a7a1f", x + 16, 117, 20, 2); });
      R("#3a9a2a", 0, G, A.W, 30); A.layer(1, 6, (x, k) => R("#2f8a24", x, G + 2 + (k % 5) * 5, 2, 1));
    },
    mid(t, S) {
      const x = sx(A, GRAVE + 10); R(A.C.ink, x - 11, G - 30, 22, 30); R("#a8a8a8", x - 10, G - 29, 20, 29); R("#c8c8c8", x - 10, G - 29, 20, 2); R(A.C.ink, x - 14, G - 3, 28, 3); R("#8a8a8a", x - 13, G - 2, 26, 2);
      const u = S.da.up; if (u < 0) return; const h = Math.round(Math.min(1, u / 1.2) * 34), hx = x - 22;
      R("#6a3a1a", hx - 6, G - 1, 16, 2); R(A.C.ink, hx - 1, G - h, 6, h); R("#3a6ae0", hx, G - h + 1, 4, h - 1); for (let i = 0; i < 5; i++) R("#f4f4f2", hx, G - h + 12 + i * 2, 1, 1);   // pearls
      for (let i = 0; i < 4; i++) { R(A.C.ink, hx - 2 + i * 2, G - h - 6, 2, 7); R("#3a6ae0", hx - 2 + i * 2, G - h - 5, 1, 6); }
      if (u > 2) { R("#e8c23a", hx + 2, G - h - 3, 3, 2); if (Math.floor(t * 4) % 2) R("#ffffff", hx + 5, G - h - 6, 1, 1); }
    },
    fg(t, S) { heartFx(A, S); },
    drawNpc() { return true; }
  };
};

/* KISS ASS: top down, desert highway, new message... is that a cliff? */
W["kiss-ass"] = A => {
  const R = A.R, G = A.G, MSG = 420, CLIFF = [800, 830];
  return {
    sprites: Object.assign(reds(A, "kr", {}), { pic: { rows: ["."] } }),
    level: {
      obs: [["tumble", 200], ["cone", 290], ["tumble", 360], ["cone", 520], ["tumble", 600], ["cone", 700]],
      target: "cactus", targetAt: 470, prop: "phone", propAt: 130, npcs: [],
      captions: [[30, "Open road. Eyes on the road."], [MSG, "New message..."], [740, "Is that a cliff?"]]
    },
    reset(S) { S.ka = { msg: -1, fall: -1, back: false }; },
    update(dt, S, p) {
      const k = S.ka; if (k.msg < 0 && p.x > MSG) k.msg = 0; if (k.msg >= 0) k.msg += dt;
      if (k.fall < 0 && !k.back && p.x > CLIFF[0] + 6 && p.x < CLIFF[1]) { k.fall = 0; }
      if (k.fall >= 0) { k.fall += dt; p.x = CLIFF[0] + 10; p.vy = 0; p.y = 0; p.inv = .3; if (k.fall > 2.4) { k.fall = -1; k.back = true; p.x = CLIFF[1] + 20; p.y = 30; p.vy = 0; p.onG = false; A.showCaption("Kiss ass. Totaled."); A.redSays("Worth it? ...worth it.", 2); } }
    },
    bg(t, S) {
      R("#f0a050", 0, 0, A.W, A.H); A.layer(.3, 40, (x, k) => { if (A.hash(k, 1) > .5) { R("#2a7a2a", x + 10, 40 + (k % 5) * 18, 2, 7); R("#2a7a2a", x + 8, 43 + (k % 5) * 18, 2, 3); } });
      R("#c8c8c8", 0, 120, A.W, G - 120); A.layer(.6, 30, (x) => R("#f4f4f2", x, 134, 14, 2)); R("#b0b0b0", 0, 120, A.W, 1);
      R("#c8c8c8", 0, G, A.W, 30); A.layer(1, 26, (x) => R("#f4f4f2", x, G + 14, 12, 2));
      const c0 = sx(A, CLIFF[0]), c1 = sx(A, CLIFF[1]); if (c1 > 0 && c0 < A.W) { R("#5a2a14", c0, 118, c1 - c0, A.H - 118); R("#8a4a2a", c0, 118, 3, A.H - 118); R("#8a4a2a", c1 - 3, 118, 3, A.H - 118); R(A.C.ink, c0, G, 1, 30); R(A.C.ink, c1, G, 1, 30); }
    },
    fg(t, S) {
      const k = S.ka, r = A.red;
      if (!k.back && k.fall < 0) {                                       // the convertible around him
        const x = r.x, w = Math.floor(S.p.dist / 3) % 2; R(A.C.ink, x - 22, G - 12, 44, 11); R("#3aa0e6", x - 21, G - 11, 42, 9); R("#7ac8f4", x - 21, G - 11, 42, 2); R("#e8d84a", x - 8, G - 14, 10, 3);
        R("#9fd0ee", x + 7 * r.face, G - 19, 2, 7); R("#f4f4f2", x + 19 * (r.face || 1) - 1, G - 9, 3, 2);
        [x - 13, x + 13].forEach(wx => { disc(A, A.C.ink, wx, G - 1, 5); disc(A, "#9a9a9a", wx, G - 1, 2); R(A.C.ink, wx - (w ? 2 : 0), G - 1 - (w ? 0 : 2), w ? 5 : 1, w ? 1 : 5); });
        if (S.p.x !== k.lx) { k.lx = S.p.x; puff(A, x - 26 * (r.face || 1), G - 4, 4 + Math.random() * 3, "#e8e0d0", .6); }
        if (k.msg >= 0) onHead(A, (hx, top, face) => { R(A.C.ink, hx + face * 6 - 2, top + 9, 5, 7); R("#f4f4f2", hx + face * 6 - 1, top + 10, 3, 5); });
      }
      if (k.msg >= 0 && k.msg < 3) {                                    // phone pop-up
        const a = Math.min(1, k.msg * 4, (3 - k.msg) * 3), x = 250, y = 24; A.ctx.globalAlpha = a; R(A.C.ink, x - 1, y - 1, 52, 82); R("#f4f4f2", x, y, 50, 80); R("#f0a0d0", x + 4, y + 8, 42, 50);
        R("#b080e0", x + 18, y + 14, 12, 12); R("#b080e0", x + 16, y + 26, 16, 24); R(A.C.ink, x + 16, y + 12, 14, 4); R("#3ad0d0", x + 4, y + 62, 42, 9); A.ctx.fillStyle = A.C.ink; A.ctx.font = "5px monospace"; A.ctx.textAlign = "center"; A.ctx.fillText("do you like?", x + 25, y + 68); A.ctx.globalAlpha = 1;
      }
      if (k.fall >= 0) { const u = k.fall; R("#f0a050", 0, 0, A.W, A.H); R("#8a4a2a", 0, 0, 60, A.H); R("#5a2a14", 0, 0, 50, A.H);       // over the edge
        const k2 = A.ctx; k2.save(); k2.translate(160 + u * 30, 30 + u * 70); k2.rotate(u * 2.5); R(A.C.ink, -22, -7, 44, 14); R("#3aa0e6", -21, -6, 42, 12); disc(A, A.C.ink, -13, 7, 5); disc(A, A.C.ink, 13, 7, 5); k2.drawImage(A.NS.kr_jump, -4, -24); k2.restore();
        if (u > 1.9) { flash(A, (u - 1.9) * 2, "#f3a91f"); } }
    }
  };
};

/* HEART THROB: she's across the room. He runs. She takes his heart, literally. */
W["hearth-throb"] = A => {
  const R = A.R, G = A.G, HER = 860, GRAB = 820;
  return {
    sprites: { her: { pal: { a: "#2a4ad0", d: "#14110F", b: "#2a4ad0", c: "#2a4ad0", s: "#2a4ad0", P: "#c870d0" }, rows: [
      "...dddd...", "..dddddd..", ".ddaaaadd.", ".daKaaKad.", ".daaaaaad.", ".dPaPPaPd.", ".d..aa..d.", "dd.aaaa.dd", "daaaaaaaad", "d.aaaaaa.d", "..aaaaaa..", "..aaaaaa..", "..aaaaaa..", "..aa..aa..", "..aa..aa..", "..aa..aa..", ".aaa..aaa."] },
      heart: { pal: { G: "#7CFC6A", P: "#ff5a8a" }, rows: ["PP.PP", "PPPPP", ".PPP.", "..P.."] } },
    level: {
      obs: [["ht_heart", 200], ["ht_note", 280], ["ht_heart", 360], ["ht_note", 450], ["ht_heart", 560], ["ht_heart", 640], ["ht_note", 720]],
      target: "bush", targetAt: 520, prop: "flower", propAt: 140, npcs: [["her", HER, -1, "Come get it."]],
      captions: [[30, "Love at first sight."], [300, "Legs like noodles."], [600, "Run to her."]]
    },
    obs: {
      ht_heart: { w: 7, h: 6, y: 15, vx: -50, draw(o, x, y, t) { const b = Math.round(Math.sin(t * 4 + o.x) * 2); R(A.C.ink, x, y + b, 7, 5); R("#ff5a8a", x + 1, y + b + 1, 2, 2); R("#ff5a8a", x + 4, y + b + 1, 2, 2); R("#ff5a8a", x + 1, y + b + 2, 5, 2); R("#ff5a8a", x + 3, y + b + 4, 1, 1); } },
      ht_note: { w: 8, h: 6, y: 0, vx: -70, draw(o, x, y) { R(A.C.ink, x, y, 8, 6); R("#f4f4f2", x + 1, y + 1, 6, 4); R("#ff5a8a", x + 3, y + 2, 2, 2); } }
    },
    reset(S) { S.ht = { grab: -1 }; },
    update(dt, S, p) {
      const h = S.ht; if (h.grab < 0 && p.x > GRAB && p.x < GRAB + 40) { h.grab = 0; A.showCaption("She took it."); }
      if (h.grab >= 0 && h.grab < 9) { const b = h.grab; h.grab += dt; if (h.grab < 1.4) { p.x = GRAB; p.inv = .3; }
        if (b < .5 && h.grab >= .5) { splash(S, GRAB, 18, 20, "#7CFC6A"); crowdText(A, S, "SHUNK", GRAB, 50); }
        if (b < 1.4 && h.grab >= 1.4) { A.redSays("...keep it.", 2); hearts(S, HER, 30, 6); } }
      dropFx(A, S, dt);
    },
    bg(t, S) { R("#ecd6a8", 0, 0, A.W, A.H); A.layer(.3, 8, (x, k) => R("#e2cc9a", x + A.hash(k, 1) * 6, A.hash(k, 2) * 150, 1, 1)); R("#d8bf8a", 0, G + 1, A.W, 29); A.ctx.globalAlpha = .25; R("#8a6a3a", 0, G + 1, A.W, 2); A.ctx.globalAlpha = 1; },
    mid(t, S) {
      const h = S.ht; if (h.grab < 0 || h.grab > 1.4) return;
      const hx = sx(A, HER), rx = sx(A, GRAB), u = Math.min(1, h.grab / .4), ex = lerp(hx - 4, rx + 2, u);      // her arm shoots straight through him
      R(A.C.ink, Math.min(hx, ex) - 1, G - 27, Math.abs(hx - ex) + 2, 6); R("#2a4ad0", Math.min(hx, ex), G - 26, Math.abs(hx - ex), 4); for (let i = 0; i < 4; i++) R("#f4f4f2", hx - 10 - i * 2, G - 25, 1, 1);
    },
    fg(t, S) {
      const h = S.ht, r = A.red;
      if (h.grab < 0) { const d = Math.max(0, 1 - Math.abs(S.p.x - HER) / 500), beat = Math.floor(t * (2 + d * 6)) % 2; onHead(A, (x, top) => { const s = beat ? 1 : 0; R("#ff5a8a", x - 2 - s, top + 13, 2 + s, 2 + s); R("#ff5a8a", x + 1, top + 13, 2 + s, 2 + s); R("#ff5a8a", x - 1, top + 15 + s, 3, 1); }); }
      else if (h.grab > .4) { onHead(A, (x, top) => { R(A.C.ink, x - 2, top + 12, 5, 5); R("#7CFC6A", x - 1, top + 13, 3, 3); });
        const hx = sx(A, h.grab < 1.4 ? lerp(GRAB, HER, Math.min(1, (h.grab - .4))) : HER) - 8; A.ctx.drawImage(A.NS.heart, hx, G - 32 + Math.round(Math.sin(t * 8))); }
      txtFx(A, S); dropFx(A, S); heartFx(A, S);
    }
  };
};

/* SHROOM'D: one little mushroom. Then the walls breathe. Then he IS the mushroom. */
W["shroom-d"] = A => {
  const R = A.R, G = A.G, EAT = 260, FULL = 840;
  const cap = (x, y, s) => { A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(x, y, s + 1, s * .6 + 1, 0, Math.PI, 0); A.ctx.fill(); A.ctx.fillStyle = "#f4f4f2"; A.ctx.beginPath(); A.ctx.ellipse(x, y, s, s * .6, 0, Math.PI, 0); A.ctx.fill();
    for (let i = 0; i < 4; i++) disc(A, "#5a9ae0", x - s * .6 + i * s * .4, y - s * .3 - (i % 2) * s * .15, Math.max(1, s * .15)); R(A.C.ink, x - s - 1, y, s * 2 + 2, 1); };
  return {
    sprites: { shroom: { pal: { Z: "#f4f4f2", L: "#5a9ae0", Y: "#e8d84a" }, rows: [".ZLZ.", "ZZZLZ", "..Y..", "..Y.."] } },
    level: {
      obs: [["mush", 330], ["sh_spore", 410], ["mush", 480], ["sh_spore", 560], ["mush", 640], ["sh_spore", 720]],
      target: "plant", targetAt: 600, prop: "shroom", propAt: 150, npcs: [],
      captions: [[30, "A little mushroom. Just one."], [EAT + 20, "Down the hatch."], [500, "Uh oh. Growing."], [760, "Spores everywhere."]]
    },
    obs: { sh_spore: { w: 5, h: 5, y: 14, vx: -35, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 3 + o.x) * 3); disc(A, ["#c86ed2", "#f3d23b", "#6eaae6"][Math.floor(t * 4 + o.x) % 3], x + 2, yy + 2, 2); } } },
    reset(S) { S.sh = { eat: -1, grow: 0 }; },
    update(dt, S, p) {
      const s = S.sh; if (s.eat < 0 && p.x > EAT) { s.eat = 0; A.redSays("Mmm. Earthy.", 1.6); } if (s.eat >= 0) s.eat += dt;
      s.grow = A.clamp((p.x - 420) / (FULL - 420), 0, 1);
      if (s.grow >= 1 && !s.done) { s.done = true; A.reskin(r => r, { R: "#e8a23a", r: "#c86a1a", W: "#e8d84a", w: "#c8b83a" }); A.showCaption("Shroom'd."); }
    },
    bg(t, S) {
      const s = S.sh, trip = s.eat > 1.2 ? Math.min(1, (s.eat - 1.2) / 3) : 0;
      R(mix("#5ab83a", "#c86ed2", trip * (.5 + .5 * Math.sin(t * .7))), 0, 0, A.W, A.H);
      if (trip > 0) { A.ctx.globalAlpha = trip * .35; for (let y = 0; y < G; y += 10) R(["#f3d23b", "#6eaae6", "#ff7ac8"][(y / 10 + Math.floor(t * 3)) % 3], 0, y + Math.round(Math.sin(t * 2 + y) * 3), A.W, 4); A.ctx.globalAlpha = 1; }
      A.layer(.4, 50, (x, k) => { const sz = 4 + (k % 3) * 2 + trip * 4 * Math.sin(t * 2 + k); R("#e8d84a", x + 20, 124 - sz, 2, sz + 2); cap(x + 21, 124 - sz, sz); });
      R("#5ab83a", 0, G, A.W, 30); A.layer(1, 7, (x, k) => R("#3a9a2a", x, G + 2 + (k % 5) * 5, 2, 1));
    },
    fg(t, S) {
      const s = S.sh;
      if (s.eat >= 0 && s.eat < 1.2) { const a = Math.min(1, s.eat * 4, (1.2 - s.eat) * 4); A.ctx.globalAlpha = a; R("#5ab83a", 0, 0, A.W, A.H);       // x-ray: down the throat
        const cx = A.W / 2; R("#14110F", cx - 14, 30, 28, 110); disc(A, "#14110F", cx, 26, 12); R("#f4f4f2", cx - 1, 34, 2, 60); for (let i = 0; i < 5; i++) R("#f4f4f2", cx - 8, 50 + i * 6, 16, 1); R("#f4f4f2", cx - 6, 18, 3, 3); R("#f4f4f2", cx + 3, 18, 3, 3);
        disc(A, "#f4f4f2", cx, 100, 8); R("#E8271A", cx - 1, 70 + Math.min(28, s.eat * 40), 2, 5); A.ctx.globalAlpha = 1; }
      if (s.grow > 0) onHead(A, (x, top, face) => { cap(x, top + 2, 4 + s.grow * 9); if (s.grow > .3) for (let i = 0; i < 3; i++) cap(x + face * 8 + i - 1, top + 16 + i, 1.5 + s.grow); });
    }
  };
};

/* SALTY FOES: snail men ambush in the canyon. Red brought salt. */
W["salty-foes"] = A => {
  const R = A.R, G = A.G, SN = [320, 860];
  const snail = (x, t, melt, face) => {
    const k = A.ctx, sk = melt > 0 ? mix("#c8a0e0", "#f4f4f2", Math.min(1, melt)) : "#c8a0e0";
    // shell
    disc(A, A.C.ink, x + 6 * face, G - 9, 10); disc(A, "#c8b84a", x + 6 * face, G - 9, 9); k.strokeStyle = "#8a7a2a"; k.beginPath(); k.arc(x + 6 * face, G - 9, 5, 0, 5); k.stroke(); k.beginPath(); k.arc(x + 6 * face, G - 9, 2, 0, 5); k.stroke();
    // body / skeleton
    const h = melt > 1 ? 30 : 30 - Math.min(1, melt) * 4;
    R(A.C.ink, x - 4 - 6 * face, G - h, 8, h); R(sk, x - 3 - 6 * face, G - h + 1, 6, h - 1); R(sk, x - 12, G - 3, 24, 3);
    if (melt > 1) { for (let i = 0; i < 6; i++) R("#14110F", x - 2 - 6 * face, G - h + 8 + i * 3, 4, 1); disc(A, "#f4f4f2", x - 6 * face, G - h + 2, 4); R(A.C.ink, x - 2 - 6 * face, G - h + 1, 1, 2); R(A.C.ink, x + 1 - 6 * face, G - h + 1, 1, 2); }
    else { R(A.C.ink, x - 2 - 6 * face, G - h + 3, 1, 2); R(A.C.ink, x + 1 - 6 * face, G - h + 3, 1, 2); R(A.C.ink, x - 3 - 6 * face, G - h - 5, 1, 5); R(A.C.ink, x + 2 - 6 * face, G - h - 5, 1, 5); }
    if (melt <= 0) { R("#8a6a3a", x - 6 * face - 8 * face, G - h - 6, 1, 26); R("#c8c8c8", x - 6 * face - 8 * face - 1, G - h - 9, 3, 4); }   // spear
    if (melt > 0 && melt < 1.5) for (let i = 0; i < 4; i++) R("#a8f0ff", x - 6 + i * 4, G - h + ((t * 30 + i * 7) % h), 1, 2);
  };
  return {
    sprites: { salt: { pal: { K: "#14110F", Z: "#f4f4f2" }, rows: ["KK", "ZZ", "KK", "ZZ"] }, sn: { rows: ["."] } },
    level: {
      obs: [["sf_spear", 230], ["sf_slime", 420], ["sf_spear", 500], ["sf_slime", 600], ["sf_spear", 700], ["sf_slime", 780]],
      target: "cactus", targetAt: 560, prop: "salt", propAt: 140, npcs: [["sn", SN[0], -1, "Ambush!"], ["sn", SN[1], -1, "Not the salt!"]],
      captions: [[30, "Snail Pass. Stay sharp."], [450, "Got salt?"]]
    },
    obs: {
      sf_spear: { w: 16, h: 2, y: 17, vx: -170, draw(o, x, y) { R("#8a6a3a", x + 3, y, 13, 1); R("#c8c8c8", x, y - 1, 4, 3); R("#E8271A", x + 14, y - 1, 2, 3); } },
      sf_slime: { w: 16, h: 2, y: 0, vx: 0, tough: "eww, slime", draw(o, x, y, t) { A.ctx.globalAlpha = .7; R("#c8e8a0", x, A.G - 1, 16, 2); A.ctx.globalAlpha = 1; R("#ffffff", x + 3 + Math.floor(t * 2) % 8, A.G - 1, 1, 1); } }
    },
    reset(S) { S.sf = { melt: [0, 0] }; },
    update(dt, S, p) {
      const f = S.sf; SN.forEach((x, i) => { if (f.melt[i] === 0 && p.x > x - 30) { f.melt[i] = .001; A.redSays(i ? "Seasoned." : "Pass the salt.", 1.6); }
        if (f.melt[i] > 0) { const b = f.melt[i]; f.melt[i] += dt * .7; if (b < 1 && f.melt[i] >= 1) crowdText(A, S, "SSSSSS", x, 50); } });
      if (f.melt[1] > 1 && !f.cap) { f.cap = true; A.showCaption("Salty foes."); }
    },
    bg(t, S) {
      R("#9fd0ee", 0, 0, A.W, 70); A.layer(.05, 90, (x, k) => { puff(A, x + 30, 20 + (k % 3) * 8, 9, "#f4f4f2", .95); puff(A, x + 44, 22 + (k % 3) * 8, 7, "#f4f4f2", .95); });
      A.layer(.3, 70, (x, k) => { const h = 30 + (k % 3) * 10; disc(A, "#8a5a32", x + 20, 100 - h / 3, h / 2); disc(A, "#7a4a28", x + 50, 96 - h / 4, h / 2.4); R("#8a5a32", x - 10, 96, 90, 20); });
      R("#8a5a32", 0, 112, A.W, G - 112); A.layer(.6, 11, (x, k) => R("#7a4a28", x + A.hash(k, 1) * 6, 118 + A.hash(k, 2) * 28, 3, 1));
      R("#7a4a28", 0, G, A.W, 30); A.layer(1, 6, (x, k) => R("#6a3a1f", x, G + 2 + (k % 5) * 5, 2, 1));
    },
    drawNpc(n, x, t) { const i = Math.abs(n.x - SN[0]) < 5 ? 0 : 1; snail(x, t, A.S.sf ? A.S.sf.melt[i] : 0, -1); return true; },
    fg(t, S) {
      onHead(A, (x, top) => { R(A.C.ink, x - 9, top + 1, 18, 2); R("#e8762a", x - 8, top + 1, 16, 1); R(A.C.ink, x - 5, top - 4, 10, 5); R("#e8762a", x - 4, top - 3, 8, 4); R("#3a5ad0", x - 4, top, 8, 1); });
      SN.forEach((sx0, i) => { const m = S.sf.melt[i]; if (m > 0 && m < 1) { const x = sx(A, sx0); for (let j = 0; j < 8; j++) R("#ffffff", x - 8 + ((j * 5 + Math.floor(t * 20)) % 16), A.G - 40 + ((t * 60 + j * 9) % 30), 1, 1); } });
      txtFx(A, S);
    }
  };
};
})();

/* ======================= batch 4 ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx, confetti } = W.__shared;
const { arm, reds, drawWalker, follow, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke } = W.__shared2;
const flash = (A, a, c = "#ffffff") => { if (a <= 0) return; A.ctx.globalAlpha = Math.min(1, a); A.R(c, 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; };
const clouds = (A, t) => A.layer(.06, 110, (x, k) => { puff(A, x + 30, 18 + (k % 3) * 10, 9, "#f4f4f2", .95); puff(A, x + 44, 20 + (k % 3) * 10, 7, "#f4f4f2", .95); puff(A, x + 20, 22 + (k % 3) * 10, 6, "#f4f4f2", .95); });
const fade = (u, a, b) => Math.max(0, Math.min(1, (u - a) / (b - a)));
const plunge = (A, u, top, bot) => {               // generic "falling down a hole" overlay
  A.R(bot, 0, 0, A.W, A.H); A.R(top, 0, 0, A.W, Math.max(0, 70 - u * 90));
  const k = A.ctx; k.save(); k.translate(A.W / 2 + Math.sin(u * 4) * 16, 40 + u * 70); k.rotate(u * 5); const im = A.NS.b4_jump; k.drawImage(im, -im.width / 2, -im.height / 2); k.restore(); };

/* RIGHT IN THE A: a giant butt monster flattens the city. One rocket. Right in the A. */
W["right-in-the-a"] = A => {
  const R = A.R, G = A.G, KX = 780, FIRE = 600;
  const kaiju = (x, y, happy, t) => {
    const k = A.ctx, Y = "#f3d23b", Yd = "#c8a51e";
    [[x - 18, 1], [x + 18, -1]].forEach(([lx, s]) => { for (let j = 0; j < 9; j++) { const yy = G - j * 6; R(A.C.ink, lx - 5, yy - 6, 10, 6); R(j % 2 ? Y : Yd, lx - 4, yy - 5, 8, 4); } });
    k.fillStyle = A.C.ink; k.beginPath(); k.ellipse(x, y + 18, 34, 26, 0, 0, 7); k.fill(); k.beginPath(); k.ellipse(x, y - 14, 22, 30, 0, 0, 7); k.fill();
    k.fillStyle = Y; k.beginPath(); k.ellipse(x, y + 18, 33, 25, 0, 0, 7); k.fill(); k.beginPath(); k.ellipse(x, y - 14, 21, 29, 0, 0, 7); k.fill();
    R(A.C.ink, x, y + 6, 1, 32); R("#fff6b0", x - 14, y - 34, 4, 10);
    if (happy) { R(A.C.ink, x - 9, y - 22, 6, 1); R(A.C.ink, x + 4, y - 22, 6, 1); R(A.C.ink, x - 6, y - 12, 12, 1); } else { disc(A, A.C.ink, x - 7, y - 22, 2); disc(A, A.C.ink, x + 7, y - 22, 2); R(A.C.ink, x - 3, y - 13, 6, 2); }
    [-1, 1].forEach(s => { arm(A, x + s * 14, y - 36, 18, t, s, Y, null, 3, 4); disc(A, A.C.ink, x + s * 14 + Math.round(Math.sin(t * 3 + s * 3) * 4), y - 56, 4); disc(A, "#ffffff", x + s * 14 + Math.round(Math.sin(t * 3 + s * 3) * 4), y - 56, 2); });
  };
  return {
    sprites: Object.assign(reds(A, "b4", {}), { bazooka: { pal: { Q: "#5a8a2a", G: "#9a9a9a" }, rows: ["GQQQQQQG", "GQQQQQQG"] } }),
    level: {
      obs: [["ra_jet", 200], ["rock", 280], ["ra_jet", 360], ["ra_rubble", 430], ["ra_jet", 520], ["ra_rubble", 580]],
      target: "rock", targetAt: 470, prop: "bazooka", propAt: 130, npcs: [],
      captions: [[30, "Something's stomping the city."], [300, "It has... cheeks."], [560, "One shot. Aim low."]]
    },
    obs: {
      ra_jet: { w: 14, h: 5, y: 17, vx: -150, draw(o, x, y) { R(A.C.ink, x, y + 1, 14, 3); R("#5a8a2a", x + 1, y + 2, 12, 1); R(A.C.ink, x + 6, y - 2, 3, 9); R("#5a8a2a", x + 7, y - 1, 1, 7); R("#9fd0ee", x + 1, y + 1, 2, 1); } },
      ra_rubble: { w: 12, h: 6, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y + 2, 12, 4); R("#8a8a8a", x + 1, y + 3, 10, 3); R(A.C.ink, x + 3, y, 5, 3); R("#aaaaaa", x + 4, y + 1, 3, 2); } }
    },
    reset(S) { S.ra = { shot: -1 }; },
    update(dt, S, p) { const r = S.ra; if (r.shot < 0 && p.x > FIRE) { r.shot = 0; A.redSays("Say hello to my little friend.", 1.6); }
      if (r.shot >= 0 && r.shot < 9) { const b = r.shot; r.shot += dt; if (b < 1.1 && r.shot >= 1.1) crowdText(A, S, "THWOMP", KX, 80); if (b < 2.2 && r.shot >= 2.2) A.showCaption("Right in the A."); } },
    bg(t, S) {
      const r = S.ra, boom = r.shot > 1.8 ? fade(r.shot, 1.8, 2.6) : 0;
      R(mix("#7ab0e6", "#c8301a", boom), 0, 0, A.W, A.H); clouds(A, t);
      A.layer(.3, 34, (x, k) => { const h = 30 + (k % 4) * 12; R(A.C.ink, x, 112 - h, 26, h + 40); R(mix("#9a9a9a", "#6a1a10", boom), x + 1, 113 - h, 24, h + 40); for (let j = 0; j < h / 8; j++) R("#d8d8d8", x + 5 + (j % 2) * 9, 117 - h + j * 8, 4, 3); });
      if (boom > 0) { const cx = Math.min(A.W - 50, Math.max(50, sx(A, KX))); A.ctx.globalAlpha = boom; disc(A, "#ff3a1a", cx, 50, 30); R("#ff3a1a", cx - 9, 60, 18, 60); disc(A, "#ff7a3a", cx - 12, 46, 12); disc(A, "#ff7a3a", cx + 14, 54, 10); R("#ffffff", cx - 30, 118, 60, 3); A.ctx.globalAlpha = 1; }
      R("#6a6a6a", 0, G, A.W, 30); A.layer(1, 30, (x) => R("#f3d23b", x, G + 14, 12, 2));
    },
    mid(t, S) {
      const r = S.ra, kx = sx(A, KX), stomp = Math.abs(Math.sin(t * 1.5)) * 4;
      if (r.shot < 2.2) kaiju(kx, G - 66 - stomp, r.shot > 1.1, t);
      if (r.shot >= 0 && r.shot < 1.1) { const rx = lerp(sx(A, FIRE) + 10, kx - 4, r.shot / 1.1), ry = lerp(G - 18, G - 50, r.shot / 1.1); R(A.C.ink, rx - 5, ry - 2, 10, 4); R("#c8c8c8", rx - 4, ry - 1, 8, 2); R("#E8271A", rx + 3, ry - 1, 2, 2); puff(A, rx - 9, ry, 3, "#f3a91f", .8); smoke(A, rx - 10, ry, t, 3, "#8a8a8a", 20, 6); }
    },
    fg(t, S) { const r = S.ra; onHead(A, (x, top, face) => { if (S.p.x < 140) return; A.ctx.drawImage(A.NS[face > 0 ? "bazooka" : "bazookaL"], x - 5, top + 6); });
      if (r.shot > 1.6 && r.shot < 2.4) flash(A, 1 - Math.abs(r.shot - 2) / .4, "#ffffff"); txtFx(A, S); }
  };
};

/* K9 OFFERING: adopt a dog. Walk him home. Down to the basement. */
W["k9-offering"] = A => {
  const R = A.R, G = A.G, SHOP = 120, HOUSE = 600, ALTAR = 830;
  const DOG = { pal: { Z: "#f4f4f2", K: "#14110F", P: "#e8506a" }, rows: ["Z.....ZZ.", "ZZZZZZZKZ", "ZKKZZZZZZ", "ZKKZZZZP.", ".Z.Z.Z.Z.", ".Z.Z.Z.Z."] };
  return {
    sprites: { dog: DOG, dogb: { pal: DOG.pal, rows: ["Z.....ZZ.", "ZZZZZZZKZ", "ZKKZZZZZZ", "ZKKZZZZP.", "Z..ZZ..Z.", "Z...Z...Z"] } },
    level: {
      obs: [["rat", 230], ["k9_bone", 300], ["sock", 380], ["k9_bone", 450], ["k9_candle", 700], ["k9_candle", 770]],
      target: "k9_hydrant", targetAt: 400, prop: "bone", propAt: 260, npcs: [],
      captions: [[30, "Dogs 4 Less. Well, who do we have here?"], [300, "Good boy. Almost home."], [HOUSE + 20, "Down to the basement, buddy."]]
    },
    obs: {
      k9_bone: { w: 8, h: 3, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 8, 3); R("#f4f4f2", x + 1, y + 1, 6, 1); R("#f4f4f2", x, y, 2, 1); R("#f4f4f2", x + 6, y + 2, 2, 1); } },
      k9_candle: { w: 4, h: 7, y: 0, vx: 0, tough: "hot!", draw(o, x, y, t) { R(A.C.ink, x, y + 2, 4, 5); R("#f4ecd0", x + 1, y + 3, 2, 4); R(Math.floor(t * 8 + o.x) % 2 ? "#f3a91f" : "#ffd25a", x + 1, y, 2, 2); } }
    },
    targets: { k9_hydrant: { line: "Marking the territory.", draw(tg, x) { R(A.C.ink, x - 4, G - 12, 8, 12); R("#E8271A", x - 3, G - 11, 6, 11); R(A.C.ink, x - 6, G - 9, 12, 3); R("#E8271A", x - 5, G - 8, 10, 1); R("#f4f4f2", x - 2, G - 10, 1, 6); } } },
    reset(S) { S.k9 = { d: { x: 50, y: 0, d: 0, face: 1, moving: false }, sac: -1 }; },
    update(dt, S, p) {
      const k = S.k9, d = k.d;
      if (k.sac < 0) { follow(d, p.x + 14 * (p.face || 1), 140, dt); if (Math.abs(d.x - p.x) > 60) d.x = p.x - 30; if (p.x > ALTAR - 50) { k.sac = 0; A.showCaption("K9 offering."); } }
      else { k.sac += dt; follow(d, ALTAR, 60, dt); if (k.sac > 1.2 && !k.said) { k.said = true; A.redSays("Hail, good boy.", 2); A.say("...woof?", ALTAR, 30, 2); } }
    },
    bg(t, S) {
      const house = sx(A, HOUSE), dark = S.p.x > HOUSE + 20;
      if (!dark) {
        R("#e8a0e0", 0, 0, A.W, 70); R("#5a9a3a", 0, 70, A.W, 20); R("#8a5a32", 0, 90, A.W, G - 90); R("#6a6a6a", 0, G, A.W, 30); A.layer(1, 22, x => R("#5a5a5a", x, G + 1, 1, 29));
        const s = sx(A, SHOP); if (s > -80 && s < A.W + 80) { R(A.C.ink, s - 61, 40, 122, G - 40); R("#a8483a", s - 60, 41, 120, G - 41); for (let j = 0; j < 14; j++) for (let i = 0; i < 10; i++) R("#8a3a2a", s - 60 + i * 12 + (j % 2) * 6, 44 + j * 8, 11, 1);
          R(A.C.ink, s - 36, 46, 72, 18); R("#14110F", s - 35, 47, 70, 16); A.ctx.fillStyle = "#f3d23b"; A.ctx.font = "bold 13px monospace"; A.ctx.textAlign = "center"; A.ctx.fillText("DOGS4LESS", s, 60);
          R(A.C.ink, s - 50, 92, 14, 58); R("#3a6ad0", s - 49, 93, 12, 57); R(A.C.ink, s - 20, 100, 60, 26); R("#9fc8f0", s - 19, 101, 58, 24); }
        if (house < A.W + 100) { R(A.C.ink, house - 41, 50, 140, G - 50); R("#5a8ad6", house - 40, 51, 140, G - 51); for (let j = 0; j < 12; j++) R("#4a7ac6", house - 40, 54 + j * 8, 140, 1);
          R("#8a5a32", house - 46, 46, 150, 6); for (let i = 0; i < 4; i++) { R(A.C.ink, house - 30 + i * 30, 62, 14, 16); R("#2a3a8a", house - 29 + i * 30, 63, 12, 14); }
          R(A.C.ink, house - 3, 100, 22, 50); R("#8a5a32", house - 2, 101, 20, 49); disc(A, "#f3d23b", house + 14, 126, 1); }
      } else {                                             // the basement altar
        R("#14100c", 0, 0, A.W, A.H); const ax = sx(A, ALTAR); A.ctx.globalAlpha = .4; disc(A, "#c8401a", ax, G + 4, 70); A.ctx.globalAlpha = 1;
        A.ctx.strokeStyle = "#e8e0d0"; A.ctx.lineWidth = 1; A.ctx.beginPath(); A.ctx.ellipse(ax, G + 6, 56, 12, 0, 0, 7); A.ctx.stroke();
        A.ctx.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; const px = ax + Math.cos(a) * 52, py = G + 6 + Math.sin(a) * 11; i ? A.ctx.lineTo(px, py) : A.ctx.moveTo(px, py); } A.ctx.stroke();
        for (let i = 0; i < 12; i++) { const a = i / 12 * 7, cx = ax + Math.cos(a) * 64, cy = G + 6 + Math.sin(a) * 15; R("#f4ecd0", cx - 1, cy - 4, 2, 4); A.ctx.globalAlpha = .4; disc(A, "#f3a91f", cx, cy - 5, 4); A.ctx.globalAlpha = 1; R("#ffd25a", cx - 1, cy - 6, 2, 2); }
        A.layer(.6, 60, (x, k) => { R("#8a1008", x + 10, 30 + (k % 4) * 20, 3, 12 + (k % 3) * 6); }); R("#2a1f18", 0, G + 18, A.W, 12);
        if (S.p.x < HOUSE + 120) { const sx0 = sx(A, HOUSE + 40); A.ctx.globalAlpha = .7; A.ctx.fillStyle = "#e8d890"; A.ctx.beginPath(); A.ctx.moveTo(sx0 - 10, 0); A.ctx.lineTo(sx0 + 10, 0); A.ctx.lineTo(sx0 + 40, G); A.ctx.lineTo(sx0 - 40, G); A.ctx.fill(); A.ctx.globalAlpha = 1; }
      }
    },
    mid(t, S) { const d = S.k9.d, x = sx(A, d.x), im = A.NS[(d.moving && Math.floor(d.d / 6) % 2 ? "dogb" : "dog") + (d.face < 0 ? "L" : "")];
      if (S.k9.sac < 0) { A.ctx.strokeStyle = "#E8271A"; A.ctx.beginPath(); A.ctx.moveTo(A.red.x + 2 * (S.p.face || 1), G - 14); A.ctx.quadraticCurveTo((x + A.red.x) / 2, G - 6, x + (d.face > 0 ? 7 : 2), G - 6); A.ctx.stroke(); }
      A.ctx.drawImage(im, x - 5, G - im.height + 1); }
  };
};

/* TROPHY BOY: on safari, a little too close to the lions. Someone else is hunting too. */
W["trophy-boy"] = A => {
  const R = A.R, G = A.G, LIONS = 140, SCOPE = 640, WALL = 800;
  const lion = (x, y, s, f) => { const k = A.ctx; k.fillStyle = A.C.ink; k.beginPath(); k.ellipse(x, y, 15 * s + 1, 6 * s + 1, 0, 0, 7); k.fill(); k.fillStyle = "#e8c890"; k.beginPath(); k.ellipse(x, y, 15 * s, 6 * s, 0, 0, 7); k.fill();
    disc(A, A.C.ink, x + f * 14 * s, y - 5 * s, 8 * s + 1); disc(A, "#c8862a", x + f * 14 * s, y - 5 * s, 8 * s); disc(A, "#e8c890", x + f * 15 * s, y - 4 * s, 4.5 * s); R(A.C.ink, x + f * 16 * s, y - 5 * s, 1, 1); R(A.C.ink, x - f * 15 * s, y - 1, 1, 6 * s); R("#c8862a", x - f * 16 * s - 1, y + 5 * s, 3, 3); };
  return {
    sprites: { zebra: { pal: { Z: "#f4f4f2", K: "#14110F" }, rows: ["........ZK", "........ZZK", "KZKZKZKZZZ.", "ZKZKZKZKZ..", "KZKZKZKZ...", ".K.Z..K.Z..", ".K.Z..K.Z.."] } },
    level: {
      obs: [["tb_fly", 220], ["bush", 0], ["tb_fly", 380], ["tb_dart", 480], ["tb_fly", 560], ["tb_dart", 600]].filter(o => o[1]),
      target: "bush", targetAt: 450, prop: "bone", propAt: 300, npcs: [["zebra", 520, -1]],
      captions: [[30, "Safari. Too close to the lions."], [260, "Something's in the grass."], [SCOPE - 30, "Someone's watching."]]
    },
    obs: {
      tb_fly: { w: 5, h: 4, y: 14, vx: -50, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 9 + o.x) * 3), f = Math.floor(t * 24) % 2; R(A.C.ink, x + 1, yy + 1, 3, 2); R("rgba(255,255,255,.8)", x + (f ? 0 : 2), yy - 1, 2, 2); } },
      tb_dart: { w: 12, h: 3, y: 16, vx: -200, draw(o, x, y) { R("#3a8a2a", x + 3, y, 8, 3); R(A.C.ink, x + 3, y + 1, 8, 1); R("#c8c8c8", x, y + 1, 4, 1); R("#f3d23b", x + 10, y - 1, 2, 5); } }
    },
    reset(S) { S.tb = { goo: false, scope: -1 }; },
    update(dt, S, p) {
      const b = S.tb; if (!b.goo && p.x > LIONS + 30) { b.goo = true; A.reskin(rows => rows.map((r, j) => r.replace(/R/g, (c, i) => ((i + j * 3) % 5 < 2 ? "W" : "R"))), { W: "#f4f4f2", w: "#d8d8d8" }); A.redSays("...that's not water.", 1.8); }
      if (b.scope < 0 && p.x > SCOPE) b.scope = 0; if (b.scope >= 0 && b.scope < 9) { const o = b.scope; b.scope += dt; if (o < 1.6 && b.scope >= 1.6) { crowdText(A, S, "THWIP", p.x, 50); A.redSays("Ow. Sleepy...", 1.4); } }
      if (p.x > WALL && !b.wall) { b.wall = true; A.showCaption("Trophy boy."); }
    },
    bg(t, S) {
      const wall = sx(A, WALL);
      R("#7ad8ee", 0, 0, A.W, 60); clouds(A, t); A.layer(.25, 120, (x, k) => { A.ctx.fillStyle = "#a8724a"; A.ctx.beginPath(); A.ctx.moveTo(x, 70); A.ctx.lineTo(x + 30, 54 + (k % 3) * 4); A.ctx.lineTo(x + 70, 70); A.ctx.fill(); });
      R("#e8c84a", 0, 68, A.W, G - 68); A.layer(.5, 40, (x, k) => { R("#5a9a3a", x + 6, 90 + (k % 4) * 12, 10 + (k % 3) * 4, 4); R("#c8a83a", x + 24, 110 + (k % 3) * 10, 4, 1); });
      R("#e8c84a", 0, G, A.W, 30); A.layer(1, 9, (x, k) => R("#c8a83a", x, G + 3 + (k % 5) * 5, 3, 1));
      if (wall < A.W) {                                    // the trophy wall
        R("#3a8a3a", wall, 0, A.W - wall, A.H); A.layer(1, 12, (x) => { if (x > wall) R("#347a34", x, 0, 1, A.H); });
        const head = (hx, hy, c, f) => { R(A.C.ink, hx - 9, hy + 10, 18, 3); R("#e8c23a", hx - 8, hy + 10, 16, 2); disc(A, A.C.ink, hx, hy, 10); disc(A, c, hx, hy, 9); R(A.C.ink, hx - 4, hy - 2, 2, 2); R(A.C.ink, hx + 2, hy - 2, 2, 2); R(A.C.ink, hx - 3, hy + 4, 6, 1); if (f) f(hx, hy); };
        head(sx(A, WALL + 30), 40, "#a8622a", (x, y) => { R("#f4ecd0", x - 13, y - 10, 3, 7); R("#f4ecd0", x + 10, y - 10, 3, 7); });
        head(sx(A, WALL + 70), 34, "#f0a0d0"); head(sx(A, WALL + 110), 46, "#e8c23a", (x, y) => { for (let i = 0; i < 5; i++) R(A.C.ink, x - 6 + i * 3, y - 5 + (i % 2) * 6, 2, 2); });
        head(sx(A, WALL + 70), 84, "#E8271A", (x, y) => { R(A.C.ink, x - 7, y - 9, 14, 4); });
        head(sx(A, WALL + 30), 96, "#c8b89a"); head(sx(A, WALL + 120), 100, "#9fe0c8", (x, y) => R("#f3d23b", x - 1, y - 14, 2, 5));
      }
    },
    mid(t, S) { const lx = sx(A, LIONS); if (lx > -40 && lx < A.W + 40) { const b = Math.floor(t * 3) % 2;
      A.ctx.globalAlpha = .7; R("#d8e8f0", lx - 22, G - 2, 44, 3); A.ctx.globalAlpha = 1; lion(lx, G - 8, 1, 1); lion(lx - 4, G - 18 - b, 1, 1); } },
    fg(t, S) {
      const b = S.tb; if (b.scope >= 0 && b.scope < 2.2) { const a = Math.min(1, b.scope * 3, (2.2 - b.scope) * 3), cx = A.red.x, cy = A.red.top + 12, r = 34;
        const k = A.ctx; k.globalAlpha = a; k.fillStyle = "#000"; k.beginPath(); k.rect(0, 0, A.W, A.H); k.moveTo(cx + r, cy); k.arc(cx, cy, r, 0, Math.PI * 2, true); k.closePath(); k.fill("evenodd");
        k.fillStyle = A.C.ink; R(A.C.ink, cx - r, cy, r * 2, 1); R(A.C.ink, cx, cy - r, 1, r * 2); for (let i = -3; i <= 3; i++) R(A.C.ink, cx - 2, cy + i * 8, 5, 1); k.globalAlpha = 1; }
      if (b.scope >= 1.6) onHead(A, (x, top, face) => { R("#3a8a2a", x - face * 2, top + 10, 2, 5); R("#c8c8c8", x - face * 2, top + 9, 2, 1); });
      txtFx(A, S);
    }
  };
};

/* INFINITE SHIT: the mud crowd, the porta-potty, and the hole beneath the hole. */
W["infinite-shit"] = A => {
  const R = A.R, G = A.G, POTTY = 520, HOLE = 760;
  return {
    sprites: reds(A, "b4", {}),
    level: {
      obs: [["is_pile", 180], ["is_fly", 260], ["is_pile", 340], ["is_fly", 420], ["is_paper", 640], ["is_paper", 700]],
      target: "is_tp", targetAt: 300, prop: "cup", propAt: 120, npcs: [],
      captions: [[30, "Ankle deep. Everyone's here."], [POTTY - 60, "Finally, a potty."], [HOLE - 60, "...there's always another hole."]]
    },
    obs: {
      is_pile: { w: 10, h: 7, y: 0, vx: 0, tough: "squish", draw(o, x, y) { R(A.C.ink, x, y + 3, 10, 4); R("#5a3416", x + 1, y + 4, 8, 3); R(A.C.ink, x + 2, y + 1, 6, 3); R("#6a4224", x + 3, y + 2, 4, 2); R(A.C.ink, x + 4, y - 1, 2, 2); } },
      is_fly: { w: 5, h: 4, y: 14, vx: -55, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 9 + o.x) * 3), f = Math.floor(t * 24) % 2; R(A.C.ink, x + 1, yy + 1, 3, 2); R("rgba(255,255,255,.8)", x + (f ? 0 : 2), yy - 1, 2, 2); } },
      is_paper: { w: 8, h: 4, y: 0, vx: -60, draw(o, x, y, t) { R(A.C.ink, x, y, 8, 4); R("#f4f4f2", x + 1, y + 1, 6, 2); R("#d8d0b0", x + 2 + Math.floor(t * 6) % 3, y + 1, 1, 2); } }
    },
    targets: { is_tp: { line: "Courtesy flush.", draw(tg, x) { R(A.C.ink, x - 6, G - 10, 12, 10); R("#f4f4f2", x - 5, G - 9, 10, 9); R(A.C.ink, x - 1, G - 6, 2, 2); R("#f4f4f2", x + 5, G - 3, 5, 3); } } },
    reset(S) { S.is = { fall: -1, n: 0 }; },
    update(dt, S, p) {
      const s = S.is; if (s.fall < 0 && ((s.n === 0 && p.x > POTTY && p.x < POTTY + 30) || (s.n === 1 && p.x > HOLE && p.x < HOLE + 30))) { s.fall = 0; }
      if (s.fall >= 0) { s.fall += dt; p.inv = .3; p.vy = 0; p.y = 0; p.x = s.n ? HOLE + 2 : POTTY + 2;
        if (s.fall > 1.8) { s.fall = -1; s.n++; p.x = s.n === 1 ? POTTY + 60 : HOLE + 60; p.y = 50; p.onG = false; A.showCaption(s.n === 1 ? "Down the porta-potty." : "Infinite shit."); if (s.n === 2) A.redSays("Again?!", 1.6); } }
    },
    bg(t, S) {
      const zone = S.p.x < POTTY + 40 ? 0 : S.p.x < HOLE + 40 ? 1 : 2;
      if (zone === 0) { R("#6a4224", 0, 0, A.W, A.H); A.layer(.3, 40, (x, k) => { disc(A, "#5a3416", x + 10, 30 + (k % 4) * 30, 14); disc(A, "#7a4a2a", x + 26, 20 + (k % 3) * 36, 8); });
        A.layer(.5, 14, (x, k) => { const b = Math.round(Math.sin(t * 2 + k) * 2); R(A.C.ink, x, 98 + b, 10, 50); R("#4a2a14", x + 1, 99 + b, 8, 50); disc(A, "#4a2a14", x + 5, 96 + b, 5); R("#4a2a14", x - 2 + (k % 2) * 12, 80 + b, 2, 18); });
        R("#5a3416", 0, G, A.W, 30); A.layer(1, 9, (x, k) => R("#4a2a14", x, G + 3 + (k % 5) * 5, 5, 1));
        const px = sx(A, POTTY); R(A.C.ink, px - 15, 84, 30, G - 84); R("#3a6ad0", px - 14, 85, 28, G - 85); R("#2a5ac0", px - 14, 85, 28, 6); R(A.C.ink, px - 9, 96, 18, G - 98); R("#4a7ae0", px - 8, 97, 16, G - 98);
        A.ctx.fillStyle = "#f4f4f2"; A.ctx.font = "4px monospace"; A.ctx.textAlign = "center"; A.ctx.fillText("PERPETUAL LLC", px, 90); }
      else if (zone === 1) { R("#2a3a8a", 0, 0, A.W, A.H); R("#3a4aa0", 0, 0, A.W, 30); A.layer(.6, 90, (x, k) => { R("#c8c8c8", x + 20, 50, 14, 10); R("#9a9a9a", x + 70, 60, 3, 30); });
        R("#4a6ad0", 0, G, A.W, 30); A.layer(1, 8, (x, k) => { if (k % 3 === 0) R("#e8e0c0", x, G + 4 + (k % 5) * 4, 3, 2); });
        const hx = sx(A, HOLE + 14); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(hx, G + 4, 22, 6, 0, 0, 7); A.ctx.fill(); A.ctx.fillStyle = "#c8a83a"; A.ctx.fillRect(hx - 22, G + 3, 2, 3); }
      else { R("#0a0a0a", 0, 0, A.W, A.H); const sx0 = sx(A, HOLE + 120); A.ctx.globalAlpha = .9; A.ctx.fillStyle = "#e8e8e0"; A.ctx.beginPath(); A.ctx.moveTo(sx0 - 14, 0); A.ctx.lineTo(sx0 + 14, 0); A.ctx.lineTo(sx0 + 60, A.H); A.ctx.lineTo(sx0 - 60, A.H); A.ctx.fill(); A.ctx.globalAlpha = 1; R("#1a1a1a", 0, G, A.W, 30); }
    },
    fg(t, S) { const s = S.is; onHead(A, (x, top) => { R(A.C.ink, x - 6, top + 2, 12, 3); R("#f3d23b", x - 5, top + 3, 10, 1); });
      if (s.fall >= 0) plunge(A, s.fall, s.n ? "#2a3a8a" : "#6a4224", "#0a0a14"); }
  };
};

/* SEX BOT: unbox her, power her on, ask to be held. She holds. */
W["sex-bot"] = A => {
  const R = A.R, G = A.G, BOT = 780, ON = 720;
  return {
    sprites: { bot: { pal: { a: "#d0a0e0", b: "#b080c8", d: "#14110F", E: "#ffffff" }, rows: [
      ".dddddd.", "dddddddd", "ddaaaadd", "daEaaEad", "daaaaaad", "d.abba.d", "..aaaa..", "...aa...", ".aaaaaa.", "aabaabaa", "a.aaaa.a", "a.abba.a", "a.aaaa.a", "..abba..", "..a..a..", "..b..b..", "..a..a..", "..a..a..", "..b..b..", "..a..a..", ".aa..aa."] } },
    level: {
      obs: [["sock", 180], ["sb_tissue", 250], ["sock", 330], ["sb_mag", 420], ["sb_tissue", 500], ["sock", 580]],
      target: "lamp", targetAt: 460, prop: "phone", propAt: 130, npcs: [["bot", BOT, -1]],
      captions: [[30, "Package arrived. Some assembly required."], [300, "Room's a mess. She won't mind."], [ON - 30, "Where's the power button?"]]
    },
    obs: {
      sb_tissue: { w: 6, h: 5, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y + 1, 6, 4); R("#f4f4f2", x + 1, y + 2, 4, 3); R("#f4f4f2", x + 2, y, 2, 2); } },
      sb_mag: { w: 10, h: 2, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, A.G - 2, 10, 2); R("#f0a0d0", x + 1, A.G - 2, 8, 1); } }
    },
    reset(S) { S.sb = { on: -1, hold: -1 }; },
    update(dt, S, p) {
      const b = S.sb; if (b.on < 0 && p.x > ON) { b.on = 0; crowdText(A, S, "POWER ON", BOT, 60); A.say("Command me, please.", BOT, 46, 2); }
      if (b.on >= 0) b.on += dt;
      if (b.on > 1.6 && b.hold < 0 && p.x > BOT - 26) { b.hold = 0; A.redSays("Hold me close, baby.", 1.4); }
      if (b.hold >= 0 && b.hold < 9) { b.hold += dt; if (b.hold > .8 && b.hold < 3.2) { p.x = BOT - 16; p.y = 14 + Math.sin(b.hold * 20) * 1; p.vy = 0; p.inv = .3; }
        if (b.hold > 1.4 && !b.cap) { b.cap = true; A.showCaption("Too close."); } if (b.hold > 3.2 && !b.drop) { b.drop = true; p.y = 18; p.vy = 0; p.onG = false; A.redSays("*cough* ...5 stars.", 2); } }
    },
    bg(t, S) {
      R("#8a6a4a", 0, 0, A.W, G - 30); R("#3a6a3a", 0, G - 30, A.W, 60); A.layer(1, 10, (x, k) => R("#2f5a2f", x, G - 28 + (k % 6) * 9, 4, 1));
      A.layer(.7, 260, (x, k) => { R(A.C.ink, x + 40, 30, 40, 40); R("#9fd0ee", x + 41, 31, 38, 38); puff(A, x + 56, 46, 6, "#f4f4f2", .9); R(A.C.ink, x + 59, 30, 2, 40);
        R(A.C.ink, x + 150, 104, 28, 46); R("#e8e2d2", x + 151, 105, 26, 45); R(A.C.ink, x + 160, 96, 8, 8); A.ctx.globalAlpha = .4; disc(A, "#f3d23b", x + 164, 98, 10); A.ctx.globalAlpha = 1; R("#f3d23b", x + 161, 97, 6, 6); });
      const box = sx(A, 160); R(A.C.ink, box - 30, G - 12, 60, 12); R("#c8a06a", box - 29, G - 11, 58, 11); R("#f4f4f2", box - 4, G - 12, 8, 12); R("#E8271A", box + 18, G - 9, 5, 5);
      const cl = sx(A, BOT); R(A.C.ink, cl - 22, 92, 44, G - 92); R("#a8763a", cl - 21, 93, 42, G - 93); R("#5a3a1a", cl - 18, 96, 36, G - 98);
    },
    drawNpc(n, x, t) { const b = A.S.sb, im = A.NS.botL, on = b && b.on >= 0;
      const s = 1.7, w = im.width * s, h = im.height * s; A.ctx.imageSmoothingEnabled = false;
      A.ctx.globalAlpha = on ? 1 : .8; A.ctx.drawImage(im, x - w / 2, A.G - h + 1, w, h); A.ctx.globalAlpha = 1;
      if (!on) { R("#5a3a5a", x - 4, A.G - h + 6, 3, 3); R("#5a3a5a", x + 2, A.G - h + 6, 3, 3); } else if (Math.floor(t * 2) % 2) R("#7CFC6A", x - 1, A.G - h + 20, 2, 1);
      if (b && b.hold > .8 && b.hold < 3.2) { R(A.C.ink, x - 14, A.G - h + 16, 14, 3); R("#d0a0e0", x - 13, A.G - h + 17, 13, 1); }
      return true; },
    fg(t, S) { txtFx(A, S); }
  };
};

/* BUTTERFLY BOY: crawl, cocoon, wings, float... then a chameleon. Good girl. */
W["butterfly-boy"] = A => {
  const R = A.R, G = A.G, COCOON = 260, CHAM = 820;
  return {
    sprites: { leaf: { pal: { Q: "#5aa83a" }, rows: ["..QQ", ".QQQ", "QQQ.", "Q..."] } },
    level: {
      obs: [["bf_drop", 360], ["bf_wasp", 430], ["bf_drop", 520], ["bf_wasp", 600], ["bf_wasp", 700]],
      target: "plant", targetAt: 480, prop: "leaf", propAt: 120, npcs: [],
      captions: [[30, "Just a little crawler."], [COCOON - 20, "Time to change."], [COCOON + 80, "Wings! Hold jump to float."], [CHAM - 90, "Something's watching from the leaves."]]
    },
    obs: {
      bf_drop: { w: 4, h: 5, y: 30, vx: 0, draw(o, x, y, t) { const yy = y - ((t * 50 + o.x) % 30); R(A.C.ink, x, yy, 4, 5); R("#9fd0ee", x + 1, yy + 1, 2, 3); } },
      bf_wasp: { w: 8, h: 5, y: 16, vx: -90, draw(o, x, y, t) { const f = Math.floor(t * 20) % 2; R(A.C.ink, x, y + 1, 8, 4); R("#f3d23b", x + 1, y + 2, 2, 2); R("#f3d23b", x + 4, y + 2, 2, 2); R("rgba(255,255,255,.8)", x + 2, y - 1 - f, 3, 2); } }
    },
    reset(S) { S.bf = { wings: false, coc: -1, eat: -1 }; },
    update(dt, S, p) {
      const b = S.bf; if (b.coc < 0 && !b.wings && p.x > COCOON && p.x < COCOON + 40) b.coc = 0;
      if (b.coc >= 0 && p.x > COCOON + 40) { b.coc = -1; b.wings = true; }
      if (b.coc >= 0) { b.coc += dt; p.x = COCOON; p.inv = .3; if (b.coc > 2) { b.coc = -1; b.wings = true; p.x = COCOON + 20; p.vy = 200; p.onG = false; A.showCaption("Butterfly boy."); } }
      if (b.wings && !p.onG && p.vy < 0 && b.eat < 0) p.vy = Math.max(p.vy + 420 * dt, -40);        // glide down slowly
      if (b.eat < 0 && b.wings && p.x > CHAM - 40 && p.x < CHAM) { b.eat = 0; }
      if (b.eat >= 0) { b.eat += dt; p.inv = .3; if (b.eat > .5 && b.eat < 1.4) { p.x = lerp(CHAM - 40, CHAM - 8, (b.eat - .5) / .9); p.y = 10; p.vy = 0; }
        if (b.eat > 1.4 && !b.gulp) { b.gulp = true; crowdText(A, S, "GULP", CHAM, 60); } if (b.eat > 3.6 && !b.out) { b.out = true; p.x = CHAM + 30; A.redSays("Good girl.", 2); } }
    },
    bg(t, S) {
      const b = S.bf, dark = b.eat > 2;
      if (dark) { R("#2a2a26", 0, 0, A.W, A.H); const tx = sx(A, CHAM); R(A.C.ink, tx - 30, 60, 60, 70); R("#7ab06a", tx - 29, 61, 58, 50); R("#8a5a32", tx - 29, 111, 58, 19); disc(A, "#b080e0", tx, 100, 10); R("#c8c8c8", tx - 30, 56, 60, 4); R("#2a2a26", 0, G, A.W, 30); return; }
      R("#9fd0ee", 0, 0, A.W, A.H); A.layer(.3, 22, (x, k) => R("#3a8a2a", x, 100 - (k % 4) * 10, 12, 60)); A.layer(.6, 16, (x, k) => R("#2a7a1f", x, 116 - (k % 3) * 8, 10, 40));
      A.layer(.15, 200, (x) => { A.ctx.strokeStyle = "#5aa83a"; A.ctx.lineWidth = 2; A.ctx.beginPath(); A.ctx.moveTo(x, 20); A.ctx.quadraticCurveTo(x + 80, 0, x + 160, 30); A.ctx.stroke(); A.ctx.fillStyle = "#7ac85a"; A.ctx.beginPath(); A.ctx.ellipse(x + 90, 30, 24, 5, .3, 0, 7); A.ctx.fill(); });
      A.ctx.fillStyle = "#7ac85a"; R("#7ac85a", 0, G, A.W, 30); A.layer(1, 16, (x) => R("#5aa83a", x, G + 2, 1, 26));
      const cx = sx(A, COCOON); A.ctx.strokeStyle = "#5aa83a"; A.ctx.beginPath(); A.ctx.moveTo(cx, 0); A.ctx.lineTo(cx, G - 40); A.ctx.stroke();
      if (!b.wings) { A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(cx, G - 26, 9, 16, 0, 0, 7); A.ctx.fill(); A.ctx.fillStyle = b.coc >= 0 ? "#e8a8a0" : "#d89890"; A.ctx.beginPath(); A.ctx.ellipse(cx, G - 26, 8, 15, 0, 0, 7); A.ctx.fill(); for (let i = 0; i < 4; i++) R("#c88078", cx - 6, G - 36 + i * 6, 12, 1); }
      const ch = sx(A, CHAM); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(ch + 10, G - 16, 24, 17, 0, 0, 7); A.ctx.fill(); A.ctx.fillStyle = "#b080e0"; A.ctx.beginPath(); A.ctx.ellipse(ch + 10, G - 16, 23, 16, 0, 0, 7); A.ctx.fill();
      for (let i = 0; i < 9; i++) R("#9a6ad0", ch - 4 + (i * 7) % 28, G - 26 + (i * 5) % 18, 2, 2); disc(A, A.C.ink, ch - 4, G - 22, 5); disc(A, "#d0a0f0", ch - 4, G - 22, 4); disc(A, A.C.ink, ch - 4 + Math.round(Math.sin(t) * 2), G - 22, 2);
      R(A.C.ink, ch - 2, G - 5, 4, 5); R(A.C.ink, ch + 20, G - 5, 4, 5);
      if (b.eat >= .3 && b.eat < 1.4) { const tip = lerp(ch - 14, sx(A, S.p.x) + 2, Math.min(1, (b.eat - .3) / .2)); R(A.C.ink, tip, G - 18, ch - 12 - tip, 4); R("#f0a0b8", tip, G - 17, ch - 12 - tip, 2); disc(A, "#f0a0b8", tip, G - 16, 3); }
    },
    fg(t, S) {
      const b = S.bf;
      if (!b.wings && b.coc < 0 && b.eat < 0) onHead(A, (x, top, face) => { for (let i = 0; i < 4; i++) { R(A.C.ink, x - face * (i * 4 + 4), G - 5, 4, 5); R("#E8271A", x - face * (i * 4 + 4) + 1, G - 4, 2, 3); } });
      if (b.wings && b.eat < 0) onHead(A, (x, top, face) => { const f = Math.abs(Math.sin(t * (S.p.onG ? 3 : 14))); [[-1], [1]].forEach(([s]) => { const w = Math.round(4 + f * 7);
        A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.ellipse(x - face * 3 + s * w / 2, top + 13, w / 2 + 1, 7, 0, 0, 7); A.ctx.fill(); A.ctx.fillStyle = "#f3d23b"; A.ctx.beginPath(); A.ctx.ellipse(x - face * 3 + s * w / 2, top + 13, w / 2, 6, 0, 0, 7); A.ctx.fill(); disc(A, "#fff6b0", x - face * 3 + s * w / 2, top + 13, 2); }); });
      if (b.coc >= 0) { flash(A, Math.max(0, .6 - Math.abs(b.coc - 1.6) * 2), "#fff6b0"); }
      if (b.eat > 1.4 && b.eat < 2.2) flash(A, 1 - (b.eat - 1.4) / .8, "#2a2a26");
      txtFx(A, S);
    }
  };
};

/* PROBE FETISH: beamed up. Probed. Returned. He wants to go back. */
W["probe-fetish"] = A => {
  const R = A.R, G = A.G, BEAM = 180, LAB = [260, 720], BED = 760;
  const alien = (x, t, k, face) => { const b = Math.round(Math.sin(t * 2 + k) * 2), h = 44 + (k % 3) * 6;
    R(A.C.ink, x - 9, G - h - b, 18, h + b); R("#5ac83a", x - 8, G - h + 1 - b, 16, h + b - 1); disc(A, A.C.ink, x, G - h - b, 9); disc(A, "#5ac83a", x, G - h - b, 8);
    for (let i = 0; i < 4; i++) R("#3a9a2a", x - 7 + i * 4, G - 16, 2, 16); disc(A, "#f3a91f", x - 3 * face, G - h + 4 - b, 3); R(A.C.ink, x - 3 * face - 1, G - h + 3 - b, 2, 2); R("#3a9a2a", x - 5, G - h + 12 - b, 10, 1); };
  return {
    sprites: { probe: { pal: { Y: "#f3d23b", G: "#9a9a9a" }, rows: ["GYYYG", "GYYYG"] }, nobody: { rows: ["."] } },
    level: {
      obs: [["pf_drone", 330], ["pf_drone", 420], ["pf_goo", 480], ["pf_drone", 560], ["pf_goo", 640], ["sock", 820]],
      target: "pf_pod", targetAt: 520, prop: "probe", propAt: 600, npcs: [["nobody", 700, -1, "Somehow this specimen avoids our trackers."]],
      captions: [[30, "Can't sleep. Lights in the sky."], [LAB[0] + 20, "Specimen acquired."], [BED + 10, "Back home. Kind of miss it."]]
    },
    obs: {
      pf_drone: { w: 9, h: 5, y: 16, vx: -70, draw(o, x, y, t) { R(A.C.ink, x, y + 1, 9, 4); R("#c8c8c8", x + 1, y + 2, 7, 2); R(Math.floor(t * 6) % 2 ? "#7CFC6A" : "#2a8a2a", x + 4, y, 1, 1); } },
      pf_goo: { w: 12, h: 2, y: 0, vx: 0, tough: "goo!", draw(o, x, y, t) { R("#7CFC6A", x, A.G - 1, 12, 2); R("#c8ffb0", x + 2 + Math.floor(t * 2) % 7, A.G - 1, 2, 1); } }
    },
    targets: { pf_pod: { line: "Sample collected.", draw(tg, x) { R(A.C.ink, x - 5, G - 18, 10, 18); R("#9fe0ff", x - 4, G - 17, 8, 15); R("#7CFC6A", x - 4, G - 8, 8, 6); R("#9a9a9a", x - 6, G - 3, 12, 3); } } },
    reset(S) { S.pf = { up: -1, back: false }; },
    update(dt, S, p) {
      const f = S.pf; if (f.up < 0 && !f.back && p.x > BEAM && p.x < BEAM + 40) f.up = 0;
      if (f.up >= 0) { f.up += dt; p.inv = .3; if (f.up < 1.8) { p.x = BEAM; p.y = f.up * 60; p.vy = 0; } else { f.up = -1; f.back = true; p.x = LAB[0] + 10; p.y = 0; A.redSays("Where... am I?", 1.6); } }
      if (p.x > BED && !f.home) { f.home = true; A.showCaption("Probe fetish."); A.redSays("Take me back.", 2); }
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < LAB[0] || (S.pf.up >= 0)) { R("#2a3a8a", 0, 0, A.W, A.H); A.stars({}); disc(A, "#f0a0d0", 40, 22, 5); disc(A, "#2a3a8a", 42, 20, 4);
        A.layer(.4, 12, (x, k) => { A.ctx.fillStyle = "#1a2a6a"; A.ctx.beginPath(); A.ctx.moveTo(x, 130); A.ctx.lineTo(x + 6, 100 - (k % 3) * 8); A.ctx.lineTo(x + 12, 130); A.ctx.fill(); });
        const hx = sx(A, BEAM); R(A.C.ink, hx - 30, 90, 60, G - 90); R("#3a4aa0", hx - 29, 91, 58, G - 91); A.ctx.fillStyle = "#1a2a6a"; A.ctx.beginPath(); A.ctx.moveTo(hx - 36, 92); A.ctx.lineTo(hx, 64); A.ctx.lineTo(hx + 36, 92); A.ctx.fill();
        R("#f3d23b", hx - 20, 104, 10, 10); R("#f3d23b", hx + 10, 104, 10, 10); R(A.C.ink, hx - 5, 122, 10, 28);
        A.ctx.globalAlpha = .35; A.ctx.fillStyle = "#f4f4f2"; A.ctx.beginPath(); A.ctx.moveTo(hx - 6, 0); A.ctx.lineTo(hx + 6, 0); A.ctx.lineTo(hx + 24, G); A.ctx.lineTo(hx - 24, G); A.ctx.fill(); A.ctx.globalAlpha = 1;
        R("#1a2a6a", 0, G, A.W, 30); }
      else if (x < BED) { R("#e8e8e8", 0, 0, A.W, A.H); A.layer(.3, 40, (x) => R("#dcdcdc", x, 0, 1, G)); R("#c8c8c8", 0, G, A.W, 30); A.ctx.globalAlpha = .25; A.ctx.fillStyle = "#14110F"; A.ctx.beginPath(); A.ctx.ellipse(sx(A, 690), G + 3, 50, 4, 0, 0, 7); A.ctx.fill(); A.ctx.globalAlpha = 1;
        [660, 680, 700, 722].forEach((ax, i) => alien(sx(A, ax), t, i, 1)); }
      else { R("#5a6a9a", 0, 0, A.W, A.H); const bx = sx(A, BED + 70); disc(A, A.C.ink, bx, 40, 15); disc(A, "#2a3a6a", bx, 40, 14); R(A.C.ink, bx - 1, 25, 2, 30);
        R(A.C.ink, bx - 60, 30, 20, 26); R("#f4f4f2", bx - 59, 31, 18, 24); R("#5ac83a", bx - 54, 38, 8, 12); R(A.C.ink, bx + 36, 30, 20, 26); R("#f4f4f2", bx + 37, 31, 18, 24);
        R(A.C.ink, bx - 34, 116, 68, 22); R("#3a5ad0", bx - 33, 117, 66, 20); R("#f4f4f2", bx - 30, 112, 14, 6); R("#4a5a8a", 0, G, A.W, 30);
        A.layer(1, 6, (x, k) => { if (k % 3 === 0) R("#e8c23a", x, G - 1 + (k % 4), 3, 2); }); }
    },
    fg(t, S) { const f = S.pf; if (f.up >= 0) { A.ctx.globalAlpha = .5; R("#f4f4f2", A.red.x - 14, 0, 28, A.G); A.ctx.globalAlpha = 1; const ux = A.red.x; R(A.C.ink, ux - 26, 4, 52, 10); R("#9a9a9a", ux - 25, 5, 50, 8); disc(A, "#9fe0ff", ux, 4, 8); for (let i = 0; i < 5; i++) R(Math.floor(t * 6 + i) % 2 ? "#f3d23b" : "#7CFC6A", ux - 20 + i * 10, 11, 3, 2); }
      if (S.p.x > BED) onHead(A, (x, top, face) => { R(A.C.ink, x + face * 6 - 1, top + 14, 4, 6); R("#7ac8e6", x + face * 6, top + 15, 2, 5); }); }
  };
};

/* SOCCER: something glowing in the drain. He kicks it. It kicks back. */
W["soccer"] = A => {
  const R = A.R, G = A.G, KICK = 300, BACK = 720, BUD = 820;
  const ball = (x, y, r, t) => { disc(A, A.C.ink, x, y, r + 1); disc(A, "#ff5fd2", x, y, r); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if ((i + j) % 2 === 0) R("#4a2a6a", x + i * r / 2.5 - r / 6, y + j * r / 2.5 - r / 6, r / 3, r / 3);
    A.ctx.globalAlpha = .3; disc(A, "#ff5fd2", x, y, r + 5 + Math.sin(t * 6) * 2); A.ctx.globalAlpha = 1; };
  return {
    sprites: reds(A, "bud", {}),
    level: {
      obs: [["so_goo", 380], ["ball", 440], ["so_goo", 520], ["ball", 600], ["so_goo", 660]],
      target: "so_cone", targetAt: 480, prop: "cup", propAt: 120, npcs: [["bud_stand", BUD, -1, "You okay?"]],
      captions: [[30, "Something's glowing in the drain."], [KICK - 30, "Give it a kick."], [BACK - 80, "It's coming back. Bigger."]]
    },
    obs: { so_goo: { w: 10, h: 3, y: 0, vx: 0, tough: "sticky", draw(o, x, y, t) { R("#ff5fd2", x, A.G - 2, 10, 3); R("#ffd0f4", x + 2 + Math.floor(t * 2) % 5, A.G - 2, 2, 1); } } },
    targets: { so_cone: { line: "Goooal.", draw(tg, x) { R(A.C.ink, x - 4, G - 10, 8, 10); R("#f3a91f", x - 3, G - 9, 6, 9); R("#f4f4f2", x - 3, G - 6, 6, 2); R(A.C.ink, x - 6, G - 1, 12, 1); } } },
    reset(S) { S.so = { kick: -1, back: -1, goo: false }; },
    update(dt, S, p) {
      const s = S.so; if (s.kick < 0 && p.x > KICK) { s.kick = 0; crowdText(A, S, "BOOT", KICK + 10, 40); } if (s.kick >= 0) s.kick += dt;
      if (s.back < 0 && p.x > BACK) s.back = 0;
      if (s.back >= 0 && s.back < 9) { const b = s.back; s.back += dt; if (b < 1 && s.back >= 1) { s.goo = true; splash(S, p.x, 24, 26, "#ff5fd2"); p.vy = 160; p.onG = false; p.kb = .3; crowdText(A, S, "SPLORCH", p.x, 60); } if (b < 2 && s.back >= 2) A.showCaption("Soccer."); }
      if (s.goo && p.x > BUD - 30 && !s.said) { s.said = true; A.redSays("Yea, no.", 2.2); }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      R("#e8d020", 0, 0, A.W, 80); R("#1f6a1f", 0, 80, A.W, G - 80); A.layer(.3, 30, (x, k) => R("#2a7a2a", x, 80, 15, 1));
      A.layer(.5, 60, (x, k) => { disc(A, "#3a8a2a", x + 10, 82, 8); disc(A, "#4a9a3a", x + 30, 84, 6); });
      R("#1f6a1f", 0, G, A.W, 30); A.layer(1, 6, (x, k) => R("#2a7a2a", x, G + 2 + (k % 5) * 5, 2, 1));
      const d = sx(A, 120); R(A.C.ink, d - 30, G - 16, 30, 16); R("#9a9a9a", d - 29, G - 15, 29, 14); disc(A, A.C.ink, d, G - 8, 8); disc(A, "#5a5a5a", d, G - 8, 7);
      A.ctx.globalAlpha = .4; disc(A, "#ff5fd2", d + 10, G - 3, 14); A.ctx.globalAlpha = 1; R("#ff5fd2", d, G - 2, 30, 2);
    },
    mid(t, S) {
      const s = S.so; if (s.kick < 0) ball(sx(A, KICK + 4), G - 5, 4, t);
      else if (s.kick < 1.2) { const u = s.kick / 1.2; ball(sx(A, KICK) + u * 260, G - 5 - Math.sin(u * Math.PI) * 70, 4 * (1 - u * .6), t); }
      if (s.back >= 0 && s.back < 1) { const u = s.back, x = lerp(sx(A, BACK) + 240, A.red.x + 8, u); ball(x, G - 14 - Math.sin(u * Math.PI) * 30, 6 + u * 22, t); }
    },
    fg(t, S) { const s = S.so;
      if (s.goo) onHead(A, (x, top) => { A.ctx.globalAlpha = .9; R("#ff5fd2", x - 6, top, 12, 9); for (let i = 0; i < 4; i++) R("#ff5fd2", x - 5 + i * 3, top + 8, 2, 2 + ((i * 3 + Math.floor(t * 3)) % 5)); R("#ffd0f4", x - 3, top + 2, 2, 1); A.ctx.globalAlpha = 1; });
      if (s.back > .9 && s.back < 1.4) flash(A, 1 - (s.back - .9) / .5, "#ff5fd2");
      txtFx(A, S); dropFx(A, S); }
  };
};
})();

/* ======================= batch 5 ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx, confetti } = W.__shared;
const { arm, reds, drawWalker, follow, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke } = W.__shared2;
const flash = (A, a, c = "#ffffff") => { if (a <= 0) return; A.ctx.globalAlpha = Math.min(1, a); A.R(c, 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; };
const clouds = (A, c = "#f4f4f2") => A.layer(.06, 110, (x, k) => { puff(A, x + 30, 18 + (k % 3) * 10, 9, c, .95); puff(A, x + 44, 20 + (k % 3) * 10, 7, c, .95); puff(A, x + 20, 22 + (k % 3) * 10, 6, c, .95); });
const grad = (A, stops, y0 = 0, y1 = A.H) => { const g = A.ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); A.ctx.fillStyle = g; A.ctx.fillRect(0, y0, A.W, y1 - y0); };
const ell = (A, c, x, y, rx, ry, rot = 0) => { A.ctx.fillStyle = c; A.ctx.beginPath(); A.ctx.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), rot, 0, 7); A.ctx.fill(); };
const oell = (A, c, x, y, rx, ry, rot = 0) => { ell(A, A.C.ink, x, y, rx + 1, ry + 1, rot); ell(A, c, x, y, rx, ry, rot); };
const lieRed = (A, x, y, rot, c = "#E8271A") => { const k = A.ctx, im = A.NS.b5_stand; k.save(); k.translate(x, y); k.rotate(rot); k.drawImage(im, -im.width / 2, -im.height / 2); k.restore(); };
const lock = (p, x) => { p.x = x; p.vy = 0; p.y = 0; p.inv = Math.max(p.inv, .3); };

/* RAIN GODS: the offering, the climb, the hand in the clouds. Green rain. */
W["rain-gods"] = A => {
  const R = A.R, G = A.G, PYR = 620, RAIN = 600, AFTER = 760;
  return {
    sprites: Object.assign(reds(A, "b5", {}), { rg_head: { pal: { Q: "#7CFC6A" }, rows: ["KKKK", "KRRK", "RKRK", "RRRR", "QRRQ", ".Q.Q"] } }),
    level: {
      obs: [["bird", 220], ["rg_slime", 300], ["bird", 380], ["rg_slime", 470], ["rg_slime", 820]],
      target: "plant", targetAt: 860, prop: "rg_head", propAt: 130, npcs: [],
      captions: [[30, "The crowd wants rain."], [250, "Make the offering."], [AFTER, "...the rain came."]]
    },
    obs: { rg_slime: { w: 14, h: 2, y: 0, vx: 0, tough: "slimy", draw(o, x, y, t) { ell(A, "#a8e83a", x + 7, A.G, 8, 2); R("#d8ff8a", x + 3 + Math.floor(t * 2) % 7, A.G - 1, 2, 1); } } },
    reset(S) { S.rg = { pour: -1, drops: [] }; },
    update(dt, S, p) {
      const r = S.rg; if (r.pour < 0 && p.x > RAIN && p.x < RAIN + 60) { r.pour = 0; A.redSays("Oh great one...", 1.6); }
      if (r.pour >= 0) { const b = r.pour; r.pour += dt; if (b < 1.2 && r.pour >= 1.2) A.showCaption("Rain gods."); if (r.pour > 1 && r.pour < 6) for (let i = 0; i < 3; i++) r.drops.push({ x: S.camX + Math.random() * A.W, y: -4, v: 120 + Math.random() * 60 }); }
      for (const d of r.drops) d.y += d.v * dt; r.drops = r.drops.filter(d => d.y < A.G);
    },
    bg(t, S) {
      grad(A, ["#f0a8b0", "#f4c0b8", "#f0b090"], 0, 96); disc(A, "#fff4ec", 236, 30, 13);
      A.layer(.12, 160, (x, k) => { A.ctx.fillStyle = "#9a7a7a"; A.ctx.beginPath(); A.ctx.moveTo(x - 20, 96); A.ctx.lineTo(x + 40, 62 + (k % 2) * 10); A.ctx.lineTo(x + 90, 82); A.ctx.lineTo(x + 140, 96); A.ctx.fill(); });
      R("#e8822a", 0, 92, A.W, G - 92);
      if (S.p.x > AFTER) { A.layer(.6, 70, (x, k) => { oell(A, "#b8e83a", x + 30, 120 + (k % 3) * 8, 22, 6); lieRed(A, x + 30, 116 + (k % 3) * 8, k % 2 ? 1.4 : -1.5); }); }
      else A.layer(.4, 6, (x, k) => { const b = Math.floor(t * 3 + k) % 2, y = 100 + (k % 5) * 7; R("#14110F", x, y - b, 2, 8); R("#14110F", x - 1 + (k % 2) * 3, y - 4 - b, 1, 4); disc(A, "#14110F", x + 1, y - 2 - b, 1.5); });
      const px = sx(A, PYR, .7); if (px > -100 && px < A.W + 100) { for (let i = 0; i < 7; i++) { const w = 80 - i * 10, y = G - 10 - i * 9; R(A.C.ink, px - w / 2 - 1, y - 1, w + 2, 10); R(i % 2 ? "#a8a8a8" : "#9a9a9a", px - w / 2, y, w, 9); for (let j = 0; j < w / 6; j++) R("#bcbcbc", px - w / 2 + j * 6 + (i % 2) * 3, y + 3, 2, 2); }
        R(A.C.ink, px - 3, G - 74, 6, 64); R("#cfcfcf", px - 2, G - 73, 4, 63); R(A.C.ink, px - 9, G - 80, 18, 8); R("#bcbcbc", px - 8, G - 79, 16, 6); }
      R("#9a9a9a", 0, G, A.W, 30); A.layer(1, 22, (x) => { R("#8a8a8a", x, G + 1, 1, 29); }); R("#7a7a7a", 0, G, A.W, 1);
    },
    mid(t, S) {
      const r = S.rg; if (r.pour < 0) return; const px = sx(A, PYR, .7), u = Math.min(1, r.pour / .8);
      puff(A, px, 4, 30, "#f4f4f2", .95); puff(A, px - 26, 8, 18, "#f4f4f2", .95); puff(A, px + 26, 8, 18, "#f4f4f2", .95);
      const hy = -40 + u * 50; R(A.C.ink, px - 15, hy - 30, 30, 32); R("#E8271A", px - 14, hy - 29, 28, 30); for (let i = 0; i < 4; i++) { R(A.C.ink, px - 13 + i * 7, hy, 6, 8); R("#E8271A", px - 12 + i * 7, hy + 1, 4, 6); }
      if (r.pour > .8 && r.pour < 6) { const w = 8 + Math.sin(t * 9) * 2; R("#a8e83a", px - w, hy + 10, w * 2, G - 80 - hy); A.ctx.globalAlpha = .5; R("#d8ff8a", px - 2, hy + 10, 3, G - 80 - hy); A.ctx.globalAlpha = 1; ell(A, "#a8e83a", px, G - 72, 18, 5); }
      for (const d of r.drops) R("#a8e83a", Math.round(d.x - S.camX), Math.round(d.y), 1, 3);
    },
    fg(t, S) {
      onHead(A, (x, top, face) => { for (let i = -4; i <= 4; i++) { const a = i * .3 - Math.PI / 2, fx = x + Math.cos(a) * 9, fy = top + 4 + Math.sin(a) * 9; A.ctx.strokeStyle = A.C.ink; A.ctx.lineWidth = 3; A.ctx.beginPath(); A.ctx.moveTo(x, top + 4); A.ctx.lineTo(fx, fy); A.ctx.stroke(); A.ctx.strokeStyle = "#f4f4f2"; A.ctx.lineWidth = 1; A.ctx.stroke(); R(A.C.ink, Math.round(fx), Math.round(fy), 1, 1); }
        R(A.C.ink, x - 5, top + 3, 10, 2); R("#f3d23b", x - 4, top + 3, 8, 1); });
      if (S.p.x > AFTER) { const fx = sx(A, 900); R("#3a8a2a", fx, A.G - 10, 1, 10); for (let i = 0; i < 6; i++) { const a = i / 6 * 7; R("#f4f4f2", fx + Math.round(Math.cos(a) * 3), A.G - 12 + Math.round(Math.sin(a) * 3), 2, 2); } R("#f3d23b", fx, A.G - 12, 2, 2);
        A.ctx.globalAlpha = .25; A.ctx.fillStyle = "#ffffff"; A.ctx.beginPath(); A.ctx.moveTo(fx - 4, 0); A.ctx.lineTo(fx + 6, 0); A.ctx.lineTo(fx + 16, A.G); A.ctx.lineTo(fx - 14, A.G); A.ctx.fill(); A.ctx.globalAlpha = 1; }
    }
  };
};

/* THE DEVIL PLAYS TOO MUCH: a priest, a lounging devil, and one flick. */
W["the-devil-plays-too-much"] = A => {
  const R = A.R, G = A.G, FLICK = 640, LAND = 800;
  const priest = rows => rows.map((r, j) => j >= 11 && j <= 22 ? r.replace(/[RWwK]/g, c => j === 11 ? (c === "R" ? "Z" : c) : "D") : j >= 23 ? r.replace(/R/g, "D").replace(/r/g, "d") : r);
  return {
    sprites: Object.assign(reds(A, "b5", {}), { bible: { pal: { N: "#8a6a3a", Y: "#f3d23b" }, rows: ["NNNN", "NYNN", "YYYN", "NYNN", "NNNN"] } }),
    level: {
      obs: [["fire", 200], ["dv_fork", 280], ["fire", 380], ["dv_fork", 460], ["fire", 540]],
      target: "dv_font", targetAt: 420, prop: "bible", propAt: 120, npcs: [],
      captions: [[30, "Father Red on his rounds."], [260, "Someone's watching from above."], [FLICK - 60, "Don't look up."]]
    },
    obs: { dv_fork: { w: 14, h: 5, y: 16, vx: -150, draw(o, x, y) { R("#8a1008", x + 4, y + 2, 10, 1); R(A.C.ink, x, y, 1, 5); R(A.C.ink, x + 2, y, 1, 5); R(A.C.ink, x, y + 2, 4, 1); R(A.C.ink, x + 4, y, 1, 5); } } },
    targets: { dv_font: { line: "Holy water, refilled.", draw(tg, x) { R(A.C.ink, x - 7, G - 12, 14, 5); R("#cfcfcf", x - 6, G - 11, 12, 3); R("#9fd0ee", x - 5, G - 11, 10, 1); R(A.C.ink, x - 2, G - 7, 4, 7); R("#cfcfcf", x - 1, G - 7, 2, 7); R(A.C.ink, x - 5, G - 1, 10, 1); } } },
    reset(S) { S.dv = { dressed: false, flick: -1 }; },
    update(dt, S, p) {
      const d = S.dv; if (!d.dressed) { d.dressed = true; A.reskin(priest, { D: "#24242e", d: "#16161c", Z: "#f4f4f2" }); }
      if (d.flick < 0 && p.x > FLICK && p.x < FLICK + 50) { d.flick = 0; A.redSays("Lord, give me strength.", 1.2); }
      if (d.flick >= 0 && d.flick < 9) { const b = d.flick; d.flick += dt; if (d.flick < 1.1) lock(p, FLICK);
        if (b < 1.1 && d.flick >= 1.1) { p.x = FLICK + 4; p.vy = 330; p.onG = false; p.kb = .5; p.face = 1; crowdText(A, S, "FLICK", FLICK, 70); }
        if (b < 2.6 && d.flick >= 2.6) { A.showCaption("The devil plays too much."); A.redSays("...amen?", 1.6); } }
    },
    bg(t, S) {
      const canyon = S.p.x > LAND - 40;
      if (canyon) { R("#e8822a", 0, 0, A.W, A.H); A.layer(.3, 26, (x, k) => { R("#a8522a", x, 20 + (k % 4) * 6, 12, 50); disc(A, "#a8522a", x + 6, 20 + (k % 4) * 6, 6); }); R("#c86a2a", 0, 80, A.W, G - 80);
        const sx0 = sx(A, 880); oell(A, "#c8924a", sx0, G - 6, 40, 12); R("#c8924a", sx0 - 40, G - 6, 80, 30); for (let i = 0; i < 8; i++) R("#a87a3a", sx0 - 36 + i * 10, G, 2, 20); ell(A, "#8a6a3a", sx0, G - 8, 34, 8);
        R("#c86a2a", 0, G + 18, A.W, 12); return; }
      grad(A, ["#7a8a6a", "#a8a888"], 0, 100);
      A.ctx.fillStyle = "#3a72d6"; A.ctx.beginPath(); A.ctx.moveTo(0, 70); A.ctx.lineTo(A.W, 120); A.ctx.lineTo(A.W, A.H); A.ctx.lineTo(0, A.H); A.ctx.fill();
      R("#2a62c6", 0, G, A.W, 30);
      // the devil, lounging, chin in hand, watching
      const dx = Math.round(230 - A.S.camX * .04), dy = 46 + Math.sin(t) * 3, look = Math.max(-2, Math.min(2, (A.red.x - dx) / 60));
      const tw = Math.sin(t * 2); A.ctx.strokeStyle = A.C.ink; A.ctx.lineWidth = 4; A.ctx.beginPath(); A.ctx.moveTo(dx + 40, dy); A.ctx.bezierCurveTo(dx + 60, dy - 20, dx + 50 + tw * 8, dy - 40, dx + 66, dy - 46); A.ctx.stroke(); A.ctx.strokeStyle = "#e89a9a"; A.ctx.lineWidth = 2; A.ctx.stroke();
      oell(A, "#556a3a", dx + 30, dy + 6, 18, 8, -.2);
      oell(A, "#e89a9a", dx + 6, dy + 8, 34, 14, -.25); oell(A, "#e89a9a", dx - 22, dy - 4, 14, 16);
      for (let i = 0; i < 3; i++) R("#c87a7a", dx - 4 + i * 6, dy + 2, 1, 10);
      R(A.C.ink, dx - 34, dy - 22, 3, 6); R("#f4f4f2", dx - 33, dy - 21, 1, 4); R(A.C.ink, dx - 13, dy - 22, 3, 6); R("#f4f4f2", dx - 12, dy - 21, 1, 4);
      oell(A, "#f4f4f2", dx - 28, dy - 8, 4, 3); oell(A, "#f4f4f2", dx - 18, dy - 8, 4, 3); R(A.C.ink, dx - 29 + look, dy - 8, 2, 2); R(A.C.ink, dx - 19 + look, dy - 8, 2, 2);
      R(A.C.ink, dx - 28, dy + 1, 12, 2); R(A.C.ink, dx - 23, dy + 5, 4, 1);
      oell(A, "#e89a9a", dx - 10, dy + 18, 10, 6, .4);                       // hand under chin
    },
    mid(t, S) {
      const d = S.dv; if (d.flick < 0 || d.flick > 1.6) return; const fx = sx(A, FLICK) - 14, u = Math.min(1, d.flick / .8), y = -60 + u * (G - 2), cocked = d.flick < 1.1;
      R(A.C.ink, fx - 8, y - 70, 16, 70); R("#d82a1a", fx - 7, y - 69, 14, 69); oell(A, "#d82a1a", fx, y, 9, 10);
      if (cocked) { oell(A, "#d82a1a", fx + 6, y + 6, 5, 4); } else { R(A.C.ink, fx + 4, y - 2, 16, 6); R("#d82a1a", fx + 5, y - 1, 14, 4); }
    },
    fg(t, S) { if (S.p.x < LAND - 40) onHead(A, (x, top) => { R("#f4f4f2", x - 2, top + 11, 4, 2); }); txtFx(A, S); }
  };
};

/* ECOLOGICAL MARTYRDOM: lie down for the birds, the bears, the fish. */
W["ecological-martydom"] = A => {
  const R = A.R, G = A.G, BEARS = [330, 560], RIVER = 600, LINE = 830;
  const bear = (x, t, k, c = "#e4e4e0") => { const b = Math.round(Math.sin(t * 3 + k) * 1); oell(A, c, x, G - 11 + b, 17, 10); oell(A, c, x - 15, G - 15 + b, 8, 7); R(A.C.ink, x - 20, G - 16 + b, 2, 2); R(A.C.ink, x - 22, G - 13 + b, 2, 2);
    for (let i = 0; i < 4; i++) { R(A.C.ink, x - 12 + i * 8, G - 4, 5, 4); R(c, x - 11 + i * 8, G - 4, 3, 3); } disc(A, c, x - 11, G - 22 + b, 2); };
  return {
    sprites: Object.assign(reds(A, "b5", {}), reds(A, "hand", {})),
    level: {
      obs: [["bird", 160], ["bird", 230], ["bird", 290], ["em_salmon", 660], ["em_salmon", 720], ["em_salmon", 780]],
      target: "tree", targetAt: 300, prop: "fish", propAt: 110, npcs: [["hand_stand", LINE, -1, "Hold on."], ["hand_stand", LINE + 26, -1], ["hand_stand", LINE + 52, -1]],
      captions: [[30, "Feed the birds. With yourself."], [BEARS[0] + 10, "The bears are hungry too."], [RIVER + 20, "Into the river. Hold hands."]]
    },
    obs: { em_salmon: { w: 10, h: 5, y: 0, vx: 0, draw(o, x, y, t) { const c = (t * .7 + o.x * .01) % 1, h = c < .5 ? Math.sin(c * 2 * Math.PI) * 26 : 0; o.y = h; o.off = h < 5; if (h < 1) return; const yy = A.G - Math.round(h) - 5;
      R(A.C.ink, x, yy, 10, 5); R("#e88a7a", x + 1, yy + 1, 8, 3); R("#7ac85a", x + 1, yy + 1, 3, 3); R(A.C.ink, x + 2, yy + 2, 1, 1); R(A.C.ink, x + 9, yy - 1, 2, 7); } } },
    reset(S) { S.em = { bit: {} }; },
    update(dt, S, p) {
      const e = S.em; if (p.x > BEARS[0] && p.x < BEARS[1]) { const k = Math.floor((p.x - BEARS[0]) / 60); if (!e.bit[k]) { e.bit[k] = 1; crowdText(A, S, ["NOM", "CHOMP", "MUNCH", "NOM NOM"][k % 4], p.x - 10, 40); splash(S, p.x, 14, 6, "#E8271A"); } }
      if (p.x > LINE - 20 && !e.done) { e.done = true; A.showCaption("Ecological martyrdom."); A.redSays("Circle of life, baby.", 2); }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < BEARS[0] - 20) { R("#7ac85a", 0, 0, A.W, A.H); A.layer(.4, 9, (x, k) => R("#6ab84a", x + A.hash(k, 1) * 6, A.hash(k, 2) * 150, 3, 1));
        lieRed(A, sx(A, 200), G - 4, -Math.PI / 2 + .1); for (let i = 0; i < 4; i++) { const bx = sx(A, 170 + i * 18), b = Math.floor(t * 5 + i) % 2; oell(A, "#d8d8d4", bx, G - 9 - b, 4, 5); R("#f3a91f", bx - 5, G - 12 - b, 2, 1); R(A.C.ink, bx - 2, G - 12 - b, 1, 1); }
        R("#6ab84a", 0, G, A.W, 30); }
      else if (x < RIVER) { grad(A, ["#5a7a9a", "#7a9aba"], 0, 90); A.layer(.2, 40, (x, k) => R("#4a6a8a", x, 40 + (k % 3) * 10, 30, 60)); R("#d8b878", 0, 90, A.W, G - 90); R("#c8a868", 0, G, A.W, 30);
        [BEARS[0] + 50, BEARS[0] + 110, BEARS[0] + 170].forEach((bx, i) => bear(sx(A, bx), t, i)); }
      else { R("#e8d860", 0, 0, A.W, 70); A.layer(.15, 140, (x, k) => { ell(A, "#3a9a3a", x + 60, 76, 80, 18); }); A.layer(.3, 90, (x, k) => ell(A, "#4aa84a", x + 30, 84, 50, 12));
        R("#7ad0e0", 0, 84, A.W, G - 84); A.layer(1, 13, (x, k) => R("#a8e4f0", x + (Math.floor(t * 2 + k) % 4), 96 + (k % 7) * 8, 6, 1));
        const bx = sx(A, 900, .6); oell(A, "#c8a07a", bx, 70, 14, 26); oell(A, "#c8a07a", bx, 40, 10, 9); R("#c8a07a", bx - 22, 34, 10, 4); R("#c8a07a", bx + 12, 30, 10, 4); R(A.C.ink, bx - 4, 38, 2, 2); R(A.C.ink, bx + 2, 38, 2, 2); R("#f4f4f2", bx - 3, 44, 6, 2);
        R("#5ab4d0", 0, G, A.W, 30); A.layer(1, 11, (x, k) => R("#a8e4f0", x + (Math.floor(t * 3 + k) % 5), G + 4 + (k % 5) * 5, 6, 1)); }
    },
    mid(t, S) { if (S.p.x > LINE - 60) { const xs = [LINE, LINE + 26, LINE + 52].map(v => sx(A, v)); xs.slice(0, -1).forEach((x, i) => R("#E8271A", x + 4, A.G - 20, xs[i + 1] - x - 8, 2)); R("#E8271A", A.red.x + 3, A.G - 20, xs[0] - A.red.x - 6, 2); } },
    fg(t, S) { txtFx(A, S); dropFx(A, S); }
  };
};

/* FLAPJACKS: sunset on the balcony with her. Something small and dark keeps following. */
W["flapjacks"] = A => {
  const R = A.R, G = A.G, HIDE = 700, LIGHT = 820;
  return {
    sprites: { gf: { pal: { P: "#f0a8d0", p: "#d888b8", B: "#9ac8ee", b: "#7aa8d6", K: "#14110F" }, rows: [
      "..KKKKK...", ".KKKKKKK..", ".KPPPPPKK.", ".KPKPPKPK.", ".KPPPPPKK.", ".K.PRRP.K.", "....PP....", "..BBBBBB..", ".BBBBBBBB.", ".PBBBBBBP.", ".PBBBBBBP.", "..BBBBBB..", ".bbbbbbbb.", "bbbbbbbbbb", "..PP..PP..", "..PP..PP..", "..PP..PP..", "..PP..PP..", "..pp..pp..", ".PPP.PPP.."] },
      blob: { pal: { K: "#0a0a0a", E: "#ffffff" }, rows: ["..KKKK..", ".KKKKKK.", "KKKKKKKK", "KEKKKEKK", "KKKKKKKK", "KKKEEKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", ".KK..KK."] },
      torch: { pal: { G: "#9a9a9a", Y: "#f3d23b" }, rows: ["GGGY", "GGGY"] } },
    level: {
      obs: [["bat", 220], ["fj_moth", 300], ["bat", 420], ["fj_moth", 520], ["bat", 610]],
      target: "lamp", targetAt: 460, prop: "torch", propAt: 600, npcs: [],
      captions: [[30, "Sunset on the balcony. Perfect."], [250, "Is something following us?"], [HIDE - 20, "Where'd it go?"]]
    },
    obs: { fj_moth: { w: 6, h: 5, y: 15, vx: -40, draw(o, x, y, t) { const f = Math.floor(t * 14) % 2, yy = y + Math.round(Math.sin(t * 5 + o.x) * 3); R(A.C.ink, x + 2, yy, 2, 5); R("#e8dcc8", x + (f ? 0 : 1), yy + 1, 2, 3); R("#e8dcc8", x + (f ? 4 : 3), yy + 1, 2, 3); } } },
    reset(S) { S.fj = { g: { x: 30, y: 0, d: 0, face: 1, moving: false }, b: { x: -30, y: 0, d: 0, face: 1, moving: false }, lit: -1 }; },
    update(dt, S, p) {
      const f = S.fj; follow(f.g, Math.min(p.x - 14 * (p.face || 1), HIDE + 120), 120, dt); if (Math.abs(f.g.x - p.x) > 80) f.g.x = p.x - 40;
      const goal = p.x > HIDE ? f.g.x + 4 : p.x - 60; follow(f.b, goal, 110, dt); if (Math.abs(f.b.x - goal) > 140) f.b.x = goal - 60 * Math.sign(goal - f.b.x || 1);
      if (f.lit < 0 && p.x > LIGHT && p.x < LIGHT + 60) { f.lit = 0; A.showCaption("Flapjacks."); A.say("...hi.", f.g.x + 4, 30, 2); }
      if (f.lit >= 0) f.lit += dt;
    },
    bg(t, S) {
      grad(A, ["#3a2a7a", "#8a4aa0", "#f08a5a", "#f8c85a"], 0, 96); disc(A, "#ff7a3a", 160, 96, 10);
      R("#2a3a6a", 0, 96, A.W, 30); A.layer(1, 13, (x, k) => R("#f08a5a", x + (Math.floor(t + k) % 4), 100 + (k % 5) * 4, 7, 1));
      A.layer(.4, 20, (x, k) => { const h = 20 + (k % 4) * 12; R("#4a4a5a", x, 126 - h, 18, h); if (k % 2) R("#f3d23b", x + 6, 130 - h, 3, 3); });
      R("#6a6a72", 0, 126, A.W, G - 126); R("#8a5a32", 0, G, A.W, 30); A.layer(1, 22, x => R("#6a4224", x, G + 1, 1, 29));
    },
    mid(t, S) {
      const f = S.fj, gx = sx(A, f.g.x), im = A.NS[f.g.face < 0 ? "gfL" : "gf"]; A.ctx.drawImage(im, gx - 5, G - im.height + 1);
      const bx = sx(A, f.b.x), shy = S.p.face < 0 && Math.abs(f.b.x - S.p.x) < 120 && f.lit < 0, bi = A.NS[f.b.face < 0 ? "blobL" : "blob"];
      A.ctx.globalAlpha = shy ? .25 : 1; A.ctx.drawImage(bi, bx - 4, G - bi.height + 1 - (f.b.moving ? Math.floor(f.b.d / 4) % 2 : 0)); A.ctx.globalAlpha = 1;
    },
    fg(t, S) {
      R(A.C.ink, 0, G - 20, A.W, 2); R("#a8763a", 0, G - 19, A.W, 1); A.layer(1, 9, x => { R(A.C.ink, x, G - 20, 2, 20); R("#a8763a", x, G - 19, 1, 19); });
      const f = S.fj; if (f.lit >= 0) { const x = A.red.x + 6, gx = sx(A, f.g.x); A.ctx.globalAlpha = Math.min(.7, f.lit * 2); A.ctx.fillStyle = "#fff4a0"; A.ctx.beginPath(); const bx = sx(A, f.b.x); A.ctx.moveTo(x, G - 18); A.ctx.lineTo(bx - 8, G - 34); A.ctx.lineTo(bx - 8, G + 4); A.ctx.fill(); A.ctx.globalAlpha = 1;
        const bi = A.NS.blobL; A.ctx.drawImage(bi, bx - 4, G - bi.height + 1); R("#ffffff", bx - 1, G - 4, 1, 3); }
    }
  };
};

/* THERE GO THE BOYS: a pink valley, a thousand tiny Reds, a long goodbye. */
W["there-go-the-boys"] = A => {
  const R = A.R, G = A.G, PIT = 560, SOCK = 780;
  return {
    sprites: { tgsock: { pal: { Z: "#f4f4f2" }, rows: ["ZZ..", "ZZ..", "ZZ..", "ZZZZ", "ZZZZ"] }, boy: { pal: {}, rows: [".K.", "RRR", ".R.", "R.R"] }, boyb: { pal: {}, rows: [".K.", "RRR", ".R.", ".R."] } },
    level: {
      obs: [["tg_boy", 160], ["tg_boy", 200], ["tg_boy", 260], ["tg_boy", 330], ["tg_boy", 380], ["tg_boy", 440], ["tg_boy", 500]],
      target: "plant", targetAt: 300, prop: "tgsock", propAt: 120, npcs: [],
      captions: [[30, "The boys are running."], [PIT - 40, "Some of them make it."], [SOCK - 50, "...and the rest?"]]
    },
    obs: { tg_boy: { w: 3, h: 4, y: 0, vx: -45, draw(o, x, y, t) { const f = Math.floor(t * 12 + o.x) % 2; A.ctx.drawImage(A.NS[f ? "boyL" : "boybL"], x - 1, y - 1); } } },
    reset(S) { S.tg = { sock: -1, swarm: [] }; for (let i = 0; i < 26; i++) S.tg.swarm.push({ x: SOCK - 60 + Math.random() * 120, y: 0, ph: Math.random() * 7 }); },
    update(dt, S, p) {
      const g = S.tg; if (g.sock < 0 && p.x > SOCK - 70 && p.x < SOCK + 30) { g.sock = 0; }
      if (g.sock >= 0 && g.sock < 9) { const b = g.sock; g.sock += dt; if (b < 1.5 && g.sock >= 1.5) { A.showCaption("There go the boys."); A.redSays("Bye, boys...", 2.2); }
        for (const s of g.swarm) if (g.sock > .8) { s.x += (SOCK - s.x) * dt * 2; s.y += dt * 40; } }
    },
    bg(t, S) {
      grad(A, ["#f39a3a", "#f3c85a", "#f0e0a0"], 0, 112);
      const fx = sx(A, 700, .15); oell(A, "#f0c8e0", fx, 30, 22, 24); R(A.C.ink, fx - 8, 24, 2, 12); R(A.C.ink, fx + 6, 24, 2, 12); oell(A, "#f08aa0", fx, 44, 6, 2);
      A.layer(.3, 220, (x, k) => { A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(x - 1, G); A.ctx.quadraticCurveTo(x + 50, 20, x + 101, G); A.ctx.fill(); A.ctx.fillStyle = "#a890a8"; A.ctx.beginPath(); A.ctx.moveTo(x, G); A.ctx.quadraticCurveTo(x + 50, 22, x + 100, G); A.ctx.fill(); });
      R("#f0c8e0", 0, 110, A.W, G - 110); R("#f0c8e0", 0, G, A.W, 30); A.layer(1, 7, (x, k) => R("#e0b0d0", x, G + 3 + (k % 5) * 5, 3, 1));
      const px = sx(A, PIT); if (px > -60 && px < A.W + 60) { oell(A, "#5a2a3a", px, G + 4, 30, 7); for (let i = 0; i < 9; i++) { const bx = px - 22 + (i * 11) % 44, by = G + 2 + (i % 3) * 2, f = Math.floor(t * 8 + i) % 2; A.ctx.drawImage(A.NS[f ? "boy" : "boyb"], bx, by - 6 - Math.round(Math.abs(Math.sin(t * 4 + i)) * 5)); } }
    },
    mid(t, S) {
      const g = S.tg, sx0 = sx(A, SOCK);
      for (const s of g.swarm) { if (s.y > 50) continue; const x = sx(A, s.x) + Math.round(Math.sin(t * 6 + s.ph) * 3); A.ctx.drawImage(A.NS[Math.floor(t * 10 + s.ph) % 2 ? "boy" : "boyb"], x, G - 4 - Math.round(s.y)); }
      if (g.sock >= 0) { const u = Math.min(1, g.sock / .8), y = -80 + u * (G + 26);
        R(A.C.ink, sx0 - 21, y - 40, 42, 74); R("#f4f4f2", sx0 - 20, y - 39, 40, 72); for (let i = 0; i < 6; i++) R("#d8d8d4", sx0 - 20, y - 36 + i * 3, 40, 1);
        oell(A, "#f4f4f2", sx0 + 4, y + 34, 26, 14); ell(A, "#2a2a2a", sx0 + 10, y + 38, 9, 4, .4);
        R(A.C.ink, sx0 - 26, y - 70, 52, 34); R("#f0b8a0", sx0 - 25, y - 69, 50, 32); R("#e8c23a", sx0 - 25, y - 44, 50, 2); for (let i = 0; i < 4; i++) oell(A, "#f0b8a0", sx0 - 18 + i * 12, y - 36, 5, 4);
        R("#7CFC6A", sx0 - 22, y - 40, 4, 3); R("#7CFC6A", sx0 + 18, y - 40, 4, 3); }
    },
    fg(t, S) { const g = S.tg; if (g.sock > 1.5) onHead(A, (x, top, face) => { if (Math.floor(t * 3) % 2) R("#9fd0ee", x + face * 3, top + 8, 1, 3); R(A.C.ink, x - 1, top - 10, 2, 12); R("#E8271A", x, top - 9, 1, 10); }); }
  };
};

/* FOODCHAIN BATTLE: tiny Red vs worm. Pigeon vs worm. Cat vs pigeon. Dog vs cat. */
W["foodchain-battle"] = A => {
  const R = A.R, G = A.G, PIG = 520, CHAIN = 760;
  const pigeon = (x, y, s, peck) => { oell(A, "#9a9a9a", x, y, 22 * s, 16 * s); oell(A, "#8a8a8a", x + 16 * s, y - 2 * s, 12 * s, 7 * s, .4); oell(A, "#9a9a9a", x - 16 * s, y - 14 * s + peck, 11 * s, 11 * s);
    A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(x - 24 * s, y - 16 * s + peck); A.ctx.lineTo(x - 40 * s, y - 8 * s + peck * 1.5); A.ctx.lineTo(x - 22 * s, y - 9 * s + peck); A.ctx.fill();
    A.ctx.fillStyle = "#e8a23a"; A.ctx.beginPath(); A.ctx.moveTo(x - 24 * s, y - 15 * s + peck); A.ctx.lineTo(x - 38 * s, y - 8 * s + peck * 1.5); A.ctx.lineTo(x - 23 * s, y - 10 * s + peck); A.ctx.fill();
    disc(A, A.C.ink, x - 18 * s, y - 17 * s + peck, 2.5 * s); disc(A, "#ffffff", x - 19 * s, y - 18 * s + peck, .8 * s); [x - 6 * s, x + 6 * s].forEach(lx => { R("#e8a23a", lx, y + 14 * s, 2, G - y - 14 * s); R("#e8a23a", lx - 3, G - 1, 8, 1); }); };
  return {
    sprites: Object.assign(reds(A, "b5", {}), { spear: { pal: { N: "#8a5a32", G: "#c8c8c8" }, rows: ["GNNNNNN"] } }),
    level: {
      obs: [["fc_worm", 180], ["fc_worm", 260], ["fc_worm", 340], ["fc_worm", 420], ["fc_worm", 620], ["fc_worm", 680]],
      target: "bush", targetAt: 460, prop: "spear", propAt: 110, npcs: [],
      captions: [[30, "Tiny warrior. Big worms."], [PIG - 80, "Uh oh. Bird."], [CHAIN - 40, "Everybody eats somebody."]]
    },
    obs: { fc_worm: { w: 14, h: 5, y: 0, vx: -18, draw(o, x, y, t) { const w = Math.sin(t * 6 + o.x); for (let i = 0; i < 7; i++) { const yy = y + 2 - Math.round(Math.abs(Math.sin(i * .6 + t * 4)) * 2 * (1 + w * .3)); R(A.C.ink, x + i * 2, yy - 1, 3, 4); R("#e8a8a8", x + i * 2, yy, 2, 2); } } } },
    reset(S) { S.fc = { chain: -1, peck: 0 }; },
    update(dt, S, p) {
      const f = S.fc; if (Math.abs(p.x - PIG + 20) < 30 && p.inv <= 0 && Math.sin(S.t * 3) > .9) { p.inv = 1.2; p.vy = 180; p.onG = false; p.kb = .3; A.redSays("Not today, bird!", 1.4); crowdText(A, S, "PECK", p.x, 50); }
      if (f.chain < 0 && p.x > CHAIN && p.x < CHAIN + 60) { f.chain = 0; } if (f.chain >= 0) { const b = f.chain; f.chain += dt; if (b < 2 && f.chain >= 2) A.showCaption("Foodchain battle."); }
    },
    bg(t, S) {
      R("#5ab8e8", 0, 0, A.W, 70); clouds(A); R("#3aa83a", 0, 70, A.W, G - 70); A.layer(.4, 9, (x, k) => R("#2f982f", x + A.hash(k, 1) * 6, 74 + A.hash(k, 2) * 70, 3, 1));
      A.ctx.fillStyle = "#a8763a"; A.ctx.beginPath(); A.ctx.moveTo(0, G - 6); A.ctx.lineTo(A.W, G - 16); A.ctx.lineTo(A.W, A.H); A.ctx.lineTo(0, A.H); A.ctx.fill();
      R("#a8763a", 0, G, A.W, 30); A.layer(1, 8, (x, k) => R("#8a5a2a", x, G + 3 + (k % 5) * 5, 4, 1));
    },
    mid(t, S) {
      const f = S.fc, px = sx(A, PIG); if (f.chain < 0 && px > -80 && px < A.W + 80) pigeon(px, G - 40, 1, Math.max(0, Math.sin(t * 3)) * 18);
      if (f.chain >= 0) { const u = f.chain, base = sx(A, CHAIN) + 160;
        const bx = base - u * 90; pigeon(bx, G - 14, .45, Math.sin(t * 10) * 4);
        const cx = base + 50 - u * 100, cy = G - 8 - Math.abs(Math.sin(u * 4)) * 10; oell(A, "#e8923a", cx, cy, 14, 6); oell(A, "#e8923a", cx - 14, cy - 5, 6, 6); R("#e8923a", cx - 19, cy - 13, 3, 4); R("#e8923a", cx - 12, cy - 13, 3, 4);
        for (let i = 0; i < 4; i++) R("#c8721a", cx - 6 + i * 5, cy - 5, 2, 10); A.ctx.strokeStyle = "#e8923a"; A.ctx.lineWidth = 2; A.ctx.beginPath(); A.ctx.moveTo(cx + 12, cy); A.ctx.quadraticCurveTo(cx + 22, cy - 18, cx + 18, cy - 22); A.ctx.stroke(); R(A.C.ink, cx - 17, cy - 6, 1, 1);
        const dx = base + 120 - u * 110, dy = G - 12 - Math.abs(Math.sin(u * 5)) * 6; oell(A, "#f4f4f2", dx, dy, 18, 9); oell(A, "#f4f4f2", dx - 18, dy - 8, 10, 8); oell(A, "#8a5a32", dx - 13, dy - 12, 4, 5); oell(A, "#8a5a32", dx + 6, dy - 3, 6, 4);
        R(A.C.ink, dx - 26, dy - 8, 3, 2); R(A.C.ink, dx - 21, dy - 10, 2, 2); R("#e8506a", dx - 26, dy - 4, 4, 3); }
    },
    fg(t, S) { onHead(A, (x, top, face) => A.ctx.drawImage(A.NS[face > 0 ? "spear" : "spearL"], x + face * 2 - 3, top + 14)); txtFx(A, S); }
  };
};

/* SACRIFICIAL TREE: she offers the glowing fruit. He takes a bite. He becomes the field. */
W["sacrificial-tree"] = A => {
  const R = A.R, G = A.G, TREE = 540, FRUIT = 680;
  return {
    sprites: Object.assign(reds(A, "b5", {}), { fruitg: { pal: { Y: "#f3d23b", Q: "#3a8a2a" }, rows: [".Q.", "YYY", "YYY", ".Y."] } }),
    level: {
      obs: [["skeeter", 200], ["st_daisy", 280], ["skeeter", 360], ["st_daisy", 440], ["skeeter", 620]],
      target: "bush", targetAt: 400, prop: "fruitg", propAt: 140, npcs: [],
      captions: [[30, "Tall grass. Warm light."], [TREE - 80, "She's offering something."], [FRUIT - 20, "Just one bite."]]
    },
    obs: { st_daisy: { w: 8, h: 8, y: 0, vx: 0, draw(o, x, y, t) { R("#3a8a2a", x + 3, y + 3, 1, 5); for (let i = 0; i < 8; i++) { const a = i / 8 * 7 + t; R("#f4f4f2", x + 3 + Math.round(Math.cos(a) * 3), y + 1 + Math.round(Math.sin(a) * 3), 2, 2); } R("#f3d23b", x + 3, y + 1, 2, 2); } } },
    reset(S) { S.st = { eat: -1 }; },
    update(dt, S, p) { const s = S.st; if (s.eat < 0 && p.x > FRUIT && p.x < FRUIT + 50) { s.eat = 0; } if (s.eat >= 0 && s.eat < 9) { const b = s.eat; s.eat += dt; if (s.eat < 4.2) lock(p, FRUIT); if (b < 4.2 && s.eat >= 4.2) { A.showCaption("Sacrificial tree."); p.x = FRUIT + 60; } } },
    bg(t, S) {
      R("#2a8a2a", 0, 0, A.W, A.H); const k = A.ctx, g = k.createRadialGradient(A.W / 2, 60, 10, A.W / 2, 60, 200); g.addColorStop(0, "rgba(160,240,140,.6)"); g.addColorStop(1, "rgba(0,40,0,.4)"); k.fillStyle = g; k.fillRect(0, 0, A.W, A.H);
      A.layer(.5, 7, (x, k) => { R("#1f7a1f", x, 100 + (k % 5) * 9, 1, 8); R("#3a9a3a", x + 3, 104 + (k % 4) * 10, 1, 6); });
      R("#227a22", 0, G, A.W, 30); A.layer(1, 4, (x, k) => R("#1a6a1a", x, G + 1 + (k % 5) * 5, 1, 4));
      if (S.st.eat > 4.2) A.layer(.8, 46, (x, k) => { lieRed(A, x + 20, 128 + (k % 3) * 8, k % 2 ? 1.57 : -1.57); A.ctx.globalAlpha = .7; R("#1a5a1a", x + 6, 124 + (k % 3) * 8, 28, 9); A.ctx.globalAlpha = 1; for (let i = 0; i < 2; i++) { R("#f4f4f2", x + 12 + i * 14, 124 + (k % 3) * 8, 3, 3); R("#f3d23b", x + 13 + i * 14, 125 + (k % 3) * 8, 1, 1); } });
      const tx = sx(A, TREE); if (tx > -80 && tx < A.W + 80) {          // the tree lady
        A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(tx - 31, G); A.ctx.lineTo(tx - 7, 46); A.ctx.lineTo(tx + 7, 46); A.ctx.lineTo(tx + 31, G); A.ctx.fill();
        A.ctx.fillStyle = "#c8924a"; A.ctx.beginPath(); A.ctx.moveTo(tx - 30, G); A.ctx.lineTo(tx - 6, 47); A.ctx.lineTo(tx + 6, 47); A.ctx.lineTo(tx + 30, G); A.ctx.fill();
        for (let i = 0; i < 6; i++) R("#a8722a", tx - 12 + i * 5, 70 + i * 12, 1, 14);
        [-1, 1].forEach(s => { A.ctx.strokeStyle = A.C.ink; A.ctx.lineWidth = 4; A.ctx.beginPath(); A.ctx.moveTo(tx + s * 4, 60); A.ctx.quadraticCurveTo(tx + s * 40, 40 + Math.sin(t + s) * 3, tx + s * 56, 76); A.ctx.stroke(); A.ctx.strokeStyle = "#c8924a"; A.ctx.lineWidth = 2; A.ctx.stroke(); });
        disc(A, A.C.ink, tx, 40, 11); disc(A, "#3a9a3a", tx, 40, 10); for (let i = 0; i < 7; i++) disc(A, "#4aaa4a", tx - 8 + (i * 5) % 16, 34 + (i * 3) % 8, 3);
        R("#c8924a", tx - 4, 42, 8, 6); R(A.C.ink, tx - 3, 44, 1, 1); R(A.C.ink, tx + 2, 44, 1, 1); }
      const fx = sx(A, FRUIT + 14); if (S.st.eat < 0) { A.ctx.globalAlpha = .35; disc(A, "#fff4a0", fx, 40, 14 + Math.sin(t * 3) * 2); A.ctx.globalAlpha = 1; R("#3a8a2a", fx, 0, 1, 36); oell(A, "#f3d23b", fx, 40, 4, 5); }
    },
    fg(t, S) {
      const s = S.st; onHead(A, (x, top) => { if (s.eat > 4.2) return; R("#f4f4f2", x - 4, top + 11, 9, 8); R("#3a6ad0", x - 4, top + 19, 9, 3); });
      if (s.eat < 0 || s.eat > 4.6) return; const u = s.eat, a = Math.min(1, u * 3, (4.6 - u) * 3); A.ctx.globalAlpha = a;
      if (u < 2.2) { R("#2a8a2a", 0, 0, A.W, A.H); const cx = 170; disc(A, A.C.ink, cx, 80, 46); disc(A, "#E8271A", cx, 80, 45); ell(A, A.C.ink, cx, 40, 46, 22); oell(A, "#ffffff", cx - 16, 70, 9, 10); oell(A, "#ffffff", cx + 16, 70, 9, 10); disc(A, A.C.ink, cx - 14, 72, 4); disc(A, A.C.ink, cx + 18, 72, 4);
        R("#f4f4f2", cx - 60, 126, 120, 60); oell(A, "#f3d23b", cx - 50, 100, 16, 14 - Math.min(10, u * 6)); oell(A, "#E8271A", cx - 60, 110, 12, 10); R(A.C.ink, cx - 6, 98, 14, 6); if (u > .6) for (let i = 0; i < 3; i++) R("#f3d23b", cx - 2 + i * 4, 104, 1, 3 + ((u * 20 + i * 5) % 12)); }
      else { R("#1a5a1a", 0, 0, A.W, A.H); const cx = 160; for (let i = 0; i < 10; i++) { const a = i / 10 * 7, r = (u - 2.2) * 50; A.ctx.strokeStyle = "#0a2a0a"; A.ctx.lineWidth = 2; A.ctx.beginPath(); A.ctx.moveTo(cx, 100); A.ctx.lineTo(cx + Math.cos(a) * r, 100 + Math.sin(a) * r * .5); A.ctx.stroke(); }
        lieRed(A, cx, 100, 1.57); if (u > 3) [[-8, 0], [8, 0]].forEach(([dx]) => { for (let i = 0; i < 8; i++) { const a = i / 8 * 7; R("#f4f4f2", cx + dx + Math.round(Math.cos(a) * 4), 88 + Math.round(Math.sin(a) * 4), 2, 2); } R("#f3d23b", cx + dx, 88, 2, 2); }); }
      A.ctx.globalAlpha = 1;
    }
  };
};

/* WHEN IS BUFF ENOUGH?: the mirror always says something different. */
W["when-is-buff-enough"] = A => {
  const R = A.R, G = A.G, MIRRORS = [140, 400, 640, 880];
  return {
    sprites: Object.assign(reds(A, "b5", {}), { plate: { pal: { Z: "#f4f4f2", Q: "#3a9a3a", N: "#8a5a32" }, rows: [".ZZZZ.", "ZQNZQZ", ".ZZZZ."] } }),
    level: {
      obs: [["bb_tread", 240], ["bb_bell", 330], ["bb_tread", 480], ["bb_bell", 560], ["bb_plate", 720], ["bb_plate", 780]],
      target: "bb_scale", targetAt: 300, prop: "plate", propAt: 600, npcs: [],
      captions: [[30, "Mirror says: big."], [220, "Treadmill. Every day."], [460, "Lift. Lift. Lift."], [700, "Eat clean. Eat more."]]
    },
    obs: {
      bb_tread: { w: 22, h: 6, y: 0, vx: 0, tough: "whoa", draw(o, x, y, t) { A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(x - 1, A.G); A.ctx.lineTo(x + 23, A.G - 8); A.ctx.lineTo(x + 23, A.G - 5); A.ctx.lineTo(x + 2, A.G + 1); A.ctx.fill(); for (let i = 0; i < 6; i++) R("#8a8a8a", x + ((i * 4 + Math.floor(t * 20)) % 22), A.G - 1 - Math.round(((i * 4 + Math.floor(t * 20)) % 22) / 3), 2, 1); R(A.C.ink, x + 20, A.G - 20, 2, 14); } },
      bb_bell: { w: 12, h: 6, y: 0, vx: -50, draw(o, x, y) { R(A.C.ink, x, y, 4, 6); R(A.C.ink, x + 8, y, 4, 6); R(A.C.ink, x + 3, y + 2, 6, 2); R("#5a7ac8", x + 1, y + 1, 2, 4); R("#5a7ac8", x + 9, y + 1, 2, 4); } },
      bb_plate: { w: 12, h: 3, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 12, 3); R("#f4f4f2", x + 1, y + 1, 10, 1); R("#3a9a3a", x + 2, y, 3, 2); R("#e88a5a", x + 6, y, 3, 2); } }
    },
    targets: { bb_scale: { line: "Don't look at the number.", draw(tg, x) { R(A.C.ink, x - 7, G - 4, 14, 4); R("#e8e8e8", x - 6, G - 3, 12, 2); R(A.C.ink, x - 2, G - 3, 4, 1); } } },
    reset(S) { S.bb = { seen: {} }; },
    update(dt, S, p) { const b = S.bb; MIRRORS.forEach((m, i) => { if (!b.seen[i] && Math.abs(p.x - m) < 16) { b.seen[i] = 1; A.redSays(["...still fat.", "Getting there.", "Not enough.", "Wait. Am I tiny?"][i], 1.8); if (i === 3) A.showCaption("When is buff enough?"); } }); },
    bg(t, S) { R("#ecebe6", 0, 0, A.W, A.H); A.layer(.5, 8, (x, k) => R("#e2e0da", x + A.hash(k, 1) * 6, A.hash(k, 2) * 180, 1, 1)); R("#d8d6d0", 0, G + 1, A.W, 1);
      MIRRORS.forEach((m, i) => { const x = sx(A, m + 18); if (x < -30 || x > A.W + 30) return; R(A.C.ink, x - 13, G - 52, 26, 52); R("#f8f8f4", x - 12, G - 51, 24, 51);
        const im = A.NS[S.p.face > 0 ? "b5_standL" : "b5_stand"], sc = [1.9, 1.5, 1.2, .55][i], w = Math.round(im.width * sc), h = Math.round(im.height * (i === 3 ? 1.05 : 1));
        A.ctx.save(); A.ctx.beginPath(); A.ctx.rect(x - 12, G - 51, 24, 51); A.ctx.clip(); A.ctx.imageSmoothingEnabled = false; A.ctx.drawImage(im, x - w / 2, G - h - 2, w, h); A.ctx.restore(); }); },
    fg(t, S) { const buff = A.clamp(S.p.x / 880, 0, 1), m = Math.round(buff * 5); if (m < 1) return;
      onHead(A, (x, top, face) => { if (S.p.duck) return; R(A.C.ink, x - 5 - m, top + 11, 10 + m * 2, 6); R("#E8271A", x - 4 - m, top + 12, 8 + m * 2, 4); R("#B21A10", x - 1, top + 13, 1, 3);
        [x - 6 - m, x + 4 + m].forEach(ax => { R(A.C.ink, ax - Math.floor(m / 2), top + 13, 3 + m, 8); R("#E8271A", ax + 1 - Math.floor(m / 2), top + 14, 1 + m, 6); }); }); }
  };
};
})();

/* ======================= batch 6 ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx, confetti } = W.__shared;
const { arm, reds, drawWalker, follow, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke } = W.__shared2;
const flash = (A, a, c = "#ffffff") => { if (a <= 0) return; A.ctx.globalAlpha = Math.min(1, a); A.R(c, 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; };
const clouds = (A, c = "#f4f4f2", f = .06) => A.layer(f, 110, (x, k) => { puff(A, x + 30, 18 + (k % 3) * 10, 9, c, .95); puff(A, x + 44, 20 + (k % 3) * 10, 7, c, .95); puff(A, x + 20, 22 + (k % 3) * 10, 6, c, .95); });
const grad = (A, stops, y0 = 0, y1 = A.H) => { const g = A.ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); A.ctx.fillStyle = g; A.ctx.fillRect(0, y0, A.W, y1 - y0); };
const ell = (A, c, x, y, rx, ry, rot = 0) => { A.ctx.fillStyle = c; A.ctx.beginPath(); A.ctx.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), rot, 0, 7); A.ctx.fill(); };
const oell = (A, c, x, y, rx, ry, rot = 0) => { ell(A, A.C.ink, x, y, rx + 1, ry + 1, rot); ell(A, c, x, y, rx, ry, rot); };
const lock = (p, x) => { p.x = x; p.vy = 0; p.y = 0; p.inv = Math.max(p.inv, .3); };
const text = (A, s, x, y, c, size = 6) => { A.ctx.font = `bold ${size}px monospace`; A.ctx.textAlign = "center"; A.ctx.fillStyle = c; A.ctx.fillText(s, x, y); };
const alien = (A, x, base, t, k, s = 1, pose = 0) => { const b = Math.round(Math.sin(t * 2 + k) * 1), G = base;
  oell(A, "#7aa88a", x, G - 22 * s + b, 6 * s, 12 * s); oell(A, "#7aa88a", x, G - 40 * s + b, 6 * s, 7 * s); A.R(A.C.ink, x - 3 * s, G - 41 * s + b, 2, 2); A.R(A.C.ink, x + 2 * s, G - 41 * s + b, 2, 2); A.R("#4a6a5a", x - 2 * s, G - 36 * s + b, 4 * s, 1);
  A.R(A.C.ink, x - 4 * s, G - 11 * s, 3, 11 * s); A.R("#7aa88a", x - 3 * s, G - 11 * s, 1, 11 * s); A.R(A.C.ink, x + 2 * s, G - 11 * s, 3, 11 * s); A.R("#7aa88a", x + 3 * s, G - 11 * s, 1, 11 * s);
  [-1, 1].forEach(d => { A.R(A.C.ink, x + d * 6 * s - 1, G - 30 * s + b, 3, 16 * s); A.R("#7aa88a", x + d * 6 * s, G - 30 * s + b, 1, 16 * s); }); };
// the gut buddy: a pink worm-man tied to Red's belly by his own intestine
const gutBuddy = (A, S, g, s, t, extra) => { const R = A.R, G = A.G, x = sx(A, g.x), hop = g.moving ? Math.abs(Math.sin(g.d / 4)) * 2 : 0, top = G - 22 * s - hop;
  const r = A.red, bx = r.x + (r.face > 0 ? -1 : 1), by = r.top + 19; A.ctx.strokeStyle = A.C.ink; A.ctx.lineWidth = 3; A.ctx.beginPath(); A.ctx.moveTo(bx, by); A.ctx.quadraticCurveTo((bx + x) / 2, G + 2, x, top + 12 * s); A.ctx.stroke(); A.ctx.strokeStyle = "#f0a8a8"; A.ctx.lineWidth = 1.5; A.ctx.stroke();
  oell(A, "#f0b8b0", x, top + 12 * s, 5 * s, 9 * s); oell(A, "#f0b8b0", x, top + 2 * s, 4 * s, 4 * s); R(A.C.ink, x - 2 * s, top + 1 * s, 1, 1); R(A.C.ink, x + 1 * s, top + 1 * s, 1, 1); R("#c88080", x - 1 * s, top + 4 * s, 2 * s, 1);
  R(A.C.ink, x - 3 * s, G - 3 - hop, 2, 3 + hop); R(A.C.ink, x + 2 * s, G - 3 - hop, 2, 3 + hop); for (let i = 0; i < 3; i++) R("#d89090", x - 3 * s + i * 2 * s, top + 8 * s + i * 3 * s, 3 * s, 1); if (extra) extra(x, top); };

/* MAN CREAM: down the pipe, out to the aliens, back to the farm, into the machine. */
W["man-cream"] = A => {
  const R = A.R, G = A.G, BEACH = 260, FARM = 520, VEND = 840;
  const kneel = { R: "#E8271A", r: "#B21A10" };
  return {
    sprites: Object.assign(reds(A, "kn", kneel), { cup6: { pal: { P: "#b070e0", Z: "#f4f4f2" }, rows: ["ZPPZ", "ZPPZ", "ZZZZ", ".ZZ."] } }),
    level: {
      obs: [["mc_goo", 160], ["mc_goo", 220], ["bird", 340], ["mc_goo", 420], ["mc_hose", 600], ["mc_hose", 700], ["mc_goo", 780]],
      target: "rock", targetAt: 460, prop: "cup6", propAt: 120, npcs: [],
      captions: [[30, "Down the pipe it goes."], [BEACH + 10, "Where does it end up?"], [FARM + 10, "The farm. Keep your head down."], [VEND - 60, "...for sale."]]
    },
    obs: {
      mc_goo: { w: 12, h: 2, y: 0, vx: 0, tough: "ew, goo", draw(o, x, y, t) { ell(A, "#b070e0", x + 6, A.G, 7, 2); R("#e0b0ff", x + 2 + Math.floor(t * 2) % 8, A.G - 1, 2, 1); } },
      mc_hose: { w: 16, h: 3, y: 0, vx: 0, draw(o, x, y, t) { R(A.C.ink, x, A.G - 3, 16, 3); R("#c8c8c8", x, A.G - 2, 16, 1); R("#b070e0", x + ((Math.floor(t * 20)) % 14), A.G - 2, 2, 1); } }
    },
    reset(S) { S.mc = {}; },
    update(dt, S, p) { if (p.x > VEND - 30 && !S.mc.v) { S.mc.v = 1; A.showCaption("Man cream."); A.redSays("...two please.", 2); } },
    bg(t, S) {
      const x = S.p.x;
      if (x < BEACH) { R("#0a0a0a", 0, 0, A.W, A.H); R("#e8e8e8", 0, 0, A.W, 18); const px = sx(A, 120, .8); R(A.C.ink, px - 12, 18, 24, G - 18); grad(A, ["#c8c8c8", "#8a8a8a"], 0, 0); R("#b8b8b8", px - 11, 18, 22, G - 18); R("#e8e8e8", px - 9, 18, 4, G - 18);
        for (let i = 0; i < 8; i++) R("#b070e0", px - 8 + (i * 5) % 16, ((t * 40 + i * 23) % (G - 18)) + 18, 3 + (i % 2) * 2, 5); R(A.C.ink, px - 12, G - 24, 220, 24); R("#b8b8b8", px - 11, G - 23, 218, 22); for (let i = 0; i < 14; i++) R("#b070e0", px + ((t * 60 + i * 17) % 210) - 11, G - 20 + (i % 3) * 5, 5, 2); R("#0a0a0a", 0, G, A.W, 30); }
      else if (x < FARM) { R("#8a6a9a", 0, 0, A.W, 70); R("#3a5a9a", 0, 70, A.W, 12); R("#d8c870", 0, 82, A.W, G - 82); R("#d8c870", 0, G, A.W, 30);
        const ux = sx(A, 470, .3); oell(A, "#c8c8c8", ux, 62, 14, 5); disc(A, "#9fe0ff", ux, 58, 5);
        [BEACH + 60, BEACH + 110, BEACH + 170].forEach((ax, i) => { const s = sx(A, ax); alien(A, s, G, t, i); if (i === 1) { R(A.C.ink, s + 6, G - 26, 30, 2); R("#b070e0", s + 6 + Math.floor(t * 10) % 28, G - 26, 2, 1); } }); }
      else if (x < VEND - 60) { R("#5a5a5a", 0, 0, A.W, A.H); for (let j = 0; j < 4; j++) { const y = 30 + j * 32; R("#7a7a7a", 0, y + 16, A.W, 3); A.layer(.3 + j * .15, 26, (xx, k) => { const im = A.NS[(k + j) % 2 ? "kn_stand" : "kn_standL"]; A.ctx.drawImage(im, xx, y + 16 - 22, 12, 22); R("#b070e0", xx + 6, y + 14, 2, 2); }); }
        alien(A, sx(A, FARM + 160), G, t, 1, 1.3); R(A.C.ink, sx(A, FARM + 140), G - 34, 26, 3); R("#f3d23b", sx(A, FARM + 141), G - 33, 24, 1); R("#4a4a4a", 0, G, A.W, 30); }
      else { grad(A, ["#c84a8a", "#f08a5a"], 0, 110); A.layer(.3, 40, (xx, k) => { R("#6a4a6a", xx, 60 + (k % 3) * 10, 20, 50); disc(A, "#6a4a6a", xx + 10, 60 + (k % 3) * 10, 10); }); R("#4a4a4a", 0, 110, A.W, A.H);
        const vx = sx(A, VEND + 20); R(A.C.ink, vx - 21, 50, 42, G - 50); R("#e8d8f0", vx - 20, 51, 40, G - 51); R("#9fd0ee", vx - 16, 66, 28, 60); for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) R("#b070e0", vx - 14 + i * 7, 69 + j * 11, 4, 7);
        text(A, "MAN·VOM", vx, 61, "#b070e0", 7); R("#b070e0", vx + 14, 50, 6, 4); R("#b070e0", vx + 17, 54, 2, 6);
        R(A.C.ink, vx - 46, 106, 18, 44); R("#3a5a3a", vx - 45, 107, 16, 43); text(A, "FREE", vx - 37, 120, "#7CFC6A", 4); text(A, "VOMS", vx - 37, 126, "#7CFC6A", 4); }
    },
    fg(t, S) { if (S.p.x > FARM && S.p.x < VEND - 60 && Math.floor(t * 2) % 2) onHead(A, (x, top) => R("#b070e0", x + 2, top + 9, 2, 3)); }
  };
};

/* MOTHER GIRTH: sunbathing on the hill, money in the air. Then the cloud sits down. */
W["mother-girth"] = A => {
  const R = A.R, G = A.G, SIT = 700;
  return {
    sprites: { towel: { pal: { Y: "#f3d23b" }, rows: ["YYYYYY", "YYYYYY"] } },
    level: {
      obs: [["cash", 180], ["cash", 260], ["bird", 320], ["cash", 400], ["cash", 470], ["bird", 560], ["cash", 620]],
      target: "bush", targetAt: 440, prop: "towel", propAt: 140, npcs: [],
      captions: [[30, "Sun's out. Money's falling."], [300, "Nothing could ruin this."], [SIT - 60, "Is that cloud... lowering?"]]
    },
    reset(S) { S.mg = { sit: -1 }; },
    update(dt, S, p) {
      const m = S.mg; if (m.sit < 0 && p.x > SIT && p.x < SIT + 50) { m.sit = 0; A.redSays("Ahh, the life.", 1.4); }
      if (m.sit >= 0 && m.sit < 9) { const b = m.sit; m.sit += dt; if (m.sit < 2.4) lock(p, SIT);
        if (b < 1.6 && m.sit >= 1.6) { crowdText(A, S, "FWUMP", SIT, 60); A.reskin(rows => rows.filter((r, j) => j < 9 || j % 3 === 0)); }
        if (b < 2.4 && m.sit >= 2.4) { A.showCaption("Mother girth."); A.redSays("...ow.", 1.6); } }
    },
    bg(t, S) {
      R("#8ad8ee", 0, 0, A.W, A.H); clouds(A); A.layer(.2, 130, (x) => { A.ctx.fillStyle = "#3a9a3a"; A.ctx.beginPath(); A.ctx.ellipse(x + 65, 120, 90, 40, 0, Math.PI, 0); A.ctx.fill(); });
      R("#4aaa4a", 0, 110, A.W, G - 110); A.layer(.5, 9, (x, k) => R("#3a9a3a", x + A.hash(k, 1) * 6, 114 + A.hash(k, 2) * 30, 3, 1));
      R("#4aaa4a", 0, G, A.W, 30); A.layer(1, 6, (x, k) => R("#3a9a3a", x, G + 2 + (k % 5) * 5, 2, 1));
      const tx = sx(A, SIT); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(tx - 18, G + 4); A.ctx.lineTo(tx + 16, G + 4); A.ctx.lineTo(tx + 22, G - 2); A.ctx.lineTo(tx - 12, G - 2); A.ctx.fill(); A.ctx.fillStyle = "#f3d23b"; A.ctx.beginPath(); A.ctx.moveTo(tx - 16, G + 3); A.ctx.lineTo(tx + 15, G + 3); A.ctx.lineTo(tx + 20, G - 1); A.ctx.lineTo(tx - 11, G - 1); A.ctx.fill();
    },
    fg(t, S) {
      const m = S.mg; if (m.sit < 0 && S.p.x < SIT - 200) return; const u = m.sit < 0 ? 0 : m.sit < 3.2 ? Math.min(1, m.sit / 1.6) : Math.max(0, 1 - (m.sit - 3.2) / 1.2), x = sx(A, SIT) + 40, y = -120 + u * (G + 30);
      const bump = (cx, cy, rx, ry) => { oell(A, "#ececf0", cx, cy, rx, ry); for (let i = 0; i < 9; i++) { const a = i / 9 * 7; A.ctx.strokeStyle = "#c8c8d0"; A.ctx.beginPath(); A.ctx.arc(cx + Math.cos(a) * rx * .6, cy + Math.sin(a) * ry * .6, 4, Math.PI, 0); A.ctx.stroke(); } };
      bump(x - 30, y, 46, 56); bump(x + 40, y + 6, 46, 56); R("#c8c8d0", x + 4, y + 14, 2, 40); bump(x + 70, y - 70, 30, 60);
      if (m.sit >= 1.6 && m.sit < 1.9) flash(A, 1 - (m.sit - 1.6) / .3, "#ffffff");
      txtFx(A, S);
    }
  };
};

/* GUT FOLLOWER: his gut walks out on its own. Into the bank. Into the motel. Into trouble. */
W["gut-follower"] = A => {
  const R = A.R, G = A.G, BANK = [240, 520], ROB = 400, MOTEL = 560, SWAT = 820;
  return {
    sprites: { knife: { pal: { G: "#e8e8e8", N: "#6a4224" }, rows: ["GGGGNN"] } },
    level: {
      obs: [["cash", 140], ["bird", 200], ["cash", 320], ["mc_coin", 460], ["cash", 640], ["gf_laser", 760]],
      target: "lamp", targetAt: 660, prop: "knife", propAt: 110, npcs: [],
      captions: [[30, "Trust your gut. It's walking."], [BANK[0] + 10, "The bank. Gut's got a plan."], [MOTEL + 10, "Lay low at the Inn-n-Out."]]
    },
    obs: {
      mc_coin: { w: 5, h: 5, y: 0, vx: 0, draw(o, x, y, t) { R(A.C.ink, x, y, 5, 5); R("#f3d23b", x + 1, y + 1, 3, 3); } },
      gf_laser: { w: 2, h: 40, y: 0, vx: 0, draw(o, x, y, t) { if (A.S.gf.swat < 0) return; A.ctx.globalAlpha = .7; R("#7CFC6A", x, A.G - 60, 1, 60); A.ctx.globalAlpha = 1; } }
    },
    reset(S) { S.gf = { g: { x: 20, y: 0, d: 0, face: 1, moving: false }, rob: -1, swat: -1, cash: [] }; },
    update(dt, S, p) {
      const g = S.gf; follow(g.g, p.x - 26 * (p.face || 1), 120, dt); if (Math.abs(g.g.x - p.x) > 80) g.g.x = p.x - 40;
      if (g.rob < 0 && p.x > ROB && p.x < ROB + 50) { g.rob = 0; A.say("Empty the drawer.", g.g.x, 40, 2); }
      if (g.rob >= 0 && g.rob < 9) { const b = g.rob; g.rob += dt; if (g.rob < 1.4) lock(p, ROB); if (b < 1.4 && g.rob >= 1.4) { for (let i = 0; i < 14; i++) g.cash.push({ x: ROB + 60, y: 40, vx: -40 - Math.random() * 60, vy: 40 + Math.random() * 40 }); A.redSays("Gut feeling!", 1.4); } }
      for (const c of g.cash) { c.vy -= 120 * dt; c.x += c.vx * dt; c.y = Math.max(0, c.y + c.vy * dt); if (c.y === 0) c.vx *= .9; }
      if (g.swat < 0 && p.x > SWAT - 30 && p.x < SWAT + 40) { g.swat = 0; crowdText(A, S, "FREEZE!", SWAT + 40, 60); } if (g.swat >= 0) { const b = g.swat; g.swat += dt; if (b < 1 && g.swat >= 1) A.showCaption("Gut follower."); }
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < BANK[0]) { R("#f3e84a", 0, 0, A.W, 60); R("#3a8a3a", 0, 60, A.W, 30); R("#6a6a6a", 0, 90, A.W, G - 90); R("#5a5a5a", 0, G, A.W, 30);
        const bx = sx(A, BANK[0] + 10); R(A.C.ink, bx - 1, 20, 140, G - 20); R("#8a8a8a", bx, 21, 140, G - 21); R(A.C.ink, bx + 14, 90, 20, 60); R("#3a3a3a", bx + 15, 91, 18, 59); oell(A, "#f4f4f2", bx + 50, 40, 16, 10); R("#f3d23b", bx + 44, 36, 12, 8); }
      else if (x < BANK[1]) { R("#b8b8b0", 0, 0, A.W, 100); R("#d8d8d0", 0, 0, A.W, 10); R("#8a5a32", 0, 100, A.W, G - 100); R("#6a4224", 0, G, A.W, 30);
        A.layer(.6, 90, (xx) => { R(A.C.ink, xx + 20, 30, 30, 40); R("#f3d23b", xx + 21, 31, 28, 38); text(A, "$", xx + 35, 58, A.C.ink, 22); });
        const tx = sx(A, ROB + 60); R(A.C.ink, tx - 40, 100, 90, 4); oell(A, "#5a8ad6", tx, 92, 14, 10); oell(A, "#f0b0a0", tx, 72, 9, 10); R("#e8a23a", tx - 10, 62, 20, 6); R(A.C.ink, tx - 4, 70, 2, 2); R(A.C.ink, tx + 3, 70, 2, 2); R(A.C.ink, tx - 2, 77, 4, 2);
        R(A.C.ink, 0, 104, A.W, 2); }
      else { R("#0a0a14", 0, 0, A.W, A.H); grad(A, ["#0a0a14", "#8a1a1a"], 40, 100); A.layer(.3, 12, (xx, k) => { A.ctx.fillStyle = "#1a3a1a"; A.ctx.beginPath(); A.ctx.moveTo(xx, 100); A.ctx.lineTo(xx + 6, 80 - (k % 3) * 6); A.ctx.lineTo(xx + 12, 100); A.ctx.fill(); });
        const mx = sx(A, MOTEL + 120); R(A.C.ink, mx - 61, 80, 122, G - 80); R("#5a3a2a", mx - 60, 81, 120, G - 81); R("#3a2a1a", mx - 66, 76, 132, 6); for (let i = 0; i < 4; i++) { R(A.C.ink, mx - 50 + i * 28, 100, 14, 24); R(i === 3 ? "#f3d23b" : "#c87a2a", mx - 49 + i * 28, 101, 12, 22); }
        R(A.C.ink, mx - 30, 54, 60, 14); R("#2a1a14", mx - 29, 55, 58, 12); text(A, "INN-n-OUT", mx, 64, "#ffd28a", 8); R("#3a3a3a", 0, G, A.W, 30); A.layer(1, 26, xx => R("#f4f4f2", xx, G + 14, 1, 10));
        if (S.gf.swat >= 0) { const u = S.gf.swat; puff(A, sx(A, SWAT + 60), G - 20, 20 + u * 10, "#8a8a8a", .8); for (let i = 0; i < 5; i++) { A.ctx.strokeStyle = "#7CFC6A"; A.ctx.globalAlpha = .7; A.ctx.beginPath(); A.ctx.moveTo(sx(A, SWAT + 60), G - 30 + i * 4); A.ctx.lineTo(A.red.x + (i - 2) * 8, A.red.top + 10 + i * 3); A.ctx.stroke(); } A.ctx.globalAlpha = 1;
          [SWAT + 50, SWAT + 72].forEach((sw, i) => { const s = sx(A, sw); R(A.C.ink, s - 6, G - 30, 12, 30); R("#2a2a8a", s - 5, G - 29, 10, 29); disc(A, "#1a1a6a", s, G - 33, 6); R("#9fd0ee", s - 4, G - 34, 5, 2); R(A.C.ink, s - 14, G - 22 + i * 4, 10, 2); }); } }
    },
    mid(t, S) {
      const g = S.gf; gutBuddy(A, S, g.g, S.p.x > MOTEL ? 1.3 : 1, t, (x, top) => { if (g.rob >= 0 && g.rob < 3) { R(A.C.ink, x + 4, top + 10, 10, 2); R("#e8e8e8", x + 5, top + 10, 8, 1); } });
      for (const c of g.cash) { const x = sx(A, c.x); R(A.C.ink, x, A.G - Math.round(c.y) - 3, 6, 4); R("#5aa83a", x + 1, A.G - Math.round(c.y) - 2, 4, 2); }
    },
    fg(t, S) { txtFx(A, S); }
  };
};

/* WHEN A MERMAID GAVE ME PINKEYE: surf, dive, dance, shark. Back on the board, eye's pink. */
W["when-a-mermaid-gave-me-pinkeye"] = A => {
  const R = A.R, G = A.G, DIVE = 220, SHARK = 720, UP = 840, PINK = "#ff8ac0";
  const maid = (x, y, t, flip = 1) => { const s = Math.sin(t * 4); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(x - 4, y); A.ctx.quadraticCurveTo(x + flip * 14, y + 14 + s * 3, x + flip * 20, y + 22); A.ctx.lineTo(x + flip * 26, y + 26); A.ctx.lineTo(x + flip * 16, y + 26); A.ctx.quadraticCurveTo(x, y + 18, x + 4, y); A.ctx.fill();
    A.ctx.fillStyle = "#7ab05a"; A.ctx.beginPath(); A.ctx.moveTo(x - 3, y + 1); A.ctx.quadraticCurveTo(x + flip * 13, y + 14 + s * 3, x + flip * 19, y + 22); A.ctx.lineTo(x + flip * 24, y + 25); A.ctx.lineTo(x + flip * 17, y + 25); A.ctx.quadraticCurveTo(x + 1, y + 17, x + 3, y + 1); A.ctx.fill();
    oell(A, "#d080c0", x, y - 6, 4, 8); oell(A, "#d080c0", x, y - 17, 4, 4); R(A.C.ink, x - 5, y - 22, 10, 4); R(A.C.ink, x - 6 - Math.round(s * 2), y - 20, 3, 14); R(A.C.ink, x + 1, y - 18, 1, 1); R("#e8902a", x - 3, y - 8, 6, 2); };
  return {
    sprites: { board: { pal: { Y: "#f3d23b", B: "#2a48c8" }, rows: ["YYYYYYY", "BBBBBBB"] } },
    level: {
      obs: [["mm_bubble", 300], ["fish", 0], ["mm_jelly", 380], ["mm_bubble", 460], ["mm_jelly", 560], ["mm_bubble", 640]].filter(o => o[1]),
      target: "rock", targetAt: 500, prop: "board", propAt: 110, npcs: [],
      captions: [[30, "Hang ten."], [DIVE - 40, "Is that a mermaid?"], [DIVE + 60, "Dance with her."], [SHARK - 50, "Something big in the deep."]]
    },
    obs: {
      mm_bubble: { w: 5, h: 5, y: 0, vx: 0, draw(o, x, y, t) { const yy = A.G - 6 - ((t * 30 + o.x) % 80); A.ctx.strokeStyle = "#cfefff"; A.ctx.beginPath(); A.ctx.arc(x + 2, yy, 2, 0, 7); A.ctx.stroke(); o.y = A.G - yy - 2; } },
      mm_jelly: { w: 9, h: 9, y: 14, vx: -20, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 2 + o.x) * 4); R(A.C.ink, x, yy, 9, 5); R("#f0c8f0", x + 1, yy + 1, 7, 3); for (let i = 0; i < 3; i++) R("#f0c8f0", x + 1 + i * 3, yy + 5 + (i + Math.floor(t * 4)) % 2, 1, 4); } }
    },
    reset(S) { S.mm = { m: { x: DIVE, y: 0, d: 0, face: -1, moving: false }, eat: -1, pink: false }; },
    update(dt, S, p) {
      const m = S.mm; if (m.eat < 0 && p.x > DIVE) { follow(m.m, p.x + 16, 100, dt); }
      if (m.eat < 0 && p.x > SHARK && p.x < SHARK + 60) { m.eat = 0; A.redSays("NOOO!", 1.4); }
      if (m.eat >= 0 && m.eat < 9) { const b = m.eat; m.eat += dt; if (m.eat < 1.6) lock(p, SHARK); if (b < .8 && m.eat >= .8) { splash(S, m.m.x, 30, 30, "#8a1a1a"); crowdText(A, S, "CHOMP", m.m.x, 60); }
        if (b < 1.6 && m.eat >= 1.6) { m.pink = true; A.showCaption("When a mermaid gave me pinkeye."); } }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      const under = S.p.x > DIVE && S.p.x < UP;
      if (!under) { R("#6ac0e6", 0, 0, A.W, A.H); clouds(A); R("#3a9ad0", 0, 100, A.W, G - 100); A.layer(.6, 13, (x, k) => R("#9fe0f4", x + (Math.floor(t * 2 + k) % 4), 106 + (k % 6) * 7, 6, 1));
        const rx = sx(A, 120); oell(A, "#7a7a72", rx, G - 2, 26, 14); if (S.p.x < DIVE) maid(rx - 4, G - 26, t, 1);
        R("#3a9ad0", 0, G, A.W, 30); R(A.C.ink, 0, G, A.W, 1); R("#f3d23b", 0, G + 1, A.W, 8); R("#2a48c8", 0, G + 4, A.W, 3); R("#3a9ad0", 0, G + 10, A.W, 20); return; }
      grad(A, ["#3a8ab8", "#1a3a6a", "#0a1a3a"]); A.layer(.2, 60, (x, k) => { A.ctx.globalAlpha = .15; A.ctx.fillStyle = "#ffffff"; A.ctx.beginPath(); A.ctx.moveTo(x, 0); A.ctx.lineTo(x + 10, 0); A.ctx.lineTo(x + 40, G); A.ctx.lineTo(x + 20, G); A.ctx.fill(); A.ctx.globalAlpha = 1; });
      oell(A, "#c8a83a", 160, 10, 26, 3); A.layer(.4, 70, (x, k) => { if (k % 2) { R("#2a4a8a", x + 10, 80 + (k % 4) * 12, 10, 3); R("#2a4a8a", x + 20, 79 + (k % 4) * 12, 2, 5); } });
      R("#c8b880", 0, G, A.W, 30); A.layer(1, 11, (x, k) => R("#a8986a", x, G + 3 + (k % 5) * 5, 4, 1));
    },
    mid(t, S) {
      const m = S.mm; if (!(S.p.x > DIVE && S.p.x < UP)) return;
      if (m.eat < .8) maid(sx(A, m.m.x), G - 30 + Math.round(Math.sin(t * 3) * 4), t, -1); else if (m.eat < 3) { A.ctx.globalAlpha = Math.max(0, 1 - (m.eat - .8) / 2); puff(A, sx(A, m.m.x), G - 30, 20, "#8a2a1a", .8); A.ctx.globalAlpha = 1; }
      if (S.p.x > SHARK - 140 && m.eat < 2) { const u = m.eat < 0 ? 0 : Math.min(1, m.eat / .8), shx = lerp(sx(A, SHARK + 140), sx(A, m.m.x) + 10, u), shy = G - 36;
        oell(A, "#8a9aaa", shx + 20, shy, 30, 11); A.ctx.fillStyle = "#8a9aaa"; A.ctx.beginPath(); A.ctx.moveTo(shx + 20, shy - 10); A.ctx.lineTo(shx + 30, shy - 24); A.ctx.lineTo(shx + 34, shy - 8); A.ctx.fill(); A.ctx.beginPath(); A.ctx.moveTo(shx + 48, shy); A.ctx.lineTo(shx + 60, shy - 12); A.ctx.lineTo(shx + 60, shy + 12); A.ctx.fill();
        ell(A, "#e8e8f0", shx + 16, shy + 5, 22, 5); R(A.C.ink, shx + 2, shy - 4, 2, 2); ell(A, "#6a1a1a", shx - 6, shy + 3, 6, 4 + u * 3); for (let i = 0; i < 4; i++) R("#ffffff", shx - 10 + i * 3, shy, 1, 2); }
    },
    fg(t, S) { const m = S.mm; if (m.pink) onHead(A, (x, top, face) => { R(PINK, face > 0 ? x : x - 3, top + 3, 4, 4); R("#ffffff", face > 0 ? x + 1 : x - 2, top + 4, 1, 1); });
      if (m.eat > 1.6 && m.eat < 2.6) { const a = Math.min(1, (m.eat - 1.6) * 3, (2.6 - m.eat) * 3); A.ctx.globalAlpha = a; R("#a050a0", 0, 0, A.W, A.H); oell(A, "#f4e8f0", 160, 90, 120, 60); disc(A, A.C.ink, 160, 90, 41); disc(A, "#6a3a2a", 160, 90, 40); disc(A, A.C.ink, 160, 90, 14);
        A.ctx.save(); A.ctx.beginPath(); A.ctx.arc(160, 90, 40, -Math.PI / 2, Math.PI / 2); A.ctx.closePath(); A.ctx.clip(); R("#5a8ab8", 160, 50, 40, 80); oell(A, "#8a9aaa", 182, 92, 18, 8); R(A.C.ink, 170, 88, 2, 2); A.ctx.restore();
        for (let i = 0; i < 24; i++) { const a = Math.PI + i / 23 * Math.PI; R(A.C.ink, 160 + Math.cos(a) * 120, 90 + Math.sin(a) * 60 - 6, 2, 8); } A.ctx.globalAlpha = 1; }
      txtFx(A, S); dropFx(A, S); }
  };
};

/* MONEY BAD: the boardroom says money bad. Red says nothing, then jumps out the window. */
W["money-bad"] = A => {
  const R = A.R, G = A.G, LEAP = 620, OUT = 700;
  const suit = (x, t, k) => { R(A.C.ink, x - 8, G - 26, 16, 26); R("#2a3a2a", x - 7, G - 25, 14, 25); R("#f4f4f2", x - 2, G - 25, 4, 6); R("#E8271A", x - 1, G - 24, 2, 5); oell(A, "#E8271A", x, G - 32, 6, 6); R(A.C.ink, x - 6, G - 38, 12, 4); };
  return {
    sprites: { tie: { pal: { Q: "#3a9a3a" }, rows: ["QQQ", ".Q.", "QQQ", "QQQ", ".Q."] } },
    level: {
      obs: [["mb_chair", 200], ["cash", 260], ["mb_chair", 340], ["cash", 420], ["mb_chair", 500], ["cash", 780]],
      target: "mb_shred", targetAt: 460, prop: "tie", propAt: 110, npcs: [],
      captions: [[30, "Quarterly meeting."], [180, "$ = 👎"], [LEAP - 60, "Then what's it all for?"]]
    },
    obs: { mb_chair: { w: 12, h: 12, y: 0, vx: -40, draw(o, x, y, t) { R(A.C.ink, x, y + 2, 12, 6); R("#2a5a2a", x + 1, y + 3, 10, 4); R(A.C.ink, x + 1, y - 6, 3, 10); R("#2a5a2a", x + 2, y - 5, 1, 8); R(A.C.ink, x + 5, y + 8, 2, 4); R(A.C.ink, x + 1, y + 11, 10, 1); } } },
    targets: { mb_shred: { line: "Shredded.", draw(tg, x) { R(A.C.ink, x - 6, G - 14, 12, 14); R("#5a5a5a", x - 5, G - 13, 10, 13); R("#f4f4f2", x - 3, G - 16, 6, 3); for (let i = 0; i < 4; i++) R("#f4f4f2", x - 4 + i * 2, G - 4, 1, 4); } } },
    reset(S) { S.mb = { leap: -1 }; },
    update(dt, S, p) { const m = S.mb; if (m.leap < 0 && p.x > LEAP && p.x < LEAP + 40) { m.leap = 0; p.vy = 260; p.onG = false; A.redSays("Money bad!", 1.4); } if (m.leap >= 0) { const b = m.leap; m.leap += dt; if (b < .6 && m.leap >= .6) crowdText(A, S, "CRASH", OUT, 80); if (b < 2 && m.leap >= 2) A.showCaption("Money bad."); } },
    bg(t, S) {
      const ox = sx(A, OUT);
      R("#6a5a4a", 0, 0, A.W, A.H); grad(A, ["#3a3a3a", "#6a5a4a"], 0, 60);
      const sc = sx(A, 200, .6); R(A.C.ink, sc - 41, 20, 82, 50); R("#f4f4f2", sc - 40, 21, 80, 48); text(A, "$ = ", sc - 10, 52, A.C.ink, 18); R("#f3d23b", sc + 16, 36, 10, 10); R("#f3d23b", sc + 18, 46, 6, 8);
      R("#4a3a2a", 0, 120, A.W, G - 120); A.layer(.7, 60, (x, k) => suit(x + 20, t, k)); R("#a8763a", 0, G - 14, A.W, 14); R("#c8925a", 0, G - 14, A.W, 2);
      R("#5a4a3a", 0, G, A.W, 30);
      if (ox < A.W) { R("#7ac0f0", ox, 0, A.W - ox, A.H); A.ctx.save(); A.ctx.beginPath(); A.ctx.rect(ox, 0, A.W - ox, A.H); A.ctx.clip(); A.layer(.3, 70, (x, k) => { puff(A, x + 30, 40 + (k % 3) * 30, 14, "#f4f4f2", .9); puff(A, x + 50, 44 + (k % 3) * 30, 10, "#f4f4f2", .9); }); A.ctx.restore();
        R(A.C.ink, ox - 4, 0, 4, A.H); if (S.mb.leap >= .6) for (let i = 0; i < 12; i++) R("#6a5a4a", ox + 2 + (i * 7) % 20, 40 + (i * 13) % 90 + Math.min(80, (S.mb.leap - .6) * 60), 4, 3); }
    },
    fg(t, S) { onHead(A, (x, top, face) => A.ctx.drawImage(A.NS.tie, x - (face > 0 ? 0 : 3), top + 10)); txtFx(A, S); }
  };
};

/* STAY A STRAY: running with the pack. Caught. Adopted. The yard's nice, but the street calls. */
W["stay-a-stray"] = A => {
  const R = A.R, G = A.G, NET = 420, HOME = 470, CALL = 820;
  const dog = (x, t, k, face = -1, c = "#d8a85a") => { const b = Math.floor(t * 8 + k) % 2; oell(A, c, x, G - 7, 8, 4); oell(A, c, x + face * 8, G - 11, 4, 3); R(c, x + face * 10, G - 15, 2, 3); R(A.C.ink, x + face * 9, G - 12, 1, 1);
    R(A.C.ink, x - 6, G - 4, 2, 4 - b); R(A.C.ink, x + 5, G - 4, 2, 4 - b); R(A.C.ink, x - 2, G - 4, 2, 3 + b); R(c, x - face * 9, G - 10 - b, 3, 2); };
  return {
    sprites: { collar: { pal: { Q: "#E8271A", Y: "#f3d23b" }, rows: ["QQQQQ", "..Y.."] } },
    level: {
      obs: [["rat", 200], ["sa_can", 280], ["rat", 360], ["sa_ball", 560], ["sa_ball", 660], ["sa_ball", 740]],
      target: "rock", targetAt: 300, prop: "collar", propAt: 610, npcs: [],
      captions: [[30, "Running with the pack."], [NET - 60, "Uh oh. Dog catcher."], [HOME + 40, "New home. Nice yard."], [CALL - 40, "...the street's calling."]]
    },
    obs: {
      sa_can: { w: 10, h: 12, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 10, 12); R("#7a7a7a", x + 1, y + 2, 8, 10); R("#9a9a9a", x - 1, y, 12, 2); } },
      sa_ball: { w: 4, h: 4, y: 0, vx: -110, draw(o, x, y, t) { const yy = y + Math.round(Math.abs(Math.sin(t * 6 + o.x)) * 10); R(A.C.ink, x, yy, 4, 4); R("#f4f4f2", x + 1, yy + 1, 2, 2); R("#E8271A", x + 1, yy + 1, 1, 1); } }
    },
    reset(S) { S.sa = { net: -1 }; },
    update(dt, S, p) { const s = S.sa; if (s.net < 0 && p.x > NET && p.x < HOME) { s.net = 0; crowdText(A, S, "SWOOP", NET, 50); }
      if (s.net >= 0 && s.net < 9) { const b = s.net; s.net += dt; if (s.net < 1.6) lock(p, NET); if (b < 1.6 && s.net >= 1.6) { p.x = HOME + 20; } }
      if (p.x > CALL && !s.c) { s.c = 1; A.showCaption("Stay a stray."); A.redSays("Bark bark. Bye, dad.", 2); } },
    bg(t, S) {
      const x = S.p.x;
      if (x < HOME) { R("#3a3a40", 0, 0, A.W, A.H); grad(A, ["#1a1a20", "#4a4a50"], 0, 110); A.layer(.3, 60, (xx, k) => R("#2a2a30", xx, 40 + (k % 3) * 10, 40, 80)); A.layer(.5, 80, (xx) => { R("#5a5a5a", xx + 10, 40, 2, 80); A.ctx.globalAlpha = .25; disc(A, "#fff4c0", xx + 11, 40, 16); A.ctx.globalAlpha = 1; });
        R("#4a4a50", 0, 110, A.W, G - 110); R("#3a3a3a", 0, G, A.W, 30); A.layer(1, 40, xx => R("#f3d23b", xx, G + 14, 10, 2));
        if (S.p.x < NET) [-30, -46, -60].forEach((d, i) => dog(A.red.x + d, t, i, 1, ["#d8a85a", "#b88a4a", "#c8985a"][i]));
        const cx = sx(A, NET + 40); R(A.C.ink, cx - 9, G - 34, 18, 34); R("#2a3a8a", cx - 8, G - 33, 16, 20); R("#3a3a6a", cx - 8, G - 13, 16, 13); oell(A, "#E8271A", cx, G - 40, 7, 7); R("#2a3a8a", cx - 8, G - 47, 16, 4);
        const sw = S.sa.net >= 0 ? Math.min(1, S.sa.net * 3) : 0, ang = -1.2 + sw * 1.6; A.ctx.strokeStyle = "#8a5a32"; A.ctx.lineWidth = 2; A.ctx.beginPath(); A.ctx.moveTo(cx - 6, G - 26); const nx = cx - 6 + Math.cos(Math.PI + ang) * 40, ny = G - 26 + Math.sin(Math.PI + ang) * 40; A.ctx.lineTo(nx, ny); A.ctx.stroke(); A.ctx.strokeStyle = "#f4f4f2"; A.ctx.lineWidth = 1; A.ctx.beginPath(); A.ctx.arc(nx, ny + 6, 8, 0, 7); A.ctx.stroke();
        if (sw >= 1) { A.ctx.globalAlpha = .7; for (let i = 0; i < 5; i++) R("#f4f4f2", A.red.x - 8 + i * 4, A.red.top, 1, 34); A.ctx.globalAlpha = 1; } }
      else { R("#e8a0d8", 0, 0, A.W, 80); R("#3aa83a", 0, 80, A.W, G - 80); R("#3aa83a", 0, G, A.W, 30); A.layer(1, 6, (xx, k) => R("#2a982a", xx, G + 2 + (k % 5) * 5, 2, 1));
        const hx = sx(A, HOME + 80, .6); R(A.C.ink, hx - 51, 60, 102, 50); R("#8a4a2a", hx - 50, 61, 100, 49); A.ctx.fillStyle = "#5a2a1a"; A.ctx.beginPath(); A.ctx.moveTo(hx - 60, 62); A.ctx.lineTo(hx, 36); A.ctx.lineTo(hx + 60, 62); A.ctx.fill(); R("#E8271A", hx + 26, 36, 8, 14); for (let i = 0; i < 3; i++) { R(A.C.ink, hx - 40 + i * 30, 76, 16, 12); R("#9fd0ee", hx - 39 + i * 30, 77, 14, 10); }
        const tr = sx(A, HOME + 150, .8); R(A.C.ink, tr - 24, 96, 48, 14); R("#e8c83a", tr - 23, 97, 46, 12); disc(A, A.C.ink, tr - 14, 112, 5); disc(A, A.C.ink, tr + 14, 112, 5);
        const dx = sx(A, CALL + 70); A.ctx.globalAlpha = .9; dog(dx, t, 1, -1); dog(dx + 22, t, 2, -1, "#b88a4a"); A.ctx.globalAlpha = 1; }
    },
    fg(t, S) { if (S.p.x > HOME && S.p.x < CALL) onHead(A, (x, top) => { R("#E8271A", x - 3, top + 10, 7, 2); R("#f3d23b", x, top + 12, 1, 1); }); txtFx(A, S); }
  };
};

/* FOLLOW YOUR GUT PT. 2: lockup. The gut's bigger now, and he's got a shank. Riot, then the wall. */
W["follow-your-gut-pt-2"] = A => {
  const R = A.R, G = A.G, RIOT = 560, WALL = 760;
  const jump = rows => rows.map((r, j) => j >= 11 ? r.replace(/[RW]/g, "D").replace(/[rw]/g, "d") : r);
  return {
    sprites: { tray: { pal: { G: "#c8c8c8", Y: "#f3d23b", Q: "#3a9a3a" }, rows: ["GGGGGG", "GYGQGG", "GGGGGG"] } },
    level: {
      obs: [["fy_guard", 200], ["fy_tray", 280], ["fy_guard", 380], ["fy_tray", 460], ["fy_laser", 620], ["fy_laser", 680]],
      target: "fy_toilet", targetAt: 140, prop: "tray", propAt: 300, npcs: [],
      captions: [[30, "Inside. The gut's been working out."], [300, "Lunch. Watch your back."], [RIOT, "RIOT!"], [WALL - 30, "Over the wall. Follow your gut."]]
    },
    obs: {
      fy_guard: { w: 10, h: 30, y: 0, vx: -30, tough: "HEY!", draw(o, x, y, t) { const b = Math.floor(t * 8) % 2; R(A.C.ink, x, y + 8, 10, 22); R("#2a3a8a", x + 1, y + 9, 8, 13); R("#1a2a5a", x + 1, y + 22, 8, 8 - b); disc(A, "#c87a5a", x + 5, y + 4, 5); R("#1a2a5a", x, y - 2, 10, 3); } },
      fy_tray: { w: 10, h: 3, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 10, 3); R("#c8c8c8", x + 1, y + 1, 8, 1); R("#f3d23b", x + 2, y, 2, 1); R("#3a9a3a", x + 6, y, 2, 1); } },
      fy_laser: { w: 2, h: 60, y: 0, vx: 0, tough: "zap", draw(o, x, y, t) { if (Math.floor(t * 2 + o.x) % 3 === 0) { o.off = true; return; } o.off = false; A.ctx.globalAlpha = .8; R("#7CFC6A", x, A.G - 60, 1, 60); A.ctx.globalAlpha = 1; } }
    },
    targets: { fy_toilet: { line: "Steel toilet. Cozy.", draw(tg, x) { R(A.C.ink, x - 6, G - 12, 12, 12); R("#c8c8c8", x - 5, G - 11, 10, 11); R(A.C.ink, x - 5, G - 18, 10, 6); R("#a8a8a8", x - 4, G - 17, 8, 4); } } },
    reset(S) { S.fy = { g: { x: 20, y: 0, d: 0, face: 1, moving: false }, dressed: false, riot: -1 }; },
    update(dt, S, p) {
      const f = S.fy; if (!f.dressed) { f.dressed = true; A.reskin(jump, { D: "#2a4ad0", d: "#1a3aa0" }); }
      follow(f.g, p.x - 30 * (p.face || 1), 120, dt); if (Math.abs(f.g.x - p.x) > 90) f.g.x = p.x - 40;
      if (f.riot < 0 && p.x > RIOT && p.x < RIOT + 80) { f.riot = 0; A.say("Now.", f.g.x, 46, 1.4); } if (f.riot >= 0) f.riot += dt;
      if (p.x > WALL + 60 && !f.out) { f.out = 1; A.showCaption("Follow your gut, pt. 2."); A.redSays("Free!", 1.6); }
    },
    bg(t, S) {
      const x = S.p.x, riot = S.fy.riot;
      if (x < WALL) { R("#8a8a8a", 0, 0, A.W, A.H); grad(A, ["#5a5a5a", "#9a9a9a"], 0, 120); A.layer(.6, 40, (xx, k) => { R("#6a6a6a", xx, 30, 30, 60); for (let i = 0; i < 6; i++) R(A.C.ink, xx + 3 + i * 5, 30, 1, 60); });
        A.layer(.8, 120, (xx) => { R("#6a6a6a", xx + 10, 110, 60, 4); R(A.C.ink, xx + 14, 114, 2, 12); R(A.C.ink, xx + 64, 114, 2, 12); });
        R("#7a7a7a", 0, G, A.W, 30);
        if (riot >= 0) { const a = .35 + Math.sin(t * 10) * .15; A.ctx.globalAlpha = a; R("#E8271A", 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; for (let i = 0; i < 4; i++) puff(A, ((t * 20 + i * 90) % (A.W + 60)) - 30, G - 20 - (i % 2) * 20, 24, "#f0c8c8", .6);
          A.layer(.9, 50, (xx, k) => { const b = Math.floor(t * 10 + k) % 2; R(A.C.ink, xx + 10, G - 24 - b * 4, 8, 20); R("#2a4ad0", xx + 11, G - 23 - b * 4, 6, 14); disc(A, "#E8271A", xx + 14, G - 28 - b * 4, 4); }); } }
      else { R("#1a1a3a", 0, 0, A.W, A.H); A.stars({}); R("#2a2a4a", 0, 80, A.W, 40); const wx = sx(A, WALL + 20); R(A.C.ink, wx - 1, 40, A.W, 80); R("#5a5a6a", wx, 41, A.W, 79); for (let i = 0; i < 20; i++) R("#9a9a9a", wx + i * 10, 36 + (i % 2) * 2, 6, 2);
        const sa = Math.sin(t * .8) * .6; A.ctx.globalAlpha = .25; A.ctx.fillStyle = "#fff4c0"; A.ctx.beginPath(); A.ctx.moveTo(wx + 40, 30); A.ctx.lineTo(wx + 40 + Math.sin(sa - .2) * 200, 30 + Math.cos(sa - .2) * 200); A.ctx.lineTo(wx + 40 + Math.sin(sa + .2) * 200, 30 + Math.cos(sa + .2) * 200); A.ctx.fill(); A.ctx.globalAlpha = 1;
        R("#2a5a2a", 0, 120, A.W, G - 120); R("#2a5a2a", 0, G, A.W, 30); }
    },
    mid(t, S) { const f = S.fy; gutBuddy(A, S, f.g, 1.6, t, (x, top) => { R("#2a4ad0", x - 7, top + 10, 14, 10); R("#2a6ad0", x - 7, top - 1, 14, 2); if (f.riot >= 0) { R(A.C.ink, x + 6, top + 6, 2, 8); R("#e8e8e8", x + 6, top, 2, 6); } }); },
    fg(t, S) { txtFx(A, S); }
  };
};

/* TODAY VS TOMORROW: today the robotaxi and the card both say yes. Tomorrow, not so much. */
W["today-vs-tomorrow"] = A => {
  const R = A.R, G = A.G, DESK = 330, TOMORROW = 540, KIOSK = [140, 860];
  const kiosk = (x, ok, t) => { R(A.C.ink, x - 3, G - 30, 6, 30); R("#5a5a5a", x - 2, G - 30, 4, 30); R(A.C.ink, x - 16, G - 54, 32, 26); R(ok ? "#f4f4f2" : "#c81a1a", x - 15, G - 53, 30, 24);
    if (ok) { disc(A, "#3aa83a", x, G - 46, 5); R("#ffffff", x - 2, G - 46, 2, 2); R("#ffffff", x, G - 48, 2, 4); text(A, "HAVE A", x, G - 36, "#3aa83a", 4); text(A, "GREAT DAY", x, G - 31, "#3aa83a", 4); }
    else { R("#ffffff", x - 10, G - 50, 20, 6); text(A, "CREDITS", x, G - 37, "#ffffff", 4); text(A, "DECLINED", x, G - 32, "#ffffff", 4); if (Math.floor(t * 3) % 2) disc(A, "#ffd0d0", x + 12, G - 51, 1); } };
  return {
    sprites: { card: { pal: { B: "#2a48c8", Y: "#f3d23b" }, rows: ["BBBB", "BYBB", "BBBB"] } },
    level: {
      obs: [["tv_taxi", 260], ["cash", 200], ["tv_bot", 600], ["fire", 660], ["tv_bot", 720], ["fire", 790]],
      target: "lamp", targetAt: 400, prop: "card", propAt: 110, npcs: [],
      captions: [[30, "Today."], [DESK - 20, "Nine to five. Screen to screen."], [TOMORROW + 10, "Tomorrow."]]
    },
    obs: {
      tv_taxi: { w: 30, h: 12, y: 0, vx: -60, draw(o, x, y, t) { R(A.C.ink, x, y + 2, 30, 9); R("#f4f4f2", x + 1, y + 3, 28, 7); R(A.C.ink, x + 6, y - 3, 16, 6); R("#3a3a4a", x + 7, y - 2, 14, 4); R("#5a5a5a", x + 12, y - 6, 6, 3); disc(A, A.C.ink, x + 6, y + 11, 3); disc(A, A.C.ink, x + 24, y + 11, 3); R("#9fe0ff", x + 1, y + 5, 2, 2); } },
      tv_bot: { w: 10, h: 14, y: 16, vx: -50, draw(o, x, y, t) { const b = Math.round(Math.sin(t * 4 + o.x) * 2); R(A.C.ink, x, y + b, 10, 8); R("#c8a24a", x + 1, y + 1 + b, 8, 6); R("#E8271A", x + 2, y + 3 + b, 2, 2); R("#E8271A", x + 6, y + 3 + b, 2, 2); R("#c8a24a", x + 4, y + 8 + b, 2, 4); } }
    },
    reset(S) { S.tv = { k: [-1, -1] }; },
    update(dt, S, p) { const v = S.tv; KIOSK.forEach((kx, i) => { if (v.k[i] < 0 && Math.abs(p.x - kx + 14) < 14) { v.k[i] = 0; A.redSays(i ? "Declined?!" : "Beep. Easy.", 1.6); if (i) A.showCaption("Today vs tomorrow."); } }); },
    bg(t, S) {
      const x = S.p.x;
      if (x < TOMORROW) { R("#7ab8e8", 0, 0, A.W, A.H); clouds(A); A.layer(.3, 60, (xx, k) => { R("#9a9aa8", xx, 40 + (k % 3) * 12, 36, 80); for (let i = 0; i < 6; i++) R("#c8d8e8", xx + 4 + (i % 3) * 10, 46 + (k % 3) * 12 + Math.floor(i / 3) * 14, 6, 8); });
        R("#3a8a3a", 0, 118, A.W, 6); R("#6a6a6a", 0, 124, A.W, G - 124); R("#5a5a5a", 0, G, A.W, 30); A.layer(1, 30, xx => R("#f4f4f2", xx, G + 14, 12, 2));
        kiosk(sx(A, KIOSK[0]), true, t);
        const dx = sx(A, DESK + 30); if (dx > -80 && dx < A.W + 80) { R(A.C.ink, dx - 60, 40, 120, G - 40); R("#2a2a3a", dx - 59, 41, 118, G - 41); R(A.C.ink, dx - 40, 56, 30, 24); R("#9fd0ee", dx - 39, 57, 28, 22); R(A.C.ink, dx + 10, 56, 30, 24); R("#9fd0ee", dx + 11, 57, 28, 22);
          R(A.C.ink, dx - 34, 116, 68, 4); R("#a8763a", dx - 33, 117, 66, 2); R(A.C.ink, dx - 12, 98, 24, 18); R("#f3a91f", dx - 11, 99, 22, 14); R(A.C.ink, dx + 20, 104, 8, 12); R("#f3d23b", dx + 18, 100, 12, 6); } }
      else { grad(A, ["#3a0a0a", "#8a1a0a", "#c8401a"], 0, 130); A.layer(.3, 50, (xx, k) => { R("#2a1a1a", xx, 50 + (k % 3) * 14, 26, 90); for (let i = 0; i < 4; i++) R("#c8401a", xx + 4 + (i % 2) * 12, 60 + (k % 3) * 14 + i * 12, 4, 4); smoke(A, xx + 13, 48 + (k % 3) * 14, t + k, 4, "#1a1a1a", 20, 40); });
        const rx = Math.round(250 - A.S.camX * .05); R(A.C.ink, rx - 21, 20, 42, 110); R("#c8a24a", rx - 20, 21, 40, 109); oell(A, "#c8a24a", rx, 16, 16, 14); R(A.C.ink, rx - 8, 12, 5, 3); R(A.C.ink, rx + 3, 12, 5, 3); R("#E8271A", rx - 7, 13, 3, 1); R("#E8271A", rx + 4, 13, 3, 1);
        const ga = Math.sin(t) * .3; A.ctx.strokeStyle = A.C.ink; A.ctx.lineWidth = 6; A.ctx.beginPath(); A.ctx.moveTo(rx + 18, 50); A.ctx.lineTo(rx + 50 + Math.cos(ga) * 10, 90 + Math.sin(ga) * 10); A.ctx.stroke(); A.ctx.strokeStyle = "#c8a24a"; A.ctx.lineWidth = 4; A.ctx.stroke();
        R("#3a1a1a", 0, 130, A.W, G - 130); A.layer(.8, 10, (xx, k) => { R("#E8271A", xx, 136 + (k % 3) * 4, 3, 5); R(A.C.ink, xx, 135 + (k % 3) * 4, 3, 2); });
        R("#2a1414", 0, G, A.W, 30); kiosk(sx(A, KIOSK[1]), false, t); }
    },
    fg(t, S) { const v = S.tv; KIOSK.forEach((kx, i) => { if (v.k[i] >= 0 && v.k[i] < 1.2) { v.k[i] += 1 / 60; onHead(A, (x, top, face) => A.ctx.drawImage(A.NS.card, x + face * 7 - 2, top + 14)); } }); }
  };
};
})();

/* ======================= batch 7 ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx } = W.__shared;
const { reds, follow, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke } = W.__shared2;
const flash = (A, a, c = "#ffffff") => { if (a <= 0) return; A.ctx.globalAlpha = Math.min(1, a); A.R(c, 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; };
const grad = (A, stops, y0 = 0, y1 = A.H) => { const g = A.ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); A.ctx.fillStyle = g; A.ctx.fillRect(0, y0, A.W, y1 - y0); };
const ell = (A, c, x, y, rx, ry, rot = 0) => { A.ctx.fillStyle = c; A.ctx.beginPath(); A.ctx.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), rot, 0, 7); A.ctx.fill(); };
const oell = (A, c, x, y, rx, ry, rot = 0) => { ell(A, A.C.ink, x, y, rx + 1, ry + 1, rot); ell(A, c, x, y, rx, ry, rot); };
const lock = (p, x) => { p.x = x; p.vy = 0; p.y = 0; p.inv = Math.max(p.inv, .3); };
const text = (A, s, x, y, c, size = 6) => { A.ctx.font = `bold ${size}px monospace`; A.ctx.textAlign = "center"; A.ctx.fillStyle = c; A.ctx.fillText(s, x, y); };
const body = (pal) => rows => rows.map((r, j) => j >= 11 && j <= 19 ? r.replace(/R/g, pal) : r);
const vign = (A, a = .5) => { const k = A.ctx, g = k.createRadialGradient(A.W / 2, A.H / 2, 40, A.W / 2, A.H / 2, 210); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${a})`); k.fillStyle = g; k.fillRect(0, 0, A.W, A.H); };
const lady = (pal, hair = "K") => ({ pal: Object.assign({ K: "#14110F" }, pal), rows: [
  `..${hair}${hair}${hair}${hair}${hair}...`, `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}..`, `.${hair}SSSSS${hair}${hair}.`, `.${hair}SKSSKS${hair}.`, `.${hair}SSSSS${hair}${hair}.`, `.${hair}.SRRS.${hair}.`, "....SS....", "..TTTTTT..", ".TTTTTTTT.", ".STTTTTTS.", ".STTTTTTS.", "..TTTTTT..", "..BBBBBB..", "..SSSSSS..", "..SS..SS..", "..SS..SS..", "..SS..SS..", "..SS..SS..", ".SSS.SSS.."] });

/* GYATT FISH: caught a big one. She's got a following. */
W["gyatt-fish"] = A => {
  const R = A.R, G = A.G, POND = 200, CABIN = 560, SHOOT = 820, PUR = "#a070d0";
  const fish = (x, t, s, shake) => { const w = Math.sin(t * (shake ? 18 : 4)) * (shake ? 3 : 1); oell(A, PUR, x, G - 9 * s, 16 * s, 9 * s); oell(A, PUR, x + 14 * s + w, G - 14 * s, 9 * s, 11 * s); oell(A, PUR, x + 22 * s - w, G - 12 * s, 8 * s, 10 * s);
    R("#8a5ac0", x + 18 * s, G - 22 * s, 1, 18 * s); for (let i = 0; i < 6; i++) R("#c8a8f0", x - 10 * s + (i * 7) % (20 * s), G - 14 * s + (i * 3) % 10, 1, 1);
    oell(A, "#e070b0", x - 15 * s, G - 8 * s, 4 * s, 3 * s); R(A.C.ink, x - 18 * s, G - 8 * s, 6 * s, 1); disc(A, A.C.ink, x - 8 * s, G - 13 * s, 1.5 * s); R("#5ab8e8", x - 4 * s, G - 2, 10 * s, 2); };
  return {
    outfit: { W: "#f4f4f2" },
    sprites: { rod: { pal: { N: "#3a3a3a" }, rows: ["N....", ".N...", "..N..", "...N.", "....N"] }, phn: { pal: { B: "#3a8ae0" }, rows: ["KKK", "BBB", "BBB", "KKK"] } },
    level: {
      obs: [["bird", 300], ["gy_tip", 420], ["bird", 480], ["gy_tip", 640], ["gy_tip", 700]],
      target: "bush", targetAt: 380, prop: "rod", propAt: 110, npcs: [],
      captions: [[30, "Gone fishing."], [POND + 50, "Whoa. Big one."], [CABIN + 10, "She followed me home."], [SHOOT - 50, "Lights. Camera."]]
    },
    obs: { gy_tip: { w: 9, h: 5, y: 15, vx: -50, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t * 3 + o.x) * 2); R(A.C.ink, x, yy, 9, 5); R("#5aa83a", x + 1, yy + 1, 7, 3); text(A, "$", x + 4, yy + 4, "#f4f4f2", 4); } } },
    reset(S) { S.gy = { f: { x: POND + 20, y: 0, d: 0, face: 1, moving: false }, caught: false, shoot: -1, tips: [] }; },
    update(dt, S, p) {
      const g = S.gy; if (!g.caught && p.x > POND + 20) { g.caught = true; crowdText(A, S, "SPLOSH", POND + 30, 40); A.redSays("Hey there, gorgeous.", 1.6); }
      if (g.caught && g.shoot < 0) { follow(g.f, p.x - 34 * (p.face || 1), 90, dt); if (Math.abs(g.f.x - p.x) > 100) g.f.x = p.x - 50; }
      if (g.shoot < 0 && p.x > SHOOT && p.x < SHOOT + 60) { g.shoot = 0; g.f.x = SHOOT + 50; A.showCaption("Gyatt fish."); }
      if (g.shoot >= 0) { g.shoot += dt; if (Math.random() < dt * 2.5) g.tips.push({ t: 0, n: ["$5 \"wow\"", "$20 \"more!!\"", "$50 \"queen\"", "$10 \"lips 😍\""][g.tips.length % 4] }); }
      for (const n of g.tips) n.t += dt; g.tips = g.tips.filter(n => n.t < 2.5);
    },
    bg(t, S) {
      const night = S.p.x > CABIN - 40;
      if (!night) { R("#3a9a3a", 0, 0, A.W, A.H); const k = A.ctx, gg = k.createRadialGradient(160, 80, 20, 160, 80, 220); gg.addColorStop(0, "rgba(120,220,120,.4)"); gg.addColorStop(1, "rgba(0,40,0,.5)"); k.fillStyle = gg; k.fillRect(0, 0, A.W, A.H);
        A.layer(.5, 9, (x, kk) => R("#2f8a2f", x + A.hash(kk, 1) * 6, 20 + A.hash(kk, 2) * 120, 3, 1)); const px = sx(A, POND + 60); oell(A, "#4ab0e8", px, G - 4, 34, 8); R("#2f8a2f", 0, G, A.W, 30); }
      else { grad(A, ["#2a1a3a", "#c8602a"], 0, 110); R("#2a6a2a", 0, 110, A.W, A.H); A.layer(.6, 6, (x) => { R("#e8e8e8", x, 100, 2, 14); R("#e8e8e8", x - 3, 104, 8, 1); });
        const cx = sx(A, CABIN + 80, .8); R(A.C.ink, cx - 51, 60, 102, G - 60); for (let j = 0; j < 9; j++) { R("#8a5a32", cx - 50, 61 + j * 10, 100, 9); R("#6a4224", cx - 50, 69 + j * 10, 100, 1); } A.ctx.fillStyle = "#5a3a1a"; A.ctx.beginPath(); A.ctx.moveTo(cx - 58, 62); A.ctx.lineTo(cx, 30); A.ctx.lineTo(cx + 58, 62); A.ctx.fill();
        R("#f3d23b", cx - 30, 80, 14, 12); R("#f3d23b", cx + 16, 80, 14, 12); R(A.C.ink, cx - 6, 110, 14, 40); R("#f3d23b", cx - 5, 111, 12, 39); R("#2a6a2a", 0, G, A.W, 30);
        if (S.gy.shoot >= 0) { R("#3a2a1a", 0, 0, A.W, A.H); vign(A, .7); const lx = sx(A, SHOOT + 100); R(A.C.ink, lx, 50, 2, 100); oell(A, "#f4f4f2", lx + 1, 46, 10, 8); disc(A, "#ffffff", lx + 1, 46, 5); A.ctx.globalAlpha = .2; disc(A, "#ffffe0", lx, 60, 60); A.ctx.globalAlpha = 1;
          const bx = sx(A, SHOOT + 50); R(A.C.ink, bx - 30, G - 10, 60, 8); R("#3aa83a", bx - 29, G - 9, 58, 6); R("#6a4224", 0, G, A.W, 30); } }
    },
    mid(t, S) { const g = S.gy; if (!g.caught) { if (S.p.x > POND - 60) { const a = A.red; A.ctx.strokeStyle = "#f4f4f2"; A.ctx.lineWidth = 1; A.ctx.beginPath(); A.ctx.moveTo(a.x + 8, a.top + 6); A.ctx.lineTo(sx(A, POND + 60), G - 4); A.ctx.stroke(); } return; }
      fish(sx(A, g.f.x), t, g.shoot >= 0 ? 1.4 : .8, g.shoot >= 0); },
    fg(t, S) { const g = S.gy; onHead(A, (x, top, face) => { R("#c8a83a", x - 5, top + 11, 10, 9); R("#8a6a2a", x - 5, top + 11, 2, 9); R("#8a6a2a", x + 3, top + 11, 2, 9); });
      g.tips.forEach((n, i) => { const y = 30 + i * 13 - n.t * 4; A.ctx.globalAlpha = Math.min(1, (2.5 - n.t) * 2); R(A.C.ink, 10, y + 29, 98, 11); R("#f4f4f2", 11, y + 30, 96, 9); text(A, n.n, 58, y + 36, "#3a8a3a", 6); A.ctx.globalAlpha = 1; });
      txtFx(A, S); }
  };
};

/* SUSHI NIGHT: buy an octopus, bring it to the sushi bar, lose a hand. */
W["sushi-night"] = A => {
  const R = A.R, G = A.G, STORE = 220, BAR = 440, KITCHEN = 560, CHOP = 780, ORA = "#e8823a";
  const octo = (x, y, s, t) => { for (let i = 0; i < 6; i++) { const a = Math.PI * (.1 + i * .16), w = Math.sin(t * 4 + i) * 3 * s; A.ctx.strokeStyle = A.C.ink; A.ctx.lineWidth = 4 * s; A.ctx.beginPath(); A.ctx.moveTo(x, y); A.ctx.quadraticCurveTo(x + Math.cos(a) * 14 * s + w, y + 10 * s, x + Math.cos(a) * 20 * s, y + Math.sin(a) * 18 * s); A.ctx.stroke(); A.ctx.strokeStyle = ORA; A.ctx.lineWidth = 2.5 * s; A.ctx.stroke(); }
    oell(A, ORA, x, y - 8 * s, 9 * s, 11 * s); disc(A, "#ffffff", x - 3 * s, y - 8 * s, 2 * s); disc(A, "#ffffff", x + 3 * s, y - 8 * s, 2 * s); R(A.C.ink, x - 3 * s, y - 8 * s, 1, 1); R(A.C.ink, x + 3 * s, y - 8 * s, 1, 1); };
  return {
    sprites: { bag: { pal: { L: "#cfefff", O: "#e8823a" }, rows: [".KK.", "LLLL", "LOOL", "LOOL", "LLLL"] } },
    level: {
      obs: [["sn_fish", 120], ["sn_taxi", 320], ["sn_fish", 400], ["sn_knife", 620], ["sn_knife", 700]],
      target: "lamp", targetAt: 480, prop: "bag", propAt: 160, npcs: [],
      captions: [[30, "Pet store. Pick a friend."], [STORE + 20, "Date night. Sushi."], [KITCHEN + 10, "The chef's... familiar."]]
    },
    obs: {
      sn_fish: { w: 7, h: 4, y: 18, vx: -40, draw(o, x, y, t) { R(A.C.ink, x, y, 7, 4); R("#5ab8e8", x + 1, y + 1, 4, 2); R("#5ab8e8", x + 5, y, 2, 4); } },
      sn_taxi: { w: 34, h: 14, y: 0, vx: -70, draw(o, x, y, t) { R(A.C.ink, x, y + 3, 34, 10); R("#f3c83a", x + 1, y + 4, 32, 8); R(A.C.ink, x + 7, y - 3, 18, 7); R("#2a2a3a", x + 8, y - 2, 16, 5); R(A.C.ink, x + 13, y - 6, 8, 3); R("#f4f4f2", x + 14, y - 5, 6, 2); disc(A, A.C.ink, x + 7, y + 13, 3); disc(A, A.C.ink, x + 27, y + 13, 3); } },
      sn_knife: { w: 12, h: 3, y: 16, vx: -170, draw(o, x, y) { R("#e8e8e8", x, y, 9, 2); R("#3a2a1a", x + 9, y, 4, 3); } }
    },
    reset(S) { S.sn = { chop: -1, dressed: false }; },
    update(dt, S, p) {
      const s = S.sn; if (!s.dressed) { s.dressed = true; A.reskin(rows => rows.map((r, j) => j >= 11 ? r.replace(/[RWw]/g, "P").replace(/r/g, "p") : r), { P: "#7a3ac0", p: "#5a2a9a" }); }
      if (s.chop < 0 && p.x > CHOP && p.x < CHOP + 50) { s.chop = 0; A.redSays("Just a little closer...", 1.2); }
      if (s.chop >= 0 && s.chop < 9) { const b = s.chop; s.chop += dt; if (s.chop < 2) lock(p, CHOP);
        if (b < 1 && s.chop >= 1) { splash(S, CHOP + 12, 18, 18, "#5ac83a"); crowdText(A, S, "CHOP", CHOP + 20, 60); A.redSays("MY HAND!", 1.4); } if (b < 2.4 && s.chop >= 2.4) A.showCaption("Sushi night."); }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < STORE) { R("#2a2a32", 0, 0, A.W, A.H); A.layer(.3, 20, xx => { R("#e8e8f0", xx, 0, 12, 4); }); A.layer(.7, 60, (xx, k) => { for (let j = 0; j < 3; j++) { R(A.C.ink, xx + 4, 50 + j * 32, 48, 28); R("#5ab8e8", xx + 5, 51 + j * 32, 46, 26); disc(A, ["#f3d23b", ORA, "#5aa83a"][(j + k) % 3], xx + 15 + (Math.floor(t * 8 + j) % 20), 64 + j * 32, 3); } }); R("#5a5a62", 0, G, A.W, 30); }
      else if (x < KITCHEN) { R("#1a1a2a", 0, 0, A.W, A.H); grad(A, ["#2a1a4a", "#1a1a2a"], 0, 90); A.layer(.3, 50, (xx, k) => R("#2a2a3a", xx, 40 + (k % 3) * 12, 30, 90));
        const bx = sx(A, BAR + 40); R(A.C.ink, bx - 51, 70, 102, G - 70); R("#c8c8b0", bx - 50, 71, 100, G - 71); R(A.C.ink, bx - 30, 80, 60, 12); R("#3a3a3a", bx - 29, 81, 58, 10); text(A, "SUSHI", bx, 90, "#f4f4f2", 9);
        R(A.C.ink, bx - 14, 110, 28, 40); R("#f3d23b", bx - 13, 111, 26, 39); octo(bx - 20, 68, 1.2, t); R("#5a5a5a", 0, G, A.W, 30); A.layer(1, 30, xx => R("#f3d23b", xx, G + 14, 10, 2)); }
      else { R("#3a3a3a", 0, 0, A.W, A.H); R("#e8e8f0", 40, 4, 240, 4); vign(A, .6); R("#9a9a9a", 0, 108, A.W, 42); R("#c8c8c8", 0, 108, A.W, 3); R(A.C.ink, 0, 111, A.W, 1); R("#6a6a6a", 0, G, A.W, 30);
        const ox = sx(A, CHOP + 40); octo(ox, 100, 1.4, t); if (S.sn.chop >= 0 && S.sn.chop < 1.2) { const a = -1.2 + Math.min(1, S.sn.chop) * 1.8; R(A.C.ink, ox + 12 + Math.cos(a) * 10, 90 + Math.sin(a) * 10, 14, 3); R("#e8e8e8", ox + 13 + Math.cos(a) * 10, 90 + Math.sin(a) * 10, 12, 2); }
        if (S.sn.chop >= 1.6) { const px = sx(A, CHOP + 70); oell(A, "#2a2a2a", px, 104, 26, 6); for (let i = 0; i < 4; i++) { oell(A, "#2a6a2a", px - 15 + i * 10, 100, 4, 4); disc(A, "#f4f4f2", px - 15 + i * 10, 100, 2.5); disc(A, "#E8271A", px - 15 + i * 10, 100, 1.5); } } }
    },
    fg(t, S) { onHead(A, (x, top) => { R(A.C.ink, x - 7, top - 1, 14, 2); R("#7a3ac0", x - 6, top - 1, 12, 1); R(A.C.ink, x - 4, top - 9, 8, 9); R("#7a3ac0", x - 3, top - 8, 6, 7); R("#f3d23b", x - 3, top - 3, 6, 1); });
      if (S.p.x < BAR - 40) { const r = A.red; A.ctx.drawImage(A.NS.bag, r.x + r.face * 6 - 2, r.top + 14); }
      txtFx(A, S); dropFx(A, S); }
  };
};

/* EAT HER ON THE FIRST DATE: he's a zombie, she's the last girl alive. Flowers, a walk, a kiss. */
W["eat-her-on-the-first-date"] = A => {
  const R = A.R, G = A.G, HOUSE = 140, JOIN = 300, KISS = 800;
  const zomb = rows => rows.map((r, j) => j <= 22 ? r.replace(/R/g, "Z").replace(/r/g, "z") : r.replace(/R/g, "Z").replace(/r/g, "z"));
  return {
    sprites: { her: lady({ S: "#E8271A", T: "#3a8ae0", B: "#3a3a5a", R: "#a81a10" }), bouq: { pal: { Y: "#f3d23b", Q: "#3a8a2a" }, rows: ["YYY", "YQY", ".Q.", ".Q."] } },
    level: {
      obs: [["ez_debris", 220], ["bird", 280], ["ez_debris", 420], ["ez_fire", 520], ["ez_debris", 620], ["ez_fire", 700]],
      target: "bush", targetAt: 380, prop: "bouq", propAt: 100, npcs: [],
      captions: [[30, "End of the world. Still dating."], [HOUSE + 30, "She said yes!"], [500, "Romantic walk. Mostly fire."], [KISS - 40, "Pucker up."]]
    },
    obs: {
      ez_debris: { w: 12, h: 6, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y + 2, 12, 4); R("#6a6a6a", x + 1, y + 3, 10, 3); R("#E8271A", x + 3, y, 3, 3); } },
      ez_fire: { w: 8, h: 8, y: 0, vx: 0, tough: "hot!", draw(o, x, y, t) { const f = Math.floor(t * 10 + o.x) % 3; R(A.C.ink, x, y + 6, 8, 2); R("#f3a91f", x + 1, y + 1 + f, 6, 6 - f); R("#f3d23b", x + 2, y + 3 + f, 4, 3 - (f > 1 ? 1 : 0)); } }
    },
    reset(S) { S.ez = { h: { x: HOUSE + 20, y: 0, d: 0, face: 1, moving: false }, joined: false, kiss: -1, dressed: false }; },
    update(dt, S, p) {
      const z = S.ez; if (!z.dressed) { z.dressed = true; A.reskin(zomb, { Z: "#5ab85a", z: "#3a9a3a" }); }
      if (!z.joined && p.x > JOIN - 120) { z.joined = true; A.say("Oh... you brought flowers.", HOUSE, 50, 2); }
      if (z.joined && z.kiss < 0) { follow(z.h, p.x + 16, 110, dt); if (Math.abs(z.h.x - p.x) > 120) z.h.x = p.x + 30; }
      if (z.kiss < 0 && p.x > KISS && p.x < KISS + 60) { z.kiss = 0; z.h.x = p.x + 12; hearts(S, p.x + 6, 30, 4); }
      if (z.kiss >= 0 && z.kiss < 9) { const b = z.kiss; z.kiss += dt; if (z.kiss < 2) lock(p, KISS); if (b < 1.2 && z.kiss >= 1.2) { splash(S, z.h.x, 24, 20, "#E8271A"); crowdText(A, S, "CRUNCH", z.h.x, 50); } if (b < 2 && z.kiss >= 2) { A.showCaption("Eat her on the first date."); A.redSays("Mmm. Love.", 1.8); } }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      R("#7ac0e8", 0, 0, A.W, A.H); A.layer(.2, 50, (x, k) => R("#5a6a7a", x, 50 + (k % 3) * 14, 34, 80)); A.layer(.3, 160, (x, k) => smoke(A, x + 60, 70, t + k, 8, "#2a2a2a", 40, 80));
      R("#4aaa4a", 0, 116, A.W, G - 116); R("#c8c8c0", 0, G - 6, A.W, 6); R("#4aaa4a", 0, G, A.W, 30);
      const hx = sx(A, HOUSE); if (hx > -80 && hx < A.W + 80) { R(A.C.ink, hx - 41, 40, 82, G - 40); for (let j = 0; j < 12; j++) R(j % 2 ? "#a8763a" : "#9a6a32", hx - 40, 41 + j * 9, 80, 9); R(A.C.ink, hx - 8, 54, 16, 16); R("#e8a0d8", hx - 7, 55, 14, 14);
        if (!S.ez.joined) { disc(A, "#E8271A", hx, 62, 4); R(A.C.ink, hx - 5, 58, 10, 3); } [[-26, 110], [10, 112], [-10, 96]].forEach(([dx, y]) => { R(A.C.ink, hx + dx, y, 16, 14); for (let i = 0; i < 3; i++) R("#8a5a32", hx + dx + 1, y + 1 + i * 4, 14, 3); }); for (let i = 0; i < 5; i++) R("#5ac83a", hx - 30 + i * 13, 120 + (i % 2) * 6, 2, 10); }
      const cx = sx(A, 640, .8); if (cx > -60 && cx < A.W + 60) { A.ctx.save(); A.ctx.translate(cx, 128); A.ctx.rotate(.4); R(A.C.ink, -26, -9, 52, 16); R("#f3c83a", -25, -8, 50, 14); R("#2a2a3a", -15, -14, 26, 6); A.ctx.restore(); smoke(A, cx, 110, t, 8, "#1a1a1a", 30, 80); puff(A, cx + 6, 116, 6 + Math.sin(t * 8), "#f3a91f", .9); }
    },
    mid(t, S) { const z = S.ez; if (!z.joined) return; const im = A.NS[z.h.face < 0 ? "herL" : "her"], x = sx(A, z.h.x); A.ctx.drawImage(im, x - 5, G - im.height + 1 - (z.h.moving ? Math.floor(z.h.d / 5) % 2 : 0));
      if (z.kiss >= 1.2) { R("#E8271A", x - 4, G - 15, 2, 3); } },
    fg(t, S) { const z = S.ez; onHead(A, (x, top, face) => { oell(A, "#e8a0c8", x - face * 2, top + 2, 3, 2); R("#5ac83a", x - 2, top + 20, 3, 3); if (!z.joined) A.ctx.drawImage(A.NS.bouq, x + face * 7 - 1, top + 12); });
      heartFx(A, S); txtFx(A, S); dropFx(A, S); }
  };
};

/* JACUZZI: two ladies, one hot tub, and Red's been under way too long. */
W["jacuzzi"] = A => {
  const R = A.R, G = A.G, TUB = [520, 800], SINK = 600, POP = 720;
  return {
    sprites: { l1: lady({ S: "#f0b8b0", T: "#c870d0", B: "#c870d0", R: "#c84a4a" }), l2: lady({ S: "#f0b8b0", T: "#5ac83a", B: "#5ac83a", R: "#c84a4a" }, "Y"), towel: { pal: { Z: "#f4f4f2", B: "#3a8ae0" }, rows: ["ZBZB", "ZBZB", "ZBZB"] } },
    level: {
      obs: [["jz_wet", 200], ["jz_duck", 280], ["jz_wet", 360], ["jz_duck", 440]],
      target: "jz_drain", targetAt: 320, prop: "towel", propAt: 120, npcs: [],
      captions: [[30, "Rooftop. Hot tub. Company."], [TUB[0] - 30, "Hop in."], [SINK + 30, "...he's been under a while."]]
    },
    obs: {
      jz_wet: { w: 14, h: 2, y: 0, vx: 0, tough: "slip!", draw(o, x, y, t) { R("#7ac8e6", x, A.G - 1, 14, 2); R("#ffffff", x + 3 + Math.floor(t * 2) % 7, A.G - 1, 2, 1); } },
      jz_duck: { w: 7, h: 6, y: 0, vx: -30, draw(o, x, y) { R(A.C.ink, x, y + 2, 7, 4); R("#f3d23b", x + 1, y + 3, 5, 2); R(A.C.ink, x + 1, y, 3, 3); R("#f3d23b", x + 1, y + 1, 2, 2); R("#f3a91f", x - 1, y + 1, 2, 1); } }
    },
    targets: { jz_drain: { line: "Pool water. Ish.", draw(tg, x) { R(A.C.ink, x - 6, G - 2, 12, 2); for (let i = 0; i < 4; i++) R("#8a8a8a", x - 5 + i * 3, G - 2, 1, 2); } } },
    reset(S) { S.jz = { sink: 0, pop: -1, drag: -1 }; },
    update(dt, S, p) {
      const j = S.jz, inTub = p.x > TUB[0] + 10 && p.x < TUB[1] - 10;
      if (inTub && p.x > SINK && j.pop < 0) j.sink = Math.min(1, j.sink + dt * .8); else if (!inTub) j.sink = Math.max(0, j.sink - dt * 2);
      if (j.pop < 0 && p.x > POP && p.x < TUB[1]) { j.pop = 0; crowdText(A, S, "BLORP", POP, 40); splash(S, POP, 6, 18, "#9fd8f0"); }
      if (j.pop >= 0 && j.pop < 9) { const b = j.pop; j.pop += dt; if (j.pop < 2.4) lock(p, POP); if (b < .6 && j.pop >= .6) A.say("EWWW!", TUB[0] + 60, 50, 1.6); if (b < 2.4 && j.pop >= 2.4) { j.sink = 0; p.x = TUB[1] + 10; A.showCaption("Jacuzzi."); A.redSays("*gasp* ...did I win?", 2); } }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      R("#2a2a30", 0, 0, A.W, A.H); grad(A, ["#0a0a14", "#3a3a44"], 0, 120); A.layer(.2, 40, (x, k) => { R("#1a1a24", x, 50 + (k % 3) * 12, 30, 80); if (k % 2) R("#f3d23b", x + 8, 60 + (k % 3) * 12, 3, 3); });
      R("#5a5a62", 0, 120, A.W, G - 120); A.layer(.8, 30, x => R("#4a4a52", x, 120, 1, 30)); R("#4a4a52", 0, G, A.W, 30);
      const a = sx(A, TUB[0]), b = sx(A, TUB[1]); if (b > 0 && a < A.W) { R(A.C.ink, a - 2, G - 22, b - a + 4, 52); R("#c8c8c8", a - 1, G - 21, b - a + 2, 50); R("#3a8ae0", a + 2, G - 18, b - a - 4, 48); A.layer(1, 9, (x, k) => { if (x > a + 4 && x < b - 8) R("#f4f4f2", x + (Math.floor(t * 4 + k) % 4), G - 16 + (k % 4) * 3, 4, 2); });
        R("#9a9a9a", b - 4, G - 40, 2, 20); R("#9a9a9a", b - 14, G - 40, 10, 2); }
    },
    fg(t, S) {
      const j = S.jz, a = sx(A, TUB[0]), b = sx(A, TUB[1]); if (b > 0 && a < A.W) { A.ctx.globalAlpha = .85; R("#3a8ae0", a + 2, G - 14 + Math.round(j.sink * -6), b - a - 4, 44); A.ctx.globalAlpha = 1; A.layer(1, 7, (x, k) => { if (x > a + 4 && x < b - 8) R("#cfefff", x + (Math.floor(t * 3 + k) % 4), G - 14 + (k % 3) * 2, 4, 1); });
        if (j.sink > .5 && j.pop < 0) for (let i = 0; i < 3; i++) { const yy = G - 16 - ((t * 30 + i * 9) % 20); A.ctx.strokeStyle = "#cfefff"; A.ctx.beginPath(); A.ctx.arc(A.red.x + (i - 1) * 3, yy, 1.5, 0, 7); A.ctx.stroke(); }
        if (j.pop >= 0 && j.pop < 2.4) { const x = sx(A, POP); oell(A, "#E8271A", x, G - 14, 16, 8); R("#f4f4f2", x - 6, G - 18, 12, 4); R(A.C.ink, x, G - 21, 1, 7); } }
      const gone = j.pop >= .6; [[TUB[0] + 40, "l1"], [TUB[0] + 64, "l2"]].forEach(([x0, k], i) => { let x = sx(A, x0), y = 8;
        if (gone) { const u = Math.min(1, (j.pop - .6) * 2); x -= u * 70 + i * 10; y = 8 - u * 8; }
        const im = A.NS[k]; A.ctx.drawImage(im, x - 5, G - im.height + 1 + y); });
      if (b > 0 && a < A.W) { A.ctx.globalAlpha = .7; R("#3a8ae0", a + 2, G - 6, b - a - 4, 36); A.ctx.globalAlpha = 1; }
      txtFx(A, S); dropFx(A, S);
    }
  };
};

/* SPACE JAMMED: from orbit, he sees exactly where his wife is. And who she's with. */
W["space-jammed"] = A => {
  const R = A.R, G = A.G, PHONE = 160, SCREEN = 300, DROP = 420, BEACH = 470, BUSTED = 820;
  const suit = rows => rows.map((r, j) => j >= 10 ? r.replace(/[RWw]/g, "Z").replace(/r/g, "z") : r);
  return {
    sprites: { wife: lady({ S: "#c870d0", T: "#3a5ad0", B: "#f4f4f2", R: "#7a2a7a" }, "Y"), flag: { pal: { B: "#2a48c8", Z: "#f4f4f2" }, rows: ["BBRR", "ZZRR", "RRZZ"] } },
    level: {
      obs: [["sj_rock", 180], ["sj_rock", 260], ["sj_rock", 340], ["sj_meteor", 560], ["sj_meteor", 660], ["sj_meteor", 740]],
      target: "rock", targetAt: 620, prop: "flag", propAt: 110, npcs: [],
      captions: [[30, "Day 200 in orbit. Miss her."], [PHONE + 10, "Find My: Wife. Location: Miami."], [SCREEN + 10, "Zoom in..."], [DROP + 10, "Coming home early."]]
    },
    obs: {
      sj_rock: { w: 8, h: 7, y: 20, vx: -30, draw(o, x, y, t) { const yy = y + Math.round(Math.sin(t + o.x) * 4); oell(A, "#8a8a8a", x + 4, yy + 3, 4, 3); R("#6a6a6a", x + 2, yy + 2, 2, 1); } },
      sj_meteor: { w: 8, h: 8, y: 30, vx: -60, draw(o, x, y, t) { const yy = A.G - ((t * 60 + o.x * 3) % 140); o.y = A.G - yy; oell(A, "#8a4a2a", x + 4, yy, 4, 4); A.ctx.globalAlpha = .6; R("#3a3a3a", x + 6, yy - 12, 3, 10); A.ctx.globalAlpha = 1; R("#f3a91f", x + 2, yy + 2, 3, 2); } }
    },
    reset(S) { S.sj = { dressed: false, fall: -1, bust: -1 }; },
    update(dt, S, p) {
      const s = S.sj; if (!s.dressed) { s.dressed = true; A.reskin(suit, { Z: "#e8e8ec", z: "#c8c8d0" }); }
      if (s.fall < 0 && p.x > DROP && p.x < BEACH) s.fall = 0; if (s.fall >= 0 && s.fall < 9) { const b = s.fall; s.fall += dt; if (s.fall < 1.6) lock(p, DROP); if (b < 1.6 && s.fall >= 1.6) { p.x = BEACH + 30; p.y = 60; p.onG = false; } }
      if (s.bust < 0 && p.x > BUSTED && p.x < BUSTED + 60) { s.bust = 0; A.say("It's not what it looks like!", BUSTED + 30, 54, 2.2); } if (s.bust >= 0) { const b = s.bust; s.bust += dt; if (b < 2.2 && s.bust >= 2.2) { A.showCaption("Space jammed."); A.redSays("Is that... a TAN line?", 2); } }
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < BEACH) { R("#0a0a14", 0, 0, A.W, A.H); A.stars({}); const ex = sx(A, 300, .1); disc(A, "#2a6ad0", ex, 260, 170); A.layer(.15, 70, (xx, k) => puff(A, xx, 110 + (k % 3) * 10, 10, "#f4f4f2", .7)); A.ctx.save(); A.ctx.beginPath(); A.ctx.arc(ex, 260, 170, 0, 7); A.ctx.clip(); disc(A, "#3aa83a", ex - 60, 140, 40); disc(A, "#3aa83a", ex + 90, 160, 50); A.ctx.restore();
        const s = sx(A, 240, .4); R(A.C.ink, s - 31, 40, 62, 20); R("#e8e8e8", s - 30, 41, 60, 18); for (let i = 0; i < 2; i++) { R(A.C.ink, s - 90 + i * 120, 44, 52, 12); R("#2a48c8", s - 89 + i * 120, 45, 50, 10); for (let j = 0; j < 6; j++) R("#5a7ae8", s - 87 + i * 120 + j * 8, 45, 1, 10); }
        R("#c8c8c8", 0, G, A.W, 4); R("#3a3a3a", 0, G + 4, A.W, 26); A.layer(1, 20, xx => R("#e8e8e8", xx, G + 4, 2, 26)); }
      else { R("#8ac8e8", 0, 0, A.W, 80); A.layer(.1, 90, (xx, k) => { A.ctx.globalAlpha = .6; A.ctx.strokeStyle = "#2a2a2a"; A.ctx.lineWidth = 4; A.ctx.beginPath(); A.ctx.moveTo(xx, 0); A.ctx.lineTo(xx + 40, 60); A.ctx.stroke(); A.ctx.globalAlpha = 1; disc(A, "#8a4a2a", xx + 42, 62, 4); });
        R("#3a8ad0", 0, 80, A.W, 20); R("#e8d090", 0, 100, A.W, G - 100); R("#e8d090", 0, G, A.W, 30);
        const tx = sx(A, BUSTED + 40); R(A.C.ink, tx - 30, G - 4, 60, 4); for (let i = 0; i < 6; i++) R(i % 2 ? "#3a5ad0" : "#f4f4f2", tx - 29 + i * 10, G - 3, 10, 3);
        const ax = sx(A, BUSTED + 64), b = Math.round(Math.sin(t * 2)); R(A.C.ink, ax - 9, G - 30 + b, 18, 30); R("#5ac85a", ax - 8, G - 29 + b, 16, 18); R("#a8622a", ax - 8, G - 12 + b, 16, 6); R("#5ac85a", ax - 6, G - 6, 4, 6); R("#5ac85a", ax + 2, G - 6, 4, 6);
        R("#5ac85a", ax - 13, G - 28 + b, 4, 14); R("#5ac85a", ax + 9, G - 28 + b, 4, 14); oell(A, "#5ac85a", ax, G - 38 + b, 7, 9); oell(A, A.C.ink, ax - 3, G - 39 + b, 2, 3, .4); oell(A, A.C.ink, ax + 3, G - 39 + b, 2, 3, -.4); R(A.C.ink, ax - 2, G - 32 + b, 4, 1);
        const wx = sx(A, BUSTED + 40), im = A.NS.wifeL; A.ctx.drawImage(im, wx - 5, G - im.height + 1); }
    },
    fg(t, S) {
      const s = S.sj, x = S.p.x;
      if (x < BEACH) onHead(A, (hx, top) => { A.ctx.globalAlpha = .45; disc(A, "#cfefff", hx, top + 5, 9); A.ctx.globalAlpha = 1; A.ctx.strokeStyle = "#e8e8ec"; A.ctx.lineWidth = 1; A.ctx.beginPath(); A.ctx.arc(hx, top + 5, 9, 0, 7); A.ctx.stroke(); });
      if (x > PHONE && x < PHONE + 80) { R(A.C.ink, 230, 24, 72, 100); R("#f4f4f2", 232, 26, 68, 96); text(A, "Wife 💕", 266, 40, A.C.ink, 8); text(A, "Miami", 266, 50, "#3a8ae0", 6); R("#c8e8c8", 236, 56, 60, 50); R("#3a8ae0", 236, 80, 60, 26); disc(A, "#E8271A", 270, 70, 3); }
      if (x > SCREEN && x < SCREEN + 90) { R(A.C.ink, 200, 30, 110, 72); R("#3a6a3a", 202, 32, 106, 68); R("#e8d090", 202, 70, 106, 30); R("#c870d0", 230, 74, 18, 6); R("#5ac85a", 250, 72, 16, 8); text(A, "LIVE", 290, 42, "#E8271A", 7); }
      if (s.fall >= 0 && s.fall < 1.6) { R("#8ac8e8", 0, 0, A.W, A.H); const u = s.fall; A.ctx.strokeStyle = A.C.ink; [[-20, 0], [20, 0]].forEach(([dx]) => { A.ctx.beginPath(); A.ctx.moveTo(160 + dx, 40); A.ctx.lineTo(160 + dx / 3, 70 + u * 10); A.ctx.stroke(); }); oell(A, "#f4f4f2", 160, 36, 30, 14); R("#E8271A", 145, 26, 10, 10);
        const im = A.NS.jump || A.NS.stand; A.ctx.drawImage(A.NS.b5_stand || im, 152, 70 + u * 10); for (let i = 0; i < 6; i++) puff(A, (i * 60 + t * 50) % A.W, 200 - ((u * 200 + i * 40) % 220), 12, "#f4f4f2", .9); }
    }
  };
};

/* AT THE HAND OF JOBS: unbox the new phone. It unboxes you. */
W["at-the-hand-of-jobs"] = A => {
  const R = A.R, G = A.G, BOX = 150, WIRE = 380, APPLE = 520, BOSS = 820;
  const apple = rows => rows.map((r, j) => j >= 11 && j <= 19 ? r.replace(/^\.\.\.\./, "...R").replace(/\.\.\.\.$/, "R...") : r);
  return {
    sprites: { phone2: { pal: { G: "#c8c8c8", B: "#3a3a4a" }, rows: ["GGG", "GBG", "GBG", "GGG"] } },
    level: {
      obs: [["hj_cable", 230], ["hj_cable", 300], ["hj_spark", 460], ["hj_cable", 600], ["hj_spark", 680], ["hj_cable", 740]],
      target: "lamp", targetAt: 420, prop: "phone2", propAt: BOX + 20, npcs: [],
      captions: [[30, "New phone day."], [WIRE - 40, "The cables are... moving."], [APPLE + 20, "Upgrade complete."], [BOSS - 40, "Meet your maker."]]
    },
    obs: {
      hj_cable: { w: 14, h: 3, y: 0, vx: 0, tough: "zzt", draw(o, x, y, t) { A.ctx.strokeStyle = "#e8e8e8"; A.ctx.lineWidth = 1; A.ctx.beginPath(); A.ctx.moveTo(x, A.G - 1); for (let i = 1; i <= 7; i++) A.ctx.lineTo(x + i * 2, A.G - 1 - Math.abs(Math.sin(t * 6 + i + o.x)) * 4); A.ctx.stroke(); } },
      hj_spark: { w: 6, h: 6, y: 16, vx: -60, draw(o, x, y, t) { const f = Math.floor(t * 12) % 2; R("#ffffff", x + 2, y, 2, 6); R("#ffffff", x, y + 2, 6, 2); if (f) R("#9fe0ff", x + 1, y + 1, 4, 4); } }
    },
    reset(S) { S.hj = { wire: -1, boss: false }; },
    update(dt, S, p) {
      const h = S.hj; if (h.wire < 0 && p.x > WIRE && p.x < APPLE) { h.wire = 0; A.redSays("Hey, let go!", 1.4); }
      if (h.wire >= 0 && h.wire < 9) { const b = h.wire; h.wire += dt; if (h.wire < 2.4) lock(p, WIRE); if (b < 2.4 && h.wire >= 2.4) { A.reskin(apple, {}); p.x = WIRE + 30; crowdText(A, S, "UPGRADED", WIRE, 60); } }
      if (!h.boss && p.x > BOSS - 20) { h.boss = true; A.showCaption("At the hand of Jobs."); A.say("Think different.", BOSS + 30, 60, 2.2); }
    },
    bg(t, S) {
      R("#2a2a30", 0, 0, A.W, A.H); vign(A, .7); A.layer(.4, 160, (x) => { R(A.C.ink, x + 40, 30, 80, 50); R("#2a5a8a", x + 41, 31, 78, 48); A.ctx.globalAlpha = .15; R("#ffffff", x + 50, 31, 20, 48); A.ctx.globalAlpha = 1; });
      R("#3a3a40", 0, G, A.W, 30);
      const bx = sx(A, BOX); if (bx > -50 && bx < A.W + 50) { R(A.C.ink, bx - 40, 116, 80, 4); R("#5a5a62", bx - 39, 117, 78, 2); R("#5a5a62", bx - 36, 120, 2, 30); R("#5a5a62", bx + 34, 120, 2, 30); R(A.C.ink, bx - 16, 106, 32, 10); R("#f4f4f2", bx - 15, 107, 30, 8); R("#f3a91f", bx - 13, 108, 26, 6); }
      const ox = sx(A, BOSS + 30); if (ox > -60 && ox < A.W + 60) { R(A.C.ink, ox - 17, G - 70, 34, 70); R("#d8a83a", ox - 16, G - 69, 32, 69); for (let i = 0; i < 4; i++) R("#a8822a", ox - 16, G - 60 + i * 14, 32, 2);
        A.ctx.globalAlpha = .5; disc(A, "#fff4a0", ox, G - 46, 9); A.ctx.globalAlpha = 1; disc(A, "#ffffff", ox, G - 46, 4); R("#3a8a2a", ox, G - 53, 2, 3);
        A.ctx.globalAlpha = .4; disc(A, "#cfefff", ox, G - 82, 14); A.ctx.globalAlpha = 1; A.ctx.strokeStyle = "#e8e8ec"; A.ctx.beginPath(); A.ctx.arc(ox, G - 82, 14, 0, 7); A.ctx.stroke(); oell(A, "#e8c8a8", ox, G - 82, 7, 9); R(A.C.ink, ox - 5, G - 85, 4, 2); R(A.C.ink, ox + 1, G - 85, 4, 2); R(A.C.ink, ox - 1, G - 85, 2, 1); R("#9a9a9a", ox - 6, G - 78, 12, 5);
        [-1, 1].forEach(s => { R(A.C.ink, ox + s * 20 - 2, G - 66, 4, 30); R("#d8a83a", ox + s * 20 - 1, G - 65, 2, 28); }); }
    },
    fg(t, S) {
      const h = S.hj; if (h.wire >= 0 && h.wire < 2.4) { const r = A.red; A.ctx.strokeStyle = "#e8e8e8"; A.ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { A.ctx.beginPath(); A.ctx.moveTo(r.x + Math.sin(i * 2 + t * 5) * 10, r.top - 4); A.ctx.bezierCurveTo(r.x - 20 + i * 5, r.top + 10, r.x + 20 - i * 5, r.top + 20, r.x + Math.cos(i + t * 4) * 8, G); A.ctx.stroke(); } flash(A, h.wire > 2 ? (2.4 - h.wire) * 2 : 0, "#ffffff"); }
      if (h.wire >= 2.4) onHead(A, (x, top) => { R("#6a4224", x, top - 4, 2, 5); oell(A, "#3aa83a", x + 4, top - 3, 3, 2, -.4); });
      txtFx(A, S);
    }
  };
};

/* INTERROGATION: tied to a chair. A masked man, a knife, one question. ¿El conejo? */
W["interrogation"] = A => {
  const R = A.R, G = A.G, TABLE = 600, ASK = 620;
  return {
    outfit: { W: "#f4f4f2" },
    sprites: { rope: { pal: { N: "#c8a86a" }, rows: ["NNNN", "N..N", "NNNN"] } },
    level: {
      obs: [["it_lamp", 200], ["it_lamp", 320], ["it_drip", 400], ["it_lamp", 460], ["it_drip", 520]],
      target: "it_bucket", targetAt: 280, prop: "rope", propAt: 120, npcs: [],
      captions: [[30, "Woke up somewhere dark."], [300, "Someone wants answers."], [ASK - 30, "Don't say a word."]]
    },
    obs: {
      it_lamp: { w: 10, h: 8, y: 22, vx: 0, draw(o, x, y, t) { const sw = Math.round(Math.sin(t * 2 + o.x) * 12), lx = x + sw; A.ctx.strokeStyle = "#3a3a3a"; A.ctx.beginPath(); A.ctx.moveTo(x + 5, 0); A.ctx.lineTo(lx + 5, A.G - y - 8); A.ctx.stroke(); o.x2 = sw; R(A.C.ink, lx, A.G - y - 8, 10, 5); R("#5a5a5a", lx + 1, A.G - y - 7, 8, 3); A.ctx.globalAlpha = .15; R("#fff4a0", lx - 10, A.G - y - 3, 30, y + 3); A.ctx.globalAlpha = 1; } },
      it_drip: { w: 2, h: 3, y: 0, vx: 0, draw(o, x, y, t) { const yy = (t * 120 + o.x) % A.G; R("#7ac8e6", x, yy, 1, 3); } }
    },
    targets: { it_bucket: { line: "Bucket. Classy.", draw(tg, x) { R(A.C.ink, x - 6, G - 10, 12, 10); R("#8a8a8a", x - 5, G - 9, 10, 9); R(A.C.ink, x - 6, G - 13, 12, 1); } } },
    reset(S) { S.it = { ask: -1 }; },
    update(dt, S, p) { const i = S.it; if (i.ask < 0 && p.x > ASK && p.x < ASK + 60) { i.ask = 0; A.say("¿El conejo?", TABLE + 70, 60, 2.4); }
      if (i.ask >= 0 && i.ask < 9) { const b = i.ask; i.ask += dt; if (i.ask < 4) lock(p, ASK); if (b < 2.6 && i.ask >= 2.6) A.redSays("...never heard of him.", 2); if (b < 4 && i.ask >= 4) A.showCaption("Interrogation."); } },
    bg(t, S) {
      R("#2a1a10", 0, 0, A.W, A.H); vign(A, .8); A.layer(.3, 70, (x) => R("#3a2a1a", x, 0, 1, A.H)); R("#4a2a14", 0, G, A.W, 30); A.layer(1, 16, x => R("#3a2010", x, G + 1, 1, 29));
      const tx = sx(A, TABLE + 40); if (tx > -80 && tx < A.W + 80) { A.ctx.globalAlpha = .3; A.ctx.fillStyle = "#fff4c0"; A.ctx.beginPath(); A.ctx.moveTo(tx - 10, 20); A.ctx.lineTo(tx + 10, 20); A.ctx.lineTo(tx + 70, G); A.ctx.lineTo(tx - 70, G); A.ctx.fill(); A.ctx.globalAlpha = 1; R("#3a3a3a", tx - 1, 0, 2, 14); R(A.C.ink, tx - 14, 14, 28, 6); R("#5a5a5a", tx - 13, 15, 26, 4);
        R(A.C.ink, tx - 40, 118, 80, 5); R("#6a4224", tx - 39, 119, 78, 3); R("#5a3418", tx - 36, 123, 3, 27); R("#5a3418", tx + 33, 123, 3, 27); R("#f4f4f2", tx - 6, 114, 12, 4); R(A.C.ink, tx - 3, 115, 1, 2); R(A.C.ink, tx + 1, 115, 1, 2);
        const kx = tx + 18; R("#e8e8e8", kx, 96, 3, 18); R("#6a4224", kx - 1, 112, 5, 6); if (Math.floor(t * 2) % 2) { R("#ffffff", kx + 4, 94, 1, 5); R("#ffffff", kx + 2, 96, 5, 1); }
        const mx = tx + 34; R(A.C.ink, mx - 10, 96, 20, 26); R("#5ac83a", mx - 9, 97, 18, 22); oell(A, "#5a5a5a", mx, 86, 11, 11); oell(A, "#7CFC6A", mx - 4, 84, 3, 2); oell(A, "#7CFC6A", mx + 4, 84, 3, 2); R(A.C.ink, mx - 3, 84, 1, 1); R(A.C.ink, mx + 3, 84, 1, 1); oell(A, "#f3d23b", mx, 92, 4, 2); }
    },
    fg(t, S) { const i = S.it; if (S.p.x > ASK - 120) onHead(A, (x, top) => { R("#c8a86a", x - 6, top + 15, 12, 2); R("#c8a86a", x - 6, top + 19, 12, 2); });
      if (i.ask > .4 && i.ask < 4) onHead(A, (x, top, face) => { for (let k = 0; k < 3; k++) R("#9fd0ee", x + (k - 1) * 4, top + 2 + ((t * 20 + k * 5) % 10), 1, 2); if (i.ask > 2.6) { R(A.C.ink, x + face - 3, top + 8, 6, 2); R("#f4f4f2", x + face - 2, top + 8, 4, 1); } }); }
  };
};

/* PARK WORKERS: three men with blades come for the meditating man. Nature handles it. */
W["park-workers"] = A => {
  const R = A.R, G = A.G, STUMP = 800;
  const worker = (x, t, k, dead) => { const b = Math.floor(t * 6 + k) % 2; if (dead) { oell(A, "#5ac83a", x, G - 2, 14, 3); }
    R(A.C.ink, x - 7, G - 30, 14, 30); R("#2a5ad0", x - 6, G - 29, 12, 14); R("#c87a2a", x - 6, G - 15, 12, 6); R("#6a4a2a", x - 5, G - 9, 4, 9 - b); R("#6a4a2a", x + 1, G - 9, 4, 8 + b);
    oell(A, dead ? "#5ac83a" : "#E8271A", x, G - 36, 6, 6); R(A.C.ink, x - 7, G - 43, 14, 3); R("#f3d23b", x - 6, G - 43, 12, 2); R(A.C.ink, x - 1, G - 34, 3, 1);
    const tool = ["scythe", "axe", "saw"][k % 3]; if (tool === "scythe") { R("#8a5a32", x - 10, G - 50, 2, 40); R("#e8e8e8", x - 18, G - 52, 10, 2); } else if (tool === "axe") { R("#8a5a32", x + 8, G - 30, 2, 16); R("#e8e8e8", x + 6, G - 32, 6, 5); } else { R("#f3a91f", x + 6, G - 22, 8, 6); R("#9a9a9a", x + 14, G - 20, 10, 2); } };
  return {
    sprites: { leaf: { pal: { Q: "#3aa83a" }, rows: ["..QQ", ".QQQ", "QQQ.", "Q..."] } },
    level: {
      obs: [["pw_worker", 300], ["pw_moth", 360], ["pw_worker", 480], ["pw_moth", 560], ["pw_worker", 640]],
      target: "tree", targetAt: 400, prop: "leaf", propAt: 120, npcs: [],
      captions: [[30, "Deep in the park. Quiet."], [260, "Park workers. They don't look friendly."], [STUMP - 50, "Breathe. Find your center."]]
    },
    obs: {
      pw_worker: { w: 14, h: 36, y: 0, vx: -35, tough: "HEY!", draw(o, x, y, t) { worker(x + 7, t, Math.round(o.x / 7), false); } },
      pw_moth: { w: 8, h: 6, y: 18, vx: -60, draw(o, x, y, t) { const f = Math.floor(t * 14) % 2; R(A.C.ink, x + 3, y, 2, 6); R("#f3d23b", x + (f ? 0 : 1), y + 1, 3, 4); R("#f3d23b", x + 5 - (f ? 0 : 1), y + 1, 3, 4); } }
    },
    reset(S) { S.pw = { om: -1, shots: [] }; },
    update(dt, S, p) {
      const w = S.pw; if (w.om < 0 && p.x > STUMP && p.x < STUMP + 50) { w.om = 0; A.redSays("Ommmm...", 2); }
      if (w.om >= 0 && w.om < 9) { const b = w.om; w.om += dt; if (w.om < 4.2) { lock(p, STUMP); p.y = 12 + Math.sin(w.om * 3) * 2; }
        if (b < 1.4 && w.om >= 1.4) { crowdText(A, S, "SNAP", STUMP, 60); ["rabbit", "pigeon", "moth"].forEach((k, i) => w.shots.push({ k, x: STUMP + 10, y: 30 + i * 10, tx: STUMP + 70 + i * 26, t: 0 })); }
        if (b < 2.2 && w.om >= 2.2) for (let i = 0; i < 3; i++) splash(S, STUMP + 70 + i * 26, 36, 14, "#5ac83a");
        if (b < 4.2 && w.om >= 4.2) A.showCaption("Park workers."); }
      for (const s of w.shots) s.t += dt; dropFx(A, S, dt);
    },
    bg(t, S) {
      R("#1a3a2a", 0, 0, A.W, A.H); grad(A, ["#0a1a2a", "#1a3a2a"], 0, 60); A.layer(.3, 30, (x, k) => R("#3a2a1a", x, 0, 8 + (k % 3) * 4, 120)); A.layer(.6, 46, (x, k) => R("#2a1a10", x, 0, 10 + (k % 2) * 6, 130));
      R("#2a6a2a", 0, 110, A.W, G - 110); A.layer(.8, 7, (x, k) => R("#3a8a3a", x, 116 + (k % 5) * 6, 1, 4)); R("#2a6a2a", 0, G, A.W, 30);
      const sx0 = sx(A, STUMP); oell(A, "#a8763a", sx0, G - 6, 16, 4); R(A.C.ink, sx0 - 17, G - 6, 34, 8); R("#8a5a2a", sx0 - 16, G - 6, 32, 7); ell(A, "#c8925a", sx0, G - 6, 14, 3);
      const w = S.pw; if (w.om >= 0) [0, 1, 2].forEach(i => worker(sx(A, STUMP + 70 + i * 26), t, i, w.om > 2.2));
    },
    mid(t, S) { const w = S.pw; for (const s of w.shots) { if (s.t > .8) continue; const u = s.t / .8, x = lerp(sx(A, s.x), sx(A, s.tx), u), y = G - 30 - s.y * (1 - u);
      if (s.k === "rabbit") { oell(A, "#f4f4f2", x, y, 6, 3); R("#f4f4f2", x - 6, y - 6, 2, 5); } else if (s.k === "pigeon") { oell(A, "#9a9a9a", x, y, 5, 3); R("#f3a91f", x + 5, y, 2, 1); } else { R("#f3d23b", x - 3, y - 2, 6, 4); } } },
    fg(t, S) { const w = S.pw; if (w.om >= 0 && w.om < 4.2) { A.ctx.globalAlpha = .25 + Math.sin(t * 3) * .1; disc(A, "#fff4a0", A.red.x, A.red.top + 14, 22); A.ctx.globalAlpha = 1; } txtFx(A, S); dropFx(A, S); }
  };
};
})();

/* ======================= batch 8 ======================= */
(() => {
const W = window.RED_WORLDS, { lerp, mix, disc, puff, sx } = W.__shared;
const { reds, follow, onHead, heartFx, hearts, splash, dropFx, crowdText, txtFx, smoke } = W.__shared2;
const flash = (A, a, c = "#ffffff") => { if (a <= 0) return; A.ctx.globalAlpha = Math.min(1, a); A.R(c, 0, 0, A.W, A.H); A.ctx.globalAlpha = 1; };
const grad = (A, stops, y0 = 0, y1 = A.H) => { const g = A.ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); A.ctx.fillStyle = g; A.ctx.fillRect(0, y0, A.W, y1 - y0); };
const ell = (A, c, x, y, rx, ry, rot = 0) => { A.ctx.fillStyle = c; A.ctx.beginPath(); A.ctx.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), rot, 0, 7); A.ctx.fill(); };
const oell = (A, c, x, y, rx, ry, rot = 0) => { ell(A, A.C.ink, x, y, rx + 1, ry + 1, rot); ell(A, c, x, y, rx, ry, rot); };
const lock = (p, x) => { p.x = x; p.vy = 0; p.y = 0; p.inv = Math.max(p.inv, .3); };
const text = (A, s, x, y, c, size = 6) => { A.ctx.font = `bold ${size}px monospace`; A.ctx.textAlign = "center"; A.ctx.fillStyle = c; A.ctx.fillText(s, x, y); };
const vign = (A, a = .5) => { const k = A.ctx, g = k.createRadialGradient(A.W / 2, A.H / 2, 40, A.W / 2, A.H / 2, 210); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${a})`); k.fillStyle = g; k.fillRect(0, 0, A.W, A.H); };
const torso = (ch, legs) => rows => rows.map((r, j) => (j >= 11 && j <= 19) ? r.replace(/R/g, ch).replace(/r/g, ch.toLowerCase()) : (legs && j >= 20) ? r.replace(/[RW]/g, ch).replace(/[rw]/g, ch.toLowerCase()) : r);
const lady = (pal, hair = "K") => ({ pal: Object.assign({ K: "#14110F" }, pal), rows: [
  `..${hair}${hair}${hair}${hair}${hair}...`, `.${hair}${hair}${hair}${hair}${hair}${hair}${hair}..`, `.${hair}SSSSS${hair}${hair}.`, `.${hair}SKSSKS${hair}.`, `.${hair}SSSSS${hair}${hair}.`, `.${hair}.SRRS.${hair}.`, "....SS....", "..TTTTTT..", ".TTTTTTTT.", ".STTTTTTS.", ".STTTTTTS.", "..SSSSSS..", "..BBBBBB..", "..SSSSSS..", "..SS..SS..", "..SS..SS..", "..SS..SS..", "..SS..SS..", ".SSS.SSS.."] });
const drawSpr = (A, key, wx, face = -1, dy = 0) => { const im = A.NS[face < 0 ? key + "L" : key]; A.ctx.drawImage(im, sx(A, wx) - 5, A.G - im.height + 1 + dy); };

/* SHOCKER: last call, a walk under the overpass, dinner at her tent. */
W["shocker"] = A => {
  const R = A.R, G = A.G, BAR = 160, UNDER = 420, TENT = 800;
  return {
    sprites: { her: lady({ S: "#f0a8c8", T: "#a050c0", B: "#a050c0", R: "#c84a6a" }), can8: { pal: { Z: "#e8e8e8" }, rows: ["ZZ", "RR", "ZZ"] } },
    level: {
      obs: [["sh8_can", 240], ["sh8_can", 300], ["rat", 480], ["sh8_cone", 560], ["rat", 640], ["sh8_can", 700]],
      target: "bush", targetAt: 520, prop: "can8", propAt: 100, npcs: [],
      captions: [[30, "Last call."], [BAR + 70, "She's coming home with me."], [UNDER + 20, "...her place is under the bridge."], [TENT - 40, "Dinner's ready."]]
    },
    obs: {
      sh8_can: { w: 5, h: 6, y: 0, vx: -40, draw(o, x, y) { R(A.C.ink, x, y, 5, 6); R("#e8e8e8", x + 1, y + 1, 3, 4); R("#E8271A", x + 1, y + 2, 3, 2); } },
      sh8_cone: { w: 10, h: 10, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x + 3, y, 4, 10); R("#f3a91f", x + 4, y + 1, 2, 9); R(A.C.ink, x, y + 9, 10, 1); } }
    },
    reset(S) { S.s8 = { h: { x: BAR + 30, y: 0, d: 0, face: 1, moving: false }, met: false, eat: -1 }; },
    update(dt, S, p) {
      const s = S.s8; if (!s.met && p.x > BAR + 30) { s.met = true; A.say("You're cute. Got a car?", BAR + 30, 50, 2); }
      if (s.met && s.eat < 0) { follow(s.h, p.x + 14, 110, dt); if (Math.abs(s.h.x - p.x) > 120) s.h.x = p.x + 30; }
      if (s.eat < 0 && p.x > TENT - 30 && p.x < TENT + 40) { s.eat = 0; s.h.x = TENT + 10; }
      if (s.eat >= 0 && s.eat < 9) { const b = s.eat; s.eat += dt; if (s.eat < 2.6) lock(p, TENT - 30); if (b < 1 && s.eat >= 1) { splash(S, TENT + 12, 22, 14, "#c81a1a"); crowdText(A, S, "SKREE", TENT + 12, 56); } if (b < 2.6 && s.eat >= 2.6) { A.showCaption("Shocker."); A.redSays("...I'm gonna go wash my hand.", 2.2); } }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < UNDER) { R("#14143a", 0, 0, A.W, A.H); A.stars({}); const bx = sx(A, BAR); R(A.C.ink, bx - 81, 60, 162, G - 60); R("#5a5a62", bx - 80, 61, 160, G - 61); for (let i = 0; i < 16; i++) disc(A, Math.floor(t * 3 + i) % 2 ? "#f3d23b" : "#f8e8a0", bx - 76 + i * 10, 64, 1.5);
        for (let i = 0; i < 4; i++) { R(A.C.ink, bx - 70 + i * 38, 82, 22, 26); R("#e8e8e0", bx - 69 + i * 38, 83, 20, 24); R(["#E8271A", "#5aa83a", "#f3d23b", "#3a8ae0"][i], bx - 62 + i * 38, 90, 6, 10); } R(A.C.ink, bx + 50, 110, 16, 40); R("#f3a91f", bx + 51, 111, 14, 39);
        R(A.C.ink, bx + 40, 36, 40, 22); R("#f4f4f2", bx + 41, 37, 38, 20); disc(A, "#E8271A", bx + 60, 47, 5); R("#3a3a3a", 0, G, A.W, 30); }
      else { R("#14143a", 0, 0, A.W, A.H); A.stars({}); disc(A, "#f4f4ec", 260, 20, 4); A.ctx.fillStyle = "#4a4a52"; A.ctx.beginPath(); A.ctx.moveTo(0, 30); A.ctx.lineTo(A.W, 10); A.ctx.lineTo(A.W, 40); A.ctx.lineTo(0, 56); A.ctx.fill();
        A.layer(.5, 120, (xx) => { R("#5a5a62", xx + 20, 50, 16, 90); R("#6a6a72", xx + 22, 50, 4, 90); }); R("#3aa83a", 0, 100, A.W, 34); A.layer(.6, 18, (xx, k) => disc(A, "#2a8a2a", xx, 100, 10 + (k % 3) * 3));
        const lx = sx(A, UNDER + 60); R("#5a5a5a", lx, 70, 2, 70); A.ctx.globalAlpha = .4; disc(A, "#f3d23b", lx + 1, 72, 24); A.ctx.globalAlpha = 1; R("#f3d23b", lx - 2, 68, 6, 4);
        const sg = sx(A, UNDER + 180); R(A.C.ink, sg - 1, 110, 2, 30); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(sg, 96); A.ctx.lineTo(sg + 10, 106); A.ctx.lineTo(sg, 116); A.ctx.lineTo(sg - 10, 106); A.ctx.fill(); A.ctx.fillStyle = "#f3d23b"; A.ctx.beginPath(); A.ctx.moveTo(sg, 98); A.ctx.lineTo(sg + 8, 106); A.ctx.lineTo(sg, 114); A.ctx.lineTo(sg - 8, 106); A.ctx.fill(); text(A, "DEAD", sg, 105, A.C.ink, 3); text(A, "END", sg, 109, A.C.ink, 3);
        R("#c8822a", 0, 134, A.W, G - 134); R("#8a5a2a", 0, G, A.W, 30);
        const tx = sx(A, TENT + 50); A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(tx - 31, G); A.ctx.lineTo(tx, G - 34); A.ctx.lineTo(tx + 31, G); A.ctx.fill(); A.ctx.fillStyle = "#4a5ad0"; A.ctx.beginPath(); A.ctx.moveTo(tx - 29, G - 1); A.ctx.lineTo(tx, G - 32); A.ctx.lineTo(tx + 29, G - 1); A.ctx.fill(); A.ctx.fillStyle = "#1a1a3a"; A.ctx.beginPath(); A.ctx.moveTo(tx - 8, G - 1); A.ctx.lineTo(tx, G - 18); A.ctx.lineTo(tx + 8, G - 1); A.ctx.fill(); }
    },
    mid(t, S) { const s = S.s8; if (!s.met) { drawSpr(A, "her", BAR + 30, -1); return; } drawSpr(A, "her", s.h.x, s.eat >= 0 ? -1 : s.h.face);
      if (s.eat >= .3 && s.eat < 2.6) { const x = sx(A, s.h.x) - 6; R("#8a8a8a", x - 4, G - 20, 6, 4); R("#8a8a8a", x - 8, G - 19, 4, 1); if (s.eat > 1) R("#c81a1a", x - 2, G - 16, 3, 4); } },
    fg(t, S) { if (S.s8.eat > 1.6) onHead(A, (x, top, face) => { R("#c81a1a", x + face * 8, top + 17, 2, 2); R("#a050c0", x + face * 8, top + 19, 2, 1); }); txtFx(A, S); dropFx(A, S); }
  };
};

/* DUTCH OVEN: cozy under the covers. Then he holds the blanket down. */
W["dutch-oven"] = A => {
  const R = A.R, G = A.G, HER = 760;
  return {
    sprites: { her: lady({ S: "#f0a8c8", T: "#f0a8c8", B: "#f0a8c8", R: "#c84a6a" }), pillow: { pal: { Z: "#cfe0f8" }, rows: ["ZZZZZ", "ZZZZZ", "ZZZZZ"] } },
    level: {
      obs: [["do_lump", 200], ["do_lump", 320], ["do_lump", 440], ["do_lump", 560], ["do_lump", 640]],
      target: "do_pot", targetAt: 380, prop: "pillow", propAt: 120, npcs: [],
      captions: [[30, "Lazy Sunday. Big blanket."], [300, "Something's brewing."], [HER - 50, "Hold it down. Trust me."]]
    },
    obs: { do_lump: { w: 14, h: 6, y: 0, vx: 0, draw(o, x, y) { oell(A, "#2a5ad0", x + 7, A.G - 2, 8, 5); R("#4a7ae8", x + 3, A.G - 5, 4, 1); } } },
    targets: { do_pot: { line: "Chamber pot. Classy.", draw(tg, x) { R(A.C.ink, x - 6, G - 9, 12, 9); R("#c8c8c8", x - 5, G - 8, 10, 8); R(A.C.ink, x - 8, G - 7, 2, 3); } } },
    reset(S) { S.d8 = { gas: [], oven: -1 }; },
    update(dt, S, p) {
      const d = S.d8; if (d.oven < 0 && Math.random() < dt * 3) d.gas.push({ x: p.x - p.face * 5, y: 10, t: 0 }); for (const g of d.gas) { g.t += dt; g.y += dt * 8; } d.gas = d.gas.filter(g => g.t < 3);
      if (d.oven < 0 && p.x > HER - 24 && p.x < HER + 30) { d.oven = 0; A.redSays("Hehehe.", 1.2); }
      if (d.oven >= 0 && d.oven < 9) { const b = d.oven; d.oven += dt; if (d.oven < 3) lock(p, HER - 24); if (b < 3 && d.oven >= 3) { A.showCaption("Dutch oven."); A.redSays("...babe?", 1.8); } }
    },
    bg(t, S) {
      R("#d8b84a", 0, 0, A.W, A.H); A.layer(.4, 8, (x, k) => R("#c8a83a", x + A.hash(k, 1) * 6, A.hash(k, 2) * 120, 1, 1));
      A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(0, G - 18); for (let x = 0; x <= A.W; x += 16) A.ctx.quadraticCurveTo(x + 8, G - 24 + Math.sin(x * .2 + S.camX * .02) * 3, x + 16, G - 18); A.ctx.lineTo(A.W, A.H); A.ctx.lineTo(0, A.H); A.ctx.fill();
      R("#2a5ad0", 0, G - 17, A.W, A.H); A.layer(1, 22, (x, k) => R("#1a4ab0", x, G - 14 + (k % 4) * 6, 10, 1));
      const hx = sx(A, HER + 20); oell(A, "#cfe0f8", hx + 22, G - 20, 14, 6);
    },
    mid(t, S) {
      const d = S.d8, hx = sx(A, HER + 20);
      for (const g of d.gas) { A.ctx.globalAlpha = .5 * (1 - g.t / 3); disc(A, "#7CFC6A", sx(A, g.x), A.G - g.y, 3 + g.t * 3); } A.ctx.globalAlpha = 1;
      if (d.oven < 1.2) { oell(A, "#f0a8c8", hx + 18, G - 24, 6, 6); R(A.C.ink, hx + 12, G - 30, 12, 4); R(A.C.ink, hx + 20, G - 28, 4, 10); R(A.C.ink, hx + 15, G - 24, 1, 1); R(A.C.ink, hx + 13, G - 21, 4, 1); }
      else { oell(A, "#f4f4f2", hx + 18, G - 24, 6, 6); R(A.C.ink, hx + 14, G - 26, 2, 2); R(A.C.ink, hx + 19, G - 26, 2, 2); R(A.C.ink, hx + 15, G - 21, 6, 1); for (let i = 0; i < 3; i++) { R("#7CFC6A", hx + 15 + i * 2, G - 34 - ((t * 20 + i * 4) % 10), 1, 3); } }
    },
    fg(t, S) {
      const d = S.d8, hx = sx(A, HER + 20); R(A.C.ink, hx - 10, G - 18, 50, 2); R("#2a5ad0", hx - 10, G - 17, 50, 18);
      if (d.oven >= 0 && d.oven < 2.4) { const u = d.oven; A.ctx.globalAlpha = Math.min(.8, u * .6); for (let i = 0; i < 9; i++) puff(A, hx + 10 + Math.sin(t * 3 + i) * 20, G - 20 - (i * 7 + u * 30) % 70, 8 + (i % 3) * 4, "#7CFC6A", .5); A.ctx.globalAlpha = 1; flash(A, u > 1 && u < 1.4 ? (1.4 - u) * 2 : 0, "#7CFC6A"); }
    }
  };
};

/* WIZARD SACK: a night at the pole, a ride home, and the goblins take everything. */
W["wizard-sack"] = A => {
  const R = A.R, G = A.G, CLUB = 200, RIDE = 380, HOME = 620, MOON = 840, GOB = "#5ab85a";
  const robe = torso("U", true);
  const gob = (x, t, k, y = 0) => { const b = Math.round(Math.sin(t * 4 + k) * 2); R(A.C.ink, x - 4, G - 18 - y + b, 8, 14); R(GOB, x - 3, G - 17 - y + b, 6, 12); R("#c870d0", x - 3, G - 12 - y + b, 6, 2); R("#c870d0", x - 3, G - 7 - y + b, 6, 2); oell(A, GOB, x, G - 22 - y + b, 4, 4); R("#e070d0", x - 4, G - 28 - y + b, 8, 4); R(A.C.ink, x - 1, G - 23 - y + b, 1, 1); R(GOB, x - 4, G - 4 - y, 2, 4); R(GOB, x + 2, G - 4 - y, 2, 4); };
  return {
    sprites: { sack: { pal: { N: "#c8a06a", Y: "#f3d23b" }, rows: [".NN.", "NNNN", "NYNN", "NNNN", ".NN."] } },
    level: {
      obs: [["wz_coin", 160], ["wz_gob", 300], ["wz_coin", 420], ["wz_gob", 520], ["wz_gob", 700], ["wz_coin", 760]],
      target: "wz_pole", targetAt: 260, prop: "sack", propAt: 110, npcs: [],
      captions: [[30, "The wizard's night out."], [RIDE + 20, "Ride home, full moon."], [HOME + 20, "Someone's in the bedroom."], [MOON - 40, "...where's my sack?"]]
    },
    obs: {
      wz_coin: { w: 4, h: 4, y: 0, vx: 0, draw(o, x, y, t) { R(A.C.ink, x, y, 4, 4); R("#f3d23b", x + 1, y + 1, 2, 2); if (Math.floor(t * 4 + o.x) % 3 === 0) R("#ffffff", x + 1, y + 1, 1, 1); } },
      wz_gob: { w: 8, h: 26, y: 0, vx: -70, draw(o, x, y, t) { gob(x + 4, t, o.x, 0); R(A.C.ink, x + 6, A.G - 16, 5, 5); R("#c8a06a", x + 7, A.G - 15, 3, 3); } }
    },
    targets: { wz_pole: { line: "Tipping the pole.", draw(tg, x, t) { R("#d8b84a", x - 1, 20, 2, G - 20); R(A.C.ink, x - 12, G - 6, 24, 6); R("#2a2a2a", x - 11, G - 5, 22, 5); gob(x + 3, t, 1, 18); } } },
    reset(S) { S.wz = { dressed: false, stolen: false }; },
    update(dt, S, p) { const w = S.wz; if (!w.dressed) { w.dressed = true; A.reskin(robe, { U: "#3a5ad0", u: "#2a4ab0" }); }
      if (!w.stolen && p.x > MOON - 20) { w.stolen = true; A.reskin(r => r); A.showCaption("Wizard sack."); A.redSays("They took my robe too?!", 2); } },
    bg(t, S) {
      const x = S.p.x;
      if (x < RIDE) { R("#2a1a14", 0, 0, A.W, A.H); vign(A, .6); R("#4a2a1a", 0, G, A.W, 30); A.layer(.6, 90, (xx) => { R("#3a2414", xx, 0, 1, G); disc(A, "#f3d23b", xx + 40, 12, 2); });
        const st = sx(A, CLUB + 20); R(A.C.ink, st - 30, G - 14, 60, 14); R("#2a2a2a", st - 29, G - 13, 58, 13); for (let i = 0; i < 9; i++) R("#f3d23b", st - 26 + i * 6, G - 15 - (i % 2), 2, 2); }
      else if (x < HOME) { R("#1a2a6a", 0, 0, A.W, A.H); A.stars({}); disc(A, "#f4f4ec", 220, 30, 14); A.layer(.2, 140, (xx) => { A.ctx.fillStyle = "#3a2a1a"; A.ctx.beginPath(); A.ctx.moveTo(xx, 110); A.ctx.lineTo(xx + 20, 70); A.ctx.lineTo(xx + 50, 70); A.ctx.lineTo(xx + 70, 110); A.ctx.fill(); });
        R("#2a4a2a", 0, 110, A.W, G - 110); R("#3a2a1a", 0, G, A.W, 30); }
      else if (x < MOON - 60) { R("#5a3a1a", 0, 0, A.W, A.H); A.layer(.6, 14, xx => R("#4a2a10", xx, 0, 1, G)); vign(A, .5); const fx = sx(A, HOME + 60); R(A.C.ink, fx - 20, 90, 40, 40); R("#2a1a10", fx - 18, 92, 36, 36); puff(A, fx, 120, 8 + Math.sin(t * 6), "#f3a91f", .9);
        const bx = sx(A, HOME + 140); R(A.C.ink, bx - 40, 120, 80, 30); R("#d8b84a", bx - 39, 121, 78, 29); R("#6a4224", bx - 42, 100, 6, 50); R(A.C.ink, bx - 40, 130, 80, 1); R("#4a2a10", 0, G, A.W, 30); }
      else { R("#1a2a6a", 0, 0, A.W, A.H); A.stars({}); disc(A, "#ffffff", 160, 54, 26); A.ctx.globalAlpha = .25; disc(A, "#ffffff", 160, 54, 40); A.ctx.globalAlpha = 1; R("#2a5a2a", 0, 110, A.W, A.H);
        const gx = sx(A, MOON + 50); A.ctx.globalAlpha = .5; disc(A, "#f3d23b", gx, G - 4, 26); A.ctx.globalAlpha = 1; oell(A, "#d8b84a", gx, G - 4, 18, 5); for (let i = 0; i < 10; i++) R("#f3d23b", gx - 14 + (i * 7) % 28, G - 7 + (i % 3), 2, 2);
        gob(gx - 24, t, 1); gob(gx + 24, t, 2); R(GOB, gx - 21, G - 36 + Math.round(Math.sin(t * 6) * 3), 2, 10); R(GOB, gx + 21, G - 36 + Math.round(Math.cos(t * 6) * 3), 2, 10); }
    },
    mid(t, S) { const x = S.p.x; if (x > RIDE && x < HOME) { const r = A.red, b = Math.abs(Math.sin(t * 8)) * 2; oell(A, "#f4f4f2", r.x, G - 14 - b, 14, 7); R("#8a4a2a", r.x - 8, G - 18 - b, 6, 6); R("#8a4a2a", r.x + 4, G - 14 - b, 5, 4); oell(A, "#f4f4f2", r.x + 14 * r.face, G - 22 - b, 5, 5);
        for (let i = 0; i < 4; i++) R(A.C.ink, r.x - 10 + i * 6, G - 8 - b, 2, 8 + b); } },
    fg(t, S) { const w = S.wz; if (w.stolen) return; onHead(A, (x, top, face) => { A.ctx.fillStyle = A.C.ink; A.ctx.beginPath(); A.ctx.moveTo(x - 9, top + 2); A.ctx.lineTo(x - face * 4, top - 16); A.ctx.lineTo(x + 9, top + 2); A.ctx.fill(); A.ctx.fillStyle = "#3a5ad0"; A.ctx.beginPath(); A.ctx.moveTo(x - 8, top + 1); A.ctx.lineTo(x - face * 4, top - 14); A.ctx.lineTo(x + 8, top + 1); A.ctx.fill();
      R("#f3d23b", x - 3, top - 6, 1, 1); R("#f3d23b", x + 2, top - 2, 1, 1); R("#f4f4f2", x - 4 + face * 2, top + 7, 8, 10); R("#f4f4f2", x - 2 + face * 2, top + 17, 4, 3); }); }
  };
};

/* RARE TEE: the happiest shirt in the store. Then a car. Then a museum. */
W["rare-tee"] = A => {
  const R = A.R, G = A.G, STORE = 200, CROSS = 500, GALLERY = 760;
  const tee = torso("T", false);
  const teeFace = (x, y, sad, stained) => { R(A.C.ink, x - 1, y - 1, 2, 2); R(A.C.ink, x + 3, y - 1, 2, 2); if (sad) R(A.C.ink, x, y + 3, 4, 1); else { R(A.C.ink, x, y + 3, 4, 1); R(A.C.ink, x - 1, y + 2, 1, 1); R(A.C.ink, x + 4, y + 2, 1, 1); } if (stained) { disc(A, "#5ac83a", x - 3, y + 6, 2); disc(A, "#5ac83a", x + 6, y, 1.5); } };
  return {
    sprites: { hanger: { pal: { G: "#9a9a9a" }, rows: ["..G..", ".G.G.", "GGGGG"] } },
    level: {
      obs: [["rt_rack", 140], ["rt_cone", 360], ["rt_car", 440], ["rt_cone", 620], ["rt_rope", 720]],
      target: "rt_bin", targetAt: 300, prop: "hanger", propAt: 100, npcs: [],
      captions: [[30, "Shopping. Something's smiling at me."], [STORE + 20, "Perfect fit."], [CROSS - 40, "Walk sign's on."], [GALLERY - 20, "...on display?"]]
    },
    obs: {
      rt_rack: { w: 20, h: 14, y: 0, vx: 0, draw(o, x, y) { R("#9a9a9a", x, y, 20, 1); R("#9a9a9a", x, y, 1, 14); R("#9a9a9a", x + 19, y, 1, 14); for (let i = 0; i < 5; i++) R(["#3a3a3a", "#8a5a32", "#3a8ae0", "#2a2a5a", "#5a5a5a"][i], x + 2 + i * 3, y + 1, 3, 9); } },
      rt_cone: { w: 8, h: 9, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x + 2, y, 4, 9); R("#f3a91f", x + 3, y + 1, 2, 8); R("#f4f4f2", x + 3, y + 4, 2, 1); R(A.C.ink, x, y + 8, 8, 1); } },
      rt_car: { w: 30, h: 12, y: 0, vx: -120, tough: "BEEP", draw(o, x, y) { R(A.C.ink, x, y + 3, 30, 8); R("#c87a3a", x + 1, y + 4, 28, 6); R(A.C.ink, x + 6, y - 2, 16, 6); R("#9fd0ee", x + 7, y - 1, 14, 4); disc(A, A.C.ink, x + 6, y + 11, 3); disc(A, A.C.ink, x + 24, y + 11, 3); } },
      rt_rope: { w: 20, h: 8, y: 0, vx: 0, draw(o, x, y) { R("#d8b84a", x, y, 2, 8); R("#d8b84a", x + 18, y, 2, 8); A.ctx.strokeStyle = "#c81a1a"; A.ctx.lineWidth = 2; A.ctx.beginPath(); A.ctx.moveTo(x + 1, y + 1); A.ctx.quadraticCurveTo(x + 10, y + 6, x + 19, y + 1); A.ctx.stroke(); } }
    },
    targets: { rt_bin: { line: "Litter. Rude.", draw(tg, x) { R(A.C.ink, x - 5, G - 12, 10, 12); R("#3a8ae0", x - 4, G - 11, 8, 11); R(A.C.ink, x - 6, G - 13, 12, 2); } } },
    reset(S) { S.rt = { worn: false, hit: -1 }; },
    update(dt, S, p) {
      const r = S.rt; if (!r.worn && p.x > STORE) { r.worn = true; A.reskin(tee, { T: "#4a8ae0", t: "#3a6ac0" }); A.say(":)", STORE, 40, 1.4); }
      if (r.hit < 0 && r.worn && p.x > CROSS && p.x < CROSS + 50) { r.hit = 0; }
      if (r.hit >= 0 && r.hit < 9) { const b = r.hit; r.hit += dt; if (r.hit < 2) lock(p, CROSS); if (b < .6 && r.hit >= .6) { A.reskin(rows => rows); crowdText(A, S, "SKRRT", CROSS, 60); splash(S, CROSS, 20, 14, "#5ac83a"); A.redSays("MY SHIRT!", 1.6); } }
      if (p.x > GALLERY + 40 && !r.cap) { r.cap = 1; A.showCaption("Rare tee."); A.redSays("...that's MY shirt.", 2); }
      dropFx(A, S, dt);
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < STORE + 60) { R("#e8a83a", 0, 0, A.W, A.H); R("#2a2a2a", 0, 0, A.W, 30); A.layer(.3, 50, xx => { R("#f4f4f2", xx, 0, 22, 8); }); R("#d8d8d0", 0, 120, A.W, A.H); R("#c8c8c0", 0, G, A.W, 30);
        const sx0 = sx(A, STORE); R(A.C.ink, sx0 - 1, 60, 2, 60); R(A.C.ink, sx0 - 16, 46, 32, 16); R("#f4f4f2", sx0 - 15, 47, 30, 14); R("#5ac85a", sx0 - 6, 50, 12, 8);
        if (!S.rt.worn) { R(A.C.ink, sx0 - 12, 70, 24, 22); R("#4a8ae0", sx0 - 11, 71, 22, 20); R("#4a8ae0", sx0 - 15, 71, 4, 6); R("#4a8ae0", sx0 + 11, 71, 4, 6); teeFace(sx0 - 2, 78, false); A.ctx.drawImage(A.NS.hanger, sx0 - 2, 66); } }
      else if (x < GALLERY) { R("#d8b84a", 0, 0, A.W, 100); A.layer(.3, 30, (xx, k) => disc(A, "#3a8a3a", xx + 10, 100, 12 + (k % 3) * 4)); R("#5a5a5a", 0, 100, A.W, A.H); R("#9a9a9a", 0, 112, A.W, 6);
        const cx = sx(A, CROSS); for (let i = 0; i < 6; i++) R("#f4f4f2", cx - 30 + i * 10, G + 2, 6, 26); const px = sx(A, CROSS + 40); R("#8a8a8a", px - 2, 50, 4, 100); R(A.C.ink, px - 9, 50, 18, 18); R("#2a2a2a", px - 8, 51, 16, 16); R("#f4f4f2", px - 2, 54, 4, 4); R("#f4f4f2", px - 3, 58, 6, 6);
        if (S.rt.hit >= .6) { const u = Math.min(1, (S.rt.hit - .6) / 1.2), tx = lerp(cx, cx + 120, u), ty = G - 30 - Math.sin(u * Math.PI) * 40 + u * 26; A.ctx.save(); A.ctx.translate(tx, ty); A.ctx.rotate(u * 6); R("#4a8ae0", -10, -8, 20, 16); teeFace(-2, -3, true, true); A.ctx.restore(); }
        R("#5a5a5a", 0, G, A.W, 30); }
      else { R("#e8e8e4", 0, 0, A.W, A.H); vign(A, .5); const gx = sx(A, GALLERY + 70); A.ctx.globalAlpha = .4; A.ctx.fillStyle = "#ffffff"; A.ctx.beginPath(); A.ctx.moveTo(gx - 10, 0); A.ctx.lineTo(gx + 10, 0); A.ctx.lineTo(gx + 40, G); A.ctx.lineTo(gx - 40, G); A.ctx.fill(); A.ctx.globalAlpha = 1;
        R(A.C.ink, gx - 16, 50, 32, 30); R("#4a8ae0", gx - 15, 51, 30, 28); R("#4a8ae0", gx - 20, 51, 5, 8); R("#4a8ae0", gx + 15, 51, 5, 8); teeFace(gx - 2, 60, true, true); A.ctx.drawImage(A.NS.hanger, gx - 2, 44);
        R(A.C.ink, gx - 8, 88, 16, 5); R("#f4f4f2", gx - 7, 89, 14, 3); R("#c81a1a", gx + 2, 89, 5, 3); R("#c8c8c0", 0, G, A.W, 30);
        A.layer(1.1, 14, (xx, k) => { R("#2a2a2a", xx, A.H - 14, 10, 14); disc(A, "#2a2a2a", xx + 5, A.H - 16, 5); }); }
    },
    fg(t, S) { if (S.rt.worn && S.rt.hit < .6) onHead(A, (x, top) => teeFace(x - 2, top + 13, false)); txtFx(A, S); dropFx(A, S); }
  };
};

/* TRIMMING HER HEDGES: mowing the lawn by the pool. The neighbor's overgrown. */
W["trimming-her-hedges"] = A => {
  const R = A.R, G = A.G, LADY = 520, TRIM = 780;
  const hairy = (x, t, u) => { const k = A.ctx; if (u < 1) { k.globalAlpha = 1 - u; oell(A, "#1a1a1a", x, G - 26, 16, 26); for (let i = 0; i < 16; i++) R("#2a2a2a", x - 14 + (i * 5) % 28, G - 48 + (i * 7) % 44, 1, 4); k.globalAlpha = 1; }
    R(A.C.ink, x - 6, G - 44, 12, 44); R("#d070e0", x - 5, G - 43, 10, 43); R("#f3a91f", x - 6, G - 32, 12, 3); R("#f3a91f", x - 6, G - 20, 12, 3); oell(A, "#d070e0", x, G - 50, 6, 7); disc(A, "#f3a91f", x - 3, G - 51, 2); disc(A, "#f3a91f", x + 3, G - 51, 2); R(A.C.ink, x - 2, G - 46, 4, 1);
    if (u < 1) { k.globalAlpha = 1 - u; R("#1a1a1a", x - 8, G - 58, 16, 6); R("#1a1a1a", x - 8, G - 50, 3, 14); R("#1a1a1a", x + 5, G - 50, 3, 14); k.globalAlpha = 1; } };
  return {
    outfit: { W: "#f4f4f2" },
    sprites: { shears: { pal: { G: "#c8c8c8", N: "#c81a1a" }, rows: ["G...G", ".G.G.", "..N..", ".N.N."] } },
    level: {
      obs: [["th_tuft", 180], ["th_tuft", 260], ["th_tuft", 340], ["th_rock", 420], ["th_tuft", 620], ["th_tuft", 700]],
      target: "bush", targetAt: 460, prop: "shears", propAt: 600, npcs: [],
      captions: [[30, "Sunday chores. Lawn first."], [LADY - 60, "The neighbor's... overgrown."], [TRIM - 40, "She asked nicely."]]
    },
    obs: {
      th_tuft: { w: 10, h: 6, y: 0, vx: 0, draw(o, x, y, t) { for (let i = 0; i < 5; i++) R("#2a8a2a", x + i * 2, y + (i % 2), 1, 6 - (i % 2)); } },
      th_rock: { w: 8, h: 5, y: 0, vx: 0, draw(o, x, y) { oell(A, "#8a8a8a", x + 4, y + 3, 4, 3); } }
    },
    reset(S) { S.th = { trim: -1, clumps: [] }; },
    update(dt, S, p) {
      const h = S.th; if (h.trim < 0 && p.x > TRIM && p.x < TRIM + 50) { h.trim = 0; A.say("Trim it all, honey.", TRIM + 30, 66, 1.8); }
      if (h.trim >= 0 && h.trim < 9) { const b = h.trim; h.trim += dt; if (h.trim < 3) { lock(p, TRIM); if (Math.random() < dt * 14) h.clumps.push({ x: TRIM + 30, y: 30 + Math.random() * 20, vx: (Math.random() - .3) * 80, vy: 30 + Math.random() * 40 }); if (Math.floor(b * 6) !== Math.floor(h.trim * 6)) crowdText(A, S, "SNIP", TRIM + 30 + (Math.random() - .5) * 30, 60); }
        if (b < 3 && h.trim >= 3) { A.showCaption("Trimming her hedges."); A.redSays("Smooth.", 1.6); } }
      for (const c of h.clumps) { c.vy -= 140 * dt; c.x += c.vx * dt; c.y = Math.max(0, c.y + c.vy * dt); }
    },
    bg(t, S) {
      grad(A, ["#3a5aa0", "#8ab0d8"], 0, 80); R("#3aa83a", 0, 80, A.W, G - 80); const px = sx(A, 400, .6); R("#9a9a9a", px - 70, 92, 140, 30); R("#4ab0e8", px - 66, 95, 132, 24); A.layer(.6, 13, (x, k) => { if (x > px - 64 && x < px + 60) R("#9fe0f4", x + (Math.floor(t * 2 + k) % 4), 99 + (k % 4) * 5, 5, 1); });
      R("#3aa83a", 0, G, A.W, 30); A.layer(1, 4, (x, k) => R("#2a982a", x, G + 1 + (k % 5) * 5, 1, 3));
      if (S.p.x > LADY - 160) hairy(sx(A, LADY + 40 + (S.p.x > TRIM - 100 ? 270 : 0)), t, S.th.trim < 0 ? 0 : Math.min(1, S.th.trim / 3));
      for (const c of S.th.clumps) R("#1a1a1a", sx(A, c.x), G - Math.round(c.y) - 2, 3, 2);
    },
    fg(t, S) {
      const h = S.th; onHead(A, (x, top, face) => { if (h.trim >= 0 && h.trim < 3) { A.ctx.drawImage(A.NS[face > 0 ? "shears" : "shearsL"], x + face * 8 - 2, top + 10 + (Math.floor(t * 12) % 2)); return; }
        const mx = x + face * 14; R(A.C.ink, x + face * 4, top + 16, face * 10 || 1, 1); R(A.C.ink, mx - 6, G - 8, 12, 6); R("#e8c83a", mx - 5, G - 7, 10, 4); disc(A, A.C.ink, mx - 4, G - 1, 2); disc(A, A.C.ink, mx + 4, G - 1, 2); if (S.p.x !== h.lx) { h.lx = S.p.x; R("#2a982a", mx - face * 8, G - 4 - Math.random() * 6, 2, 2); } });
      txtFx(A, S);
    }
  };
};

/* DOG THE PLUG: the airport sniffer dog finds the stash, does his time, and goes into business. */
W["dog-the-plug"] = A => {
  const R = A.R, G = A.G, SNIFF = 220, JAIL = 460, HOLE = 800, DOGC = "#d8a83a";
  const dog = (x, t, sit, face = -1) => { const b = sit ? 0 : Math.floor(t * 8) % 2; oell(A, DOGC, x, G - 9 - (sit ? 2 : 0), 10, 6); R("#3a7a3a", x - 6, G - 15, 12, 8); R("#f3d23b", x - 2, G - 13, 4, 2); oell(A, DOGC, x + face * 10, G - 17, 6, 5); R("#a87a2a", x + face * 13, G - 19, 3, 6); R(A.C.ink, x + face * 12, G - 18, 1, 1); R(A.C.ink, x + face * 16, G - 16, 2, 2);
    R(A.C.ink, x - 7, G - 4, 2, 4 - b); R(A.C.ink, x + 5, G - 4, 2, 4 - b); R(A.C.ink, x - 3, G - 4, 2, 3 + b); R(DOGC, x - face * 11, G - 14 - b, 2, 6); };
  return {
    sprites: { suitcase: { pal: { P: "#8a3ac0" }, rows: [".KK.", "PPPP", "PPPP", "PPPP"] } },
    level: {
      obs: [["dp_brick", 180], ["dp_brick", 200], ["dp_brick", 300], ["dp_bars", 520], ["dp_brick", 600], ["dp_cash", 680]],
      target: "rock", targetAt: 380, prop: "suitcase", propAt: 100, npcs: [],
      captions: [[30, "Airport. Just a little carry-on."], [SNIFF - 30, "Good boy found something."], [JAIL + 20, "Busted. Both of us."], [HOLE - 60, "Back out. New business."]]
    },
    obs: {
      dp_brick: { w: 10, h: 5, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 10, 5); R("#f4f4f2", x + 1, y + 1, 8, 3); R("#d8d8d0", x + 2, y + 2, 6, 1); } },
      dp_bars: { w: 4, h: 40, y: 0, vx: 0, tough: "clang", draw(o, x, y) { for (let i = 0; i < 2; i++) R("#5a5a5a", x + i * 3, A.G - 40, 1, 40); } },
      dp_cash: { w: 7, h: 4, y: 14, vx: -40, draw(o, x, y) { R(A.C.ink, x, y, 7, 4); R("#5aa83a", x + 1, y + 1, 5, 2); } }
    },
    reset(S) { S.dp = { sniff: -1 }; },
    update(dt, S, p) { const d = S.dp; if (d.sniff < 0 && p.x > SNIFF && p.x < SNIFF + 50) { d.sniff = 0; A.say("*sniff sniff* BORK!", SNIFF + 40, 40, 1.8); }
      if (d.sniff >= 0 && d.sniff < 9) { const b = d.sniff; d.sniff += dt; if (d.sniff < 1.6 && p.x < SNIFF + 60) lock(p, SNIFF); }
      if (p.x > HOLE - 10 && !d.deal) { d.deal = 1; A.showCaption("Dog the plug."); A.redSays("Same as last time, buddy.", 2); } },
    bg(t, S) {
      const x = S.p.x;
      if (x < JAIL) { R("#7ab8e8", 0, 0, A.W, A.H); A.layer(.2, 120, (xx) => { R("#9a9a9a", xx + 20, 0, 24, G); R("#b8b8b8", xx + 24, 0, 4, G); }); A.ctx.globalAlpha = .3; A.ctx.fillStyle = "#ffffff"; A.ctx.beginPath(); A.ctx.moveTo(200, 0); A.ctx.lineTo(230, 0); A.ctx.lineTo(170, G); A.ctx.lineTo(140, G); A.ctx.fill(); A.ctx.globalAlpha = 1;
        R("#c8c8c8", 0, 120, A.W, A.H); R("#b8b8b8", 0, G, A.W, 30); A.layer(1, 24, xx => R("#a8a8a8", xx, G + 1, 1, 29)); dog(sx(A, SNIFF + 40), t, S.dp.sniff >= 0, -1);
        if (S.dp.sniff >= 0) { const bx = sx(A, SNIFF + 70); for (let j = 0; j < 4; j++) for (let i = 0; i < 5 - j; i++) { R(A.C.ink, bx + i * 9 + j * 4, G - 6 - j * 5, 9, 5); R("#f4f4f2", bx + 1 + i * 9 + j * 4, G - 5 - j * 5, 7, 3); } } }
      else if (x < HOLE - 100) { R("#2a2a2a", 0, 0, A.W, A.H); vign(A, .5); A.layer(.8, 7, xx => R("#4a4a4a", xx, 20, 2, G - 20)); R("#3a3a3a", 0, G, A.W, 30);
        const cx = sx(A, JAIL + 120); A.ctx.globalAlpha = .4; A.ctx.fillStyle = "#f8f0b0"; A.ctx.beginPath(); A.ctx.moveTo(cx - 10, 0); A.ctx.lineTo(cx + 10, 0); A.ctx.lineTo(cx + 50, G); A.ctx.lineTo(cx - 50, G); A.ctx.fill(); A.ctx.globalAlpha = 1; dog(cx, t, true, 1); }
      else { grad(A, ["#3a1a5a", "#5a3a6a"], 0, 70); A.layer(.1, 90, xx => { R("#2a2a3a", xx, 50, 30, 30); }); const pl = (t * 20) % 400 - 40; R(A.C.ink, pl, 20, 20, 4); R("#9a9a9a", pl + 1, 21, 18, 2);
        R("#4a4a4a", 0, 70, A.W, A.H); const wx = sx(A, HOLE + 20); R("#c8c0a0", wx - 50, 50, A.W, G - 50); oell(A, "#1a1a1a", wx, 100, 8, 10); R(A.C.ink, wx - 6, 98, 12, 3); R(DOGC, wx - 5, 99, 10, 1); R("#f4f4f2", wx - 9, 97, 4, 4);
        A.layer(.9, 22, (xx, k) => { if (xx > wx + 20) { R(A.C.ink, xx, G - 26, 10, 26); R(["#3a3a3a", "#8a3a8a", "#2a5a2a"][k % 3], xx + 1, G - 25, 8, 24); disc(A, "#c87a5a", xx + 5, G - 30, 5); } }); R("#3a3a3a", 0, G, A.W, 30); }
    }
  };
};

/* OO OO AH AH: inject the chimp. The chimp injects you. The chimp gets out. */
W["oo-oo-ah-ah"] = A => {
  const R = A.R, G = A.G, SHOT = 200, BITE = 380, OUT = 520, STAND = 700;
  const haz = torso("Z", true);
  const chimp = (x, t, k = 0, s = 1) => { const b = Math.round(Math.sin(t * 5 + k) * 1); oell(A, "#8a5a32", x, G - 12 * s + b, 9 * s, 10 * s); oell(A, "#8a5a32", x, G - 26 * s + b, 7 * s, 7 * s); oell(A, "#e8b8d8", x - 2 * s, G - 25 * s + b, 5 * s, 4 * s); R(A.C.ink, x - 4 * s, G - 27 * s + b, 1, 1); R(A.C.ink, x, G - 27 * s + b, 1, 1); R(A.C.ink, x - 4 * s, G - 23 * s + b, 5 * s, 1); R("#8a5a32", x - 10 * s, G - 16 * s, 3, 14 * s); R("#8a5a32", x + 8 * s, G - 16 * s, 3, 14 * s); };
  return {
    sprites: { syringe: { pal: { Q: "#7CFC6A", G: "#c8c8c8" }, rows: ["GQQQQG.", "GQQQQGGG"] } },
    level: {
      obs: [["oo_vial", 260], ["oo_vial", 330], ["oo_peel", 600], ["oo_peel", 660], ["oo_runner", 780], ["oo_runner", 840]],
      target: "rock", targetAt: 440, prop: "syringe", propAt: 100, npcs: [],
      captions: [[30, "Lab day. Subject 7."], [SHOT + 30, "...he's getting smarter."], [OUT + 10, "He got out."], [STAND - 20, "Banana stand. Of course."]]
    },
    obs: {
      oo_vial: { w: 4, h: 7, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x, y, 4, 7); R("#7CFC6A", x + 1, y + 2, 2, 5); } },
      oo_peel: { w: 8, h: 3, y: 0, vx: 0, tough: "slip!", draw(o, x, y) { R(A.C.ink, x, y, 8, 3); R("#f3d23b", x + 1, y + 1, 6, 1); R("#f3d23b", x, y + 2, 2, 1); R("#f3d23b", x + 6, y + 2, 2, 1); } },
      oo_runner: { w: 8, h: 26, y: 0, vx: -110, tough: "AAAH", draw(o, x, y, t) { const b = Math.floor(t * 12) % 2; R(A.C.ink, x, y + 8, 8, 18); R("#5ac85a", x + 1, y + 9, 6, 9); R("#3a5ad0", x + 1, y + 18, 6, 8 - b); disc(A, "#5ac85a", x + 4, y + 4, 4); R("#c81a1a", x + 2, y + 3, 1, 1); R("#c81a1a", x + 5, y + 3, 1, 1); } }
    },
    reset(S) { S.oo = { dressed: false, shot: -1, bite: -1, green: false }; },
    update(dt, S, p) {
      const o = S.oo; if (!o.dressed) { o.dressed = true; A.reskin(haz, { Z: "#f4f4f2", z: "#d8d8d8" }); }
      if (o.shot < 0 && p.x > SHOT && p.x < SHOT + 40) { o.shot = 0; crowdText(A, S, "PSST", SHOT + 30, 50); } if (o.shot >= 0 && o.shot < 9) { const b = o.shot; o.shot += dt; if (o.shot < 1.4 && p.x < SHOT + 60) lock(p, SHOT); if (b < 1.4 && o.shot >= 1.4) A.say("Oo oo. Ah ah. Hello.", SHOT + 40, 46, 2); }
      if (o.bite < 0 && p.x > BITE && p.x < BITE + 40) { o.bite = 0; } if (o.bite >= 0 && o.bite < 9) { const b = o.bite; o.bite += dt; if (o.bite < 1.6 && p.x < BITE + 60) lock(p, BITE); if (b < .8 && o.bite >= .8) { o.green = true; crowdText(A, S, "STAB", BITE, 50); A.redSays("Hey! That's MY job!", 1.6); } }
      if (p.x > STAND + 120 && !o.cap) { o.cap = 1; A.showCaption("Oo oo ah ah."); }
    },
    bg(t, S) {
      const x = S.p.x;
      if (x < OUT) { R("#3a3a3a", 0, 0, A.W, A.H); vign(A, .6); A.layer(.7, 70, xx => { R("#4a4a4a", xx, 30, 50, 80); R("#555", xx + 2, 32, 46, 76); }); R("#5a5a5a", 0, G, A.W, 30);
        const tb = sx(A, SHOT + 40); R("#c8c8c8", tb - 20, G - 16, 40, 4); R("#8a8a8a", tb - 18, G - 12, 2, 12); R("#8a8a8a", tb + 16, G - 12, 2, 12); if (S.oo.bite < .8) chimp(tb, t, 0, 1);
        if (S.oo.shot >= 1.4 && S.oo.bite < 0) { R("#e8b8d8", tb + 8, G - 52, 2, 10); }
        const bx = sx(A, BITE + 30); if (S.oo.bite >= 0 && S.oo.bite < 1.6) { chimp(bx, t, 1, 1); R("#c8c8c8", bx - 18, G - 22, 10, 3); R("#7CFC6A", bx - 17, G - 21, 7, 1); }
        const dx = sx(A, OUT - 30); R(A.C.ink, dx - 10, 60, 20, G - 60); R("#6a6a6a", dx - 9, 61, 18, G - 61); R(S.oo.bite >= .8 ? "#7CFC6A" : "#c81a1a", dx - 4, 70, 8, 4); }
      else { R("#7ab8e8", 0, 0, A.W, A.H); A.layer(.15, 50, (xx, k) => R("#3a5a9a", xx, 40 + (k % 3) * 14, 30, 80)); R("#a8a8a8", 0, 110, A.W, A.H); R("#9a9a9a", 0, G, A.W, 30);
        const st = sx(A, STAND + 40); R(A.C.ink, st - 31, 90, 62, G - 90); for (let i = 0; i < 10; i++) R(i % 2 ? "#f4f4f2" : "#f3d23b", st - 30 + i * 6, 91, 6, G - 91); R(A.C.ink, st - 34, 86, 68, 6); R("#f3d23b", st - 33, 87, 66, 4);
        A.ctx.fillStyle = "#f3d23b"; A.ctx.beginPath(); A.ctx.ellipse(st, 80, 30, 6, 0, Math.PI, 0); A.ctx.fill(); disc(A, "#6a3a1a", st - 12, 74, 6); disc(A, "#8a5a32", st + 10, 72, 7); chimp(st + 50, t, 2, 1.2);
        if (x > STAND + 60) { const cx = 160, h = Math.min(90, (x - STAND - 60) * 1.2); A.ctx.globalAlpha = .9; R("#f3d23b", cx - 6, 110 - h, 12, h); disc(A, "#f3a91f", cx, 110 - h, 18 + h / 6); A.ctx.globalAlpha = 1; } }
    },
    fg(t, S) { onHead(A, (x, top, face) => { R("#f4f4f2", x - 7, top - 2, 14, 4); R("#f4f4f2", x - 8, top, 2, 12); R("#f4f4f2", x + 6, top, 2, 12); A.ctx.globalAlpha = .4; R("#9fd0ee", x - 6, top + 2, 12, 9); A.ctx.globalAlpha = 1; if (S.oo.green) R("#7CFC6A", x - 3 + face * 2, top + 8, 6, 3); }); txtFx(A, S); }
  };
};

/* RED HANDED: spying across the alley. Then sneaking in. Then caught. */
W["red-handed"] = A => {
  const R = A.R, G = A.G, SPY = 200, IN = 440, CAUGHT = 780, PUR = "#b080d8";
  return {
    sprites: { binoc: { pal: { G: "#3a3a3a" }, rows: ["GG.GG", "GGGGG"] } },
    level: {
      obs: [["rh_cat", 250], ["rh_floss", 330], ["rh_cat", 520], ["rh_lamp", 600], ["rh_floss", 680]],
      target: "rh_plant", targetAt: 380, prop: "binoc", propAt: 100, npcs: [],
      captions: [[30, "The neighbor across the way."], [SPY + 20, "Just looking."], [IN + 10, "Just... visiting."], [CAUGHT - 40, "Shh."]]
    },
    obs: {
      rh_cat: { w: 8, h: 7, y: 0, vx: -50, draw(o, x, y, t) { R(A.C.ink, x, y + 2, 8, 5); R(A.C.ink, x + 6, y, 3, 3); R("#f3a91f", x + 7, y + 1, 1, 1); R(A.C.ink, x - 2, y + 1 - Math.floor(t * 4) % 2, 2, 3); } },
      rh_floss: { w: 1, h: 30, y: 0, vx: 0, draw(o, x, y, t) { A.ctx.strokeStyle = "#f4f4f2"; A.ctx.beginPath(); A.ctx.moveTo(x, A.G - 34); A.ctx.lineTo(x + Math.sin(t * 4) * 3, A.G); A.ctx.stroke(); } },
      rh_lamp: { w: 6, h: 18, y: 0, vx: 0, draw(o, x, y) { R(A.C.ink, x + 2, y + 4, 2, 14); R(A.C.ink, x, y, 6, 5); R("#f3d23b", x + 1, y + 1, 4, 3); } }
    },
    targets: { rh_plant: { line: "Watering her plant.", draw(tg, x) { R(A.C.ink, x - 5, G - 8, 10, 8); R("#c8622a", x - 4, G - 7, 8, 7); R("#3a8a2a", x - 1, G - 16, 2, 8); R("#3a8a2a", x - 5, G - 14, 4, 2); R("#3a8a2a", x + 1, G - 12, 4, 2); } } },
    reset(S) { S.rh = { caught: -1 }; },
    update(dt, S, p) { const h = S.rh; if (h.caught < 0 && p.x > CAUGHT && p.x < CAUGHT + 50) { h.caught = 0; A.say("...hello, neighbor.", CAUGHT + 30, 46, 1.8); }
      if (h.caught >= 0 && h.caught < 9) { const b = h.caught; h.caught += dt; if (h.caught < 3.2) lock(p, CAUGHT); if (b < 2 && h.caught >= 2) A.showCaption("Red handed."); } },
    bg(t, S) {
      const x = S.p.x;
      if (x < IN) { R("#7ab8e8", 0, 0, A.W, A.H); A.layer(.05, 90, (xx, k) => puff(A, xx + 30, 30 + (k % 3) * 10, 10, "#f4f4f2", .9)); A.layer(.3, 40, (xx, k) => R("#2a2a4a", xx, 30 + (k % 3) * 14, 26, 120));
        R("#9a9a9a", 0, 0, 40, A.H); R("#9a9a9a", A.W - 40, 0, 40, A.H); const wx = sx(A, SPY + 120, .5); R(A.C.ink, wx - 20, 50, 40, 40); R("#e8d090", wx - 19, 51, 38, 38); oell(A, PUR, wx, 76, 6, 10); oell(A, PUR, wx, 62, 5, 5); R(A.C.ink, wx - 5, 56, 10, 4); R("#f4f4f2", wx + 3, 62, 6, 1);
        R("#5a5a5a", 0, G, A.W, 30); }
      else { R("#c8b84a", 0, 0, A.W, A.H); A.layer(.6, 60, (xx, k) => { R(A.C.ink, xx + 10, 40, 16, 20); R("#a89a3a", xx + 11, 41, 14, 18); }); vign(A, .5); R("#8a7a2a", 0, G, A.W, 30);
        const bx = sx(A, IN + 140); R(A.C.ink, bx - 40, 120, 80, 18); R("#3a6a7a", bx - 39, 121, 78, 16); oell(A, "#c8d0e0", bx - 26, 116, 10, 5);
        const hx = sx(A, CAUGHT + 40), u = S.rh.caught; if (u < 0) { oell(A, PUR, hx, G - 14, 7, 14); oell(A, "#d8d8e8", hx, G - 34, 5, 6); R(A.C.ink, hx - 6, G - 42, 12, 16); }
        else { oell(A, PUR, hx, G - 14, 7, 14); oell(A, "#d8d8e8", hx, G - 34, 5, 6); R(A.C.ink, hx - 6, G - 42, 3, 18); R(A.C.ink, hx - 3, G - 36, 1, 1); R(A.C.ink, hx + 1, G - 36, 1, 1); R(A.C.ink, hx - 2, G - 31, 4, 1); } }
    },
    fg(t, S) {
      onHead(A, (x, top) => { R(A.C.ink, x, top - 6, 1, 6); disc(A, A.C.ink, x, top - 7, 1); });
      if (S.p.x > SPY && S.p.x < IN) onHead(A, (x, top, face) => A.ctx.drawImage(A.NS[face > 0 ? "binoc" : "binocL"], x + face * 3 - 2, top + 3));
      const u = S.rh.caught; if (u >= 1.2 && u < 3.2) { const a = Math.min(1, (u - 1.2) * 3); A.ctx.globalAlpha = a; R("#2a2a2a", 0, 0, A.W, A.H); R(A.C.ink, 110, 30, 100, 110); R("#5a5a5a", 112, 32, 96, 106);
        oell(A, PUR, 160, 110, 14, 26); oell(A, "#d8d8e8", 160, 74, 9, 10); R(A.C.ink, 151, 64, 4, 30); R(A.C.ink, 156, 72, 2, 2); R(A.C.ink, 162, 72, 2, 2);
        oell(A, "#E8271A", 186, 82, 8, 9); R(A.C.ink, 184, 72, 1, 4); R(A.C.ink, 182, 80, 2, 2); R(A.C.ink, 188, 80, 2, 2); R(A.C.ink, 183, 86, 6, 1); R("#7CFC6A", 182, 90, 8, 3); for (let i = 0; i < 3; i++) R("#7CFC6A", 183 + i * 3, 93, 1, 4 + ((t * 20 + i * 5) % 30)); A.ctx.globalAlpha = 1; }
    }
  };
};
})();
