import test, { expect } from "@playwright/test";


test.describe('Validate Units Table', () => {
    test( 'Verify Page Filters', async ({ page } ) => {
            
            // Navigate to the Admin > Users table
            await page.goto('http://localhost:5173/loadout/dm-admin/units');
            
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
            await page.goto('http://localhost:5173/loadout/dm-admin/units');
    
            // Verify the table columns
            const tableColumns = page.locator('.MuiDataGrid-columnHeaders');
            const expectedColumns = ['UNIT NAME', 'SERVICE NAME', 'UIC', 'ACTIONS'];
            
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
    
            // Verify the table pagination is present and update the rows per page
            const pagination = page.getByRole( 'combobox', { name: 'Rows per page:' } )
            await expect( pagination ).toBeVisible();
            pagination.click();
            await page.getByRole( 'option', { name: '5', exact: true } ).click();
            
            // Verify the table rows displayed is equal to the expected number of rows per page
            tableRowsDisplayed = await page.locator('.MuiDataGrid-row').count();
            rowsPerPageText = await page.locator( '.MuiSelect-select' ).textContent();
            expectedNumberOfRowsPerPage = rowsPerPageText ? parseInt( rowsPerPageText ) : 0;
            
            // Verify the table rows
            if ( tableRowsDisplayed < expectedNumberOfRowsPerPage ) {
                const rowsToVerify = await page.locator( '.MuiTablePagination-displayedRows' ).textContent();
                const expectedNumberOfRows = rowsToVerify ? parseInt( rowsToVerify.split('of ')[1] ) : 0;
                expect( tableRowsDisplayed ).toEqual( expectedNumberOfRows );
            }
            else {
                expect( tableRowsDisplayed ) .toEqual( expectedNumberOfRowsPerPage );
            }
        });
    
})
