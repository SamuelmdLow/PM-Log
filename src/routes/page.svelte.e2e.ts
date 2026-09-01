import { expect, test } from '@playwright/test';
import { exec } from 'child_process';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
})

test('has expected h1', async ({ page }) => {
	await expect(page.locator('h1')).toBeVisible();
});

test('load button functions', async ({ page }) => {
	const scheduleItems = page.locator('div.schedule-item');
	const initialCount = await scheduleItems.count();
	await page.getByRole('button', { name: 'Load more' }).click();
	expect(initialCount).toBeLessThan(await scheduleItems.count())
});

test('search button functions', async ({ page }) => {
	await page.getByRole('button', { name: 'Search' }).click();
	await expect(page).toHaveURL(/search?/);
});