// Central place for backend/socket URLs.
// Trailing slashes are stripped defensively so a misconfigured env value like
// "https://host/" can never produce a double-slash URL ("https://host//user/...")
// which the backend returns 404 for.
const stripTrailingSlash = (url) => (url || "").replace(/\/+$/, "");

export const API_BASE =
  stripTrailingSlash(process.env.REACT_APP_BACKEND_URL) || "http://localhost:1042";

export const SOCKET_URL =
  stripTrailingSlash(process.env.REACT_APP_SOCKET_URL) || API_BASE;
