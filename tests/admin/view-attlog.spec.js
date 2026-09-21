// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial("View Imported Attlog/s", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://fo11apps-staging.dswd.gov.ph/ionse/");

    await page.locator("#account").fill("admin");
    await page.locator("#password").fill("password");
    await page.locator("#privacy").setChecked(true);

    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);

    // after login
    const token = await page.evaluate(() => localStorage.getItem("auth-token"));
    expect(token).not.toBeNull();

    // Navigate to Attlog Import page
    await page.locator("a").filter({ hasText: "Attlog" }).click();
    await page.locator("a").filter({ hasText: "Import" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/attlog");
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await page.locator('div[aria-haspopup="true"]').click();
    await page.locator("a").filter({ hasText: "Logout" }).click();
    await page.getByRole("button", { name: "Logout" }).click();
  });

  test("Test 1: Verify admin can view imported attlog/s.", async ({ page }) => {
    //check if table has rows
    await page.waitForSelector("table tbody tr");
    const row = page.locator("table tbody tr");

    const firstRow = await row.locator("td").nth(0).innerText();

    console.log(`Firt Row: ${firstRow}`);

    // skip test if first row td text contains "No attlogs uploaded yet"
    if (firstRow.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping test.");
      test.skip();
    }

    const filename = await row.locator("td").nth(0).innerText();

    await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(3)
      .getByRole("button", { name: "View" })
      .click();

    await expect(
      page.locator("nav li").filter({ hasText: filename }),
    ).toBeVisible();
  });

  test("Test 2: Search for an entry in the attlog.", async ({ page }) => {
    // Check if table has rows
    await page.waitForSelector("table tbody tr");

    const rows = page.locator("table tbody tr");
    const selectedRow = rows.nth(5);

    const firstRow = await selectedRow.locator("td").nth(0).innerText();

    console.log(`First Row: ${firstRow}`);

    // Skip if there are no attlogs
    if (firstRow.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping test.");
      test.skip();
    }

    const filename = await selectedRow.locator("td").nth(0).innerText();

    // Click View on the selected row
    await selectedRow
      .locator("td")
      .nth(3)
      .getByRole("button", { name: "View" })
      .click();

    // Verify that the filename appears in breadcrumb
    await expect(
      page.locator("nav li").filter({ hasText: filename }),
    ).toBeVisible();

    // Wait for the attlog entries table
    await page.waitForSelector("table tbody tr");

    // Get attlog entry rows
    const attlogRows = page.locator("table tbody tr");

    const attlogEntries = await attlogRows.count();

    console.log(`Attlog entries: ${attlogEntries}`);

    if (attlogEntries === 1) {
      console.log("No entries in the attlog. Skipping test.");
      test.skip();
    }

    // Search for an entry in the attlog
    await page.locator('input[placeholder="Search"]').fill("11-7483");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    expect(searchResult).toContain("11-7483");

    // clear search input
    await page.locator('input[placeholder="Search"]').fill("");
    await page.keyboard.press("Enter");

    // search for an entry with partial text
    await page.locator('input[placeholder="Search"]').fill("11-74");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000); // wait for search results to load

    // Verify that the search result is correct
    const partialResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    expect(partialResult).toContain("11-74");

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
    expect(noResult).toContain("No records found");
  });

  test("Test 3: Verify it can navigate between pages.", async ({ page }) => {
    // Check if table has rows
    await page.waitForSelector("table tbody tr");

    const rows = page.locator("table tbody tr");
    const selectedRow = rows.nth(5);

    const firstRow = await selectedRow.locator("td").nth(0).innerText();

    console.log(`First Row: ${firstRow}`);

    // skip test if first row td text contains "No attlogs uploaded yet"
    if (firstRow.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping test.");
      test.skip();
    }

    const filename = await selectedRow.locator("td").nth(0).innerText();

    // Click View on the selected row
    await selectedRow
      .locator("td")
      .nth(3)
      .getByRole("button", { name: "View" })
      .click();

    // Verify that the filename appears in breadcrumb
    await expect(
      page.locator("nav li").filter({ hasText: filename }),
    ).toBeVisible();

    // Wait for the attlog entries table
    await page.waitForSelector("table tbody tr");

    // Get attlog entry rows
    const attlogRows = page.locator("table tbody tr");

    const attlogEntries = await attlogRows.count();

    if (attlogEntries === 1) {
      console.log("No entries in the attlog. Skipping test.");
      test.skip();
    }

    await page.locator("span.p-paginator-pages").waitFor();
    const nextPageButton = await page.getByRole("button", {
      name: "Next Page",
    });
    const prevPageButton = await page.getByRole("button", {
      name: "Previous Page",
    });

    //count page buttons in the pagination
    const pageButtons = page.locator("span.p-paginator-pages button");
    console.log(`Total pages: ${await pageButtons.count()}`);

    //skip test if there is only one page
    if ((await pageButtons.count()) <= 1) {
      console.log("Only one page available. Skipping pagination test.");
      test.skip();
    }

    // Click Next button up to 5 times
    for (let i = 0; i < 5; i++) {
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

    // Click Previous button up to 5 times
    for (let i = 0; i < 5; i++) {
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

    // go to the last page
    const lastPageButton = page.getByRole('button', { name: 'Last Page' });
    const activePage = page.locator(
        'span.p-paginator-pages button[data-p-active="true"]'
    );

    await lastPageButton.click();
    console.log(`Current page: ${await activePage.innerText()}`);
    
    await expect(lastPageButton).toBeDisabled();

    // go to the first page
    const firstPageButton = page.getByRole('button', { name: 'First Page' });
    const activePage2 = page.locator(
        'span.p-paginator-pages button[data-p-active="true"]'
    );

    await firstPageButton.click();
    console.log(`Current page: ${await activePage2.innerText()}`);

    await expect(firstPageButton).toBeDisabled();
  });

  test("Test 4: Verify rows per page works.", async ({ page }) => {
    // Check if table has rows
    await page.waitForSelector("table tbody tr");

    const rows = page.locator("table tbody tr");
    const selectedRow = rows.nth(5);

    const firstRow = await selectedRow.locator("td").nth(0).innerText();

    console.log(`First Row: ${firstRow}`);

    // skip test if first row td text contains "No attlogs uploaded yet"
    if (firstRow.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping test.");
      test.skip();
    }

    const filename = await selectedRow.locator("td").nth(0).innerText();

    // Click View on the selected row
    await selectedRow
      .locator("td")
      .nth(3)
      .getByRole("button", { name: "View" })
      .click();

    // Verify that the filename appears in breadcrumb
    await expect(
      page.locator("nav li").filter({ hasText: filename }),
    ).toBeVisible();

    // Wait for the attlog entries table
    await page.waitForSelector("table tbody tr");

    // Get attlog entry rows
    const attlog = page.locator("table tbody tr");
    const attlogEntries = await attlog.count();

    if (attlogEntries === 1) {
      console.log("No entries in the attlog. Skipping test.");
      test.skip();
    }

    // Change rows per page to 50
    const rowsPerPage = page.getByRole('combobox', { name: 'Rows per page' });

    await rowsPerPage.click();

    await page.getByRole('option', { name: '50', exact: true }).click();

    await expect(rowsPerPage).toHaveText('50');

    // Wait until the table displays 50 rows
    const attlogRows = page.locator('table tbody tr');

    await expect(attlogRows).toHaveCount(50);

    // Assert
    expect(await attlogRows.count()).toBeLessThanOrEqual(50);
  });

  test("Test 5: Apply column filter/s.await ", async ({ page }) => {
    // Check if table has rows
    await page.waitForSelector("table tbody tr");

    const rows = page.locator("table tbody tr");
    const selectedRow = rows.nth(5);

    const firstRow = await selectedRow.locator("td").nth(0).innerText();

    console.log(`First Row: ${firstRow}`);

    // skip test if first row td text contains "No attlogs uploaded yet"
    if (firstRow.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping test.");
      test.skip();
    }

    const filename = await selectedRow.locator("td").nth(0).innerText();

    // Click View on the selected row
    await selectedRow
      .locator("td")
      .nth(3)
      .getByRole("button", { name: "View" })
      .click();

    // Verify that the filename appears in breadcrumb
    await expect(
      page.locator("nav li").filter({ hasText: filename }),
    ).toBeVisible();

    // Wait for the attlog entries table
    await page.waitForSelector("table tbody tr");

    // Get attlog entry rows
    const attlog = page.locator("table tbody tr");
    const attlogEntries = await attlog.count();

    if (attlogEntries === 1) {
      console.log("No entries in the attlog. Skipping test.");
      test.skip();
    }
  
    // Apply filter by Employee ID
    await page.getByRole('combobox', { name: 'Employee ID' }).click();
    await page.getByRole('option', { name: '11-7483' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows 11-7483
    const filteredRows = page.locator('table tbody tr');
    const filteredCount = await filteredRows.count();

    for (let i = 0; i < filteredCount; i++) {
      const empId = await filteredRows.nth(i).locator('td').nth(0).innerText();
      expect(empId).toBe('11-7483');
    }

    // Clear filter by Employee ID
    await page.locator('svg.p-select-clear-icon').click();
    
    // Apply filter by Name
    await page.getByRole('combobox', { name: 'Name' }).click();
    await page.getByRole('option', { name: 'Janelle G Matugas' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Janelle G Matugas
    const filteredRowsByName = page.locator('table tbody tr');
    const filteredCountByName = await filteredRowsByName.count();

    for (let i = 0; i < filteredCountByName; i++) {
      const name = await filteredRowsByName.nth(i).locator('td').nth(1).innerText();
      expect(name).toBe('Janelle G Matugas');
    }

    // Clear filter by Name
    await page.locator('svg.p-select-clear-icon').click();
    
    // Apply filter by Date
    await page.getByRole('combobox', { name: 'Date' }).click();
    await page.getByText('21 Jul 2026').click();

    await page.waitForTimeout(1000); // wait for filter to apply

    // check if first column only shows 01 Jul 2026
    const filteredRowsByDate = page.locator('table tbody tr');
    const filteredCountByDate = await filteredRowsByDate.count();
    
    for (let i = 0; i < filteredCountByDate; i++) {
      const date = await filteredRowsByDate.nth(i).locator('td').nth(2).innerText();
      expect(date).toBe('21 Jul 2026');
    } // for dev fix here, failed initially, for rerun after patch
  
  });
}); 
