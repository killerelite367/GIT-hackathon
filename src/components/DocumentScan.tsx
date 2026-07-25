import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImageUp,
  Loader2,
  ScanLine,
  Sparkles,
  TriangleAlert,
  X,
  FileText,
} from "lucide-react";
import Button from "./Button";
import { prepareFile, scanDocument, ScanError, type ScanResult } from "../lib/vision";
import { getMode, isScanConfigured } from "../lib/aiConfig";

/**
 * The "scan a photo" half of the import modal.
 *
 * Take or drop a photo of a module guide / brief / results slip, Gemini reads
 * it, and the extracted rows are handed up to the shared review list — the same
 * one the paste-text parser feeds. This component only produces a ScanResult;
 * confirming and saving stays in SyllabusImport.
 */

type Phase = "idle" | "preparing" | "scanning";

export default function DocumentScan({
  knownModules,
  onResult,
  onGoToSettings,
}: {
  knownModules: string[];
  onResult: (r: ScanResult) => void;
  onGoToSettings: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<{ msg: string; hint?: string } | null>(null);
  const [dragging, setDragging] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const configured = isScanConfigured();
  const mode = getMode();
  const busy = phase !== "idle";

  // Abort any in-flight request if the modal closes mid-scan.
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setPhase("preparing");
        const { base64, mimeType, previewUrl } = await prepareFile(file);
        setPreview(previewUrl);

        setPhase("scanning");
        const result = await scanDocument(
          base64,
          mimeType,
          knownModules,
          controller.signal
        );
        onResult(result);
      } catch (e) {
        if (controller.signal.aborted) return;
        if (e instanceof ScanError) setError({ msg: e.message, hint: e.hint });
        else
          setError({
            msg: "The scan failed.",
            hint: e instanceof Error ? e.message : undefined,
          });
      } finally {
        if (!controller.signal.aborted) setPhase("idle");
        abortRef.current = null;
      }
    },
    [knownModules, onResult]
  );

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  // Screenshot → Ctrl+V is the fastest path on a laptop, so support it.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (busy) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      const f = item?.getAsFile();
      if (f) {
        e.preventDefault();
        void handleFile(f);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [busy, handleFile]);

  if (!configured) {
    return (
      <div className="rounded-2xl border border-line bg-surface2 p-6 text-center">
        <Sparkles size={22} className="mx-auto text-brand" />
        <p className="mt-3 text-sm font-semibold text-night">Scanning isn't set up yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-dusk">
          {mode === "webhook"
            ? "Add your n8n webhook URL to scan documents with AI."
            : "Add a Google AI Studio (Gemini) API key to scan documents with AI."}
        </p>
        <Button variant="primary" size="sm" className="mt-4" onClick={onGoToSettings}>
          Open scan settings
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragging ? "border-brand bg-brand-soft/40" : "border-line bg-surface2"
        }`}
      >
        {busy ? (
          <div className="py-4">
            {preview && (
              <img
                src={preview}
                alt=""
                className="mx-auto mb-4 max-h-40 rounded-xl border border-line object-contain opacity-60"
              />
            )}
            {/* A sweeping line reads as "scanning" without a fake progress bar. */}
            <div className="relative mx-auto h-1 w-40 overflow-hidden rounded-full bg-line">
              <div className="absolute inset-y-0 -left-full w-full animate-[shimmer_1.4s_linear_infinite] bg-brand" />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-night">
              <Loader2 size={15} className="animate-spin text-brand" />
              {phase === "preparing" ? "Preparing the image…" : "Reading the document…"}
            </p>
            <p className="mt-1 text-xs text-dusk">
              {phase === "preparing"
                ? "Resizing so the upload stays small."
                : "Gemini is pulling out deadlines and weightages."}
            </p>
          </div>
        ) : preview || fileName ? (
          <div className="py-2">
            {preview ? (
              <img
                src={preview}
                alt={fileName}
                className="mx-auto max-h-40 rounded-xl border border-line object-contain"
              />
            ) : (
              <FileText size={32} className="mx-auto text-haze" />
            )}
            <p className="mt-3 truncate font-mono text-xs text-haze">{fileName}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPreview("");
                  setFileName("");
                  setError(null);
                }}
              >
                Choose another
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScanLine size={26} className="mx-auto text-brand" />
            <p className="mt-3 text-sm font-semibold text-night">
              Snap a photo of your document
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-dusk">
              A module guide, assignment brief, or results slip. Drag one in, paste a
              screenshot, or use your camera.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Camera size={14} />}
                onClick={() => cameraRef.current?.click()}
              >
                Take photo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<ImageUp size={14} />}
                onClick={() => uploadRef.current?.click()}
              >
                Upload image or PDF
              </Button>
            </div>
          </>
        )}
      </div>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={pick}
        className="hidden"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={pick}
        className="hidden"
      />

      {error && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-berry/40 bg-berry-soft p-3">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-berry-deep" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-berry-deep">{error.msg}</p>
            {error.hint && <p className="mt-0.5 text-xs text-dusk">{error.hint}</p>}
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="shrink-0 text-haze transition hover:text-night"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-haze">
        {mode === "webhook"
          ? "Sent to your n8n workflow · nothing is stored"
          : "Sent straight to Google Gemini · nothing is stored"}
      </p>
    </div>
  );
}
