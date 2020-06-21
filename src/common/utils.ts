/**
 * Helper for displaying additional error messages when in debug more.
 *
 * @param message normal message to show to users
 * @param debugMessage additional message to show in debug mode
 * @returns error object with correct message content
 */
export function debugError(message: string, debugMessage?: string): Error {
    return Deno.env.get("DENO_ENV") === "debug"
        ? Error(`${message}\n${debugMessage}`)
        : Error(message)
}
