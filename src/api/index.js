import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Add this for debugging
const logRequest = (config) => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
  return config;
};

const logResponse = (response) => {
  console.log(`API Response: ${response.status} ${response.config.url}`);
  return response;
};

const logError = (error) => {
  console.error("API Error:", {
    message: error.message,
    url: error.config?.url || "unknown",
    method: error.config?.method || "unknown",
    status: error.response?.status || "no response",
    data: error.response?.data || "no data",
  });
  return Promise.reject(error);
};

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor - sets the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    console.log(
      "Adding Auth header with token:",
      token.substring(0, 15) + "..."
    );
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      "Auth header set:",
      config.headers.Authorization.substring(0, 20) + "..."
    );
  } else {
    console.log(
      "No token found in localStorage, request will be unauthenticated"
    );
  }
  return logRequest(config);
}, logError);

// Add response interceptors
api.interceptors.response.use(logResponse, logError);

// Board API calls
export const boardAPI = {
  // Get all boards for the current user
  getBoards: () => api.get("/boards"),

  // Get a specific board by ID
  getBoard: (boardId) => api.get(`/boards/${boardId}`),

  // Join board via shared link
  joinBoard: (boardId) => api.post(`/boards/${boardId}/join`),

  // Create a new board
  createBoard: (data) => api.post("/boards", data),

  // Update a board
  updateBoard: (boardId, data) => api.put(`/boards/${boardId}`, data),

  // Delete a board
  deleteBoard: (boardId) => api.delete(`/boards/${boardId}`),
};

// List API calls
export const listAPI = {
  // Create a new list
  createList: (boardId, data) => api.post(`/boards/${boardId}/lists`, data),

  // Update a list
  updateList: (listId, data) => api.put(`/lists/${listId}`, data),

  // Delete a list
  deleteList: (listId) => api.delete(`/lists/${listId}`),

  // Reorder lists
  reorderLists: (boardId, data) =>
    api.put(`/boards/${boardId}/lists/reorder`, data),
};

// Card API calls
export const cardAPI = {
  // Create a new card
  createCard: (listId, data) => api.post(`/lists/${listId}/cards`, data),

  // Update a card
  updateCard: (cardId, data) => api.put(`/cards/${cardId}`, data),

  // Delete a card
  deleteCard: (cardId) => api.delete(`/cards/${cardId}`),

  // Move a card between lists
  moveCard: (cardId, data) => {
    console.log("API moveCard called with:", { cardId, data });
    return api.put(`/cards/${cardId}/move`, data);
  },
};

// Auth API calls
export const authAPI = {
  // Register a new user
  register: (data) => api.post("/auth/register", data),

  // Login a user
  login: (data) => api.post("/auth/login", data),

  // Get current user information
  getCurrentUser: () => api.get("/auth/me"),

  // Logout the current user
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },

  // Google OAuth login
  loginWithGoogle: () => {
    const redirectUrl = `${BASE_URL}/api/auth/google`;
    console.log("Redirecting to Google OAuth:", redirectUrl);
    window.location.href = redirectUrl;
  },
};

// Invitation API calls
export const inviteAPI = {
  // Send board invitation via email
  sendInvitation: (data) => api.post("/invite", data),

  // Get invitation details by token
  getInvitation: (token) => api.get(`/invite/${token}`),

  // Accept invitation
  acceptInvitation: (token) => api.post(`/invite/${token}/accept`),
};

export default api;
