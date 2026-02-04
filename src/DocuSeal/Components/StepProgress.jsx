import { Check } from "lucide-react";

const steps = [
  { id: 0, label: "Upload" },
  { id: 1, label: "Prepare" },
  { id: 2, label: "Email" },
  { id: 3, label: "Sign" },
];

export default function StepProgress({ currentStep, onStepClick }) {
  return (
    <div className="flex items-center gap-6">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <button
              disabled={!isClickable}
              onClick={() => onStepClick(step.id)}
              className={`
                flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition
                ${
                  isActive &&
                  "bg-sky-500 border-sky-500 text-white hover:bg-sky-600"
                }
                ${isCompleted && "bg-emerald-500 border-emerald-500 text-white"}
                ${
                  !isActive &&
                  !isCompleted &&
                  "border-slate-300 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              {isCompleted ? <Check size={16} /> : step.id + 1}
            </button>

            <span
              className={`text-sm font-medium
                ${isActive && "text-sky-500"}
                ${isCompleted && "text-emerald-600"}
                ${!isActive && !isCompleted && "text-slate-400"}
              `}
            >
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <div
                className={`h-[2px] w-3
                  ${currentStep > step.id ? "bg-emerald-400" : "bg-slate-200"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
