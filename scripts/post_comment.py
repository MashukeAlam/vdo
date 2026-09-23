import argparse
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from youtube_uploader import get_authenticated_service, post_comment_on_video
from tracker import load_all_records, save_all_records, record_video

DEFAULT_VIDEOS = {
    "tY3GRLXJqC0": (
        "💬 How do you detect and fix N+1 queries in your stack? (Django prefetch, SQLAlchemy joinedload, Prisma, ActiveRecord?)\n\n"
        "Drop your favorite ORM optimization tricks below! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
    "imZWzFFEsBI": (
        "💬 What's your worst 2 AM production SSH horror story? Has configuration drift ever crashed your cluster?\n\n"
        "Let me know in the comments! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
    "9J6lA7vNZ_0": (
        "💬 Has vibecoding ruined web design, or does it make developers 10x faster? What's your take on AI-generated UI?\n\n"
        "Share your thoughts below! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
    "GmOH3S5DxT8": (
        "💬 Which model is your daily driver for coding? DeepSeek V3, Claude 3.5 Sonnet, or GPT-4o?\n\n"
        "Drop your vote in the comments! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
    "psw3Yeai2o0": (
        "💬 Do you think 1-bit LLMs like BitNet b1.58 will replace standard FP16 transformer inference on edge devices?\n\n"
        "Let's discuss below! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
    "ShKkY6QAjR0": (
        "💬 Multi-Head Latent Attention (MLA) is DeepSeek's biggest architectural breakthrough. What other AI innovations should we cover next?\n\n"
        "Drop your ideas below! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
    "QghW_wHthEs": (
        "💬 What are your impressions of Jev AI and local deterministic classification models?\n\n"
        "Drop a comment below! 👇\n\n"
        "🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        "🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        "💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    ),
}

def post_and_update(youtube, video_id, text, topic=None):
    res = post_comment_on_video(youtube, video_id, text)
    status = "Posted" if res else "Pending (Quota Exceeded)"
    record_video(
        topic=topic or "",
        video_id=video_id,
        comment_status=status,
        comment_text=text
    )
    return res

def main():
    parser = argparse.ArgumentParser(description="Post top-level comments to YouTube videos & update videos.csv")
    parser.add_argument("--video-id", "-v", default=None, help="Target YouTube Video ID")
    parser.add_argument("--text", "-t", default=None, help="Comment text to post")
    parser.add_argument("--all", "-a", action="store_true", help="Post comments to all previously published channel videos")
    parser.add_argument("--pending", "-p", action="store_true", help="Post comments only to videos whose Comment Status is pending")
    parser.add_argument("--reauth", "-r", action="store_true", help="Force re-authentication with comment scopes")
    args = parser.parse_args()

    print("🔑 Authenticating with YouTube Data API v3...")
    youtube = get_authenticated_service(force_reauth=args.reauth)

    records = load_all_records()

    if args.pending or args.all:
        target_records = []
        if records:
            for r in records:
                vid = r.get("Video ID")
                c_status = r.get("Comment Status", "")
                if not vid:
                    continue
                if args.pending and c_status == "Posted":
                    continue
                c_text = r.get("Top Comment") or DEFAULT_VIDEOS.get(vid)
                target_records.append((vid, c_text, r.get("Topic", "")))
        else:
            for vid, text in DEFAULT_VIDEOS.items():
                target_records.append((vid, text, ""))

        print(f"\n🚀 Processing comments for {len(target_records)} video(s)...")
        for vid, comment_text, topic in target_records:
            print(f"\n------------------------------------------------------------")
            print(f"🎬 Video ID: {vid} ({topic or 'Unknown Topic'})")
            res = post_and_update(youtube, vid, comment_text, topic)
            if not res:
                print("🛑 Quota limit active; pausing further batch requests.")
                break
        print("\n🏁 Finished batch run!")
    elif args.video_id:
        text = args.text or DEFAULT_VIDEOS.get(args.video_id, "")
        if not text and records:
            for r in records:
                if r.get("Video ID") == args.video_id:
                    text = r.get("Top Comment")
                    break
        text = text or "💬 Drop a comment below with your thoughts!\n\n🔔 Like & Subscribe\n🐦 Follow on Twitter / X: @mashukjim\n💻 GitHub: @MashukeAlam"
        post_and_update(youtube, args.video_id, text)
    else:
        print("Usage:")
        print("  python scripts/post_comment.py --pending   # Retry comments for all pending videos")
        print("  python scripts/post_comment.py --all       # Post comments to all channel videos")
        print("  python scripts/post_comment.py --video-id <ID> --text 'Your comment'")
        print("  python scripts/post_comment.py --reauth")

if __name__ == "__main__":
    main()
