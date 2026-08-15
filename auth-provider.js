(() => {
  if (location.hostname.endsWith("github.io")) return;

  async function request(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    if (response.status === 204) return null;
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      const code = data?.error || `http_${response.status}`;
      const error = new Error(code);
      error.code = code;
      throw error;
    }
    return data;
  }

  window.ELU_AUTH_PROVIDER = {
    async login(username, password) {
      return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },
    async logout() {
      await request("/api/auth/logout", { method: "POST" });
    },
    async getSession() {
      const result = await request("/api/auth/session");
      return result?.authenticated ? result : null;
    },
    async changePassword(currentPassword, newPassword) {
      return request("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
  };
})();
