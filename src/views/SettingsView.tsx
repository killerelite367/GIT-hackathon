import { useRef, useState } from "react";
import {
  Download,
  Upload,
  RotateCcw,
  Bell,
  BellOff,
  Wand2,
  Database,
  Home,
  ScanLine,
  Eye,
  EyeOff,
  ShieldAlert,
  CircleCheck,
  CircleX,
  Loader2,
} from "lucide-react";
import { useStore } from "../store/StoreContext";
import Button from "../components/Button";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  getApiKey,
  setApiKey,
  getWebhookUrl,
  setWebhookUrl,
  getMode,
  setMode,
  isUserKey,
  maskKey,
  GEMINI_MODEL,
  type ScanMode,
} from "../lib/aiConfig";
import { testConnection } from "../lib/vision";
import {
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
} from "../lib/notify";

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-4 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-night">{title}</p>
        <p className="text-xs text-dusk">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <h3 className="mb-3 font-display text-base font-bold tracking-tightish text-night">{title}</h3>
      {children}
    </section>
  );
}

/**
 * AI document scan setup.
 *
 * Direct mode calls Gemini from the browser — simple, but the key is readable
 * by anyone who opens devtools on a deployed build, so the copy says so
 * plainly. Webhook mode hands the image to n8n, which keeps the key server-side.
 */
function ScanSettings({ onScanDocument }: { onScanDocument: () => void }) {
  const [mode, setModeState] = useState<ScanMode>(getMode);
  const [key, setKeyState] = useState(() => (isUserKey() ? getApiKey() : ""));
  const [hook, setHookState] = useState(getWebhookUrl);
  const [reveal, setReveal] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; detail: string } | null>(null);

  // The key may come from the build (.env) rather than this field.
  const buildKey = !isUserKey() && !!getApiKey();

  const chooseMode = (m: ScanMode) => {
    setMode(m);
    setModeState(m);
    setResult(null);
  };

  const saveKey = (v: string) => {
    setKeyState(v);
    setApiKey(v);
    setResult(null);
  };

  const saveHook = (v: string) => {
    setHookState(v);
    setWebhookUrl(v);
    setResult(null);
  };

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    setResult(await testConnection());
    setTesting(false);
  };

  return (
    <Card title="AI document scan">
      <p className="-mt-1 mb-4 text-xs text-dusk">
        Photograph a module guide, brief, or results slip and let AI pull out the
        deadlines, weightages, and scores — then auto-schedule them.
      </p>

      <div className="mb-4 flex gap-1 rounded-xl border border-line bg-surface2 p-1">
        {(
          [
            { id: "direct", label: "Direct to Gemini" },
            { id: "webhook", label: "Via n8n webhook" },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            onClick={() => chooseMode(o.id)}
            aria-pressed={mode === o.id}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              mode === o.id ? "bg-brand text-white shadow-brand" : "text-dusk hover:text-night"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {mode === "direct" ? (
        <>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-haze">
            Google AI Studio (Gemini) API key
            <div className="mt-1.5 flex gap-2">
              <input
                type={reveal ? "text" : "password"}
                value={key}
                onChange={(e) => saveKey(e.target.value)}
                placeholder={buildKey ? `Using build key ${maskKey(getApiKey())}` : "AIza…"}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-lg border border-line bg-surface2 px-3 py-2 font-mono text-xs font-normal normal-case tracking-normal text-night outline-none placeholder:text-haze focus:border-brand/50"
              />
              <button
                onClick={() => setReveal((r) => !r)}
                aria-label={reveal ? "Hide key" : "Show key"}
                className="shrink-0 rounded-lg border border-line px-2.5 text-dusk transition hover:text-night"
              >
                {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>
          <p className="mt-1.5 text-[11px] text-haze">
            Free key from aistudio.google.com → Get API key. Stored only in this browser.
            Model: <span className="font-mono">{GEMINI_MODEL}</span>.
          </p>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-warm/30 bg-warm-soft p-3">
            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-warm-deep" />
            <p className="text-[11px] text-dusk">
              <span className="font-semibold text-warm-deep">Heads up:</span> a key set at
              build time is visible to anyone who inspects the deployed site. For a public
              demo, use webhook mode — or keep the key here in Settings, where it never
              leaves your browser.
            </p>
          </div>
        </>
      ) : (
        <>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-haze">
            n8n webhook URL
            <input
              type="url"
              value={hook}
              onChange={(e) => saveHook(e.target.value)}
              placeholder="https://your-n8n.app/webhook/studyquest-scan"
              autoComplete="off"
              spellCheck={false}
              className="mt-1.5 w-full rounded-lg border border-line bg-surface2 px-3 py-2 font-mono text-xs font-normal normal-case tracking-normal text-night outline-none placeholder:text-haze focus:border-brand/50"
            />
          </label>
          <p className="mt-1.5 text-[11px] text-haze">
            Import <span className="font-mono">n8n/studyquest-scan.json</span> into n8n, add
            your Gemini key there, activate it, and paste the Production URL here. The key
            stays on the server.
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={testing ? <Loader2 size={14} className="animate-spin" /> : undefined}
          onClick={runTest}
          disabled={testing}
        >
          {testing ? "Testing…" : "Test connection"}
        </Button>
        <Button variant="primary" size="sm" icon={<ScanLine size={14} />} onClick={onScanDocument}>
          Scan a document
        </Button>
      </div>

      {result && (
        <p
          className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs ${
            result.ok
              ? "border-grass/40 bg-grass-soft text-grass-deep"
              : "border-berry/40 bg-berry-soft text-berry-deep"
          }`}
        >
          {result.ok ? (
            <CircleCheck size={14} className="mt-px shrink-0" />
          ) : (
            <CircleX size={14} className="mt-px shrink-0" />
          )}
          <span>{result.detail}</span>
        </p>
      )}
    </Card>
  );
}

export default function SettingsView({
  onImportSyllabus,
  onScanDocument,
  onShowLanding,
}: {
  onImportSyllabus: () => void;
  onScanDocument: () => void;
  onShowLanding: () => void;
}) {
  const { data, exportData, importData, resetAll, setReminders } = useStore();
  const { game } = data;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await importData(file);
  };

  const toggleReminders = async () => {
    if (game.remindersEnabled) {
      setReminders(false);
      return;
    }
    const granted = await requestNotificationPermission();
    setReminders(granted);
  };

  const notifState = notificationPermission();

  return (
    <div className="max-w-2xl space-y-6">
      <ScanSettings onScanDocument={onScanDocument} />

      <Card title="Reminders">
        <Row
          title="Daily reminder"
          desc={
            !notificationsSupported()
              ? "Not supported in this browser."
              : notifState === "denied"
              ? "Blocked — enable notifications for this site in your browser."
              : "One nudge a day when something needs attention, while the tab is open."
          }
        >
          <Button
            variant={game.remindersEnabled ? "primary" : "secondary"}
            size="sm"
            icon={game.remindersEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            onClick={toggleReminders}
            disabled={!notificationsSupported() || notifState === "denied"}
          >
            {game.remindersEnabled ? "On" : "Off"}
          </Button>
        </Row>
      </Card>

      <Card title="Your data">
        <Row title="Back up your progress" desc="Download everything as a JSON file you can restore later.">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportData}>
            Export
          </Button>
        </Row>
        <Row title="Restore from a backup" desc="Load a previously exported StudyQuest file.">
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </Row>
        <Row title="Import from a syllabus" desc="Paste a module guide and auto-extract every deadline.">
          <Button variant="secondary" size="sm" icon={<Wand2 size={14} />} onClick={onImportSyllabus}>
            Open
          </Button>
        </Row>
        <Row title="Scan a document" desc="Photograph a brief or results slip and let AI fill it in.">
          <Button variant="secondary" size="sm" icon={<ScanLine size={14} />} onClick={onScanDocument}>
            Scan
          </Button>
        </Row>
        <Row title="Reset to demo data" desc="Wipe your progress and start fresh with the sample semester.">
          <Button variant="danger" size="sm" icon={<RotateCcw size={14} />} onClick={resetAll}>
            Reset
          </Button>
        </Row>
      </Card>

      <Card title="About">
        <Row
          title="Storage"
          desc={
            isSupabaseConfigured
              ? "Connected to Supabase."
              : "Everything is saved locally in this browser. Export a backup to keep it safe."
          }
        >
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-medium text-dusk">
            <Database size={13} />
            {isSupabaseConfigured ? "Supabase" : "Local"}
          </span>
        </Row>
        <Row
          title="Landing page"
          desc="Revisit the StudyQuest intro page — handy for demos."
        >
          <Button variant="secondary" size="sm" icon={<Home size={14} />} onClick={onShowLanding}>
            View
          </Button>
        </Row>
        <Row title="StudyQuest" desc="A gamified study diary built for RP students · Semester 2026-S2.">
          <span />
        </Row>
      </Card>
    </div>
  );
}
