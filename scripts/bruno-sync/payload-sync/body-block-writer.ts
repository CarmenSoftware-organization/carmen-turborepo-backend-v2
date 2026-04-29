import type { JsonValue } from '../types';

const BODY_JSON_BLOCK_RE = /body:json\s*\{([\s\S]*?)\n\}/m;
const HEADERS_BLOCK_END_RE = /(headers\s*\{[\s\S]*?\n\})\s*\n/;

export function formatPayload(value: JsonValue): string {
  const json = JSON.stringify(value, null, 2);
  return json
    .split('\n')
    .map((line) => '  ' + line) // 2-space outer indent for body:json contents
    .join('\n');
}

export function replaceBodyJsonBlock(text: string, payload: JsonValue): string {
  const formatted = formatPayload(payload);
  const newBlock = `body:json {\n${formatted}\n}`;
  if (BODY_JSON_BLOCK_RE.test(text)) {
    return text.replace(BODY_JSON_BLOCK_RE, newBlock);
  }
  // No existing body:json block — insert after headers block
  const m = text.match(HEADERS_BLOCK_END_RE);
  if (m) {
    return text.replace(
      HEADERS_BLOCK_END_RE,
      `${m[1]}\n\n${newBlock}\n\n`,
    );
  }
  // Fallback: append at end
  return text.trimEnd() + '\n\n' + newBlock + '\n';
}
