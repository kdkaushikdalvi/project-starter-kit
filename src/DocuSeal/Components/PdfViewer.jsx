import React, { useState } from "react";
import { Document, pdfjs } from "react-pdf";
import { useSignature, FIELD_TYPES } from "./SignatureContext";
import SignPdf from "./SignPdf";
import { PenTool, Edit3, Calendar } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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

export default function PdfViewer({ currentStep: propCurrentStep }) {
  const { pdfFile, currentStep: contextCurrentStep, blocks, activeFieldType, setActiveFieldType } = useSignature();
  const [numPages, setNumPages] = useState(0);

  const currentStep = propCurrentStep ?? contextCurrentStep;

  if (!pdfFile) return null;

  // Count fields by type
  const fieldCounts = blocks.reduce((acc, block) => {
    const type = block.fieldType || FIELD_TYPES.SIGNATURE;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const fieldTypes = [
    { type: FIELD_TYPES.SIGNATURE, label: "Signature", icon: <PenTool size={14} />, activeClass: "bg-emerald-500 text-white shadow-md", inactiveClass: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { type: FIELD_TYPES.INITIAL, label: "Initial", icon: <Edit3 size={14} />, activeClass: "bg-purple-500 text-white shadow-md", inactiveClass: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
    { type: FIELD_TYPES.DATE, label: "Date", icon: <Calendar size={14} />, activeClass: "bg-amber-500 text-white shadow-md", inactiveClass: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  ];

  return (
    <div className="relative flex w-full flex-col items-center gap-3">
      {/* Sticky field type selector - outside scroll */}
      {currentStep === 2 && (
        <div className="sticky top-0 z-20 flex items-center justify-center gap-3 rounded-lg bg-white/95 px-4 py-2 shadow-sm backdrop-blur w-full">
          <div className="flex items-center gap-2">
            {fieldTypes.map(({ type, label, icon, activeClass, inactiveClass }) => (
              <button
                key={type}
                onClick={() => setActiveFieldType(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${activeFieldType === type ? activeClass : inactiveClass}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          
          {/* Field counts */}
          {blocks.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
              {fieldCounts[FIELD_TYPES.SIGNATURE] > 0 && (
                <span className="text-emerald-600">{fieldCounts[FIELD_TYPES.SIGNATURE]} Sig</span>
              )}
              {fieldCounts[FIELD_TYPES.INITIAL] > 0 && (
                <span className="text-purple-600">{fieldCounts[FIELD_TYPES.INITIAL]} Init</span>
              )}
              {fieldCounts[FIELD_TYPES.DATE] > 0 && (
                <span className="text-amber-600">{fieldCounts[FIELD_TYPES.DATE]} Date</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scrollable PDF container */}
      <div className="w-full max-h-[680px] overflow-auto rounded-lg bg-slate-100/70 p-3">
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
    </div>
  );
}
