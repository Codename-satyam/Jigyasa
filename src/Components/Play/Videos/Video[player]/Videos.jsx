import React, { useState, useEffect, useRef } from "react";
import "./Videos.css";
import { trackVideoCompletion } from "../../../../api/progressTracker.js";

function extractYouTubeId(item) {
  if (!item) return null;
  if (item.id) return item.id;
  if (item.videoId) return item.videoId;
  
  // Check embed link first
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
  const hasTrackedRef = useRef(false);

  // Track initial video when component mounts
  useEffect(() => {
    if (!hasTrackedRef.current && startIndex >= 0 && subject && topicIndex !== undefined) {
      hasTrackedRef.current = true;
      trackVideoCompletion(subject, topicIndex, startIndex);
      setWatchedVideos(new Set([startIndex]));
    }
  }, [subject, topicIndex, startIndex]);

  // Track video when current ID changes and scroll to it
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
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [currentId, ids, subject, topicIndex, startIndex]);

  function makeEmbedUrl(id) {
    return `https://www.youtube.com/embed/${id}?rel=0&showinfo=0`;
  }

  function goNext() {
    const idx = ids.indexOf(currentId);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % ids.length;
    setCurrentId(ids[nextIdx]);
  }

  function goPrev() {
    const idx = ids.indexOf(currentId);
    const prevIdx = idx === -1 ? 0 : (idx - 1 + ids.length) % ids.length;
    setCurrentId(ids[prevIdx]);
  }

  const current = list.find(item => extractYouTubeId(item) === currentId) || {};
  const currentIndex = ids.indexOf(currentId);

  return (
    <div className="yt-root">
      <div className="yt-grid">
        <div className="player-column">
          <div className="player-card">
            <div className="video-frame">
              <iframe
                src={makeEmbedUrl(currentId)}
                title="YouTube player"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            <div className="current-info">
              <div className="now-label">Now playing</div>
              <div className="now-title">{current.title || currentId}</div>
              <div className="video-counter">{currentIndex + 1} / {list.length}</div>
            </div>

            <div className="sidebar-list">
              <div className="sidebar-header">Other videos</div>
              <div className="sidebar-scroll">
                {list.map((item, idx) => {
                  const id = extractYouTubeId(item);
                  if (!id) return null;
                  const title = item.title || item.name || `Video ${idx + 1}`;
                  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                  const isWatched = watchedVideos.has(idx);
                  
                  return (
                    <div
                      key={id + idx}
                      data-video-id={id}
                      className={`list-thumb ${id === currentId ? "selected" : ""} ${isWatched ? "watched" : ""}`}
                      onClick={() => setCurrentId(id)}
                    >
                      <img className="thumb-img" src={thumb} alt={title} />
                      {isWatched && <div className="watched-indicator">✓</div>}
                      <div className="thumb-meta">
                        <div className="thumb-title">{title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sidebar-controls">
                <button className="pixel-btn" onClick={goPrev} aria-label="Previous video">Prev</button>
                <button className="pixel-btn" onClick={goNext} aria-label="Next video">Next</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
