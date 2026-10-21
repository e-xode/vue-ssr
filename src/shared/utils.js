import { HTML_ESCAPES } from '#src/shared/const.js';

export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[&<>"']/g, (m) => HTML_ESCAPES[m]);
}

export function readString(value) {
  return typeof value === 'string' ? value : null;
}

export function readEmail(value) {
  const text = readString(value);
  if (text === null) return null;
  const email = text.trim().toLowerCase();
  return email || null;
}

export function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
