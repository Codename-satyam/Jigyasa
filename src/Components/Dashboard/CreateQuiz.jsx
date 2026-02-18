import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../api/auth';
import quizManager from '../../api/quizManager';
import './CreateQuiz.css';

function CreateQuiz() {
  const navigate = useNavigate();
  const current = auth.getCurrentUser();

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correct: '', explanation: '' }
  ]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Conditional render AFTER hooks
  if (!current) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#fff',
          flexDirection: 'column'
        }}
      >
        <h1>Please log in first</h1>
      </div>
    );
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i !== index) return q;

      if (field === 'question' || field === 'correct' || field === 'explanation') {
        return { ...q, [field]: value };
      } else if (field.startsWith('option-')) {
        const optionIndex = parseInt(field.split('-')[1]);
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });

    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id), 0) + 1;
    setQuestions([
      ...questions,
      { id: newId, question: '', options: ['', '', '', ''], correct: '', explanation: '' }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handlePublish = () => {
    setError(null);

    if (!quizTitle.trim()) {
      setError('Quiz title is required');
      return;
    }

    const validQuestions = questions.filter(q =>
      q.question.trim() &&
      q.options.every(opt => opt.trim()) &&
      q.correct.trim() &&
      q.explanation.trim()
    );

    if (validQuestions.length === 0) {
      setError('Please fill in at least one complete question');
      return;
    }

    try {
      setIsPublishing(true);

      const quiz = quizManager.createQuiz({
        title: quizTitle,
        description: quizDescription,
        questions: validQuestions,
        createdBy: current.id,
        createdByName: current.name,
        difficulty
      });

      quizManager.publishQuiz(quiz.id, true);

      setTimeout(() => {
        setIsPublishing(false);
        navigate('/teacher-dashboard');
      }, 500);

    } catch (err) {
      setError('Error creating quiz: ' + err.message);
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    setError(null);

    if (!quizTitle.trim()) {
      setError('Quiz title is required');
      return;
    }

    try {
      setIsPublishing(true);

      quizManager.createQuiz({
        title: quizTitle,
        description: quizDescription,
        questions: questions.filter(q => q.question.trim()),
        createdBy: current.id,
        createdByName: current.name,
        difficulty,
        isPublished: false
      });

      setTimeout(() => {
        setIsPublishing(false);
        navigate('/teacher-dashboard');
      }, 500);

    } catch (err) {
      setError('Error saving draft: ' + err.message);
      setIsPublishing(false);
    }
  };

  return (
    <div className="create-quiz-container">
      <div className="create-quiz-header">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="back-btn"
        >
          ← Back
        </button>
        <h1>Create New Quiz</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="quiz-form">
        <div className="form-section">
          <h2>Quiz Details</h2>

          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              placeholder="Enter quiz title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Enter quiz description (optional)"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="form-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Questions</h2>

          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <h3>Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(index, 'question', e.target.value)
                  }
                  className="form-textarea"
                  rows="2"
                />
              </div>

              <div className="options-section">
                <label>Options *</label>
                {question.options.map((option, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleQuestionChange(index, `option-${optIndex}`, e.target.value)
                    }
                    className="form-input"
                  />
                ))}
              </div>

              <div className="form-group">
                <label>Correct Answer *</label>
                <select
                  value={question.correct}
                  onChange={(e) =>
                    handleQuestionChange(index, 'correct', e.target.value)
                  }
                  className="form-select"
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((option, optIndex) => (
                    <option key={optIndex} value={option}>
                      {option || `Option ${optIndex + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Explanation *</label>
                <textarea
                  placeholder="Explain why this answer is correct"
                  value={question.explanation}
                  onChange={(e) =>
                    handleQuestionChange(index, 'explanation', e.target.value)
                  }
                  className="form-textarea"
                  rows="2"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="add-question-btn"
          >
            + Add Question
          </button>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSaveDraft}
            disabled={isPublishing}
            className="draft-btn"
          >
            {isPublishing ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="publish-btn"
          >
            {isPublishing ? 'Publishing...' : '✅ Publish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
