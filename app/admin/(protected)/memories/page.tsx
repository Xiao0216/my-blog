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
import {
  deleteMemory,
  getAdminMemories,
  getAdminPlanets,
  saveMemory,
  saveMemoryById,
} from "@/lib/cms/db"
import { parseMemoryFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Memories",
}

export default async function AdminMemoriesPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  await requireAdminSession("/admin/memories")

  const memories = getAdminMemories()
  const planets = getAdminPlanets()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="Memories"
        description="管理数字分身可引用的人生记忆。private 不会出现在公开页面或模型上下文。"
      />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <MemoryForm title="新建记忆" planets={planets} />
        {memories.map((memory) => (
          <MemoryForm
            key={memory.id}
            title={memory.title}
            memory={memory}
            planets={planets}
          />
        ))}
      </div>
    </>
  )
}

function MemoryForm({
  title,
  memory,
  planets,
}: {
  readonly title: string
  readonly memory?: {
    readonly id: number
    readonly planetId: number
    readonly planetName: string
    readonly title: string
    readonly content: string
    readonly type: string
    readonly occurredAt: string
    readonly visibility: string
    readonly importance: number
    readonly tags: ReadonlyArray<string>
    readonly source: string
  }
  readonly planets: ReadonlyArray<{ readonly id: number; readonly name: string }>
}) {
  const isExisting = Boolean(memory)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          {title}
          {memory ? (
            <span className="ml-2 text-xs text-zinc-500">{memory.planetName}</span>
          ) : null}
        </summary>
        <form
          action={memoryAction}
          className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70"
        >
          <input type="hidden" name="intent" value="save" />
          {memory ? <input type="hidden" name="id" value={memory.id} /> : null}
          <div className="grid gap-4 md:grid-cols-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">星球</span>
              <select
                name="planetId"
                defaultValue={memory?.planetId}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
              >
                <option value="0">选择星球</option>
                {planets.map((planet) => (
                  <option key={planet.id} value={planet.id}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </label>
            <AdminField label="标题" name="title" defaultValue={memory?.title} required />
            <AdminField
              label="发生日期"
              name="occurredAt"
              defaultValue={memory?.occurredAt ?? new Date().toISOString().slice(0, 10)}
              required
            />
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">类型</span>
              <select
                name="type"
                defaultValue={memory?.type ?? "diary"}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
              >
                <option value="diary">diary</option>
                <option value="behavior">behavior</option>
                <option value="opinion">opinion</option>
                <option value="project">project</option>
                <option value="habit">habit</option>
                <option value="preference">preference</option>
                <option value="milestone">milestone</option>
                <option value="bio">bio</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">可见性</span>
              <select
                name="visibility"
                defaultValue={memory?.visibility ?? "assistant"}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
              >
                <option value="public">public</option>
                <option value="assistant">assistant</option>
                <option value="private">private</option>
              </select>
            </label>
            <AdminField
              label="重要度"
              name="importance"
              defaultValue={memory?.importance ?? 5}
              required
            />
            <AdminField label="标签" name="tags" defaultValue={memory?.tags.join(", ")} />
            <AdminField label="来源" name="source" defaultValue={memory?.source ?? "manual"} />
          </div>
          <AdminField
            label="内容"
            name="content"
            defaultValue={memory?.content}
            textarea
            required
          />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  <input name="confirmDelete" type="checkbox" /> 确认删除
                </label>
                <button
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

async function memoryAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const id = Number.parseInt(String(formData.get("id") ?? "0"), 10)

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/memories?error=删除前需要勾选确认")
    }
    deleteMemory(id)
    revalidateContent()
    redirect("/admin/memories")
  }

  const result = parseMemoryFormData(formData)

  if (!result.ok) {
    redirect(
      `/admin/memories?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`
    )
  }

  if (id > 0) {
    saveMemoryById(id, result.value)
  } else {
    saveMemory(result.value)
  }

  revalidateContent()
  redirect("/admin/memories")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/memories")
}
