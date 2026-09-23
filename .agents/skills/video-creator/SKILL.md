---
name: video-creator
description: >-
  Use this skill whenever the user asks to create, script, render, or upload an educational programming or AI video, YouTube Short (9:16), or landscape tutorial (16:9) using the Remotion and Kokoro TTS video pipeline.
---

# AI Educational Video Creator Skill

This skill teaches the agent how to plan, script, validate, render, and automatically upload educational videos using the local **Remotion** (React/TypeScript), **Kokoro-82M ONNX TTS**, and **YouTube Data API v3** pipeline in this workspace.

---

## ⚡ Quick Start: 3-Step Procedure

When a user asks for a video on a topic:

### Step 1: Script & Plan the Project JSON
Write a new project definition file to `projects/<topic_slug>.json` conforming to the [Project JSON Schema](#project-json-schema).
* **For YouTube Shorts (9:16)**: Keep total words between **120 and 145 words** across 4–6 scenes so the video finishes in **50–57 seconds** (YouTube Shorts must be strictly < 60s).
* **For Landscape (16:9)**: Can be longer (1–5 minutes) with deeper code diffs and mathematical breakdowns.

### Step 2: Validate Schema & Duration
Run the project validator:
```bash
python scripts/validate_project.py projects/<topic_slug>.json
```
If the validator gives duration warnings or schema errors, refine the narration or props before proceeding.

### Step 3: Synthesize, Render & Upload
Run the master build pipeline:
```bash
# For YouTube Shorts (Automatic Public Upload):
python scripts/build_video.py --input projects/<topic_slug>.json --format Shorts --upload --privacy public

# For YouTube Shorts (Local Render Only):
python scripts/build_video.py --input projects/<topic_slug>.json --format Shorts --render

# For Landscape 16:9:
python scripts/build_video.py --input projects/<topic_slug>.json --format Landscape --render
```

---

## 📐 Project JSON Schema

Save all project definitions in `projects/<name>.json`.

```json
{
  "title": "Why Vibecoding Ruined Web Design",
  "aspectRatio": "9:16",
  "engine": "kokoro",
  "voice": "am_adam",
  "scenes": [
    {
      "id": "scene_1",
      "type": "TitleCard",
      "narration": "Hook question or provocative insight to stop the scroll.",
      "props": { ... }
    }
  ]
}
```

### Voice & Engine Configuration
* `"engine"`: `"kokoro"` (Default, local ONNX neural TTS) or `"edge"` (Cloud Edge-TTS).
* `"voice"`:
  * Male: `"am_adam"` (natural, clear conversational pace, recommended), `"am_michael"`, `"bm_george"`
  * Female: `"af_bella"`, `"af_nicole"`, `"af_heart"`, `"bf_emma"`

---

## 🎨 Supported Scene Components & Props

Mix and match components to create visual variety. **Rule: Never use the same component type twice in a row.**

### 1. `TitleCard` (The Hook)
Creates an impactful animated title with glow badges and hashtag pills.
```json
{
  "id": "scene_1",
  "type": "TitleCard",
  "narration": "What if frontier AI models didn't need GPUs? Meet BitNet b1.58.",
  "props": {
    "title": "1.58-Bit AI: BitNet",
    "subtitle": "Running billion-parameter models with zero matrix multiplications",
    "badge": "HARDWARE BREAKTHROUGH",
    "tags": ["BitNet", "AI", "Quantization", "GreenTech"]
  }
}
```

### 2. `ComparisonCard` (The Contrast)
Displays a side-by-side comparison with checkmarks and bullet lists.
```json
{
  "id": "scene_2",
  "type": "ComparisonCard",
  "narration": "Standard neural networks burn massive energy. BitNet replaces multiplications with basic addition.",
  "props": {
    "title": "FP16 vs Ternary BitNet",
    "leftTitle": "Standard FP16",
    "leftPoints": [
      "16 bits per parameter",
      "Billions of floating-point multiplications",
      "Massive memory bandwidth bottleneck"
    ],
    "rightTitle": "BitNet b1.58",
    "rightPoints": [
      "Only 1.58 bits per parameter {-1, 0, +1}",
      "Eliminates matrix multiplications",
      "Up to 80% lower energy consumption"
    ]
  }
}
```

### 3. `ArchitectureFlow` (The Mechanism)
Displays an animated pipeline showing data flow between stages.
```json
{
  "id": "scene_3",
  "type": "ArchitectureFlow",
  "narration": "When millions of developers vibe code without design intent, the web collapses into a monoculture.",
  "props": {
    "title": "The Monoculture Loop",
    "activeStepIndex": 1,
    "steps": [
      { "title": "Prompt Model", "desc": "Ask AI for modern landing page" },
      { "title": "Statistical Median", "desc": "Outputs average Tailwind template" },
      { "title": "Zero Personality", "desc": "Another clone website born" }
    ]
  }
}
```

### 4. `CodeExplainer` (The Code Implementation)
Displays an editor window with Shiki syntax highlighting, line numbers, line highlighting, and line annotations.
```json
{
  "id": "scene_4",
  "type": "CodeExplainer",
  "narration": "In code, the BitLinear layer replaces nn.Linear with pure integer arithmetic.",
  "props": {
    "language": "python",
    "filename": "bit_linear.py",
    "code": "class BitLinear(nn.Linear):\n    def forward(self, x):\n        w_quant = weight_quant(self.weight)\n        return F.linear(x, w_quant)",
    "highlightLines": [3, 4],
    "lineNotes": [
      { "line": 3, "note": "Quantizes weights to {-1, 0, +1}" },
      { "line": 4, "note": "Zero floating-point multiplications" }
    ]
  }
}
```

### 5. `MathVisualizer` (The Formula)
Renders LaTeX equations with KaTeX and explains mathematical variables.
```json
{
  "id": "scene_5",
  "type": "MathVisualizer",
  "narration": "Mathematically, weights are scaled by mean absolute value, clipping into ternary values.",
  "props": {
    "title": "Ternary Weight Quantization",
    "formula": "\\tilde{W} = \\text{RoundClip}\\left(\\frac{W}{\\gamma + \\epsilon}, -1, 1\\right)",
    "explanation": "Weights are normalized and rounded to {-1, 0, +1}.",
    "variables": [
      { "symbol": "W", "meaning": "Full-precision weight tensor" },
      { "symbol": "\\gamma", "meaning": "Mean absolute scale factor" },
      { "symbol": "\\tilde{W}", "meaning": "Quantized ternary weights" }
    ]
  }
}
```

### 6. `SummaryList` (The Takeaways)
Recaps core insights with animated numbered cards.
```json
{
  "id": "scene_6",
  "type": "SummaryList",
  "narration": "Code is becoming a commodity. Taste and craft are your ultimate competitive moat.",
  "props": {
    "title": "Why Taste Still Wins",
    "items": [
      "AI Writes Boilerplate, Designers Define Soul",
      "Generic Template UI Destroys Brand Loyalty",
      "Taste & Polish Are Your Biggest Moats"
    ]
  }
}
```

### 7. `OutroCard` (Mandatory CTA: Like, Subscribe & Twitter)
Displays high-converting animated action cards prompting viewers to Like, Subscribe, and Follow on Twitter.
```json
{
  "id": "scene_outro",
  "type": "OutroCard",
  "narration": "Drop a like, subscribe for daily AI breakthroughs, and follow me on Twitter at mashukjim!",
  "props": {
    "title": "Thanks for Watching!",
    "subtitle": "Subscribe for daily AI breakdowns & follow on Twitter",
    "twitterHandle": "@mashukjim",
    "youtubePrompt": "Like & Subscribe"
  }
}
```

### 8. `TerminalSplit` (Dual Windows, Diffs & Stick Figures)
Displays side-by-side terminal panes with diff rows, optional cluster status box, and animated stick figures at laptops or running commands.
```json
{
  "id": "scene_drift",
  "type": "TerminalSplit",
  "narration": "At 2 a.m., an engineer manually patches production. Git thinks there are 3 replicas, but live prod has 7.",
  "props": {
    "title": "DRIFT",
    "badge": "STEP 1: THE MANUAL PATCH",
    "underlineColor": "#f43f5e",
    "leftPane": {
      "title": "git: deploy.yaml",
      "lines": [
        { "lineNum": "1", "text": "kind: Deployment" },
        { "lineNum": "2", "text": "replicas: 3" }
      ],
      "stickFigure": { "pose": "laptop-night", "label": "① SSH @ 2am" }
    },
    "rightPane": {
      "title": "kubectl get -o yaml",
      "lines": [
        { "lineNum": "1", "text": "kind: Deployment" },
        { "lineNum": "!", "text": "replicas: 7 <- drift", "type": "drift" }
      ],
      "stickFigure": { "pose": "standing", "label": "② kubectl edit" }
    },
    "bottomText": "AND NOBODY KNOWS...",
    "bottomSubtext": "Until the next deployment crashes production."
  }
}
```

### 9. `ClassifierCard` (Ticket Ingestion & Probability Sliders)
Displays a customer ticket / query card connecting to a model badge and animated confidence/probability progress bars.
```json
{
  "id": "scene_classifier",
  "type": "ClassifierCard",
  "narration": "When a production alert triggers, classification models immediately score incident severity.",
  "props": {
    "title": "INCIDENT TELEMETRY",
    "mode": "ticket-flow",
    "ticket": {
      "authorName": "SRE Alert System",
      "badge": "CRITICAL",
      "message": "Node replica mismatch detected in production cluster."
    },
    "modelName": "GitOps Agent",
    "metricCategory": "SEVERITY SCORE",
    "bars": [
      { "label": "CRITICAL", "value": 0.94, "color": "#f43f5e" },
      { "label": "WARNING", "value": 0.06, "color": "#38bdf8" }
    ]
  }
}
```

### 10. `ClusterGrid` (Kubernetes 40-Node Grid & Architecture Layers)
Renders a cluster grid of 40 hexagonal pods or a layered diagram showing Control Plane (Brain) vs Worker Nodes (Muscle).
```json
{
  "id": "scene_cluster",
  "type": "ClusterGrid",
  "narration": "Standard CD pushes code blindly. GitOps continuously reconciles live nodes back to Git truth.",
  "props": {
    "title": "THE RECONCILIATION LOOP",
    "mode": "layers",
    "controlPlane": {
      "title": "CONTROL PLANE",
      "subtitle": "— THE BRAIN",
      "components": [{ "name": "API SERVER", "iconLabel": "API" }]
    },
    "workerNodes": {
      "title": "WORKER NODES",
      "subtitle": "— THE MUSCLE",
      "racks": [{ "rackName": "NODE 1", "pods": [{ "name": "p1", "color": "#06b6d4" }] }]
    }
  }
}
```

---

## 🎯 Scripting Principles for Viral Tech Content

1. **The 3-Second Hook**: Start with a provocative question, counter-intuitive truth, or shocking metric.
2. **Shorts Pacing Constraint**: 
   * Speed is ~2.6 words/sec.
   * Total target: **125–145 words** across 4–6 scenes (including the outro).
   * Total video length: **48–56 seconds**. NEVER exceed 59 seconds.
3. **Mandatory Call-to-Action (Outro)**:
   * Every video MUST end with an `OutroCard` scene.
   * Narration must explicitly tell viewers to **Like**, **Subscribe**, and **Follow on Twitter / X: `@mashukjim`**.
   * Spoken voiceover example: *"Drop a like, subscribe for daily tech deep dives, and follow me on Twitter at mashukjim."*
4. **Typography & Layout**:
   * For vertical 9:16 Shorts, cards must be clean and bold.
   * Keep bullet points concise (under 8 words per bullet point).
5. **Karaoke Subtitles**: Subtitles are generated automatically per-word and overlaid in gold/cyan. Keep narration punchy so subtitle animations remain dynamic.

---

## 🛠️ Command Reference

| Action | Command |
|---|---|
| **Validate project JSON** | `python scripts/validate_project.py projects/<name>.json` |
| **Render Shorts (9:16)** | `python scripts/build_video.py --input projects/<name>.json --format Shorts --render` |
| **Render Landscape (16:9)**| `python scripts/build_video.py --input projects/<name>.json --format Landscape --render` |
| **Build & Upload to YouTube** | `python scripts/build_video.py --input projects/<name>.json --format Shorts --upload --privacy public` |
| **Live Studio Preview** | `npm run dev` (visit `http://localhost:3000`) |
| **Direct YouTube Upload** | `python scripts/youtube_uploader.py --video out/<file>.mp4 --project projects/<name>.json --short --privacy public` |
