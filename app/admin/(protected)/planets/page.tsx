import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  AdminError,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  formatPlanetSize,
  StatusSelect,
  SubmitButton,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import {
  deletePlanet,
  getAdminPlanets,
  savePlanet,
  togglePlanetStatus,
} from "@/lib/cms/db"
import { parsePlanetFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "后台星球",
}

export default async function AdminPlanetsPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  await requireAdminSession("/admin/planets")

  const planets = getAdminPlanets()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="星球"
        description="管理人生宇宙中的自定义星球。只有已发布星球会出现在前台画布。"
      />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <PlanetForm title="新建星球" />
        {planets.map((planet) => (
          <PlanetForm key={planet.slug} title={planet.name} planet={planet} />
        ))}
      </div>
    </>
  )
}

function PlanetForm({
  title,
  planet,
}: {
  readonly title: string
  readonly planet?: {
    readonly slug: string
    readonly name: string
    readonly summary: string
    readonly description: string
    readonly x: number
    readonly y: number
    readonly size: string
    readonly theme: string
    readonly status: string
    readonly sortOrder: number
    readonly weight: number
  }
}) {
  const isExisting = Boolean(planet)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          {title}
        </summary>
        <form
          action={planetAction}
          className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70"
        >
          <input type="hidden" name="intent" value="save" />
          <div className="grid gap-4 md:grid-cols-4">
            <AdminField
              label="地址别名"
              name="slug"
              defaultValue={planet?.slug}
              required
              readOnly={isExisting}
            />
            <AdminField label="名称" name="name" defaultValue={planet?.name} required />
            <AdminField label="X 坐标" name="x" defaultValue={planet?.x ?? 0} required />
            <AdminField label="Y 坐标" name="y" defaultValue={planet?.y ?? 0} required />
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">尺寸</span>
              <select
                name="size"
                defaultValue={planet?.size ?? "medium"}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
              >
                <option value="small">{formatPlanetSize("small")}</option>
                <option value="medium">{formatPlanetSize("medium")}</option>
                <option value="large">{formatPlanetSize("large")}</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">主题</span>
              <select
                name="theme"
                defaultValue={planet?.theme ?? "cyan"}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
              >
                <option value="blue">蓝色</option>
                <option value="cyan">青色</option>
                <option value="emerald">绿色</option>
                <option value="teal">青绿</option>
                <option value="violet">紫色</option>
              </select>
            </label>
            <AdminField
              label="排序"
              name="sortOrder"
              defaultValue={planet?.sortOrder ?? 0}
              required
            />
            <AdminField
              label="权重"
              name="weight"
              defaultValue={planet?.weight ?? 5}
              required
            />
            <StatusSelect defaultValue={planet?.status ?? "draft"} />
          </div>
          <AdminField
            label="摘要"
            name="summary"
            defaultValue={planet?.summary}
            textarea
            required
          />
          <AdminField
            label="描述"
            name="description"
            defaultValue={planet?.description}
            textarea
          />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <button
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

async function planetAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const slug = String(formData.get("slug") ?? "")

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/planets?error=删除前需要勾选确认")
    }
    deletePlanet(slug)
    revalidateContent()
    redirect("/admin/planets")
  }

  if (intent === "toggle") {
    togglePlanetStatus(slug)
    revalidateContent()
    redirect("/admin/planets")
  }

  const result = parsePlanetFormData(formData)

  if (!result.ok) {
    redirect(
      `/admin/planets?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`
    )
  }

  savePlanet(result.value)
  revalidateContent()
  redirect("/admin/planets")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/planets")
}
