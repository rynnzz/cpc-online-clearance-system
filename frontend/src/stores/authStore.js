import { defineStore } from 'pinia';
import { login as loginService, fetchUserInfo } from '../services/authServices'; // Update the path as needed

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userRole: null,
    token: null,
  }),
  actions: {
    async login(userData) {
      try {
        const response = await loginService(userData);
        if (response && response.token) {
          this.token = response.token;

          // Fetch user role from the server using the token
          const userInfo = await fetchUserInfo(this.token);
          this.userRole = userInfo.role;

          // Store in localStorage
          localStorage.setItem('token', this.token);
          localStorage.setItem('userRole', this.userRole);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Login failed', error);
        throw error; // Rethrow error to handle it in the component
      }
    },
    
    async logout() {
      this.userRole = null;
      this.token = null;
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
    },

    async initializeStore() {
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        try {
          // Fetch user info to validate role
          const userInfo = await fetchUserInfo(token);
          this.userRole = userInfo.role;
        } catch (error) {
          console.error('Failed to fetch user info during initialization', error);
          this.logout(); // Optionally handle error by logging out
        }
      } else if (role) {
        this.userRole = role;
      }
    },
  },
});
