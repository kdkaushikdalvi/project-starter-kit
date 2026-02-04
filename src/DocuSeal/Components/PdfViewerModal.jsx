import { useState } from "react";
import { pdfjs } from "react-pdf";
import { X, PenTool } from "lucide-react";
import { useSignature } from "./SignatureContext";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PdfViewer from "./PdfViewer";

// Polyfill Promise.withResolvers for older browsers (must be before pdfjs)
if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfViewerModal({ currentStep, onClose, onSubmit }) {
  const { pdfFile, blocks, signatures } = useSignature();
  const [numPages, setNumPages] = useState(0);

  if (!pdfFile || currentStep !== 4) return null;

  const allBlocksSigned =
    blocks.length > 0 && blocks.every((b) => signatures[b.id]);

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-white">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full
               border border-slate-300 text-slate-500
               hover:bg-slate-100"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <PenTool size={14} />
          Review & Sign Document
        </div>
        <button
          disabled={!allBlocksSigned}
          onClick={onSubmit}
          className={`rounded-md px-4 py-1.5 text-xs font-medium text-white
      ${
        allBlocksSigned
          ? "bg-sky-500 hover:bg-sky-600"
          : "bg-slate-300 cursor-not-allowed"
      }`}
        >
          Submit
        </button>
      </header>
      <PdfViewer />
    </div>
  );
}
