"use client"

import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import { COMMUNITY_ACTIVITY } from "../mock-data"

export function CommunityActivity() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6">
      <div className="flex items-center gap-2">
        <Activity className="size-5 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {COMMUNITY_ACTIVITY.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <span className="text-foreground">{item.message}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.timeAgo}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
