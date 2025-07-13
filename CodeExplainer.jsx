
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import './CodeExplainer.css'; 

const CodeExplainer = () => {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript'); 

  
  const handleCopyClick = (textToCopy, message = "Copied!") => {
    if (document.execCommand) {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        alert(message);
      } catch (err) {
        console.error('Failed to copy text (execCommand fallback): ', err);
        alert('Failed to copy text. Your browser might not support this feature or security restrictions prevent it.');
      } finally {
        document.body.removeChild(textarea);
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert(message);
        })
        .catch(err => {
          console.error('Failed to copy text (navigator.clipboard): ', err);
          alert('Failed to copy text. Please try again.');
        });
    } else {
      alert('Clipboard API not supported in this environment.');
    }
  };

  const explainCode = async () => {
    if (!code.trim()) {
      setError('Please paste some code to explain.');
      return;
    }

    setIsLoading(true);
    setExplanation('');
    setError('');

    try {
      const prompt = `Explain the following ${language} code step-by-step, focusing on its purpose, logic, and any potential improvements or common pitfalls. If it's a bug, explain the bug and suggest a fix. Provide the explanation in clear, concise paragraphs.

Code:
\`\`\`${language}
${code}
\`\`\`
`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "text/plain"
        }
      };

      const apiKey = "AIzaSyBXQuLqTxJ0Ul683OQIDKy-1MIyZJ61Azg"; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('API Code Explainer Result:', result);

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        setExplanation(result.candidates[0].content.parts[0].text);
      } else {
        setError('Failed to explain code. Please try again or try a different code snippet.');
        console.error('Unexpected API response structure for code explainer:', result);
      }
    } catch (err) {
      setError('An error occurred while explaining code. Please check your network connection.');
      console.error('API call error for code explainer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="code-explainer-container">
      <h2 className="explainer-title">AI Code Explainer & Debugger</h2>
      <p className="explainer-description">
        Paste your code below, select the language, and let the AI explain its functionality, identify potential issues, or suggest improvements.
      </p>

      <div className="code-input-section">
        <div className="language-selector">
          <label htmlFor="code-language">Code Language:</label>
          <select id="code-language" value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="java">Java</option>
            <option value="c++">C++</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <textarea
          className="code-textarea"
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows="15"
        ></textarea>
        <button
          onClick={explainCode}
          disabled={isLoading || !code.trim()}
          className="explain-button"
        >
          {isLoading ? (
            <div className="loading-spinner">
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Code...
            </div>
          ) : (
            'Explain & Analyze Code'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <strong className="error-bold">Error:</strong>
          <span className="error-text"> {error}</span>
        </div>
      )}

      {explanation && (
        <div className="code-explanation-output">
          <h3 className="output-title">
            AI Explanation:
            <button onClick={() => handleCopyClick(explanation, 'Explanation copied!')} className="copy-button">📋</button>
          </h3>
          <div className="explanation-content">
            <SyntaxHighlighter language={language} style={dracula} showLineNumbers={true} customStyle={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
              {code}
            </SyntaxHighlighter>
            <p className="explanation-text">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExplainer;
