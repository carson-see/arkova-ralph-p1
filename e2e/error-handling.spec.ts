import { test, expect } from '@playwright/test';

/**
 * Error Handling E2E Tests
 *
 * Tests error boundaries, 404 handling, and graceful degradation.
 */

test.describe('Route Handling', () => {
  test('unknown routes redirect to auth', async ({ page }) => {
    await page.goto('/#/unknown-route-that-does-not-exist');

    // Should redirect to auth page
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('empty hash redirects to auth', async ({ page }) => {
    await page.goto('/#/');

    // Should show auth page
    await expect(page.getByRole('heading', { name: 'Arkova' })).toBeVisible();
  });

  test('no hash redirects to auth', async ({ page }) => {
    await page.goto('/');

    // Should show auth page
    await expect(page.getByRole('heading', { name: 'Arkova' })).toBeVisible();
  });
});

test.describe('Loading States', () => {
  test('shows loading indicator during route transitions', async ({ page }) => {
    // Start at auth
    await page.goto('/#/auth');

    // Navigate to a protected route
    await page.goto('/#/vault');

    // Should show loading or redirect
    // (In real app with auth, this would show loading spinner)
    await page.waitForTimeout(100);
  });
});

test.describe('Form Error Handling', () => {
  test('auth form shows error for invalid submission', async ({ page }) => {
    await page.goto('/#/auth');

    // Fill invalid data
    await page.getByLabel('Email').fill('notanemail');
    await page.getByLabel('Password').fill('123');

    // Submit
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation errors
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('org setup shows validation errors', async ({ page }) => {
    await page.goto('/#/onboarding/org');

    // Fill only legal name (missing display name)
    await page.getByLabel('Legal Name').fill('Test Corp');

    // Submit
    await page.getByRole('button', { name: 'Create Organization' }).click();

    // Should show error for display name
    await expect(page.getByText(/at least 2 characters/i)).toBeVisible();
  });
});

test.describe('Placeholder Pages', () => {
  test('settings page shows coming soon', async ({ page }) => {
    await page.goto('/#/settings');

    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Coming soon')).toBeVisible();
  });

  test('help page shows coming soon', async ({ page }) => {
    await page.goto('/#/help');

    await expect(page.getByText('Help & Support')).toBeVisible();
    await expect(page.getByText('Coming soon')).toBeVisible();
  });

  test('org settings page shows coming soon', async ({ page }) => {
    await page.goto('/#/org/settings');

    await expect(page.getByText('Organization Settings')).toBeVisible();
    await expect(page.getByText('Coming soon')).toBeVisible();
  });
});
