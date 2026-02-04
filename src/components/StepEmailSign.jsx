import { ArrowRight, Mail, PenLine, SendHorizontal } from "lucide-react";

export default function StepEmailSign({
  email,
  setEmail,
  onSignNow,
  onSendMail,
}) {
  return (
    <div className="mx-auto max-w-md space-y-8 font-sans">
      <button
        onClick={onSignNow}
        className="group relative w-full overflow-hidden rounded-[2.2rem]
          p-[1.5px] transition-all duration-300
          hover:scale-[1.015] active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 opacity-80 blur-sm" />

        <div
          className="relative flex items-center justify-between rounded-[2.1rem]
          bg-white px-8 py-6 shadow-lg shadow-sky-500/10"
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl
                bg-gradient-to-br from-sky-500 to-cyan-500
                text-white shadow-md"
            >
              <PenLine size={22} />
            </div>

            <div className="text-left">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Sign Now
              </h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Instant • Secure
              </p>
            </div>
          </div>

          <ArrowRight
            size={22}
            className="text-sky-400 transition-transform duration-300
              group-hover:translate-x-1.5"
          />
        </div>
      </button>

      <div className="relative flex items-center gap-4 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">
          Or
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
      <div
        className="rounded-[2.5rem] border border-white/40
          bg-white/70 backdrop-blur-xl p-8 space-y-6
          shadow-xl shadow-slate-200/50"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl
              bg-sky-100 text-sky-600"
          >
            <Mail size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-slate-800">Send via Email</h3>
            <p className="text-xs text-slate-400">
              Recipient can sign from anywhere
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-2xl bg-white px-5 py-4
              text-sm font-medium text-slate-900
              ring-1 ring-slate-200 transition-all
              placeholder:text-slate-400
              focus:ring-2 focus:ring-sky-400
              focus:shadow-lg focus:shadow-sky-500/10
              outline-none"
          />
          {!email && (
            <p className="pl-1 text-[11px] text-slate-400">
              We'll send a secure signing link
            </p>
          )}
        </div>

        <button
          disabled={!email}
          onClick={onSendMail}
          className={`group flex w-full items-center justify-center gap-2
            rounded-2xl py-4 text-sm font-extrabold tracking-wide
            transition-all duration-300 active:scale-[0.97]
            ${
              email
                ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:brightness-110"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          <span>Send Secure Link</span>
          <SendHorizontal
            size={16}
            className={`transition-transform duration-300 ${
              email
                ? "group-hover:translate-x-1 group-hover:-translate-y-0.5"
                : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
