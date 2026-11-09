// THE ARMY THAT LOST TO EMUS (1932): the shot list (Tall Tale 3D).
// A shot: { id, at, note, draw(lt, d, t, blit) }: pose the cut-out people + emus, move the camera, E.render(...),
// blit(), then any 2D overlay. Every shot moves the camera. Times come from the voice: cut(i) = just before
// line i, Wd('word', i) = when that word is said. Slapstick only: no bird is ever shown hurt — dust, feathers
// and jammed guns do the comedy.
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio, eob, bigText } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as PR from './core/props.js';
import { Toon, PROPS, INK } from './core/toon.js';
import { Emu } from './core/emu.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const bx = (w, h, d, m, x = 0, y = 0, z = 0, p) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; if (p) p.add(b); return b; };
const cy = (r1, r2, h, m, x, y, z, p, s = 12) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; if (p) p.add(c); return c; };

// ---------- hand props drawn for the toons ----------
function wheatBunch(g, x, y) {
  g.save(); g.translate(x, y - 40); g.rotate(-0.15); g.lineCap = 'round';
  for (let i = -2; i <= 2; i++) { g.strokeStyle = '#B98A2E'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 48); g.quadraticCurveTo(i * 9, 0, i * 15, -50); g.stroke();
    g.fillStyle = '#E3C16F'; g.beginPath(); g.ellipse(i * 15, -58, 8, 17, i * 0.12, 0, 7); g.fill(); g.strokeStyle = '#B98A2E'; g.lineWidth = 3; g.stroke(); }
  g.restore();
}
function planPaper(g, x, y) {
  g.save(); g.translate(x, y - 66); g.rotate(-0.08);
  g.fillStyle = '#F2EDE0'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.rect(-62, -78, 124, 156); g.fill(); g.stroke();
  g.fillStyle = INK; g.font = '900 26px Inter'; g.textAlign = 'center'; g.fillText('PLAN', 0, -46);
  g.strokeStyle = '#8A8578'; g.lineWidth = 4; g.setLineDash([8, 7]); g.beginPath(); g.moveTo(-38, 46); g.quadraticCurveTo(0, -6, 34, -20); g.stroke(); g.setLineDash([]);
  g.strokeStyle = '#C8283A'; g.lineWidth = 7; g.beginPath(); g.moveTo(22, -32); g.lineTo(46, -8); g.moveTo(46, -32); g.lineTo(22, -8); g.stroke();
  g.fillStyle = '#3C6FB6'; g.beginPath(); g.arc(-38, 46, 8, 0, 7); g.fill();
  g.restore();
}
function whiteFlag(g, x, y) {
  g.save(); g.translate(x, y);
  g.strokeStyle = '#7A5236'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 12); g.lineTo(8, -218); g.stroke();
  g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.moveTo(8, -218); g.quadraticCurveTo(-52, -236, -112, -212); g.quadraticCurveTo(-54, -186, -114, -162); g.quadraticCurveTo(-52, -176, 8, -160); g.closePath(); g.fill(); g.stroke();
  g.restore();
}

// ---------- sprites: dust, smoke, flash, feather, leaves ----------
function radialTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
}
const puffT = radialTex('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)');
function starTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.translate(64, 64); g.fillStyle = '#FFE9A0';
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 16 : 58; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
  g.fillStyle = '#FFF6D8'; g.beginPath(); g.arc(0, 0, 15, 0, 7); g.fill();
  return new THREE.CanvasTexture(c);
}
function featherTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.translate(64, 64); g.rotate(0.5); g.fillStyle = '#FBF7EE'; g.strokeStyle = '#C9C2B5'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(0, -8, 17, 44, 0, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = '#B9B2A5'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 52); g.lineTo(0, -48); g.stroke();
  g.lineWidth = 2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(0, i * 12); g.lineTo(i % 2 ? 13 : -13, i * 12 - 12); g.stroke(); }
  return new THREE.CanvasTexture(c);
}
function leafTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#5DA83E'; g.strokeStyle = '#3E7A28'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(32, 32, 22, 12, 0.6, 0, 7); g.fill(); g.stroke();
  return new THREE.CanvasTexture(c);
}
const sprite = (tex, col = '#FFFFFF', op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: col, transparent: true, opacity: op, depthWrite: false })); s.visible = false; return s; };

// ---------- the cast ----------
const LOOK = {
  mer: { body: '#5F7048', pattern: 'vest', patCol: '#46523A', hat: 'cap', hatCol: '#55663F', band: '#3E4A2E', extra: ['mustache'] },
  sol1: { body: '#8A8552', hat: 'cap', hatCol: '#77713F' },
  sol2: { body: '#7A744A', pattern: 'stripes', patCol: '#6B6540', hat: 'cap', hatCol: '#5E5A38' },
  far1: { body: '#6FA35A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'boater', hatCol: '#E8C77A', band: '#B5372E' },
  far2: { body: '#C9863F', pattern: 'check', patCol: '#8A5A36', hat: 'bowler', hatCol: '#6B4A2E', extra: ['mustache'], mustacheCol: '#D9D9E2' },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

// ---------- the Lewis gun (slapstick silhouette: fat shroud + pan magazine on a tripod) ----------
function lewisGun() {
  const g = new THREE.Group();
  const dark = WD.mat({ color: '#33333C', roughness: 0.5, metalness: 0.35 }), darker = WD.mat({ color: '#23232B', roughness: 0.6, metalness: 0.3 });
  [[-0.42, 0.3], [0.42, 0.3], [0, -0.48]].forEach(([lx, lz]) => { const leg = cy(0.035, 0.045, 1.0, darker, lx * 0.6, 0.48, lz * 0.6, g, 8); leg.rotation.z = -lx * 0.55; leg.rotation.x = lz * 0.55; });
  const shroud = cy(0.13, 0.13, 0.85, dark, 0, 0.98, 0.18, g, 16); shroud.rotation.x = Math.PI / 2;
  const tube = cy(0.055, 0.055, 0.5, darker, 0, 0.98, -0.45, g, 10); tube.rotation.x = Math.PI / 2;
  const mag = cy(0.27, 0.27, 0.07, dark, 0, 1.2, 0.1, g, 24);
  bx(0.09, 0.16, 0.34, darker, 0, 0.9, 0.62, g);
  const grip = cy(0.03, 0.03, 0.22, darker, 0, 0.78, 0.52, g, 8); grip.rotation.x = 0.5;
  return g;
}

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = { field: { bloom: 0.22, aperture: 0.0011, maxblur: 0.007 }, close: { bloom: 0.25, aperture: 0.0016, maxblur: 0.009 }, sunset: { bloom: 0.32, aperture: 0.001, maxblur: 0.007, warm: 0.07, sat: 1.08 } };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at), t: cam.position.x * 0.01 });
  };

  // ── SET: the farm (day) ──────────────────────────────────────────────
  const FD = WD.meadow(E, {});
  FD.sun.key.position.set(9, 14, 7); FD.sun.key.target.position.set(0, 0, -3);
  Object.assign(FD.sun.key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22 }); FD.sun.key.shadow.camera.updateProjectionMatrix();
  const farm = PR.house({ wall: '#F2E6CF', roof: '#B5553C', door: '#3C6FB6' }); farm.position.set(-10.5, 0, -13); farm.rotation.y = 0.45; FD.scene.add(farm);
  const post = PR.signpost([['CAMPION', 'r'], ['WHEAT', 'l']]); post.position.set(-4.4, 0, 4.4); FD.scene.add(post);
  const crashTree = WD.tree(1.8); crashTree.position.set(6.6, 0, -4.4); FD.scene.add(crashTree);
  // wheat patch (right side): dirt bed + instanced golden stalks
  { const bed = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 11), WD.mat({ map: WD.T.dirt('#C09A5E', [3, 3], false) })); bed.rotation.x = -Math.PI / 2; bed.position.set(6.5, 0.02, -3); bed.receiveShadow = true; FD.scene.add(bed);
    const wheat = new THREE.InstancedMesh(new THREE.ConeGeometry(0.075, 0.95, 5), WD.mat({ color: '#E0BE6A', roughness: 1 }), 650); const m4 = new THREE.Matrix4();
    for (let i = 0; i < 650; i++) { const x = 2.2 + ((Math.sin(i * 39.7) * 0.5 + 0.5) * 8.6), z = -8.2 + ((Math.sin(i * 17.3 + 5) * 0.5 + 0.5) * 10.4); m4.makeTranslation(x, 0.45, z); wheat.setMatrixAt(i, m4); }
    wheat.castShadow = false; FD.scene.add(wheat); }
  const CF = WD.fence(5.5); CF.position.set(0.2, 0, -1.1); CF.rotation.y = 0.12; FD.scene.add(CF);   // the fence that gets smashed
  // the gun, the truck, the ammo
  const gun = lewisGun(); FD.scene.add(gun);
  const truck = (() => { const g = new THREE.Group(); const car = WD.car('#5F7048'); g.add(car);
    bx(1.5, 0.1, 1.0, WD.mat({ color: '#4A5738' }), 0, 1.04, -1.15, g); bx(0.5, 0.42, 0.5, WD.mat({ map: WD.T.planks('#8A6A42', [0.5, 0.5]) }), -0.45, 1.3, -1.3, g); bx(0.42, 0.34, 0.42, WD.mat({ map: WD.T.planks('#9A7748', [0.5, 0.5]) }), 0.5, 1.26, -1.05, g);
    g.visible = false; FD.scene.add(g); return g; })();
  const ammoCrates = []; [[2.95, 2.95, 0], [3.62, 2.82, 0], [3.28, 2.9, 0.65], [2.95, 3.0, 0.65], [3.3, 2.88, 1.3]].forEach(([x, z, y], i) => { const c = WD.crate(0.65); c.position.set(x, y, z); c.rotation.y = i * 0.35; c.visible = false; FD.scene.add(c); ammoCrates.push(c); });
  const roundsSign = WD.signBoard('10,000 ROUNDS', { w: 1.8, h: 0.44, bg: '#7A2E2E', fg: '#F2E6CF' }); roundsSign.position.set(3.3, 0.85, 3.45); roundsSign.rotation.y = -0.25; roundsSign.visible = false; FD.scene.add(roundsSign);
  const bigStack = new THREE.Group(); [[4.7, 3.6, 0], [5.4, 3.5, 0], [6.1, 3.62, 0], [5.05, 3.55, 0.7], [5.75, 3.58, 0.7], [5.4, 3.56, 1.4]].forEach(([x, z, y], i) => { const c = WD.crate(0.7); c.position.set(x, y, z); c.rotation.y = i * 0.5; bigStack.add(c); });
  bigStack.visible = false; FD.scene.add(bigStack);
  // sprite pools
  const puffs = []; for (let i = 0; i < 26; i++) { const s = sprite(puffT, '#D8B98A', 0); FD.scene.add(s); puffs.push(s); }
  const setPuffs = (list) => puffs.forEach((s, i) => { const p = list[i]; s.visible = !!p; if (p) { s.position.set(p[0], p[1], p[2]); s.scale.set(p[3], p[3] * 0.8, 1); s.material.color.set(p[5] || '#D8B98A'); s.material.opacity = p[4]; } });
  const flash = sprite(starTex()); flash.scale.set(0.85, 0.85, 1); FD.scene.add(flash);
  const feather = sprite(featherTex()); feather.scale.set(0.34, 0.34, 1); FD.scene.add(feather);
  const leaves = []; for (let i = 0; i < 6; i++) { const s = sprite(leafTex(), '#FFFFFF', 0.95); s.scale.set(0.22, 0.22, 1); FD.scene.add(s); leaves.push(s); }
  // cast (day)
  const mer = person('mer', { height: 1.82 }), sol1 = person('sol1'), sol2 = person('sol2'), far1 = person('far1'), far2 = person('far2');
  [mer, sol1, sol2, far1, far2].forEach((p) => FD.scene.add(p.group));
  const EMUS = []; for (let i = 0; i < 8; i++) { const e = new Emu({ height: 1.72 + (i % 4) * 0.09, res: i === 0 ? 2 : 1.25 }); FD.scene.add(e.group); EMUS.push(e); }
  const hero = EMUS[0];
  const FDpeople = [mer, sol1, sol2, far1, far2, ...EMUS];
  const flock = (spec) => EMUS.forEach((e, i) => { const s = spec[i]; e.group.visible = !!s; if (s) { e.at(s[0], s[1], s[2]); e.set(s[3] || {}); } });
  const dustTrail = (pts, t, col = '#D8B98A', base = 0.55) => pts.map(([x, z], i) => { const age = (t * 1.3 + i * 0.41) % 1; return [x - age * 0.7, 0.35 + age * 0.5, z, 0.5 + age * 1.5, (1 - age) * base, col]; });
  const resetFD = () => {
    [mer, sol1, sol2, far1, far2].forEach((p) => (p.group.visible = true));
    gun.visible = true; gun.position.set(1.1, 0, 2.2); gun.rotation.set(0, Math.PI, 0);
    truck.visible = false; truck.rotation.set(0, Math.PI / 2, 0); truck.position.set(-8, 0, -2.2);
    bigStack.visible = false; CF.rotation.x = 0;
    flash.visible = false; feather.visible = false; leaves.forEach((s) => (s.visible = false));
    setPuffs([]);
  };

  // ── SET: the farm (sunset, for the finale) ───────────────────────────
  const SS = WD.meadow(E, { sunset: true });
  SS.sun.key.target.position.set(0, 0, -2);
  const podium = new THREE.Group(); SS.scene.add(podium);
  { const c2 = WD.crate(0.55); c2.position.set(-1.15, 0, -0.8); podium.add(c2); const c1 = WD.crate(0.95); c1.position.set(0, 0, -0.8); podium.add(c1); const c3 = WD.crate(0.36); c3.position.set(0.95, 0, -0.8); podium.add(c3);
    const sb = WD.signBoard('WINNERS', { w: 1.6, h: 0.4, bg: '#7A2E2E', fg: '#F2D37A' }); sb.position.set(0, 1.35, -0.85); podium.add(sb); }
  const ssMer = person('mer', { height: 1.82 }), ssFar1 = person('far1'), ssFar2 = person('far2');
  [ssMer, ssFar1, ssFar2].forEach((p) => SS.scene.add(p.group));
  const ssHero = new Emu({ height: 2.0, res: 2 }); SS.scene.add(ssHero.group);
  const ssEmu2 = new Emu({ height: 1.8, res: 1.25 }); SS.scene.add(ssEmu2.group);
  const SSpeople = [ssMer, ssFar1, ssFar2, ssHero, ssEmu2];

  // ═══ THE STORY ════════════════════════════════════════════════════════
  // S01 · the hook: Australia went to war with emus — and lost.
  add({ id: 'S01', at: 0, d: L(1) - 0, draw(lt, d, t, blit) {
    resetFD(); gun.visible = false;
    mer.at(1.8, 0, 2.2).set({ mood: 'smug', look: [0.5, 0.3], armL: [48, -62], armR: [48, -62], lean: 2, blink: blink(t) });
    sol1.at(0.55, 0, 3.3).set({ mood: 'neutral', look: [0.4, 0.2], armL: [10, -8], armR: [10, -8], blink: blink(t, 1) });
    sol2.at(3.05, 0, 3.3).set({ mood: 'neutral', look: [0.4, 0.2], armL: [10, -8], armR: [10, -8], blink: blink(t, 2) });
    far1.at(-3.6, 0, 0.6).set({ mood: 'worried', look: [1, 0.2], sweat: 0.7, armL: [20, -20], armR: [20, -20], blink: blink(t, 0.5) });
    far2.at(-4.7, 0, 1.1).set({ mood: 'worried', look: [1, 0.2], sweat: 0.5, armL: [20, -20], armR: [20, -20], blink: blink(t, 1.5) });
    flock([null, null, [-6.5, 0, -7.5, { neck: 0.3, bob: 4 }], [-2.5, 0, -8.2, { neck: 0.2 }], [1.5, 0, -7.8, { neck: 0.4, bob: 3 }], [5.5, 0, -8.4, { neck: 0.3 }], [8.5, 0, -7.6, { neck: 0.2, bob: 5 }], null]);
    shoot(FD.scene, FDpeople, V3(7.5, 7.5, 13), V3(4.5, 2.6, 8.6), V3(0.5, 1.2, -2), V3(1.5, 1.3, 2), eo(lt / d), { ...LOOKS.field, fov: 46 });
    blit();
  } });
  cue(Wd('Australia', 0), 'ding'); cue(0.12, 'whoosh', { gain: 0.3, dur: 0.8 });
  // S02 · twenty thousand of them.
  add({ id: 'S02', at: cut(1), d: L(2) - cut(1), draw(lt, d, t, blit) {
    resetFD(); [mer, sol1, sol2, far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const up = seg(t, Wd('emus', 1), Wd('emus', 1) + 0.25);
    flock([-7, -4.7, -2.3, 0.1, 2.5, 4.9, 7.3].map((x, i) => [x, 0, -4.6 - (i % 2) * 0.5, { phase: t * 3 + i * 1.3, run: 0.25, neck: lerp(-0.5, 0.55, eo(up)) * (i % 2 ? 1 : -0.6), bob: 3 }]).concat([null]));
    shoot(FD.scene, FDpeople, V3(-4.2, 2.3, 4.2), V3(-2.4, 1.9, 2.2), V3(-1, 1.3, -4.6), V3(0.4, 1.3, -4.6), eo(lt / d), { ...LOOKS.field, fov: 44 });
    blit();
  } });
  cue(cut(1) + 0.05, 'chirp', { gain: 0.35, dur: 1.1 }); cue(Wd('emus', 1), 'pop');
  // S03 · the emus won. One emu, smug, towering over a very small major.
  add({ id: 'S03', at: cut(2), d: L(3) - cut(2), draw(lt, d, t, blit) {
    resetFD(); [sol1, sol2, far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const pop = eob(seg(t, Wd('won', 2), Wd('won', 2) + 0.3));
    hero.at(0, 0, -1).set({ neck: lerp(0.1, 0.75, pop), bob: pop * 6 });
    mer.at(3.6, 0, -3.2).set({ mood: 'tired', look: [-0.8, -0.2], armL: [8, -6], armR: [8, -6], lean: 3, blink: blink(t) });
    flock([null, [2.2, 0, -5.5, { neck: 0.3 }], null, null, null, null, null, [-3.4, 0, -6, { neck: 0.2 }]]);
    hero.group.visible = true;
    shoot(FD.scene, FDpeople, V3(0.9, 1.05, 4.4), V3(0.4, 1.15, 3.1), V3(0, 1.5, -1), V3(0.3, 1.45, -1), eo(lt / d), { ...LOOKS.close, fov: 42 });
    blit();
  } });
  cue(Wd('won', 2), 'boing');
  // S04 · the farmers, working their wheat in a hard year.
  add({ id: 'S04', at: cut(3), d: L(4) - cut(3), draw(lt, d, t, blit) {
    resetFD(); [mer, sol1, sol2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    far1.at(5.2, 0, -2.4).set({ mood: 'tired', look: [-0.4, 0.1], sweat: seg(lt, 0.4, 1.2), armL: [14, -12], armR: [128, -38], blink: blink(t) });
    far2.at(6.9, 0, -3.5).set({ mood: 'neutral', look: [-0.5, 0.2], talk: talk(t) * seg(t, Wd('farming', 3), Le(3)), armL: [26, -46], armR: [30, -50], holdR: wheatBunch, blink: blink(t, 1.2) });
    flock([null, null, null, null, null, null, null, null]);
    shoot(FD.scene, FDpeople, V3(2.4, 2.1, 3.6), V3(4.2, 1.8, 2.0), V3(5.9, 1.2, -3), V3(6.1, 1.25, -3), eo(lt / d), { ...LOOKS.field, fov: 40 });
    blit();
  } });
  cue(cut(3) + 0.1, 'whoosh', { gain: 0.25, dur: 0.7 });
  // S05 · then twenty thousand emus marched in.
  add({ id: 'S05', at: cut(4), d: L(5) - cut(4), draw(lt, d, t, blit) {
    resetFD(); [mer, sol1, sol2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const prog = eo(seg(lt, 0.1, d - 0.2));
    const spec = [], pts = [];
    for (let i = 0; i < 8; i++) { const x = 17 - i * 2.1 - prog * 9.5, z = -8.6 + (i % 3) * 1.4; spec.push([x, 0, z, { phase: t * 9 + i * 0.9, run: 0.75, neck: 0.25, flip: true }]); pts.push([x + 0.6, z]); }
    flock(spec); setPuffs(dustTrail(pts, t));
    far1.at(-3.9, 0, 0.9).set({ mood: 'worried', look: [1, 0.3], sweat: 0.8, armL: [30, -30], armR: [30, -30], bob: Math.round(Math.sin(t * 8) * 2), blink: blink(t) });
    far2.at(-5.1, 0, 1.5).set({ mood: 'shock', look: [1, 0.4], armL: [120, -40], armR: [120, -40], blink: blink(t, 1) });
    shoot(FD.scene, FDpeople, V3(-3.2, 3.3, 7.2), V3(-1.4, 2.4, 5.6), V3(4.5, 1.2, -7.5), V3(1.5, 1.2, -7.5), eo(lt / d), { ...LOOKS.field, fov: 46 });
    blit();
  } });
  cue(Wd('marched', 4), 'whoosh', { gain: 0.4, dur: 1.2 }); cue(Wd('marched', 4) + 0.4, 'chirp', { gain: 0.3, dur: 0.9 });
  // S06 · crops trampled, fences smashed (the fence really goes over).
  add({ id: 'S06', at: cut(5), d: L(6) - cut(5), draw(lt, d, t, blit) {
    resetFD(); [mer, sol1, sol2, far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const crash = Wd('fences', 5);
    const spec = [], pts = [];
    for (let i = 0; i < 6; i++) { const x = lerp(11.5, -6, clamp((lt - i * 0.16) / (d - 0.5))), z = i < 2 ? -1.3 : -3.2 + (i % 3) * 1.1; spec.push([x, 0, z, { phase: t * 10 + i, run: 0.9, neck: 0.3, flip: true }]); pts.push([x + 0.8, z]); }
    spec.push(null, null); flock(spec); setPuffs(dustTrail(pts, t, '#D8B98A', 0.65));
    CF.rotation.x = eob(seg(t, crash - 0.05, crash + 0.4)) * 1.3;
    shoot(FD.scene, FDpeople, V3(6.2, 2.5, 5.2), V3(2.2, 2.0, 4.4), V3(4, 1, -2), V3(0.5, 0.8, -1.4), eo(lt / d), { ...LOOKS.field, fov: 44 });
    blit();
  } });
  cue(Wd('fences', 5) + 0.05, 'thud', { gain: 0.7 }); cue(Wd('fences', 5) + 0.1, 'boing', { gain: 0.4 });
  // S07 · the farmers beg the army for help.
  add({ id: 'S07', at: cut(6), d: L(7) - cut(6), draw(lt, d, t, blit) {
    resetFD(); [sol1, sol2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const kneel = Math.round(Math.sin(t * 3.2) * 3 + 3);
    far1.at(-0.8, 0, 0.7).set({ mood: 'worried', look: [0.4, 0.5], sweat: 0.8, armL: [140, -18], armR: [140, -18], bob: kneel, lean: 4, blink: blink(t) });
    far2.at(0.75, 0, 0.5).set({ mood: 'worried', look: [0.3, 0.5], sweat: 0.6, armL: [140, -18], armR: [140, -18], bob: kneel + 1, lean: 4, blink: blink(t, 1) });
    mer.at(3.0, 0, 0.1).set({ mood: 'neutral', look: [-0.7, 0.1], armL: [46, -60], armR: [46, -60], blink: blink(t, 2) });
    flock([null, null, null, null, null, null, null, null]);
    shoot(FD.scene, FDpeople, V3(0, 1.9, 5.4), V3(0.2, 1.65, 3.9), V3(0.2, 1.3, 0.4), V3(0.3, 1.3, 0.4), eo(lt / d), { ...LOOKS.close, fov: 40 });
    blit();
  } });
  cue(Wd('begged', 6), 'pop', { gain: 0.4 });
  // S08 · enter Major Meredith, with two machine guns.
  add({ id: 'S08', at: cut(7), d: L(8) - cut(7), draw(lt, d, t, blit) {
    resetFD(); [far1, far2].forEach((p) => (p.group.visible = false));
    const stride = seg(t, Wd('sent', 7), Wd('Meredith', 7) - 0.1), pose = eob(seg(t, Wd('Meredith', 7), Wd('Meredith', 7) + 0.3));
    const mx = lerp(-4.2, -0.7, eo(stride));
    mer.at(mx, 0, 1.6).set({ mood: pose > 0.5 ? 'proud' : 'smug', look: [0.3, 0.3], armL: [14, -10], armR: lerp(14, 128, pose) ? [lerp(14, 128, pose), -12] : [14, -12], legs: stride < 1 ? 'walk' : 'stand', phase: t * 6.5, lean: 2, blink: blink(t) });
    const slide = eo(seg(t, Wd('machine', 7), Wd('machine', 7) + 0.9));
    gun.position.set(lerp(5.2, 1.1, slide), Math.abs(Math.sin(slide * Math.PI * 3)) * 0.05, lerp(3.0, 2.2, slide));
    sol1.at(gun.position.x - 1.0, 0, gun.position.z + 0.5).set({ mood: 'neutral', look: [0, 0.2], armL: [40, -30], armR: [40, -30], legs: slide < 1 ? 'walk' : 'stand', phase: t * 6.5, blink: blink(t, 1) });
    sol2.at(gun.position.x + 1.15, 0, gun.position.z + 0.55).set({ mood: 'neutral', look: [0, 0.2], armL: [40, -30], armR: [40, -30], legs: slide < 1 ? 'walk' : 'stand', phase: t * 6.5 + 2, blink: blink(t, 2) });
    flock([null, null, null, null, null, null, null, null]);
    if (slide > 0.97) setPuffs([[0.5, 0.3, 2.2, 0.8, 0.4], [1.7, 0.3, 2.2, 0.8, 0.4]]);
    shoot(FD.scene, FDpeople, V3(0.4, 2.1, 7.6), V3(1.2, 1.85, 6.2), V3(0, 1.1, 1.8), V3(0.5, 1.1, 2), eo(lt / d), { ...LOOKS.field, fov: 42 });
    blit();
  } });
  cue(Wd('Meredith', 7), 'pop');

  // S09 · ten thousand rounds of ammunition, stacked crate by crate.
  add({ id: 'S09', at: cut(8), d: L(9) - cut(8), draw(lt, d, t, blit) {
    resetFD(); [far1, far2].forEach((p) => (p.group.visible = false));
    const stamps = [Wd('ten', 8), Wd('thousand', 8) + 0.05, Wd('rounds', 8), Wd('of', 8) + 0.1, Wd('ammunition', 8)];
    ammoCrates.forEach((c, i) => { const k = eob(seg(t, stamps[i], stamps[i] + 0.25)); c.visible = k > 0; c.scale.setScalar(Math.max(k, 0.001)); });
    const sk = eob(seg(t, Wd('rounds', 8) + 0.1, Wd('rounds', 8) + 0.4)); roundsSign.visible = sk > 0; roundsSign.scale.setScalar(Math.max(sk, 0.001));
    mer.at(-0.6, 0, 2.4).set({ mood: 'proud', look: [0.7, 0.3], armL: [46, -58], armR: [46, -58], blink: blink(t) });
    sol1.at(1.15, 0, 3.1).set({ mood: 'neutral', look: [0.8, 0.4], armL: [20, -20], armR: [96, -30], blink: blink(t, 1) });
    sol2.at(4.6, 0, 3.3).set({ mood: 'smug', look: [-0.6, 0.3], armL: [14, -10], armR: [120, -20], blink: blink(t, 2) });
    flock([null, null, null, null, null, null, null, null]);
    shoot(FD.scene, FDpeople, V3(0.6, 2.2, 8.2), V3(1.4, 1.9, 6.8), V3(2.6, 1.0, 3), V3(3.0, 1.05, 3), eo(lt / d), { ...LOOKS.field, fov: 40 });
    blit();
  } });
  [0, 1, 2, 3, 4].forEach((i) => cue([Wd('ten', 8), Wd('thousand', 8) + 0.05, Wd('rounds', 8), Wd('of', 8) + 0.1, Wd('ammunition', 8)][i], 'stamp', { gain: 0.5 }));
  // S10 · the simple plan — and an emu who has clearly read it.
  add({ id: 'S10', at: cut(9), d: L(10) - cut(9), draw(lt, d, t, blit) {
    resetFD(); [sol1, sol2, far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    ammoCrates.forEach((c) => { c.visible = true; c.scale.setScalar(1); });
    mer.at(1.2, 0, 2.3).set({ mood: 'smug', look: [0, 0.2], talk: talk(t) * seg(t, Wd('Simple', 9), Wd('plans', 9)), armL: [24, -40], armR: [30, -46], holdR: planPaper, blink: blink(t) });
    const rise = eob(seg(t, Wd('emus', 9), Wd('emus', 9) + 0.35)), sly = seg(t, Wd('plans', 9) - 0.2, Wd('plans', 9) + 0.2);
    hero.at(2.75, 0, 3.4).set({ neck: lerp(-0.9, 0.15, rise), bob: 0 });
    hero.pivot.rotation.z = -0.1 * sly;
    flock([null, null, null, null, null, null, null, null]);
    hero.group.visible = true;
    shoot(FD.scene, FDpeople, V3(1.7, 2.1, 9.8), V3(1.9, 2.05, 9.2), V3(2.0, 1.5, 2.9), V3(2.0, 1.5, 2.9), eo(lt / d), { ...LOOKS.close, fov: 42 });
    blit();
  } });
  cue(Wd('emus', 9), 'slide', { gain: 0.4, dur: 0.4 }); cue(Wd('plans', 9), 'pop', { gain: 0.45 });
  // S11 · but emus don't herd: they scatter and zigzag.
  add({ id: 'S11', at: cut(10), d: L(11) - cut(10), draw(lt, d, t, blit) {
    resetFD(); [mer, sol1, sol2, far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const prog = clamp(lt / (d - 0.15));
    const dirs = [[-11, 0.5], [-9, -2.5], [10.5, -1.5], [9, -4.5], [-2, -9.5], [3.5, -10], [-6, -8], [7, -8.5]];
    const spec = [], pts = [];
    dirs.forEach(([dx, dz], i) => { const sx = 1.5 + (i % 3) * 0.9, sz = -2.8 - (i % 2) * 0.8;
      const x = sx + dx * prog, z = sz + dz * prog + Math.sin(prog * 9.4 + i * 1.7) * 0.55 * prog;
      spec.push([x, 0, z, { phase: t * 12 + i, run: 1, neck: 0.3, flip: dx < 0 }]); pts.push([x - Math.sign(dx) * 0.7, z]); });
    flock(spec); setPuffs(dustTrail(pts, t, '#D8B98A', 0.5));
    shoot(FD.scene, FDpeople, V3(0, 6.6, 9.2), V3(0, 5.2, 7.6), V3(1, 0.6, -4), V3(0.5, 0.6, -4.5), eo(lt / d), { ...LOOKS.field, fov: 48 });
    blit();
  } });
  cue(Wd('scattered', 10), 'whoosh', { gain: 0.45, dur: 0.9 }); cue(Wd('zigzagged', 10), 'chirp', { gain: 0.3, dur: 0.7 });
  // S12 · fifty kilometres an hour. Speed lines and a very smug bird.
  add({ id: 'S12', at: cut(11), d: L(12) - cut(11), draw(lt, d, t, blit) {
    resetFD(); [mer, sol1, sol2, far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const prog = clamp(lt / d), ex = lerp(-7.5, 7.5, prog);
    hero.at(ex, 0, 0.6).set({ phase: t * 15, run: 1, neck: 0.45 });
    hero.pivot.rotation.z = -0.07;
    flock([null, null, null, null, null, null, null, null]);
    hero.group.visible = true;
    setPuffs([[ex - 0.9, 0.35, 0.6, 0.9, 0.5], [ex - 1.6, 0.3, 0.9, 0.7, 0.4], [ex - 0.7, 0.3, 0.2, 0.6, 0.45]]);
    shoot(FD.scene, FDpeople, V3(ex * 0.55 - 0.5, 1.7, 5.6), V3(ex * 0.55 + 0.4, 1.6, 4.9), V3(ex, 1.2, 0.6), V3(ex, 1.2, 0.6), eo(lt / d), { ...LOOKS.field, fov: 40 });
    blit();
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const y = 600 + i * 66 + ((i * 37) % 23), len = 130 + (i * 53) % 160, x0 = ((i * 211 + (1 - prog) * 700) % 1150) - 60; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + len, y); ctx.stroke(); }
    ctx.restore();
    const popS = eob(seg(t, Wd('fifty', 11), Wd('fifty', 11) + 0.25));
    if (popS > 0) bigText('50 km/h!', 540, 480, 118 * popS, '#FFD43B', -0.05, 1);
  } });
  cue(cut(11) + 0.05, 'slide', { gain: 0.4, dur: 1.5 }); cue(Wd('fifty', 11), 'pop', { gain: 0.5 });
  // S13 · surround one, and it simply runs around you.
  add({ id: 'S13', at: cut(12), d: L(13) - cut(12), draw(lt, d, t, blit) {
    resetFD(); [sol2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    const inw = eo(seg(t, Wd('surround', 12), Wd('enemy', 12) + 0.3)), dash = eo(seg(t, Wd('runs', 12), Le(12) - 0.05));
    const R = lerp(3.4, 2.3, inw);
    mer.at(-R * 0.7, 0, -1.5 - R * 0.7).set({ mood: dash > 0.3 ? 'shock' : 'smug', look: [0.6, 0.3], armL: dash > 0.3 ? [130, -30] : [60, -40], armR: dash > 0.3 ? [130, -30] : [60, -40], blink: blink(t) });
    sol1.at(R * 0.75, 0, -1.5 - R * 0.65).set({ mood: dash > 0.3 ? 'shock' : 'neutral', look: [-0.6, 0.3], armL: [60, -40], armR: [60, -40], blink: blink(t, 1) });
    far1.at(0, 0, -1.5 - R - 0.4).set({ mood: dash > 0.3 ? 'shock' : 'worried', look: [0, -0.4], armL: [70, -40], armR: [70, -40], blink: blink(t, 2) });
    far2.at(-R - 0.5, 0, -0.6).set({ mood: dash > 0.3 ? 'shock' : 'neutral', look: [0.8, 0.2], armL: [60, -40], armR: [60, -40], blink: blink(t, 0.4) });
    const ex = dash < 1 ? lerp(0, 1.6, dash) : 1.6, ez = dash < 1 ? lerp(-1.5, 3.6, Math.sin(dash * Math.PI * 0.72)) : 3.6;
    hero.at(ex, 0, ez).set({ phase: dash > 0 && dash < 1 ? t * 13 : 0, run: dash > 0 && dash < 1 ? 1 : 0, neck: 0.5, flip: dash >= 1 });
    flock([null, null, null, null, null, null, null, null]);
    hero.group.visible = true;
    const a0 = -0.35 + lt / d * 0.5;
    shoot(FD.scene, FDpeople, V3(Math.sin(a0) * 7.6, 3.1, -1.5 + Math.cos(a0) * 7.6), V3(Math.sin(a0 + 0.14) * 7.2, 2.9, -1.5 + Math.cos(a0 + 0.14) * 7.2), V3(0, 1.1, -1.5), V3(0.4, 1.1, -0.6), 1, { ...LOOKS.field, fov: 44 });
    blit();
  } });
  cue(Wd('runs', 12), 'whoosh', { gain: 0.45, dur: 0.7 }); cue(Wd('runs', 12) + 0.3, 'boing', { gain: 0.35 });

  // S14 · a thousand emus stroll straight past the guns.
  add({ id: 'S14', at: cut(13), d: L(14) - cut(13), draw(lt, d, t, blit) {
    resetFD(); [sol2, far1, far2].forEach((p) => (p.group.visible = false));
    sol1.at(0.15, 0, 2.5).set({ mood: 'neutral', look: [-0.4, 0.3], armL: [30, -25], armR: [30, -25], blink: blink(t, 1) });
    const drop = seg(t, Wd('guns', 13), Wd('guns', 13) + 0.5);
    mer.at(3.7, 0, 1.9).set({ mood: drop > 0.5 ? 'worried' : 'proud', look: [-0.7, 0.2], armL: [12, -8], armR: [lerp(118, 14, drop), -14], blink: blink(t) });
    const prog = clamp(lt / (d + 0.4));
    flock(Array.from({ length: 8 }, (_, i) => [lerp(-10.5, 3.5, prog) + i * 1.65, 0, -4.3 - (i % 3) * 0.75, { phase: t * 4.2 + i * 1.1, run: 0.35, neck: 0.25 + (i % 3) * 0.15, peck: i % 3 === 1 ? 0.35 + 0.3 * Math.sin(t * 1.4 + i) : 0 }]));
    shoot(FD.scene, FDpeople, V3(2.9, 1.55, 6.5), V3(2.4, 1.45, 5.8), V3(-1, 1.2, -4), V3(-0.4, 1.2, -4), eo(lt / d), { ...LOOKS.field, fov: 42 });
    blit();
  } });
  cue(cut(13) + 0.1, 'chirp', { gain: 0.25, dur: 1.4 });
  // S15 · the soldiers fired. Dust, scatter, one small feather. Nobody is shown hurt.
  add({ id: 'S15', at: cut(14), d: L(15) - cut(14), draw(lt, d, t, blit) {
    resetFD(); [sol2, far1, far2].forEach((p) => (p.group.visible = false));
    const fired = Wd('fired', 14), bursts = [fired, fired + 0.38, fired + 0.76];
    const firing = bursts.some((b) => t >= b && t < b + 0.09), recoil = bursts.reduce((a, b) => a + Math.max(0, 1 - (t - b) * 9) * (t >= b ? 1 : 0), 0);
    gun.position.z = 2.2 + recoil * 0.07; gun.rotation.x = -recoil * 0.03;
    flash.visible = firing; flash.position.set(1.1, 1.0, 1.15);
    sol1.at(0.15, 0, 2.55).set({ mood: t > Wd('dropped', 14) ? 'shock' : 'neutral', look: [-0.3, 0.3], armL: [42, -30], armR: [42, -30], bob: firing ? 2 : 0, blink: blink(t, 1) });
    mer.at(3.4, 0, 2.1).set({ mood: t > fired ? 'shock' : 'proud', look: [-0.7, 0.2], armL: [12, -8], armR: [110, -16], blink: blink(t) });
    const scat = eo(seg(t, fired, fired + 0.7));
    const spec = [], pts = [];
    for (let i = 0; i < 7; i++) { const sx = -5.5 + i * 1.5, dir = i % 2 ? 1 : -1, x = sx + dir * scat * (2.5 + (i % 3)), z = -3.6 - (i % 3) * 0.8 - scat * 1.2;
      spec.push([x, 0, z, { phase: t * 13 + i, run: scat > 0 ? 1 : 0.2, neck: 0.3, flip: dir < 0 }]); if (scat > 0) pts.push([x - dir * 0.8, z]); }
    spec.push(null); flock(spec);
    const smoke = bursts.filter((b) => t > b).map((b, i) => { const age = clamp((t - b) * 1.1); return [1.1 + age * 0.3, 1.25 + age * 0.8, 1.3 - age * 0.5, 0.35 + age * 0.9, (1 - age) * 0.4, '#B9B4AA']; });
    setPuffs([...dustTrail(pts, t, '#D8B98A', 0.6), ...smoke]);
    const fAge = clamp((t - (fired + 0.4)) / 2.4);
    if (t > fired + 0.4 && t < Le(14)) { feather.visible = true; feather.position.set(-0.6 + Math.sin(fAge * 9) * 0.3, 2.3 - fAge * 1.7, -3.2); feather.material.rotation = fAge * 4; }
    shoot(FD.scene, FDpeople, V3(1.9, 1.65, 5.7), V3(1.5, 1.55, 4.9), V3(0.2, 1.1, -2), V3(0, 1.1, -2.4), eo(lt / d), { ...LOOKS.close, fov: 40 });
    blit();
  } });
  cue(Wd('fired', 14), 'slam', { gain: 0.45 }); cue(Wd('fired', 14) + 0.02, 'pop', { gain: 0.5 }); cue(Wd('fired', 14) + 0.38, 'pop', { gain: 0.5 }); cue(Wd('fired', 14) + 0.76, 'pop', { gain: 0.45 });
  // S16 · and then the gun jammed.
  add({ id: 'S16', at: cut(15), d: L(16) - cut(15), draw(lt, d, t, blit) {
    resetFD(); [far1, far2, mer].forEach((p) => (p.group.visible = false));
    const jam = Wd('jammed', 15);
    gun.rotation.x = 0.13 * seg(t, jam, jam + 0.3);
    sol1.at(0.6, 0, 2.45).set({ mood: t > jam ? 'shock' : 'neutral', look: [-0.2, 0.4], sweat: seg(t, jam, jam + 0.4), armL: [46, -34], armR: t > jam ? [120, -30] : [46, -34], blink: blink(t, 1) });
    sol2.at(2.05, 0, 3.0).set({ mood: 'worried', look: [-0.5, 0.3], armL: [14, -10], armR: [14, -10], blink: blink(t, 2) });
    flock([null, null, [-3.5, 0, -5.5, { neck: 0.4 }], null, null, null, null, [4.5, 0, -6, { neck: 0.3, flip: true }]]);
    const age = clamp((t - Wd('gun', 15)) * 0.8);
    if (t > Wd('gun', 15)) setPuffs([[1.1 + Math.sin(age * 5) * 0.08, 1.35 + age * 0.85, 2.0, 0.22 + age * 0.55, (1 - age) * 0.55, '#A9A49B']]);
    shoot(FD.scene, FDpeople, V3(3.1, 1.6, 5.2), V3(2.9, 1.55, 4.8), V3(1.3, 1.0, 2.3), V3(1.3, 1.0, 2.3), eo(lt / d), { ...LOOKS.close, fov: 40 });
    blit();
  } });
  cue(Wd('gun', 15), 'tock', { gain: 0.5 }); cue(Wd('jammed', 15), 'slide', { gain: 0.45, dur: 0.5 }); cue(Wd('jammed', 15), 'pop', { gain: 0.35 });
  // S17 · gun bolted to a truck — the great chase.
  add({ id: 'S17', at: cut(16), d: L(17) - cut(16), draw(lt, d, t, blit) {
    resetFD(); [sol2, far1, far2].forEach((p) => (p.group.visible = false));
    truck.visible = true;
    const tx = lerp(-8.5, 6.5, clamp(lt / (d - 0.1))), bounce = Math.abs(Math.sin(t * 9)) * 0.07;
    truck.position.set(tx, bounce, -2.2);
    gun.position.set(tx - 1.0, 1.14 + bounce, -2.2); gun.rotation.set(0, -Math.PI / 2, 0);
    sol1.at(tx - 1.05, 1.1 + bounce, -1.8).set({ mood: 'worried', look: [0.8, 0.2], armL: [80, -40], armR: [80, -40], legs: 'stand', blink: blink(t, 1) });
    mer.at(tx - 0.7, 1.1 + bounce, -2.8).set({ mood: 'shock', look: [0.9, 0.3], armL: [140, -30], armR: [140, -30], blink: blink(t) });
    const spec = [], pts = [];
    for (let i = 0; i < 5; i++) { const x = tx + 1.8 + i * 0.26, z = -2.4 + Math.sin(t * 2.2 + i * 1.9) * 1.05; spec.push([x, 0, z, { phase: t * 13 + i, run: 1, neck: 0.35 }]); pts.push([x - 0.8, z]); }
    spec.push(null, null, null); flock(spec);
    setPuffs([...dustTrail(pts, t, '#D8B98A', 0.55), ...dustTrail([[tx - 1.8, -2.2], [tx - 1.8, -1.4]], t, '#CBB58C', 0.6)]);
    shoot(FD.scene, FDpeople, V3(tx + 0.1, 4.3, 7.4), V3(tx + 0.25, 4.1, 7.0), V3(tx + 0.9, 0.8, -2.4), V3(tx + 0.9, 0.8, -2.4), 1, { ...LOOKS.field, fov: 48 });
    blit();
  } });
  cue(cut(16) + 0.05, 'chug', { gain: 0.5, dur: L(17) - cut(16) - 0.2 }); cue(Wd('chase', 16), 'whoosh', { gain: 0.35, dur: 0.8 });
  // S18 · the truck ended up in a tree.
  add({ id: 'S18', at: cut(17), d: L(18) - cut(17), draw(lt, d, t, blit) {
    resetFD(); [sol2, far1, far2].forEach((p) => (p.group.visible = false));
    truck.visible = true; truck.position.set(4.35, 0.12, -3.55); truck.rotation.set(0.1, Math.PI / 2, -0.22);
    gun.position.set(3.2, 1.14, -3.55); gun.rotation.set(0, -Math.PI / 2, 0.13);
    sol1.at(3.0, 1.1, -3.2).set({ mood: 'dizzy', look: [0.3, 0.5], armL: [30, -50], armR: [30, -50], lean: -6, blink: blink(t, 1) });
    mer.at(2.7, 0, -1.3).set({ mood: 'tired', look: [0.5, -0.1], armL: [12, -8], armR: [148, -34], lean: 3, blink: blink(t) });
    flock([null, null, null, null, null, null, null, null]);
    leaves.forEach((s, i) => { const fall = clamp((t - (cut(17) + 0.5 + i * 0.14)) / 1.1); s.visible = fall > 0 && fall < 1; s.position.set(6.3 + Math.sin(fall * 6 + i * 2) * 0.5 + (i % 3) * 0.3, 3.6 - fall * 3.1, -4.2 + (i % 2) * 0.4); s.material.rotation = fall * 3 + i; });
    shoot(FD.scene, FDpeople, V3(0.5, 3.2, 4.5), V3(1.0, 3.0, 3.8), V3(4.6, 1.0, -3.9), V3(4.6, 1.0, -3.9), eo(lt / d), { ...LOOKS.field, fov: 44 });
    blit();
  } });
  cue(cut(17) + 0.1, 'boing', { gain: 0.4 }); cue(Wd('tree', 17) - 0.12, 'thud', { gain: 0.65 });
  // S19 · by December, the army gave up. White flag, tired major, card.
  add({ id: 'S19', at: cut(18), d: L(19) - cut(18), draw(lt, d, t, blit) {
    resetFD(); [far1, far2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    ammoCrates.forEach((c) => { c.visible = true; c.scale.setScalar(1); });
    mer.at(1.15, 0, 3.15).set({ mood: 'tired', look: [-0.3, -0.2], legs: 'sit', armL: [10, -10], armR: [10, -10], lean: 4, blink: blink(t) });
    sol1.at(-0.7, 0, 2.6).set({ mood: 'tired', look: [0.3, 0], armL: [16, -12], armR: [16, -12], lean: 5, blink: blink(t, 1) });
    const raise = eo(seg(t, Wd('December', 18) + 0.35, Wd('gave', 18) + 0.5)) * (1 - 0.15 * seg(t, Le(18) - 0.5, Le(18)));
    sol2.at(0.2, 0, 2.0).set({ mood: 'tired', look: [0.2, 0.3], armL: [14, -10], armR: [lerp(40, 128, raise), -20], holdR: whiteFlag, v: 'flag' + Math.round(raise * 4), blink: blink(t, 2) });
    flock([null, null, [-4, 0, -6.5, { neck: 0.2, peck: 0.5 + 0.4 * Math.sin(t * 1.6) }], null, [0.5, 0, -7.5, { neck: 0.3 }], null, null, [5, 0, -6.8, { neck: 0.25, peck: 0.4 + 0.4 * Math.sin(t * 1.3 + 2) }]]);
    shoot(FD.scene, FDpeople, V3(0.4, 2.2, 8.6), V3(0.6, 2.05, 7.6), V3(0.4, 1.1, 2.2), V3(0.4, 1.1, 2.2), eo(lt / d), { ...LOOKS.field, fov: 46 });
    blit();
    const cs = eob(seg(t, cut(18) + 0.15, cut(18) + 0.45));
    if (cs > 0) { ctx.save(); ctx.translate(540, 452); ctx.scale(cs, cs);
      ctx.fillStyle = '#F6F1E6'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-235, -88, 470, 176, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#B5372E'; ctx.beginPath(); ctx.roundRect(-235, -88, 470, 48, [18, 18, 0, 0]); ctx.fill();
      ctx.fillStyle = INK; ctx.font = '900 62px Inter'; ctx.textAlign = 'center'; ctx.fillText('DECEMBER', 0, 42);
      ctx.fillStyle = '#8A8578'; ctx.font = '800 30px Inter'; ctx.fillText('1 9 3 2', 0, 76); ctx.restore(); }
  } });
  cue(cut(18) + 0.1, 'slide', { gain: 0.3, dur: 0.7 }); cue(Wd('December', 18), 'pop', { gain: 0.4 });
  // S20 · the tally: ten thousand rounds… maybe a thousand birds.
  add({ id: 'S20', at: cut(19), d: L(20) - cut(19), draw(lt, d, t, blit) {
    resetFD(); [far1, far2].forEach((p) => (p.group.visible = false));
    ammoCrates.forEach((c) => { c.visible = true; c.scale.setScalar(1); }); roundsSign.visible = true; roundsSign.scale.setScalar(1); bigStack.visible = true;
    const giveUp = seg(t, Wd('birds', 19), Wd('birds', 19) + 0.4);
    mer.at(0.4, 0, 2.0).set({ mood: giveUp > 0.5 ? 'tired' : 'neutral', look: [0.6, 0.3], talk: talk(t) * (1 - giveUp), armL: [14, -10], armR: giveUp > 0.5 ? [10, -6] : [105, -35], bob: giveUp > 0.5 ? 0 : Math.round(Math.sin(t * 5) * 2), blink: blink(t) });
    sol1.at(-1.3, 0, 2.6).set({ mood: 'neutral', look: [0.7, 0.2], armL: [12, -8], armR: [12, -8], blink: blink(t, 1) });
    sol2.at(1.9, 0, 2.7).set({ mood: 'tired', look: [0.5, 0.1], armL: [12, -8], armR: [12, -8], blink: blink(t, 2) });
    flock(Array.from({ length: 8 }, (_, i) => [-7.5 + i * 2.1, 0, -6.2 - (i % 2) * 1.1, { neck: 0.25, peck: i % 2 ? 0.45 + 0.35 * Math.sin(t * 1.5 + i * 2) : 0 }]));
    shoot(FD.scene, FDpeople, V3(1.6, 2.3, 8.6), V3(0.4, 3.5, 12.2), V3(1.6, 1.0, 0), V3(0.8, 1.2, -2.5), eo(lt / d), { ...LOOKS.field, fov: 46 });
    blit();
  } });
  cue(Wd('rounds', 19), 'stamp', { gain: 0.45 }); cue(Wd('birds', 19), 'chirp', { gain: 0.3, dur: 0.6 });
  // S21 · "these birds could out-tank tanks" — one emu strolls past like a tank.
  add({ id: 'S21', at: cut(20), d: L(21) - cut(20), draw(lt, d, t, blit) {
    resetFD(); [sol1, sol2].forEach((p) => (p.group.visible = false)); gun.visible = false;
    mer.at(-0.6, 0, 1.2).set({ mood: 'neutral', look: [0.5, 0.2], talk: talk(t) * seg(t, Wd('said', 20), Wd('tanks', 20) + 0.3), armL: [16, -12], armR: [95, -25], blink: blink(t) });
    far1.at(0.9, 0, 1.5).set({ mood: 'happy', look: [-0.5, 0.2], armL: [14, -10], armR: [14, -10], blink: blink(t, 1) });
    far2.at(1.85, 0, 1.2).set({ mood: 'happy', look: [-0.6, 0.2], armL: [14, -10], armR: [30, -50], holdR: wheatBunch, blink: blink(t, 2) });
    const prog = clamp(lt / (d - 0.2));
    hero.at(lerp(-6.5, 7, prog), 0, -2.9).set({ phase: t * 4.4, run: 0.45, neck: 0.6, bob: 5, flip: false });
    flock([null, null, null, null, null, null, null, null]);
    hero.group.visible = true;
    const steps = [0.25, 0.8, 1.35, 1.9, 2.45].map((s) => { const age = clamp((lt - s) * 1.6); return age > 0 && age < 1 ? [hero.group.position.x - 0.5, 0.3 + age * 0.3, -2.9, 0.5 + age * 1.1, (1 - age) * 0.45] : null; }).filter(Boolean);
    setPuffs(steps);
    shoot(FD.scene, FDpeople, V3(0.3, 2.2, 8.2), V3(0.5, 2.1, 7.4), V3(0.6, 1.2, 0.6), V3(0.6, 1.2, 0.6), eo(lt / d), { ...LOOKS.field, fov: 44 });
    blit();
  } });
  [0.25, 0.8, 1.35, 1.9, 2.45].forEach((s) => cue(cut(20) + s, 'thud', { gain: 0.22 })); cue(Wd('out', 20), 'pop', { gain: 0.4 });

  // --- the coat of arms, drawn as a 2D insert (shield + star + emu + kangaroo + banner) ---
  const star = (g, x, y, r, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + i * Math.PI / 7, rr2 = i % 2 ? r * 0.52 : r; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); };
  const emuSil = (g, x, y, s, col) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 0, 46, 30, 0, 0, 7); g.fill();
    g.lineWidth = 11; g.beginPath(); g.moveTo(34, -8); g.quadraticCurveTo(52, -38, 62, -52); g.stroke();
    g.beginPath(); g.ellipse(66, -54, 13, 8, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(76, -52); g.lineTo(96, -48); g.lineTo(76, -45); g.closePath(); g.fill();
    g.lineWidth = 5; g.beginPath(); g.moveTo(-6, 24); g.lineTo(-10, 62); g.moveTo(16, 24); g.lineTo(24, 62); g.stroke(); g.restore(); };
  const rooSil = (g, x, y, s, col) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 6, 26, 40, 0.25, 0, 7); g.fill();
    g.beginPath(); g.ellipse(16, -42, 10, 15, 0.4, 0, 7); g.fill();
    g.beginPath(); g.moveTo(20, -56); g.lineTo(26, -76); g.lineTo(30, -54); g.closePath(); g.fill();
    g.lineWidth = 8; g.beginPath(); g.moveTo(-14, 40); g.quadraticCurveTo(-48, 52, -66, 46); g.stroke();
    g.beginPath(); g.moveTo(6, 44); g.lineTo(38, 46); g.stroke(); g.restore(); };
  const drawCoatArms = (cx, cy, s) => { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.03);
    emuSil(ctx, -218, 30, 1.05, '#7A5C36'); rooSil(ctx, 222, 26, 1.0, '#A8763E');
    ctx.fillStyle = '#F4EFE4'; ctx.strokeStyle = '#C9A13B'; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(-118, -128); ctx.lineTo(118, -128); ctx.lineTo(118, 34); ctx.quadraticCurveTo(118, 108, 0, 152); ctx.quadraticCurveTo(-118, 108, -118, 34); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    star(ctx, 0, -72, 36, '#C9A13B');
    emuSil(ctx, -34, 6, 0.78, '#2E4E8A');
    [-64, 0, 64].forEach((dx) => star(ctx, dx, 96, 11, '#B5372E'));
    ctx.fillStyle = '#2E4E8A'; ctx.strokeStyle = '#C9A13B'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(-168, 168, 336, 56, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F6EFD8'; ctx.font = '900 36px Inter'; ctx.textAlign = 'center'; ctx.fillText('AUSTRALIA', 0, 208);
    ctx.restore(); };
  // S22 · the flip: the bird that beat the army is on the coat of arms.
  add({ id: 'S22', at: cut(21), d: L(22) - cut(21), draw(lt, d, t, blit) {
    podium.visible = false;
    ssMer.at(1.35, 0, 0.3).set({ mood: 'proud', look: [-0.6, 0.3], armL: [118, -40], armR: [118, -40], blink: blink(t) });
    ssFar1.at(1.95, 0, 0.9).set({ mood: 'happy', look: [-0.7, 0.3], armL: [20, -30], armR: [20, -30], bob: Math.round(Math.abs(Math.sin(t * 4)) * 3), blink: blink(t, 1) });
    ssFar2.at(2.2, 0, 0.55).set({ mood: 'happy', look: [-0.8, 0.3], armL: [20, -30], armR: [20, -30], blink: blink(t, 2) });
    ssHero.at(-1.2, 0, -0.5).set({ neck: 0.7, bob: 3 });
    ssEmu2.at(-2.0, 0, -2.2).set({ neck: 0.4 });
    [ssMer, ssFar1, ssFar2].forEach((p) => (p.group.visible = true)); ssHero.group.visible = ssEmu2.group.visible = true;
    shoot(SS.scene, SSpeople, V3(0.4, 2.4, 9.6), V3(0.7, 2.2, 8.6), V3(0.4, 1.3, -0.4), V3(0.4, 1.3, -0.4), eo(lt / d), { ...LOOKS.sunset, fov: 44 });
    blit();
    const popS = eob(seg(t, Wd('coat', 21), Wd('coat', 21) + 0.32));
    if (popS > 0) drawCoatArms(600, 700, popS * 0.92);
  } });
  cue(Wd('on', 21), 'ding', { gain: 0.5 }); cue(Wd('coat', 21), 'sparkle', { gain: 0.5, dur: 0.7 });
  // S23 · winner's podium, mate.
  add({ id: 'S23', at: cut(22), d: T - cut(22) + 0.35, draw(lt, d, t, blit) {
    podium.visible = true;
    ssHero.at(0, 0.95, -0.8).set({ neck: 0.85, bob: 2 });
    ssHero.group.visible = true;
    ssMer.at(-1.15, 0.55, -0.8).set({ mood: 'laugh', look: [0.4, 0.4], armL: [122, -44], armR: [122, -44], blink: blink(t) });
    ssFar1.at(1.35, 0, 0.3).set({ mood: 'laugh', look: [-0.5, 0.3], armL: [110, -40], armR: [110, -40], bob: Math.round(Math.abs(Math.sin(t * 5)) * 4), blink: blink(t, 1) });
    ssFar2.group.visible = false;
    ssEmu2.at(-2.3, 0, -2.0).set({ neck: 0.5, peck: 0.2 }); ssEmu2.group.visible = true;
    [ssMer, ssFar1].forEach((p) => (p.group.visible = true));
    shoot(SS.scene, SSpeople, V3(0.2, 2.4, 8.8), V3(0.3, 2.2, 7.8), V3(-0.2, 1.25, -0.7), V3(-0.2, 1.25, -0.7), eo(lt / d), { ...LOOKS.sunset, fov: 42 });
    blit();
    if (t > Wd('podium', 22)) { const cols = ['#FF5D73', '#FFD43B', '#4ECDC4', '#F6F1E6', '#7BC96F'];
      for (let i = 0; i < 42; i++) { const rnd = (n) => { const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return v - Math.floor(v); };
        const y = -30 + ((rnd(1) * 500 + (t - Wd('podium', 22)) * (230 + rnd(2) * 130)) % 1560);
        ctx.save(); ctx.translate(rnd(3) * 1060 + 10, y); ctx.rotate(i + (t - Wd('podium', 22)) * (2 + rnd(4)));
        ctx.fillStyle = cols[i % 5]; ctx.globalAlpha = 0.9; ctx.fillRect(-8, -4, 16, 8); ctx.restore(); } }
  } });
  cue(Wd('podium', 22), 'boing', { gain: 0.5 }); cue(Wd('mate', 22), 'sparkle', { gain: 0.5, dur: 0.8 }); cue(Wd('mate', 22) + 0.1, 'pop', { gain: 0.4 });

  return { shots: S.sort((a, b) => a.at - b.at), cues: CUES.sort((a, b) => a.t - b.t), total: T + 0.45 };
}
