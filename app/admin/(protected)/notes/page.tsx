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
import { deleteNote, getAdminNotes, saveNote, toggleNoteStatus } from "@/lib/cms/db"
import { parseNoteFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Notes",
}

export default async function AdminNotesPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  await requireAdminSession("/admin/notes")

  const notes = getAdminNotes()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader title="Notes" description="管理首页和 Notes 页面显示的短内容。" />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <NoteForm title="新建笔记" />
        {notes.map((note) => (
          <NoteForm key={note.slug} title={note.title} note={note} />
        ))}
      </div>
    </>
  )
}

function NoteForm({
  title,
  note,
}: {
  readonly title: string
  readonly note?: {
    readonly slug: string
    readonly title: string
    readonly body: string
    readonly publishedAt: string
    readonly status: string
  }
}) {
  const isExisting = Boolean(note)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">{title}</summary>
        <form action={noteAction} className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70">
          <input type="hidden" name="intent" value="save" />
          <div className="grid gap-4 md:grid-cols-3">
            <AdminField
              label="Slug"
              name="slug"
              defaultValue={note?.slug}
              required
              readOnly={isExisting}
            />
            <AdminField label="标题" name="title" defaultValue={note?.title} required />
            <AdminField
              label="发布时间"
              name="publishedAt"
              defaultValue={note?.publishedAt}
              required
            />
            <StatusSelect defaultValue={note?.status ?? "draft"} />
          </div>
          <AdminField label="内容" name="body" defaultValue={note?.body} textarea required />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <button
                  formAction={noteAction}
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
                  formAction={noteAction}
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

async function noteAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const slug = String(formData.get("slug") ?? "")

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/notes?error=删除前需要勾选确认")
    }
    deleteNote(slug)
    revalidateContent()
    redirect("/admin/notes")
  }

  if (intent === "toggle") {
    toggleNoteStatus(slug)
    revalidateContent()
    redirect("/admin/notes")
  }

  const result = parseNoteFormData(formData)

  if (!result.ok) {
    redirect(`/admin/notes?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  saveNote(result.value)
  revalidateContent()
  redirect("/admin/notes")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/notes")
}
