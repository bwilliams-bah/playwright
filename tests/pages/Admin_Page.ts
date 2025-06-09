
import { Page, Locator, expect } from '@playwright/test';
import { time } from 'console';

export class Admin_Page {
  
  readonly page: Page;
  readonly addUserButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly userNameInput: Locator;
  readonly emailInput: Locator;
  readonly contactNumberInput: Locator;
  readonly unitDropdown: Locator;
  readonly installationDropdown: Locator;
  readonly territoryDropdown: Locator;
  readonly addNewUserSubmitButton: Locator;
  readonly editRowButton: Locator;
  readonly deleteRow: Locator;
  readonly modal: Locator;
  readonly firstRow: Locator;
  readonly columnHeaders: Locator;
  readonly editUserButton: Locator;
  readonly deleteButton: Locator;
  readonly modalCancelButton: Locator;
  readonly rows: Locator;
  readonly pagination: Locator;
  readonly headers: Locator;
  readonly paginationIndicator: Locator;
  readonly filters: Locator;
  readonly columns: Locator;
  readonly operator: Locator;
  readonly value: Locator;
  readonly addFilterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rows = page.locator('[role="rowgroup"] [role="row"]');
    this.addUserButton = page.getByRole('button', { name: '+ ADD NEW USER' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.userNameInput = page.getByRole('textbox', { name: 'User Name' });
    this.emailInput = page.getByRole('textbox', { name: 'E-mail' });
    this.contactNumberInput = page.getByRole('textbox', { name: 'Contact Number' });
    this.unitDropdown = page.locator('div[name="unitId"]');
    this.installationDropdown = page.locator('div[name="installationId"]');
    this.territoryDropdown = page.locator('div[name="territoryIds"]');
    this.addNewUserSubmitButton = page.getByRole('button', { name: 'Add New User' });
    this.editRowButton = page.getByLabel('Edit').first();
    this.deleteRow = page.getByLabel('Delete').first();
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.modal = page.locator('div[role="dialog"]');
    this.firstRow = page.locator('[data-rowindex="0"]');
    this.columnHeaders = page.getByRole('columnheader')
    this.columns = page.getByLabel('Columns')
    this.editUserButton = page.getByRole('button', { name: 'Edit User' });
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.pagination = page.getByLabel('Rows per page:');
    this.paginationIndicator = page.locator('.MuiTablePagination-displayedRows');
    this.headers = page.getByRole('columnheader');
    this.filters = page.getByText('Filters')
    this.operator = page.getByLabel('Operator')
    this.value = page.getByLabel('Value')
    this.addFilterButton = page.getByText("Add filter")
  }

  async navigate() {
    // await this.page.goto('http://localhost:5173/loadout/dm-admin', { waitUntil: 'networkidle' });
    await this.page.goto('dm-admin', { waitUntil: 'networkidle' });
    await (await this.lastRow()).waitFor({ state: 'visible', timeout: 5000 });
  }

  async close() {
    await this.page.close();
  }

  async addUser(firstName: string, lastName: string, userName: string, email: string, contactNumber: string, unit: string, installation: string, territory: string) {
    await this.addUserButton.click();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.userNameInput.fill(userName);
    await this.emailInput.fill(email);
    await this.contactNumberInput.fill(contactNumber);
    await this.unitDropdown.click();
    await this.page.getByRole('option', { name: unit }).click({timeout: 5000});
    await this.installationDropdown.click({timeout: 5000});
    await this.page.getByRole('option', { name: installation }).click({timeout: 5000});
    await this.territoryDropdown.click({timeout: 5000});
    await this.page.getByRole('option', { name: territory }).click({timeout: 5000});
    await this.addNewUserSubmitButton.click({timeout: 5000});
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async editUser(firstName: string, lastName: string, userName: string) {
    await this.editRowButton.click();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.userNameInput.fill(userName);
    await this.editUserButton.click();
    await this.modal.waitFor({ state: 'hidden' });

  }

  async deleteUser() {
    await this.deleteRow.click();
    await this.deleteButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async verifyUser(firstName: string, lastName: string, userName: string) {
    // Verify that the first row contains the expected user details
    await this.firstRow.waitFor({ state: 'visible' });
    await expect(this.firstRow).toContainText(firstName);
    await expect(this.firstRow).toContainText(lastName);
    await expect(this.firstRow).toContainText(userName);
  }

  async verifyTableSortOrder() {
    // Capture the initial state of the table
    const initialState = await this.firstRow.evaluateAll(rows => rows.map(row => row.textContent));

    // Click the column header 3 times to sort the table by the default sort order
    await this.columnHeaders.first().click();
    await this.columnHeaders.first().click();
    await this.columnHeaders.first().click();

    // Capture the state of the table after sorting
    const revertedState = await this.firstRow.evaluateAll(rows => rows.map(row => row.textContent));

    // Verify that the table has reverted to its original state
    expect(initialState).toEqual(revertedState);
  }

  async rowsDisplayedEquals(expectedRows: number, timeout: number = 5000) {
    try {
      return await this.page.waitForFunction((expectedRows) => {
        const rows = document.querySelectorAll('[role="rowgroup"] [role="row"]');
        return rows.length === expectedRows;
      }, expectedRows, { timeout });
    }
    catch (error) {
      if (error.message.includes('Timeout')) {
        throw new Error(`Timeout: Expected ${expectedRows} rows, but found a ${await this.rows.count()}.`);
      }
      else
        throw error;
   }
  }

  async changeRowsPerPageTo(numberOfRows: string) {
   await this.pagination.click();
   await this.page.getByRole('option', { name: numberOfRows, exact: true }).click();
  }

  async verifyTableHeadersEquals(expectedHeaders: string[]) {
    for (let i = 0; i < expectedHeaders.length; i++) {
      expect(await this.headers.nth(i).textContent()).toBe(expectedHeaders[i]);  
    }
  }

  async verifyColumnSortsAscending(page: Page) {
  // Get all column headers
    const columnHeaders = this.columnHeaders;

    // Iterate through each column header
    for (let i = 0; i < await columnHeaders.count(); i++) {
      // Get the text content of the current column header
      const headerText = await columnHeaders.nth(i).textContent();

      // Skip the columns that can't be verified due to data constraints
      if (headerText === 'DSN (EXT.)' || headerText === 'UNIT' || headerText === 'TERRITORY' || headerText === 'ACTIONS') {
        continue;
      }

      // Click on the column header to sort in ascending order
      await columnHeaders.nth(i).click();
      await page.waitForTimeout(1000);

      // Locate the rowgroup and extract the text content of the cells for the current column
      const cellValues = await page.locator('[role="rowgroup"] [role="row"]').evaluateAll((rows, columnIndex) => 
        rows.map(row => {
          const cell = row.querySelectorAll('[role="gridcell"]')[columnIndex];
          return cell && cell.textContent ? cell.textContent.trim() : '';
        }), i
      );

      // Verify the values are in ascending order
      for (let j = 0; j < cellValues.length - 1; j++) {
        expect(cellValues[j].localeCompare(cellValues[j + 1])).toBeLessThanOrEqual(0);
      }
    
    }
  }

  async verifyColumnSortsDescending(page: Page) {
    // Get all column headers
    const columnHeaders = this.columnHeaders;

    // Iterate through each column header
    for (let i = 0; i < await columnHeaders.count(); i++) {
      // Get the text content of the current column header
      const headerText = await columnHeaders.nth(i).textContent();

      // Skip the columns that can't be verified due to data constraints
      if (headerText === 'DSN (EXT.)' || headerText === 'UNIT' || headerText === 'TERRITORY' || headerText === 'ACTIONS') {
        continue;
      }

      // Click on the column header to sort in descending order
      await columnHeaders.nth(i).click();
      await columnHeaders.nth(i).click();
      await page.waitForTimeout(1000);

      // Locate the rowgroup and extract the text content of the cells for the current column
      const cellValues = await page.locator('[role="rowgroup"] [role="row"]').evaluateAll((rows, columnIndex) => 
        rows.map(row => {
          const cell = row.querySelectorAll('[role="gridcell"]')[columnIndex];
          return cell && cell.textContent ? cell.textContent.trim() : '';
        }), i
      );

      // Verify the values are in descending order
      for (let j = 0; j < cellValues.length - 1; j++) {
        try{
          expect(cellValues[j].localeCompare(cellValues[j + 1])).toBeGreaterThanOrEqual(0);
        }
        catch (error) {
          // If the values are not in descending order, throw an error with the specific values
          if (cellValues[j].localeCompare(cellValues[j + 1]) < 0) {
            throw new Error(`${cellValues[j]} and ${cellValues[j+1]} is not sorted in descending order.`);
          }
          throw error;
        }
        
      }
    
    }
  }

  async lastRow() {
    const rowCount = await this.pagination.textContent();
    const rowCountNumber = parseInt(rowCount || '0');
    const lastRow = this.rows.nth(rowCountNumber - 1);
    return lastRow;
    
  }

  async verifyColumnSortsDefault(page: Page) {
    // Capture the initial state of the table
    const initialState = await this.rows.evaluateAll(rows => 
      rows.map(row => row.textContent ? row.textContent.trim() : '')
    );

    // Click on the first column header to sort in ascending order
    await this.columnHeaders.first().click();
    // Click again to sort in descending order
    await this.columnHeaders.first().click();
    // Click a third time to return to default sort order
    await this.columnHeaders.first().click();
    await page.waitForTimeout(1000);
    
    // Capture the state after reverting to the default sort order
    const revertedState = await this.rows.evaluateAll(rows => 
        rows.map(row => row.textContent ? row.textContent.trim() : '')
    );

    // Compare the initial state with the reverted state
    expect(initialState).toEqual(revertedState);

  }
  


}
