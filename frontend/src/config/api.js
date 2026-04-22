const rawBase = process.env.REACT_APP_API_URL || "";

// Ensure we don't generate URLs like: https://host.com//api/...
const API_BASE = rawBase.replace(/\/+$/, "");

export default API_BASE;
