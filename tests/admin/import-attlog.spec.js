// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial('Admin Attlog Import.', () => {
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

    // Navigate to Attlog Import page
    await page.locator('a').filter({ hasText: 'Attlog' }).click();
    await page.locator('a').filter({ hasText: 'Import' }).click();

    //verify url is correct
    await expect(page.url()).toContain('/attlog');
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await page.locator('div[aria-haspopup="true"]').click();
    await page.locator('a').filter({ hasText: 'Logout' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
  });

  test('Test 1: Verify admin can import valid attlog files.', async ({ page }) => {
    const files = [
        'April_attlog1.dat',
        'April_attlog2.dat',
        'December_attlog1.dat',
        'December_attlog2.dat',
        'December_attlog3.dat',
        'July_attlog1.dat',
        'July_attlog2.dat',
        'July_attlog3.dat',
        'July_attlog4.dat',
        'July_attlog5.dat',
        'June_attlog1.dat',
        'June_attlog2.dat',
        'June_attlog3.dat',
        'June_attlog4.dat',
        'MARCH_attlog1.dat',
        'MARCH_attlog2.dat',
        'MARCH_attlog3.dat',
        'May1.dat',
        'May2.dat',
        'May3.dat',
        'May4.dat',
    ];

    let uploadSuccessful = false;

    const fileInput = page.locator('input[type="file"]');
    const chooseFileButton = page.getByRole('button', { name: ' Choose File' });

    for (const file of files) {
        console.log(`Trying to upload: ${file}`);

        await chooseFileButton.click();
        await fileInput.setInputFiles('./attlogs/' + file);

        await page.getByRole('button', { name: 'Yes' }).click();

        // Replace these with the actual success/error elements
        const successMessage = page.getByText(/Success/).first();
        const errorMessage = page.getByText(/Duplicate File/).first();

        await Promise.race([
            successMessage.waitFor({ state: 'visible', timeout: 5000 }),
            errorMessage.waitFor({ state: 'visible', timeout: 5000 })
        ]).catch(() => {});

        if (await successMessage.isVisible()) {
            console.log(`${file} uploaded successfully`);
            uploadSuccessful = true;
            break;
        }

        await page.waitForTimeout(1000); // Wait for a second before checking for the error message

        if (await errorMessage.isVisible()) {
            console.log(`${file} is a duplicate. Trying next file...`);
            continue;
        }
    }

    expect(uploadSuccessful).toBe(true);
  });

  test('Test 2: Verify admin cannot import invalid attlog files.', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const chooseFileButton = page.getByRole('button', { name: ' Choose File' });

    //click choose file for importing of file
    await chooseFileButton.click();
    await fileInput.setInputFiles('./attlogs/INVALID ATTLOG TEST FILE.xlsx');

    //assert error message is displayed and correct
    await expect(page.getByText('Only .dat files are allowed.').nth(1)).toBeVisible();
  });

  test('Test 3: Verify admin cannot import duplicate attlog files.', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const chooseFileButton = page.getByRole('button', { name: ' Choose File' });

    //check first row of the attlogs table for the first file name
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr').nth(0);

    const firstRowFileName = await row.locator('td').nth(0).innerText();

    // skip test if first row td text contains "No attlogs uploaded yet"
    if (firstRowFileName.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping duplicate file test.");
      test.skip();
    }

    console.log(`First row file name: ${firstRowFileName}`);

    //click choose file for importing of file
    await chooseFileButton.click();
    await fileInput.setInputFiles('./attlogs/' + firstRowFileName);

    //confirm the upload
    await page.getByRole('button', { name: 'Yes' }).click();

    //assert error message is displayed and correct
    await expect(page.getByText('Duplicate File').nth(1)).toBeVisible();
    
  });

  test('Test 4: Verify cancel button works.', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const chooseFileButton = page.getByRole('button', { name: ' Choose File' });

    //count the number of rows in the attlogs table before uploading a file
    await page.waitForSelector('table tbody tr');
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    //check input=file is empty
    await expect(page.getByRole('main')).toContainText('No File Chosen');

    //click choose file for importing of file
    await chooseFileButton.click();
    await fileInput.setInputFiles('./attlogs/April_attlog1.dat');

    //assert that modal is displayed and input=file displays the file name
    await expect(page.getByText('Are you sure you want to upload this April_attlog1.dat employee file? Please double-check that all information is accurate and that the file follows to the required template before proceeding.')).toBeVisible();

    //click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    //assert input=file is empty
    await expect(page.getByText('No File Chosen')).toBeVisible();

    //assert that modal is hidden
    await expect(page.getByText('Are you sure you want to upload this April_attlog1.dat employee file? Please double-check that all information is accurate and that the file follows to the required template before proceeding.')).toBeHidden();
    
    //recount the number of rows in the attlogs table before uploading a file
    await page.waitForSelector('table tbody tr');
    const rerows = await page.locator('table tbody tr');
    const rerowsCount  = await rerows.count();

    //assert that the number of rows in the attlogs table is the same as before
    expect(rerowsCount).toBe(rowsCount);
  });

  test('Test 5: Verify search bar works.', async ({ page }) => {
    //check first row of the attlogs table for the first file name
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const exactKeyword = await row.locator('td').nth(0).innerText();

    console.log(`Exact match: ${exactKeyword}`);

    // skip test if first row td text contains "No attlogs uploaded yet"
    if (exactKeyword.includes("No attlogs uploaded yet")) {
      console.log("No attlogs uploaded yet. Skipping search bar testing.");
      test.skip();
    }

    //search for exact match
    await page.getByPlaceholder('Search').fill(exactKeyword);

    await page.waitForTimeout(1000); 

    await page.waitForSelector('table tbody tr');
    const resultRow = page.locator('table tbody tr');
    const match = await resultRow.locator('td').nth(0).innerText();

    await page.waitForTimeout(1000); // Wait for a second before asserting

    //assert that the first row of the attlogs table contains the exact match text
    await expect(match).toBe(exactKeyword);

    console.log(`Exact match found: ${match}`);

    //clear search bar
    await page.getByPlaceholder('Search').fill('');

    //search for partial match

    await page.waitForSelector('table tbody tr');
    const row2 = page.locator('table tbody tr');
    
    const partialMatch = await row2.locator('td').nth(0).innerText();

    //trim partialMatch to 3 characters
    const partialMatchkeyword = partialMatch.substring(0, 3);

    //search for partial match
    await page.getByPlaceholder('Search').fill(partialMatchkeyword);

    //count the number of rows in the attlogs table
    await page.waitForSelector('table tbody tr');
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    //assert that each row of the attlogs table contains the partial match text
    for (let i = 0; i < rowsCount; i++) {
      await expect(page.locator('table tbody tr').nth(i)).toContainText(partialMatchkeyword);
      console.log(`Row ${i + 1} contains partial match: ${partialMatchkeyword}`);
    }

    //clear search bar
    await page.getByPlaceholder('Search').fill('');

    await page.waitForSelector('table tbody tr');
    const row3 = page.locator('table tbody tr');

    const noMatch = 'xxx';

    //search for no match
    await page.getByPlaceholder('Search').fill(noMatch);

    //assert that the attlogs table displays "No data available in table"
    await expect(page.locator('table tbody tr').nth(0)).toContainText('No attlogs uploaded yet');

    console.log(`Keyword "${noMatch}" returned no results as expected.`);
  });
});