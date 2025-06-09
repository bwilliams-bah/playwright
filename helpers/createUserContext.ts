import { Browser, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const ENV = process.env.TEST_ENV || 'local';

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
  coordinator: {
    pfxPath: './certs/loadout.tester.coordinator.p12',
  },
  "transportation officer": {
    pfxPath: './certs/loadout.tester.transportation_officer.p12',
  },
};

const selectedEnv = envConfigs[ENV];

export async function createUserContext(browser: Browser, role: 'requestor' | 'supervisor' | 'coordinator' | 'transportation officer' | undefined): Promise<BrowserContext> {
  if (!role) {
    throw new Error("Role must be defined to create a user context.");
  }
  const user = userConfigs[role];

  return await browser.newContext({
    baseURL: selectedEnv.baseURL,
    ignoreHTTPSErrors: true,
    viewport: null, //{width: 1920, height: 1080},
    // deviceScaleFactor: undefined,
    clientCertificates: [
      {
        origin: selectedEnv.origin,
        pfxPath: user.pfxPath,
        passphrase: process.env.CLIENT_CERT_PASSPHRASE!,
      },
    ],
  });
}
