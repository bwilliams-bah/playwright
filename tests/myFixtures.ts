// myFixtures.ts
import { test as base, Page } from '@playwright/test';
import { createUserContext } from '../helpers/createUserContext';




interface MyFixtures {
  setUserContext: (role?: 'requestor' | 'supervisor' | 'coordinator' | 'transportation officer') => Promise<Page>;
  setUserRoleLocal: (role?: string) => Promise<void>;
  setUserRoleStaging: (role?: 'requestor' | 'supervisor' | 'coordinator' | 'transportation officer') => Promise<Page>;
}

export const test = base.extend<MyFixtures>({

  // Set user role
  setUserRoleLocal: async ({ page }, use) => {
    const doSetUserRoleLocal = async (role?: string) => {
        // Click on the user role button
        await page.locator('#basic-button').click();
    
        // Select the user role from the dropdown
        await page.getByRole('menuitem', { name: role ?? 'it' }).click();
        await page.reload({ waitUntil: 'networkidle' });
      };
    
      // Provide the function to the test
      await use(doSetUserRoleLocal);

  },

    setUserRoleStaging: async ({ browser }, use) => {
    const doSetUserRoleStaging = async (role?: 'requestor' | 'supervisor' | 'coordinator' | 'transportation officer' | undefined) => {
        let userContext = await createUserContext(browser, role);
        let page = await userContext.newPage();
        return page;
      };
    
      // Provide the function to the test
      await use(doSetUserRoleStaging);

  },

  setUserContext: async ( {  page, setUserRoleLocal, setUserRoleStaging }, use) => {
    const doSetUserContext = async (role?: 'requestor' | 'supervisor' | 'coordinator' | 'transportation officer') : Promise<Page> => {
        if (process.env.TEST_ENV === 'local') {
          // go to base URL
          await page.goto('', { waitUntil: 'networkidle' });
          // Set user role
          await setUserRoleLocal(role ? role : process.env.TEST_USER);
          return page;
        }
         
        else if (process.env.TEST_ENV === 'staging') {
          // Create a new user context for the user role
          const userRole = (role ? role : process.env.TEST_USER) as 'requestor' | 'supervisor' | 'coordinator' | 'transportation officer' | undefined;
          const newPage = await setUserRoleStaging(userRole);
          if (!newPage) {
            throw new Error('Failed to create a new Page for the user context');
          }
          return newPage;
        }
        throw new Error('Unknown TEST_ENV, cannot set user context');
      };
    
      // Provide the function to the test
      await use(doSetUserContext);

  },

});
export { expect } from '@playwright/test';
