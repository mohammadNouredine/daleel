"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FormRoot } from "@/components/forms/FormRoot"
import { PasswordInput } from "@/components/forms/PasswordInput"
import { TextInput } from "@/components/forms/TextInput"
import { UserAvatar } from "@/components/UserAvatar"
import { useAuthState } from "@/features/auth/hooks/use-is-authenticated"
import { useChangePassword } from "@/features/auth/hooks/use-change-password"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/change-password.schema"
import { PageShell } from "@/components/layout/PageShell"
import { useCurrentProfile } from "../hooks/use-current-profile"
import { useUpdateMyProfile } from "../hooks/use-update-my-profile"
import {
  buildProfileImageFormData,
  useUploadProfileImage,
} from "../hooks/use-upload-profile-image"
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "../schemas/update-profile.schema"

export function AccountSettingsView() {
  const router = useRouter()
  const { isAuthenticated, isReady } = useAuthState()
  const { data: profile } = useCurrentProfile()
  const updateProfile = useUpdateMyProfile()
  const uploadProfileImage = useUploadProfileImage()
  const changePassword = useChangePassword({
    onSuccess: () => {
      passwordForm.reset()
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImageUrl, setPendingImageUrl] = useState<
    string | null | undefined
  >(undefined)

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      whatsappNumber: "",
    },
  })

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, isReady, router])

  useEffect(() => {
    if (!profile) return

    profileForm.reset({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? "",
      whatsappNumber: profile.whatsappNumber ?? "",
    })
    setPendingImageUrl(undefined)
  }, [profile, profileForm])

  const displayImage =
    pendingImageUrl !== undefined ? pendingImageUrl : profile?.profileImage

  const handleProfileSubmit = (values: UpdateProfileFormValues) => {
    const payload: Parameters<typeof updateProfile.mutate>[0] = {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber?.trim() || null,
      whatsappNumber: values.whatsappNumber?.trim() || null,
    }

    if (pendingImageUrl !== undefined) {
      payload.profileImage = pendingImageUrl
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setPendingImageUrl(undefined)
      },
      onError: (error) => {
        profileForm.setError("root", { message: error.message })
      },
    })
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    uploadProfileImage.mutate(buildProfileImageFormData(file), {
      onSuccess: (data) => {
        setPendingImageUrl(data.url)
      },
      onError: (error) => {
        profileForm.setError("root", { message: error.message })
      },
    })

    event.target.value = ""
  }

  const handleRemoveImage = () => {
    setPendingImageUrl(null)
  }

  const handlePasswordSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      },
      {
        onError: (error) => {
          passwordForm.setError("root", { message: error.message })
        },
      }
    )
  }

  if (!isReady || !isAuthenticated) {
    return null
  }

  return (
    <PageShell title="Account settings" description="Manage your profile and password.">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your name, contact details, and profile photo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRoot
              form={profileForm}
              onSubmit={handleProfileSubmit}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={displayImage}
                  name={profile?.fullName}
                  size="lg"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadProfileImage.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 size-4" />
                    {uploadProfileImage.isPending ? "Uploading…" : "Change photo"}
                  </Button>
                  {displayImage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              <TextInput name="fullName" label="Full name" />
              <TextInput
                name="phoneNumber"
                label="Phone number"
                placeholder="+96170123456"
              />
              <TextInput
                name="whatsappNumber"
                label="WhatsApp number"
                placeholder="+96170123456"
              />

              {profileForm.formState.errors.root ? (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.root.message}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={
                  updateProfile.isPending || uploadProfileImage.isPending
                }
              >
                {updateProfile.isPending ? "Saving…" : "Save profile"}
              </Button>
            </FormRoot>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              Use a strong password you do not use elsewhere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRoot
              form={passwordForm}
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
            >
              <PasswordInput name="currentPassword" label="Current password" />
              <PasswordInput name="newPassword" label="New password" />
              <PasswordInput
                name="confirmPassword"
                label="Confirm new password"
              />

              {passwordForm.formState.errors.root ? (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.root.message}
                </p>
              ) : null}

              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? "Updating…" : "Update password"}
              </Button>
            </FormRoot>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
