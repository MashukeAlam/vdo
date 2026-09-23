import argparse
import asyncio
import os
import shutil
import subprocess
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from generate_audio import process_project

def main():
    parser = argparse.ArgumentParser(description="AI Video Creator pipeline")
    parser.add_argument("--input", "-i", required=True, help="Path to project JSON definition")
    parser.add_argument("--format", "-f", choices=["Shorts", "Landscape"], default="Shorts", help="Video composition format")
    parser.add_argument("--render", "-r", action="store_true", help="Render full MP4 video")
    parser.add_argument("--concurrency", "-c", default="50%", help="Remotion render concurrency")
    parser.add_argument("--preview", "-p", action="store_true", help="Open Remotion Studio preview")
    parser.add_argument("--out", "-o", default=None, help="Output MP4 file path")
    parser.add_argument("--upload", "-u", action="store_true", help="Upload rendered video to YouTube")
    parser.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private", help="YouTube privacy status (default: private)")
    args = parser.parse_args()

    input_file = os.path.abspath(args.input)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_project_file = os.path.join(root_dir, "src", "defaultProject.json")

    print("=" * 60)
    print(f"🎬 Processing Educational Video: {os.path.basename(input_file)}")
    print(f"📐 Format: {args.format}")
    print("=" * 60)

    # 1. Generate Voiceover Audio & Word Timestamps
    print("\n🔊 Step 1: Synthesizing voiceover and calculating timestamps...")
    asyncio.run(process_project(input_file, target_project_file))

    # 2. Render or Preview
    out_path = args.out or os.path.join(root_dir, "out", f"{os.path.splitext(os.path.basename(input_file))[0]}_{args.format.lower()}.mp4")
    if args.render or args.upload:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        print(f"\n🎥 Step 2: Rendering MP4 ({args.format}) to {out_path}...")
        cmd = [
            "npx", "remotion", "render",
            args.format,
            out_path,
            f"--concurrency={args.concurrency}",
        ]
        subprocess.run(cmd, cwd=root_dir, shell=True, check=True)
        print(f"\n🎉 Video rendered successfully: {out_path}")

        # 3. Optional Upload
        if args.upload:
            print("\n🚀 Step 3: Triggering YouTube Upload...")
            from youtube_uploader import main as uploader_main
            # Run uploader CLI
            up_cmd = [
                sys.executable,
                os.path.join(root_dir, "scripts", "youtube_uploader.py"),
                "--video", out_path,
                "--project", input_file,
                "--privacy", args.privacy,
            ]
            if args.format == "Shorts":
                up_cmd.append("--short")
            subprocess.run(up_cmd, check=True)

    elif args.preview:
        print("\n🌐 Launching Remotion Studio for live playback...")
        subprocess.run(["npm", "run", "dev"], cwd=root_dir, shell=True)
    else:
        print("\n✅ Project prepared in src/defaultProject.json! Ready to preview or render.")

if __name__ == "__main__":
    main()
