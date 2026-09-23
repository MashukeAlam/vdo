import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from tracker import record_video, load_all_records, CSV_PATH

VIDEOS = [
    {
        "date_str": "2026-09-22",
        "topic": "What is Jev AI by TypeSafe?",
        "project_file": "projects/jev_ai.json",
        "video_format": "Shorts",
        "duration_sec": 46.5,
        "video_id": "QghW_wHthEs",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 What are your impressions of Jev AI and local deterministic classification models?\n\n"
            "Drop a comment below with your thoughts! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
    {
        "date_str": "2026-09-22",
        "topic": "DeepSeek's Secret: Multi-Head Latent Attention (MLA)",
        "project_file": "projects/deepseek_mla.json",
        "video_format": "Shorts",
        "duration_sec": 49.2,
        "video_id": "ShKkY6QAjR0",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 Multi-Head Latent Attention (MLA) is DeepSeek's biggest architectural breakthrough. What other AI innovations should we cover next?\n\n"
            "Drop your ideas below! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
    {
        "date_str": "2026-09-22",
        "topic": "BitNet b1.58: 1-Bit AI with Zero Matrix Multiplications",
        "project_file": "projects/bitnet_158.json",
        "video_format": "Shorts",
        "duration_sec": 47.7,
        "video_id": "psw3Yeai2o0",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 Do you think 1-bit LLMs like BitNet b1.58 will replace standard FP16 transformer inference on edge devices?\n\n"
            "Let's discuss below! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
    {
        "date_str": "2026-09-22",
        "topic": "DeepSeek vs Claude vs GPT for Coding",
        "project_file": "projects/coding_models_comparison.json",
        "video_format": "Shorts",
        "duration_sec": 52.0,
        "video_id": "GmOH3S5DxT8",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 Which model is your daily driver for coding? DeepSeek V3, Claude 3.5 Sonnet, or GPT-4o?\n\n"
            "Drop your vote in the comments! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
    {
        "date_str": "2026-09-23",
        "topic": "Why Vibecoding Ruined Web Design",
        "project_file": "projects/vibecoding_ruined_design.json",
        "video_format": "Shorts",
        "duration_sec": 53.5,
        "video_id": "9J6lA7vNZ_0",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 Has vibecoding ruined web design, or does it make developers 10x faster? What's your take on AI-generated UI?\n\n"
            "Share your thoughts below! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
    {
        "date_str": "2026-09-23",
        "topic": "Why GitOps Even Exists: The Production Drift Nightmare",
        "project_file": "projects/gitops_drift.json",
        "video_format": "Shorts",
        "duration_sec": 50.8,
        "video_id": "imZWzFFEsBI",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 What's your worst 2 AM production SSH horror story? Has configuration drift ever crashed your cluster?\n\n"
            "Let me know in the comments! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
    {
        "date_str": "2026-09-23",
        "topic": "The N+1 Query Problem: How to Stop Killing Your Database",
        "project_file": "projects/db_query_optimization.json",
        "video_format": "Shorts",
        "duration_sec": 51.2,
        "video_id": "tY3GRLXJqC0",
        "status": "Uploaded",
        "comment_status": "Pending (Quota Exceeded)",
        "comment_text": (
            "💬 How do you detect and fix N+1 queries in your stack? (Django prefetch, SQLAlchemy joinedload, Prisma, ActiveRecord?)\n\n"
            "Drop your favorite ORM optimization tricks below! 👇\n\n"
            "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
            "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
            "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
        ),
    },
]

def main():
    print(f"📝 Initializing video records in {os.path.basename(CSV_PATH)}...")
    for v in VIDEOS:
        record_video(
            topic=v["topic"],
            project_file=v["project_file"],
            video_format=v["video_format"],
            duration_sec=v["duration_sec"],
            video_id=v["video_id"],
            status=v["status"],
            comment_status=v["comment_status"],
            comment_text=v["comment_text"],
            date_str=v["date_str"],
        )
    print("\n✅ Successfully written all video records to videos.csv!")

if __name__ == "__main__":
    main()
