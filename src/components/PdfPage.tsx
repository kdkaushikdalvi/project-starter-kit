import React, { useRef, useState } from "react";
import { Page } from "react-pdf";
import { Rnd } from "react-rnd";
import SignatureCanvas from "react-signature-canvas";
import { useSignature } from "../context/SignatureContext";
import { X, PenTool, Type, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PdfPageProps {
  pageNumber: number;
}

interface DraftBlock {
  startX: number;
  startY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PdfPage({ pageNumber }: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { blocks, setBlocks, currentStep, signatures, setSignatures } =
    useSignature();

  const [draft, setDraft] = useState<DraftBlock | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const pageBlocks = blocks.filter((b) => b.pageNumber === pageNumber);

  function getRelativePoint(e: React.MouseEvent): { x: number; y: number } {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const handleDrawSign = () => {
    if (
      signaturePadRef.current &&
      !signaturePadRef.current.isEmpty() &&
      activeBlockId
    ) {
      const dataUrl = signaturePadRef.current.toDataURL();
      setSignatures((prev) => ({ ...prev, [activeBlockId]: dataUrl }));
      resetModalState();
    }
  };

  const handleTypeSign = () => {
    if (!typedSignature.trim() || !activeBlockId) return;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.font = 'italic 48px "Brush Script MT", cursive, serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      setSignatures((prev) => ({
        ...prev,
        [activeBlockId]: canvas.toDataURL(),
      }));
      resetModalState();
    }
  };

  const handleUploadSign = () => {
    if (uploadedImage && activeBlockId) {
      setSignatures((prev) => ({ ...prev, [activeBlockId]: uploadedImage }));
      resetModalState();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetModalState = () => {
    setTypedSignature("");
    setUploadedImage(null);
    signaturePadRef.current?.clear();
    setActiveBlockId(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-card ${
        currentStep === 2 ? "cursor-crosshair" : "cursor-default"
      }`}
      onMouseDown={(e) => {
        if (currentStep !== 2) return;
        if ((e.target as HTMLElement).closest(".react-draggable")) return;

        const p = getRelativePoint(e);
        setDraft({
          startX: p.x,
          startY: p.y,
          x: p.x,
          y: p.y,
          width: 0,
          height: 0,
        });
      }}
      onMouseMove={(e) => {
        if (!draft) return;
        const p = getRelativePoint(e);
        setDraft({
          ...draft,
          x: Math.min(p.x, draft.startX),
          y: Math.min(p.y, draft.startY),
          width: Math.abs(p.x - draft.startX),
          height: Math.abs(p.y - draft.startY),
        });
      }}
      onMouseUp={() => {
        if (!draft || draft.width < 20 || draft.height < 20) {
          setDraft(null);
          return;
        }

        setBlocks((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            pageNumber,
            x: draft.x,
            y: draft.y,
            width: draft.width,
            height: draft.height,
          },
        ]);
        setDraft(null);
      }}
    >
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        className="max-w-full h-auto"
      />

      {draft && (
        <div
          className="absolute z-10 border-2 border-primary bg-primary/10"
          style={{
            left: draft.x,
            top: draft.y,
            width: draft.width,
            height: draft.height,
          }}
        />
      )}

      {pageBlocks.map((block) => (
        <Rnd
          key={block.id}
          disableDragging={currentStep !== 2}
          enableResizing={currentStep === 2}
          bounds="parent"
          size={{ width: block.width, height: block.height }}
          position={{ x: block.x, y: block.y }}
          onDragStop={(e, d) => {
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id ? { ...b, x: d.x, y: d.y } : b,
              ),
            );
          }}
          onResizeStop={(e, dir, ref, delta, pos) => {
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id
                  ? {
                      ...b,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      x: pos.x,
                      y: pos.y,
                    }
                  : b,
              ),
            );
          }}
          className={`group z-20 flex items-center justify-center overflow-hidden signature-block ${
            currentStep === 2
              ? "signature-block-prepare"
              : signatures[block.id]
                ? "border-transparent bg-transparent"
                : "signature-block-sign"
          }`}
          onClick={() => {
            if (currentStep === 4 && !signatures[block.id]) {
              setActiveBlockId(block.id);
            }
          }}
        >
          {currentStep === 2 && (
            <div className="absolute -top-3 -right-3 hidden group-hover:flex">
              <button
                onClick={() =>
                  setBlocks((prev) => prev.filter((b) => b.id !== block.id))
                }
                className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {signatures[block.id] ? (
            <img
              src={signatures[block.id]}
              alt="Signature"
              className="h-full w-full object-contain pointer-events-none"
            />
          ) : (
            <span className="select-none px-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {currentStep === 2 ? "Signature Area" : "Click to Sign"}
            </span>
          )}
        </Rnd>
      ))}

      {activeBlockId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Sign Document
              </h3>
              <button
                onClick={resetModalState}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <Tabs defaultValue="draw" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="draw" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Draw
                </TabsTrigger>
                <TabsTrigger value="type" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Type
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="mt-4">
                <div className="mb-6 overflow-hidden rounded-xl border-2 border-border bg-card">
                  <SignatureCanvas
                    ref={signaturePadRef}
                    penColor="black"
                    canvasProps={{
                      className: "h-48 w-full cursor-crosshair bg-white",
                    }}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => signaturePadRef.current?.clear()}
                    className="btn-ghost"
                  >
                    Clear
                  </button>
                  <button onClick={handleDrawSign} className="btn-primary">
                    Apply Signature
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="type" className="mt-4">
                <div className="mb-6">
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your signature..."
                    className="w-full rounded-xl border-2 border-border bg-card px-4 py-4 text-center text-2xl italic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{
                      fontFamily: '"Brush Script MT", cursive, serif',
                    }}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setTypedSignature("")}
                    className="btn-ghost"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleTypeSign}
                    disabled={!typedSignature.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Signature
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <div className="mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {!uploadedImage ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="dropzone dropzone-idle w-full"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="mt-3 text-sm font-medium text-muted-foreground">
                        Click to upload signature image
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground/70">
                        PNG, JPG, or GIF
                      </span>
                    </button>
                  ) : (
                    <div className="rounded-xl border-2 border-border bg-card p-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded signature"
                        className="mx-auto max-h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="btn-ghost"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleUploadSign}
                    disabled={!uploadedImage}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Signature
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
