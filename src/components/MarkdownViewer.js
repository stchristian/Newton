import React, { useState } from 'react';
import { marked } from 'marked';


export default function MarkdownViewer({ value, onSave }) {
    const [markdown, setMarkdown] = useState(value);
    const [isEditMode, setIsEditMode] = useState(true);

    // Update markdown if value prop changes
    React.useEffect(() => {
        setMarkdown(value);
    }, [value]);

    const html = React.useMemo(() => marked(markdown), [markdown]);

    return (
        <div>
            <button onClick={() => setIsEditMode((prev) => !prev)}>
                {isEditMode ? 'Preview' : 'Edit'}
            </button>
            {isEditMode && (
                <button
                    style={{ marginLeft: 8 }}
                    onClick={() => onSave && onSave(markdown)}
                >
                    Save
                </button>
            )}
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