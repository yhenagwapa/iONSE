// @ts-check
import { test, expect } from "@playwright/test";

test("Can access page link", async ({ page }) => {
  const response = await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");
  await expect(response?.ok()).toBeTruthy();
});

test("Can login using valid credentials.", async ({ page }) => {
  await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

  await page.locator("#account").fill("username1");
  await page.locator("#password").fill("password");
  await page.locator("#privacy").setChecked(true);

  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForTimeout(3000);

  // after login
  const token = await page.evaluate(() => localStorage.getItem('auth-token'));
  expect(token).not.toBeNull();
});

test("Cannot login using invalid credentials.", async ({ page }) => {
  await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

  await page.locator("#account").fill("username");
  await page.locator("#password").fill("password");
  await page.locator("#privacy").setChecked(true);

  await page.getByRole("button", { name: "Login" }).click();

  const text = await page.locator('//*[@id="app"]/main/div/div/div[1]/form/div[2]/div[2]/p').innerText();

  await expect(text).toBe('Invalid username or password.');    
});

test("Leave one or more required fields empty.", async ({ page }) => {
  await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

  //leave all field empty
  await page.getByRole("button", { name: "Login" }).click();

  const usernameError = await page.locator('//*[@id="app"]/main/div/div/div[1]/form/div[1]/div/p').innerText();
  await expect(usernameError).toBe('The username field is required.');

  const passwordError = await page.locator('//*[@id="app"]/main/div/div/div[1]/form/div[2]/div[2]/p').innerText();
  await expect(passwordError).toBe('The password field is required.');

  await page.reload();

  //leave username empty
  await page.locator("#password").fill("password");
  await page.getByRole("button", { name: "Login" }).click();

  const usernameError2 = await page.locator('//*[@id="app"]/main/div/div/div[1]/form/div[1]/div/p').innerText();
  await expect(usernameError2).toBe('The username field is required.');

  await page.reload();

  //leave password empty
  await page.locator("#account").fill("username");
  await page.getByRole("button", { name: "Login" }).click();

  const passwordError2 = await page.locator('//*[@id="app"]/main/div/div/div[1]/form/div[2]/div[2]/p').innerText();
  await expect(passwordError2).toBe('The password field is required.');

  await page.reload();

  //leave privacy empty
  await page.locator("#account").fill("username");
  await page.locator("#password").fill("password");
  await page.getByRole("button", { name: "Login" }).click();

  const privacyError = await page.locator('//*[@id="app"]/main/div/div/div[1]/form/div[4]/div/div[2]/span[2]').innerText();
  await expect(privacyError).toBe('Please check this box if you want to proceed.');
});
