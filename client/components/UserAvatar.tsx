import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
} as const

const iconSizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
} as const

type UserAvatarProps = {
  src?: string | null
  name?: string
  size?: keyof typeof sizeClasses
  className?: string
}

export function UserAvatar({
  src,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const label = name?.trim() || "User"

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        sizeClasses[size],
        className
      )}
      aria-hidden={!name}
      aria-label={name ? `${label} avatar` : undefined}
    >
      <User className={iconSizeClasses[size]} />
    </div>
  )
}
