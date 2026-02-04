import { CheckCircle } from "lucide-react";

const SuccessModal = ({ open, title, message, onAction }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center
      bg-zinc-900/60 backdrop-blur-sm p-4"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8
        shadow-2xl animate-in fade-in zoom-in duration-300"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center
              rounded-full bg-emerald-100 text-emerald-600 animate-bounce"
          >
            <CheckCircle size={44} strokeWidth={2.5} />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-zinc-900">{title}</h3>

          <p className="mb-8 text-sm leading-relaxed text-zinc-500">
            {message}
          </p>

          <button
            onClick={onAction}
            className="flex w-full items-center justify-center gap-2
              rounded-xl bg-sky-500 py-3.5 text-md font-semibold text-white
              transition-all hover:bg-sky-600 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
