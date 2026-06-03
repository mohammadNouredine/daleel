"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormFieldLabelRow } from "./FormFieldLabelRow";

type TextInputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  type?: React.ComponentProps<"input">["type"];
  description?: string;
  helpText?: string;
  min?: React.ComponentProps<"input">["min"];
  step?: React.ComponentProps<"input">["step"];
  lightLabelText?: string;
};

export function TextInput({
  name,
  label,
  placeholder,
  type = "text",
  description,
  helpText,
  min,
  step,
  lightLabelText,
}: TextInputProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? (
            <FormFieldLabelRow
              label={label}
              helpText={helpText}
              lightLabelText={lightLabelText}
            />
          ) : null}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              min={min}
              step={step}
              {...field}
              value={(field.value as string) ?? ""}
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
