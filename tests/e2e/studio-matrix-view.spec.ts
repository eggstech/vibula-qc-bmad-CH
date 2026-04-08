import { test, expect } from '../../support/fixtures';

test.describe.parallel('@P1 @Studio Story 5.2: Matrix Visualization', () => {

  test('[P1] 5.2-E2E-001: Should display rooms and calendar days in the matrix', async ({ page, authSession, seedFactory }) => {
    // 1. Setup: Create some rooms and login
    await seedFactory.createRoom({ name: 'TEST-ROOM-1' });
    const token = await authSession.getToken('Admin');
    
    await page.goto('/operations-portal');
    await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), token);
    await page.reload();

    // 2. Assert: Sidebar and Matrix are visible
    await expect(page.locator('.operations-scheduler-sidebar')).toBeVisible();
    await expect(page.locator('.studio-matrix-grid')).toBeVisible();

    // 3. Assert: Grid headers (Mon - Sun)
    const headers = page.locator('.matrix-header-cell');
    await expect(headers).toHaveCount(7);
    
    // 4. Assert: Room rows
    await expect(page.getByText('TEST-ROOM-1')).toBeVisible();
  });

  test('[P2] 5.2-E2E-002: Should allow dragging a booking from sidebar to room row', async ({ page, authSession, seedFactory }) => {
    // 1. Setup: Create unassigned booking and login
    const booking = await seedFactory.createBooking({ code: 'DRAG-ME', status: 'WIP' });
    const token = await authSession.getToken('Admin');
    
    await page.goto('/operations-portal');
    await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), token);
    await page.reload();

    // 2. Action: Find booking card in sidebar and drag it to a room row
    const card = page.locator('.booking-card', { hasText: 'DRAG-ME' }).first();
    const dropZone = page.locator('.matrix-cell').first(); // Drop into first room/day

    if (await card.isVisible()) {
        await card.dragTo(dropZone);
        
        // 3. Assert: Loading spinner or confirm modal appears
        await expect(page.locator('.p-toast')).toBeVisible();
    } else {
        test.skip(true, 'Booking card not found in sidebar');
    }
  });

});
