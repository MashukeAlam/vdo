# Credentials Setup

This folder holds Google OAuth 2.0 credentials for automated YouTube uploading.

### 1. Download Client Secrets
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **YouTube Data API v3**.
3. Under **APIs & Services > Credentials**, create an **OAuth Client ID** for a **Desktop App**.
4. Download the JSON credential file and save it as:
   ```
   credentials/client_secrets.json
   ```

### 2. Auto-generated Token
When you run your first upload via `python scripts/youtube_uploader.py`, Google will prompt you to log in via browser. The refreshed session token will be saved to `credentials/token.json`. Subsequent uploads will run headlessly without prompting.

> ⚠️ **Security Warning**: `client_secrets.json` and `token.json` are listed in `.gitignore` and should never be committed to public repositories.
