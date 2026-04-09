// API Client - Centralized configuration for backend communication
const defaultApiBaseUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : 'http://localhost:4000';

const API_BASE_URL = process.env.REACT_APP_API_URL || defaultApiBaseUrl;

export const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token');
  
  console.log(`🌐 [apiCall] ${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    console.log(`📡 [apiCall] ${response.status} ${response.statusText}`);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // If not JSON, it's likely an error page (HTML)
      const text = await response.text();
      console.error('❌ [apiCall] Non-JSON response:', text.substring(0, 200));
      result = { error: `Server returned ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error('❌ [apiCall] Request failed');
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🚫 Network error - Cannot reach server on:', API_BASE_URL);
    }
    
    throw error;
  }
};

export default API_BASE_URL;
