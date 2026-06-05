import axiosClient from "@/lib/axios-client"
import { ApiError, extractApiErrorMessage } from "@/lib/api/client"

export const getFromApi = async <TData = unknown>(
  endpoint: string,
  withoutPrefix = true,
  params?: Record<string, unknown>
): Promise<TData> => {
  try {
    const result = await axiosClient.get<TData>(
      withoutPrefix ? endpoint : endpoint,
      { params }
    )
    const body = result.data as { error?: string }
    if (body && typeof body === "object" && "error" in body && body.error) {
      throw new Error(body.error)
    }
    return result.data
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown }
    }
    const status = axiosError.response?.status ?? 0
    const message = extractApiErrorMessage(
      axiosError.response?.data,
      "Cannot load data"
    )
    throw new ApiError(message, status, axiosError.response?.data)
  }
}

export const sendToApi = async <TData = unknown>(
  endpoint: string,
  data: unknown,
  method: "POST" | "PATCH" | "DELETE",
  withoutPrefix = true
): Promise<TData> => {
  try {
    const url = withoutPrefix ? endpoint : endpoint
    let result

    if (method === "POST") {
      result = await axiosClient.post<TData>(url, data)
    } else if (method === "PATCH") {
      result = await axiosClient.patch<TData>(url, data)
    } else {
      result = await axiosClient.delete<TData>(url, { params: data })
    }

    return result.data
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown }
    }
    const status = axiosError.response?.status ?? 0
    const message = extractApiErrorMessage(
      axiosError.response?.data,
      "Cannot send request"
    )
    throw new ApiError(message, status, axiosError.response?.data)
  }
}

export const sendFormDataToApi = async <TData = unknown>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PATCH",
  withoutPrefix = true
): Promise<TData> => {
  try {
    const url = withoutPrefix ? endpoint : endpoint
    const result =
      method === "POST"
        ? await axiosClient.post<TData>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await axiosClient.patch<TData>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })

    return result.data
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown }
    }
    const status = axiosError.response?.status ?? 0
    const message = extractApiErrorMessage(
      axiosError.response?.data,
      "Cannot send request"
    )
    throw new ApiError(message, status, axiosError.response?.data)
  }
}
