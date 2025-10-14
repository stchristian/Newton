import { test, expect } from '@playwright/test'

test.describe('Navigator Rename Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the app to load and open workspace
    await page.getByRole('button', { name: 'Open workspace' }).click()
    // Wait for navigator to load
    await page.waitForSelector('.tree-view', { timeout: 5000 })
  })

  test('should rename a file', async ({ page }) => {
    // Find and right-click on a test file
    const fileToRename = page.getByText('Welcome.md')
    await fileToRename.click({ button: 'right' })

    // Click the "Rename..." menu item
    await page.getByRole('menuitem', { name: 'Rename...' }).click()

    // Type the new name and submit
    const editableField = page.getByText('Welcome.md')
    await editableField.fill('Renamed Test File')
    await editableField.press('Enter')

    // Verify the file was renamed in the UI
    await expect(page.getByText('Renamed Test File.md')).toBeVisible()
    await expect(page.getByText('Welcome.md')).not.toBeVisible()
  })

  test('should rename a folder', async ({ page }) => {
    // Create a test folder first if needed
    const addFolderBtn = page.getByRole('button', { name: 'Add folder' })
    await addFolderBtn.click()

    // Create folder with name "Test Folder"
    const draftFolder = page.locator('[contenteditable="true"]').first()
    await draftFolder.fill('Test Folder')
    await draftFolder.press('Enter')

    // Wait for the folder to appear
    await page.waitForTimeout(500)

    // Right-click on the folder to rename it
    const folderToRename = page.getByText('Test Folder')
    await folderToRename.click({ button: 'right' })

    // Click the "Rename..." menu item
    await page.getByRole('menuitem', { name: 'Rename...' }).click()

    // Type the new name and submit
    const editableField = page.getByText('Test Folder')
    await editableField.fill('Renamed Test Folder')
    await editableField.press('Enter')

    // Verify the folder was renamed in the UI
    await expect(page.getByText('Renamed Test Folder')).toBeVisible()
    await expect(page.getByText('Test Folder')).not.toBeVisible()
  })

  test('should cancel rename on blur', async ({ page }) => {
    // Find and right-click on a test file
    const fileToRename = page.getByText('Getting Started.md')
    await fileToRename.click({ button: 'right' })

    // Click the "Rename..." menu item
    await page.getByRole('menuitem', { name: 'Rename...' }).click()

    // Type a new name but don't submit - click elsewhere to blur
    const editableField = page.getByText('Getting Started.md')
    await editableField.fill('Should Not Be Saved')

    // Click somewhere else to blur the field
    await page.getByRole('heading', { name: 'Newton' }).click()

    // Verify the file name was NOT changed
    await expect(page.getByText('Getting Started.md')).toBeVisible()
    await expect(page.getByText('Should Not Be Saved')).not.toBeVisible()
  })

  test('should handle renaming with special characters', async ({ page }) => {
    // Find and right-click on a test file
    const fileToRename = page.getByText('Omg.md')
    await fileToRename.click({ button: 'right' })

    // Click the "Rename..." menu item
    await page.getByRole('menuitem', { name: 'Rename...' }).click()

    // Type a name with special characters
    const editableField = page.getByText('Omg.md')
    await editableField.fill('Special-File_123')
    await editableField.press('Enter')

    // Verify the file was renamed
    await expect(page.getByText('Special-File_123.md')).toBeVisible()
  })

  test('should keep renamed items in place while new items go to end', async ({ page }) => {
    // Get all file items in the navigator
    const getAllFiles = async () => {
      const navigator = page.locator('.tree-view')
      const items = await navigator.locator('> div > div > div > span:last-child').allTextContents()
      return items
    }

    // Get initial order
    const initialOrder = await getAllFiles()
    const secondItemName = initialOrder[1]

    // Rename the second item to start with "AAA" (should stay in same position alphabetically)
    await page.getByText(secondItemName).click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Rename...' }).click()
    await page.keyboard.press('A')
    await page.keyboard.press('A')
    await page.keyboard.press('A')
    await page.keyboard.press('Enter')

    // Wait for rename to complete
    await page.waitForTimeout(300)

    // Get order after rename
    const orderAfterRename = await getAllFiles()

    // Verify AAA.md is still in the second position (or first if it sorts before folder)
    const aaaIndex = orderAfterRename.findIndex((name) => name === 'AAA.md')
    expect(aaaIndex).toBeLessThanOrEqual(1) // Should be at position 0 or 1 depending on folder

    // Now add a new note
    await page.getByRole('button', { name: 'Add note' }).click()

    // Wait for the draft item to appear
    await page.waitForTimeout(200)

    // Get order with new draft item
    const orderWithNewItem = await getAllFiles()

    // Verify the new item is at the end
    const lastItem = orderWithNewItem[orderWithNewItem.length - 1]
    expect(lastItem).toContain('New note')

    // Verify AAA.md is still near the beginning, not at the end
    const aaaIndexAfterAdd = orderWithNewItem.findIndex((name) => name === 'AAA.md')
    expect(aaaIndexAfterAdd).toBeLessThan(orderWithNewItem.length - 1)
  })
})
