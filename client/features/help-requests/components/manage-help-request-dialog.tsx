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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  manageHelpRequestDefaultValues,
  manageHelpRequestSchema,
  type ManageHelpRequestFormValues,
} from "../schemas/manage-help-request.schema"
import {
  formatNeedQuantity,
  getNeedRemaining,
} from "../utils/request-needs"
import { useManageHelpRequestDialogHandlers } from "./manage-help-request-dialog-context"
import { RequestNeedsProgress } from "./request-needs-progress"

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

  const lineId = form.watch("lineId")
  const adjustmentType = form.watch("adjustmentType")

  useEffect(() => {
    if (!open) {
      form.reset(manageHelpRequestDefaultValues)
      return
    }
    if (request?.needs.length) {
      form.setValue("lineId", request.needs[0].id)
    }
  }, [open, request, form])

  if (!request) {
    return null
  }

  const selectedLine = request.needs.find((line) => line.id === lineId)
  const remaining = selectedLine ? getNeedRemaining(selectedLine) : 0

  const handleSubmit = (values: ManageHelpRequestFormValues) => {
    onSubmit({
      requestId: request._id,
      lineId: values.lineId,
      adjustmentType: values.adjustmentType,
      amount: Number(values.amount),
    })
    form.reset(manageHelpRequestDefaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1 px-6 pt-6 pb-2">
          <DialogTitle>Manage progress</DialogTitle>
          <DialogDescription>
            Update fulfillment per line — add donations, correct mistakes, or set
            the exact fulfilled amount.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <RequestNeedsProgress needs={request.needs} compact />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="lineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Which need line?</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a line" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {request.needs.map((line) => (
                          <SelectItem key={line.id} value={line.id}>
                            {line.label} ({line.fulfilled}/{line.required}
                            {line.unit ? ` ${line.unit}` : ""})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedLine ? (
                <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Current: </span>
                  <span className="font-medium">
                    {formatNeedQuantity(selectedLine, selectedLine.fulfilled)}{" "}
                    of {formatNeedQuantity(selectedLine, selectedLine.required)}{" "}
                    — {remaining > 0 ? `${remaining} remaining` : "complete"}
                  </span>
                </p>
              ) : null}

              <FormField
                control={form.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { value: "add", label: "Add" },
                            { value: "remove", label: "Remove" },
                            { value: "set", label: "Set exact" },
                          ] as const
                        ).map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={
                              field.value === option.value
                                ? "default"
                                : "outline"
                            }
                            className={cn(
                              "h-8 text-xs",
                              field.value === option.value &&
                                "ring-2 ring-primary ring-offset-2"
                            )}
                            onClick={() => field.onChange(option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
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
                      {adjustmentType === "set"
                        ? "Set fulfilled amount to"
                        : adjustmentType === "add"
                          ? "How much to add?"
                          : "How much to remove?"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={adjustmentType === "set" ? 0 : 1}
                        step={
                          selectedLine?.kind === "financial" ? "0.01" : "1"
                        }
                        placeholder={
                          adjustmentType === "set"
                            ? String(selectedLine?.fulfilled ?? 0)
                            : "e.g. 1"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 border-t px-0 pt-4 sm:justify-end">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
