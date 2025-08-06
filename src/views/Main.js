import React, { useState, useMemo } from 'react';
import MarkdownViewer from '../components/MarkdownViewer';
import Sidebar from '../components/Sidebar';

export default function Main() {
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: 'Document 1',
            markdownContent: `# Hello Markdown!\n\nThis is a **Markdown** _renderer_ in Electron using React.\n\n- Easy to use\n- Fast\n- Secure`,
        },
        {
            id: 2,
            name: 'Document 2',
            markdownContent: "",
        }
    ]);

    // Track the current document by id for easier updates
    const [currentDocumentId, setCurrentDocumentId] = useState(documents[0].id);

    // Memoize the current document using React.useMemo
    const currentDocument = useMemo(
        () => documents.find(doc => doc.id === currentDocumentId),
        [documents, currentDocumentId]
    );

    const handleSave = (markdown) => {
        setDocuments(prevDocs =>
            prevDocs.map(doc =>
                doc.id === currentDocumentId
                    ? { ...doc, markdownContent: markdown }
                    : doc
            )
        );
    };

    const handleDocumentClick = (doc) => {
        setCurrentDocumentId(doc.id);
    };

    return (
        <div className="container">
            <Sidebar document={documents} onDocumentClick={handleDocumentClick} />
            {currentDocument && (
                <MarkdownViewer
                    value={currentDocument.markdownContent}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}