import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlay,
  FaStickyNote,
  FaRocket,
  FaBookOpen,
  FaSearch
} from "react-icons/fa";
import data from "../Videos/data.js";
import { getSubjectProgress } from "../../../api/progressTracker.js";
import "./Courses.css";

const subjectMeta = {
  maths: { label: "Maths Magic", tone: "mint" },
  generalKnowledge: { label: "General Knowledge", tone: "sun" },
  socialScience: { label: "Social Science", tone: "sky" },
  science: { label: "Science Lab", tone: "coral" },
  english: { label: "English Corner", tone: "berry" },
  funActivities: { label: "Fun Activities", tone: "lime" }
};

const notesPacks = [
  {
    id: "starter",
    title: "Starter Pack Notes",
    tags: ["warm-up", "quick tips", "basics"],
    items: ["Daily study rhythm", "Quick recall tricks", "Mini practice plan"]
  },
  {
    id: "maths",
    title: "Maths Mini Notes",
    tags: ["numbers", "patterns", "shortcuts"],
    items: ["Addition ladder", "Times table map", "Fraction bites"]
  },
  {
    id: "science",
    title: "Science Snap Notes",
    tags: ["experiments", "facts", "why"],
    items: ["Water cycle sketch", "Plant power", "Motion basics"]
  },
  {
    id: "english",
    title: "English Spark Notes",
    tags: ["grammar", "stories", "words"],
    items: ["Parts of speech", "Story arc map", "Opposites list"]
  }
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
    <div className="courses-root">
      <div className="courses-orbit orbit-1" />
      <div className="courses-orbit orbit-2" />
      <div className="courses-orbit orbit-3" />

      <header className="courses-hero">
        <div className="hero-badge">
          <FaRocket /> Study Arcade
        </div>
        <h1 className="hero-title">Courses Playground</h1>
        <p className="hero-sub">
          Pick a subject, press play, and collect notes along the way. Everything you
          need for video lessons and bite-sized study packs lives here.
        </p>
        <div className="hero-actions">
          <a className="hero-btn primary" href="#videos">
            <FaPlay /> Browse Video Lessons
          </a>
          <a className="hero-btn secondary" href="#notes">
            <FaStickyNote /> Open Notes Packs
          </a>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">Subjects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {subjects.reduce((total, subject) => total + (data[subject]?.length || 0), 0)}
            </div>
            <div className="stat-label">Video Lessons</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{notesPacks.length}</div>
            <div className="stat-label">Notes Packs</div>
          </div>
        </div>
      </header>

      <section id="videos" className="courses-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              <FaBookOpen /> Video Arcade
            </h2>
            <p className="section-sub">
              Select a subject to see all the video lectures inside.
            </p>
          </div>
          <label className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search subjects"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="courses-grid">
          {filteredSubjects.map((subject) => {
            const meta = subjectMeta[subject] || { label: subject, tone: "mint" };
            const lessons = data[subject] || [];
            const thumbId = getYouTubeId(lessons[0]?.embed);
            const progressInfo = progress[subject];

            return (
              <div key={subject} className={`course-card tone-${meta.tone}`}>
                <div className="course-top">
                  <div>
                    <div className="course-title">{meta.label}</div>
                    <div className="course-meta">{lessons.length} lessons</div>
                  </div>
                  <div className="course-progress">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressInfo?.percentage || 0}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {progressInfo?.percentage || 0}% complete
                    </span>
                  </div>
                </div>

                <div className="course-preview">
                  {thumbId ? (
                    <img
                      src={`https://img.youtube.com/vi/${thumbId}/hqdefault.jpg`}
                      alt={`${meta.label} preview`}
                    />
                  ) : (
                    <div className="course-fallback">Preview coming soon</div>
                  )}
                </div>

                <div className="course-actions">
                  <Link className="course-btn primary" to={`/videos/subject/${subject}`}>
                    <FaPlay /> Videos
                  </Link>
                  <Link className="course-btn secondary" to="/notes">
                    <FaStickyNote /> Notes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="empty-state">
            No subjects found. Try another keyword.
          </div>
        )}
      </section>

      <section id="notes" className="courses-section notes-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              <FaStickyNote /> Notes Studio
            </h2>
            <p className="section-sub">
              Short, colorful notes you can review after every lesson.
            </p>
          </div>
          <Link className="hero-btn tertiary" to="/notes">
            Open full notes
          </Link>
        </div>

        <div className="notes-grid">
          {notesPacks.map((pack) => (
            <div key={pack.id} className="notes-card">
              <div className="notes-card-header">
                <div className="notes-title">{pack.title}</div>
                <div className="notes-tags">
                  {pack.tags.map((tag) => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </div>
              </div>
              <ul className="notes-list">
                {pack.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="notes-btn" to="/notes">
                Open notes
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="courses-section bonus-section">
        <div className="bonus-card">
          <div>
            <h3>Study Combo</h3>
            <p>Mix video time + notes time for the fastest progress.</p>
          </div>
          <div className="bonus-actions">
            <Link className="hero-btn primary" to="/videos">
              Watch videos
            </Link>
            <Link className="hero-btn secondary" to="/notes">
              Read notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Courses;
