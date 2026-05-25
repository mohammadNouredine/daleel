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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { HelpType } from "../types"
import {
  manageHelpRequestDefaultValues,
  manageHelpRequestSchema,
  type ManageHelpRequestFormValues,
} from "../schemas/manage-help-request.schema"
import { useManageHelpRequestDialogHandlers } from "./manage-help-request-dialog-context"

type ManageHelpRequestDialogProps = {
  open: boolean
}

export function ManageHelpRequestDialog({ open }: ManageHelpRequestDialogProps) {
  const { request, onOpenChange, onSubmit } =
    useManageHelpRequestDialogHandlers()

  const form = useForm<ManageHelpRequestFormValues>({
    resolver: zodResolver(manageHelpRequestSchema),
    defaultValues: manageHelpRequestDefaultValues,
  })

  const adjustmentType = form.watch("adjustmentType")

  useEffect(() => {
    if (!open) {
      form.reset(manageHelpRequestDefaultValues)
    }
  }, [open, form])

  if (!request) {
    return null
  }

  const isFinancial = request.helpType === HelpType.FINANCIAL
  const unit =
    request.financialDetails?.currency ?? request.quantity.unit ?? ""
  const label = isFinancial ? "amount" : "quantity"

  const handleSubmit = (values: ManageHelpRequestFormValues) => {
    onSubmit({
      requestId: request._id,
      adjustmentType: values.adjustmentType,
      amount: Number(values.amount),
    })
    form.reset(manageHelpRequestDefaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="space-y-1 px-6 pt-6 pb-2">
          <DialogTitle>Manage progress</DialogTitle>
          <DialogDescription>
            Record {isFinancial ? "donations received" : "items fulfilled"} or
            correct a previous entry. Does not change the request details.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Current: </span>
            <span className="font-medium">
              {request.quantity.fulfilled} / {request.quantity.required}
              {unit ? ` ${unit}` : ""}
            </span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4 px-6 py-2">
              <FormField
                control={form.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={
                            field.value === "add" ? "default" : "outline"
                          }
                          className={cn(
                            field.value === "add" &&
                              "ring-2 ring-primary ring-offset-2"
                          )}
                          onClick={() => field.onChange("add")}
                        >
                          Add {label}
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "remove" ? "default" : "outline"
                          }
                          className={cn(
                            field.value === "remove" &&
                              "ring-2 ring-primary ring-offset-2"
                          )}
                          onClick={() => field.onChange("remove")}
                        >
                          Remove {label}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      How much to {adjustmentType === "add" ? "add" : "remove"}?
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        step={isFinancial ? "0.01" : "1"}
                        placeholder={isFinancial ? "e.g. 500" : "e.g. 5"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 border-t px-6 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update progress</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
