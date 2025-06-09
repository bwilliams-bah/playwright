
import { test, expect } from '@playwright/test';
import { Admin_Page } from '../pages/Admin_Page.ts';


test.describe('Table Functionality Tests', () => {

  let admin_Page: Admin_Page;

  test.beforeEach(async ({page}, ) => {
    admin_Page = new Admin_Page(page);
    await admin_Page.navigate();
  });

  test.afterEach(async ({page}, testInfo) => {
    // Close the page after each test
    await page.close();
    });

  // Verify the table loads with the default sort order displaying the most recently added item first
  test('Verify the table loads with the default sort order displaying the most recently added item first', async ({ page }) => {
    
    await admin_Page.verifyTableSortOrder();
    await admin_Page.addUser('Test', 'User', 'TestUser', 'TestUser@test.com', '8103573026', 'AI2C (Army)', 'Camp Zama', 'Hawaii');
    await admin_Page.verifyUser('Test', 'User', 'TestUser');
    await admin_Page.editUser('NewTest', 'NewUser', 'NewTestUser');
    await admin_Page.verifyUser('NewTest', 'NewUser', 'NewTestUser');
    await admin_Page.deleteUser();

    // Verify the user is deleted
    await expect(admin_Page.firstRow).not.toContainText('NewTestUser');

    // Verify the table default sort order
    await admin_Page.verifyTableSortOrder();
    
  });

  // Rows Per Page Functionality
  test('Verify table displays the expected number of rows per page', async ({ page }) => {
    // Verify the default number of rows per page is 50
    let expectedNumberOfRows = 50
    expect(await admin_Page.rowsDisplayedEquals(expectedNumberOfRows));

    // Change the number of rows per page to 10
    expectedNumberOfRows = 10;
    await admin_Page.changeRowsPerPageTo(expectedNumberOfRows.toString());

    // Verify the number of rows per page is 10
    expect(await admin_Page.rowsDisplayedEquals(expectedNumberOfRows));
    
  });

  // General Functionality
  test('Verify table displays all columns with correct headers', async ({ page }) => {
    const expectedHeaders = ['FIRST NAME', 'LAST NAME', 'USERNAME', 'CONTACT NUMBER', 'DSN (EXT.)', 'E-MAIL', 'INSTALLATION', 'UNIT', 'ROLE', 'TERRITORY', 'ACTIONS'];
    await admin_Page.verifyTableHeadersEquals(expectedHeaders);
  });

  
  test('Verify table add, edit and delete buttons are functional', async ({ page }) => {
      await admin_Page.editRowButton.click();
      await expect(admin_Page.modal).toBeVisible();
      await admin_Page.modalCancelButton.click();
      await expect(admin_Page.modal).not.toBeVisible();
      await admin_Page.deleteRow.click();
      await expect(admin_Page.modal).toBeVisible();
      await admin_Page.modalCancelButton.click();
      await expect(admin_Page.modal).not.toBeVisible();
      await admin_Page.addUserButton.click();
      await expect(admin_Page.modal).toBeVisible();
      await admin_Page.modalCancelButton.click();
      await expect(admin_Page.modal).not.toBeVisible();
    });

    // Sorting Functionality
  test('Verify clicking on each sortable column header sorts the table in ascending order', async ({ page }) => {
    await admin_Page.verifyColumnSortsAscending(page);
  });

  test('Verify clicking the same column header again sorts the table in descending order', async ({ page }) => {
    await admin_Page.verifyColumnSortsDescending(page);
    
  });

  test('Verify clicking the same column header a third time returns the table to the default sort order', async ({ page }) => {
    await admin_Page.verifyColumnSortsDefault(page);
  });

  test('Verify the ACTION column is not sortable', async ({ page }) => {
    // Get the text content of the first cell in the FIRST NAME column
    const firstNameBeforeSort = await page.locator('[role="rowgroup"] [role="row"]').nth(0).locator('[role="gridcell"]').nth(0).textContent();
    // Click on the ACTION column header
    await admin_Page.columnHeaders.filter({ hasText: 'ACTIONS' }).click();
    await page.waitForTimeout( 1000 );
    // Get the text content of the first cell in the FIRST NAME column again
    const firstNameAfterSort = await page.locator('[role="rowgroup"] [role="row"]').nth(0).locator('[role="gridcell"]').nth(0).textContent();
    // Verify that the first name has not changed
    expect(firstNameBeforeSort).toEqual(firstNameAfterSort);
  });

  // Sorting Persistence
  test('Verify sorting persists when navigating between pages', async ({ page }) => {

    // Click on the column header to sort in ascending order
    await admin_Page.columnHeaders.first().click();
    await page.waitForTimeout( 1000 );
    
    // Locate the rowgroup and extract the text content of the cells
    const firstNames = await admin_Page.rows.evaluateAll(rows => 
        rows.map(row => {
          const cell = row.querySelector('[role="gridcell"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        })
    );
    // Click on the right arrow to navigate to the next page
    await page.getByTestId('KeyboardArrowRightIcon').click();
    await page.waitForTimeout( 1000 );
    // Locate the rowgroup and extract the text content of the cells and add it to the firstNames array merged with the previous page
    const nextPageFirstNames = await page.locator('[role="rowgroup"] [role="row"]').evaluateAll(rows =>
        rows.map(row => {
          const cell = row.querySelector('[role="gridcell"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        })
    );
    const allFirstNames = firstNames.concat(nextPageFirstNames);    
    
    // Verify the values are in ascending order
    for (let i = 0; i < allFirstNames.length - 1; i++) {
        expect(allFirstNames[i].localeCompare(allFirstNames[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  test('Verify sorting persists when changing the number of rows per page', async ({ page }) => {
    // Click on the column header to sort in ascending order
    await admin_Page.columnHeaders.first().click();
    await page.waitForTimeout( 1000 );

    // Verify the column is sorted in ascending order
    const column1Cells = await admin_Page.rows.evaluateAll(rows => 
        rows.map(row => {
          const cell = row.querySelector('[role="gridcell"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        })
    );
    
    for (let i = 0; i < column1Cells.length - 1; i++) {
        // Verify the count of the first names is 50
        expect(column1Cells.length).toEqual(50);
        // Verify the values are in ascending order
        expect(column1Cells[i].localeCompare(column1Cells[i + 1])).toBeLessThanOrEqual(0);
    }

    // Change the number of rows per page to 10
    await admin_Page.pagination.click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await page.waitForTimeout( 1000 );

    // Verify the column is still sorted in ascending order
    const newColumn1Cells = await admin_Page.rows.evaluateAll(rows =>
        rows.map(row => {
          const cell = row.querySelector('[role="gridcell"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        }
      )
    );  

    for (let i = 0; i < newColumn1Cells.length - 1; i++) {
        // Verify the count of the first names is 10
        expect(newColumn1Cells.length).toEqual(10);
        // Verify the values are in ascending order
        expect(newColumn1Cells[i].localeCompare(newColumn1Cells[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  // Pagination Functionality
  test('Verify the pagination indicator displays the correct range of rows', async ({ page }) => {

    const defaultRowsPerPage = "50";

    // Get the text content of the pagination indicator
    const paginationIndicatorText = await admin_Page.paginationIndicator.textContent();
    // Use a regular expression to match the text to the expected format
    const match = paginationIndicatorText ? paginationIndicatorText.match(/(\d+)–(\d+) of (\d+)/) : null;
    
    if (match) {
        // Verify the end range matches the default number of rows per page
        const endRange = match[2];
        expect(endRange).toEqual(defaultRowsPerPage);
        // Verify the actual number of rows displayed matches the end range
        expect(await admin_Page.rows.count()).toBe(parseInt(endRange));
    }
    else 
        throw new Error("Pagination indicator does not match expected format");
  });

  test('Verify the left arrow is inactive on the first page', async ({ page }) => {
    const leftArrow = page.getByTestId('KeyboardArrowLeftIcon');
    // Verify the left arrow is disabled
    await expect(leftArrow).toBeDisabled();
  });

  test('Verify the right arrow is inactive on the last page or if there is only one page of records', async ({ page }) => {

    // Function to check if the current page is the last page
    async function isLastPage(page) {
        // Locate the pagination indicator element
        const paginationIndicator = page.locator('.MuiTablePagination-displayedRows');
        // Get the text content of the pagination indicator
        const paginationIndicatorText = await paginationIndicator.textContent();
        
        // Use a regular expression to match the text to the expected format
        const match = paginationIndicatorText ? paginationIndicatorText.match(/(\d+)–(\d+) of (\d+)/) : null;
       
        // If the end range equals the total number of records then we are on the last page
        if (match) {
            const end = match[2];
            const total = match[3];
            return end === total
        }
        throw new Error("Pagination indicator does not match expected format");
    }
    // Loop to click the right arrow until we reach the last page
    while(!(await isLastPage(page))) {
        await page.getByTestId('KeyboardArrowRightIcon').click();
        await page.waitForTimeout( 500 );
    }
    
    // Verify the right arrow is inactive on the last page
    const rightArrow = page.getByTestId('KeyboardArrowRightIcon');
    await expect(rightArrow).toBeDisabled();
    });

  test('Verify clicking the right arrow navigates to the next page', async ({ page }) => {

    // Function to check if there are enough records for pagination
    async function hasEnoughRecords(page) {
        const text = await admin_Page.paginationIndicator.textContent();
        const match = text ? text.match(/(\d+)–(\d+) of (\d+)/) : null;
        if (match) {
            const [start, end, total] = match.slice(1).map(Number);
            return total > end;
        }
        throw new Error("Pagination indicator text format is incorrect.");
    }
    
    // Check if there are enough records for pagination
    if (!(await hasEnoughRecords(page))) {
        // Reduce the number of rows displayed to allow for multiple pages
        await admin_Page.pagination.click();
        await page.getByRole('option', { name: '10', exact: true }).click();
        await page.waitForTimeout( 1000 );
        if (!(await hasEnoughRecords(page))) {
            test.skip(true, "Not enough records to test pagination");
        }
    }
    
    // Locate the pagination indicator element
    const paginationIndicator = admin_Page.paginationIndicator;

    // Get the initial text content of the pagination indicator
    const initialText = await paginationIndicator.textContent();
    const initialMatch = initialText ? initialText.match(/(\d+)–(\d+) of (\d+)/) : null;


    if (initialMatch) {
        // Extract the start and end values from the match
        const [initialStart, initialEnd, total] = initialMatch.slice(1).map(Number);
    
        // Click the right arrow to navigate to the next page
        await page.getByTestId('KeyboardArrowRightIcon').click();
        await page.waitForTimeout( 1000 );
    
        // Get the updated text content of the pagination indicator
        const updatedText = await paginationIndicator.textContent();
        const updatedMatch = updatedText ? updatedText.match(/(\d+)–(\d+) of (\d+)/) : null;
        if (updatedMatch) {
            // Extract the updated start and end values from the match
            const [updatedStart, updatedEnd] = updatedMatch.slice(1).map(Number);
    
            // Verify the range has updated correctly
            expect(updatedStart).toBe(initialEnd + 1);
            expect(updatedEnd).toBeLessThanOrEqual(total);
        }
        else {
            throw new Error("Updated pagination indicator text format is incorrect.");
        }
    }
    else {
        throw new Error("Initial pagination indicator text format is incorrect.");
    }

  });

  test('Verify clicking the left arrow navigates to the previous page', async ({ page }) => {
    // Function to check if there are enough records for pagination
    async function hasEnoughRecords(page) {
        const paginationIndicator = admin_Page.paginationIndicator;
        const text = await paginationIndicator.textContent();
        const match = text ? text.match(/(\d+)–(\d+) of (\d+)/) : null;
        if (match) {
            const [start, end, total] = match.slice(1).map(Number);
            return total > end;
        }
        throw new Error("Pagination indicator text format is incorrect.");
    }
    // Check if there are enough records for pagination
    if (!(await hasEnoughRecords(page))) {
        // Reduce the number of rows displayed to allow for multiple pages
        await admin_Page.pagination.click();
        await page.getByRole('option', { name: '10', exact: true }).click();
        await page.waitForTimeout( 1000 );
        if (!(await hasEnoughRecords(page))) {
            test.skip(true, "Not enough records to test pagination");
        }
    }
    // Click the right arrow to navigate to the next page
    await page.getByTestId('KeyboardArrowRightIcon').click();
    await page.waitForTimeout( 1000 );
    // Locate the pagination indicator element
    const paginationIndicator = admin_Page.paginationIndicator;
    // Get the initial text content of the pagination indicator
    const initialText = await paginationIndicator.textContent();
    const initialMatch = initialText ? initialText.match(/(\d+)–(\d+) of (\d+)/) : null;
    if (initialMatch) {
        // Extract the start and end values from the match
        const [initialStart, initialEnd, total] = initialMatch.slice(1).map(Number);
        // Click the left arrow to navigate to the previous page
        await page.getByTestId('KeyboardArrowLeftIcon').click();
        await page.waitForTimeout( 1000 );
        // Get the updated text content of the pagination indicator
        const updatedText = await paginationIndicator.textContent();
        const updatedMatch = updatedText ? updatedText.match(/(\d+)–(\d+) of (\d+)/) : null;
        if (updatedMatch) {
            // Extract the updated start and end values from the match
            const [updatedStart, updatedEnd] = updatedMatch.slice(1).map(Number);
            // Verify the range has updated correctly
            expect(updatedStart).toBeLessThan(initialStart);
            expect(updatedEnd).toBe(initialStart - 1);
        }
        else {
            throw new Error("Updated pagination indicator text format is incorrect.");
        }
    }
    else {
        throw new Error("Initial pagination indicator text format is incorrect.");
    }
  });


  test('Verify the pagination indicator updates correctly based on the selected number of rows per page', async ({ page }) => {
    
    // Change the number of rows per page to 10
    await admin_Page.pagination.click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await page.waitForTimeout( 1000 );
    // Locate the pagination indicator element
    const paginationIndicator = admin_Page.paginationIndicator;
    // Get the text content of the pagination indicator
    const paginationIndicatorText = await paginationIndicator.textContent();
    // Use a regular expression to match the text to the expected format
    const match = paginationIndicatorText ? paginationIndicatorText.match(/(\d+)–(\d+) of (\d+)/) : null;
    if (match) {
        // Extract the start and end values from the match
        const [start, end, total] = match.slice(1).map(Number);
        // Verify the end value is equal to the number of rows per page
        expect(end).toEqual(10);
        // Verify the actual number of rows displayed matches the end range
        expect(await admin_Page.rows.count()).toBe(end);
    }
    else {
        throw new Error("Pagination indicator text format is incorrect.");
    }

  });

  // Single-Column Sorting
  test('Verify the table does not support sorting by multiple columns', async ({ page }) => {
    // Click on the FIRST column header to sort by column1
    await admin_Page.columnHeaders.first().click();
    await page.waitForTimeout( 1000 );
    // Extract the values from the FIRST column
    const column1CellValues = await admin_Page.rows.evaluateAll(rows =>
        rows.map(row => {
          const cell = row.querySelector('[data-colindex="0"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        })
    );
    
    // Click on the SECOND column header to sort by column2
    await admin_Page.columnHeaders.nth(1).click();
    await page.waitForTimeout( 1000 );
    // Extract the values from the SECOND column
    const column2CellValues = await admin_Page.rows.evaluateAll(rows =>
        rows.map(row => {
          const cell = row.querySelector('[data-colindex="1"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        })
    );
    // Verify the LAST NAME column is sorted in ascending order
    for (let i = 0; i < column2CellValues.length - 1; i++) {
        expect(column2CellValues[i].localeCompare(column2CellValues[i + 1])).toBeLessThanOrEqual(0);
    }

    // Extract the values from the FIRST NAME column again
    const column1CellValuesAfter = await admin_Page.rows.evaluateAll(rows =>
        rows.map(row => {
          const cell = row.querySelector('[data-colindex="0"]');
          return cell && cell.textContent ? cell.textContent.trim() : '';
        })
    );
    // Verify the FIRST NAME column is not sorted after sorting by LAST NAME
    expect(column1CellValues).not.toEqual(column1CellValuesAfter);

  });

    // Filter Functionality
  test('Verify the table can filter columns with different operators', async ({ page }) => {
    // Define the columns and filter operators
    const columns = [
      { name: 'FIRST NAME', field: 'firstName' },
      { name: 'LAST NAME', field: 'lastName' },
      { name: 'USERNAME', field: 'cacUsername' },
      { name: 'E-MAIL', field: 'emailAddress' },
    ];
    const filterOperators = ['contains', 'equals', 'startsWith', 'endsWith'];
    // test filter value
    const test = 'jon';
    // Loop through each column and operator
    for (const column of columns) {
      for (const operator of filterOperators) {
        // Open filter modal for the column
        await admin_Page.filters.click();
        await page.waitForTimeout( 500 );

        // Click the Columns dropdown
        await admin_Page.columns.nth(1).click();

        // Select the column to filter
        await page.locator(`[data-value="${column.field}"]`).click();
        //await page.locator('[data-value="startsWith"]').click();
        await page.waitForTimeout( 500 );

        // Click the Operator dropdown
        await admin_Page.operator.nth(1).click();

        // Select the operator
        await page.locator(`[data-value="${operator}"]`).click();

        // Enter filter value
        await admin_Page.value.fill(test);
        await page.waitForTimeout( 500 );

        // Apply filter
        await admin_Page.filters.click();
        await page.waitForTimeout( 500 );

        // Verify filter is applied
        await expect(page.locator(`div[data-field="${column.field}"]`).getByTestId('FilterAltIcon')).toBeVisible();

        // Verify filtered results
        const rows = await admin_Page.rows.all();
        // Verify each row's cell value matches the filter criteria
        for (let i = 0; i < rows.length; i++) {
          const cell =  admin_Page.rows.nth(i).locator(`div[data-field="${column.field}"]`);
          const actualCellText = cell ? await cell.textContent() : '';
          const actualCellTextLowerCase = actualCellText ? actualCellText.toLowerCase() : '';
          switch (operator) {
            case 'contains':
              expect(actualCellTextLowerCase).toContain(test);
              break;
            case 'equals':
              expect(actualCellTextLowerCase).toBe(test);
              break;
            case 'startsWith':
              expect(actualCellTextLowerCase?.startsWith(test))
              break;
            case 'endsWith':
              expect(actualCellTextLowerCase?.endsWith(test));
              break;
            }
        }
       }
    }
});

  test('Verify the table can be filtered by mulitple columns at the same time', async ({ page }) => {
    const filters = [
        { column: 'FIRST NAME', field: 'firstName', operator: 'startsWith', value: 'ada' },
        { column: 'USERNAME', field: 'cacUsername', operator: 'contains', value: 'on' },
        { column: 'LAST NAME', field: 'lastName', operator: 'endsWith', value: 'g' },
      ];
  
      // Open filter modal for the column
      await admin_Page.filters.click();
      await page.waitForTimeout( 500 );
        
      let i = 1;
      // Loop through each filter
      for (const filter of filters) {
        // Click the Columns dropdown
        await admin_Page.columns.nth(i).click();
        
        // Select the column to filter
        await page.locator(`[data-value="${filter.field}"]`).click();
        // await page.locator('[data-value="firstName"]').click();
        await page.waitForTimeout( 500 );

        let regexPattern = "^AndColumns" + `${filter.column}` + "OperatorcontainsValue$";
        let regex = new RegExp(regexPattern)
        // Click the Operator dropdown
        await page.locator('div').filter({ hasText: regex }).getByLabel('contains').click();
        //await page.locator('div').filter({ hasText: /^AndColumnsFIRST NAMEOperatorcontainsValue$/ }).getByLabel('contains').click();

        // Select the operator
        await page.locator(`[data-value="${filter.operator}"]`).click();
        // await page.locator('[data-value="startsWith"]').click();
        await page.waitForTimeout( 500 );

        // Enter filter value
        await admin_Page.value.nth(i-1).fill(filter.value);
        await page.waitForTimeout( 500 );

        // click add filter
        await admin_Page.addFilterButton.click();

        // Verify filter is applied
        await expect(page.locator(`div[data-field="${filter.field}"]`).getByTestId('FilterAltIcon')).toBeVisible();
        i++;
      }

      // Apply filter
    await admin_Page.filters.click();
    await page.waitForTimeout( 500 );
  
      // Verify filtered results
      const rows = await admin_Page.rows.all();
      for (let i = 0; i < rows.length; i++) {
        for (const filter of filters) {
          // Verify each row's cell value matches the filter criteria
          const cell = admin_Page.rows.nth(i).locator(`div[data-field="${filter.field}"]`);
          const cellText = cell ? await cell.textContent() : '';
          switch (filter.operator) {
            case 'contains':
              expect(cellText?.toLowerCase()).toContain(filter.value);
              break;
            case 'equals':
              expect(cellText?.toLowerCase()).toBe(filter.value);
              break;
            case 'starts with':
              expect(cellText?.toLowerCase()?.startsWith(filter.value));
              break;
            case 'ends with':
              expect(cellText?.toLowerCase()?.endsWith(filter.value));
              break;
          }
        }
      }
    });

});

    