import { test, expect } from '../../support/fixtures';

test.describe.parallel('@P1 @Settlements Story 6.4: BBNT Workflow', () => {

  test('[P1] 6.4-E2E-001: Should create a new settlement report from the UI', async ({ page, authSession, seedFactory }) => {
    // 1. Setup: Host with verified booking and login
    const host = await seedFactory.createUser({ role: 'Host' } as any);
    await seedFactory.createBooking({ hostId: host.id, status: 'VERIFIED', startDate: '2026-08-01' } as any);
    const token = await authSession.getToken('Admin');
    
    await page.goto('/settlements');
    await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), token);
    await page.reload();

    // 2. Action: Click "Tạo BBNT" (Create BBNT)
    const createBtn = page.getByRole('button', { name: /Tạo BBNT|Create BBNT/i });
    await createBtn.click();

    // 3. Action: Select Host and Month in Modal
    // Note: Assuming PrimeVue dropdowns and calendar
    await page.locator('.p-dropdown', { hasText: /Host/i }).click();
    await page.getByText(host.name).click();
    
    await page.getByRole('button', { name: /Xác nhận|Confirm/i }).click();

    // 4. Assert: Report appears in list with PENDING status
    await expect(page.locator('.settlement-list-row').first()).toContainText('VIBULA-');
    await expect(page.locator('.settlement-list-row').first()).toContainText('PENDING');
  });

});
