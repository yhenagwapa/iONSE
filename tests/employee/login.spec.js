// @ts-check
import { test, expect } from "@playwright/test";

test("Can access page link", async ({ page }) => {
  const response = await page.goto("https://172.26.120.49/ionse/");
  await expect(response?.ok()).toBeTruthy();
});

test("Can login using valid credentials.", async ({ page }) => {
  await page.goto("https://172.26.120.49/ionse/login");

  await page.locator('label:has-text("Active Directory")').locator('..').locator('input').fill("username");
  await page.locator("#password").fill("password");
  await page.locator("#privacy").setChecked(true);

  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForTimeout(3000);

  // after login
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).not.toBeNull();
});

test("Cannot login using invalid admin credentials.", async ({ page }) => {
  await page.goto("https://172.26.120.49/ionse/login");

  await page.fill('[name="username"]', "MSARABIA");
  await page.fill('[name="password"]', "123456");

  await page.getByRole("button", { name: "SIGN IN" }).click();

  const alert = await page.locator('//*[@id="user-alert"]/strong').innerText();

  await page.waitForTimeout(3000);

  await expect(alert).toBe("User not Found!");
});

test("Leave one or more required fields empty.", async ({ page }) => {
  await page.goto("https://172.26.120.49/ionse/");

  const usernameAlert = page.locator(".wrap-input100.rs1.validate-input");
  const passwordAlert = page.locator(
    ".wrap-input100.rs2.validate-input.alert-validate",
  );

  await page.getByRole("button", { name: "SIGN IN" }).click();

  await expect(usernameAlert).toBeVisible();
  await expect(passwordAlert).toBeVisible();

  await page.fill('[name="username"]', "MTSARABIA");
  await page.getByRole("button", { name: "SIGN IN" }).click();

  await expect(passwordAlert).toBeVisible();

  await page.fill('[name="password"]', "12345");
  await page.getByRole("button", { name: "SIGN IN" }).click();

  await expect(usernameAlert).toBeVisible();
});
