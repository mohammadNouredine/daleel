"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SelectControl } from "@/components/select/SelectControl";
import type { SelectControlProps } from "@/components/select/types";
import { useFormContext } from "react-hook-form";
import { FormFieldLabelRow } from "./FormFieldLabelRow";

export type SelectInputProps = SelectControlProps & {
  name: string;
};

export function SelectInput({
  name,
  label,
  placeholder = "Select…",
  description,
  helpText,
  lightLabelText,
  options,
  disabled = false,
  displayValue,
  clearable,
  clearValue,
  hint,
  className,
}: SelectInputProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label ? (
            <FormFieldLabelRow
              label={label}
              helpText={helpText}
              lightLabelText={lightLabelText}
            />
          ) : null}
          <FormControl>
            <SelectControl
              placeholder={placeholder}
              hint={hint}
              options={options}
              disabled={disabled}
              displayValue={displayValue}
              clearable={clearable}
              clearValue={clearValue}
              value={(field.value as string | undefined) ?? ""}
              onValueChange={field.onChange}
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
