import argparse
import json
import os
import sys
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_DIR = os.path.join(ROOT_DIR, "credentials")
DEFAULT_CLIENT_SECRETS = os.path.join(CREDENTIALS_DIR, "client_secrets.json")
DEFAULT_TOKEN_FILE = os.path.join(CREDENTIALS_DIR, "token.json")

SETUP_INSTRUCTIONS = """
--------------------------------------------------------------------------------
⚠️  Google Client Secrets Not Found!
--------------------------------------------------------------------------------
To authenticate with your Google/YouTube account, follow these 3 quick steps:

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Create a project and enable the 'YouTube Data API v3'.
3. Under 'Credentials' -> 'Create Credentials' -> 'OAuth client ID':
   - Application type: 'Desktop app'
   - Click 'Download JSON' and save the downloaded file as:
     credentials/client_secrets.json

Once saved, run this script again! It will open your web browser so you can
log in with your Gmail/YouTube account and authorize uploads and comments.
--------------------------------------------------------------------------------
"""

def get_authenticated_service(client_secrets_path=None, token_path=None, force_reauth=False):
    os.makedirs(CREDENTIALS_DIR, exist_ok=True)
    client_secrets = client_secrets_path or DEFAULT_CLIENT_SECRETS
    token_file = token_path or DEFAULT_TOKEN_FILE

    creds = None
    if os.path.exists(token_file) and not force_reauth:
        try:
            with open(token_file, "r", encoding="utf-8") as tf:
                saved_token = json.load(tf)
                saved_scopes = saved_token.get("scopes", [])
                if not all(s in saved_scopes for s in SCOPES):
                    print("🔄 Stored token is missing comment permissions ('youtube.force-ssl'). Re-authenticating in browser...")
                    creds = None
                else:
                    creds = Credentials.from_authorized_user_file(token_file, SCOPES)
        except Exception:
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Refreshing expired YouTube access token...")
            try:
                creds.refresh(Request())
            except Exception:
                creds = None

        if not creds:
            if not os.path.exists(client_secrets):
                # Check root directory as fallback
                root_secrets = os.path.join(ROOT_DIR, "client_secrets.json")
                if os.path.exists(root_secrets):
                    client_secrets = root_secrets
                else:
                    print(SETUP_INSTRUCTIONS)
                    raise FileNotFoundError(f"Missing {client_secrets}")

            print("\n🌐 Opening your web browser for Google Account authentication...", flush=True)
            flow = InstalledAppFlow.from_client_secrets_file(client_secrets, SCOPES)
            creds = flow.run_local_server(
                port=0,
                open_browser=True,
                prompt="consent",
                authorization_prompt_message="\n👉 If the browser does not open automatically, visit this URL to authorize:\n{url}\n\n⏳ Waiting for authorization in browser...\n"
            )

        # Save credentials for future seamless uploads
        with open(token_file, "w", encoding="utf-8") as token:
            token.write(creds.to_json())
        print(f"✅ Credentials saved to {os.path.relpath(token_file, ROOT_DIR)} (Future uploads won't require logging in again).")

    return build("youtube", "v3", credentials=creds)

def format_shorts_metadata(title, description, tags=None):
    if tags is None:
        tags = []
    
    # YouTube Shorts requires or highly recommends #Shorts in title or description
    if "#Shorts" not in title and "#shorts" not in title:
        # Keep title within YouTube 100 char limit
        if len(title) + 9 <= 100:
            title = f"{title} #Shorts"
    
    if "#Shorts" not in description:
        description = f"{description}\n\n#Shorts #Programming #AI #TechTutorial"

    if "Shorts" not in tags:
        tags.append("Shorts")

    return title, description, tags

def generate_default_comment(title, pdata=None):
    if pdata and pdata.get("comment"):
        return pdata.get("comment")

    clean_title = title.replace("#Shorts", "").replace("#shorts", "").strip()
    return (
        f"💬 What are your thoughts on {clean_title}?\n\n"
        f"Drop your questions or feedback below! 👇\n\n"
        f"🔔 Like & Subscribe for daily software engineering & AI deep dives!\n"
        f"🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
        f"💻 Check out the code & engine on GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
    )

def post_comment_on_video(youtube, video_id, text):
    if not text or not text.strip():
        return None
    print(f"\n💬 Posting top comment on video {video_id}...")
    try:
        response = youtube.commentThreads().insert(
            part="snippet",
            body={
                "snippet": {
                    "videoId": video_id,
                    "topLevelComment": {
                        "snippet": {
                            "textOriginal": text.strip()
                        }
                    }
                }
            }
        ).execute()
        comment_id = response.get("id")
        print(f"✅ Top comment posted successfully! (ID: {comment_id})")
        return response
    except HttpError as e:
        if "insufficientPermissions" in str(e):
            print(f"⚠️ Could not post comment: Insufficient permissions. Run `python scripts/youtube_uploader.py --reauth` to grant comment permissions.")
        elif "quotaExceeded" in str(e):
            print(f"⚠️ YouTube API Quota Exceeded (403). Top comment will be posted once the daily quota resets (midnight PST / ~13:00 local time).")
        else:
            print(f"⚠️ Could not post comment: {e}")
        return None
    except Exception as e:
        print(f"⚠️ Error posting comment: {e}")
        return None

def upload_video_to_youtube(
    video_path,
    title,
    description="",
    tags=None,
    privacy_status="private",
    is_short=False,
    comment_text=None,
    project_file=None,
    duration_sec=0.0,
    client_secrets_path=None,
    token_path=None,
    force_reauth=False
):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    youtube = get_authenticated_service(client_secrets_path, token_path, force_reauth=force_reauth)

    if is_short:
        title, description, tags = format_shorts_metadata(title, description, tags)

    print("=" * 60)
    print("🚀 Uploading video to YouTube:")
    print(f"   📹 File:        {os.path.basename(video_path)}")
    print(f"   📌 Title:       {title}")
    print(f"   🔒 Privacy:     {privacy_status}")
    print(f"   🏷️  Tags:        {', '.join(tags[:6]) if tags else 'None'}")
    print("=" * 60)

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags or [],
            "categoryId": "27",  # Education
            "defaultLanguage": "en",
            "defaultAudioLanguage": "en"
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        }
    }

    media = MediaFileUpload(
        video_path,
        chunksize=1024 * 1024 * 5,
        resumable=True,
        mimetype="video/mp4"
    )

    request = youtube.videos().insert(
        part=",".join(body.keys()),
        body=body,
        media_body=media
    )

    response = None
    last_progress = 0
    print("⏳ Upload in progress...")
    while response is None:
        status, response = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            if progress >= last_progress + 10:
                print(f"   Uploading... {progress}%")
                last_progress = progress

    video_id = response.get("id")
    watch_url = f"https://youtu.be/{video_id}"
    shorts_url = f"https://www.youtube.com/shorts/{video_id}"

    print("\n🎉 Upload complete!")
    print(f"🆔 Video ID:    {video_id}")
    if is_short:
        print(f"📱 Shorts Link: {shorts_url}")
    print(f"🔗 Watch Link:  {watch_url}")

    # Automatically post top comment
    comment_status = "Skipped"
    if comment_text:
        c_res = post_comment_on_video(youtube, video_id, comment_text)
        comment_status = "Posted" if c_res else "Pending (Quota Exceeded)"

    # Automatically record in tracker (videos.csv)
    try:
        from tracker import record_video
        record_video(
            topic=title,
            project_file=project_file or "",
            video_format="Shorts" if is_short else "Landscape",
            duration_sec=duration_sec,
            video_id=video_id,
            status=f"Uploaded ({privacy_status})",
            comment_status=comment_status,
            comment_text=comment_text or "",
        )
    except Exception as te:
        print(f"⚠️ Could not record video in tracker: {te}")

    return response

def main():
    parser = argparse.ArgumentParser(description="Upload educational video to YouTube")
    parser.add_argument("--video", "-v", required=True, help="Path to video file (.mp4)")
    parser.add_argument("--project", "-p", default=None, help="Path to project.json for metadata")
    parser.add_argument("--title", "-t", default=None, help="Video title")
    parser.add_argument("--description", "-d", default=None, help="Video description")
    parser.add_argument("--comment", "-c", default=None, help="Top-level comment to post on the video")
    parser.add_argument("--no-comment", action="store_true", help="Do not post a top-level comment")
    parser.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private", help="Video visibility (default: private)")
    parser.add_argument("--short", action="store_true", help="Flag as YouTube Short")
    parser.add_argument("--reauth", action="store_true", help="Force re-authentication with updated scopes")
    args = parser.parse_args()

    title = args.title
    description = args.description or ""
    tags = ["Programming", "AI", "Technology"]
    is_short = args.short
    comment_text = args.comment
    pdata = None

    # Auto-extract metadata from project.json if provided
    if args.project and os.path.exists(args.project):
        with open(args.project, "r", encoding="utf-8") as f:
            pdata = json.load(f)
            if not title:
                title = pdata.get("title", "Educational Programming Video")
            if pdata.get("aspectRatio") == "9:16":
                is_short = True
            
            # Synthesize detailed description from scenes
            scene_narrations = [s.get("narration", "") for s in pdata.get("scenes", []) if s.get("narration")]
            description = (
                f"{title}\n\n"
                f"In this video, we explore {title.replace('What is ', '').replace('Meet ', '')}.\n\n"
                f"📌 Key Highlights:\n" +
                "\n".join([f"• {n[:90]}..." for n in scene_narrations[:4]]) +
                "\n\n🔔 Subscribe for more fast-paced educational tech & AI tutorials!\n"
                f"🐦 Follow on Twitter / X: @mashukjim (https://twitter.com/mashukjim)\n"
                f"💻 GitHub: @MashukeAlam (https://github.com/MashukeAlam/vdo)"
            )
            # Collect tags
            for s in pdata.get("scenes", []):
                t_list = s.get("props", {}).get("tags", [])
                tags.extend(t_list)
            tags = list(dict.fromkeys(tags))

    if not title:
        title = os.path.splitext(os.path.basename(args.video))[0].replace("_", " ").title()

    if not args.no_comment and not comment_text:
        comment_text = generate_default_comment(title, pdata)

    duration_sec = 0.0
    if pdata:
        total_words = sum(len(s.get("narration", "").split()) for s in pdata.get("scenes", []))
        duration_sec = total_words / 2.6

    try:
        upload_video_to_youtube(
            video_path=args.video,
            title=title,
            description=description,
            tags=tags,
            privacy_status=args.privacy,
            is_short=is_short,
            comment_text=comment_text if not args.no_comment else None,
            project_file=args.project,
            duration_sec=duration_sec,
            force_reauth=args.reauth
        )
    except Exception as e:
        print(f"\n❌ Upload Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
