// @ts-check
import { test, expect } from "@playwright/test";
import { fundSourceValidFaker, fundSourceInvalidFaker, editFundSourceValidFaker } from '../../fake-data/fundsource-faker';

test.describe.serial("Fund Source Management.", () => {
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

  test("Test 1: Verify Fund Source page is accessible", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");
  });

  test("Test 2: Verify search functionality.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("fundsource");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no attlogs
    if (firstRow.includes("No matching records found")) {
      console.log("No fund source records found. Skipping test.");
      test.skip();
    }

    // get first row name for searchng exact match
    const exactMatch = await rows.locator('td').nth(1).innerText();

    // Search for an employee/user with matching name
    await page.locator('input[placeholder="Search"]').fill(exactMatch);
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(1)
      .innerText();

    expect(searchResult).toContain(exactMatch);

    // clear search input
    await page.locator('input[placeholder="Search"]').fill("");
    await page.keyboard.press("Enter");

    // get second row name value and trim to only 3 letters
    const partialMatch = await rows.locator('td').nth(1).innerText();
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
      .nth(1)
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

    expect(noResult).toContain("No fund sources found.");
  });

  test("Test 3: Navigate between pages.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no employee records
    if (firstRow.includes("No matching records found")) {
      console.log("No employee records found. Skipping test.");
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

  test("Test 4: Verify rows per page works..", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no fund source records
    if (firstRow.includes("No matching records found")) {
      console.log("No fund source records found. Skipping test.");
      test.skip();
    }

    
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "5", exact: true }).click();

      // Wait until the table displays 50 rows
    const fundSourceRows = page.locator('table tbody tr');

    await expect(fundSourceRows).toHaveCount(5);

    // Assert
    expect(await fundSourceRows.count()).toBeLessThanOrEqual(5);
      
  });

  test("Test 5: Verify filter functionality.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no fund source records
    if (firstRow.includes("No matching records found")) {
      console.log("No fund source records found. Skipping test.");
      test.skip();
    }

    // Apply filter by status (active)
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Active' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Active status
    const filteredActiveRows = page.locator('table tbody tr');
    const filteredActiveCount = await filteredActiveRows.count();

    for (let i = 0; i < filteredActiveCount; i++) {
      const obsu = await filteredActiveRows.nth(i).locator('td').nth(2).innerText();
      expect(obsu).toBe('Active');
    }

    // Clear filter by Bureau/Service/Section/Unit
    await page.locator('svg.p-select-clear-icon').click();

    // Apply filter by status (inactive)
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Inactive' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Inactive status
    const filteredInactiveRows = page.locator('table tbody tr');
    const filteredInactiveCount = await filteredInactiveRows.count();

    for (let i = 0; i < filteredInactiveCount; i++) {
      const obsu = await filteredInactiveRows.nth(i).locator('td').nth(2).innerText();
      expect(obsu).toBe('Inactive');
    }

    // Clear filter by Bureau/Service/Section/Unit
    await page.locator('svg.p-select-clear-icon').click();

  });

  test("Test 6: Can add fund source with valid entries.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const fundSourceFaker = fundSourceValidFaker();
    const papcode = fundSourceFaker.papcode;
    const fundsourceName = fundSourceFaker.fundsourceName;
    
    await page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' }).locator('input').fill(papcode);
    await page.locator('.field').filter({ hasText: 'Fund Source Name' }).locator('input').fill(fundsourceName);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(10000); // wait for search results to load

    // search for the newly added employee/user
    await page.locator('input[placeholder="Search"]').fill(papcode);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    expect(searchResult).toContain(papcode);
  });

  test("Test 7: Cannot add fund source with invalid entries.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const fundSourceFaker = fundSourceInvalidFaker();
    const invalidInput = fundSourceFaker.invalidInput;

    const papcodeField = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceNameField = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    await papcodeField.locator('input').fill(invalidInput);
    await fundsourceNameField.locator('input').fill(invalidInput);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(1000); // wait for search results to load

    // expect error message to be visible
    await expect(papcodeField.getByText('Invalid input. Please avoid special characters.', { exact: true })).toBeVisible(); //to set actual error message
    await expect(fundsourceNameField.getByText('Invalid input. Please avoid special characters.', { exact: true })).toBeVisible(); // to set actual error message
  });

  test("Test 8: Cannot add fund source if papcode is more or less than 15 characters.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    await expect(addModal).toBeVisible();

    // password less than minimum length (8)
    const papcodeLessThanMinimum = "1234567890";

    // password value no capital letter
    const papcodeMoreThanMaximum = "12345678901234567890";

    // try less than minimum length
    const papcodeField = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceNameField = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    await papcodeField.locator('input').fill(papcodeLessThanMinimum);
    await fundsourceNameField.locator('input').fill("Less than allowed character length");

    // expect error message to be visible
    await expect(papcodeField.getByText('The PAP code must be exactly 15 digits.', { exact: true })).toBeVisible();

    // try more than maximum length
    await papcodeField.locator('input').fill("");
    await papcodeField.locator('input').fill(papcodeMoreThanMaximum);
    await fundsourceNameField.locator('input').fill("More than allowed character length");

    // expect error message to be visible
    await expect(papcodeField.getByText('The PAP code must be exactly 15 digits.', { exact: true })).toBeVisible();

  });

  test("Test 9: Cannot add duplicate fund source.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get an existing fund source from the table
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr').first();

    const existingPapcode = await row.locator('td').nth(0).innerText();
    const existingFundsourceName = await row.locator('td').nth(1).innerText();

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    await expect(addModal).toBeVisible();

    const papcodeField = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceNameField = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    await papcodeField.locator('input').fill(existingPapcode);
    await fundsourceNameField.locator('input').fill(existingFundsourceName);

    // expect error message to be visible
    await expect(papcodeField.getByText('Program/Activity/Project Code already exists.', { exact: true })).toBeVisible();
    
  });

  test("Test 10: Cannot add fund source if pap code already exists.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get first row fund source
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const papcodeValue = await row.locator('td').nth(0).innerText();
    const fundsourceNameValue = await row.locator('td').nth(1).innerText();

    console.log("Existing PAP Code: " + papcodeValue);
    console.log("Existing Fund Source Name: " + fundsourceNameValue);

    // click add fund source button
    const addModal = page.getByRole('dialog');
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    await expect(addModal).toBeVisible();

    // fill out the form
    const papcodeField = page.locator('.field').filter({ has: page.getByText('Program/Activity/Project Code', { exact: true }) });
    await papcodeField.locator('input').fill(papcodeValue);

    const fundsourceNameField = page.locator('.field').filter({ has: page.getByText('Fund Source Name', { exact: true }) });
    await fundsourceNameField.locator('input').fill(fundsourceNameValue);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(papcodeField.getByText('PAP Code already exists.', { exact: true })).toBeVisible();
  });

  test("Test 11: Cannot add fund source if fund source name already exists.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get first row fund source
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const papcodeValue = await row.locator('td').nth(0).innerText();
    const fundsourceNameValue = await row.locator('td').nth(1).innerText();

    console.log("Existing PAP Code: " + papcodeValue);
    console.log("Existing Fund Source Name: " + fundsourceNameValue);

    // click add fund source button
    const addModal = page.getByRole('dialog');
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    await expect(addModal).toBeVisible();

    // fill out the form
    const papcodeField = page.locator('.field').filter({ has: page.getByText('Program/Activity/Project Code', { exact: true }) });
    await papcodeField.locator('input').fill(papcodeValue);

    const fundsourceNameField = page.locator('.field').filter({ has: page.getByText('Fund Source Name', { exact: true }) });
    await fundsourceNameField.locator('input').fill(fundsourceNameValue);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(fundsourceNameField.getByText('A fund source with this name already exists.', { exact: true })).toBeVisible();
  });

  test("Test 12: Cannot add fund source if one or more required field is empty.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/fundsource");

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Fund Source' }).click();

    const papcode = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceName = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    // click save button without filling out the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(papcode.getByText('PAP Code is required.', { exact: true })).toBeVisible();
    await expect(fundsourceName.getByText('Fund Source Name is required.', { exact: true })).toBeVisible();
  });

  test("Test 13: Can update fund source details with valid entries.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    await row.locator('td').nth(3).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const fundSourceEditFaker = fundSourceValidFaker();
    const papcode = fundSourceEditFaker.papcode;
    const fundsourceName = fundSourceEditFaker.fundsourceName;

    // fill out the form
    const papCodeField = page
        .locator('.field')
        .filter({ has: page.getByText('Program/Activity/Project Code', { exact: true }) });

    const fundSourceField = page
        .locator('.field')
        .filter({ has: page.getByText('Name', { exact: true }) });

    await papCodeField.locator('input').fill(papcode);
    await fundSourceField.locator('input').fill(fundsourceName);

    // click save button
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForTimeout(2000);

    await page.waitForSelector('table tbody tr');

    const papcodeValue = await row.locator('td').nth(0).innerText();
    const fundsourceNameValue = await row.locator('td').nth(1).innerText();

    expect(papcodeValue).toBe(papcode);
    expect(fundsourceNameValue).toBe(fundsourceName);
  });

  test("Test 14: Cannot update employee details with invalid entries.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    await row.locator('td').nth(8).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const fundSourceFaker = fundSourceInvalidFaker();
    const invalidInput = fundSourceFaker.invalidInput;

    // fill out the form
    const papcodeField = page.locator('.field').filter({ has: page.getByText('PAP Code', { exact: true })});

    await papcodeField.locator('input').fill(invalidInput);

    // click save button
    await page.getByRole('button', { name: 'Update' }).click();

    // check if first name field shows an invalid message containing "The field contains invalid characters."
    await expect(papcodeField.getByText('PAP Code is required.', { exact: true })).toBeVisible();
    
  });

  test("Test 15: Cannot update fund source if pap code already exists.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const existingPapcode = await row.nth(0).locator('td').nth(0).innerText();
    const existingFundsourceName = await row.nth(0).locator('td').nth(1).innerText();

    // open edit modal to get existing user values
    await row.nth(5).locator('td').nth(3).locator('button:has(svg.fa-pen-to-square)').click();

    const editModal = page.getByRole('dialog');

    await expect(editModal).toBeVisible();

    const papcodeField = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceNameField = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    await papcodeField.locator('input').fill(existingPapcode);
    await fundsourceNameField.locator('input').fill(existingFundsourceName);

    // expect error message to be visible
    await expect(papcodeField.getByText('Program/Activity/Project Code already exists.', { exact: true })).toBeVisible();
  });

  test("Test 16: Cannot update fund source if fund source name already exists.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const existingPapcode = await row.nth(0).locator('td').nth(0).innerText();
    const existingFundsourceName = await row.nth(0).locator('td').nth(1).innerText();

    // open edit modal to get existing user values
    await row.nth(5).locator('td').nth(3).locator('button:has(svg.fa-pen-to-square)').click();

    const editModal = page.getByRole('dialog');

    await expect(editModal).toBeVisible();

    const papcodeField = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceNameField = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    await papcodeField.locator('input').fill(existingPapcode);
    await fundsourceNameField.locator('input').fill(existingFundsourceName);

    // expect error message to be visible
    await expect(fundsourceNameField.getByText('A fund source with this name already exists.', { exact: true })).toBeVisible();
  });

  test("Test 17: Cannot update fund source if one or more required fields are empty.", async ({ page }) => {
    // Navigate to Fund Source Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Fund Source" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/fundsource");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    // open edit modal to get existing user values
    await row.nth(5).locator('td').nth(3).locator('button:has(svg.fa-pen-to-square)').click();

    const editModal = page.getByRole('dialog');

    await expect(editModal).toBeVisible();

    const papcodeField = page.locator('.field').filter({ hasText: 'Program/Activity/Project Code' });
    const fundsourceNameField = page.locator('.field').filter({ hasText: 'Fund Source Name' });

    await papcodeField.locator('input').fill("");
    await fundsourceNameField.locator('input').fill("");

    // expect error message to be visible
    await expect(papcodeField.getByText('PAP Code is required.', { exact: true })).toBeVisible();
    await expect(fundsourceNameField.getByText('Fund Source Name is required.', { exact: true })).toBeVisible();
  });
        
});
