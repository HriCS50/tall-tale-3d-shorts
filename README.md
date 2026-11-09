# Tall Tale 3D Shorts — Codex export (v1.0.0)

A Codex-ready export of the HTP_Jinie faceless-shorts production pipeline,
revised for **local Codex on the owner's laptop** (Acer Nitro V AN515-57,
RTX 3050 4 GB VRAM, Windows — see `AGENTS.md` for the hardware render
profile; the no-GPU llvmpipe profile is kept as a fallback).

**If you are Codex / a coding agent: read `AGENTS.md` first**, then
`SKILL.md`. Humans: quick start is `bash scripts/setup.sh` (prints
"All set", run it in Git Bash on Windows) then `bash scripts/selftest.sh`
(prints "SELFTEST PASSED"). A real finished production is included as a
golden example in `examples/emu-war/`, and the planned Deep Dive 3D
quality upgrade is in `docs/deep-dive-upgrade-plan.md`.

The v2 package update adds four animation eases and bundled Three.js/Blender
craft guidance with camera and motion references. See
[the integration notes](docs/external-skills.md#local-integration-review)
and [the update review](docs/review-v2-2026-11-10.md).

---
# Tall Tale 3D Shorts: a local video skill

Narrated faceless shorts (YouTube Shorts, TikTok, Reels) made 100% in code on your own computer: script, AI voice,
word-synced captions, animation, sound effects and music, rendered to MP4. No AI video, no API keys, no credits.

**Styles** (each has a style sheet, a style guide and a finished example video project)
1. **Deep Dive 3D** (flagship): Zack D. Films-like 3D "What happens if…?" explainers. Example: *What happens if you hold your breath?*
2. **Night File 3D**: unsolved mysteries and true crime in dark 3D rooms. Example: *The man who jumped out of a plane* (D.B. Cooper).
3. **Inside Out**: flat 2D x-ray explainers. Example: *What if you swallow gum?*
4. **Stick Story**: stick-figure survival steps. Example: *What if the power went out for 3 days?*
5. **Paper Atlas**: history in cut paper and maps. Example: *How one bakery burned down London*.
6. **Tall Tale 3D**: funny true stories, flat 2D cartoon people in a sunny 3D world. Example: *The girl who was mailed to grandma*.

**How it works**
script.json → Kokoro voice (local, free) → Whisper word timings (local, free) → shots drawn in code, each cut and caption
placed on its word → procedural sound + music → headless Chrome captures every frame → ffmpeg renders the MP4.
Codex checks a contact sheet of the whole video before you ever see it.
Optional: when you ask, Codex uploads the finished short to your YouTube channel through Zapier (it confirms title, visibility and category first).

**Needs:** Codex with local computer access, Node.js 22+, ffmpeg, Google Chrome, Python 3.10+, ~1 GB for the
voice and Whisper models. Codex installs what's missing.

**Windows:** run the scripts in Git Bash (installed with Git for Windows; Git for Windows provides it).

**Install:** put this folder at `~/.codex/skills/tall-tale-3d-shorts/`, then run `bash scripts/setup.sh` (prints "All set")
and `bash scripts/selftest.sh` (prints "SELFTEST PASSED"). The skill is available on the next turn. Ask:
"Make a Deep Dive 3D short: what happens if you crack your knuckles?"

**Layout:** `SKILL.md` (what Codex follows) · `scripts/` (setup, selftest, new_video, voice, words, estimate) ·
`styles/<style>/` (`style-sheet.png`, `STYLE.md`, `example/` = a complete project that renders as-is).

**Licenses:** the code, stories, drawings and sound are original and free to use in your videos. Inter font: SIL Open Font
License 1.1. Installed on first use: Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT), faster-whisper + Whisper small.en (MIT),
numpy, scipy.


## Reviewed Windows build

`examples/pet-rock-millionaire/` contains the new original Tall Tale 3D short,
**The Pet That Made a Millionaire**. Narration, timing, sources, animated shots
and the posting caption are included; generated audio and MP4 files stay local.

Windows captures use Direct3D11 and print the actual WebGL renderer. For this
RTX laptop profile, capture fails if NVIDIA hardware is not detected. Run
`node tools/capture.mjs probe` inside a 3D project to check before rendering.
Software rendering is available only through the explicit fallback settings
in AGENTS.md. Use `FINISH=1` for final video rendering.

Self-tests now use unique `.selftest-*` directories and preserve earlier runs.
The tools discover an existing WinGet FFmpeg installation if PATH is stale.
See `docs/review-2026-11-09.md` for findings and verification.
