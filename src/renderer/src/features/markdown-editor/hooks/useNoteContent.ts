import { useState, useEffect } from 'react'
import { StorageService } from '@renderer/features/storage'

export function useNoteContent(filePath: string | undefined) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!filePath) {
      setContent('')
      setIsLoading(false)
      setError(null)
      return
    }

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const fileContent = await StorageService.readFile(filePath)
        setContent(fileContent)
      } catch (err) {
        console.error('Failed to load file content:', err)
        setError(err instanceof Error ? err : new Error('Failed to load file'))
        setContent('')
      } finally {
        setIsLoading(false)
      }
    }

    void loadContent()
  }, [filePath])

  return { content, isLoading, error }
}
