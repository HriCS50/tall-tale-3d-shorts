#!/bin/bash
# Resolve an existing WinGet FFmpeg install in fresh or stale Git Bash sessions.
if ! command -v ffmpeg >/dev/null 2>&1; then
  for bin in "$HOME"/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-*/bin; do
    if [ -x "$bin/ffmpeg.exe" ] && [ -x "$bin/ffprobe.exe" ]; then export PATH="$bin:$PATH"; break; fi
  done
fi
export PYTHONUTF8=1
