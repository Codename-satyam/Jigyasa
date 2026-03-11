import React, { useState } from 'react';
import './Page5.css';

// Assuming you have these wrappers from your previous setup
import PageTransition from '../../PageTransition.jsx';
import FadeInWhenVisible from '../../FadeInWhenVisible.jsx';

// MOCK DATA: Replace this with an actual API call to your backend
const initialReviews = [
  {
    id: 1,
    role: 'student',
    name: 'PixelKnight99',
    rating: 5,
    text: "This platform is amazing! The quests (quizzes) actually make learning React feel like leveling up. I finally understand CSS Grid!",
    date: '2026-03-01'
  },
  {
    id: 2,
    role: 'parent',
    name: 'Sarah M.',
    rating: 5,
    text: "My son used to hate extra studying, but the gamified approach keeps him engaged. He actually looks forward to clearing his daily tasks.",
    date: '2026-03-05'
  },
  {
    id: 3,
    role: 'student',
    name: 'CodeWizard',
    rating: 4,
    text: "Great challenges. Some of the boss battles (final exams) are really tough, but the satisfaction of beating them is worth it.",
    date: '2026-03-08'
  },
  {
    id: 4,
    role: 'parent',
    name: 'David L.',
    rating: 4,
    text: "Excellent tracking tools for parents. I can see exactly where my daughter needs help. Would love a few more beginner quests.",
    date: '2026-03-10'
  }
];

function Reviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState('all');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const filteredReviews = reviews.filter(
    (review) => filter === 'all' || review.role === filter
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newReview = {
      id: Date.now(),
      role: 'student', // Defaulting to student for the demo
      name: 'NewPlayer',
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    setNewReviewText('');
    setNewReviewRating(5);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <PageTransition>
      <FadeInWhenVisible>
        <div className="reviews-container">
          <div className="reviews-header">
            <h1 className="pixel-title gold-text">Tavern Notice Board</h1>
            <p className="pixel-subtitle">Read tales from fellow adventurers and their guardians.</p>
          </div>

          <div className="filter-controls">
            <button 
              className={`pixel-btn ${filter === 'all' ? 'btn-blue active-filter' : 'btn-dark'}`}
              onClick={() => setFilter('all')}
            >
              All Scrolls
            </button>
            <button 
              className={`pixel-btn ${filter === 'student' ? 'btn-green active-filter' : 'btn-dark'}`}
              onClick={() => setFilter('student')}
            >
              Player Tales
            </button>
            <button 
              className={`pixel-btn ${filter === 'parent' ? 'btn-purple active-filter' : 'btn-dark'}`}
              onClick={() => setFilter('parent')}
            >
              Guardian Notes
            </button>
          </div>

          <div className="reviews-grid">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rpg-dialogue-box">
                <div className="dialogue-header">
                  <div className="avatar-placeholder">
                    {review.role === 'student' ? '👾' : '🛡️'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{review.name}</span>
                    <span className={`role-badge ${review.role === 'student' ? 'badge-student' : 'badge-parent'}`}>
                      {review.role === 'student' ? 'Player' : 'Guardian'}
                    </span>
                  </div>
                  <div className="star-rating gold-text">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="dialogue-body">
                  <p>"{review.text}"</p>
                </div>
                <div className="dialogue-footer">
                  <small>Logged: {review.date}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="review-submission-area">
            <h2 className="pixel-title">Pin a New Scroll</h2>
            <form onSubmit={handleSubmit} className="retro-form">
              <div className="form-group">
                <label>Quest Rating:</label>
                <select 
                  className="pixel-select" 
                  value={newReviewRating} 
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                >
                  <option value={5}>★★★★★ - Legendary</option>
                  <option value={4}>★★★★☆ - Epic</option>
                  <option value={3}>★★★☆☆ - Rare</option>
                  <option value={2}>★★☆☆☆ - Uncommon</option>
                  <option value={1}>★☆☆☆☆ - Needs Potion</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  className="pixel-textarea"
                  placeholder="Inscribe your tale here..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  rows={4}
                />
              </div>
              <button type="submit" className="pixel-btn btn-orange">
                Post Scroll
              </button>
            </form>
          </div>

        </div>
      </FadeInWhenVisible>
    </PageTransition>
  );
}

export default Reviews;