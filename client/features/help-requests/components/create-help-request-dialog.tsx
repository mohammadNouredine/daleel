"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormSection } from "@/components/forms/form-section";
import { SelectInput } from "@/components/forms/select-input";
import { PriorityPicker } from "@/components/forms/priority-picker";
import { TextInput } from "@/components/forms/text-input";
import { PhoneInput } from "@/components/forms/Phone/phone-input";
import { TextareaInput } from "@/components/forms/textarea-input";
import { useHelpRequestReference } from "@/features/reference/hooks/use-help-request-reference";
import {
  toSelectOptions,
} from "@/features/reference/utils/reference-labels";
import { PRIORITY_OPTIONS } from "../constants";
import {
  createHelpRequestDefaultValues,
  createHelpRequestSchema,
  type CreateHelpRequestFormValues,
} from "../schemas/create-help-request.schema";
import {
  mapFormToCreateInput,
  mapHelpRequestToFormValues,
} from "../utils/map-form-to-request";
import { LocationMapPicker } from "./location-map-picker-lazy";
import { ProofImagesUpload } from "./proof-images-upload";
import { RequestNeedsField } from "./request-needs-field";
import { useCreateHelpRequestDialogHandlers } from "./create-help-request-dialog-context";

type CreateHelpRequestDialogProps = {
  open: boolean;
};

export function CreateHelpRequestDialog({
  open,
}: CreateHelpRequestDialogProps) {
  const { mode, editingRequest, onOpenChange, onSubmit } =
    useCreateHelpRequestDialogHandlers();
  const isEdit = mode === "edit";
  const { helpTypes, subCategories, isLoading: isReferenceLoading, isError: isReferenceError } =
    useHelpRequestReference();
  const form = useForm<CreateHelpRequestFormValues>({
    resolver: zodResolver(createHelpRequestSchema),
    defaultValues: createHelpRequestDefaultValues,
  });

  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  useEffect(() => {
    if (!open) {
      const urls = form.getValues("proofImageUrls") ?? [];
      for (const url of urls) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
      return;
    }

    if (isEdit && editingRequest) {
      form.reset(mapHelpRequestToFormValues(editingRequest));
      return;
    }

    form.reset(createHelpRequestDefaultValues);
  }, [open, isEdit, editingRequest, form]);

  const handleSubmit = (values: CreateHelpRequestFormValues) => {
    onSubmit(mapFormToCreateInput(values));
    const urls = values.proofImageUrls ?? [];
    for (const url of urls) {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    }
    if (!isEdit) {
      form.reset(createHelpRequestDefaultValues);
    }
  };

  const handleLocationResolved = (payload: {
    latitude: string;
    longitude: string;
    governorate: string;
    district: string;
    city: string;
    street?: string;
  }) => {
    form.setValue("latitude", payload.latitude, { shouldValidate: true });
    form.setValue("longitude", payload.longitude, { shouldValidate: true });
    form.setValue("governorate", payload.governorate, { shouldValidate: true });
    form.setValue("district", payload.district, { shouldValidate: true });
    form.setValue("city", payload.city, { shouldValidate: true });
    if (payload.street) {
      form.setValue("street", payload.street, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-1 px-6 pt-6 pb-2">
          <DialogTitle>
            {isEdit ? "Edit help request" : "New help request"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the request details. Progress (fulfilled amount) is managed separately."
              : "Describe what is needed. All requests are public while we launch."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2">
              <div className="space-y-5 pb-4">
                <FormSection
                  title="Request details"
                  description="What is needed and who it helps."
                >
                  <TextInput
                    name="title"
                    label="Title"
                    placeholder="Short summary"
                  />
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
                      options={toSelectOptions(helpTypes)}
                      disabled={isReferenceLoading || isReferenceError}
                    />
                    <SelectInput
                      name="subCategory"
                      label="Sub-category"
                      options={toSelectOptions(subCategories)}
                      disabled={isReferenceLoading || isReferenceError}
                    />
                  </div>
                  {isReferenceError ? (
                    <p className="text-xs text-destructive">
                      Could not load categories from the server. Restart the
                      backend and try again.
                    </p>
                  ) : null}
                  <RequestNeedsField />
                  <TextInput
                    name="beneficiariesCount"
                    label="Beneficiaries (optional)"
                    type="number"
                    placeholder="Number of people helped"
                  />
                  <PhoneInput
                    label="Contact phone / WhatsApp"
                    description="Same number for calls and WhatsApp messages."
                    phonePlaceholder="71 123 456"
                  />
                </FormSection>

                <FormSection
                  title="Supporting proof"
                  description="Invoices, medical letters, or other documents that show this need is real."
                >
                  <ProofImagesUpload />
                </FormSection>

                <FormSection
                  title="Location"
                  description="Where help should be delivered or coordinated."
                >
                  {open ? (
                    <LocationMapPicker
                      latitude={latitude}
                      longitude={longitude}
                      onLocationResolved={handleLocationResolved}
                    />
                  ) : null}
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
                  <TextInput
                    name="city"
                    label="City"
                    placeholder="e.g. Hazmieh"
                  />
                  <TextInput
                    name="street"
                    label="Street (optional)"
                    placeholder="Filled from map when available"
                  />
                </FormSection>

                <FormSection
                  title="Urgency"
                  description="How quickly this request needs attention."
                >
                  <PriorityPicker
                    name="priorityLevel"
                    label=""
                    description="Tap a color on the bar — from less urgent (left) to critical (right)."
                  />
                </FormSection>
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 border-t bg-popover px-6 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save changes" : "Create request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
