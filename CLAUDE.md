# Claude Code Guidelines

Refer to [AGENTS.md](./AGENTS.md) for full architecture and schema details.

## Rules:
- Always include an `OutroCard` scene prompting viewers to Like, Subscribe, and follow Twitter/X: `@mashukjim`.
- For 9:16 Shorts, ensure total words across all scenes (including outro) are 125-145 words (<60s).

## Commands:
- Validate project: `python scripts/validate_project.py projects/<name>.json`
- Render Shorts: `python scripts/build_video.py --input projects/<name>.json --format Shorts --render`
- Render & Upload: `python scripts/build_video.py --input projects/<name>.json --format Shorts --upload --privacy public`
- Preview Remotion: `npm run dev`

