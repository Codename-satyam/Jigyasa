import React, { useState } from 'react';
import './Page5.css';

// MOCK DATA
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
  },
  {
    id: 5,
    role: 'student',
    name: 'ShadowCoder',
    rating: 5,
    text: "The leveling system is addictive! Every completed quiz feels like unlocking a new achievement. Learning JavaScript has never been this fun.",
    date: '2026-03-11'
  },
  {
    id: 6,
    role: 'parent',
    name: 'Anita Sharma',
    rating: 5,
    text: "This platform has completely changed how my child approaches learning. The game-like experience motivates them to study daily.",
    date: '2026-03-12'
  },
  {
    id: 7,
    role: 'student',
    name: 'BugHunter',
    rating: 4,
    text: "I like the quest-based learning structure. The UI feels like a retro game dashboard which makes the experience unique.",
    date: '2026-03-13'
  },
  {
    id: 8,
    role: 'student',
    name: 'AlgoNinja',
    rating: 5,
    text: "The boss battle quizzes are intense! They really test everything you've learned. Definitely one of the most creative learning platforms.",
    date: '2026-03-14'
  },
  {
    id: 9,
    role: 'parent',
    name: 'Rahul Verma',
    rating: 4,
    text: "I appreciate the progress reports and insights. It helps me understand my child's strengths and weaknesses in different subjects.",
    date: '2026-03-15'
  },
  {
    id: 10,
    role: 'student',
    name: 'NeonDev',
    rating: 5,
    text: "The leaderboard makes it super competitive in a good way. Competing with friends to reach the top keeps us learning more.",
    date: '2026-03-16'
  },
  {
    id: 11,
    role: 'student',
    name: 'SyntaxSamurai',
    rating: 4,
    text: "Very cool platform. The quests are well designed and the hints system helps when you're stuck.",
    date: '2026-03-17'
  },
  {
    id: 12,
    role: 'parent',
    name: 'Priya N.',
    rating: 5,
    text: "My daughter spends time learning instead of just playing games. This app blends both worlds perfectly.",
    date: '2026-03-18'
  }
];

function Reviews() {
  const [reviews] = useState(initialReviews);
  const [filter, setFilter] = useState('all');

  const filteredReviews = reviews.filter(
    (review) => filter === 'all' || review.role === filter
  );

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header text-center">
        <h1 className="pixel-title gold-text blink-slow">TAVERN NOTICE BOARD</h1>
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

      {/* INFINITE SCROLLING MARQUEE */}
      <div className="marquee-viewport">
        <div className="marquee-track">
          {/* Duplicating the array to create a seamless infinite loop */}
          {[...filteredReviews, ...filteredReviews].map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className={`rpg-dialogue-box float-delay-${index % 4}`}
            >
              <div className="dialogue-header">
                <div className={`avatar-placeholder ${review.role === 'student' ? 'border-green' : 'border-purple'}`}>
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
                <small className="blue-text">Logged: {review.date}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reviews;