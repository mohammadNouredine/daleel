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
