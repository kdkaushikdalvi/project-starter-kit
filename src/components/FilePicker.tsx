import React, { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

interface FilePickerProps {
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  selectedFile: File | null;
}

export function FilePicker({ onFileSelect, onFileClear, selectedFile }: FilePickerProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  };

  const validateAndSelect = (file: File) => {
    if (file.type === "application/pdf") {
      onFileSelect(file);
      setError(null);
    } else {
      onFileClear();
      setError("Please select a valid PDF file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileClear();
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`dropzone ${selectedFile ? "dropzone-active" : "dropzone-idle"}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent border border-primary/20 shadow-sm">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Only PDF files are allowed
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="truncate max-w-[280px] text-base font-semibold text-foreground">
              {selectedFile.name}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              onClick={clearFile}
              className="mt-6 text-sm font-bold text-destructive hover:text-destructive/80 transition-colors"
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-center text-sm font-semibold text-destructive">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
