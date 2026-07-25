# Updating an already-imported workflow

These two files are the JavaScript from the Code nodes in
`../studyquest-scan.json`, pulled out so you can update a workflow that's
already running in n8n without re-importing it.

**Why you'd want this:** re-importing creates a *second* workflow claiming the
same `/webhook/studyquest-scan` path, which n8n won't activate while the old one
holds it — and you'd have to paste your Gemini API key in again. Editing the two
Code nodes in place keeps your key, your webhook URL, and your active state.

## Steps

1. Open the **StudyQuest — Document Scan** workflow in n8n.
2. Open the **Build Gemini Request** node. Select everything in the JS editor
   and replace it with the contents of `build-gemini-request.js`.
3. Open the **Parse Result** node. Same with `parse-result.js`.
4. **Save.** (No need to re-activate — it stays active.)

Then in StudyQuest: **Study → New study set → Generate from text**.

## What changed

The webhook now reads a `task` field on the incoming request:

| `task` | What it does |
|---|---|
| *(absent)* or `scan` | Reads a document for deadlines and weightages — the original behaviour, unchanged. |
| `studyset` | Generates summarized notes, key terms, flashcards, and a quiz from text or a document. |
| `ping` | Answers without calling Gemini, so **Test connection** costs no quota. |

`Parse Result` reads the task back off `Build Gemini Request` so it knows which
shape to return.

## Checking it worked

In StudyQuest, **Settings → AI document scan → Test connection** should still
say *Webhook reachable*. Then generate a study set — if you still get "your n8n
workflow doesn't support study sets yet", the node edits didn't save.
