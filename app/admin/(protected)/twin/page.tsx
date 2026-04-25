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
import { getTwinIdentity, saveTwinIdentity } from "@/lib/cms/db"
import { parseTwinIdentityFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Twin",
}

export default async function AdminTwinPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  await requireAdminSession("/admin/twin")

  const identity = getTwinIdentity()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="Twin Identity"
        description="维护数字分身的人格、语气和边界规则。"
      />
      <AdminError message={params?.error} />
      <AdminPanel>
        <form action={saveTwinAction} className="grid gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="显示名称"
              name="displayName"
              defaultValue={identity.displayName}
              required
            />
            <AdminField
              label="副标题"
              name="subtitle"
              defaultValue={identity.subtitle}
              required
            />
          </div>
          <AdminField
            label="头像描述"
            name="avatarDescription"
            defaultValue={identity.avatarDescription}
            textarea
            required
          />
          <AdminField
            label="第一人称风格"
            name="firstPersonStyle"
            defaultValue={identity.firstPersonStyle}
            textarea
            required
          />
          <AdminField
            label="代理口吻风格"
            name="thirdPersonStyle"
            defaultValue={identity.thirdPersonStyle}
            textarea
            required
          />
          <AdminField
            label="价值观（每行一项）"
            name="values"
            defaultValue={identity.values.join("\n")}
            textarea
          />
          <AdminField
            label="沟通规则（每行一项）"
            name="communicationRules"
            defaultValue={identity.communicationRules.join("\n")}
            textarea
          />
          <AdminField
            label="隐私规则（每行一项）"
            name="privacyRules"
            defaultValue={identity.privacyRules.join("\n")}
            textarea
          />
          <AdminField
            label="不确定性规则（每行一项）"
            name="uncertaintyRules"
            defaultValue={identity.uncertaintyRules.join("\n")}
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

async function saveTwinAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const result = parseTwinIdentityFormData(formData)

  if (!result.ok) {
    redirect(
      `/admin/twin?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`
    )
  }

  saveTwinIdentity(result.value)
  revalidatePath("/")
  revalidatePath("/admin")
  redirect("/admin/twin")
}
