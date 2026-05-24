"use client"

import { useFormContext } from "react-hook-form"
import { SelectInput } from "@/components/forms/select-input"
import { TextInput } from "@/components/forms/text-input"
import { FINANCIAL_CURRENCY_OPTIONS } from "../constants"
import { HelpType } from "../types"
import type { CreateHelpRequestFormValues } from "../schemas/create-help-request.schema"

export function QuantityOrFinancialFields() {
  const form = useFormContext<CreateHelpRequestFormValues>()
  const helpType = form.watch("helpType")
  const isFinancial = helpType === HelpType.FINANCIAL

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextInput
        name="quantityRequired"
        label={isFinancial ? "Amount required" : "Quantity required"}
        type="number"
        placeholder={isFinancial ? "e.g. 500" : "1"}
      />
      {isFinancial ? (
        <SelectInput
          name="quantityUnit"
          label="Currency"
          placeholder="Select currency"
          options={[...FINANCIAL_CURRENCY_OPTIONS]}
        />
      ) : (
        <TextInput
          name="quantityUnit"
          label="Unit (optional)"
          placeholder="e.g. packs, trips"
        />
      )}
    </div>
  )
}
