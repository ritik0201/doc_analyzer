import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Download, Volume2, VolumeX, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export const AnalysisViewer = ({ resultText, isAnalyzing, error, onRetry, title = 'Analysis Result' }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown tags for cleaner speech
    const cleanText = resultText
      .replace(/[#*`_~|]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 3000));
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (error) {
    return (
      <div className="analysis-card error-card">
        <div className="error-card-body">
          <AlertCircle size={32} className="error-icon" />
          <h3>Analysis Encountered an Error</h3>
          <p className="error-message-text">{error}</p>
          <button onClick={onRetry} className="retry-btn">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="analysis-card loading-card">
        <div className="loading-card-body">
          <div className="ai-loader-ring">
            <Sparkles className="spin-sparkle" size={28} />
          </div>
          <h3>Gemini AI is analyzing your document...</h3>
          <p className="loading-sub">Processing text structure, contextual reasoning, and generating formatted findings.</p>
          <div className="shimmer-lines">
            <div className="shimmer-line short"></div>
            <div className="shimmer-line medium"></div>
            <div className="shimmer-line long"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!resultText) {
    return (
      <div className="analysis-card empty-card">
        <Sparkles size={36} className="empty-icon" />
        <h3>Ready to Analyze</h3>
        <p>Select a quick action above or type a question to get instant AI analysis results.</p>
      </div>
    );
  }

  return (
    <div className="analysis-card">
      <div className="analysis-header">
        <div className="analysis-title-group">
          <Sparkles size={20} className="title-sparkle" />
          <h3>{title}</h3>
        </div>

        <div className="analysis-toolbar">
          {/* Read Aloud Button */}
          {'speechSynthesis' in window && (
            <button
              onClick={handleSpeech}
              className={`tool-btn ${isSpeaking ? 'active' : ''}`}
              title={isSpeaking ? 'Stop speaking' : 'Read output aloud'}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>
          )}

          {/* Copy Button */}
          <button onClick={handleCopy} className="tool-btn" title="Copy to clipboard">
            {copied ? <Check size={16} className="success-icon" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download Button */}
          <button onClick={handleDownload} className="tool-btn" title="Download Markdown report">
            <Download size={16} />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      <div className="analysis-body markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {resultText}
        </ReactMarkdown>
      </div>
    </div>
  );
};
