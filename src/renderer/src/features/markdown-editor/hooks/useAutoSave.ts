import { useState, useRef, useCallback, useEffect } from 'react'
import { StorageService } from '@renderer/features/storage'
import { AutoSaveState } from '../types/editor'

export function useAutoSave(
  filePath: string | undefined,
  autoSaveDelay: number = 2000
): AutoSaveState & { save: (content: string) => void } {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced auto-save function
  const save = useCallback(
    (content: string) => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (!filePath) return

        setIsSaving(true)
        try {
          await StorageService.writeFile(filePath, content)
          setLastSaved(new Date())
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }, autoSaveDelay)
    },
    [filePath, autoSaveDelay]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return { isSaving, lastSaved, save }
}
