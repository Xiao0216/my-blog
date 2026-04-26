import { expect, test } from "@playwright/test"

const adminPassword =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "playwright-admin-password"

test.describe("release smoke", () => {
  test("renders the public homepage and article pages", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("null-space-shell")).toBeVisible()
    await expect(page.getByRole("link", { name: "新建" })).toHaveAttribute(
      "href",
      "/admin/inbox"
    )

    await page.goto("/essays")
    await expect(page.getByRole("heading", { name: "正式文章" })).toBeVisible()

    await page
      .getByRole("link", { name: "医疗系统前端工程化实践" })
      .click()
    await expect(page).toHaveURL(/\/essays\/healthcare-frontend-engineering$/)
    await expect(
      page.getByRole("heading", { name: "医疗系统前端工程化实践" })
    ).toBeVisible()
  })

  test("renders a nonblank minimal Three.js canvas", async ({ page }) => {
    await page.goto("/")

    const canvas = page.locator('[data-testid="minimal-three-scene"] canvas')
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(240)
    expect(box?.height ?? 0).toBeGreaterThan(180)

    await expect
      .poll(async () =>
        canvas.evaluate((node) => {
          const canvasNode = node as HTMLCanvasElement
          return canvasNode.width > 240 && canvasNode.height > 120
        })
      )
      .toBe(true)

    const sample = await canvas.evaluate((node) => {
      const canvasNode = node as HTMLCanvasElement
      const context =
        canvasNode.getContext("webgl2", { preserveDrawingBuffer: true }) ??
        canvasNode.getContext("webgl", { preserveDrawingBuffer: true })

      if (!context) {
        return {
          hasContext: false,
          height: canvasNode.height,
          nonBlackPixels: 0,
          width: canvasNode.width,
        }
      }

      const width = Math.max(1, canvasNode.width)
      const height = Math.max(1, canvasNode.height)
      const pixels = new Uint8Array(4 * 20 * 20)

      context.readPixels(
        Math.max(0, Math.floor(width / 2) - 10),
        Math.max(0, Math.floor(height / 2) - 10),
        20,
        20,
        context.RGBA,
        context.UNSIGNED_BYTE,
        pixels
      )

      const nonBlackPixels = Array.from({ length: 400 }).filter((_, index) => {
        const offset = index * 4
        return pixels[offset] + pixels[offset + 1] + pixels[offset + 2] > 12
      }).length

      return {
        hasContext: true,
        height,
        nonBlackPixels,
        width,
      }
    })

    expect(sample.hasContext).toBe(true)
    expect(sample.width).toBeGreaterThan(240)
    expect(sample.height).toBeGreaterThan(120)
    expect(sample.nonBlackPixels).toBeGreaterThan(0)
  })

  test("logs in and opens the AI inbox", async ({ page }) => {
    await page.goto("/admin/inbox")

    await expect(page).toHaveURL(/\/admin\/login\?next=/)
    await page.getByLabel("管理员密码").fill(adminPassword)
    await page.getByRole("button", { name: "登录" }).click()

    await expect(page).toHaveURL(/\/admin\/inbox$/)
    await expect(page.getByRole("heading", { name: "智能收件箱" })).toBeVisible()
    await expect(page.getByLabel("原始文本")).toBeVisible()
  })

  test("returns a digital twin fallback without model credentials", async ({
    page,
  }) => {
    await page.goto("/")

    await page
      .getByRole("button", { name: "展开数字分身" })
      .click({ force: true })
    await page
      .getByPlaceholder("搜索或和数字分身聊聊...")
      .fill("你怎么看前端工程化?")
    await page.getByRole("button", { name: "发送给数字分身" }).click()

    await expect(page.getByText(/离线模式/)).toBeVisible()
  })
})
