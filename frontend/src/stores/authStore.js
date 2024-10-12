import { defineStore } from 'pinia';
import { login as loginService } from '../services/authServices'; 
import { decodeJwt } from 'jose';


export const useAuthStore = defineStore('auth', {
  state: () => ({
    userTokenId: null,   // Stores the user ID
    token: null,    // Stores the JWT token in memory
    isFirstLogin: false
  }),

  getters: {
    // Getter to decode and access the role from the token
    userRole(state) {
      if (state.token) {
        const decodedToken = decodeJwt(state.token);
        return decodedToken.role;
      }
      return null;
    },
    userId(state) {
      if (state.token) {
        const decodedToken = decodeJwt(state.token);
        return decodedToken.id;
    }
    return null;
  },
},

  actions: {
    async login(userData) {
      try {
        const response = await loginService(userData);
        if (response && response.token) {
          this.token = response.token;
          this.isFirstLogin = response.data.isFirstLogin || false;
          localStorage.setItem('token', this.token);
          
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Login failed', error);
        throw error;
      }
    },
    
    async logout() {
      this.userTokenId = null;
      this.token = null;
      localStorage.removeItem('token');
    },

    initializeAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeJwt(token);
          this.token = token;
          this.user = decoded;
        } catch (error) {
          console.error('Failed to decode token:', error);
          this.logout();
        }
      }
    },
  },
});
