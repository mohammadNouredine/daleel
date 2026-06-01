"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonGroupInput } from "@/components/forms/ButtonGroupInput";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextInput } from "@/components/forms/TextInput";
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
import {
  manageHelpRequestDefaultValues,
  manageHelpRequestSchema,
  type ManageHelpRequestFormValues,
} from "../../schemas/manage-help-request.schema";
import {
  formatNeedLineSelectLabel,
  formatNeedQuantity,
  getNeedRemaining,
} from "../../utils/request-needs";
import { useManageHelpRequestDialogHandlers } from "./ManageHelpRequestDialogContext";
import { RequestNeedsProgress } from "../RequestNeedsProgress";

const ADJUSTMENT_OPTIONS = [
  { value: "add", label: "Add" },
  { value: "remove", label: "Remove" },
  { value: "set", label: "Set exact" },
] as const;

type ManageHelpRequestDialogProps = {
  open: boolean;
};

export function ManageHelpRequestDialog({
  open,
}: ManageHelpRequestDialogProps) {
  const { request, onOpenChange, onSubmit } =
    useManageHelpRequestDialogHandlers();

  const form = useForm<ManageHelpRequestFormValues>({
    resolver: zodResolver(manageHelpRequestSchema),
    defaultValues: manageHelpRequestDefaultValues,
  });

  const lineId = form.watch("lineId");
  const adjustmentType = form.watch("adjustmentType");

  useEffect(() => {
    if (!open) {
      form.reset(manageHelpRequestDefaultValues);
      return;
    }
    if (request?.needs.length) {
      form.setValue("lineId", request.needs[0].id);
    }
  }, [open, request, form]);

  const needs = request?.needs ?? [];

  const needLineOptions = useMemo(
    () =>
      needs.map((line) => ({
        value: line.id,
        label: formatNeedLineSelectLabel(line),
      })),
    [needs],
  );

  const selectedLine = needs.find((line) => line.id === lineId);
  const remaining = selectedLine ? getNeedRemaining(selectedLine) : 0;

  const amountLabel =
    adjustmentType === "set"
      ? "Set fulfilled amount to"
      : adjustmentType === "add"
        ? "How much to add?"
        : "How much to remove?";

  const handleSubmit = (values: ManageHelpRequestFormValues) => {
    if (!request) return;

    onSubmit({
      requestId: request._id,
      lineId: values.lineId,
      adjustmentType: values.adjustmentType,
      amount: Number(values.amount),
    });
    form.reset(manageHelpRequestDefaultValues);
  };

  if (!request) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1 px-6 pt-6 pb-2">
          <DialogTitle>Manage progress</DialogTitle>
          <DialogDescription>
            Update fulfillment per line — add donations, correct mistakes, or
            set the exact fulfilled amount.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <RequestNeedsProgress needs={request.needs} compact />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-4 space-y-4"
            >
              <SelectInput
                name="lineId"
                label="Which need line?"
                placeholder="Select a line"
                options={needLineOptions}
                displayValue={
                  selectedLine
                    ? formatNeedLineSelectLabel(selectedLine)
                    : undefined
                }
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

              <ButtonGroupInput
                name="adjustmentType"
                label="Action"
                options={ADJUSTMENT_OPTIONS}
              />

              <TextInput
                name="amount"
                label={amountLabel}
                type="number"
                min={adjustmentType === "set" ? 0 : 1}
                step={selectedLine?.kind === "financial" ? "0.01" : "1"}
                placeholder={
                  adjustmentType === "set"
                    ? String(selectedLine?.fulfilled ?? 0)
                    : "e.g. 1"
                }
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
  );
}
