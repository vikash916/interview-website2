// // App.jsx
// import React, { useState } from 'react';
// import HomePage from './components/HomePage.jsx';
// import SectionPage from './components/SectionPage.jsx';
// import QuestionGenerator from './components/QuestionGenerator.jsx';
// import './App.css'; // Correct: Import App's specific CSS

// // Main App component
// const App = () => {
//   const [activeSection, setActiveSection] = useState('home');

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'home':
//         return <HomePage />;
//       case 'html':
//         return <SectionPage title="HTML Interview Questions" content="Questions related to HTML concepts." />;
//       case 'css':
//         return <SectionPage title="CSS Interview Questions" content="Questions related to CSS concepts." />;
//       case 'javascript':
//         return <SectionPage title="JavaScript Interview Questions" content="Questions related to JavaScript concepts." />;
//       case 'react':
//         return <SectionPage title="React Interview Questions" content="Questions related to React concepts." />;
//       case 'generate':
//         return <QuestionGenerator />;
//       default:
//         return <HomePage />;
//     }
//   };

//   return (
//     <div className="app-container">
      
//       <nav className="navbar">
//         <div className="navbar-content">
//           <h1 className="navbar-title">
//             Front-End Interview Prep
//           </h1>
//           <ul className="navbar-links">
//             <li>
//               <button
//                 onClick={() => setActiveSection('home')}
//                 className={`nav-button ${activeSection === 'home' ? 'active' : ''}`}
//               >
//                 Home
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveSection('html')}
//                 className={`nav-button ${activeSection === 'html' ? 'active' : ''}`}
//               >
//                 HTML
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveSection('css')}
//                 className={`nav-button ${activeSection === 'css' ? 'active' : ''}`}
//               >
//                 CSS
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveSection('javascript')}
//                 className={`nav-button ${activeSection === 'javascript' ? 'active' : ''}`}
//               >
//                 JavaScript
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveSection('react')}
//                 className={`nav-button ${activeSection === 'react' ? 'active' : ''}`}
//               >
//                 React
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveSection('generate')}
//                 className={`nav-button ${activeSection === 'generate' ? 'active' : ''}`}
//               >
//                 AI Question Generator
//               </button>
//             </li>
//           </ul>
//         </div>
//       </nav>

//       {/* Main Content Area */}
//       <main className="main-content-area">
//         <div className="main-content-card">
//           {renderContent()}
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="footer">
//         <p>&copy; {new Date().getFullYear()} Front-End Interview Prep. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default App;
// App.jsx
import React, { useState } from 'react';
import HomePage from './components/HomePage.jsx';
import SectionPage from './components/SectionPage.jsx';
import QuestionGenerator from './components/QuestionGenerator.jsx';
import CodeExplainer from './components/CodeExplainer.jsx'; // Import the new CodeExplainer component
import './App.css'; // Import App's specific CSS

// Main App component
const App = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'html':
        return <SectionPage title="HTML Interview Questions" content="Questions related to HTML concepts." />;
      case 'css':
        return <SectionPage title="CSS Interview Questions" content="Questions related to CSS concepts." />;
      case 'javascript':
        return <SectionPage title="JavaScript Interview Questions" content="Questions related to JavaScript concepts." />;
      case 'react':
        return <SectionPage title="React Interview Questions" content="Questions related to React concepts." />;
      case 'generate':
        return <QuestionGenerator />;
      case 'code-explainer': // New case for Code Explainer
        return <CodeExplainer />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">
            Front-End Interview Prep
          </h1>
          <ul className="navbar-links">
            <li>
              <button
                onClick={() => setActiveSection('home')}
                className={`nav-button ${activeSection === 'home' ? 'active' : ''}`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('html')}
                className={`nav-button ${activeSection === 'html' ? 'active' : ''}`}
              >
                HTML
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('css')}
                className={`nav-button ${activeSection === 'css' ? 'active' : ''}`}
              >
                CSS
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('javascript')}
                className={`nav-button ${activeSection === 'javascript' ? 'active' : ''}`}
              >
                JavaScript
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('react')}
                className={`nav-button ${activeSection === 'react' ? 'active' : ''}`}
              >
                React
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('generate')}
                className={`nav-button ${activeSection === 'generate' ? 'active' : ''}`}
              >
                AI Question Generator
              </button>
            </li>
            <li> {/* New Navigation Button */}
              <button
                onClick={() => setActiveSection('code-explainer')}
                className={`nav-button ${activeSection === 'code-explainer' ? 'active' : ''}`}
              >
                Code Explainer
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content-area">
        <div className="main-content-card">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Front-End Interview Prep. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
