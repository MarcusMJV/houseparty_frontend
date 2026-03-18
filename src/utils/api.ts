const base = import.meta.env.VITE_API_BASE_URL as string

/** HTTP base URL, e.g. http://localhost:8080 */
export const API_BASE = base

/** WebSocket base URL — http → ws, https → wss */
export const WS_BASE = base.replace(/^http/, 'ws')
