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
log in with your Gmail/YouTube account and authorize uploads.
--------------------------------------------------------------------------------
"""

def get_authenticated_service(client_secrets_path=None, token_path=None):
    os.makedirs(CREDENTIALS_DIR, exist_ok=True)
    client_secrets = client_secrets_path or DEFAULT_CLIENT_SECRETS
    token_file = token_path or DEFAULT_TOKEN_FILE

    creds = None
    if os.path.exists(token_file):
        try:
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
            auth_url, _ = flow.authorization_url(prompt="consent")
            print(f"\n👉 Authorization URL:\n{auth_url}\n", flush=True)
            print("⏳ Waiting for authorization in browser...", flush=True)
            creds = flow.run_local_server(port=0, open_browser=True)

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

def upload_video_to_youtube(
    video_path,
    title,
    description,
    tags=None,
    category_id="28", # 28 = Science & Technology
    privacy_status="private", # private | unlisted | public
    is_short=False,
    client_secrets_path=None,
    token_path=None
):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    if is_short:
        title, description, tags = format_shorts_metadata(title, description, tags)

    youtube = get_authenticated_service(client_secrets_path, token_path)

    body = {
        "snippet": {
            "title": title[:100],
            "description": description[:5000],
            "tags": tags or ["AI", "Programming", "Technology"],
            "categoryId": str(category_id),
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        },
    }

    print("=" * 60)
    print(f"🚀 Uploading video to YouTube:")
    print(f"   📹 File:        {os.path.basename(video_path)}")
    print(f"   📌 Title:       {body['snippet']['title']}")
    print(f"   🔒 Privacy:     {body['status']['privacyStatus']}")
    print(f"   🏷️  Tags:        {', '.join(body['snippet']['tags'][:6])}")
    print("=" * 60)

    # 5MB chunks for reliable resumable upload
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
    return response

def main():
    parser = argparse.ArgumentParser(description="Upload educational video to YouTube")
    parser.add_argument("--video", "-v", required=True, help="Path to video file (.mp4)")
    parser.add_argument("--project", "-p", default=None, help="Path to project.json for metadata")
    parser.add_argument("--title", "-t", default=None, help="Video title")
    parser.add_argument("--description", "-d", default=None, help="Video description")
    parser.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private", help="Video visibility (default: private)")
    parser.add_argument("--short", action="store_true", help="Flag as YouTube Short")
    args = parser.parse_args()

    title = args.title
    description = args.description or ""
    tags = ["Programming", "AI", "Technology"]
    is_short = args.short

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
                "\n\n🔔 Subscribe for more fast-paced educational tech & AI tutorials!"
            )
            # Collect tags
            for s in pdata.get("scenes", []):
                t_list = s.get("props", {}).get("tags", [])
                tags.extend(t_list)
            tags = list(dict.fromkeys(tags))

    if not title:
        title = os.path.splitext(os.path.basename(args.video))[0].replace("_", " ").title()

    try:
        upload_video_to_youtube(
            video_path=args.video,
            title=title,
            description=description,
            tags=tags,
            privacy_status=args.privacy,
            is_short=is_short
        )
    except Exception as e:
        print(f"\n❌ Upload Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
