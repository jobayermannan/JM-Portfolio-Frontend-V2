import { trainingFromCourse } from '../data/training.js';
// Keep relative configuration rooted at the origin, including on /admin routes.
export function normalizeApiUrl(value = '/api/v1') {
  const base = value.trim().replace(/\/+$/, '');
  const rooted = /^https?:\/\//i.test(base) || base.startsWith('/') ? base : `/${base}`;
  return rooted.endsWith('/api/v1') ? rooted : `${rooted === '/' ? '' : rooted}/api/v1`;
}
export const API_URL = normalizeApiUrl(import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL);
const TOKEN_KEY = 'portfolio-admin-token';
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const clearSession = () => sessionStorage.removeItem(TOKEN_KEY);

export async function request(path, { method = 'GET', body, admin = false } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method, signal: controller.signal, cache: 'no-store',
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(admin && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.success === false) {
      const error = Object.assign(new Error(data?.message || `Request failed (${response.status}).`), { status: response.status });
      if (admin && response.status === 401) {
        clearSession();
        window.dispatchEvent(new Event('portfolio-session-expired'));
      }
      throw error;
    }
    if (!data) throw new Error('The API did not return JSON. Check the API URL.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please retry.');
    if (error instanceof TypeError) throw new Error('Cannot connect to the portfolio server. Please retry.');
    throw error;
  } finally { clearTimeout(timeout); }
}

// Deduplicate simultaneous section requests, but never keep a stale successful response.
let pendingPortfolio;
export function getPortfolio() {
  if (!pendingPortfolio) pendingPortfolio = request('/portfolio-data').finally(() => { pendingPortfolio = null; });
  return pendingPortfolio;
}
const withId = item => ({ ...item, id: item._id || item.id });
export function heroFromIntro(intro = {}) {
  const keys = ['heroHeadline', 'heroAccentWord', 'heroSubtextWhite', 'heroSubtextGray'];
  return Object.fromEntries(keys.map(key => [key, intro[key] ?? '']));
}
export function profileFromPortfolio(data) {
  const intro = data.intro || {};
  const contact = data.contact || {};
  return {
    ...intro,
    fullName: [intro.firstName, intro.lastName].filter(Boolean).join(' ') || contact.name || 'Portfolio',
    avatar: intro.avatar || '',
    ...heroFromIntro(intro),
    social: { ...contact.social, email: contact.email }, contact,
    experience: (data.experiences || []).map(withId),
  };
}
export async function getProfile() { return profileFromPortfolio(await getPortfolio()); }
export async function getSkills() {
  const data = await getPortfolio();
  const about = data.about || {};
  return { about, skills: about.skills || [] };
}
export async function getEducation() { return ((await getPortfolio()).education || []).map(withId); }
export async function getProjects() {
  return ((await getPortfolio()).projects || []).map(item => ({ ...withId(item), category: item.category || 'Other' }));
}
export async function getDataMlProjects() {
  return ((await getPortfolio()).dataMlProjects || []).filter(item => item.visible !== false).map(withId);
}
export async function getSectionSettings() { return (await getPortfolio()).about || {}; }
export async function getCourses() { return ((await getPortfolio()).courses || []).map(item => withId(trainingFromCourse(item))); }
export async function getBlogs() {
  return ((await getPortfolio()).blogs || []).map(item => ({ ...withId(item), content: item.content || '', year: item.date?.slice(0, 4) || '' }));
}
export async function getBlogBySlug(slug) {
  const blog = (await getBlogs()).find(item => item.slug === slug);
  if (!blog) throw new Error('Article not found.');
  return blog;
}
export function sendMessage(payload) {
  return request('/send-message', { method: 'POST', body: payload });
}
export async function login(username, password) {
  const data = await request('/admin-login', { method: 'POST', body: { username, password } });
  if (!data.token) throw new Error('The backend needs to be updated before admin login can be used.');
  sessionStorage.setItem(TOKEN_KEY, data.token);
  return data;
}
export async function logout() {
  await request('/admin-logout', { method: 'POST', admin: true });
  clearSession();
}
export const checkSession = () => request('/admin-session', { admin: true });
export const getMessages = (page = 1) => request(`/messages?page=${page}`, { admin: true });
// Broadcast invalidation only; every tab reads the authoritative database state.
const portfolioChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('portfolio-content') : null;
portfolioChannel?.unref?.();
export function subscribePortfolioChanges(refresh) {
  const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
  portfolioChannel?.addEventListener('message', refresh);
  window.addEventListener('portfolio-content-changed', refresh);
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', onVisible);
  const timer = setInterval(onVisible, 15000);
  return () => {
    portfolioChannel?.removeEventListener('message', refresh);
    window.removeEventListener('portfolio-content-changed', refresh);
    window.removeEventListener('focus', refresh);
    document.removeEventListener('visibilitychange', onVisible);
    clearInterval(timer);
  };
}
export async function saveContent(section, data, singleton = false) {
  const result = await request(`/${singleton || data._id ? 'update' : 'add'}-${section}`, { method: 'POST', body: data, admin: true });
  if (section === 'course') {
    const normalize = value => typeof value === 'string' ? value.trim() : value;
    const fields = ['title', 'provider', 'type', 'status', 'duration', 'dateLabel', 'shortDescription', 'technologies', 'visible', 'displayOrder', 'certificateUrl'];
    if (fields.some(key => Object.hasOwn(data, key) && JSON.stringify(normalize(data[key])) !== JSON.stringify(normalize(result.data?.[key])))) {
      throw new Error('Training fields were not saved. Restart the backend with the updated Course schema and retry.');
    }
  }
  const visibilityKeys = Object.keys(data).filter(key => key.endsWith('SectionVisible'));
  const trainingKeys = ['coursesTitle', 'coursesSubtitle'].filter(key => Object.hasOwn(data, key));
  if (section === 'about' && (visibilityKeys.length || Object.hasOwn(data, 'skillCategories') || trainingKeys.length)) {
    const persisted = (await request('/portfolio-data')).about;
    if (trainingKeys.some(key => persisted?.[key] !== data[key]?.trim())) throw new Error('Training section settings were not saved. Restart the updated backend and retry.');
    if (visibilityKeys.some(key => persisted?.[key] !== data[key])) {
      throw new Error('Visibility was not saved by the server. Restart the backend with the updated code and retry.');
    }
    if (Object.hasOwn(data, 'skillCategories')) {
      const text = value => typeof value === 'string' ? value.trim() : value;
      const normalize = categories => JSON.stringify(categories?.map(category => ({
        name: text(category.name), description: text(category.description || ''), visible: category.visible !== false, order: category.order ?? 0,
        skills: (category.skills || []).map(skill => ({ name: text(skill.name),
          visible: skill.visible !== false, order: skill.order ?? 0, icon: text(skill.icon || '') })),
      })));
      if (normalize(persisted?.skillCategories) !== normalize(data.skillCategories) || !Array.isArray(persisted?.skillCategories) ||
        ['skillsTitle', 'skillsSubtitle'].some(key => Object.hasOwn(data, key) && text(persisted?.[key]) !== text(data[key]))) {
        throw new Error('Skills were not saved by the server. Restart the backend with the updated schema and retry.');
      }
    }
    result.data = persisted;
  }
  pendingPortfolio = null;
  portfolioChannel?.postMessage('changed');
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('portfolio-content-changed'));
  return result;
}
export async function deleteContent(section, id) {
  const result = await request(`/delete-${section}`, { method: 'POST', body: { _id: id }, admin: true });
  if (section === 'course') {
    pendingPortfolio = null;
    portfolioChannel?.postMessage('changed');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('portfolio-content-changed'));
  }
  return result;
}
export async function uploadImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Choose a JPEG, PNG, or WebP image under 8 MB.');
  const response = await fetch(`${API_URL}/upload-image`, {
    method: 'POST', headers: { 'Content-Type': file.type, Authorization: `Bearer ${getToken()}` }, body: file,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || 'Image upload failed.');
  return result.data;
}
