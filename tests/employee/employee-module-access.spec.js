// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial('Employee Module Access.', () => {
  test('Test 1: Verify employee module access.', async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("baybalio");
    await page.locator("#password").fill("Dswd@12345");
    await page.locator("#privacy").setChecked(true);

    const responsePromise = page.waitForResponse(response =>
        response.url().includes('/auth') &&
        response.request().method() === 'POST' &&
        response.status() === 201
    );

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).not.toBeNull();

    // get user initials from json response
    const response = await responsePromise;
    const responseBody = await response.json();

    const firstName = responseBody.data.user.user_profile.first_name;
    const lastName = responseBody.data.user.user_profile.last_name;

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    // navigate to worklogs
    await page.locator('a').filter({ hasText: /^DTR$/ }).click();
    await page.locator('a').filter({ hasText: 'Worklogs' }).click();

    //expect employee can access Worklog page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/worklogs');

    // check if a dialog is prompting
    const dialog = page.getByRole('dialog');

    // if dialog is visible, close it
    if(await dialog.isVisible()) {
      await dialog.getByRole('button', { name: 'Close' }).first().click();
    }

    // navigate to History page
    await page.locator('a').filter({ hasText: 'History' }).click();

    // expect employee can access History page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/history');
    
    // // click initials to logout
    // await page.getByText(initials).first().click();
    // await page.locator('a').filter({ hasText: 'Logout' }).click();

    // // confirm logout
    // const logoutModal = page.getByRole('dialog');

    // await logoutModal.getByRole('button', { name: 'Logout' }).click();

    // // expect to be redirected to login page
    // await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/auth/login');

    // // expect token to be removed from local storage
    // const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('auth-token'));
    // expect(tokenAfterLogout).toBeNull();
  });

  test('Test 2: Verify non-permanent employee can access/view accompplishment report tab in worklogs module.', async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("yvvillamil");
    await page.locator("#password").fill("Dswd@12345");
    await page.locator("#privacy").setChecked(true);

    const responsePromise = page.waitForResponse(response =>
        response.url().includes('/auth') &&
        response.request().method() === 'POST' &&
        response.status() === 201
    );

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).not.toBeNull();

    //get user initials from json response
    const response = await responsePromise;
    const responseBody = await response.json();

    const firstName = responseBody.data.user.user_profile.first_name;
    const lastName = responseBody.data.user.user_profile.last_name;

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    //navigate to worklogs
    await page.locator('a').filter({ hasText: /^DTR$/ }).click();
    await page.locator('a').filter({ hasText: 'Worklogs' }).click();

    //expect employee can access Worklog page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/worklogs');

    // check if a dialog is prompting
    const dialog = page.getByRole('dialog');

    // if dialog is visible, close it
    if(await dialog.isVisible()) {
      await dialog.getByRole('button', { name: 'Close' }).first().click();
    }

    //check if employee can access accompplishment report tab
    await expect(page.locator('a').filter({ hasText: 'Accomplishment Report' })).toBeVisible();

    // // click initials to logout
    // await page.getByText(initials).click();
    // await page.locator('a').filter({ hasText: 'Logout' }).click();

    // // confirm logout
    // const logoutModal = page.getByRole('dialog');

    // await logoutModal.getByRole('button', { name: 'Logout' }).click();

    // // expect to be redirected to login page
    // await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/auth/login');

    // // expect token to be removed from local storage
    // const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('auth-token'));
    // expect(tokenAfterLogout).toBeNull();
  });

  test('Test 3: Verify permanent employee cannot access/view accompplishment report tab in worklogs module.', async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("lmramos");
    await page.locator("#password").fill("Dswd@12345");
    await page.locator("#privacy").setChecked(true);

    const responsePromise = page.waitForResponse(response =>
        response.url().includes('/auth') &&
        response.request().method() === 'POST' &&
        response.status() === 201
    );

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).not.toBeNull();

    //get user initials from json response
    const response = await responsePromise;
    const responseBody = await response.json();

    const firstName = responseBody.data.user.user_profile.first_name;
    const lastName = responseBody.data.user.user_profile.last_name;

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    //navigate to worklogs
    await page.locator('a').filter({ hasText: /^DTR$/ }).click();
    await page.locator('a').filter({ hasText: 'Worklogs' }).click();

    //expect employee can access Worklog page
    await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/worklogs');

    // check if a dialog is prompting
    const dialog = page.getByRole('dialog');

    // if dialog is visible, close it
    if(await dialog.isVisible()) {
      await dialog.getByRole('button', { name: 'Close' }).first().click();
    }

    //check if accomplishment report tab is visible
    await expect(page.locator('a').filter({ hasText: 'Accomplishment Report' })).toBeHidden();

    // // click initials to logout
    // await page.getByText(initials).click();
    // await page.getByRole('menuitem').filter({ hasText: 'Logout'}).click();

    // // confirm logout
    // const logoutModal = page.getByRole('dialog');

    // await logoutModal.getByRole('button', { name: 'Logout' }).click();

    // // expect to be redirected to login page
    // await expect(page).toHaveURL('https://fo11apps-staging.dswd.gov.ph/ionse/auth/login');

    // // expect token to be removed from local storage
    // const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('auth-token'));
    // expect(tokenAfterLogout).toBeNull();
  });
});
