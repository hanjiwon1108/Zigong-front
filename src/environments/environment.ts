export const environment = {
  production: false,
  apiBase: `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8000/api`,
};
