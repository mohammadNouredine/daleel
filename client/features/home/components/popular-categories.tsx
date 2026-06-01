"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { POPULAR_CATEGORIES } from "../mock-data"

export function PopularCategories() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        Popular categories
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse by type of support or resource.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {POPULAR_CATEGORIES.map((category, index) => {
          const Icon = category.icon

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Link
                href={`/help-requests?category=${category.id}`}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm transition-all",
                  "hover:border-primary/30 hover:bg-muted/50 hover:shadow-md"
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-xs font-medium leading-tight sm:text-sm">
                  {category.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
