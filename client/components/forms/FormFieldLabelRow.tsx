"use client";

import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { FieldHelpHint } from "./FieldHelpHint";

type FormFieldLabelRowProps = {
  label: string;
  helpText?: string;
  className?: string;
  lightLabelText?: string;
};

/** Keeps label + optional help icon on one line with stable height across field types. */
export function FormFieldLabelRow({
  label,
  helpText,
  className,
  lightLabelText,
}: FormFieldLabelRowProps) {
  return (
    <div className={cn("flex min-h-5 items-center gap-1.5", className)}>
      <FormLabel className="mb-0 leading-none">
        {label}
        {lightLabelText ? (
          <span className="ml-1 font-normal text-muted-foreground">
            {lightLabelText}
          </span>
        ) : null}
      </FormLabel>
      {helpText ? (
        <FieldHelpHint text={helpText} />
      ) : (
        <span className="size-3.5 shrink-0" aria-hidden />
      )}
    </div>
  );
}
