"use client";

import { useState } from "react";
import { Building2, Radio, Target, Link2, ChevronRight, Check } from "lucide-react";

const STEPS = ["Company", "Brand", "Goals"] as const;

type Field = {
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  required?: boolean;
};

const FIELDS: Field[] = [
  { label: "Company name", placeholder: "Acme Corp", icon: Building2, required: true },
  { label: "Industry sector", placeholder: "B2B SaaS / FinTech", icon: Radio, required: true },
  { label: "Target customer persona", placeholder: "Startup founders, operations leads, tech operators", icon: Target, required: true },
  { label: "Website URL", placeholder: "https://acme.com", icon: Link2 },
];

export function ProductionSuiteSetup() {
  const [step] = useState(0);

  return (
    // Center the whole wizard in the viewport instead of letting it
    // stretch to the page edges. min-h-screen + flex + items/justify
    // center is the fix for "long filling the whole page."
    <div className="flex min-h-screen items-center justify-center bg-bay-charcoal p-6">
      <div className="w-full max-w-2xl rounded-md border border-bay-hairline bg-bay-panel p-8">
        <h1 className="text-2xl font-medium text-cue">Production suite setup</h1>
        <p className="mt-1 text-sm text-ash">Configure your brand voice and editorial parameters.</p>

        {/* Stepper: a single grouped row under the title, connected by
            a line, instead of three items pinned to left/center/right
            of the full page width. */}
        <div className="mt-8 flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                    i < step
                      ? "border-amber bg-amber text-bay-charcoal"
                      : i === step
                      ? "border-amber text-amber"
                      : "border-bay-hairline text-ash-dim"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-[11px] uppercase tracking-wide ${
                    i === step ? "text-amber" : "text-ash-dim"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-3 mb-4 h-px flex-1 bg-bay-hairline" />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="mt-8 flex flex-col gap-5">
          {FIELDS.map(({ label, placeholder, icon: Icon, required }) => (
            <label key={label} className="flex flex-col gap-1.5">
              <span className="text-xs text-ash">
                {label} {required && <span className="text-amber">*</span>}
              </span>
              <div className="relative">
                {/* Icon sits at left-3, so the input needs pl-10 (not
                    pl-3) to clear it — this is the fix for text
                    disappearing under the icon. */}
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash-dim">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder={placeholder}
                  className="h-11 w-full rounded-sm border border-bay-hairline bg-bay-charcoal pl-10 pr-3 text-sm text-cue placeholder:text-ash-dim focus:border-amber focus:outline-none"
                />
              </div>
            </label>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-1.5 rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-bay-charcoal">
            Continue
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductionSuiteSetup;
