import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../api/auth';
import quizManager from '../../api/quizManager';
import './CreateQuiz.css';

// Component wrappers (assuming you have these available, or remove if not)
import PageTransition from '../PageTransition.jsx';
import FadeInWhenVisible from '../FadeInWhenVisible.jsx';

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
      <div className="unauthorized-screen">
        <h1 className="pixel-title blink gold-text">[ ERROR ]</h1>
        <p className="pixel-text">Player not recognized. Please insert coin (log in).</p>
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
      setError('Quest Name is required!');
      return;
    }

    const validQuestions = questions.filter(q =>
      q.question.trim() &&
      q.options.every(opt => opt.trim()) &&
      q.correct.trim() &&
      q.explanation.trim()
    );

    if (validQuestions.length === 0) {
      setError('Please forge at least one complete stage (question).');
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
      setError('System Error: ' + err.message);
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    setError(null);

    if (!quizTitle.trim()) {
      setError('Quest Name is required to save progress!');
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
      setError('Save Error: ' + err.message);
      setIsPublishing(false);
    }
  };

  return (
    <PageTransition>
      <FadeInWhenVisible>
        <div className="forge-quest-container">
          
          <div className="forge-header">
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="pixel-btn btn-dark"
            >
              [ ESC ] Return to HQ
            </button>
            <h1 className="pixel-title gold-text mt-2">FORGE NEW QUEST</h1>
          </div>

          {error && <div className="pixel-alert blink">{error}</div>}

          <div className="retro-panel quest-form">
            <div className="form-section setup-section">
              <h2 className="pixel-title-small blue-text">Quest Parameters</h2>

              <div className="pixel-form-group">
                <label>Quest Name *</label>
                <input
                  type="text"
                  placeholder="e.g., The Trial of React Components..."
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="pixel-input"
                />
              </div>

              <div className="pixel-form-group">
                <label>Lore / Briefing (Optional)</label>
                <textarea
                  placeholder="Provide context for this adventure..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="pixel-textarea"
                  rows="3"
                />
              </div>

              <div className="pixel-form-group w-50">
                <label>Threat Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="pixel-select"
                >
                  {/* Keeping underlying values the same so logic doesn't break */}
                  <option value="easy">Lvl 1 - Novice (Easy)</option>
                  <option value="medium">Lvl 2 - Adept (Medium)</option>
                  <option value="hard">Lvl 3 - Expert (Hard)</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h2 className="pixel-title-small green-text">Encounters (Questions)</h2>

              {questions.map((question, index) => (
                <div key={question.id} className="pixel-card question-card">
                  <div className="question-header">
                    <h3>Stage {index + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="pixel-btn-small btn-red"
                      >
                        Delete Stage
                      </button>
                    )}
                  </div>

                  <div className="pixel-form-group">
                    <label>Challenge Description *</label>
                    <textarea
                      placeholder="What trial awaits the player?"
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(index, 'question', e.target.value)
                      }
                      className="pixel-textarea"
                      rows="2"
                    />
                  </div>

                  <div className="options-grid">
                    <label className="full-width">Player Choices *</label>
                    {question.options.map((option, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        placeholder={`Path ${optIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleQuestionChange(index, `option-${optIndex}`, e.target.value)
                        }
                        className="pixel-input option-input"
                      />
                    ))}
                  </div>

                  <div className="pixel-form-group mt-2">
                    <label className="gold-text">Victory Condition (Correct Path) *</label>
                    <select
                      value={question.correct}
                      onChange={(e) =>
                        handleQuestionChange(index, 'correct', e.target.value)
                      }
                      className="pixel-select border-gold"
                    >
                      <option value="">Select the winning path...</option>
                      {question.options.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option || `Path ${optIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pixel-form-group">
                    <label>Wisdom Gained (Explanation) *</label>
                    <textarea
                      placeholder="Why is this the correct path?"
                      value={question.explanation}
                      onChange={(e) =>
                        handleQuestionChange(index, 'explanation', e.target.value)
                      }
                      className="pixel-textarea border-blue"
                      rows="2"
                    />
                  </div>
                </div>
              ))}

              <div className="add-stage-container">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="pixel-btn btn-purple massive-add-btn"
                >
                  + FORGE NEW STAGE
                </button>
              </div>
            </div>

            <div className="form-actions retro-footer-panel">
              <button
                onClick={handleSaveDraft}
                disabled={isPublishing}
                className="pixel-btn btn-dark"
              >
                {isPublishing ? 'SAVING DATA...' : 'SAVE SCROLL (DRAFT)'}
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="pixel-btn btn-green pulse-btn"
              >
                {isPublishing ? 'LAUNCHING...' : '🚀 LAUNCH QUEST'}
              </button>
            </div>

          </div>
        </div>
      </FadeInWhenVisible>
    </PageTransition>
  );
}

export default CreateQuiz;