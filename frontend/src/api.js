/**
 * Utility to get the correct API URL dynamically.
 * This ensures that when accessing from localhost, it hits localhost.
 * When accessing from an IP (like mobile), it hits that IP.
 */
export const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // If we are on localhost, use localhost for API too
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Otherwise, use the ENV variable (which should be the current LAN IP)
  // or fallback to the current hostname if the ENV is missing.
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl;

  return `http://${hostname}:8000`;
};
