const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function api(path, method = "GET", body) {
  try {
    const res = await fetch(API + path, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await res.json();
  } catch (error) {
    console.error("API error:", error.message);
    return { success: false, message: "Could not connect to server" };
  }
}
