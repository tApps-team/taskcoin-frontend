/** Where to send someone after they sign in, or null if we should not obey.
 *
 *  The value arrives in the query string, so it is attacker-controlled: handing
 *  it straight to `navigate` would turn our own sign-in page into a springboard
 *  for phishing. `//evil.com` and `/\evil.com` look local but are
 *  protocol-relative URLs, which is why a leading slash alone is not enough.
 */
export function safeInternalPath(raw: string | null | undefined): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null
  return raw
}
