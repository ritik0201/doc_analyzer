import React, { useState } from 'react';
import { X, Copy, Check, Search, FileText } from 'lucide-react';

export const TextPreviewModal = ({ isOpen, onClose, document }) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !document) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(document.textContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const text = document.textContent || 'No text extracted.';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card text-preview-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileText className="modal-icon" size={20} />
            <div>
              <h3>Extracted Document Text Preview</h3>
              <span className="modal-sub">
                {document.fileName} • {document.wordCount?.toLocaleString()} Words ({document.charCount?.toLocaleString()} Characters)
              </span>
            </div>
          </div>
          
          <div className="modal-actions-right">
            <button onClick={handleCopy} className="tool-btn" title="Copy raw text">
              {copied ? <Check size={16} className="success-icon" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Raw Text'}</span>
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="text-preview-body">
          <pre className="raw-text-viewer">
            {text}
          </pre>
        </div>
      </div>
    </div>
  );
};
