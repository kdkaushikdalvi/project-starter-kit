import React, { useState } from "react";
import { useSignature } from "../context/SignatureContext";
import { FilePicker } from "../components/FilePicker";
import PdfViewer from "../components/PdfViewer";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { submitSignedDocument } from "../api/services";
import {
  PenLine,
  ArrowRight,
  Check,
  Download,
  Mail,
  MousePointer,
  Loader2,
} from "lucide-react";

export default function Home() {
  const {
    pdfFile,
    setPdfFile,
    currentStep,
    setCurrentStep,
    blocks,
    signatures,
  } = useSignature();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (file) => setPdfFile(file);
  const handleFileClear = () => setPdfFile(null);

  const nextStep = () => pdfFile && setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const downloadSignedPdf = async () => {
    if (!pdfFile) return;

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

        const signatureImageBytes = await fetch(signatureDataUrl).then((r) =>
          r.arrayBuffer(),
        );
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
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Create document ID
      const documentId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Prepare API payload
      const payload = {
        document: {
          id: documentId,
          user_id: userId,
          name: pdfFile.name,
          file_url: url,
          num_pages: pages.length,
          status: "signed",
          submission_type: "browser",
          recipient_email: email || "",
          created_at: now,
          updated_at: now,
          signed_at: now,
          signed_file_url: url,
        },
        signatureField: {
          id: crypto.randomUUID(),
          document_id: documentId,
          signer_id: userId,
          page_number: blocks[0]?.pageNumber || 1,
          x: blocks[0]?.x || 0,
          y: blocks[0]?.y || 0,
          width: blocks[0]?.width || 0,
          height: blocks[0]?.height || 0,
          is_signed: true,
          signature_type: "drawn",
          signature_url: signatures[blocks[0]?.id] || "",
          signed_at: now,
        },
      };

      // Submit to API
      await submitSignedDocument(payload);
      toast.success("Document signed and submitted successfully!");

      // Download the file
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${pdfFile.name}`;
      link.click();
    } catch (error) {
      console.error("Error submitting document:", error);
      toast.error("Failed to submit document. Download will still proceed.");
      
      // Still allow download even if API fails
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${pdfFile.name}`;
      link.click();
    } finally {
      setIsSubmitting(false);
    }
  };

  const allBlocksSigned =
    blocks.length > 0 && blocks.every((b) => signatures[b.id]);

  const steps = [
    { step: 1, label: "Upload" },
    { step: 2, label: "Prepare" },
    { step: 3, label: "Submission" },
    { step: 4, label: "Sign" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PenLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">PDFSign</span>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= s.step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      currentStep >= s.step
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {currentStep > s.step ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      s.step
                    )}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 3 && <div className="h-px w-6 bg-border" />}
              </div>
            ))}
          </div>

          {/* Download */}
          {currentStep === 4 && (
            <button
              disabled={!allBlocksSigned || isSubmitting}
              onClick={downloadSignedPdf}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                allBlocksSigned && !isSubmitting
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Save & Download"}
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
              <p className="mt-3 text-muted-foreground">
                Upload the document you want to sign.
              </p>
            </div>

            <FilePicker
              selectedFile={pdfFile}
              onFileSelect={handleFileSelect}
              onFileClear={handleFileClear}
            />

            {pdfFile && (
              <button
                onClick={nextStep}
                className="btn-primary w-full flex items-center justify-center gap-2"
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
                <p className="text-sm text-muted-foreground">
                  Draw rectangles for signatures.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="btn-ghost">
                  Back
                </button>
                <button
                  disabled={!blocks.length}
                  onClick={nextStep}
                  className={`btn-primary ${
                    !blocks.length && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>

            <div className="card-elevated p-8">
              <PdfViewer />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="mx-auto mt-12 max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Ready to Sign</h2>
              <p className="mt-2 text-muted-foreground">
                Choose how you'd like to proceed.
              </p>
            </div>

            <button
              onClick={nextStep}
              className="w-full rounded-xl border-2 border-primary bg-card p-6 hover:bg-accent transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <MousePointer className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Sign Now</span>
                <span className="text-sm text-muted-foreground">
                  Continue in browser
                </span>
              </div>
            </button>

            <div className="card-elevated p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <Mail className="h-5 w-5" />
                Send via Email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              />
              <button
                disabled={!email.trim()}
                className={`w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
                  email.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-primary/30 text-primary-foreground/70 cursor-not-allowed"
                }`}
              >
                Send Link
              </button>
            </div>

            <button
              onClick={prevStep}
              className="w-full text-center btn-ghost"
            >
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
                <p className="text-sm text-muted-foreground">
                  Click on the fields to sign.
                </p>
              </div>
              <button onClick={prevStep} className="btn-ghost">
                Back
              </button>
            </div>

            <div className="card-elevated p-8">
              <PdfViewer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
