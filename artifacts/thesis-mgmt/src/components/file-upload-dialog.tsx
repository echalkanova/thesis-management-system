import { useRef, useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getListThesisFilesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

type UploadState = "idle" | "uploading" | "success" | "error";

interface Props {
  thesisId: number;
}

export function FileUploadDialog({ thesisId }: Props) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reset = () => {
    setFile(null);
    setUploadState("idle");
    setErrorMsg("");
  };

  const validate = (f: File): string | null => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return "Само PDF, DOC и DOCX файлове са позволени.";
    if (f.size > MAX_SIZE) return "Файлът е по-голям от 20 MB.";
    return null;
  };

  const pick = (f: File) => {
    const err = validate(f);
    if (err) { setErrorMsg(err); setFile(null); return; }
    setErrorMsg("");
    setFile(f);
    setUploadState("idle");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pick(dropped);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) pick(f);
    e.target.value = "";
  };

  const upload = async () => {
    if (!file) return;
    setUploadState("uploading");
    setErrorMsg("");

    const token = localStorage.getItem("thesis_token");
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/theses/${thesisId}/files`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Грешка ${res.status}`);
      }

      setUploadState("success");
      queryClient.invalidateQueries({ queryKey: getListThesisFilesQueryKey(thesisId) });
      toast({ title: "Файлът е качен успешно" });
      setTimeout(() => { setOpen(false); reset(); }, 1200);
    } catch (err: unknown) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Неочаквана грешка при качване");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid="button-add-file">Добави файл</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Качване на файл</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Drop zone */}
          <div
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer select-none
              ${dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={onInputChange}
              data-testid="input-file-upload"
            />
            <div className={`rounded-full p-3 ${dragging ? "bg-indigo-100" : "bg-white border border-slate-200"}`}>
              <Upload className={`h-6 w-6 ${dragging ? "text-indigo-600" : "text-slate-400"}`} />
            </div>
            <div>
              <p className="font-medium text-slate-700 text-sm">
                {dragging ? "Пуснете файла тук" : "Плъзнете файл или кликнете за избор"}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX — макс. 20 MB</p>
            </div>
          </div>

          {/* Selected file preview */}
          {file && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <div className="rounded-md bg-blue-50 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
              </div>
              {uploadState === "idle" && (
                <button onClick={e => { e.stopPropagation(); reset(); }} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
              {uploadState === "uploading" && (
                <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {uploadState === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {uploadState === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </p>
          )}

          {/* Upload button */}
          <Button
            className="w-full bg-[#0a192f] text-white"
            disabled={!file || uploadState === "uploading" || uploadState === "success"}
            onClick={upload}
            data-testid="button-upload-file"
          >
            {uploadState === "uploading" ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Качване...</span>
            ) : uploadState === "success" ? (
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Качено!</span>
            ) : "Качи файл"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
