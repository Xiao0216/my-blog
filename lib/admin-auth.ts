import { createHmac, timingSafeEqual } from "node:crypto"

export const ADMIN_SESSION_COOKIE = "blog_admin_session"

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim()
  return password && password.length > 0 ? password : null
}

function signSession(issuedAt: number, password: string): string {
  return createHmac("sha256", `blog-admin:${password}`)
    .update(String(issuedAt))
    .digest("base64url")
}

function timingSafeTextEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function verifyAdminPassword(password: string): boolean {
  const configuredPassword = getAdminPassword()

  if (!configuredPassword) {
    return false
  }

  return timingSafeTextEqual(password, configuredPassword)
}

export function createAdminSessionCookieValue(now = Date.now()): string {
  const configuredPassword = getAdminPassword()

  if (!configuredPassword) {
    throw new Error("ADMIN_PASSWORD is required to create an admin session")
  }

  return `${now}.${signSession(now, configuredPassword)}`
}

export function verifyAdminSessionCookieValue(
  value: string | undefined | null,
  now = Date.now()
): boolean {
  const configuredPassword = getAdminPassword()

  if (!configuredPassword || !value) {
    return false
  }

  const [issuedAtText, signature, extra] = value.split(".")
  const issuedAt = Number(issuedAtText)

  if (extra !== undefined || !Number.isFinite(issuedAt)) {
    return false
  }

  if (issuedAt > now || now - issuedAt > SESSION_TTL_MS) {
    return false
  }

  return timingSafeTextEqual(signature ?? "", signSession(issuedAt, configuredPassword))
}

export function getSafeAdminNextPath(value: string | undefined | null): string {
  if (!value) {
    return "/admin"
  }

  if (value.includes("://") || value.includes("\\") || value.includes("//")) {
    return "/admin"
  }

  const [path] = value.split("?")
  const isAdminPath = path === "/admin" || path.startsWith("/admin/")
  const isLoginPath = path === "/admin/login" || path.startsWith("/admin/login/")

  if (!isAdminPath || isLoginPath) {
    return "/admin"
  }

  return path || "/admin"
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_TTL_MS / 1000,
  }
}
