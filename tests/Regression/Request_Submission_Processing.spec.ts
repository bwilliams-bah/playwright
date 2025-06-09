import { test, expect } from '../myFixtures';
import { Create_Estimates_Page } from '../pages/Create_Estimates_Page';
import { Create_TMR_Page } from '../pages/Create_TMR_Page';
import * as dotenv from 'dotenv';
import { Page } from '@playwright/test';
dotenv.config();


test.describe('Request Submission and Processing Tests', () => {

  let createEstimatesPage: Create_Estimates_Page = null as any; // Initialize createEstimatesPage variable
  let createTMRPage: Create_TMR_Page = null as any; // Initialize createTMRPage variable
  let page: Page = null as any; // Initialize page variable
  

  test.beforeEach(async ({ setUserContext }  ) => {


    page = await setUserContext(); // Create a new user context

    // Initialize page objects
    createEstimatesPage = new Create_Estimates_Page(page);
    createTMRPage = new Create_TMR_Page(page);

    
  });

  test.afterEach(async () => {
    // Close the page after each test
    await page.close();
    });

  
  test('Verify requestor can submit a new cost estimate', async ({setUserContext}) => {

    // Go to the Estimates dashboard
    await page.goto('estimates', { waitUntil: 'networkidle' });

    // Verify the page header is visible
    await expect(createEstimatesPage.pageHeader).toBeVisible();

    // Create new estimate
    await createEstimatesPage.createNewEstimateButton.click();

    // Fill the estimate form and continue
    await createEstimatesPage.fillEstimateForm();
    
    await page.getByText('Movement Details').waitFor({ state: 'visible', timeout: 5000 });
    const estimateID = await page.locator(':text("Estimate ID:") + span ').textContent();
    
    // Submit estimate
    await createEstimatesPage.submitToCoordinatorButton.click();
    await createEstimatesPage.submitEstimateForProcessingModal.waitFor({ state: 'visible' })
    await createEstimatesPage.submitEstimateForProcessingButton.click();

    // Navigate to the estimates dashboard
    await createEstimatesPage.navigate();

    // Verify Estimate displays on the Estimates Dashboard
    await createEstimatesPage.verifyEstimateDisplays(estimateID? estimateID: '');
    

  });

  test('Verify coordinator can complete a submitted cost estimate', async ({ setUserContext }) => {

    // Set user role to coordinator
    page = await setUserContext('coordinator');

    // Navigate to the Estimates dasboard
    await page.goto('estimates', { waitUntil: 'networkidle' });

    // Check if there are any cost estimates in "submitted" status
    // If not, create a new cost estimate
    await createEstimatesPage.checkForEstimateinStatus('Submitted');

    // Select a cost estimate in "submitted" status
    const submittedCostEstimate = page.getByRole("row").filter({has: page.getByText('submitted')}).first();
    const submittedCostEstimateID = await submittedCostEstimate.locator(page.getByRole("gridcell").first()).textContent();
    await submittedCostEstimate.getByLabel('Edit').click();

    // Assign the estimate to a coordinator
    await createEstimatesPage.assignEstimatetoCoordinator();

    // Add Cargo and save
    await createEstimatesPage.addCargo();

    // Upload a file
    await createTMRPage.uploadFile('./data/tmr-template.pdf')

    // Fill out the required fields (Currency, Estimate)
    await createTMRPage.fillCurrencyAndEstimateDetails();

    // Send estimate
    await page.getByRole('button', { name: 'Send Estimate' }).click();
    await expect (page.getByText('Estimate successfully completed')).toBeVisible();

    // Close estimate
    await page.getByText('Close' ).click();

    // Verify the cost estimate displays on the Estimates dashboard with status "Estimated"
    await createEstimatesPage.navigate();
    await expect (page.locator(`[data-id="${submittedCostEstimateID}"]`).filter({has: page.getByText('complete')})).toBeVisible();

  })

  test('Verify requestor can create a TMR from completed cost estimate', async () => {

    // Navigate to the Estimates dasboard
    await createEstimatesPage.navigate();

    // Check if there are any cost estimates in "completed" status
    // If not, submit a new cost estimate
    createEstimatesPage.checkForEstimateinStatus('Complete');
    
    // Select a completed cost estimate
    const completedCostEstimate = page.getByRole("row").filter({has: page.getByText('Complete')}).first();
    await completedCostEstimate.getByLabel('Edit').click( );

    // Select "Create TMR from Estimate"
    await page.getByRole('button', { name: 'Create TMR from Estimate' }).click();

    // Verify the Create New TMR page displays with status "Draft"
    await expect (page.getByRole('heading', { name: '/ Create New TMR' })).toBeVisible()
    await expect (page.getByText('draft', { exact: true })).toBeVisible();
    
    // Fill out the required fields (territory, dates, locations, POC information).
    await createTMRPage.fillPOCDetails();

    // Save as draft
    await page.getByRole('button', { name: 'Save Draft' }).click();

    // Verify the TMR saved successfully
    // if not, update the pickup and dropoff dates and save again
    try {
      await page.getByText("TMR successfully saved").waitFor({ state: 'visible', timeout: 5000 });
    }
    catch (error) {
      // If the TMR was not saved successfully, update the pickup and dropoff dates
      await createTMRPage.updatePickupDropoffDates();
      await page.getByRole('button', { name: 'Save Draft' }).click();
    }

    // Verify draft saved successfully
    await expect (page.getByText("TMR successfully saved")).toBeVisible();
    await expect (page.getByText("draft",{exact: true})).toBeVisible();
    const tmrID = await page.locator(':text("TMR NO:") + span ').textContent();

    // Close the TMR
    await page.getByText('Close' ).click();

    // Navigate to the TMR dashboard
    await createTMRPage.navigate();

    // Verify the TMR displays on the TMR dashboard with status "Draft"
    await expect (page.locator(`[data-id="${tmrID}"]`).filter({has: page.getByText('draft')})).toBeVisible();

  })

  test('Verify requestor can submit a new TMR', async ({ page }) => {
    // Navigate to the TMR dashboard
    await createTMRPage.navigate();

    // Select "Create New TMR"
    await page.getByRole('button', { name: '+ CREATE NEW TMR' }).click();

    // Fill out the required fields
    createTMRPage.fillEstimateForm();
    
    // Fill out the required fields (POC information) and continue
    await createEstimatesPage.fillPOCDetails();
    await page.getByRole('button', { name: 'Continue' }).click({ timeout: 5000 });
    await page.getByText('Movement Details').waitFor({ state: 'visible', timeout: 5000 });

    // Add Cargo and save
    await createTMRPage.addCargo();

    // Upload a file
    await createEstimatesPage.uploadFile('./data/tmr-template.pdf')

    // Fill required field
    await page.getByRole('textbox', { name: 'Fund Document Number (TAC/LOA)' }).fill("TEST1234")

    //get TMR ID
    const tmrID = await page.locator(':text("TMR NO:") + span ').textContent();

    // Submit to coordinator
    await createTMRPage.submitTMRToCoordinator();

    // Verify the TMR submitted successfully
    await expect (page.getByText("TMR successfully submitted to coordinator")).toBeVisible();

    // Verify the TMR displays on the TMR dashboard
    await createTMRPage.navigate();
    await expect (page.locator(`[data-id="${tmrID}"]`).filter({has: page.getByText('submitted')})).toBeVisible();

  })
  

  test('Verify requestor can submit a TMR to a Coordinator for review', async ({setUserContext}) => {
    
    // Navigate to the TMR dashboard
    await page.goto("tmrs");

    // Check if there are any TMRs in "submitted" status
    // If not, create a new TMR
    await createTMRPage.checkForTMRinStatus('Submitted');

    // Set user role to coordinator
    page = await setUserContext('coordinator');

    // Select a submitted TMR
    const submittedTMR = page.getByRole("row").filter({has: page.getByText('Submitted')}).first();
    const submittedTMRID = await submittedTMR.locator(page.getByRole("gridcell").first()).textContent();
    await submittedTMR.getByLabel('Edit').click( );

    // Assign the estimate to a coordinator
    await page.getByRole("combobox").first().click({timeout: 5000});
    await page.getByRole("option").nth(1).click({timeout: 5000});
    await page.getByRole("button", { name: "Save" }).click();
    await expect (page.getByText("Assigned coordinator updated successfully")).toBeVisible();
    await expect (page.getByText("in review")).toBeVisible();

    // Verify the TMR displays on the TMR dashboard
    await createTMRPage.navigate();
    await expect (page.locator(`[data-id="${submittedTMRID}"]`).filter({has: page.getByText('in review')})).toBeVisible();

  })
  
  test('Verify coordinator can submit a TMR for approval', async ({setUserContext}) => {

    // Set user role to coordinator
    page = await setUserContext('transportation officer');
  
    // Navigate to the TMR dashboard
    await page.goto("tmrs");

    // Check if there are any TMRs in "review" status
    // If not, select one in "submitted" status and submit it for review
    await createTMRPage.checkForTMRinStatus('In Review');

    // Select a TMR in "review" status
    const inReviewTMR = page.getByRole("row").filter({has: page.getByText('In Review')}).first();
    const inReviewTMRID = await inReviewTMR.locator(page.getByRole("gridcell").first()).textContent();
    await inReviewTMR.getByLabel('Edit').click( );

    // Submit the TMR for approval
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect (page.getByText("TMR submitted for approval")).toBeVisible();

    // Verify the Create New TMR page displays with status "Pending Approval"
    await expect (page.getByRole('heading', { name: '/ view tmr' })).toBeVisible()
    await expect (page.getByText('pending approval', { exact: true })).toBeVisible();

    // Close the TMR
    await page.getByText('Close' ).click();

    // Verify the TMR displays on the TMR dashboard with status "Pending Approval"
    await expect (page.locator(`[data-id="${inReviewTMRID}"]`).filter({has: page.getByText('pending approval')})).toBeVisible();
    
  })
  
  test('Verify transportation officer can deny a TMR', async () => {
    // Navigate to the TMR dashboard
    await page.goto("tmrs");

    // Check if there are any TMRs in "Pending Approval" status
    // If not, select one in "In Review" status and submit it for approval
    try {
      await page.getByRole("row").filter({has: page.getByText('Pending Approval')}).first().waitFor({ state: 'visible', timeout: 5000 });
    }
    catch (error) {
      await createTMRPage.submitTMRforApproval();
    }

    // Set user role to transportation officer
    await page.locator('#basic-button').click();
    await page.getByRole('menuitem', { name: 'transportation officer' }).click();

    // Refresh the page
    await page.reload({ waitUntil: 'networkidle' });

    // Select a pending approval TMR
    const pendingApprovalTMR = page.getByRole("row").filter({has: page.getByText('Pending Approval')}).first();
    const pendingApprovalTMRID = await pendingApprovalTMR.locator(page.getByRole("gridcell").first()).textContent();
    await pendingApprovalTMR.getByRole('link').click( );

    // Add a comment
    await page.getByRole('textbox', { name: 'Comments' }).fill('Test comment');

    // Deny the TMR
    await page.getByRole('button', { name: 'Deny with Comments' }).click(); //TMR returned to the coordinator
    await expect (page.getByText("TMR returned to the coordinator")).toBeVisible();

    // Close the TMR
    await page.getByText('Close' ).click();

    // Verify the TMR displays on the TMR dashboard with status "Denided"
    await expect (page.locator(`[data-id="${pendingApprovalTMRID}"]`).filter({has: page.getByText('denied')})).toBeVisible();

    // Set user role back to it
    await page.locator('#basic-button').click();
    await page.getByRole('menuitem', { name: 'it' }).click();

    // Refresh the page
    await page.reload({ waitUntil: 'networkidle' });

  })

  test('Verify transportation officer can approve a TMR', async ({setUserContext}) => {

    // Set user role to transportation officer
    page = await setUserContext('transportation officer');

    // Navigate to the TMR dashboard
    await createTMRPage.navigate();

    // Check if there are any TMRs in "Pending Approval" status
    // If not, select one in "In Review" status and submit it for approval
    createTMRPage.checkForTMRinStatus('Pending Approval');

    // Set user role to transportation officer
    await page.locator('#basic-button').click();
    await page.getByRole('menuitem', { name: 'transportation officer' }).click();

    // Refresh the page
    await page.reload({ waitUntil: 'networkidle' });

    // Select a pending approval TMR
    const pendingApprovalTMR = page.getByRole("row").filter({has: page.getByText('Pending Approval')}).first();
    const pendingApprovalTMRID = await pendingApprovalTMR.locator(page.getByRole("gridcell").first()).textContent();
    await pendingApprovalTMR.getByRole('link').click( );

    // Add a comment
    await page.getByRole('textbox', { name: 'Comments' }).fill('Test comment');

    // Approve the TMR
    await page.getByRole('button', { name: 'Approve' }).click({ timeout: 5000 }); 
    await expect (page.getByText("TMR has been approved")).toBeVisible({timeout: 5000});

    // Close the TMR
    await page.getByText('Close' ).click();

    // Verify the TMR displays on the TMR dashboard with status "Approved"
    await expect (page.locator(`[data-id="${pendingApprovalTMRID}"]`).filter({has: page.getByText('approved')})).toBeVisible();

    // Set user role back to it
    await page.locator('#basic-button').click();
    await page.getByRole('menuitem', { name: 'it' }).click();

    // Refresh the page
    await page.reload({ waitUntil: 'networkidle' });

  })
  
  

});

    