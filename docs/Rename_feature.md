As a user I want to be able to rename files/folders.

In the current version, the "rename" option is available in the context menu of the folder: @src/renderer/src/features/navigator/types/context-menu.ts but the implementation is missing in @src/renderer/src/features/navigator/hooks/useNavigator.ts for `handeRename`

Try to implement the rename functionality so that:

- try to make the least amount of changes by using a draft TreeItem as in case of new folder / note

Test the functionality with the Playwright MCP and also include an automated test in the project for it.

As there can be only one draft item in the navigator at once, I think you can reuse the same variable that we used for newItem. Change from the naming newItem to draftItem, modify functions accordingly to reflect the new naming. This means we have to store somewhere wether the action was to a "rename" or a "add" item, put it whereever you see fit.

If rename is clicked, the editable content (the file name) should be immediately focused and the whole text should be selected to accelerate renaming.

In case of rename, keep the draft item in the navigator where it was originally, only append the new items at the end.
