# Claude Code Guidelines

Refer to [AGENTS.md](./AGENTS.md) for full architecture and schema details.

## Commands:
- Validate project: `python scripts/validate_project.py projects/<name>.json`
- Render Shorts: `python scripts/build_video.py --input projects/<name>.json --format Shorts --render`
- Render & Upload: `python scripts/build_video.py --input projects/<name>.json --format Shorts --upload --privacy public`
- Preview Remotion: `npm run dev`
