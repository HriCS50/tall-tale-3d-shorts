# External skills & references — audit of 2026-11-09

## Local integration review

The audit below came with the v2 ZIP; its claims about other machines and
upstream installations are historical context, not verified local state.
The local update preserves the reviewed Windows capture, audio timing, and
self-test fixes plus the Pet Rock production. The ZIP is a revision of the
v1.0.0 export, not a new v2.0.0 release; the existing tag is unchanged.

Use this bundle for the following optional tasks:

- Scene craft: `external-skills/threejs-aaa-graphics-builder/`.
- Profiling: `external-skills/threejs-debug-profiler/`.
- Canvas inspection ideas: `external-skills/threejs-qa-release/`.
- Offline Blender assets: the 17 `external-skills/blender-*/` folders.
- Camera, rhythm, and animation: `references/external/` and the four new
  easing exports in Tall Tale's example `src/core/lib.js`.

These are bundled under the Tall Tale skill, with their shared references;
they are not copied into separate global skill folders. Read only relevant
guides. Upstream game/mobile requirements, Blender rendering, paid asset
generation, and unavailable sibling skills do not apply to this video
pipeline. Final rendering and QA use `tools/capture.mjs` and the root
workflow. Discover Blender MCP before using it; its availability was not
tested during this update. The optional game inspector requires its own
Playwright/pngjs dependencies and game hooks, so it is not a drop-in
replacement for the video capture tool.

Packaging corrections in this local update: namespace every Blender skill's
frontmatter, remove a duplicate YAML key, preserve the MIT license in each
redistributable folder, restore nine missing Blender shared references,
and repair Three.js shared-reference links. The asset-recovery guide is
adapted for local procedural assets. Shared documentation was retrieved
from these pinned upstream revisions:

- Blender: `arjun988/blender-skills` at
  `904f095d8f36a6e72adaebb08d07f884a074743d`.
- Three.js: `majidmanzarpour/threejs-game-skills` at
  `8286774b22a2566bf894dbc825825c16921866af`.

The remaining upstream routing tables describe more skills than this
curated subset contains. Use the included specialist only when available;
do not install the rest of the upstream suite implicitly.

## Supplied audit

Twelve public repos were cloned, read and judged against one question: does
this genuinely help the **Tall Tale 3D** style (Three.js in headless Chrome,
flat 2D Toon characters in 3D sets, fixed-timeline chunked rendering, $0
local pipeline)? Verdicts below. Adopted material lives in
`external-skills/` and `references/external/`; everything else was
deliberately left out, with the reason recorded so nobody re-adds it later.

## Adopted as skills — `external-skills/`

From **majidmanzarpour/threejs-game-skills** (MIT):

- `threejs-aaa-graphics-builder` — procedural model/material recipes,
  lighting & tone-mapping order, shader cookbook, render budgets /
  instancing / LOD for constrained GPUs. The main lever for richer
  Tall Tale sets on the RTX 3050 (and llvmpipe fallback). Consult for
  scene polish, not as a build workflow — it assumes interactive games.
- `threejs-debug-profiler` — draw-call / triangle / texture profiling
  playbook for headless-Chrome Three.js. Use when a scene threatens the
  per-frame chunk budget.
- `threejs-qa-release` — canvas-pixel inspection + visual-regression
  thinking; complements the engine's contact-sheet QA.
- `threejs-game-feel-reference/game-feel.md` — camera follow/FOV, hitstop
  and screenshake notes that translate to reaction punch-ins.

Excluded from that repo: its three paid-API generator skills (Tripo /
Gemini / ElevenLabs assets — this pipeline is $0 and code-only), its
gameplay scaffold and Rapier physics (already evaluated, not adopted),
and the game UI / director skills (no role in a video pipeline).

From **arjun988/blender-skills** (MIT) — 17 of its 95 skills, the ones
aimed at Blender as an *offline authoring* tool for sets/props that get
exported to Three.js (Blender is never the video renderer here):
`blender-director`, `blender-modeler`, `blender-cartoon-style`,
`blender-stylized-style`, `blender-lowpoly-style`,
`blender-environment-artist`, `blender-prop-artist`, `blender-set-dressing`,
`blender-scene-assembly`, `blender-lighting`, `blender-materials`,
`blender-lookdev`, `blender-camera-cinematography`, `blender-animation`,
`blender-asset-optimization`, `blender-export-pipeline`, `blender-qa-review`.
Generic upstream names were prefixed with `blender-` to avoid skill-routing
collisions. These skills describe Blender operations through the ahujasid Blender MCP.
The source audit reports a working installation in its environment; discover
the tools on the target machine before using them.

## Adopted as reference — `references/external/`

Not installed as skills; read when designing shots or tuning QA.

- `shotcraft/` (from Vincentwei1021/video-shotcraft, Apache-2.0) — camera
  and rhythm shot-recipe cards (crash-zoom punch-in, tension moves,
  depth-layer moves, sakuga timing, beat cuts) with frame budgets and
  easing notes. Engine-agnostic; the repo's Remotion promo demos and
  template were not taken. Card bodies are mostly Chinese with English
  technical terms.
- `motionmaxxing/` (from Tejashmakwana/motionmaxxing, Apache-2.0 parts
  only) — measured motion data from professional work: `motion.md`,
  `transitions.md`, `judgment.md`, and `moments.jsonl` (716 data
  records plus one metadata record in this bundle). The file describes
  study-derived motion rules as unverified; use them as craft prompts and
  check their cited measurements before treating them as evidence. Also the source of two QA gate definitions worth applying
  to Tall Tale contact-sheet review: no more than 3 consecutive flat/dead
  frames, and end-card hold ≤ 1.4 s. Its GSAP runtime file is under
  GreenSock's own license and was **not** copied; its ElevenLabs voice
  path conflicts with local Kokoro.
- `3dviz/` (from viettranx/3dviz-pro-max, MIT) — `references/` (lighting
  direction & scale, object craft: silhouette / proportions / joins, the
  visual anti-slop checklist) plus `templates/rigs/` (camera-orbit-follow,
  sun and night-lantern lighting, post stack) and `templates/checklists/`
  as reading/code reference. The repo's 5.7 MB catalog and interactive
  diorama kits were not taken — they target explorable scenes, not
  fixed-timeline 9:16 video.

## Also incorporated — engine change

`styles/tall-tale/example/src/core/lib.js` gained four closed-form Penner
eases ported as plain math (no dependency): `eex` (expo-out), `esi`
(sine-in-out), `eel` (elastic-out), `ebn` (bounce-out), alongside the
existing `eo` / `eio` / `eob`. For curved camera or subject paths, use the
already-vendored `THREE.CatmullRomCurve3` / `SplineCurve` — no plugin
needed. New projects scaffolded from the example get the new eases
automatically; existing projects are untouched.

## Skipped — and why

- **greensock/gsap** — real-time tween engine; its timelines don't beat
  this engine's Whisper word-anchored timing, motion paths are covered
  by Three.js curve classes, and its only real gap (ease variety) is
  closed-form math — ported above instead. Also under GreenSock's own
  "no charge" license, not MIT/Apache; don't vendor it into this repo.
- **heygen-com/hyperframes** (Apache-2.0) — a complete alternative
  HTML-based rendering pipeline, i.e. a competitor to this engine, and
  Remotion already fills the second-renderer slot. Its bundled skills
  teach its own runtime and would mislead Tall Tale builds. Craft
  reading only (`skills/hyperframes/references/` upstream).
- **remotion-dev/skills** — already installed (v4.0.541); the current
  upstream (v4.0.542) differs only by a version string, one typo fix and
  one cross-reference paragraph. Refresh via `npx skills add` as routine
  maintenance, not a repo change.
- **ahujasid/mcp-for-blender** (MIT) — byte-identical duplicate of the
  Blender MCP addon already installed and verified working (MD5 match,
  v1.8). This repo is its upstream update source; install nothing.
- **OpenMontageInc/OpenMontage** — AGPL-3.0 (copyleft: do not copy into
  this repo), and its model conflicts with the house rules on three
  counts: AI-generated footage, per-video spend, and human approval
  gates. Its good ideas (pipeline manifests, resumable checkpoints)
  already exist here as the plan → build → QA flow and chunked renders.
- **achimala/dream-loop** (MIT) — its core loop requires AI-generated
  target images (built-in or paid fal.ai/Gemini) and pixel-matching a
  generated target; both conflict with the code-only / original-designs
  rules. The screenshot-critic idea already exists as contact-sheet QA.
- **wheresryan22/anatomy** (MIT) — despite the name, not a character
  anatomy resource: it builds interactive isometric explainer figures
  for technical concepts. Nothing for Toon proportions or faces.

## License note

Adopted folders retain their upstream LICENSE / NOTICE files. Apache-2.0
material (shotcraft, motionmaxxing extracts) requires that attribution to
travel with it — it does, inside each folder. Nothing AGPL and nothing
under the GreenSock license is included in this repo.
