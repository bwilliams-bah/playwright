import { expect } from '../myFixtures';
import { estimate_data } from '../../data/estimate_data';
import { Page, Locator } from '@playwright/test';

export class Create_TMR_Page {
    
  readonly page: Page;
  readonly pageHeader: Locator;
  readonly createNewTMRButton: Locator;
  readonly continueButton: Locator;
  readonly requestType: Locator;
  readonly submitToCoordinatorButton: Locator;
  readonly submitEstimateForProcessingModal: Locator;
  readonly submitEstimateForProcessingButton: Locator;
  readonly firstRow: Locator;
  readonly deleteEstimateRequestButton: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.getByRole('heading', { name: 'dashboard' });
    this.createNewTMRButton = page.getByRole('button', { name: '+ CREATE NEW TMR' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.requestType = page.getByLabel('Request Type', {exact: true});
    this.submitToCoordinatorButton = page.getByRole('button', {name: 'Submit to Coordinator' });
    this.submitEstimateForProcessingModal = page.getByText('Submit Estimate for ProcessingPlease note after submission the estimate will be');
    this.submitEstimateForProcessingButton = page.getByRole('button', {name: 'Submit estimate for Processing' });
    this.firstRow = page.locator('[data-rowindex="0"]');
    this.deleteEstimateRequestButton = page.getByRole('button', { name: 'Delete Estimate Request' });
    }

  async navigate() {
    await this.page.goto("tmrs", { waitUntil: 'networkidle' });
    await this.pageHeader.waitFor({ state: 'visible', timeout: 5000 });
  }

  async close() {
    await this.page.close();
  }

  async assignTMRtoCoordinator() {
    // Assign the estimate to a coordinator
    await this.page.getByRole("combobox").click();
    await this.page.getByRole("option").first().click();
    await this.page.getByRole("button", { name: "Save" }).click();
    await expect (this.page.getByText("Assigned coordinator updated successfully")).toBeVisible();
    await expect (this.page.getByText("in review")).toBeVisible();
  }

  async fillEstimateForm() {
    for(const data of Array.isArray(estimate_data) ? estimate_data : [estimate_data]) {
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
      await this.continueButton.click({ timeout: 5000 });

    }
  }

  async updatePickupDropoffDates() {
    // Update pickup and dropoff dates
    await this.page.getByTestId("CalendarMonthIcon").first().click(); 
    await this.page.getByTestId("ArrowRightIcon").click();
    await this.page.getByRole("gridcell").filter({has: this.page.getByText("28")}).first().click();
    await this.page.getByRole('button', { name: 'OK' }).click();

    await this.page.getByTestId("CalendarMonthIcon").nth(1).click(); 
    await this.page.getByTestId("ArrowRightIcon").click({clickCount: 2});
    await this.page.getByRole("gridcell").filter({has: this.page.getByText("28")}).first().click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async fillPOCDetails() {
    // Fill POC details
    await this.page.getByRole('textbox', { name: 'Pick Up POC' }).fill("TEST POC");
    await this.page.getByRole('textbox', { name: 'Pick Up Contact Number' }).fill("5555555555");
    await this.page.getByRole('textbox', { name: 'Drop Off POC' }).fill("TEST POC");
    await this.page.getByRole('textbox', { name: 'Drop Off Contact Number' }).fill("5555555555");
  }

  async submitTMRToCoordinator() {
    // Submit to coordinator
    await this.page.getByRole('button', { name: 'Submit to Coordinator' }).click();
    await this.page.getByRole('button', { name: 'Submit Movement for Processing' }).click();
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

  async fillCurrencyAndEstimateDetails() {
    // Fill out the required fields (Currency, Estimate)
    await this.page.locator('[id*="CurrencyType"]').click();
    await this.page.getByRole('option', { name: 'USD' }).click();
    await this.page.getByRole('textbox', { name: 'Estimate' }).fill('1000')
    await expect (this.page.getByRole('textbox', { name: 'Estimate' })).toHaveAttribute('type', 'text');
  }

   async checkForTMRinStatus( status: string ) {
   
    // Check if there is a TMR in the specified status
    // If there is, check the pickup date
    // If the pickup date is before today, it can't be used and we'll need to submit a new TMR for approval
    // If not, do nothing (return to the test and select the TMR in the specified status)
    try {
      await this.page.getByRole("row").filter({ has: this.page.getByText(status) }).first().waitFor({ state: 'visible', timeout: 5000 });
      const tmrRow = this.page.getByRole("row").filter({ has: this.page.getByText(status) }).first()
      const tmrPickupDate = await tmrRow.locator('[data-field*="actualPickupDate"]').textContent();
      if (tmrPickupDate) {
        const isDateBeforeToday = await this.compareDateToToday(tmrPickupDate);
        // Print the pickup date and whether it is before today
        if (isDateBeforeToday) {
          await this.createNewTMR();
        } 
        else {
          return; // If the date is not before today, do nothing
        }
      } else {
        // If tmrPickupDate is null, optionally handle this case or submit for approval
        await this.createNewTMR();
      }
    }
    catch (error) {
      // Print error message if no TMRs in the specified status
      console.error(error)
      await this.createNewTMR();
    }
  }

  async createNewTMR() {
    // Select "Create New TMR"
    await this.page.getByRole('button', { name: '+ CREATE NEW TMR' }).click();

    // Fill out the required fields
    await this.fillEstimateForm();
    
    // Fill out the required fields (POC information) and continue
    await this.fillPOCDetails();
    await this.continueButton.click({ timeout: 5000 });
    await this.page.getByText('Movement Details').waitFor({ state: 'visible', timeout: 5000 });

    // Add Cargo and save
    await this.addCargo();

    // Upload a file
    await this.uploadFile('./data/tmr-template.pdf')

    // Fill required field
    await this.page.getByRole('textbox', { name: 'Fund Document Number (TAC/LOA)' }).fill("TEST1234")

    //get TMR ID
    const tmrID = await this.page.locator(':text("MR NO:") + span ').textContent();

    // Submit to coordinator
    await this.submitTMRToCoordinator();

    // Verify the TMR submitted successfully
    await expect (this.page.getByText("TMR successfully submitted to coordinator")).toBeVisible();

    // Verify the TMR displays on the TMR dashboard
    await this.navigate();
    await expect (this.page.locator(`[data-id="${tmrID}"]`)).toBeVisible();
    await this.page.waitForTimeout( 2000 );
  }

  async submitTMRforReview() {
    // Check if there are any TMRs in "submitted" status
    // If not, create a new TMR
    await this.checkForTMRinStatus('Submitted');
    // try {
    //     await page.getByRole("row").filter({has: page.getByText('Submitted')}).first().waitFor({ state: 'visible', timeout: 5000 });
    // } catch (error) {
    // await createNewTMR();
    // }

    // Select a submitted TMR
    const submittedTMR = this.page.getByRole("row").filter({has: this.page.getByText('Submitted')}).first();
    await submittedTMR.getByLabel('Edit').click( );

    // Assign the estimate to a coordinator
    await this.page.waitForTimeout(2000);
    await this.page.getByRole("combobox").first().click({timeout: 5000});
    await this.page.getByRole("option").nth(1).click({timeout: 5000});
    await this.page.waitForTimeout(2000);
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async submitTMRforApproval() {

    // Check if there are any TMRs in "review" status
    // If not, select one in "submitted" status and submit it for review
    await this.checkForTMRinStatus('In Review');
  
    // Select a TMR in "review" status
    const inReviewTMR = this.page.getByRole("row").filter({has: this.page.getByText('In Review')}).first();
    const inReviewTMRID = await inReviewTMR.locator(this.page.getByRole("gridcell").first()).textContent();
    await inReviewTMR.getByLabel('Edit').click( );

    // Submit the TMR for approval
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await expect (this.page.getByText("TMR submitted for approval")).toBeVisible();

    // Verify the Create New TMR page displays with status "Pending Approval"
    await expect (this.page.getByRole('heading', { name: '/ view tmr' })).toBeVisible()
    await expect (this.page.getByText('pending approval', { exact: true })).toBeVisible();

    // Close the TMR
    await this.page.getByText('Close' ).click();

    // Verify the TMR displays on the TMR dashboard with status "Pending Approval"
    await this.page.goto("tmrs");
    await expect (this.page.locator(`[data-id="${inReviewTMRID}"]`).filter({has: this.page.getByText('pending approval')})).toBeVisible();
  }

  async compareDateToToday(dateStr: string): Promise<boolean> {
    // Parse the input string (MM/DD/YYYY)
    const [month, day, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day); // Month is 0-based in JS

    // Get today's date and normalize both to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate < today;
  }



}
  