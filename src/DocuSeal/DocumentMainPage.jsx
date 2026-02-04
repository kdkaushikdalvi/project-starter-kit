import React, { useState } from "react";
import { useSignature } from "./Components/SignatureContext";
import { submitDocument, sendMailLink } from "./API/DocuSealServices";
import { generateEmailTemplate } from "./Components/EmailTemplates";
import { toast } from "react-toastify";

import DocumentList from "./Components/DocumentList";
import { UploadPdf } from "./Components/UploadPdf";
import PdfViewer from "./Components/PdfViewer";
import StepProgress from "./Components/StepProgress";
import StepEmailSign from "./Components/StepEmailSign";
import PdfViewerModal from "./Components/PdfViewerModal";
import Loader from "./Components/Loader";
import SuccessModal from "./Components/SuccessModal";

export default function DocumentMainPage() {
  const {
    pdfFile,
    setPdfFile,
    blocks,
    setBlocks,
    currentStep,
    setCurrentStep,
    signatures,
    setSignatures,
  } = useSignature();

  const [email, setEmail] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const nextStep = () => setCurrentStep((s) => s + 1);
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const resetFlow = () => {
    setPdfFile(null);
    setBlocks([]);
    setSignatures({});
    setEmail("");
    setReferenceNumber("");
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!pdfFile || !blocks.length || !email) return;

    try {
      setLoading(true);

      // Build fields for DocuSeal
      const fields = blocks.map((block, i) => ({
        name: `field_${i + 1}`,
        type: block.fieldType || "signature",
        required: true,
        areas: [
          {
            page: block.pageNumber - 1,
            x: block.x / 612,
            y: block.y / 792,
            w: block.width / 612,
            h: block.height / 792,
          },
        ],
      }));

      const result = await submitDocument({
        file: pdfFile,
        fields,
        email,
        referenceNumber,
      });

      // Send email with signing link
      if (result?.submitters?.[0]?.embed_src) {
        const signUrl = result.submitters[0].embed_src;
        const emailContent = generateEmailTemplate(signUrl);
        await sendMailLink({ to: email, token: emailContent });
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetFlow();
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Step 0: Document List */}
      {currentStep === 1 && !pdfFile && (
        <DocumentList nextStep={nextStep} />
      )}

      {/* Steps 1-4: Signing Flow */}
      {(pdfFile || currentStep > 1) && (
        <div className="max-w-4xl mx-auto p-6">
          <StepProgress currentStep={currentStep} />

          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <UploadPdf
              selectedFile={pdfFile}
              onFileSelect={setPdfFile}
              onFileClear={() => setPdfFile(null)}
              referenceNumber={referenceNumber}
              onReferenceChange={setReferenceNumber}
            />
          )}

          {/* Step 2: Prepare fields */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Place Signature Fields</h2>
                <div className="flex gap-3">
                  <button onClick={prevStep} className="text-sm text-slate-500 hover:text-slate-900">
                    Back
                  </button>
                  <button
                    disabled={!blocks.length}
                    onClick={nextStep}
                    className={`rounded-lg px-6 py-2 text-sm font-bold ${
                      blocks.length
                        ? "bg-sky-500 text-white hover:bg-sky-600"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <PdfViewer />
              </div>
            </div>
          )}

          {/* Step 3: Email/Sign choice */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <button onClick={prevStep} className="text-sm text-slate-500 hover:text-slate-900">
                ← Back
              </button>
              <StepEmailSign
                email={email}
                setEmail={setEmail}
                onSignNow={nextStep}
                onSendMail={handleSubmit}
              />
            </div>
          )}

          {/* Step 4: Review & Sign */}
          <PdfViewerModal
            currentStep={currentStep}
            onClose={prevStep}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      <Loader show={loading} label="Submitting document..." />
      <SuccessModal show={showSuccess} />
    </div>
  );
}
