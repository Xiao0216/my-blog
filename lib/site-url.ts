const FALLBACK_SITE_URL = "http://localhost:3000/"

function withDefaultScheme(value: string): string {
  if (value.includes("://")) {
    return value
  }

  if (value.startsWith("localhost") || value.startsWith("127.0.0.1")) {
    return `http://${value}`
  }

  return `https://${value}`
}

export function normalizeSiteUrl(rawSiteUrl: string): string {
  const trimmedSiteUrl = rawSiteUrl.trim()

  if (!trimmedSiteUrl) {
    return FALLBACK_SITE_URL
  }

  try {
    const url = new URL(withDefaultScheme(trimmedSiteUrl))

    url.pathname = "/"
    url.search = ""
    url.hash = ""

    return url.toString()
  } catch {
    return FALLBACK_SITE_URL
  }
}

export function toAbsoluteSiteUrl(path: string, siteUrl: string): string {
  return new URL(path, normalizeSiteUrl(siteUrl)).toString()
}
