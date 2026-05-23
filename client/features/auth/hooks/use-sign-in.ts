"use client";

import { useRouter } from "next/navigation";
import { usePostData } from "@/lib/api/services/use-post-data";
import { setAuthToken } from "@/lib/api/auth-token";
import { AUTH_SIGN_IN } from "../endpoints";
import type { AuthResponse, SignInBody } from "../types";

export function useSignIn() {
  const router = useRouter();

  return usePostData<SignInBody, AuthResponse>(
    {
      endpoint: AUTH_SIGN_IN,
      skipAuth: true,
      showSuccessToast: false,
      showErrorToast: false,
    },
    {
      onSuccess: ({ data }) => {
        if (data.token) setAuthToken(data.token);
        router.push("/");
      },
    },
  );
}
