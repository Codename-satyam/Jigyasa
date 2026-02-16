import React from 'react';
import { useParams } from 'react-router-dom';
import data from './data.js';
import YouTubeVideoGallery from './Video[player]/Videos.jsx';

function VideoPlayer() {
  const { subject, topicIndex } = useParams();
  
  // Get all videos for the subject
  const subjectVideos = data[subject] || [];
  
  // Convert embed links to format that Videos component expects
  const videos = subjectVideos.map((video) => ({
    title: video.title,
    embed: video.embed,
    url: video.embed // Use embed link as URL for consistency
  }));

  // Get the current topic index
  const currentIndex = parseInt(topicIndex, 10);
  
  // If invalid subject or index, show error
  if (!subjectVideos || subjectVideos.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Subject not found</h2>
      <p>Please select a valid subject</p>
    </div>;
  }

  if (currentIndex < 0 || currentIndex >= subjectVideos.length) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Video not found</h2>
      <p>Please select a valid video</p>
    </div>;
  }

  return (
    <div>
      <YouTubeVideoGallery 
        videos={videos} 
        startIndex={currentIndex}
        subject={subject}
        topicIndex={currentIndex}
      />
    </div>
  );
}

export default VideoPlayer;
