export interface MarkdownEditorProps {
  fileName?: string
  filePath?: string
}

export interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
}
