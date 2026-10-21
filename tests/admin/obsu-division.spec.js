// @ts-check
import { test, expect } from "@playwright/test";
import { divisionValidFaker, divisionInvalidFaker, editDivisionValidFaker } from '../../fake-data/division-faker';

test.describe.serial("OBSU Management (Section).", () => {
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

  test("Test 1: Verify OBSU page is accessible", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");
  });

  test("Test 2: Verify division search functionality.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no attlogs
    if (firstRow.includes("No matching records found")) {
      console.log("No divisions records found. Skipping test.");
      test.skip();
    }

    // get first row name for searchng exact match
    const exactMatch = await rows.first().locator('td').nth(0).locator('span').first().innerText();

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
    const partialMatch = await rows.first().locator('td').nth(1).locator('span').first().innerText();
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

    expect(noResult).toContain("No divisions found.");
  });

  test("Test 3: Navigate between pages.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no OBSU records
    if (firstRow.includes("No matching records found")) {
      console.log("No divisions records found. Skipping test.");
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
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no OBSU records
    if (firstRow.includes("No matching records found")) {
      console.log("No divisions records found. Skipping test.");
      test.skip();
    }

    
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "5", exact: true }).click();

      // Wait until the table displays 50 rows
    const divisionRows = page.locator('table tbody tr');

    await expect(divisionRows).toHaveCount(5);

    // Assert
    expect(await divisionRows.count()).toBeLessThanOrEqual(5);
      
  });

  test("Test 6: Can add division with valid entries.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    const addModal = page.getByRole('dialog');

    // click add division button
    await page.getByRole('button', { name: 'Add Division' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionValidFaker();
    const divisionName = divisionFaker.divisionName;
    const chief = divisionFaker.chief;
    const acronym = divisionFaker.acronym;

    await page.locator('.field').filter({ hasText: 'Division name' }).locator('input').fill(divisionName);
    await page.locator('.field').filter({ hasText: 'Division chief' }).locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await page.locator('.field').filter({ hasText: 'Acronym' }).locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForTimeout(10000); // wait for search results to load

    // search for the newly added employee/user
    await page.locator('input[placeholder="Search"]').fill(divisionName);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    expect(searchResult).toContain(divisionName);
  });

  test("Test 7: Cannot add division with invalid entries.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    const addModal = page.getByRole('dialog');

    // click add division button
    await page.getByRole('button', { name: 'Add Division' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionInvalidFaker();
    const invalidInput = divisionFaker.invalidInput;
    const chief = divisionFaker.chief;

    const nameField = page.locator('.field').filter({ hasText: 'Division name' }).locator('input');
    const chiefField = page.locator('.field').filter({ hasText: 'Division chief' }).locator('input');
    const acronymField = page.locator('.field').filter({ hasText: 'Acronym' }).locator('input');

    await nameField.fill(invalidInput);

    await chiefField.fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await acronymField.fill(invalidInput);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForTimeout(1000); // wait for search results to load

    // expect error message to be visible
    await expect(nameField.getByText('The name may only contain letters, spaces, and the characters that are allowed.', { exact: true })).toBeVisible();
    await expect(acronymField.getByText('The acronym may only contain uppercase letters, digits, and the characters that are allowed.', { exact: true })).toBeVisible();
  });

  test("Test 8: Cannot add division if one or more required fields are empty.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    const addModal = page.getByRole('dialog');

    // click add division button
    await page.getByRole('button', { name: 'Add Division' }).click();

    await expect(addModal).toBeVisible();

    const nameField = page.locator('.field').filter({ hasText: 'Division name' }).locator('input');
    const chiefField = page.locator('.field').filter({ hasText: 'Division chief' }).locator('input');
    const acronymField = page.locator('.field').filter({ hasText: 'Acronym' }).locator('input');

    // click save button without filling out the form
    await page.getByRole('button', { name: 'Save' }).click();

    // expect error message to be visible
    await expect(nameField.getByText('Division name is required', { exact: true })).toBeVisible();
    await expect(chiefField.getByText("Division chief's name is required", { exact: true })).toBeVisible();
    await expect(acronymField.getByText('Required', { exact: true })).toBeVisible();

  });

  test("Test 9: Can add division if one or more optional fields are empty.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    const addModal = page.getByRole('dialog');

    // click add division button
    await page.getByRole('button', { name: 'Add Division' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form and leave OIC field empty
    const divisionFaker = divisionValidFaker();
    const divisionName = divisionFaker.divisionName;
    const chief = divisionFaker.chief;
    const acronym = divisionFaker.acronym;

    await page.locator('.field').filter({ hasText: 'Division name' }).locator('input').fill(divisionName);
    await page.locator('.field').filter({ hasText: 'Division chief' }).locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await page.locator('.field').filter({ hasText: 'Acronym' }).locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForTimeout(10000); // wait for search results to load

    // search for the newly added employee/user
    await page.locator('input[placeholder="Search"]').fill(divisionName);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    expect(searchResult).toContain(divisionName);
  });

  test("Test 9: Cannot add division if name already exists.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // get an existing fund source from the table
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr').first();

    const existingDivision = await row.locator('td').nth(0).locator('span').first().innerText();

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Division' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionValidFaker();
    const chief = divisionFaker.chief;
    const acronym = divisionFaker.acronym;

    const nameField = page.locator('.field').filter({ hasText: 'Division name' });
    await nameField.locator('input').fill(existingDivision);

    await page.locator('.field').filter({ hasText: 'Division chief' }).locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await page.locator('.field').filter({ hasText: 'Acronym' }).locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    // expect error message to be visible
    await expect(addModal.getByText('This division already exists in the system. Check the division name and acronym and use unique values.', { exact: true })).toBeVisible();
  });

  test("Test 10: Cannot add division if acronym already exists.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // get an existing fund source from the table
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr').first();

    const existingAcronym = await row.locator('td').nth(0).locator('span').nth(1).innerText();

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    const addModal = page.getByRole('dialog');

    // click add fund source button
    await page.getByRole('button', { name: 'Add Division' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionValidFaker();
    const divisionName = divisionFaker.divisionName;
    const chief = divisionFaker.chief;

    const nameField = page.locator('.field').filter({ hasText: 'Division name' });
    await nameField.locator('input').fill(divisionName);

    await page.locator('.field').filter({ hasText: 'Division chief' }).locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    const acronymField = page.locator('.field').filter({ hasText: 'Acronym' });
    await acronymField.locator('input').fill(existingAcronym);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    // expect error message to be visible
    await expect(acronymField.getByText('Acronym already in use', { exact: true })).toBeVisible();
  });

  test("Test 11: Can update division details with valid entries.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    await row.first().locator('td').nth(5).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const editdivisionFaker = editDivisionValidFaker();
    const divisionName = editdivisionFaker.divisionName;
    const chief = editdivisionFaker.chief;
    const acronym = editdivisionFaker.acronym;

    // fill out the form
    const nameField = page.locator('.field').filter({ has: page.getByText('Division name', { exact: true }) });
    const chiefField = page.locator('.field').filter({ has: page.getByText('Division chief', { exact: true }) });
    const acronymField = page.locator('.field').filter({ has: page.getByText('Acronym', { exact: true }) });

    await nameField.locator('input').fill("");
    await nameField.locator('input').fill(divisionName);

    await chiefField.locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await acronymField.locator('input').fill("");
    await acronymField.locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForTimeout(2000);

    await page.waitForSelector('table tbody tr');
    const divisionNameValue = await row.first().locator('td').nth(0).locator('span').first().innerText();
    const officeHeadValue = await row.first().locator('td').nth(2).innerText();
    const acronymValue = await row.first().locator('td').nth(0).locator('span').nth(1).innerText();

    expect(divisionNameValue).toBe(divisionName);
    expect(officeHeadValue).toBe(chief);
    expect(acronymValue).toBe(acronym);
  });

  test("Test 12: Cannot update division details with invalid entries.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // get first row division
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing division values
    await row.first().locator('td').nth(5).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionInvalidFaker();
    const divisionName = divisionFaker.invalidInput;
    const chief = divisionFaker.chief;
    const acronym = divisionFaker.invalidInput;

    // fill out the form
    const nameField = page.locator('.field').filter({ has: page.getByText('Division name', { exact: true }) });
    const chiefField = page.locator('.field').filter({ has: page.getByText('Division chief', { exact: true }) });
    const acronymField = page.locator('.field').filter({ has: page.getByText('Acronym', { exact: true }) });
    const divisionField = page.locator('.field').filter({ has: page.getByText('Division', { exact: true }) });

    await nameField.locator('input').fill(divisionName);
    await chiefField.locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await acronymField.locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Update' }).click();

    // check if first name field shows an invalid message containing "The field contains invalid characters."
    await expect(nameField.getByText('The name may only contain letters, spaces, and the characters that are allowed.', { exact: true })).toBeVisible();
    await expect(acronymField.getByText('The acronym may only contain uppercase letters, digits, and the characters that are allowed.', { exact: true })).toBeVisible();
    
  });

  test("Test 13: Cannot update division details if one or more required fields are empty.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // get first row division
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    await row.first().locator('td').nth(5).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // empty the required fields
    const nameField = page.locator('.field').filter({ has: page.getByText('Division name', { exact: true }) });
    const chiefField = page.locator('.field').filter({ has: page.getByText('Division chief', { exact: true }) });
    const acronymField = page.locator('.field').filter({ has: page.getByText('Acronym', { exact: true }) });

    await nameField.locator('input').fill("");
    await chiefField.locator('input').fill("");
    await acronymField.locator('input').fill("");

    // click update button
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(nameField.getByText('Division name is required.', { exact: true })).toBeVisible();
    await expect(chiefField.getByText('Division chief is required.', { exact: true })).toBeVisible();
    await expect(acronymField.getByText('Required.', { exact: true })).toBeVisible();
  });

  test("Test 14: Can update division details if one or more optional fields are empty.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // get first row division
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    await row.first().locator('td').nth(5).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const editdivisionFaker = editDivisionValidFaker();
    const divisionName = editdivisionFaker.divisionName;
    const chief = editdivisionFaker.chief;
    const acronym = editdivisionFaker.acronym;

    // fill out the form and leave OIC field empty
    const nameField = page.locator('.field').filter({ has: page.getByText('Division name', { exact: true }) });
    const chiefField = page.locator('.field').filter({ has: page.getByText('Division chief', { exact: true }) });
    const acronymField = page.locator('.field').filter({ has: page.getByText('Acronym', { exact: true }) });

    await nameField.locator('input').fill("");
    await nameField.locator('input').fill(divisionName);

    await chiefField.locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await acronymField.locator('input').fill("");
    await acronymField.locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForTimeout(2000);

    await page.waitForSelector('table tbody tr');
    const divisionNameValue = await row.first().locator('td').nth(0).locator('span').first().innerText();
    const officeHeadValue = await row.first().locator('td').nth(2).innerText();
    const acronymValue = await row.first().locator('td').nth(0).locator('span').nth(1).innerText();

    expect(divisionNameValue).toBe(divisionName);
    expect(officeHeadValue).toBe(chief);
    expect(acronymValue).toBe(acronym);
  });

  test("Test 15: Cannot update division if name already exists.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // get an existing division from the table
    const existingDivisionName = await row.first().locator('td').nth(0).locator('span').first().innerText();

    //open edit modal to update a division
    await row.first().locator('td').nth(5).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionValidFaker();
    const chief = divisionFaker.chief;
    const acronym = divisionFaker.acronym;

    const nameField = page.locator('.field').filter({ hasText: 'Division name' });
    await nameField.locator('input').fill(existingDivisionName);

    await page.locator('.field').filter({ hasText: 'Division chief' }).locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    await page.locator('.field').filter({ hasText: 'Acronym' }).locator('input').fill(acronym);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    // expect error message to be visible
    await expect(nameField.getByText('An office with this name already exists. Use a unique name.', { exact: true })).toBeVisible();
  });

  test("Test 16: Cannot add division if acronym already exists.", async ({ page }) => {
    // Navigate to OBSU Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "OBSU" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/office");

    // click division button
    await page.locator('button').filter({ hasText: 'Division' }).click();

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // get an existing division from the table
    const existingAcronym = await row.first().locator('td').nth(0).locator('span').nth(1).innerText();

    //open edit modal to update a division
    await row.first().locator('td').nth(5).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // use faker for filling out the form
    const divisionFaker = divisionValidFaker();
    const divisionName = divisionFaker.divisionName;
    const chief = divisionFaker.chief;

    await page.locator('.field').filter({ hasText: 'Division name' }).locator('input').fill(divisionName);
    await page.locator('.field').filter({ hasText: 'Division chief' }).locator('input').fill(chief);
    const firstOption = page.locator('ul.p-autocomplete-list li[role="option"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();

    const acronymField = page.locator('.field').filter({ hasText: 'Acronym' });
    await acronymField.locator('input').fill(existingAcronym);

    // click save button
    await page.getByRole('button', { name: 'Save' }).click();

    // expect error message to be visible
    await expect(acronymField.getByText('Acronym already in use', { exact: true })).toBeVisible();
  });       
});
