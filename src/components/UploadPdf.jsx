import { useRef, useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, Trash2, Hash } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;

export function UploadPdf({
  selectedFile,
  onFileSelect,
  onFileClear,
  referenceNumber,
  onReferenceChange,
  maxSizeMB = MAX_FILE_SIZE_MB,
}) {
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState(null);

  const validate = useCallback(
    (file) => {
      if (!file) return;

      if (file.type !== "application/pdf") {
        setError("PDF only");
        onFileClear();
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Max ${maxSizeMB}MB`);
        onFileClear();
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [maxSizeMB, onFileClear, onFileSelect],
  );

  return (
    <div className="space-y-5 mx-auto max-w-xl p-6">
      <div className="space-y-1">
        <label className="block text-sm font-bold text-slate-700">
          Reference Number <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Hash
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => onReferenceChange(e.target.value)}
            placeholder="Enter reference number"
            className="w-full rounded-full border border-slate-300
        pl-11 pr-4 py-3 text-sm font-semibold
        focus:border-sky-500 focus:ring-2 focus:ring-sky-200
        outline-none transition"
          />
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) validate(f);
        }}
        className={`relative rounded-[2.5rem] p-8 text-center transition-all
          bg-white/60 backdrop-blur-xl border-2
          ${
            drag
              ? "border-sky-500 shadow-2xl shadow-sky-300/40 scale-[1.02]"
              : "border-sky-200"
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={(e) => validate(e.target.files?.[0])}
        />

        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full
          bg-sky-500 text-white shadow-xl shadow-sky-400/50"
        >
          <Upload size={28} />
        </div>

        <h3 className="text-xl font-black text-slate-800">Upload Document</h3>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          Drag & drop your PDF or click the button below
        </p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-6 inline-flex items-center gap-2 rounded-full
            bg-sky-500 px-6 py-2.5 text-sm font-bold text-white
            shadow-lg shadow-sky-400/40
            hover:bg-sky-600 active:scale-95 transition"
        >
          <Upload size={16} />
          Choose PDF
        </button>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="relative rounded-2xl bg-white border border-slate-200 p-5 shadow-lg">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-sky-500" />

          <div className="flex items-center justify-between gap-4 pl-3">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg
                bg-sky-100 text-sky-600"
              >
                <FileText />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-green-500" />
                  Ready • {(selectedFile.size / 1e6).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onFileClear();
                fileRef.current.value = "";
              }}
              className="h-9 w-9 rounded-full flex items-center justify-center
                text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center text-sm font-black text-red-600 bg-red-50 p-3 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
