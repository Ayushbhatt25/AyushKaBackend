const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}, getToken) {
  let token = null;
  if (getToken) token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || 'Request failed');
  }
  return res.json();
}

export async function syncUser(user, getToken) {
  return apiFetch('/sync-user', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      name: user.fullName || user.firstName || 'User',
      email: user.primaryEmailAddress?.emailAddress || '',
    }),
  }, getToken);
}

export async function getProjects(getToken) {
  return apiFetch('/projects', {}, getToken);
}

export async function createProject(initial_prompt, user, getToken) {
  return apiFetch('/create-project', {
    method: 'POST',
    body: JSON.stringify({
      initial_prompt,
      userId: user?.id,
      name: user?.fullName || user?.firstName,
      email: user?.primaryEmailAddress?.emailAddress,
    }),
  }, getToken);
}

export async function refineProject(projectId, modification_prompt, getToken) {
  return apiFetch('/refine-project', {
    method: 'POST',
    body: JSON.stringify({ projectId, modification_prompt }),
  }, getToken);
}

export async function getConversation(projectId, getToken) {
  const res = await apiFetch(`/conversation/${projectId}`, {}, getToken);
  return res.messages || [];
}
