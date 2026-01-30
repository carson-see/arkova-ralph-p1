import { test, expect } from '@playwright/test';

/**
 * Organization Dashboard E2E Tests
 *
 * Tests the org admin dashboard and related features.
 */

test.describe('Org Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/org');
  });

  test('displays dashboard layout', async ({ page }) => {
    // Check for Arkova branding
    await expect(page.getByText('Arkova')).toBeVisible();
  });

  test('displays organization records heading', async ({ page }) => {
    await expect(page.getByText('Organization Records')).toBeVisible();
  });

  test('displays empty state for org records', async ({ page }) => {
    await expect(page.getByText('No organization records')).toBeVisible();
  });

  test('has create anchor button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Secure Document/i })).toBeVisible();
  });
});

test.describe('Org Navigation', () => {
  test('org admin sees org-specific nav items', async ({ page }) => {
    await page.goto('/#/org');

    // Should see Organization Records
    await expect(page.getByText('Organization Records')).toBeVisible();

    // Should see Organization settings link
    await expect(page.getByText('Organization')).toBeVisible();
  });
});

test.describe('Copy Compliance - Org', () => {
  test('org dashboard does not contain forbidden terms', async ({ page }) => {
    await page.goto('/#/org');

    const bodyText = await page.locator('body').textContent();
    const forbiddenTerms = ['wallet', 'crypto', 'bitcoin', 'blockchain', 'hash', 'transaction'];

    for (const term of forbiddenTerms) {
      expect(bodyText?.toLowerCase()).not.toContain(term);
    }
  });

  test('pending review page does not contain forbidden terms', async ({ page }) => {
    await page.goto('/#/org/pending-review');

    const bodyText = await page.locator('body').textContent();
    const forbiddenTerms = ['wallet', 'crypto', 'bitcoin', 'blockchain', 'hash'];

    for (const term of forbiddenTerms) {
      expect(bodyText?.toLowerCase()).not.toContain(term);
    }
  });
});
