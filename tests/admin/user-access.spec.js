// @ts-check
import { test, expect } from "@playwright/test";
import { userTypeValidFaker, userTypeInvalidFaker, editUserTypeValidFaker } from '../../fake-data/user-access-faker';

test.describe.serial("User Access Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("yvvillamil");
    await page.locator("#password").fill("Dswd@12345");
    await page.locator("#privacy").setChecked(true);

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem("auth-token"));
    expect(token).not.toBeNull();
  });

  // test.afterEach(async ({ page }) => {
  //   // Logout after each test
  //   await page.locator('div[aria-haspopup="true"]').click();
  //   await page.locator('a').filter({ hasText: 'Logout' }).click();
  //   await page.getByRole('button', { name: 'Logout' }).click();
  // });

  test("Test 1: Verify User Access page is accessible", async ({ page }) => {
    // Navigate to User Access Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");
  });

  test("Test 2: Verify user type search functionality.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no attlogs
    if (firstRow.includes("No matching records found")) {
      console.log("No user types records found. Skipping test.");
      test.skip();
    }

    // get first row name for searchng exact match
    const exactMatch = await rows.first().locator('td').nth(0).innerText();

    // Search for an employee/user with matching name
    await page.locator('input[placeholder="Search"]').fill(exactMatch);
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();

    expect(searchResult).toContain(exactMatch);

    // clear search input
    await page.locator('input[placeholder="Search"]').fill("");
    await page.keyboard.press("Enter");

    // get second row name value and trim to only 3 letters
    const partialMatch = await rows.first().locator('td').nth(1).innerText();
    const partialMatchTrim = partialMatch.trim().slice(0, 3);

    // search for an an employee/user with partial text
    await page.locator('input[placeholder="Search"]').fill(partialMatchTrim);
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000); // wait for search results to load

    // Verify that the search result is correct
    const partialResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();

    expect(partialResult).toContain(partialMatchTrim);

    // clear search input
    await page.locator('input[placeholder="Search"]').fill("");
    await page.keyboard.press("Enter");

    // search for an entry that does not exist
    await page.locator('input[placeholder="Search"]').fill("nonexistententry");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000); // wait for search results to load

    // Verify that the search result is correct
    const noResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();

    expect(noResult).toContain("No user types found.");
  });

  test("Test 3: Navigate between pages.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no OBSU records
    if (firstRow.includes("No matching records found")) {
      console.log("No user types records found. Skipping test.");
      test.skip();
    }

    await page.locator("span.p-paginator-pages").waitFor();
    const nextPageButton = await page.getByRole("button", {
      name: "Next Page",
    });
    const prevPageButton = await page.getByRole("button", {
      name: "Previous Page",
    });

    // check if next page button is enabled
    const isNextPageEnabled = await nextPageButton.isEnabled();

    // If next page button is not enabled, change rows per page to 5 and check again
    if (!isNextPageEnabled) {
      const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
      await rowsPerPage.click();
      await page.getByRole("option", { name: "5", exact: true }).click();

      await page.waitForTimeout(1000); // wait for page to load
      const isNextPageEnabledAfterChange = await nextPageButton.isEnabled();
      expect(isNextPageEnabledAfterChange).toBe(true);

      for (let i = 0; i < 3; i++) {
        // Stop if Next button is already disabled
        if (!(await nextPageButton.isEnabled())) {
          console.log("Next button is disabled. Stopping.");
          break;
        }

        const currentPage = await page
          .locator('span.p-paginator-pages button[data-p-active="true"]')
          .innerText();

        await nextPageButton.click({ timeout: 3000 });

        // Wait for page to change
        await expect(async () => {
          const newPage = await page
            .locator('span.p-paginator-pages button[data-p-active="true"]')
            .innerText();

          expect(newPage).not.toBe(currentPage);
        }).toPass();

        console.log(`Clicked Next: ${i + 1} time(s)`);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        // Stop if Next button is already disabled
        if (!(await nextPageButton.isEnabled())) {
          console.log("Next button is disabled. Stopping.");
          break;
        }

        const currentPage = await page
          .locator('span.p-paginator-pages button[data-p-active="true"]')
          .innerText();

        await nextPageButton.click({ timeout: 3000 });

        // Wait for page to change
        await expect(async () => {
          const newPage = await page
            .locator('span.p-paginator-pages button[data-p-active="true"]')
            .innerText();

          expect(newPage).not.toBe(currentPage);
        }).toPass();

        console.log(`Clicked Next: ${i + 1} time(s)`);
      }
    }

    // check if previous page button is enabled
    const isPrevPageEnabled = await prevPageButton.isEnabled();

    for (let i = 0; i < 3; i++) {
      // Stop if Previous button is already disabled
      if (!(await prevPageButton.isEnabled())) {
        console.log("Previous button is disabled. Stopping.");
        break;
      }

      const currentPage = await page
        .locator('span.p-paginator-pages button[data-p-active="true"]')
        .innerText();

      await prevPageButton.click({ timeout: 3000 });

      // Wait for page to change
      await expect(async () => {
        const newPage = await page
          .locator('span.p-paginator-pages button[data-p-active="true"]')
          .innerText();

        expect(newPage).not.toBe(currentPage);
      }).toPass();

      console.log(`Clicked Previous: ${i + 1} time(s)`);
    }
  });

  test("Test 4: Verify rows per page works.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no OBSU records
    if (firstRow.includes("No matching records found")) {
      console.log("No user types records found. Skipping test.");
      test.skip();
    }

    
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "5", exact: true }).click();

      // Wait until the table displays 50 rows
    const userTypeRows = page.locator('table tbody tr');

    await expect(userTypeRows).toHaveCount(5);

    // Assert
    expect(await userTypeRows.count()).toBeLessThanOrEqual(5);
      
  });

  test("Test 5: Can add user type with valid entries.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    const addModal = page.getByRole('dialog');

    // click add user type button
    await page.getByRole('button', { name: 'Add User Type' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const userTypeFaker = userTypeValidFaker();
    const userTypeName = userTypeFaker.userTypeName;
    const permissionName = userTypeFaker.permissionName;
    const permissionValue = userTypeFaker.permissionValue;

    await page.getByRole('textbox', { name: 'e.g. Regional ICT Management' }).fill(userTypeName);
    await page.locator('button').filter({ hasText: permissionName }).click();
    await page.getByRole('checkbox', { name: permissionValue }).check();

    // click save button
    await addModal.getByRole('button', { name: 'Add User Type' }).click();

    await page.waitForTimeout(3000); // wait for search results to load

    // search for the newly added employee/user
    await page.locator('input[placeholder="Search"]').fill(userTypeName);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page.locator("table tbody tr").first().locator("td").nth(0).innerText();
    expect(searchResult).toContain(userTypeName);
  });

  test("Test 6: Cannot add user type with invalid entries.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    const addModal = page.getByRole('dialog');

    // click add user type button
    await page.getByRole('button', { name: 'Add user type' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const userTypeFaker = userTypeInvalidFaker();
    const invalidInput = userTypeFaker.invalidInput;

    const nameField = page.getByRole('textbox', { name: 'e.g. Regional ICT Management' });
    await nameField.fill(invalidInput);

    // click save button
    await addModal.getByRole('button', { name: 'Add User Type' }).click();

    await page.waitForTimeout(1000); // wait for search results to load

    // expect error message to be visible
    await expect(addModal.getByText("User type name may only contain letters, numbers, spaces and & ( ) . , ' / -, and must include at least one letter.", { exact: true })).toBeVisible();
  });

  test("Test 7: Cannot add user type if one or more required fields are empty.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    const addModal = page.getByRole('dialog');

    // click add user type button
    await page.getByRole('button', { name: 'Add user type' }).click();

    await expect(addModal).toBeVisible();

    // expetct save button to be disabled
    expect(addModal.getByRole('button', { name: 'Add User Type' })).toBeDisabled();

  });

  test("Test 8: Cannot add user type if name already exists.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    // get an existing fund source from the table
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr').first();

    const existingUserType = await row.locator('td').nth(0).innerText();

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add User Type' }).click();

    await expect(addModal).toBeVisible();

    const nameField = page.getByRole('textbox', { name: 'e.g. Regional ICT Management' });
    await nameField.fill(existingUserType);

    // click save button
    await addModal.getByRole('button', { name: 'Add User Type' }).click();

    // expect error message to be visible
    await expect(addModal.getByText('User type name already exists.', { exact: true })).toBeVisible();
  });

  test("Test 9: Can update user type details with valid entries.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/user-types");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    const openDialog = row.first().locator('td').nth(2);
    await openDialog.getByRole('button', { name: 'Edit user type' }).click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const editUserTypeFaker = editUserTypeValidFaker();
    const userTypeName = editUserTypeFaker.userTypeName;

    // fill out the form
    const nameField = editModal.getByPlaceholder('e.g. Regional ICT Management');
    await nameField.fill("");
    await nameField.fill(userTypeName);

    // click save button
    await editModal.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(2000);

    await page.waitForSelector('table tbody tr');
    const updatedRow = page.locator('table tbody tr');
    const userTypeNameValue = await updatedRow.getByRole('cell', { name: userTypeName }).innerText();

    expect(userTypeNameValue).toBe(userTypeName);

  });

  test("Test 10: Cannot update user type details with invalid entries.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/user-types");

    // get first row user type
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user type values
    const openDialog = row.first().locator('td').nth(2);
    await openDialog.getByRole('button', { name: 'Edit user type' }).click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const editUserTypeFaker = userTypeInvalidFaker();
    const userTypeName = editUserTypeFaker.invalidInput;

    // fill out the form
    const nameField = editModal.getByPlaceholder('e.g. Regional ICT Management');
    await nameField.fill("");
    await nameField.fill(userTypeName);

    // click save button
    await editModal.getByRole('button', { name: 'Save Changes' }).click();

    // check if first name field shows an invalid message containing "The field contains invalid characters."
    await expect(editModal.getByText("User type name may only contain letters, numbers, spaces and & ( ) . , ' / -, and must include at least one letter.", { exact: true })).toBeVisible();
    
  });

  test("Test 11: Cannot update user type details if one or more required fields are empty.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/user-types");

    // get first row user type
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    // open edit modal to get existing user values
    const openDialog = row.first().locator('td').nth(2);
    await openDialog.getByRole('button', { name: 'Edit user type' }).click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // fill out the form
    const nameField = editModal.getByPlaceholder('e.g. Regional ICT Management');
    await nameField.fill("");

    // expect save button to be disabled
    expect(editModal.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  test("Test 12: Cannot update user type if name already exists.", async ({ page }) => {
    // Navigate to User Access page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "User Access" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/user-types");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // get an existing user type from the table
    const existingUserTypeName = await row.first().locator('td').nth(0).innerText();

    // open edit modal to get existing user values
    const openDialog = row.first().locator('td').nth(2);
    await openDialog.getByRole('button', { name: 'Edit user type' }).click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // fill out the form
    const nameField = editModal.getByPlaceholder('e.g. Regional ICT Management');
    await nameField.fill("");
    await nameField.fill(existingUserTypeName);

    // click save button
    await editModal.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(editModal.getByText('User type name already exists.', { exact: true })).toBeVisible();
  });
});
