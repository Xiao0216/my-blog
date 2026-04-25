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
  deleteProject,
  getAdminProjects,
  saveProject,
  toggleProjectStatus,
} from "@/lib/cms/db"
import { parseProjectFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Projects",
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  await requireAdminSession("/admin/projects")

  const projects = getAdminProjects()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader title="Projects" description="管理项目卡片和技术栈展示。" />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <ProjectForm title="新建项目" />
        {projects.map((project) => (
          <ProjectForm
            key={project.slug}
            title={project.title}
            project={{
              ...project,
              stackText: project.stack.join(", "),
            }}
          />
        ))}
      </div>
    </>
  )
}

function ProjectForm({
  title,
  project,
}: {
  readonly title: string
  readonly project?: {
    readonly slug: string
    readonly title: string
    readonly description: string
    readonly note: string
    readonly stackText: string
    readonly href: string
    readonly sortOrder: number
    readonly status: string
  }
}) {
  const isExisting = Boolean(project)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">{title}</summary>
        <form action={projectAction} className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70">
          <input type="hidden" name="intent" value="save" />
          <div className="grid gap-4 md:grid-cols-3">
            <AdminField
              label="Slug"
              name="slug"
              defaultValue={project?.slug}
              required
              readOnly={isExisting}
            />
            <AdminField label="标题" name="title" defaultValue={project?.title} required />
            <AdminField label="链接" name="href" defaultValue={project?.href ?? "/projects"} />
            <AdminField
              label="排序"
              name="sortOrder"
              defaultValue={project?.sortOrder ?? 0}
              required
            />
            <AdminField label="技术栈" name="stack" defaultValue={project?.stackText} />
            <StatusSelect defaultValue={project?.status ?? "draft"} />
          </div>
          <AdminField
            label="描述"
            name="description"
            defaultValue={project?.description}
            textarea
            required
          />
          <AdminField label="备注" name="note" defaultValue={project?.note} textarea required />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <button
                  formAction={projectAction}
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
                  formAction={projectAction}
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

async function projectAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const slug = String(formData.get("slug") ?? "")

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/projects?error=删除前需要勾选确认")
    }
    deleteProject(slug)
    revalidateContent()
    redirect("/admin/projects")
  }

  if (intent === "toggle") {
    toggleProjectStatus(slug)
    revalidateContent()
    redirect("/admin/projects")
  }

  const result = parseProjectFormData(formData)

  if (!result.ok) {
    redirect(`/admin/projects?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  saveProject(result.value)
  revalidateContent()
  redirect("/admin/projects")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/projects")
}
