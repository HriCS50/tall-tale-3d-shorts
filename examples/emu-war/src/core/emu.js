// Emu: a flat 2D cartoon emu (thick ink outlines, shaggy body, long neck, long running legs) that lives inside the
// 3D world as a camera-facing cut-out with a real shadow — a companion to the Toon people, same recipe.
//   new Emu({ height })  .set({ phase, run, neck, peck, flip, bob })  .face(camera)  .at(x, y, z)  .group
// phase = leg cycle (radians) · run 0..1 (0 = standing, 1 = full stride) · neck -1..1 (head dip / stretch)
// peck 0..1 (head down to the ground) · flip mirrors the bird left/right.
import * as THREE from 'three';

const INK = '#1F1C33';

export function drawEmu(g, st = {}) {
  const S = { phase: 0, run: 0, neck: 0, peck: 0, flip: false, bob: 0, ...st };
  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (S.flip) { g.translate(512, 0); g.scale(-1, 1); }
  const bob = (S.bob || 0) + (S.run > 0.05 ? Math.abs(Math.sin(S.phase)) * 10 * S.run : 0);
  const bodyY = 505 - bob, hipY = bodyY + 95;

  const leg = (hipX, side, front) => {
    const ph = S.phase + (side > 0 ? Math.PI : 0);
    const stride = Math.sin(ph) * 95 * S.run, lift = Math.max(0, -Math.cos(ph)) * 68 * S.run;
    const fx = hipX + stride + side * 8, fy = 1000 - lift;
    const kx = (hipX + fx) / 2 + 26, ky = (hipY + fy) / 2 - 16;
    g.strokeStyle = front ? '#5E5248' : '#4C4239'; g.lineWidth = 13;
    g.beginPath(); g.moveTo(hipX, hipY - 10); g.quadraticCurveTo(kx, ky, fx, fy - 26); g.stroke();
    g.lineWidth = 9;                                                        // toes
    [-14, 0, 14].forEach((dx) => { g.beginPath(); g.moveTo(fx, fy - 24); g.lineTo(fx + dx * 1.4, fy - 2); g.stroke(); });
  };
  leg(215, -1, false);

  // tail feathers (back = left)
  g.fillStyle = '#6F6152'; g.strokeStyle = INK; g.lineWidth = 6;
  for (let i = 0; i < 5; i++) { const a = -0.5 + i * 0.24; g.save(); g.translate(92, bodyY - 18); g.rotate(a); g.beginPath(); g.ellipse(-38, 0, 52, 17, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }

  // body: a big shaggy oval
  const body = new Path2D(); body.ellipse(252, bodyY, 172, 106, 0, 0, 7);
  g.fillStyle = '#8A7967'; g.fill(body);
  g.save(); g.clip(body);
  g.fillStyle = '#776857'; g.beginPath(); g.ellipse(300, bodyY + 78, 190, 80, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(90,76,62,0.55)'; g.lineWidth = 6;                  // feather scallops
  for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) { const x = 120 + i * 42 + (r % 2) * 20, y = bodyY - 58 + r * 38; g.beginPath(); g.arc(x, y, 19, 0.25, Math.PI - 0.25); g.stroke(); }
  g.fillStyle = 'rgba(255,246,230,0.20)'; g.beginPath(); g.ellipse(190, bodyY - 52, 90, 34, -0.2, 0, 7); g.fill();
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 8; g.stroke(body);
  // wing patch
  g.fillStyle = '#776854'; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.ellipse(238, bodyY + 12, 84, 52, -0.15, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(60,50,42,0.5)'; g.lineWidth = 5;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(190 + i * 44, bodyY + 4 + (i % 2) * 16, 17, 0.25, Math.PI - 0.25); g.stroke(); }

  // neck: thick S-curve from the body's front up to the head
  const dip = S.peck * 300 + (1 - S.peck) * (-S.neck * 46) + Math.sin(S.phase * 0.5) * 4 * S.run;
  const hx = 452, hy = 196 + dip + (S.peck ? 120 : 0);
  g.strokeStyle = '#7D6C5B'; g.lineWidth = 37;
  g.beginPath(); g.moveTo(382, bodyY - 28); g.quadraticCurveTo(438, (bodyY + hy) / 2 - 10, hx - 8, hy + 16); g.stroke();
  g.strokeStyle = '#93826D'; g.lineWidth = 13;
  g.beginPath(); g.moveTo(392, bodyY - 30); g.quadraticCurveTo(446, (bodyY + hy) / 2 - 12, hx - 2, hy + 14); g.stroke();
  // head
  g.save(); g.translate(hx, hy); g.rotate(0.1 + S.peck * 0.5);
  g.fillStyle = '#84735F'; g.strokeStyle = INK; g.lineWidth = 7;
  g.beginPath(); g.ellipse(0, 0, 45, 26, 0, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 5;                                     // crest wisps
  [-12, 0, 12].forEach((dx) => { g.beginPath(); g.moveTo(dx - 6, -22); g.quadraticCurveTo(dx - 10, -42, dx - 22, -46); g.stroke(); });
  g.fillStyle = '#43434E';                                                  // beak
  g.beginPath(); g.moveTo(36, -8); g.lineTo(92, 4); g.lineTo(38, 15); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(10, -5, 11, 0, 7); g.fill(); g.stroke();   // eye
  g.fillStyle = INK; g.beginPath(); g.arc(13, -5, 5.5, 0, 7); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(15, -7, 2, 0, 7); g.fill();
  g.restore();

  leg(292, 1, true);
  g.restore();
}

let shadowTex = null;
function blobTex() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(30,20,40,0.7)'); gr.addColorStop(0.6, 'rgba(30,20,40,0.22)'); gr.addColorStop(1, 'rgba(30,20,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); shadowTex = new THREE.CanvasTexture(c); return shadowTex;
}

export class Emu {
  /** height = metres from feet to the top of the head (≈1.9) */
  constructor({ height = 1.9, res = 1.5 } = {}) {
    this.res = res; this.height = height;
    this.canvas = document.createElement('canvas'); this.canvas.width = 512 * res; this.canvas.height = 1024 * res;
    this.g = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    const H = height / 0.96, Wd = H / 2;
    const geo = new THREE.PlaneGeometry(Wd, H); geo.translate(0, H / 2 - H * (24 / 1024), 0);
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(Wd * 1.05, Wd * 0.36), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.55 }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.01;
    this.group = new THREE.Group(); this.pivot = new THREE.Group(); this.pivot.add(this.mesh); this.group.add(this.pivot, this.blob);
    this.key = ''; this.set({});
  }
  set(st = {}) {
    const q = { ...st, phase: st.phase ? Math.round(st.phase / 0.4) * 0.4 : 0, bob: st.bob ? Math.round(st.bob / 3) * 3 : 0 };
    const key = JSON.stringify(q);
    if (key === this.key) return this;
    this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.scale(this.res, this.res); drawEmu(g, q);
    this.tex.needsUpdate = true; return this;
  }
  face(cam) { const p = new THREE.Vector3(); this.group.getWorldPosition(p); this.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - this.group.rotation.y; return this; }
  tint(col) { this.mat.color.set(col); return this; }
  at(x, y, z) { this.group.position.set(x, y, z); return this; }
}
