"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectControl } from "@/components/select/SelectControl"
import { useUpdateUser } from "../hooks/use-update-user"
import type { AdminUser, DaleelProfile } from "../types"

const ROLE_OPTIONS: { value: DaleelProfile["role"]; label: string }[] = [
  { value: "USER", label: "User" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "ADMIN", label: "Admin" },
]

type UserEditDialogProps = {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
}: UserEditDialogProps) {
  const mutation = useUpdateUser({
    onSuccess: () => onOpenChange(false),
  })
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<DaleelProfile["role"]>("USER")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName)
      setRole(user.role)
      setIsActive(user.isActive)
    }
  }, [user, open])

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-full-name">Full name</Label>
            <Input
              id="user-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <SelectControl
              value={role}
              onValueChange={(value) =>
                setRole(value as DaleelProfile["role"])
              }
              options={ROLE_OPTIONS}
              placeholder="Select role"
            />
            <p className="text-xs text-muted-foreground">
              Changing role resets permissions to that role&apos;s defaults.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Active account
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || !fullName.trim()}
            onClick={() =>
              mutation.mutate({
                id: user._id,
                data: {
                  fullName: fullName.trim(),
                  role,
                  isActive,
                },
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
