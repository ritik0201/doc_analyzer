import React, { useState, useEffect } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { FileUpload } from './components/FileUpload';
import { DocumentHeader } from './components/DocumentHeader';
import { PresetActions } from './components/PresetActions';
import { AnalysisViewer } from './components/AnalysisViewer';
import { ChatSection } from './components/ChatSection';
import { TextPreviewModal } from './components/TextPreviewModal';

import { callGeminiAPI, getApiKey, PRESET_PROMPTS, AVAILABLE_MODELS } from './services/geminiService';
import { FileText, Sparkles, Settings, Cpu, ShieldCheck, AlertCircle, LayoutDashboard, MessageSquare } from 'lucide-react';

export function App() {
  const [currentModel, setModel] = useState('gemini-3.5-flash');
  const [activeDocument, setActiveDocument] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  
  // App state
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' | 'chat'
  const [activeActionKey, setActiveActionKey] = useState('summary');
  const [analysisTitle, setAnalysisTitle] = useState('Executive Summary');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setHasApiKey(Boolean(getApiKey()));
  }, []);

  const handleKeyUpdate = () => {
    setHasApiKey(Boolean(getApiKey()));
  };

  // Run AI analysis
  const runAnalysis = async (prompt, title = 'Analysis Result', actionKey = null) => {
    if (!activeDocument) return;

    setActiveActionKey(actionKey);
    setAnalysisTitle(title);
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await callGeminiAPI({
        prompt,
        document: activeDocument,
        model: currentModel
      });

      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || 'An error occurred while calling Google AI Studio API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // When a new document is uploaded or selected
  const handleDocumentParsed = (doc) => {
    setActiveDocument(doc);
    setActiveTab('analysis');
    setAnalysisResult('');
    
    // Automatically trigger Executive Summary for the document
    const defaultPrompt = PRESET_PROMPTS.summary.prompt;
    runAnalysis(defaultPrompt, PRESET_PROMPTS.summary.title, 'summary');
  };

  const handlePresetSelect = (key, promptText) => {
    const title = PRESET_PROMPTS[key]?.title || 'Analysis Result';
    runAnalysis(promptText, title, key);
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;
    runAnalysis(customPrompt, `Query: "${customPrompt.slice(0, 30)}..."`, 'custom');
    setCustomPrompt('');
  };

  return (
    <div className="compact-layout">
      {/* Header Bar */}
      <header className="compact-header">
        <div className="brand-group">
          <div className="mini-logo">
            <FileText size={18} />
          </div>
          <span className="brand-name">DocuMind AI</span>
        </div>
      </header>

      {/* Main Single-Screen Workspace */}
      <main className="compact-main">
        {!activeDocument ? (
          /* Step 1: Upload Document Center Card */
          <div className="upload-screen">
            <FileUpload
              onDocumentParsed={handleDocumentParsed}
              isLoading={isParsingFile}
              setIsLoading={setIsParsingFile}
            />
          </div>
        ) : (
          /* Step 2: Single Screen Workspace */
          <div className="workspace-screen">
            {/* Top Row: Document Header */}
            <DocumentHeader
              document={activeDocument}
              onRemove={() => setActiveDocument(null)}
              onPreviewText={() => setIsPreviewOpen(true)}
            />

            {/* View Switcher Tabs */}
            <div className="mini-tabs">
              <button
                className={`mini-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                <LayoutDashboard size={15} /> Preset Dashboard
              </button>

              <button
                className={`mini-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={15} /> Interactive Chat
              </button>
            </div>

            {/* Dashboard Workspace */}
            {activeTab === 'analysis' && (
              <div className="workspace-grid">
                {/* Left Action Column */}
                <div className="actions-column">
                  <PresetActions
                    onSelectAction={handlePresetSelect}
                    activeActionKey={activeActionKey}
                    isAnalyzing={isAnalyzing}
                    customPrompt={customPrompt}
                    setCustomPrompt={setCustomPrompt}
                    onCustomSubmit={handleCustomSubmit}
                  />
                </div>

                {/* Right Result Output Column */}
                <div className="result-column">
                  <AnalysisViewer
                    resultText={analysisResult}
                    isAnalyzing={isAnalyzing}
                    error={analysisError}
                    onRetry={() => {
                      const currentPrompt = activeActionKey && PRESET_PROMPTS[activeActionKey]
                        ? PRESET_PROMPTS[activeActionKey].prompt
                        : customPrompt || PRESET_PROMPTS.summary.prompt;
                      runAnalysis(currentPrompt, analysisTitle, activeActionKey);
                    }}
                    title={analysisTitle}
                  />
                </div>
              </div>
            )}

            {/* Chat Workspace */}
            {activeTab === 'chat' && (
              <div className="chat-screen-container">
                <ChatSection
                  document={activeDocument}
                  currentModel={currentModel}
                  hasKey={hasApiKey}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={currentModel}
        setModel={setModel}
        onKeyUpdate={handleKeyUpdate}
      />

      <TextPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={activeDocument}
      />
    </div>
  );
}

export default App;
