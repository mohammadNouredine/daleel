"use client"

import { Form } from "@/components/ui/form"
import type { FieldValues, UseFormReturn } from "react-hook-form"

type FormRootProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  onSubmit: (values: T) => void
  children: React.ReactNode
  className?: string
}

export function FormRoot<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormRootProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </Form>
  )
}
