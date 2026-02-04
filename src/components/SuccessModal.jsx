import { CheckCircle2, X } from "lucide-react";

export default function SuccessModal({ open, title, message, onAction }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl text-center animate-in fade-in zoom-in-95">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <button
          onClick={onAction}
          className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Done
        </button>
      </div>
    </div>
  );
}
