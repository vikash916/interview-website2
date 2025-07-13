
import {React} from 'react';
import './HomePage.css'; 
const HomePage = () => {
  return (
    <div className="home-page-container">
      <h2 className="home-page-title">
        Welcome to Your <span className="home-page-title-highlight">Front-End Interview Prep</span> Hub!
      </h2>
      <p className="home-page-description">
        Prepare for your next front-end interview with confidence. Navigate through various topics
        like HTML, CSS, JavaScript, and React to test your knowledge and sharpen your skills.
        You can also use our new AI Question Generator to get tailored questions and receive instant feedback!
      </p>
      <div className="feature-cards-grid">
        {/* Feature Cards */}
        <div className="feature-card blue-card">
          <h3 className="feature-card-title">Comprehensive Questions</h3>
          <p className="feature-card-text">A wide range of questions covering core front-end technologies.</p>
        </div>
        <div className="feature-card green-card">
          <h3 className="feature-card-title">Detailed Explanations</h3>
          <p className="feature-card-text">Understand the 'why' behind the answers with clear explanations.</p>
        </div>
        <div className="feature-card purple-card">
          <h3 className="feature-card-title">Interactive Practice</h3>
          <p className="feature-card-text">Engage with interactive elements to solidify your learning.</p>
        </div>
        <div className="feature-card yellow-card">
          <h3 className="feature-card-title">Responsive Design</h3>
          <p className="feature-card-text">Practice on a site that works seamlessly on all devices.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
