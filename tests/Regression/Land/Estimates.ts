import { test, expect } from '@playwright/test';

test.describe('Create New Estimate', () => {
    test('Behalf of: Self, Request Type: Vehicle/Caro', async ({ page }) => {
        // Navigate to the Estimate Process Flow page
        await page.goto('http://localhost:5173/loadout/estimates');

        page.getByRole('button', { name: '+ CREATE NEW ESTIMATE' })
        await page.locator('.MuiAutocomplete-endAdornment').first().click();
        
    })
    
})
