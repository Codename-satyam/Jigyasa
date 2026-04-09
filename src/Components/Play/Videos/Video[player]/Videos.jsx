import React, { useState, useEffect, useRef } from "react";
import { FaPlayCircle, FaCheckCircle, FaStepBackward, FaStepForward, FaListUl, FaSpinner } from "react-icons/fa";
import "./Videos.css";
import { trackVideoCompletion } from "../../../../api/progressTracker.js";

function extractYouTubeId(item) {
  if (!item) return null;
  if (item.id) return item.id;
  if (item.videoId) return item.videoId;
  
  if (item.embed) {
    const embedUrl = item.embed;
    const embedMatch = embedUrl.match(/embed\/([\w-]{11})/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];
  }
  
  if (item.url) {
    const url = item.url;
    const patterns = [
      /(?:v=)([\w-]{11})/,
      /youtu\.be\/([\w-]{11})/,
      /embed\/([\w-]{11})/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
  }
  return null;
}

export default function YouTubeVideoGallery({ videos, startIndex = 0, subject, topicIndex }) {
  const list = Array.isArray(videos) && videos.length ? videos : [];
  const ids = list.map(extractYouTubeId);
  const startId = ids[startIndex] || ids[0] || "uwzViw-T0-A";
  
  const [currentId, setCurrentId] = useState(startId);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasTrackedRef = useRef(false);

  // Track initial video
  useEffect(() => {
    if (!hasTrackedRef.current && startIndex >= 0 && subject && topicIndex !== undefined) {
      hasTrackedRef.current = true;
      trackVideoCompletion(subject, topicIndex, startIndex);
      setWatchedVideos(new Set([startIndex]));
    }
  }, [subject, topicIndex, startIndex]);

  // Smooth Transition Handler
  const handleVideoChange = (newId) => {
    if (newId === currentId) return;
    
    // 1. Start blur/fade transition
    setIsTransitioning(true);
    
    // 2. Change video ID halfway through the animation
    setTimeout(() => {
      setCurrentId(newId);
      
      // 3. Remove blur/fade after iframe has had a moment to load
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600); 
    }, 400);
  };

  // Track video when current ID changes
  useEffect(() => {
    const currentIndex = ids.indexOf(currentId);
    if (currentIndex !== -1 && subject && topicIndex !== undefined && currentIndex !== startIndex) {
      trackVideoCompletion(subject, topicIndex, currentIndex);
      setWatchedVideos(prev => {
        const newSet = new Set(prev);
        newSet.add(currentIndex);
        return newSet;
      });
    }
    
    const el = document.querySelector(`[data-video-id="${currentId}"]`);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentId, ids, subject, topicIndex, startIndex]);

  function makeEmbedUrl(id) {
    return `https://www.youtube.com/embed/${id}?rel=0&showinfo=0&autoplay=1`;
  }

  function goNext() {
    const idx = ids.indexOf(currentId);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % ids.length;
    handleVideoChange(ids[nextIdx]);
  }

  function goPrev() {
    const idx = ids.indexOf(currentId);
    const prevIdx = idx === -1 ? 0 : (idx - 1 + ids.length) % ids.length;
    handleVideoChange(ids[prevIdx]);
  }

  const current = list.find(item => extractYouTubeId(item) === currentId) || {};
  const currentIndex = ids.indexOf(currentId);

  return (
    <div className="neo-cinema-root">
      {/* Animated Background Orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      <div className="cinema-container">
        
        {/* LEFT: MAIN PLAYER AREA */}
        <div className="cinema-main fade-in-up">
          <div className="video-responsive-wrapper">
            {/* Transition Overlay */}
            <div className={`video-transition-overlay ${isTransitioning ? 'active' : ''}`}>
               <FaSpinner className="loading-spinner" />
               <span>Calibrating Signal...</span>
            </div>

            <iframe
              src={makeEmbedUrl(currentId)}
              title="YouTube player"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          
          <div className="cinema-controls-bar glass-panel">
            <div className="now-playing-info">
              <span className="module-badge pulse-text">MODULE {currentIndex + 1} OF {list.length}</span>
              <h1 className="now-playing-title">{current.title || current.name || "Video Lesson"}</h1>
            </div>
            
            <div className="nav-buttons">
              <button className="nav-btn" onClick={goPrev} disabled={currentIndex === 0 || isTransitioning}>
                <FaStepBackward /> Prev
              </button>
              <button className="nav-btn primary" onClick={goNext} disabled={currentIndex === list.length - 1 || isTransitioning}>
                Next <FaStepForward />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: PLAYLIST SIDEBAR */}
        <div className="cinema-sidebar glass-panel slide-in-right">
          <div className="sidebar-header">
            <h3><FaListUl /> Mission Log</h3>
            <span className="completion-text">
              {watchedVideos.size} / {list.length} Clear
            </span>
          </div>
          
          <div className="sidebar-playlist">
            {list.map((item, idx) => {
              const id = extractYouTubeId(item);
              if (!id) return null;
              
              const title = item.title || item.name || `Video Lesson ${idx + 1}`;
              const thumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
              const isWatched = watchedVideos.has(idx);
              const isPlaying = id === currentId;
              
              return (
                <div
                  key={id + idx}
                  data-video-id={id}
                  className={`playlist-item ${isPlaying ? "is-playing" : ""} ${isWatched ? "is-watched" : ""}`}
                  onClick={() => handleVideoChange(id)}
                  style={{ animationDelay: `${idx * 0.1}s` }} /* Cascading stagger effect */
                >
                  <div className="item-thumbnail">
                    <img src={thumb} alt={title} />
                    {isPlaying && (
                      <div className="playing-overlay">
                        <div className="eq-bar eq-1"></div>
                        <div className="eq-bar eq-2"></div>
                        <div className="eq-bar eq-3"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <div className="item-index">Transmission {idx + 1}</div>
                    <h4 className="item-title">{title}</h4>
                    {isWatched && <span className="watched-badge"><FaCheckCircle /> Sync Complete</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}