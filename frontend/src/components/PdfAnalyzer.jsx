import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, FileWarning, Loader, Send, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PdfAnalyzer.css';

// Backend API URL configuration
const API_BASE_URL = 'http://localhost:8000'; // Update this to match your backend server URL

export default function PdfAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzingChat, setIsAnalyzingChat] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Example: 10MB limit
        toast.error('File size exceeds the limit (10MB).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
      setChatHistory([]); // Clear chat history on new file upload
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
     if (file) {
       if (file.size > 10 * 1024 * 1024) { // Example: 10MB limit
        toast.error('File size exceeds the limit (10MB).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
      setChatHistory([]); // Clear chat history on new file upload
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setChatHistory([]);

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      // Updated to use the backend API URL
      const response = await fetch(`${API_BASE_URL}/api/analyze-document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error analyzing document: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis result received:', result); // Added logging
      setAnalysisResult(result);
      toast.success('Document analyzed successfully!');

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis.');
      toast.error(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedFile) {
      return;
    }

    const userMessage = { sender: 'user', text: chatInput };
    // Add the analysis results to the chat history for context if available
    const currentChatHistory = [...chatHistory, userMessage];
    
    // Prepare the analysis result as a string to include in the chat prompt
    let analysisContext = '';
    if (analysisResult) {
        analysisContext += '\n\nDocument Analysis Summary:\n';
        analysisContext += `Summary: ${analysisResult.summary}\n`;
        if (analysisResult.importantValues && analysisResult.importantValues.length > 0) {
            analysisContext += 'Important Values:\n';
            analysisContext += analysisResult.importantValues.map(item => `${item.label}: ${item.value} ${item.unit}`).join('\n') + '\n';
        }
        if (analysisResult.keywords && analysisResult.keywords.length > 0) {
             analysisContext += `Keywords: ${analysisResult.keywords.join(', ')}\n`;
        }
        if (analysisResult.highlightedPoints && analysisResult.highlightedPoints.length > 0) {
             analysisContext += 'Key Information:\n';
             analysisContext += analysisResult.highlightedPoints.map(point => `- ${point}`).join('\n');
        }
         analysisContext += '\n\n';
    }

    setChatHistory(currentChatHistory);
    setChatInput('');
    setIsAnalyzingChat(true);

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('question', chatInput);
    // Append analysis context to the question or use a separate field if backend supports it
    // For simplicity, let's append it to the question for now, or pass as a separate field if the backend chat endpoint is modified.
    // Assuming backend's chat-document endpoint is updated to accept analysis_context:
     formData.append('analysis_context', analysisContext);

    try {
      // Updated to use the backend API URL
      const response = await fetch(`${API_BASE_URL}/api/chat-document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || `Error chatting with document: ${response.statusText}`);
      }

      const result = await response.json();
      const aiMessage = { sender: 'ai', text: result.response };
      setChatHistory((prevHistory) => [...prevHistory, aiMessage]);

    } catch (err) {
      console.error('Chat analysis error:', err);
       const aiErrorMessage = { sender: 'ai', text: err.message || 'An error occurred during chat analysis.', isError: true };
      setChatHistory((prevHistory) => [...prevHistory, aiErrorMessage]);
      toast.error(err.message || 'An error occurred during chat analysis.');
    } finally {
      setIsAnalyzingChat(false);
    }
  };

  const handleDownloadSummary = () => {
    if (analysisResult && analysisResult.summary) {
      const summaryText = `Report Summary:\n${analysisResult.summary}\n\n`
                        + (analysisResult.importantValues && analysisResult.importantValues.length > 0 ? `Important Values:\n${analysisResult.importantValues.map(item => `${item.label}: ${item.value} ${item.unit}`).join('\n')}\n\n` : '')
                        + (analysisResult.keywords && analysisResult.keywords.length > 0 ? `Keywords:\n${analysisResult.keywords.join(', ')}\n\n` : '')
                        + (analysisResult.highlightedPoints && analysisResult.highlightedPoints.length > 0 ? `Key Information:\n${analysisResult.highlightedPoints.map(point => `- ${point}`).join('\n')}` : '');

      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile ? `${selectedFile.name}_summary.txt` : 'summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Summary downloaded!');
    } else {
      toast.info('No analysis result to download.');
    }
  };

  return (
    <motion.div 
      className="pdf-analyzer-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer position="top-right" theme="light" />

      {/* Header Section */}
      <div className="clinical-header">
        <motion.div
          className="scientific-label"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          SCIENTIFIC INTELLIGENCE
        </motion.div>
        
        <motion.h1
          className="clinical-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="clinical-title-regular">CLINICAL </span>
          <span className="clinical-title-italic">DOCUMENT </span>
          <span className="clinical-title-regular">EXTRACTION</span>
        </motion.h1>
        
        <motion.p
          className="clinical-subtitle"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Digitize medical reports and recovery literature for immediate neural mapping and summarization.
        </motion.p>
      </div>

      {/* Two Column Layout */}
      <div className="clinical-grid">
        {/* Left Column - Data Ingestion */}
        <motion.div 
          className="clinical-column"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="column-header">DATA INGESTION</div>
          
          <div className="upload-section-clinical">
            <div 
              className="drop-area-clinical"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <UploadCloud size={48} className="upload-icon-clinical" />
              <div className="upload-label">UPLOAD ARCHIVE</div>
              <div className="upload-restriction">PDF / ENCRYPTED ONLY</div>
              
              <input 
                type="file" 
                id="fileInput" 
                className="file-input" 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
            
            <motion.button
              className="analyze-button-clinical"
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="loading-spinner" />
                  PROCESSING...
                </>
              ) : (
                'INITIATE EXTRACTION'
              )}
            </motion.button>
          </div>

          {/* Operational History */}
          <div className="operational-history">
            <div className="history-header">OPERATIONAL HISTORY</div>
            <div className="history-list">
              {selectedFile ? (
                <div className="history-item">
                  <FileText size={20} className="file-icon" />
                  <div className="file-details">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-meta">Queued for analysis</div>
                  </div>
                </div>
              ) : (
                <div className="history-empty">No active sessions</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Extracted Clinical Insights */}
        <motion.div 
          className="clinical-column"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="column-header">EXTRACTED CLINICAL INSIGHTS</div>
          
          {!analysisResult ? (
            <div className="engine-standby">
              <FileText size={120} className="standby-icon" />
              <div className="standby-text">ENGINE STANDBY</div>
              <div className="standby-subtitle">AWAITING SOURCE MATERIAL INJECTION</div>
            </div>
          ) : (
            <div className="insights-content">
              <div className="analysis-section">
                <h3>REPORT SUMMARY</h3>
                <div className="content">
                  <ReactMarkdown>{analysisResult.summary}</ReactMarkdown>
                </div>
              </div>

              {analysisResult.importantValues && analysisResult.importantValues.length > 0 && (
                <div className="analysis-section">
                  <h3>IMPORTANT VALUES</h3>
                  <div className="content">
                    <ul>
                      {analysisResult.importantValues.map((item, index) => (
                        <li key={index}><strong>{item.label}:</strong> {item.value} {item.unit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                <div className="analysis-section">
                  <h3>KEYWORDS</h3>
                  <div className="content">
                    <p>{analysisResult.keywords.join(', ')}</p>
                  </div>
                </div>
              )}

              {analysisResult.highlightedPoints && analysisResult.highlightedPoints.length > 0 && (
                <div className="analysis-section">
                  <h3>KEY INFORMATION</h3>
                  <div className="content">
                    <ul>
                      {analysisResult.highlightedPoints.map((point, index) => (
                        <li key={index}><ReactMarkdown>{point}</ReactMarkdown></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <motion.button
                className="export-button"
                onClick={handleDownloadSummary}
                disabled={!analysisResult || !analysisResult.summary}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={20} />
                EXPORT ANALYSIS
              </motion.button>

              {/* Chat Section */}
              <div className="chat-section">
                <h4>Interactive Query:</h4>
                <div className="chat-window">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                      <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong>
                      <p>
                        {msg.isError ? (
                          <span className="error-text">{msg.text}</span>
                        ) : (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        )}
                      </p>
                    </div>
                  ))}
                  {isAnalyzingChat && (
                    <div className="chat-message ai">
                      <strong>AI:</strong>
                      <p><Loader size={16} className="loading-spinner" /></p>
                    </div>
                  )}
                </div>
                <div className="chat-input-area">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                    placeholder="Ask a question about the document..."
                    disabled={!selectedFile || isAnalyzingChat}
                  />
                  <motion.button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || !selectedFile || isAnalyzingChat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-message"
            className="error-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <h3>ERROR</h3>
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}