import { test, expect } from '../../support/fixtures';

test.describe.parallel('@P1 @RBAC Story 3.4: UI Permission Filtering', () => {

  test('[P1] 3.4-E2E-001: KA should not see Admin-specific sidebar menus', async ({ page, authSession }) => {
    // 1. Setup: Login as KA
    const kaToken = await authSession.getToken('KA');
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), kaToken);
    await page.reload();

    // 2. Assert: Master Data and Audit Trail menus are hidden
    await expect(page.locator('aside')).not.toContainText('Master Data');
    await expect(page.locator('aside')).not.toContainText('Audit Trail');
    
    // 3. Assert: Dashboard and My Bookings are visible
    await expect(page.locator('aside')).toContainText('Dashboard');
    await expect(page.locator('aside')).toContainText('My Booking');
  });

  test('[P1] 3.4-E2E-002: Direct navigation to Admin pages should redirect to Dashboard', async ({ page, authSession }) => {
    // 1. Setup: Login as KA
    const kaToken = await authSession.getToken('KA');
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), kaToken);
    
    // 2. Action: Force navigate to /master-data
    await page.goto('/master-data');

    // 3. Assert: Redirected to Dashboard or 403 Page
    await expect(page).toHaveURL(/.*dashboard/);
  });

});
