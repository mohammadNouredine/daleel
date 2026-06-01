import { TRUST_INDICATORS } from "../mock-data"

export function TrustStrip() {
  return (
    <section
      className="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6"
      aria-label="Trust indicators"
    >
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-4 sm:gap-6 sm:p-6">
        {TRUST_INDICATORS.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <Icon
                className="size-5 text-primary"
                aria-hidden
              />
              <p className="mt-2 text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
