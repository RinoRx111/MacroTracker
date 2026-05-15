// Global application state management using localStorage and React Context

export const initializeAppState = () => {
  const defaultState = {
    user: null,
    darkMode: true,
    lastSync: null,
    todaysSummary: null,
  };
  
  const saved = localStorage.getItem('appState');
  return saved ? JSON.parse(saved) : defaultState;
};

export const saveAppState = (state) => {
  localStorage.setItem('appState', JSON.stringify(state));
};

export const getUser = () => {
  const state = localStorage.getItem('appState');
  return state ? JSON.parse(state).user : null;
};

export const setUser = (user) => {
  const state = localStorage.getItem('appState');
  const appState = state ? JSON.parse(state) : {};
  appState.user = user;
  localStorage.setItem('appState', JSON.stringify(appState));
};

export const getDarkMode = () => {
  const state = localStorage.getItem('appState');
  const isDark = state ? JSON.parse(state).darkMode : true;
  return isDark;
};

export const setDarkMode = (isDark) => {
  const state = localStorage.getItem('appState');
  const appState = state ? JSON.parse(state) : {};
  appState.darkMode = isDark;
  localStorage.setItem('appState', JSON.stringify(appState));
};
