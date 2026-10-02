export default async (page) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const b = page.getByRole('button', { name: 'チェック' }); await b.scrollIntoViewIfNeeded();
  return await b.evaluate(e => ({ dis: e.disabled, desc: e.getAttribute('aria-describedby'), txt: e.getAttribute('aria-describedby') && document.getElementById(e.getAttribute('aria-describedby').split(' ')[0])?.textContent }));
};
