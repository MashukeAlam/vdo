import os
import sys
import re
import shutil
import subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "kokoro-v1.0.onnx")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(MODELS_DIR, "kokoro-v1.0.fp16.onnx")
VOICES_PATH = os.path.join(MODELS_DIR, "voices-v1.0.bin")

_kokoro_instance = None

def get_ffmpeg_bin():
    if shutil.which("ffmpeg"):
        return "ffmpeg"
    winget_path = r"C:\Users\mashuke.jim\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
    if os.path.exists(winget_path):
        return winget_path
    return None

def get_kokoro():
    global _kokoro_instance
    if _kokoro_instance is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(VOICES_PATH):
            raise FileNotFoundError(f"Kokoro model or voices missing in {MODELS_DIR}")
        print(f"Loading local Kokoro-82M model ({os.path.basename(MODEL_PATH)})...")
        _kokoro_instance = Kokoro(MODEL_PATH, VOICES_PATH)
    return _kokoro_instance

def split_sentence_to_words(text, start_time, duration):
    words = re.findall(r'\S+', text)
    if not words:
        return []
    total_chars = sum(len(w) for w in words)
    if total_chars == 0:
        return []
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

def generate_scene_audio_kokoro(scene, audio_dir, voice="am_adam", speed=1.05, fps=30):
    kokoro = get_kokoro()
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

    wav_filename = f"{scene_id}.wav"
    mp3_filename = f"{scene_id}.mp3"
    wav_path = os.path.join(audio_dir, wav_filename)
    mp3_path = os.path.join(audio_dir, mp3_filename)

    # Generate speech with Kokoro
    # Popular choices: 'am_adam' (natural male), 'af_heart' (natural female), 'am_michael'
    samples, sample_rate = kokoro.create(narration, voice=voice, speed=speed, lang="en-us")
    sf.write(wav_path, samples, sample_rate)
    
    raw_duration = len(samples) / float(sample_rate)

    # Convert to MP3 if ffmpeg is available
    ffmpeg_bin = get_ffmpeg_bin()
    final_file = f"audio/{wav_filename}"
    if ffmpeg_bin:
        try:
            subprocess.run(
                [ffmpeg_bin, "-y", "-i", wav_path, "-b:a", "192k", mp3_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            final_file = f"audio/{mp3_filename}"
        except Exception:
            pass

    words = split_sentence_to_words(narration, 0.05, raw_duration)
    total_duration = max(raw_duration + 0.4, 2.0)
    duration_frames = int(round(total_duration * fps))

    return {
        **scene,
        "audioFile": final_file,
        "durationSec": round(total_duration, 2),
        "durationInFrames": duration_frames,
        "words": words
    }
