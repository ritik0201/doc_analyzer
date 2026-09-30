import React from 'react';
import { FileText, Key, Sparkles, Settings, Cpu, ShieldCheck, AlertCircle } from 'lucide-react';
import { getApiKey, AVAILABLE_MODELS } from '../services/geminiService';

export const Navbar = ({ currentModel, setModel, openSettings, hasKey }) => {
  const apiKey = getApiKey();

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="logo-icon-wrapper">
            <FileText className="logo-icon" size={24} />
            <Sparkles className="logo-sparkle" size={14} />
          </div>
          <div>
            <div className="brand-title">
              DocuMind <span className="brand-badge">AI Studio</span>
            </div>
            <p className="brand-subtitle">Multimodal PDF, DOCX & Text Intelligence</p>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Model Selector */}
          <div className="model-selector-wrapper">
            <Cpu size={16} className="model-icon" />
            <select
              value={currentModel}
              onChange={(e) => setModel(e.target.value)}
              className="model-select"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Key Status Badge */}
          <button 
            onClick={openSettings}
            className={`key-status-badge ${hasKey ? 'configured' : 'missing'}`}
            title="Click to configure Google AI Studio API Key"
          >
            {hasKey ? (
              <>
                <ShieldCheck size={16} className="badge-icon success" />
                <span>API Key Active</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="badge-icon warning" />
                <span>Set API Key</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button onClick={openSettings} className="icon-btn" title="API Settings & Config">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
