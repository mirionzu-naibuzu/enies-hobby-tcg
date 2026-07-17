import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://enieshobby-tcg.vercel.app/');
  await page.getByRole('button', { name: 'Join' }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
});