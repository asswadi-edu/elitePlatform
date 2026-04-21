/**
 * Returns the correct API base URL depending on the environment.
 * - Production (Vercel): uses REACT_APP_API_URL environment variable (Render URL)
 * - Localhost: uses localhost:8000
 * - LAN / other devices: uses the current hostname with port 8000
 */
export const getApiUrl = () => {
  // Production: REACT_APP_API_URL is set in Vercel environment variables
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl;

  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // LAN / other devices on the same network
  return `http://${hostname}:8000`;
};

/**
 * Returns the Python API base URL.
 */
export const getPythonApiUrl = () => {
  const envUrl = process.env.REACT_APP_PYTHON_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl;

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8001';
  }
  return `http://${hostname}:8001`;
};
