import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  AdminError,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  SubmitButton,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import { getAdminProfile, saveProfile } from "@/lib/cms/db"
import { parseProfileFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Profile",
}

export default async function AdminProfilePage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  const profile = getAdminProfile()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="Profile"
        description="编辑首页和 About 页面使用的公开个人资料。"
      />
      <AdminError message={params?.error} />
      <AdminPanel>
        <form action={saveProfileAction} className="grid gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="姓名" name="name" defaultValue={profile.name} required />
            <AdminField
              label="角色"
              name="roleLine"
              defaultValue={profile.roleLine}
              required
            />
            <AdminField label="邮箱" name="email" defaultValue={profile.email} required />
            <AdminField
              label="Hero 标题"
              name="heroTitle"
              defaultValue={profile.heroTitle}
              required
            />
          </div>
          <AdminField
            label="Hero 简介"
            name="heroIntro"
            defaultValue={profile.heroIntro}
            textarea
            required
          />
          <AdminField
            label="About 摘要"
            name="aboutSummary"
            defaultValue={profile.aboutSummary}
            textarea
            required
          />
          <AdminField
            label="长介绍（每行一段）"
            name="longBio"
            defaultValue={profile.longBio.join("\n")}
            textarea
          />
          <AdminField
            label="技能（每行一项）"
            name="skills"
            defaultValue={profile.skills.join("\n")}
            textarea
          />
          <AdminField
            label="证书（每行一项）"
            name="certifications"
            defaultValue={profile.certifications.join("\n")}
            textarea
          />
          <div>
            <SubmitButton />
          </div>
        </form>
      </AdminPanel>
    </>
  )
}

async function saveProfileAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const result = parseProfileFormData(formData)

  if (!result.ok) {
    redirect(`/admin/profile?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  saveProfile(result.value)
  revalidatePath("/")
  revalidatePath("/about")
  redirect("/admin/profile")
}
