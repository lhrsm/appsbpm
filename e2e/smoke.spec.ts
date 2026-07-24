import { test, expect } from "@playwright/test";

test.describe("Portal do Associado — smoke", () => {
  test("home mostra tela de login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SBPM|Portal/i);
    await expect(page.getByPlaceholder(/matr[íi]cula|cpf/i)).toBeVisible();
  });

  test("login com matrícula demo abre dashboard", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/matr[íi]cula|cpf/i).fill("123456");
    await page.getByRole("button", { name: /entrar|acessar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/carteirinha/i).first()).toBeVisible();
  });

  test("página de privacidade acessível sem login", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("manifest e SW registrados (PWA)", async ({ page }) => {
    await page.goto("/");
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBeTruthy();
  });
});
