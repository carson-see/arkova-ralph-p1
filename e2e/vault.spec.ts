import { test, expect } from '@playwright/test';

/**
 * Vault Dashboard E2E Tests (P3-S1, P3-S2, P3-S3)
 *
 * Tests the individual vault dashboard and related features.
 */

test.describe('Vault Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/vault');
  });

  test('displays dashboard layout with sidebar', async ({ page }) => {
    // Check for Arkova branding
    await expect(page.getByText('Arkova')).toBeVisible();

    // Check for navigation items
    await expect(page.getByText('My Records')).toBeVisible();
    await expect(page.getByText('Affiliations')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Help')).toBeVisible();
  });

  test('displays privacy toggle card', async ({ page }) => {
    await expect(page.getByText('Vault Visibility')).toBeVisible();
  });

  test('displays empty state for records', async ({ page }) => {
    // Should show empty state message
    await expect(page.getByText('No records yet')).toBeVisible();
    await expect(page.getByText(/Secure your first document/i)).toBeVisible();
  });

  test('has create anchor button in empty state', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Secure Document/i })).toBeVisible();
  });

  test('displays sign out option', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();
  });
});

test.describe('Vault Privacy Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/vault');
  });

  test('displays current privacy state', async ({ page }) => {
    // Should show either "Make Private" or "Make Public" button
    const toggleBtn = page.getByRole('button', { name: /Make (Private|Public)/i });
    await expect(toggleBtn).toBeVisible();
  });

  test('privacy toggle button is clickable', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /Make (Private|Public)/i });
    await expect(toggleBtn).toBeEnabled();
  });
});

test.describe('Affiliations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/affiliations');
  });

  test('displays affiliations heading', async ({ page }) => {
    await expect(page.getByText('Affiliations')).toBeVisible();
    await expect(page.getByText(/Organizations you're connected with/i)).toBeVisible();
  });

  test('displays empty state', async ({ page }) => {
    await expect(page.getByText('No Affiliations Yet')).toBeVisible();
    await expect(page.getByText(/invited to an organization/i)).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('can navigate to affiliations from vault', async ({ page }) => {
    await page.goto('/#/vault');

    // Click affiliations link
    await page.getByText('Affiliations').click();

    // Should navigate to affiliations
    await expect(page).toHaveURL(/.*#\/affiliations/);
    await expect(page.getByText('No Affiliations Yet')).toBeVisible();
  });

  test('can navigate back to vault from affiliations', async ({ page }) => {
    await page.goto('/#/affiliations');

    // Click My Records link
    await page.getByText('My Records').click();

    // Should navigate to vault
    await expect(page).toHaveURL(/.*#\/vault/);
  });
});

test.describe('Responsive Layout', () => {
  test('mobile menu button appears on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/#/vault');

    // Menu button should be visible on mobile
    // The sidebar should be hidden by default on mobile
    const menuBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(menuBtn).toBeVisible();
  });
});

test.describe('Copy Compliance - Dashboard', () => {
  test('vault page does not contain forbidden terms', async ({ page }) => {
    await page.goto('/#/vault');

    const bodyText = await page.locator('body').textContent();
    const forbiddenTerms = ['wallet', 'crypto', 'bitcoin', 'blockchain', 'hash'];

    for (const term of forbiddenTerms) {
      expect(bodyText?.toLowerCase()).not.toContain(term);
    }
  });

  test('affiliations page does not contain forbidden terms', async ({ page }) => {
    await page.goto('/#/affiliations');

    const bodyText = await page.locator('body').textContent();
    const forbiddenTerms = ['wallet', 'crypto', 'bitcoin', 'blockchain', 'hash'];

    for (const term of forbiddenTerms) {
      expect(bodyText?.toLowerCase()).not.toContain(term);
    }
  });
});
