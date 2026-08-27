// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial('Non-Permanent Employee DTR and Accomplishment Generation.', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("username3");
    await page.locator("#password").fill("password");
    await page.locator("#privacy").setChecked(true);

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).not.toBeNull();
  });

  test('Test 1: Verify employee module access.', async ({ page }) => {
    //navigate to worklogs
    await page.locator('a').filter({ hasText: /^DTR$/ }).click();
    await page.locator('a').filter({ hasText: 'Worklogs' }).click();

    //expect employee can access Worklog page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/worklogs');

    //navigate to History page
    await page.locator('a').filter({ hasText: 'History' }).click();

    //expect employee can access History page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/history');
  });

  test('Test 2: Verify non-permanent employee can access/view accompplishment report tab in worklogs module.', async ({ page }) => {
    //navigate to worklogs
    await page.locator('a').filter({ hasText: /^DTR$/ }).click();
    await page.locator('a').filter({ hasText: 'Worklogs' }).click();

    //expect employee can access Worklog page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/worklogs');

    //check if employee can access accompplishment report tab
    await page.locator('a').filter({ hasText: 'Accomplishment Report' }).click();

    //expect employee can access Accomplishment Report page
    const heading = await page.getByRole('heading', { name: 'Accomplishment Report' }).innerText();

    await expect(heading).toContain('Accomplishment Report');
  });

  test('Test 3: Verify permanent employee cannot access/view accompplishment report tab in worklogs module.', async ({ page }) => {
    //navigate to worklogs
    await page.locator('a').filter({ hasText: /^DTR$/ }).click();
    await page.locator('a').filter({ hasText: 'Worklogs' }).click();

    //expect employee can access Worklog page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/worklogs');

    //check if accomplishment report tab is visible
    await expect(page.locator('a').filter({ hasText: 'Accomplishment Report' })).toBeHidden();
  });


});
