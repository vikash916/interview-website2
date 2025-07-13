
import React from 'react';
import './SectionPage.css'; 

const SectionPage = ({ title, content }) => {
  return (
    <div className="section-page-container">
      <h2 className="section-page-title">{title}</h2>
      <p className="section-page-description">{content}</p>
     
      <div className="section-page-placeholder">
        <p className="placeholder-text">
          This is where your interview questions for {title.replace(' Interview Questions', '')} will go.
          You can add a list of questions, expand/collapse answers, or even integrate a quiz format.
        </p>
        <div className="example-questions-container">
         
          <div className="example-question-card">
            <h3 className="example-question-title">Question 1: What is the Document Object Model (DOM)?</h3>
            <p className="example-question-text">
              The DOM is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content. The DOM represents the document as nodes and objects.
            </p>
          </div>
          <div className="example-question-card">
            <h3 className="example-question-title">Question 2: Explain the box model in CSS.</h3>
            <p className="example-question-text">
              The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content. It allows us to add a border around elements, and to define space between elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPage;
