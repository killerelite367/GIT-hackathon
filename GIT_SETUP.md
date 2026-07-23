# Pushing StudyQuest to GitHub

The project files are all here and the app builds successfully. Because this
folder lives in OneDrive, Git has to be run from **your own machine** (not the
assistant sandbox). Two ways to do it:

## Option A — one click
Double-click **`push-to-github.bat`**. It will init the repo, make the first
commit, ask for your repo URL, and push.

## Option B — run these commands yourself
Open a terminal (Command Prompt, PowerShell, or Git Bash) in this folder:

```bash
rmdir /s /q .git        &  (Command Prompt)   # or:  rm -rf .git   (Git Bash)
git init
git branch -M main
git add .
git commit -m "Initial commit: StudyQuest scaffold"
git remote add origin https://github.com/YOUR-USERNAME/GIT-HACKATHON.git
git push -u origin main
```

Get the repo URL from your GitHub repo page (green **Code** button → HTTPS).

## Then run the app
```bash
npm install
npm run dev
```
Open the printed localhost URL. It runs on demo data until you add Supabase
keys — see `README.md`.
