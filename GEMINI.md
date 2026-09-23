# Antigravity / Gemini Workspace Rules

See [AGENTS.md](./AGENTS.md) for the complete video creation workflow and schema.

## Key Directives:
1. When asked to create a video, generate `projects/<topic_slug>.json` conforming to the schema in [AGENTS.md](./AGENTS.md).
2. Always conclude the video with an `OutroCard` scene prompting viewers to **Like**, **Subscribe**, and **Follow on Twitter / X: `@mashukjim`**.
3. Validate using `python scripts/validate_project.py projects/<topic_slug>.json`.
4. For YouTube Shorts, ensure narration is between 125 and 145 words total (including the outro) to guarantee duration is under 58 seconds.
5. Execute `python scripts/build_video.py --input projects/<topic_slug>.json --format Shorts --upload --privacy public` when asked to upload.
