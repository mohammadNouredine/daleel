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
import { LocationAutocomplete } from "@/components/forms/LocationAutocomplete"
import { PhoneInput } from "@/components/forms/Phone/PhoneInput"
import { RangeSelectGroup } from "@/components/forms/RangeSelectGroup"
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
import {
  LEBANON_DISTRICTS_BY_GOVERNORATE,
  LEBANON_GOVERNORATES,
} from "../../constants"
import {
  isCanonicalLebanonGovernorate,
  normalizeLebanonLocationFields,
} from "@/lib/lebanon-location-normalize"
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
  const listingType = form.watch("listingType")
  const priceInput = form.watch("price")
  const requiredAdvanceMonthsInput = form.watch("requiredAdvanceMonths")
  const securityDepositInput = form.watch("securityDeposit")
  const officeDepositInput = form.watch("officeDeposit")
  const selectedPricePeriod = form.watch("pricePeriod")
  const selectedGovernorate = form.watch("governorate")

  const districtOptions = [
    {
      value: "",
      label: selectedGovernorate ? "Choose district" : "Choose governorate first",
    },
    ...((selectedGovernorate
      ? LEBANON_DISTRICTS_BY_GOVERNORATE[selectedGovernorate] ?? []
      : []) as string[]).map((district) => ({
      value: district,
      label: district,
    })),
  ]

  const requiresPeriodicPricing =
    listingType === "RENT" ||
    listingType === "ROOMMATE" ||
    listingType === "TEMPORARY_HOUSING"

  const parsedPrice = Number(priceInput || 0)
  const parsedAdvanceMonths = Number(requiredAdvanceMonthsInput || 0)
  const parsedSecurityDeposit = Number(securityDepositInput || 0)
  const parsedOfficeDeposit = Number(officeDepositInput || 0)
  const firstPayment =
    parsedPrice * Math.max(parsedAdvanceMonths, 0) +
    Math.max(parsedSecurityDeposit, 0) +
    Math.max(parsedOfficeDeposit, 0)

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

  const applyNormalizedLocation = (fields: {
    governorate?: string
    district?: string
    city?: string
    street?: string
    latitude?: string
    longitude?: string
  }) => {
    const normalized = normalizeLebanonLocationFields({
      governorate: fields.governorate,
      district: fields.district,
      city: fields.city,
    })

    if (fields.latitude) {
      form.setValue("latitude", fields.latitude, { shouldValidate: true })
    }
    if (fields.longitude) {
      form.setValue("longitude", fields.longitude, { shouldValidate: true })
    }
    if (isCanonicalLebanonGovernorate(normalized.governorate)) {
      form.setValue("governorate", normalized.governorate, {
        shouldValidate: true,
      })
    }
    if (normalized.district) {
      form.setValue("district", normalized.district, { shouldValidate: true })
    }
    if (normalized.city) {
      form.setValue("city", normalized.city, { shouldValidate: true })
    }
    if (fields.street) {
      form.setValue("street", fields.street, { shouldValidate: true })
    }
  }

  const handleLocationResolved = (payload: {
    latitude: string
    longitude: string
    governorate: string
    district: string
    city: string
    street?: string
  }) => {
    applyNormalizedLocation(payload)
  }

  const handlePlaceSelected = (payload: {
    latitude: number
    longitude: number
    city?: string
    district?: string
    governorate?: string
    street?: string
  }) => {
    applyNormalizedLocation({
      latitude: payload.latitude.toFixed(6),
      longitude: payload.longitude.toFixed(6),
      governorate: payload.governorate,
      district: payload.district,
      city: payload.city,
      street: payload.street,
    })
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
                      <SelectInput
                        name="governorate"
                        label="Governorate"
                        options={[
                          { value: "", label: "Choose governorate" },
                          ...LEBANON_GOVERNORATES.map((gov) => ({
                            value: gov,
                            label: gov,
                          })),
                        ]}
                      />
                      <SelectInput
                        name="district"
                        label="District"
                        options={districtOptions}
                      />
                    </div>
                    <LocationAutocomplete
                      label="City"
                      value={form.watch("city")}
                      placeholder="Search Lebanese cities"
                      onChange={(val) =>
                        form.setValue("city", val, { shouldValidate: true })
                      }
                      onPlaceSelected={handlePlaceSelected}
                    />
                    <LocationAutocomplete
                      label="Street (optional)"
                      value={form.watch("street") ?? ""}
                      placeholder="Search street"
                      onChange={(val) =>
                        form.setValue("street", val, { shouldValidate: true })
                      }
                      onPlaceSelected={handlePlaceSelected}
                    />
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Coordinates: {latitude || "—"}, {longitude || "—"}
                    </p>
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
                      <RangeSelectGroup
                        name="bedrooms"
                        label="Bedrooms"
                        min={0}
                        max={10}
                        helpText="How many bedrooms does the property have?"
                      />
                      <RangeSelectGroup
                        name="bathrooms"
                        label="Bathrooms"
                        min={0}
                        max={10}
                        helpText="How many bathrooms are available?"
                      />
                      <RangeSelectGroup
                        name="livingRooms"
                        label="Living rooms"
                        min={0}
                        max={6}
                        helpText="Reception/living spaces available in the unit."
                      />
                      <RangeSelectGroup
                        name="maxOccupancy"
                        label="Max occupancy"
                        min={1}
                        max={20}
                        helpText="Maximum number of people allowed."
                      />
                      <RangeSelectGroup
                        name="parkingSpaces"
                        label="Parking slots"
                        min={0}
                        max={10}
                        helpText="Number of car spots available with the property."
                      />
                      <TextInput name="floorNumber" label="Floor number" type="number" />
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
                      {requiresPeriodicPricing ? (
                        <SelectInput
                          name="pricePeriod"
                          label="Price period"
                          options={PRICE_PERIOD_FORM_OPTIONS}
                        />
                      ) : null}
                      {requiresPeriodicPricing ? (
                        <TextInput
                          name="requiredAdvanceMonths"
                          label="First payment months"
                          type="number"
                        />
                      ) : null}
                      <TextInput
                        name="securityDeposit"
                        label="Security deposit"
                        type="number"
                      />
                      <TextInput
                        name="officeDeposit"
                        label="Office deposit"
                        type="number"
                      />
                    </div>
                    {requiresPeriodicPricing ? (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                        <p className="font-medium">Payment summary</p>
                        <p className="mt-1 text-muted-foreground">
                          First payment will be{" "}
                          <span className="font-semibold text-foreground">
                            {Number.isFinite(firstPayment)
                              ? firstPayment.toLocaleString("en-US")
                              : "0"}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Next payment will be after{" "}
                          <span className="font-medium text-foreground">
                            {requiredAdvanceMonthsInput || "0"} month(s)
                          </span>
                          {selectedPricePeriod
                            ? `, then every ${selectedPricePeriod
                                .toLowerCase()
                                .replace("_", " ")}.`
                            : "."}
                        </p>
                      </div>
                    ) : null}
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
                      <RangeSelectGroup
                        name="totalBeds"
                        label="Total beds"
                        min={0}
                        max={20}
                        helpText="Total physical beds in the property."
                      />
                      <RangeSelectGroup
                        name="availableBeds"
                        label="Available beds"
                        min={0}
                        max={20}
                        helpText="Beds currently free now. Should be less than or equal to total beds."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      {booleanField("isAvailable", "Currently available")}
                      {booleanField("isEmergencyShelter", "Emergency shelter")}
                      {booleanField("acceptChildren", "Children welcome")}
                      {booleanField("acceptPets", "Pets allowed")}
                      {booleanField("womenOnly", "Women only")}
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
