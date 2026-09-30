import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, File, FileCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { parseDocument } from '../services/fileParser';
import { SAMPLE_DOCUMENTS } from '../utils/sampleData';

export const FileUpload = ({ onDocumentParsed, isLoading, setIsLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Validate file type
    const validTypes = ['pdf', 'docx', 'doc', 'txt', 'md', 'json', 'csv', 'log'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(ext)) {
      setErrorMsg(`Unsupported file type (.${ext}). Please upload PDF, DOCX, or TXT files.`);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const parsedDoc = await parseDocument(file);
      onDocumentParsed(parsedDoc);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to read file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const loadSampleDoc = (sampleDoc) => {
    setErrorMsg(null);
    onDocumentParsed({
      ...sampleDoc,
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    });
  };

  return (
    <div className="upload-container">
      {/* Main Drag Drop Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.docx,.doc,.txt,.md,.csv,.json,.log"
          style={{ display: 'none' }}
        />

        <div className="dropzone-content">
          <div className="icon-glow-ring">
            <UploadCloud size={40} className="upload-icon" />
          </div>

          <h2 className="dropzone-title">
            {isLoading ? 'Parsing Document Contents...' : 'Drop your document here or click to browse'}
          </h2>

          <p className="dropzone-subtitle">
            Supports <strong>PDF</strong>, <strong>DOCX (Word)</strong>, <strong>TXT</strong>, Markdown & Data files
          </p>

          <div className="supported-tags">
            <span className="file-tag pdf">
              <FileText size={14} /> PDF (.pdf)
            </span>
            <span className="file-tag docx">
              <File size={14} /> Word (.docx)
            </span>
            <span className="file-tag txt">
              <FileCheck size={14} /> Text (.txt, .md)
            </span>
          </div>

          {isLoading && (
            <div className="parsing-progress">
              <div className="progress-bar-fill"></div>
              <span>Extracting text & formatting details...</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Try Sample Files section */}
      <div className="sample-docs-section">
        <div className="sample-header">
          <Sparkles size={16} className="sample-icon" />
          <span>Don't have a file ready? Try a sample document:</span>
        </div>

        <div className="sample-grid">
          {SAMPLE_DOCUMENTS.map((doc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSampleDoc(doc)}
              className="sample-card"
            >
              <div className="sample-type-badge">{doc.fileType}</div>
              <div className="sample-info">
                <div className="sample-title">{doc.fileName}</div>
                <div className="sample-meta">{doc.wordCount} words • {doc.fileSize}</div>
              </div>
              <ArrowRight size={16} className="sample-arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
