// @ts-check
import { test, expect } from "@playwright/test";
import { employeeValidFaker, employeeInvalidFaker, employeeEditValidFaker } from '../../fake-data/employee-faker';

test.describe.serial("Employee/User Management.", () => {
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

  test("Test 1: Verify Employee/User page is accessible", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");
  });

  test("Test 2: Verify search functionality.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no attlogs
    if (firstRow.includes("No matching records found")) {
      console.log("No employee records found. Skipping test.");
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

    expect(noResult).toContain("No employees found.");
  });

  test("Test 3: Navigate between pages.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

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
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no employee records
    if (firstRow.includes("No matching records found")) {
      console.log("No employee records found. Skipping test.");
      test.skip();
    }

    
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "5", exact: true }).click();

      // Wait until the table displays 50 rows
    const employeeRows = page.locator('table tbody tr');

    await expect(employeeRows).toHaveCount(5);

    // Assert
    expect(await employeeRows.count()).toBeLessThanOrEqual(5);
      
  });

  test("Test 5: Verify filter functionality.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    // Check if table has rows
    await page.waitForSelector("table tbody tr");
    const rows = page.locator("table tbody tr");

    const firstRow = await rows.first().innerText();

    // Skip if there are no employee records
    if (firstRow.includes("No matching records found")) {
      console.log("No employee records found. Skipping test.");
      test.skip();
    }

    // Apply filter by Bureau/Service/Section/Unit
    await page.getByRole('combobox', { name: 'Bureau/Service/Section/Unit' }).click();
    await page.getByRole('option', { name: 'Regional Information & Communication Technology Management Section' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Regional Information & Communication Technology Management Section
    const filteredRows = page.locator('table tbody tr');
    const filteredCount = await filteredRows.count();

    for (let i = 0; i < filteredCount; i++) {
      const obsu = await filteredRows.nth(i).locator('td').nth(2).innerText();
      expect(obsu).toBe('Regional Information & Communication Technology Management Section');
    }

    // Clear filter by Bureau/Service/Section/Unit
    await page.locator('svg.p-select-clear-icon').click();

    // Apply filter by Division
    await page.getByRole('combobox', { name: 'Division' }).click();
    await page.getByRole('option', { name: 'Policy and Plans Division' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Policy and Plans Division
    const filteredRows2 = page.locator('table tbody tr');
    const filteredCount2 = await filteredRows2.count();

    for (let i = 0; i < filteredCount2; i++) {
      const division = await filteredRows2.nth(i).locator('td').nth(3).innerText();
      expect(division).toBe('Policy and Plans Division');
    }

    // Clear filter by Division
    await page.locator('svg.p-select-clear-icon').click();

    // Apply filter by Employment Status
    await page.getByRole('combobox', { name: 'Employment Status' }).click();
    await page.getByRole('option', { name: 'Permanent' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Permanent
    const filteredRows3 = page.locator('table tbody tr');
    const filteredCount3 = await filteredRows3.count();

    for (let i = 0; i < filteredCount3; i++) {
      const employmentStatus = await filteredRows3.nth(i).locator('td').nth(5).innerText();
      expect(employmentStatus).toBe('Permanent');
    }

    // Clear filter by Employment Status
    await page.locator('svg.p-select-clear-icon').click();

    // Apply filter by Fund Source
    await page.getByRole('combobox', { name: 'Fund Source' }).click();
    await page.getByRole('option', { name: 'Information and Communication Technology Service Management' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Permanent
    const filteredRows4 = page.locator('table tbody tr');
    const filteredCount4 = await filteredRows4.count();

    for (let i = 0; i < filteredCount4; i++) {
      const fundSource = await filteredRows4.nth(i).locator('td').nth(6).innerText();
      expect(fundSource).toBe('Information and Communication Technology Service Management');
    }

    // Clear filter by Fund Source
    await page.locator('svg.p-select-clear-icon').click();

    // Apply filter by User Roles
    await page.getByRole('combobox', { name: 'User Roles'}).click();
    await page.getByRole('option', { name: 'Accounting' }).click();

    await page.waitForTimeout(1000); // wait for filter to apply
    
    // check if first column only shows Permanent
    const filteredRows5 = page.locator('table tbody tr');
    const filteredCount5 = await filteredRows5.count();

    for (let i = 0; i < filteredCount5; i++) {
      const userRole = await filteredRows5.nth(i).locator('td').nth(7).innerText();
      expect(userRole).toBe('Accounting');
    }

    // Clear filter by User Roles
    await page.locator('svg.p-select-clear-icon').click();

  });

  test("Test 6: Can add employee/user with valid entries.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    const addModal = page.getByRole('dialog');

    // click add employee button
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const employeeFaker = employeeValidFaker();
    const employeeID = employeeFaker.employeeId;
    const username = employeeFaker.username;
    const firstName = employeeFaker.firstName;
    const middleName = employeeFaker.middleName;
    const lastName = employeeFaker.lastName;
    const email = employeeFaker.email;
    const confirmEmail = employeeFaker.confirmEmail;
    const password = employeeFaker.password;
    const confirmPassword = employeeFaker.confirmPassword;
    const position = employeeFaker.position;
    const designation = employeeFaker.designation;
    const employmentStatus = employeeFaker.employmentStatus;
    const fundSource = employeeFaker.fundSource;
    const areaOfAssignment = employeeFaker.areaOfAssignment;
    const division = employeeFaker.division;
    const unitSection = employeeFaker.unitSection;
    const userType = employeeFaker.userType;

    // fill out the form
    await page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input').fill(employeeID);
    console.log(employeeID);
    await page.locator('.field').filter({ hasText: 'Username' }).locator('input').fill(username);
    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);
    
    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) })
        .locator('input');

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) })
        .locator('input');

    await emailField.fill(email);
    await confirmEmailField.fill(confirmEmail);

    const passwordField = page
        .locator('.field')
        .filter({ has: page.getByText('Password', { exact: true }) })
        .locator('input');

    const confirmPasswordField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Password', { exact: true }) })
        .locator('input');

    await passwordField.fill(password);
    await confirmPasswordField.fill(confirmPassword);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    const fundSourceSelect = page.locator('.field').getByLabel('Fund Source');
    await fundSourceSelect.click();
    await page.getByRole('option', { name: fundSource, exact: true }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(10000); // wait for search results to load

    // search for the newly added employee/user
    await page.locator('input[placeholder="Search"]').fill(employeeID);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    expect(searchResult).toContain(employeeID);
  });

  test("Test 7: Cannot add employee/user with invalid entries on the name and email fields.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    const addModal = page.getByRole('dialog');

    // click add employee button
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const employeeFaker = employeeInvalidFaker();
    const invalidInput = employeeFaker.invalidInput;

    // fill out the form
    const firstNameField = page.locator('.field').filter({ has: page.getByText('First Name', { exact: true })});
    const lastNameField = page.locator('.field').filter({ has: page.getByText('First Name', { exact: true })});
    const emailField = page.locator('.field').filter({ has: page.getByText('Email Address', { exact: true }) });

    await firstNameField.locator('input').fill(invalidInput);
    await lastNameField.locator('input').fill(invalidInput);
    await emailField.locator('input').fill(invalidInput);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // check if first name field shows an invalid message containing "The field contains invalid characters."
    await expect(firstNameField.getByText('The field contains invalid characters.', { exact: true })).toBeVisible();
    await expect(lastNameField.getByText('The field contains invalid characters.', { exact: true })).toBeVisible();
    await expect(emailField.getByText('The email field is not a valid email.', { exact: true })).toBeVisible();
    
  });

  test("Test 8: Cannot add employee/user if password does not meet complexity requirements.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    const addModal = page.getByRole('dialog');

    // click add employee button
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const employeeFaker = employeeValidFaker();
    const employeeID = employeeFaker.employeeId;
    const username = employeeFaker.username;
    const firstName = employeeFaker.firstName;
    const middleName = employeeFaker.middleName;
    const lastName = employeeFaker.lastName;
    const email = employeeFaker.email;
    const confirmEmail = employeeFaker.confirmEmail;
    const position = employeeFaker.position;
    const designation = employeeFaker.designation;
    const employmentStatus = employeeFaker.employmentStatus;
    const fundSource = employeeFaker.fundSource;
    const areaOfAssignment = employeeFaker.areaOfAssignment;
    const division = employeeFaker.division;
    const unitSection = employeeFaker.unitSection;
    const userType = employeeFaker.userType;

    // password less than minimum length (8)
    const passwordMinLength = "aaa";

    // password value no capital letter
    const passwordNoCaps = "aaa-12345678";

    // password value no special character/s
    const passwordNoSpecialChar = "Aaa12345678";

    // password value no numbers
    const passwordNoNumbers = "P@ssword";

    // password value no letters
    const passwordNoLetters = "1234567890";

    // password more than maximum length
    const passwordMaxLength = "12345678901234567890";

    // password and confirm password do not match
    const passwordNotMatch = "P@ssword12345";
    const confirmPasswordNotMatch = "Password123";

    // fill out the form
    await page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input').fill(employeeID);
    console.log(employeeID);
    await page.locator('.field').filter({ hasText: 'Username' }).locator('input').fill(username);
    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);
    
    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) })
        .locator('input');

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) })
        .locator('input');

    await emailField.fill(email);
    await confirmEmailField.fill(confirmEmail);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    const fundSourceSelect = page.locator('.field').getByLabel('Fund Source');
    await fundSourceSelect.click();
    await page.getByRole('option', { name: fundSource, exact: true }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    const passwordField = page.locator('.field').filter({ has: page.getByText('Password', { exact: true }) });
    const confirmPasswordField = page.locator('.field').filter({ has: page.getByText('Confirm Password', { exact: true }) });

    // check length restriction
    await passwordField.locator('input').fill(passwordMinLength);
    await confirmPasswordField.locator('input').fill(passwordMinLength);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(passwordField.getByText('This field should be at least 8 characters long', { exact: true })).toBeVisible();

    // check if no captial letter
    await passwordField.locator('input').fill("");
    await confirmPasswordField.locator('input').fill("");
    await passwordField.locator('input').fill(passwordNoCaps);
    await confirmPasswordField.locator('input').fill(passwordNoCaps);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(passwordField.getByText('Password must contain an uppercase letter.', { exact: true })).toBeVisible();

    // check if no special character
    await passwordField.locator('input').fill("");
    await confirmPasswordField.locator('input').fill("");
    await passwordField.locator('input').fill(passwordNoSpecialChar);
    await confirmPasswordField.locator('input').fill(passwordNoSpecialChar);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(passwordField.getByText('Password must contain a special character.', { exact: true })).toBeVisible();

    // check if no number
    await passwordField.locator('input').fill("");
    await confirmPasswordField.locator('input').fill("");
    await passwordField.locator('input').fill(passwordNoNumbers);
    await confirmPasswordField.locator('input').fill(passwordNoNumbers);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(passwordField.getByText('Password must contain at least one number.', { exact: true })).toBeVisible();

    // check if no letters
    await passwordField.locator('input').fill("");
    await confirmPasswordField.locator('input').fill("");
    await passwordField.locator('input').fill(passwordNoLetters);
    await confirmPasswordField.locator('input').fill(passwordNoLetters);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(passwordField.getByText('Password must contain an uppercase letter.', { exact: true })).toBeVisible();
    await expect(passwordField.getByText('Password must contain an lowercase letter.', { exact: true })).toBeVisible();

    // check if more than max length
    await passwordField.locator('input').fill("");
    await confirmPasswordField.locator('input').fill("");
    await passwordField.locator('input').fill(passwordMaxLength);
    await confirmPasswordField.locator('input').fill(passwordMaxLength);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(passwordField.getByText('The maximum length allowed is 16', { exact: true })).toBeVisible();

    // check if password do not match
    await passwordField.locator('input').fill("");
    await confirmPasswordField.locator('input').fill("");
    await passwordField.locator('input').fill(passwordNotMatch);
    await confirmPasswordField.locator('input').fill(confirmPasswordNotMatch);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(confirmPasswordField.getByText('Passwords must match', { exact: true })).toBeVisible();
  });

  test("Test 9: Cannot add employee/user if email do not match.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    const addModal = page.getByRole('dialog');

    // click add employee button
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const employeeFaker = employeeValidFaker();
    const employeeID = employeeFaker.employeeId;
    const username = employeeFaker.username;
    const firstName = employeeFaker.firstName;
    const middleName = employeeFaker.middleName;
    const lastName = employeeFaker.lastName;
    const password = employeeFaker.password;
    const confirmPassword = employeeFaker.confirmPassword;
    const position = employeeFaker.position;
    const designation = employeeFaker.designation;
    const employmentStatus = employeeFaker.employmentStatus;
    const fundSource = employeeFaker.fundSource;
    const areaOfAssignment = employeeFaker.areaOfAssignment;
    const division = employeeFaker.division;
    const unitSection = employeeFaker.unitSection;
    const userType = employeeFaker.userType;

    const email = employeeFaker.email;
    const confirmEmail = "emaildonotmatch@example.com";

    // fill out the form
    await page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input').fill(employeeID);
    console.log(employeeID);
    await page.locator('.field').filter({ hasText: 'Username' }).locator('input').fill(username);
    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    const fundSourceSelect = page.locator('.field').getByLabel('Fund Source');
    await fundSourceSelect.click();
    await page.getByRole('option', { name: fundSource, exact: true }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    const passwordField = page
        .locator('.field')
        .filter({ has: page.getByText('Password', { exact: true }) })
        .locator('input');

    const confirmPasswordField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Password', { exact: true }) })
        .locator('input');

    // check length restriction
    await passwordField.fill(password);
    await confirmPasswordField.fill(confirmPassword);

    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) });

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) });

    await emailField.locator('input').fill(email);
    await confirmEmailField.locator('input').fill(confirmEmail);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(confirmEmailField.getByText('Email addresses must match', { exact: true })).toBeVisible();
  });

  test("Test 10: Cannot add employee/user if employee id, username and/or email already exists.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/users");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    // open edit modal to get existing user values
    await row.locator('td').nth(8).locator('button:has(svg.fa-pen-to-square)').click();

    const employeeIDvalue = await page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input').inputValue();
    const usernameValue = await page.locator('.field').filter({ hasText: 'Username' }).locator('input').inputValue();
    const emailValue = await page.locator('.field').filter({ hasText: 'Email Address' }).locator('input').first().inputValue();

    // const employeeIDEditField = page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input');
    // const usernameEditField = page.locator('.field').filter({ hasText: 'Username' }).locator('input');
    // const emailEditField = page.locator('.field').filter({ hasText: 'Email Address' }).locator('input');

    console.log("Existing Employee ID: " + employeeIDvalue);
    console.log("Existing Username: " + usernameValue);
    console.log("Existing Email: " + emailValue);

    // close the edit modal field
    await page.getByRole('button', { name: 'Cancel' }).click();

    // click add employee button
    const addModal = page.getByRole('dialog');
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(addModal).toBeVisible();

    // use faker for filling out the form
    const employeeFaker = employeeValidFaker();
    const firstName = employeeFaker.firstName;
    const middleName = employeeFaker.middleName;
    const lastName = employeeFaker.lastName;
    const password = employeeFaker.password;
    const confirmPassword = employeeFaker.confirmPassword;
    const position = employeeFaker.position;
    const designation = employeeFaker.designation;
    const employmentStatus = employeeFaker.employmentStatus;
    const fundSource = employeeFaker.fundSource;
    const areaOfAssignment = employeeFaker.areaOfAssignment;
    const division = employeeFaker.division;
    const unitSection = employeeFaker.unitSection;
    const userType = employeeFaker.userType;

    // fill out the form
    const employeeIDField = page.locator('.field').filter({ has: page.getByText('Employee ID', { exact: true }) });
    await employeeIDField.locator('input').fill(employeeIDvalue);

    const usernameField = page.locator('.field').filter({ has: page.getByText('Username', { exact: true }) }).locator('input');
    await usernameField.fill(usernameValue);

    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);
    
    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) });

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) });

    await emailField.locator('input').fill(emailValue);
    await confirmEmailField.locator('input').fill(emailValue);

    const passwordField = page
        .locator('.field')
        .filter({ has: page.getByText('Password', { exact: true }) })
        .locator('input');

    const confirmPasswordField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Password', { exact: true }) })
        .locator('input');

    await passwordField.fill(password);
    await confirmPasswordField.fill(confirmPassword);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    const fundSourceSelect = page.locator('.field').getByLabel('Fund Source');
    await fundSourceSelect.click();
    await page.getByRole('option', { name: fundSource, exact: true }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(employeeIDField.getByText('The employee number has already been taken.', { exact: true })).toBeVisible();
  });

  test("Test 11: Cannot add employee/user if one or more required field is empty.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    const addModal = page.getByRole('dialog');

    // click add employee button
    await page.getByRole('button', { name: 'Add Employee' }).click();

    const employeeID = page.locator('.field').filter({ hasText: 'Employee ID' });
    const username = page.locator('.field').filter({ hasText: 'Username' });
    const firstName = page.locator('.field').filter({ hasText: 'First Name' });
    const lastName = page.locator('.field').filter({ hasText: 'Last Name' });
    const email = page.locator('.field').filter({ has: page.getByText('Email Address', { exact: true }) });
    const confirmEmail = page.locator('.field').filter({ has: page.getByText('Confirm Email Address', { exact: true }) });
    const password = page.locator('.field').filter({ has: page.getByText('Password', { exact: true }) });
    const confirmPassword = page.locator('.field').filter({ has: page.getByText('Confirm Password', { exact: true }) });
    const division = page.locator('.field').filter({ hasText: 'Division' });

    // click save button without filling out the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(employeeID.getByText('The Employee ID field is required.', { exact: true })).toBeVisible();
    await expect(username.getByText('The username field is required.', { exact: true })).toBeVisible();
    await expect(firstName.getByText('The first name field is required.', { exact: true })).toBeVisible();
    await expect(lastName.getByText('The last name field is required.', { exact: true })).toBeVisible();
    await expect(email.getByText('The email field is required.', { exact: true })).toBeVisible();
    await expect(confirmEmail.getByText('The Confirm Email Address field is required.', { exact: true })).toBeVisible();
    await expect(password.getByText('The password field is required.', { exact: true })).toBeVisible();
    await expect(confirmPassword.getByText('The password field is required.', { exact: true })).toBeVisible();
    await expect(division.getByText('The division field is required.', { exact: true })).toBeVisible();
  });

  test("Test 12: Can update employee details with valid entries.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/users");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal to get existing user values
    await row.locator('td').nth(8).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // expect that employee id and username input fields are disabled
    await expect(page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input')).toBeDisabled();
    await expect(page.locator('.field').filter({ hasText: 'Username' }).locator('input')).toBeDisabled();

    // use faker for filling out the form
    const employeeEditFaker = employeeEditValidFaker();
    const firstName = employeeEditFaker.firstName;
    const middleName = employeeEditFaker.middleName;
    const lastName = employeeEditFaker.lastName;
    const email = employeeEditFaker.email;
    const confirmEmail = employeeEditFaker.confirmEmail;
    const position = employeeEditFaker.position;
    const designation = employeeEditFaker.designation;
    const employmentStatus = employeeEditFaker.employmentStatus;
    const fundSource = employeeEditFaker.fundSource;
    const areaOfAssignment = employeeEditFaker.areaOfAssignment;
    const division = employeeEditFaker.division;
    const unitSection = employeeEditFaker.unitSection;
    const userType = employeeEditFaker.userType;

    // fill out the form
    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);
    
    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) });

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) });

    await emailField.locator('input').fill(email);
    await confirmEmailField.locator('input').fill(confirmEmail);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    // const fundSourceSelect = page.locator('.field').filter({ hasText: 'Fund Source' }).getByRole('combobox');
    // await fundSourceSelect.click();
    // await page.getByRole('option', { name: fundSource, exact: true }).click();

    
    // await page.locator('#pv_id_525 > .p-select-dropdown > .p-icon').click();
    // await page.getByRole('combobox', { name: 'Assistance to Individuals in' }).press('Escape');
    // await page.getByRole('button', { name: 'Close' }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(10000); // wait for search results to load

    // search for the newly added employee/user
    const employeeFullName = firstName + " " + middleName + " " + lastName;
    await page.locator('input[placeholder="Search"]').fill(employeeFullName);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000); // wait for search results to load

    // Verify that the search result is correct
    const searchResult = await page
      .locator("table tbody tr")
      .first()
      .locator("td")
      .nth(1)
      .innerText();
    expect(searchResult).toContain(employeeFullName);
  });

  test("Test 13: Cannot update employee details with invalid entries.", async ({ page }) => {
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

    // expect that employee id and username input fields are disabled
    await expect(page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input')).toBeDisabled();
    await expect(page.locator('.field').filter({ hasText: 'Username' }).locator('input')).toBeDisabled();

    // use faker for filling out the form
    const employeeFaker = employeeInvalidFaker();
    const invalidInput = employeeFaker.invalidInput;

    // fill out the form
    const firstNameField = page.locator('.field').filter({ has: page.getByText('First Name', { exact: true })});
    const lastNameField = page.locator('.field').filter({ has: page.getByText('First Name', { exact: true })});
    const emailField = page.locator('.field').filter({ has: page.getByText('Email Address', { exact: true }) });

    await firstNameField.locator('input').fill(invalidInput);
    await lastNameField.locator('input').fill(invalidInput);
    await emailField.locator('input').fill(invalidInput);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // check if first name field shows an invalid message containing "The field contains invalid characters."
    await expect(firstNameField.getByText('The field contains invalid characters.', { exact: true })).toBeVisible();
    await expect(lastNameField.getByText('The field contains invalid characters.', { exact: true })).toBeVisible();
    await expect(emailField.getByText('The email field is not a valid email.', { exact: true })).toBeVisible();
    
  });

  test("Test 14: Cannot update employee/user if email do not match.", async ({ page }) => {
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

    // expect that employee id and username input fields are disabled
    await expect(page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input')).toBeDisabled();
    await expect(page.locator('.field').filter({ hasText: 'Username' }).locator('input')).toBeDisabled();

    // use faker for filling out the form
    const employeeFaker = employeeEditValidFaker();
    const firstName = employeeFaker.firstName;
    const middleName = employeeFaker.middleName;
    const lastName = employeeFaker.lastName;
    const position = employeeFaker.position;
    const designation = employeeFaker.designation;
    const employmentStatus = employeeFaker.employmentStatus;
    const areaOfAssignment = employeeFaker.areaOfAssignment;
    const division = employeeFaker.division;
    const unitSection = employeeFaker.unitSection;
    const userType = employeeFaker.userType;

    const email = employeeFaker.email;
    const confirmEmail = "emaildonotmatch@example.com";

    // fill out the form
    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    // const fundSourceSelect = page.locator('.field').getByLabel('Fund Source');
    // await fundSourceSelect.click();
    // await page.getByRole('option', { name: fundSource, exact: true }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) });

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) });

    await emailField.locator('input').fill(email);
    await confirmEmailField.locator('input').fill(confirmEmail);

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(confirmEmailField.getByText('Email addresses must match', { exact: true })).toBeVisible();
  });

  test("Test 15: Cannot update employee/user if email already exists.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    // verify url is correct
    await expect(page.url()).toContain("/users");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    // open edit modal to get existing user values
    await row.nth(5).locator('td').nth(8).locator('button:has(svg.fa-pen-to-square)').click();

    const emailValue = await page.locator('.field').filter({ hasText: 'Email Address' }).locator('input').first().inputValue();

    // const employeeIDEditField = page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input');
    // const usernameEditField = page.locator('.field').filter({ hasText: 'Username' }).locator('input');
    // const emailEditField = page.locator('.field').filter({ hasText: 'Email Address' }).locator('input');

    console.log("Existing Email: " + emailValue);

    // close the edit modal field
    await page.getByRole('button', { name: 'Cancel' }).click();

    const editModal = page.getByRole('dialog');

    // open edit modal for first row user to edit and use the existing email value from the 6th row user
    await row.locator('td').nth(8).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // expect that employee id and username input fields are disabled
    await expect(page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input')).toBeDisabled();
    await expect(page.locator('.field').filter({ hasText: 'Username' }).locator('input')).toBeDisabled();
    
    // use faker for filling out the form
    const employeeFaker = employeeEditValidFaker();
    const firstName = employeeFaker.firstName;
    const middleName = employeeFaker.middleName;
    const lastName = employeeFaker.lastName;
    const password = employeeFaker.password;
    const confirmPassword = employeeFaker.confirmPassword;
    const position = employeeFaker.position;
    const designation = employeeFaker.designation;
    const employmentStatus = employeeFaker.employmentStatus;
    const fundSource = employeeFaker.fundSource;
    const areaOfAssignment = employeeFaker.areaOfAssignment;
    const division = employeeFaker.division;
    const unitSection = employeeFaker.unitSection;
    const userType = employeeFaker.userType;

    // fill out the form
    await page.locator('.field').filter({ hasText: 'First Name' }).locator('input').fill(firstName);
    await page.locator('.field').filter({ hasText: 'Middle Name' }).locator('input').fill(middleName);
    await page.locator('.field').filter({ hasText: 'Last Name' }).locator('input').fill(lastName);
    
    const emailField = page
        .locator('.field')
        .filter({ has: page.getByText('Email Address', { exact: true }) });

    const confirmEmailField = page
        .locator('.field')
        .filter({ has: page.getByText('Confirm Email Address', { exact: true }) });

    await emailField.locator('input').fill(emailValue);
    await confirmEmailField.locator('input').fill(emailValue);

    const positionSelect = page.locator('.field').filter({ hasText: 'Position' }).getByRole('combobox');
    await positionSelect.click();
    await page.getByRole('option', { name: position , exact: true }).click();

    const designationSelect = page.locator('.field').filter({ hasText: 'Designation' }).getByRole('combobox');
    await designationSelect.click();
    await page.getByRole('option', { name: designation , exact: true }).click();

    const employmentStatusSelect = page.locator('.field').filter({ hasText: 'Employment Status' }).getByRole('combobox');
    await employmentStatusSelect.click();
    await page.getByRole('option', { name: employmentStatus, exact: true }).click();

    const fundSourceSelect = page.locator('.field').getByLabel('Fund Source');
    await fundSourceSelect.click();
    await page.getByRole('option', { name: fundSource, exact: true }).click();

    const assignmentSelect = page.locator('.field').filter({ hasText: 'Area of Assignment' }).getByRole('combobox');
    await assignmentSelect.click();
    await page.getByRole('option', { name: areaOfAssignment, exact: true}).click();
    
    const divisionSelect = page.locator('.field').filter({ hasText: 'Division' }).getByRole('combobox');
    await divisionSelect.click();
    await page.getByRole('option', { name: division, exact: true }).click();
    
    const unitSectionSelect = page.locator('.field').filter({ hasText: 'Unit / Section' }).getByRole('combobox');
    await unitSectionSelect.click();
    await page.getByRole('option', { name: unitSection, exact: true }).click();

    const userTypeSelect = page.locator('.field').filter({ hasText: 'User Type' }).getByRole('combobox');
    await userTypeSelect.click();
    await page.getByRole('option', { name: userType, exact: true }).click();

    // click save button
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(emailField.getByText('This email has already been taken.', { exact: true })).toBeVisible();
  });

  test("Test 16: Cannot update employee/user if one or more required field is empty.", async ({ page }) => {
    // Navigate to Employee Management page
    await page.locator("a").filter({ hasText: "Management" }).click();
    await page.locator("a").filter({ hasText: "Employee" }).click();

    //verify url is correct
    await expect(page.url()).toContain("/users");

    // get first row user
    await page.waitForSelector('table tbody tr');
    const row = page.locator('table tbody tr');

    const editModal = page.getByRole('dialog');

    // open edit modal for first row user to edit and use the existing email value from the 6th row user
    await row.locator('td').nth(8).locator('button:has(svg.fa-pen-to-square)').click();

    // expect edit modal to be visible
    await expect(editModal).toBeVisible();

    // expect that employee id and username input fields are disabled
    await expect(page.locator('.field').filter({ hasText: 'Employee ID' }).locator('input')).toBeDisabled();
    await expect(page.locator('.field').filter({ hasText: 'Username' }).locator('input')).toBeDisabled();

    const firstName = page.locator('.field').filter({ hasText: 'First Name' });
    const lastName = page.locator('.field').filter({ hasText: 'Last Name' });
    const email = page.locator('.field').filter({ has: page.getByText('Email Address', { exact: true }) });
    const confirmEmail = page.locator('.field').filter({ has: page.getByText('Confirm Email Address', { exact: true }) });
    const division = page.locator('.field').filter({ hasText: 'Division' });

    await firstName.locator('input').fill('');
    await lastName.locator('input').fill('');
    await email.locator('input').fill('');
    await confirmEmail.locator('input').fill('');
    // click save button without filling out the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // expect error message to be visible
    await expect(firstName.getByText('The first name field is required.', { exact: true })).toBeVisible();
    await expect(lastName.getByText('The last name field is required.', { exact: true })).toBeVisible();
    await expect(email.getByText('The email field is required.', { exact: true })).toBeVisible();
    await expect(confirmEmail.getByText('The Confirm Email Address field is required.', { exact: true })).toBeVisible();
    await expect(division.getByText('The division field is required.', { exact: true })).toBeVisible();
  });
        
});
