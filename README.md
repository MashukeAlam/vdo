# AI Educational Video Creator for Tech & LLM Topics

An automated video generation engine built with **Remotion (React + TypeScript)**, **Shiki** (syntax highlighting & code diffs), **KaTeX** (LaTeX math formulas), **Kokoro-82M** (local high-fidelity voice synthesis), and **YouTube Data API v3** (automated channel uploads).

Supports both **YouTube Shorts (9:16 vertical)** and **Full-form Tutorials (16:9 landscape)**.

---

## 🤖 Instructions for LLMs & AI Agents

This repository is equipped with instruction sets and skills so that **any LLM** or coding agent can generate, validate, and upload videos:

* 📄 **[AGENTS.md](file:///C:/Projects/Others/vdo/AGENTS.md)**: Universal agent instructions for Antigravity, Cursor, Claude Code, Windsurf, Roo Code, Copilot.
* 🧩 **[.agents/skills/video-creator/SKILL.md](file:///C:/Projects/Others/vdo/.agents/skills/video-creator/SKILL.md)**: Native Antigravity Skill package.
* 💬 **[INSTRUCTIONS_FOR_ANY_LLM.md](file:///C:/Projects/Others/vdo/INSTRUCTIONS_FOR_ANY_LLM.md)**: Standalone system prompt to copy-paste into ChatGPT, Claude.ai, DeepSeek, or Gemini web.
* 🔍 **[scripts/validate_project.py](file:///C:/Projects/Others/vdo/scripts/validate_project.py)**: CLI validator for JSON schemas and Shorts duration pacing.

---

## 🎨 Available Scene Components

You can prompt for any combination of the following scenes:

1. **`TitleCard`**: High-impact hook/intro with glowing category badges, animated headline, subtitle, and hashtag pills.
2. **`CodeExplainer`**: VS Code / Terminal style window with syntax highlighting, line numbers, line highlighting, and line notes/annotations.
3. **`ArchitectureFlow`**: Sequential system pipeline (e.g., Prompt -> Tokenizer -> Embeddings -> Attention Blocks -> Softmax).
4. **`MathVisualizer`**: LaTeX equations rendered via KaTeX with variable breakdown cards (ideal for Attention equations, Loss functions, LoRA factorization).
5. **`ComparisonCard`**: Comparative breakdown (e.g. CPU vs GPU, Full Fine-Tuning vs LoRA, REST vs gRPC).
6. **`SummaryList`**: Key takeaways and recap with staggered animated bullet points.
7. **`OutroCard`**: High-converting call-to-action with animated Like & Subscribe cards and Twitter / X follow button (`@mashukjim`).

---

## 🚀 Quick Usage

### 1. Generate Voiceover & Timestamps
```bash
# Uses local Kokoro-82M engine by default:
python scripts/build_video.py --input projects/my_topic.json --format Shorts
```

### 2. Live Interactive Preview (Remotion Studio)
```bash
npm run dev
```
Open `http://localhost:3000` to scrub the timeline, view real-time playback, and tweak styles.

### 3. Render MP4
```bash
# Render Shorts (9:16)
npx remotion render Shorts out/my_video_shorts.mp4 --concurrency=50%

# Render Landscape (16:9)
npx remotion render Landscape out/my_video_landscape.mp4 --concurrency=50%
```

---

## 📤 YouTube Automatic Upload System

You can upload your rendered videos directly to your YouTube channel with automated titles, descriptions, tags, and `#Shorts` formatting.

### One-Time Setup (2 minutes):
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and search for **YouTube Data API v3** -> Click **Enable**.
3. Go to **APIs & Services > Credentials** -> Click **Create Credentials** -> **OAuth client ID**:
   * Application type: **Desktop app**
   * Name: `Video Uploader`
4. Click **Download JSON** on your new client ID, and save the downloaded file as:
   ```
   credentials/client_secrets.json
   ```

### Uploading to YouTube:
Once `client_secrets.json` is saved, run:
```bash
python scripts/youtube_uploader.py --video out/jev_ai_shorts_kokoro.mp4 --project projects/jev_ai.json --privacy private
```

* **First run**: Your default web browser will automatically open with the Google sign-in screen. Sign in with your Gmail/YouTube account and click **Allow**.
* **Automatic Token Persistence**: The token is securely saved to `credentials/token.json`. Future uploads will never prompt you to log in again!

### All-in-One: Render + Upload
You can render and upload in a single command:
```bash
python scripts/build_video.py --input projects/jev_ai.json --format Shorts --upload --privacy unlisted
```
*(Options for `--privacy`: `private`, `unlisted`, `public`)*
