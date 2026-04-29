export function isEmptyBody(rawBody: string): boolean {
  const trimmed = rawBody.trim();
  if (trimmed === '') return true;
  if (trimmed === '{}') return true;
  // Object with only whitespace or trivia inside
  const inner = trimmed.replace(/^\{/, '').replace(/\}$/, '').trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}') && inner === '') {
    return true;
  }
  return false;
}
