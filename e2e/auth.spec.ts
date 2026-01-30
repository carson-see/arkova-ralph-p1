import { test, expect } from '@playwright/test';

/**
 * Auth Flow E2E Tests (P2-S1, P2-S2)
 *
 * Tests the authentication UI and routing behavior.
 * Note: These tests use the UI without actual Supabase auth.
 * For full integration tests, use test users from seed data.
 */

test.describe('Auth Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/auth');
  });

  test('displays sign in form by default', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Arkova' })).toBeVisible();
    
    // Check form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    
    // Check Google OAuth button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('can switch to sign up mode', async ({ page }) => {
    // Click switch link
    await page.getByRole('button', { name: /Don't have an account/i }).click();
    
    // Verify sign up button appears
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('can switch back to sign in mode', async ({ page }) => {
    // Go to sign up
    await page.getByRole('button', { name: /Don't have an account/i }).click();
    
    // Go back to sign in
    await page.getByRole('button', { name: /Already have an account/i }).click();
    
    // Verify sign in button
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('shows validation error for short password', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('short');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show password length error
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });
});

test.describe('Route Guards', () => {
  test('unauthenticated users are redirected to auth', async ({ page }) => {
    // Try to access protected route
    await page.goto('/#/vault');
    
    // Should redirect to auth (URL contains /auth)
    await page.waitForURL(/.*#\/auth.*/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('auth page is accessible without authentication', async ({ page }) => {
    await page.goto('/#/auth');
    
    // Should stay on auth page
    await expect(page.getByRole('heading', { name: 'Arkova' })).toBeVisible();
  });
});

test.describe('Copy Compliance', () => {
  test('auth page does not contain forbidden terms', async ({ page }) => {
    await page.goto('/#/auth');
    
    // Get all visible text
    const bodyText = await page.locator('body').textContent();
    
    // Check for forbidden terms (case insensitive)
    const forbiddenTerms = ['wallet', 'crypto', 'bitcoin', 'blockchain', 'transaction'];
    
    for (const term of forbiddenTerms) {
      expect(bodyText?.toLowerCase()).not.toContain(term);
    }
  });
});
