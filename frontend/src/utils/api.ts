/**
 * Custom API Client for fetching data from the backend.
 * Uses relative URLs (proxied via Next.js rewrites in next.config.ts)
 * or can fallback to direct URL.
 */

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Ensure credentials are sent (important for cookie-based auth)
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Required to send cookies (like access_token)
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let errorMessage = "An unexpected error occurred.";
      let detail = "";

      try {
        const errorData = await response.json();
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === "object" && errorData.detail?.message) {
          errorMessage = errorData.detail.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        detail = JSON.stringify(errorData.detail || "");
      } catch {
        // Response is not JSON
        errorMessage = response.statusText || `Request failed with status ${response.status}`;
      }

      const apiErr: ApiError = {
        message: errorMessage,
        status: response.status,
        detail,
      };
      throw apiErr;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    if ((error as ApiError).status !== undefined) {
      throw error;
    }
    // Network errors or others
    const apiErr: ApiError = {
      message: error instanceof Error ? error.message : "Network error. Please check if the server is running.",
      status: 0,
    };
    throw apiErr;
  }
}
