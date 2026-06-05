export type SignInBody = {
  email: string
  password: string
}

export type SignUpBody = {
  email: string
  password: string
  name: string
  phoneNumber?: string
  whatsappNumber?: string
}

export type VerifyOtpBody = {
  email: string
  otp: string
}

export type OtpMessageResponse = {
  message: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
  image: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  phoneNumber?: string
  whatsappNumber?: string
  role?: string
}

export type AuthResponse = {
  token?: string | null
  user: AuthUser
  redirect?: boolean
  url?: string
}

export type RequestPasswordResetBody = {
  email: string
  redirectTo: string
}

export type ResetPasswordBody = {
  newPassword: string
  token: string
}

export type ChangePasswordBody = {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

export type PasswordStatusResponse = {
  status: boolean
  message?: string
}

export type ChangePasswordResponse = {
  token: string | null
  user: AuthUser
}
