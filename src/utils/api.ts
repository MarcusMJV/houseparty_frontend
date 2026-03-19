const base = import.meta.env.VITE_API_BASE_URL as string

export const API_BASE = base
export const WS_BASE = base.replace(/^http/, 'ws')
