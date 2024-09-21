// src/stores/subjectStore.js
import { defineStore } from 'pinia';
import subjectService from '@/services/subjectService'; // Import the service

export const useSubjectStore = defineStore('subjectStore', {
  state: () => ({
    subjects: [],
    isLoading: false,
    error: null,
  }),
  
  actions: {
    async getAllSubjects() {
      this.isLoading = true;
      try {
        const response = await subjectService.getAllSubjects();
        this.subjects = response.data;
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        this.isLoading = false;
      }
    },
  }
});
