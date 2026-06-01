"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { HOME_CATEGORIES, HOME_SEARCH_PLACEHOLDER } from "../mock-data"
import type { HomeCategoryId } from "../types"

export function HomeSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<HomeCategoryId | null>(
    null
  )

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (activeCategory) params.set("category", activeCategory)
    const qs = params.toString()
    router.push(qs ? `/help-requests?${qs}` : "/help-requests")
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Lebanon · Search housing, shelter, and urgent community needs
      </p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sr-only"
      >
        <h1>Daleel — Find shelter, housing, and community support</h1>
      </motion.div>

      <motion.form
        onSubmit={handleSearch}
        className="mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-md sm:flex-row sm:items-center sm:p-1.5">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={HOME_SEARCH_PLACEHOLDER}
              className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0 sm:h-12"
              aria-label="Search resources and help requests"
            />
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-10 gap-1 sm:inline-flex"
            >
              <MapPin className="size-4" />
              Near me
            </Button>
            <Button type="submit" className="h-10 flex-1 sm:flex-none sm:px-6">
              Search
            </Button>
          </div>
        </div>
      </motion.form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {HOME_CATEGORIES.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setActiveCategory(isActive ? null : category.id)
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {category.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
