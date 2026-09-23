import asyncio
import os
import json
import re
import sys
import edge_tts

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

DEFAULT_VOICE = "en-US-ChristopherNeural"
FPS = 30

def split_sentence_to_words(sentence_text, start_time, duration):
    """
    Interpolates word timestamps based on character lengths within a sentence boundary.
    """
    raw_words = re.findall(r'\S+', sentence_text)
    if not raw_words:
        return []
    
    total_chars = sum(len(w) for w in raw_words)
    if total_chars == 0:
        return []
        
    current_time = start_time
    word_entries = []
    for w in raw_words:
        w_duration = (len(w) / total_chars) * duration
        word_entries.append({
            "word": w,
            "start": round(current_time, 3),
            "end": round(current_time + w_duration, 3)
        })
        current_time += w_duration
    return word_entries

async def generate_scene_audio(scene, audio_dir, voice=DEFAULT_VOICE):
    scene_id = scene["id"]
    narration = scene.get("narration", "").strip()
    if not narration:
        return {
            **scene,
            "audioFile": None,
            "durationSec": 3.0,
            "durationInFrames": 90,
            "words": []
        }

    mp3_filename = f"{scene_id}.mp3"
    mp3_path = os.path.join(audio_dir, mp3_filename)
    communicate = edge_tts.Communicate(narration, voice)
    
    sentences = []
    with open(mp3_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                # offset and duration in 100ns units
                s_offset = chunk.get("offset", 0) / 10000000.0
                s_dur = chunk.get("duration", 0) / 10000000.0
                sentences.append({
                    "text": chunk.get("text", ""),
                    "start": s_offset,
                    "duration": s_dur,
                    "end": s_offset + s_dur
                })

    # Calculate total duration
    total_duration = 0.0
    all_words = []
    for s in sentences:
        if s["end"] > total_duration:
            total_duration = s["end"]
        words = split_sentence_to_words(s["text"], s["start"], s["duration"])
        all_words.extend(words)

    # Add a comfortable padding (e.g. 0.4s) at the end of each scene so transitions feel natural
    total_duration = max(total_duration + 0.4, 2.0)
    duration_frames = int(round(total_duration * FPS))

    return {
        **scene,
        "audioFile": f"audio/{mp3_filename}",
        "durationSec": round(total_duration, 2),
        "durationInFrames": duration_frames,
        "words": all_words
    }

async def process_project(input_file, output_file=None):
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        sys.exit(1)

    with open(input_file, "r", encoding="utf-8") as f:
        project_data = json.load(f)

    # Ensure audio directory in public/
    audio_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio")
    os.makedirs(audio_dir, exist_ok=True)

    voice = project_data.get("voice", DEFAULT_VOICE)
    engine = project_data.get("engine", "kokoro" if os.path.exists(os.path.join(os.path.dirname(audio_dir), "..", "models", "voices-v1.0.bin")) else "edge")
    scenes = project_data.get("scenes", [])
    
    print(f"Generating audio for {len(scenes)} scenes using engine: '{engine}' (voice: {voice})...")

    processed_scenes = []
    current_frame = 0
    for idx, sc in enumerate(scenes):
        print(f"  [{idx+1}/{len(scenes)}] Processing {sc.get('id', f'scene_{idx+1}')}...")
        if engine == "kokoro":
            try:
                from local_tts import generate_scene_audio_kokoro
                res = generate_scene_audio_kokoro(sc, audio_dir, voice=voice)
            except Exception as e:
                print(f"    [Warning] Kokoro failed ({e}), falling back to Edge-TTS...")
                res = await generate_scene_audio(sc, audio_dir, voice="en-US-ChristopherNeural")
        else:
            res = await generate_scene_audio(sc, audio_dir, voice)
        res["startFrame"] = current_frame
        current_frame += res["durationInFrames"]
        processed_scenes.append(res)

    project_data["scenes"] = processed_scenes
    project_data["totalDurationFrames"] = current_frame
    project_data["totalDurationSec"] = round(current_frame / FPS, 2)

    if not output_file:
        output_file = input_file.replace(".json", "_ready.json")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(project_data, f, indent=2)

    print(f"\nDone! Project ready with {current_frame} frames ({project_data['totalDurationSec']}s).")
    print(f"Saved to: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_audio.py <project.json> [output.json]")
        sys.exit(1)
    
    inp = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    asyncio.run(process_project(inp, out))
