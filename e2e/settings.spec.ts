import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('should open settings drawer', async ({ page }) => {
    await page.goto('/');
    
    // Find and click the settings button (usually in header or bottom right)
    const settingsButton = page.getByRole('button', { name: /settings/i }).or(
      page.getByLabel(/settings/i)
    );
    
    await settingsButton.click();
    
    // Check that settings drawer is visible
    await expect(page.getByText(/theme/i)).toBeVisible();
  });

  test('should persist theme change', async ({ page, context }) => {
    await page.goto('/');
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).or(
      page.getByLabel(/settings/i)
    );
    await settingsButton.click();
    
    // Find and click dark theme button
    const darkButton = page.getByRole('button', { name: /dark/i });
    await darkButton.click();
    
    // Check that the html element has dark theme applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Check that cookie was set
    const cookies = await context.cookies();
    const settingsCookie = cookies.find(c => c.name === 'portfolio-settings');
    expect(settingsCookie).toBeDefined();
    expect(settingsCookie?.value).toContain('dark');
    
    // Reload page and verify theme persists
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should change font family', async ({ page }) => {
    await page.goto('/');
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).or(
      page.getByLabel(/settings/i)
    );
    await settingsButton.click();
    
    // Find serif font button
    const serifButton = page.getByRole('button', { name: /serif/i });
    await serifButton.click();
    
    // Check that the html element has serif font applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-font', 'serif');
  });

  test('should toggle reduced motion', async ({ page }) => {
    await page.goto('/');
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).or(
      page.getByLabel(/settings/i)
    );
    await settingsButton.click();
    
    // Find and toggle reduced motion
    const motionToggle = page.getByLabel(/reduce motion/i).or(
      page.getByRole('button', { name: /motion/i })
    );
    
    await motionToggle.click();
    
    // Verify the toggle state changed (implementation dependent)
    // Could check aria-checked, data attribute, or cookie
  });
});
