import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { marked } from 'marked';
import './index.css';


const markdownString = `# Hello Markdown!\n\nThis is a **Markdown** _renderer_ in Electron using React.\n\n- Easy to use\n- Fast\n- Secure`;

function MarkdownViewer({  value }) {
  const [markdown, setMarkdown] = useState(value);
  const [isEditMode, setIsEditMode] = useState(true);
  const html = React.useMemo(() => marked(markdown), [markdown]);

  return (
    <div>
      <button onClick={() => setIsEditMode((prev) => !prev)}>
        {isEditMode ? 'Preview' : 'Edit'}
      </button>
      {isEditMode ? (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          style={{ width: '100%', height: 300 }}
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ padding: 24 }}
        />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<MarkdownViewer value={markdownString} />);