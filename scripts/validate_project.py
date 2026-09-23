import argparse
import json
import os
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

VALID_SCENE_TYPES = {
    "TitleCard",
    "CodeExplainer",
    "ArchitectureFlow",
    "MathVisualizer",
    "ComparisonCard",
    "SummaryList",
}

def estimate_scene_duration(narration: str, speed: float = 1.05) -> float:
    words = re.findall(r"\S+", narration)
    if not words:
        return 3.0
    # Kokoro @ 1.05x speed speaks ~2.6 words/sec
    raw_duration = len(words) / (2.6 * (speed / 1.05))
    return max(raw_duration + 0.4, 2.0)

def validate_project(file_path: str) -> bool:
    print(f"🔍 Validating Project Definition: {file_path}")
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        return False

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON Syntax Error: {e}")
        return False

    errors = []
    warnings = []

    # 1. Top-level checks
    if "title" not in data or not data["title"]:
        errors.append("Missing required top-level field: 'title'")
    
    aspect_ratio = data.get("aspectRatio", "9:16")
    if aspect_ratio not in ("9:16", "16:9"):
        errors.append(f"Invalid 'aspectRatio': '{aspect_ratio}'. Must be '9:16' or '16:9'")

    scenes = data.get("scenes")
    if not isinstance(scenes, list) or len(scenes) == 0:
        errors.append("Project must contain a non-empty 'scenes' list.")
        scenes = []

    # 2. Scene-by-scene checks
    total_words = 0
    total_estimated_sec = 0.0

    for idx, sc in enumerate(scenes):
        scene_num = idx + 1
        scene_id = sc.get("id", f"scene_{scene_num}")
        scene_type = sc.get("type")
        narration = sc.get("narration", "").strip()
        props = sc.get("props", {})

        if not scene_type:
            errors.append(f"Scene {scene_num} ({scene_id}): Missing 'type'")
        elif scene_type not in VALID_SCENE_TYPES:
            errors.append(
                f"Scene {scene_num} ({scene_id}): Invalid type '{scene_type}'. "
                f"Allowed: {sorted(list(VALID_SCENE_TYPES))}"
            )

        if not narration:
            warnings.append(f"Scene {scene_num} ({scene_id}): Narration is empty. Defaulting to 3s silence.")

        words = len(re.findall(r"\S+", narration))
        total_words += words
        est_sec = estimate_scene_duration(narration)
        total_estimated_sec += est_sec

        # Check props for specific types
        if scene_type == "TitleCard":
            if not props.get("title"):
                errors.append(f"Scene {scene_num} (TitleCard): Missing 'props.title'")
        elif scene_type == "CodeExplainer":
            if not props.get("code"):
                errors.append(f"Scene {scene_num} (CodeExplainer): Missing 'props.code'")
            if not props.get("language"):
                warnings.append(f"Scene {scene_num} (CodeExplainer): Missing 'props.language', default styling will apply.")
        elif scene_type == "ArchitectureFlow":
            steps = props.get("steps")
            if not isinstance(steps, list) or len(steps) == 0:
                errors.append(f"Scene {scene_num} (ArchitectureFlow): 'props.steps' must be a non-empty list")
            if "activeStepIndex" not in props:
                warnings.append(f"Scene {scene_num} (ArchitectureFlow): 'props.activeStepIndex' not specified (defaults to 0)")
        elif scene_type == "MathVisualizer":
            if not props.get("formula"):
                errors.append(f"Scene {scene_num} (MathVisualizer): Missing 'props.formula' (LaTeX string)")
        elif scene_type == "ComparisonCard":
            if not props.get("leftTitle") or not props.get("rightTitle"):
                errors.append(f"Scene {scene_num} (ComparisonCard): Requires 'props.leftTitle' and 'props.rightTitle'")
            if not isinstance(props.get("leftPoints"), list) or not isinstance(props.get("rightPoints"), list):
                errors.append(f"Scene {scene_num} (ComparisonCard): 'leftPoints' and 'rightPoints' must be arrays of strings")
        elif scene_type == "SummaryList":
            items = props.get("items")
            if not isinstance(items, list) or len(items) == 0:
                errors.append(f"Scene {scene_num} (SummaryList): 'props.items' must be a non-empty list of strings")

    # 3. Format duration limits
    if aspect_ratio == "9:16":
        if total_estimated_sec > 58.0:
            warnings.append(
                f"⚠️ YouTube Shorts Warning: Estimated duration is {total_estimated_sec:.1f}s (> 58s). "
                f"YouTube Shorts must be strictly under 60.0s! Total words: {total_words}. Target ~130-150 words."
            )
        else:
            print(f"⏱️ Estimated Duration: ~{total_estimated_sec:.1f}s ({total_words} words) — Perfect for YouTube Shorts (<60s)")
    else:
        print(f"⏱️ Estimated Duration: ~{total_estimated_sec:.1f}s ({total_words} words) — Landscape format")

    # 4. Report results
    if warnings:
        print("\n⚠️ Warnings:")
        for w in warnings:
            print(f"  - {w}")

    if errors:
        print("\n❌ Validation Errors:")
        for e in errors:
            print(f"  - {e}")
        return False

    print("\n✅ Project JSON is 100% valid and ready for build_video.py!")
    return True

def main():
    parser = argparse.ArgumentParser(description="Validate Remotion Video Project JSON schema and word pacing")
    parser.add_argument("file", help="Path to project JSON definition file")
    args = parser.parse_args()

    success = validate_project(args.file)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
