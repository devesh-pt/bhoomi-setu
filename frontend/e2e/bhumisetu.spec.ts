import { test, expect } from '@playwright/test';

test.describe('BHUMISETU End-to-End User Flows', () => {

  test('Flow 1: Login as LAO Officer & Language Toggle (EN <-> HI)', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('h1')).toContainText('BHUMISETU');

    // Click Demo Officer chip
    await page.click('button:has-text("LAO Officer")');
    await page.click('button[type="submit"]');

    // Verify logged in dashboard
    await expect(page.locator('header')).toContainText('Land Acquisition Officer');

    // Toggle Language to Hindi
    await page.click('button:has-text("Hindi / हिंदी")');
    await expect(page.locator('header')).toContainText('भूमि सेतु');

    // Switch back to English
    await page.click('button:has-text("English / अंग्रेजी")');
    await expect(page.locator('header')).toContainText('BHUMISETU');
  });

  test('Flow 2: Land Map Search Khasra No & Open AI Case Insight', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("LAO Officer")');
    await page.click('button[type="submit"]');

    // Search Khasra Number
    await page.fill('input[placeholder*="Search Khasra"]', 'Budhni');
    await page.keyboard.press('Enter');

    // Verify parcel detail panel opens
    await expect(page.locator('text=Parcel Cadastral Details')).toBeVisible();
    await expect(page.locator('text=Demo Data')).toBeVisible();
    await expect(page.locator('text=AI Dispute Risk Insight')).toBeVisible();
  });

  test('Flow 3: Highways Corridor Buffer & Banjar Route Optimizer', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("LAO Officer")');
    await page.click('button[type="submit"]');

    // Navigate to Highways Module
    await page.click('button:has-text("Highways & Routing")');
    await expect(page.locator('h1')).toContainText('Highway Corridor');

    // Click Suggest Banjar Route
    await page.click('button:has-text("Suggest Banjar-Optimised Route")');
    await expect(page.locator('text=Fertile Farmland Saved')).toBeVisible();
  });

  test('Flow 4: AI Land Detection & Muavja Compensation Export', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("LAO Officer")');
    await page.click('button[type="submit"]');

    // Navigate to AI Land & Muavja Module
    await page.click('button:has-text("AI Land & Muavja")');
    await expect(page.locator('h1')).toContainText('AI Land Detection & Muavja');

    // Check Grand Total Muavja card
    await expect(page.locator('text=Grand Total Muavja')).toBeVisible();
    await expect(page.locator('button:has-text("Download Excel Compensation Sheet")')).toBeEnabled();
  });

  test('Flow 5: Forest Impact Analytics & Clearance Warning', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("LAO Officer")');
    await page.click('button[type="submit"]');

    // Navigate to Forest Impact Module
    await page.click('button:has-text("Forest Impact")');
    await expect(page.locator('h1')).toContainText('Forest Protection');

    // Verify Forest Clearance Red Warning Banner
    await expect(page.locator('text=CRITICAL: Forest Clearance Required')).toBeVisible();
    await expect(page.locator('text=Suggested Low-Forest Impact Alternative Route')).toBeVisible();
  });

});
