"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormRoot } from "@/components/forms/form-root"
import { SelectInput } from "@/components/forms/select-input"
import { TextInput } from "@/components/forms/text-input"
import { TextareaInput } from "@/components/forms/textarea-input"
import {
  HELP_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  SUB_CATEGORY_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants"
import {
  createHelpRequestDefaultValues,
  createHelpRequestSchema,
  type CreateHelpRequestFormValues,
} from "../schemas/create-help-request.schema"
import type { CreateHelpRequestInput } from "../types"
import { mapFormToCreateInput } from "../utils/map-form-to-request"

type CreateHelpRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateHelpRequestInput) => void
}

export function CreateHelpRequestDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateHelpRequestDialogProps) {
  const form = useForm<CreateHelpRequestFormValues>({
    resolver: zodResolver(createHelpRequestSchema),
    defaultValues: createHelpRequestDefaultValues,
  })

  useEffect(() => {
    if (!open) {
      form.reset(createHelpRequestDefaultValues)
    }
  }, [open, form])

  const handleSubmit = (values: CreateHelpRequestFormValues) => {
    onSubmit(mapFormToCreateInput(values))
    form.reset(createHelpRequestDefaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>New help request</DialogTitle>
          <DialogDescription>
            Describe what is needed. Fields match the platform request schema.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[min(60vh,480px)] px-4">
          <FormRoot
            form={form}
            onSubmit={handleSubmit}
            className="space-y-4 py-2"
          >
            <TextInput name="title" label="Title" placeholder="Short summary" />
            <TextareaInput
              name="description"
              label="Description"
              placeholder="What is needed, for whom, and any urgency details"
              rows={4}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                name="helpType"
                label="Help type"
                options={HELP_TYPE_OPTIONS}
              />
              <SelectInput
                name="subCategory"
                label="Sub-category"
                options={SUB_CATEGORY_OPTIONS}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                name="priorityLevel"
                label="Priority"
                options={PRIORITY_OPTIONS}
              />
              <SelectInput
                name="visibility"
                label="Visibility"
                options={VISIBILITY_OPTIONS}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                name="quantityRequired"
                label="Quantity required"
                type="number"
                placeholder="1"
              />
              <TextInput
                name="quantityUnit"
                label="Unit (optional)"
                placeholder="e.g. packs, trips"
              />
            </div>

            <TextInput
              name="beneficiariesCount"
              label="Beneficiaries (optional)"
              type="number"
              placeholder="Number of people helped"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Location</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  name="governorate"
                  label="Governorate"
                  placeholder="e.g. Beirut"
                />
                <TextInput
                  name="district"
                  label="District"
                  placeholder="e.g. Baabda"
                />
              </div>
              <TextInput name="city" label="City" placeholder="e.g. Hazmieh" />
            </div>

            <DialogFooter className="sticky bottom-0 -mx-4 border-t bg-popover px-4 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create request</Button>
            </DialogFooter>
          </FormRoot>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
