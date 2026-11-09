# AGENTS.md — Instructions for Codex (and any coding agent) working in this repo

This repo is a complete, code-only production pipeline for narrated faceless
YouTube Shorts. Everything is generated in code: script → local AI voice →
word timings → animated shots (three.js / canvas in headless Chrome) →
procedural sound → ffmpeg MP4. No AI images or video, no API keys, no credits.

**Canonical workflow document: `SKILL.md`. Read it in full before your first
build, and read the chosen style's `styles/<style>/STYLE.md` in full before
planning any video.** This file is the Codex-facing summary + the owner's
standing rules + the machine-specific render profiles. Where this file and
SKILL.md disagree, SKILL.md wins on workflow, this file wins on owner rules
and render settings.

## Target machine (primary)

The owner runs Codex **locally** on his laptop — not Codex Cloud:

- Acer Nitro V AN515-57, Windows, Intel i5-11400H (6 cores), 16 GB RAM
- **NVIDIA RTX 3050, 4 GB VRAM** — hardware WebGL is available and expected
- ChatGPT Plus account; Codex CLI / IDE extension / desktop app, local mode

Secondary environment (the machine this export came from): a Linux VM with
no GPU. Its software-render profile is kept below as a fallback only.

## Setup (Windows laptop)

1. Install: Node.js 22+, ffmpeg (ffprobe on PATH), Google Chrome,
   Python 3.10+, Git for Windows (use **Git Bash** for all `.sh` scripts —
   the pipeline is bash; do not try to run the `.sh` files in PowerShell).
2. From the repo root in Git Bash:
   `bash scripts/setup.sh` — must print **All set**. It builds a Python venv
   in `~/.faceless-shorts/venv` and downloads Kokoro (~340 MB) and Whisper
   small.en (~0.5 GB). These models are deliberately NOT in this repo.
3. `bash scripts/selftest.sh` — must print **SELFTEST PASSED**. Look at the
   contact sheet and clip it names before doing anything else.
4. Before your first real render, run the renderer probe (below) and a
   4-frame test render. Do not start a long render on an unverified profile.

## Render profiles — pick by probe, not by habit

`tools/capture.mjs` in each project drives headless Chrome. It only forces
software rendering when env vars tell it to. **Probe first:** render one
frame and check the WebGL renderer string
(`WEBGL_debug_renderer_info` / `UNMASKED_RENDERER_WEBGL`).

### Profile A — RTX laptop (DEFAULT on the owner's machine)

- No `DISPLAY`, no `LIBGL_ALWAYS_SOFTWARE`, no `ANGLE`, no `SOFTWARE_GL`,
  no `QS` (empty QS = full quality: res 1.0, MSAA 4x, 2048 shadows).
- `FINISH=1` (ffmpeg hqdn3d + CAS finishing pass, ~4% cost).
- Probe must report the NVIDIA GPU (ANGLE / Direct3D11 or OpenGL).
  If it reports **SwiftShader**, STOP: headless Chrome has fallen back to
  software. Fix the Chrome flags in `capture.mjs` (e.g. `--use-angle=d3d11`)
  and re-probe. Never accept SwiftShader timings on this machine.
- Expected bottleneck after the GPU fix: per-frame JPEG readback through
  DevTools + the ffmpeg pipe (CPU-serial). That is normal.

### Profile B — Linux, no GPU (fallback, e.g. the export-source VM)

- Start Xvfb once: `Xvfb :99 -screen 0 1280x1024x24 &`
- Prefix renders: `DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 ANGLE=gl FINISH=1`
  with `QS=''` (full quality). Probe must say **llvmpipe**, not SwiftShader.
- Measured on that VM: full-quality llvmpipe ≈ 2x faster than the old
  degraded SwiftShader settings (72-frame segment: 205 s vs 414 s).

### Profile C — last resort only

`SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24` (~2 s/frame).
Use only when neither A nor B is available. Tell the owner you degraded.

## Production workflow (summary — SKILL.md is canonical)

1. **Intake:** topic, length, voice (default `am_michael`), music, end line.
2. **Style:** six styles in `styles/`. 3D styles: `deep-dive`, `night-file`,
   `tall-tale`. 2D styles: `inside-out`, `stick-story`, `paper-atlas`.
3. **Plan:** title, full narration (one line per cut, caption chunks marked),
   shot list, facts + sources. Follow the owner's style rule below.
4. **Build:** `bash scripts/new_video.sh <style> <short-name>` →
   write `script.json` → `scripts/py scripts/voice.py <proj>` →
   `scripts/py scripts/words.py <proj>` → rewrite `src/shots.js`
   (one shot per line, key moments on words via `Wd('word', line)`).
5. **Render loop:** in the project: `node tools/capture.mjs check`
   (must say CHECK OK) → `node tools/capture.mjs cues` →
   `scripts/py tools/mix.py .` → QA → `node tools/capture.mjs video
   renders/<name>.mp4` using the correct render profile above.
6. **QA — never deliver a frame you haven't looked at:**
   `node tools/capture.mjs sheet review/all.jpg 0.5 10`, read the whole
   sheet, then key frames full-size. Check: picture matches the narration at
   that moment, nothing collides with the caption zone, captions are 1–3
   words with exactly the style's highlight rule, style palette respected,
   voice clear over music. Fix, re-render the sheet, re-check. Report what
   you caught and fixed.
7. **Deliver:** the MP4, a cover frame as **PNG or JPG (never WebP)**, a
   title, a caption, and 5–8 hashtags. A share copy if > 35 MB
   (see SKILL.md §5).

## Owner's standing rules (HTP_Jinie — do not override)

- **Always ask which style to use before starting any new video**, even
  when a brief already names a style. A style named in a brief is a proposal
  to confirm. Skip the question only on an explicit per-video style decision
  or an explicit series-wide decision covering that video. This question is
  a clarification, not an approval gate.
- Otherwise **never ask for review/approval** — act on instructions directly.
- **Tall Tale 3D format:** simple clean character designs (plain bright
  outfits, minimal accessories, big expressive faces, reaction punch-ins),
  an absurd-sounding opening hook, escalating reactions from a second
  character, a "you see" explainer beat, and a final line/shot that flips
  the opening. Original designs and shots only — never copy another
  creator's characters, frames, scripts or wording.
- **Uploads:** only when the owner explicitly asks. Before uploading or
  reporting upload status, check the channel's own uploads list first and
  match by title + video id. If an upload attempt is throttled or times
  out, treat it as *possibly live* until the list proves otherwise — never
  upload a duplicate on the assumption it failed. When uploading more than
  one video, leave **at least 5 minutes** between uploads.
- **A dropped project stays dropped.** If the owner drops/stops a project,
  do not resume it, rebuild it, or send posting packs/continuity material
  for it unless he explicitly revives it.
- Verify exact specs from the brief (duration, fps, 1080x1920) before
  delivery, and report QA gaps honestly instead of shipping silently.
- Facts in narration must be checked against reliable sources and listed in
  `script.json` under `sources`.

## Repo layout

- `SKILL.md` — canonical workflow (all styles)
- `scripts/` — setup, selftest, new_video, voice, words, estimate
- `styles/<style>/` — `STYLE.md`, `style-sheet.png`, `example/` (complete
  project that renders as-is; `new_video.sh` copies it for each new video)
- `examples/emu-war/` — **golden example**: "The Army That Lost to Emus",
  a real finished Tall Tale 3D production (63.9 s, 1080x1920, 24 fps,
  voice am_michael x1.05, 23 shots), source only — renders/review stripped.
  Regenerate voice/timings with voice.py/words.py if needed. Copy its
  patterns before inventing new ones.
- `docs/workflow/` — Muse Shorts Creator guidance (timed scripts, scene
  timelines, multi-voice rules, series one-episode-at-a-time) and the
  HTP_Jinie preflight checklist these owner rules came from.
- `docs/deep-dive-upgrade-plan.md` — the planned v2 pipeline upgrade for
  the Deep Dive 3D style (quality + speed, laptop-optimized).

## Never

- Generate images or video with AI; spend money/credits; upload anywhere
  without the owner asking; copy another creator's script/shots/frames;
  overwrite an existing project without asking; commit credentials,
  tokens, or the Kokoro/Whisper model files to this repo.
