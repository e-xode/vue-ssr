const UNSAFE_SCRIPT_CHARS = /[<>&\u2028\u2029]/g;

function escapeUnicode(char) {
  return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

export function serializeForScript(value) {
  const json = JSON.stringify(value) ?? 'null';
  return json.replace(UNSAFE_SCRIPT_CHARS, escapeUnicode);
}
