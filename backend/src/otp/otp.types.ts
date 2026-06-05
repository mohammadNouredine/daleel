export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  whatsappNumber?: string;
}

export interface OtpIssueResult {
  otp: string;
  expiresAt: Date;
}
