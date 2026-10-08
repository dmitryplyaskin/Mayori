/** Exercise the shared DSH Menu through its visible, accessible controls. */
export async function chooseMenu(page, label, option) {
  const trigger = page.getByRole('button', { name: label, exact: true })
  await trigger.click()
  await page.getByRole('menuitem', { name: option, exact: typeof option === 'string' }).click()
}

export async function chooseMenuValue(page, label, value) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.getByRole('menuitem').filter({ has: page.locator(`[data-mayori-option=${JSON.stringify(value)}]`) }).click()
}
