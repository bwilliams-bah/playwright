import test, { expect } from "@playwright/test";

test.describe('Validate Users Table', () => {
    
    test( 'Verify Page Filters', async ({ page } ) => {
        
        // Navigate to the Admin > Users table
        await page.goto('http://localhost:5173/loadout/dm-admin');
        
        // Verify the table filters are present
        const tableFilters = page.locator('.MuiDataGrid-toolbarContainer');
        const expectedFilters = ['Columns', 'Filters', 'Density', 'Export'];

        for ( const filter of expectedFilters ) {
            await expect( tableFilters
                .filter( {has: page.getByRole('button', { name: filter })} ))
                .toBeVisible();
        }
    });

    test('Verify Table Columns and Rows', async ({ page }) => {
        await page.goto('http://localhost:5173/loadout/dm-admin');

        // Verify the table columns
        const tableColumns = page.locator('.MuiDataGrid-columnHeaders');
        const expectedColumns = ['FIRST NAME', 'LAST NAME', 'USERNAME', 'CONTACT NUMBER'
            , 'DSN (EXT.)', 'E-MAIL', 'INSTALLATION', 'UNIT', 'ROLE', 'TERRITORY', 'ACTIONS'];
        
        for ( const column of expectedColumns ) {
            await expect(tableColumns
                .filter({has: page.getByText( column )}))
                .toBeVisible();
        }

        // Verify the table rows
        let tableRowsDisplayed = await page.locator('.MuiDataGrid-row').count();
        let rowsPerPageText = await page.locator( '.MuiSelect-select ').textContent();
        let expectedNumberOfRowsPerPage = rowsPerPageText ? parseInt(rowsPerPageText) : 0;

        if ( tableRowsDisplayed < expectedNumberOfRowsPerPage ) {
            const rowsToVerify = await page.locator( '.MuiTablePagination-displayedRows' ).textContent();
            const expectedNumberOfRows = rowsToVerify ? parseInt(rowsToVerify.split(' of ' )[1]) : 0;
            
            expect( tableRowsDisplayed ).toEqual( expectedNumberOfRows );
        }
        else {
            expect( tableRowsDisplayed ) .toEqual( expectedNumberOfRowsPerPage );
        }
    });

    test('Verify pagination', async ({ page }) => {
        await page.goto('http://localhost:5173/loadout/dm-admin');

        // Verify the table pagination is present and update the rows per page
        const pagination = page.getByRole( 'combobox', { name: 'Rows per page:' } )
        await expect( pagination ).toBeVisible();
        pagination.click();
        await page.getByRole( 'option', { name: '5', exact: true } ).click();
        await page.waitForTimeout( 2000 );
    
        // Verify the table rows displayed is equal to the expected number of rows per page    
        const tableRowsDisplayed = await page.locator('.MuiDataGrid-row').count();
        console.log( 'Table Rows Displayed: ' + tableRowsDisplayed );
        
        const rowsPerPageText = await page.locator( '.MuiSelect-select' ).textContent();
        const expectedNumberOfRowsPerPage = rowsPerPageText ? parseInt( rowsPerPageText ) : 0;
        console.log( 'Expected Number of Rows Per Page: ' + expectedNumberOfRowsPerPage );
        
        // Verify the table rows
        if ( tableRowsDisplayed < expectedNumberOfRowsPerPage ) {
            const rowsToVerify = await page.locator( '.MuiTablePagination-displayedRows' ).textContent();
            const expectedNumberOfRows = rowsToVerify ? parseInt( rowsToVerify.split('of ')[1] ) : 0;
            console.log( 'Expected Number of Rows: ' + expectedNumberOfRows );
            
            expect( tableRowsDisplayed ).toEqual( expectedNumberOfRows );
        }
        else {
           // await page.pause();
            expect( tableRowsDisplayed ) .toEqual( expectedNumberOfRowsPerPage );
        }
    })
    test('Verify Add User Functionality', async ({ page }) => {
        await page.goto('http://localhost:5173/loadout/dm-admin');

        // Verify ADD USER button is present and displays the Add User modal
        const addUserButton = page.getByRole( 'button', { name: '+ ADD NEW USER' } );
        await expect( addUserButton ).toBeVisible();
        await addUserButton.click();
        await expect( page.locator( '.MuiDialogContent-root' ) ).toBeVisible();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect( page.locator( '.MuiDialogContent-root' ) ).not.toBeVisible();

        // Add / delete a user
        await addUserButton.click();
        await page.getByRole('textbox', { name: 'First Name' }).fill('Test');
        await page.getByRole('textbox', { name: 'Last Name' }).fill('User');
        await page.getByRole('textbox', { name: 'User Name' }).fill('TestUser');
        await page.getByRole('textbox', { name: 'E-mail' }).fill('TestUser@test.com');
        await page.getByRole('textbox', { name: 'Contact Number' }).fill('8103573026');
        await page.locator('div[name="unitId"]').click();
        await page.getByRole('option', { name: 'AI2C (Army)' }).click();
        await page.locator('div[name="installationId"]').click();
        await page.getByRole('option', { name: 'Camp Zama' }).click();
        await page.locator('div[name="territoryIds"]').click();
        await page.getByRole('option', { name: 'Hawaii' }).click();
        await page.getByRole('button', { name: 'Add New User' }).click();

    });
});
