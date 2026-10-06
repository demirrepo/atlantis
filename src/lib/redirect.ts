/** Only allow same-site paths as post-login redirects (blocks "//evil.com" and "https://…"). */
export function safeRedirect(value: string | null | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}

/** Builds an /auth link that returns the user to `path` afterwards. */
export function authPath(path?: string, mode?: 'signin' | 'signup') {
  const params = new URLSearchParams()
  if (path && path !== '/' && !path.startsWith('/auth')) params.set('redirect', path)
  if (mode === 'signup') params.set('mode', 'signup')
  const query = params.toString()
  return query ? `/auth?${query}` : '/auth'
}
