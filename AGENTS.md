# Agent Instructions: AI Video Creator (Remotion + Kokoro + YouTube)

This document guides any AI agent or LLM (Antigravity, Cursor, Claude Code, Windsurf, ChatGPT, Copilot, etc.) working in this codebase.

---

## 🎯 Purpose & Workflow

This project is an automated AI educational video creation engine. It converts JSON topic definitions into fully rendered, narrated, animated MP4 videos (YouTube Shorts 9:16 or Landscape 16:9) and uploads them directly to YouTube.

### High-Level Architecture
1. **Scene Definitions**: JSON files stored in `projects/*.json`.
2. **Audio & Narration Engine**: Local ONNX neural TTS (**Kokoro-82M**) via `scripts/local_tts.py` generating `.wav`/`.mp3` voiceover with per-word timestamp interpolation.
3. **Visual Engine**: **Remotion (React + TypeScript)** in `src/` rendering UI cards, Shiki code syntax highlighting, KaTeX math formulas, architecture flowcharts, and animated karaoke subtitles.
4. **YouTube Integration**: Google OAuth 2.0 via `scripts/youtube_uploader.py` storing credentials in `credentials/token.json` for headless uploads.
5. **Master Pipeline**: `scripts/build_video.py` coordinating audio generation, Remotion rendering, and YouTube uploads.

---

## 🤖 When the User Asks for a Video

Whenever the user prompts you to create a video about a topic:

### 1. Create the Project JSON
Write a new file: `projects/<topic_slug>.json`.
* Choose 4 to 6 scenes.
* For **Shorts (9:16)**:
  * Strict duration limit: **< 60 seconds**.
  * Total narration word count: **125 to 145 words** across all scenes combined.
  * Voice: `"am_adam"` (natural conversational male) or `"af_bella"` (female).
* Maintain visual variety: **Never place the same scene component type consecutively.**

### 2. Validate Word Count & Schema
Run:
```bash
python scripts/validate_project.py projects/<topic_slug>.json
```
If the validator shows warnings (e.g. estimated duration > 58s), trim the narration text before rendering.

### 3. Build, Render & Upload
Run:
```bash
# If user asked to upload:
python scripts/build_video.py --input projects/<topic_slug>.json --format Shorts --upload --privacy public

# If user only asked to generate/render:
python scripts/build_video.py --input projects/<topic_slug>.json --format Shorts --render
```

---

## 📜 Project JSON Specification

Schema interface:
```typescript
interface ProjectData {
  title: string;
  aspectRatio: "9:16" | "16:9";
  engine?: "kokoro" | "edge"; // default: kokoro
  voice?: string;             // default: am_adam
  scenes: SceneData[];
}

interface SceneData {
  id: string;                 // e.g. "scene_1", "scene_2"
  type: SceneType;            // See Scene Types below
  narration: string;          // Spoken voiceover for this scene
  props: SceneProps;          // Specific props for this component
}
```

### Supported Scene Types & Props

| Scene Type | Purpose | Key Props |
|---|---|---|
| `TitleCard` | The 3s hook | `title`, `subtitle`, `badge`, `tags` (array) |
| `ComparisonCard` | Side-by-side battle | `title`, `leftTitle`, `leftPoints` (array), `rightTitle`, `rightPoints` (array) |
| `ArchitectureFlow` | Pipeline / workflow | `title`, `steps` (`[{ title, desc }]`), `activeStepIndex` |
| `CodeExplainer` | Code diff & annotations | `language`, `filename`, `code`, `highlightLines` (array), `lineNotes` (`[{ line, note }]`) |
| `MathVisualizer` | LaTeX formula & variables | `title`, `formula` (LaTeX), `explanation`, `variables` (`[{ symbol, meaning }]`) |
| `SummaryList` | Key takeaways | `title`, `items` (array of strings) |
| `OutroCard` | Like, Subscribe & Twitter CTA | `title`, `subtitle`, `twitterHandle` (`"@mashukjim"`), `youtubePrompt` (`"Like & Subscribe"`) |

---

## 💻 Tech Stack & Key Files

* **`projects/*.json`**: User project definitions.
* **`scripts/build_video.py`**: Main CLI entrypoint.
* **`scripts/validate_project.py`**: JSON schema and word pacing validator.
* **`scripts/local_tts.py`**: Kokoro-82M ONNX inference engine (`models/kokoro-v1.0.onnx`).
* **`scripts/youtube_uploader.py`**: YouTube Data API v3 client with auto-refreshing OAuth token.
* **`src/types.ts`**: TypeScript definitions for all scenes and props.
* **`src/VideoComposition.tsx`**: Remotion composition mounting scenes and SubtitleOverlay.
* **`src/components/`**: React visual components with Tailwind CSS styling.

---

## ⚠️ Important Rules for Agents

1. **Shorts Duration Rule**: YouTube Shorts must be strictly under 60.0 seconds. 125-145 words @ 2.6 words/sec generates ~50-55s of audio, leaving a safety buffer.
2. **Mandatory Like, Subscribe & Twitter CTA Rule**:
   * Every video MUST end with an outro scene using `OutroCard`.
   * The narration MUST tell viewers to **Like**, **Subscribe**, and **Follow on Twitter / X at `@mashukjim`**.
   * Example spoken narration: *"Drop a like, subscribe for daily AI breakthroughs, and follow me on Twitter at mashukjim."*
   * Keep this outro punchy (~12-15 words) and counted within the total word budget.
3. **Windows Encoding Rule**: In Python scripts on Windows, always ensure `sys.stdout.reconfigure(encoding="utf-8")` is present if printing emojis or special characters.
4. **Remotion Webpack Rule**: Shiki 4 requires `@shikijs/magic-move`. Always preserve `enableTailwind` in `remotion.config.ts`.
5. **OAuth Token Rule**: `credentials/token.json` automatically refreshes. Do not delete or overwrite it unless the user explicitly requests re-authenticating.
