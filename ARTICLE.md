# From Prompt to YouTube Short in 50 Seconds: Building an Autonomous AI Video Creator with Remotion, Kokoro-82M, and Any LLM

*By [Mashuke Alam Jim](https://github.com/MashukeAlam) • Follow on Twitter [@mashukjim](https://twitter.com/mashukjim)*

---

## Introduction: Why Most AI Video Generators Fail for Developers

If you've played with generative AI video tools like Sora, Runway Gen-2, or Pika, you’ve likely noticed a glaring problem: **they are terrible at explaining technical concepts.**

Ask a diffusion video model to explain how *Multi-Head Latent Attention* works in DeepSeek, or how *BitNet b1.58* eliminates matrix multiplication. You'll get surreal fever-dream animations of floating GPUs with melted text and hallucinated circuit boards. 

Developers and technical educators don't want blurry AI footage. We want:
- **Crisp, pixel-perfect UI cards** and architecture flowcharts.
- **VS Code-grade syntax highlighting** with animated code diffs.
- **Crystal-clear LaTeX mathematical formulas** rendered with KaTeX.
- **Natural, human-sounding voiceover** without robotic cadence or painful cloud API costs.
- **Dynamic karaoke subtitles** that keep viewers hooked on mobile screens.

Frustrated by the manual grind of screen recording, timeline slicing, audio syncing, and YouTube uploads, I built [**vdo**](https://github.com/MashukeAlam/vdo): an open-source, fully automated pipeline that converts simple JSON topics into production-ready YouTube Shorts and landscape tutorials, rendered at 60 FPS and uploaded directly to YouTube in under a minute.

Here is the engineering journey behind how it works.

---

## 🏛️ The Architecture: Code as Video

The core philosophy behind this project is simple: **video is just code over time.**

Rather than rendering pixel buffers through heavy video editors like Premiere Pro or After Effects, the engine treats every frame as a React component.

```
       ┌────────────────────────────────────────────────────────┐
       │                 User or AI Agent Prompt                │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │              Project JSON Schema Definition            │
       │       (TitleCard, Comparison, Code, Math, Outro)       │
       └───────────────────────────┬────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │    Local Audio TTS   │                  │   Remotion Engine    │
   │  Kokoro-82M (ONNX)   │                  │  React + Tailwind    │
   │  Word Timestamps     │                  │  Shiki Code + KaTeX  │
   └──────────┬───────────┘                  └──────────┬───────────┘
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │         Multi-threaded Remotion MP4 Rendering          │
       │                   (1080x1920 @ 30fps)                  │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             Automated YouTube Data API v3              │
       │           Headless Upload with Token Refresh           │
       └────────────────────────────────────────────────────────┘
```

The stack combines five specialized tools:
1. **Visual Engine**: [Remotion](https://www.remotion.dev/) (React + TypeScript) with Tailwind CSS.
2. **Syntax Highlighting**: Shiki (supporting VS Code themes and line-by-line animations).
3. **Math Engine**: KaTeX (for LaTeX formula typesetting).
4. **Voice Synthesis**: Kokoro-82M running locally via ONNX Runtime.
5. **Headless Distribution**: Google OAuth 2.0 + YouTube Data API v3.

---

## 🎙️ The Voice Engine: Why Local Kokoro-82M Beats Cloud TTS

Early prototypes used cloud TTS APIs (like OpenAI TTS or ElevenLabs). While quality was good, three friction points emerged:
1. **Network latency & rate limits** slowed down the build pipeline.
2. **API costs** accumulated rapidly during iteration and testing.
3. **Lack of offline reproducibility**.

The solution was migrating to **Kokoro-82M**, a compact 82-million parameter neural TTS model executed locally with **ONNX Runtime**. 

### Near-Instant Local Generation
Running on standard CPU or GPU, Kokoro-82M synthesizes natural, conversational audio at ~10x realtime speed. A 50-second voiceover synthesizes in less than 4 seconds:

```python
from kokoro_onnx import Kokoro
import soundfile as sf

kokoro = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")

# Generates warm, conversational voiceover with zero cloud dependencies
samples, sample_rate = kokoro.create(
    text=narration,
    voice="am_adam",
    speed=1.05,
    lang="en-us"
)
sf.write("output.wav", samples, sample_rate)
```

### Interpolated Karaoke Subtitles
Shorts and TikToks rely heavily on word-level subtitle tracking. While whisper transcription models can generate timestamps, running an additional Whisper pass on top of TTS introduced unnecessary overhead.

Instead, we extract character-weighted word durations relative to sentence audio lengths:

```python
def split_sentence_to_words(text, start_time, duration):
    words = re.findall(r'\S+', text)
    total_chars = sum(len(w) for w in words)
    curr = start_time
    res = []
    for w in words:
        w_dur = (len(w) / total_chars) * duration
        res.append({
            "word": w,
            "start": round(curr, 3),
            "end": round(curr + w_dur, 3)
        })
        curr += w_dur
    return res
```

These timestamps feed directly into Remotion's `SubtitleOverlay.tsx`, highlighting the active spoken word in vibrant cyan and yellow with spring physics.

---

## 🎨 Scene Components: A Modular Design System for Tech

To guarantee that videos remain engaging, the engine provides 7 purpose-built React scene components:

| Component | Purpose | What It Renders |
|---|---|---|
| `TitleCard` | The 3-second hook | Pulsing topic badge, gradient headline, hashtag pills |
| `ComparisonCard` | Side-by-side contrast | Bento cards comparing two approaches (e.g. FP16 vs BitNet) |
| `ArchitectureFlow` | Pipeline visualization | Flowchart nodes with active step spotlighting |
| `CodeExplainer` | Implementation details | Mac-style editor, Shiki syntax highlighting, line annotations |
| `MathVisualizer` | Theoretical foundations | KaTeX LaTeX formula rendering + variable breakdown cards |
| `SummaryList` | Key takeaways | Staggered numbered cards recapping core points |
| `OutroCard` | High-converting CTA | Animated YouTube Like & Subscribe buttons + Twitter follow badge |

Because every component is a React component, styling uses standard Tailwind CSS. Adding a new component takes less than 30 minutes!

---

## 🤖 The Multi-Agent Skill: Making ANY LLM Autonomous

Writing JSON definitions manually defeats the goal of an autonomous video pipeline. I wanted to tell **any AI agent** (whether in Antigravity, Cursor, Claude Code, or web ChatGPT):

> *"Make a video about why vibecoding ruined web design and upload it."*

And have it handle everything end-to-end.

To achieve this, the repository implements a multi-agent instruction architecture:

### 1. The Antigravity Skill (`.agents/skills/video-creator/SKILL.md`)
Antigravity automatically discovers skills inside `.agents/skills/`. When prompted with a video request, it progressive-loads the skill instructions, plans the scene layout, runs the JSON validator, and kicks off rendering.

### 2. Universal Agent Instructions (`AGENTS.md`)
Standardized for Cursor, Claude Code, Windsurf, Roo Code, and Copilot. It defines:
- **The Shorts Constraint**: YouTube Shorts must be strictly under 60.0s. At 2.6 words/sec, narration must remain between 125 and 145 words total across 4–6 scenes.
- **Visual Rhythm Rule**: Never use the same scene component twice in a row.
- **Mandatory Outro Rule**: Conclude with `OutroCard` prompting viewers to like, subscribe, and follow `@mashukjim` on Twitter.

### 3. Pre-Flight Validation CLI (`scripts/validate_project.py`)
To prevent failed 60-second video renders caused by oversized scripts or broken props, a lightweight Python validator verifies the project schema and calculates audio duration before Remotion spins up:

```bash
$ python scripts/validate_project.py projects/vibecoding_ruined_design.json

🔍 Validating Project Definition: projects/vibecoding_ruined_design.json
⏱️ Estimated Duration: ~51.6s (129 words) — Perfect for YouTube Shorts (<60s)
✅ Project JSON is 100% valid and ready for build_video.py!
```

---

## 🚀 The One-Line Build & Upload Pipeline

Once the JSON is generated, the entire pipeline executes via a single command:

```bash
python scripts/build_video.py --input projects/vibecoding_ruined_design.json --format Shorts --upload --privacy public
```

### What happens under the hood:
1. **Speech Synthesis**: Kokoro-82M generates WAV audio and computes word timings for each scene in `public/audio/`.
2. **Composition Assembly**: Remotion configures the composition frames and mounts `defaultProject.json`.
3. **Parallel Rendering**: Remotion spins up headless Chromium instances to render the 1080×1920 MP4 at 30 FPS.
4. **Automated Upload**: Google OAuth 2.0 credentials in `credentials/token.json` refresh automatically, uploading the video to YouTube with title, description, tags, and `#Shorts` classification.

---

## 📺 Real-World Results

Here are some of the videos generated and published completely autonomously with this engine:

* 📱 **[Why Vibecoding Ruined Web Design](https://www.youtube.com/shorts/9J6lA7vNZ_0)** (53.3s)
* 📱 **[DeepSeek's Secret: Multi-Head Latent Attention (MLA)](https://www.youtube.com/shorts/ShKkY6QAjR0)** (43.5s)
* 📱 **[BitNet b1.58: 1-Bit AI with Zero Matrix Multiplications](https://www.youtube.com/shorts/psw3Yeai2o0)** (38.9s)
* 📱 **[DeepSeek vs Claude vs GPT for Coding](https://www.youtube.com/shorts/GmOH3S5DxT8)** (48.9s)

Every video features crisp code, accurate formulas, animated subtitles, and high-fidelity local voiceover.

---

## 🌟 Try It Yourself (Open Source)

The entire project is open-source and ready to clone:

🔗 **GitHub Repository**: [https://github.com/MashukeAlam/vdo](https://github.com/MashukeAlam/vdo)

### Quick Setup:
```bash
git clone https://github.com/MashukeAlam/vdo.git
cd vdo
npm install
pip install -r requirements.txt # or install edge-tts, soundfile, kokoro-onnx
```

If you find this interesting, connect with me:
* 🐦 Twitter / X: [@mashukjim](https://twitter.com/mashukjim)
* 💻 GitHub: [@MashukeAlam](https://github.com/MashukeAlam)

Drop a star on GitHub, let me know what topics you'd like to see automated next, and happy building!
