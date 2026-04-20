const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function fetcher(url) {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const error = new Error('API error');
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      error.info = { error: res.statusText };
    }
    throw error;
  }

  return res.json();
}

export async function apiPost(url, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'API error');
    error.status = res.status;
    error.info = data;
    throw error;
  }

  return data;
}

export async function apiPut(url, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'API error');
    error.status = res.status;
    error.info = data;
    throw error;
  }

  return data;
}

export async function apiDelete(url) {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'API error');
    error.status = res.status;
    error.info = data;
    throw error;
  }

  return data;
}
