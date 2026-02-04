import React, { useState, useEffect } from "react";
import { useSignature } from "../DocuSeal/Components/SignatureContext";
import { FilePicker } from "../components/FilePicker";
import PdfViewer from "../DocuSeal/Components/PdfViewer";
import { PDFDocument } from "pdf-lib";
import { PenLine, ArrowRight, Check, Download, Mail, MousePointer } from "lucide-react";
import { toast } from "react-toastify";
import * as services from "../DocuSeal/API/DocuSealServices";

const submitSignedDocument =
  services.submitSignedDocument ?? services.default?.submitSignedDocument;
const getDocumentsByUserId =
  services.getDocumentsByUserId ?? services.default?.getDocumentsByUserId;

export default function Home() {
  const { pdfFile, setPdfFile, currentStep, setCurrentStep, blocks, signatures } = useSignature();

  const [email, setEmail] = useState("");
  const [userDocuments, setUserDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const userId = "user-123"; // Replace with actual user ID
        const documents = await getDocumentsByUserId(userId);
        setUserDocuments(documents);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleFileSelect = (file) => setPdfFile(file);
  const handleFileClear = () => setPdfFile(null);

  const nextStep = () => pdfFile && setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const downloadSignedPdf = async () => {
    if (!pdfFile || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      for (const block of blocks) {
        const signatureDataUrl = signatures[block.id];
        if (!signatureDataUrl) continue;

        const page = pages[block.pageNumber - 1];
        const { width, height } = page.getSize();

        const signatureImageBytes = await fetch(signatureDataUrl).then((r) => r.arrayBuffer());
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

        const scale = width / 612;

        page.drawImage(signatureImage, {
          x: block.x * scale,
          y: height - (block.y + block.height) * scale,
          width: block.width * scale,
          height: block.height * scale,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

      // Submit to API
      await submitSignedDocument({
        userId: "user-123", // Replace with actual user ID
        fileName: pdfFile.name,
        pdfData: base64Pdf,
        signedAt: new Date().toISOString(),
      });

      toast.success("Document submitted successfully!");

      // Download the signed PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${pdfFile.name}`;
      link.click();
    } catch (error) {
      console.error("Failed to submit document:", error);
      toast.error("Failed to submit document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allBlocksSigned = blocks.length > 0 && blocks.every((b) => signatures[b.id]);

  const steps = [
    { step: 1, label: "Upload" },
    { step: 2, label: "Prepare" },
    { step: 3, label: "Submission" },
    { step: 4, label: "Sign" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <PenLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">PDFSign</span>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 ${currentStep >= s.step ? "text-slate-900" : "text-slate-400"}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      currentStep >= s.step ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                    }`}
                  >
                    {currentStep > s.step ? <Check className="h-3 w-3" strokeWidth={3} /> : s.step}
                  </span>
                  {s.label}
                </div>
                {i < 3 && <div className="h-px w-6 bg-slate-200" />}
              </div>
            ))}
          </div>

          {/* Download */}
          {currentStep === 4 && (
            <button
              disabled={!allBlocksSigned}
              onClick={downloadSignedPdf}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                allBlocksSigned
                  ? "bg-violet-600 text-white hover:bg-violet-500 shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Download className="h-4 w-4" />
              Save & Download
            </button>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl p-6">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="mx-auto mt-20 max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Sign your PDF</h1>
              <p className="mt-3 text-slate-500">Upload the document you want to sign.</p>
            </div>

            <FilePicker selectedFile={pdfFile} onFileSelect={handleFileSelect} onFileClear={handleFileClear} />

            {pdfFile && (
              <button
                onClick={nextStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Continue to Prepare
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Prepare Document</h2>
                <p className="text-sm text-slate-500">Draw rectangles for signatures.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="text-sm text-slate-500 hover:text-slate-900">
                  Back
                </button>
                <button
                  disabled={!blocks.length}
                  onClick={nextStep}
                  className={`rounded-lg px-6 py-2 text-sm font-bold ${
                    blocks.length
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <PdfViewer />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="mx-auto mt-12 max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Ready to Sign</h2>
              <p className="mt-2 text-slate-500">Choose how you'd like to proceed.</p>
            </div>

            <button
              onClick={nextStep}
              className="w-full rounded-xl border-2 border-indigo-600 bg-white p-6 hover:bg-indigo-50"
            >
              <div className="flex flex-col items-center gap-2">
                <MousePointer className="h-6 w-6 text-indigo-600" />
                <span className="text-lg font-bold">Sign Now</span>
                <span className="text-sm text-slate-500">Continue in browser</span>
              </div>
            </button>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <Mail className="h-5 w-5" />
                Send via Email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button
                disabled={!email.trim()}
                className={`w-full rounded-lg py-3 text-sm font-semibold ${
                  email.trim()
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-indigo-300 text-white cursor-not-allowed"
                }`}
              >
                Send Link
              </button>
            </div>

            <button onClick={prevStep} className="w-full text-center text-sm text-slate-500 hover:text-slate-900">
              Back to Prepare
            </button>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Sign Document</h2>
                <p className="text-sm text-slate-500">Click on the fields to sign.</p>
              </div>
              <button onClick={prevStep} className="text-sm text-slate-500 hover:text-slate-900">
                Back
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <PdfViewer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
