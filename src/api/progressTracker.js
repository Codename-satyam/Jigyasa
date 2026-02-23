// Progress tracking utility for video completion
import { getCurrentUser } from './auth.js';

const PROGRESS_KEY = "qq_userProgress";

function getProgressData() {
  try {
    const user = getCurrentUser();
    if (!user) return {};
    
    const raw = localStorage.getItem(`${PROGRESS_KEY}_${user.id}`);
    if (!raw) return {};
    
    try {
      return JSON.parse(raw);
    } catch (parseError) {
      console.error("Error parsing progress data:", parseError);
      return {};
    }
  } catch (e) {
    console.error("Error retrieving progress data:", e);
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
  if (!subject || topicIndex === null || topicIndex === undefined || videoIndex === null || videoIndex === undefined) {
    console.error("Invalid parameters: subject, topicIndex, and videoIndex are required");
    return;
  }
  
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
  
  if (!Array.isArray(progress[subject][topicIndex].completed)) {
    progress[subject][topicIndex].completed = [];
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

  const hasVideoGroups = Array.isArray(topicsData) && topicsData.some(item => item && item.videos);

  if (hasVideoGroups) {
    topicsData.forEach((topic, index) => {
      if (!topic || !topic.videos) return;
      totalVideos += topic.videos.length;
      const topicProgress = subjectData[index];
      completedVideos += topicProgress ? topicProgress.completed.length : 0;
    });
  } else {
    totalVideos = Array.isArray(topicsData) ? topicsData.length : 0;
    completedVideos = Object.keys(subjectData).reduce((count, topicIdx) => {
      const topicProgress = subjectData[topicIdx];
      if (topicProgress && Array.isArray(topicProgress.completed)) {
        return count + topicProgress.completed.length;
      }
      return count;
    }, 0);
  }
  
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
  
  const completed = Array.isArray(topicData.completed) ? topicData.completed.length : 0;
  const boundedCompleted = totalVideos > 0 ? Math.min(completed, totalVideos) : completed;
  const percentage = totalVideos > 0 ? Math.round((boundedCompleted / totalVideos) * 100) : 0;
  
  return {
    completed: boundedCompleted,
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
  const completed = progress[subject]?.[topicIndex]?.completed;
  return Array.isArray(completed) ? completed.includes(videoIndex) : false;
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
