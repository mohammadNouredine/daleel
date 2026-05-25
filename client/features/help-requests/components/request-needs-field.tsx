"use client"

import { useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextInput } from "@/components/forms/text-input"
import { SelectInput } from "@/components/forms/select-input"
import { TextareaInput } from "@/components/forms/textarea-input"
import {
  createEmptyNeedLine,
  type CreateHelpRequestFormValues,
} from "../schemas/create-help-request.schema"
import { NEED_KIND_OPTIONS } from "../constants"
import { HelpType, type HelpTypeValue } from "../types"

export function RequestNeedsField() {
  const form = useFormContext<CreateHelpRequestFormValues>()
  const helpType = form.watch("helpType")

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "needLines",
  })

  useEffect(() => {
    if (fields.length === 0) {
      append(createEmptyNeedLine(helpType as HelpTypeValue))
    }
  }, [append, fields.length, helpType])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">What is needed</p>
        <p className="text-xs text-muted-foreground">
          Add each item, service, or financial goal on its own line — mixed units
          are supported (e.g. kg rice + rides + $500 fund).
        </p>
      </div>

      <ul className="space-y-3">
        {fields.map((field, index) => (
          <li
            key={field.id}
            className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Line {index + 1}
              </span>
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label={`Remove line ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>

            <TextInput
              name={`needLines.${index}.label`}
              label="Description"
              placeholder={
                helpType === HelpType.FINANCIAL
                  ? "e.g. Surgery cost"
                  : helpType === HelpType.TRANSPORT
                    ? "e.g. Hospital rides"
                    : "e.g. Insulin boxes"
              }
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <TextInput
                name={`needLines.${index}.required`}
                label="Quantity"
                type="number"
                placeholder="e.g. 3"
              />
              <TextInput
                name={`needLines.${index}.unit`}
                label="Unit (optional)"
                placeholder="boxes, kg, USD, rides…"
              />
              <SelectInput
                name={`needLines.${index}.kind`}
                label="Type"
                options={NEED_KIND_OPTIONS}
              />
            </div>

            <TextareaInput
              name={`needLines.${index}.notes`}
              label="Notes (optional)"
              placeholder="Sizes, recurring need, donor restrictions…"
              rows={2}
            />
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={() => append(createEmptyNeedLine(helpType as HelpTypeValue))}
      >
        <Plus className="size-4" />
        Add another need
      </Button>

      {form.formState.errors.needLines?.message ? (
        <p className="text-sm text-destructive">
          {String(form.formState.errors.needLines.message)}
        </p>
      ) : null}
    </div>
  )
}
