import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  AdminError,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  StatusSelect,
  SubmitButton,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import {
  deleteEssay,
  getAdminEssays,
  saveEssay,
  toggleEssayStatus,
} from "@/lib/cms/db"
import { parseEssayFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Essays",
}

export default async function AdminEssaysPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  const essays = getAdminEssays()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader title="Essays" description="管理正式文章，只有 published 会出现在前台。" />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <EssayForm title="新建文章" />
        {essays.map((essay) => (
          <EssayForm
            key={essay.slug}
            title={essay.title}
            essay={{
              ...essay,
              tagsText: essay.tags.join(", "),
            }}
          />
        ))}
      </div>
    </>
  )
}

function EssayForm({
  title,
  essay,
}: {
  readonly title: string
  readonly essay?: {
    readonly slug: string
    readonly title: string
    readonly description: string
    readonly content: string
    readonly publishedAt: string
    readonly readingTime: string
    readonly tagsText: string
    readonly status: string
  }
}) {
  const isExisting = Boolean(essay)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">{title}</summary>
        <form action={essayAction} className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70">
          <input type="hidden" name="intent" value="save" />
          <div className="grid gap-4 md:grid-cols-3">
            <AdminField
              label="Slug"
              name="slug"
              defaultValue={essay?.slug}
              required
              readOnly={isExisting}
            />
            <AdminField label="标题" name="title" defaultValue={essay?.title} required />
            <AdminField
              label="发布时间"
              name="publishedAt"
              defaultValue={essay?.publishedAt}
              required
            />
            <AdminField
              label="阅读时间"
              name="readingTime"
              defaultValue={essay?.readingTime ?? "3 min read"}
              required
            />
            <AdminField label="标签" name="tags" defaultValue={essay?.tagsText} />
            <StatusSelect defaultValue={essay?.status ?? "draft"} />
          </div>
          <AdminField
            label="描述"
            name="description"
            defaultValue={essay?.description}
            textarea
            required
          />
          <AdminField
            label="正文"
            name="content"
            defaultValue={essay?.content}
            textarea
            required
          />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <button
                  formAction={essayAction}
                  name="intent"
                  value="toggle"
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  切换发布状态
                </button>
                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  <input name="confirmDelete" type="checkbox" /> 确认删除
                </label>
                <button
                  formAction={essayAction}
                  name="intent"
                  value="delete"
                  className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  删除
                </button>
              </>
            ) : null}
          </div>
        </form>
      </details>
    </AdminPanel>
  )
}

async function essayAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const slug = String(formData.get("slug") ?? "")

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/essays?error=删除前需要勾选确认")
    }
    deleteEssay(slug)
    revalidateContent()
    redirect("/admin/essays")
  }

  if (intent === "toggle") {
    toggleEssayStatus(slug)
    revalidateContent()
    redirect("/admin/essays")
  }

  const result = parseEssayFormData(formData)

  if (!result.ok) {
    redirect(`/admin/essays?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  saveEssay(result.value)
  revalidateContent()
  redirect("/admin/essays")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/essays")
  revalidatePath("/rss.xml")
  revalidatePath("/sitemap.xml")
}
