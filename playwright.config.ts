import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const ENV = process.env.TEST_ENV || 'local'; // 'local' or 'staging'
const USER = process.env.USER_ROLE || 'requestor'; // 'requestor' or 'supervisor'

const envConfigs = {
  local: {
    baseURL: 'http://localhost:5173/loadout/',
    origin: 'http://localhost:5173/loadout/',
  },
  staging: {
    baseURL: 'https://52.222.0.134/loadout/',
    origin: 'https://52.222.0.134/loadout/',
  },
};

const userConfigs = {
  requestor: {
    pfxPath: './certs/loadout.tester.requestor.p12',
  },
  supervisor: {
    pfxPath: './certs/loadout.tester.supervisor.p12',
  },
};

const selectedEnv = envConfigs[ENV];
const selectedUser = userConfigs[USER];


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests', // The directory where your test files are located
  /* Run tests in files in parallel */
  timeout: 300 * 1000,
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  name: `${ENV}`,
  use: {
    launchOptions: {
      args: ['--start-maximized'],
    },
    headless: false, 
    viewport: null,
    baseURL: selectedEnv.baseURL,
    ignoreHTTPSErrors: true,
    clientCertificates: [
      {
        origin: selectedEnv.origin,
        pfxPath: selectedUser.pfxPath,
        passphrase: process.env.CLIENT_CERT_PASSPHRASE!,
      },
    ],
    trace: 'on-first-retry',
  
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      // use: { 
      //   // ...devices['Desktop Chrome'],
      //   // headless: false,
      //   // viewport: {width: 1920, height: 1080},
      //   // deviceScaleFactor: undefined,
      // },
    },
    
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     viewport: {width: 1920, height: 1080},
    //     deviceScaleFactor: undefined,
    //    },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
