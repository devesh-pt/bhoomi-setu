import { test, expect } from '@playwright.test';

const LIVE_URL = process.env.LIVE_URL || 'https://devesh-pt.github.io/bhoomi-setu/';

test.describe('GitHub Pages Live Deployment Smoke Suite', () => {

  test('Root page loads cleanly with zero console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/BHOOMI SETU/i);

    const bodyText = await page.innerText('body');
    expect(bodyText.length).toBeGreaterThan(100);
    expect(consoleErrors.length).toBe(0);
  });

  test('All sidebar tabs render without crashing', async ({ page }) => {
    const routes = [
      '#/land_map',
      '#/cascading_search',
      '#/highways',
      '#/ai_detection',
      '#/forest_impact',
      '#/court',
      '#/profile'
    ];

    for (const hash of routes) {
      await page.goto(`${LIVE_URL}${hash}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const text = await page.innerText('body');
      expect(text.length).toBeGreaterThan(100);
    }
  });

  test('Muavja CSV export triggers browser download', async ({ page }) => {
    await page.goto(`${LIVE_URL}#/ai_detection`, { waitUntil: 'networkidle' });
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    const exportBtn = page.locator("button:has-text('Export'), button:has-text('Excel'), button:has-text('CSV')").first();
    await exportBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Compensation_Sheet');
  });

});
