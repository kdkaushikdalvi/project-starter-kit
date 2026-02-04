import { PenTool, User, Calendar } from "lucide-react";
import { useSignature, FIELD_TYPES } from "./SignatureContext";

const fieldTypes = [
  {
    type: FIELD_TYPES.SIGNATURE,
    label: "Signature",
    icon: PenTool,
    color: "emerald",
    description: "Draw or type signature",
  },
  {
    type: FIELD_TYPES.TEXT,
    label: "Full Name",
    icon: User,
    color: "blue",
    description: "Auto-filled signer name",
  },
  {
    type: FIELD_TYPES.DATE,
    label: "Date",
    icon: Calendar,
    color: "amber",
    description: "Auto-captured date",
  },
];

export default function FieldTypeSelector() {
  const { activeFieldType, setActiveFieldType, currentStep } = useSignature();

  if (currentStep !== 2) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs font-semibold text-slate-500 mr-2">Add Field:</span>
      {fieldTypes.map(({ type, label, icon: Icon, color }) => {
        const isActive = activeFieldType === type;
        const colorClasses = {
          emerald: isActive
            ? "bg-emerald-500 text-white border-emerald-500"
            : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50",
          blue: isActive
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50",
          amber: isActive
            ? "bg-amber-500 text-white border-amber-500"
            : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50",
        };

        return (
          <button
            key={type}
            onClick={() => setActiveFieldType(type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all
              ${colorClasses[color]}`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
