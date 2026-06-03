"use client";

import { SelectControl } from "./SelectControl";
import type { SelectControlValueProps } from "@/components/select/types";

/** Uncontrolled select for filters and local UI state (value + onValueChange). */
export type SelectFieldProps = SelectControlValueProps;

export function SelectField(props: SelectFieldProps) {
  return <SelectControl {...props} />;
}
