"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSection } from "@/components/forms/FormSection"
import { PhoneInput } from "@/components/forms/Phone/PhoneInput"
import { SelectInput } from "@/components/forms/SelectInput"
import { TextInput } from "@/components/forms/TextInput"
import { TextareaInput } from "@/components/forms/TextareaInput"
import { Form, FormField } from "@/components/ui/form"
import { LocationMapPicker } from "@/features/help-requests/components/LocationMapPicker/LocationMapPickerLazy"
import toast from "react-hot-toast"
import { useCreatePropertyListing } from "../../hooks/use-create-property-listing"
import { useUpdatePropertyListing } from "../../hooks/use-update-property-listing"
import {
  createPropertyListingDefaultValues,
  createPropertyListingSchema,
  type CreatePropertyListingFormValues,
} from "../../schemas/create-property-listing.schema"
import { PropertyListingStatus, type PropertyListing } from "../../types"
import { buildPropertyListingFormData } from "../../utils/build-property-listing-form-data"
import {
  mapFormToCreatePropertyListingInput,
  mapPropertyListingToFormValues,
} from "../../utils/map-form-to-property-listing"
import {
  getNextStep,
  getPreviousStep,
  hasVisitedAllSteps,
  isLastStep,
  PROPERTY_LISTING_FORM_STEPS,
  PROPERTY_LISTING_STEP_FIELDS,
  type PropertyListingFormStep,
} from "../../utils/property-listing-form-steps"
import {
  AREA_UNIT_FORM_OPTIONS,
  CONTACT_METHOD_FORM_OPTIONS,
  CURRENCY_FORM_OPTIONS,
  FURNISHING_FORM_OPTIONS,
  LISTING_TYPE_FORM_OPTIONS,
  LOCATION_VISIBILITY_OPTIONS,
  PRICE_PERIOD_FORM_OPTIONS,
  PROPERTY_TYPE_FORM_OPTIONS,
} from "../../utils/form-options"
import { PropertyListingAmenitiesField } from "./PropertyListingAmenitiesField"
import { PropertyListingImagesUpload } from "./PropertyListingImagesUpload"

type CreatePropertyListingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingListing?: PropertyListing | null
}

const INITIAL_STEP: PropertyListingFormStep = "basics"

function publishSuccessMessage(status: PropertyListing["status"]): string {
  if (status === PropertyListingStatus.APPROVED) {
    return "Listing updated and published"
  }
  if (status === PropertyListingStatus.DRAFT) {
    return "Draft saved"
  }
  return "Listing updated and submitted for review"
}

export function CreatePropertyListingDialog({
  open,
  onOpenChange,
  editingListing = null,
}: CreatePropertyListingDialogProps) {
  const isEdit = editingListing != null
  const [activeTab, setActiveTab] = useState<PropertyListingFormStep>(INITIAL_STEP)
  const [visitedTabs, setVisitedTabs] = useState<Set<PropertyListingFormStep>>(
    () => new Set([INITIAL_STEP])
  )

  const form = useForm<CreatePropertyListingFormValues>({
    resolver: zodResolver(createPropertyListingSchema),
    defaultValues: createPropertyListingDefaultValues,
    mode: "onTouched",
  })

  const closeAndReset = useCallback(() => {
    onOpenChange(false)
    form.reset(createPropertyListingDefaultValues)
    setActiveTab(INITIAL_STEP)
    setVisitedTabs(new Set([INITIAL_STEP]))
  }, [form, onOpenChange])

  const createMutation = useCreatePropertyListing({
    showSuccessToast: false,
    onSuccess: (data) => {
      toast.success(publishSuccessMessage(data.status))
      closeAndReset()
    },
  })

  const updateMutation = useUpdatePropertyListing({
    showSuccessToast: false,
    onSuccess: (data) => {
      toast.success(publishSuccessMessage(data.status))
      closeAndReset()
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const resetWizard = useCallback(() => {
    form.reset(createPropertyListingDefaultValues)
    setActiveTab(INITIAL_STEP)
    setVisitedTabs(new Set([INITIAL_STEP]))
  }, [form])

  const loadEditWizard = useCallback(
    (listing: PropertyListing) => {
      form.reset(mapPropertyListingToFormValues(listing))
      setActiveTab(INITIAL_STEP)
      setVisitedTabs(new Set(PROPERTY_LISTING_FORM_STEPS))
    },
    [form]
  )

  useEffect(() => {
    if (!open) {
      return
    }
    if (editingListing) {
      loadEditWizard(editingListing)
    } else {
      resetWizard()
    }
  }, [open, editingListing, loadEditWizard, resetWizard])

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) {
        return prev
      }
      const next = new Set(prev)
      next.add(activeTab)
      return next
    })
  }, [activeTab])

  const latitude = form.watch("latitude")
  const longitude = form.watch("longitude")

  const submit = (values: CreatePropertyListingFormValues, asDraft: boolean) => {
    const input = mapFormToCreatePropertyListingInput({
      ...values,
      saveAsDraft: asDraft,
    })
    const formData = buildPropertyListingFormData(input, {
      existingImages: values.imageUrls ?? [],
      newFiles: values.imageFiles ?? [],
    })

    if (editingListing) {
      updateMutation.mutate({ id: editingListing._id, formData })
      return
    }

    createMutation.mutate(formData)
  }

  const handleLocationResolved = (payload: {
    latitude: string
    longitude: string
    governorate: string
    district: string
    city: string
    street?: string
  }) => {
    form.setValue("latitude", payload.latitude, { shouldValidate: true })
    form.setValue("longitude", payload.longitude, { shouldValidate: true })
    form.setValue("governorate", payload.governorate, { shouldValidate: true })
    form.setValue("district", payload.district, { shouldValidate: true })
    form.setValue("city", payload.city, { shouldValidate: true })
    if (payload.street) {
      form.setValue("street", payload.street, { shouldValidate: true })
    }
  }

  const validateCurrentStep = async (): Promise<boolean> => {
    const fields = PROPERTY_LISTING_STEP_FIELDS[activeTab]
    if (fields.length === 0) {
      return true
    }
    return form.trigger(fields)
  }

  const handleNext = async () => {
    const valid = await validateCurrentStep()
    if (!valid) {
      toast.error("Please complete all required fields in this section")
      return
    }

    const next = getNextStep(activeTab)
    if (!next) {
      return
    }

    setVisitedTabs((prev) => new Set([...prev, next]))
    setActiveTab(next)
  }

  const handleBack = () => {
    const previous = getPreviousStep(activeTab)
    if (previous) {
      setActiveTab(previous)
    }
  }

  const handlePublish = async () => {
    if (!isLastStep(activeTab)) {
      return
    }

    if (!hasVisitedAllSteps(visitedTabs)) {
      toast.error("Please review every section before publishing")
      return
    }

    const valid = await form.trigger()
    if (!valid) {
      toast.error("Please complete all required fields, including your phone number")
      return
    }

    submit(form.getValues(), false)
  }

  const handleSaveDraft = () => {
    submit({ ...form.getValues(), saveAsDraft: true }, true)
  }

  const handleTabChange = (value: string) => {
    const step = value as PropertyListingFormStep
    if (!PROPERTY_LISTING_FORM_STEPS.includes(step)) {
      return
    }
    if (isEdit || visitedTabs.has(step)) {
      setActiveTab(step)
    }
  }

  const booleanField = (
    name: keyof CreatePropertyListingFormValues,
    label: string
  ) => (
    <FormField
      key={name}
      control={form.control}
      name={name}
      render={({ field }) => (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
          />
          {label}
        </label>
      )}
    />
  )

  const showPublish =
    isLastStep(activeTab) &&
    (isEdit || hasVisitedAllSteps(visitedTabs))
  const showNext = !isLastStep(activeTab)
  const showBack = getPreviousStep(activeTab) !== null
  const currentStepIndex = PROPERTY_LISTING_FORM_STEPS.indexOf(activeTab)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,800px)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 space-y-1 px-6 pt-6 pb-2">
          <DialogTitle>
            {isEdit ? "Edit property listing" : "Add property listing"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes are saved when you submit. Non-admin updates to approved listings require review again."
              : "Complete each section. You can publish after reviewing contact details and photos."}
          </DialogDescription>
          <p className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {PROPERTY_LISTING_FORM_STEPS.length}
          </p>
        </DialogHeader>

        <Form {...form}>
          <div className="flex min-h-0 flex-1 flex-col">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="mx-6 shrink-0 flex w-auto flex-wrap gap-1">
                {PROPERTY_LISTING_FORM_STEPS.map((step) => (
                  <TabsTrigger
                    key={step}
                    value={step}
                    disabled={!isEdit && !visitedTabs.has(step)}
                    className="capitalize disabled:opacity-40"
                  >
                    {step === "media" ? "Contact" : step}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                <TabsContent value="basics" className="mt-0 space-y-4">
                  <FormSection title="Listing basics">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectInput
                        name="listingType"
                        label="Listing type"
                        options={LISTING_TYPE_FORM_OPTIONS}
                      />
                      <SelectInput
                        name="propertyType"
                        label="Property type"
                        options={PROPERTY_TYPE_FORM_OPTIONS}
                      />
                    </div>
                    <TextInput name="title" label="Title" placeholder="Short headline" />
                    <TextareaInput
                      name="description"
                      label="Description"
                      rows={4}
                      placeholder="Describe the property, availability, and who it suits"
                    />
                  </FormSection>
                </TabsContent>

                <TabsContent value="location" className="mt-0 space-y-4">
                  <FormSection
                    title="Location"
                    description="Where the property is located in Lebanon."
                  >
                    {open ? (
                      <LocationMapPicker
                        latitude={latitude}
                        longitude={longitude}
                        onLocationResolved={handleLocationResolved}
                      />
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput name="governorate" label="Governorate" />
                      <TextInput name="district" label="District" />
                    </div>
                    <TextInput name="city" label="City" />
                    <TextInput name="street" label="Street (optional)" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput name="latitude" label="Latitude (optional)" />
                      <TextInput name="longitude" label="Longitude (optional)" />
                    </div>
                    <SelectInput
                      name="locationVisibility"
                      label="Location visibility"
                      options={LOCATION_VISIBILITY_OPTIONS}
                    />
                  </FormSection>
                </TabsContent>

                <TabsContent value="details" className="mt-0 space-y-4">
                  <FormSection title="Property details">
                    <p className="text-xs text-muted-foreground">
                      All fields in this section are optional.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput name="bedrooms" label="Bedrooms" type="number" />
                      <TextInput name="bathrooms" label="Bathrooms" type="number" />
                      <TextInput name="livingRooms" label="Living rooms" type="number" />
                      <TextInput name="maxOccupancy" label="Max occupancy" type="number" />
                      <TextInput name="parkingSpaces" label="Parking" type="number" />
                      <TextInput name="floorNumber" label="Floor" type="number" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput name="area" label="Area" type="number" />
                      <SelectInput
                        name="areaUnit"
                        label="Area unit"
                        options={AREA_UNIT_FORM_OPTIONS}
                      />
                    </div>
                    <SelectInput
                      name="furnishingStatus"
                      label="Furnishing"
                      options={FURNISHING_FORM_OPTIONS}
                    />
                  </FormSection>

                  <FormSection title="Pricing">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput name="price" label="Price" type="number" />
                      <SelectInput
                        name="currency"
                        label="Currency"
                        options={CURRENCY_FORM_OPTIONS}
                      />
                      <SelectInput
                        name="pricePeriod"
                        label="Price period"
                        options={PRICE_PERIOD_FORM_OPTIONS}
                      />
                      <TextInput
                        name="securityDeposit"
                        label="Security deposit"
                        type="number"
                      />
                    </div>
                    {booleanField("isPriceNegotiable", "Price is negotiable")}
                  </FormSection>
                </TabsContent>

                <TabsContent value="access" className="mt-0 space-y-4">
                  <FormSection title="Availability & access">
                    <p className="text-xs text-muted-foreground">
                      Optional preferences and availability.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextInput name="availableFrom" label="Available from" type="date" />
                      <TextInput name="availableUntil" label="Available until" type="date" />
                      <TextInput name="availableBeds" label="Available beds" type="number" />
                      <TextInput name="totalBeds" label="Total beds" type="number" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {booleanField("isAvailable", "Currently available")}
                      {booleanField("isEmergencyShelter", "Emergency shelter")}
                      {booleanField("acceptFamilies", "Families welcome")}
                      {booleanField("acceptChildren", "Children welcome")}
                      {booleanField("acceptPets", "Pets allowed")}
                      {booleanField("womenOnly", "Women only")}
                      {booleanField("menOnly", "Men only")}
                    </div>
                    <PropertyListingAmenitiesField />
                  </FormSection>
                </TabsContent>

                <TabsContent value="media" className="mt-0 space-y-4">
                  <FormSection title="Contact">
                    <SelectInput
                      name="contactMethod"
                      label="Contact method"
                      options={CONTACT_METHOD_FORM_OPTIONS}
                    />
                    <PhoneInput
                      label="Phone number"
                      description="Required to publish. Used for inquiries about this listing."
                      phonePlaceholder="71 123 456"
                    />
                    <TextInput
                      name="contactWhatsapp"
                      label="WhatsApp (optional)"
                      placeholder="Leave blank to use phone number"
                    />
                  </FormSection>
                  <FormSection title="Photos">
                    <PropertyListingImagesUpload />
                  </FormSection>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 border-t bg-popover px-6 py-4 sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={handleSaveDraft}
                >
                  Save draft
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {showBack ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                ) : null}
                {showNext ? (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : null}
                {showPublish ? (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePublish}
                  >
                    {isSubmitting
                      ? "Submitting…"
                      : isEdit
                        ? "Save changes"
                        : "Publish"}
                  </Button>
                ) : null}
              </div>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
