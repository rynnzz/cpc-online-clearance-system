// src/stores/dashboardStore.js
import { defineStore } from 'pinia';
import dashboardService from '@/services/dashboardServices';

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    userCounts: { admin: 0, teacher: 0, student: 0, subjects: 0 },
    recentRegistrations: [],
    topPendingSections: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchDashboardStats() {
      this.isLoading = true;
      this.error = null;
      try {
        // Fetch all stats in a single request
        const response = await dashboardService.fetchDashboardStats();

        // Destructure and assign data to relevant state properties
        const { 
          userCounts, 
          recentRegistrations,  
        } = response.data;

        // Assign data to the store's state
        this.userCounts = userCounts;
        this.recentRegistrations = recentRegistrations;
      } catch (error) {
        this.error = 'Failed to load dashboard stats';
        console.error("Error fetching dashboard stats:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async initializeDashboard() {
      await this.fetchDashboardStats();
    },
  },
});
