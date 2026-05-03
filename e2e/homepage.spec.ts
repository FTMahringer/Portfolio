import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page).toHaveTitle(/Fynn M/);
    
    // Check for main navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for hero section or main content
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Projects
    await page.getByRole('link', { name: /projects/i }).click();
    await expect(page).toHaveURL(/\/projects/);
    
    // Navigate to Blog
    await page.getByRole('link', { name: /blog/i }).click();
    await expect(page).toHaveURL(/\/blog/);
    
    // Navigate back to home
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have footer with social links', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    
    // Check for GitHub link
    const githubLink = footer.getByRole('link', { name: /github/i });
    await expect(githubLink).toBeVisible();
  });
});
