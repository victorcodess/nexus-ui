/**
 * Builds the text used for retrieval (FlexSearch + ranking).
 * Uses all user turns in the thread so follow-ups inherit topic context.
 */
export function buildRetrievalQueryFromMessages(
  messages: Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>,
  maxChars: number,
): string {
  const userTexts: string[] = [];

  for (const message of messages) {
    if (message.role !== "user") continue;
    const text = (message.parts ?? [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();
    if (text) userTexts.push(text);
  }

  if (userTexts.length === 0) return "";
  return userTexts.join("\n").trim().slice(0, maxChars);
}

export function extractLatestUserText(
  messages: Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>,
): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role !== "user") continue;
    const text = (message.parts ?? [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();
    if (text) return text;
  }
  return "";
}
