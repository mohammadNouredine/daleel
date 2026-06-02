"use client"

import { CircleHelp } from "lucide-react"

type FieldHelpHintProps = {
  text: string
}

export function FieldHelpHint({ text }: FieldHelpHintProps) {
  return (
    <span
      title={text}
      aria-label={text}
      className="inline-flex cursor-help items-center text-muted-foreground"
    >
      <CircleHelp className="size-3.5" />
    </span>
  )
}
