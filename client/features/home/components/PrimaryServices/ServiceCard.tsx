"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type ServiceCardProps = {
  href: string
  title: string
  description: string
  cta: string
  imageUrl: string
  icon: React.ReactNode
  accentClass: string
  delay?: number
}

export function ServiceCard({
  href,
  title,
  description,
  cta,
  imageUrl,
  icon,
  accentClass,
  delay = 0,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        href={href}
        className={cn(
          "group relative flex min-h-[200px] overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-shadow hover:shadow-lg sm:min-h-[220px]",
          accentClass
        )}
      >
        <div className="relative z-10 flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-background/90 shadow-sm backdrop-blur-sm">
              {icon}
            </span>
            <h3 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h3>
            <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
            {cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
        <div className="absolute inset-y-0 right-0 w-[45%] min-w-[120px]">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 40vw, 280px"
          />
          <div className="absolute inset-0 bg-linear-to-r from-card via-card/80 to-transparent" />
        </div>
      </Link>
    </motion.div>
  )
}
