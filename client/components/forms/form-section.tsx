import { cn } from "@/lib/utils"

type FormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/70 bg-card/40 p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <header className="mb-4 border-b border-border/50 pb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}