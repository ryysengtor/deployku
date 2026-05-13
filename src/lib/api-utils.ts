/**
 * Safe JSON fetch helper to prevent JSON parse errors
 * when the server returns non-JSON responses (e.g., during hot-reload).
 */

export async function safeJsonFetch<T = Record<string, unknown>>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, options);

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { data: null, error: 'Server returned non-JSON response' };
    }

    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return { data: null, error: 'Server returned empty response' };
    }

    try {
      const data = JSON.parse(text) as T;
      return { data, error: null };
    } catch {
      return { data: null, error: 'Invalid JSON response from server' };
    }
  } catch (error) {
    return { data: null, error: 'Network error - unable to reach server' };
  }
}

/**
 * Safe wrapper for fetch().json() that handles non-JSON responses gracefully
 */
export async function safeJsonResponse<T = Record<string, unknown>>(
  response: Response
): Promise<T | null> {
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return null;
    }

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
