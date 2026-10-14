const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* response had no JSON body */
    }
    const error = new Error(body?.message || `Request failed (${res.status})`);
    error.fieldErrors = body?.errors || {};
    throw error;
  }
  return res.status === 204 ? null : res.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  stats: () => request("/dashboard"),
  skills: {
    list: async () => (await request("/skills")).content,
    create: (data) => request("/skills", json("POST", data)),
    update: (id, data) => request(`/skills/${id}`, json("PUT", data)),
    remove: (id) => request(`/skills/${id}`, { method: "DELETE" }),
  },
  courses: {
    list: async () => (await request("/courses")).content,
    create: (data) => request("/courses", json("POST", data)),
    update: (id, data) => request(`/courses/${id}`, json("PUT", data)),
    remove: (id) => request(`/courses/${id}`, { method: "DELETE" }),
  },
};
