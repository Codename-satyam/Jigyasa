// Progress tracking utility for video completion
import { getCurrentUser } from './auth.js';

const PROGRESS_KEY = "qq_userProgress";

function getProgressData() {
  try {
    const user = getCurrentUser();
    if (!user) return {};
    
    const raw = localStorage.getItem(`${PROGRESS_KEY}_${user.id}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveProgressData(data) {
  try {
    const user = getCurrentUser();
    if (!user) return;
    
    localStorage.setItem(`${PROGRESS_KEY}_${user.id}`, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving progress:", e);
  }
}

export function trackVideoCompletion(subject, topicIndex, videoIndex) {
  const progress = getProgressData();
  
  if (!progress[subject]) {
    progress[subject] = {};
  }
  
  if (!progress[subject][topicIndex]) {
    progress[subject][topicIndex] = {
      completed: [],
      lastViewed: null,
      timestamp: Date.now()
    };
  }
  
  if (!progress[subject][topicIndex].completed.includes(videoIndex)) {
    progress[subject][topicIndex].completed.push(videoIndex);
  }
  
  progress[subject][topicIndex].lastViewed = videoIndex;
  progress[subject][topicIndex].lastViewedTime = new Date().toISOString();
  
  saveProgressData(progress);
}

export function getSubjectProgress(subject, totalTopics, topicsData) {
  const progress = getProgressData();
  const subjectData = progress[subject] || {};
  
  let totalVideos = 0;
  let completedVideos = 0;
  
  // Calculate total videos in subject and completed videos
  Object.keys(subjectData).forEach(topicIdx => {
    const topicData = topicsData[parseInt(topicIdx)];
    if (topicData && topicData.videos) {
      totalVideos += topicData.videos.length;
      completedVideos += subjectData[topicIdx].completed.length;
    }
  });
  
  const percentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  
  return {
    completed: completedVideos,
    total: totalVideos,
    percentage
  };
}

export function getTopicProgress(subject, topicIndex, totalVideos) {
  const progress = getProgressData();
  const topicData = progress[subject]?.[topicIndex];
  
  if (!topicData) {
    return {
      completed: 0,
      total: totalVideos,
      percentage: 0,
      lastViewed: null
    };
  }
  
  const completed = topicData.completed.length;
  const percentage = Math.round((completed / totalVideos) * 100);
  
  return {
    completed,
    total: totalVideos,
    percentage,
    lastViewed: topicData.lastViewed
  };
}

export function getLastViewedTopic(subject) {
  const progress = getProgressData();
  const subjectData = progress[subject] || {};
  
  let lastTopic = null;
  let lastTime = 0;
  
  Object.keys(subjectData).forEach(topicIdx => {
    const time = new Date(subjectData[topicIdx].lastViewedTime).getTime() || 0;
    if (time > lastTime) {
      lastTime = time;
      lastTopic = parseInt(topicIdx);
    }
  });
  
  return lastTopic;
}

export function isVideoCompleted(subject, topicIndex, videoIndex) {
  const progress = getProgressData();
  return progress[subject]?.[topicIndex]?.completed.includes(videoIndex) || false;
}

export function clearAllProgress() {
  try {
    const user = getCurrentUser();
    if (user) {
      localStorage.removeItem(`${PROGRESS_KEY}_${user.id}`);
    }
  } catch (e) {
    console.error("Error clearing progress:", e);
  }
}
