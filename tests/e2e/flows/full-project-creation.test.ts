import { test, expect } from '@playwright/test';

test.describe('Full Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and login
    await page.goto('http://localhost:3000/');
    await page.locator('button:has-text("Login")').click();
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.locator('button:has-text("Sign in")').click();

    // Verify successful login
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should allow creating a new project', async ({ page }) => {
    // Navigate to new project page
    await page.locator('button:has-text("New Project")').click();

    // Fill out project form
    await page.fill('input[name="name"]', 'Test E2E Project');
    await page.fill('textarea[name="description"]', 'Project created during E2E test');
    await page.selectOption('select[name="technology"]', 'React');

    // Select features
    await page.locator('#feature-testing').check();
    await page.locator('#feature-authentication').check();

    // Submit form
    await page.locator('button:has-text("Create Project")').click();

    // Verify success
    await expect(page.locator('h1:has-text("Test E2E Project")')).toBeVisible();
    await expect(page.locator('text=Project created during E2E test')).toBeVisible();

    // Verify project appears in dashboard when we go back
    await page.locator('a:has-text("Dashboard")').click();
    await expect(page.locator('text=Test E2E Project')).toBeVisible();
  });

  test('should show validation errors for invalid inputs', async ({ page }) => {
    // Navigate to new project page
    await page.locator('button:has-text("New Project")').click();

    // Submit empty form
    await page.locator('button:has-text("Create Project")').click();

    // Verify validation errors
    await expect(page.locator('text=Project name is required')).toBeVisible();

    // Fill just the name and try again
    await page.fill('input[name="name"]', 'Test Project');
    await page.locator('button:has-text("Create Project")').click();

    // Verify technology selection is required
    await expect(page.locator('text=Please select a technology')).toBeVisible();
  });
}); 