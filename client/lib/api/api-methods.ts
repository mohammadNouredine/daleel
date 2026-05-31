import axiosClient from "@/lib/axios-client"

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
      response?: { data?: { message?: string } }
    }
    throw new Error(
      axiosError.response?.data?.message ?? "Cannot load data"
    )
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
      response?: { data?: { error?: string; message?: string } }
    }
    throw new Error(
      axiosError.response?.data?.error ??
        axiosError.response?.data?.message ??
        "Cannot send request"
    )
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
      response?: { data?: { error?: string; message?: string } }
    }
    throw new Error(
      axiosError.response?.data?.error ??
        axiosError.response?.data?.message ??
        "Cannot send request"
    )
  }
}
