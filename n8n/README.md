# n8n scan workflow

`studyquest-scan.json` is the server-side half of StudyQuest's **AI document
scan**. Use it when the site is deployed publicly, so the Gemini API key lives
in n8n instead of in the JS bundle.

The app works without n8n — direct mode calls Gemini from the browser. This is
the hardened alternative, not a requirement.

## What it does

```
StudyQuest  ──POST {imageBase64, mimeType, today, knownModules}──▶  n8n webhook
                                                                        │
                                                          Gemini 2.5 Flash (vision)
                                                                        │
StudyQuest  ◀──{assignments[], grades[], documentType, note}────────────┘
```

The returned rows go into the same confirm list and auto-scheduler as a pasted
syllabus.

## Setup

1. In n8n: **Workflows → Import from File →** `studyquest-scan.json`.
2. Open the **Gemini Vision** node and replace
   `PASTE_YOUR_GEMINI_API_KEY_HERE` in the `x-goog-api-key` header with your key
   from [aistudio.google.com](https://aistudio.google.com) → Get API key.
3. **Activate** the workflow (the toggle, top right).
4. Open the **Scan Webhook** node and copy the **Production URL**.
5. In StudyQuest: **Settings → AI document scan → Via n8n webhook**, paste the
   URL, then hit **Test connection**.

## Notes

- The webhook is set to `allowedOrigins: *` so the browser can call it. Narrow
  this to your deployed domain once you know it.
- **Test connection** posts `{ping:true}`, which short-circuits before the
  Gemini call — testing costs no quota.
- The free Gemini tier is rate-limited. A 429 surfaces in the app as "the free
  quota is used up for now"; pasting text still works.
- If a scan fails, the workflow's **Executions** tab in n8n shows the exact
  request and response.
