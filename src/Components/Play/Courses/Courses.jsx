import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlay,
  FaStickyNote,
  FaRocket,
  FaBookOpen,
  FaSearch,
  FaBolt,
  FaTrophy
} from "react-icons/fa";
import data from "../Videos/data.js";
import { getSubjectProgress } from "../../../api/progressTracker.js";
import "./Courses.css";

const subjectMeta = {
  maths: { label: "Maths Magic", tone: "blue" },
  generalKnowledge: { label: "General Knowledge", tone: "yellow" },
  socialScience: { label: "Social Science", tone: "purple" },
  science: { label: "Science Lab", tone: "green" },
  english: { label: "English Corner", tone: "red" },
  funActivities: { label: "Fun Activities", tone: "orange" }
};

const notesPacks = [
  { id: "starter", title: "Starter Pack", tags: ["warm-up", "basics"], icon: "🚀" },
  { id: "maths", title: "Maths Mini", tags: ["numbers", "shortcuts"], icon: "📐" },
  { id: "science", title: "Science Snap", tags: ["facts", "why"], icon: "🔬" },
  { id: "english", title: "English Spark", tags: ["grammar", "words"], icon: "📚" }
];

function getYouTubeId(embed) {
  if (!embed) return null;
  const match = embed.match(/embed\/([\w-]{11})/);
  return match ? match[1] : null;
}

function Courses() {
  const subjects = useMemo(() => Object.keys(data), []);
  const [progress, setProgress] = useState({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    const progressData = {};
    subjects.forEach((subject) => {
      const topicsData = data[subject] || [];
      progressData[subject] = getSubjectProgress(subject, topicsData.length, topicsData);
    });
    setProgress(progressData);
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return subjects;
    return subjects.filter((subject) => {
      const label = subjectMeta[subject]?.label || subject;
      return subject.toLowerCase().includes(trimmed) || label.toLowerCase().includes(trimmed);
    });
  }, [query, subjects]);

  return (
    <div className="courses-wrapper">
      {/* Hero Section */}
      <header className="arcade-hero">
        <div className="hero-content">
          <div className="badge pulse"><FaRocket /> Welcome to the Arcade</div>
          <h1 className="hero-title">Your Learning <span>Playground</span></h1>
          <p className="hero-subtitle">
            Pick a subject, press play, and level up your brain. Everything you need for epic video lessons and bite-sized notes is right here.
          </p>
          
          <div className="hero-stats-row">
            <div className="stat-pill"><FaBookOpen /> {subjects.length} Subjects</div>
            <div className="stat-pill"><FaPlay /> {subjects.reduce((t, s) => t + (data[s]?.length || 0), 0)} Videos</div>
            <div className="stat-pill"><FaStickyNote /> {notesPacks.length} Note Packs</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="courses-main">
        {/* Video Arcade Section */}
        <section id="videos" className="content-section">
          <div className="section-header">
            <div className="header-titles">
              <h2><FaBolt /> Video Arcade</h2>
              <p>Select a subject to dive into the video lectures.</p>
            </div>
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Find a subject..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bento-grid">
            {filteredSubjects.map((subject) => {
              const meta = subjectMeta[subject] || { label: subject, tone: "blue" };
              const lessons = data[subject] || [];
              const thumbId = getYouTubeId(lessons[0]?.embed);
              const progressInfo = progress[subject];
              const pct = progressInfo?.percentage || 0;

              return (
                <div key={subject} className={`bento-card theme-${meta.tone}`}>
                  <div className="card-image-wrapper">
                    {thumbId ? (
                      <img
                        className="card-thumb"
                        src={`https://img.youtube.com/vi/${thumbId}/hqdefault.jpg`}
                        alt={meta.label}
                      />
                    ) : (
                      <div className="card-thumb-placeholder">Coming Soon</div>
                    )}
                    <div className="lesson-badge">{lessons.length} Lessons</div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{meta.label}</h3>
                    
                    <div className="progress-container">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <Link className="btn btn-primary" to={`/videos/subject/${subject}`}>
                        <FaPlay /> Watch
                      </Link>
                      <Link className="btn btn-icon" to="/notes" aria-label="Notes">
                        <FaStickyNote />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="empty-state-box">
              <FaSearch className="empty-icon" />
              <h3>No subjects found</h3>
              <p>We couldn't find anything matching "{query}". Try another search!</p>
            </div>
          )}
        </section>

        {/* Notes Studio Section */}
        <section id="notes" className="content-section">
          <div className="section-header">
            <div className="header-titles">
              <h2><FaStickyNote /> Notes Studio</h2>
              <p>Quick review cards to boost your memory.</p>
            </div>
            <Link className="btn btn-outline" to="/notes">View All Notes</Link>
          </div>

          <div className="notes-bento-grid">
            {notesPacks.map((pack) => (
              <div key={pack.id} className="note-pack-card">
                <div className="note-icon">{pack.icon}</div>
                <h4 className="note-title">{pack.title}</h4>
                <div className="note-tags">
                  {pack.tags.map((tag) => (
                    <span key={tag} className="chip">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bonus Combo Banner */}
        <section className="combo-banner">
          <div className="combo-content">
            <FaTrophy className="combo-icon" />
            <div>
              <h3>Mastery Combo Strategy</h3>
              <p>Watch a video lesson, then immediately read the matching notes for maximum retention!</p>
            </div>
          </div>
          <div className="combo-actions">
            <Link className="btn btn-light" to="/videos">Go to Videos</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Courses;