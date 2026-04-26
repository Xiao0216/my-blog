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
