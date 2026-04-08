import { test, expect } from '../../support/fixtures';

test.describe.parallel('@P1 @Booking Story 5.3: Auto-Allocate Workflow UI', () => {

  test('[P2] 5.3-E2E-001: Should perform bulk auto-allocation from Booking Grid', async ({ page, authSession, seedFactory }) => {
    // 1. Setup: User with bookings requiring rooms
    await seedFactory.createRoom({ code: 'ROOM-UI-1' });
    const b1 = await seedFactory.createBooking({ code: 'BK-UI-1', status: 'WIP' });
    
    // 2. Action: Login and navigate to Booking Grid
    const token = await authSession.getToken('Admin');
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), token);
    await page.reload();
    await page.goto('/bookings');

    // 3. Action: Select and Trigger Auto-Allocate
    await page.locator(`tr:has-text("${b1.code}") input[type="checkbox"]`).check();
    await page.getByRole('button', { name: /auto allocate/i }).click();

    // 4. Assert: Validation Modal appears
    await expect(page.getByText(/validation results/i)).toBeVisible();
    await expect(page.getByText(b1.code)).toBeVisible();
    await expect(page.getByText('ROOM-UI-1')).toBeVisible();

    // 5. Action: Apply
    await page.getByRole('button', { name: /apply assignments/i }).click();

    // 6. Assert: Success Toast and Grid Update
    await expect(page.getByText(/successfully allocated/i)).toBeVisible();
    await expect(page.locator(`tr:has-text("${b1.code}")`)).toContainText('ROOM-UI-1');
  });

});
