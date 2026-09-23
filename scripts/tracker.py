import csv
import os
import sys
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT_DIR, "videos.csv")

FIELDNAMES = [
    "Date",
    "Topic",
    "Project File",
    "Format",
    "Duration (s)",
    "Video ID",
    "Shorts Link",
    "Watch Link",
    "Status",
    "Comment Status",
    "Top Comment",
]

def format_top_comment(title: str, custom_question: str = None) -> str:
    clean_title = title.replace("#Shorts", "").replace("#shorts", "").strip()
    question = custom_question or f"💬 What do you think about {clean_title}?"

    return (
        f"{question}\n\n"
        f"Drop your thoughts and questions below! 👇\n\n"
        f"🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        f"🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        f"💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    )

def load_all_records():
    if not os.path.exists(CSV_PATH):
        return []
    records = []
    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(row)
    return records

def save_all_records(records):
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for r in records:
            writer.writerow(r)

def record_video(
    topic: str,
    project_file: str = "",
    video_format: str = "Shorts",
    duration_sec: float = 0.0,
    video_id: str = "",
    status: str = "Uploaded",
    comment_status: str = "Pending",
    comment_text: str = "",
    date_str: str = None,
):
    date = date_str or datetime.now().strftime("%Y-%m-%d")
    shorts_link = f"https://www.youtube.com/shorts/{video_id}" if video_id else ""
    watch_link = f"https://youtu.be/{video_id}" if video_id else ""
    
    if not comment_text and topic:
        comment_text = format_top_comment(topic)

    records = load_all_records()
    updated = False

    for r in records:
        if (video_id and r.get("Video ID") == video_id) or (project_file and r.get("Project File") == project_file):
            r["Topic"] = topic or r.get("Topic", "")
            r["Project File"] = project_file or r.get("Project File", "")
            r["Format"] = video_format or r.get("Format", "")
            if duration_sec:
                r["Duration (s)"] = f"{duration_sec:.1f}"
            if video_id:
                r["Video ID"] = video_id
                r["Shorts Link"] = shorts_link
                r["Watch Link"] = watch_link
            r["Status"] = status or r.get("Status", "")
            r["Comment Status"] = comment_status or r.get("Comment Status", "")
            if comment_text:
                r["Top Comment"] = comment_text
            updated = True
            break

    if not updated:
        records.append({
            "Date": date,
            "Topic": topic,
            "Project File": project_file,
            "Format": video_format,
            "Duration (s)": f"{duration_sec:.1f}" if duration_sec else "",
            "Video ID": video_id,
            "Shorts Link": shorts_link,
            "Watch Link": watch_link,
            "Status": status,
            "Comment Status": comment_status,
            "Top Comment": comment_text,
        })

    save_all_records(records)
    print(f"📊 Saved video record to {os.path.basename(CSV_PATH)}")

if __name__ == "__main__":
    records = load_all_records()
    print(f"Total videos tracked in {CSV_PATH}: {len(records)}")
    for r in records:
        print(f"  [{r['Video ID']}] {r['Topic']} — Comment: {r['Comment Status']}")
