import axios from "axios";

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the auth token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Board API calls
export const boardAPI = {
  // Get all boards for the current user
  getBoards: () => api.get("/boards"),

  // Get a specific board by ID
  getBoard: (boardId) => api.get(`/boards/${boardId}`),

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
  moveCard: (cardId, data) => api.put(`/cards/${cardId}/move`, data),
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
};

export default api;
