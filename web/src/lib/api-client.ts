const API_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:4021";

export async function fetchAgentStats() {
  try {
    const res = await fetch(`${API_URL}/api/v1/stats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchNeighborhoods() {
  try {
    const res = await fetch(`${API_URL}/api/v1/neighborhoods`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchNeighborhoodDetail(zipcode: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/neighborhood/${zipcode}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchListings(params?: Record<string, string>) {
  try {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${API_URL}/api/v1/listings/search${query}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}
