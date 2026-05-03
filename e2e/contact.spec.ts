import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');
    
    // Check for form elements
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/contact');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show validation errors
    // (exact implementation depends on your form)
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/contact');
    
    // Fill in invalid email
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/message/i).fill('Test message');
    
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test.skip('should successfully submit form with valid data', async ({ page }) => {
    // Skip by default to avoid sending real emails in tests
    // Remove .skip when you have a test email endpoint
    
    await page.goto('/contact');
    
    await page.getByLabel(/name/i).fill('E2E Test');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/message/i).fill('This is an automated test message');
    
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show success message
    await expect(page.getByText(/success|sent|thank you/i)).toBeVisible();
  });
});
