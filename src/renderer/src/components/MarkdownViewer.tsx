import React, { useState, useMemo } from 'react'
import { marked } from 'marked'

const renderer = new marked.Renderer()

renderer.heading = ({ depth, text }) => {
  return `<h${depth} class="text-xl font-bold">${text}</h${depth}>`
}

marked.use({ renderer })

interface MarkdownViewerProps {
  value: string
  onSave?: (markdown: string) => void
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ value, onSave }) => {
  const [markdown, setMarkdown] = useState(value)
  const [isEditMode, setIsEditMode] = useState(true)

  // Update markdown if value prop changes
  React.useEffect(() => {
    setMarkdown(value)
  }, [value])

  const html = useMemo(() => marked(markdown), [markdown])

  return (
    <div className="flex flex-col w-full">
      <div>
        <button onClick={() => setIsEditMode((prev) => !prev)}>
          {isEditMode ? 'Preview' : 'Edit'}
        </button>
        {isEditMode && (
          <button style={{ marginLeft: 8 }} onClick={() => onSave && onSave(markdown)}>
            Save
          </button>
        )}
      </div>
      {isEditMode ? (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="h-full"
        />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: html }} style={{ padding: 24 }} />
      )}
    </div>
  )
}

export default MarkdownViewer
