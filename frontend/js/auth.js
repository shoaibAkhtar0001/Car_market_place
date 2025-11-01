// Simple API helper for auth
const API_BASE = 'http://localhost:5000/api';

const api = {
  async request(method, path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || `Request failed with ${res.status}`;
      throw new Error(msg);
    }
    return data;
  },
  get(path, auth = false) {
    return this.request('GET', path, undefined, auth);
  },
  post(path, body, auth = false) {
    return this.request('POST', path, body, auth);
  }
};
