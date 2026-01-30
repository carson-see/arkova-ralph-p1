import { test, expect } from '@playwright/test';

/**
 * Onboarding Flow E2E Tests (P2-S5, P2-S6, P2-S7)
 *
 * Tests the role selection and org setup flows.
 */

test.describe('Role Selection Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, we'd authenticate first
    // For now, test the UI components directly
    await page.goto('/#/onboarding/role');
  });

  test('displays role selection cards', async ({ page }) => {
    // Check for Individual card
    await expect(page.getByText('Individual')).toBeVisible();
    await expect(page.getByText(/Personal account/i)).toBeVisible();

    // Check for Organization card
    await expect(page.getByText('Organization Administrator')).toBeVisible();
    await expect(page.getByText(/Administrator account/i)).toBeVisible();
  });

  test('can select Individual role', async ({ page }) => {
    // Click Individual card
    await page.getByText('Individual').click();

    // Continue button should be enabled
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeEnabled();
  });

  test('can select Organization role', async ({ page }) => {
    // Click Organization card
    await page.getByText('Organization Administrator').click();

    // Continue button should be enabled
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeEnabled();
  });

  test('continue button is disabled without selection', async ({ page }) => {
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();
  });
});

test.describe('Org Setup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/onboarding/org');
  });

  test('displays org setup form', async ({ page }) => {
    await expect(page.getByText('Set Up Your Organization')).toBeVisible();
    await expect(page.getByLabel('Legal Name')).toBeVisible();
    await expect(page.getByLabel('Display Name')).toBeVisible();
    await expect(page.getByLabel('Email Domain')).toBeVisible();
  });

  test('shows validation errors for empty required fields', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: 'Create Organization' }).click();

    // Should show validation errors
    await expect(page.getByText(/at least 2 characters/i)).toBeVisible();
  });

  test('shows public domain warning for gmail', async ({ page }) => {
    // Fill in gmail domain
    await page.getByLabel('Email Domain').fill('gmail.com');

    // Should show warning
    await expect(page.getByText(/Public Email Domain Detected/i)).toBeVisible();
    await expect(page.getByText(/manual verification/i)).toBeVisible();
  });

  test('shows public domain warning for yahoo', async ({ page }) => {
    await page.getByLabel('Email Domain').fill('yahoo.com');
    await expect(page.getByText(/Public Email Domain Detected/i)).toBeVisible();
  });

  test('does not show warning for custom domain', async ({ page }) => {
    await page.getByLabel('Email Domain').fill('arkova.io');
    await expect(page.getByText(/Public Email Domain Detected/i)).not.toBeVisible();
  });

  test('has back button to role selection', async ({ page }) => {
    const backBtn = page.getByRole('button', { name: /Back to role selection/i });
    await expect(backBtn).toBeVisible();
  });
});

test.describe('Pending Review Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/org/pending-review');
  });

  test('displays pending review message', async ({ page }) => {
    await expect(page.getByText('Account Under Review')).toBeVisible();
    await expect(page.getByText(/pending verification/i)).toBeVisible();
  });

  test('shows expected timeline', async ({ page }) => {
    await expect(page.getByText(/1-2 business days/i)).toBeVisible();
  });

  test('has sign out button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();
  });
});
