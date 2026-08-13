/** Extract a YouTube / YT Music playlist ID from a URL or bare ID. */
export function parsePlaylistId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^(PL|OL|UU|FL|RD)[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    const list = url.searchParams.get('list')
    if (list) return list
  } catch {
    /* not a URL */
  }

  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/)
  return match?.[1] ?? null
}
