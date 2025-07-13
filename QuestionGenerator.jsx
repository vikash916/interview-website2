
import React, { useState } from 'react';
import './QuestionGenerator.css'

const QuestionGenerator = () => {
  const [jobCategory, setJobCategory] = useState('');
  // Stores { type: 'open-ended' | 'mcq', question: string, options?: string[], correctAnswer?: string, userAnswer: string, feedback: string, score: number, isReviewing: boolean, modelAnswer: string, isLoadingModelAnswer: boolean, showModelAnswer: boolean, isFeedbackExpanded: boolean }
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState({}); // Tracks loading state per question for review
  const [error, setError] = useState('');
  const [overallSummary, setOverallSummary] = useState(''); // New: Stores overall AI summary
  const [isLoadingSummary, setIsLoadingSummary] = useState(false); // New: Loading state for overall summary

  // Expanded list of common job categories for quick selection
  const commonJobCategories = [
    "Web Developer",
    "Front-End Developer",
    "React Developer",
    "Angular Developer",
    "Vue.js Developer",
    "Full-Stack Developer (Front-End Focus)",
    "UI/UX Developer",
    "JavaScript Developer",
    "Senior Front-End Engineer",
    "Associate Front-End Developer",
    "Front-End Architect",
    "Mobile Front-End Developer",
    "E-commerce Front-End Developer",
    "WordPress Front-End Developer",
    "Shopify Front-End Developer",
    "Svelte Developer",
    "Next.js Developer",
    "TypeScript Front-End Developer"
  ];

  // Function to generate questions
  const generateQuestions = async (category = jobCategory) => {
    if (!category.trim()) {
      setError('Please enter a job category or select from the quick options.');
      return;
    }

    setIsLoadingQuestions(true);
    setGeneratedQuestions([]); // Clear previous questions
    setOverallSummary(''); // Clear previous summary
    setError('');

    try {
      // Prompt to get 5 open-ended and 5 MCQ questions
      const prompt = `Generate 5 common front-end interview questions for a "${category}" role (open-ended type), and 5 multiple-choice questions (MCQs) for the same role. For MCQs, provide 4 distinct options and indicate the correct answer. Provide the output as a JSON array where each object has a 'type' property ('open-ended' or 'mcq'). If 'open-ended', include a 'question' property. If 'mcq', include 'question', 'options' (array of strings), and 'correctAnswer' (string, one of the options).`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "type": { "type": "STRING", "enum": ["open-ended", "mcq"] },
                "question": { "type": "STRING" },
                "options": { // Made optional by default, model will populate if type is 'mcq'
                  "type": "ARRAY",
                  "items": { "type": "STRING" }
                },
                "correctAnswer": { "type": "STRING" } // Made optional by default
              },
              "required": ["type", "question"] // Only type and question are strictly required for all items
            }
          }
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
      console.log('API Raw Result:', result); // Log the raw result for debugging

      // Check for a top-level error property in the result
      if (result.error) {
        setError(`API Error: ${result.error.message || 'Unknown error'}`);
        console.error('API Error Details:', result.error);
        return; // Exit function if there's an API error
      }

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        console.log('API JSON String:', json); // Log the JSON string
        const parsedJson = JSON.parse(json);
        console.log('Parsed JSON:', parsedJson); // Log the parsed JSON

        // Initialize each question with empty userAnswer, feedback, score, and not reviewing
        const questionsWithInitialState = parsedJson.map(q => ({
          ...q,
          userAnswer: '', // For MCQs, this will store the selected option string
          feedback: '',
          score: null,
          isReviewing: false,
          modelAnswer: '', // New: Stores the model answer
          isLoadingModelAnswer: false, // New: Loading state for model answer
          showModelAnswer: false, // New: Toggle visibility for model answer
          isFeedbackExpanded: false // New: Toggle visibility for feedback
        }));
        setGeneratedQuestions(questionsWithInitialState);
      } else {
        setError('Failed to generate questions. Please try again. Unexpected API response structure.');
        console.error('Unexpected API response structure:', result);
      }
    } catch (err) {
      setError('An error occurred while generating questions. Please check your network connection or try again later.');
      console.error('API call error:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Function to review a user's answer
  const reviewAnswer = async (index) => {
    const questionToReview = generatedQuestions[index];
    if (!questionToReview.userAnswer.trim()) {
      setError('Please provide an answer before reviewing.');
      return;
    }

    setIsLoadingReview(prev => ({ ...prev, [index]: true }));
    setError(''); // Clear general error

    try {
      let prompt;
      if (questionToReview.type === 'open-ended') {
        prompt = `Given the interview question: "${questionToReview.question}" and the user's answer: "${questionToReview.userAnswer}". Evaluate the user's answer. Provide concise feedback on its accuracy, completeness, and clarity. Then, give a score from 1 to 10 for the possibility of getting selected based on this answer (1 being very low, 10 being excellent). Provide the output as a JSON object with "feedback" (string) and "score" (number) properties.`;
      } else if (questionToReview.type === 'mcq') {
        // For MCQs, the AI should primarily check if the selected option is correct
        prompt = `Given the multiple-choice question: "${questionToReview.question}", the correct answer is "${questionToReview.correctAnswer}", and the user selected: "${questionToReview.userAnswer}". Evaluate if the user's selection is correct. Provide concise feedback on their choice. Then, give a score from 1 to 10 for the possibility of getting selected based on this answer (1 being very low, 10 being excellent). Provide the output as a JSON object with "feedback" (string) and "score" (number) properties.`;
      } else {
        setError('Unknown question type for review.');
        setIsLoadingReview(prev => ({ ...prev, [index]: false }));
        return;
      }

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "feedback": { "type": "STRING" },
              "score": { "type": "NUMBER" }
            },
            "propertyOrdering": ["feedback", "score"]
          }
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
      console.log('API Review Result:', result); // Log the raw review result for debugging

      if (result.error) {
        setError(`API Error during review: ${result.error.message || 'Unknown error'}`);
        console.error('API Review Error Details:', result.error);
        return; // Exit function if there's an API error
      }

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        console.log('API Review JSON String:', json); // Log the review JSON string
        const parsedJson = JSON.parse(json);
        console.log('Parsed Review JSON:', parsedJson); // Log the parsed review JSON

        // Update the specific question's state with feedback and score
        setGeneratedQuestions(prevQuestions =>
          prevQuestions.map((q, i) =>
            i === index
              ? { ...q, feedback: parsedJson.feedback, score: parsedJson.score, isFeedbackExpanded: true } // Expand feedback by default
              : q
          )
        );
      } else {
        setError('Failed to get review feedback. Please try again. Unexpected API response structure.');
        console.error('Unexpected API response structure for review:', result);
      }
    } catch (err) {
      setError('An error occurred during review. Please check your network connection or try again later.');
      console.error('API call error for review:', err);
    } finally {
      setIsLoadingReview(prev => ({ ...prev, [index]: false }));
    }
  };

  
  const generateModelAnswer = async (index) => {
   
    if (generatedQuestions[index].modelAnswer) { // Check if modelAnswer exists
      setGeneratedQuestions(prevQuestions =>
        prevQuestions.map((q, i) =>
          i === index ? { ...q, showModelAnswer: !q.showModelAnswer } : q // Toggle visibility
        )
      );
      return;
    }
    
    // If not loaded, load it
    setIsLoadingReview(prev => ({ ...prev, [index]: true })); // Use review loading for model answer too
    setError('');

    try {
      const question = generatedQuestions[index].question;
      const prompt = `Provide a concise and comprehensive model answer for the front-end interview question: "${question}".`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "text/plain" // We expect plain text for the model answer
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
      console.log('API Model Answer Result:', result);

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const modelAnswerText = result.candidates[0].content.parts[0].text;
        setGeneratedQuestions(prevQuestions =>
          prevQuestions.map((q, i) =>
            i === index
              ? { ...q, modelAnswer: modelAnswerText, showModelAnswer: true }
              : q
          )
        );
      } else {
        setError('Failed to generate model answer. Please try again.');
        console.error('Unexpected API response structure for model answer:', result);
      }
    } catch (err) {
      setError('An error occurred while generating model answer. Please check your network connection.');
      console.error('API call error for model answer:', err);
    } finally {
      setIsLoadingReview(prev => ({ ...prev, [index]: false }));
    }
  };


  // Handler for quick select buttons
  const handleQuickSelect = (category) => {
    setJobCategory(category); // Set the input field to the selected category
    generateQuestions(category); // Generate questions for the selected category
  };

  // Handler for user answer input change (for both open-ended and MCQ)
  const handleUserAnswerChange = (index, value) => {
    setGeneratedQuestions(prevQuestions =>
      prevQuestions.map((q, i) =>
        i === index ? { ...q, userAnswer: value, feedback: '', score: null, showModelAnswer: false, modelAnswer: '', isFeedbackExpanded: false } : q // Clear feedback/score/model answer on new input
      )
    );
  };

  // Function to clear the entire session
  const clearSession = () => {
    setJobCategory('');
    setGeneratedQuestions([]);
    setIsLoadingQuestions(false);
    setIsLoadingReview({});
    setError('');
    setOverallSummary('');
    setIsLoadingSummary(false);
  };

  // Function to delete an individual question
  const deleteQuestion = (indexToDelete) => {
    setGeneratedQuestions(prevQuestions =>
      prevQuestions.filter((_, index) => index !== indexToDelete)
    );
    // Also clear overall summary if questions are removed
    setOverallSummary('');
  };

  // Calculate answered questions for progress indicator
  const answeredQuestionsCount = generatedQuestions.filter(q => q.userAnswer.trim() !== '').length;
  const reviewedQuestionsCount = generatedQuestions.filter(q => q.feedback.trim() !== '').length;

  // Check if all questions are reviewed to show overall summary button
  const allQuestionsReviewed = generatedQuestions.length > 0 && reviewedQuestionsCount === generatedQuestions.length;

  // Function to generate overall session summary
  const generateOverallSummary = async () => {
    setIsLoadingSummary(true);
    setError('');
    try {
      const sessionDetails = generatedQuestions.map((q, index) => ({
        question: q.question,
        userAnswer: q.userAnswer,
        feedback: q.feedback,
        score: q.score,
        type: q.type
      }));

      const averageScore = (generatedQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / generatedQuestions.length).toFixed(1);

      const prompt = `Based on the following front-end interview session details (questions, user answers, and individual AI feedback/scores), provide an overall summary of the candidate's performance. Highlight strengths, areas for improvement, and give a final overall impression. The average score for the session was ${averageScore}/10.

      Session Details:
      ${JSON.stringify(sessionDetails, null, 2)}
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
      console.log('API Overall Summary Result:', result);

      if (result.error) {
        setError(`API Error during summary generation: ${result.error.message || 'Unknown error'}`);
        console.error('API Summary Error Details:', result.error);
        return;
      }

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        setOverallSummary(result.candidates[0].content.parts[0].text);
      } else {
        setError('Failed to generate overall summary. Please try again.');
        console.error('Unexpected API response structure for overall summary:', result);
      }
    } catch (err) {
      setError('An error occurred while generating overall summary. Please check your network connection.');
      console.error('API call error for overall summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Function to copy text to clipboard
  const handleCopyClick = (textToCopy, message = "Copied!") => {
    if (document.execCommand) { // Fallback for environments where navigator.clipboard might not work (like iframes)
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      textarea.style.left = '-9999px'; // Hide it
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        alert(message); // Using alert as per instructions for iFrame compatibility
      } catch (err) {
        console.error('Failed to copy text (execCommand fallback): ', err);
        alert('Failed to copy text. Your browser might not support this feature or security restrictions prevent it.');
      } finally {
        document.body.removeChild(textarea);
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert(message); // Using alert as per instructions for iFrame compatibility
        })
        .catch(err => {
          console.error('Failed to copy text (navigator.clipboard): ', err);
          alert('Failed to copy text. Please try again.');
        });
    } else {
      alert('Clipboard API not supported in this environment.');
    }
  };


  // Toggle feedback visibility
  const toggleFeedbackVisibility = (index) => {
    setGeneratedQuestions(prevQuestions =>
      prevQuestions.map((q, i) =>
        i === index ? { ...q, isFeedbackExpanded: !q.isFeedbackExpanded } : q
      )
    );
  };


  return (
    <div className="question-generator-container">
      <h2 className="generator-title">AI Interview Coach</h2>
      <p className="generator-description">
        Enter a job category or select from the quick options below to generate a mix of open-ended and multiple-choice interview questions.
        Then, provide your answers and get instant AI feedback and a score!
      </p>

      {/* Quick Select Buttons */}
      <div className="quick-select-section">
        <h3 className="quick-select-title">Quick Select Job Categories:</h3>
        <div className="quick-select-buttons">
          {commonJobCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleQuickSelect(category)}
              className="quick-select-button"
              disabled={isLoadingQuestions}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="input-generate-section">
        <input
          type="text"
          value={jobCategory}
          onChange={(e) => setJobCategory(e.target.value)}
          placeholder="Or type your custom job category here..."
          className="job-category-input"
        />
        <button
          onClick={() => generateQuestions()}
          disabled={isLoadingQuestions}
          className="generate-new-questions-button" // Renamed class
        >
          {isLoadingQuestions ? (
            <div className="loading-spinner">
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Questions...
            </div>
          ) : (
            'Generate New Questions' // Renamed text
          )}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <strong className="error-bold">Error:</strong>
          <span className="error-text"> {error}</span>
        </div>
      )}

      {generatedQuestions.length > 0 && (
        <div className="interview-session-container">
          <h3 className="session-title">
            Your Interview Session
            <span className="session-progress">
              ({reviewedQuestionsCount}/{generatedQuestions.length} Reviewed)
            </span>
          </h3>
          <div className="session-control-buttons"> {/* New container for session buttons */}
            <button onClick={clearSession} className="clear-session-button">
              Clear Session
            </button>
            <button
              onClick={() => generateQuestions()} // This button also generates new questions
              disabled={isLoadingQuestions}
              className="generate-more-questions-button" // New button for "more questions"
            >
              {isLoadingQuestions ? (
                <div className="loading-spinner-small">
                  <svg className="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                'Generate More Questions'
              )}
            </button>
          </div>
          <div className="questions-list">
            {generatedQuestions.map((qa, index) => (
              <div key={index} className="question-card">
                <button onClick={() => deleteQuestion(index)} className="delete-question-button" title="Delete this question">✖</button> {/* Delete button */}
                <h4 className="question-text">
                  Question {index + 1}: {qa.question}
                  <button onClick={() => handleCopyClick(qa.question, 'Question copied!')} className="copy-button">📋</button>
                </h4>

                {/* Conditional rendering for answer input based on question type */}
                {qa.type === 'open-ended' ? (
                  <textarea
                    className="answer-textarea"
                    placeholder="Type your answer here..."
                    value={qa.userAnswer}
                    onChange={(e) => handleUserAnswerChange(index, e.target.value)}
                    rows="5"
                  ></textarea>
                ) : (
                  <div className="mcq-options-container">
                    {qa.options && qa.options.map((option, optIndex) => (
                      <label key={optIndex} className="mcq-option-label">
                        <input
                          type="radio"
                          name={`question-${index}`} // Group radio buttons by question
                          value={option}
                          checked={qa.userAnswer === option}
                          onChange={(e) => handleUserAnswerChange(index, e.target.value)}
                          className="mcq-radio-input"
                        />
                        <span className="mcq-option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {qa.userAnswer.trim() && (
                  <div className="user-answer-display">
                    <p>Your Answer: {qa.userAnswer}</p>
                    <button onClick={() => handleCopyClick(qa.userAnswer, 'Your answer copied!')} className="copy-button">📋</button>
                  </div>
                )}


                <div className="question-actions">
                  <button
                    onClick={() => reviewAnswer(index)}
                    disabled={isLoadingReview[index] || !qa.userAnswer.trim()}
                    className="review-button"
                  >
                    {isLoadingReview[index] && !qa.showModelAnswer ? ( // Only show spinner if reviewing and not already showing model answer
                      <div className="loading-spinner-small">
                        <svg className="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Reviewing...
                      </div>
                    ) : (
                      'Review Answer'
                    )}
                  </button>

                  {qa.feedback && ( // Only show model answer button if feedback is available
                    <button
                      onClick={() => generateModelAnswer(index)}
                      disabled={isLoadingReview[index] && qa.showModelAnswer === false} // Disable if another action is loading
                      className="model-answer-button"
                    >
                      {isLoadingReview[index] && qa.showModelAnswer === false ? ( // Only show spinner if generating AND not already showing
                        <div className="loading-spinner-small">
                          <svg className="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting Model Answer...
                        </div>
                      ) : (
                        qa.showModelAnswer ? 'Hide Model Answer' : 'Show Model Answer'
                      )}
                    </button>
                  )}
                </div>


                {qa.feedback && (
                  <div className="feedback-section">
                    <h5 className="feedback-title" onClick={() => toggleFeedbackVisibility(index)}>
                      AI Feedback: {qa.isFeedbackExpanded ? '▲' : '▼'}
                      <button onClick={(e) => { e.stopPropagation(); handleCopyClick(qa.feedback, 'Feedback copied!'); }} className="copy-button">📋</button>
                    </h5>
                    {qa.isFeedbackExpanded && (
                      <>
                        <p className="feedback-text">{qa.feedback}</p>
                        {qa.score !== null && (
                          <p className="feedback-score">
                            Possibility of getting selected: <span className="score-value">{qa.score}/10</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {qa.showModelAnswer && qa.modelAnswer && (
                  <div className="model-answer-card">
                    <h5 className="model-answer-title">
                      Model Answer:
                      <button onClick={() => handleCopyClick(qa.modelAnswer, 'Model answer copied!')} className="copy-button">📋</button>
                    </h5>
                    <p className="model-answer-text">{qa.modelAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {allQuestionsReviewed && (
            <div className="overall-summary-section">
              <button
                onClick={generateOverallSummary}
                disabled={isLoadingSummary}
                className="generate-summary-button"
              >
                {isLoadingSummary ? (
                  <div className="loading-spinner-small">
                    <svg className="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Summary...
                  </div>
                ) : (
                  'Generate Overall Session Summary'
                )}
              </button>

              {overallSummary && (
                <div className="overall-summary-card">
                  <h4 className="overall-summary-title">
                    Overall Session Summary
                    <button onClick={() => handleCopyClick(overallSummary, 'Summary copied!')} className="copy-button">📋</button>
                  </h4>
                  <p className="overall-summary-text">{overallSummary}</p>
                  <p className="overall-average-score">
                    Average Score: <span className="score-value">{(generatedQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / generatedQuestions.length).toFixed(1)}/10</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator;
