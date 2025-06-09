
import { Page, Locator, expect } from '@playwright/test';
import { estimate_data } from '../../data/estimate_data';

export class Create_Estimates_Page {
    
  readonly page: Page;
  readonly pageHeader: Locator;
  readonly createNewEstimateButton: Locator;
  readonly continueButton: Locator;
  readonly requestType: Locator;
  readonly submitToCoordinatorButton: Locator;
  readonly submitEstimateForProcessingModal: Locator;
  readonly submitEstimateForProcessingButton: Locator;
  readonly firstRow: Locator;
  readonly deleteEstimateRequestButton: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.getByRole('heading', { name: '/ dashboard' });
    this.createNewEstimateButton = page.getByRole('button', { name: '+ CREATE NEW ESTIMATE' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.requestType = page.getByLabel('Request Type', {exact: true});
    this.submitToCoordinatorButton = page.getByRole('button', {name: 'Submit to Coordinator' });
    this.submitEstimateForProcessingModal = page.getByText('Submit Estimate for ProcessingPlease note after submission the estimate will be');
    this.submitEstimateForProcessingButton = page.getByRole('button', {name: 'Submit estimate for Processing' });
    this.firstRow = page.locator('[data-rowindex="0"]');
    this.deleteEstimateRequestButton = page.getByRole('button', { name: 'Delete Estimate Request' });
    }

  async navigate() {
    await this.page.goto('estimates/', { waitUntil: 'networkidle' });
    await this.pageHeader.waitFor({ state: 'visible', timeout: 5000 });
  }

  async close() {
    await this.page.close();
  }
  
  async fillEstimateForm() {
    for(const data of Array.isArray(estimate_data) ? estimate_data : [estimate_data]) {
      // Fill the estimate form with data
      await this.page.locator('div[name="missionType"]').click({timeout: 5000});
      await this.page.getByRole('option', { name: 'Operation', exact: true }).click();
      await this.page.locator('div[name*="missionId"]').click({timeout: 5000});
      await this.page.getByRole('option', { name: 'Other (Operation)', exact: true }).click();
      await this.page.locator('div[name*="originCountryId"]').click({timeout: 5000});
      await this.page.getByRole('option', { name: 'Japan', exact: true }).click();
      await this.page.locator('div[name*="originTerritoryId"]').click({timeout: 5000});
      await this.page.getByRole('option', { name: 'Honshu', exact: true }).click();

      await this.page.getByTestId("CalendarMonthIcon").first().click(); 
      await this.page.getByTestId("ArrowRightIcon").click();
      await this.page.getByRole("gridcell").filter({has: this.page.getByText("28")}).first().click();
      await this.page.getByRole('button', { name: 'OK' }).click();
      
      await this.page.locator('input[name*="pickupDate"]').click(  );
      await this.page.locator('div[name="originLocationId"]').click({timeout: 5000});
      await this.page.getByRole('option', 
        { name: 'Atsugi Air Base, BLDG 206, Atsugi Air Base, Ayase, NONE (INTL), 252-1105, Japan', exact: true }).click()
      await this.page.locator('div[name*="destinationCountryId"]').click({timeout: 5000});
      await this.page.getByRole('option', { name: 'Japan', exact: true }).click()
      await this.page.locator('div[name*="destinationTerritoryId"]').click({timeout: 5000});
      await this.page.getByRole('option', { name: 'Okinawa', exact: true }).click()

      await this.page.getByTestId("CalendarMonthIcon").nth(1).click(); 
      await this.page.getByTestId("ArrowRightIcon").click({clickCount: 2});
      await this.page.getByRole("gridcell").filter({has: this.page.getByText("28")}).first().click();
      await this.page.getByRole('button', { name: 'OK' }).click();

      await this.page.locator('div[name*="destinationLocationId"]').click({timeout: 5000});
      await this.page.getByRole('option', 
        { name: '10th Sg Ammunition Depot , BLDG N/A, Daikujaku, Kadena , NONE (INTL), 904-0000, Japan', exact: true }).click()
      await this.continueButton.click();
    }
  }

  async createNewEstimate() {
    // Verify the page header is visible
    await expect(this.pageHeader).toBeVisible();

    // Create new estimate
    await this.createNewEstimateButton.click();

    // Fill the estimate form and continue
    await this.fillEstimateForm();
    
    await this.page.getByText('Movement Details').waitFor({ state: 'visible', timeout: 5000 });
    const estimateID = await this.page.locator(':text("Estimate ID:") + span ').textContent();
    
    // Submit estimate
    await this.submitToCoordinatorButton.click();
    await this.submitEstimateForProcessingModal.waitFor({ state: 'visible' })
    await this.submitEstimateForProcessingButton.click();

    // Navigate to the estimates dashboard
    await this.navigate();

    // Verify Estimate displays on the Estimates Dashboard
    await this.verifyEstimateDisplays(estimateID? estimateID: '');
  }

  async assignEstimatetoCoordinator() {
    // Assign the estimate to a coordinator
    await this.page.getByRole("combobox").click({timeout: 5000});
    await this.page.getByRole("option").first().click({timeout: 5000});
    await this.page.getByRole("button", { name: "Save" }).click({timeout: 5000});
    await expect (this.page.getByText("Assigned coordinator updated successfully")).toBeVisible({timeout: 5000});
    // Verify the status is "in review" *** Refresh the page to see the status change ***
    await this.page.reload();
    await expect (this.page.getByText("in review")).toBeVisible({timeout: 5000});
  }

  async addCargo(){
    // Add Cargo 
    await this.page.getByAltText("cargo icon").click();
    await this.page.locator('[id*="classOfSupply"]').click();
    await this.page.getByRole('option', { name: 'Class I', exact: true }).click();
    await this.page.getByRole('textbox', { name: 'Cargo Item(s)' }).fill('Test Cargo');
    await this.page.locator('[id*="cargoType"]').click();
    await this.page.getByRole('option', { name: 'Ammunition' }).click();
    await this.page.getByRole('textbox', { name: 'Additional Details' }).fill('test details');
    await this.page.getByRole('spinbutton', { name: 'Quantity' }).fill('25');
    await this.page.getByRole('spinbutton', { name: 'Length (in)' }).fill('25');
    await this.page.getByRole('spinbutton', { name: 'Width (in)' }).fill('25');
    await this.page.getByRole('spinbutton', { name: 'Height (in)' }).fill('25');
    await this.page.getByRole('spinbutton', { name: 'Weight (lb)' }).fill('25');
    await this.page.locator('[id*="packType"]').click();
    await this.page.getByRole('option', { name: 'EA' }).click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    
  }

  async uploadFile(file: string) {
    // Upload a file
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Browse Files' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file)
  }

  async fillPOCDetails() {
    // Fill POC details
    await this.page.getByRole('textbox', { name: 'Pick Up POC' }).fill("TEST POC");
    await this.page.getByRole('textbox', { name: 'Pick Up Contact Number' }).fill("5555555555");
    await this.page.getByRole('textbox', { name: 'Drop Off POC' }).fill("TEST POC");
    await this.page.getByRole('textbox', { name: 'Drop Off Contact Number' }).fill("5555555555");
  }

  async fillCurrencyAndEstimateDetails() {
    // Fill out the required fields (Currency, Estimate)
    await this.page.locator('[id*="CurrencyType"]').click();
    await this.page.getByRole('option', { name: 'USD' }).click();
    await this.page.getByRole('textbox', { name: 'Estimate' }).fill('1000')
    await expect (this.page.getByRole('textbox', { name: 'Estimate' })).toHaveAttribute('type', 'text');
  }

  async completeCargoDetails() {
    await this.page.getByLabel('Request Type', {exact: true}).click
  }

  async verifyEstimateDisplays(ID: string) {
     
    // Verify that the first row contains the expected user details
     await expect (this.page.locator(`[data-id="${ID}"]`).filter({has: this.page.getByText('submitted')})).toBeVisible(); 
  }

  async deleteRowItem(itemID: string)
  // const dataID = `[data-id=]`
  {
    if(itemID.length > 1)
      await this.page.locator(`[data-id="${itemID}"]`).getByLabel("Delete").click();
    else
      new Error (`Row item not found!`)
  }

  async viewRowItem(itemID: string)
  // const dataID = `[data-id=]`
  {
    if(itemID.length > 1)
      await this.page.locator(`[data-id="${itemID}"]`).getByLabel("Edit").click();
    else
      new Error (`Row item not found!`)
  }

  async completeEstimateRequest() {
    // Check if there are any cost estimates in "submitted" status
    // If not, create a new cost estimate
    this.checkForEstimateinStatus('Submitted');
    // try {
    //     await page.getByRole("row").filter({has: page.getByText('Submitted')}).first().waitFor({ state: 'visible', timeout: 5000 });
    // } catch (error) {
    // await createNewEstimate();
    // }

    // Select a cost estimate in "submitted" status
    const submittedCostEstimate = this.page.getByRole("row").filter({has: this.page.getByText('submitted')}).first();
    const submittedCostEstimateID = await submittedCostEstimate.locator(this.page.getByRole("gridcell").first()).textContent();
    await submittedCostEstimate.getByLabel('Edit').click();

    // Assign the estimate to a coordinator
    await this.assignEstimatetoCoordinator();

    // Add Cargo and save
    await this.addCargo();

    // Upload a file
    await this.uploadFile('./data/tmr-template.pdf')

    // Fill out the required fields (Currency, Estimate)
    await this.fillCurrencyAndEstimateDetails();

    // Send estimate
    await this.page.getByRole('button', { name: 'Send Estimate' }).click();
    await expect (this.page.getByText('Estimate successfully completed')).toBeVisible();

    // Close estimate
    await this.page.getByText('Close' ).click();

    // Verify the cost estimate displays on the Estimates dashboard with status "Estimated"
    await this.navigate();
    await expect (this.page.locator(`[data-id="${submittedCostEstimateID}"]`).filter({has: this.page.getByText('complete')})).toBeVisible();

  }

  async checkForEstimateinStatus( status: string ) {

    // Check if there is an estimate in the specified status
    // If there is, check the pickup date
    // If the pickup date is before today, submit for approval
    // If not, do nothing (return to the test and select the estimate in the specified status)
    try {
      await this.page.getByRole("row").filter({ has: this.page.getByText(status) }).first().waitFor({ state: 'visible', timeout: 5000 });
      const estimateRow = this.page.getByRole("row").filter({ has: this.page.getByText(status) }).first()
      const estimatePickupDate = await estimateRow.locator('[data-field*="pickupDate"]').textContent();
      if (estimatePickupDate) {
        const isDateBeforeToday = await this.compareDateToToday(estimatePickupDate);
        if (isDateBeforeToday) {
          this.createNewEstimate(); // If the date is before today, create a new estimate
        } 
        else {
          return; // If the date is not before today, do nothing
        }
      } else {
        // If estimatePickupDate is null, optionally handle this case and submit for approval
        await this.createNewEstimate();
      }
    }
    catch (error) {
      // If no TMR in the specified status, submit for approval
      await this.createNewEstimate();
    }
  }

  async compareDateToToday(dateStr: string): Promise<boolean> {
    // Parse the input string (DD/MM/YYYY)
    const [day, month, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day); // Month is 0-based in JS

    // Get today's date and normalize both to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return true; // The input date is before today
    } else if (inputDate > today) {
      return false; // The input date is after today
    } else {
      return true; // The input date is today
    }
  }


 

  
}