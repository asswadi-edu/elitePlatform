/**
 * Returns the correct API base URL depending on the environment.
 * - In production (Vercel): uses REACT_APP_API_URL env variable (Render URL)
 * - On localhost: uses localhost:8000
 * - On LAN IP (development): uses the current hostname with port 8000
 */
export const getApiUrl = () => {
  const hostname = window.location.hostname;

  // Production: REACT_APP_API_URL is set in Vercel environment variables
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl;

  // Local development on localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // LAN / other devices on the same network
  return `http://${hostname}:8000`;
};
