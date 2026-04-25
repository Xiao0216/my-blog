import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookieValue } from "@/lib/admin-auth"

export async function requireAdminSession(nextPath = "/admin") {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!verifyAdminSessionCookieValue(sessionValue)) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`)
  }
}
