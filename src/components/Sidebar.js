import React from 'react';

const Sidebar = ({ document, onDocumentClick }) => {
  if (!document || !Array.isArray(document)) {
    return (
      <aside className="sidebar">
        <p>No documents available.</p>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <ul>
        {document.map((doc, idx) => (
          <li key={doc.id || idx} onClick={() => onDocumentClick(doc)}>
            { doc.name || `Document ${idx + 1}`}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
