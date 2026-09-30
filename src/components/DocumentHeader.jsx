import React from 'react';
import { FileText, File, FileCheck, Eye, Trash2, Clock, Hash, Layers, HardDrive, RefreshCw } from 'lucide-react';

export const DocumentHeader = ({ document, onRemove, onPreviewText }) => {
  if (!document) return null;

  const getFormatIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="doc-type-icon pdf" size={24} />;
      case 'docx':
      case 'doc':
        return <File className="doc-type-icon docx" size={24} />;
      default:
        return <FileCheck className="doc-type-icon txt" size={24} />;
    }
  };

  return (
    <div className="active-doc-banner">
      <div className="active-doc-info">
        <div className="doc-icon-container">
          {getFormatIcon(document.fileType)}
        </div>

        <div className="doc-details">
          <div className="doc-title-row">
            <h3 className="doc-filename">{document.fileName}</h3>
            <span className={`doc-badge ${document.fileType?.toLowerCase()}`}>
              {document.fileType}
            </span>
          </div>

          <div className="doc-stats-row">
            <span className="doc-stat">
              <HardDrive size={14} /> {document.fileSize}
            </span>
            {document.pageCount && (
              <span className="doc-stat">
                <Layers size={14} /> {document.pageCount} {document.pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            )}
            <span className="doc-stat">
              <Hash size={14} /> {document.wordCount?.toLocaleString()} words
            </span>
            <span className="doc-stat">
              <Clock size={14} /> Uploaded {document.uploadedAt}
            </span>
          </div>
        </div>
      </div>

      <div className="active-doc-actions">
        <button
          onClick={onPreviewText}
          className="action-pill-btn secondary"
          title="Inspect raw extracted text"
        >
          <Eye size={16} /> Preview Text
        </button>

        <button
          onClick={onRemove}
          className="action-pill-btn danger"
          title="Upload another document"
        >
          <RefreshCw size={16} /> Switch File
        </button>
      </div>
    </div>
  );
};
