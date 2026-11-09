# Deep Dive 3D — Pipeline Upgrade Plan (v2)

Status: **PLAN ONLY — nothing in this document is built yet.**
Target style: `deep-dive` only. Tall Tale 3D and the other styles keep the
v1 pipeline until this plan is proven on Deep Dive.
Target machine: the owner's laptop (Acer Nitro V AN515-57, i5-11400H,
16 GB RAM, **RTX 3050 4 GB VRAM**, Windows) running **Codex locally**.
Guardrail inherited from the owner's previous upgrade round: a quality
feature is only adopted if it does not degrade end-to-end render speed by
more than ~1.5x on the target machine, measured — not guessed.

---

## 0. Where Deep Dive stands today (v1 audit, 2026-11-09)

Engine (`styles/deep-dive/example/src/`):

- `core/engine.js` — three.js renderer: ACES tone curve, soft shadows,
  RoomEnvironment IBL, BokehPass depth of field, UnrealBloom, vignette +
  grain. One `look` object per shot (focus, aperture, bloom, exposure…).
- `core/sdf.js` — SDF sculpting (surface nets → smooth geometry with vertex
  colours). Everything organic is built from this: body, organs, props.
- `core/human.js` — ONE sculpted body, many looks. Joint posing in degrees,
  eyelids, walk cycle, breathing via torso scale, whole-body x-ray material
  swap. Hands are mittens — the STYLE.md explicitly says avoid hand
  close-ups.
- `core/sets.js` — only THREE sets exist: `kitchen`, `xrayStage`, `vessel`
  (with a CO2/darkness update). Every new location is new code.
- `core/look2d.js` — captions (1–3 words, one yellow), `label()` pills with
  leader lines, `pill()` counters, `warning()`.
- Format: 1080×1920, **24 fps**, 30–45 s, voice `am_michael` x1.0, music
  `tension`/`bed` (procedural, `tools/mix.py`).

Pipeline: `script.json` → Kokoro voice (CPU) → Whisper small.en word
timings (CPU) → `shots.js` → headless Chrome `capture.mjs` grabs **every
frame as a JPEG data-URL through DevTools, one frame at a time** → ffmpeg
(libx264) encode. QA is a contact sheet + manual frame inspection.

Known v1 ceilings, in the order a viewer notices them:

1. One body, mitten hands, calm-only faces → limited acting, no close-ups.
2. Three sets and three interior locations (lungs/heart/stomach via
   `insides()`, one vessel) → topics quickly repeat visually.
3. Flat-ish organic surfaces: vertex-colour SDF with no AO/cavity shading,
   so organs read "clay" rather than "tissue".
4. Capture is single-threaded and CPU-bound even on a GPU machine.
5. QA is entirely manual; label/face collisions are found by eye, late.

---

## Phase 0 — Baseline on the laptop (do first, half a day)

Nothing is upgraded until the laptop baseline exists.

1. Run Profile A from `AGENTS.md`; probe the WebGL renderer string and
   record it in the project notes. Gate: must say NVIDIA, not SwiftShader.
2. Re-render the stock example ("Hold Your Breath", 37 s, 11 shots)
   untouched. Record: total wall time, ms/frame split into
   *draw / readback / encode* (instrument `capture.mjs` with three timers),
   VRAM peak, and the contact sheet. Save 12 golden frames.
3. These numbers and frames are the acceptance reference for every later
   phase. Any phase that regresses them beyond the guardrail is reverted
   or made opt-in per shot.

**Deliverable:** `docs/deep-dive-baseline.md` in the project repo with the
timings table + golden frames committed.

## Phase 1 — Speed on the RTX 3050 (biggest win, lowest risk)

1. **Kill the data-URL bottleneck.** Replace the per-frame
   `canvas.toDataURL('image/jpeg')` round-trip (WebGL canvas → 2D canvas
   copy → base64 → Node) with CDP `Page.captureScreenshot`
   (`fromSurface: true`, jpeg) or a direct WebGL `toBlob` queue. Keep
   frame-exactness: one screenshot per `OP.frame(t)` call, no
   captureStream/MediaRecorder (not frame-exact).
2. **Chunked parallel rendering, formalized.** `capture.mjs video` already
   accepts `[start end]` ranges — v1 Emu War was rendered in chunks by
   hand. Add `tools/render_chunks.mjs`: split the timeline into N chunks,
   run N headless Chrome instances, concat with ffmpeg, mix audio once.
   On this laptop: **N = 2** (4 GB VRAM and DOF+bloom at 1080×1920 make
   3+ instances risky; benchmark N=2 vs N=3 in Phase 0 style before use).
3. **NVENC encode.** RTX 3050 has an NVENC encoder: switch the final
   encode from `libx264 -preset veryfast` to `h264_nvenc` (quality-matched
   CQ), keep libx264 as the fallback and for the small share copy.
   Keep `FINISH=1` (hqdn3d + CAS) — measured ~4% cost on v1 — but benchmark
   it once on the laptop; it is a CPU filter chain.
4. **SDF geometry cache.** Surface-net generation is CPU-expensive and
   currently rebuilt per project build. Cache generated organ/prop
   geometries keyed by their SDF parameters (serialize BufferGeometry to
   `data/cache/`), so iteration on `shots.js` never re-sculpts unchanged
   organs.
5. **Optional, only if the timers say so:** GPU Whisper
   (faster-whisper with CUDA/cuBLAS on the 3050) and Kokoro via
   onnxruntime-gpu. Voice+timing is a small share of total time — do this
   last and only with measurements.

**Acceptance:** stock example renders ≥2x faster end-to-end than the
Phase 0 baseline, golden frames pixel-comparable (same look, new pipe).

## Phase 2 — Render quality (the visible upgrade)

1. **Cavity/AO in the SDF kit.** Use the SDF gradient/density during
   surface-net generation to bake cheap ambient occlusion into vertex
   colours (darken creases and contact areas). This is the single cheapest
   "clay → tissue" improvement and costs nothing at render time.
2. **Organ material pass.** Extend `xrayMaterial` and add a `tissue`
   material family: slight sheen (MeshPhysicalMaterial), fresnel rim for
   x-ray glass, emissive pulse channels so organs can glow on their cue
   word (heart on "beat", lungs on "oxygen") instead of only via labels.
3. **Post stack tuning, per world.** The three worlds get named, tuned
   looks instead of per-shot hand values: `REAL` (warm, aperture
   0.003–0.006 as today), `XRAY` (cooler, stronger bloom on skeleton),
   `INSIDE` (deep red, bloom + stronger grain). Add optional **2-subframe
   motion blend** for fast camera moves (renders t and t+1/48, blends) —
   GPU-cheap at 24 fps, big perceived smoothness win. Opt-in per shot.
4. **Lighting:** keep RoomEnvironment IBL; add a reusable soft
   contact-shadow blob under the standing figure for real-world sets, and
   volumetric-cone safety rules from the existing QA notes (cameras stay
   out of light cones) enforced by a warning in `check` mode when a camera
   path intersects a cone volume.
5. **Anti-aliasing check:** verify MSAA resolve order with the
   EffectComposer chain on the vendored three version; if MSAA is being
   lost through the composer (a common three.js pitfall), move to an SMAA
   pass or a render-target samples fix. Judge on golden frames, zoomed.

**Acceptance:** side-by-side golden-frame review with the owner-facing
contact sheet; no frame-time regression beyond the guardrail at full
quality on the 3050.

## Phase 3 — Acting and anatomy (the content upgrade)

1. **Human v2.** Same sculpted identity, upgraded rig:
   - Articulated hands: capsule-SDF fingers with 2 joints each, posed by
     the same degree system as arms. Unlocks hand close-ups (holding,
     gripping, pointing at organs) that v1 forbids.
   - Face: add brows + mouth-shape parameters (the Deep Dive face stays
     calm/readable — this is for strain, effort, relief: breath-hold
     cheeks, wince on warning beats), plus gaze targets already in v1.
   - Breathing v2: chest + shoulders + diaphragm as one driven system,
     parameterised by a `breath(t)` curve the shot can exaggerate for
     physiology beats.
2. **Organ library** (build once, reuse forever; all SDF, all cached):
   heart (4 chambers, valve flaps, `beat(t, bpm)`), lungs (bronchial tree
   branching, `breathe(t)`), stomach + intestines, brain (hemispheres,
   signal pulses along paths), eye cross-section, ear cross-section,
   kidney, skin cross-section (layers for burn/touch topics), bone +
   joint (for knuckle/break topics), teeth/jaw. Each organ ships with:
   geometry builder, x-ray variant, inside-vessel entry point, and 2–3
   pre-authored camera moves.
3. **Vessel v2.** InstancedMesh red blood cells (thousands, GPU-instanced,
   deforming slightly), platelets, flow field with speed lines tied to
   heart rate, wall with subtle pulse. Replaces the current single
   `vessel(E).update(t, camZ, co2, dark)` with a parameterised journey
   kit: enter → travel → arrive at organ.
4. **Set library.** Modular room kit in the `sets.js` pattern (floor,
   walls, window light, prop slots): bathroom, bedroom, living room,
   street/park, gym, pool side, classroom/office, car interior. Each set
   declares safe camera zones (aisles) so the Phase 2 cone/occlusion
   checks can run automatically.

**Acceptance:** one new 30–45 s Deep Dive short built *only* from library
pieces (no new one-off geometry) at equal or better quality than a v1
hand-built short.

## Phase 4 — Codex-local workflow and QA automation

This pipeline is run by Codex on the laptop, so the workflow itself is
part of the upgrade:

1. **Shot templates per beat type** in `styles/deep-dive/templates/`:
   hook (real world), question/x-ray reveal, inside journey, warning,
   myth-bust, payoff return. Each template is a working `shots.js`
   fragment with the camera move, look, caption and label placement
   pre-authored; Codex fills in topic specifics instead of inventing
   staging per video.
2. **Render telemetry for QA.** During capture, log every label/pill's
   screen box and every face's screen box per sampled frame to
   `review/telemetry.json`. `check` mode then *fails automatically* on
   label-over-face overlap and caption-zone collisions instead of relying
   on eyeballing the contact sheet. The sheet review stays — telemetry
   narrows what the human/agent eye must catch.
3. **One-command laptop build:** `tools/build.ps1` (or a Git Bash
   `build.sh`) that runs voice → words → check → cues → mix → chunked
   render → sheet, prints the Phase 0-style timing table, and stops at
   the QA gate. Long renders run as a background process with a log file
   Codex can poll, so an agent session never sits blocked for an hour.
4. **Golden-project regression:** the stock example + the Phase 3 library
   short are re-rendered on every engine change; frame-diff against
   goldens (tolerance for grain) must pass before the change is kept.
5. **Versioning discipline:** each phase lands as its own PR/commit series
   on a `deep-dive-v2` branch, tagged (`v1.1`, `v1.2`, …) only when its
   acceptance test passes. `main` always stays the last known-good
   pipeline — a broken experiment can never block a production short.

## Explicitly NOT in this plan

- No AI-generated images or video, no paid APIs/credits (v1 rule).
- No Blender as the renderer (offline asset baking only, as in v1), no
  external rigged character packs or mocap — Deep Dive's SDF body *is*
  the style; replacing it breaks continuity with published shorts.
- No three.js major-version jump in Phases 1–2. If a jump is ever needed,
  it is its own phase with a full golden regression.
- No Codex Cloud assumptions anywhere: every step must run on the laptop,
  offline except for model downloads in `setup.sh`.
- No upload automation changes — publishing stays exactly as `AGENTS.md`
  describes (explicit owner request, channel check first, 5-minute gaps).

## Order and effort (estimates, laptop + Codex local)

| Phase | What you get | Rough effort |
|---|---|---|
| 0 | Laptop baseline + goldens | ~half a day |
| 1 | ≥2x faster renders (capture, chunks, NVENC) | 1–2 days |
| 2 | Tissue/AO materials, per-world looks, motion blend | 2–3 days |
| 3 | Human v2, organ + vessel + set libraries | 1–2 weeks, incremental per organ/set |
| 4 | Templates, telemetry QA, one-command build | 2–3 days, can overlap Phase 3 |

Phases 0→1→2 are the recommended first run: they make every future Deep
Dive short faster and visibly better without touching content. Phase 3
then grows the library topic by topic, driven by what the channel
actually publishes.
