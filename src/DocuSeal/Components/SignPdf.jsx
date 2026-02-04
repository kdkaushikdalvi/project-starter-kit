import { useRef, useState } from "react";
import { Page } from "react-pdf";
import { Rnd } from "react-rnd";
import SignatureCanvas from "react-signature-canvas";
import { useSignature, FIELD_TYPES } from "./SignatureContext";
import { X, PenTool, Type, Upload, Calendar, Edit3 } from "lucide-react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Field type configurations
const fieldConfig = {
  [FIELD_TYPES.SIGNATURE]: {
    label: "Signature",
    icon: PenTool,
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-50/50",
    textColor: "text-emerald-600",
    dashedBg: "bg-emerald-50/30",
  },
  [FIELD_TYPES.INITIAL]: {
    label: "Initial",
    icon: Edit3,
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50/50",
    textColor: "text-purple-600",
    dashedBg: "bg-purple-50/30",
  },
  [FIELD_TYPES.DATE]: {
    label: "Date",
    icon: Calendar,
    borderColor: "border-amber-500",
    bgColor: "bg-amber-50/50",
    textColor: "text-amber-600",
    dashedBg: "bg-amber-50/30",
  },
};

export default function SignPdf({ pageNumber }) {
  const containerRef = useRef(null);
  const signaturePadRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    blocks,
    setBlocks,
    currentStep,
    signatures,
    setSignatures,
    activeFieldType,
    signerName,
  } = useSignature();

  const [draft, setDraft] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("draw");

  const pageBlocks = blocks.filter((b) => b.pageNumber === pageNumber);

  function getRelativePoint(e) {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const resetModalState = () => {
    setTypedSignature("");
    setUploadedImage(null);
    signaturePadRef.current?.clear();
    setActiveBlockId(null);
    setActiveTab("draw");
  };

  const handleDrawSign = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return;
    setSignatures((prev) => ({
      ...prev,
      [activeBlockId]: signaturePadRef.current.toDataURL(),
    }));
    resetModalState();
  };

  const handleTypeSign = () => {
    if (!typedSignature.trim()) return;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.font = 'italic 48px "Brush Script MT", cursive';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

    setSignatures((prev) => ({
      ...prev,
      [activeBlockId]: canvas.toDataURL(),
    }));

    resetModalState();
  };

  const handleUploadSign = () => {
    if (!uploadedImage) return;
    setSignatures((prev) => ({
      ...prev,
      [activeBlockId]: uploadedImage,
    }));
    resetModalState();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Handle field click for signing
  const handleBlockClick = (block) => {
    if (currentStep !== 4) return;
    if (signatures[block.id]) return;

    if (block.fieldType === FIELD_TYPES.DATE) {
      // Auto-fill with current date
      const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setSignatures((prev) => ({
        ...prev,
        [block.id]: today,
      }));
    } else {
      // Signature or Initial - open modal
      setActiveBlockId(block.id);
    }
  };

  // Get default size based on field type
  const getDefaultSize = (fieldType) => {
    switch (fieldType) {
      case FIELD_TYPES.INITIAL:
        return { width: 80, height: 50 };
      case FIELD_TYPES.DATE:
        return { width: 120, height: 30 };
      default:
        return { width: 150, height: 60 };
    }
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-white rounded-xl shadow-sm overflow-hidden",
        currentStep === 2 ? "cursor-crosshair" : "cursor-default",
      )}
      onMouseDown={(e) => {
        if (currentStep !== 2 || e.target.closest(".react-draggable")) return;
        const p = getRelativePoint(e);
        setDraft({
          startX: p.x,
          startY: p.y,
          x: p.x,
          y: p.y,
          width: 0,
          height: 0,
          fieldType: activeFieldType,
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
        if (!draft) {
          setDraft(null);
          return;
        }

        const defaultSize = getDefaultSize(draft.fieldType);
        const width = draft.width < 20 ? defaultSize.width : draft.width;
        const height = draft.height < 20 ? defaultSize.height : draft.height;

        setBlocks((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            pageNumber,
            x: draft.x,
            y: draft.y,
            width,
            height,
            fieldType: draft.fieldType,
            required: true,
          },
        ]);
        setDraft(null);
      }}
    >
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />

      {draft && (
        <div
          className={cn(
            "absolute z-10 rounded-md border-2",
            fieldConfig[draft.fieldType]?.borderColor || "border-sky-500",
            fieldConfig[draft.fieldType]?.bgColor || "bg-sky-500/10",
          )}
          style={{
            left: draft.x,
            top: draft.y,
            width: Math.max(draft.width, 20),
            height: Math.max(draft.height, 20),
          }}
        />
      )}

      {pageBlocks.map((block) => {
        const config = fieldConfig[block.fieldType] || fieldConfig[FIELD_TYPES.SIGNATURE];
        const Icon = config.icon;
        const isSigned = !!signatures[block.id];

        return (
          <Rnd
            key={block.id}
            bounds="parent"
            disableDragging={currentStep !== 2}
            enableResizing={currentStep === 2}
            size={{ width: block.width, height: block.height }}
            position={{ x: block.x, y: block.y }}
            onDragStop={(e, d) =>
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id ? { ...b, x: d.x, y: d.y } : b,
                ),
              )
            }
            onResizeStop={(e, dir, ref, delta, pos) =>
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
              )
            }
            className={cn(
              "group relative z-20 rounded-lg transition-all",
              currentStep === 2
                ? `border-2 ${config.borderColor} ${config.bgColor}`
                : isSigned
                  ? "border border-slate-200 bg-white"
                  : `border-2 border-dashed ${config.borderColor} ${config.dashedBg} hover:opacity-80 cursor-pointer`,
            )}
            onClick={() => handleBlockClick(block)}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            {currentStep === 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBlocks((prev) => prev.filter((b) => b.id !== block.id));
                }}
                className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center
                  rounded-full border border-red-200 bg-white text-red-500 shadow-sm
                  hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isSigned ? (
              block.fieldType === FIELD_TYPES.SIGNATURE || block.fieldType === FIELD_TYPES.INITIAL ? (
                <img
                  src={signatures[block.id]}
                  alt={block.fieldType === FIELD_TYPES.INITIAL ? "Initial" : "Signature"}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2">
                  <span className={cn("text-sm font-semibold", config.textColor)}>
                    {signatures[block.id]}
                  </span>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                <Icon size={14} className={config.textColor} />
                <span
                  className={cn(
                    "pointer-events-none select-none text-xs font-semibold",
                    currentStep === 2 ? config.textColor : "text-red-600",
                  )}
                >
                  {currentStep === 2 ? config.label : `Click to add ${config.label.toLowerCase()}`}
                </span>
              </div>
            )}
          </Rnd>
        );
      })}

      {activeBlockId && (activeBlock?.fieldType === FIELD_TYPES.SIGNATURE || activeBlock?.fieldType === FIELD_TYPES.INITIAL) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">
                {activeBlock?.fieldType === FIELD_TYPES.INITIAL ? "Add your initials" : "Add your signature"}
              </h3>
              <button onClick={resetModalState}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab}>
              <TabsPrimitive.List className="flex gap-2 mb-5">
                {[
                  { id: "draw", label: "Draw", icon: PenTool },
                  { id: "type", label: "Type", icon: Type },
                  { id: "upload", label: "Upload", icon: Upload },
                ].map(({ id, label, icon: Icon }) => (
                  <TabsPrimitive.Trigger
                    key={id}
                    value={id}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                      text-slate-500 hover:bg-slate-100
                      data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </TabsPrimitive.Trigger>
                ))}
              </TabsPrimitive.List>

              <TabsPrimitive.Content value="draw">
                <div className="mb-4 rounded-lg border border-slate-200 shadow-inner">
                  <SignatureCanvas
                    ref={signaturePadRef}
                    penColor="black"
                    canvasProps={{ className: "h-44 w-full bg-white" }}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="text-sm text-slate-500"
                    onClick={() => signaturePadRef.current?.clear()}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleDrawSign}
                    className="rounded-lg bg-sky-500 px-6 py-2 text-sm text-white hover:bg-sky-600"
                  >
                    Apply
                  </button>
                </div>
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="type">
                <input
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your signature"
                  className="mb-4 w-full rounded-lg border border-slate-300 py-4 text-center text-2xl italic"
                  style={{ fontFamily: '"Brush Script MT", cursive' }}
                />
                <div className="flex justify-end gap-3">
                  <button
                    className="text-sm text-slate-500"
                    onClick={() => setTypedSignature("")}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleTypeSign}
                    disabled={!typedSignature.trim()}
                    className="rounded-lg bg-sky-500 px-6 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
                {!uploadedImage ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border border-dashed border-slate-300 p-8 text-slate-500 hover:bg-slate-50"
                  >
                    Upload signature image
                  </button>
                ) : (
                  <img src={uploadedImage} className="mx-auto mb-4 max-h-32" alt="Uploaded signature" />
                )}
                <div className="flex justify-end gap-3">
                  <button
                    className="text-sm text-slate-500"
                    onClick={() => setUploadedImage(null)}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleUploadSign}
                    disabled={!uploadedImage}
                    className="rounded-lg bg-sky-500 px-6 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </TabsPrimitive.Content>
            </TabsPrimitive.Root>
          </div>
        </div>
      )}
    </div>
  );
}
