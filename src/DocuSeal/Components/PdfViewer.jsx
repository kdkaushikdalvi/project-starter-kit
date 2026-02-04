import React, { useState } from "react";
import { Document, pdfjs } from "react-pdf";
import { useSignature, FIELD_TYPES } from "./SignatureContext";
import SignPdf from "./SignPdf";
import { Square, PenTool } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

if (typeof Promise !== "undefined" && !("withResolvers" in Promise)) {
  Promise.withResolvers = function () {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export default function PdfViewer({ currentStep: propCurrentStep }) {
  const { pdfFile, currentStep: contextCurrentStep, blocks } = useSignature();
  const [numPages, setNumPages] = useState(0);

  const currentStep = propCurrentStep ?? contextCurrentStep;

  if (!pdfFile) return null;

  const stepConfig = {
    2: {
      message: "Draw to place fields",
      bg: "bg-blue-50/70",
      text: "text-blue-700",
      dot: "bg-blue-500",
      icon: <Square size={12} />,
    },
    4: {
      message: "Click fields to sign",
      bg: "bg-emerald-50/70",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      icon: <PenTool size={12} />,
    },
  };

  const config = stepConfig[currentStep];

  // Count fields by type
  const fieldCounts = blocks.reduce((acc, block) => {
    const type = block.fieldType || FIELD_TYPES.SIGNATURE;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative flex w-full max-h-[720px] flex-col items-center gap-3 overflow-auto rounded-lg bg-slate-100/70 p-3">
      {config && (
        <div className="sticky top-1 z-10 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur
              ${config.bg} ${config.text}`}
          >
            <span>{config.icon}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            <span>{config.message}</span>
          </div>

          {/* Field counts badge */}
          {currentStep === 2 && blocks.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              {fieldCounts[FIELD_TYPES.SIGNATURE] > 0 && (
                <span className="text-emerald-600">
                  {fieldCounts[FIELD_TYPES.SIGNATURE]} Sig
                </span>
              )}
              {fieldCounts[FIELD_TYPES.TEXT] > 0 && (
                <span className="text-blue-600">
                  {fieldCounts[FIELD_TYPES.TEXT]} Name
                </span>
              )}
              {fieldCounts[FIELD_TYPES.DATE] > 0 && (
                <span className="text-amber-600">
                  {fieldCounts[FIELD_TYPES.DATE]} Date
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <Document
        file={pdfFile}
        onLoadSuccess={(doc) => setNumPages(doc.numPages)}
        className="flex flex-col gap-6"
        loading={
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          </div>
        }
      >
        {Array.from({ length: numPages }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-md bg-white shadow-md"
          >
            <SignPdf pageNumber={index + 1} />
          </div>
        ))}
      </Document>
    </div>
  );
}
