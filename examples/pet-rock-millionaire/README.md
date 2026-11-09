# The Pet That Made a Millionaire

An original Tall Tale 3D short about Gary Dahl and the 1975 Pet Rock craze.
The shopper is a fictional comic reaction character, not a historical witness.
See script.json for narration, historical sources and production notes.

Regenerate from the repository root in Git Bash:

```bash
scripts/py scripts/voice.py examples/pet-rock-millionaire
scripts/py scripts/words.py examples/pet-rock-millionaire
cd examples/pet-rock-millionaire
node tools/capture.mjs check
node tools/capture.mjs cues
../../scripts/py tools/mix.py .
FINISH=1 node tools/capture.mjs video renders/pet-rock-millionaire.mp4
```

Title: The Pet That Made a Millionaire

Caption: In 1975, Gary Dahl turned an ordinary stone into the Pet Rock craze. Original animated retelling; shopper reactions are dramatized.

#PetRock #FunnyHistory #GaryDahl #Animation #TallTale #Shorts


## Verified output

43.63 seconds, 1080x1920, 30 fps, H.264/AAC; local MP4 is 27.7 MB.
`renders/pet-rock-cover.png` is the cover. The generated MP4 and audio are
ignored by Git; regenerate with the commands above. The encoded output was
visually sampled every half second and passed full decoding and audio-level
checks. Source facts and fictional dramatization are identified in script.json.
