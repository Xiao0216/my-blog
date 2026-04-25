import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  ADMIN_SESSION_COOKIE,
  getSafeAdminNextPath,
  verifyAdminSessionCookieValue,
} from "@/lib/admin-auth"

export async function requireAdminSession(nextPath: unknown = "/admin") {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!verifyAdminSessionCookieValue(sessionValue)) {
    const safeNextPath = getSafeAdminNextPath(nextPath)

    redirect(`/admin/login?next=${encodeURIComponent(safeNextPath)}`)
  }
}
