import React, { useState, useEffect } from 'react';
import { X, Key, Check, Eye, EyeOff, ExternalLink, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getApiKey, saveApiKey, AVAILABLE_MODELS } from '../services/geminiService';

export const SettingsModal = ({ isOpen, onClose, currentModel, setModel, onKeyUpdate }) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getApiKey());
      setTestStatus(null);
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(keyInput);
    onKeyUpdate();
    onClose();
  };

  const handleTestKey = async () => {
    if (!keyInput || !keyInput.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API Key to test.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Connecting to Google AI Studio API...');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${keyInput.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK.' }] }]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP Error ${res.status}`);
      }

      setTestStatus('success');
      setTestMessage('✅ API Key verified successfully! Connection established.');
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`❌ Verification Failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Key className="modal-icon" size={20} />
            <h3>Google AI Studio Configuration</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* API Key Section */}
          <div className="form-group">
            <label className="form-label">
              <span>Google AI Studio API Key</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="external-link"
              >
                Get Free API Key <ExternalLink size={12} />
              </a>
            </label>

            <div className="input-with-action">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter API Key (e.g. AQ.Ab8RN... or AIzaSy...)"
                className="text-input"
              />
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)} 
                className="toggle-vis-btn"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="input-hint">
              Default pre-configured API key is active. You can override it here anytime.
            </p>
          </div>

          {/* Test connection status banner */}
          {testStatus && (
            <div className={`status-banner ${testStatus}`}>
              {testStatus === 'testing' && <RefreshCw size={16} className="spin" />}
              {testStatus === 'success' && <ShieldCheck size={16} />}
              {testStatus === 'error' && <AlertTriangle size={16} />}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Model selection */}
          <div className="form-group">
            <label className="form-label">Default Gemini AI Model</label>
            <div className="model-grid">
              {AVAILABLE_MODELS.map((m) => (
                <div
                  key={m.id}
                  className={`model-card-item ${currentModel === m.id ? 'active' : ''}`}
                  onClick={() => setModel(m.id)}
                >
                  <div className="model-name">{m.name}</div>
                  <div className="model-desc">{m.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            onClick={handleTestKey} 
            className="secondary-btn"
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Key'}
          </button>
          
          <div className="footer-right">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="primary-btn">
              <Check size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
