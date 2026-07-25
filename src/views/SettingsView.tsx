import { useRef } from "react";
import { Download, Upload, RotateCcw, Bell, BellOff, Wand2, Database, Home } from "lucide-react";
import { useStore } from "../store/StoreContext";
import Button from "../components/Button";
import { isSupabaseConfigured } from "../lib/supabase";
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

export default function SettingsView({
  onImportSyllabus,
  onShowLanding,
}: {
  onImportSyllabus: () => void;
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
