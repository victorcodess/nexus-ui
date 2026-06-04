export const ASK_AI_CLIENT_ID_HEADER = "x-ask-ai-client-id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validated browser session id (only used when IP is unknown). */
export function parseAskAiClientSessionId(headers: Headers): string | null {
  const raw = headers.get(ASK_AI_CLIENT_ID_HEADER)?.trim();
  if (!raw || !UUID_RE.test(raw)) return null;
  return raw;
}
