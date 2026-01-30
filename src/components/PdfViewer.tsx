import React, { useState } from "react";
import { Document, pdfjs } from "react-pdf";
import { useSignature } from "../context/SignatureContext";
import PdfPage from "./PdfPage";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

if (typeof Promise !== "undefined" && !("withResolvers" in Promise)) {
  (Promise as any).withResolvers = function () {
    let resolve: any;
    let reject: any;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export default function PdfViewer() {
  const { pdfFile } = useSignature();
  const [numPages, setNumPages] = useState(0);

  if (!pdfFile) return null;

  return (
    <div className="flex w-full max-h-[800px] flex-col items-center overflow-auto rounded-xl bg-muted p-4">
      <Document
        file={pdfFile}
        onLoadSuccess={(doc) => setNumPages(doc.numPages)}
        className="flex flex-col gap-8"
        loading={
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
          </div>
        }
      >
        {Array.from({ length: numPages }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg shadow-2xl bg-card"
          >
            <PdfPage pageNumber={i + 1} />
          </div>
        ))}
      </Document>
    </div>
  );
}
