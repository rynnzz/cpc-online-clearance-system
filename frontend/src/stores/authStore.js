import { defineStore } from 'pinia';
import { login as loginService } from '../services/authServices'; 
import { decodeJwt } from 'jose';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userTokenId: null,  // Stores the user ID
    token: null,        // Stores the JWT token in memory
    userRole: [],      // Stores all roles of the user
    isFirstLogin: null, // Stores the firstLogin status
  }),

  getters: {
    userId(state) {
      return state.userTokenId;
    },
    firstLogin(state) {
      return state.isFirstLogin;
    },
  },

  actions: {
    // Handle user login and store token in memory
    async login(userData) {
      try {
        const response = await loginService(userData); // Login service returns the token and user info
        if (response && response.token) {
          // Store token in state
          this.token = response.token;

          // Decode the token to get user details
          const decoded = decodeJwt(response.token);

          // Store decoded values in the state
          this.userTokenId = decoded.id;
          this.userRole = decoded.userRoles || []; // Extract roles from the token
          this.isFirstLogin = decoded.isFirstLogin;

          // Persist token in localStorage
          localStorage.setItem('token', this.token);
          localStorage.setItem('isFirstLogin', this.isFirstLogin);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    
    // Logout action to reset everything
    async logout() {
      this.userTokenId = null;
      this.token = null;
      this.userRoles = [];
      this.isFirstLogin = null;
      localStorage.removeItem('token');
      localStorage.removeItem('isFirstLogin');
    },

    // Initialize authentication from localStorage on page refresh
    initializeAuth() {
      const token = localStorage.getItem('token');
      const isFirstLogin = localStorage.getItem('isFirstLogin');

      if (token) {
        try {
          const decoded = decodeJwt(token); // Decode JWT to retrieve user info
          this.token = token;
          this.userTokenId = decoded.id;
          this.userRole = decoded.userRoles || []; // Extract roles from the token
          this.isFirstLogin = isFirstLogin === 'true'; // Convert string to boolean
        } catch (error) {
          console.error('Failed to decode token:', error);
          this.logout(); // If decoding fails, log the user out
        }
      }
    },
  },
});
