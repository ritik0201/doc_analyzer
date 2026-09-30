import React from 'react';
import { Zap, CheckSquare, BarChart2, HelpCircle, ShieldAlert, Globe, MessageSquare, Send } from 'lucide-react';
import { PRESET_PROMPTS } from '../services/geminiService';

export const PresetActions = ({ onSelectAction, activeActionKey, isAnalyzing, customPrompt, setCustomPrompt, onCustomSubmit }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Zap': return <Zap size={18} className="preset-icon summary" />;
      case 'CheckSquare': return <CheckSquare size={18} className="preset-icon action" />;
      case 'BarChart2': return <BarChart2 size={18} className="preset-icon metrics" />;
      case 'HelpCircle': return <HelpCircle size={18} className="preset-icon quiz" />;
      case 'ShieldAlert': return <ShieldAlert size={18} className="preset-icon risks" />;
      case 'Globe': return <Globe size={18} className="preset-icon translate" />;
      default: return <MessageSquare size={18} />;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (customPrompt.trim() && !isAnalyzing) {
      onCustomSubmit();
    }
  };

  return (
    <div className="preset-actions-container">
      <div className="section-title-row">
        <h4>⚡ AI Quick Analysis Actions</h4>
        <span className="section-subtitle">Click any preset or type custom query below</span>
      </div>

      <div className="preset-grid">
        {Object.entries(PRESET_PROMPTS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => onSelectAction(key, item.prompt)}
            disabled={isAnalyzing}
            className={`preset-card ${activeActionKey === key ? 'active' : ''}`}
          >
            <div className="preset-card-header">
              {getIcon(item.icon)}
              <span className="preset-card-title">{item.title}</span>
            </div>
            <p className="preset-card-desc">
              {key === 'summary' && 'Generate core abstract, main points & target audience.'}
              {key === 'actionItems' && 'Extract urgent tasks, deadlines & responsible owners.'}
              {key === 'metrics' && 'Extract all quantitative data, tables & statistics.'}
              {key === 'quiz' && 'Generate 5 interactive multiple choice practice questions.'}
              {key === 'risks' && 'Identify missing details, compliance & potential red flags.'}
              {key === 'translate' && 'Summarize & translate document output into key languages.'}
            </p>
          </button>
        ))}
      </div>

      {/* Custom Prompt Input */}
      <form onSubmit={handleFormSubmit} className="custom-prompt-form">
        <div className="input-group">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask anything custom about this document (e.g., 'What are the main risks outlined in section 3?')"
            className="custom-prompt-input"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={!customPrompt.trim() || isAnalyzing}
            className="submit-prompt-btn"
          >
            <Send size={16} />
            <span>Analyze</span>
          </button>
        </div>
      </form>
    </div>
  );
};
