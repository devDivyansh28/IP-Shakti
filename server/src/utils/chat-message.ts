
import type { UIMessage } from "ai";

/**
 * Extracts plain text from an AI SDK {@link UIMessage} by joining all text parts.
 *
 * @param message - UI message with `parts` array
 * @returns Concatenated text from all `type: "text"` parts
 *
 */
export function getTextFromUIMessage(message: any): string {
    if (!message) return "";
    if (typeof message.content === "string" && message.content.length > 0) {
        return message.content;
    }
    if (Array.isArray(message.parts)) {
        return message.parts
            .filter((part: any) => part && part.type === "text")
            .map((part: any) => part.text ?? "")
            .join("");
    }
    return "";
}

/**
 * Finds the most recent non-empty user message text in a UI message array.
 *
 * Walks backwards from the end of the array (supports multi-turn history).
 *
 * @param messages - Full UI message history from the client
 * @returns Latest user message text, or `null` when none found
 *
 *
 */
export function getLastUserMessageText(messages: UIMessage[]) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message.role === "user") {
            const text = getTextFromUIMessage(message).trim();
            if (text) {
                return text;
            }
        }
    }

    return null;
}

/**
 * Builds a short conversation title from the first user message.
 *
 * Truncates to 72 characters with an ellipsis when longer.
 *
 * @param text - Raw user message text
 * @returns Title string for the conversation sidebar
 *
 */
export function buildConversationTitle(text: string) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
        return "New chat";
    }

    return normalized.length > 72
        ? `${normalized.slice(0, 72).trim()}…`
        : normalized;
}
