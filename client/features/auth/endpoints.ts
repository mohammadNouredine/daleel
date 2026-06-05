const AUTH_BASE = "/api/v1/auth"

export const AUTH_SIGN_IN = `${AUTH_BASE}/sign-in/email`
export const AUTH_REQUEST_OTP = `${AUTH_BASE}/sign-up/request-otp`
export const AUTH_VERIFY_OTP = `${AUTH_BASE}/sign-up/verify-otp`
export const AUTH_RESEND_OTP = `${AUTH_BASE}/resend-otp`
export const AUTH_REQUEST_PASSWORD_RESET = `${AUTH_BASE}/request-password-reset`
export const AUTH_RESET_PASSWORD = `${AUTH_BASE}/reset-password`
export const AUTH_CHANGE_PASSWORD = `${AUTH_BASE}/change-password`
