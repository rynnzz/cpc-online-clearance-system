// src/stores/subjectStore.js
import { defineStore } from 'pinia';
import subjectService from '@/services/subjectService';

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
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },

    async addSubject(newSubject) {
      try {
        const response = await subjectService.addSubject(newSubject);
        console.log(response);
        this.subjects.push(response.data); // Add the new subject to the list
      } catch (error) {
        console.error("Failed to add subject:", error);
        this.error = error;
      }
    },

    async bulkAddSubjects(formData) {
      try {
        await subjectService.bulkAddSubjects(formData); // Call service to upload and process file
        await this.getAllSubjects(); // Refresh the students list after successful bulk add
        console.log("Subjects added successfully through bulk add.");
      } catch (error) {
        console.error("Failed to bulk add Subjects:", error);
      }
    },

    async updateSubject(subjectId, updatedData) {
      try {
        await subjectService.updateSubject(subjectId, updatedData);
        // Find and update the subject in the local state
        const index = this.subjects.findIndex(subject => subject.id === subjectId);
        if (index !== -1) {
          this.subjects[index] = { ...this.subjects[index], ...updatedData };
        }
      } catch (error) {
        console.error("Failed to update subject:", error);
        this.error = error;
      }
    },

    async deleteSubject(subjectId) {
      try {
        await subjectService.deleteSubject(subjectId);
        // Remove the subject from the local state
        this.subjects = this.subjects.filter(subject => subject.id !== subjectId);
      } catch (error) {
        console.error("Failed to delete subject:", error);
        this.error = error;
      }
    },
  },
});
