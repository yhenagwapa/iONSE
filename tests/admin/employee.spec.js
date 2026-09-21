// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial('Employee Management.', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("admin");
    await page.locator("#password").fill("password");
    await page.locator("#privacy").setChecked(true);

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).not.toBeNull();
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await page.locator('div[aria-haspopup="true"]').click();
    await page.locator('a').filter({ hasText: 'Logout' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
  });

  test('Test 1: Access Employee Management page', async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator('a').filter({ hasText: 'Management' }).click();
    await page.locator('a').filter({ hasText: 'Employee' }).click();

    //verify url is correct
    await expect(page.url()).toContain('/users');
  });

  test('Test 2: Verify Employee Management page elements', async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator('a').filter({ hasText: 'Management' }).click();
    await page.locator('a').filter({ hasText: 'Employee' }).click();

    //verify url is correct
    await expect(page.url()).toContain('/users');

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no attlogs
    if (firstRow.includes("No matching records found")) {
      console.log("No employee records found. Skipping test.");
      test.skip();
    }

    
  });

});